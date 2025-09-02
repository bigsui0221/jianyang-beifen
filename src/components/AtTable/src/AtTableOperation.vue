<template>
  <el-card class="at-table-operation" shadow="never">
    <at-title :title="title" />
    <input v-if="configObj.import" type="file" @input="onFileInput" ref="fileInputRef" id="fileInput"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none" />
    <div class="top-right-btn">
      <el-button v-for="btn in buttonGroupObj" :ref="btn.key" :key="btn.key" :type="btn.type" :icon="btn.icon"
        @click="onClick(btn)" :loading="btn.loading || loading[btn.key]">{{ btn.label }}</el-button>
      <slot name="right"></slot>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { CirclePlus, Upload, Download, Delete } from '@element-plus/icons-vue'
import download from '@/utils/download'
import { hasPermission } from '@/directives/permission/hasPermi'
const message = useMessage() // 消息弹窗
const props = defineProps({
  title: {
    type: String,
    default: '列表信息'
  },
  params: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object,
    default: () => ({})
  }
})
const loading = ref({})
const fileInputRef = ref()
const buttonGroup = ref({
  add: {
    label: '新增',
    key: 'add',
    icon: CirclePlus,
    type: 'primary'
  },
  export: {
    label: '导出',
    key: 'export',
    icon: Download,
    type: 'warning'
  },
  import: {
    label: '导入',
    key: 'import',
    icon: Upload,
    type: 'primary'
  },
  template: {
    label: '下载模板',
    key: 'template',
    icon: Download,
    type: 'warning'
  },
  delete: {
    label: '删除',
    key: 'delete',
    icon: Delete,
    type: 'danger'
  }
})

const currentBtn = ref()
const configObj = computed(() => props.config)
const buttonGroupObj = computed(() => {
  let arr: any[] = []
  for (const key in configObj.value) {
    if (['refresh', 'search'].includes(key)) continue
    let obj = configObj.value[key]
    if (!obj) continue
    if (obj.hide) continue
    if (obj.permission && hasPermission(obj.permission)) continue
    // if (obj.role && hasRole(obj.role)) continue

    let btn = buttonGroup.value[key]
    arr.push({ ...btn, ...obj })
    Object.assign(loading.value, { [key]: false })
  }
  return arr
})
const onClick = (btn) => {
  currentBtn.value = btn
  switch (btn.key) {
    case 'import':
      fileInputRef.value?.click()
      break
    case 'export':
      handleExport()
      break
    default:
      btn.onClick && btn.onClick(btn)
      break
  }
}

// 处理文件选择后的逻辑
const onFileInput = (event) => {
  const btn = currentBtn.value
  if (!btn.api || typeof btn.api != 'function') {
    throw new Error('未配置导入接口')
  }
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) {
    return message.error('请选择需要导入的文件')
  }
  loading.value[btn.key] = true
  // 创建一个FormData对象
  const formData = new FormData()
  console.log('file', file)
  formData.append('file', file) // 'file'是后端接收文件时使用的字段名
  btn.api &&
    btn
      .api(formData)
      .then((res) => {
        message.success('导入成功')
        btn.onSuccess && btn.onSuccess(res)
      })
      .catch(() => {
        message.error('导入失败')
      })
      .finally(() => {
        loading.value[btn.key] = false
      })
}

const handleExport = () => {
  const btn = currentBtn.value
  message
    .confirm(btn.message || '是否确认导出当前所有数据项?')
    .then(() => {
      loading.value['export'] = true
      if (!btn.api || typeof btn.api != 'function') {
        throw new Error('未配置导出接口')
      }
      return btn.api && btn.api({ ...props.params, pageNo: undefined, pageSize: undefined })
    })
    .then((response) => {
      download.excel(response, btn.fileName || '导出数据.xls')
      loading.value['export'] = false
    })
    .catch((error) => {
      console.error(error)
      loading.value['export'] = false
    })
}
</script>

<style lang="scss" scoped>
.at-table-operation {
  border-radius: 4px 4px 0 0;
  border: 0;
  padding-bottom: 18px;

  :deep(.el-card__body) {
    padding-bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0;

    .top-right-btn {
      margin-left: auto;
    }
  }

  &+ :deep(.at-table) {
    border-radius: 0 0 4px 4px;
  }
}
</style>