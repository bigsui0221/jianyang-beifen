<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />

  <div class="search-box">
    <div class="title">时空检测图<el-button type="primary" link v-if="isSelect" @click="onExitSelect">退出</el-button></div>
    <div class="content">
      统计周期<el-date-picker v-model="selectDateRange" type="daterange" />
      <el-icon class="btn" v-if="!isPlay" @click="onPlay">
        <VideoPlay />
      </el-icon>
      <el-icon class="btn" v-else @click="onPause">
        <VideoPause />
      </el-icon>
    </div>
  </div>
  <!-- 图例区 -->
  <div class="legend">
    <div class="title">图例</div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/warning/icon-0.png" alt="" />内涝点
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/warning/icon-1.png" alt="" />红色预警
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/warning/icon-2.png" alt="" />橙色预警
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/warning/icon-3.png" alt="" />黄色预警
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/warning/icon-4.png" alt="" />蓝色预警
    </div>
  </div>

  <div class="steps" v-if="isSelect">
    <div class="steps-item" v-for="step, index in stepsArr" :key="index"
      :class="{ current: steps === index, active: steps > index }">
      <div class="dot"></div>
      <div class="label">{{ step.label }}</div>
    </div>
  </div>

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.name" :theme="warningColor(item.level)" trigger="click">
    <template #main>
      <div class="my-marker-info">
        <div class="warning" :class="`level-${item.level}`" v-if="item.level && item.level > 0">
          <span>{{ warningText(item.level) }}</span>
          <span>13</span>
          <span>H≥50cm</span>
        </div>
        <Echart :options="echartsOptions" :height="220" :width="320"/>

        <div class="btn-group" v-if="item.level && item.level > 0">
          <el-button type="warning" v-if="!item.isLed" @click="openLedDialog(item)">声光及LED预警</el-button>
          <el-button type="success" v-else @click="openLedDialog(item)">关闭预警</el-button>
          <el-button type="danger">预警处理</el-button>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon icon99" :src="icon99" alt="" v-if="item.level && item.level > 0" />
      <img class="my-marker-icon" :src="markerIcon(item.level)" alt="" />
    </template>
  </at-marker>

  <Dialog v-model="dialogVisible" :title="dialogTitle" width="380px" class="warn-dialog">
    <div class="open" v-if="!dialogInfo.isLed">
      <div class="label">声光报警及LED预警信息</div>
      <el-select v-model="warnData.value" placeholder="请选择">
        <el-option label="谨慎通行" value="1" />
        <el-option label="禁止通行" value="2" />
      </el-select>
      <el-checkbox v-model="warnData.check">开启声音</el-checkbox>
      <el-button type="primary" @click="saveWarnData">发布预警</el-button>
    </div>
    <div class="close" v-else>
      <div class="label">关闭声光报警</div>
      <div class="label">关闭LED预警信息</div>
      <el-button type="primary" @click="saveWarnData">解除预警</el-button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { initGisMap, createPolygonGraphic, esriModules, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'

import icon0 from '@/assets/imgs/floodctrl/warning/icon-10.png'
import icon1 from '@/assets/imgs/floodctrl/warning/icon-11.png'
import icon2 from '@/assets/imgs/floodctrl/warning/icon-12.png'
import icon3 from '@/assets/imgs/floodctrl/warning/icon-13.png'
import icon4 from '@/assets/imgs/floodctrl/warning/icon-14.png'
import icon99 from '@/assets/imgs/floodctrl/warning/icon-99.gif'

const message = useMessage()

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);

const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const selectDateRange = ref<any>([])
const isSelect = ref<boolean>(false)
const isPlay = ref<boolean>(false)
const refs = ref<any>({})

const dialogVisible = ref<boolean>(false)
const dialogTitle = ref<string>('')
const dialogInfo = ref<any>(null)
const warnData = reactive<any>({
  value: '',
  check: false
})

