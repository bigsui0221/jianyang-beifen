import type { Map as OpenMap } from 'ol'
import { Feature } from 'ol'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { getCenter } from 'ol/extent'
import { XYZ, Vector as VectorSource } from 'ol/source'
import * as olProj from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import { Polygon } from 'ol/geom'
import { Style, Fill, Stroke } from 'ol/style'

type PolygonMorphOp = {
  startIndex?: number
  endIndex?: number
  loop?: boolean
  duration?: number
  interval?: number
  trailOpacity?: number
  keepTrail?: true
  maxTrails?: number
  color?: string
  strokeColor?: string
  strokeWidth?: number
  easing?: Function
}

/**
 * 通过id查找图层
 * @param {OpenMap} openMap
 * @param {String} layerId
 * @returns
 */
export function getLayerById(openMap: OpenMap, layerId: string) {
  return openMap.getAllLayers().find((layer) => layer.get('layerId') === layerId)
}

/**
 * 通过id 移除图层
 * @param {OpenMap} openMap
 * @param {String} layerId
 * @returns
 */
export function removeLayerById(openMap: OpenMap, layerId: string) {
  const layer = getLayerById(openMap, layerId)
  if (layer) {
    openMap.removeLayer(layer)
  }
}

/**
 * 创建高德地图图层
 * @param {String} type - 图层类型，支持单个类型或逗号分隔的多个类型("lw,sl,yx")
 * @returns {Array<TileLayer>} - 图层数组
 */
export const gaodeLayer = (type: string = 'sl'): Array<TileLayer> => {
  // 定义高德图层配置
  const sourceConfigs = {
    lw: {
      name: '高德路网',
      url: 'https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}'
    },
    sl: {
      name: '高德矢量',
      url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
    },
    yx: {
      name: '高德影像',
      url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
    }
  }

  // 验证输入类型
  const validateType = (t: string) => sourceConfigs.hasOwnProperty(t)

  // 创建单个图层
  const createLayer = (key: string) => {
    if (!validateType(key)) {
      console.warn(
        `无效的高德图层类型: ${key}，支持的类型有: ${Object.keys(sourceConfigs).join(', ')}`
      )
      return null
    }

    const config = sourceConfigs[key]
    return new TileLayer({
      properties: {
        title: config.name,
        attributions: '© <a href="https://www.gaode.com/">高德地图</a>'
      },
      source: new XYZ({
        url: config.url,
        wrapX: true,
        crossOrigin: 'anonymous'
      }),
      opacity: 1
    })
  }

  // 处理输入并返回图层数组
  const types = type.split(',').map((t) => t.trim())
  const layers = types.map(createLayer).filter((layer) => layer !== null)

  if (layers.length === 0) {
    console.error(`未创建任何高德图层，无效的类型参数: ${type}`)
    // 返回默认图层
    return [createLayer('sl')] as Array<TileLayer>
  }

  return layers
}

/**
 * 移动到图层中心点
 * @param {OpenMap} openMap
 * @param {Array} center
 * @param {Number} zoom
 * @param {Number} duration 动画时间 s
 */
export const moveToTheLayerCenterPoint = (
  openMap: OpenMap,
  center: Coordinate,
  zoom: number,
  duration: number = 0
) => {
  openMap.getView().animate({
    //将地理坐标转为投影坐标
    center: olProj.transform(center, 'EPSG:4326', 'EPSG:4326'),
    duration: 1000 * duration,
    zoom: zoom
  })
}

/**
 * 计算中心点和缩放，自适应
 * @param {*} openMap
 * @param {Object} geometry
 * @param {Boolean | Object} fit 视图适应
 * @param {Function} callback
 */
export const featureAdaptive = (
  openMap: OpenMap,
  geometry: { getExtent: () => any },
  fit: { size: any; padding: any },
  callback: () => any
) => {
  // 获取几何对象的范围
  const extent = geometry.getExtent()
  // 获取几何对象的中心点
  const center = getCenter(extent)

  // 定义动画
  const animation = {
    center,
    zoom: openMap.getView().getZoom(),
    duration: 500
  }

  // 位移至中心点
  openMap.getView().animate(animation)

  if (fit) {
    setTimeout(() => {
      // 设置地图视图以适应线段
      openMap.getView().fit(extent, {
        size: fit.size ?? [window.innerWidth, window.innerHeight],
        padding: fit.padding ?? [200, 200, 200, 200],
        duration: 1000,
        callback
      })
    }, 500)
  } else {
    callback ? callback() : undefined
  }
}

