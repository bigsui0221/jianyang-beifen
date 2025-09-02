/**
 * 高德地图JS API v2.0 类型定义
 * 参考官方文档: https://lbs.amap.com/api/jsapi-v2/documentation
 */
declare global {
  interface Window {
    AMap: typeof AMap
    AMapUI: any // AMapUI组件库
  }
}

declare namespace AMap {
  /** 经纬度坐标 */
  type LngLat = [number, number] | { lng: number; lat: number }

  /** 像素坐标 */
  type Pixel = [number, number] | { x: number; y: number }

  /** 边界范围 */
  interface Bounds {
    new (sw: LngLat, ne: LngLat): Bounds
    getSouthWest(): LngLat
    getNorthEast(): LngLat
    contains(lnglat: LngLat): boolean
    extend(lnglat: LngLat): Bounds
  }

  /** 尺寸 */
  interface Size {
    new (width: number, height: number): Size
    width: number
    height: number
  }

  /** 事件回调函数 */
  type EventCallback<T = any> = (event: T) => void | boolean

  /** 地图事件对象基础属性 */
  interface MapEvent {
    type: string
    target: any
    lnglat?: LngLat
    pixel?: Pixel
    point?: LngLat
    [key: string]: any
  }

  /**
   * 地图核心类
   */
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions)

    // 地图属性
    container: HTMLElement
    zoom: number
    center: LngLat
    bounds: Bounds

    // 地图方法
    setZoom(level: number, center?: LngLat): void
    getZoom(): number
    setCenter(position: LngLat): void
    getCenter(): LngLat
    setBounds(bounds: Bounds, padding?: number | number[]): void
    getBounds(): Bounds
    setZoomAndCenter(zoom: number, center: LngLat): void
    panTo(position: LngLat, duration?: number): void
    panBy(x: number, y: number): void
    resize(): void
    destroy(): void
    getContainer(): HTMLElement
    getSize(): Size
    setMapStyle(style: string): void

    // 事件相关
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    once<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    trigger(eventName: string, data?: any): void

    // 覆盖物相关
    add(overlay: Overlay): void
    addAll(overlays: Overlay[]): void
    remove(overlay: Overlay): void
    removeAll(): void
    getOverlays(): Overlay[]
    setDefaultCursor(cursor: string): void

    // 图层相关
    addLayer(layer: Layer): void
    removeLayer(layer: Layer): void
    getLayer(id: string): Layer | null

    // 控件相关
    addControl(control: Control): void
    removeControl(control: Control): void
  }

  /** 地图初始化配置 */
  interface MapOptions {
    zoom?: number // 缩放级别 3-20
    center?: LngLat // 中心点坐标
    resizeEnable?: boolean // 是否允许自动调整大小
    rotateEnable?: boolean // 是否允许旋转
    pitchEnable?: boolean // 是否允许倾斜
    pitch?: number // 倾斜角度 0-83
    rotation?: number // 旋转角度 0-360
    viewMode?: '2D' | '3D' // 视图模式
    mapStyle?: string // 地图样式
    showLabel?: boolean // 是否显示地图文字标注
    defaultCursor?: string // 默认鼠标样式
    doubleClickZoom?: boolean // 是否允许双击放大
    dragEnable?: boolean // 是否允许拖拽
    zoomEnable?: boolean // 是否允许缩放
    keyboardEnable?: boolean // 是否允许键盘控制
    scrollWheel?: boolean // 是否允许滚轮缩放
    animateEnable?: boolean // 是否启用动画
  }

  /**
   * 覆盖物基类
   */
  interface Overlay {
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setOptions(options: any): void
    getOptions(): any
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    remove(): void
    destroy(): void
  }

  /**
   * 标记点
   */
  class Marker implements Overlay {
    constructor(options?: MarkerOptions)

    // 属性
    position: LngLat
    map: Map | null
    visible: boolean
    // 方法
    setPosition(position: LngLat): void
    getPosition(): LngLat
    setIcon(icon: Icon | string): void
    getIcon(): Icon | string
    setAnchor(anchor: string | Pixel): void
    setOffset(offset: Pixel): void
    setTitle(title: string): void
    setAnimation(animation: 'AMAP_ANIMATION_DROP' | 'AMAP_ANIMATION_BOUNCE' | null): void
    startAnimation(): void
    stopAnimation(): void
    setLabel(label: MarkerLabel | null): void
    getLabel(): MarkerLabel | null
    setZIndex(zIndex: number): void
    getZIndex(): number

    // 继承自Overlay的方法
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setOptions(options: MarkerOptions): void
    getOptions(): MarkerOptions
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    remove(): void
    destroy(): void
  }

  /** 标记点配置 */
  interface MarkerOptions {
    position?: LngLat // 位置
    map?: Map // 所属地图
    icon?: Icon | string // 图标
    size?: Size // 图标尺寸
    offset?: Pixel // 偏移量
    anchor?: string | Pixel // 锚点
    title?: string // 鼠标悬停提示
    visible?: boolean // 是否可见
    zIndex?: number // 层级
    animation?: 'AMAP_ANIMATION_DROP' | 'AMAP_ANIMATION_BOUNCE' | null // 动画
    clickable?: boolean // 是否可点击
    draggable?: boolean // 是否可拖拽
    label?: MarkerLabel // 文本标签
    angle?: number // 旋转角度
    cursor?: string // 鼠标样式
    content?: string | HTMLElement // 自定义内容
    extData?: any // 扩展数据
  }

  /** 标记点文本标签 */
  interface MarkerLabel {
    content?: string // 文本内容
    offset?: Pixel // 偏移量
    direction?: 'top' | 'right' | 'bottom' | 'left' | 'center' // 位置方向
    style?: {
      color?: string
      fontSize?: string
      backgroundColor?: string
      borderColor?: string
      borderRadius?: string
      padding?: string
      [key: string]: any
    }
  }

  /** 图标 */
  interface Icon {
    new (options: IconOptions): Icon
    size: Size
    image: string
    imageSize?: Size
    imageOffset?: Pixel
  }

  /** 图标配置 */
  interface IconOptions {
    size: Size // 图标尺寸
    image: string // 图标图片地址
    imageSize?: Size // 图标图片尺寸
    imageOffset?: Pixel // 图标图片偏移量
    imageUrl?: string // 兼容旧版
  }

  /**
   * 信息窗口
   */
  class InfoWindow implements Overlay {
    constructor(options?: InfoWindowOptions)

    // 方法
    open(map: Map, position?: LngLat): void
    close(): void
    isOpen(): boolean
    setContent(content: string | HTMLElement): void
    getContent(): string | HTMLElement
    setPosition(position: LngLat): void
    getPosition(): LngLat
    setSize(size: Size): void
    getSize(): Size
    setOffset(offset: Pixel): void

    // 继承自Overlay的方法
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setOptions(options: InfoWindowOptions): void
    getOptions(): InfoWindowOptions
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    remove(): void
    destroy(): void
  }

  /** 信息窗口配置 */
  interface InfoWindowOptions {
    content?: string | HTMLElement // 内容
    position?: LngLat // 位置
    map?: Map // 所属地图
    offset?: Pixel // 偏移量
    size?: Size // 尺寸
    maxWidth?: number // 最大宽度
    autoMove?: boolean // 是否自动调整位置
    closeWhenClickMap?: boolean // 点击地图是否关闭
    isCustom?: boolean // 是否自定义样式
    anchor?: string // 锚点位置
    zIndex?: number // 层级
  }

  /**
   * 多边形
   */
  class Polygon implements Overlay {
    constructor(options?: PolygonOptions)

    // 方法
    setPath(path: LngLat[] | LngLat[][]): void
    getPath(): LngLat[] | LngLat[][]
    setFillColor(color: string): void
    setStrokeColor(color: string): void
    setStrokeWeight(weight: number): void
    setStrokeOpacity(opacity: number): void
    setFillOpacity(opacity: number): void

    // 继承自Overlay的方法
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setOptions(options: PolygonOptions): void
    getOptions(): PolygonOptions
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    remove(): void
    destroy(): void
  }

  /** 多边形配置 */
  interface PolygonOptions {
    path?: LngLat[] | LngLat[][] // 路径
    map?: Map // 所属地图
    fillColor?: string // 填充色
    strokeColor?: string // 边框色
    strokeWeight?: number // 边框宽度
    strokeStyle?: 'solid' | 'dashed' // 边框样式
    strokeOpacity?: number // 边框透明度
    fillOpacity?: number // 填充透明度
    zIndex?: number // 层级
    visible?: boolean // 是否可见
    editable?: boolean // 是否可编辑
    cursor?: string // 鼠标样式
  }

  /**
   * 折线
   */
  class Polyline implements Overlay {
    constructor(options?: PolylineOptions)

    // 方法
    setPath(path: LngLat[]): void
    getPath(): LngLat[]
    setStrokeColor(color: string): void
    setStrokeWeight(weight: number): void
    setStrokeOpacity(opacity: number): void
    setLineJoin(join: string): void
    setLineCap(cap: string): void

    // 继承自Overlay的方法
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setOptions(options: PolylineOptions): void
    getOptions(): PolylineOptions
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    remove(): void
    destroy(): void
  }

  /** 折线配置 */
  interface PolylineOptions {
    path?: LngLat[] // 路径
    map?: Map // 所属地图
    strokeColor?: string // 线条颜色
    strokeWeight?: number // 线条宽度
    strokeOpacity?: number // 线条透明度
    strokeStyle?: 'solid' | 'dashed' // 线条样式
    strokeDasharray?: number[] // 虚线样式
    zIndex?: number // 层级
    visible?: boolean // 是否可见
    editable?: boolean // 是否可编辑
    cursor?: string // 鼠标样式
  }

  /**
   * 图层基类
   */
  interface Layer {
    id: string
    map: Map | null
    visible: boolean
    zIndex: number

    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setZIndex(zIndex: number): void
    getZIndex(): number
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    destroy(): void
  }

  /** 瓦片图层 */
  class TileLayer implements Layer {
    constructor(options?: TileLayerOptions)

    // 特有方法
    setUrl(url: string): void
    getUrl(): string
    setOpacity(opacity: number): void
    getOpacity(): number

    // 继承自Layer的方法
    id: string
    map: Map | null
    visible: boolean
    zIndex: number
    setMap(map: Map | null): void
    getMap(): Map | null
    show(): void
    hide(): void
    isVisible(): boolean
    setZIndex(zIndex: number): void
    getZIndex(): number
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
    destroy(): void
  }

  /** 瓦片图层配置 */
  interface TileLayerOptions {
    url?: string // 瓦片地址模板
    opacity?: number // 透明度
    zIndex?: number // 层级
    visible?: boolean // 是否可见
    tileSize?: number // 瓦片大小
    zooms?: [number, number] // 可见层级范围
    map?: Map // 所属地图
  }

  /** 路网图层 */
  class RoadNetLayer extends TileLayer {
    constructor(options?: RoadNetLayerOptions)
  }

  /** 路网图层配置 */
  interface RoadNetLayerOptions extends TileLayerOptions {
    style?: string // 路网样式
  }

  /**
   * 控件基类
   */
  interface Control {
    addTo(map: Map): void
    remove(): void
    show(): void
    hide(): void
    isVisible(): boolean
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
  }

  /** 缩放控件 */
  class Zoom implements Control {
    constructor(options?: ZoomControlOptions)

    // 方法
    setPosition(position: string): void
    getPosition(): string
    zoomIn(): void
    zoomOut(): void

    // 继承自Control的方法
    addTo(map: Map): void
    remove(): void
    show(): void
    hide(): void
    isVisible(): boolean
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
  }

  /** 缩放控件配置 */
  interface ZoomControlOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' // 位置
    offset?: Pixel // 偏移量
    showZoomNum?: boolean // 是否显示缩放级别
  }

  /** 比例尺控件 */
  class Scale implements Control {
    constructor(options?: ScaleControlOptions)

    // 继承自Control的方法
    addTo(map: Map): void
    remove(): void
    show(): void
    hide(): void
    isVisible(): boolean
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
  }

  /** 比例尺控件配置 */
  interface ScaleControlOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' // 位置
    offset?: Pixel // 偏移量
    unit?: 'metric' | 'imperial' // 单位
  }

  /** 地图类型控件 */
  class MapType implements Control {
    constructor(options?: MapTypeControlOptions)

    // 继承自Control的方法
    addTo(map: Map): void
    remove(): void
    show(): void
    hide(): void
    isVisible(): boolean
    on<EventType = MapEvent>(eventName: string, callback: EventCallback<EventType>): void
    off<EventType = MapEvent>(eventName: string, callback?: EventCallback<EventType>): void
  }

  /** 地图类型控件配置 */
  interface MapTypeControlOptions {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' // 位置
    offset?: Pixel // 偏移量
    showTraffic?: boolean // 是否显示交通图层切换
    showRoad?: boolean // 是否显示路网图层切换
    mapTypes?: ('satellite' | 'normal' | '3D')[] // 地图类型
  }

  /**
   * 地理编码服务
   */
  class Geocoder {
    constructor(options?: GeocoderOptions)

    // 方法
    getLocation(address: string, callback: (status: string, result: GeocoderResult) => void): void
    getAddress(location: LngLat, callback: (status: string, result: RegeocoderResult) => void): void
    setCity(city: string): void
    destroy(): void
  }

  /** 地理编码配置 */
  interface GeocoderOptions {
    city?: string // 城市
    radius?: number // 搜索半径
    extensions?: 'base' | 'all' // 返回信息详略
  }

  /** 地理编码结果 */
  interface GeocoderResult {
    status: string
    info: string
    count: string
    geocodes: Array<{
      formattedAddress: string
      country: string
      province: string
      city: string
      district: string
      township: string
      neighborhood: {
        name: string
        type: string
      }
      building: {
        name: string
        type: string
      }
      adcode: string
      street: string
      number: string
      location: LngLat
      level: string
    }>
  }

  /** 逆地理编码结果 */
  interface RegeocoderResult {
    status: string
    info: string
    regeocode: {
      formattedAddress: string
      addressComponent: {
        country: string
        province: string
        city: string
        district: string
        township: string
        neighborhood: {
          name: string
          type: string
        }
        building: {
          name: string
          type: string
        }
        adcode: string
        streetNumber: {
          street: string
          number: string
          location: LngLat
          direction: string
          distance: string
        }
        businessAreas: Array<{
          name: string
          location: LngLat
          id: string
        }>
      }
    }
  }

  /**
   * 地点搜索服务
   */
  class PlaceSearch {
    constructor(options?: PlaceSearchOptions)

    // 方法
    search(keyword: string, callback: (status: string, result: PlaceSearchResult) => void): void
    searchNearBy(
      keyword: string,
      center: LngLat,
      radius: number,
      callback: (status: string, result: PlaceSearchResult) => void
    ): void
    searchInBounds(
      keyword: string,
      bounds: Bounds,
      callback: (status: string, result: PlaceSearchResult) => void
    ): void
    setCity(city: string): void
    setPageSize(size: number): void
    setPageIndex(index: number): void
    destroy(): void
  }

  /** 地点搜索配置 */
  interface PlaceSearchOptions {
    city?: string // 城市
    type?: string // 兴趣点类型
    pageSize?: number // 每页结果数
    pageIndex?: number // 页码
    extensions?: 'base' | 'all' // 返回信息详略
    map?: Map // 地图实例
    panel?: string // 结果面板
    autoFitView?: boolean // 自动调整地图视野
  }

  /** 地点搜索结果 */
  interface PlaceSearchResult {
    status: string
    info: string
    count: string
    suggestions?: Array<{
      id: string
      name: string
      district: string
      adcode: string
      location: LngLat
      address: string
      type: string
    }>
    pois: Array<{
      id: string
      name: string
      type: string
      tel: string
      address: string
      location: LngLat
      pname: string
      cityname: string
      adname: string
      businessArea: string
      distance: string
      direction: string
    }>
    pageIndex: number
    pageSize: number
    totalPOIs: number
  }
   /**
   * 鼠标工具类，用于通过鼠标交互在地图上绘制点、线、面等覆盖物
   */
  class MouseTool {
    /**
     * 构造函数
     * @param map 地图实例
     */
    constructor(map: Map);

    /**
     * 开始绘制点标记
     * @param options 点标记样式选项
     */
    marker(options?: Marker.Options): void;

    /**
     * 开始绘制折线
     * @param options 折线样式选项
     */
    polyline(options?: Polyline.Options): void;

    /**
     * 开始绘制多边形
     * @param options 多边形样式选项
     */
    polygon(options?: Polygon.Options): void;

    /**
     * 开始绘制矩形
     * @param options 矩形样式选项
     */
    rectangle(options?: Polygon.Options): void;

    /**
     * 开始绘制圆形
     * @param options 圆形样式选项
     */
    circle(options?: Circle.Options): void;

    /**
     * 开始测距
     */
    measureDistance(): void;

    /**
     * 开始测面积
     */
    measureArea(): void;

    /**
     * 开启鼠标画点模式，与 marker 不同的是，此方法只获取坐标不创建覆盖物
     */
    click(): void;

    /**
     * 关闭当前鼠标操作，清除当前绘制的覆盖物
     */
    close(): void;

    /**
     * 清除当前鼠标工具绘制的所有覆盖物
     */
    clear(): void;

    /**
     * 绑定事件
     * @param eventName 事件名称，如 'draw'、'marker'、'polyline' 等
     * @param callback 回调函数
     */
    on(eventName: string, callback: (event: MouseTool.Event) => void): void;

    /**
     * 解绑事件
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    off(eventName: string, callback: (event: MouseTool.Event) => void): void;
  }

  namespace MouseTool {
    /**
     * MouseTool 事件对象
     */
    interface Event {
      /**
       * 绘制完成的覆盖物对象
       */
      obj: Marker | Polyline | Polygon | Circle;
      
      /**
       * 事件类型
       */
      type: string;
      
      /**
       * 坐标信息（点绘制时）
       */
      lnglat?: LngLat;
      
      /**
       * 路径信息（线、面绘制时）
       */
      path?: LngLat[];
      
      /**
       * 测量结果（测距、测面积时）
       */
      result?: number;
    }
  }
  /**
   * 工具类
   */
  namespace Tool {
    function isLngLat(lnglat: any): boolean
    function convertFrom(lnglat: LngLat, fromProjection: string): LngLat
    function getMeterPerPixel(zoom: number, latitude: number): number
    function distance(lnglat1: LngLat, lnglat2: LngLat): number
  }

  /**
   * 加载插件
   * @param plugins 插件名称数组
   * @param callback 加载完成回调函数
   */
  function plugin(plugins: string[], callback: () => void): void

  // 如果你使用的是更老的API版本，可能需要这个重载
  function plugin(plugin: string, callback: () => void): void

  // 以下是一些常见插件的类型定义示例（根据需要添加）

  /** 定位插件 */
  class Geolocation {
    constructor(options?: GeolocationOptions)
    getCurrentPosition(callback: (status: string, result: GeolocationResult) => void): void
    watchPosition(callback: (status: string, result: GeolocationResult) => void): number
    clearWatch(watchId: number): void
    destroy(): void
  }

  interface GeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
    convert?: boolean
    showButton?: boolean
    buttonPosition?: string
    buttonOffset?: Pixel
    showMarker?: boolean
    markerOptions?: MarkerOptions
    showCircle?: boolean
    circleOptions?: CircleOptions
    panToLocation?: boolean
    zoomToAccuracy?: boolean
  }

  interface GeolocationResult {
    position: LngLat
    accuracy: number
    formattedAddress?: string
    addressComponent?: any
    cityCode?: string
  }

  /** 信息窗体插件 */
  class InfoWindow extends Overlay {
    // 已在之前的定义中，这里不再重复
  }
  /**
   * 常量定义
   */
  const VERSION: string
  const LngLat: {
    new (lng: number, lat: number): LngLat
    from(lnglat: any): LngLat
  }
  const Bounds: {
    new (sw: LngLat, ne: LngLat): Bounds
  }
  const Size: {
    new (width: number, height: number): Size
  }
  const Pixel: {
    new (x: number, y: number): Pixel
  }
}

export {}
