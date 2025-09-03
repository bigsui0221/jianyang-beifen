<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <el-button class="toList" type="primary" @click="$router.push('/plan/keylist/index')">防汛重点区域</el-button>
  <!-- 图例区 -->
  <div class="legend">
    <div class="title">图例</div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-1.png" alt="" />防汛重点
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-2.png" alt="" />监控点位
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-3.png" alt="" />监控范围
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-4.png" alt="" />逃生路线
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-5.png" alt="" />避灾场所
    </div>
  </div>

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote_${item.id}`] = el }"
    :name="item.drownUnit" theme="#00b533">
    <template #main>
      <div class="my-marker-info" style="width: 150px;">
        <div class="item">
          <span class="name">类型：</span>
          <span class="value">{{ item.typeName }}</span>
        </div>
        <div class="item">
          <span class="name">预计受困人数：</span>
          <span class="value">{{ item.population }}人</span>
        </div>
        <div class="item">
          <span class="name">逃生路线：</span>
          <span class="value">
            <el-button type="primary" link @click="showRoute(item.id)">显示</el-button>
          </span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/plan/icon-11.png" alt="" />
    </template>
  </at-marker>

  <at-marker v-for="item in keyAreaPlaceList" :key="`place${item.id}`" :ref="(el) => { refs[`place_${item.id}`] = el }"
    :name="item.name" theme="#f99100">
    <template #main>
      <div class="my-marker-info" style="width: 280px;">
        <div class="item">
          <span class="name">责任单位：</span>
          <span class="value">{{ item.chargeUnit }}</span>
        </div>
        <div class="item">
          <span class="name">责任人：</span>
          <span class="value">{{ item.director }}</span>
        </div>
        <div class="item">
          <span class="name">防汛物资：</span>
          <span class="value">
            {{ item.reqDesc }}
          </span>
        </div>
        <div class="item">
          <span class="name">防汛风险：</span>
          <span class="value">{{ item.dgaeTypeName }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/plan/icon-15.png" alt="" />
    </template>
  </at-marker>
</template>

<script lang="ts" setup>
import { KeyAreaApi } from '@/api/Floodctrl/plan/keyarea';
import { KeyAreaPlaceApi } from '@/api/Floodctrl/plan/keyareaplace';
import { initGisMap, createPolygonGraphic, esriModules, popups, createMarkerPopup, updateAllPopupPositions, createPolyline } from '@/utils/gis'
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')

const refs = ref<any>({})
const handleSearch = (data) => {
}

const keynoteList = ref<any[]>([])
/** 获取防汛重点 */
const getKeyAreaPage = () => {
  KeyAreaApi.getKeyAreaAll().then(res => {
    keynoteList.value = res
    nextTick(() => {
      res.forEach((item) => {
        setKeynoteMarker('keynote', item)
        showRouteMap.value[item.id] = false
      })
      updateAllPopupPositions()
    })
  })
}
const keyAreaPlaceList = ref<any[]>([])
/** 获取避灾场所 */
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
/**
 * 设置点
 */
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
/**
 * 设置多边形
 */
const setKeyNotePolyon = () => {
  let polygon = createPolygonGraphic(null, '#e983f2')
  mapView.value.graphics.add(polygon)
}
const showRouteMap = ref({})
/** 显示逃生路线 */
const showRoute = (id) => {
  if (showRouteMap.value[id]) {
    mapView.value.graphics.forEach((graphic) => {
      if (graphic.attributes && graphic.attributes.id === id)
        mapView.value.graphics.remove(graphic)
    })
    showRouteMap.value[id] = false
  } else {
    showRouteMap.value[id] = true
    KeyAreaApi.getKeyArea(id).then(res => {
      const route = res.route ? JSON.parse(res.route) : []
      const polyline = createPolyline(route, undefined, { id })
      mapView.value.graphics.add(polyline);
    })
  }
}
// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  setKeyNotePolyon()
  getKeyAreaPlacePage()
  getKeyAreaPage()
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
.toList {
  position: absolute;
  top: 20px;
  right: 20px;
}

.legend {
  position: absolute;
  background-color: #fff;
  max-height: 90%;
  bottom: 20px;
  left: 20px;
  width: 180px;
  box-shadow: 0px 2 8px 0px rgba(0, 0, 0, 0.08);
  border-radius: 8px 8px 8px 8px;
  padding: 12px 16px;
  z-index: 1;

  .title {
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 16px;
    color: #3A7DFF;
  }

  .item {
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 16px;
    color: #333333;

    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    &+.item {
      margin-top: 20px;
    }
  }
}

.my-marker-info {
  white-space: nowrap;

  &:last-child {
    margin-bottom: 0;
  }

  .item {
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }
  }

  .name {
    font-size: 12px;
    color: #666;
    line-height: 1;
  }

  .value {
    font-size: 12px;
    line-height: 1;
    white-space: normal;
  }
}

.my-marker-icon {
  width: 28px;
  height: 34px;
}
</style>
