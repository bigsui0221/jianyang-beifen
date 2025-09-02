<template>
  <el-row :gutter="16" class="at-info">
    <el-col :span="field.row" v-for="field in formFields" :key="field.prop">
      <AtTitle v-if="field.components == 'title'" :title="field.label" :class="field.class" :style="field.style" />
      <template v-else-if="$slots[field.prop]">
        <slot :name="field.prop"></slot>
      </template>
      <div class="at-info-item" v-else :class='field.className'>
        <div class="at-info-item-label">{{ field.label }}：</div>
        <div class="at-info-item-content">
          <div class="file-list" v-if="field.components === 'uploadFile' && formData[field.prop]">
            <div v-for="(item, index) in formData[field.prop]" :key="index">
              <a :href="item.url" target="_blank">{{ item.name }}</a>
            </div>
          </div>
          <span :id="field.prop" v-else>{{ fieldText(field) }}{{ field.append }}</span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
defineOptions({ name: 'AtForm' })
const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})

const fieldText = computed(() => {
  return (field) => {
    if (field.formatter) {
      if (typeof field.formatter === 'function' && formData.value[field.prop] !== undefined) {
        return field.formatter(formData.value[field.prop])
      }
    } else {
      return formData.value[field.prop] ?? '-'
    }
  }
})

const formData = ref(props.config?.formData ?? {})

const formFields = computed(() => {
  let arr: any[] = []
  for (const key in props.config?.fields) {
    let field = props.config?.fields[key]
    if (field.hide) continue
    field.prop = key
    field.row = field.row || 24
    field.span = field.span || 24
    arr.push(field)
  }
  return arr
})
onMounted(() => {
  const maxWidth = Math.max(
    ...Array.from(document.querySelectorAll('.at-info-item:not(.top) .at-info-item-label')).map(
      (item) => (item as HTMLElement).offsetWidth
    )
  )
  document.querySelectorAll('.at-info-item-label').forEach((item) => {
    const parentElement = item.parentElement as HTMLDivElement
    const label = item as HTMLDivElement
    const content = label.nextElementSibling as HTMLDivElement
    if (parentElement.classList.contains('top')) {
      content.style.marginLeft = `${maxWidth}px`;
    } else {
      label.style.marginLeft = `${maxWidth - (item as HTMLElement).offsetWidth}px`;
    }
  })
})
</script>

<style lang="scss" scoped>
.el-row {
  .el-col {
    margin-bottom: 18px;

    .at-info-item {
      display: flex;
      align-items: center;

      &.top {
        flex-direction: column;
        align-items: flex-start;
      }

      &-label {
        text-align: right;
        padding: 0 12px 0 0;
      }

      &-content {
        flex: 1;
      }
    }
  }
}
</style>
