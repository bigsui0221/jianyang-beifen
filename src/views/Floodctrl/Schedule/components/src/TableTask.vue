<template>
  <div class="filter-container">
    <at-table-search
      :class="{ 'filter-container__search': !isDefault }"
      v-on="$attrs"
      v-model="queryParams"
      :fields="queryFields"
      @search="handleSearch"
    />
    <div class="filter-container__btns" v-if="!isDefault">
      <el-button type="primary" @click="handlelist">查看全部</el-button>
    </div>
  </div>
  <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
    <template #operation="{ row }">
      <el-button link type="primary" @click="handle(row)">详情</el-button>
      <el-button link type="primary" @click="handleIssued(row)" v-if="!waterAuthority">任务下发</el-button>
      <el-button link type="primary" @click="handleReply(row)" v-else>回复</el-button>
    </template>
  </at-table>
  <at-table-dialog
    v-model="continueConfig.visible"
    :config="continueConfig"
    @submit="submitContinueForm"
  />
</template>
<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { EventNodeApi } from '@/api/Floodctrl/eventnode'
import { EventApi } from '@/api/Floodctrl/event'
import { EventNodeTaskApi } from '@/api/Floodctrl/eventnodetask'
import { formatToDateTime } from '@/utils/dateUtil'
import * as DeptApi from '@/api/system/dept'

import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()
let user = wsCache.get(CACHE_KEY.USER)
// const waterAuthority = ref(false)
const message = useMessage() // 消息弹窗


const continueConfig = reactive({
  visible: false,
  formData: {},
  title: '回复协同',
  width: '600px',
  fields: {
    reply: {
      label: '回复协同内容',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24,
      span: 24
    },
  }
})

const handleReply = (row) => {
  continueConfig.visible = true
  continueConfig.formData = { ...row }
}

const submitContinueForm = (formData) => {
  console.log(formData)
  EventApi.replyCopperate(formData).then(() => { 
    continueConfig.visible = false
    message.success('保存成功')
    // atTableRef.value?.refresh()
  })
}

const router = useRouter()
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
const queryFields = ref({
  eventNodeId: {
    label: '任务标题',
    components: 'input'
  },
  // value3: {
  //   label: '响应等级',
  //   components: 'select',
  //   dictType: 'ai_platform'
  // },
  taskStatus: {
    label: '任务状态',
    components: 'select',
    options: [
      {
        label: '未开始',
        value: 'NOT_STARTED'
      },
      {
        label: '进行中',
        value: 'IN_PROGRESS'
      },
      {
        label: '需协同',
        value: 'NEED_COLLABORATE'
      },
      {
        label: '已完成',
        value: 'COMPLETED'
      },
      {
        label: '协同已回复',
        value: 'REPLY'
      }
    ]
  }
})
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  noteType: 'DISTRIBUTED',
  handleDeptId: user.user.deptId
})
const atTableRef = ref()
const tableConfig = reactive({
  api: EventNodeApi.getEventNodePage,
  height: props.isDefault ? undefined : '300px',
  fields: {
    index: true,
    createTime: {
      label: '创建时间',
      formatter: (row) => {
        return formatToDateTime(row,'YYYY-MM-DD HH:mm:ss')
      }
    },
    // createTime: {
    //   label: '任务编号'
    // },
    eventTitle: {
      label: '任务名称'
    },
    // value4: {
    //   label: '响应等级'
    // },
    noteType: {
      label: '任务状态',
      formatter: (row) => {
        return row?.desc
      }
    },
    handleDeptName: {
      label: '处置单位'
    },
    operation: {
      label: '操作',
      width: '140',
      fixed: 'right'
    }
  }
})
watch(queryParams, () => {
  if (!props.isDefault) {
    handleSearch()
  }
})
const handle = (row) => {
  router.push({
    path: '/Schedule/Center/taskinfo',
    query: {
      id: row.eventId
    }
  })
}
const handlelist = () => { 
  router.push({
    path: '/plan/task'
  })
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
/** 任务下发 */
const handleIssued = (row) => {
  console.log(row)
  router.push({
    path: '/Schedule/Center/taskmove',
    query: {
      id: row.id
    }
  })
}
onMounted(() => {
  // DeptApi.getDept(user.user.deptId).then((res)=>{
  //   console.log(res);
  //   waterAuthority.value = res.waterAuthority
    
  // })
  // waterAuthority.value = props.waterAuthority

})
</script>
<style lang="scss" scoped>
.filter-container {
  display: flex;
  .at-table-search {
    flex: 1;
    border: 0;
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
