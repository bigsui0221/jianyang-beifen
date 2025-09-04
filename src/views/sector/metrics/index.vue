<template>
  <!-- eslint-disable -->
  <!-- 地图容器 -->
  <div id="mapContainer">
  </div> 
  
  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicSecurity'">
    <!-- 督导检查 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-supervision"></i>
        </div>
        <h3>实时天气</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards">
          <div class="metric-card">
            <div class="card-label">督导检查总数</div>
            <div class="card-value">300件</div>
          </div>
          <div class="metric-card">
            <div class="card-label">无问题数量</div>
            <div class="card-value">269件</div>
          </div>
          <div class="metric-card">
            <div class="card-label">有问题数量</div>
            <div class="card-value">31件</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 雨量分布 -->
    <div class="panel-container flex-2">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-rainfall"></i>
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
              <span class="legend-count">119</span>
            </div>
            <div class="legend-item highlight">
              <span class="legend-label">0-9</span>
              <span class="legend-count">69</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">10-24</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">25-49</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">50-99</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">100-249</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">>=250</span>
              <span class="legend-count">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预警信息 -->
    <div class="panel-container flex-3 right3-panel">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-warning"></i>
        </div>
        <h3>预警信息</h3>
      </div>
      <div class="container-content">
        <div class="warning-list">
          <div
            class="warning-item"
            v-for="(item, idx) in metricsState.flowDistribution"
            :key="idx"
          >
            <div class="warning-main">
              <div class="warning-type">{{ item.warningTitle }}</div>
              <div class="warning-message">{{ item.warningContent }}</div>
            </div>
            <div class="warning-meta">
              <div class="warning-tag" :class="getWarningTagClass(item.warningLevel?.name)">
                {{ item.warningLevel?.desc || '-' }}
              </div>
              <div class="warning-time">{{ formatTime(item.warningTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共管理：左侧占位 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicManagement'">
    <!-- 污水处理检测 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon"><i class="icon-supervision"></i></div>
        <h3>污水处理检测</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards row-cards">
          <div class="metric-card">
            <div class="card-label">污水站总数</div>
            <div class="card-value">{{ metricsState.pmSummary.totalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">水质异常数据</div>
            <div class="card-value">{{ metricsState.pmSummary.abnormalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">处理量超额数量</div>
            <div class="card-value">{{ metricsState.pmSummary.excessNum }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 污水处理量统计 -->
    <div class="panel-container flex-2">
      <div class="container-header">
        <div class="header-icon"><i class="icon-rainfall"></i></div>
        <h3>污水处理量统计</h3>
      </div>
      <div class="container-content">
        <div class="rainfall-content">
          <div class="rainfall-map">
            <div class="map-placeholder">处理量图表占位</div>
          </div>
          <div class="rainfall-legend">
            <div class="legend-item" v-for="item in metricsState.pmFlowStats" :key="item.name">
              <span class="legend-label">{{ item.name }}</span>
              <span class="legend-count">{{ item.value }} 万m³/日</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 污水厂监测数据 -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon"><i class="icon-warning"></i></div>
        <h3>污水厂监测数据</h3>
      </div>
      <div class="container-content">
        <div class="table-wrapper">
          <el-table :data="metricsState.pmPlants" height="100%" stripe border>
            <el-table-column prop="name" label="厂站" width="140" />
            <el-table-column prop="flow" label="当日处理量(m³/日)" width="160" />
            <el-table-column prop="tp" label="总磷(mg/L)" width="120" />
            <el-table-column prop="tn" label="总氮(mg/L)" width="120" />
            <el-table-column prop="nh3" label="氨氮(mg/L)" width="120" />
            <el-table-column prop="cod" label="COD(mg/L)" width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共服务：左侧占位 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicService'">
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon"><i class="icon-supervision"></i></div>
        <h3>公共服务 - 左侧</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards">
          <div class="metric-card"><div class="card-label">占位</div><div class="card-value">--</div></div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 右侧悬浮区域：改为单个面板（Tab + 统计卡片 + 表格） -->
  <div class="floating-panel right-panel" v-if="metricsState.sceneActive === 'publicSecurity'">
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-supervision"></i>
        </div>
        <h3>实时监测数据</h3>
      </div>
      <div class="container-content">
        <!-- Tabs -->
        <el-tabs v-model="metricsState.panel.activeTab" class="tabs-compact">
          <el-tab-pane label="河道水情" name="river" />
          <el-tab-pane label="水库水情" name="reservoir" />
          <el-tab-pane label="下穿隧道" name="tunnel" />
          <el-tab-pane label="内涝点" name="ponding" />
        </el-tabs>

        <!-- 统计卡片（横向） -->
        <div class="stats-row" v-if="metricsState.panel.activeTab !== 'reservoir'">
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.total }}</div>
            <div class="card-value">{{ metricsState.panelStats.total }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.alarm }}</div>
            <div class="card-value">{{ metricsState.panelStats.alarm }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.serious }}</div>
            <div class="card-value">{{ metricsState.panelStats.serious }}</div>
          </div>
        </div>
        <div class="stats-row" v-else>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.total }}</div>
            <div class="card-value">{{ metricsState.panelStats.total }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.alarm }}</div>
            <div class="card-value">{{ metricsState.panelStats.alarm }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.serious }}</div>
            <div class="card-value">{{ metricsState.panelStats.serious }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.verification }}</div>
            <div class="card-value">{{ metricsState.panelStats.verification }}</div>
          </div>
        </div>

        <!-- 表格（自适应撑满剩余高度） -->
        <div class="table-wrapper">
          <el-table
            :data="metricsState.panelTable"
            height="100%"
            stripe
            border
          >
            <el-table-column v-for="col in metricsState.panelColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共管理：右侧栈式布局（1:3:3） -->
  <div class="right-stack" v-if="metricsState.sceneActive === 'publicManagement'">
    <!-- 右1：排水管网监测点统计 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon"><i class="icon-supervision"></i></div>
        <h3>排水管网监测点统计</h3>
      </div>
      <div class="container-content">
        <div class="stats-row right3-cards-row">
          <div class="metric-card">
            <div class="card-label">检测点总数</div>
            <div class="card-value">{{ metricsState.pmDrainageStat.totalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">液位报警总数</div>
            <div class="card-value">{{ metricsState.pmDrainageStat.alarmNum }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右2：排水管网检测数据 -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon"><i class="icon-supervision"></i></div>
        <h3>排水管网检测数据</h3>
      </div>
      <div class="container-content">
        <div class="table-wrapper">
          <el-table :data="metricsState.pmPipes" height="100%" stripe border>
            <el-table-column prop="name" label="监测点" width="140" />
            <el-table-column prop="liquidLevel" label="液位(m)" width="100" />
            <el-table-column prop="traffic" label="流量(m³/h)" width="120" />
            <el-table-column prop="time" label="采集时间" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 右3：河道巡河统计（含图表预留） -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon"><i class="icon-rainfall"></i></div>
        <h3>河道巡河统计</h3>
      </div>
      <div class="container-content">
        <div class="stats-row stats-row--compact">
          <div class="metric-card">
            <div class="card-label">巡河完成率</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.completionRate }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">水质报警数</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.alarmNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">问题结办率</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.caseClosureRate }}</div>
          </div>
        </div>
        <div class="chart-wrapper">
          <EChart :options="metricsState.pmRiverChartOptions" width="100%" height="100%" />
        </div>
      </div>
    </div>
  </div>

  <!-- 公共服务：右侧占位 -->
  <div class="floating-panel right-panel" v-if="metricsState.sceneActive === 'publicService'">
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon"><i class="icon-supervision"></i></div>
        <h3>公共服务 - 右侧</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards">
          <div class="metric-card"><div class="card-label">占位</div><div class="card-value">--</div></div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 底部三项操作 -->
  <div class="bottom-actions">
    <div class="action-item secure" @click="metricsState.setScene('publicSecurity')">
      <div class="action-icon"><img :src="iconSecure" alt="公共安全" /></div>
      <div class="action-label">公共安全</div>
    </div>
    <div class="action-item manage" @click="metricsState.setScene('publicManagement')">
      <div class="action-icon"><img :src="iconManage" alt="公共管理" /></div>
      <div class="action-label">公共管理</div>
    </div>
    <div class="action-item service" @click="metricsState.setScene('publicService')">
      <div class="action-icon"><img :src="iconService" alt="公共服务" /></div>
      <div class="action-label">公共服务</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { shallowRef, reactive, onMounted, ref, computed, watch } from 'vue'
