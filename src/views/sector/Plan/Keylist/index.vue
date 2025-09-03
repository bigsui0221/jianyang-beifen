<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #route="{ row }">
        <span>{{ routeNums(row.route) }}</span>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { KeyAreaApi } from '@/api/Floodctrl/plan/keyarea'
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  value3: {
    label: '重点区域',
    components: 'input'
  },
  value4: {
    label: '责任单位',
    components: 'input'
  },
  value5: {
    label: '标签',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: KeyAreaApi.getKeyAreaPage,
  fields: {
    drownUnit: {
      label: '防汛重点'
    },
    typeName: {
      label: '类型'
    },
    dgaeTypeName: {
      label: '风险点类型'
    },
    detailAddress: {
      label: '地址'
    },
    route: {
      label: '逃生路线'
    },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const routeNums = (route) => {
  if (route && route.startsWith('[') && route.endsWith(']')) {
    return JSON.parse(route).length
  }
  return 0
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  sessionStorage.setItem('keylistadd', '1')
  router.push({
    path: '/plan/keylist/info',
  })
}
const handleInfo = (row: any) => {
  router.push({
    path: '/plan/keylist/info',
    query: {
      id: row.id,
      io: 1
    }
  })
}
const handleEdit = (row: any) => {
  router.push({
    path: '/plan/keylist/info',
    query: {
      id: row.id
    }
  })
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    KeyAreaApi.deleteKeyArea(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  export: {
    api: KeyAreaApi.exportKeyArea
  }
})
</script>
