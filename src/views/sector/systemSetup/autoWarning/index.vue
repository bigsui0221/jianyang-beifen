<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }" >
      新产生预警时，系统自动发送预警短信给相应的危险区责任人<el-switch v-model="isSendWarning" @change="handleSendWarning" />
    </ContentWrap>
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
  </ContentWrap>
</template>

<script lang="ts" setup>
import { AutoAlarmUserApi } from '@/api/Floodctrl/autoalarmuser'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  userName: {
    label: '姓名',
    components: 'input'
  }
})
const isSendWarning = ref(false)
const handleSendWarning = () => {
  message.success('发送成功')
}
const tableConfig = reactive({
  api: AutoAlarmUserApi.getAutoAlarmUserPage,
  fields: {
    index: true,
    userName: {
      label: '姓名'
    },
    userPhone: {
      label: '手机号码'
    },
    post: {
      label: '职位'
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
  formData: {},
  fields: {
    userName: {
      label: '姓名',
      components: 'input',
      required: true,
      row: 24
    },
    userPhone: {
      label: '手机号码',
      components: 'input',
      required: true,
      row: 12
    },
    post: {
      label: '职位',
      components: 'input',
      required: true,
      row: 12
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
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}

const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    console.log('删除')
    AutoAlarmUserApi.deleteAutoAlarmUser(row.id).then(() => {
      message.success('删除成功')
      atTableRef.value?.refresh()
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if (dialogConfig.title === '新增') { 
    AutoAlarmUserApi.createAutoAlarmUser(data).then(() => {
      dialogConfig.visible = false
      message.success('新增成功')
      atTableRef.value?.refresh()
    })
  }else{
    AutoAlarmUserApi.updateAutoAlarmUser(data).then(() => { 
      dialogConfig.visible = false
      message.success('操作成功')
      atTableRef.value?.refresh()
    })
  }
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  // import: {
  //   api: AutoAlarmUserApi.exportAutoAlarmUser
  // },
  export: {
    api: AutoAlarmUserApi.exportAutoAlarmUser
  },
  // delete: {
  //   onClick: handleDel
  // }
})
</script>
