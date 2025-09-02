<template>
  <el-card class="at-tabs" shadow="never" border="">
    <div
      class="tab"
      v-for="item in tabs"
      :key="item.value"
      :class="{ active: modelValue === item.value }"
      @click="onClick(item)"
    >
      <el-badge :value="item.number" class="item"> {{ item.label }}</el-badge>
    </div>
    <slot></slot>
  </el-card>
</template>

<script lang='ts' setup>
const emit = defineEmits(['update:modelValue', 'change'])
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  tabs: {
    type: Array as any,
    default: () => []
  }
})
const onClick = (item) => {
  emit('update:modelValue', item.value)
  nextTick(() => {
    emit('change', item)
  })
}
</script>

<style lang="scss" scoped>
.at-tabs {
  border: 0;
  width: 100%;
  &:has(+ .at-table),
  &:has(+ .at-table-search) {
    border-radius: 4px 4px 0 0;

    :deep(.el-card__body) {
      padding-bottom: 18px;
    }
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    color: #666;
    padding: 0;
    padding-bottom: 18px;
    .tab {
      padding: 8px;
      font-size: 18px;
      border-bottom: 1px solid transparent;
      cursor: pointer;
      margin-right: 12px;

      &:hover,
      &.active {
        border-color: #3a7dff;
        color: #3a7dff;
      }
    }

    .el-button {
      margin-left: auto;
    }
  }

  & + :deep(.at-table),
  & + :deep(.at-table-search) {
    border-radius: 0 0 4px 4px;
  }
}
</style>