<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { isString } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'ContentWrap' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('content-wrap')

defineProps({
  title: propTypes.oneOfType([String, Array]).def('') as any,
  message: propTypes.string.def(''),
  bodyStyle: propTypes.object.def({ padding: '10px' }),
  border: propTypes.bool.def(true),
  borderColor: propTypes.string.def('#D9D9D9'),
  rounded: propTypes.string.def('8px'),
  bgColor: propTypes.string.def('var(--el-fill-color-blank)'),
  padding: propTypes.oneOfType([String, Boolean]).def('20px')
})
</script>

<template>
  <ElCard
    :body-style="bodyStyle"
    :class="[
      prefixCls,
      { '!border-0': !border },
      `!p-${padding != false ? padding : 0}`,
      `!rounded-${rounded}`
    ]"
    shadow="never"
    style="--el-card-border-color: transparent; --el-card-padding: 0; --el-card-border-radius: 0"
    :style="{
      padding: padding != false ? padding : 0,
      '--el-card-border-color': !border ? 'transparent' : borderColor,
      '--el-card-bg-color': bgColor
    }"
  >
    <template v-if="title" #header>
      <div class="w-1/1 h-43px flex items-start justify-between">
        <div class="h-25px flex items-center" v-if="isString(title)">
          <div class="w-4px h16px mr-8px rounded-2px bg-[var(--el-color-primary)]"></div>
          <div class="lh-25px text-18px text-#333 font-500">{{ title }}</div>
        </div>
        <div class="h-25px flex items-center" v-else>
          <div class="w-4px h16px mr-8px rounded-2px bg-[var(--el-color-primary)]"></div>
          <div
            class="lh-25px text-18px text-#333 font-500"
            :class="{ 'cursor-pointer': t.onClick }"
            v-for="(t, i) in title"
            :key="t.title"
            @click="t.onClick ? t.onClick() : false"
          >
            {{ t.title }}<Icon v-if="i == 0" icon="ep:arrow-right" class="ml-7px mr-7px" />
          </div>
        </div>
        <ElTooltip v-if="message" effect="dark" placement="right">
          <template #content>
            <div class="max-w-200px">{{ message }}</div>
          </template>
          <Icon :size="14" class="ml-5px" icon="ep:question-filled" />
        </ElTooltip>
        <div class="flex pl-20px">
          <slot name="header"></slot>
        </div>
      </div>
    </template>
    <slot></slot>
  </ElCard>
</template>
<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-padding: 100px !important;
  .el-card__header {
    padding: 0 !important;
    background-color: transparent;
  }
}
</style>
