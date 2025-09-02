<template>
  <div class="example-page">
    <el-card>
      <h2>示例页面</h2>
      <p>这是一个示例页面，用于测试菜单路由功能。</p>
      <el-button type="primary" @click="goBack">返回首页</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.example-page {
  padding: 20px;
}
</style>
