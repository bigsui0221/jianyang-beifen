<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>

  <!-- 左侧悬浮区域（占位版） -->
  <div class="floating-panel left-panel">
    <div class="left-panel-header" @click="goBack">
      <span class="back-arrow">←</span>
      <span class="header-title">{{ (route.query.stationName as string) || (route.params.stationName as string) || 'XXXX重点场所' }}</span>
    </div>
    <div class="panel-container">
      <div class="container-header"><img class="header-icon" :src="icons.rain" alt="" /><h3>雨情检测</h3></div>
      <div class="container-content">
        <div v-if="rainTableData.length" class="table-wrapper">
          <el-table :data="rainTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="160" />
            <el-table-column prop="areaName" label="区域" width="120" />
            <el-table-column prop="todayCumulative" label="当日累计(mm)" width="130" />
            <el-table-column label="雨量等级" width="120">
              <template #default="{ row }">{{ row.rainLevel?.desc || '-' }}</template>
            </el-table-column>
            <el-table-column prop="longitude" label="经度" width="140" />
            <el-table-column prop="latitude" label="纬度" width="140" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </div>
    <div class="panel-container">
      <div class="container-header"><img class="header-icon" :src="icons.tunnel" alt="" /><h3>隧道水位监测</h3></div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three" v-if="tunnelSummary.totalNum != null">
          <div class="metric-card">
            <div class="card-label">监测总数</div>
            <div class="card-value">{{ tunnelSummary.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警示</div>
            <div class="card-value">{{ tunnelSummary.warningNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警戒</div>
            <div class="card-value">{{ tunnelSummary.alertNum ?? '-' }}</div>
          </div>
        </div>
        <div v-if="tunnelTableData.length" class="table-wrapper">
          <el-table :data="tunnelTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="160" />
            <el-table-column prop="waterLevel" label="水位(m)" width="120" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">{{ row.waterStatus?.desc || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </div>
    <div class="panel-container">
      <div class="container-header"><img class="header-icon" :src="icons.river" alt="" /><h3>河道水位监测</h3></div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three" v-if="riverSummary.totalNum != null">
          <div class="metric-card">
            <div class="card-label">监测总数</div>
            <div class="card-value">{{ riverSummary.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警示</div>
            <div class="card-value">{{ riverSummary.warningNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警戒</div>
            <div class="card-value">{{ riverSummary.alertNum ?? '-' }}</div>
          </div>
        </div>
        <div v-if="riverTableData.length" class="table-wrapper">
          <el-table :data="riverTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="140" />
            <el-table-column prop="riverName" label="河道" width="140" />
            <el-table-column prop="waterLevel" label="水位(m)" width="120" />
            <el-table-column prop="traffic" label="流量" width="100" />
            <el-table-column label="采集时间" min-width="160">
              <template #default="{ row }">{{ row.collectionTime ? new Date(row.collectionTime).toLocaleString() : '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </div>
    <div class="panel-container">
      <div class="container-header"><img class="header-icon" :src="icons.flood" alt="" /><h3>内涝水位监测</h3></div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three" v-if="floodSummary.totalNum != null">
          <div class="metric-card">
            <div class="card-label">监测总数</div>
            <div class="card-value">{{ floodSummary.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警示</div>
            <div class="card-value">{{ floodSummary.warningNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超警戒</div>
            <div class="card-value">{{ floodSummary.alertNum ?? '-' }}</div>
          </div>
        </div>
        <div v-if="floodTableData.length" class="table-wrapper">
          <el-table :data="floodTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="160" />
            <el-table-column prop="waterLevel" label="水位(m)" width="120" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">{{ row.waterStatus?.desc || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧悬浮区域 -->
  <div class="floating-panel right-panel">
    <div class="panel-container" v-if="activeDetail">
      <div class="container-header">
        <h3>{{ detailTitle }}（{{ detailStationName || '-' }}）</h3>
        <el-button size="small" type="info" plain @click="clearDetailPanel">关闭</el-button>
      </div>
      <div class="container-content right-panel--detail">
        
        <!-- 雨情详情 -->
        <template v-if="activeDetail === 'rain' && rainDetail">
          <div class="detail-meta">
            <div class="meta-row"><span class="label">监测点</span><span class="value">{{ rainDetail.stationName || '-' }}</span></div>
            <div class="meta-row"><span class="label">区域</span><span class="value">{{ rainDetail.areaName || '-' }}</span></div>
            <div class="meta-row"><span class="label">河道</span><span class="value">{{ rainDetail.riverName || '-' }}</span></div>
          </div>
          <div class="metric-cards row-cards row-cards--three">
            <div class="metric-card">
              <div class="card-label">当日累计(mm)</div>
              <div class="card-value">{{ rainDetail.todayCumulative ?? '-' }}</div>
            </div>
            <div class="metric-card">
              <div class="card-label">小时雨量(mm)</div>
              <div class="card-value">{{ rainDetail.hourRain ?? '-' }}</div>
            </div>
            <div class="metric-card">
              <div class="card-label">实时雨量(mm)</div>
              <div class="card-value">{{ rainDetail.realtimeRain ?? '-' }}</div>
            </div>
          </div>
          <div class="chart-wrapper" v-if="rainChartOptions">
            <EChart :options="rainChartOptions" width="100%" height="100%" />
          </div>
        </template>

        <!-- 隧道详情 -->
        <template v-if="activeDetail === 'tunnel' && tunnelDetail">
          <div class="detail-meta">
            <div class="meta-row"><span class="label">监测点</span><span class="value">{{ tunnelDetail.stationName || '-' }}</span></div>
            <div class="meta-row"><span class="label">地址</span><span class="value">{{ tunnelDetail.address || '-' }}</span></div>
          </div>
          <div class="metric-cards row-cards row-cards--three">
            <div class="metric-card">
              <div class="card-label">警示阈值(m)</div>
              <div class="card-value">{{ tunnelDetail.warningValue ?? '-' }}</div>
            </div>
            <div class="metric-card">
              <div class="card-label">警戒阈值(m)</div>
              <div class="card-value">{{ tunnelDetail.alertValue ?? '-' }}</div>
            </div>
            <div class="metric-card" v-if="(tunnelRecordList?.length ?? 0) > 0">
              <div class="card-label">当前液位(m)</div>
              <div class="card-value">{{ tunnelRecordList[0]?.liquidLevel ?? '-' }}</div>
            </div>
          </div>
          <div class="chart-wrapper" v-if="tunnelChartOptions">
            <EChart :options="tunnelChartOptions" width="100%" height="100%" />
          </div>
          <div v-if="tunnelRecordList?.length" class="table-wrapper" style="margin-top: 6px;">
            <el-table :data="tunnelRecordList" height="100%" stripe border>
              <el-table-column prop="collectionTime" label="采集时间" min-width="160" />
              <el-table-column prop="liquidLevel" label="液位(m)" width="120" />
              <el-table-column label="报警等级" width="120">
                <template #default="{ row }">{{ row.alarmLevel?.desc || '-' }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <!-- 河道详情 -->
        <template v-if="activeDetail === 'river' && riverDetail">
          <div class="detail-meta">
            <div class="meta-row"><span class="label">监测点</span><span class="value">{{ riverDetail.stationName || '-' }}</span></div>
            <div class="meta-row"><span class="label">区域</span><span class="value">{{ riverDetail.areaName || '-' }}</span></div>
            <div class="meta-row"><span class="label">河道</span><span class="value">{{ riverDetail.riverName || riverDetail.belongRiverName || '-' }}</span></div>
            <div class="meta-row"><span class="label">地址</span><span class="value">{{ riverDetail.address || '-' }}</span></div>
          </div>
          <div class="metric-cards row-cards row-cards--three">
            <div class="metric-card">
              <div class="card-label">警戒阈值(m)</div>
              <div class="card-value">{{ riverDetail.alertValue ?? '-' }}</div>
            </div>
            <div class="metric-card">
              <div class="card-label">警示阈值(m)</div>
              <div class="card-value">{{ riverDetail.warningValue ?? '-' }}</div>
            </div>
            <div class="metric-card" v-if="(riverRecordList?.length ?? 0) > 0">
              <div class="card-label">当前水位(m)</div>
              <div class="card-value">{{ riverRecordList[0]?.waterLevel ?? '-' }}</div>
            </div>
          </div>
          <div class="chart-wrapper" v-if="riverChartOptions">
            <EChart :options="riverChartOptions" width="100%" height="100%" />
          </div>
          <div v-if="riverRecordList?.length" class="table-wrapper" style="margin-top: 6px;">
            <el-table :data="riverRecordList" height="100%" stripe border>
              <el-table-column prop="collectionTime" label="采集时间" min-width="160" />
              <el-table-column prop="waterLevel" label="水位(m)" width="120" />
              <el-table-column prop="traffic" label="流量" width="100" />
              <el-table-column prop="alertValue" label="警戒阈值(m)" width="120" />
              <el-table-column prop="warningValue" label="警示阈值(m)" width="120" />
            </el-table>
          </div>
        </template>

        <!-- 内涝详情 -->
        <template v-if="activeDetail === 'flood' && floodDetail">
          <div class="detail-meta">
            <div class="meta-row"><span class="label">监测点</span><span class="value">{{ floodDetail.stationName || '-' }}</span></div>
            <div class="meta-row"><span class="label">地址</span><span class="value">{{ floodDetail.address || '-' }}</span></div>
          </div>
          <div class="metric-cards row-cards row-cards--three">
            <div class="metric-card">
              <div class="card-label">警示阈值(m)</div>
              <div class="card-value">{{ floodDetail.warningValue ?? '-' }}</div>
            </div>
            <div class="metric-card">
              <div class="card-label">警戒阈值(m)</div>
              <div class="card-value">{{ floodDetail.alertValue ?? '-' }}</div>
            </div>
            <div class="metric-card" v-if="(floodRecordList?.length ?? 0) > 0">
              <div class="card-label">当前液位(m)</div>
              <div class="card-value">{{ floodRecordList[0]?.liquidLevel ?? floodRecordList[0]?.waterLevel ?? '-' }}</div>
            </div>
          </div>
          <div class="chart-wrapper" v-if="floodChartOptions">
            <EChart :options="floodChartOptions" width="100%" height="100%" />
          </div>
          <div v-if="floodRecordList?.length" class="table-wrapper" style="margin-top: 6px;">
            <el-table :data="floodRecordList" height="100%" stripe border>
              <el-table-column prop="collectionTime" label="采集时间" min-width="160" />
              <el-table-column label="液位(m)" width="120">
                <template #default="{ row }">{{ row.liquidLevel ?? row.waterLevel ?? '-' }}</template>
              </el-table-column>
              <el-table-column prop="alertValue" label="警戒阈值(m)" width="120" />
              <el-table-column prop="warningValue" label="警示阈值(m)" width="120" />
              <el-table-column label="报警等级" width="120">
                <template #default="{ row }">{{ row.alarmLevel?.desc || row.alarmLevel || '-' }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>

      </div>
    </div>
    <div class="panel-container empty-state" v-else>
      <div class="container-content">
        <div class="empty-hint">
          <div class="hint-icon">📍</div>
          <div class="hint-text">点击地图上的监测点查看详情</div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted, onUnmounted, computed } from 'vue'
import { initGisMap, esriModules, createMarkerGraphic, createMarkerPopup, updateAllPopupPositions, popups } from '@/utils/gis'
import { useRouter, useRoute } from 'vue-router'
import EChart from '@/components/Echart/src/Echart.vue'
import { FloodControlAPI } from '@/api/sector/metrics'
import rainPng from '@/assets/imgs/sector/雨量.png'
import tunnelPng from '@/assets/imgs/sector/下穿隧道.png'
import floodPng from '@/assets/imgs/sector/内涝点.png'
import riverPng from '@/assets/imgs/sector/河道水情.png'

const gisMap = shallowRef<any>(null)
const mapView = shallowRef<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const router = useRouter()
const route = useRoute()
const goBack = () => {
  router.push({ name: 'Venues' })
}

const rainTableData = ref<any[]>([])
const tunnelSummary = ref<{ totalNum?: number; warningNum?: number; alertNum?: number }>({})
const tunnelTableData = ref<any[]>([])
const riverSummary = ref<{ totalNum?: number; warningNum?: number; alertNum?: number }>({})
const riverTableData = ref<any[]>([])
const floodSummary = ref<{ totalNum?: number; warningNum?: number; alertNum?: number }>({})
const floodTableData = ref<any[]>([])
const rainDetail = ref<any | null>(null)
const rainChartOptions = ref<any | null>(null)
const tunnelDetail = ref<any | null>(null)
const tunnelRecordList = ref<any[]>([])
const tunnelChartOptions = ref<any | null>(null)
const riverDetail = ref<any | null>(null)
const riverRecordList = ref<any[]>([])
const riverChartOptions = ref<any | null>(null)
const floodDetail = ref<any | null>(null)
const floodRecordList = ref<any[]>([])
const floodChartOptions = ref<any | null>(null)
const activeDetail = ref<'rain' | 'river' | 'tunnel' | 'flood' | null>(null)
const detailTitle = computed(() => {
  switch (activeDetail.value) {
    case 'flood': return '内涝详情'
    case 'tunnel': return '隧道详情'
    case 'river': return '河道详情'
    case 'rain': return '雨情详情'
    default: return '详情'
  }
})
const detailStationName = computed(() => {
  switch (activeDetail.value) {
    case 'flood': return floodDetail.value?.stationName ?? ''
    case 'tunnel': return tunnelDetail.value?.stationName ?? ''
    case 'river': return riverDetail.value?.stationName ?? ''
    case 'rain': return rainDetail.value?.stationName ?? ''
    default: return ''
  }
})

// 图层引用
const rainLayer = shallowRef<any>(null)
const tunnelLayer = shallowRef<any>(null)
const riverLayer = shallowRef<any>(null)
const floodLayer = shallowRef<any>(null)

const ensureLayers = () => {
  if (!gisMap.value || !esriModules) return
  if (!rainLayer.value) {
    rainLayer.value = new esriModules.GraphicsLayer({ id: 'rain-layer' })
    gisMap.value.add(rainLayer.value)
  }
  if (!tunnelLayer.value) {
    tunnelLayer.value = new esriModules.GraphicsLayer({ id: 'tunnel-layer' })
    gisMap.value.add(tunnelLayer.value)
  }
  if (!riverLayer.value) {
    riverLayer.value = new esriModules.GraphicsLayer({ id: 'river-layer' })
    gisMap.value.add(riverLayer.value)
  }
  if (!floodLayer.value) {
    floodLayer.value = new esriModules.GraphicsLayer({ id: 'flood-layer' })
    gisMap.value.add(floodLayer.value)
  }
}

const renderPoints = (layerRef: any, list: any[], iconUrl: string, category: 'rain' | 'tunnel' | 'river' | 'flood') => {
  if (!layerRef?.value) return
  layerRef.value.removeAll()
  if (!Array.isArray(list) || !list.length) return
  const graphics: any[] = []
  for (const item of list) {
    const lon = item?.longitude ?? item?.lon ?? item?.lng
    const lat = item?.latitude ?? item?.lat
    if (lon == null || lat == null) continue
    const g = createMarkerGraphic(
      [lon, lat],
      iconUrl,
      { id: item.id, stationName: item.stationName, category },
      { width: 26, height: 30 }
    )
    if (g) graphics.push(g)
  }
  if (graphics.length) layerRef.value.addMany(graphics)
}

// 简易名称弹窗管理
const popupDomList: HTMLElement[] = []
const cleanupPopups = () => {
  try { popupDomList.forEach((el) => el?.remove?.()) } catch {}
  popupDomList.length = 0
  try { (popups as any).length = 0 } catch {}
}
const renderNamePopups = (list: any[]) => {
  if (!Array.isArray(list) || !list.length) return
  const container = mapView.value?.container
  if (!container) return
  for (const item of list) {
    const lon = item?.longitude ?? item?.lon ?? item?.lng
    const lat = item?.latitude ?? item?.lat
    if (lon == null || lat == null) continue
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.transform = 'translate(-50%, -100%)'
    el.style.pointerEvents = 'auto'
    el.style.zIndex = '800'
    el.style.display = 'none'
    el.style.background = 'rgba(0,0,0,0.75)'
    el.style.color = '#fff'
    el.style.padding = '6px 8px'
    el.style.border = '1px solid rgba(255,255,255,0.2)'
    el.style.borderRadius = '6px'
    el.style.fontSize = '12px'
    el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">${item?.stationName ?? '-'}</div>`
    container.appendChild(el)
    popupDomList.push(el)
    createMarkerPopup(el, [lon, lat])
    el.style.display = 'block'
  }
}

const normalizeRainData = (res: any): any[] => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.list)) return res.data.list
  return []
}

const centerOnPoint = (row: any) => {
  const lon = row?.longitude ?? row?.lon ?? row?.lng
  const lat = row?.latitude ?? row?.lat
  if (!mapView.value || lon == null || lat == null) return
  try {
    mapView.value.goTo({ center: [lon, lat], zoom: 14 })
  } catch (e) {
    console.warn('[FloodControl] 地图定位失败', e)
  }
}

// 清理详情面板数据
const clearDetailPanel = () => {
  activeDetail.value = null
  rainDetail.value = null
  rainChartOptions.value = null
  tunnelDetail.value = null
  tunnelRecordList.value = []
  tunnelChartOptions.value = null
  riverDetail.value = null
  riverRecordList.value = []
  riverChartOptions.value = null
  floodDetail.value = null
  floodRecordList.value = []
  floodChartOptions.value = null
}

// 清理旧数据并设置新的活动详情类型
const setActiveDetail = (type: 'rain' | 'tunnel' | 'river' | 'flood') => {
  clearDetailPanel()
  activeDetail.value = type
}

const icons = {
  rain: rainPng,
  tunnel: tunnelPng,
  flood: floodPng,
  river: riverPng
}

const fetchDetailData = async () => {
  const idParam = route.params.id
  const id = Number(idParam)
  if (!id) {
    console.warn('[FloodControl] 无效的路由参数 id:', idParam)
    return
  }
  try {
    const [floodRes, rainRes, riverRes, routeRes, tunnelRes] = await Promise.all([
      FloodControlAPI.getInnerFloodWaterLevelMonitor(id),
      FloodControlAPI.getRainfallMonitor(id),
      FloodControlAPI.getRiverWaterLevelMonitor(id),
      FloodControlAPI.getAssociatedRouteDetail(id),
      FloodControlAPI.getTunnelWaterLevelMonitor(id)
    ])
    // 确保图层已创建再开始渲染任意点位
    ensureLayers()
    console.log('[FloodControl] 内涝水位监测(getFloodMonitor):', floodRes)
    // 解析内涝数据
    const floodData = floodRes?.data ?? floodRes
    floodSummary.value = {
      totalNum: floodData?.totalNum,
      warningNum: floodData?.warningNum,
      alertNum: floodData?.alertNum
    }
    floodTableData.value = Array.isArray(floodData?.waterLevelList) ? floodData.waterLevelList : []
    renderPoints(floodLayer, floodTableData.value, icons.flood, 'flood')
    renderNamePopups(floodTableData.value)
    console.log('[FloodControl] 雨情监测(getRainMonitor):', rainRes)
    rainTableData.value = normalizeRainData(rainRes)
    ensureLayers()
    renderPoints(rainLayer, rainTableData.value, icons.rain, 'rain')
    renderNamePopups(rainTableData.value)
    console.log('[FloodControl] 河道水位监测(getRiverMonitor):', riverRes)
    // 解析河道数据
    const riverData = riverRes?.data ?? riverRes
    riverSummary.value = {
      totalNum: riverData?.totalNum,
      warningNum: riverData?.warningNum,
      alertNum: riverData?.alertNum
    }
    riverTableData.value = Array.isArray(riverData?.waterLevelList) ? riverData.waterLevelList : []
    renderPoints(riverLayer, riverTableData.value, icons.river, 'river')
    renderNamePopups(riverTableData.value)
    console.log('[FloodControl] 关联路线详情(getRouteDetail):', routeRes)
    console.log('[FloodControl] 隧道水位监测(getTunnelMonitor):', tunnelRes)
    // 解析隧道数据
    const tunnelData = tunnelRes?.data ?? tunnelRes
    tunnelSummary.value = {
      totalNum: tunnelData?.totalNum,
      warningNum: tunnelData?.warningNum,
      alertNum: tunnelData?.alertNum
    }
    tunnelTableData.value = Array.isArray(tunnelData?.waterLevelList) ? tunnelData.waterLevelList : []
    renderPoints(tunnelLayer, tunnelTableData.value, icons.tunnel, 'tunnel')
    renderNamePopups(tunnelTableData.value)
  } catch (error) {
    console.error('[FloodControl] 获取详情数据失败:', error)
  }
}

onMounted(async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  mapView.value = view
  gisMap.value = map
  isLoading.value = false
  fetchDetailData()
  // 监听地图单击：命中点位后按类别调用对应详情接口，并打印结果
  try {
    mapView.value.on('click', (event: any) => {
      mapView.value.hitTest(event).then((response: any) => {
        const result = response.results?.find((r: any) => r.graphic && ['flood-layer','rain-layer','river-layer','tunnel-layer'].includes(r.graphic.layer?.id))
        const attrs = result?.graphic?.attributes
        const id = Number(attrs?.id)
        const category = attrs?.category as 'rain'|'tunnel'|'river'|'flood'
        if (!id || !category) return
        switch (category) {
          case 'flood':
            setActiveDetail('flood')
            FloodControlAPI.getInnerFloodWaterLevelMonitorDetail(id).then((res) => {
              console.log('[Detail][内涝]', id, res)
              const data = res?.data ?? res
              floodDetail.value = data
              // 优先使用 monitorRecordList；没有则回退使用 monitorTrendList
              const rawList: any[] = Array.isArray(data?.monitorRecordList)
                ? data.monitorRecordList
                : (Array.isArray(data?.monitorTrendList) ? data.monitorTrendList : [])
              // 统一字段到 { collectionTime, liquidLevel, alertValue, warningValue }
              floodRecordList.value = rawList.map((i: any) => ({
                collectionTime: i?.collectionTime ?? i?.statisticsTime,
                liquidLevel: i?.liquidLevel ?? i?.monitorValue ?? i?.waterLevel,
                alertValue: i?.alertValue,
                warningValue: i?.warningValue,
                alarmLevel: i?.alarmLevel
              }))
              const x = rawList.map((i: any) => i?.statisticsTime ?? i?.collectionTime)
              const monitor = rawList.map((i: any) => i?.monitorValue ?? i?.liquidLevel ?? i?.waterLevel ?? 0)
              const warning = rawList.map((i: any) => i?.warningValue ?? 0)
              const alert = rawList.map((i: any) => i?.alertValue ?? 0)
              floodChartOptions.value = {
                color: ['#4A90E2', '#FFD166', '#FF6B6B'],
                tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } } },
                legend: { data: ['液位', '警示阈值', '警戒阈值'], textStyle: { color: '#e6f4ff' } },
                grid: { left: 36, right: 16, top: 28, bottom: 28, containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { color: '#cfe8ff' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }, axisTick: { show: false } },
                yAxis: { type: 'value', name: 'm', nameTextStyle: { color: '#cfe8ff' }, axisLabel: { color: '#cfe8ff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } } },
                series: [
                  { name: '液位', type: 'line', data: monitor, smooth: true, showSymbol: false, areaStyle: { color: 'rgba(74,144,226,0.18)' } },
                  { name: '警示阈值', type: 'line', data: warning, smooth: true, showSymbol: false },
                  { name: '警戒阈值', type: 'line', data: alert, smooth: true, showSymbol: false }
                ]
              }
            }).catch((e) => console.warn('[Detail][内涝]失败', e))
            break
          case 'rain':
            setActiveDetail('rain')
            FloodControlAPI.getRainfallMonitorDetail(id).then((res) => {
              console.log('[Detail][雨情]', id, res)
              const data = res?.data ?? res
              rainDetail.value = data
              const x = (data?.rainStatisticsList || []).map((i: any) => i?.statisticsTime)
              const y = (data?.rainStatisticsList || []).map((i: any) => i?.rainNum ?? 0)
              rainChartOptions.value = {
                color: ['#4A90E2'],
                tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } } },
                grid: { left: 36, right: 16, top: 20, bottom: 28, containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { color: '#cfe8ff' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }, axisTick: { show: false } },
                yAxis: { type: 'value', name: 'mm', nameTextStyle: { color: '#cfe8ff' }, axisLabel: { color: '#cfe8ff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } } },
                series: [{ type: 'line', data: y, smooth: true, showSymbol: false, lineStyle: { width: 2, color: '#4A90E2' }, areaStyle: { color: 'rgba(74,144,226,0.18)' } }]
              }
            }).catch((e) => console.warn('[Detail][雨情]失败', e))
            break
          case 'river':
            setActiveDetail('river')
            FloodControlAPI.getRiverWaterLevelMonitorDetail(id).then((res) => {
              console.log('[Detail][河道]', id, res)
              const data = res?.data ?? res
              riverDetail.value = data
              riverRecordList.value = Array.isArray(data?.monitorRecordList) ? data.monitorRecordList : []
              const x = (data?.monitorTrendList || []).map((i: any) => i?.statisticsTime)
              const monitor = (data?.monitorTrendList || []).map((i: any) => i?.monitorValue ?? 0)
              const warning = (data?.monitorTrendList || []).map((i: any) => i?.warningValue ?? 0)
              const alert = (data?.monitorTrendList || []).map((i: any) => i?.alertValue ?? 0)
              riverChartOptions.value = {
                color: ['#4A90E2', '#FFD166', '#FF6B6B'],
                tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } } },
                legend: { data: ['水位', '警示阈值', '警戒阈值'], textStyle: { color: '#e6f4ff' } },
                grid: { left: 36, right: 16, top: 28, bottom: 28, containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { color: '#cfe8ff' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }, axisTick: { show: false } },
                yAxis: { type: 'value', name: 'm', nameTextStyle: { color: '#cfe8ff' }, axisLabel: { color: '#cfe8ff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } } },
                series: [
                  { name: '水位', type: 'line', data: monitor, smooth: true, showSymbol: false, areaStyle: { color: 'rgba(74,144,226,0.18)' } },
                  { name: '警示阈值', type: 'line', data: warning, smooth: true, showSymbol: false },
                  { name: '警戒阈值', type: 'line', data: alert, smooth: true, showSymbol: false }
                ]
              }
            }).catch((e) => console.warn('[Detail][河道]失败', e))
            break
          case 'tunnel':
            setActiveDetail('tunnel')
            FloodControlAPI.getTunnelWaterLevelMonitorDetail(id).then((res) => {
              console.log('[Detail][隧道]', id, res)
              const data = res?.data ?? res
              tunnelDetail.value = data
              tunnelRecordList.value = Array.isArray(data?.monitorRecordList) ? data.monitorRecordList : []
              const x = (data?.monitorTrendList || []).map((i: any) => i?.statisticsTime)
              const monitor = (data?.monitorTrendList || []).map((i: any) => i?.monitorValue ?? 0)
              const warning = (data?.monitorTrendList || []).map((i: any) => i?.warningValue ?? 0)
              const alert = (data?.monitorTrendList || []).map((i: any) => i?.alertValue ?? 0)
              tunnelChartOptions.value = {
                color: ['#4A90E2', '#FFD166', '#FF6B6B'],
                tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } } },
                legend: { data: ['液位', '警示阈值', '警戒阈值'], textStyle: { color: '#e6f4ff' } },
                grid: { left: 36, right: 16, top: 28, bottom: 28, containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { color: '#cfe8ff' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }, axisTick: { show: false } },
                yAxis: { type: 'value', name: 'm', nameTextStyle: { color: '#cfe8ff' }, axisLabel: { color: '#cfe8ff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } } },
                series: [
                  { name: '液位', type: 'line', data: monitor, smooth: true, showSymbol: false, areaStyle: { color: 'rgba(74,144,226,0.18)' } },
                  { name: '警示阈值', type: 'line', data: warning, smooth: true, showSymbol: false },
                  { name: '警戒阈值', type: 'line', data: alert, smooth: true, showSymbol: false }
                ]
              }
            }).catch((e) => console.warn('[Detail][隧道]失败', e))
            break
        }
      }).catch(() => {})
    })
  } catch {}
})

onUnmounted(() => {
  // 可按需清理地图资源
})
</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: calc(100vh - 56px);
  position: relative;
}
.labels-overlay { position: absolute; left: 0; top: 0; width: 100%; height: calc(100vh - 56px); pointer-events: none; z-index: 1001; }
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
.left-panel-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(10,30,60,0.6); border: 1px solid rgba(74,144,226,0.35); border-radius: 8px; cursor: pointer; }
.left-panel-header .back-arrow { font-size: 18px; color: #cfe6ff; }
.left-panel-header .header-title { color: #e6f4ff; font-weight: 700; }
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
  padding: 12px 14px; color: #e6f4ff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(90deg, rgba(53, 122, 189, 0.22) 0%, rgba(53, 122, 189, 0.12) 60%, transparent 100%);
  display: flex; align-items: center; gap: 8px;
}
.panel-container .container-header .header-icon { width: 18px; height: 18px; object-fit: contain; display: block; }
.panel-container .container-content { padding: 12px; flex: 1; overflow: auto; display: flex; flex-direction: column; min-height: 0; }
.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { flex: 1 1 auto; min-height: 0; margin-top: 6px; display: flex; }
.table-wrapper :deep(.el-table) { flex: 1 1 auto; }

/* 右侧：详情面板样式 */
.right-panel--detail { display: flex; flex-direction: column; gap: 10px; }
.right-panel--detail .detail-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; }
.right-panel--detail .detail-meta .meta-row { display: flex; gap: 8px; color: #cfe6ff; }
.right-panel--detail .detail-meta .label { opacity: .9; }
.right-panel--detail .detail-meta .value { color: #fff; font-weight: 600; }
.right-panel--detail .chart-wrapper { flex: 1 1 auto; min-height: 220px; display: flex; }

/* 空状态样式 */
.panel-container.empty-state { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  min-height: 300px; 
}
.empty-hint { 
  text-align: center; 
  color: #cfe6ff; 
  opacity: 0.7; 
}
.empty-hint .hint-icon { 
  font-size: 32px; 
  margin-bottom: 12px; 
}
.empty-hint .hint-text { 
  font-size: 14px; 
}

/* 关闭按钮样式调整 */
.container-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
}

/* 左侧面板表格 - 深色主题（与 metrics 保持一致） */
.left-panel :deep(.el-table),
.right-panel :deep(.el-table) {
  --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  background: transparent;
  color: #e6f4ff;
}
.left-panel :deep(.el-table th.el-table__cell),
.right-panel :deep(.el-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.06);
  color: #e6f4ff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.left-panel :deep(.el-table td.el-table__cell),
.right-panel :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.left-panel :deep(.el-table__body tr:hover>td),
.left-panel :deep(.el-table__body tr.el-table__row:hover>td),
.right-panel :deep(.el-table__body tr:hover>td),
.right-panel :deep(.el-table__body tr.el-table__row:hover>td) {
  background: rgba(74, 144, 226, 0.18) !important;
  color: #e6f4ff !important;
}
.left-panel :deep(.el-table__body tr.el-table__row--current>td),
.right-panel :deep(.el-table__body tr.el-table__row--current>td) {
  background: rgba(74, 144, 226, 0.24) !important;
  color: #ffffff !important;
}
.left-panel :deep(.el-table .cell),
.right-panel :deep(.el-table .cell) { color: inherit; }
.left-panel :deep(.el-table--striped .el-table__body tr.el-table__row--striped td),
.right-panel :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.03);
}
.rainfall-content { display: flex; gap: 12px; }
.rainfall-map { flex: 1; min-height: 160px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.rainfall-legend { width: 160px; display: flex; flex-direction: column; gap: 8px; }
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }

/* 左2 三张统计卡片：横向排列并保持与整体风格一致 */
.row-cards { display: flex; flex-direction: row; gap: 12px; flex-wrap: nowrap; margin-bottom: 8px; }
.row-cards--three .metric-card { flex: 1 1 0; min-width: 0; }
.metric-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; }
.metric-card .card-label { font-size: 11px; margin-bottom: 8px; opacity: .85; color: #cfe6ff; }
.metric-card .card-value { font-size: 22px; color: #fff; font-weight: 600; }

/* 地图名称弹窗（简洁标签） */
.map-label {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e6f4ff;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}
</style>


