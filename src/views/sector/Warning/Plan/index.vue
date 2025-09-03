<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleDel(row)">导出</el-button>
      </template>
    </at-table>
    <at-table-dialog
      v-model="dialogConfig.visible"
      :config="dialogConfig"
      @submit="submitDialogForm"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import {SimplePlanApi} from '@/api/Floodctrl/warning/simpleplan'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '预案名称',
    components: 'input',
  },
  level: {
    label: '预案等级',
    components: 'select',
    dictType:'fx_plan_level'
  },
})
const tableConfig = reactive({
  api: SimplePlanApi.getSimplePlanPage,
  fields: {
    name: {
      label: '预案名称'
    },
    type: {
      label: '预案类型',
      formatter: 'dict:fx_plan_type'
    },
    deptId: {
      label: '所属区域'
    },
    level: {
      label: '预案等级',
      formatter: 'dict:fx_plan_level'
    },
    createTime: {
      label: '发布时间',
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
      label: '预案名称',
      components: 'input',
      required: true,
      row: 24
    },
    deptId: {
      label: '所属街道',
      components: 'select',
      required: true,
      row: 24
    },
    level: {
      label: '预案级别',
      components: 'select',
      dictType:'fx_plan_level',
      required: true,
      row: 24
    },
    type: {
      label: '预案类型',
      components: 'select',
      dictType:'fx_plan_type',
      required: true,
      row: 24
    },
    files: {
      label: '预案附件',
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
    SimplePlanApi.deleteSimplePlan(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = SimplePlanApi.createSimplePlan
  if (data.id) {
    promise = SimplePlanApi.updateSimplePlan
  }
  promise(data).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
  },
})
</script>
