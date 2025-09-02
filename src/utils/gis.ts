import { GISApi } from '@/api/Floodctrl/gis/index'
export const baseUrl = import.meta.env.VITE_GIS_URL + `/cimgateway/gateway/api/1`
export const getGisToken = (isRefresh = false) => {
  const gisToken = sessionStorage.getItem('gisToken')
  if (!gisToken || isRefresh) {
    const res = GISApi.getGISToken().then((res: any) => {
      sessionStorage.setItem('gisToken', res)
    })
    return res
  } else {
    return gisToken
  }
}

export let mapView: any = null

export let esriModules: any = null
const loadEsriModules = async () => {
  if (esriModules) return esriModules
  // 等待ArcGIS API加载完成
  await new Promise((resolve, reject) => {
    if ((window as any).require) {
      ;(window as any).require(
        [
          'esri/Map',
          'esri/views/MapView',
          'esri/layers/TileLayer',
          'esri/layers/MapImageLayer',
          'esri/layers/GraphicsLayer',
          'esri/geometry/Polygon',
          'esri/geometry/Polyline',
          'esri/Graphic',
          'esri/symbols/SimpleFillSymbol',
          'esri/symbols/SimpleLineSymbol',
          'esri/Color',
          'esri/geometry/Point',
          'esri/symbols/PictureMarkerSymbol',
          'esri/views/draw/Draw'
        ],
        (
          Map: any,
          MapView: any,
          TileLayer: any,
          MapImageLayer: any,
          GraphicsLayer: any,
          Polygon: any,
          Polyline: any,
          Graphic: any,
          SimpleFillSymbol: any,
          SimpleLineSymbol: any,
          Color: any,
          Point: any,
          PictureMarkerSymbol: any,
          Draw: any
        ) => {
          esriModules = {
            Map,
            MapView,
            TileLayer,
            MapImageLayer,
            GraphicsLayer,
            Polygon,
            Polyline,
            Graphic,
            SimpleFillSymbol,
            SimpleLineSymbol,
            Color,
            Point,
            PictureMarkerSymbol,
            Draw
          }
          resolve(esriModules)
        },
        (err: any) => {
          console.error('加载ArcGIS模块失败:', err)
          reject(err)
        }
      )
    } else {
      // 等待ArcGIS加载完成
      const checkInterval = setInterval(() => {
        if ((window as any).require) {
          clearInterval(checkInterval)
          loadEsriModules().then(resolve).catch(reject)
        }
      }, 100)
    }
  })
}

/**
 * 初始化gis地图
 */
export const initGisMap = (dom: HTMLElement | null = null): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    await loadEsriModules()
    // 创建地图实例   // 图层渲染顺序，baseLayers在layers下面，baseLayers、layers数组里面索引index小的图层在下面
    const map = new esriModules.Map({
      basemap: {
        baseLayers: [
          getTileLayer('d440e75a1ac24b059a594299c6299ad8'),
          getMapImageLayer('3d0bf2e783b88ac8c11f0bb06dea7fae')
        ] // 底图
      }
    })
    // 创建地图视图
    const view = new esriModules.MapView({
      container: dom ?? document.getElementById('mapContainer'),
      map: map,
      zoom: 12, // 默认显示级别
      center: [104.59929406851037, 30.396867373367527] // 默认显示中心点
    })
    view
      .when()
      .then(() => {
        console.log('视图加载完成')
        mapView = view
        watchMapChanges(view) // 监听地图变化
        resolve({ map, view })
      })
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  })
}

export const getTileLayer = (key) => {
  if (!esriModules) return null
  const tileLayer = new esriModules.TileLayer({
    // 底图一般使用切片图层，加载效率快
    title: '影像', // 图层名称
    url: `${baseUrl}/${key}`, // 图层服务地址
    customParameters: {
      cimToken: getGisToken() // cimToken
    }
  })
  return tileLayer
}

export const getMapImageLayer = (key) => {
  if (!esriModules) return null
  const tileLayer = new esriModules.MapImageLayer({
    title: '影像', // 图层名称
    url: `${baseUrl}/${key}`, // 图层服务地址
    customParameters: {
      cimToken: getGisToken() // cimToken
    }
  })
  return tileLayer
}

/**
 * 创建多边形图形
 * @param coordinates
 */
export const createPolygonGraphic = (coordinates: any = null, color: string = '#3A7DFF') => {
  if (!esriModules) return null
  if (!coordinates)
    coordinates = [
      [104.567121, 30.399821],
      [104.457101, 30.389841],
      [104.547101, 30.379841],
      [104.567121, 30.399821]
    ]
  // 创建多边形几何
  const polygon = new esriModules.Polygon({
    rings: coordinates, // 坐标数组直接作为环
    spatialReference: { wkid: 4326 }
  })

  // 创建填充符号
  const symbol = getSimpleFillSymbol(color)

  return new esriModules.Graphic({
    geometry: polygon,
    symbol: symbol
  })
}
export const getSimpleFillSymbol = (color: string = '#3A7DFF') => {
  if (!esriModules) return null
  return new esriModules.SimpleFillSymbol({
    color: new esriModules.Color(hexToRgba(color, 0.3)), // 半透明颜色
    outline: new esriModules.SimpleLineSymbol({
      color: new esriModules.Color(hexToRgba(color, 0.8)),
      width: 1
    })
  })
}
/**
 * 设置自定义点
 * @param refValue
 * @param position
 * @param extData
 */
