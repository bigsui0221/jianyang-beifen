<template>
  <div class="metrics-page">
    <div class="content-container">
      <div class="back-bar" @click="goBack">
        <span class="back-arrow">←</span>
        <span class="back-text">数据详情</span>
      </div>
    <!-- 顶部分类切换 -->
    <el-tabs v-model="activeTab" class="mb-16">
      <el-tab-pane label="污水处理监测" name="sewage" />
      <el-tab-pane label="排水管网检测" name="drain" />
      <el-tab-pane label="供水水质检测" name="water-quality" />
      <el-tab-pane label="供水管网检测" name="water-pipe" />
    </el-tabs>

    <!-- 筛选区 -->
    <el-form :inline="true" :model="query" class="mb-12 filter-bar">
      <el-form-item label="数据更新时间">
        <el-date-picker
          v-model="query.timeRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          :clearable="true"
        />
      </el-form-item>

      <el-form-item label="污水厂名称">
        <el-input
          v-model="query.name"
          placeholder="模糊搜索"
          clearable
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item label="地点">
        <el-input
          v-model="query.location"
          placeholder="模糊搜索"
          clearable
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
        <el-button @click="handleReset" :disabled="loading">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区 -->
    <div class="content-fill">
      <div class="table-area">
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      style="width: 100%"
          height="100%"
        >
          <!-- Tab1：污水处理监测（显示所有返回字段） -->
          <template v-if="activeTab === 'sewage'">
            <el-table-column prop="stationName" label="污水厂" min-width="140" />
            <el-table-column prop="location" label="地点" min-width="180" />
            <el-table-column prop="updatedAt" label="数据更新时间" min-width="180" />
            <el-table-column prop="thisDayNum" label="当日处理量(m³/日)" min-width="150" />
            <el-table-column prop="yesterdayNum" label="昨日处理量(m³/日)" min-width="150" />
            <el-table-column prop="thisMonthNum" label="当月处理量(m³)" min-width="150" />
            <el-table-column prop="processingScale" label="处理规模" min-width="120" />
            <el-table-column prop="totalPhosphorus" label="总磷(mg/L)" min-width="120" />
            <el-table-column prop="totalNitrogen" label="总氮(mg/L)" min-width="120" />
            <el-table-column prop="ammoniaNitrogen" label="氨氮(mg/L)" min-width="120" />
            <el-table-column prop="chemicalOxygenDemand" label="COD(mg/L)" min-width="120" />
            <el-table-column prop="waterQualityStandard" label="出水水质达标率(%)" min-width="160" />
            <el-table-column prop="longitude" label="经度" min-width="120" />
            <el-table-column prop="latitude" label="纬度" min-width="120" />
          </template>
          <!-- Tab2：排水管网检测（显示所有返回字段） -->
          <template v-else-if="activeTab === 'drain'">
            <el-table-column prop="stationName" label="监测点" min-width="140" />
            <el-table-column prop="location" label="地点" min-width="160" />
            <el-table-column prop="updatedAt" label="采集时间" min-width="180" />
            <el-table-column prop="liquidLevel" label="液位(m)" min-width="120" />
            <el-table-column prop="warmLiquidLevel" label="报警液位(m)" min-width="120" />
            <el-table-column prop="traffic" label="流量(m³/h)" min-width="140" />
            <el-table-column prop="longitude" label="经度" min-width="120" />
            <el-table-column prop="latitude" label="纬度" min-width="120" />
          </template>
          <!-- Tab3：供水水质检测（显示所有返回字段） -->
          <template v-else-if="activeTab === 'water-quality'">
            <el-table-column prop="stationName" label="水厂" min-width="140" />
            <el-table-column prop="location" label="地点" min-width="160" />
            <el-table-column prop="updatedAt" label="采集时间" min-width="180" />
            <el-table-column prop="inTurbidity" label="进水浊度(NTU)" min-width="140" />
            <el-table-column prop="inPublicHealth" label="进水PH" min-width="120" />
            <el-table-column prop="outTurbidity" label="出水浊度(NTU)" min-width="140" />
            <el-table-column prop="outPublicHealth" label="出水PH" min-width="120" />
            <el-table-column prop="outResidualChlorine" label="出水余氯(mg/L)" min-width="160" />
            <el-table-column prop="outIron" label="出水铁(mg/L)" min-width="140" />
            <el-table-column prop="outManganese" label="出水锰(mg/L)" min-width="140" />
            <el-table-column prop="longitude" label="经度" min-width="120" />
            <el-table-column prop="latitude" label="纬度" min-width="120" />
          </template>
          <!-- Tab4：供水管网检测（显示所有返回字段） -->
          <template v-else-if="activeTab === 'water-pipe'">
            <el-table-column prop="stationName" label="监测点" min-width="140" />
            <el-table-column prop="location" label="地点" min-width="160" />
            <el-table-column prop="updatedAt" label="采集时间" min-width="180" />
            <el-table-column prop="pressure" label="压力(MPa)" min-width="120" />
            <el-table-column prop="residualChlorine" label="余氯(mg/L)" min-width="120" />
            <el-table-column prop="turbidity" label="浊度(NTU)" min-width="120" />
            <el-table-column prop="instantaneousTraffic" label="瞬时流量(m³/h)" min-width="150" />
            <el-table-column prop="cumulativeTraffic" label="累积流量(m³)" min-width="150" />
            <el-table-column prop="longitude" label="经度" min-width="120" />
            <el-table-column prop="latitude" label="纬度" min-width="120" />
          </template>
          <!-- 其他 Tab：先沿用旧字段 -->
          <template v-else>
      <el-table-column prop="plantCode" label="污水厂名称" min-width="140" />
      <el-table-column prop="location" label="地点" min-width="220" />
      <el-table-column prop="updatedAt" label="数据更新时间" min-width="180" />
      <el-table-column prop="todayInflow" label="当日处理量" min-width="120" />
      <el-table-column prop="todayOutflow" label="当日处理量" min-width="120" />
      <el-table-column prop="monthFlow" label="当月处理量" min-width="120" />
      <el-table-column prop="tp" label="总磷" min-width="100" />
      <el-table-column prop="tn" label="总氮" min-width="100" />
      <el-table-column prop="nh3" label="氨氮" min-width="100" />
      <el-table-column prop="cod" label="化学需氧量" min-width="120" />
      <el-table-column prop="outStandard" label="出水水质标准" min-width="140" />
          </template>
    </el-table>
      </div>

    <!-- 分页 -->
    <div class="mt-12 flex-center">
      <el-pagination
        class="pager"
        background
        layout="total, prev, pager, next, jumper"
        :page-size="query.pageSize"
        :current-page="query.pageNum"
        :total="total"
        @current-change="handlePageChange"
      />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { MetricsServiceDetailAPI } from '@/api/sector/metrics'
