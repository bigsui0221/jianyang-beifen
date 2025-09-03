<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 绘制提示 -->
  <div class="draw-tips" v-if="isDrawing && !isInfo">
    <el-icon>
      <InfoFilled />
    </el-icon>帮助提示<p>单击危险点为起点，双击避灾场所为终点</p>
  </div>
  <!-- 图例区 -->
  <div class="place-card">
    <el-input v-model="queryParams.name" placeholder="请输入避灾场所" clearable />
    <el-checkbox-group v-model="checkPlaceList" size="small" @change="onCheckChange" :disabled="isInfo">
      <el-checkbox v-for="item, index in placeList" :key="index" :label="item.id">{{ item.name }}</el-checkbox>
    </el-checkbox-group>
  </div>
  <div class="footer-btns" v-if="!isInfo">
    <el-button type="primary" @click="handleSave">保存</el-button>
    <el-button @click="$router.back()">返回</el-button>
  </div>
</template>

<script lang="ts" setup>
import { InfoFilled } from '@element-plus/icons-vue'
import { KeyAreaPlaceApi } from '@/api/Floodctrl/plan/keyareaplace';
import { initGisMap, esriModules, createPolyline, createMarkerGraphic } from '@/utils/gis'

import icon14 from '@/assets/imgs/floodctrl/plan/icon-14.png'
import icon16 from '@/assets/imgs/floodctrl/plan/icon-16.png'

const router = useRouter()
const route = useRoute()
const isInfo = route.query.io === '1'
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const plankeyinfo = ref<any>({})
/** 已绘制路线 */
const polylineList = ref<any[]>([])
const keynoteList = ref<any[]>([])

const handleSearch = (data) => {
}

const queryParams = reactive<any>({})
const placeList = ref<any>([])
const checkPlaceList = ref<any>([])
const getKeyAreaPlacePage = () => {
  KeyAreaPlaceApi.getKeyAreaPlacePage({ pageNo: 1, pageSize: 9999, name: queryParams.name }).then((res) => {
    placeList.value = res.list
    placeList.value.forEach((item: any) => {
      checkPlaceList.value.push(item.id)
    })
    onCheckChange(checkPlaceList.value)
    initDrawTool()
    createRoutePolylines()
  })
}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  keynoteList.value.forEach((item) => {
    const marker = createMarkerGraphic([item.lon, item.lat], item.id ? icon14 : icon16, { id: item.id })
    mapView.value.graphics.add(marker);
  })
}
const createRoutePolylines = () => {
  polylineList.value.forEach((item) => {
    const polyline = createPolyline(item)
    mapView.value.graphics.add(polyline);
  })
}
const handleSave = () => {
  sessionStorage.setItem('plankeyinfo', JSON.stringify({ isBack: true, ...plankeyinfo.value, route: JSON.stringify(polylineList.value) }))
  router.back()
}
const drawTool = shallowRef<any>(null)
const tempGraphic = shallowRef<any>(null)
const isDrawing = ref<boolean>(false)

// 初始化绘图工具
const initDrawTool = () => {
  if (!mapView.value) return;
  drawTool.value = new esriModules.Draw({
    view: mapView.value,
  });

  startDrawing()
};

// 开始绘制
const startDrawing = () => {
  if (!mapView.value || !drawTool.value || isDrawing.value) return;
  isDrawing.value = true;
  // 开始绘制多边形
  const action = drawTool.value.create('polyline');
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
    const polyline = createPolyline(evt.vertices);
    mapView.value.graphics.add(polyline);
    polylineList.value.push(evt.vertices)
    stopDrawing();
    initDrawTool();
  });
};
/**
 * 绘制临时线段
 * @param vertices 
 */
const measureLine = (vertices) => {
  if (tempGraphic.value) {
    mapView.value.graphics.remove(tempGraphic.value);
    tempGraphic.value = null;
  }
  tempGraphic.value = createPolyline(vertices);
  mapView.value.graphics.add(tempGraphic.value);
}
// 停止绘制函数
const stopDrawing = () => {
  if (drawTool.value) {
    drawTool.value.destroy();
  }
  // 移除临时图形
  if (tempGraphic.value) {
    mapView.value.graphics.remove(tempGraphic.value);
    tempGraphic.value = null;
  }
  isDrawing.value = false;
}

// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  getKeyAreaPlacePage()
};
const onCheckChange = (arr) => {
  keynoteList.value = [{ lon: plankeyinfo.value.lon, lat: plankeyinfo.value.lat }]
  let arr1: any = []
  for (const item of arr) {
    let obj = placeList.value.find((item1) => item1.id == item)
    arr1.push({ ...obj })
  }
  keynoteList.value = [...keynoteList.value, ...arr1]
  nextTick(() => {
    mapView.value.graphics.forEach(graphic => {
      // 检查当前图形是否为自定义marker
      if (graphic.symbol && graphic.symbol.type === "simple-marker") {
        mapView.value.graphics.remove(graphic);
      }
    });
    setKeynoteMarker()
  })
}
onMounted(() => {
  initMap()
  let obj = sessionStorage.getItem('plankeyinfo')
  if (obj) {
    plankeyinfo.value = JSON.parse(obj)
    polylineList.value = plankeyinfo.value.route ? JSON.parse(plankeyinfo.value.route) : []
  }
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
.footer-btns {
  position: fixed;
  bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 50%;
  transform: translateX(-50%);
}

.place-card {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 340px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;

  .el-checkbox-group {
    margin-top: 20px;
    min-height: 200px;

    :deep(.el-checkbox) {
      display: flex;
      align-items: center;

      .el-checkbox__label {
        font-weight: 400;
        font-size: 16px;
        color: #000000;
      }

      &+.el-checkbox {
        margin-top: 16px;
      }
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
