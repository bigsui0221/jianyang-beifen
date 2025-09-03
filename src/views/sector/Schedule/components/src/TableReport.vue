<template>
  <div class="filter-container">
    <at-table-search
      :class="{ 'filter-container__search': !isDefault }"
      v-on="$attrs"
      v-model="queryParams"
      :fields="queryFields"
      @search="handleSearch"
    />
    <div class="filter-container__btns" v-if="!normaluser && !waterAuthority">
      <el-button type="primary" @click="handleReport">上报</el-button>
      <el-button type="primary" @click="handleMore">查看更多</el-button>
    </div>
  </div>
  <at-table-operation v-model:params="queryParams" :config="operationConfig" v-if="isDefault" />
  <at-table
    ref="atTableRef"
    v-model:params="queryParams"
    :config="tableConfig"
    @selection-change="(val) => (selectionRows = val)"
  >
    <template #operation="{ row }">
      <el-button link type="primary" @click="handleInfo(row)">查看</el-button>
      <el-button link type="primary" @click="handleEdit(row)" v-if="!waterAuthority">编辑</el-button>
      <el-button link type="primary" @click="handleContinue(row)" v-if="!waterAuthority">续报</el-button>
      <el-button link type="primary" @click="handleDel(row)" v-if="!waterAuthority">删除</el-button>
    </template>
  </at-table>
  <at-table-dialog
    v-model="dialogConfig.visible"
    :config="dialogConfig"
    @submit="submitDialogForm"
  />
  <at-table-dialog
    v-model="continueConfig.visible"
    :config="continueConfig"
    @submit="submitContinueForm"
  />
</template>
<script lang="ts" setup>
import { EventApi } from '@/api/Floodctrl/event'
import { SuperviseHandleApi } from '@/api/Floodctrl/supervisehandle'
import * as UserApi from '@/api/system/user'
import * as  DeptApi  from '@/api/system/dept'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache()
let user = wsCache.get(CACHE_KEY.USER)

const List = ref([])
// const waterAuthority = ref(true)
const normaluser = ref(false)