import { useRouter } from 'vue-router'

type Row = {
  // Tab1 字段
  stationName?: string
  location: string
  updatedAt: string
  thisDayNum?: number
  yesterdayNum?: number
  thisMonthNum?: number
  processingScale?: string
  totalPhosphorus?: number
  totalNitrogen?: number
  ammoniaNitrogen?: number
  chemicalOxygenDemand?: number
  waterQualityStandard?: number
  longitude?: number
  latitude?: number
  // 其他 Tab 兼容旧字段
  plantCode?: string
  todayInflow?: number
  todayOutflow?: number
  monthFlow?: number
  tp?: number
  tn?: number
  nh3?: number
  cod?: number
  outStandard?: string
}

const activeTab = ref<'sewage' | 'drain' | 'water-quality' | 'water-pipe'>('sewage')

const query = reactive({
  timeRange: [] as string[],
  name: '',
  location: '',
  pageNum: 1,
  pageSize: 10,
})

const loading = ref(false)
const tableData = ref<Row[]>([])
const total = ref(0)
const router = useRouter()

const formatTime = (ts?: number | string) => {
  if (!ts && ts !== 0) return '-'
  const d = new Date(Number(ts))
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: query.pageNum,
      pageSize: query.pageSize,
      stationName: query.name || undefined,
      location: query.location || undefined,
      collectionStartTime: query.timeRange?.[0] || undefined,
      collectionEndTime: query.timeRange?.[1] || undefined,
    }

    let list: any[] = []
    let totalNum = 0
    if (activeTab.value === 'sewage') {
      const res: any = await MetricsServiceDetailAPI.getSewagePlantData(params)
      const payload = (res?.data ?? res)
      list = Array.isArray(payload?.list) ? payload.list : (Array.isArray(payload) ? payload : [])
      totalNum = payload?.total ?? list.length
      tableData.value = list.map((it: any) => ({
        stationName: it?.stationName ?? '-',
        location: it?.location ?? '-',
        updatedAt: formatTime(it?.collectionTime),
        thisDayNum: it?.thisDayNum,
        yesterdayNum: it?.yesterdayNum,
        thisMonthNum: it?.thisMonthNum,
        processingScale: it?.processingScale,
        totalPhosphorus: it?.totalPhosphorus,
        totalNitrogen: it?.totalNitrogen,
        ammoniaNitrogen: it?.ammoniaNitrogen,
        chemicalOxygenDemand: it?.chemicalOxygenDemand,
        waterQualityStandard: it?.waterQualityStandard,
        longitude: it?.longitude,
        latitude: it?.latitude
      }))
    } else if (activeTab.value === 'drain') {
      const res: any = await MetricsServiceDetailAPI.getSewagePlantPointStat(params)
      const payload = (res?.data ?? res)
      list = Array.isArray(payload?.list) ? payload.list : (Array.isArray(payload) ? payload : [])
      totalNum = payload?.total ?? list.length
      tableData.value = list.map((it: any) => ({
        stationName: it?.stationName ?? '-',
        location: it?.location ?? '-',
        updatedAt: formatTime(it?.collectionTime),
        liquidLevel: it?.liquidLevel,
        warmLiquidLevel: it?.warmLiquidLevel,
        traffic: it?.traffic,
        longitude: it?.longitude,
        latitude: it?.latitude
      }))
    } else if (activeTab.value === 'water-quality') {
      const res: any = await MetricsServiceDetailAPI.getWaterQualityData(params)
      const payload = (res?.data ?? res)
      list = Array.isArray(payload?.list) ? payload.list : (Array.isArray(payload) ? payload : [])
      totalNum = payload?.total ?? list.length
      tableData.value = list.map((it: any) => ({
        stationName: it?.stationName ?? '-',
        location: it?.location ?? '-',
        updatedAt: formatTime(it?.collectionTime),
        inTurbidity: it?.inTurbidity,
        inPublicHealth: it?.inPublicHealth,
        outTurbidity: it?.outTurbidity,
        outPublicHealth: it?.outPublicHealth,
        outResidualChlorine: it?.outResidualChlorine,
        outIron: it?.outIron,
        outManganese: it?.outManganese,
        longitude: it?.longitude,
        latitude: it?.latitude
      }))
    } else {
      const res: any = await MetricsServiceDetailAPI.getWaterQualityPointStat(params)
      const payload = (res?.data ?? res)
      list = Array.isArray(payload?.list) ? payload.list : (Array.isArray(payload) ? payload : [])
      totalNum = payload?.total ?? list.length
      tableData.value = list.map((it: any) => ({
        stationName: it?.stationName ?? '-',
        location: it?.location ?? '-',
        updatedAt: formatTime(it?.collectionTime),
        pressure: it?.pressure,
        residualChlorine: it?.residualChlorine,
        turbidity: it?.turbidity,
        instantaneousTraffic: it?.instantaneousTraffic,
        cumulativeTraffic: it?.cumulativeTraffic,
        longitude: it?.longitude,
        latitude: it?.latitude
      }))
    }
    total.value = Number(totalNum) || tableData.value.length
  } catch (e) {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  fetchList()
}

