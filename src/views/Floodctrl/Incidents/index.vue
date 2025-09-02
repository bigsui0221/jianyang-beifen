<template>
   <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted } from 'vue'
import { initGisMap } from '@/utils/gis'
import AtMapSearch from '@/components/AtMap/src/AtMapSearch.vue'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')

const handleSearch = (result: any) => {
  console.log('搜索结果:', result)
}

const initMap = async () => {
  console.log('初始化地图')
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  isLoading.value = false;
};

onMounted(() => {
  initMap()
})
</script>
<style lang="scss" scoped>
 #mapContainer {
    width: 100%;
    height: calc(100vh - 56px);
    position: relative;
  }
</style>