const message = useMessage() // 消息弹窗
const router = useRouter() // 路由
const props = defineProps({
  isDefault: {
    type: Boolean,
    default: true
  },
  waterAuthority: {
    type: Boolean,
    default: true
  },
})
const selectionRows = ref([])
const queryFields = ref({
  eventTitle: {
    label: '信息标题',
    components: 'input'
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
    ]
  },
  eventStatus: {
    label: '事件状态',
    components: 'select',
    options: [
      {
        label: '上报',
        value: 'REPORT'
      },
      {
        label: '已分派',
        value: 'ASSIGNED'
      },
      {
        label: '处理中',
        value: 'PROCESSING'
      },
      {
        label: '结案',
        value: 'CLOSE_CASE'
      }
    ]
  }
})
const queryParams = reactive({
  submittedUserId: user.user.id,
  eventClass: 'INFO_REPORT'
})
const atTableRef = ref()
const tableConfig = reactive({
  api: EventApi.getEventPage,
  height: props.isDefault ? undefined : '300px',
  fields: {
    selection: props.isDefault,
    incidentTime: {
      label: '上报时间'
    },
    eventTitle: {
      label: '信息标题'
    },
    eventDescription: {
      label: '信息描述'
    },
    // value4: {
    //   label: '所属街道'
    // },
    mapAddress: {
      label: '事发地点'
    },
    eventType: {
      label: '信息类型',
      formatter: (row) => {
        return row.desc
      }
    },
    eventLevel: {
      label: '信息级别',
      formatter: (row) => {
        return row.desc
      }
    },
    eventStatus: {
      label: '信息状态',
      formatter: (row) => {
        return row.desc
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
  formData: {} as any,
  title: '新建',
  fields: {
    eventTitle: {
      label: '信息标题',
      components: 'input',
      required: true
    },
    incidentTime: {
      label: '事发时间',
      components: 'date',
      required: true
    },
    eventDescription: {
      label: '信息描述',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24,
      span: 24
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
      row: 24,
      span: 24
    },
    eventLevel: {
      label: '信息级别',
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
      required: true
    },
    // value6: {
    //   label: '信息来源',
    //   components: 'select',
    //   dictType: 'ai_platform'
    // },
    // value7: {
    //   label: '报送渠道',
    //   components: 'select',
    //   dictType: 'ai_platform'
    // },
    submissionDeptId: {
      label: '报送单位',
      components: 'select',
      options: [],
    },
    submittedUserId: {
      label: '报送人',
      components: 'input',
      disabled: true,
    },

    attachmentPath: {
      label: '附件',
      components: 'uploadFile',
      row: 24,
      span: 24
    }
  }
})
const continueConfig = reactive({
  visible: false,
  formData: {},
  title: '续报',
  width: '600px',
  fields: {
    reSubmitDesc: {
      label: '信息描述',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24,
      span: 24
    },
    attachmentPath: {
      label: '附件',
      components: 'uploadFile',
      row: 24,
      span: 24
    }
  }
})
watch(queryParams, () => {
  if (!props.isDefault) {
    handleSearch()
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
/** 上报 */
const handleReport = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新建'
}
const handleMore = () => {
  router.push('/schedule/list')
}
const handleInfo = (row) => {
  router.push({ path: '/schedule/center/info', query: { id: row.id, waterAuthority: String(props.waterAuthority) } })
}
/** 编辑 */
const handleEdit = (row) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row } 
}
/** 续报 */
const handleContinue = (row) => {
  continueConfig.visible = true
  continueConfig.formData = { ...row }
}
/** 删除 */
const handleDel = (row) => {
  if (props.isDefault && selectionRows.value.length == 0) {
    return message.warning('请选择要删除的数据')
  }
  message.delConfirm().then(() => {
    console.log('删除')
    EventApi.deleteEvent(row.id).then(() => {
      message.success('删除成功')
      atTableRef.value?.refresh()
    })
  })
}
/** 表单提交 */
const submitDialogForm = (formData) => {
  console.log(formData)
  message.success('保存成功')
  if(dialogConfig.title=='新建'){
    EventApi.createEvent({...formData,
      eventClass: 'INFO_REPORT',
      submittedUserId: user.user.id,
      attachmentPath: JSON.parse(formData.attachmentPath).map(item => { return item.url }).join(',')
    }).then(() => {
      dialogConfig.visible = false
      message.success('保存成功')
      atTableRef.value?.refresh()
    })
  }else{
    EventApi.updateEvent(formData).then(() => {
      dialogConfig.visible = false
      message.success('保存成功')
      atTableRef.value?.refresh()
    })
  }
}
/** 续报提交 */
const submitContinueForm = (formData) => {
  console.log(formData)
  EventApi.resubmit({...formData,
    attachmentPath: JSON.parse(formData.attachmentPath).map(item => { return item.url }).join(',')
  }).then(() => { 
    continueConfig.visible = false
    message.success('保存成功')
    atTableRef.value?.refresh()
  })
}
const getSimpleDeptList = async () => {
  const res = await DeptApi.getDeptPage({pageNo: 1, pageSize: 1000})
  // console.log(res);
  
  List.value = res.map(item => ({
    label: item.name,
    value: item.id
  }))
  dialogConfig.fields.submissionDeptId.options = List.value
  // tableConfig.fields.submissionDeptId.options = List.value
  // console.log(res);
}
const operationConfig = reactive({
  // add: {
  //   onClick: handleReport,
  //   label: '信息上报'
  // },
  // delete: {
  //   onClick: handleDel
  // }
})
onMounted(() => { 
  getSimpleDeptList()
  // waterAuthority.value = props.waterAuthority
  // DeptApi.getDept(user.user.deptId).then((res)=>{
  //   console.log(res);
  //   waterAuthority.value = res.waterAuthority
  //   if(!res.street && !res.waterAuthority){
  //     normaluser.value = true
  //   }
  // })
})
</script>
<style lang="scss" scoped>
.filter-container {
  display: flex;
  .at-table-search {
    flex: 1;
    border: 0;
    margin-bottom: 0;
    :deep(.el-card__body) {
      padding-left: 0;
      padding-right: 0;
    }
  }
  &__search {
    border: 0;
    margin-bottom: 0;
    :deep(.el-card__body) {
      .el-form {
        .el-form-item__label-wrap,
        .btn-group {
          display: none;
        }
      }
    }
  }
}
</style>
