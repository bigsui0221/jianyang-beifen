<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #value6="{ row }">
        <el-button link type="primary" @click="handleDownLoad(row)">下载</el-button>
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { MapLocation, VideoCamera } from '@element-plus/icons-vue'
import * as UserApi from '@/api/system/user'
import { getFilePage } from '@/api/infra/file'
import download from '@/utils/download'
const message = useMessage() // 消息弹窗
const router = useRouter() // 路由实例
const atTableRef = ref()
const queryParams = reactive({
  type: 'image/'
})
const queryFields = reactive({
  value2: {
    label: '截图时间',
    components: 'date',
    type: 'daterange'
  },
  value3: {
    label: '视频时间',
    components: 'date',
    type: 'daterange'
  },
})
const tableConfig = reactive({
  api: getFilePage,
  fields: {
    name: {
      label: '文件名'
    },
    path: {
      label: '文件路径'
    },
    fileSize: {
      label: '文件大小',
      formatter: (val, row) => {
        return Math.ceil(row.size / 1024) + 'KB'
      }
    },
    createTime: {
      label: '截图时间',
      formatter: 'dateTime'
    },
    videoTime: {
      label: '视频时间'
    },
    value6: {
      label: '图片内容'
    },
    type: {
      label: '说明'
    },
    value8: {
      label: '操作人'
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleDownLoad = (row) => {
  download.fetchUrl(row.path, row.name)
  message.success('下载成功')
}
const operationConfig = reactive({
  video: {
    onClick: () => {
      router.push('/scada/video/index')
    },
    label: '视频墙',
    type: 'primary',
    icon: VideoCamera
  },
  map: {
    onClick: () => {
      router.push('/scada/video/map')
    },
    label: '地图',
    type: 'primary',
    icon: MapLocation
  },
})
</script>
