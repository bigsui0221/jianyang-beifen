<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
    <at-table-dialog
      v-model="dialogConfig.visible"
      :config="dialogConfig"
      @submit="submitDialogForm"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { MaterialsApi } from '@/api/Floodctrl/materials'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  warehouseId: {
    label: '仓库',
    components: 'input'
  },
  materialsTypeId: {
    label: '物资名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: MaterialsApi.overLimitPage,
  fields: {
    // value1: {
    //   label: '预警时间'
    // },
    // value2: {
    //   label: '恢复时间'
    // },
    index: true,
    warehouseRespVO: {
      label: '仓库',
      formatter: (row) => {
        return row.warehouseName
      }
    },
    materialsTypeName: {
      label: '物资名称'
    },
    specificationModel: {
      label: '规格型号'
    },
    // value6: {
    //   label: '计量单位'
    // },
    reportNumber: {
      label: '仓库数量'
    },
    alarmThreshold: {
      label: '告警阈值'
    },
    supplierUser: {
      label: '联系人'
    },
    supplierPhone: {
      label: '联系电话'
    },
    // value11: {
    //   label: '通知方式'
    // },
    // value12: {
    //   label: '状态'
    // },
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '新增',
  readonly: false,
  width: '600px',
  formData: {},
  fields: {
    value1: {
      label: '仓库名称',
      components: 'input',
      required: true,
      row: 12
    },
    value2: {
      label: '行政区域',
      components: 'select',
      required: true,
      row: 12
    },
    value3: {
      label: '联系人',
      components: 'select',
      required: true,
      row: 12
    },
    value4: {
      label: '联系电话',
      components: 'input',
      required: true,
      row: 12
    },
    value5: {
      label: '负责人',
      components: 'select',
      required: true,
      row: 12
    },
    value6: {
      label: '负责电话',
      components: 'input',
      required: true,
      row: 12
    },
    valu7: {
      label: '仓库位置',
      components: 'select',
      required: true,
      row: 24
    },
    value8: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    value9: {
      label: '通知方式',
      components: 'radioGroup',
      required: true,
      options: [
        {
          label: '短信',
          value: 1
        },
        {
          label: '邮件',
          value: 2
        }
      ],
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
    console.log('删除')
  })
}
const submitDialogForm = (data) => {
  console.log(data)
}
const operationConfig = reactive({
 
})
</script>
