<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-tabs :tabs="tabs" v-model="queryParams.dataType" />
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" @reset="handleReset" />
    <p v-if="queryParams.dataType === '3'" class="tips">蓄水总量：4543万立方米，较上月1日8时(4609万立方米)少蓄66万立方米，可用水量3157万立方米</p>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="activeTableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'

const atTableRef = ref()
const tabs = ref([
  {
    label: '雨情',
    value: '1'
  },
  {
    label: '水情',
    value: '2'
  },
  {
    label: '水库',
    value: '3'
  }
])
const activeTableConfig = computed(() => tableConfig[Number(queryParams.dataType) - 1])

const queryParams = reactive<any>({ type: 5, dataType: '1' })
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
  deptId: {
    label: '行政区域',
    components: 'select',
  },
  siteId: {
    label: '站点',
    components: 'select',
    api: ZtfxMockApi.getStationListByZtfxType,
    params: {
      type: 5
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
const tableConfig = reactive([{
  api: ZtfxMockApi.getZtfxMockPage,
  exclude: ['daterange'],
  fields: {
    index: true,
    time: {
      label: '时间',
      formatter:'dateTime'
    },
    siteName: {
      label: '站点'
    },
    avgRainfall: {
      label: '平均降雨量'
    },
    yearTotalRainfall: {
      label: '今年累计降雨量'
    },
    compareHistoryAvg: {
      label: '较历年平均值'
    },
  }
}, {
  api: ZtfxMockApi.getZtfxMockPage,
  exclude: ['daterange'],
  fields: {
    index: true,
    time: {
      label: '时间',
      formatter:'dateTime'
    },
    siteName: {
      label: '站点'
    },
    waterLevel: {
      label: '水位'
    },
    flow: {
      label: '流量'
    },
  }
}, {
  api: ZtfxMockApi.getZtfxMockPage,
  exclude: ['daterange'],
  fields: {
    index: true,
    time: {
      label: '时间',
      formatter:'dateTime'
    },
    siteName: {
      label: '站点'
    },
    storage: {
      label: '蓄水量'
    },
    availableWater: {
      label: '可用水量'
    },
  }
}])
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleReset = () => {
  queryParams.startTime = ''
  queryParams.endTime = ''
}
</script>
<style lang="scss" scoped>
.tips {
  margin-bottom: 12px;
  color: var(--el-color-danger)
}
</style>
