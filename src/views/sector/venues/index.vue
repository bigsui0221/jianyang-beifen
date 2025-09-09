<template>
   <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />

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
        <div class="header-icon"></div>
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
        <div class="header-icon"></div>
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
        <div class="header-icon"></div>
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
          <div class="header-icon"></div>
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
          <div class="header-icon"></div>
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
            <div class="header-icon"></div>
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
          <div class="header-icon"></div>
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
            <div class="header-icon"></div>
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
            <div class="header-icon"></div>
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
    <div class="action-item secure" @click="venuesState.setScene('floodControl')">
      <div class="action-icon"><img :key="'flood-' + venuesState.sceneActive" :src="venuesState.sceneActive === 'floodControl' ? iconFloodActive : iconFlood" alt="防汛保障" /></div>
      <div class="action-label">防汛保障</div>
    </div>
    <div class="action-item manage" @click="venuesState.setScene('waterEnvironment')">
      <div class="action-icon"><img :key="'water-' + venuesState.sceneActive" :src="venuesState.sceneActive === 'waterEnvironment' ? iconWaterActive : iconWater" alt="水环境保障" /></div>
      <div class="action-label">水环境保障</div>
    </div>
    <div class="action-item service" @click="venuesState.setScene('waterSupplyDrainage')">
      <div class="action-icon"><img :key="'drain-' + venuesState.sceneActive" :src="venuesState.sceneActive === 'waterSupplyDrainage' ? iconDrainageActive : iconDrainage" alt="供排水保障" /></div>
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
const { active, setScene } = useVenuesScene()
const venuesState = reactive({
  get sceneActive() { return active.value },
  setScene
})
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
const loadingText = ref<string>('地图加载中...')
const handleSearch = () => {}

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
  
  // 添加地图移动监听，更新弹窗位置
  if (view) {
    view.watch('extent', () => {
      updateActivePopupPosition()
    })
    view.watch('rotation', () => {
      updateActivePopupPosition()
    })
    view.on('update', (event) => {
      if (event.viewpoint) {
        updateActivePopupPosition()
      }
    })
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
  isLoading.value = false;
};


// 按场景打印 MetricsVenuesAPI 数据
const logSceneData = async (scene: 'floodControl' | 'waterEnvironment' | 'waterSupplyDrainage') => {
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
        renderMarkersForScene('floodControl')
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
  } catch (err) {
    console.error('[Venues] 获取场景数据失败:', err)
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
 
  
  // 设置活跃弹窗ID，Vue会自动处理显示/隐藏
  activePopupId.value = id
  
  // 延迟计算位置，确保地图渲染完成
  setTimeout(() => {
   
    
    if (popupEl) {
      const venue = venuesKeyVenues.value.find(v => v.id === id)
      if (venue && venue.longitude && venue.latitude && mapView.value) {
        try {
          // 强制触发地图重绘
          mapView.value.when(() => {
            const screenPoint = mapView.value.toScreen({
              longitude: venue.longitude,
              latitude: venue.latitude,
              spatialReference: { wkid: 4326 }
            })
            
            if (screenPoint && screenPoint.x !== undefined && screenPoint.y !== undefined) {
              // 最简单直接的定位方式
              // icon尺寸是32x36，所以icon中心点需要向上偏移18px (36/2)
              const iconHeight = 36
              const iconCenterY = screenPoint.y - (iconHeight / 2)
              
              // 获取弹窗尺寸
              popupEl.style.visibility = 'hidden'
              popupEl.style.display = 'block'
              const popupWidth = popupEl.offsetWidth
              const popupHeight = popupEl.offsetHeight
              popupEl.style.visibility = 'visible'
              
              // 计算位置：弹窗底部贴近icon顶部
              const finalX = screenPoint.x - (popupWidth / 2)
              const finalY = iconCenterY - (iconHeight / 2) - popupHeight - 5
              
              popupEl.style.transform = 'none'
              popupEl.style.left = `${Math.round(finalX)}px`
              popupEl.style.top = `${Math.round(finalY)}px`
      
            }
          })
        } catch (error) {
      
        }
      }
    }
  }, 100)
}

