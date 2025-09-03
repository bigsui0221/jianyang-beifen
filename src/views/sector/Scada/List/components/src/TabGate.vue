<template>
  <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
  <at-table-operation v-model:params="queryParams" :config="operationConfig" />
  <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
    <template #operation="{ row }">
      <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
      <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
      <el-button link type="primary" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
  <at-table-dialog
    v-model="dialogConfig.visible"
    :config="dialogConfig"
    @submit="submitDialogForm"
  />
</template>

<script setup lang="ts">
import { MapLocation } from '@element-plus/icons-vue'
import { SluiceStInfoApi } from '@/api/Floodctrl/scada/sluicestinfo'
import { getDictLabel } from '@/utils/dict'
import { formatToDate, formatToDateTime } from '@/utils/dateUtil'
const message = useMessage() // 消息弹窗
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '水闸名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: SluiceStInfoApi.getSluiceStInfoPage,
  fields: {
    name: {
      label: '水闸名称'
    },
    address: {
      label: '位置'
    },
    type: {
      label: '水闸类型',
      formatter: (val) => {
        return getDictLabel('fx_gate_type', val)
      }
    },
    buildTime: {
      label: '建设年份',
      formatter: 'date'
    },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '新增',
  readonly: false,
  width: '600px',
  formData: {} as any,
  fields: {
    name: {
      label: '水闸名称',
      components: 'input',
      required: true,
      row: 24
    },
    mapAddress: {
      label: '水闸位置',
      components: 'inputMap',
      required: true,
      row: 24,
      onChange: (val) => {
        dialogConfig.formData.lon = val.longitude
        dialogConfig.formData.lat = val.latitude
      }
    },
    address: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    type: {
      label: '水闸类型',
      components: 'select',
      dictType: 'fx_gate_type',
      required: true,
      row: 24
    },
    buildTime: {
      label: '建设年份',
      components: 'date',
      required: true,
      row: 24,
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
}
const handleInfo = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '详情'
  dialogConfig.formData = { ...row,buildTime:formatToDate(row.buildTime) }
  dialogConfig.readonly = true
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row,buildTime:formatToDateTime(row.buildTime) }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    SluiceStInfoApi.deleteSluiceStInfo(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = SluiceStInfoApi.createSluiceStInfo
  if (data.id) promise = SluiceStInfoApi.updateSluiceStInfo
  promise({...data,buildTime:new Date(data.buildTime).getTime()}).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '新增'
  },
  map: {
    icon: MapLocation,
    label: '地图',
    onClick: () => {
      router.push('/scada/list/map')
    }
  }
})
</script>

<style lang="scss" scoped>
</style>