import { initGisMap, esriModules, createMarkerGraphic, createMarkerPopup, updateAllPopupPositions, popups } from '@/utils/gis'
import { MetricsAPI, MetricsManagementAPI } from '@/api/sector/metrics'
import riverIcon from '@/assets/imgs/sector/河道水情.png'
import reservoirIcon from '@/assets/imgs/sector/水位监测.png'
import tunnelIcon from '@/assets/imgs/sector/下穿隧道.png'
import pondingIcon from '@/assets/imgs/sector/内涝点.png'
import plantIcon from '@/assets/imgs/sector/污水站.png'
import liquidIcon from '@/assets/imgs/sector/液位检测点.png'
import iconSecure from '@/assets/imgs/sector/公共安全.png'
import iconManage from '@/assets/imgs/sector/公共管理.png'
import iconService from '@/assets/imgs/sector/公共服务.png'
import { useMetricsScene } from './useMetricsScene'
import EChart from '@/components/Echart/src/Echart.vue'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const metricsLayer = shallowRef<any>(null);
const popupDomList: HTMLElement[] = [];
// 右3 图表配置
const pmRiverChartOptions = ref<any>({})
const buildPmRiverChartOptions = (list: any[]) => {
  const x = (list || []).map((i: any) => i?.riverPatrolTarget ?? '-')
  const needed = (list || []).map((i: any) => i?.neededNum ?? 0)
  const completed = (list || []).map((i: any) => i?.completedNum ?? 0)
  const rate = (list || []).map((i: any) => Number(String(i?.completionRate ?? '0').replace('%','')))
  return {
    color: ['#4A90E2', '#FFD166', '#34D399'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } }
    },
    grid: { left: 36, right: 16, top: 24, bottom: 28, containLabel: true },
    legend: { data: ['计划次数','完成次数','完成率'], textStyle: { color: '#e6f4ff' } },
    xAxis: [{
      type: 'category',
      data: x,
      axisLabel: { color: '#cfe8ff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } },
      axisTick: { show: false }
    }],
    yAxis: [
      {
        type: 'value',
        name: '次数',
        nameTextStyle: { color: '#cfe8ff' },
        axisLabel: { color: '#cfe8ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
      },
      {
        type: 'value',
        name: '完成率(%)',
        nameTextStyle: { color: '#cfe8ff' },
        axisLabel: { color: '#cfe8ff' },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
      }
    ],
    series: [
      {
        name: '计划次数',
        type: 'bar',
        barWidth: 14,
        data: needed,
        yAxisIndex: 0,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#66A9FF' },
              { offset: 1, color: '#2B68C5' }
            ]
          }
        }
      },
      {
        name: '完成次数',
        type: 'bar',
        barWidth: 14,
        data: completed,
        yAxisIndex: 0,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FFE08A' },
              { offset: 1, color: '#F5B30E' }
            ]
          }
        }
      },
      {
        name: '完成率',
        type: 'line',
        data: rate,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#34D399' }
      }
    ]
  }
}

