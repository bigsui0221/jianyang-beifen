import type { RouteRecordRaw } from 'vue-router'
import SimpleLayout from '@/layout/SimpleLayout.vue'
import router from '@/router'
import { isExternalLink } from './menuUtils'

/**
 * 根据菜单数据动态生成路由
 * @param menus 菜单数据
 */
export function generateDynamicRoutes(menus: any[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  const generateRoute = (menu: any): RouteRecordRaw | null => {
    // 如果菜单项没有路径，跳过
    if (!menu.path) {
      return null
    }

    // 如果是外部链接，跳过路由生成
    if (isExternalLink(menu.path)) {
      return null
    }

    // 确保路径格式正确
    let normalizedPath = menu.path
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath
    }

    const route: any = {
      path: normalizedPath,
      name: menu.name || normalizedPath.replace(/\//g, '_'),
      meta: {
        title: menu.name,
        icon: menu.icon,
        hidden: menu.hidden || false
      }
    }

    // 如果有子菜单
    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      route.children = []
      menu.children.forEach((child: any) => {
        const childRoute = generateRoute(child)
        if (childRoute) {
          route.children!.push(childRoute)
        }
      })
    } else {
      // 叶子节点，设置组件
      route.component = getComponent(menu.component || menu.path)
    }

    return route
  }

  menus.forEach((menu) => {
    const route = generateRoute(menu)
    if (route) {
      routes.push(route)
    }
  })

  return routes
}

/**
 * 根据组件路径获取组件
 * @param componentPath 组件路径
 */
function getComponent(componentPath: string) {
  // 如果是Layout，返回SimpleLayout
  if (componentPath === 'Layout' || componentPath === '/') {
    return SimpleLayout
  }

  // 动态导入组件
  const componentMap: Record<string, () => Promise<any>> = {
    // 可以在这里预定义一些常用组件
    '/dashboard': () => import('@/views/Dashboard/Index.vue'),
    '/index': () => import('@/views/Dashboard/Index.vue'),
    '/incidents': () => import('@/views/sector/Incidents/index.vue'),
    '/metrics': () => import('@/views/sector/metrics/index.vue'),
    '/dispatch': () => import('@/views/sector/dispatch/index.vue'),
    '/venues': () => import('@/views/sector/venues/index.vue'),
    '/monitoring': () => import('@/views/sector/monitoring/index.vue')
  }

  // 如果在预定义映射中找到，直接返回
  if (componentMap[componentPath]) {
    return componentMap[componentPath]
  }

  // 否则尝试动态导入
  try {
    return () => import(`@/views${componentPath}/index.vue`)
  } catch {
    // 如果导入失败，返回404页面
    return () => import('@/views/Error/404.vue')
  }
}

/**
 * 添加动态路由到路由器
 * @param menus 菜单数据
 */
export function addDynamicRoutes(menus: any[]) {
  const dynamicRoutes = generateDynamicRoutes(menus)

  // 添加动态路由到主Layout下
  const mainRoute = router.getRoutes().find((route) => route.path === '/')
  if (mainRoute) {
    dynamicRoutes.forEach((route) => {
      // 将动态路由添加为主Layout的子路由
      // 确保子路由路径不以 "/" 开头（Vue Router 嵌套路由要求）
      let childPath = route.path
      if (childPath.startsWith('/')) {
        childPath = childPath.slice(1)
      }

      // 确保路径不为空
      if (!childPath) {
        console.warn('路由路径为空，跳过:', route)
        return
      }

      router.addRoute('/', {
        path: childPath,
        name: route.name,
        component: route.component || (() => import('@/views/Error/404.vue')),
        meta: route.meta
      } as RouteRecordRaw)
    })
  }
}

/**
 * 清除动态路由
 */
export function clearDynamicRoutes() {
  const routes = router.getRoutes()
  routes.forEach((route) => {
    if (
      route.name &&
      !['Login', 'NoAccess', 'NoFound', 'Error', '404Page', 'Index'].includes(route.name as string)
    ) {
      router.removeRoute(route.name)
    }
  })
}
