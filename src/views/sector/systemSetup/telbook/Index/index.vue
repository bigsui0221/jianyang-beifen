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
import * as UserApi from '@/api/system/user'
const message = useMessage() // 消息弹窗
const queryParams = reactive({
  deptId: ''
})
const tableConfig = reactive({
  api: UserApi.getUserPage,
  fields: {
    nickname: {
      label: '姓名'
    },
    // value2: {
    //   label: '职位'
    // },
    deptName: {
      label: '部门'
    },
    // value4: {
    //   label: '所属分组'
    // },
    mobile: {
      label: '电话'
    },
    // operation: {
    //   label: '操作',
    //   width: '160',
    //   fixed: 'right'
    // }
  }
})
const dialogConfig = reactive({
  visible: false,
  readonly: false,
  width: '500px',
  title: '',
  formData: {},
  fields: {
    value2: {
      label: '所属分组',
      components: 'select',
      options: [],
      required: true,
      row: 24
    },
    nickname: {
      label: '姓名',
      components: 'input',
      required: true,
      row: 24
    },
    mobile: {
      label: '电话',
      components: 'input',
      required: true,
      row: 24
    },
    value5: {
      label: '职位',
      components: 'input',
      required: true,
      row: 24
    },
    value6: {
      label: '单位',
      components: 'input',
      required: true,
      row: 24
    },
    deptName: {
      label: '部门',
      components: 'input',
      required: true,
      row: 24
    }
  }
})
const atTableRef = ref()

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
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    console.log('删除')
  })
}
const submitDialogForm = (data) => {
  console.log(data)
}
const operationConfig = reactive({
  // add: {
  //   onClick: handleAdd
  // }
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
