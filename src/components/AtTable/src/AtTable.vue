<template>
  <el-card ref="rootRef" class="at-table" :style="{ height: atTableHeight }" shadow="never">
    <el-table ref="elTableRef" v-loading="loading" :data="tableList" :stripe="config.stripe !== false ? true : false"
      :border="config.border" :span-method="config.spanMethod" :height="tableHeight" :max-height="config.maxHeight"
      @selection-change="handleSelectionChange" @expand-change="handleExpandChange" :empty-text="config.placeholder"
      :row-key="config.rowKey || 'id'" :tree-props="config.treeProps" :expand-row-keys="config.expandedRowKeys"
      :default-expand-all="config.defaultExpandAll">
      <el-table-column ref="elTableColumnRef" v-bind="attrs(field)" v-for="field in fieldsData" :key="field.prop"
        :type="field.type" :reserve-selection="config.reserveSelection || false"
        :className="field.className ?? field.prop">
        <template v-if="field.children">
          <el-table-column v-bind="attrs(field)" v-for="childrenField in field.children" :key="childrenField.prop">
            <template v-if="!childrenField.type" #default="scope">
              <template v-if="$slots[childrenField.prop]">
                <slot :name="childrenField.prop" :row="scope.row" :index="scope.$index"></slot>
              </template>
              <template v-else>{{
                childrenField.formatter(scope.row[childrenField.prop], scope.row)
              }}</template>
            </template>
          </el-table-column>
        </template>
        <template v-if="!field.type" #default="scope">
          <template v-if="$slots[field.prop]">
            <slot :name="field.prop" :row="scope.row" :index="scope.$index"></slot>
          </template>
          <template v-else>{{ field.formatter(scope.row[field.prop], scope.row) }}</template>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="showPagination" :total="total" v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize" @pagination="onPagination" />
  </el-card>
</template>

<script setup lang="ts">
defineOptions({ name: 'AtTable' })
import { debounceOrThrottle } from '@/utils'
import { formatToDate, formatToDateTime } from '@/utils/dateUtil'
import { getDictLabel } from '@/utils/dict'
import { formatterCurrency, numberFormatTime } from '@/utils/number'
const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object,
    default: () => ({})
  }
})
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const atTableHeight = ref('auto')
const tableHeight = ref('auto')
const immediate = ref<boolean | undefined>(undefined)
const resizeObserver = ref<ResizeObserver | null>(null)
const elTableColumnProps = ref({})
const debounceGetTableList = ref<(...args: any[]) => void | null>()

const rootRef = ref()
const elTableRef = ref()
const elTableColumnRef = ref()

const emit = defineEmits(['loadEnd', 'selection-change', 'expand-change'])

const attrs = computed(() => {
  return (field) => {
    let res = {}
    for (let key in elTableColumnProps.value) {
      res[key] = field[key] ?? elTableColumnProps.value[key]
    }
    return res
  }
})
const fieldsData = computed(() => {
  let map = props.config?.fields ?? {}
  if (Object.prototype.toString.call(map) !== '[object Map]') {
    map = new Map(Object.entries(map))
  }
  let arr: any[] = []
  for (const [key, value] of map) {
    if (!value) continue
    let obj = { ...value, prop: key.toString() }
    obj = getFieldData(obj)
    if (obj.children) {
      const children: any[] = []
      for (const Ckey in obj.children) {
        let Cobj = { ...obj.children[Ckey], prop: Ckey }
        Cobj = getFieldData(Cobj)
        if (!Cobj.hide) children.push(Cobj)
      }
      if (!obj.hide) arr.push({ ...obj, children: children })
    } else {
      if (!obj.hide) arr.push(obj)
    }
  }
  return arr
})
const showPagination = computed(() => {
  if (props.config.pagination == 'auto') {
    // 大于一页才显示分页
    return total.value > props.params.pageSize
  } else {
    // 默认有数据就显示分页
    return total.value > 0
  }
})
const queryParams = computed(() => {
  return { pageNo: 1, pageSize: 10, ...props.params }
})

