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
    <at-table-dialog
      v-model="dialogConfig.visible"
      :config="dialogConfig"
      @submit="submitDialogForm"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { CmdadCategoryApi } from '@/api/Floodctrl/cmdadcategory'
import { MaterialsTypeApi } from '@/api/Floodctrl/materialstype'
import { MaterialsApi } from '@/api/Floodctrl/materials'
//差一个物资管理接口整合入库出库和物资分类里的物资信息
const message = useMessage() // 消息弹窗
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  materialsName: {
    label: '物资名称',
    components: 'input'
  },
  // applicantName: {
  //   label: '联系人',
  //   components: 'input'
  // },
  // value3: {
  //   label: '联系电话',
  //   components: 'input'
  // }
})
const tableConfig = reactive({
  api: MaterialsApi.getMaterialsPage,
  fields: {
    index: true,
    // value1: {
    //   label: '行政区域'
    // },
    warehouseName: {
      label: '存储仓库'
    },
    // value3: {
    //   label: '存储地址'
    // },
    materialsTypeName: {
      label: '物资名称'
    },
    specificationModel: {
      label: '规格型号'
    },
    reportNumber: {
      label: '物资数量'
    },
    unitMeasurement: {
      label: '计量单位'
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
      row: 12
    },
    unitMeasurement: {
      label: '计量单位',
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

const handleInfo = (row: any) => {
  router.push({
    path: '/commandCall/materialManagement/info',
    query: {
      id: row.id,
      io: 1 //不可编辑
    }
  })
}

const handleinside = (row: any) => {
  router.push({
    path: '/commandCall/materialManagement/info',
    query: {
      id: row.id,
      rr: '1'
    }
  })
}
const handleout = (row: any) => {
  router.push({
    path: '/commandCall/materialManagement/info',
    query: {
      id: row.id,
    }
  })
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
    MaterialsApi.createMaterials(data).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }else{
    MaterialsApi.updateMaterials(data).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  export: {
    api: MaterialsTypeApi.exportMaterialsType
  },
  // toLog: {
  //   label: '操作日志',
  //   type: 'primary',
  //   onClick: handleInfo
  // },
  toInbound: {
    label: '入库',
    type: 'primary',
    onClick: handleinside
  },
  toOutbound: {
    label: '出库',
    type: 'primary',
    onClick: handleout
  },
})
</script>
