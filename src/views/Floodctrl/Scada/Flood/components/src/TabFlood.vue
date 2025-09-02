<template>
  <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
  <at-table-operation v-model:params="queryParams" :config="operationConfig" />
  <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
    <template #operation="{ row }">
      <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
      <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
      <el-button link type="primary" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
  <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
</template>

<script setup lang="ts">
import { MapLocation } from '@element-plus/icons-vue'
import { ProjectInfoApi } from '@/api/Floodctrl/scada/projectinfo'
import { getDictLabel } from '@/utils/dict'
import { ProjectInfoFieldApi } from '@/api/Floodctrl/scada/projectinfofield'
const message = useMessage() // 消息弹窗
const router = useRouter()
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  name: {
    label: '名称',
    components: 'input'
  },
  type: {
    label: '类型',
    components: 'select',
    dictType: 'floodctrl_project_info_type'
  },
  status: {
    label: '状态',
    components: 'select',
    options: [{
      value: '1',
      label: '在建'
    }, {
      value: '2',
      label: '建成'
    }]
  }
})
const tableConfig = reactive({
  api: ProjectInfoApi.getProjectInfoPage,
  fields: {
    name: {
      label: '名称'
    },
    detailAddress: {
      label: '位置'
    },
    type: {
      label: '类型',
      formatter: (value: any) => {
        return getDictLabel('floodctrl_project_info_type', value)
      }
    },
    status: {
      label: '状态',
      formatter: (value: any) => {
        return value === '1' ? '在建' : '建成'
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
  title: '新增',
  readonly: false,
  formData: {} as any,
  fields: {
    type: {
      label: '类型',
      components: 'select',
      dictType: 'floodctrl_project_info_type',
      required: true,
      onChange: (value: any) => {
        getProjectInfoFieldList(value)
      }
    },
    name: {
      label: '堤防名字',
      components: 'input',
      required: true
    },
    riverName: {
      label: '河道名称',
      components: 'input',
      required: true
    },
    address: {
      label: '工程位置',
      components: 'inputMap',
      required: true,
      onChange: (value: any) => {
        dialogConfig.formData.lon = value.longitude
        dialogConfig.formData.lat = value.latitude
      }
    },
    detailAddress: {
      label: '详细地址',
      components: 'input'
    }
  }
})

const getProjectInfoFieldList = (value: any, id = "") => {
  let isflag = false
  for (const key in dialogConfig.fields) {
    if (isflag) {
      delete dialogConfig.fields[key]
    }
    if (key == 'detailAddress') isflag = true
  }
  if (!value) return
  ProjectInfoFieldApi.getProjectInfoFieldList({ projectType: value }).then((res) => {

    res.forEach(item => {
      dialogConfig.fields[item.value] = {
        label: item.label,
        components: item.type === 'string' ? 'input' : item.type === 'map' ? 'inputMap' : 'select',
        required: false,
        onChange: (value: any) => {
          if (item.type === 'map') {
            dialogConfig.formData[item.value] = value.longitude + ',' + value.latitude
          }
        }
      }
    });
    if (id)
      ProjectInfoApi.getProjectInfo(Number(id)).then((res) => {
        let content = {}
        if (res.content && res.content.startsWith('{') && res.content.endsWith('}'))
          content = JSON.parse(res.content);
        const obj = { ...res, ...content }
        for (const key in obj) {
          dialogConfig.formData[key] = obj[key]
        }
      })
  })
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
  getProjectInfoFieldList('')
}
const handleInfo = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '详情'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = true
  getProjectInfoFieldList(row.type, row.id)
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
  getProjectInfoFieldList(row.type, row.id)
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    ProjectInfoApi.deleteProjectInfo(row.id).then(() => {
      message.success('删除成功')
      handleSearch()
    })
  })
}
const submitDialogForm = (data) => {
  let formData: any = {
    content: {}
  }
  let promise = ProjectInfoApi.createProjectInfo
  if (data.id) {
    promise = ProjectInfoApi.updateProjectInfo
    formData.id = data.id
  }
  let isflag = false

  for (const key in dialogConfig.fields) {
    if (isflag) {
      formData.content[key] = data[key]
    } else {
      formData[key] = data[key]
    }
    if (key == 'detailAddress') isflag = true
  }
  promise({ ...formData, content: JSON.stringify(formData.content) }).then(() => {
    message.success('操作成功')
    dialogConfig.visible = false
    handleSearch()
  })
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '新增'
  },
  map: {
    icon: MapLocation,
    label: '地图',
    onClick: () => {
      router.push('/scada/flood/map')
    }
  }
})
</script>

<style lang="scss" scoped></style>