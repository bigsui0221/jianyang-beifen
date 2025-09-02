<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <h1>欢迎使用系统</h1>
      <p>这是一个简化后的系统布局，基于getInfoCode获取的菜单数据。</p>
      
      <el-divider />
      
      <div class="user-info">
        <h3>用户信息</h3>
        <p><strong>用户名:</strong> {{ userInfo.nickname || '未知用户' }}</p>
        <p><strong>角色:</strong> {{ roles.join(', ') || '无角色' }}</p>
        <p><strong>权限数量:</strong> {{ permissions.size }}</p>
      </div>

      <el-divider />

      <div class="menu-info">
        <h3>菜单信息</h3>
        <p><strong>菜单项数量:</strong> {{ menuCount }}</p>
        <el-collapse v-if="menuItems.length > 0">
          <el-collapse-item title="查看菜单详情">
            <pre>{{ JSON.stringify(menuItems, null, 2) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const userStore = useUserStore()
const { wsCache } = useCache()

const userInfo = computed(() => userStore.getUser)
const roles = computed(() => userStore.getRoles)
const permissions = computed(() => userStore.getPermissions)

const menuItems = computed(() => {
  const cached = wsCache.get(CACHE_KEY.USER)
  return cached?.menus || []
})

const menuCount = computed(() => {
  const countMenus = (menus: any[]): number => {
    let count = 0
    menus.forEach(menu => {
      count++
      if (menu.children && Array.isArray(menu.children)) {
        count += countMenus(menu.children)
      }
    })
    return count
  }
  return countMenus(menuItems.value)
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.welcome-card {
  max-width: 800px;
  margin: 0 auto;
}

.user-info, .menu-info {
  text-align: left;
}

.user-info p, .menu-info p {
  margin: 8px 0;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}
</style>
