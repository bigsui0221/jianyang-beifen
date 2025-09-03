<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <div class="opt-box">
    <el-button type="primary" @click="$router.push('/scada/video/image')">图像站</el-button>
    <el-button type="primary" @click="$router.push('/scada/video/index')">视频墙</el-button>
  </div>
  <at-marker v-for="item in videoDataList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.videoName" theme="#3a7dff" :trigger="isDataChecked ? 'always' : 'hover'" @click="onMarkerClick(item)">
    <template #main>
      <img class="my-marker-img" :src="item.snapUrl" alt="" />
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/marker/icon-7.png" alt="" />
    </template>
  </at-marker>

  <Dialog v-model="dialogVisible" width="65%">
    <template #title>
      <div class="tabs">
        <div class="tab" :class="{ active: isLive }" @click="isLive = true">实时监控</div>
        <div class="tab" :class="{ active: !isLive }" @click="isLive = false">历史回放</div>
      </div>
    </template>
    <div class="search">
      <el-button type="primary">截图</el-button>
      <template v-if="!isLive"> 数据时段：<el-date-picker v-model="daterange" type="daterange" placeholder="请选择" /></template>
    </div>
    <video-player ref="videoPlayer" v-if="currentPlayVideo && currentPlayVideo.videoUrl"
      :url="currentPlayVideo.videoUrl" :title="currentPlayVideo.videoName" />
  </Dialog>
</template>

<script lang="ts" setup>
import { initGisMap, createPolygonGraphic, esriModules, createMarkerPopup, popups, updateAllPopupPositions } from '@/utils/gis'
import VideoPlayer from "./VideoPlayers.vue";
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const refs = ref<any>({})
const dialogVisible = ref(false)
const isLive = ref(true)
const videoDataList = reactive<any[]>([
  {
    "id": 8,
    "videoName": "视频监测点",
    "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
    "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0401.png",
    longitude: 104.567121,
    latitude: 30.399821
  },
  {
    "id": 9,
    "videoName": "视频监测点",
    "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
    "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0402.png",
    longitude: 104.557101,
    latitude: 30.389841
  },
  {
    "id": 10,
    "videoName": "视频监测点",
    "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
    "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0402.png",
    longitude: 104.597101,
    latitude: 30.369841
  },
])
const currentPlayVideo = ref<any>({})
const daterange = ref<any>([])
const handleSearch = (data) => {
}
const onMarkerClick = (item) => {
  currentPlayVideo.value = item
  dialogVisible.value = true
}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  popups.length = 0
  videoDataList.forEach((item) => {
    // 绑定弹窗
    let dom = refs.value[`keynote${item.id}`];
    if (Array.isArray(dom)) {
      dom = dom[0].$el;
    } else {
      dom = dom.$el;
    }
    createMarkerPopup(dom, [item.longitude, item.latitude])
  })
  updateAllPopupPositions()
}
// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  setKeynoteMarker()
};
onMounted(() => {
  initMap()
})
onUnmounted(() => {
  if (mapView.value) {
    mapView.value.destroy();
    mapView.value = null;
  }
  if (gisMap.value) {
    gisMap.value.destroy()
    gisMap.value = null
  }
})
</script>
<style lang="scss" scoped>
.opt-box {
  position: absolute;
  top: 20px;
  right: 20px;
}

.search {
  margin-bottom: 12px;

  .el-button {
    margin-right: 16px;
  }
}

:deep(.map-markers-info-main) {
  padding: 0;

  .my-marker-img {
    width: 120px;
    height: 90px;
    object-fit: cover;
    display: block;
  }
}

.my-marker-icon {
  width: 28px;
  height: 34px;
}

.com-dialog {
  .tabs {
    display: flex;
    align-items: center;

    .tab {
      margin-right: 16px;
      cursor: pointer;
      &.active {
        color: #3A7DFF;
        font-weight: bold;
      }
    }
  }
}
</style>
