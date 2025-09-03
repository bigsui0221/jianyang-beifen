<template>
  <at-table-operation title="逃生路线" :config="operationConfig" />
  <at-table ref="atTableRef" :config="tableConfig">
    <template #operation="{ row }">
      <el-button link type="danger" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  isInfo: {
    type: Boolean,
    default: false
  }
})
const tableConfig = reactive({
  list: props.modelValue as any[],
  height: '300px',
  fields: {
    value1: {
      label: '路线名称'
    },
    value2: {
      label: '场所名称'
    },
    value3: {
      label: '防汛风险'
    },
    value4: {
      label: '地址'
    },
    operation: {
      label: '操作',
      width: '120',
      fixed: 'right'
    } as any
  }
})
const handleAdd = () => {

}
const handleDel = (row) => {
  tableConfig.list = tableConfig.list.filter((item) => item !== row)
  emit('update:modelValue', tableConfig.list)
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '添加逃生路线'
  } as any
})
onMounted(() => {
  if (props.isInfo) {
    tableConfig.fields.operation = false
    operationConfig.add = false
  }
})
</script>
