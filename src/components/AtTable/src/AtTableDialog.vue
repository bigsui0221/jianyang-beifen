<template>
  <el-dialog
    :close-on-click-modal="true"
    :fullscreen="isFullscreen"
    :width="config.width || '800px'"
    destroy-on-close
    lock-scroll
    draggable
    class="form-dialog"
    :show-close="false"
    @close="$emit('update:modelValue', false)"
    top="50px"
    append-to-body
  >
    <template #header="{ close }">
      <div class="relative h-54px flex items-center justify-between pl-15px pr-15px">
        <slot name="title">
          {{ config.title ?? '标题' }}
        </slot>
        <div
          class="absolute right-15px top-[50%] h-54px flex translate-y-[-50%] items-center justify-between"
        >
          <Icon
            class="is-hover mr-10px cursor-pointer"
            :icon="isFullscreen ? 'radix-icons:exit-full-screen' : 'radix-icons:enter-full-screen'"
            color="var(--el-color-info)"
            hover-color="var(--el-color-primary)"
            @click="toggleFull"
          />
          <Icon
            class="is-hover cursor-pointer"
            icon="ep:close"
            hover-color="var(--el-color-primary)"
            color="var(--el-color-info)"
            @click.stop="close"
          />
        </div>
      </div>
    </template>
    <AtForm ref="atFormRef" :config="formConfig">
      <template v-for="(_, slot) in $slots" #[slot]>
        <slot :name="slot"></slot>
      </template>
    </AtForm>
    <slot name="bottom"></slot>
    <template #footer v-if="!config.readonly && formButtons.length > 0">
      <div class="dialog-footer">
        <el-button
          v-for="btn in formButtons"
          :ref="btn.key"
          :key="btn.key"
          :type="btn.type"
          :icon="btn.icon"
          :size="btn.size"
          @click="onClick(btn)"
          :loading="btn.loading"
          >{{ btn.label }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
defineOptions({ name: 'AtTableDialog' })
import { AtForm } from '@/components/AtTable'
const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update:modelValue', 'submit'])
const atFormRef = ref()
const buttonGroup = ref({
  submit: {
    label: '保存',
    type: 'primary',
    validate: true
  },
  cancel: {
    label: '取消',
    type: 'default',
    onClick: () => {
      emit('update:modelValue', false)
    }
  }
})
const isFullscreen = ref(false)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
}
const formConfig = computed(() => {
  const { fields } = props.config
  for (const key in fields) {
    fields[key].row = fields[key].row || 12
  }
  return {
    validateOnRuleChange: props.config.validateOnRuleChange ?? false,
    readonly: props.config.readonly,
    fields: fields,
    formData: props.config?.formData ?? {}
  }
})
const formButtons = computed(() => {
  let arr: any[] = []
  if (props.config.button === false) {
    return arr
  }
  if (Object.keys(props.config?.button ?? {}).length > 0) {
    for (const key in props.config.button) {
      let btn = buttonGroup.value[key]
      let obj = props.config.button[key]
      arr.push({ ...btn, ...obj, key })
    }
  } else {
    for (const key in buttonGroup.value) {
      let btn = buttonGroup.value[key]
      arr.push({ ...btn, key })
    }
  }
  return arr
})
const onClick = (btn) => {
  if (btn.validate) {
    atFormRef.value
      ?.validate()
      .then((data) => {
        if (btn.onClick) {
          btn.onClick(data)
        } else {
          emit('submit', data)
        }
      })
      .catch(() => {})
  } else {
    btn.onClick && btn.onClick()
  }
}
</script>

<style lang="scss">
.el-dialog {
  &.form-dialog {
    .el-dialog__header {
      height: 54px;
      padding: 0;
      margin-right: 0;
      border-bottom: 1px solid var(--el-border-color);
    }
    .el-dialog__body {
      padding: 15px;
      max-height: calc(100vh - 100px - 54px - 63px);
      overflow-x: hidden;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 2px;
        height: 10px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #999;
        border-radius: 2px;
        height: 20px;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
        border-radius: 2px;
      }
    }
    .el-dialog__footer {
      padding: 15px;
      border-top: 1px solid var(--el-border-color);
    }
  }
}
</style>
