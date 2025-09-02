<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { DangerAreaApi } from '@/api/Floodctrl/scada/dangerarea'
const message = useMessage() // 消息弹窗
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '风险点名称',
    components: 'input'
  },
  type: {
    label: '风险点类型',
    components: 'select',
    dictType: 'fx_danger_type'
  }
})
const tableConfig = reactive({
  api: DangerAreaApi.getDangerAreaPage,
  fields: {
    name: {
      label: '风险点名称'
    },
    typeName: {
      label: '风险类型'
    },
    riskLevelName: {
      label: '风险等级',
      formatter: (_, row: any) => {
        return row?.riskLevelName ?? row.riskLevel
      }
    },
    stationList: {
      label: '绑定站点',
      formatter: (value) => {
        return value?.map((item) => {
          return item.siteName
        })?.join(',')
      }
    },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  router.push({ path: '/plan/riskdot/map' })
}
const handleEdit = (row: any) => {
  router.push({
    path: '/plan/riskdot/map', query: {
      id: row.id
    }
  })
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    DangerAreaApi.deleteDangerArea(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  }
})
</script>