const hideVenuePopup = () => {

  activePopupId.value = null
}

// 更新活跃弹窗位置（地图移动时调用）
const updateActivePopupPosition = () => {
  if (activePopupId.value && mapView.value) {
    const popupEl = venuePopupMap.get(activePopupId.value)
    const venue = venuesKeyVenues.value.find(v => v.id === activePopupId.value)
    
    if (popupEl && venue && venue.longitude && venue.latitude) {
      try {
        const screenPoint = mapView.value.toScreen({
          longitude: venue.longitude,
          latitude: venue.latitude,
          spatialReference: { wkid: 4326 }
        })
        
        if (screenPoint && screenPoint.x !== undefined && screenPoint.y !== undefined) {
          // 与显示逻辑保持一致
          const iconHeight = 36
          const iconCenterY = screenPoint.y - (iconHeight / 2)
          const popupWidth = popupEl.offsetWidth
          const popupHeight = popupEl.offsetHeight
          
          const finalX = screenPoint.x - (popupWidth / 2)
          const finalY = iconCenterY - (iconHeight / 2) - popupHeight - 5
          
          popupEl.style.transform = 'none'
          popupEl.style.left = `${Math.round(finalX)}px`
          popupEl.style.top = `${Math.round(finalY)}px`
        }
      } catch (error) {
 
      }
    }
  }
}


// 路由跳转：根据当前场景跳到对应子路由并携带 id 和 stationName（使用 query，避免未在 path 中声明的 params 被丢弃）
const router = useRouter()
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
  await logSceneData(venuesState.sceneActive)
  updateLayersVisibility()
  renderMarkersForScene(venuesState.sceneActive)
})

// 监听场景切换并打印数据
watch(() => venuesState.sceneActive, (scene) => {
  updateLayersVisibility()
  logSceneData(scene as any)
  renderMarkersForScene(scene as any)
})