/**
 * 多边形变形动画函数 - 将一个多边形平滑地变形为另一个多边形
 * 支持不同顶点数量的多边形，自动处理顶点数量归一化
 *
 * @param {Map} openMap - OpenLayers地图实例
 * @param {geom.Polygon} fromPolygon - 起始多边形
 * @param {geom.Polygon} toPolygon - 目标多边形
 * @param {Object} options - 动画选项
 * @param {number} [options.duration=2000] - 动画持续时间（毫秒）
 * @param {string} [options.color='rgba(0, 120, 215, 0.5)'] - 填充颜色
 * @param {string} [options.strokeColor='rgba(0, 120, 215, 1)'] - 边框颜色
 * @param {number} [options.strokeWidth=2] - 边框宽度
 * @param {function} [options.easing=(t) => t*(2-t)] - 缓动函数，控制动画速度曲线
 * @returns {Object} - 包含stop方法的控制对象，用于停止动画
 */
export const polygonMorph = (
  openMap: OpenMap,
  fromPolygon: Polygon,
  toPolygon: Polygon,
  options: PolygonMorphOp = {}
): object => {
  // 配置默认选项，使用对象展开语法合并用户选项
  const defaultOptions = {
    duration: 2000,
    color: 'rgba(0, 120, 215, 0.5)',
    strokeColor: 'rgba(0, 120, 215, 1)',
    strokeWidth: 2,
    easing: (t: number) => t * (2 - t) // 缓入缓出二次函数，使动画更自然
  }
  const opt = { ...defaultOptions, ...options }

  // 创建多边形样式对象，用于渲染变形过程中的多边形
  const style = new Style({
    fill: new Fill({ color: opt.color }),
    stroke: new Stroke({
      color: opt.strokeColor,
      width: opt.strokeWidth
    })
  })

  // 创建变形多边形要素，初始几何形状为起始多边形的克隆
  const morphFeature = new Feature({
    geometry: fromPolygon.clone()
  })
  morphFeature.setStyle(style)

  // 创建矢量图层并添加到地图，用于显示变形中的多边形
  const vectorSource = new VectorSource({
    features: [morphFeature]
  })
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 1000 // 设置较高的z-index确保多边形显示在最上层
  })
  openMap.addLayer(vectorLayer)

  // 获取多边形坐标数组（假设为简单多边形，不含内环）
  const fromCoords = fromPolygon.getCoordinates()[0]
  const toCoords = toPolygon.getCoordinates()[0]

  // 计算最优顶点数量 - 取两个多边形顶点数的最大值
  // 这样可以保留两个多边形的细节特征
  const optimalVertexCount = Math.max(fromCoords.length, toCoords.length)

  // 对两个多边形进行顶点归一化处理
  // 确保它们具有相同数量的顶点，以便进行平滑变形
  const normalizedFromCoords = resamplePolygon(fromCoords, optimalVertexCount)
  const normalizedToCoords = resamplePolygon(toCoords, optimalVertexCount)

  // 动画控制变量
  let animationFrameId: number = Number(null) // requestAnimationFrame返回的ID
  let startTime: number = Number(null) // 动画开始时间
  let isAnimating = false // 动画状态标志

  /**
   * 多边形重新采样函数 - 将多边形的顶点重新分布，使其具有指定数量的顶点
   * 使用基于周长的均匀采样方法，确保顶点在多边形边界上均匀分布
   *
   * @param {Array<Array<number>>} coords - 多边形坐标数组
   * @param {number} targetCount - 目标顶点数量
   * @returns {Array<Array<number>>} - 重新采样后的坐标数组
   */
  function resamplePolygon(coords: number[][], targetCount: number): Array<Array<number>> {
    const result: any = []
    const length = coords.length - 1 // 最后一个点与第一个点相同，不计入有效顶点数

    // 计算多边形周长
    let perimeter = 0
    for (let i = 0; i < length; i++) {
      const dx = coords[i + 1][0] - coords[i][0]
      const dy = coords[i + 1][1] - coords[i][1]
      perimeter += Math.sqrt(dx * dx + dy * dy)
    }

    // 初始化采样参数
    let currentPosition = 0 // 当前采样位置（沿周长）
    let currentSegment = 0 // 当前所在线段索引
    let accumulatedLength = 0 // 已累计的线段长度

    // 添加第一个点（与原始多边形的第一个点相同）
    result.push([...coords[0]])

    // 均匀采样新顶点
    for (let i = 1; i < targetCount - 1; i++) {
      // 计算当前应采样的位置（按周长比例）
      currentPosition = (i * perimeter) / (targetCount - 1)

      // 找到当前位置对应的线段
      while (
        currentSegment < length &&
        accumulatedLength + getSegmentLength(currentSegment) < currentPosition
      ) {
        accumulatedLength += getSegmentLength(currentSegment)
        currentSegment++
      }

      // 计算在线段上的相对位置（0-1之间）
      const segmentLength = getSegmentLength(currentSegment)
      const t = (currentPosition - accumulatedLength) / segmentLength

      // 获取线段的两个端点
      const p1 = coords[currentSegment]
      const p2 = coords[currentSegment + 1]

      // 线性插值计算新顶点位置
      const x = p1[0] + t * (p2[0] - p1[0])
      const y = p1[1] + t * (p2[1] - p1[1])

      // 添加新顶点到结果数组
      result.push([x, y])
    }

    // 添加最后一个点（与第一个点相同，保持多边形闭合）
    result.push([...coords[0]])

    return result

    // 辅助函数：计算线段长度
    function getSegmentLength(index: number) {
      const p1 = coords[index]
      const p2 = coords[index + 1]
      const dx = p2[0] - p1[0]
      const dy = p2[1] - p1[1]
      return Math.sqrt(dx * dx + dy * dy)
    }
  }

  /**
   * 动画帧函数 - 每帧更新多边形的形状
   *
   * @param {number} timestamp - 当前时间戳
   */
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp // 记录动画开始时间

    // 计算动画进度（0-1之间）
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / opt.duration, 1)

    // 应用缓动函数，调整动画速度曲线
    const easedProgress = opt.easing(progress)

    // 计算当前状态的坐标 - 对每个顶点进行线性插值
    const currentCoords = normalizedFromCoords.map((fromPoint, i) => {
      const toPoint = normalizedToCoords[i]
      return [
        fromPoint[0] + (toPoint[0] - fromPoint[0]) * easedProgress,
        fromPoint[1] + (toPoint[1] - fromPoint[1]) * easedProgress
      ]
    })

    // 更新多边形几何形状
    const geometry = morphFeature.getGeometry()
    if (geometry instanceof Polygon) {
      geometry.setCoordinates([currentCoords])
    }

    // 继续下一帧动画或结束动画
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      isAnimating = false // 标记动画结束
    }
  }

  // 开始动画函数
  const startAnimation = () => {
    if (isAnimating) return // 防止重复启动
    isAnimating = true
    startTime = Number(null)
    animationFrameId = requestAnimationFrame(animate)
  }

  // 停止动画并清理资源
  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId) // 取消待处理的动画帧
      animationFrameId = Number(null)
      isAnimating = false
    }
    openMap.removeLayer(vectorLayer) // 从地图中移除图层
  }

  // 启动动画
  startAnimation()

  // 返回控制对象，允许外部停止动画
  return {
    stop: stopAnimation
  }
}

