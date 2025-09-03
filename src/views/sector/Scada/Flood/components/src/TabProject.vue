// 险工险段
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
import { MapLocation } from '@element-plus/icons-vue'
import { RiskSectionApi } from '@/api/Floodctrl/scada/risksection'
const message = useMessage() // 消息弹窗
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '工程名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: RiskSectionApi.getRiskSectionPage,
  fields: {
    name: {
      label: '工程名称'
    },
    riverName: {
      label: '所在河流'
    },
    address: {
      label: '工程位置'
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
      label: '工程名称',
      components: 'input',
      required: true,
      row: 24
    },
    riverName: {
      label: '所在河流',
      components: 'input',
      required: true,
      row: 24
    },
    point: {
      label: '工程位置',
      components: 'inputMap',
      required: true,
      onChange: (value: any) => {
        dialogConfig.formData.lon = value.longitude
        dialogConfig.formData.lat = value.latitude
      },
      row: 24
    },
    address: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    remark: {
      label: '文字描述',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24
    },
    files: {
      label: '图片资料',
      components: 'uploadFile',
      row: 24,
      required: true
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
    RiskSectionApi.deleteRiskSection(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = RiskSectionApi.createRiskSection
  if (data.id)
    promise = RiskSectionApi.updateRiskSection
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
      router.push('/scada/flood/map')
    }
  }
})
</script>

<style lang="scss" scoped></style>