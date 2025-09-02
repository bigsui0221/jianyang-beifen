<template>
  <el-card class="at-table-search" shadow="never">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="auto">
      <el-form-item
        :label="field.label"
        :prop="field.prop"
        v-for="field in fieldsData"
        :key="field.prop"
      >
        <!-- 输入框 -->
        <el-input
          :id="field.prop"
          v-model="queryParams[field.prop]"
          :placeholder="placeholder(field)"
          v-if="field.components === 'input'"
          @keyup.enter="handleEnter"
          @change="field.onChange"
        />
        <!-- 下拉框 -->
        <at-select
          v-model="queryParams[field.prop]"
          v-if="field.components === 'select'"
          :config="field"
          @change="field.onChange"
          filterable
          @options-change="field.optionsChange"
        />
        <el-date-picker
          :id="field.prop"
          v-if="field.components == 'date'"
          :type="field.type"
          :placeholder="placeholder(field)"
          v-model="queryParams[field.prop]"
          :format="field.format"
          :value-format="field.valueFormat"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="field.defaultTime"
          :clearable="false"
          @change="field.onChange"
        />
      </el-form-item>
      <el-form-item class="btn-group">
        <el-button type="primary" :icon="Search" @click="handleQuery"> 搜索 </el-button>
        <el-button :icon="RefreshLeft" @click="resetQuery">重置</el-button>
        <el-button type="text" v-if="fields.more" @click="open = !open">{{
          open ? '收起' : '展开'
        }}</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
defineOptions({ name: 'AtTableSearch' })
import { Search, RefreshLeft } from '@element-plus/icons-vue'
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update:modelValue', 'search', 'reset'])
const queryFormRef = ref()
const open = ref(false)

const queryParams = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const fieldsData = computed(() => {
  let arr: Object[] = []
  for (const key in props.fields) {
    let field = props.fields[key]
    if (key == 'more') {
      for (const key2 in field) {
        arr.push({ ...field[key2], prop: key2, hide: true })
      }
    } else {
      arr.push({ ...field, prop: key })
    }
  }
  let res: any[] = []
  arr.forEach((field: any) => {
    queryParams.value[field.prop] = queryParams.value[field.prop] ?? undefined
    if (field.components == 'date') {
      if (field.type == 'daterange') {
        queryParams.value[field.prop] = queryParams.value[field.prop] ?? []
        field.defaultTime = field.defaultTime ?? [new Date(2000, 1, 1, 0, 0, 0),
        new Date(2000, 2, 1, 23, 59, 59),]
      } else {
        field.defaultTime = field.defaultTime ?? undefined
      }
    }
    field.onChange =
      field.onChange && field.onChange instanceof Function ? field.onChange : () => {}
    if (field.components == 'select') {
      field.optionsChange =
        field.optionsChange && field.optionsChange instanceof Function
          ? field.optionsChange
          : () => {}
    }
    field.valueFormat =
      field.valueFormat || (field.components == 'date' ? 'YYYY-MM-DD HH:mm:ss' : undefined)
    if (!field.hide || (field.hide && open.value)) {
      res.push(field)
    }
  })

  return res
})
const placeholder = (field) => {
  if (field.placeholder) return field.placeholder
  return (['input'].includes(field.components) ? '请输入' : '请选择') + field.label
}
const handleQuery = () => {
  emit('search', queryParams.value)
}
const resetQuery = () => {
  queryFormRef.value.resetFields()
  emit('reset')
}
const handleEnter = () => {
  handleQuery()
}
</script>

<style lang="scss" scoped>
.el-card {
  border: 0;

  :deep(.el-card__body) {
    padding: 0;
  }
}

.el-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  :deep(.el-form-item) {
    &:not(.btn-group) {
      width: calc(16.66% - 10px);
      min-width: 300px;
      display: flex;
      align-items: center;

      .el-form-item__label {
        white-space: nowrap;
      }

      .el-form-item__content {
        flex: 1;
        min-width: 200px;

        .el-date-editor {
          .el-range__close-icon {
            display: none;
          }
        }
      }
      .el-date-editor {
        --el-date-editor-width: 100%;
      }
    }
  }
}
</style>
