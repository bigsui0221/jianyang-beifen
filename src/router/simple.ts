import type { RouteRecordRaw } from 'vue-router'
import SimpleLayout from '@/layout/SimpleLayout.vue'

// 简化的基础路由
export const simpleRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: '登录',
      noTagsView: true
    }
  },
  {
    path: '/403',
    component: () => import('@/views/Error/403.vue'),
    name: 'NoAccess',
    meta: {
      hidden: true,
      title: '403',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFound',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  {
    path: '/500',
    component: () => import('@/views/Error/500.vue'),
    name: 'Error',
    meta: {
      hidden: true,
      title: '500',
      noTagsView: true
    }
  },
  {
    path: '/',
    component: SimpleLayout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/Dashboard/Index.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: 'incidents',
        name: 'Incidents',
        component: () => import('@/views/sector/Incidents/index.vue'),
        meta: {
          title: '事件协同处置'
        }
      },
      {
        path: 'metrics',
        name: 'Metrics',
        component: () => import('@/views/sector/metrics/index.vue'),
        meta: {
          title: '行业体征指标'
        }
      },
      {
        path: 'metrics/plant/:id',
        name: 'MetricsPlantDetail',
        component: () => import('@/views/sector/metrics/PlantDetail.vue'),
        meta: {
          title: '水厂详情'
        }
      },
      {
        path: 'dispatch',
        name: 'Dispatch',
        component: () => import('@/views/sector/dispatch/index.vue'),
        meta: {
          title: '指挥调度所'
        }
      },
      {
        path: 'venues',
        name: 'Venues',
        component: () => import('@/views/sector/venues/index.vue'),
        meta: {
          title: '场所保障'
        }
      },
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: () => import('@/views/sector/monitoring/index.vue'),
        meta: {
          title: '数据监控'
        }
      }
    ]
  },
  // 404页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/404.vue'),
    name: '404Page',
    meta: {
      hidden: true,
      title: '404'
    }
  }
]
