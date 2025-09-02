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
  <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
</template>

<script setup lang="ts">
import { PumpStInfoApi } from '@/api/Floodctrl/scada/pumpstinfo'
import { MapLocation } from '@element-plus/icons-vue'
const message = useMessage() // 消息弹窗
const router = useRouter() // 路由
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '泵站名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: PumpStInfoApi.getPumpStInfoPage,
  fields: {
    name: {
      label: '泵站名称'
    },
    wtwkName: {
      label: '水厂名称'
    },
    address: {
      label: '泵站位置'
    },
    pumpModel: {
      label: '泵站型号'
    },
    pumpScale: {
      label: '泵站规模'
    },
    operateUnit: {
      label: '管理单位'
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
      label: '泵站名称',
      components: 'input',
      required: true,
      row: 24
    },
    wtwkName: {
      label: '水厂名称',
      components: 'input',
      required: true,
      row: 24
    },
    mapAddress: {
      label: '泵站位置',
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
    pumpModel: {
      label: '泵站型号',
      components: 'input',
      required: true,
      row: 24
    },
    pumpScale: {
      label: '泵站规模',
      components: 'input',
      required: true,
      row: 24
    },
    operateUnit: {
      label: '管理单位',
      components: 'input',
      required: true,
      row: 24
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
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = true
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    PumpStInfoApi.deletePumpStInfo(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = PumpStInfoApi.createPumpStInfo
  if (data.id) promise = PumpStInfoApi.updatePumpStInfo
  promise(data).then(() => {
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

<style lang="scss" scoped></style>