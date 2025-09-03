<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <div class="opt-box">
    <el-button class="toList" type="primary" @click="$router.push('/plan/riskdot/map')">新增风险点</el-button>
    <el-button :icon="Tickets" @click="$router.push('/scada/flood/index')">列表</el-button>
    <el-button type="primary" plain v-if="!isExpand" @click="isExpand = true">
      展开<el-icon class="el-icon--right">
        <ArrowDown />
      </el-icon>
    </el-button>
    <el-button type="primary" plain v-else @click="isExpand = false">
      收起<el-icon class="el-icon--right">
        <ArrowUp />
      </el-icon>
    </el-button>
    <div class="drop-box" :class="{ 'expand': isExpand }">
      <div class="map-type"></div>
      <div class="marker-item" v-for="item in markerSwitch" :key="item.id">
        <img :src="item.icon" alt="" />
        {{ item.name }}
        <el-switch v-model="item.checked" size="small" />
      </div>
    </div>
  </div>

  <at-marker v-for="item in keynoteList.fhgz" :key="`fhgz${item.id}`" :ref="(el) => { refs[`fhgz_${item.id}`] = el }"
    :name="item.name" theme="#cf8e00" v-show="markerSwitch[1].checked">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <span class="name">类型：</span>
          <span class="value">{{ item.typeName }}</span>
        </div>
        <div class="item">
          <span class="name">状态：</span>
          <span class="value">{{ item.status === '1' ? '在建' : '建成' }}</span>
        </div>
        <div class="item">
          <span class="name">地址：</span>
          <span class="value">{{ item.address }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" :src="icon2" alt="" />
    </template>
  </at-marker>
  <at-marker v-for="item in keynoteList.xgxd" :key="`xgxd${item.id}`" :ref="(el) => { refs[`xgxd_${item.id}`] = el }"
    :name="item.name" theme="#e56212" v-show="markerSwitch[2].checked">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <span class="name">河流/流域：</span>
          <span class="value">{{ item.riverName }}</span>
        </div>
        <div class="item">
          <span class="name">地址：</span>
          <span class="value">{{ item.address }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" :src="icon3" alt="" />
    </template>
  </at-marker>
  <at-marker v-for="item in keynoteList.fxd" :key="`fxd${item.id}`" :ref="(el) => { refs[`fxd_${item.id}`] = el }"
    :name="item.name" theme="#e23e41" v-show="markerSwitch[3].checked">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <span class="name">类型：</span>
          <span class="value">{{ item.typeName }}</span>
        </div>
        <div class="item">
          <span class="name">受影响户数：</span>
          <span class="value">{{ item.households }}</span>
        </div>
        <div class="item">
          <span class="name">受影响人数：</span>
          <span class="value">{{ item.population }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" :src="icon4" alt="" />
    </template>
  </at-marker>
</template>

<script lang="ts" setup>
import { Tickets, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { initGisMap, createPolygonGraphic, updateAllPopupPositions, createMarkerPopup, popups } from '@/utils/gis'


import icon1 from '@/assets/imgs/floodctrl/scada/icon-1.png'
import icon2 from '@/assets/imgs/floodctrl/scada/icon-2.png'
import icon3 from '@/assets/imgs/floodctrl/scada/icon-3.png'
import icon4 from '@/assets/imgs/floodctrl/scada/icon-4.png'
import { ProjectInfoApi } from '@/api/Floodctrl/scada/projectinfo'
import { RiskSectionApi } from '@/api/Floodctrl/scada/risksection'
import { DangerAreaApi } from '@/api/Floodctrl/scada/dangerarea'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isExpand = ref<boolean>(true)
const refs = ref<any>({})

const markerSwitch = reactive<any[]>([
  // {
  //   id: 1,
  //   icon: icon1,
  //   name: '风险图',
  //   checked: true
  // },
  {
    id: 2,
    icon: icon2,
    name: '防洪工程',
    checked: true,
  }, {
    id: 3,
    icon: icon3,
    name: '险工险段',
    checked: true,
  }, {
    id: 4,
    icon: icon4,
    name: '风险点',
    checked: true,
  }])
const keynoteList = reactive<any>({
  fhgz: [] as any[]
})
const handleSearch = (data) => {
}
const getKeynoteList = () => {
  popups.length = 0;
  ProjectInfoApi.getProjectInfoPage({
    pageNo: 1,
    pageSize: 9999
  }).then(res => {
    keynoteList.fhgz = res.list.filter(e => e.lon && e.lat)
    nextTick(() => {
      keynoteList.fhgz.forEach((item) => {
        setKeynoteMarker('fhgz', item)
      })
      updateAllPopupPositions()
    })
  })
  RiskSectionApi.getRiskSectionPage({
    pageNo: 1,
    pageSize: 9999
  }).then(res => {
    keynoteList.xgxd = res.list.filter(e => e.lon && e.lat)
    nextTick(() => {
      keynoteList.xgxd.forEach((item) => {
        setKeynoteMarker('xgxd', item)
      })
      updateAllPopupPositions()
    })
  })
  // DangerAreaApi.getDangerAreaPage({
  //   pageNo: 1,
  //   pageSize: 9999
  // }).then(res => {
  //   keynoteList.fxd = res.list
  //   nextTick(() => {
  //     res.list.forEach((item) => {
  //       setKeynoteMarker('fxd', item)
  //     })
  //     updateAllPopupPositions()
  //   })
  // })
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
  let polygon = createPolygonGraphic()
  mapView.value.graphics.add(polygon)
}

// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  // setKeyNotePolyon()

  getKeynoteList()
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
  z-index: 999;

  .drop-box {
    background: #FFFFFF;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
    border-radius: 8px 8px 8px 8px;
    padding: 0;
    margin-top: 16px;
    interpolate-size: allow-keywords;
    height: 0;
    transition: all 0.3s;
    overflow: hidden;

    &.expand {
      height: auto;
      padding: 12px;
    }

    .marker-item {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 16px;
      color: #333333;

      &+.marker-item {
        margin-top: 16px;
      }

      img {
        width: 20px;
        height: 20px;
        margin-right: 8px;

      }

      .el-switch {
        margin-left: auto;
      }
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
  }
}

.my-marker-icon {
  width: 20px;
  height: 20px;
}
</style>
