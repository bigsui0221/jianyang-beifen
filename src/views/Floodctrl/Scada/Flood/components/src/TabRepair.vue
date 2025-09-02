// 水毁修复
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
import { ProjectRepairApi } from '@/api/Floodctrl/scada/projectrepair'
import { ProjectInfoApi } from '@/api/Floodctrl/scada/projectinfo'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '工程名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: ProjectRepairApi.getProjectRepairPage,
  fields: {
    name: {
      label: '工程名称'
    },
    destoryTime: {
      label: '发生时间',
      formatter:'dateTime'
    },
    repairTime: {
      label: '修复时间',
      formatter:'dateTime'
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
      components: 'select',
      options: [],
      required: true,
      row: 24
    },
    destoryDetail: {
      label: '水毁情况',
      components: 'input',
      required: true,
      row: 24
    },
    repairPlan: {
      label: '修复计划',
      components: 'input',
      required: true,
      row: 24
    },
    files: {
      label: '附件',
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
    ProjectRepairApi.deleteProjectRepair(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = ProjectRepairApi.createProjectRepair
  if (data.id)
    promise = ProjectRepairApi.updateProjectRepair
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
  }
})

const initSelectOptions = () => {
  ProjectInfoApi.getProjectInfoPage({
    pageNo: 1,
    pageSize: 9999
  }).then((res) => {
    dialogConfig.fields.name.options = res.list.map((item) => {
      return {
        label: item.name,
        value: item.name
      }
    })
  })
}
onMounted(() => {
  initSelectOptions()
})
</script>

<style lang="scss" scoped></style>