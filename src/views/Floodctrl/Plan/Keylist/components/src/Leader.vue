<template>
  <at-table-operation title="负责人" :config="operationConfig" />
  <at-table ref="atTableRef" :config="tableConfig">
    <template #post="{ row }">
      <el-input v-model="row.post" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.post }}</span>
    </template>
    <template #name="{ row }">
      <el-input v-model="row.name" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.name }}</span>
    </template>
    <template #position="{ row }">
      <el-input v-model="row.position" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.position }}</span>
    </template>
    <template #phone="{ row }">
      <el-input v-model="row.phone" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.phone }}</span>
    </template>
    <template #operation="{ row }">
      <el-button link type="primary" v-if="row.isSave === false" @click="handleSave(row)">保存</el-button>
      <el-button link type="danger" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
</template>

<script lang="ts" setup>
const message = useMessage() // 消息弹窗
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
  list: [] as any[],
  height: 'auto',
  fields: {
    post: {
      label: '岗位'
    },
    name: {
      label: '姓名'
    },
    position: {
      label: '职务'
    },
    phone: {
      label: '电话'
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
const handleAdd = () => {
  let count = tableConfig.list.filter((item) => !item.isSave).length
  if (count === 0)
    tableConfig.list.push({ isSave: false })
  else
    message.warning('请先保存当前数据')
}
const handleSave = (row) => {
  if (!row.post || !row.name || !row.position || !row.phone) {
    message.warning('请输入完整信息')
    return
  }
  row.isSave = true
  emit('update:modelValue', tableConfig.list)
}
const handleDel = (row) => {
  tableConfig.list = tableConfig.list.filter((item) => item !== row)
  emit('update:modelValue', tableConfig.list)
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '添加负责人'
  } as any
})
onMounted(() => {
  if (props.isInfo) {
    tableConfig.fields.operation = false
    operationConfig.add = false
  }
})
</script>
