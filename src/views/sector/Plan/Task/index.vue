<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { EventNodeTaskApi } from '@/api/Floodctrl/eventnodetask'
import { formatToDateTime } from '@/utils/dateUtil'

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  taskDescription: {
    label: '任务名称',
    components: 'input'
  },
  taskLevel: {
    label: '响应等级',
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
  // disposalPersionnel: {
  //   label: '责任单位',
  //   components: 'input'
  // },
  taskStatus: {
    label: '状态',
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
  },
})
const tableConfig = reactive({
  api: EventNodeTaskApi.getEventNodeTaskPage,
  fields: {
    createTime: {
      label: '创建时间',
      formatter: (row) => { 
        return formatToDateTime(row)
      }
    },
    // value2: {
    //   label: '任务编号'
    // },
    taskDescription: {
      label: '任务名称'
    },
    taskLevel: {
      label: '响应等级',
      formatter: (row) => { 
        return row.desc
      }
    },
    taskStatus: {
      label: '任务状态',
      formatter: (row) => { 
        return row.desc
      }
    },
    disposalPersionnel: {
      label: '处置单位',

    },
    operation: {
      label: '操作',
      width: '200',
      fixed: 'right'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleInfo = (row: any) => {
  router.push({
    path: '/Schedule/Center/taskinfo',
    query: {
      id: row.eventId,
      io: 1
    }
  })
}
</script>
