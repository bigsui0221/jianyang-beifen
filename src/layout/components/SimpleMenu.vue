<template>
  <div class="simple-menu">
    <!-- 左侧标题区域 -->
    <div class="menu-left">
      <div class="title-area">
    <div class="system-title">智慧水务全域展示系统</div>
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl); /* 20px -> 1.25rem */
  background: linear-gradient(
    180deg,
    rgba(45, 101, 185, 0) 0%,
    rgba(45, 101, 185, 0.21) 41%,
    #2D65B9 100%
  ), #0E1C2F;
  box-sizing: border-box;
  transition: all var(--transition-duration) ease-out;
}

/* 左侧标题区域 */
.menu-left {
  flex: 0 0 auto;
  min-width: 3.88rem;  /* 388px / 100 = 3.88rem，最小宽度响应式 */
  width: 3.88rem;
  position: relative;
  
  /* 右侧阴影分隔效果 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0.01rem;  /* 1px / 100 = 0.01rem，分割线响应式 */
    height: 100%;
    box-shadow: 
      0.02rem 0 0.08rem rgba(104, 161, 202, 0.3),  /* 2px 0 8px → rem */
      0.01rem 0 0.04rem rgba(104, 161, 202, 0.2),  /* 1px 0 4px → rem */
      0 0 0 0.01rem rgba(104, 161, 202, 0.1);      /* 0 0 0 1px → rem */
    z-index: 1;
  }
}

.title-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，隔间响应式 */
  padding: 0.12rem 0.2rem 0.12rem 0.2rem;  /* 12px 20px 12px 0 → rem，内边距响应式 */
  position: relative;
  width: 100%;
  height: 100%;
}

.logo-icon {
  font-size: 0.24rem;  /* 24px → 0.24rem，LOGO图标跟随整体缩放 */
  color: #409eff;
  filter: drop-shadow(0 0 0.04rem rgba(64, 158, 255, 0.3));  /* 4px → 0.04rem */
  transition: all 0.3s ease;
}

.logo-icon:hover {
  color: #66b3ff;
  filter: drop-shadow(0 0 0.08rem rgba(64, 158, 255, 0.5));  /* 8px → 0.08rem */
  transform: scale(1.05);
}

.system-title {
  margin: 0;
  font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
  font-weight: 400;
  font-size: 0.28rem;  /* 28px → 0.28rem，系统标题跟随整体缩放 */
  color: #ffffff;
  white-space: nowrap;
  text-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.3); /* 0 1px 2px */
  transition: all var(--transition-duration) ease;
  text-align: center;
  letter-spacing: 0.125rem; /* 2px -> 0.125rem */
}

/* 中间菜单区域 */
.menu-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 8rem;  /* 800px / 100 = 8rem，最大宽度响应式 */
  /* 允许光晕效果溢出 */
  overflow: visible;
}

.menu-items {
  display: flex;
  width: 100%;
  height: 0.6rem;  /* 60px / 100 = 0.6rem，菜单高度响应式 */
  /* 允许光晕效果溢出 */
  overflow: visible;
}

.menu-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0.6rem;  /* 60px / 100 = 0.6rem，与菜单高度保持一致 */
  padding: 0 0.1rem;  /* 10px / 100 = 0.1rem，内边距响应式 */
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
  font-weight: 400;
  font-size: 0.18rem;  /* 18px → 0.18rem，菜单项跟随整体缩放 */
  white-space: nowrap;
  text-align: center;
  position: relative;
  letter-spacing: 0.01rem;  /* 1px / 100 = 0.01rem，字母间距响应式 */
  overflow: visible;
  border: none;
}

/* 菜单项内容容器 */
.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.08rem;  /* 8px / 100 = 0.08rem，隔间响应式 */
  width: 100%;
  height: 100%;
}

.menu-item:hover {
  color: rgba(255, 255, 255, 0.95);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 0.04rem;  /* 4px / 100 = 0.04rem，圆角响应式 */
}

.menu-item.active {
  color: #67F4F5;
}



.menu-item-content span {
  font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
  font-weight: 400;
  font-size: 0.18rem;  /* 18px → 0.18rem，菜单项跟随整体缩放 */
  text-align: center;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.3s ease;
  letter-spacing: 0.01rem;  /* 1px / 100 = 0.01rem，字母间距响应式 */
  display: flex;
  align-items: center;
}

.menu-item-content .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.external-link-icon {
  margin-left: 0.04rem;  /* 4px / 100 = 0.04rem，边距响应式 */
  font-size: 0.12rem;  /* 12px → 0.12rem，外部链接图标跟随整体缩放 */
  color: #909399;
  flex-shrink: 0;
}

