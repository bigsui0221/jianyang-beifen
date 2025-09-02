<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <template v-if="row.status === 0">
          <el-button link type="primary" @click="handleWran(row)">预警</el-button>
          <el-button link type="primary" @click="handleIgnore(row)">忽略</el-button>
          <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        </template>
        <el-button link type="primary" @click="handleInfo(row)" v-else>详情</el-button>
      </template>
    </at-table>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig">
      <template #bottom>
        <el-steps direction="vertical" :active="processList.length" class="process">
          <el-step :title="item.name" v-for="item, index in processList" :key="index">
            <template #description>
              <div>{{ item.processUserName }} {{ formatToDateTime(item.createTime) }}</div>
            </template>
          </el-step>
        </el-steps>
      </template>
    </at-table-dialog>
    <at-table-dialog v-model="dialogIgnoreConfig.visible" :config="dialogIgnoreConfig"
      @submit="submitDialogIgnoreForm" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { Finished } from '@element-plus/icons-vue'
import router from '@/router'
import { WarningPreInfoApi } from '@/api/Floodctrl/warning/warningpreinfo'
import { formatToDateTime } from '@/utils/dateUtil'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  startTime: {
    label: '预警时间',
    components: 'date',
    type: 'daterange'
  },
  warnLevel: {
    label: '预警等级',
    components: 'select',
    dictType: 'fx_disaster_warn_level'
  },
  name: {
    label: '预警名称',
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
      label: '已处理',
      value: 1
    },
    {
      label: '已忽略',
      value: 2
    }]
  },
  regionId: {
    label: '行政区域',
    components: 'select',
  }
})
const selectionList = ref([])
const handleSelection = (selection: any) => {
  selectionList.value = selection
}
const tableConfig = reactive({
  api: WarningPreInfoApi.getWarningPreInfoPage,
  fields: {
    selection: handleSelection,
    startTime: {
      label: '预警时间',
      formatter: 'dateTime'
    },
    name: {
      label: '预警名称'
    },
    siteName: {
      label: '站点'
    },
    warnLevelName: {
      label: '预警等级'
    },
    regionName: {
      label: '行政区域'
    },
    status: {
      label: '状态',
      formatter: (value) => {
        if (value == 0) {
          return '待处理'
        } else if (value == 1) {
          return '已处理'
        } else {
          return '已忽略'
        }
      }

    },
    processUserName: {
      label: '处理人'
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
  title: '报警详情',
  width: '600px',
  readonly: false,
  formData: {} as any,
  fields: {
    name: {
      label: '报警名称',
      components: 'input',
      required: true,
      row: 24
    },
    startTime: {
      label: '报警时间',
      components: 'date',
      type: 'datetime',
      required: true
    },
    endTime: {
      label: '结束时间',
      components: 'date',
      type: 'datetime',
      required: true
    },
    siteName: {
      label: '报警站点',
      components: 'input',
      required: true,
    },
    collectValue: {
      label: '报警值',
      components: 'input',
      required: true
    },
    status: {
      label: '状态',
      components: 'select',
      required: true,
      options: [{
        label: '待处理',
        value: 0
      },
      {
        label: '已处理',
        value: 1
      },
      {
        label: '已忽略',
        value: 2
      }]
    },
  },
  warnLevel: {
    label: '报警等级',
    components: 'select',
    dictType: 'fx_disaster_warn_level',
    required: true
  },
})
const dialogIgnoreConfig = reactive({
  visible: false,
  title: '忽略',
  readonly: false,
  formData: {} as any,
  fields: {
    remark: {
      label: '忽略原因',
      components: 'input',
      type: 'textarea',
      required: true,
      row: 24
    }
  }
})
const processList = computed(() => {
  return dialogConfig?.formData?.processList ?? []
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleWran = (row: any) => {
  router.push({
    path: '/publish/warningAdd',
    query: {
      warnPreld: row.id
    }
  })
}
const handleInfo = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '详情'
  dialogConfig.readonly = true
  WarningPreInfoApi.getWarningPreInfo(row.id).then((res) => {
    if (!res) return
    for (const key in res) {
      dialogConfig.formData[key] = res[key]
    }
    dialogConfig.formData.startTime = formatToDateTime(res.startTime)
    dialogConfig.formData.endTime = formatToDateTime(res.endTime)
  })
}
const handleDel = (row: any) => {
  let idList: any = row.id ? [row.id] : null
  if (!idList) {
    idList = selectionList.value.map((item: any) => item.id)
    if (idList.length == 0) {
      return message.error('请选择要删除的数据')
    }
  }
  message.delConfirm().then(() => {
    WarningPreInfoApi.deleteWarningPreInfo(idList).then(() => {
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
const submitDialogIgnoreForm = (data) => {
  let idList: any = data.id ? [data.id] : null
  if (!idList) {
    idList = selectionList.value.map((item: any) => item.id)
    if (idList.length == 0) {
      return message.error('请选择要处理的数据')
    }
  }
  WarningPreInfoApi.putWarningPreIgnore({
    idList: idList,
    processUser: userStore.user.id,
    remark: dialogIgnoreConfig.formData.remark
  }).then(() => {
    message.success('操作成功')
    dialogIgnoreConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  // add: {
  //   onClick: handleAdd,
  //   label: '登记'
  // },
  ignore: {
    onClick: handleIgnore,
    label: '忽略',
    icon: Finished
  },
  delete: {
    onClick: handleDel
  }
})
</script>
<style lang="scss" scoped>
.process {
  :deep(.el-step) {
    padding-left: 48px;

    .el-step__main {
      padding-bottom: 16px;
    }
  }
}
</style>