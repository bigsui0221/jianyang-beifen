<template>
  <ContentWrap class="content-wrap" :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div><DeptTree @node-click="handleDeptNodeClick" /></div>
    <div class="content-wrap-table">
      <at-table-operation v-model:params="queryParams" :config="operationConfig" />
      <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
        <template #operation="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        </template>
      </at-table>
      <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { DeptTree } from '../components'
import { EmergencyPersonnelApi } from '@/api/Floodctrl/plan/emergencypersonnel'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive<any>({})
const tableConfig = reactive({
  api: EmergencyPersonnelApi.getEmergencyPersonnelPage,
  fields: {
    name: {
      label: '姓名'
    },
    post: {
      label: '职位'
    },
    phone: {
      label: '电话'
    },
    postDesc: {
      label: '职责'
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
  readonly: false,
  width: '500px',
  title: '',
  formData: {},
  fields: {
    deptId: {
      label: '所属部门',
      components: 'select',
      options: [],
      required: true,
      row: 24
    },
    name: {
      label: '姓名',
      components: 'input',
      required: true,
      row: 24
    },
    post: {
      label: '职位',
      components: 'input',
      required: true,
      row: 24
    },
    phone: {
      label: '电话',
      components: 'input',
      required: true,
      row: 24
    },
    postDesc: {
      label: '职责',
      components: 'input',
      required: true,
      row: 24
    },
  }
})
const handleDeptNodeClick = (row)=>{
  queryParams.deptId = row.id
  handleSearch()
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    EmergencyPersonnelApi.deleteEmergencyPersonnel(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = EmergencyPersonnelApi.createEmergencyPersonnel
  if (data.id)
    promise = EmergencyPersonnelApi.updateEmergencyPersonnel
  promise(data).then(() => {
    message.success('操作成功')
    handleSearch()
    dialogConfig.visible = false
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  }
})
</script>
<style lang="scss" scoped>
.content-wrap {
  > :deep(.el-card__body) {
    display: flex;
  }

  .content-wrap-table {
    width: calc(100% - 285px - 20px);
    margin-left: 20px;
  }
}
</style>
