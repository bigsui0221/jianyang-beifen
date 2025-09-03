<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { RealDataApi } from '@/api/Floodctrl/scada/realdata'
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  siteName: {
    label: '内涝点名称',
    components: 'input'
  },
  address: {
    label: '位置',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: RealDataApi.getRealDataByInnerFlood,
  fields: {
    time: {
      label: '上报时间',
      formatter: 'dateTime'
    },
    siteName: {
      label: '站点名称'
    },
    address: {
      label: '位置'
    },
    value: {
      label: '实时数据'
    },
    wlSaValueResult: {
      label: '超警戒'
    },
    wlSwValueResult: {
      label: '超警示'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
</script>
