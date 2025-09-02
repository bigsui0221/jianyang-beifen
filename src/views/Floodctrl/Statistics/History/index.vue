<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" @reset="handleReset" />
    <at-table-operation :title="isEcharts ? '图表信息' : '列表信息'">
      <template #right>
        <el-button type="primary" :icon="Tickets" @click="isEchartsSwitch(true)" v-if="!isEcharts">图表</el-button>
        <el-button type="primary" :icon="DataLine" @click="isEchartsSwitch(false)" v-else>列表</el-button>
      </template>
    </at-table-operation>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" v-show="!isEcharts"
      @load-end="handleLoadEnd" />
    <Echart :options="echartsOptions" :height="420" v-show="isEcharts" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'
import { formatToDateTime } from '@/utils/dateUtil'
import { DataLine, Tickets } from '@element-plus/icons-vue'
const atTableRef = ref()
const isEcharts = ref(false)
const queryParams = reactive<any>({ type: 3 })
const queryFields = reactive({
  daterange: {
    label: '数据时间段',
    components: 'date',
    type: 'daterange',
    onChange: (val) => {
      queryParams.startTime = val[0]
      queryParams.endTime = val[1]
    }
  },
  // deptId: {
  //   label: '区域',
  //   components: 'select',
  // },
  // value4: {
  //   label: '流域',
  //   components: 'select',
  //   options: []
  // },
  // value5: {
  //   label: '类型',
  //   components: 'select',
  //   options: []
  // },
  siteId: {
    label: '站点',
    components: 'select',
    api: ZtfxMockApi.getStationListByZtfxType,
    params: {
      type: 3
    },
    response: (data) => {
      return data.map((item: any) => {
        return {
          label: item.siteName,
          value: item.id
        }
      })
    }
  }
})
const tableConfig = reactive({
  api: ZtfxMockApi.getZtfxMockPage,
  exclude: ['daterange'],
  fields: {
    index: true,
    siteName: {
      label: '站点'
    },
    currentRiverFlow: {
      label: '河道径流'
    },
    currentRainfall: {
      label: '降水量'
    },
    currentStorage: {
      label: '蓄水量'
    },
  }
})
const isEchartsSwitch = (val: boolean) => {
  isEcharts.value = val
  nextTick(() => {
    setEchartsOptions()
  })
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleReset = () => {
  queryParams.startTime = ''
  queryParams.endTime = ''
}
const echartsOptions = ref<any>({})
const setEchartsOptions = () => {
  echartsOptions.value = {
    color: ["#5858CC", "#00C94A", "#FF9900", "#FF0000", "#0099FF", "#FF00FF"],
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 60
    },
    legend: {
      icon: "rect",
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      itemGap: 20,
      textStyle: {
        color: '#333',
        fontSize: 14
      },
      itemWidth: 12,
      itemHeight: 12,
    },
    xAxis: {
      type: 'category',
      data: echartsData.xName,
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      type: 'value'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        if (params.length === 0) return '';
        const fullXText = params[0].name;
        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${fullXText}时</div>`;
        params.forEach(item => {
          result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 5px;"></span>
                          <span>${item.seriesName}: ${item.value} m³/s</span>
                  </div>`;
        });
        return result;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      padding: 10
    },
    series: [
      {
        name: '河道径流当前值',
        data: echartsData.currentRiverFlow,
        type: 'bar',
        smooth: true
      },
      {
        name: '河道径流去年同期',
        data: echartsData.lastYearRiverFlow,
        type: 'bar',
        smooth: true
      },
      {
        name: '降水量当前值',
        data: echartsData.currentRainfall,
        type: 'bar',
        smooth: true
      },
      {
        name: '降水量去年同期',
        data: echartsData.lastYearRainfall,
        type: 'bar',
        smooth: true
      },
      {
        name: '蓄水量当前值',
        data: echartsData.currentStorage,
        type: 'bar',
        smooth: true
      },
      {
        name: '蓄水量去年同期',
        data: echartsData.lastYearStorage,
        type: 'bar',
        smooth: true
      },
    ],
  }
}
const echartsData = reactive({
  xName: [] as any[],
  currentRiverFlow: [] as any[],
  lastYearRiverFlow: [] as any[],
  currentRainfall: [] as any[],
  lastYearRainfall: [] as any[],
  currentStorage: [] as any[],
  lastYearStorage: [] as any[],
})
const handleLoadEnd = (data) => {
  data.forEach((item) => {
    echartsData.xName.push(formatToDateTime(item.dateTime))
    echartsData.currentRiverFlow.push(item.currentRiverFlow)
    echartsData.lastYearRiverFlow.push(item.lastYearRiverFlow)
    echartsData.currentRainfall.push(item.currentRainfall)
    echartsData.lastYearRainfall.push(item.lastYearRainfall)
    echartsData.currentStorage.push(item.currentStorage)
    echartsData.lastYearStorage.push(item.lastYearStorage)
  })
}
</script>
