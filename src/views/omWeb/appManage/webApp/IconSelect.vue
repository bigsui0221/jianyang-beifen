<template>
  <div
    ref="buttonRef"
    class="iconSelect w-64px h-64px cursor-pointer border border-solid border-[var(--el-border-color)] rounded-[var(--el-border-radius-base)]"
    @click="visible = !visible"
  >
    <img v-show="!!src" width="64px" height="64px" filter="cover" :src="src" />
    <div v-show="!src" class="w-64px h-64px line-height-64px text-center text-gray-500"> + </div>
  </div>
  <el-popover ref="popoverRef" :virtual-ref="buttonRef" :width="400" :visible="visible">
    <el-input v-model="filterValue" class="p-2" clearable placeholder="搜索图标" />
    <el-divider class="!mt-6px !mb-12px" border-style="dashed" />
    <el-scrollbar max-height="400px">
      <div class="!w-372px flex gap-8px flex-wrap">
        <div
          v-for="(icon, index) in filterList"
          :key="index"
          :class="[
            'w-68px h-68px p-2px   flex items-center justify-center',
            'border border-solid border-gray-200 hover:border-blue-500 transition-all duration-300',
            'rounded-4px cursor-pointer overflow-hidden'
          ]"
          @click="updateModelValue(icon.id)"
        >
          <img width="64px" height="64px" filter="cover" :src="icon.url" class="rounded-4px" />
        </div>
      </div>
    </el-scrollbar>
  </el-popover>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import * as IconLibraryApi from '@/api/omWeb/iconLibrary'
const iconList = ref<IconLibraryApi.IconLibraryVO[]>([])

defineOptions({ name: 'IconSelect' })

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Number,
    quired: true
  },
  type: propTypes.string.def('')
})

const visible = ref(false)
const buttonRef = ref()
const popoverRef = ref()

const filterValue = ref('')

const src = computed(() => {
  return props.modelValue
    ? iconList.value.filter((fi: IconLibraryApi.IconLibraryVO) => fi.id == props.modelValue)[0]?.url
    : ''
})

const filterList = computed(() => iconList.value?.filter((v) => v.name.includes(filterValue.value)))

const updateModelValue = (id: number) => {
  visible.value = false
  emit('update:modelValue', id)
}

// 点击外部关闭弹出框的处理函数
const handleClickOutside = (event: MouseEvent) => {
  // 如果弹出框可见，并且点击的目标不在按钮或弹出框内部
  if (visible.value && popoverRef.value) {
    const buttonElement = buttonRef.value
    const popoverElement = popoverRef.value.$el

    // 检查点击目标是否在按钮或弹出框内部
    if (
      !buttonElement.contains(event.target as Node) &&
      !popoverElement.contains(event.target as Node)
    ) {
      visible.value = false
    }
  }
}

onMounted(async () => {
  props.type == '1'
    ? (iconList.value = await IconLibraryApi.getIconLibraryWebList())
    : (iconList.value = await IconLibraryApi.getIconLibraryMenuList())
  // 添加全局点击事件监听
  window.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  // 组件卸载时移除事件监听，避免内存泄漏
  window.removeEventListener('click', handleClickOutside)
})
</script>
<style lang="scss" scoped>
:deep(.el-dropdown-menu__item) {
  background-color: transparent !important;
  cursor: auto;
}
</style>
