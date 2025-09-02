<template>
  <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
  <at-table-operation v-model:params="queryParams" :config="operationConfig" />
  <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
</template>

<script setup lang="ts">
import { MapLocation } from '@element-plus/icons-vue'
import { DangerAreaApi } from '@/api/Floodctrl/scada/dangerarea'
import { getDictLabel } from '@/utils/dict'
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '风险点名称',
    components: 'input'
  },
  type: {
    label: '风险点类型',
    components: 'select',
    dictType: 'fx_danger_type'
  }
})
const tableConfig = reactive({
  api: DangerAreaApi.getDangerAreaPage,
  fields: {
    name: {
      label: '风险点名称'
    },
    type: {
      label: '风险类型',
      formatter: (value: any) => {
        return getDictLabel('fx_danger_type', value)
      }
    },
    riskLevel: {
      label: '风险等级',
      formatter: (value: any) => {
        return getDictLabel('fx_level_type', value)
      }
    },
    projName: {
      label: '防洪工程'
    },
    population: {
      label: '人口'
    },
    buildings: {
      label: '建筑物'
    },
    adareaName: {
      label: '行政'
    },
    entpName: {
      label: '企事业单位'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const operationConfig = reactive({
  map: {
    icon: MapLocation,
    label: '地图',
    onClick: () => {
      router.push('/scada/flood/map')
    }
  }
})
</script>

<style lang="scss" scoped></style>