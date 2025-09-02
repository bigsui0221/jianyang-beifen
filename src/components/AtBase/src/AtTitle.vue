<template>
  <div class="at-title">
    <slot>{{ title }}</slot>
    <slot name="right"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.at-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: #3a7dff;
    border-radius: 2px;
    margin-right: 8px;
  }
}
</style>