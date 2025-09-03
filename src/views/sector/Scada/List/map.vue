<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <!-- 绘制提示 -->
  <div class="draw-tips" v-if="isDrawing">
    <el-icon>
      <InfoFilled />
    </el-icon>帮助提示<p>点击鼠标左键绘制分区，<span>双击左键</span>完成绘制</p>
  </div>
  <div class="opt-box">
    <el-button class="toList" type="primary" @click="startDrawing">框选查询</el-button>
    <el-button :icon="Tickets" @click="$router.push('/scada/list/index')">列表</el-button>
  </div>
  <!-- 图例区 -->
  <div class="legend">
    <div class="legend-card">
      <div class="title">显示设置</div>
      <div class="item">
        <el-checkbox v-model="isDataChecked">显示数据</el-checkbox>
      </div>
    </div>
    <div class="legend-card">
      <div class="title">图例</div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-12.png" alt="" />水闸
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-13.png" alt="" />泵站
      </div>
    </div>
  </div>
  <Dialog v-model="dialogVisible" title="框选查询" width="65%" @close="clearDrawing()">
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleInfo(row)">查看</el-button>
      </template>
    </at-table>
  </Dialog>

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`"
    :ref="(el) => { refs[`keynote${item.type}${item.id}`] = el }" :name="item.name" @click="handleInfo(item)"
    :theme="item.type === '1' ? '#12ba41' : '#87ba10'" :trigger="isDataChecked ? 'always' : 'hover'">
    <!-- <template #main>
      <div class="my-marker-info" v-if="item.type == 'pumpSt'">
        <div class="item">
          <span class="name">水厂名称：</span>
          <span class="value">{{ item.wtwkName }}</span>
        </div>
        <div class="item">
          <span class="name">泵站型号：</span>
          <span class="value">{{ item.pumpModel }}</span>
        </div>
        <div class="item">
          <span class="name">泵站规模：</span>
          <span class="value">{{ item.pumpScale }}</span>
        </div>
      </div>
      <div class="my-marker-info" v-if="item.type == 'sluiceSt'">
        <div class="item">
          <span class="name">水闸类型：</span>
          <span class="value">{{ getDictLabel('fx_gate_type', item.type) }}</span>
        </div>
        <div class="item">
          <span class="name">建设年份：</span>
          <span class="value">{{ formatToDate(item.buildTime) }}</span>
        </div>
      </div>
    </template> -->
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-13.png" alt="" v-if="item.type == '1'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-12.png" alt="" v-else-if="item.type == '2'" />
    </template>
  </at-marker>

  <Dialog v-model="dialogInfoVisible" title="站点详情" width="500px">
    <div class="info-card" v-loading="infoLoading">
      <template v-if="dialogInfo.dataType == '1'">
        <div class="item">
          <div class="label">水厂名称：</div>
          <div class="value">{{ dialogInfo.wtwkName }}</div>
        </div>
        <div class="item">
          <div class="label">泵站位置：</div>
          <div class="value">{{ dialogInfo.address }}</div>
        </div>
        <div class="item">
          <div class="label">泵站型号：</div>
          <div class="value">{{ dialogInfo.pumpModel }}</div>
        </div>
        <div class="item">
          <div class="label">泵站规模：</div>
          <div class="value">{{ dialogInfo.pumpScale }}</div>
        </div>
        <div class="item">
          <div class="label">管理单位：</div>
          <div class="value">{{ dialogInfo.operateUnit }}</div>
        </div>
      </template>
      <template v-if="dialogInfo.dataType == '2'">
        <div class="item">
          <div class="label">水闸类型：</div>
          <div class="value">{{ dialogInfo.typeName }}</div>
        </div>
        <div class="item">
          <div class="label">水闸位置：</div>
          <div class="value">{{ dialogInfo.address }}</div>
        </div>
        <div class="item">
          <div class="label">建设年份：</div>
          <div class="value">{{ formatToDate(dialogInfo.buildTime) }}</div>
        </div>
      </template>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { initGisMap, createPolygonGraphic, esriModules, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'

import { InfoFilled, Tickets, Close } from '@element-plus/icons-vue';
import { SluiceStInfoApi } from '@/api/Floodctrl/scada/sluicestinfo';
import { PumpStInfoApi } from '@/api/Floodctrl/scada/pumpstinfo';
import { formatToDate } from '@/utils/dateUtil';
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const drawTool = shallowRef<any>(null)
const currentPolygon = shallowRef<any>(null)
const isDrawing = ref<boolean>(false)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const refs = ref<any>({})
const keynoteList = reactive<any[]>([])
const dialogVisible = ref<boolean>(false)
const atTableRef = ref()
const queryParams = reactive<any>({
  coordinate: []
})
const tableConfig = reactive({
  list: [],
  fields: {
    index: true,
    name: {
      label: '名称'
    },
    typeName: {
      label: '类型'
    },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const handleSearch = (data) => {

}
const handleTableSearch = () => {
  atTableRef.value.loading = true
  SluiceStInfoApi.getSluiceStInfoBoxSelect(queryParams).then((res) => {
    tableConfig.list = res
    atTableRef.value.loading = false
  }).catch(() => {
    atTableRef.value.loading = false
  })
}
const dialogInfoVisible = ref<boolean>(false)
const dialogInfo = ref<any>({})
const infoLoading = ref<boolean>(false)
const handleInfo = (item) => {
  dialogInfo.value = {}
  dialogInfoVisible.value = true
  infoLoading.value = true
  let promise = PumpStInfoApi.getPumpStInfo
  if (item.type == '2')
    promise = SluiceStInfoApi.getSluiceStInfo
  promise(item.id).then((res) => {
    dialogInfo.value = { ...res, dataType: item.type }
    infoLoading.value = false
  }).catch(() => {
    infoLoading.value = false
  })
}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  popups.length = 0;
  keynoteList.forEach((item) => {
    // 绑定弹窗
    let dom = refs.value[`keynote${item.type}${item.id}`];
    if (Array.isArray(dom)) {
      dom = dom[0].$el;
    } else {
      dom = dom.$el;
    }
    createMarkerPopup(dom, [item.longitude, item.latitude])
  })
  updateAllPopupPositions()
}
const getMarkerList = () => {
  SluiceStInfoApi.getSluiceStInfoBoxSelect({ pageNo: 1, pageSize: 9999 }).then((res) => {
    res.forEach((item) => {
      if (item.lon && item.lat) {
        keynoteList.push({ ...item, latitude: item.lat, longitude: item.lon })
      }
    })
    nextTick(() => {
      setKeynoteMarker();
    })
  })
}
// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  initDrawTool()
  getMarkerList()
};
// 初始化绘图工具
const initDrawTool = () => {
  if (!mapView.value) return;
  drawTool.value = new esriModules.Draw({
    view: mapView.value,
  });
};
// 开始绘制
const startDrawing = () => {
  if (!mapView.value || !drawTool.value || isDrawing.value) return;
  isDrawing.value = true;
  // 开始绘制多边形
  const action = drawTool.value.create('polygon');
  // fires when a vertex is added
  action.on("vertex-add", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when the pointer moves
  action.on("cursor-update", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when the drawing is completed
  action.on("draw-complete", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when a vertex is removed
  action.on("vertex-remove", function (evt) {
    measureLine(evt.vertices);
  });
  // fires when the drawing is completed
  action.on('draw-complete', (evt) => {
    const graphic = measureLine(evt.vertices);
    currentPolygon.value = graphic;
    isDrawing.value = false;
    dialogVisible.value = true;
    queryParams.coordinate = evt.vertices
    nextTick(() => {
      handleTableSearch()
    })
  });
};
// 清除绘制
const clearDrawing = () => {
  if (mapView.value) {
    mapView.value.graphics.remove(currentPolygon.value);
  }
};
const measureLine = (vertices) => {
  mapView.value.graphics.removeAll();
  const graphic = createPolygonGraphic(vertices);
  mapView.value.graphics.add(graphic);
  return graphic;
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
.opt-box {
  position: absolute;
  top: 20px;
  right: 20px;
}

.info-card {

  .item {
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-top: 8px;

    .label {
      color: #666;
    }

    .value {
      color: #333;
    }
  }
}

.draw-tips {
  background: #FFFFFF;
  box-shadow: 0px 2 6px 0px rgba(0, 0, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
  padding: 8px 18px;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #3A7DFF;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  .el-icon {
    margin-right: 8px;
  }

  p {
    margin-left: 12px;

    span {
      color: #FF4D4F;
    }
  }
}

.legend {
  position: absolute;
  max-height: 90%;
  bottom: 20px;
  left: 20px;
  z-index: 1;

  .legend-card {
    width: 180px;
    box-shadow: 0px 2 8px 0px rgba(0, 0, 0, 0.08);
    border-radius: 8px 8px 8px 8px;
    padding: 12px 16px;
    background-color: #fff;

    &+.legend-card {
      margin-top: 12px;
    }
  }

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

.map-markers {
  :deep(.map-markers-info) {
    .map-markers-info-main {
      padding: 0;
    }
  }
}

.my-marker-icon {
  width: 20px;
  height: 20px;
}
</style>
