<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'

const atTableRef = ref()
const queryParams = reactive<any>({ type: 9 })
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
      type: 9
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
  fields: {
    index: true,
    siteName: {
      label: '站点'
    },
    dailyAvgLevel: {
      label: '水位日均值'
    },
    dailyAvgFlow: {
      label: '流量日均值'
    },
    tenDaysAvgLevel: {
      label: '水位旬均值'
    },
    tenDaysAvgFlow: {
      label: '流量旬均值'
    },
    monthlyAvgLevel: {
      label: '水位月均值'
    },
    monthlyAvgFlow: {
      label: '流量月均值'
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
</script>