watch(tableList, (val) => {
  console.log(val);

  emit('loadEnd', val ?? [])
})
watch(
  () => props.config.list,
  (val) => {
    if (val != undefined) getTableList()
  }
)
onMounted(() => {
  if (props.config.height == undefined) {
    initObserver()
  } else {
    tableHeight.value = props.config.height
  }
  elTableColumnProps.value = { ...elTableColumnRef.value?.[0]?.$props }
  debounceGetTableList.value = debounceOrThrottle(getTableList, 300)
})
onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
})
const getFieldData = (obj) => {
  if (obj.prop === 'index') {
    obj.type = 'index'
    obj.width = obj.width ?? '60px'
    obj.label = obj.label ?? '序号'
    obj.fixed = obj.fixed ?? 'left'
  }
  if (obj.prop === 'selection') {
    obj.type = 'selection'
    obj.width = obj.width ?? '55px'
    obj.fixed = obj.fixed ?? 'left'
    obj.selectable =
      obj.selectable && obj.selectable instanceof Function ? obj.selectable : () => true
    obj.reserveSelection = obj.reserveSelection ?? false
  }
  if (obj.formatter) {
    if (obj.formatter === 'date') {
      obj.formatter = (val) => {
        if (!val) return '-'
        return formatToDate(val)
      }
    }
    if (obj.formatter === 'dateTime') {
      obj.formatter = (val) => {
        if (!val) return '-'
        return formatToDateTime(val)
      }
    }
    if (obj.formatter === 'currency')
      obj.formatter = (val) => {
        return formatterCurrency(val)
      }
    if (obj.formatter === 'timeLong')
      obj.formatter = (val) => {
        return numberFormatTime(val)
      }
    if (typeof obj.formatter == 'string' && obj.formatter?.split('dict:').length > 1) {
      const dict = obj.formatter.split('dict:')[1]
      obj.formatter = (val) => {
        if (!val) return '-'
        return getDictLabel(dict, val)
      }
    }
  } else {
    obj.formatter = (val) => {
      return val
    }
  }
  obj.align = obj.align ?? 'center'
  return obj
}
const initObserver = () => {
  const search = rootRef.value.$el.parentElement?.querySelector('.at-table-search') // 搜索区域
  const operation = rootRef.value.$el.parentElement?.querySelector('.at-table-operation') // 操作区域
  const pagination = rootRef.value.$el.parentElement?.querySelector('.el-pagination') // 分页区域
  resizeObserver.value = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry?.target?.classList?.contains('el-pagination') &&
        pagination.offsetHeight > 0
      ) {
        setTableHeight()
      } else {
        setAtTableHeight()
      }
    })
  })
  if (search) resizeObserver.value.observe(search)
  if (operation) resizeObserver.value.observe(operation)
  if (pagination) resizeObserver.value.observe(pagination)
}
const setTableHeight = () => {
  if (props.config.height) return (tableHeight.value = props.config.height)
  if (props.config.height == undefined) {
    const pagination = rootRef.value.$el.parentElement?.querySelector('.el-pagination') // 分页区域
    if (pagination) tableHeight.value = `calc(100% - ${pagination.offsetHeight}px - 15px)`
  }
}
const setAtTableHeight = () => {
  const search = rootRef.value.$el.parentElement?.querySelector('.at-table-search') // 搜索区域
  const operation = rootRef.value.$el.parentElement?.querySelector('.at-table-operation') // 操作区域
  const tabs = rootRef.value.$el.parentElement?.querySelector('.at-tabs') // 标签页区域
  if (search || operation || tabs)
    atTableHeight.value = `calc(100vh - 80px - 56px - ${(search?.offsetHeight ?? 0) + (operation?.offsetHeight ?? 0) + (tabs?.offsetHeight ?? 0) // search-margin-bottom
      }px)`
  else atTableHeight.value = `calc(100%)`
}
const onPagination = () => {
  getTableList()
  nextTick(() => {
    // 调到底部
    // this.$refs.elTableRef.bodyWrapper.scrollTop = this.$refs.elTableRef.bodyWrapper.scrollHeight;
    // 调到顶部
    if (elTableRef.value.bodyWrapper) elTableRef.value.bodyWrapper.scrollTop = 0
  })
}
const getTableList = () => {
  if (props.config?.list) {
    if (props.config?.pagination === false) {
      tableList.value = props.config?.list
      total.value = 0
    } else {
      const start = (queryParams.value.pageNo - 1) * queryParams.value.pageSize
      const end = queryParams.value.pageNo * queryParams.value.pageSize
      tableList.value = props.config?.list.slice(start, end)
      total.value = props.config?.list?.length
    }
    return
  }
  if (props.config?.api && immediate.value !== false) {
    loading.value = true
    const params = {}
    // 排除不需要的参数
    for (const key in queryParams.value) {
      if (props.config?.exclude?.includes(key)) {
        continue
      }
      params[key] = queryParams.value[key]
    }
    props.config
      ?.api(params)
      .then((res) => {
        // 无分页
        if (props.config.pagination === false) {
          tableList.value = res ?? []
          total.value = 0
        } else {
          if (queryParams.value?.pageNo == 0 || queryParams.value?.pageSize == 0) {
            tableList.value = []
            total.value = 0
          } else {
            tableList.value = res.list
            total.value = res.total
          }
        }
        loading.value = false
      })
      .catch(() => {
        loading.value = false
      })
  }
  immediate.value = true
}
const refresh = () => {
  if (debounceGetTableList.value) debounceGetTableList.value()
  else {
    getTableList()
  }
}
const clear = () => {
  tableList.value = []
  total.value = 0
}
const handleSelectionChange = (val) => {
  emit('selection-change', val)
  if (props.config?.fields?.selection && typeof props.config.fields.selection == 'function') {
    props.config.fields.selection(val)
  }
}
const handleExpandChange = (val) => {
  emit('expand-change', val)
}
const toggleRowSelection = (row, selected) => {
  elTableRef.value.toggleRowSelection(row, selected)
}
watch(
  () => props.config,
  (val, old) => {
    // 是否立即执行加载数据
    if (immediate.value === undefined) {
      immediate.value = val.immediate ?? true
    }
    if (val?.['api'] !== old?.['api'] || val?.['fields'] !== old?.['fields']) {
      getTableList()
    } else {
      if (debounceGetTableList.value) debounceGetTableList.value()
    }
    nextTick(() => {
      elTableRef.value?.doLayout()
    })
  },
  { immediate: true, deep: true }
)
defineExpose({ refresh, clear, loading, toggleRowSelection })
</script>

<style lang="scss" scoped>
.el-card {
  border: 0;

  :deep(.el-card__body) {
    height: 100%;
    padding: 0;
  }
}

// 解决左右 对不齐 的情况
// el-table 左右有列固定时，fixed为left和right时，行未对齐解决办法
// * 产生原因： el-table底部有滚动条，固定列底部没有滚动条
// * 解决办法： 在el-table的表格中设置padding-bottom的内边距跟滚动条等高
:deep(.el-table) {

  .el-table__fixed,
  .el-table__fixed-left,
  .el-table__fixed-right {
    // 10 是我这里全局定义的滚动条的高度
    height: calc(100% - 10px) !important;
  }

  .el-table__fixed-body-wrapper {
    height: calc(100% - 43px) !important;
  }

  .el-table__fixed-body-wrapper .el-table__body {
    /*滚动条高度*/
    // 10 是我这里全局定义的滚动条的高度
    padding-bottom: 10px !important;
  }

  .el-table__body {
    .red {
      color: #ff4058;
    }
  }

  .operation {
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}
</style>
