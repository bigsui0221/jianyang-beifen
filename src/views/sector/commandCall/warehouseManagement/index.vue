<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
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
  </ContentWrap>
</template>

<script lang="ts" setup>
import { WarehouseApi } from '@/api/Floodctrl/warehouse'
import * as UserApi from '@/api/system/user'

const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  warehouseName: {
    label: '仓库名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: WarehouseApi.getWarehousePage,
  fields: {
    index: true,
    warehouseName: {
      label: '仓库名称'
    },
    regionName: {
      label: '行政区域'
    },
    mapAddress: {
      label: '位置'
    },
    contactsUserName: {
      label: '联系人'
    },
    perionChargeUserName: {
      label: '负责人'
    },
    perionChargeUserPhone: {
      label: '负责电话'
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
    warehouseName: {
      label: '仓库名称',
      components: 'input',
      required: true,
      row: 12
    },
    regionName: {
      label: '行政区域',
      components: 'input',
      required: true,
      row: 12,
      disabled: true
    },
    contactsUserName: {
      label: '联系人',
      components: 'select',
      required: true,
      row: 12,
      options: [],
      
    },
    contactsUserPhone: {
      label: '联系电话',
      components: 'input',
      required: true,
      row: 12
    },
    perionChargeUserName: {
      label: '负责人',
      components: 'select',
      required: true,
      row: 12,
       options: [],
    },
    perionChargeUserPhone: {
      label: '负责电话',
      components: 'input',
      required: true,
      row: 12
    },
    mapAddress: {
      label: '仓库位置',
      components: 'inputMap',
      required: true,
      onChange: (val) => {
        dialogConfig.formData.longitude = val.longitude
        dialogConfig.formData.latitude = val.latitude
      }
    },
    address: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    noticeMethod: {
      label: '通知方式',
      components: 'radioGroup',
      required: true,
      options: [
        {
          label: '站内信',
          value: 'MAIL'
        },
        {
          label: '短信',
          value: 'MESSAGE_PHONE'
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
  UserApi.getUserPage({pageNo: 1, pageSize: 100}).then((res) => {
    console.log(res);
    
    dialogConfig.fields.contactsUserName.options = res.list.map((item) => {
      return {
        label: item.username,
        value: item.id
      }
    })
    dialogConfig.fields.perionChargeUserName.options = dialogConfig.fields.contactsUserName.options
  })
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row,
    //处理通知方式里面的两个布尔值为一个键值对
  }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    console.log('删除')
    WarehouseApi.deleteWarehouse(row.id).then(() => {
      message.success('删除成功')
      atTableRef.value?.refresh()
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if (dialogConfig.title === '新增') {
    WarehouseApi.createWarehouse(data).then(() => {
      message.success('新增成功')
      dialogConfig.visible = false
      atTableRef.value?.refresh()
    })
  } else {
    WarehouseApi.updateWarehouse(data).then(() => {
      message.success('编辑成功')
      dialogConfig.visible = false
      atTableRef.value?.refresh()
    })
  }
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  export: {
    api: WarehouseApi.exportWarehouse
  }
})
</script>
