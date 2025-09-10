<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>

  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel">
    <div class="left-panel-header" @click="goBack">
      <span class="back-arrow">←</span>
      <span class="header-title">{{ (route.query.stationName as string) || (route.params.stationName as string) || '水环境重点场所' }}</span>
    </div>
    <div class="panel-container">
      <div class="container-header">
        <img class="header-icon" :src="pollutionPng" alt="" />
        <h3>排污口监测</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three" v-if="pollutionSummary.totalNum != null">
          <div class="metric-card">
            <div class="card-label">监测总数</div>
            <div class="card-value">{{ pollutionSummary.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超标数量</div>
            <div class="card-value exceed-num">{{ pollutionSummary.exceedStandardNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">正常数量</div>
            <div class="card-value normal-num">{{ pollutionSummary.normalNum ?? '-' }}</div>
          </div>
        </div>
        <div v-if="pollutionTableData.length" class="table-wrapper">
          <el-table :data="pollutionTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="140" />
            <el-table-column prop="address" label="地址" width="160" />
            <el-table-column label="报警等级" width="120">
              <template #default="{ row }">
                <el-tag 
                  :type="getAlarmTagType(row.outfallAlarmLevel?.name)"
                  size="small">
                  {{ row.outfallAlarmLevel?.desc || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="outfallAlarmContent" label="报警内容" width="120" />
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
      <div class="container-header">
        <img class="header-icon" :src="waterQualityPng" alt="" />
        <h3>水质监测</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards row-cards row-cards--three" v-if="waterQualitySummary.totalNum != null">
          <div class="metric-card">
            <div class="card-label">监测总数</div>
            <div class="card-value">{{ waterQualitySummary.totalNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">超标数量</div>
            <div class="card-value exceed-num">{{ waterQualitySummary.exceedStandardNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">正常数量</div>
            <div class="card-value normal-num">{{ waterQualitySummary.normalNum ?? '-' }}</div>
          </div>
        </div>
        <div v-if="waterQualityTableData.length" class="table-wrapper">
          <el-table :data="waterQualityTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="140" />
            <el-table-column prop="address" label="地址" width="160" />
            <el-table-column label="报警等级" width="120">
              <template #default="{ row }">
                <el-tag 
                  :type="getAlarmTagType(row.outfallAlarmLevel?.name)"
                  size="small">
                  {{ row.outfallAlarmLevel?.desc || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="outfallAlarmContent" label="报警内容" width="120" />
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
      <div class="container-content right-panel--detail" v-loading="isDetailLoading" 
           element-loading-text="加载中..." 
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0,0,0,0.3)">
        
        <!-- 排污口详情 -->
        <transition name="fade-slide" mode="out-in">
          <template v-if="activeDetail === 'pollution' && pollutionDetail">
            <div class="detail-content">
              <div class="detail-meta">
                <div class="meta-row"><span class="label">监测点</span><span class="value">{{ pollutionDetail.stationName || '-' }}</span></div>
                <div class="meta-row"><span class="label">类型</span><span class="value">{{ pollutionDetail.outfallType || '-' }}</span></div>
                <div class="meta-row"><span class="label">地址</span><span class="value">{{ pollutionDetail.address || '-' }}</span></div>
              </div>
              
              <!-- 监测数据表格 -->
              <div class="table-section">
                <h4 class="section-title">监测数据</h4>
                <el-table :data="pollutionDetail.monitorDataList || []" style="width: 100%" size="small" stripe>
                  <el-table-column prop="updateTime" label="更新时间" width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span class="time-text">{{ row.updateTime || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="publicHealth" label="PH值" width="90" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.publicHealth ? row.publicHealth.toFixed(3) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ammoniaNitrogen" label="氨氮" width="90" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.ammoniaNitrogen ? row.ammoniaNitrogen.toFixed(2) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="totalNitrogen" label="总氮" width="90" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.totalNitrogen ? row.totalNitrogen.toFixed(2) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="chemicalOxygenDemand" label="化学需氧量" width="110" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.chemicalOxygenDemand ? row.chemicalOxygenDemand.toFixed(2) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="totalPhosphorus" label="总磷" width="90" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.totalPhosphorus ? row.totalPhosphorus.toFixed(2) : '-' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 趋势图表 -->
              <div class="chart-section">
                <h4 class="section-title">趋势分析</h4>
                <div class="chart-container">
                  <div ref="pollutionChart" class="chart"></div>
                </div>
              </div>
            </div>
          </template>
        </transition>

        <!-- 水质监测详情 -->
        <transition name="fade-slide" mode="out-in">
          <template v-if="activeDetail === 'waterQuality' && waterQualityDetail">
            <div class="detail-content">
              <div class="detail-meta">
                <div class="meta-row"><span class="label">监测点</span><span class="value">{{ waterQualityDetail.stationName || '-' }}</span></div>
                <div class="meta-row"><span class="label">类型</span><span class="value">{{ waterQualityDetail.outfallType || '-' }}</span></div>
                <div class="meta-row"><span class="label">河流名称</span><span class="value">{{ waterQualityDetail.riverName || '-' }}</span></div>
                <div class="meta-row"><span class="label">地址</span><span class="value">{{ waterQualityDetail.address || '-' }}</span></div>
              </div>
              
              <!-- 监测数据表格 -->
              <div class="table-section">
                <h4 class="section-title">监测数据</h4>
                <el-table :data="waterQualityDetail.monitorDataList || []" style="width: 100%" size="small">
                  <el-table-column prop="monitorItem" label="监测项目" width="100" />
                  <el-table-column prop="monitorLevel.desc" label="等级" width="80">
                    <template #default="{ row }">
                      <el-tag :type="getLevelTagType(row.monitorLevel?.name)" size="small">
                        {{ row.monitorLevel?.desc || '-' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="latestMonitorValue" label="最新值" width="100">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.latestMonitorValue || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="previousMonitorValue" label="上次值" width="100">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.previousMonitorValue || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="变化趋势" width="100">
                    <template #default="{ row }">
                      <span :class="getTrendClass(row.latestMonitorValue, row.previousMonitorValue)">
                        {{ getTrendText(row.latestMonitorValue, row.previousMonitorValue) }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 趋势图表 -->
              <div class="chart-section">
                <h4 class="section-title">趋势分析</h4>
                <div class="chart-container">
                  <div ref="waterQualityChart" class="chart"></div>
                </div>
              </div>
            </div>
          </template>
        </transition>

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
import { shallowRef, ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { initGisMap, esriModules, createMarkerGraphic, createMarkerPopup } from '@/utils/gis'
import { useRouter, useRoute } from 'vue-router'
import { WaterEnvironmentAPI } from '@/api/sector/metrics'
import pollutionPng from '@/assets/imgs/sector/污水站.png'
import waterQualityPng from '@/assets/imgs/sector/水质监测点.png'
import * as echarts from 'echarts'

const gisMap = shallowRef<any>(null)
const mapView = shallowRef<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const waterQualityChart = ref<HTMLElement>()
const pollutionChart = ref<HTMLElement>()
const router = useRouter()
const route = useRoute()

// 数据状态
const pollutionTableData = ref<any[]>([])
const pollutionSummary = ref<{ totalNum?: number; exceedStandardNum?: number; normalNum?: number }>({})
const waterQualityTableData = ref<any[]>([])
const waterQualitySummary = ref<{ totalNum?: number; exceedStandardNum?: number; normalNum?: number }>({})
const pollutionDetail = ref<any | null>(null)
const waterQualityDetail = ref<any | null>(null)
const activeDetail = ref<'pollution' | 'waterQuality' | null>(null)
const isDetailLoading = ref<boolean>(false)

// 计算属性
const detailTitle = computed(() => {
  switch (activeDetail.value) {
    case 'pollution': return '排污口详情'
    case 'waterQuality': return '水质监测详情'
    default: return '详情'
  }
})

const detailStationName = computed(() => {
  switch (activeDetail.value) {
    case 'pollution': return pollutionDetail.value?.stationName ?? ''
    case 'waterQuality': return waterQualityDetail.value?.stationName ?? ''
    default: return ''
  }
})

const goBack = () => {
  router.push({ name: 'Venues' })
}

// 获取报警等级标签类型
const getAlarmTagType = (alarmName: string) => {
  switch (alarmName) {
    case 'RED_ALARM':
      return 'danger'
    case 'YELLOW_ALARM':
      return 'warning'
    case 'NORMAL':
      return 'success'
    default:
      return 'info'
  }
}

// 获取等级标签类型
const getLevelTagType = (levelName: string) => {
  switch (levelName) {
    case 'FIRST_LEVEL':
      return 'success'
    case 'SECOND_LEVEL':
      return 'warning'
    case 'THIRD_LEVEL':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取趋势文本
const getTrendText = (current: number, previous: number) => {
  if (!current || !previous) return '-'
  const diff = current - previous
  if (diff > 0) return '↗'
  if (diff < 0) return '↘'
  return '→'
}

// 获取趋势样式类
const getTrendClass = (current: number, previous: number) => {
  if (!current || !previous) return 'trend-neutral'
  const diff = current - previous
  if (diff > 0) return 'trend-up'
  if (diff < 0) return 'trend-down'
  return 'trend-neutral'
}

// 图层引用
const pollutionLayer = shallowRef<any>(null)
const waterQualityLayer = shallowRef<any>(null)

const ensureLayers = () => {
  if (!gisMap.value || !esriModules) return
  if (!pollutionLayer.value) {
    pollutionLayer.value = new esriModules.GraphicsLayer({ id: 'pollution-layer' })
    gisMap.value.add(pollutionLayer.value)
  }
  if (!waterQualityLayer.value) {
    waterQualityLayer.value = new esriModules.GraphicsLayer({ id: 'water-quality-layer' })
    gisMap.value.add(waterQualityLayer.value)
  }
}

const renderPoints = (layerRef: any, list: any[], iconUrl: string, category: 'pollution' | 'waterQuality') => {
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

const centerOnPoint = (row: any) => {
  const lon = row?.longitude ?? row?.lon ?? row?.lng
  const lat = row?.latitude ?? row?.lat
  if (!mapView.value || lon == null || lat == null) return
  try {
    mapView.value.goTo({ center: [lon, lat], zoom: 14 })
  } catch (e) {
    console.warn('[WaterEnvironment] 地图定位失败', e)
  }
}

// 清理详情面板数据
const clearDetailPanel = () => {
  activeDetail.value = null
  isDetailLoading.value = false
  pollutionDetail.value = null
  waterQualityDetail.value = null
}

// 清理旧数据并设置新的活动详情类型
const setActiveDetail = (type: 'pollution' | 'waterQuality') => {
  clearDetailPanel()
  activeDetail.value = type
  isDetailLoading.value = true
}

// 初始化水质检测图表
const initWaterQualityChart = () => {
  if (!waterQualityChart.value || !waterQualityDetail.value) return
  
  const chart = echarts.init(waterQualityChart.value)
  
  const chemicalData = waterQualityDetail.value.chemicalTrendList || []
  const phosphorusData = waterQualityDetail.value.phosphorusTrendList || []
  const ammoniaData = waterQualityDetail.value.ammoniaTrendList || []
  
  const dates = chemicalData.map(item => item.statisticsDate)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '水质监测趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#e6f4ff'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: {
        color: '#e6f4ff'
      }
    },
    legend: {
      data: ['化学需氧量', '总磷', '氨氮'],
      top: 30,
      textStyle: {
        color: '#e6f4ff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45,
        color: '#cfe6ff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: {
        color: '#cfe6ff'
      },
      axisLabel: {
        color: '#cfe6ff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '化学需氧量',
        type: 'line',
        data: chemicalData.map(item => item.statisticsNum),
        smooth: true,
        lineStyle: {
          color: '#5470c6'
        },
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '总磷',
        type: 'line',
        data: phosphorusData.map(item => item.statisticsNum),
        smooth: true,
        lineStyle: {
          color: '#91cc75'
        },
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '氨氮',
        type: 'line',
        data: ammoniaData.map(item => item.statisticsNum),
        smooth: true,
        lineStyle: {
          color: '#fac858'
        },
        itemStyle: {
          color: '#fac858'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化排污口图表
const initPollutionChart = () => {
  if (!pollutionChart.value || !pollutionDetail.value) {
    console.log('图表初始化失败：缺少必要元素', { 
      chartRef: !!pollutionChart.value, 
      data: !!pollutionDetail.value 
    })
    return
  }
  
  console.log('开始初始化排污口图表', pollutionDetail.value)
  const chart = echarts.init(pollutionChart.value)
  
  const trendData = pollutionDetail.value.trendList || []
  const dates = trendData.map(item => item.statisticsDate)
  const values = trendData.map(item => item.statisticsNum)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '排污口监测趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#e6f4ff'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: {
        color: '#e6f4ff'
      },
      formatter: function(params: any) {
        const data = params[0]
        return `${data.axisValue}<br/>${data.seriesName}: ${data.value.toFixed(2)}`
      }
    },
    legend: {
      data: ['监测数值'],
      top: 30,
      textStyle: {
        color: '#e6f4ff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45,
        color: '#cfe6ff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: {
        color: '#cfe6ff'
      },
      axisLabel: {
        color: '#cfe6ff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '监测数值',
        type: 'line',
        data: values,
        smooth: true,
        lineStyle: {
          color: '#5470c6'
        },
        itemStyle: {
          color: '#5470c6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(84, 112, 198, 0.3)'
            }, {
              offset: 1, color: 'rgba(84, 112, 198, 0.1)'
            }]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const icons = {
  pollution: pollutionPng,
  waterQuality: waterQualityPng
}

const fetchDetailData = async () => {
  const idParam = route.params.id
  const id = Number(idParam)
  if (!id) {
    console.warn('[WaterEnvironment] 无效的路由参数 id:', idParam)
    return
  }
  try {
    const [pollutionRes, waterQualityRes] = await Promise.all([
      WaterEnvironmentAPI.getPollutionOutletMonitor(id),
      WaterEnvironmentAPI.getWaterQualityMonitor(id)
    ])
    
    // 确保图层已创建再开始渲染任意点位
    ensureLayers()
    
    console.log('[WaterEnvironment] 排污口监测:', pollutionRes)
    // 解析排污口数据
    const pollutionData = pollutionRes?.data ?? pollutionRes
    pollutionSummary.value = {
      totalNum: pollutionData?.totalNum,
      exceedStandardNum: pollutionData?.exceedStandardNum,
      normalNum: pollutionData?.normalNum
    }
    pollutionTableData.value = Array.isArray(pollutionData?.monitorList) ? pollutionData.monitorList : []
    renderPoints(pollutionLayer, pollutionTableData.value, icons.pollution, 'pollution')
    renderNamePopups(pollutionTableData.value)
    
    console.log('[WaterEnvironment] 水质监测:', waterQualityRes)
    // 解析水质监测数据
    const waterQualityData = waterQualityRes?.data ?? waterQualityRes
    waterQualitySummary.value = {
      totalNum: waterQualityData?.totalNum,
      exceedStandardNum: waterQualityData?.exceedStandardNum,
      normalNum: waterQualityData?.normalNum
    }
    waterQualityTableData.value = Array.isArray(waterQualityData?.monitorList) ? waterQualityData.monitorList : []
    renderPoints(waterQualityLayer, waterQualityTableData.value, icons.waterQuality, 'waterQuality')
    renderNamePopups(waterQualityTableData.value)
  } catch (error) {
    console.error('[WaterEnvironment] 获取详情数据失败:', error)
  }
}

onMounted(async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  mapView.value = view
  gisMap.value = map
  isLoading.value = false
  fetchDetailData()
  
  // 监听地图单击：命中点位后按类别调用对应详情接口
  try {
    mapView.value.on('click', (event: any) => {
      mapView.value.hitTest(event).then((response: any) => {
        const result = response.results?.find((r: any) => r.graphic && ['pollution-layer','water-quality-layer'].includes(r.graphic.layer?.id))
        const attrs = result?.graphic?.attributes
        const id = Number(attrs?.id)
        const category = attrs?.category as 'pollution'|'waterQuality'
        if (!id || !category) return
        switch (category) {
          case 'pollution':
            setActiveDetail('pollution')
            WaterEnvironmentAPI.getPollutionOutletMonitorDetail(id).then((res) => {
              console.log('[Detail][排污口]', id, res)
              const data = res?.data ?? res
              pollutionDetail.value = data
              isDetailLoading.value = false
              // 初始化图表
              nextTick(() => {
                initPollutionChart()
              })
            }).catch((e) => {
              console.warn('[Detail][排污口]失败', e)
              isDetailLoading.value = false
            })
            break
          case 'waterQuality':
            setActiveDetail('waterQuality')
            WaterEnvironmentAPI.getWaterQualityMonitorDetail(id).then((res) => {
              console.log('[Detail][水质监测]', id, res)
              const data = res?.data ?? res
              waterQualityDetail.value = data
              isDetailLoading.value = false
              // 初始化图表
              nextTick(() => {
                initWaterQualityChart()
              })
            }).catch((e) => {
              console.warn('[Detail][水质监测]失败', e)
              isDetailLoading.value = false
            })
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
}
.panel-container .container-content { padding: 12px; flex: 1; overflow: auto; }
.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { height: 100%; }
.rainfall-content { display: flex; gap: 12px; }
.rainfall-map { flex: 1; min-height: 160px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.rainfall-legend { width: 160px; display: flex; flex-direction: column; gap: 8px; }
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }

/* 过渡动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 详情内容容器 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 右侧：详情面板样式 */
.right-panel--detail { display: flex; flex-direction: column; gap: 10px; }
.right-panel--detail .detail-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; }
.right-panel--detail .detail-meta .meta-row { display: flex; gap: 8px; color: #cfe6ff; }
.right-panel--detail .detail-meta .label { opacity: .9; }
.right-panel--detail .detail-meta .value { color: #fff; font-weight: 600; }

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
  justify-content: flex-start; 
  gap: 8px;
}

/* 左侧面板表格 - 深色主题 */
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

/* 统计卡片样式 */
.row-cards { display: flex; flex-direction: row; gap: 12px; flex-wrap: nowrap; margin-bottom: 8px; }
.row-cards--two .metric-card { flex: 1 1 0; min-width: 0; }
.row-cards--three .metric-card { flex: 1 1 0; min-width: 0; }
.metric-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; }
.metric-card .card-label { font-size: 11px; margin-bottom: 8px; opacity: .85; color: #cfe6ff; }
.metric-card .card-value { font-size: 22px; color: #fff; font-weight: 600; }

/* 特殊数值颜色 */
.metric-card .exceed-num { color: #ff6b6b; }
.metric-card .normal-num { color: #4ade80; }

/* 报警等级标签样式 */
:deep(.el-tag) {
  font-weight: 600;
  border: none;
}

:deep(.el-tag--danger) {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

:deep(.el-tag--warning) {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

:deep(.el-tag--success) {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

:deep(.el-tag--info) {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* 头部图标样式 */
.panel-container .container-header .header-icon { width: 18px; height: 18px; object-fit: contain; display: block; }
.panel-container .container-header {
  display: flex; 
  align-items: center; 
  gap: 8px;
}

/* 完全隐藏滚动条 */
.floating-panel {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.floating-panel::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.floating-panel::-webkit-scrollbar-track {
  display: none !important;
}

.floating-panel::-webkit-scrollbar-thumb {
  display: none !important;
}

.table-wrapper {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.table-wrapper::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.table-wrapper::-webkit-scrollbar-track {
  display: none !important;
}

.table-wrapper::-webkit-scrollbar-thumb {
  display: none !important;
}

.right-panel--detail {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.right-panel--detail::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.right-panel--detail::-webkit-scrollbar-track {
  display: none !important;
}

.right-panel--detail::-webkit-scrollbar-thumb {
  display: none !important;
}

/* 全局隐藏所有滚动条 */
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

*::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

*::-webkit-scrollbar-track {
  display: none !important;
}

*::-webkit-scrollbar-thumb {
  display: none !important;
}

/* 表格和图表样式 - 深色主题（与 FloodControl 保持一致） */
.table-section {
  margin-top: 16px;
}

/* 深色主题表格样式 */
.table-section :deep(.el-table) {
  --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  background: transparent;
  color: #e6f4ff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.table-section :deep(.el-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.06);
  color: #e6f4ff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.table-section :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 0;
}

.table-section :deep(.el-table__body tr:hover>td),
.table-section :deep(.el-table__body tr.el-table__row:hover>td) {
  background: rgba(74, 144, 226, 0.18) !important;
  color: #e6f4ff !important;
}

.table-section :deep(.el-table__body tr.el-table__row--current>td) {
  background: rgba(74, 144, 226, 0.24) !important;
  color: #ffffff !important;
}

.table-section :deep(.el-table .cell) { 
  color: inherit; 
}

.table-section :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.03);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #e6f4ff;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.value-text {
  font-weight: 500;
  color: #e6f4ff;
}

.time-text {
  font-size: 12px;
  color: #cfe6ff;
  opacity: 0.8;
}

.trend-up {
  color: #ff6b6b;
  font-weight: 600;
}

.trend-down {
  color: #51cf66;
  font-weight: 600;
}

.trend-neutral {
  color: #cfe6ff;
  font-weight: 500;
  opacity: 0.7;
}

.chart-section {
  margin-top: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 280px;
  flex: 1 1 auto;
}
</style>


