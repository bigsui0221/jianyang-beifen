<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" @reset="handleReset" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'

const atTableRef = ref()
const queryParams = reactive<any>({
  type: 1,
  startTime: '',
  endTime: ''
})
const queryFields = reactive({
  daterange: {
    label: '数据时段',
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
      type: 1
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
    river: {
      label: '所属河流'
    },
    riseRate: {
      label: '超涨幅(%)'
    },
    overAlertCount: {
      label: '超警次数'
    },
    overProtectCount: {
      label: '超保次数'
    },
    overHistoryCount: {
      label: '超历史次数'
    },
    peakFlow: {
      label: '洪峰流量(m³/s)'
    },
    highestLevel: {
      label: '最高水位(m)'
    },
    alertDuration: {
      label: '超警持续时间(h)'
    },
    inflow: {
      label: '来水量(万m³)'
    },
    demand: {
      label: '需水量(万m³)'
    },
    levelYearCompare: {
      label: '水位同比'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleReset = () => {
  queryParams.startTime = ''
  queryParams.endTime = ''
}
</script>
