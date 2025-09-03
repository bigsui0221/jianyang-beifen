<template>
  <ContentWrap class="content-wrap" :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div><DeptTree @node-click="handleDeptNodeClick"/></div>
    <div class="content-wrap-table">
      <at-table-operation v-model:params="queryParams" :config="operationConfig" />
      <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
        <template #operation="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        </template>
      </at-table>
      <at-table-dialog
        v-model="dialogConfig.visible"
        :config="dialogConfig"
        @submit="submitDialogForm"
      />
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { DeptTree } from '../components'
import { EmergencyPersonnelApi } from '@/api/Floodctrl/emergencypersonnel'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'

const list = ref()
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  console.log(res);
  list.value = res.map(item => ({
    label: item.name,
    value: item.id,
  }))
  dialogConfig.fields.deptId.options = list.value
}
const message = useMessage() // 消息弹窗
const queryParams = reactive({
  deptId: ''
})
const atTableRef = ref()

const tableConfig = reactive({
  api: UserApi.getUserPage,
  fields: {
    index: true,
    nickname: {
      label: '姓名'
    },
    deptName: {
      label: '部门'
    },
    mobile: {
      label: '电话'
    },
    roleNames: {
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
      label: '职责',
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
      label: '职责描述',
      components: 'textarea',
      required: true,
      row: 24
    },
  }
})
const handleDeptNodeClick = (node: any) => {
  console.log('handleDeptNodeClick', node);
  queryParams.deptId	= node.id
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
  getTree()
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
  getTree()
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    console.log('删除')
    EmergencyPersonnelApi.deleteEmergencyPersonnel(row.id).then(() => {
      message.success('删除成功')
      dialogConfig.visible = false
      atTableRef.value?.refresh()

    })  

  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if (!data.id) {
    EmergencyPersonnelApi.createEmergencyPersonnel(data).then(() => {
      message.success('保存成功')
      atTableRef.value?.refresh()

      dialogConfig.visible = false
    })
    return
  }else{  
    EmergencyPersonnelApi.updateEmergencyPersonnel({
      ...data,
      deptName: list.value.find(item => item.value === data.deptId)?.label
    }).then(() => {
      atTableRef.value?.refresh()

      message.success('保存成功')
      dialogConfig.visible = false
    })
  }
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
  .content-wrap-table{
    flex: 1;
    margin-left: 20px;
  }
}
</style>
