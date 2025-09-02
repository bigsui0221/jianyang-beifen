import { resolve } from 'path'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import { createVitePlugins } from './build/vite'
import { exclude, include } from "./build/vite/optimize"
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd()

// 路径查找
function pathResolve(dir: string) {
    return resolve(root, '.', dir)
}
console.log('qiankunWindow.__POWERED_BY_QIANKUN__ :>> ', qiankunWindow.__POWERED_BY_QIANKUN__);

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
    let env = {} as any
    const isBuild = command === 'build'
    if (!isBuild) {
        env = loadEnv((process.argv[3] === '--mode' ? process.argv[4] : process.argv[3]), root)
    } else {
        env = loadEnv(mode, root)
    }
    return {
        base: qiankunWindow.__POWERED_BY_QIANKUN__
            ? '/zhsw-floodctrl-web/'
            : env.VITE_BASE_PATH ?? '/',
        root: root,
        // 服务端渲染
        server: {
            port: env.VITE_PORT, // 端口号
            host: "0.0.0.0",
            open: env.VITE_OPEN === 'true',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            // 本地跨域代理. 目前注释的原因：暂时没有用途，server 端已经支持跨域
            proxy: {
              ['/admin-api']: {
                target: 'https://jy.zhsw.aotuiot.com',
                ws: false,
                changeOrigin: true,
                rewrite: (path) => path.replace(new RegExp(`^/admin-api`), '/admin-api'),
              },
              ['/cimgateway']: {
                target: 'https://jy.zhsw.aotuiot.com',
                ws: false,
                changeOrigin: true,
                rewrite: (path) => path.replace(new RegExp(`^/cimgateway`), '/cimgateway'),
              },
            },
        },
        // 项目使用的vite插件。 单独提取到build/vite/plugin中管理
        plugins: createVitePlugins(),
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/styles/variables.scss" as *;',
                    javascriptEnabled: true,
                    silenceDeprecations: ["legacy-js-api"], // 参考自 https://stackoverflow.com/questions/78997907/the-legacy-js-api-is-deprecated-and-will-be-removed-in-dart-sass-2-0-0
                }
            }
        },
        resolve: {
            // 调整模块入口的查找顺序，适配 @arcgis/core 的 package.json 配置
    mainFields: ['browser', 'module', 'main'], // 优先查找 browser 字段
    conditions: ['browser', 'import'], // 增加 browser 环境的解析条件
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
            alias: [
                {
                    find: 'vue-i18n',
                    replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
                },
                {
                    find: /\@\//,
                    replacement: `${pathResolve('src')}/`
                }
            ]
        },
        build: {
            minify: 'terser',
            outDir: env.VITE_OUT_DIR || 'dist',
            sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
            // brotliSize: false,
            terserOptions: {
                compress: {
                    drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
                    drop_console: env.VITE_DROP_CONSOLE === 'true'
                }
            },
            chunkSizeWarningLimit: 1500, // 提高chunk大小警告阈值
            rollupOptions: {
                output: {
                    manualChunks: {
                        echarts: ['echarts'], // 将 echarts 单独打包，参考 https://gitee.com/yudaocode/yudao-ui-admin-vue3/issues/IAB1SX 讨论
                        'form-create': ['@form-create/element-ui'], // 参考 https://github.com/yudaocode/yudao-ui-admin-vue3/issues/148 讨论
                        'form-designer': ['@form-create/designer'],
                        // 将 ArcGIS 单独打包
                        // arcgis: ['@arcgis/core'],
                        // 其他大型依赖也可以单独分割
                        // vendor: ['vue', 'vue-router', 'pinia']
                    }
                },
            },
        },
        optimizeDeps: { 
            include,
            // 忽略预构建时的格式检查
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    },
            exclude }
    }
}
