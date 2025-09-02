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
      <el-button type="primary" @click="handleAdd" v-if="waterAuthority">创建</el-button>
      <el-button type="primary" @click="handleMore" v-if="!waterAuthority">查看更多</el-button>
    </div>
  </div>
  <at-table-operation v-model:params="queryParams" :config="operationConfig" v-if="isDefault" />
  <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" show-overflow-tooltip
    >
    <template #attachmentPath="{ row }">
      <a :href="row.attachmentPath" target="_blank">{{ row.attachmentPath }}</a>
    </template>
    <template #operation="{ row }">
      <el-button link type="primary" @click="handleSign(row)" v-if="!row.signforStatus">签收</el-button>
      <el-button link type="primary" @click="handleInfo(row)">查看</el-button>
    </template>
  </at-table>
  <at-table-dialog
    v-model="dialogConfig.visible"
    :config="dialogConfig"
    @submit="submitDialogForm"
  >
    <!-- <template #urgency v-if="dialogConfig.formData.urgency">
      <div>{{ dialogConfig.formData.urgency.desc }}</div>
    </template>
    <template #submissionChannel v-if="dialogConfig.formData.submissionChannel">
        <div>{{ dialogConfig.formData.submissionChannel.desc }}</div>
      </template> -->
  </at-table-dialog>
</template>
<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { DocumentExchangeApi } from '@/api/Floodctrl/documentexchange'
import { formatToDateTime } from '@/utils/dateUtil'

import * as DeptApi from '@/api/system/dept'

// import { h } from 'vue'
// import { ElLink } from 'element-plus'

// const tableRowFormatter = (data: any) => {
//   return `${data.cellValue}: table formatter`
// }


// const withVNode = (data: any) => {
//   return h(ElLink, { type: 'primary', href: data.cellValue }, () =>
//     h('span', null, data.cellValue)
//   )
// }

const list = ref()
const router = useRouter() // 路由
const message = useMessage()
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
  documentTitle: {
    label: '文件标题',
    components: 'input'
  },
  exchangeTime: {
    label: '交换时间',
    components: 'date'
  },
  urgency: {
    label: '紧急等级',
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
  }
})
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})
const atTableRef = ref()
const tableConfig = reactive({
  api: DocumentExchangeApi.getDocumentExchangePage,
  height: props.isDefault ? undefined : '300px',
  fields: {
    index: true,
    exchangeTime: {
      label: '交换时间',
      formatter: (row) => formatToDateTime(row)
    },
    documentTitle: {
      label: '文件标题'
    },
    description: {
      label: '文件描述'
    },
    urgency: {
      label: '紧急等级',
      formatter: (row) => {
        return row.desc
      }
    },
    receivingDeptName: {
      label: '接收单位'
    },
    attachmentPath: {
      label: '附件',
      width: '100px',
    },
    signforStatus: {
      label: '签收状态',
      formatter: (row) => {
        return row ? '已签收' : '未签收' 
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
  readonly: false,
  title: '新建',
  width: '600px',
  fields: {
    documentTitle: {
      label: '文件标题',
      components: 'input',
      row: 24,
      required: true
    },
    description: {
      label: '文件描述',
      components: 'input',
      type: 'textarea',
      row: 24
    },
    urgency: {
      label: '紧急程度',
      components: 'select',
      row: 24,
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
    receivingDeptId: {
      label: '接收单位',
      components: 'select',
      options: [],
      row: 24,
      required: true
    },
    submissionChannel: {
      label: '报送渠道',
      components: 'select',
      options: [
        {
          label: '值班值守',
          value: 'DUTY_ON_DUTY'
        },
      ],
      row: 24,
      required: true
    },
    submissionDeptId: {
      label: '报送单位',
      components: 'select',
      options: [],
      row: 24,
      required: true
    },
    submissionUserId: {
      label: '报送人',
      components: 'select',
      options: [],
      row: 24,
      required: true
    },
    submissionTime: {
      label: '报送时间',
      components: 'date',
      row: 24,
      required: true
    },
    attachmentPath: {
      label: '附件',
      components: 'uploadFile',
      row: 24,
      // required: true
    }
  }
})
watch(queryParams, () => {
  if (!props.isDefault) {
    handleSearch()
  }
})
const handleSign = (row) => {
  console.log(row)
  message.confirm('是否签收').then(() => {
    DocumentExchangeApi.signFor(row.id).then(() => {
      message.success('签收成功')
      atTableRef.value?.refresh()
    })
  })
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleMore = () => {
  router.push({ path: '/schedule/list', query: { a: 1 } })
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.formData = {}
  dialogConfig.title = '新建'
  dialogConfig.readonly = false
}
const handleInfo = (row) => {
  dialogConfig.visible = true
  dialogConfig.formData = { ...row }
  dialogConfig.title = '查看'
  dialogConfig.readonly = true
}
const submitDialogForm = (data) => {
  console.log(data)
  DocumentExchangeApi.createDocumentExchange({...data,
    attachmentPath: JSON.parse(data.attachmentPath).map(item => { return item.url }).join(',')
  }).then(() => {
    message.success('保存成功')
    dialogConfig.visible = false
    atTableRef.value?.refresh()
  })
}
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  console.log(res);
  list.value = res.map(item => ({
    label: item.name,
    value: item.id,
  }))
  dialogConfig.fields.receivingDeptId.options = list.value
  dialogConfig.fields.submissionDeptId.options = list.value

}
const getList = async () => {
  const res = await UserApi.getSimpleUserList()
  console.log(res);
  list.value = res.map(item => ({
    label: item.nickname,
    value: item.id,
  }))
  dialogConfig.fields.submissionUserId.options = list.value
}
const operationConfig = reactive({
  // add: {
  //   onClick: handleAdd,
  //   label: '创建'
  // }
})
onMounted(() => { 
  getTree()
  getList()
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
