<template>
  <div class="layout-container">
    <!-- 顶部菜单栏 -->
    <header class="top-menu">
      <SimpleMenu />
    </header>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleMenu from './components/SimpleMenu.vue'
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.top-menu {
  height: 60px;
  background-color: #304156;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.main-content {
  flex: 1;
  background-color: #f5f5f5;
  overflow-y: auto;
  /* padding: 20px; */
}
</style>