/* 右侧用户信息区域 */
.menu-right {
  flex: 0 0 auto;
  min-width: 1.5rem;  /* 150px / 100 = 1.5rem，最小宽度响应式 */
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
  gap: 0.08rem;  /* 8px / 100 = 0.08rem，隔间响应式 */
  padding: 0.08rem 0.12rem;  /* 8px 12px → rem，内边距响应式 */
  border-radius: 0.06rem;  /* 6px / 100 = 0.06rem，圆角响应式 */
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  color: #ffffff;
  font-size: 0.14rem;  /* 14px → 0.14rem，用户信息跟随整体缩放 */
  font-weight: 500;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 0.12rem;  /* 12px → 0.12rem，下拉图标跟随整体缩放 */
  color: #bfcbd9;
  transition: transform 0.3s;
}

.user-avatar:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .menu-left {
    min-width: 3.2rem;  /* 320px / 100 = 3.2rem，响应式宽度 */
    width: 3.2rem;
  }
  
  .system-title {
    font-size: 0.24rem;  /* 24px → 0.24rem，响应式标题 */
    letter-spacing: 0.015rem;  /* 1.5px / 100 = 0.015rem，字母间距响应式 */
  }
  
  .menu-item {
    padding: 0 0.08rem;  /* 8px / 100 = 0.08rem，内边距响应式 */
    font-size: 0.16rem;  /* 16px → 0.16rem，响应式菜单项 */
    letter-spacing: 0.008rem;  /* 0.8px / 100 = 0.008rem，字母间距响应式 */
  }
  
  .menu-item-content span {
    font-size: 0.16rem;  /* 16px → 0.16rem，响应式菜单项 */
    letter-spacing: 0.008rem;  /* 0.8px / 100 = 0.008rem，字母间距响应式 */
  }
  
  .title-area::after {
    height: 0.35rem;  /* 35px / 100 = 0.35rem，高度响应式 */
  }
}

@media (max-width: 768px) {
  .simple-menu {
    padding: 0 0.1rem;  /* 10px / 100 = 0.1rem，内边距响应式 */
  }
  
  .menu-left {
    min-width: 2rem;  /* 200px / 100 = 2rem，响应式宽度 */
    width: 2rem;
  }
  
  .system-title {
    font-size: 0.18rem;  /* 18px → 0.18rem，响应式标题 */
    letter-spacing: 0.01rem;  /* 1px / 100 = 0.01rem，字母间距响应式 */
  }
  
  .user-name {
    display: none;
  }
  
  .menu-item {
    padding: 0 0.05rem;  /* 5px / 100 = 0.05rem，内边距响应式 */
    font-size: 0.14rem;  /* 14px → 0.14rem，响应式菜单项 */
    letter-spacing: 0.005rem;  /* 0.5px / 100 = 0.005rem，字母间距响应式 */
    justify-content: center;
    
    /* 小屏幕下简化效果 */
    &::after {
      display: none; /* 隐藏碗状光晕效果 */
    }
    
    &.active::after {
      display: none; /* 隐藏碗状光晕效果 */
    }
  }
  
  .menu-item-content span {
    font-size: 0.14rem;  /* 14px → 0.14rem，响应式菜单项 */
    letter-spacing: 0.005rem;  /* 0.5px / 100 = 0.005rem，字母间距响应式 */
    display: none;
  }
  
  .title-area {
    padding: 0.08rem 0.15rem 0.08rem 0.15rem;  /* 8px 15px 8px 0 → rem，内边距响应式 */
    
    &::after {
      height: 0.3rem;  /* 30px / 100 = 0.3rem，高度响应式 */
    }
  }
}

@media (max-width: 480px) {
  .menu-left {
    min-width: 1.2rem;  /* 120px / 100 = 1.2rem，响应式宽度 */
    width: 1.2rem;
  }
  
  .system-title {
    display: none;
  }
  
  .menu-center {
    max-width: none;
  }
  
  .menu-item {
    padding: 0 0.02rem;  /* 2px / 100 = 0.02rem，内边距响应式 */
    font-size: 0.12rem;  /* 12px → 0.12rem，响应式菜单项 */
    letter-spacing: 0.003rem;  /* 0.3px / 100 = 0.003rem，字母间距响应式 */
    justify-content: center;
    
    /* 小屏幕下只保留基本效果 */
    &:hover {
      transform: none;
      box-shadow: none;
    }
    
    &.active {
      transform: none;
      box-shadow: none;
      
      /* 隐藏碗状光晕效果 */
      &::after {
        display: none;
      }
    }
  }
  
  .menu-item-content span {
    font-size: 0.12rem;  /* 12px → 0.12rem，响应式菜单项 */
    letter-spacing: 0.003rem;  /* 0.3px / 100 = 0.003rem，字母间距响应式 */
  }
  
  .title-area::after {
    display: none;
  }
}
</style>