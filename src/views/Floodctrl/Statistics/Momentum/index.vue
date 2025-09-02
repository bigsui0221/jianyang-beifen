<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <Echart :options="echartsOptions" :height="420" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'
import { formatToDateTime } from '@/utils/dateUtil'

const queryParams = reactive<any>({ type: 7 })
const queryFields = reactive({
  time1: {
    label: '数据时间段',
    components: 'date',
    type: 'daterange',
    onChange: (val) => {
      queryParams.time1startTime = val[0]
      queryParams.time1endTime = val[1]
    }
  },
  time2: {
    label: '对比时段',
    components: 'date',
    type: 'daterange',
    onChange: (val) => {
      queryParams.time2startTime = val[0]
      queryParams.time2endTime = val[1]
    }
  },
  siteId: {
    label: '站点',
    components: 'select',
    api: ZtfxMockApi.getStationListByZtfxType,
    params: {
      type: 7
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
const handleSearch = () => {
  getZtfxMockPage('time1')
  getZtfxMockPage('time2')
}
const echartsOptions = ref<any>({})
const setEchartOptions = () => {
  echartsOptions.value = {
    color: ["#5858CC", "#00C94A"],
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
        name: '水位',
        data: echartsData.time1,
        type: 'line',
        smooth: true
      },
      {
        name: '对比水位',
        data: echartsData.time2,
        type: 'line',
        smooth: true
      },
    ],
  }
}
const echartsData = reactive<any>({
  xName: [],
  time1: [],
  time2: []
})
const getZtfxMockPage = (key) => {
  ZtfxMockApi.getZtfxMockPage({
    siteId:queryParams.siteId,
    type: 7,
    startTime: queryParams[key + 'startTime'],
    endTime: queryParams[key + 'endTime'],
  }).then((res) => {
    let xName: any[] = []
    res?.list?.forEach(item => {
      xName.push(formatToDateTime(item.time))
      echartsData[key].push(item.waterLevel)
    })
    echartsData.xName = xName
    setEchartOptions()
  })
}
onMounted(() => {
  queryParams.time1startTime = formatToDateTime(new Date().setDate(new Date().getDate() - 10))
  queryParams.time1endTime = formatToDateTime(new Date())
  queryParams.time1 = [queryParams.time1startTime, queryParams.time1endTime]
  queryParams.time2startTime = formatToDateTime(new Date().setDate(new Date().getDate() - 20))
  queryParams.time2endTime = formatToDateTime(new Date().setDate(new Date().getDate() - 10))
  queryParams.time2 = [queryParams.time2startTime, queryParams.time2endTime]
  getZtfxMockPage('time1')
  getZtfxMockPage('time2')
})
</script>