const openLedDialog = (item) => {
  dialogTitle.value = item.isLed ? '解除预警' : '发布预警'
  dialogVisible.value = true
  dialogInfo.value = item
}
const saveWarnData = () => {
  dialogVisible.value = false
  dialogInfo.value.isLed = !dialogInfo.value.isLed
  message.success('操作成功')
}
const keynoteList = reactive<any[]>([
  { id: 1, name: '水位监测站点', longitude: 104.567121, latitude: 30.399821, level: 0, isLed: false },
  { id: 2, name: '水位监测站点', longitude: 104.557101, latitude: 30.339841, level: 1, isLed: true },
  { id: 3, name: '水位监测站点', longitude: 104.617101, latitude: 30.419841, level: 2, isLed: false }
])
const steps = ref<number>(0)
const stepsArr = reactive([{
  label: '1小时'
}, {
  label: '3小时'
}, {
  label: '6小时'
}, {
  label: '12小时'
}, {
  label: '24小时'
}, {
  label: '36小时'
},])
const handleSearch = (data) => {

}
const markerIcon = (level: number) => {
  let arr = [icon0, icon1, icon2, icon3, icon4]
  return arr[level]
}
const warningText = (level) => {
  let arr = ['', '红色风险', '橙色风险', '黄色风险', '蓝色风险']
  return arr[level] ?? arr[0]
}
const warningColor = (level) => {
  let arr = ['#999999', '#e23e41', '#f59a23', '#ffff00', '#3A7DFF']
  return arr[level] ?? arr[0]
}
const onExitSelect = () => {
  isSelect.value = false;
  isPlay.value = false;
  steps.value = 0;
  if (timer.value) clearInterval(timer.value)
}
const timer = ref<any>(null)
const onPlay = () => {
  isSelect.value = true
  isPlay.value = true
  if (timer.value) clearInterval(timer.value)
  if (steps.value == stepsArr.length - 1) steps.value = 0
  timer.value = setInterval(() => {
    steps.value++
    if (steps.value == stepsArr.length - 1) {
      clearInterval(timer.value)
      isPlay.value = false
    }
  }, 1000 * 5)
}
const onPause = () => {
  isPlay.value = false
  clearInterval(timer.value)
}
/**
 * 设置点
 */
