<template>
  <div class="card">
    <at-title title="雨量分布" />
    <div class="content">
      <div id="map" v-loading="isLoading"
        :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
        :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`">
      </div>
      <div class="list">
        <div class="item" v-for="item, index in rainfallList" :key="index">
          <span>{{ item.label }}</span>
          <span :style="{ color: item.color }">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { initGisMap } from '@/utils/gis';

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const rainfallList = ref<any>([])
const getRainFallList = () => {
  rainfallList.value = [
    { label: '无雨', value: '119', color: '#91CCFF' },
    { label: '0-9', value: '69', color: '#67C1FF' },
    { label: '10-24', value: '0', color: '#0D9EFF' },
    { label: '25-49', value: '0', color: '#107FEB' },
    { label: '50-99', value: '0', color: '#0066CC' },
    { label: '100-249', value: '0', color: '#004C99' },
    { label: '>=250', value: '0', color: '#003366' },
  ]
}
// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('map'))
  console.log(map, view)
  mapView.value = view
  mapView.value.zoom = 8
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  // 禁用拖动（平移）
  view.on("drag", function (event) {
    event.stopPropagation();
  });

  // 禁用触摸设备上的拖动
  view.on("drag-start", function (event) {
    event.stopPropagation();
  });

  // 禁用鼠标滚轮缩放
  view.on("mouse-wheel", function (event) {
    event.stopPropagation();
  });

  // 禁用双击缩放
  view.on("double-click", function (event) {
    event.stopPropagation();
  });

  // 禁用键盘导航（箭头键移动地图）
  view.on("key-down", function (event) {
    const prohibitedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-", "="];
    if (prohibitedKeys.includes(event.key)) {
      event.stopPropagation();
    }
  });
};
onMounted(() => {
  getRainFallList()
  initMap()
})
</script>
<style lang="scss" scoped>
.card {
  .content {
    display: flex;
    align-items: center;
    height: calc(100% - 24px);

    #map {
      height: 100%;
      width: calc(100% - 75px - 12px);
    }

    .list {
      margin-left: 12px;
      width: 75px;

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        span {
          font-weight: 400;
          font-size: 14px;
          color: #4E5969;
        }
      }
    }
  }
}
</style>