/**
 * 多边形连续变换动画函数 - 支持保留变换过程轨迹
 * 实现多个多边形之间的平滑过渡，并可选择保留中间变换状态
 *
 * @param {OpenMap} openMap - 地图实例
 * @param {Polygon[]} polygons - 多边形数组
 * @param {PolygonMorphOp} [options={}] - 配置选项
 * @param {number} [options.startIndex=0] - 起始多边形索引
 * @param {number} [options.endIndex=-1] - 结束多边形索引(-1表示最后一个)
 * @param {boolean} [options.loop=false] - 是否循环播放
 * @param {number} [options.duration=2000] - 单次变换持续时间(ms)
 * @param {number} [options.interval=1000] - 变换间隔时间(ms)
 * @param {number} [options.trailOpacity=0.3] - 轨迹透明度
 * @param {boolean} [options.keepTrail=false] - 是否保留轨迹
 * @param {number} [options.maxTrails=10] - 最大保留轨迹数量
 * @param {string} [options.color='rgba(0,120,215,0.5)'] - 填充颜色
 * @param {string} [options.strokeColor='rgba(0,120,215,1)'] - 边框颜色
 * @param {number} [options.strokeWidth=2] - 边框宽度
 * @param {function} [options.easing=(t)=>t*(2-t)] - 缓动函数
 *
 * @returns {Object} 动画控制器，包含控制方法和状态查询
 */
