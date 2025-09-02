<template>
  <div class="simple-menu">
    <!-- 左侧标题区域 -->
    <div class="menu-left">
      <div class="title-area">
        <Icon icon="ep:monitor" class="logo-icon" />
        <h1 class="system-title">简阳智慧水务</h1>
      </div>
    </div>
    
    <!-- 中间菜单区域 -->
    <div class="menu-center">
      <div class="menu-items">
        <template v-for="item in menuData" :key="item.id">
          <!-- 如果有子菜单，平铺显示所有子菜单项 -->
          <template v-if="item.children && item.children.length > 0">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="menu-item"
              :class="{ active: activeMenu === child.path }"
              @click="handleSelect(child.path)"
            >
              <div class="menu-item-content">
                <Icon v-if="child.icon" :icon="child.icon" />
                <span>{{ child.name }}</span>
                <Icon v-if="isExternalLink(child.path)" icon="ep:link" class="external-link-icon" />
              </div>
            </div>
          </template>
          
          <!-- 没有子菜单的直接显示 -->
          <div
            v-else
            class="menu-item"
            :class="{ active: activeMenu === item.path }"
            @click="handleSelect(item.path)"
          >
            <div class="menu-item-content">
              <!-- <Icon v-if="item.icon" :icon="item.icon" /> -->
              <span>{{ item.name }}</span>
              <!-- <Icon v-if="isExternalLink(item.path)" icon="ep:link" class="external-link-icon" /> -->
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 右侧用户信息区域 -->
    <div class="menu-right">
      <div class="user-info-area">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-avatar">
            <el-avatar :size="32" :src="userAvatar">
              <Icon icon="ep:user" />
            </el-avatar>
            <span class="user-name">{{ userName }}</span>
            <Icon icon="ep:arrow-down" class="dropdown-icon" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <Icon icon="ep:user" />
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <Icon icon="ep:setting" />
                系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <Icon icon="ep:switch-button" />
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { getInfoCode } from '@/api/login'
import { Icon } from '@/components/Icon'
import { addDynamicRoutes } from '@/utils/menuRouter'
import { isExternalLink, handleMenuClick } from '@/utils/menuUtils'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const { wsCache } = useCache()
const userStore = useUserStore()

const menuData = ref<any[]>([])

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 用户信息
const userName = computed(() => {
  return userStore.getUser.nickname || '管理员'
})

const userAvatar = computed(() => {
  return userStore.getUser.avatar || ''
})

// 获取菜单数据
const loadMenuData = async () => {
  try {
    // 先从缓存获取
    let userInfo = wsCache.get(CACHE_KEY.USER)
    if (!userInfo) {
      userInfo = await getInfoCode()
      wsCache.set(CACHE_KEY.USER, userInfo)
    }
    
    if (userInfo.menus && Array.isArray(userInfo.menus)) {
      menuData.value = userInfo.menus
      
      // 动态添加路由
      addDynamicRoutes(userInfo.menus)
    }
  } catch (error) {
    console.error('获取菜单数据失败:', error)
  }
}

// 处理菜单选择
const handleSelect = (index: string) => {
  if (index && index !== route.path) {
    handleMenuClick(index, router)
  }
}

// 处理用户操作
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('跳转到个人资料页面')
      // router.push('/profile')
      break
    case 'settings':
      ElMessage.info('跳转到系统设置页面')
      // router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.loginOut()
        router.push('/login')
        ElMessage.success('退出登录成功')
      } catch (error) {
        // 用户取消退出
      }
      break
  }
}

onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.simple-menu {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* 左侧标题区域 */
.menu-left {
  flex: 0 0 auto;
  min-width: 200px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #409eff;
}

.system-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

/* 中间菜单区域 */
.menu-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 800px;
}

.menu-items {
  display: flex;
  width: 100%;
  height: 60px;
}

.menu-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 10px;
  color: #bfcbd9;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  white-space: nowrap;
  text-align: center;
  position: relative;
}

/* 菜单项内容容器 */
.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.menu-item:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.menu-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.menu-item-content span {
  font-weight: 500;
  text-align: center;
  line-height: 1;
  flex-shrink: 0;
}

.menu-item-content .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.external-link-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

/* 右侧用户信息区域 */
.menu-right {
  flex: 0 0 auto;
  min-width: 150px;
  display: flex;
  justify-content: flex-end;
}

.user-info-area {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: #bfcbd9;
  transition: transform 0.3s;
}

.user-avatar:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .system-title {
    font-size: 16px;
  }
  
  .menu-item {
    padding: 0 8px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .simple-menu {
    padding: 0 10px;
  }
  
  .menu-left {
    min-width: 120px;
  }
  
  .system-title {
    font-size: 14px;
  }
  
  .user-name {
    display: none;
  }
  
  .menu-item {
    padding: 0 5px;
    font-size: 12px;
    justify-content: center;
  }
  
  .menu-item-content span {
    display: none;
  }
}

@media (max-width: 480px) {
  .menu-left {
    min-width: 80px;
  }
  
  .system-title {
    display: none;
  }
  
  .menu-center {
    max-width: none;
  }
  
  .menu-item {
    padding: 0 2px;
    font-size: 11px;
    justify-content: center;
  }
}
</style>