// 组件销毁时清理事件监听器
onUnmounted(() => {
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
    renderMarkersForScene('floodControl')
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
const renderMarkersForScene = (scene?: 'floodControl' | 'waterEnvironment' | 'waterSupplyDrainage') => {
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
        // 使用MapView的hitTest方法，传入事件的屏幕坐标
        mapView.value.hitTest(event).then((response) => {
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
        mapView.value.hitTest(event).then((response) => {
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
  width: 100%;
  height: calc(100vh - 56px);
  position: relative;
}
/* 悬浮面板基础样式（参考 metrics） */
.floating-panel {
  position: absolute;
  top: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px);
  overflow-y: auto;
}
.floating-panel.left-panel { left: 20px; width: 560px; }
.floating-panel.right-panel { right: 20px; width: 560px; }

.panel-container {
  background: linear-gradient(180deg, rgba(17, 50, 92, 0.65) 0%, rgba(10, 30, 60, 0.6) 100%);
  border: 1px solid rgba(74, 144, 226, 0.35);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-container.flex-1 { flex: 1; }
.panel-container.flex-2 { flex: 2; }
.panel-container.flex-3 { flex: 3; }
.panel-container .container-header {
  padding: 12px 14px;
  color: #e6f4ff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(90deg, rgba(53, 122, 189, 0.22) 0%, rgba(53, 122, 189, 0.12) 60%, transparent 100%);
}
.panel-container .container-content { padding: 12px; flex: 1; overflow: auto; }

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
.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { height: 100%; }

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
  max-width: 360px; 
  color: #e6f4ff; 
  pointer-events: none; 
}

.venue-popup__card {
  background: linear-gradient(180deg, rgba(10, 30, 60, 0.96) 0%, rgba(8, 24, 50, 0.96) 100%);
  border: 1px solid rgba(74, 144, 226, 0.45);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 14px 34px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
}

.venue-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.venue-popup__title { font-weight: 800; font-size: 15px; letter-spacing: .2px; }
.venue-popup__tags { display: flex; gap: 6px; }
.venue-popup__tags .tag {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 999px;
  color: #cfe6ff;
}
.venue-popup__tags .tag--level { border-color: rgba(255,165,0,.5); color: #ffd28a; }

.venue-popup__meta { display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 8px; }
.venue-popup__meta .meta-row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; }
.venue-popup__meta .label { opacity: .8; color: #9dc6ff; }
.venue-popup__meta .value { color: #e6f4ff; }

.venue-popup__grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.venue-popup__item { display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; }
.venue-popup__item .name { font-size: 12px; color: #cfe6ff; font-weight: 600; }
.venue-popup__item .stats-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.venue-popup__item .stats { font-size: 12px; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 2px 8px; }
.venue-popup__item .stats.alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.venue-popup__item .stats.normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.venue-popup__item .stats.total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

.venue-popup__arrow {
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid rgba(10, 30, 60, 0.96);
  margin: 6px auto 0;
}
.venue-popup__title { font-weight: 700; margin-bottom: 6px; }
.venue-popup__meta { font-size: 12px; opacity: .9; margin-bottom: 6px; }
.venue-popup__list { display: flex; flex-direction: column; gap: 6px; }
.venue-popup__item { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px; }
.venue-popup__item .name { font-size: 12px; color: #cfe6ff; font-weight: 600; }
.venue-popup__item .stats { font-size: 12px; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 2px 8px; }
.venue-popup__item .stats.alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.venue-popup__item .stats.normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.venue-popup__item .stats.total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

.row-cards { display: flex; gap: 12px; flex-wrap: wrap; }
.row-cards .metric-card {
  flex: 1 1 calc(50% - 6px);
  min-width: 140px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.row-cards .metric-card .card-label { font-size: 11px; margin-bottom: 8px; opacity: .85; color: #cfe6ff; }
.row-cards .metric-card .card-value { font-size: 22px; color: #fff; font-weight: 600; }

/* 督导检查三卡横排一屏显示 */
.row-cards--three { flex-wrap: nowrap; }
.row-cards--three .metric-card { flex: 1 1 0; min-width: 0; }

/* 雨量分布布局 */
.rainfall-content { display: flex; gap: 12px; }
.rainfall-map { flex: 1; min-height: 160px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.rainfall-legend { width: 160px; display: flex; flex-direction: column; gap: 8px; }
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }
.rainfall-legend .legend-item.highlight { border-color: rgba(74, 144, 226, 0.45); }

/* 预警列表 */
.warning-list { display: flex; flex-direction: column; gap: 10px; }
.warning-item { display: flex; align-items: stretch; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.warning-main { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.warning-title { font-weight: 600; color: #fff; }
.warning-message { color: #e6f4ff; opacity: .85; }
.warning-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; width: 140px; flex: 0 0 auto; text-align: right; }
.warning-meta .warning-tag { align-self: flex-end; }
.warning-meta .warning-time { align-self: flex-end; }
.warning-tag { padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); color: #cfe6ff; }
.warning-time { color: #cfe6ff; opacity: .8; }

/* 预警等级颜色 */
.warning-tag.ORANGE_ALERT { border-color: rgba(255,165,0,.6); color: #ffd28a; }
.warning-tag.RED_ALERT { border-color: rgba(255,0,0,.6); color: #ff9c9c; }
.warning-tag.YELLOW_ALERT { border-color: rgba(255,215,0,.6); color: #ffe27a; }

/* 监测数据分组与行样式 */
.monitor-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.group-title { font-size: 16px; color: #e6f4ff; font-weight: 700; letter-spacing: .3px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.stats-row { display: flex; gap: 14px; }
.stats-row .metric-card { flex: 1 1 0; padding: 18px; min-height: 96px; box-shadow: 0 10px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08); }
.stats-row .metric-card .card-label { opacity: .9; }
.stats-row .metric-card .card-value { font-size: 28px; }
.metric-card--alarm { border-color: rgba(255, 99, 99, 0.45); background: linear-gradient(180deg, rgba(255, 99, 99, 0.18) 0%, rgba(255, 99, 99, 0.08) 100%); box-shadow: 0 12px 28px rgba(255, 99, 99, 0.15), inset 0 1px 0 rgba(255,255,255,0.06); }
.metric-card--alarm .card-label { color: #ffb3b3; }
.metric-card--alarm .card-value { color: #ff8f8f; text-shadow: 0 2px 10px rgba(255, 99, 99, 0.25); }
.metric-card--normal { border-color: rgba(76, 217, 100, 0.45); background: linear-gradient(180deg, rgba(76, 217, 100, 0.18) 0%, rgba(76, 217, 100, 0.08) 100%); box-shadow: 0 12px 28px rgba(76, 217, 100, 0.15), inset 0 1px 0 rgba(255,255,255,0.06); }
.metric-card--normal .card-label { color: #b8f7c6; }
.metric-card--normal .card-value { color: #9cf2b0; text-shadow: 0 2px 10px rgba(76, 217, 100, 0.25); }

/* 重点场所列表样式 */
.venues-list { display: flex; flex-direction: column; gap: 12px; }
.venue-card { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; background: rgba(255,255,255,0.04); box-shadow: 0 6px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06); }
.venue-header { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.venue-title { font-size: 15px; color: #e6f4ff; font-weight: 700; }
.venue-meta { font-size: 12px; color: rgba(207,230,255,.9); }
.venue-meta__row { opacity: .9; }
.venue-datalist { display: flex; flex-direction: column; gap: 8px; }
.venue-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: rgba(255,255,255,0.03); }
.venue-item__name { color: #cfe6ff; font-weight: 600; }
.venue-item__stats { display: flex; align-items: center; gap: 8px; }
.chip { padding: 2px 10px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(255,255,255,0.16); color: #e6f4ff; }
.chip--alarm { border-color: rgba(255, 99, 99, 0.45); color: #ffb3b3; }
.chip--normal { border-color: rgba(76, 217, 100, 0.45); color: #b8f7c6; }
.chip--total { border-color: rgba(74, 144, 226, 0.45); color: #cfe6ff; }

/* 底部三项操作（复用 metrics 的样式） */
.bottom-actions {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 40px;
  align-items: flex-end;
  padding: 18px 36px 12px;
}
.bottom-actions::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(1000px, 80vw);
  min-width: 560px;
  height: 78px;
  background: linear-gradient(180deg, rgba(17, 50, 92, 0.72) 0%, rgba(10, 30, 60, 0.72) 100%);
  border: 1px solid rgba(74, 144, 226, 0.35);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  backdrop-filter: blur(8px);
  z-index: -1;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
}
.action-item:hover {
  transform: translateY(-4px);
  filter: brightness(1.05);
}
.action-icon {
  width: 88px;
  height: 72px;
  padding-top: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.action-icon img {
  width: 84px;
  height: 78px;
  object-fit: contain;
  border-radius: 50%;
}
.action-label {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}
.action-item.secure .action-label { color: #ffd666; }
.action-item.manage .action-label { color: #c6ffdd; }
.action-item.service .action-label { color: #eac6ff; }

@media (max-width: 768px) {
  .bottom-actions { gap: 24px; bottom: 16px; }
  .action-icon { width: 76px; height: 64px; }
  .bottom-actions::before { height: 70px; }
}
@media (max-width: 480px) {
  .bottom-actions { gap: 16px; bottom: 12px; }
  .action-icon { width: 68px; height: 56px; }
  .action-label { font-size: 13px; }
  .bottom-actions::before { height: 64px; min-width: 480px; }
}
</style>