// 右3 图表：保持与接口同步

/** 格式化毫秒时间戳为 YYYY/MM/DD HH:mm:ss */
function formatTime(ts?: number | string) {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  const pad = (n: number) => `${n}`.padStart(2, '0')
  const Y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const D = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${Y}/${M}/${D} ${h}:${m}:${s}`
}

/**
 * 指标页-公共安全相关数据
 * 说明来源：`src/api/sector/metrics/index.ts` 中各 API 方法注释
 */
const metricsState = reactive({
  /** 获取内涝点数据：内涝点（易涝点）监测/告警数据列表 */
  carResource: [] as any[],
  /** 获取雨量分布：各行政区/网格的降雨统计与等级，用于分段着色 */
  rainfallDistribution: [] as any[],
  /** 获取水库水情：水库名称、水位、入/出库流量等监测数据 */
  reservoirCondition: [] as any[],
  /** 获取河道水情：河道（断面）水位、流量等监测数据 */
  riverCondition: [] as any[],
  /** 获取隧道数据（接口为 getTunnelCondition）：城市隧道积水/设施状态等数据 */
  watergateCondition: [] as any[],
  /** 获取预警信息：气象/山洪/防汛等综合预警条目列表 */
  flowDistribution: [] as any[]
})

// 公共管理（演示数据，可替换为真实接口结果）
metricsState.pmSummary = reactive({
  totalNum: 0,
  abnormalNum: 0,
  excessNum: 0
})

metricsState.pmFlowStats = reactive([
  { name: '简阳城区', value: 12.6 },
  { name: '石桥片区', value: 6.2 },
  { name: '石盘片区', value: 3.8 }
])

metricsState.pmPlants = reactive<any[]>([])
metricsState.pmPipes = reactive<any[]>([])
metricsState.pmDrainageStat = reactive({ totalNum: 0, alarmNum: 0 })
metricsState.pmRiverPatrol = reactive({
  completionRate: '-',
  alarmNum: 0,
  caseClosureRate: '-',
  detailList: [] as any[]
})

const initMap = async () => {
  console.log('初始化地图')
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // 创建图层
  if (esriModules && !metricsLayer.value) {
    metricsLayer.value = new esriModules.GraphicsLayer();
    gisMap.value.add(metricsLayer.value);
  }
  // 若数据已就绪，首次进入也渲染一次
  try { renderMetricMarkers() } catch {}
};

const fetchAllMetrics = async () => {
  try {
    const [
      carResource,
      rainfallDistribution,
      reservoirCondition,
      riverCondition,
      watergateCondition,
      flowDistribution
    ] = await Promise.all([
      MetricsAPI.getCarResource(),
      MetricsAPI.getRainfallDistribution(),
      MetricsAPI.getReservoirCondition(),
      MetricsAPI.getRiverCondition(),
      MetricsAPI.getWatergateCondition(),
      MetricsAPI.getFlowDistribution()
    ])

    // 将接口数据写入响应式状态
    metricsState.carResource = (carResource as any) ?? []
    metricsState.rainfallDistribution = (rainfallDistribution as any) ?? []
    metricsState.reservoirCondition = (reservoirCondition as any) ?? []
    metricsState.riverCondition = (riverCondition as any) ?? []
    metricsState.watergateCondition = (watergateCondition as any) ?? []
    metricsState.flowDistribution = (flowDistribution as any) ?? []
    // 数据就绪后尝试渲染（首次进入）
    try { renderMetricMarkers() } catch {}
  } catch (error) {
    console.error('fetchAllMetrics error', error)
  }
}

// 打印“公共管理”全部接口返回
const fetchAllManagementAndLog = async () => {
  try {
    const [
      waterPipeDetectionData,
      drainageDetectPointStat,
      riverPatrolPointStat,
      wastewaterPlantData,
      sewagePlantData,
      sewageVolumeStat
    ] = await Promise.all([
      MetricsManagementAPI.getWaterPipeDetectionData(),
      MetricsManagementAPI.getDrainageDetectPointStat(),
      MetricsManagementAPI.getRiverPatrolPointStat(),
      MetricsManagementAPI.getWastewaterPlantData(),
      MetricsManagementAPI.getSewagePlantData(),
      MetricsManagementAPI.getSewageVolumeStat()
    ])

    console.log('[Management] getWaterPipeDetectionData', waterPipeDetectionData)
    console.log('[Management] getDrainageDetectPointStat', drainageDetectPointStat)
    console.log('[Management] getRiverPatrolPointStat', riverPatrolPointStat)
    console.log('[Management] getWastewaterPlantData', wastewaterPlantData)
    console.log('[Management] getSewagePlantData', sewagePlantData)
    console.log('[Management] getSewageVolumeStat', sewageVolumeStat)

    // 将污水处理监测数据同步到左1摘要
    try {
      const d: any = sewagePlantData as any
      metricsState.pmSummary.totalNum = d?.totalNum ?? 0
      metricsState.pmSummary.abnormalNum = d?.abnormalNum ?? 0
      metricsState.pmSummary.excessNum = d?.excessNum ?? 0
    } catch {}

    // 映射污水厂监测数据 → 左3表格
    try {
      const list: any[] = (wastewaterPlantData as any) || []
      metricsState.pmPlants.splice(0, metricsState.pmPlants.length, ...list.map((it: any) => ({
        name: it?.stationName ?? '-',
        flow: it?.thisDayNum ?? '-',
        tp: it?.totalPhosphorus ?? '-',
        tn: it?.totalNitrogen ?? '-',
        nh3: it?.ammoniaNitrogen ?? '-',
        cod: it?.chemicalOxygenDemand ?? '-',
        longitude: it?.longitude,
        latitude: it?.latitude,
        type: 'plant'
      })))
    } catch {}

    // 映射排水管网检测数据 → 右侧表格
    try {
      const list: any[] = (waterPipeDetectionData as any) || []
      metricsState.pmPipes.splice(0, metricsState.pmPipes.length, ...list.map((it: any) => ({
        name: it?.stationName ?? '-',
        liquidLevel: it?.liquidLevel ?? '-',
        traffic: it?.traffic ?? '-',
        time: formatTime(it?.collectionTime),
        longitude: it?.longitude,
        latitude: it?.latitude,
        type: 'pipe'
      })))
    } catch {}

    // 映射排水管网监测点统计 → 右1卡片
    try {
      const s: any = drainageDetectPointStat as any
      metricsState.pmDrainageStat.totalNum = s?.totalNum ?? 0
      metricsState.pmDrainageStat.alarmNum = s?.alarmNum ?? 0
    } catch {}

    // 映射河道巡河统计 → 右3卡片与图例
    try {
      const r: any = riverPatrolPointStat as any
      metricsState.pmRiverPatrol.completionRate = r?.completionRate ?? '-'
      metricsState.pmRiverPatrol.alarmNum = r?.alarmNum ?? 0
      metricsState.pmRiverPatrol.caseClosureRate = r?.caseClosureRate ?? '-'
      metricsState.pmRiverPatrol.detailList = Array.isArray(r?.detailList) ? r.detailList : []
      // 生成 ECharts 配置
      pmRiverChartOptions.value = buildPmRiverChartOptions(metricsState.pmRiverPatrol.detailList)
      // 此时 metricsState 已初始化，安全挂载到其中供模板使用
      // @ts-ignore
      // eslint-disable-next-line
      metricsState.pmRiverChartOptions = pmRiverChartOptions
    } catch {}
  } catch (e) {
    console.error('fetchAllManagementAndLog error', e)
  }
}

// metrics 页面内的场景切换（默认公共安全）
const sceneCtx = useMetricsScene()
metricsState.sceneActive = sceneCtx.active
metricsState.setScene = sceneCtx.setScene

onMounted(() => {
  initMap()
  fetchAllMetrics()
  fetchAllManagementAndLog()
})

/** 根据当前场景/Tab 返回图标与弹窗标题 */
const getLayerAsset = () => {
  // 公共管理：根据条目类型选择图标（管网/污水厂）
  if (metricsState.sceneActive === 'publicManagement') {
    return { icon: liquidIcon, title: '管网与污水厂' }
  }
  // 公共安全：依据 Tab
  const type = metricsState.panel.activeTab
  switch (type) {
    case 'river':
      return { icon: riverIcon, title: '河道水情' }
    case 'reservoir':
      return { icon: reservoirIcon, title: '水库水情' }
    case 'tunnel':
      return { icon: tunnelIcon, title: '下穿隧道' }
    default:
      return { icon: pondingIcon, title: '内涝点' }
  }
}

/** 清理旧弹窗 DOM 与登记 */
const cleanupPopups = () => {
  try { popupDomList.forEach((el) => el?.remove?.()) } catch {}
  popupDomList.length = 0
  try { popups.length = 0 } catch {}
}

/** 渲染指标点位到地图 */
const renderMetricMarkers = () => {
  if (!esriModules || !gisMap.value || !mapView.value) return
  if (!metricsLayer.value) {
    metricsLayer.value = new esriModules.GraphicsLayer()
    gisMap.value.add(metricsLayer.value)
  }
  // 清理
  metricsLayer.value.removeAll()
  cleanupPopups()

  const { icon, title } = getLayerAsset()
  const list = metricsState.sceneActive === 'publicManagement' ? ([...(metricsState.pmPipes || []), ...(metricsState.pmPlants || [])]) : (currentList.value || [])
  console.log('metrics.renderMarkers', metricsState.panel.activeTab, 'listLen=', list.length, icon)
  for (const item of list) {
    const lon = item?.longitude
    const lat = item?.latitude
    if (lon == null || lat == null) continue
    // 公共管理下根据类型选择不同图标
    const markerIcon = (metricsState.sceneActive === 'publicManagement')
      ? (item?.type === 'plant' ? plantIcon : liquidIcon)
      : icon
    const marker = createMarkerGraphic(
      [lon, lat],
      markerIcon,
      { id: item?.id, type: metricsState.panel.activeTab },
      { width: 28, height: 34 }
    )
    if (marker) metricsLayer.value.add(marker)

    // 简易弹窗
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.transform = 'translate(-50%, -100%)'
    el.style.pointerEvents = 'auto'
    el.style.zIndex = '1001'
    el.style.display = 'none'
    el.style.background = 'rgba(0,0,0,0.75)'
    el.style.color = '#fff'
    el.style.padding = '6px 8px'
    el.style.border = '1px solid rgba(255,255,255,0.2)'
    el.style.borderRadius = '6px'
    el.style.fontSize = '12px'
    el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">${title}</div>
      <div>${item?.stationName ?? item?.name ?? '-'}</div>
      <div style="opacity:.8;">${formatTime(item?.collectionTime)}</div>`
    mapView.value.container?.appendChild(el)
    popupDomList.push(el)
    createMarkerPopup(el, [lon, lat])
    el.style.display = 'block'
  }
  updateAllPopupPositions()
}