const handleReset = () => {
  query.timeRange = []
  query.name = ''
  query.location = ''
  query.pageNum = 1
  fetchList()
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  fetchList()
}

onMounted(fetchList)

const goBack = () => {
  try { router.back() } catch {}
}

watch(activeTab, () => {
  query.pageNum = 1
  fetchList()
})
</script>

<style scoped>
.mb-16 { margin-bottom: 16px; }
.mb-12 { margin-bottom: 12px; }
.mt-12 { margin-top: 12px; }
.flex-center { display: flex; justify-content: center; }
.metrics-page { padding: 12px; background: #0e1c2f; height: calc(100vh - 56px); }
.content-container {
  background: rgba(9,26,65,0.6);
  box-shadow: inset 0px 0px 32px 0px rgba(30,168,255,0.25);
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.back-bar { display: inline-flex; align-items: center; gap: 8px; color: #e6f4ff; cursor: pointer; user-select: none; margin-bottom: 8px; }
.back-bar:hover { opacity: 0.9; }
.back-arrow { font-size: 18px; line-height: 1; }
.back-text { font-size: 14px; font-weight: 600; }
.content-fill { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.table-area { flex: 1 1 auto; min-height: 0; display: flex; }
.table-area :deep(.el-table) { flex: 1 1 auto; }

/* Tabs 精简为紧凑深色风格，参考指标页 */
:deep(.el-tabs__header) { margin: 0 0 8px; border-bottom: 0 none; }
:deep(.el-tabs__nav-wrap::after) { height: 0 !important; }
:deep(.el-tabs__item) { color: #cfe8ff; }
:deep(.el-tabs__item.is-active) { color: #ffffff; font-weight: 600; }
:deep(.el-tabs__active-bar) { background-color: #66A9FF; }

/* 表格深色主题 */
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
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
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
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background: rgba(255, 255, 255, 0.03); }

/* 表单与输入框深色统一样式 */
.filter-bar { margin-bottom: 12px; }
.filter-bar :deep(.el-form-item) {
  margin-right: 12px;
  margin-bottom: 10px;
}
.filter-bar :deep(.el-form-item__label) {
  color: #cfe8ff;
  font-weight: 500;
}
.filter-bar :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: none;
  border-radius: 6px;
  transition: all .2s ease;
}
.filter-bar :deep(.el-input__inner::placeholder) { color: rgba(255, 255, 255, 0.55); }
.filter-bar :deep(.el-input__inner) { color: #e6f4ff; background: transparent !important; }
.filter-bar :deep(.el-input__wrapper::before),
.filter-bar :deep(.el-input__wrapper::after) { background: transparent; }
.filter-bar :deep(.el-input__suffix) { color: #cfe8ff; }
.filter-bar :deep(.el-icon) { color: inherit; }

/* 解决日期范围输入框中间仍为白色的问题 */
.filter-bar :deep(.el-range-editor) { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255,255,255,0.14); }
.filter-bar :deep(.el-range-editor .el-range-input) {
  background: transparent !important;
  color: #e6f4ff;
}
.filter-bar :deep(.el-range-editor .el-range-separator) { color: rgba(255,255,255,0.7); }

/* Chrome 自动填充去除白底 */
.filter-bar :deep(input:-webkit-autofill),
.filter-bar :deep(textarea:-webkit-autofill) {
  /* 去除大面积白底覆盖 */
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: #e6f4ff !important;
  caret-color: #e6f4ff;
}
.filter-bar :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 169, 255, 0.6);
}
.filter-bar :deep(.is-focus .el-input__wrapper),
.filter-bar :deep(.el-input__wrapper.is-focus) {
  border-color: #66A9FF;
  box-shadow: 0 0 0 2px rgba(102, 169, 255, 0.2);
}
.filter-bar :deep(.el-date-editor.el-input) { width: 300px; }
.filter-bar :deep(.el-button--primary) { background: #3b82f6; border-color: #3b82f6; }
.filter-bar :deep(.el-button--primary:hover) { filter: brightness(1.05); }

/* 分页器深色主题与紧凑样式 */
.pager { --pg-bg: rgba(255,255,255,0.06); --pg-border: rgba(255,255,255,0.14); }
.pager :deep(.el-pagination__total) { color: #cfe8ff; margin-right: 10px; }
.pager :deep(.btn-prev),
.pager :deep(.btn-next),
.pager :deep(.el-pager li) {
  background: var(--pg-bg);
  border: 1px solid var(--pg-border);
  color: #e6f4ff;
  border-radius: 6px;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
}
.pager :deep(.el-pager li.is-active) {
  background: rgba(102,169,255,0.25);
  border-color: rgba(102,169,255,0.6);
  color: #fff;
  font-weight: 600;
}
.pager :deep(.el-pagination .el-input__wrapper) {
  background: var(--pg-bg);
  border: 1px solid var(--pg-border);
}
.pager :deep(.el-pagination .el-input__inner) { color: #e6f4ff; }

/* 强力覆盖外部样式：去除 el-input 内层白色填充阴影，并统一文字颜色 */
.filter-bar :deep(.el-input .el-input__wrapper .el-input__inner) {
  box-shadow: none !important;
  --el-input-text-color: #e6f4ff !important;
  background: transparent !important;
}
</style>