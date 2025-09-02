<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table @selection-change="checkselection" ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleInfo(row)">核对</el-button>
        <el-button link type="primary" @click="handleAdd()">登记</el-button>
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleIgnore(row)">忽略</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
    <at-table-dialog v-model="dialogIgnoreConfig.visible" :config="dialogIgnoreConfig"
      @submit="submitDialogIgnoreForm" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { Finished } from '@element-plus/icons-vue'
import * as UserApi from '@/api/system/user'
import * as  DeptApi from '@/api/system/dept'
import { EventApi } from '@/api/Floodctrl/event'
import { AlarmListApi } from '@/api/Floodctrl/alarmlist'

const message = useMessage() // 消息弹窗
const atTableRef = ref()
const List = ref([])
const genericPlanId = ref<any[]>([])

const queryParams = reactive({})
const queryFields = reactive({
  startTime: {
    label: '报警时间',
    components: 'date',
    type: 'daterange'
  },
  alarmLevel: {
    label: '预警等级',
    components: 'select',
    dictType: 'fx_alarm_level'
  },
  address: {
    label: '事件地点',
    components: 'input'
  },
  status: {
    label: '状态',
    components: 'select',
    options: [{
      label: '待处理',
      value: 0
    },
    {
      label: '已接收',
      value: 1
    },
    {
      label: '已忽略',
      value: 2
    }]
  },
  dgaeId: {
    label: '风险点',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: AlarmListApi.getAlarmListPage,
  fields: {
    selection: true,
    index: true,
    alarmName: {
      label: '报警名称'
    },
    alarmLevelName: {
      label: '报警等级',
    },
    siteName: {
      label: '报警站点'
    },
    // value4: {
    //   label: '行政区域'
    // },
    dgaeName: {
      label: '风险点'
    },
    address: {
      label: '报警地点'
    },
    status: {
      label: '状态',
      formatter: (row) => {
        return row === 0 ? '待处理' : row === 1 ? '已接收' : '已忽略'
      }
    },
    startTime: {
      label: '报警时间',
      formatter: 'dateTime'
    },
    endTime: {
      label: '结束时间',
      formatter: 'dateTime'
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
  title: '登记',
  readonly: false,
  formData: {} as any,
  fields: {
    eventTitle: {
      label: '事件标题',
      components: 'input',
      row: 24,
      required: true
    },
    incidentTime: {
      label: '事发时间',
      components: 'date',
      row: 24,
      required: true
    },
    eventDescription: {
      label: '事件描述',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24
    },
    eventLevel: {
      label: '事件等级',
      components: 'select',
      options: [
        {
          label: '特别重大',
          value: 'SPECIAL_MAJOR'
        },
        {
          label: '重大',
          value: 'MAJOR'
        },
        {
          label: '较大',
          value: 'LARGER'
        },
        {
          label: '一般',
          value: 'GENERAL'
        }
      ],
      row: 24,
      required: true
    },
    mapAddress: {
      label: '事发地点',
      components: 'inputMap',
      required: true,
      onChange: (val) => {
        dialogConfig.formData.longitude = val.longitude
        dialogConfig.formData.latitude = val.latitude
        dialogConfig.formData.mapAddress = val.mapAddress
      },
      row: 24
    },
    address: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    eventType: {
      label: '事件类型',
      components: 'select',
      options: [
        {
          label: '突发事件',
          value: 'SUDDEN'
        },
        {
          label: '预警事件',
          value: 'EARLY_WARNING'
        },
        {
          label: '自闭环事件',
          value: 'AUTISM_LOOP'
        },
        {
          label: '多跨事件',
          value: 'MULTISPAN'
        }
      ],
      row: 24,
      required: true
    },
    submissionDeptId: {
      label: '报送对象',
      components: 'select',
      options: [],
      required: true,
      row: 16
    },
    cityCenter: {
      label: '同步城运中心',
      components: 'switch',
      required: false,
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ],
      row: 8
    },
    processingTimeLimit: {
      label: '处理时限',
      components: 'inputNumber',
      append: '小时',
      required: true,
      row: 24
    }
  }
})
const dialogIgnoreConfig = reactive({
  visible: false,
  title: '忽略',
  readonly: false,
  width: '600px',
  formData: {},
  fields: {
    value2: {
      label: '忽略原因',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24,
      rows: 5
    }
  }
})

const checkselection = (value) => {
  console.log(value, 1111)
  genericPlanId.value = value
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '登记'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
}
const handleInfo = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '详情'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = true
}
const handleDel = (row: any) => {
  let idList: any = row.id ? [row.id] : null
  if (!idList) {
    idList = genericPlanId.value.map((item: any) => item.id)
    if (idList.length == 0) {
      return message.error('请选择要删除的数据')
    }
  }
  message.delConfirm().then(() => {
    EventApi.deleteEvent(idList).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const handleIgnore = (row: any) => {
  dialogIgnoreConfig.visible = true
  dialogIgnoreConfig.title = '忽略'
  dialogIgnoreConfig.formData = { ...row }
}
const submitDialogForm = (data) => {
  let genericPlanIds = genericPlanId.value.map(item => item.id).join(',');
  let promise = EventApi.createEvent
  if (data.id)
    promise = EventApi.updateEvent
  promise({
    ...data,
    eventClass: 'WARNING_REGISTRATION',
    genericPlanIds
  }).then(() => {
    message.success('保存成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const submitDialogIgnoreForm = (data) => {
  let idList: any = data.id ? [data.id] : null
  if (!idList) {
    idList = genericPlanId.value.map((item: any) => item.id)
    if (idList.length == 0) {
      return message.error('请选择要处理的数据')
    }
  }
  message.success('操作成功')
}
const getSimpleDeptList = async () => {
  const res = await DeptApi.getDeptPage({ pageNo: 1, pageSize: 1000 })
  // console.log(res);

  List.value = res.map(item => ({
    label: item.name,
    value: item.id
  }))
  dialogConfig.fields.submissionDeptId.options = List.value
  // console.log(res);
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '登记'
  },
  ignore: {
    onClick: handleIgnore,
    label: '忽略',
    icon: Finished
  },
  delete: {
    onClick: handleDel
  },
  export: {
    api: UserApi.getUserPage
  }
})

onMounted(() => {
  getSimpleDeptList()
})
</script>
