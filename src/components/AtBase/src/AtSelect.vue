<template>
  <!-- 下拉框 -->
  <el-select ref="elSelect" v-bind="attrs" v-model="selectValue" class="at-select">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script lang="ts" setup>
import { getStrDictOptions } from '@/utils/dict'
import { RegionApi } from '@/api/Floodctrl/region'
import { DangerAreaApi } from '@/api/Floodctrl/scada/dangerarea'
import { SiteApi } from '@/api/Floodctrl/site'
defineOptions({ name: 'AtSelect' })
const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  config: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['change', 'input', 'optionsChange', 'update:modelValue'])
const selectValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const onSelectChange = (val: any) => {
  if (props.config.onChange)
    props.config.onChange(val, options.value.find(e => e.value == val))
}
const options = ref<any[]>([])
const first = ref(true)
const attrs = ref({})
const $attrs = useAttrs()
const getAttrs = () => {
  let placeholder = props.config.placeholder ?? '请选择' + (props.config.label ?? "")
  if (props.config.disabled) placeholder = '-'
  attrs.value = { ...props.config, placeholder: placeholder, ...$attrs, onChange: onSelectChange }
}
/** 初始化下拉，只初始化一次 */
const initOptions = () => {
  first.value = false
  options.value = []
  if (props.config.options?.length > 0) {
    options.value = props.config.options || []
    return
  }
  if (props.config.api) {
    props.config.api(props.config.params ?? {}).then(res => {
      options.value = props.config?.response ? props.config.response(res) : res
    })
    return
  }
  if (props.config.dictType) {
    options.value = getStrDictOptions(props.config.dictType)
    return
  }
  /** 区域 */
  if (['deptId', 'regionId'].includes(props.config.prop)) {
    RegionApi.getRegionPage({
      pageNo: 1,
      pageSize: 9999,
      ...props?.config?.params ?? {}
    }).then(res => {
      options.value = res.list.map(e => {
        return {
          label: e.regionName,
          value: e.id,
        }
      })
    })
    return;
  }
  /** 风险点 */
  if (props.config.prop == 'dgaeId') {
    DangerAreaApi.getDangerAreaPage({
      pageNo: 1,
      pageSize: 999,
      ...props?.config?.params ?? {}
    }).then(res => {
      options.value = res.list.map(e => {
        return {
          label: e.name,
          value: e.id,
          type: e.type
        }
      })
    })
  }
  /** 站点 */
  if (props.config.prop == 'siteId') {
    SiteApi.getSitePage({
      pageNo: 1,
      pageSize: 999,
      ...props?.config?.params ?? {}
    }).then(res => {
      options.value = res.list.map(e => {
        return {
          label: e.siteName,
          value: e.id,
          type: e.siteType
        }
      })
    })
  }
}
/** 设置下拉数据 */
const setOptions = () => {
  options.value = props.config.options ?? options.value
}

watch(
  () => props.config,
  () => {
    if (first.value) {
      initOptions()
    } else {
      setOptions()
    }
    getAttrs()
  },
  { immediate: true, deep: true }
)
watch(() => props.config.dictType, () => {
  initOptions()
})
watch(options, () => {
  emit('optionsChange', options.value)
})
onMounted(() => {
  getAttrs()
})
</script>

<style lang="scss" scoped></style>
