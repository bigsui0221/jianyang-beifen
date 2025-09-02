// 引入unocss css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入 element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入 form-create
import { setupFormCreate } from '@/plugins/formCreate'

// 引入全局样式
import '@/styles/index.scss'

// 引入动画
import '@/plugins/animate.css'

// 路由
import router, { setupRouter } from '@/router'

// 指令
import { setupAuth, setupMountedFocus } from '@/directives'

import { createApp, type App as VueApp } from 'vue'

import App from './App.vue'

import './permission'

import '@/plugins/tongji' // 百度统计
import Logger from '@/utils/Logger'

import VueDOMPurifyHTML from 'vue-dompurify-html' // 解决v-html 的安全隐患

let app: VueApp<Element> | null = null

// 创建实例
// const setupAll = async () => {
//   const app = createApp(App)

//   await setupI18n(app)

//   setupStore(app)

//   setupGlobCom(app)

//   setupElementPlus(app)

//   setupFormCreate(app)

//   setupRouter(app)

//   // directives 指令
//   setupAuth(app)
//   setupMountedFocus(app)

//   await router.isReady()

//   app.use(VueDOMPurifyHTML)

//   app.mount('#app')
// }

/**
 * 配置qiankun
 */
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { loadMapScript } from './utils/gis'
const render = async (props: any = {}) => {
  const { container } = props
  app = createApp(App)
  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupFormCreate(app)

  setupRouter(app)

  // directives 指令
  setupAuth(app)
  setupMountedFocus(app)

  await router.isReady()

  app.use(VueDOMPurifyHTML)
  app?.mount(container ? container.querySelector('#floodctrl') : '#floodctrl')
  console.log('开始加载相关内容')
}
renderWithQiankun({
  mount(props: any) {
    render(props)
  },
  bootstrap() {
    console.log('%c', 'color:green;', ' ChildOne bootstrap')
  },
  update() {
    console.log('%c', 'color:green;', ' ChildOne update')
  },
  unmount(props: any) {
    console.log('unmount', props)
    app ? app.unmount() : undefined
    app && app._container ? (app._container.innerHTML = '') : undefined
    app = null
  }
})
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('并不是qiankun渲染')
  render()
}

// const render = async (props: any = {}) => {
//   const { container } = props
//   const mountPoint = container
//     ? container.querySelector('#floodctrl') || '#floodctrl'
//     : '#floodctrl'

//   app = createApp(App)
//   await setupI18n(app)

//   setupStore(app)

//   setupGlobCom(app)

//   setupElementPlus(app)

//   setupFormCreate(app)

//   setupRouter(app)

//   // directives 指令
//   setupAuth(app)
//   setupMountedFocus(app)

//   await router.isReady()

//   app.use(VueDOMPurifyHTML)

//   app.mount(mountPoint)
// }

// if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
//   render()
// }

// export async function bootstrap(props) {
//   console.time('bootstrap')
//   console.log('Bootstrap started', props)

//   // 检查是否有未解决的 Promise
//   await Promise.resolve()

//   console.timeEnd('bootstrap')
// }
// export async function mount(props) {
//   console.log('[vue] props from main framework', props);
//   render(props);
// }
// export async function unmount() {
//   app?.unmount()
//   app = null
// }

// setupAll()
// loadMapScript()
Logger.prettyPrimary(`欢迎使用`, import.meta.env.VITE_APP_TITLE)
