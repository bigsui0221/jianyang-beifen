<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>

  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel">
    <div class="left-panel-header" @click="goBack">
      <span class="back-arrow">←</span>
      <span class="header-title">{{ route.query.stationName || route.params.stationName || '供排水重点场所' }}</span>
    </div>
    
    <!-- 供排水量统计 -->
    <div class="panel-container" v-if="volumeStatData">
      <div class="container-header">
        <h3>供排水量统计</h3>
    </div>
      <div class="container-content">
        <!-- 今日数据卡片 -->
        <div class="metric-cards row-cards row-cards--two" v-if="volumeStatData">
          <div class="metric-card">
            <div class="card-label">今日供水量</div>
            <div class="card-value supply-num">{{ volumeStatData.todaySupplyNum || 0 }}</div>
    </div>
          <div class="metric-card">
            <div class="card-label">今日排水量</div>
            <div class="card-value drainage-num">{{ volumeStatData.todayDrainageNum || 0 }}</div>
          </div>
        </div>
        
        <!-- 趋势图表 -->
        <div class="chart-section">
          <h4 class="section-title">一周趋势</h4>
          <div class="chart-container">
            <div ref="volumeChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 供水压力监测 -->
    <div class="panel-container">
      <div class="container-header">
        <img :src="icons.pressure" class="header-icon" />
        <h3>供水压力监测</h3>
    </div>
      <div class="container-content">
        <div v-if="pressureTableData.length" class="table-wrapper">
          <el-table :data="pressureTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点名称" width="140" show-overflow-tooltip />
            <el-table-column prop="residualChlorine" label="余氯(mg/L)" width="100" align="center">
              <template #default="{ row }">
                <span class="value-text">{{ row.residualChlorine?.toFixed(3) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="turbidity" label="浊度(NTU)" width="100" align="center">
              <template #default="{ row }">
                <span class="value-text">{{ row.turbidity?.toFixed(3) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="alarmInfo" label="报警信息" width="120" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.alarmInfo && row.alarmInfo !== '正常' ? 'danger' : 'success'" 
                  size="small"
                  v-if="row.alarmInfo"
                >
                  {{ row.alarmInfo }}
                </el-tag>
                <span v-else class="time-text">正常</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" class="empty-state" />
        </div>
        
    </div>
    </div>

    <!-- 供水水质监测 -->
    <div class="panel-container">
      <div class="container-header">
        <img :src="icons.quality" class="header-icon" />
        <h3>供水水质监测</h3>
    </div>
      <div class="container-content">
        <div v-if="qualityTableData.length" class="table-wrapper">
          <el-table :data="qualityTableData" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点名称" width="140" show-overflow-tooltip />
            <el-table-column prop="residualChlorine" label="余氯(mg/L)" width="100" align="center">
              <template #default="{ row }">
                <span class="value-text">{{ row.residualChlorine?.toFixed(3) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="turbidity" label="浊度(NTU)" width="100" align="center">
              <template #default="{ row }">
                <span class="value-text">{{ row.turbidity?.toFixed(3) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="alarmInfo" label="报警信息" width="120" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.alarmInfo && row.alarmInfo !== '正常' ? 'danger' : 'success'" 
                  size="small"
                  v-if="row.alarmInfo"
                >
                  {{ row.alarmInfo }}
                </el-tag>
                <span v-else class="time-text">正常</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="table-wrapper">
          <el-empty description="暂无数据" class="empty-state" />
  </div>

      </div>
    </div>
  </div>

  <!-- 右侧悬浮区域 -->
  <div class="floating-panel right-panel">
    <div class="panel-container right-panel--detail" v-if="activeDetail">
      <div class="container-header">
        <span class="detail-title">{{ detailTitle }}</span>
        <span class="detail-station-name">{{ detailStationName }}</span>
        <el-button type="text" @click="clearDetailPanel" class="close-btn">关闭</el-button>
    </div>
      <div class="container-content" 
           v-loading="isDetailLoading"
           element-loading-text="加载中..."
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0,0,0,0.3)">
        
        <!-- 供水压力详情 -->
        <transition name="fade-slide" mode="out-in">
          <template v-if="activeDetail === 'pressure' && pressureDetail">
            <div class="detail-content">
              <div class="detail-meta">
                <div class="meta-row"><span class="label">监测点</span><span class="value">{{ pressureDetail.stationName || '-' }}</span></div>
                <div class="meta-row"><span class="label">地址</span><span class="value">{{ pressureDetail.address || '-' }}</span></div>
                <div class="meta-row"><span class="label">最新压力</span><span class="value">{{ pressureDetail.recordList?.[0]?.pressure ? pressureDetail.recordList[0].pressure.toFixed(2) + ' MPa' : '-' }}</span></div>
                <div class="meta-row"><span class="label">采集时间</span><span class="value">{{ pressureDetail.recordList?.[0]?.collectionTime || '-' }}</span></div>
              </div>
              
        <!-- 监测数据表格 -->
        <div class="table-section">
          <h4 class="section-title">历史数据</h4>
          <el-table :data="pressureDetail.recordList || []" style="width: 100%" size="small" stripe>
            <el-table-column prop="collectionTime" label="采集时间" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="time-text">{{ row.collectionTime || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="pressure" label="压力值(MPa)" min-width="120" align="center">
              <template #default="{ row }">
                <span class="value-text">{{ row.pressure ? row.pressure.toFixed(2) : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="alarmLevel" label="报警等级" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.alarmLevel ? 'danger' : 'success'" 
                  size="small"
                >
                  {{ row.alarmLevel || '正常' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

              <!-- 趋势图表 -->
              <div class="chart-section">
                <h4 class="section-title">压力趋势</h4>
                <div class="chart-container">
                  <div ref="pressureChart" class="chart"></div>
                </div>
              </div>
            </div>
          </template>
        </transition>

        <!-- 供水水质详情 -->
        <transition name="fade-slide" mode="out-in">
          <template v-if="activeDetail === 'quality' && qualityDetail">
            <div class="detail-content">
              <div class="detail-meta">
                <div class="meta-row"><span class="label">监测点</span><span class="value">{{ qualityDetail.stationName || '-' }}</span></div>
                <div class="meta-row"><span class="label">地址</span><span class="value">{{ qualityDetail.address || '-' }}</span></div>
                <div class="meta-row"><span class="label">最新余氯</span><span class="value">{{ qualityDetail.recordList?.[0]?.residualChlorine ? qualityDetail.recordList[0].residualChlorine.toFixed(3) + ' mg/L' : '-' }}</span></div>
                <div class="meta-row"><span class="label">最新浊度</span><span class="value">{{ qualityDetail.recordList?.[0]?.turbidity ? qualityDetail.recordList[0].turbidity.toFixed(3) + ' NTU' : '-' }}</span></div>
                <div class="meta-row"><span class="label">采集时间</span><span class="value">{{ qualityDetail.recordList?.[0]?.collectionTime || '-' }}</span></div>
              </div>
              
              <!-- 监测数据表格 -->
              <div class="table-section">
                <h4 class="section-title">历史数据</h4>
                <el-table :data="qualityDetail.recordList || []" style="width: 100%" size="small" stripe>
                  <el-table-column prop="collectionTime" label="采集时间" min-width="160" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span class="time-text">{{ row.collectionTime || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="residualChlorine" label="余氯(mg/L)" min-width="120" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.residualChlorine ? row.residualChlorine.toFixed(3) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="turbidity" label="浊度(NTU)" min-width="120" align="center">
                    <template #default="{ row }">
                      <span class="value-text">{{ row.turbidity ? row.turbidity.toFixed(3) : '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="alarmLevel" label="报警等级" min-width="100" align="center">
                    <template #default="{ row }">
                      <el-tag 
                        :type="row.alarmLevel ? 'danger' : 'success'" 
                        size="small"
                      >
                        {{ row.alarmLevel || '正常' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 趋势图表 -->
              <div class="chart-section">
                <h4 class="section-title">水质趋势</h4>
                <el-tabs v-model="activeQualityTab" @tab-change="handleQualityTabChange">
                  <el-tab-pane label="余氯趋势" name="chlorine">
                    <div class="chart-container">
                      <div ref="chlorineChart" class="chart"></div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="浊度趋势" name="turbidity">
                    <div class="chart-container">
                      <div ref="turbidityChart" class="chart"></div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
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
import { WaterSupplyDrainageAPI } from '@/api/sector/metrics'
import pressurePng from '@/assets/imgs/sector/压力监测.png'
import qualityPng from '@/assets/imgs/sector/水质监测点.png'
import * as echarts from 'echarts'

const gisMap = shallowRef<any>(null)
const mapView = shallowRef<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const pressureChart = ref<HTMLElement>()
const qualityChart = ref<HTMLElement>()
const chlorineChart = ref<HTMLElement>()
const turbidityChart = ref<HTMLElement>()
const volumeChart = ref<HTMLElement>()
const activeQualityTab = ref<string>('chlorine')
const router = useRouter()
const route = useRoute()

// 数据状态
const pressureTableData = ref<any[]>([])
const qualityTableData = ref<any[]>([])
const pressureSummary = ref<any>(null)
const qualitySummary = ref<any>(null)
const pressureDetail = ref<any>(null)
const qualityDetail = ref<any>(null)
const activeDetail = ref<string | null>(null)
const isDetailLoading = ref<boolean>(false)
const volumeStatData = ref<any>(null)

// 计算属性
const detailTitle = computed(() => {
  switch (activeDetail.value) {
    case 'pressure':
      return '供水压力监测详情'
    case 'quality':
      return '供水水质监测详情'
    default:
      return ''
  }
})

const detailStationName = computed(() => {
  if (activeDetail.value === 'pressure' && pressureDetail.value) {
    return pressureDetail.value.stationName || ''
  }
  if (activeDetail.value === 'quality' && qualityDetail.value) {
    return qualityDetail.value.stationName || ''
  }
  return ''
})

// 工具函数
const goBack = () => {
  router.push({ name: 'Venues' })
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '异常':
      return 'danger'
    case '警告':
      return 'warning'
    default:
      return 'info'
  }
}

// 地图定位功能
const centerOnPoint = (row: any) => {
  const lon = row?.longitude ?? row?.lon ?? row?.lng
  const lat = row?.latitude ?? row?.lat
  if (!mapView.value || lon == null || lat == null) return
  try {
    mapView.value.goTo({ center: [lon, lat], zoom: 14 })
  } catch (e) {
    console.warn('[WaterSupplyDrainage] 地图定位失败', e)
  }
}

// 水质图表tab切换
const handleQualityTabChange = (tabName: string) => {
  nextTick(() => {
    if (tabName === 'chlorine') {
      initChlorineChart()
    } else if (tabName === 'turbidity') {
      initTurbidityChart()
    }
  })
}

// 图层引用
const pressureLayer = shallowRef<any>(null)
const qualityLayer = shallowRef<any>(null)

// 弹窗管理
const popupDomList: HTMLElement[] = []

// 渲染名称弹窗
const renderNamePopups = (list: any[]) => {
  if (!Array.isArray(list) || !list.length) return
  const container = mapView.value?.container
  if (!container) return
  
  // 清理现有弹窗
  popupDomList.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
  })
  popupDomList.length = 0
  
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

const ensureLayers = () => {
  if (!gisMap.value || !esriModules) return
  if (!pressureLayer.value) {
    pressureLayer.value = new esriModules.GraphicsLayer({ id: 'pressure-layer' })
    gisMap.value.add(pressureLayer.value)
  }
  if (!qualityLayer.value) {
    qualityLayer.value = new esriModules.GraphicsLayer({ id: 'quality-layer' })
    gisMap.value.add(qualityLayer.value)
  }
}

// 渲染地图点位
const renderPoints = async () => {
  if (!esriModules || !pressureLayer.value || !qualityLayer.value) return
  
  // 清空现有图层
  pressureLayer.value.removeAll()
  qualityLayer.value.removeAll()
  
  // 渲染压力监测点
  pressureTableData.value.forEach((item: any) => {
    if (item.longitude && item.latitude) {
      const graphic = createMarkerGraphic(
        [item.longitude, item.latitude],
        pressurePng,
        {
          id: item.id,
          category: 'pressure',
          stationName: item.stationName,
          residualChlorine: item.residualChlorine,
          turbidity: item.turbidity,
          alarmInfo: item.alarmInfo
        },
        { width: 26, height: 30 }
      )
      if (graphic) pressureLayer.value.add(graphic)
    }
  })
  
  // 渲染水质监测点
  qualityTableData.value.forEach((item: any) => {
    if (item.longitude && item.latitude) {
      const graphic = createMarkerGraphic(
        [item.longitude, item.latitude],
        qualityPng,
        {
          id: item.id,
          category: 'quality',
          stationName: item.stationName,
          residualChlorine: item.residualChlorine,
          turbidity: item.turbidity,
          alarmInfo: item.alarmInfo
        },
        { width: 26, height: 30 }
      )
      if (graphic) qualityLayer.value.add(graphic)
    }
  })
  
  // 渲染名称弹窗
  const allPoints = [...pressureTableData.value, ...qualityTableData.value]
  renderNamePopups(allPoints)
}

// 清理详情面板
const clearDetailPanel = () => {
  activeDetail.value = null
  isDetailLoading.value = false
  pressureDetail.value = null
  qualityDetail.value = null
}

// 清理弹窗
const cleanupPopups = () => {
  popupDomList.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
  })
  popupDomList.length = 0
}

// 设置激活详情
const setActiveDetail = (type: 'pressure' | 'quality') => {
  clearDetailPanel()
  activeDetail.value = type
  isDetailLoading.value = true
}

// 初始化余氯图表
const initChlorineChart = () => {
  if (!chlorineChart.value || !qualityDetail.value) {
    console.log('余氯图表初始化失败：缺少必要元素', { 
      chartRef: !!chlorineChart.value, 
      data: !!qualityDetail.value 
    })
    return
  }
  
  console.log('开始初始化余氯图表', qualityDetail.value)
  const chart = echarts.init(chlorineChart.value)
  
  const chlorineData = qualityDetail.value.chlorineTrendList || []
  const dates = chlorineData.map(item => item.statisticsDate)
  const values = chlorineData.map(item => item.statisticsNum)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '余氯趋势',
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
        return `${data.axisValue}<br/>余氯: ${data.value.toFixed(3)} mg/L`
      }
    },
    legend: {
      data: ['余氯'],
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
      name: '余氯(mg/L)',
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
        name: '余氯',
        type: 'line',
        data: values,
        smooth: true,
        lineStyle: {
          color: '#4a90e2',
          width: 2
        },
        itemStyle: {
          color: '#4a90e2'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(74, 144, 226, 0.3)'
            }, {
              offset: 1, color: 'rgba(74, 144, 226, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 4
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化浊度图表
const initTurbidityChart = () => {
  if (!turbidityChart.value || !qualityDetail.value) {
    console.log('浊度图表初始化失败：缺少必要元素', { 
      chartRef: !!turbidityChart.value, 
      data: !!qualityDetail.value 
    })
    return
  }
  
  console.log('开始初始化浊度图表', qualityDetail.value)
  const chart = echarts.init(turbidityChart.value)
  
  const turbidityData = qualityDetail.value.turbidityTrendList || []
  const dates = turbidityData.map(item => item.statisticsDate)
  const values = turbidityData.map(item => item.statisticsNum)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '浊度趋势',
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
        return `${data.axisValue}<br/>浊度: ${data.value.toFixed(3)} NTU`
      }
    },
    legend: {
      data: ['浊度'],
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
      name: '浊度(NTU)',
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
        name: '浊度',
        type: 'line',
        data: values,
        smooth: true,
        lineStyle: {
          color: '#ff6b6b',
          width: 2
        },
        itemStyle: {
          color: '#ff6b6b'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(255, 107, 107, 0.3)'
            }, {
              offset: 1, color: 'rgba(255, 107, 107, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 4
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化压力监测图表
const initPressureChart = () => {
  if (!pressureChart.value || !pressureDetail.value) {
    console.log('压力图表初始化失败：缺少必要元素', { 
      chartRef: !!pressureChart.value, 
      data: !!pressureDetail.value 
    })
    return
  }
  
  console.log('开始初始化压力监测图表', pressureDetail.value)
  const chart = echarts.init(pressureChart.value)
  
  const trendData = pressureDetail.value.trendList || []
  const dates = trendData.map(item => item.statisticsDate)
  const monitorValues = trendData.map(item => item.monitorValue)
  const settingValues = trendData.map(item => item.settingValue)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '压力监测趋势',
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
      data: ['监测值', '设定值'],
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
      name: '压力值(MPa)',
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
        name: '监测值',
        type: 'line',
        data: monitorValues,
        smooth: true,
        lineStyle: {
          color: '#4a90e2',
          width: 2
        },
        itemStyle: {
          color: '#4a90e2'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(74, 144, 226, 0.3)'
            }, {
              offset: 1, color: 'rgba(74, 144, 226, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 4
      },
      {
        name: '设定值',
        type: 'line',
        data: settingValues,
        smooth: true,
        lineStyle: {
          color: '#ff6b6b',
          width: 2,
          type: 'dashed'
        },
        itemStyle: {
          color: '#ff6b6b'
        },
        symbol: 'circle',
        symbolSize: 4
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化水质监测图表（默认显示余氯）
const initQualityChart = () => {
  // 默认显示余氯图表
  nextTick(() => {
    initChlorineChart()
  })
}

// 初始化供排水量图表
const initVolumeChart = () => {
  if (!volumeChart.value || !volumeStatData.value) {
    console.log('供排水量图表初始化失败：缺少必要元素', { 
      chartRef: !!volumeChart.value, 
      data: !!volumeStatData.value 
    })
    return
  }
  
  console.log('开始初始化供排水量图表', volumeStatData.value)
  const chart = echarts.init(volumeChart.value)
  
  const weekData = volumeStatData.value.weekList || []
  const dates = weekData.map(item => item.statisticsDate)
  const supplyData = weekData.map(item => item.supplyNum)
  const drainageData = weekData.map(item => item.drainageNum)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '供排水量趋势',
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
      data: ['供水量', '排水量'],
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
      name: '水量(万m³)',
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
        name: '供水量',
        type: 'line',
        data: supplyData,
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
      },
      {
        name: '排水量',
        type: 'line',
        data: drainageData,
        smooth: true,
        lineStyle: {
          color: '#91cc75'
        },
        itemStyle: {
          color: '#91cc75'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(145, 204, 117, 0.3)'
            }, {
              offset: 1, color: 'rgba(145, 204, 117, 0.1)'
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
  pressure: pressurePng,
  quality: qualityPng
}

// 获取详情数据
const fetchDetailData = async () => {
  const idParam = route.params.id
  const id = Number(idParam)
  if (!id) {
    console.warn('缺少ID参数')
    return
  }

  try {
    // 并行获取压力、水质监测数据和供排水量统计数据
    const [pressureRes, qualityRes, volumeStatRes] = await Promise.all([
      WaterSupplyDrainageAPI.getWaterPressureMonitor(id),
      WaterSupplyDrainageAPI.getWaterQualityMonitor(id),
      WaterSupplyDrainageAPI.getWaterSupplyDrainageVolumeStat(id)
    ])

    console.log('[WaterSupplyDrainage] 数据获取结果:', { pressureRes, qualityRes, volumeStatRes })

    // 处理压力监测数据
    if (pressureRes?.data) {
      const pressureData = pressureRes.data
      // 如果数据是数组格式，直接使用；如果是对象格式，取monitorList
      pressureTableData.value = Array.isArray(pressureData) ? pressureData : (pressureData.monitorList || [])
      
      // 计算统计数据
      const totalNum = pressureTableData.value.length
      const normalNum = pressureTableData.value.filter(item => 
        !item.alarmInfo || item.alarmInfo === '正常'
      ).length
      const abnormalNum = totalNum - normalNum
      
      pressureSummary.value = {
        totalNum,
        normalNum,
        abnormalNum
      }
      
      console.log('[WaterSupplyDrainage] 压力监测数据处理完成:', {
        totalNum,
        normalNum,
        abnormalNum,
        tableData: pressureTableData.value
      })
    }

    // 处理水质监测数据
    if (qualityRes?.data) {
      const qualityData = qualityRes.data
      // 如果数据是数组格式，直接使用；如果是对象格式，取monitorList
      qualityTableData.value = Array.isArray(qualityData) ? qualityData : (qualityData.monitorList || [])
      
      // 计算统计数据
      const totalNum = qualityTableData.value.length
      const normalNum = qualityTableData.value.filter(item => 
        !item.alarmInfo || item.alarmInfo === '正常'
      ).length
      const abnormalNum = totalNum - normalNum
      
      qualitySummary.value = {
        totalNum,
        normalNum,
        abnormalNum
      }
      
      console.log('[WaterSupplyDrainage] 水质监测数据处理完成:', {
        totalNum,
        normalNum,
        abnormalNum,
        tableData: qualityTableData.value
      })
    }

    // 处理供排水量统计数据
    console.log('[WaterSupplyDrainage] 供排水量统计原始响应:', volumeStatRes)
    if (volumeStatRes?.data) {
      volumeStatData.value = volumeStatRes.data
      console.log('[WaterSupplyDrainage] 供排水量统计数据已设置:', volumeStatData.value)
      // 初始化供排水量图表
      nextTick(() => {
        initVolumeChart()
      })
    } else {
      console.warn('[WaterSupplyDrainage] 供排水量统计数据为空或格式不正确:', volumeStatRes)
    }

    // 渲染地图点位
    await renderPoints()
  } catch (error) {
    console.error('[WaterSupplyDrainage] 数据获取失败:', error)
  }
}

onMounted(async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  mapView.value = view
  gisMap.value = map
  isLoading.value = false
  ensureLayers()
  
  // 临时测试数据
  volumeStatData.value = {
    todaySupplyNum: 345,
    todayDrainageNum: 314,
    weekList: [
      { statisticsDate: "09-04", supplyNum: 334, drainageNum: 358 },
      { statisticsDate: "09-05", supplyNum: 348, drainageNum: 332 },
      { statisticsDate: "09-06", supplyNum: 332, drainageNum: 313 },
      { statisticsDate: "09-07", supplyNum: 321, drainageNum: 310 },
      { statisticsDate: "09-08", supplyNum: 342, drainageNum: 317 },
      { statisticsDate: "09-09", supplyNum: 321, drainageNum: 329 },
      { statisticsDate: "09-10", supplyNum: 357, drainageNum: 327 }
    ]
  }
  
  // 供水压力测试数据
  pressureTableData.value = [
    {
      id: 1,
      stationName: "压力监测点1",
      residualChlorine: 0.286,
      turbidity: 0.248,
      alarmInfo: "正常",
      longitude: 104.54296878728059,
      latitude: 31.232995745475677
    },
    {
      id: 2,
      stationName: "压力监测点2",
      residualChlorine: 0.296,
      turbidity: 0.259,
      alarmInfo: "报警信息",
      longitude: 104.56409110129196,
      latitude: 30.984643681961675
    },
    {
      id: 3,
      stationName: "压力监测点3",
      residualChlorine: 0.355,
      turbidity: 0.334,
      alarmInfo: "正常",
      longitude: 104.56120927965928,
      latitude: 30.546106358298896
    }
  ]
  
  // 计算压力监测统计数据
  const pressureTotalNum = pressureTableData.value.length
  const pressureNormalNum = pressureTableData.value.filter(item => 
    !item.alarmInfo || item.alarmInfo === '正常'
  ).length
  const pressureAbnormalNum = pressureTotalNum - pressureNormalNum
  
  pressureSummary.value = {
    totalNum: pressureTotalNum,
    normalNum: pressureNormalNum,
    abnormalNum: pressureAbnormalNum
  }
  
  // 水质监测测试数据
  qualityTableData.value = [
    {
      id: 1,
      stationName: "水质监测点1",
      residualChlorine: 0.352,
      turbidity: 0.357,
      alarmInfo: "报警信息",
      longitude: 104.54817238805902,
      latitude: 30.903855730268532
    },
    {
      id: 2,
      stationName: "水质监测点2",
      residualChlorine: 0.345,
      turbidity: 0.33,
      alarmInfo: "正常",
      longitude: 104.55564585733259,
      latitude: 31.363814491604266
    },
    {
      id: 3,
      stationName: "水质监测点3",
      residualChlorine: 0.348,
      turbidity: 0.258,
      alarmInfo: "报警信息",
      longitude: 104.56123247539033,
      latitude: 31.089230008936752
    }
  ]
  
  // 计算水质监测统计数据
  const qualityTotalNum = qualityTableData.value.length
  const qualityNormalNum = qualityTableData.value.filter(item => 
    !item.alarmInfo || item.alarmInfo === '正常'
  ).length
  const qualityAbnormalNum = qualityTotalNum - qualityNormalNum
  
  qualitySummary.value = {
    totalNum: qualityTotalNum,
    normalNum: qualityNormalNum,
    abnormalNum: qualityAbnormalNum
  }
  
  console.log('[WaterSupplyDrainage] 设置测试数据:', { 
    volumeStatData: volumeStatData.value, 
    pressureData: pressureTableData.value,
    qualityData: qualityTableData.value
  })
  
  // 初始化测试数据的图表
  nextTick(() => {
    initVolumeChart()
  })
  
  fetchDetailData()
  
  // 监听地图单击：命中点位后按类别调用对应详情接口
  try {
    mapView.value.on('click', (event: any) => {
      mapView.value.hitTest(event).then((response: any) => {
        const result = response.results?.find((r: any) => r.graphic && ['pressure-layer','quality-layer'].includes(r.graphic.layer?.id))
        const attrs = result?.graphic?.attributes
        const id = Number(attrs?.id)
        const category = attrs?.category as 'pressure'|'quality'
        if (!id || !category) return
        switch (category) {
          case 'pressure':
            setActiveDetail('pressure')
            WaterSupplyDrainageAPI.getWaterPressureMonitorDetail(id).then((res) => {
              console.log('[Detail][压力监测]', id, res)
              const data = res?.data ?? res
              pressureDetail.value = data
              isDetailLoading.value = false
              // 初始化图表
              nextTick(() => {
                initPressureChart()
              })
            }).catch((e) => {
              console.warn('[Detail][压力监测]失败', e)
              isDetailLoading.value = false
            })
            break
          case 'quality':
            setActiveDetail('quality')
            WaterSupplyDrainageAPI.getWaterQualityMonitorDetail(id).then((res) => {
              console.log('[Detail][水质监测]', id, res)
              const data = res?.data ?? res
              qualityDetail.value = data
              isDetailLoading.value = false
              // 初始化图表
              nextTick(() => {
                initQualityChart()
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
  // 清理弹窗
  cleanupPopups()
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

.left-panel > .panel-container {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.floating-panel.left-panel { left: 20px; width: 560px; }
.floating-panel.right-panel { right: 20px; width: 560px; }

.left-panel-header { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  padding: 10px 12px; 
  background: rgba(10,30,60,0.6); 
  border: 1px solid rgba(74,144,226,0.35); 
  border-radius: 8px; 
  cursor: pointer; 
}

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
  padding: 12px 14px; 
  color: #e6f4ff; 
  font-weight: 600; 
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(90deg, rgba(53, 122, 189, 0.22) 0%, rgba(53, 122, 189, 0.12) 60%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.panel-container .container-content { 
  padding: 12px; 
  flex: 1; 
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }

.table-wrapper { 
  height: 100%; 
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 6px;
  display: flex;
  overflow: hidden;
}

.table-wrapper :deep(.el-table) {
  flex: 1 1 auto;
  height: 100%;
}

.table-wrapper :deep(.el-table__body-wrapper) {
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

/* 左侧面板表格优化 */
.left-panel .table-wrapper {
  max-height: calc(100vh - 500px);
  overflow: hidden;
}

.left-panel .table-wrapper :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 550px);
  overflow-y: auto;
}

/* 右侧详情面板表格优化 */
.right-panel .table-wrapper {
  max-height: calc(100vh - 500px);
  overflow: hidden;
  width: 100%;
}

.right-panel .table-wrapper :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 550px);
  overflow-y: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.right-panel .table-wrapper :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 表格主题样式 - 与FloodControl保持一致 */
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
.right-panel :deep(.el-table .cell) { 
  color: inherit; 
}

.left-panel :deep(.el-table--striped .el-table__body tr.el-table__row--striped td),
.right-panel :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.03);
}

/* 图标样式 */
.header-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 详情面板样式 */
.right-panel--detail .detail-title { font-size: 16px; font-weight: 600; color: #e6f4ff; }
.right-panel--detail .detail-station-name { font-size: 14px; color: #cfe6ff; opacity: 0.8; }
.right-panel--detail .close-btn { color: #cfe6ff; margin-left: auto; }

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

/* 统计卡片样式 */
.row-cards { display: flex; flex-direction: row; gap: 12px; flex-wrap: nowrap; margin-bottom: 8px; }
.row-cards--three .metric-card { flex: 1 1 0; min-width: 0; }
.metric-card { 
  background: rgba(255,255,255,0.04); 
  border: 1px solid rgba(255,255,255,0.08); 
  border-radius: 8px; 
  padding: 12px; 
}
.metric-card .card-label { font-size: 11px; margin-bottom: 8px; opacity: .85; color: #cfe6ff; }
.metric-card .card-value { font-size: 22px; color: #fff; font-weight: 600; }
.metric-card .normal-num { color: #51cf66; }
.metric-card .exceed-num { color: #ff6b6b; }
.metric-card .supply-num { color: #5470c6; }
.metric-card .drainage-num { color: #91cc75; }

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

/* 表格滚动条优化 */
.table-wrapper :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.table-wrapper :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(74, 144, 226, 0.5);
  border-radius: 3px;
}

.table-wrapper :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 144, 226, 0.7);
}

/* 表格和图表样式 - 深色主题（与 FloodControl 保持一致） */
.table-section {
  margin-top: 16px;
}

/* 深色主题表格样式 */
.table-section {
  margin-top: 16px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.table-section :deep(.el-table) {
  --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  background: transparent;
  color: #e6f4ff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  height: 100%;
  flex: 1 1 auto;
  width: 100%;
}

.table-section :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 600px);
  overflow-y: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.table-section :deep(.el-table__body-wrapper)::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* Tab样式 */
.chart-section :deep(.el-tabs) {
  color: #e6f4ff;
}

.chart-section :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.chart-section :deep(.el-tabs__nav-wrap) {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 4px;
}

.chart-section :deep(.el-tabs__item) {
  color: #cfe6ff;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.chart-section :deep(.el-tabs__item.is-active) {
  color: #e6f4ff;
  background: rgba(74, 144, 226, 0.2);
  font-weight: 600;
}

.chart-section :deep(.el-tabs__item:hover) {
  color: #e6f4ff;
  background: rgba(74, 144, 226, 0.1);
}

.chart-section :deep(.el-tabs__active-bar) {
  display: none;
}

.chart-section :deep(.el-tabs__content) {
  padding: 0;
}

.table-section :deep(.el-table th.el-table__cell) {
  background: rgba(255, 255, 255, 0.06);
  color: #e6f4ff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px 12px;
  text-align: center;
}

.table-section :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 12px;
  text-align: center;
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
  padding: 0;
  word-break: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.chart-section {
  margin-top: 16px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 500px);
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(100vh - 550px);
  overflow: hidden;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 180px;
  max-height: calc(100vh - 600px);
  flex: 1 1 auto;
}

/* 过渡动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.detail-content {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>


