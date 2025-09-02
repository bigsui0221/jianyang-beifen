<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { KeyAreaPlaceApi } from '@/api/Floodctrl/plan/keyareaplace'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '场所名称',
    components: 'input'
  },
  chargeUnit: {
    label: '责任单位',
    components: 'select',
    dictType: 'ai_platform'
  },
  director: {
    label: '责任人',
    components: 'input'
  },
  dgaeType: {
    label: '防汛风险',
    components: 'select',
    dictType: 'fx_danger_type'
  },
  address: {
    label: '地址',
    components: 'input'
  },
})
const tableConfig = reactive({
  api: KeyAreaPlaceApi.getKeyAreaPlacePage,
  fields: {
    name: {
      label: '场所名称'
    },
    chargeUnit: {
      label: '责任单位'
    },
    director: {
      label: '责任人'
    },
    dgaeTypeName: {
      label: '防汛风险'
    },
    detailAddress: {
      label: '地址'
    },
    area: {
      label: '面积(㎡)'
    },
    capacity: {
      label: '容纳人数'
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
  formData: {} as any,
  fields: {
    name: {
      label: '场所名称',
      components: 'input',
      required: true,
    },
    dgaeType: {
      label: '防汛风险',
      components: 'select',
      dictType: 'fx_danger_type',
      required: true,
    },
    chargeUnit: {
      label: '责任单位',
      components: 'input',
      required: true,
      row: 24
    },
    director: {
      label: '责任人',
      components: 'input',
      type: 'textarea',
      placeholder: '请输入责任人及电话，多个责任人用逗号隔开',
      required: true,
      row: 24
    },
    address: {
      label: '地址',
      components: 'inputMap',
      required: true,
      onChange: (value) => {
        dialogConfig.formData.lon = value.longitude
        dialogConfig.formData.lat = value.latitude
      }
    },
    detailAddress: {
      label: '详细地址',
      components: 'input',
      required: true,
    },
    area: {
      label: '面积',
      components: 'input',
      required: true,
      append: '㎡'
    },
    capacity: {
      label: '容纳人数',
      components: 'input',
      required: true,
    },
    reqDesc: {
      label: '防汛物资',
      components: 'input',
      type: 'textarea',
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
    KeyAreaPlaceApi.deleteKeyAreaPlace(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let promise = KeyAreaPlaceApi.createKeyAreaPlace
  if (data.id)
    promise = KeyAreaPlaceApi.updateKeyAreaPlace
  promise(data).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  }
})
</script>
