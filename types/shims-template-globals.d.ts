// 仅用于消除 Vue 模板类型检查对顶层名称的未定义报错
// 实际定义在 `src/views/sector/metrics/index.vue` 中的 <script setup>
declare const metricsState: any
declare function formatTime(ts?: number | string): string
declare function getWarningTagClass(levelName?: string): string
// 事件概况页模板使用到的顶层变量
declare const eventOverviewData: any
