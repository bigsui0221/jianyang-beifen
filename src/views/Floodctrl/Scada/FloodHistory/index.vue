<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleDownLoad(row)">下载</el-button>
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { FloodHistoryApi } from '@/api/Floodctrl/scada/floodhistory'
import { formatToDateTime } from '@/utils/dateUtil'
import download from '@/utils/download'

const message = useMessage() // 消息弹窗
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '洪水名称',
    components: 'input'
  },
  startTime: {
    label: '发生时间',
    components: 'date',
  },
})
const atTableRef = ref()
const tableConfig = reactive({
  api: FloodHistoryApi.getFloodHistoryPage,
  fields: {
    index: true,
    name: {
      label: '洪水名称'
    },
    detail: {
      label: '详情'
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
  title: '编辑',
  width: '700px',
  formData: {} as any,
  fields: {
    name: {
      label: '洪水名称',
      components: 'input',
      required: true,
      row: 24
    },
    time: {
      label: '发生时间',
      components: 'date',
      type: 'daterange',
      required: true,
      row: 24,
      onChange: (val) => {
        dialogConfig.formData.startTime = new Date(val[0]).getTime()
        dialogConfig.formData.endTime = new Date(val[1]).getTime()
      }
    },
    detail: {
      label: '详情',
      components: 'input',
      type: 'textarea',
      required: true,
      rows: 10,
      row: 24
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.formData = {}
}
const handleEdit = (row) => {
  dialogConfig.visible = true
  dialogConfig.formData = { ...row }
  dialogConfig.formData.time = [formatToDateTime(row.startTime), formatToDateTime(row.endTime)]
}
const handleDownLoad = (row) => {
  download.text((row.name + '\r\n' + row.detail) as any, '洪水记录')
}
const handleDel = (row) => {
  message.delConfirm().then(() => {
    FloodHistoryApi.deleteFloodHistory(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (row) => {
  let promise = FloodHistoryApi.createFloodHistory
  if (row.id) {
    promise = FloodHistoryApi.updateFloodHistory
  }
  promise(row).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
})
</script>