// 当数据或 Tab 变化时重绘（需在 panel 初始化后注册）
let stopMetricsWatcher: any

// 右侧单面板：Tabs/统计卡片/表格
metricsState.panel = reactive({
  activeTab: 'river' as 'river' | 'reservoir' | 'tunnel' | 'ponding'
})

// 注册重绘监听
stopMetricsWatcher = watch(
  [
    () => metricsState.panel.activeTab,
    () => metricsState.riverCondition,
    () => metricsState.reservoirCondition,
    () => metricsState.watergateCondition,
    () => metricsState.carResource,
    () => metricsState.sceneActive,            // 场景切换时重绘
    () => metricsState.pmPipes                 // 公共管理：管网监测数据变化时重绘
  ],
  () => {
    try { renderMetricMarkers() } catch (e) { console.warn('渲染指标点位失败', e) }
  },
  { deep: true }
)

const columnsMap = {
  river: [
    { prop: 'name', label: '站名', width: 120 },
    { prop: 'river', label: '河流', width: 100 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'flow', label: '流量(m³/h)', width: 120 },
    { prop: 'time', label: '采集时间' }
  ],
  reservoir: [
    { prop: 'name', label: '站名', width: 120 },
    { prop: 'river', label: '河流', width: 100 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'amplitude', label: '涨落(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ],
  tunnel: [
    { prop: 'name', label: '站名', width: 140 },
    { prop: 'area', label: '区域', width: 120 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ],
  ponding: [
    { prop: 'name', label: '点位', width: 140 },
    { prop: 'area', label: '区域', width: 120 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ]
} as const

metricsState.panelColumns = computed(() => columnsMap[metricsState.panel.activeTab])

const currentList = computed<any[]>(() => {
  switch (metricsState.panel.activeTab) {
    case 'river': {
      const data = metricsState.riverCondition as any
      return (data && Array.isArray(data.detailList)) ? data.detailList : []
    }
    case 'reservoir': {
      const data = metricsState.reservoirCondition as any
      return (data && Array.isArray(data.detailList)) ? data.detailList : []
    }
    case 'tunnel': {
      const data = metricsState.watergateCondition as any
      return (data && Array.isArray(data.detailList)) ? data.detailList : []
    }
    case 'ponding': {
      const data = metricsState.carResource as any
      return (data && Array.isArray(data.detailList)) ? data.detailList : []
    }
    default:
      return []
  }
})

const mapToRow = (item: any) => {
  if (metricsState.panel.activeTab === 'river') {
    return {
      name: item?.stationName ?? '-',
      river: item?.riverName ?? '-',
      level: item?.waterLevel ?? '-',
      flow: item?.traffic ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  if (metricsState.panel.activeTab === 'reservoir') {
    return {
      name: item?.stationName ?? '-',
      river: item?.riverName ?? '-',
      level: item?.waterLevel ?? '-',
      amplitude: item?.waterLevelAmplitude ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    return {
      name: item?.stationName ?? '-',
      area: item?.areaName ?? '-',
      level: item?.waterLevel ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  return {
    name: item?.stationName ?? item?.pointName ?? '-',
    area: item?.areaName ?? '-',
    level: item?.waterLevel ?? '-',
    time: formatTime(item?.collectionTime),
    longitude: item?.longitude,
    latitude: item?.latitude
  }
}

metricsState.panelTable = computed(() => currentList.value.map(mapToRow))

metricsState.panelStats = computed(() => {
  if (metricsState.panel.activeTab === 'river') {
    const data = metricsState.riverCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.warmNum ?? 0,
      serious: data?.guaranteeNum ?? 0
    }
  }
  if (metricsState.panel.activeTab === 'reservoir') {
    const data = metricsState.reservoirCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.floodLimitNum ?? 0, // 超汛限
      serious: data?.designNum ?? 0, // 超设计
      verification: data?.verificationNum ?? 0 // 超校核
    }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    const data = metricsState.watergateCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.cautionNum ?? 0, // 预警
      serious: data?.alertNum ?? 0  // 警报
    }
  }
  const list = currentList.value
  return {
    total: list.length ?? 0,
    alarm: list.filter((i: any) => ['YELLOW_ALERT', 'ORANGE_ALERT'].includes(i?.warningLevel?.name) || i?.alarm === true).length || 0,
    serious: list.filter((i: any) => ['RED_ALERT'].includes(i?.warningLevel?.name) || i?.serious === true).length || 0
  }
})

// 统计卡文案
metricsState.panelLabels = computed(() => {
  if (metricsState.panel.activeTab === 'reservoir') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超设计报警数', verification: '超校核报警数' }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
  }
  if (metricsState.panel.activeTab === 'ponding') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
  }
  return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
})

/** 将预警级别名称映射到样式类 */
const getWarningTagClass = (levelName?: string) => {
  switch (levelName) {
    case 'RED_ALERT':
      return 'red'
    case 'ORANGE_ALERT':
      return 'orange'
    case 'YELLOW_ALERT':
      return 'yellow'
    default:
      return ''
  }
}

 

/** 地图定位到表格行坐标 */
metricsState.centerOnPoint = (row: any) => {
  const lon = row?.longitude ?? row?.lon ?? row?.lng
  const lat = row?.latitude ?? row?.lat
  if (!mapView.value || lon == null || lat == null) return
  try {
    mapView.value.goTo({ center: [lon, lat], zoom: 14 })
  } catch (e) {
    console.warn('地图视图定位失败', e)
  }
}
</script>
<style lang="scss" scoped>
#mapContainer {
  width: 100%;
  height: calc(100vh - 56px);
  position: relative;
}

/* 底部三项操作 */
.bottom-actions {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 40px;
  align-items: flex-end;
  padding: 18px 36px 12px; /* 给底板留出内边距 */
  
  /* 半透明圆角底板 */
  &::before {
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
    box-shadow:
      0 10px 26px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    border-radius: 26px;
    backdrop-filter: blur(8px);
    z-index: -1;
  }
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
  
  &:hover {
    transform: translateY(-4px);
    filter: brightness(1.05);
  }
}

.action-icon {
  width: 88px;
  height: 72px;
  padding-top: 12px;
  // background: linear-gradient(180deg, rgba(20, 55, 103, 0.95) 0%, rgba(11, 32, 64, 0.9) 100%);
  // border: 2px sol rgba(74, 144, 226, 0.6);
  // border-radius: 12px 12px 18px 18px;
  // box-shadow:
  //   0 8px 24px rgba(0, 0, 0, 0.5),
  //   inset 0 1px 0 rgba(255, 255, 255, 0.15);
  // backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  z-index: 1;

}

.action-icon i {
  width: 40px;
  height: 40px;
  // border-radius: 50%;
  // background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 100%);
  // box-shadow:
  //   0 4px 12px rgba(0, 0, 0, 0.3),
  //   inset 0 1px 0 rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
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

// /* 三个不同主题色的发光边 */
// .action-item.secure .action-icon { border-color: rgba(74, 144, 226, 0.8); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(74, 144, 226, 0.25), inset 0 1px 0 rgba(255,255,255,0.15); }
// .action-item.manage .action-icon { border-color: rgba(46, 204, 113, 0.8); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(46, 204, 113, 0.25), inset 0 1px 0 rgba(255,255,255,0.15); }
// .action-item.service .action-icon { border-color: rgba(155, 89, 182, 0.8); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(155, 89, 182, 0.25), inset 0 1px 0 rgba(255,255,255,0.15); }

/* 标签色调，与图标主题呼应 */
.action-item.secure .action-label { color: #ffd666; }
.action-item.manage .action-label { color: #c6ffdd; }
.action-item.service .action-label { color: #eac6ff; }

/* 小屏适配 */
@media (max-width: 768px) {
  .bottom-actions {
    gap: 24px;
    bottom: 16px;
  }
  .action-icon {
    width: 76px;
    height: 64px;
  }
  .bottom-actions::before {
    height: 70px;
  }
}

@media (max-width: 480px) {
  .bottom-actions {
    gap: 16px;
    bottom: 12px;
  }
  .action-icon {
    width: 68px;
    height: 56px;
  }
  .action-label {
    font-size: 13px;
  }
  .bottom-actions::before {
    height: 64px;
    min-width: 480px;
  }
}
/* 悬浮面板样式 */
.floating-panel {
  position: absolute;
  top: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px); /* 设定固定可用高度，便于子项按比例分配 */
  overflow-y: auto;
  
  &.left-panel {
    left: 20px;
    width: 480px;
  }
  
  &.right-panel {
    right: 20px;
    width: 480px;
  }
}

/* 公共管理两个右侧浮窗的垂直分布 */
.right-panel--stats {
  top: 80px;
  /* 统计卡较矮，避免滚动条 */
  height: auto;
  overflow: visible;
}
.right-panel--stats .panel-container {
  max-height: 260px;
}
.right-panel--stats .container-content {
  flex: 0 0 auto;
}

/* 右2 占据剩余高度，内部表格滚动 */
.right-panel--pipes {
  top: calc(80px + 260px + 20px); /* 右1高度260 + 间距20 */
  max-height: calc(100vh - (80px + 260px + 20px) - (320px + 20px)); /* 预留给右3(320)和间距20 */
  overflow-y: auto;
}
.right-panel--pipes .panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 右3 浮窗：固定在底部，避免与右2重叠 */
.right-panel--river {
  bottom: 20px;
  top: auto;
  height: 320px; /* 固定高度，便于右2计算剩余空间 */
  overflow: hidden;
}
.right-panel--pipes .container-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.right-panel--pipes .table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
}

/* 公共管理右侧 1:3:3 栈式布局容器 */
.right-stack {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 480px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.right-stack .panel-container.flex-1 { flex: 1 1 0; }
.right-stack .panel-container.flex-3 { flex: 3 1 0; }
.right-stack .panel-container .container-content { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.right-stack .panel-container .table-wrapper { flex: 1 1 auto; min-height: 0; }

/* 右侧（1:3:3）中的表格深色主题，保持与其他表格一致 */
.right-stack {
  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* 右3 卡片缩小，图表更大 */
.right3-panel .right3-cards-row .metric-card {
  padding: 12px;
}
.right3-panel .right3-cards-row .metric-card .card-label { font-size: 11px; margin-bottom: 6px; }
.right3-panel .right3-cards-row .metric-card .card-value { font-size: 20px; }

/* 容器样式 - 深色主题 */
.panel-container {
  display: flex;             /* 作为列布局，让内容区可伸缩 */
  flex-direction: column;
  min-height: 0;             /* 允许在父级 flex 容器内收缩高度 */
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

/* 左侧三个面板的纵向比例控制（1:2:3） */
.left-panel .panel-container.flex-1 { flex: 1 1 0; }
.left-panel .panel-container.flex-2 { flex: 2 1 0; }
.left-panel .panel-container.flex-3 { flex: 3 1 0; }

/* 容器头部 - 深色主题 */
.container-header {
  background: linear-gradient(90deg, rgba(74, 144, 226, 0.9) 0%, rgba(74, 144, 226, 0.6) 30%, rgba(74, 144, 226, 0.3) 60%, rgba(74, 144, 226, 0.1) 80%, transparent 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(74, 144, 226, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  
  /* 添加一个额外的渐变层来增强效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(53, 122, 189, 0.4) 0%, rgba(53, 122, 189, 0.2) 50%, transparent 100%);
    pointer-events: none;
  }
  
  .header-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    z-index: 1;
    
    i {
      width: 16px;
      height: 16px;
      background: none;
      border-radius: 2px;
      
      &.icon-supervision::before {
        content: "🔍";
        color: #4A90E2;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-rainfall::before {
        content: "🌧️";
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-warning::before {
        content: "⚠️";
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
  }
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
    position: relative;
    z-index: 1;
  }
}

/* 容器内容 */
.container-content {
  padding: 20px;
  flex: 1 1 auto;    /* 填满面板剩余空间 */
  min-height: 0;     /* 避免因内容撑开导致比例失效 */
  display: flex;      /* 让内部列表可按剩余高度伸展 */
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
}

/* 表格自适应容器剩余高度 */
.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 6px;
  /* 让 el-table 在 flex 子容器内按百分比高度工作 */
  display: flex;
}
.table-wrapper :deep(.el-table) {
  flex: 1 1 auto;
}

/* 右3 图表容器占满空间 */
.chart-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

/* 右3 上方卡片：紧凑样式 */
.stats-row--compact .metric-card { padding: 12px; }
.stats-row--compact .metric-card .card-label { font-size: 11px; margin-bottom: 6px; }
.stats-row--compact .metric-card .card-value { font-size: 20px; }

/* 督导检查 - 指标卡片样式 */
.metric-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row-cards {
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
}

.row-cards .metric-card {
  flex: 1 1 0;
  min-width: 0;
  padding: 14px;
}

/* 左1横排卡片（公共管理-污水处理检测）缩小字号与卡片内边距，避免溢出 */
.left-panel .row-cards .metric-card .card-label {
  font-size: 11px;
  margin-bottom: 8px;
}
.left-panel .row-cards .metric-card .card-value {
  font-size: 22px;
}

/* 右侧面板 - 横向统计卡片行 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.stats-row .metric-card {
  flex: 1 1 0;
}

.tabs-compact {
  margin-top: -6px;
  margin-bottom: 6px;
}

/* 右侧表格深色主题，参考 dispatch 页面 */
.right-panel {
  :deep(.el-tabs__header) {
    margin: 0 0 6px;
  }
  :deep(.el-tabs__item) {
    color: #e6f4ff;
  }
  :deep(.el-tabs__item.is-active) {
    color: #fff;
    font-weight: 600;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* 统一左右面板表格深色主题（左3表格复用相同风格） */
.left-panel {
  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}

.metric-card {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(53, 122, 189, 0.3) 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 2px solid rgba(74, 144, 226, 0.4);
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.6);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .card-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .card-value {
    font-size: 28px;
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

/* 雨量分布样式 */
.rainfall-content {
  display: flex;
  gap: 20px;
}

.rainfall-map {
  flex: 1;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.2) 100%);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 144, 226, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  
  .map-placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
}

.rainfall-legend {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  
  &.highlight {
    .legend-label {
      color: #4A90E2;
    }
  }
  
  .legend-label {
    font-size: 12px;
    color: white;
  }
  
  .legend-count {
    font-size: 12px;
    color: white;
    font-weight: 600;
  }
}

/* 预警信息样式 */
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;     /* 占满可用高度 */
  min-height: 0;      /* 允许在父容器内收缩 */
  overflow-y: auto;   /* 超出滚动 */
  padding-right: 6px; /* 给滚动条预留一点空间 */
  /* 隐藏滚动条（各主流浏览器） */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.warning-list::-webkit-scrollbar { /* Chrome/Safari */
  width: 0;
  height: 0;
}

.warning-item {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右布局 */
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .warning-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0; /* 使文本在 flex 中可收缩 */
  }
  
  .warning-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* 右对齐 */
    gap: 6px;
    flex: 0 0 auto;
  }
  
  .warning-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .warning-message {
    font-size: 14px;
    color: white;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-all;
  }
  
  .warning-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    width: fit-content;
    
    &.red {
      background: #FF4D4F;
    }
    
    &.yellow {
      background: #FAAD14;
    }
    
    &.orange {
      background: #FF7A00;
    }
  }
  
  .warning-time {
    font-size: 11px;
    color: #999;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-panel {
    &.left-panel {
      width: 420px;
    }
    
    &.right-panel {
      width: 420px;
    }
  }
  
  .rainfall-content {
    flex-direction: column;
  }
  
  .rainfall-legend {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .floating-panel {
    &.left-panel {
      left: 10px;
      width: calc(100% - 20px);
    }
    
    &.right-panel {
      right: 10px;
      width: calc(100% - 20px);
    }
  }
  
  .container-header {
    padding: 12px 16px;
    
    h3 {
      font-size: 14px;
    }
  }
  
  .container-content {
    padding: 16px;
  }
  
  .metric-card {
    padding: 16px;
    
    .card-value {
      font-size: 20px;
    }
  }
}
</style>
