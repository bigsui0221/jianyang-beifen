<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.eventType?.desc" :theme="item.eventStatus?.name == 'PROCESSING' ? '#3A7DFF' : '#12ba41'"
    :trigger="isDataChecked ? 'always' : 'hover'" @click="onMarkerClick(item)">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <span class="name">分类：</span>
          <span class="value">{{ item.eventClass?.desc }}</span>
        </div>
        <div class="item">
          <span class="name">等级：</span>
          <span class="value">{{ item.eventLevel?.desc }}</span>
        </div>
        <div class="item">
          <span class="name">状态：</span>
          <span class="value">{{ item.eventStatus?.desc }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/marker/icon-10.png" alt="" />
    </template>
  </at-marker>

  <div class="work-situation" v-if="workVisabled">
    <at-title title="工作情况">
      <template #right>
        <el-button type="primary" size="small"
          @click="$router.push({ path: '/incidents/info', query: { id: currentEvent.id } })">更多</el-button>
      </template>
    </at-title>
    <el-steps direction="vertical" :active="1">
      <el-step :icon="LocationInformation" :title="item.title" :description="item.desc"
        v-for="item, index in currentSteps" :key="index" />
    </el-steps>
  </div>
</template>

<script lang="ts" setup>
import { LocationInformation } from '@element-plus/icons-vue'
import { formatToDateTime } from '@/utils/dateUtil';
import { initGisMap, popups, updateAllPopupPositions, createMarkerPopup } from '@/utils/gis'
import { RealDataApi } from '@/api/Floodctrl/scada/realdata';
import { EventApi } from '@/api/Floodctrl/event';

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const refs = ref<any>({})
const keynoteList = ref<any[]>([])

const handleSearch = (data) => {
}
const workVisabled = ref<boolean>(false)
const currentSteps = ref<any[]>([])
const currentEvent = ref<any>({})
const onMarkerClick = (item) => {
  workVisabled.value = false
  EventApi.getEvent(item.id).then(res => {
    currentEvent.value = res
    currentSteps.value = [{
      title: '处理中',
      desc: `于${formatToDateTime(item.createTime)}出发前往处置`
    }, {
      title: res?.alarmListRespVOS?.[0].statusName,
      desc: res?.alarmListRespVOS?.[0].alarmName
    }]

    workVisabled.value = true
  })
}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  popups.length = 0
  keynoteList.value.forEach((item) => {
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
  getRealDataByRain()
};
const getRealDataByRain = () => {
  EventApi.getEventPage({ pageNo: 1, pageSize: 9999 }).then(res => {
    keynoteList.value = res.list
    nextTick(() => {
      setKeynoteMarker()
    })
  })
}
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
.work-situation {
  position: absolute;
  top: calc(20px + 30px + 12px);
  left: 20px;
  background-color: #fff;
  width: 300px;
  max-height: 80%;
  overflow-y: auto;
  border-radius: 8px;
  padding: 20px;

  ::selection {
    display: none;
  }

  .at-title {
    margin-bottom: 20px;

    .el-button {
      margin-left: auto;
    }
  }

  :deep(.el-steps) {
    .el-step__main {
      padding-bottom: 16px;
    }
  }
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
  }
}

.my-marker-icon {
  width: 28px;
  height: 34px;
}
</style>