const setKeynoteMarker = () => {
  popups.length = 0
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
const legend = reactive([
  {
    color: '#E23E41',
    label: '警示水位',
    value: 1400
  }, {
    color: '#f59a23',
    label: '保证水位',
    value: 1200
  },
  //  {
  //   color: '#ff0',
  //   label: '黄色Ⅲ级预警',
  //   value: 1000
  // }, {
  //   color: '#3A7DFF',
  //   label: '蓝色Ⅳ级预警',
  //   value: 800
  // }
])
const echartsOptions = reactive<any>({
  color: ["#5858CC", "#00C94A"],
  grid: {
    left: 40,
    right: 20,
    top: 30,
    bottom: 50
  },
  legend: {
    icon: "rect",
    bottom: 0,
    left: 'center',
    orient: 'horizontal',
    itemGap: 20,
    textStyle: {
      color: '#333',
      fontSize: 14
    },
    itemWidth: 12,
    itemHeight: 12,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: Array.from({ length: 25 }, (_, index) => index)
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      if (params.length === 0) return '';
      const fullXText = params[0].name;
      let result = `<div style="font-weight: bold; margin-bottom: 5px;">${fullXText}时</div>`;
      params.forEach(item => {
        result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 5px;"></span>
                          <span>${item.seriesName}: ${item.value} m³/s</span>
                  </div>`;
      });
      return result;
    },
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ddd',
    borderWidth: 1,
    textStyle: { color: '#333' },
    padding: 10
  },
  series: [
    {
      name: '雨量',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(0, 0, 191, 0.20)' // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(0, 0, 191, 0)' // 100% 处的颜色
          }],
          global: false
        }
      },

      markLine: {
        symbol: ['none', 'none'], // 隐藏标记线两端的箭头
        label: {
          show: true,
          position: 'insideEndTop', // 文本显示在标记线末端
          formatter: '{b}: {c} m³/s', // 显示标记线名称
          fontWeight: 'bold'
        },
        // 标记线数据 - 红色Ⅰ级预警线（y轴值为1000）
        data: (() => {
          let array: any[] = []
          for (const item of legend) {
            array.push({
              name: item.label,
              yAxis: item.value,
              lineStyle: {
                color: item.color,
                width: 2,
                type: 'solid'
              },
              label: {
                color: item.color
              }
            })
          }
          return array
        })()
      }
    },
    {
      name: '水位',
      data: [20, 32, 10, 34, 290, 330, 320],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(0, 201, 74, 0.20)' // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(0, 201, 74, 0)' // 100% 处的颜色
          }],
          global: false
        }
      }
    }
  ],
})


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
.warn-dialog {
  .label {
    font-weight: 500;
    font-size: 14px;
    color: #333333;

    &+.label {
      margin-top: 8px;
    }
  }

  .el-select,
  .el-checkbox {
    margin-top: 8px;
  }

  .el-button {
    margin-top: 8px;
    display: block;
    margin-left: auto;
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

.search-box {
  position: absolute;
  background: #FFFFFF;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 8px 8px;
  left: 20px;
  top: calc(20px + 30px + 12px);
  padding: 20px;
  font-weight: 400;
  font-size: 14px;
  color: #333333;

  .title {
    font-weight: 500;
    font-size: 18px;
    color: #333333;
    display: flex;
    align-items: center;

    .el-button {
      margin-left: auto;
    }
  }

  .content {
    margin-top: 16px;
    display: flex;
    align-items: center;

    :deep(.el-date-editor) {
      width: 250px;
      margin-left: 8px;
    }

    .btn {
      margin-left: 18px;
      flex-shrink: 0;
      font-weight: 400;
      font-size: 28px;
      color: #3A7DFF;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }

      .el-icon {
        font-size: 28px;
      }
    }
  }
}

.steps {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #FFFFFF;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 8px 8px;
  padding: 20px 0;
  display: flex;
  align-items: center;
  text-align: center;

  .steps-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    position: relative;
    min-width: 150px;

    &.active {
      &::before {
        background-color: #3A7DFF;
      }

      &::after {
        background-color: #3A7DFF;
      }

      .dot {
        border-color: #3A7DFF;
        background-color: #3A7DFF;
      }

      .label {
        color: #333333;
      }
    }

    &.current {
      &::before {
        background-color: #3A7DFF;
      }

      .dot {
        border-color: #3A7DFF;
      }

      .label {
        color: #3A7DFF;
      }
    }

    &:first-child {
      &::before {
        display: none;
      }
    }

    &:last-child {
      &::after {
        display: none;
      }
    }

    &::before {
      content: "";
      position: absolute;
      display: block;
      left: 0;
      top: 5px;
      width: 40%;
      height: 2px;
      background: #D9D9D9;
      border-radius: 0px 2px 2px 0px;
    }

    &::after {
      content: "";
      position: absolute;
      display: block;
      right: 0;
      top: 5px;
      width: 40%;
      height: 2px;
      background: #D9D9D9;
      border-radius: 2px 0px 0px 2px;
    }

    .dot {
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      border: 2px solid #D9D9D9;
    }

    .label {
      margin-top: 8px;
      font-weight: 500;
      font-size: 14px;
      color: #666666;
    }
  }
}

.map-markers {
  :deep(.map-markers-info) {
    .warning {
      padding: 0 16px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 3px;

      &.level-1 {
        background-color: rgba($color: #e23e41, $alpha: 0.3);
        color: #e23e41;
      }

      &.level-2 {
        background-color: rgba($color: #f59a23, $alpha: 0.3);
        color: #f59a23;
      }

      &.level-3 {
        background-color: rgba($color: #ff0, $alpha: 0.3);
        color: #ff0;
      }

      &.level-4 {
        background-color: rgba($color: #3A7DFF, $alpha: 0.3);
        color: #3A7DFF;
      }
    }

    .btn-group {
      margin-top: 12px;
    }
  }

  :deep(.map-markers-icon) {
    display: flex;
    align-items: center;
    flex-direction: column;

    .my-marker-icon {
      width: 28px;
      height: 34px;

      &.icon99 {
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style>
