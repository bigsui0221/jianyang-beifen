<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" @load-end="handleLoadEnd">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>

        <el-dropdown placement="bottom" v-if="row.files" @command="handleCommand">
          <el-button link type="primary">查看文件</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in row.files" :key="index" :command="item.url">{{ item.name
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </at-table>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { DisasterWarnApi } from '@/api/Floodctrl/publish/disasterwarn'
import { formatToDateTime } from '@/utils/dateUtil'
const message = useMessage()
const tabs = ref([
  {
    label: '气象预警',
    value: '1'
  },
  {
    label: '灾害预警',
    value: '2'
  }
])
const activeTab = ref('1')
watch(activeTab, (val) => {
  queryParams.type = val
  handleSearch()
})
const handleLoadEnd = (data) => {
  data.forEach((item) => {
    if (item.files && item.files.startsWith('[') && item.files.endsWith(']')) {
      item.files = JSON.parse(item.files)
    }
  })
}
const handleCommand = (url) => {
  window.open(url)
}
const queryParams = reactive({
  type: activeTab.value
})
const queryFields = reactive({
  name: {
    label: '灾害名称',
    components: 'input'
  },
  level: {
    label: '预警等级',
    components: 'select',
    dictType: 'fx_disaster_warn_level'
  },
  deptId: {
    label: '行政区划',
    components: 'select',
  }
})
const atTableRef = ref()
const tableConfig = reactive({
  api: DisasterWarnApi.getDisasterWarnPage,
  fields: {
    warnTypeName: {
      label: '预警类型'
    },
    disTypeName: {
      label: '灾害名称'
    },
    name: {
      label: '预警标题'
    },
    deptName: {
      label: '行政区域'
    },
    levelName: {
      label: '预警等级'
    },
    status: {
      label: '预警状态',
      formatter: (value) => {
        return value === 1 ? '启动' : '关闭'
      }
    },
    publishTime: {
      label: '发布时间',
      formatter: 'date'
    },
    operation: {
      label: '操作',
      width: '140',
      fixed: 'right'
    }
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '编辑',
  width: '600px',
  formData: {} as any,
  fields: {
    disType: {
      label: '预警类型',
      components: 'select',
      dictType: 'fx_disaster_dis_type',
      required: true,
      row: 24
    },
    level: {
      label: '预警等级',
      components: 'select',
      dictType: 'fx_disaster_warn_level',
      required: true,
      row: 24
    },
    warnType: {
      label: '预警状态',
      components: 'select',
      dictType: 'fx_disaster_warn_type',
      required: true,
      row: 24
    },
    name: {
      label: '预警标题',
      components: 'input',
      required: true,
      row: 24
    },
    publishTime: {
      label: '预警时间',
      components: 'date',
      type: 'datetimerange',
      required: true,
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      row: 24
    },
    content: {
      label: '预警内容',
      components: 'editor',
      required: true,
      row: 24
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleEdit = (row) => {
  dialogConfig.visible = true
  dialogConfig.formData = { ...row }
  dialogConfig.fields.disType.dictType = dialogConfig.formData.type === 1 ? 'fx_disaster_wea_type' : 'fx_disaster_dis_type'
  dialogConfig.formData.publishTime = [formatToDateTime(row.startTime), formatToDateTime(row.endTime)]
}
const submitDialogForm = (data) => {
  DisasterWarnApi.updateDisasterWarn(data).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
</script>
