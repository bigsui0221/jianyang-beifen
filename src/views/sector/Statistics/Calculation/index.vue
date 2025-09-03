<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <Echart :options="echartsOptions" :height="420" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'

const queryParams = reactive<any>({ type: 6 })
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
  siteId: {
    label: '站点',
    components: 'select',
    api: ZtfxMockApi.getStationListByZtfxType,
    params: {
      type: 6
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
  getZtfxMockPage()
}
const echartsOptions = ref<any>({})
const getZtfxMockPage = () => {
  ZtfxMockApi.getZtfxMockPage(queryParams).then((res) => {
    const xName = res?.list?.[0]?.frequencyPoints || []
    const seriesData = {
      peakFlood: res?.list?.[0]?.peakFlood || [],
      historyFlood: res?.list?.[0]?.historyFlood || [],
      measuredFlood: res?.list?.[0]?.measuredFlood || []
    }
    setEchartsOptions(xName, seriesData)
  })
}
const setEchartsOptions = (xName, seriesData) => {
  echartsOptions.value = {
    color: ["#5858CC", "#00C94A", '#333333'],
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
      data: xName,
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
        name: '洪峰',
        data: seriesData.peakFlood,
        type: 'line',
        smooth: true
      },
      {
        name: '实测洪水',
        data: seriesData.measuredFlood,
        type: 'line',
        smooth: true
      },
      {
        name: '历史洪水',
        data: seriesData.historyFlood,
        type: 'line',
        smooth: true
      },
      // {
      //   name: '历史洪水',
      //   symbol: 'pin', // 使用内置的X形状
      //   symbolSize: 16, // X的大小
      //   data: [
      //     [3, 500],
      //     [4, 650],
      //     [6, 560]
      //   ],
      //   type: 'scatter'
      // }
    ],
  }
}
onMounted(() => {
  getZtfxMockPage()
})
</script>
