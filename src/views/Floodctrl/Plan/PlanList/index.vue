<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleEdit(row)">更新</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        <el-button link type="primary" @click="handleDown(row)">下载</el-button>
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { PlanApi } from '@/api/Floodctrl/plan/plan'
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '预案名称',
    components: 'input'
  },
  type: {
    label: '预案类型',
    components: 'select',
    dictType: 'fx_plan_type'
  },
  dgaeId: {
    label: '风险点',
    components: 'input'
  },
})
const tableConfig = reactive({
  api: PlanApi.getPlanPage,
  fields: {
    name: {
      label: '预案名称'
    },
    deptName: {
      label: '行政区划'
    },
    dgaeName: {
      label: '风险点'
    },
    typeName: {
      label: '预案类型'
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
    path: '/plan/planlist/info',
    query: {
      id: row.id,
      io: 1
    }
  })
}
const handleAdd = (row: any) => {
  router.push({
    path: '/plan/planlist/info',
  })
}
const handleEdit = (row: any) => {
  router.push({
    path: '/plan/planlist/info',
    query: {
      id: row.id
    }
  })
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    PlanApi.deletePlan(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const handleDown = (row: any) => {

}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '预案录入'
  }
})
</script>