export const multiPolygonMorph = (
  openMap: OpenMap,
  polygons: Polygon[],
  options: PolygonMorphOp = {}
) => {
  // 输入验证：确保至少有两个多边形用于变换
  if (polygons.length < 2) {
    throw new Error('至少需要提供2个多边形')
  }

  // 配置默认选项，合并用户传入的选项
  const defaultOptions = {
    startIndex: 0,
    endIndex: -1,
    loop: false,
    duration: 2000,
    interval: 1000,
    trailOpacity: 0.3,
    keepTrail: false,
    maxTrails: 10,
    color: 'rgba(0, 120, 215, 0.5)',
    strokeColor: 'rgba(0, 120, 215, 1)',
    strokeWidth: 2,
    easing: (t: number) => t * (2 - t) // 缓入缓出二次函数
  }
  const opt = { ...defaultOptions, ...options }

  // 计算实际结束索引，处理-1表示最后一个多边形的情况
  const endIndex = opt.endIndex === -1 ? polygons.length - 1 : opt.endIndex
  if (opt.startIndex >= polygons.length || endIndex >= polygons.length) {
    throw new Error('索引超出多边形数组范围')
  }

  // 动画状态管理
  let currentIndex = opt.startIndex
  let nextIndex = getNextIndex(currentIndex)
  let isAnimating = false
  let isPaused = false
  let animationFrameId: any = null
  let intervalTimeoutId: any = null
  let vectorLayer: any = null
  let trailLayers: any = [] // 存储轨迹图层
  const allTransformations: any = [] // 存储所有变换过程

  // 获取下一个多边形索引，支持循环模式
  function getNextIndex(index: number) {
    if (index >= endIndex) {
      return opt.loop ? opt.startIndex : null
    }
    return index + 1
  }

  // 初始化主图层，用于显示当前活动的多边形
  function initLayer() {
    // 创建矢量图层并添加到地图
    const vectorSource = new VectorSource()
    vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 1000 // 设置较高的z-index确保图层显示在顶层
    })
    openMap.addLayer(vectorLayer)
  }

  /**
   * 多边形顶点重采样函数
   * 将多边形的顶点重新分布，使其具有指定数量的顶点
   * 用于确保两个多边形的顶点数量一致，便于进行变形动画
   *
   * @param {number[][]} coords - 多边形坐标数组
   * @param {number} targetCount - 目标顶点数量
   * @returns {number[][]} 重采样后的坐标数组
   */
  function resamplePolygon(coords: number[][], targetCount: number): number[][] {
    const result: number[][] = []
    const length = coords.length - 1 // 最后一个点与第一个点相同，不计入有效顶点数
    let perimeter = 0

    // 计算多边形周长
    for (let i = 0; i < length; i++) {
      const dx = coords[i + 1][0] - coords[i][0]
      const dy = coords[i + 1][1] - coords[i][1]
      perimeter += Math.sqrt(dx * dx + dy * dy)
    }

    // 初始化采样参数
    let currentPosition = 0
    let currentSegment = 0
    let accumulatedLength = 0

    // 添加第一个顶点
    result.push([...coords[0]])

    // 均匀采样中间顶点
    for (let i = 1; i < targetCount - 1; i++) {
      currentPosition = (i * perimeter) / (targetCount - 1)

      // 找到当前位置对应的线段
      while (
        currentSegment < length &&
        accumulatedLength + getSegmentLength(currentSegment) < currentPosition
      ) {
        accumulatedLength += getSegmentLength(currentSegment)
        currentSegment++
      }

      // 计算在线段上的插值位置
      const segmentLength = getSegmentLength(currentSegment)
      const t = (currentPosition - accumulatedLength) / segmentLength
      const p1 = coords[currentSegment]
      const p2 = coords[currentSegment + 1]

      // 线性插值计算新顶点坐标
      const x = p1[0] + t * (p2[0] - p1[0])
      const y = p1[1] + t * (p2[1] - p1[1])

      result.push([x, y])
    }

    // 添加最后一个顶点（与第一个相同，形成闭合多边形）
    result.push([...coords[0]])

    return result

    // 辅助函数：计算线段长度
    function getSegmentLength(index) {
      const p1 = coords[index]
      const p2 = coords[index + 1]
      const dx = p2[0] - p1[0]
      const dy = p2[1] - p1[1]
      return Math.sqrt(dx * dx + dy * dy)
    }
  }

  /**
   * 记录变换过程中的中间状态
   * 用于保留动画轨迹或在需要时恢复特定状态
   *
   * @param {number} progress - 当前动画进度(0-1)
   * @param {number[][]} coords - 当前多边形坐标
   */
  function recordTransformation(progress: number, coords: number[][]) {
    if (!opt.keepTrail) return

    // 存储变换过程数据（深拷贝避免引用问题）
    allTransformations.push({
      progress,
      coords: JSON.parse(JSON.stringify(coords)),
      fromIndex: currentIndex,
      toIndex: nextIndex
    })

    // 限制最大记录数量，防止内存溢出
    if (allTransformations.length > 1000) {
      allTransformations.shift()
    }

    // 每10%的进度创建一个轨迹图层
    if (progress % 0.1 < 0.05) {
      const trailFeature = new Feature({
        geometry: new Polygon([coords])
      })

      // 设置轨迹样式，随进度变化透明度
      const opacity = opt.trailOpacity * (1 - progress)
      trailFeature.setStyle(
        new Style({
          fill: new Fill({
            color: `rgba(0, 120, 215, ${opacity})`
          }),
          stroke: new Stroke({
            color: `rgba(0, 120, 215, ${opacity * 1.5})`,
            width: opt.strokeWidth * 0.7
          })
        })
      )

      // 创建轨迹图层并添加到地图
      const trailSource = new VectorSource({
        features: [trailFeature]
      })
      const trailLayer = new VectorLayer({
        source: trailSource,
        zIndex: 999 - trailLayers.length // 新轨迹显示在最上层
      })

      openMap.addLayer(trailLayer)
      trailLayers.push(trailLayer)

      // 限制最大轨迹数量，移除最早的轨迹
      if (trailLayers.length > opt.maxTrails) {
        const layerToRemove = trailLayers.shift()
        if (layerToRemove) {
          openMap.removeLayer(layerToRemove)
        }
      }
    }
  }

  /**
   * 执行单个多边形变形动画
   * 从当前多边形平滑过渡到下一个多边形
   */
  function runMorphAnimation() {
    if (isAnimating || isPaused || nextIndex === null) {
      return
    }

    isAnimating = true
    const fromPolygon = polygons[currentIndex]
    const toPolygon = polygons[nextIndex]

    // 获取多边形坐标并进行顶点重采样
    const fromCoords = fromPolygon.getCoordinates()[0]
    const toCoords = toPolygon.getCoordinates()[0]
    const optimalVertexCount = Math.max(fromCoords.length, toCoords.length)

    const normalizedFromCoords = resamplePolygon(fromCoords, optimalVertexCount)
    const normalizedToCoords = resamplePolygon(toCoords, optimalVertexCount)

    // 创建变形中的多边形要素
    const morphFeature = new Feature({
      geometry: new Polygon([normalizedFromCoords])
    })

    // 设置要素样式
    const style = new Style({
      fill: new Fill({ color: opt.color }),
      stroke: new Stroke({
        color: opt.strokeColor,
        width: opt.strokeWidth
      })
    })
    morphFeature.setStyle(style)

    // 更新图层内容
    if (vectorLayer) {
      const source = vectorLayer.getSource()
      source.clear()
      source.addFeature(morphFeature)
    }

    // 动画循环函数
    let startTime: any = null
    const animate = (timestamp: number) => {
      if (isPaused) return

      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / opt.duration, 1)
      const easedProgress = opt.easing(progress)

      // 计算当前动画进度的多边形坐标
      const currentCoords = normalizedFromCoords.map((fromPoint, i) => {
        const toPoint = normalizedToCoords[i]
        return [
          fromPoint[0] + (toPoint[0] - fromPoint[0]) * easedProgress,
          fromPoint[1] + (toPoint[1] - fromPoint[1]) * easedProgress
        ]
      })

      // 更新多边形几何形状
      const geometry = morphFeature.getGeometry()
      if (geometry instanceof Polygon) {
        geometry.setCoordinates([currentCoords])
      }

      // 记录变换过程
      recordTransformation(progress, currentCoords)

      // 继续下一帧动画或完成动画
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        isAnimating = false
        currentIndex = nextIndex as number
        nextIndex = getNextIndex(currentIndex)
        scheduleNextTransformation()
      }
    }

    // 启动动画循环
    animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * 安排下一次多边形变换
   * 在当前动画完成后，等待指定间隔时间后启动下一次变换
   */
  function scheduleNextTransformation() {
    if (nextIndex === null || isPaused) {
      return
    }

    intervalTimeoutId = setTimeout(() => {
      runMorphAnimation()
    }, opt.interval)
  }

  /**
   * 清理资源
   * 停止所有动画和计时器，移除所有图层
   */
  function cleanup() {
    isAnimating = false
    isPaused = false

    // 取消动画帧和计时器
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    if (intervalTimeoutId) {
      clearTimeout(intervalTimeoutId)
      intervalTimeoutId = null
    }

    // 移除所有轨迹图层
    trailLayers.forEach((layer) => {
      openMap.removeLayer(layer)
    })
    trailLayers = []

    // 移除主图层
    if (vectorLayer) {
      openMap.removeLayer(vectorLayer)
      vectorLayer = null
    }
  }

  // 启动连续变换动画
  function start() {
    if (isAnimating) return
    cleanup()
    initLayer()
    runMorphAnimation()
  }

  // 停止动画并清理资源
  function stop() {
    cleanup()
  }

  // 暂停当前动画
  function pause() {
    isPaused = true

    // 取消待处理的动画帧和计时器
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    if (intervalTimeoutId) {
      clearTimeout(intervalTimeoutId)
      intervalTimeoutId = null
    }
  }

  // 恢复暂停的动画
  function resume() {
    if (isPaused && !isAnimating && nextIndex !== null) {
      isPaused = false
      runMorphAnimation()
    }
  }

  /**
   * 显示指定进度的变换状态
   * 可以将动画定位到任意多边形之间的任意进度
   *
   * @param {number} fromIndex - 起始多边形索引
   * @param {number} toIndex - 目标多边形索引
   * @param {number} progress - 进度值(0-1)
   */
  function showTransformationAtProgress(fromIndex: number, toIndex: number, progress: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= polygons.length ||
      toIndex < 0 ||
      toIndex >= polygons.length
    ) {
      return
    }

    pause()

    // 获取并处理多边形坐标
    const fromPolygon = polygons[fromIndex]
    const toPolygon = polygons[toIndex]

    const fromCoords = fromPolygon.getCoordinates()[0]
    const toCoords = toPolygon.getCoordinates()[0]
    const optimalVertexCount = Math.max(fromCoords.length, toCoords.length)

    const normalizedFromCoords = resamplePolygon(fromCoords, optimalVertexCount)
    const normalizedToCoords = resamplePolygon(toCoords, optimalVertexCount)

    // 计算指定进度的多边形坐标
    const currentCoords = normalizedFromCoords.map((fromPoint, i) => {
      const toPoint = normalizedToCoords[i]
      return [
        fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress,
        fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress
      ]
    })

    // 更新图层显示
    if (vectorLayer) {
      const source = vectorLayer.getSource()
      source.clear()

      const feature = new Feature({
        geometry: new Polygon([currentCoords])
      })

      feature.setStyle(
        new Style({
          fill: new Fill({ color: opt.color }),
          stroke: new Stroke({
            color: opt.strokeColor,
            width: opt.strokeWidth
          })
        })
      )

      source.addFeature(feature)
    }

    // 更新当前状态
    currentIndex = fromIndex
    nextIndex = toIndex
  }

  // 获取所有记录的变换过程
  function getTransformations() {
    return [...allTransformations]
  }

  // 启动动画
  start()

  // 返回动画控制器
  return {
    start,
    stop,
    pause,
    resume,
    showTransformationAtProgress,
    getTransformations,
    // 获取当前动画状态
    getState() {
      return {
        isAnimating,
        isPaused,
        currentIndex,
        nextIndex,
        totalPolygons: polygons.length,
        transformationCount: allTransformations.length
      }
    }
  }
}
