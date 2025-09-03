<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <!-- <el-button link type="primary" @click="handleInfo(row)">详情</el-button> -->
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        <!-- <el-button link type="primary" @click="handleExport(row)">导出</el-button> -->
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
import { WarningSetupApi } from '@/api/Floodctrl/warningsetup'
import {SiteApi} from '@/api/Floodctrl/site'

import * as UserApi from '@/api/system/user'
import download from '@/utils/download'
const pointList = ref<{ label: string; value: string; }[]>([])

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  warningName: {
    label: '预警名称',
    components: 'input'
  },
  siteId: {
    label: '重点测站',
    components: 'select',
    options: pointList.value
  },
  // value3: {
  //   label: '预警指标',
  //   components: 'input'
  // }
})
const tableConfig = reactive({
  api: WarningSetupApi.getWarningSetupPage,
  fields: {
    index: true,
    warningName: {
      label: '预警名称'
    },
    siteName: {
      label: '重点测站'
    },
    // value3: {
    //   label: '预警指标'
    // },
    warningType: {
      label: '预警分类',
      formatter: (value) => {
        return value.desc
      }
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
    warningName: {
      label: '预警名称',
      components: 'input',
      required: true,
      row: 24
    },
    siteId: {
      label: '重点测站',
      components: 'select',
      required: true,
      options: pointList.value,
      row: 12
    },
    // value3: {
    //   label: '预警指标',
    //   components: 'select',
    //   required: true,
    //   row: 12
    // },
    warningType: {
      label: '预警分类',
      components: 'select',
      options: [
        {
          label: '水文监测',
          value: 'HYDROLOGICAL'
        },
        {
          label: '气象监测',
          value: 'METEOROLOGICAL'
        },
        {
          label: '水质监测',
          value: 'WATER_QUALITY'
        },
        {
          label: '工程安全监测',
          value: 'ENGINEERING_SAFETY'
        },
        {
          label: '城市内涝监测',
          value: 'URBAN_WATERLOGGING'
        }
      ],
      required: true,
      row: 12
    },
    phoneMessageType: {
      label: '短信通知',
      components: 'select',
      options: [
        {
          label: '组织结构',
          value: 'ORGANIZATION'
        },
        {
          label: '自定义告警人员',
          value: 'CUSTOMIZE_USER'
        }
      ],
      required: true,
      row: 12
    },
    redAlarmValue: {
      label: '红色报警值',
      components: 'input',
      required: true,
      row: 24
    },
    blueAlarmValue: {
      label: '红色报警值',
      components: 'input',
      required: true,
      row: 24
    },
    yellowAlarmValue: {
      label: '红色报警值',
      components: 'input',
      required: true,
      row: 24
    },
    orangeAlarmValue: {
      label: '红色报警值',
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
  dialogConfig.formData = { ...row,
  warningType: row.warningType.name,
  phoneMessageType: row.phoneMessageType.name}
  dialogConfig.readonly = false
}
const handleInfo = (row: any) => {
  // router.push({
  //   path: '/floodctrl/incidents/info',
  //   query: {
  //     id: row.id
  //   }
  // })
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
     console.log('删除')
      WarningSetupApi.deleteWarningSetup(row.id).then(res=>{
      atTableRef.value?.refresh()
      message.success('删除成功')
    })
  })
}
const currentBtn = ref()
const loading = ref({})
// 导出（未完成）
const handleExport = (row: any) => {
  const btn = currentBtn.value
  message
    .confirm(btn.message || '是否确认导出当前所有数据项?')
    .then(() => {
      loading.value['export'] = true
      if (!btn.api || typeof btn.api != 'function') {
        throw new Error('未配置导出接口')
      }
      return btn.api && btn.api({ queryParams, pageNo: undefined, pageSize: undefined })
    })
    .then((response) => {
      download.excel(response, btn.fileName || '导出数据.xls')
      loading.value['export'] = false
    })
    .catch((error) => {
      console.error(error)
      loading.value['export'] = false
    })
}
const submitDialogForm = (data) => {
  console.log(data)
  if(data.id){
    WarningSetupApi.updateWarningSetup({
      ...data,
      warningType: data.warningType.name ? data.warningType.name : data.warningType,
      phoneMessageType: data.phoneMessageType.name ? data.phoneMessageType.name : data.phoneMessageType
    
    }).then(() => {
      atTableRef.value?.refresh()
      message.success('修改成功')
      dialogConfig.visible = false

    })
  } else {
    WarningSetupApi.createWarningSetup(data).then(() => {
      message.success('添加成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
      
    })

  }
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  // import: {
  //   api: UserApi.getUserPage
  // }
})
onMounted(() => { 
  SiteApi.getSitePage({ pageNo: 1, pageSize: 1000 }).then((res)=>{
    // console.log(res.list);
    pointList.value = res.list.map(item => ({
      label: item.siteName,
      value: item.id,
    }))
    // console.log(pointList.value);
    dialogConfig.fields.siteId.options = pointList.value
    queryFields.siteId.options = pointList.value
  })
})
</script>
