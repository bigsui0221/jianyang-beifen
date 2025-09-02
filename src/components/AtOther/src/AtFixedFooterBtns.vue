<template>
  <div class="fixed-footer-btns">
    <div class="btns">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.fixed-footer-btns {
  height: calc(64px - var(--app-content-padding));
  .btns {
    background-color: #fff;
    height: 64px;
    width: calc(
      100% - var(--left-menu-max-width) - var(--app-content-padding) - var(--app-content-padding)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 0;
    right: var(--app-content-padding);
    z-index: 20;
    border-radius: 8px 8px 0 0;
    box-shadow: 0px -1px 5px 0px var(--app-content-bg-color);
    :deep(.el-button){
      width: 120px;
    }
  }
}
</style>
