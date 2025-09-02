<template>
  <at-table-operation title="应急物资" :config="operationConfig" />
  <at-table ref="atTableRef" :config="tableConfig">
    <template #needNum="{ row }">
      <span v-if="isInfo">{{ row.needNum }}</span>
      <el-input-number v-model="row.needNum" placeholder="请输入" v-else />
    </template>
    <template #operation="{ row }">
      <el-button link type="danger" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>


  <Dialog v-model="dialogVisible" title="添加物资" width="65%">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableDialogRef" :config="tableDialogConfig" @loadEnd="handleLoadEnd" />
    <template #footer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { MaterialsApi } from '@/api/Floodctrl/materials'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([])
  },
  isInfo: {
    type: Boolean,
    default: false
  }
})


const tableConfig = reactive({
  list: [] as any[],
  height: 'auto',
  fields: {
    goodsName: {
      label: '物资名称'
    },
    specificationModel: {
      label: '规格型号'
    },
    storeNum: {
      label: '库存数量'
    },
    needNum: {
      label: '使用数量'
    },
    unit: {
      label: '物资单位'
    },
    operation: {
      label: '操作',
      width: '120',
      fixed: 'right'
    } as any
  }
})

watch(() => props.modelValue, (val) => {
  if (val)
    tableConfig.list = val
})
const dialogVisible = ref(false)
const queryParams = ref({})
const atTableDialogRef = ref()
const materialsSelect = ref()
const queryFields = reactive({
  warehouseId: {
    label: '仓库',
    components: 'select',
    dictType: 'ai_platform'
  },
  materialsTypeName: {
    label: '物资名称',
    components: 'input'
  },
  specificationModel: {
    label: '规格型号',
    components: 'input'
  },
})
const tableDialogConfig = reactive({
  api: MaterialsApi.getMaterialsPage,
  height: '300px',
  reserveSelection: true,
  fields: {
    selection: (val) => {
      materialsSelect.value = val
      console.log(val)
    },
    warehouseName: {
      label: '仓库'
    },
    materialsTypeName: {
      label: '物资名称'
    },
    specificationModel: {
      label: '规格型号'
    },
    residueNumber: {
      label: '数量'
    },
    unitMeasurement: {
      label: '单位'
    },
  }
})
const handleSearch = () => {
  atTableDialogRef.value?.refresh()
}
const handleAdd = () => {
  let arr: any[] = []
  for (const item of materialsSelect.value) {
    arr.push({
      warehouseId: item.warehouseId,
      goodsId: item.id,
      needNum: tableConfig.list.find((i: any) => i.goodsId === item.id)?.needNum || 1,
      goodsName: item.materialsTypeName,
      specificationModel: item.specificationModel,
      storeNum: item.residueNumber,
      unit: item.unitMeasurement
    })
  }
  emit('update:modelValue', arr)
  tableConfig.list = arr;
  dialogVisible.value = false
}
const handleDel = (row) => {
  tableConfig.list = tableConfig.list.filter((item) => item !== row)
  emit('update:modelValue', tableConfig.list)
}
const handleLoadEnd = (tableData) => {
  tableData.forEach((item) => {
    if (tableConfig.list.findIndex((i: any) => i.goodsId === item.id) > -1) {
      atTableDialogRef.value?.toggleRowSelection(item, true)
    }
  })
}
const operationConfig = reactive({
  add: {
    onClick: () => {
      dialogVisible.value = true
    },
    label: '添加应急物资'
  } as any
})
onMounted(() => {
  if (props.isInfo) {
    tableConfig.fields.operation = false
    operationConfig.add = false
  }
})
</script>
