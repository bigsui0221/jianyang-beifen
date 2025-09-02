<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <!-- <el-button link type="primary" @click="handleInfo(row)">详情</el-button> -->
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
import { MaterialsTypeApi } from '@/api/Floodctrl/materialstype'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  materialsName: {
    label: '物资名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: MaterialsTypeApi.getMaterialsTypePage,
  fields: {
    selection: true,
    index:true,
    materialsName: {
      label: '物资名称',
    },
    unitMeasurement: {
      label: '计量单位',
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
    materialsName: {
      label: '物资名称',
      components: 'input',
      required: true,
      row: 24
    },
    unitMeasurement: {
      label: '计量单位',
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
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    MaterialsTypeApi.deleteMaterialsType(row.id)
    atTableRef.value?.refresh()
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if(dialogConfig.title === '新增'){
    MaterialsTypeApi.createMaterialsType(data).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }else{
    MaterialsTypeApi.updateMaterialsType(data).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
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
