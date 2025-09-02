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
import * as UserApi from '@/api/system/user'
import { AlarmSetupApi } from '@/api/Floodctrl/alarmsetup'
import {SiteApi} from '@/api/Floodctrl/site'
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const pointList = ref<{ label: string; value: string; }[]>([])

const queryFields = reactive({
  alarmName: {
    label: '报警名称',
    components: 'input'
  },
  // siteId: {
  //   label: '所在位置',
  //   components: 'input'
  // },
  // value3: {
  //   label: '报警指标',
  //   components: 'input'
  // },
  // value4: {
  //   label: '报警类型',
  //   components: 'select',
  //   dictType: 'ai_platform'
  // },
  runStatus: {
    label: '状态',
    components: 'select',
    options: [
      {
        label: '启用',
        value: 'true'
      },
      {
        label: '停用',
        value: 'false'
      }
    ]
  }
})
const tableConfig = reactive({
  api: AlarmSetupApi.getAlarmSetupPage,
  fields: {
    index: true,
    alarmName: {
      label: '报警名称'
    },
    // value2: {
    //   label: '等级',
    // },
    siteName: {
      label: '站名',
    },
    // value4: {
    //   label: '所在位置'
    // },
    // value5: {
    //   label: '指标'
    // },
    // value6: {
    //   label: '报警值'
    // },
    alarmRuleType: {
      label: '报警规则',
      formatter: (value) => {
        return value.desc
      }
    },
    runStatus: {
      label: '状态',
      formatter: (value) => {
        return value? '启用':'停用'
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
    alarmName: {
      label: '报警名称',
      components: 'input',
      required: true,
      row: 12
    },
    siteId: {
      label: '所属站点',
      components: 'select',
      required: true,
      options: pointList.value,
      row: 12
    },
    runStatus: {
      label: '报警状态',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '停用',
          value: false
        },
        {
          label: '启用',
          value: true
        }
      ]
    },
    phoneMessageType: {
      label: '短信通知',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '组织结构',
          value: 'ORGANIZATION'
        },
        {
          label: '自定义告警人员',
          value: 'CUSTOMIZE_USER'
        }
      ]
    },
    alarmRuleType: {
      label: '报警规则',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '累计报警',
          value: 'COUNT_ALARM'
        },
        {
          label: '阈值报警',
          value: 'THRESHOLD_ALARM'
        }
      ]
    },
    
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
  console.log(dialogConfig.formData);
  dialogConfig.formData = { ...row,
    alarmRuleType: row.alarmRuleType.name,
    phoneMessageType: row.phoneMessageType.name
  }
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
    AlarmSetupApi.deleteAlarmSetup(row.id).then(res=>{
      atTableRef.value?.refresh()
      message.success('删除成功')
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if(data.id){
    AlarmSetupApi.updateAlarmSetup(
      {
      ...data,
      alarmRuleType: data.alarmRuleType.name ? data.alarmRuleType.name : data.alarmRuleType,
      phoneMessageType: data.phoneMessageType.name ? data.phoneMessageType.name : data.phoneMessageType
    }
    ).then(res=>{
      atTableRef.value?.refresh()
      message.success('修改成功')
      dialogConfig.visible = false
    })
  }else{
    AlarmSetupApi.createAlarmSetup(data).then(res=>{
      atTableRef.value?.refresh()
      message.success('添加成功')
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
  SiteApi.getSitePage({ pageNo: 1, pageSize: 1000 }).then((res)=>{
    // console.log(res.list);
    pointList.value = res.list.map(item => ({
      label: item.siteName,
      value: item.id,
    }))
    // console.log(pointList.value);
    dialogConfig.fields.siteId.options = pointList.value
  })
})
</script>
