<template>
   <div id="mapContainer" v-loading="isLoading" element-loading-text="数据加载中...">
    </div>
  <!-- 搜索区 -->

  <!-- 地图弹窗容器 -->
  <div id="venuePopupContainer" class="popup-overlay">
    <!-- 防汛重点场所弹窗 -->
    <div 
      v-for="venue in venuesKeyVenues" 
      :key="`popup-${venue.id}`"
      :ref="el => setPopupRef(el, venue.id)"
      class="venue-popup"
      :style="{ display: activePopupId === venue.id ? 'block' : 'none' }"
    >
      <div class="venue-popup__card">
        <div class="venue-popup__header">
          <div class="venue-popup__title">{{ venue.stationName }}</div>
          <div class="venue-popup__tags">
            <span v-if="venue.type" class="tag">{{ venue.type }}</span>
            <span v-if="venue.level" class="tag tag--level">{{ venue.level }}</span>
          </div>
        </div>
        <div class="venue-popup__meta">
          <div class="meta-row">
            <span class="label">地址</span>
            <span class="value">{{ venue.address || '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="label">责任人</span>
            <span class="value">{{ venue.chargePerson || '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="label">电话</span>
            <span class="value">{{ venue.contactNumber || '-' }}</span>
          </div>
        </div>
        <div class="venue-popup__list venue-popup__grid">
          <div 
            v-for="(data, idx) in venue.dataList || []" 
            :key="idx"
            class="venue-popup__item"
          >
            <div class="name">{{ data.itemName }}</div>
            <div class="stats-wrap">
              <span class="stats alarm">异常 {{ data.abnormalNum }}</span>
              <span class="stats normal">正常 {{ data.normalNum }}</span>
              <span class="stats total">合计 {{ data.totalNum }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="venue-popup__arrow"></div>
    </div>
  </div>

  <!-- 左侧悬浮区域（固定：督导检查、雨量分布、预警信息） -->
  <div class="floating-panel left-panel">
    <!-- 督导检查 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="督导检查" class="title-icon" />
        </div>
        <h3>督导检查</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three">
          <div class="metric-card">
            <div class="card-label">检查总数</div>
            <div class="card-value">{{ venuesSupervision.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">无问题数量</div>
            <div class="card-value">{{ venuesSupervision.noProblemNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">有问题数量</div>
            <div class="card-value">{{ venuesSupervision.problemNum ?? '-' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 雨量分布 -->
    <div class="panel-container flex-2">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="雨量分布" class="title-icon" />
        </div>
        <h3>雨量分布</h3>
      </div>
      <div class="container-content">
        <div class="rainfall-content">
          <div class="rainfall-map">
            <div class="map-placeholder">地图区域</div>
          </div>
          <div class="rainfall-legend">
            <div class="legend-item">
              <span class="legend-label">无雨</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item highlight">
              <span class="legend-label">0-9</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">10-24</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">25-49</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">50-99</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">100-249</span>
              <span class="legend-count">-</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">>=250</span>
              <span class="legend-count">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警信息 -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="预警信息" class="title-icon" />
        </div>
        <h3>预警信息</h3>
      </div>
      <div class="container-content">
        <div class="warning-list">
          <div class="warning-item" v-for="(item, idx) in venuesWarnings" :key="idx">
            <div class="warning-main">
              <div class="warning-title">{{ item.warningTitle }}</div>
              <div class="warning-message">{{ item.warningContent }}</div>
            </div>
            <div class="warning-meta">
              <div class="warning-tag" :class="item.warningLevel?.name">{{ item.warningLevel?.desc || '-' }}</div>
              <div class="warning-time">{{ new Date(item.warningTime).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  

  <!-- 右侧悬浮区域（随场景切换） -->
  <div class="floating-panel right-panel">
    <!-- 防汛保障：两个面板 -->
    <template v-if="venuesState.sceneActive === 'floodControl'">
      <!-- 右1：监测数据 -->
      <div class="panel-container">
        <div class="container-header">
          <div class="header-icon">
            <img :src="titleIcon" alt="监测数据" class="title-icon" />
          </div>
          <h3>监测数据</h3>
        </div>
        <div class="container-content">
          <div v-if="venuesMonitor.length">
            <div class="monitor-group" v-for="(m, mi) in venuesMonitor" :key="mi">
              <div class="group-title">{{ m.itemName }}</div>
              <div class="stats-row">
                <div class="metric-card metric-card--alarm">
                  <div class="card-label">报警数</div>
                  <div class="card-value">{{ m.alarmNum }}</div>
                </div>
                <div class="metric-card metric-card--normal">
                  <div class="card-label">正常数</div>
                  <div class="card-value">{{ m.normalNum }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="table-wrapper">
            <el-empty description="暂无监测数据" />
          </div>
        </div>
      </div>
      <!-- 右2：防汛重点场所 -->
      <div class="panel-container">
        <div class="container-header">
          <div class="header-icon">
            <img :src="titleIcon" alt="防汛重点场所" class="title-icon" />
          </div>
          <h3>防汛重点场所</h3>
        </div>
        <div class="container-content">
          <div v-if="venuesKeyVenues.length" class="venues-list">
            <div class="venue-card" v-for="v in venuesKeyVenues" :key="v.id">
              <div class="venue-header">
                <div class="venue-title">{{ v.stationName }}</div>
                <div class="venue-meta">
                  <div class="venue-meta__row">地址：{{ v.address || '-' }}</div>
                  <div class="venue-meta__row">责任人：{{ v.chargePerson || '-' }}｜电话：{{ v.contactNumber || '-' }}</div>
                </div>
              </div>
              <div class="venue-datalist">
                <div class="venue-item" v-for="(d, di) in v.dataList" :key="di">
                  <div class="venue-item__name">{{ d.itemName }}</div>
                  <div class="venue-item__stats">
                    <span class="chip chip--alarm">异常 {{ d.abnormalNum }}</span>
                    <span class="chip chip--normal">正常 {{ d.normalNum }}</span>
                    <span class="chip chip--total">合计 {{ d.totalNum }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="table-wrapper">
            <el-empty description="暂无重点场所数据" />
          </div>
        </div>
      </div>
    </template>
    <!-- 其他场景：单面板占位 -->
    <template v-else>
      <!-- 水环境保障：两个面板（监测数据 + 重点场所） -->
      <template v-if="venuesState.sceneActive === 'waterEnvironment'">
        <!-- 右1：水质监测数据 -->
        <div class="panel-container">
          <div class="container-header">
            <div class="header-icon">
              <img :src="titleIcon" alt="水质监测数据" class="title-icon" />
            </div>
            <h3>水质监测数据</h3>
          </div>
          <div class="container-content">
            <div v-if="venuesMonitor.length">
              <div class="monitor-group" v-for="(m, mi) in venuesMonitor" :key="mi">
                <div class="group-title">{{ m.itemName }}</div>
                <div class="stats-row">
                  <div class="metric-card metric-card--alarm">
                    <div class="card-label">报警数</div>
                    <div class="card-value">{{ m.alarmNum }}</div>
                  </div>
                  <div class="metric-card metric-card--normal">
                    <div class="card-label">正常数</div>
                    <div class="card-value">{{ m.normalNum }}</div>
                  </div>
                  <div class="metric-card">
                    <div class="card-label">合计</div>
                    <div class="card-value">{{ (m.alarmNum ?? 0) + (m.normalNum ?? 0) }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="table-wrapper">
              <el-empty description="暂无监测数据" />
            </div>
          </div>
        </div>
        <!-- 右2：水环境重点场所 -->
      <div class="panel-container">
        <div class="container-header">
          <div class="header-icon">
            <img :src="titleIcon" alt="水环境重点场所" class="title-icon" />
          </div>
          <h3>水环境重点场所</h3>
        </div>
          <div class="container-content">
            <div v-if="venuesKeyVenues.length" class="venues-list">
              <div class="venue-card" v-for="v in venuesKeyVenues" :key="v.id">
                <div class="venue-header">
                  <div class="venue-title">{{ v.stationName || v.name || '-' }}</div>
                  <div class="venue-meta">
                    <div class="venue-meta__row">地址：{{ v.address || '-' }}</div>
                    <div class="venue-meta__row" v-if="v.chargePerson || v.contactNumber">责任人：{{ v.chargePerson || '-' }}｜电话：{{ v.contactNumber || '-' }}</div>
                  </div>
                </div>
                <div class="venue-datalist" v-if="v.dataList && v.dataList.length">
                  <div class="venue-item" v-for="(d, di) in v.dataList" :key="di">
                    <div class="venue-item__name">{{ d.itemName }}</div>
                    <div class="venue-item__stats">
                      <span class="chip chip--alarm">异常 {{ d.abnormalNum }}</span>
                      <span class="chip chip--normal">正常 {{ d.normalNum }}</span>
                      <span class="chip chip--total">合计 {{ d.totalNum }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="table-wrapper">
              <el-empty description="暂无重点场所数据" />
            </div>
          </div>
        </div>
      </template>
      <!-- 供排水保障：两个面板（监测数据 + 重点场所） -->
      <template v-else>
        <!-- 右1：供排水监测数据 -->
        <div class="panel-container">
          <div class="container-header">
            <div class="header-icon">
              <img :src="titleIcon" alt="供排水监测" class="title-icon" />
            </div>
            <h3>供排水监测</h3>
          </div>
        <div class="container-content">
            <div v-if="venuesMonitor.length">
              <div class="monitor-group" v-for="(m, mi) in venuesMonitor" :key="mi">
                <div class="group-title">{{ m.itemName }}</div>
                <div class="stats-row">
                  <div class="metric-card metric-card--alarm">
                    <div class="card-label">报警数</div>
                    <div class="card-value">{{ m.alarmNum }}</div>
                  </div>
                  <div class="metric-card metric-card--normal">
                    <div class="card-label">正常数</div>
                    <div class="card-value">{{ m.normalNum }}</div>
                  </div>
                  <div class="metric-card">
                    <div class="card-label">合计</div>
                    <div class="card-value">{{ (m.alarmNum ?? 0) + (m.normalNum ?? 0) }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="table-wrapper">
              <el-empty description="暂无监测数据" />
            </div>
          </div>
        </div>
        <!-- 右2：供排水重点场所 -->
        <div class="panel-container">
          <div class="container-header">
            <div class="header-icon">
              <img :src="titleIcon" alt="供排水重点场所" class="title-icon" />
            </div>
            <h3>供排水重点场所</h3>
          </div>
          <div class="container-content">
            <div v-if="venuesKeyVenues.length" class="venues-list">
              <div class="venue-card" v-for="v in venuesKeyVenues" :key="v.id">
                <div class="venue-header">
                  <div class="venue-title">{{ v.stationName || v.name || '-' }}</div>
                  <div class="venue-meta">
                    <div class="venue-meta__row">地址：{{ v.address || '-' }}</div>
                    <div class="venue-meta__row" v-if="v.chargePerson || v.contactNumber">责任人：{{ v.chargePerson || '-' }}｜电话：{{ v.contactNumber || '-' }}</div>
                  </div>
                </div>
                <div class="venue-datalist" v-if="v.dataList && v.dataList.length">
                  <div class="venue-item" v-for="(d, di) in v.dataList" :key="di">
                    <div class="venue-item__name">{{ d.itemName }}</div>
                    <div class="venue-item__stats">
                      <span class="chip chip--alarm">异常 {{ d.abnormalNum }}</span>
                      <span class="chip chip--normal">正常 {{ d.normalNum }}</span>
                      <span class="chip chip--total">合计 {{ d.totalNum }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="table-wrapper">
              <el-empty description="暂无重点场所数据" />
          </div>
        </div>
      </div>
      </template>
    </template>
  </div>

  <!-- 底部三项操作：复用 metrics 的场景切换逻辑 -->
  <div class="bottom-actions">
    <div class="action-item secure" :class="{ active: venuesState.sceneActive === 'floodControl' }" @click="venuesState.setScene('floodControl')">
      <div class="action-icon">
        <img 
          :src="venuesState.sceneActive === 'floodControl' ? preloadedImages.floodActive : preloadedImages.flood" 
          alt="防汛保障"
          v-if="imagesPreloaded"
        />
        <div v-else class="loading-placeholder">加载中...</div>
      </div>
      <div class="action-label">防汛保障</div>
    </div>
    <div class="action-item manage" :class="{ active: venuesState.sceneActive === 'waterEnvironment' }" @click="venuesState.setScene('waterEnvironment')">
      <div class="action-icon">
        <img 
          :src="venuesState.sceneActive === 'waterEnvironment' ? preloadedImages.waterActive : preloadedImages.water" 
          alt="水环境保障"
          v-if="imagesPreloaded"
        />
        <div v-else class="loading-placeholder">加载中...</div>
      </div>
      <div class="action-label">水环境保障</div>
    </div>
    <div class="action-item service" :class="{ active: venuesState.sceneActive === 'waterSupplyDrainage' }" @click="venuesState.setScene('waterSupplyDrainage')">
      <div class="action-icon">
        <img 
          :src="venuesState.sceneActive === 'waterSupplyDrainage' ? preloadedImages.drainageActive : preloadedImages.drainage" 
          alt="供排水保障"
          v-if="imagesPreloaded"
        />
        <div v-else class="loading-placeholder">加载中...</div>
      </div>
      <div class="action-label">供排水保障</div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { reactive, shallowRef, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { initGisMap, createMarkerGraphic, esriModules, createMarkerPopup, mapView as gisMapView } from '@/utils/gis'
import { useVenuesScene } from './useVenuesScene'
import { MetricsVenuesAPI } from '@/api/sector/metrics'
import iconFlood from '@/assets/imgs/sector/floodGuarantee.png'
import iconFloodActive from '@/assets/imgs/sector/floodGuarantee-active.png'
import iconWater from '@/assets/imgs/sector/waterGuarantee.png'
import iconWaterActive from '@/assets/imgs/sector/waterGuarantee-active.png'
import iconDrainage from '@/assets/imgs/sector/waterDrainageGuarantee.png'
import iconDrainageActive from '@/assets/imgs/sector/waterDrainageGuarantee-active.png'
import iconKeyVenue from '@/assets/imgs/sector/防汛重点场所.png'
import waterEnvironmentKeyVenue from '@/assets/imgs/sector/水环境重点场景.png'
import waterSupplyDrainageKeyVenue from '@/assets/imgs/sector/防汛事件.png'
import titleIcon from '@/assets/imgs/sector/title-icon.png'

// REM 响应式设置 - 基于1920px设计稿
const setRem = () => {
  const designWidth = 1920 // 设计稿基准宽度
  const currentWidth = window.innerWidth
  // 计算缩放比例，以100px为基准字体大小
  const fontSize = Math.min((currentWidth / designWidth) * 100, 200) // 限制最大200px
  document.documentElement.style.fontSize = fontSize + 'px'
  console.log(`[Venues] 屏幕宽度: ${currentWidth}px, 根字体大小: ${fontSize}px`)
}

const { active, setScene } = useVenuesScene()
const venuesState = reactive({
  get sceneActive() { return active.value },
  setScene
})

// 图片预加载状态
const imagesPreloaded = ref(false)
const preloadedImages = ref<Record<string, string>>({})

// 图片预加载函数
const preloadImages = async () => {
  const imageUrls = [
    { key: 'flood', url: iconFlood },
    { key: 'floodActive', url: iconFloodActive },
    { key: 'water', url: iconWater },
    { key: 'waterActive', url: iconWaterActive },
    { key: 'drainage', url: iconDrainage },
    { key: 'drainageActive', url: iconDrainageActive },
    { key: 'keyVenue', url: iconKeyVenue },
    { key: 'waterEnvironmentKeyVenue', url: waterEnvironmentKeyVenue },
    { key: 'waterSupplyDrainageKeyVenue', url: waterSupplyDrainageKeyVenue }
  ]

  const loadPromises = imageUrls.map(({ key, url }) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedImages.value[key] = url
        resolve(url)
      }
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })

  try {
    await Promise.all(loadPromises)
    imagesPreloaded.value = true
    console.log('所有图片预加载完成')
  } catch (error) {
    console.error('图片预加载失败:', error)
    // 即使预加载失败，也设置为true，避免阻塞页面
    imagesPreloaded.value = true
  }
}
const venuesSupervision = reactive<{ totalNum?: number; noProblemNum?: number; problemNum?: number }>({})
const venuesWarnings = ref<any[]>([])
const venuesMonitor = ref<Array<{ itemName: string; alarmNum: number; normalNum: number }>>([])
const venuesKeyVenues = ref<Array<any>>([])
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
// 三场景独立图层
const floodLayer = shallowRef<any>(null)
const waterEnvLayer = shallowRef<any>(null)
const waterSupplyLayer = shallowRef<any>(null)
let currentGraphics: any[] = []
const popupContainerRef = shallowRef<HTMLElement | null>(null)
const venuePopupMap = new Map<number, HTMLElement>()
const activePopupId = ref<number | null>(null)
const isLoading = ref<boolean>(true)

// 设置弹窗元素引用
const setPopupRef = (el: HTMLElement | null, venueId: number) => {
  if (el) {
    venuePopupMap.set(venueId, el)
    console.log('设置弹窗引用，ID:', venueId, '元素:', el)
    
    // 为弹窗注册到GIS弹窗系统
    const venue = venuesKeyVenues.value.find(v => v.id === venueId)
    if (venue && venue.longitude && venue.latitude) {

      createMarkerPopup(el, [venue.longitude, venue.latitude])
    }
  }
}
const getActiveLayer = () => {
  if (venuesState.sceneActive === 'floodControl') return floodLayer.value
  if (venuesState.sceneActive === 'waterEnvironment') return waterEnvLayer.value
  return waterSupplyLayer.value
}

const updateLayersVisibility = () => {
  if (!floodLayer.value || !waterEnvLayer.value || !waterSupplyLayer.value) return
  floodLayer.value.visible = venuesState.sceneActive === 'floodControl'
  waterEnvLayer.value.visible = venuesState.sceneActive === 'waterEnvironment'
  waterSupplyLayer.value.visible = venuesState.sceneActive === 'waterSupplyDrainage'
}

// 不同场景使用不同点位icon
const pickIconByScene = () => {
  if (venuesState.sceneActive === 'waterEnvironment') return waterEnvironmentKeyVenue
  if (venuesState.sceneActive === 'waterSupplyDrainage') return waterSupplyDrainageKeyVenue
  return iconKeyVenue
}

const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  
  // 添加地图移动监听，更新弹窗位置 - 使用节流避免频繁更新
  if (view) {
    let updateTimeout: NodeJS.Timeout | null = null
    
    const throttledUpdate = () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
      updateTimeout = setTimeout(() => {
        updateActivePopupPosition()
        updateTimeout = null
      }, 16) // 约60fps的更新频率
    }
    
    view.watch('extent', throttledUpdate)
    view.watch('rotation', throttledUpdate)
    view.on('viewpoint-change', throttledUpdate)
  }
  
  // 创建/添加三类图层
  try {
    if (esriModules) {
      if (!floodLayer.value) {
        floodLayer.value = new esriModules.GraphicsLayer({ id: 'venues-layer-flood' })
        map.add(floodLayer.value)
      }
      if (!waterEnvLayer.value) {
        waterEnvLayer.value = new esriModules.GraphicsLayer({ id: 'venues-layer-water' })
        map.add(waterEnvLayer.value)
      }
      if (!waterSupplyLayer.value) {
        waterSupplyLayer.value = new esriModules.GraphicsLayer({ id: 'venues-layer-supply' })
        map.add(waterSupplyLayer.value)
      }
      // 初始只显示当前场景
      updateLayersVisibility()
    }
  } catch (e) { console.error('创建图层失败', e) }
};


// 按场景打印 MetricsVenuesAPI 数据
const logSceneData = async (scene: 'floodControl' | 'waterEnvironment' | 'waterSupplyDrainage', isInitialLoad = false) => {
  try {
    if (scene === 'floodControl') {
      const [venues, monitor, rainfall, supervision, warning] = await Promise.all([
        MetricsVenuesAPI.getFloodControlVenues(),
        MetricsVenuesAPI.getFloodControlMonitorData(),
        MetricsVenuesAPI.getRainfallDistribution(),
        MetricsVenuesAPI.getSupervisionCheck(),
        MetricsVenuesAPI.getWarningInfo()
      ])
      console.log('[Venues][防汛保障] 重点场所:', venues)
      console.log('[Venues][防汛保障] 监测数据:', monitor)
      console.log('[Venues][防汛保障] 雨量分布:', rainfall)
      console.log('[Venues][防汛保障] 督导检查:', supervision)
      // 兼容接口返回结构：可能是 { data } 或直接对象
      const supData = (supervision as any)?.data ?? (supervision as any)
      venuesSupervision.totalNum = supData?.totalNum
      venuesSupervision.noProblemNum = supData?.noProblemNum
      venuesSupervision.problemNum = supData?.problemNum
      console.log('[Venues][防汛保障] 预警信息:', warning)
      const warnData = (warning as any)?.data ?? (warning as any)
      venuesWarnings.value = Array.isArray(warnData) ? warnData : (warnData?.list ?? [])
      const monitorData = (monitor as any)?.data ?? (monitor as any)
      venuesMonitor.value = Array.isArray(monitorData) ? monitorData : (monitorData?.list ?? [])
      const keyVenueData = (venues as any)?.data ?? (venues as any)
      venuesKeyVenues.value = Array.isArray(keyVenueData) ? keyVenueData : (keyVenueData?.list ?? [])
      // 渲染防汛重点场所点位
      if (venuesState.sceneActive === 'floodControl') {
        renderMarkersForScene()
      }
    } else if (scene === 'waterEnvironment') {
      const [venues, monitor, warning] = await Promise.all([
        MetricsVenuesAPI.getWaterEnvironmentVenues(),
        MetricsVenuesAPI.getWaterEnvironmentMonitorData(),
        MetricsVenuesAPI.getWarningInfo()
      ])
      console.log('[Venues][水环境保障] 重点场所:', venues)
      console.log('[Venues][水环境保障] 监测数据:', monitor)
      console.log('[Venues][水环境保障] 预警信息:', warning)

      // 兼容监测数据结构并写入右侧面板
      const monitorData = (monitor as any)?.data ?? (monitor as any)
      const normalized = Array.isArray(monitorData)
        ? monitorData.map((m: any) => ({ itemName: m.itemName, alarmNum: Number(m.alarmNum) || 0, normalNum: Number(m.normalNum) || 0 }))
        : (monitorData?.list ?? []).map((m: any) => ({ itemName: m.itemName, alarmNum: Number(m.alarmNum) || 0, normalNum: Number(m.normalNum) || 0 }))
      venuesMonitor.value = normalized

      // 写入水环境重点场所列表
      const keyVenueData = (venues as any)?.data ?? (venues as any)
      venuesKeyVenues.value = Array.isArray(keyVenueData) ? keyVenueData : (keyVenueData?.list ?? [])
    } else if (scene === 'waterSupplyDrainage') {
      const [venues, monitor, warning] = await Promise.all([
        MetricsVenuesAPI.getWaterSupplyDrainageVenues(),
        MetricsVenuesAPI.getWaterSupplyDrainageMonitorData(),
        MetricsVenuesAPI.getWarningInfo()
      ])
      console.log('[Venues][供排水保障] 重点场所:', venues)
      console.log('[Venues][供排水保障] 监测数据:', monitor)
      console.log('[Venues][供排水保障] 预警信息:', warning)

      // 兼容监测数据结构并写入右侧面板
       const monitorData2 = (monitor as any)?.data ?? (monitor as any)
      const normalized2 = Array.isArray(monitorData2)
        ? monitorData2.map((m: any) => ({ itemName: m.itemName, alarmNum: Number(m.alarmNum) || 0, normalNum: Number(m.normalNum) || 0 }))
        : (monitorData2?.list ?? []).map((m: any) => ({ itemName: m.itemName, alarmNum: Number(m.alarmNum) || 0, normalNum: Number(m.normalNum) || 0 }))
      venuesMonitor.value = normalized2

      // 写入供排水重点场所列表
      const keyVenueData2 = (venues as any)?.data ?? (venues as any)
      venuesKeyVenues.value = Array.isArray(keyVenueData2) ? keyVenueData2 : (keyVenueData2?.list ?? [])
    }
    
    // 只在首次加载时隐藏loading
    if (isInitialLoad) {
      isLoading.value = false
    }
  } catch (err) {
    console.error('[Venues] 获取场景数据失败:', err)
    // 只在首次加载时隐藏loading
    if (isInitialLoad) {
      isLoading.value = false
    }
  }
}

// 统一的弹窗定位计算函数
const calculatePopupPosition = (venue: any, popupEl: HTMLElement) => {
  if (!venue || !venue.longitude || !venue.latitude || !mapView.value || !popupEl) {
    return null
  }

  try {
    const screenPoint = mapView.value.toScreen({
      longitude: venue.longitude,
      latitude: venue.latitude,
      spatialReference: { wkid: 4326 }
    })
    
    if (!screenPoint || screenPoint.x === undefined || screenPoint.y === undefined) {
      console.warn('无法获取屏幕坐标:', venue)
      return null
    }

    // 图标配置 - 与createMarkerGraphic中的尺寸保持一致
    const iconHeight = 36
    
    console.log('弹窗定位计算详情:', {
      venue: venue.stationName,
      geoPoint: [venue.longitude, venue.latitude],
      screenPoint: { x: screenPoint.x, y: screenPoint.y },
      iconHeight
    })
    
    // 获取弹窗尺寸 - 使用更可靠的方式
    popupEl.style.visibility = 'hidden'
    popupEl.style.display = 'block'
    popupEl.style.position = 'absolute'
    
    const popupWidth = popupEl.offsetWidth || 360 // 设置默认宽度
    const popupHeight = popupEl.offsetHeight || 200 // 设置默认高度
    
    popupEl.style.visibility = 'visible'
    
    // 计算位置：弹窗显示在图标正上方
    // 在ArcGIS中，yoffset表示符号相对于地理点的垂直偏移
    // yoffset: height/2 意味着符号向上偏移，使得符号底部对齐地理点
    // 所以 screenPoint.y 实际上是图标底部的位置
    
    const gap = 10 // 弹窗与图标之间的间距
    
    // 方法1: 假设screenPoint.y是图标底部
    const iconBottomY = screenPoint.y
    const iconTopY = iconBottomY - iconHeight
    const popupBottomY = iconTopY - gap
    
    console.log('定位计算步骤:', {
      iconBottomY,
      iconTopY,
      popupBottomY,
      popupHeight,
      gap
    })
    
    const finalX = screenPoint.x - (popupWidth / 2) // 弹窗水平居中对齐图标中心
    const finalY = popupBottomY - popupHeight // 弹窗顶部位置
    
    return {
      x: Math.round(finalX),
      y: Math.round(finalY)
    }
  } catch (error) {
    console.warn('计算弹窗位置失败:', error)
    return null
  }
}

// 显示/隐藏防汛重点场所弹窗
const showVenuePopup = (attrs: any) => {
  const id = Number(attrs?.id)
  if (!id) {
    return
  }
  
  // 检查弹窗元素是否存在
  const popupEl = venuePopupMap.get(id)
  if (!popupEl) {
    console.warn('弹窗元素未找到:', id)
    return
  }
  
  // 设置活跃弹窗ID，Vue会自动处理显示/隐藏
  activePopupId.value = id
  
  // 立即计算位置，不使用延迟
  const venue = venuesKeyVenues.value.find(v => v.id === id)
  if (!venue) {
    console.warn('场所数据未找到:', id)
    return
  }

  const position = calculatePopupPosition(venue, popupEl)
  if (position) {
    console.log('弹窗定位结果:', {
      venueId: id,
      venueName: venue.stationName,
      longitude: venue.longitude,
      latitude: venue.latitude,
      calculatedPosition: position,
      popupSize: {
        width: popupEl.offsetWidth,
        height: popupEl.offsetHeight
      }
    })
    
    popupEl.style.transform = 'none'
    popupEl.style.left = `${position.x}px`
    popupEl.style.top = `${position.y}px`
  }
}

const hideVenuePopup = () => {

  activePopupId.value = null
}

// 更新活跃弹窗位置（地图移动时调用）
const updateActivePopupPosition = () => {
  if (activePopupId.value && mapView.value) {
    const popupEl = venuePopupMap.get(activePopupId.value)
    const venue = venuesKeyVenues.value.find(v => v.id === activePopupId.value)
    
    if (popupEl && venue) {
      const position = calculatePopupPosition(venue, popupEl)
      if (position) {
        popupEl.style.transform = 'none'
        popupEl.style.left = `${position.x}px`
        popupEl.style.top = `${position.y}px`
      }
    }
  }
}


// 路由跳转：根据当前场景跳到对应子路由并携带 id 和 stationName（使用 query，避免未在 path 中声明的 params 被丢弃）
const router = useRouter()
// 统一的缩放修正函数
const getScaleCorrectedEvent = (event: any) => {
  // 获取地图容器
  const mapContainer = document.getElementById('mapContainer')
  if (!mapContainer) {
    console.warn('无法找到地图容器，返回原始事件')
    return event
  }
  
  // 获取容器的实际尺寸
  const containerRect = mapContainer.getBoundingClientRect()
  
  // 检测DataV容器的缩放情况
  // 首先检查是否有父级DataV容器
  let dataVContainer = mapContainer.closest('.datav-content, .basic-datav-content')
  let designWidth = 1920
  let designHeight = 1080 // 标准DataV设计稿高度
  
  if (!dataVContainer) {
    // 如果没有DataV容器，可能是直接缩放的情况
    // 使用window尺寸来推断设计稿尺寸
    const windowAspectRatio = window.innerWidth / window.innerHeight
    const designAspectRatio = designWidth / designHeight
    
    if (Math.abs(windowAspectRatio - designAspectRatio) > 0.1) {
      // 如果宽高比差异较大，可能使用了不同的设计稿高度
      designHeight = 1014 // 使用venues页面可能的设计稿高度
    }
  }
  
  // 计算缩放比例
  const scaleX = containerRect.width / designWidth
  const scaleY = containerRect.height / designHeight
  
  // 判断是否需要缩放修正
  // 容差设置为0.05，避免因浮点精度导致的误判
  const needScaleCorrection = Math.abs(scaleX - 1) > 0.05 || Math.abs(scaleY - 1) > 0.05
  
  if (!needScaleCorrection) {
    return event
  }
  
  // 使用较小的缩放比例来修正坐标（通常DataV使用fit模式）
  const effectiveScale = Math.min(scaleX, scaleY)
  
  // 计算修正后的坐标
  // 如果容器被居中，需要考虑偏移
  const containerCenterX = containerRect.left + containerRect.width / 2
  const containerCenterY = containerRect.top + containerRect.height / 2
  
  // 将事件坐标转换为相对于容器中心的坐标
  const relativeX = event.x - containerCenterX
  const relativeY = event.y - containerCenterY
  
  // 应用缩放修正
  const correctedRelativeX = relativeX / effectiveScale
  const correctedRelativeY = relativeY / effectiveScale
  
  // 转换回绝对坐标
  const correctedX = correctedRelativeX + containerCenterX
  const correctedY = correctedRelativeY + containerCenterY
  
  const correctedEvent = {
    ...event,
    x: correctedX,
    y: correctedY
  }
  
  // 添加调试信息（可在生产环境中移除）
  if (process.env.NODE_ENV === 'development') {
    console.log('缩放修正详情:', {
      原始事件: { x: event.x, y: event.y },
      容器尺寸: { width: containerRect.width, height: containerRect.height },
      设计稿尺寸: { width: designWidth, height: designHeight },
      缩放比例: { scaleX, scaleY, effectiveScale },
      修正后事件: { x: correctedEvent.x, y: correctedEvent.y },
      容器类型: dataVContainer ? 'DataV容器' : '直接缩放'
    })
  }
  
  return correctedEvent
}

const navigateToVenueDetail = (id: number | string, stationName?: string) => {
  if (!id) return
  let routeName = 'VenuesFloodControl'
  if (venuesState.sceneActive === 'waterEnvironment') routeName = 'VenuesWaterEnvironment'
  if (venuesState.sceneActive === 'waterSupplyDrainage') routeName = 'VenuesWaterSupplyDrainage'
  let finalName = stationName
  // 兜底：若未显式传入名称，尝试从已加载的数据中按 id 查找（注意 .value）
  try {
    const list: any[] = (venuesKeyVenues as any)?.value ?? []
    if (!finalName && Array.isArray(list)) {
      const found = list.find(v => String(v?.id) === String(id))
      if (found) finalName = found?.stationName || found?.name
    }
  } catch {}
  const params: any = { id: String(id) }
  const query: any = {}
  if (finalName) query.stationName = String(finalName)
  router.push({ name: routeName, params, query })
}




onMounted(async () => {
  // 设置 REM 响应式
  setRem()
  window.addEventListener('resize', setRem)
  
  // 先预加载所有图片
  await preloadImages()
  
  await initMap()
  
  // 等待一段时间确保mapView完全初始化
  setTimeout(() => {
    console.log('地图初始化状态检查:', {
      gisMapView: !!gisMapView,
      localMapView: !!mapView.value,
      esriModules: !!esriModules
    })
  }, 1000)
  
  popupContainerRef.value = document.getElementById('venuePopupContainer') as HTMLElement
  console.log('弹窗容器初始化:', popupContainerRef.value)
  
  // 地图与图层就绪后再拉取并渲染场景数据，避免首次进入未渲染的问题
  await logSceneData(venuesState.sceneActive, true)
  updateLayersVisibility()
  renderMarkersForScene()
})

// 监听场景切换并打印数据
watch(() => venuesState.sceneActive, (scene) => {
  updateLayersVisibility()
  logSceneData(scene as any)
  renderMarkersForScene()
})

// 组件销毁时清理事件监听器
onUnmounted(() => {
  // 清理 REM 监听器
  window.removeEventListener('resize', setRem)
  
  if (mapView.value) {
    if (mapView.value._venuesHoverHandler) {
      mapView.value._venuesHoverHandler.remove()
      mapView.value._venuesHoverHandler = null
    }
    if (mapView.value._venuesLeaveHandler) {
      mapView.value._venuesLeaveHandler.remove()
      mapView.value._venuesLeaveHandler = null
    }
    if (mapView.value._venuesClickHandler) {
      mapView.value._venuesClickHandler.remove()
      mapView.value._venuesClickHandler = null
    }
  }
  // 清理弹窗
  venuePopupMap.clear()
})

// 当重点场所数据或图层就绪时，尝试渲染点位（修复首次进入图层未就绪导致不渲染的问题）
watch(venuesKeyVenues, () => {
  if (venuesState.sceneActive === 'floodControl') {
        renderMarkersForScene()
    // 等待Vue渲染弹窗后注册到GIS系统
    setTimeout(() => {
      console.log('延迟注册弹窗到GIS系统，当前弹窗数量:', venuePopupMap.size)
      venuesKeyVenues.value.forEach(venue => {
        const el = venuePopupMap.get(venue.id)
        if (el && venue.longitude && venue.latitude) {
          console.log('重新注册弹窗:', venue.id, '坐标:', [venue.longitude, venue.latitude])
          createMarkerPopup(el, [venue.longitude, venue.latitude])
        } else {
          console.warn('弹窗元素未找到或坐标缺失:', venue.id, !!el, venue.longitude, venue.latitude)
        }
      })
    }, 500) // 增加延迟确保Vue完全渲染
  }
}, { deep: true })

// 渲染当前场景点位
const renderMarkersForScene = () => {
  try {
    if (!esriModules) return
    const layer = getActiveLayer()
    if (!layer) return
    layer.removeAll()
    const graphics = [] as any[]
    const list = venuesKeyVenues.value || []
    const iconForScene = pickIconByScene()
    list.forEach((v) => {
      if (!v.longitude || !v.latitude) return
      const g = createMarkerGraphic([v.longitude, v.latitude], iconForScene, { id: v.id, name: v.stationName }, { width: 32, height: 36 })
      if (g) {
        graphics.push(g)
      }
    })
    layer.addMany(graphics)
    currentGraphics = graphics
    console.log('[Venues] 渲染点位完成：', venuesState.sceneActive, '数量:', graphics.length)

    // 绑定鼠标事件以显示/隐藏弹窗 - 使用MapView的事件而不是GraphicsLayer的事件
    if (mapView.value) {
      // 移除之前的事件监听器（如果存在）
      if (mapView.value._venuesHoverHandler) {
        mapView.value._venuesHoverHandler.remove()
      }
      if (mapView.value._venuesLeaveHandler) {
        mapView.value._venuesLeaveHandler.remove()
      }
      if (mapView.value._venuesClickHandler) {
        mapView.value._venuesClickHandler.remove()
      }

      // 添加鼠标移动事件监听
      mapView.value._venuesHoverHandler = mapView.value.on('pointer-move', (event) => {
        const correctedEvent = getScaleCorrectedEvent(event)
        
        // 使用MapView的hitTest方法，设置更大的容差来提高hover检测精度
        const hitTestOptions = {
          tolerance: 15 // 增加检测容差，在缩放环境下需要更大的容差
        }
        
        mapView.value.hitTest(correctedEvent, hitTestOptions).then((response) => {
          // 仅命中当前场景图层
          const activeLayer = getActiveLayer()
          const result = response.results.find((r) => r.graphic && r.graphic.layer === activeLayer && currentGraphics.includes(r.graphic))
          
          if (result && result.graphic.attributes) {
            showVenuePopup(result.graphic.attributes)
          } else {
            hideVenuePopup()
          }
        }).catch((error) => {
          console.error('hitTest失败:', error)
        })
      })

      // 添加鼠标离开地图区域的事件监听
      mapView.value._venuesLeaveHandler = mapView.value.on('pointer-leave', () => {
        hideVenuePopup()
      })

      // 添加点击事件：命中当前场景点位则跳转
      mapView.value._venuesClickHandler = mapView.value.on('click', (event) => {
        const correctedEvent = getScaleCorrectedEvent(event)
        
        mapView.value.hitTest(correctedEvent).then((response) => {
          const activeLayer = getActiveLayer()
          const result = response.results.find((r) => r.graphic && r.graphic.layer === activeLayer && currentGraphics.includes(r.graphic))
          if (result && result.graphic && result.graphic.attributes) {
            const { id, stationName } = result.graphic.attributes
            navigateToVenueDetail(id, stationName)
          }
        }).catch((error) => {
          console.error('click hitTest失败:', error)
        })
      })
    }
  } catch (e) {
    console.error('渲染场景点位失败', e)
  }
}
</script>

<style scoped>
#mapContainer {
  width: 100vw;   /* 响应式宽度 */
  height: calc(100vh - 0.6rem); /* 100vh - 0.6rem(菜单栏高度，响应式) */
  position: relative;
}
/* 悬浮面板基础样式（参考 metrics） */
.floating-panel {
  position: absolute;
  top: 0.84rem;     /* 84px / 100 = 0.84rem，避开菜单栏 */
  bottom: 0.24rem;  /* 24px / 100 = 0.24rem，下边距响应式 */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;      /* 20px / 100 = 0.2rem，间距响应式 */
  overflow-y: auto;
}
.floating-panel.left-panel { left: 0.24rem; width: 5.6rem; } /* 24px 560px → rem */
.floating-panel.right-panel { right: 0.24rem; width: 5.6rem; } /* 24px 560px → rem */

.panel-container {
  background: linear-gradient( 180deg, rgba(0,40,96,0) 0%, rgba(0,42,95,0.09) 23%, rgba(0,42,97,0.24) 45%, rgba(0,40,96,0.27) 100%), linear-gradient( 180deg, rgba(16,98,222,0.12) 0%, rgba(17,96,219,0.11) 55%, rgba(19,98,215,0.05) 76%, rgba(0,95,223,0.03) 100%), rgba(0,15,42,0.7);
  border: 0.01rem solid rgba(74, 144, 226, 0.35);  /* 1px → rem */
  border-radius: 0.1rem;   /* 10px / 100 = 0.1rem，圆角响应式 */
  box-shadow: 0 0.08rem 0.24rem rgba(0, 0, 0, 0.38), inset 0 0.01rem 0 rgba(255, 255, 255, 0.1);  /* 0 8px 24px, 0 1px → rem */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-container.flex-1 { flex: 1; }
.panel-container.flex-2 { flex: 2; }
.panel-container.flex-3 { flex: 3; }
.panel-container .container-header {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(74, 144, 226, 0.1) 20%, 
    rgba(74, 144, 226, 0.3) 40%, 
    rgba(74, 144, 226, 0.6) 50%, 
    rgba(74, 144, 226, 0.3) 60%, 
    rgba(74, 144, 226, 0.1) 80%, 
    transparent 100%
  );
  color: white;
  display: flex;
  align-items: center;
  gap: 0.1rem;     /* 10px / 100 = 0.1rem，间距响应式 */
  padding: 0.08rem; /* 8px / 100 = 0.08rem，内边距响应式 */
  height: 0.28rem;  /* 28px / 100 = 0.28rem，高度响应式 */
  margin: 0.12rem;  /* 12px / 100 = 0.12rem，边距响应式 */
  border-bottom: 0.01rem solid rgba(255, 255, 255, 0.12);  /* 1px → rem */
  position: relative;
  z-index: 1;

  /* 添加一个额外的渐变层来增强效果 */
}

.panel-container .container-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(53, 122, 189, 0.1) 25%, 
    rgba(53, 122, 189, 0.4) 50%, 
    rgba(53, 122, 189, 0.1) 75%, 
    transparent 100%
  );
  pointer-events: none;
}

.panel-container .container-header .header-icon {
  width: 0.32rem;   /* 32px / 100 = 0.32rem，图标容器响应式 */
  height: 0.32rem;  /* 32px / 100 = 0.32rem */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.panel-container .container-header .header-icon .title-icon {
  width: 0.25rem;  /* 25px / 100 = 0.25rem，标题图标响应式 */
  height: 0.25rem; /* 25px / 100 = 0.25rem */
}

.panel-container .container-header h3 {
  margin: 0;
  font-family: 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
  font-weight: normal;
  font-size: 0.16rem;  /* 16px / 100 = 0.16rem，标题文字响应式 */
  color: #FFFFFF;
  text-shadow: 0px 0px 0.07rem rgba(75,180,229,0.69), 0px 0.02rem 0.08rem rgba(5,28,55,0.42);  /* 7px 2px 8px → rem */
  position: relative;
  z-index: 1;
}

.panel-container .container-content { padding: 0.12rem; flex: 1; overflow: auto; } /* 12px / 100 = 0.12rem，内边距响应式 */

/* 隐藏滚动条但保留滚动功能 */
.panel-container .container-content {
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none;    /* Firefox */
}
.panel-container .container-content::-webkit-scrollbar { /* Chrome/Safari */
  width: 0;
  height: 0;
}

.floating-panel {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.floating-panel::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 右侧两个面板上下平分可视高度 */
.right-panel { gap: 0.12rem; } /* 12px / 100 = 0.12rem，间距响应式 */
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { height: 100%; font-size: clamp(11px, 0.9vw, 15px); }  /* 表格容器字体大小 */

/* Element Plus组件字体大小设置 */
:deep(.el-empty) {
  font-size: clamp(12px, 1vw, 16px); /* 空状态字体大小 */
}
:deep(.el-empty__description) {
  font-size: clamp(11px, 0.9vw, 15px); /* 空状态描述字体大小 */
}
:deep(.el-table) {
  font-size: clamp(11px, 0.9vw, 15px); /* 表格字体大小 */
}
:deep(.el-table th),
:deep(.el-table td) {
  font-size: clamp(10px, 0.8vw, 14px); /* 表格单元格字体大小 */
}

/* 地图悬浮弹窗 */
.popup-overlay { 
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; 
  z-index: 1100; 
}
.venue-popup { 
  position: absolute;
  max-width: 3.6rem; /* 360px / 100 = 3.6rem，最大宽度响应式 */
  color: #e6f4ff; 
  pointer-events: none; 
}

.venue-popup__card {
  background: #004C8C;
  border: 0.01rem solid rgba(74, 144, 226, 0.45);  /* 1px → rem */
  border-radius: 0.12rem;  /* 12px / 100 = 0.12rem，圆角响应式 */
  padding: 0.12rem 0.14rem;  /* 12px 14px → rem，内边距响应式 */
  box-shadow: 0 0.14rem 0.34rem rgba(0,0,0,0.5), inset 0 0.01rem 0 rgba(255,255,255,0.08);  /* 0 14px 34px, 0 1px → rem */
}

.venue-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.1rem;     /* 10px / 100 = 0.1rem，间距响应式 */
  margin-bottom: 0.08rem;  /* 8px / 100 = 0.08rem，边距响应式 */
}
.venue-popup__title { font-weight: 800; font-size: clamp(12px, 1vw, 18px); letter-spacing: .2px; }  /* 15px → clamp */
.venue-popup__tags { display: flex; gap: 0.06rem; }  /* 6px / 100 = 0.06rem，间距响应式 */
.venue-popup__tags .tag {
  font-size: clamp(9px, 0.7vw, 13px);  /* 11px → clamp */
  padding: 0.02rem 0.08rem;  /* 2px 8px → rem */
  border: 0.01rem solid rgba(255,255,255,0.16);  /* 1px → rem */
  border-radius: 9.99rem;  /* 999px → rem */
  color: #cfe6ff;
}
.venue-popup__tags .tag--level { border-color: rgba(255,165,0,.5); color: #ffd28a; }

.venue-popup__meta { display: grid; grid-template-columns: 1fr; gap: 0.06rem; margin-bottom: 0.08rem; }  /* 6px 8px → rem */
.venue-popup__meta .meta-row { display: flex; justify-content: space-between; gap: 0.1rem; font-size: clamp(10px, 0.8vw, 14px); }  /* 10px 12px → clamp rem */
.venue-popup__meta .label { opacity: .8; color: #9dc6ff; }
.venue-popup__meta .value { color: #e6f4ff; }

.venue-popup__grid { display: grid; grid-template-columns: 1fr; gap: 0.08rem; }  /* 8px / 100 = 0.08rem */
.venue-popup__item { display: flex; flex-direction: column; gap: 0.06rem; background: rgba(255,255,255,0.04); border: 0.01rem solid rgba(255,255,255,0.08); border-radius: 0.08rem; padding: 0.08rem 0.1rem; }  /* 6px 1px 8px 8px 10px → rem */
.venue-popup__item .name { font-size: clamp(10px, 0.8vw, 14px); color: #cfe6ff; font-weight: 600; }  /* 12px → clamp */
.venue-popup__item .stats-wrap { display: flex; align-items: center; gap: 0.08rem; flex-wrap: wrap; }  /* 8px → rem */
.venue-popup__item .stats { font-size: clamp(10px, 0.8vw, 14px); border: 0.01rem solid rgba(255,255,255,0.16); border-radius: 9.99rem; padding: 0.02rem 0.08rem; }  /* 12px 1px 999px 2px 8px → clamp/rem */
.venue-popup__item .stats.alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.venue-popup__item .stats.normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.venue-popup__item .stats.total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

.venue-popup__arrow {
  width: 0; height: 0;
  border-left: 0.08rem solid transparent;   /* 8px → rem */
  border-right: 0.08rem solid transparent;  /* 8px → rem */
  border-top: 0.1rem solid rgba(10, 30, 60, 0.96);  /* 10px → rem */
  margin: 0.06rem auto 0;  /* 6px → rem */
}
.venue-popup__title { font-weight: 700; margin-bottom: 0.06rem; }  /* 6px → rem */
.venue-popup__meta { font-size: clamp(10px, 0.8vw, 14px); opacity: .9; margin-bottom: 0.06rem; }  /* 12px 6px → clamp rem */
.venue-popup__list { display: flex; flex-direction: column; gap: 0.06rem; }  /* 6px → rem */
.venue-popup__item { display: flex; align-items: center; justify-content: space-between; gap: 0.08rem; background: rgba(255,255,255,0.04); border: 0.01rem solid rgba(255,255,255,0.08); border-radius: 0.06rem; padding: 0.06rem 0.08rem; }  /* 8px 1px 6px 6px 8px → rem */
.venue-popup__item .name { font-size: clamp(10px, 0.8vw, 14px); color: #cfe6ff; font-weight: 600; }  /* 12px → clamp */
.venue-popup__item .stats { font-size: clamp(10px, 0.8vw, 14px); border: 0.01rem solid rgba(255,255,255,0.16); border-radius: 9.99rem; padding: 0.02rem 0.08rem; }  /* 12px 1px 999px 2px 8px → clamp/rem */
.venue-popup__item .stats.alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.venue-popup__item .stats.normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.venue-popup__item .stats.total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

.row-cards { display: flex; gap: 0.12rem; flex-wrap: wrap; }  /* 12px → rem */
.row-cards .metric-card {
  flex: 1 1 calc(50% - 0.06rem);  /* 6px → rem */
  min-width: 1.4rem;  /* 140px / 100 = 1.4rem */
  padding: 0.12rem 0.14rem;  /* 12px 14px → rem */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px → rem */
  border-radius: 0.08rem;  /* 8px → rem */
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  transition: all 0.3s ease;
}

.row-cards .metric-card:hover {
  transform: translateY(-0.02rem);  /* -2px → rem */
  box-shadow: 0 0.04rem 0.16rem rgba(74, 144, 226, 0.3);  /* 0 4px 16px → rem */
  border-color: rgba(74, 144, 226, 0.5);
}
.row-cards .metric-card .card-label { font-size: clamp(9px, 0.7vw, 13px); margin-bottom: 0.08rem; opacity: .85; color: #cfe6ff; }  /* 11px 8px → clamp rem */
.row-cards .metric-card .card-value { font-size: clamp(18px, 1.6vw, 26px); color: #fff; font-weight: 600; }  /* 22px → clamp */

/* 督导检查三卡横排一屏显示 */
.row-cards--three { flex-wrap: nowrap; }
.row-cards--three .metric-card { flex: 1 1 0; min-width: 0; }

/* 雨量分布布局 */
.rainfall-content { display: flex; gap: 0.12rem; }  /* 12px → rem */
.rainfall-map { flex: 1; min-height: 1.6rem; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 0.01rem solid rgba(255,255,255,0.08); border-radius: 0.08rem; }  /* 160px 1px 8px → rem */
.rainfall-map .map-placeholder { font-size: clamp(12px, 1vw, 16px); color: #a9c7f7; }  /* 地图占位符字体大小 */
.rainfall-legend { width: 1.6rem; display: flex; flex-direction: column; gap: 0.08rem; }  /* 160px 8px → rem */
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 0.08rem 0.1rem; background: rgba(255,255,255,0.04); border: 0.01rem solid rgba(255,255,255,0.08); border-radius: 0.06rem; }  /* 8px 10px 1px 6px → rem */
.rainfall-legend .legend-item.highlight { border-color: rgba(74, 144, 226, 0.45); }
.rainfall-legend .legend-label { font-size: clamp(10px, 0.8vw, 14px); color: #e6f4ff; }  /* 图例标签字体大小 */
.rainfall-legend .legend-count { font-size: clamp(10px, 0.8vw, 14px); color: #cfe6ff; }  /* 图例计数字体大小 */

/* 预警列表 */
.warning-list { display: flex; flex-direction: column; gap: 0.1rem; }  /* 10px → rem */
.warning-item { 
  display: flex; 
  align-items: stretch; 
  justify-content: space-between; 
  padding: 0.12rem 0.14rem;  /* 12px 14px → rem */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%); 
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px → rem */
  border-radius: 0.08rem;  /* 8px → rem */
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  transition: all 0.3s ease;
}

.warning-item:hover {
  transform: translateY(-0.02rem);  /* -2px → rem */
  box-shadow: 0 0.04rem 0.16rem rgba(74, 144, 226, 0.3);  /* 0 4px 16px → rem */
  border-color: rgba(74, 144, 226, 0.5);
}
.warning-main { display: flex; flex-direction: column; gap: 0.06rem; flex: 1; min-width: 0; }  /* 6px → rem */
.warning-title { font-size: clamp(13px, 1.1vw, 17px); font-weight: 600; color: #fff; }  /* 预警标题字体大小 */
.warning-message { font-size: clamp(11px, 0.9vw, 15px); color: #e6f4ff; opacity: .85; }  /* 预警消息字体大小 */
.warning-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.06rem; width: 1.4rem; flex: 0 0 auto; text-align: right; }  /* 6px 140px → rem */
.warning-meta .warning-tag { align-self: flex-end; }
.warning-meta .warning-time { align-self: flex-end; }
.warning-tag { font-size: clamp(9px, 0.7vw, 13px); padding: 0.02rem 0.08rem; border-radius: 9.99rem; border: 0.01rem solid rgba(255,255,255,0.18); color: #cfe6ff; }  /* 预警标签字体大小 */
.warning-time { font-size: clamp(10px, 0.8vw, 14px); color: #cfe6ff; opacity: .8; }  /* 预警时间字体大小 */

/* 预警等级颜色 */
.warning-tag.ORANGE_ALERT { border-color: rgba(255,165,0,.6); color: #ffd28a; }
.warning-tag.RED_ALERT { border-color: rgba(255,0,0,.6); color: #ff9c9c; }
.warning-tag.YELLOW_ALERT { border-color: rgba(255,215,0,.6); color: #ffe27a; }

/* 监测数据分组与行样式 */
.monitor-group { display: flex; flex-direction: column; gap: 0.12rem; margin-bottom: 0.16rem; }  /* 12px 16px → rem */
.group-title { font-size: clamp(14px, 1.1vw, 18px); color: #e6f4ff; font-weight: 700; letter-spacing: .3px; padding-bottom: 0.08rem; border-bottom: 0.01rem solid rgba(255,255,255,0.08); }  /* 16px 8px 1px → clamp rem */
.stats-row { display: flex; gap: 0.14rem; }  /* 14px → rem */
.stats-row .metric-card { flex: 1 1 0; padding: 0.18rem; min-height: 0.96rem; box-shadow: 0 0.1rem 0.24rem rgba(0,0,0,0.28), inset 0 0.01rem 0 rgba(255,255,255,0.08); }  /* 18px 96px 0 10px 24px 0 1px → rem */
.stats-row .metric-card .card-label { font-size: clamp(10px, 0.8vw, 14px); opacity: .9; }  /* 监测数据卡片标签字体大小 */
.stats-row .metric-card .card-value { font-size: clamp(24px, 2vw, 32px); }  /* 28px → clamp */
.metric-card--alarm { 
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px → rem */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  transition: all 0.3s ease;
}
.metric-card--alarm:hover {
  transform: translateY(-0.02rem);  /* -2px → rem */
  box-shadow: 0 0.04rem 0.16rem rgba(74, 144, 226, 0.3);  /* 0 4px 16px → rem */
  border-color: rgba(74, 144, 226, 0.5);
}
.metric-card--alarm .card-label { font-size: clamp(10px, 0.8vw, 14px); color: #ffb3b3; }  /* 报警卡片标签字体大小 */
.metric-card--alarm .card-value { font-size: clamp(20px, 1.8vw, 28px); color: #ff8f8f; }  /* 报警卡片值字体大小 */
.metric-card--normal { 
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px → rem */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  transition: all 0.3s ease;
}
.metric-card--normal:hover {
  transform: translateY(-0.02rem);  /* -2px → rem */
  box-shadow: 0 0.04rem 0.16rem rgba(74, 144, 226, 0.3);  /* 0 4px 16px → rem */
  border-color: rgba(74, 144, 226, 0.5);
}
.metric-card--normal .card-label { font-size: clamp(10px, 0.8vw, 14px); color: #b8f7c6; }  /* 正常卡片标签字体大小 */
.metric-card--normal .card-value { font-size: clamp(20px, 1.8vw, 28px); color: #9cf2b0; }  /* 正常卡片值字体大小 */

/* 重点场所列表样式 */
.venues-list { display: flex; flex-direction: column; gap: 0.12rem; }  /* 12px → rem */
.venue-card { 
  border: 0.01rem solid rgba(74, 144, 226, 0.3);   /* 1px → rem */
  border-radius: 0.1rem;   /* 10px / 100 = 0.1rem，圆角响应式 */
  padding: 0.12rem 0.14rem;  /* 12px 14px → rem，内边距响应式 */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%); 
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  transition: all 0.3s ease;
}

.venue-card:hover {
  transform: translateY(-0.02rem);  /* -2px → rem */
  box-shadow: 0 0.04rem 0.16rem rgba(74, 144, 226, 0.3);  /* 0 4px 16px → rem */
  border-color: rgba(74, 144, 226, 0.5);
}
.venue-header { display: flex; flex-direction: column; gap: 0.06rem; margin-bottom: 0.08rem; }  /* 6px 8px → rem */
.venue-title { font-size: clamp(13px, 1vw, 17px); color: #e6f4ff; font-weight: 700; }  /* 15px → clamp */
.venue-meta { font-size: clamp(10px, 0.8vw, 14px); color: rgba(207,230,255,.9); }  /* 12px → clamp */
.venue-meta__row { opacity: .9; }
.venue-datalist { display: flex; flex-direction: column; gap: 0.08rem; }  /* 8px → rem */
.venue-item { display: flex; align-items: center; justify-content: space-between; padding: 0.08rem 0.1rem; border: 0.01rem solid rgba(255,255,255,0.08); border-radius: 0.08rem; background: rgba(255,255,255,0.03); }  /* 8px 10px 1px 8px → rem */
.venue-item__name { font-size: clamp(11px, 0.9vw, 15px); color: #cfe6ff; font-weight: 600; }  /* 重点场所项目名称字体大小 */
.venue-item__stats { display: flex; align-items: center; gap: 0.08rem; }  /* 8px → rem */
.chip { padding: 0.02rem 0.1rem; border-radius: 9.99rem; font-size: clamp(10px, 0.8vw, 14px); border: 0.01rem solid rgba(255,255,255,0.16); color: #e6f4ff; }  /* 2px 10px 999px 12px 1px → clamp rem */
.chip--alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.chip--normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.chip--total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

/* 底部三项操作（复用 metrics 的样式） */
.bottom-actions {
  position: absolute;
  left: 9.6rem;  /* 960px / 100 = 9.6rem，居中定位响应式 */
  bottom: 0;     /* 贴合底部 */
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 0.4rem;   /* 40px / 100 = 0.4rem，间距响应式 */
  align-items: flex-end;
  padding: 0.35rem 0.36rem 0.15rem; /* 35px 36px 15px → rem，内边距响应式 */
}
.bottom-actions::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 6.86rem;  /* 686px / 100 = 6.86rem，宽度响应式 */
  height: 0.58rem;  /* 58px / 100 = 0.58rem，高度响应式 */
  background: linear-gradient(180deg, rgba(17, 50, 92, 0.72) 0%, rgba(10, 30, 60, 0.72) 100%);
  border: 0.01rem solid rgba(74, 144, 226, 0.35);  /* 1px → rem */
  border-bottom: none; /* 底部无边框，贴合底部 */
  box-shadow:
    0 0.1rem 0.26rem rgba(0, 0, 0, 0.45),  /* 0 10px 26px → rem */
    inset 0 0.01rem 0 rgba(255, 255, 255, 0.12);  /* 0 1px 0 → rem */
  /* 创建梯形：上边比下边窄 */
  clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
  backdrop-filter: blur(0.08rem);  /* 8px → rem */
  z-index: -1;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem; /* 12px / 100 = 0.12rem，间距响应式 */
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
}
.action-item:hover {
  transform: translateY(-0.04rem);  /* -4px / 100 = -0.04rem */
  filter: brightness(1.05);
}
.action-icon {
  width: 0.85rem;  /* 85px / 100 = 0.85rem，宽度响应式 */
  height: 0.75rem; /* 75px / 100 = 0.75rem，高度响应式 */
  padding-top: 0.08rem; /* 8px / 100 = 0.08rem，内边距响应式 */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.action-icon img {
  width: 0.85rem;  /* 85px / 100 = 0.85rem，图片宽度响应式 */
  height: 0.75rem; /* 75px / 100 = 0.75rem，图片高度响应式 */
  object-fit: contain;
  border-radius: 50%;
}
.action-label {
  color: #fff; /* 所有文字默认为白色 */
  font-size: clamp(12px, 1vw, 16px);  /* 14px → clamp，标签文字使用clamp确保可读性 */
  font-weight: 600;
  text-shadow: 0 0.02rem 0.06rem rgba(0, 0, 0, 0.6);  /* 0 2px 6px → rem */
}

.loading-placeholder {
  width: 0.4rem;   /* 40px / 100 = 0.4rem，宽度响应式 */
  height: 0.4rem;  /* 40px / 100 = 0.4rem，高度响应式 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a9c7f7;
  font-size: clamp(10px, 0.8vw, 14px);  /* 12px → clamp，文字响应式 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.08rem;  /* 8px / 100 = 0.08rem，圆角响应式 */
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px → rem */
}

/* 选中项文字颜色 */
.action-item.secure.active .action-label,
.action-item.manage.active .action-label,
.action-item.service.active .action-label {
  color: #F2C36C; /* 选中项使用金色 */
}

/* 移除原有的不同主题色标签，所有标签都使用白色 */
/* .action-item.secure .action-label { color: #ffd666; }
.action-item.manage .action-label { color: #c6ffdd; }
.action-item.service .action-label { color: #eac6ff; } */

@media (max-width: 768px) {
  .bottom-actions { gap: 0.24rem; bottom: 0.16rem; }  /* 24px 16px → rem */
  .action-icon { width: 0.76rem; height: 0.64rem; }  /* 76px 64px → rem */
  .bottom-actions::before { height: 0.7rem; }  /* 70px → rem */
}
@media (max-width: 480px) {
  .bottom-actions { gap: 0.16rem; bottom: 0.12rem; }  /* 16px 12px → rem */
  .action-icon { width: 0.68rem; height: 0.56rem; }  /* 68px 56px → rem */
  .action-label { font-size: clamp(11px, 0.9vw, 15px); }  /* 13px → clamp */
  .bottom-actions::before { height: 0.64rem; min-width: 4.8rem; }  /* 64px 480px → rem */
}
</style>


