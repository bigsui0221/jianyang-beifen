<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #roughness="{ row }">
        <div>{{ row.roughness }}</div>
      </template>
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
import { DischargeSetupApi } from '@/api/Floodctrl/dischargesetup'
import { SiteApi } from '@/api/Floodctrl/site'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  siteName: {
    label: '站点名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: DischargeSetupApi.getDischargeSetupPage,
  fields: {
    index: true,
    siteName: {
      label: '站点名称'
    },
    sectionalArea: {
      label: '断面面积'
    },
    roughness: {
      label: '糙率'
    },
    waterSurfaceGradient: {
      label: '水面比降'
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
    siteId: {
      label: '站点名称',
      components: 'select',
      options: [] as any,
      required: true,
      row: 12
    },
    sectionalArea: {
      label: '断面面积',
      components: 'input',
      required: true,
      append:'㎡',
      row: 12
    },
    roughness: {
      label: '糙率',
      components: 'input',
      required: true,
      row: 12
    },
    waterSurfaceGradient: {
      label: '水面比降',
      components: 'input',
      required: true,
      row: 12
    },
    // value5: {
    //   label: '站点设备',
    //   components: 'select',
    //   required: true,
    //   row: 12
    // },
    dischargeComputeType: {
      label: '计算方法',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '经验似和与理论约束结合',
          value: 'EXPERIENCE_AND_THEORY'
        }
      ]
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
    DischargeSetupApi.deleteDischargeSetup(row.id).then(() => { 
      atTableRef.value?.refresh()
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if (dialogConfig.title === '新增') { 
    DischargeSetupApi.createDischargeSetup(data).then(() => { 
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }else{ 
    DischargeSetupApi.updateDischargeSetup({
      ...data,
      dischargeComputeType: data.dischargeComputeType.name ? data.dischargeComputeType.name : data.dischargeComputeType

    }).then(() => { 
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
onMounted(() => { 
  SiteApi.getSitePage({ pageNo: 1, pageSize: 1000 }).then(res=>{
    res.list.forEach(item=>{
      item.value = item.id
      item.label = item.siteName
    })
    dialogConfig.fields.siteId.options = res.list
  })
})
</script>