export const createMarkerGraphic = (position: [number, number], icon: any, extData: any = {}) => {
  if (!esriModules) return null
  // 1. 处理位置 - ArcGIS的Point构造函数为(longitude, latitude)
  const point = new esriModules.Point({
    longitude: position[0],
    latitude: position[1],
    spatialReference: { wkid: 4326 } // WGS84坐标系，与高德默认一致
  })
  // 创建图片标记符号
  const symbol = new esriModules.PictureMarkerSymbol({
    url: icon,
    // 根据DOM元素尺寸设置符号大小
    width: 28,
    height: 34,
    yoffset: 34 / 2, // 垂直偏移使底部居中
    xoffset: 0 // 水平偏移为0
  })
  return new esriModules.Graphic({
    geometry: point,
    symbol: symbol,
    attributes: extData // 对应AMap的extData
  })
}

/**
 * 创建线段
 * @param coordinates
 */
export const createPolyline = (coordinates: any = null, color: string = '#3A7DFF',extData: any = {}) => {
  if (!esriModules) return null
  if (!coordinates)
    coordinates = [
      [104.567121, 30.399821],
      [104.457101, 30.389841],
      [104.547101, 30.379841]
    ]
  const polygon = new esriModules.Polyline({
    paths: coordinates, // 坐标数组直接作为环
    spatialReference: { wkid: 4326 }
  })
  return new esriModules.Graphic({
    geometry: polygon,
    symbol: new esriModules.SimpleLineSymbol({
      color: color, // 粉红色
      width: 2
    }),
    attributes: extData // 对应AMap的extData
  })
}

/**
 * 自定义弹窗集合
 */
export const popups = [] as any[] //
/**
 * 创建自定义弹窗
 * @param dom
 * @param position
 */
export const createMarkerPopup = (dom, position: [number, number]) => {
  // 存储弹窗信息
  popups.push({
    element: dom,
    graphic: new esriModules.Graphic({
      geometry: new esriModules.Point({
        longitude: position[0],
        latitude: position[1],
        spatialReference: { wkid: 4326 } // WGS84坐标系，与高德默认一致
      }),
    })
  })
}

/**
 * 更新所有弹窗位置
 */
export const updateAllPopupPositions = () => {
  if (!mapView) return
  popups.forEach((item) => {
    updatePopupPosition(item.element, item.graphic.geometry)
  })
}

/**
 * 更新单个弹窗位置
 * @param element
 * @param point
 */
export const updatePopupPosition = (element: HTMLElement, point: any) => {
  if (!mapView) return
  // 将地图坐标转换为屏幕坐标
  const screenPoint = mapView.toScreen(point)
  if (screenPoint) {
    // 设置弹窗位置（偏移一点，避免与标记重叠）
    element.style.left = `${screenPoint.x - 14}px`
    element.style.top = `${screenPoint.y - 34}px`
  }
}

/**
 * 监听地图变化，更新弹窗位置
 */
export const watchMapChanges = (view) => {
  if (!view) return

  // 当地图移动、缩放或旋转时更新弹窗位置
  view.watch('extent', updateAllPopupPositions)
  view.watch('rotation', updateAllPopupPositions)

  // 更精确的方式：监听视图的"update"事件
  view.on('update', (event) => {
    if (event.viewpoint) {
      updateAllPopupPositions()
    }
  })
}

/**
 * 将16进制颜色值转换为rgba数组
 */
export const hexToRgba = (hex: string, alpha: number = 1): number[] => {
  // 移除 # 号
  hex = hex.replace('#', '')

  // 解析红、绿、蓝分量
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return [r, g, b, alpha]
}

export const loadMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.TMap) {
      resolve()
      return
    }
    // 创建script标签
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${baseUrl}/e798cfe171e747dfb81a31953869d16e?cimToken=${getGisToken()}&domain=gis.cim.jyscy.cn:8081&v=1.exp&libraries=service,tools,geometry`
    script.onload = () => {
      window.TMap = TMap
      if (window.TMap) {
        resolve()
      } else {
        reject(new Error('腾讯地图SDK加载失败'))
      }
    }
    script.onerror = () => reject(new Error('腾讯地图SDK加载出错'))
    document.head.appendChild(script)
  })
}

export const placeSearch = (keyword: string) => {
  return fetch(
    `${baseUrl}/366662239cfd89c188c7bb4f88c119d2?cimToken=${getGisToken()}&query=${keyword}&region=510100`,
    {
      method: 'POST',
      headers: {}
    }
  )
}

export const request = ({ key, method = 'GET', data = {}, params = {} }) => {
  let url = `${baseUrl}/${key}?cimToken=${getGisToken()}`
  if (params) {
    for (const key in params) {
      url += `&${key}=${params[key]}`
    }
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      method,
      headers: {},
      body: method === 'POST' ? JSON.stringify(data) : null
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          reject(res)
        }
      })
      .then((res) => {
        if (res.status === 0) {
          resolve(res.result)
        } else {
          reject(res)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/**
 * 逆向地理编码服务
 * @param lnglat
 */
export const reverseGeocoding = (lnglat) => {
  return request({
    key: 'b9a6ef0eadcd97f9aaa31f32881e5abf',
    params: {
      lnglat: lnglat.join(',')
    }
  })
}

/**
 * 正向地理编码服务
 * @param address
 */
export const forwardGeocoding = (address) => {}
