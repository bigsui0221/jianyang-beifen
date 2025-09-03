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
  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.siteName" theme="green">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <div class="name">指标：</div>
          <div class="value" v-if="item.pointName">
            <span v-for="val, i in item.pointName.split(',')" :key="i">{{ val }}</span>
          </div>
          <div class="value" v-else>--</div>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/marker/icon-10.png" alt="" />
    </template>
  </at-marker>
  <!-- 新增弹窗 -->
  <div class="edit-card">
    <div class="edit-card-title">{{ id ? '编辑' : '新增' }}风险点
      <el-icon class="edit-card-title-close">
        <Close />
      </el-icon>
    </div>
    <div class="edit-card-content">
      <div class="edit-card-content-btn">
        <el-button type="primary" @click="startDrawing">绘制区域</el-button>
        <el-button @click="clearDrawing">清除</el-button>
      </div>
      <at-form ref="atFormRef" :config="formConfig" />
      <at-table ref="atTableRef" :config="tableConfig">
        <template #operation="{ row }">
          <el-button link type="primary" @click="handlePos(row)">定位</el-button>
          <el-button link type="primary" @click="handleDel(row)">删除</el-button>
        </template>
      </at-table>
      <div class="edit-card-content-title">边框及填充色</div>
      <el-color-picker v-model="formConfig.formData.fillColor" @change="changeSelectColor" />
    </div>
    <div class="edit-card-footer">
      <el-button>取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Close, InfoFilled } from '@element-plus/icons-vue'
import { initGisMap, createPolygonGraphic, getSimpleFillSymbol, esriModules, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'
import { DangerAreaApi } from '@/api/Floodctrl/scada/dangerarea';
import { SiteApi } from '@/api/Floodctrl/site';
const message = useMessage() // 消息弹窗
const route = useRoute()
const id = route.query.id as string
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const drawTool = shallowRef<any>(null)
const currentPolygon = shallowRef<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDrawing = ref<boolean>(false)
const formConfig = reactive({
  formData: {
    dgaeArea: '',
    fillColor: '#3A7DFF'
  } as any,
  fields: {
    name: {
      label: "风险点名称",
      components: 'input',
      required: true,
    },
    type: {
      label: "风险点类型",
      components: 'select',
      dictType: 'fx_danger_type',
      required: true,
      onChange: (val) => {
        if (val === 'shzh') {
          formConfig.fields.riskLevel.hide = false
        } else {
          formConfig.fields.riskLevel.hide = true
        }
      }
    },
    riskLevel: {
      label: "风险点类型",
      components: 'select',
      dictType: 'fx_level_type',
      required: true,
      hide: true,
    }
  }
})
const atFormRef = ref()
/** 保存风险点 */
const handleSubmit = () => {
  atFormRef.value?.validate().then((data) => {
    if (!formConfig.formData.dgaeArea) {
      return message.error('请先绘制风险区域')
    }
    const formData = { ...data, stationIdList: tableConfig.list.map((item) => item.id) }
    let promise = DangerAreaApi.createDangerArea
    if (id)
      promise = DangerAreaApi.updateDangerArea
    promise(formData).then((res) => {
      message.success('操作成功')
      if (!id) {
        atFormRef.value?.resetFields()
        clearDrawing()
        formConfig.fields.riskLevel.hide = true
      }
    })
  }).catch((err) => {
    console.log(err)
  })
}
const tableConfig = reactive({
  list: [] as any[],
  height: 300,
  pagination: false,
  fields: {
    siteName: {
      label: '站点名称'
    },
    pointName: {
      label: '指标'
    },
    operation: {
      label: '操作',
      width: '120',
      fixed: 'right'
    }
  }
})
const refs = ref<any>({})
const keynoteList = reactive<any[]>([])


const handlePos = (row) => {
  mapView.value.goTo({
    target: [row.longitude, row.latitude],
    zoom: 16,
    duration: 1500
  })
}
const handleDel = (row) => {
  const index = tableConfig.list.findIndex((item) => item.id === row.id)
  tableConfig.list.splice(index, 1)
  keynoteList.splice(keynoteList.findIndex((item) => item.id === row.id), 1)
}

const handleSearch = (data) => {

}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  popups.length = 0;
  keynoteList.forEach((item) => {
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
  // 初始化绘制工具
  initDrawTool();

  if (id) {
    DangerAreaApi.getDangerArea(Number(id)).then(res => {
      for (const key in res) {
        formConfig.formData[key] = res[key]
      }
      if (res.dgaeArea) {
        const coordinate = JSON.parse(res.dgaeArea)
        const graphic = createPolygonGraphic(coordinate, res.fillColor)
        mapView.value.graphics.add(graphic);
        keynoteList.length = 0
        keynoteList.push(...res.stationList)
        tableConfig.list = res.stationList
        nextTick(() => {
          setKeynoteMarker()
        })
      }
      if (res.type === 'shzh') {
        formConfig.fields.riskLevel.hide = false
      }
    })
  }
};
// 初始化绘图工具
const initDrawTool = () => {
  if (!mapView.value) return;
  drawTool.value = new esriModules.Draw({
    view: mapView.value,
  });
};

const changeSelectColor = (color) => {
  if (currentPolygon.value)
    currentPolygon.value.symbol = getSimpleFillSymbol(color)
}

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
    formConfig.formData.dgaeArea = JSON.stringify(evt.vertices)
    getSiteBoxSelect(evt.vertices)
  });
};
const getSiteBoxSelect = (coordinate) => {
  SiteApi.getSiteBoxSelect({ coordinate }).then(res => {
    keynoteList.length = 0
    res.forEach(e => {
      keynoteList.push(e)
    })
    tableConfig.list = res
    nextTick(() => {
      setKeynoteMarker()
    })
  })
}
const measureLine = (vertices) => {
  mapView.value.graphics.removeAll();
  const graphic = createPolygonGraphic(vertices, formConfig.formData.fillColor);
  mapView.value.graphics.add(graphic);
  return graphic;
}

// 清除绘制
const clearDrawing = () => {
  if (mapView.value) {
    mapView.value.graphics.remove(currentPolygon.value);
    currentPolygon.value = null;
    mapView.value.graphics.removeAll();
    isDrawing.value = false;
    tableConfig.list = []
    keynoteList.length = 0
    formConfig.formData.dgaeArea = ''
  }
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
    display: flex;
    align-items: baseline;

    &:last-child {
      margin-right: 0;
    }
  }

  .name {
    font-size: 12px;
    color: #666;
  }

  .value {
    font-size: 12px;
    display: flex;
    flex-direction: column;
  }
}

.my-marker-icon {
  width: 28px;
  height: 34px;
}

.edit-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  background-color: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 8px 8px;

  &-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    padding: 12px;
    border-bottom: 1px solid #EDEDED;

    &-close {
      font-size: 24px;
      color: #4E5969;
      margin-left: auto;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }
    }
  }

  &-content {
    padding: 16px 12px;
    max-height: calc(100vh - 56px - 20px - 20px - 53px - 64px);
    overflow-y: auto;

    .at-form {
      margin-top: 24px;
    }

    .at-table {
      margin-top: 6px;
    }

    &-title {
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      margin-bottom: 12px;
    }
  }

  &-footer {
    padding: 16px 12px;
    display: flex;
    justify-content: flex-end;
  }
}

.my-marker {
  width: 28px;
  height: 34px;
  background: url('../../../../assets/images/map/marker.png') no-repeat;
  background-size: 100% 100%;
  cursor: pointer;

  &.active {}
}
</style>