<template>
   <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <el-button class="toList" type="primary" @click="$router.push('/plan/keylist/index')">防汛重点区域</el-button>
</template>

<script lang="ts" setup>
import { KeyAreaApi } from '@/api/Floodctrl/plan/keyarea';
import { KeyAreaPlaceApi } from '@/api/Floodctrl/plan/keyareaplace';
import { initGisMap, createPolygonGraphic, esriModules, popups, createMarkerPopup, updateAllPopupPositions, createPolyline } from '@/utils/gis'
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  isLoading.value = false;
};

const setKeyNotePolyon = () => {
  let polygon = createPolygonGraphic(null, '#e983f2')
  mapView.value.graphics.add(polygon)
}

const getKeyAreaPlacePage = () => {
  KeyAreaPlaceApi.getKeyAreaPlacePage({ pageNo: 1, pageSize: 9999 }).then(res => {
    keyAreaPlaceList.value = res.list
    nextTick(() => {
      res.list.forEach((item) => {
        setKeynoteMarker('place', item)
      })
      updateAllPopupPositions()
    })
  })
}

const setKeynoteMarker = (key, item) => {
  // 绑定弹窗
  let dom = refs.value[`${key}_${item.id}`];
  if (Array.isArray(dom)) {
    dom = dom[0].$el;
  } else {
    dom = dom.$el;
  }
  createMarkerPopup(dom, [item.lon, item.lat])
}
onMounted(() => {
  initMap()
})
</script>
