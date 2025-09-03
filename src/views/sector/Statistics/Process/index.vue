<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch"  @reset="handleReset"/>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'
const atTableRef = ref()
const queryParams = reactive<any>({type:4})
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
      type: 4
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
    surfaceRemaining: {
      label: '面雨量'
    },
    storage: {
      label: '蓄水量'
    },
    rainfall: {
      label: '降雨量'
    },
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
