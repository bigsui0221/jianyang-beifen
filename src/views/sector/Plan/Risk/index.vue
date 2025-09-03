<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <!-- 自定义点 -->
  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.name" :theme="warningColor(item.level)" trigger="click">
    <template #main>
      <div class="my-marker-info">
        <div class="warning" :class="`level-${item.level}`" v-if="item.level && item.level > 0">
          <span>{{ warningText(item.level) }}</span>
          <span>13</span>
          <span>H≥50cm</span>
        </div>
        <Echart :options="echartsOptions" :height="220" :width="320" />

        <div class="btn-group" v-if="item.level && item.level > 0">
          <el-button type="warning" @click="handleWran(item)">发布预警</el-button>
        </div>
      </div>
    </template>
    <template #icon>
      <!-- <img class="my-marker-icon icon99" :src="icon99" alt="" v-if="item.level && item.level > 0" /> -->
      <img class="my-marker-icon" :src="markerIcon(item.level)" alt="" />
    </template>
  </at-marker>
  <div class="steps-card" v-if="steps > 0">
    <div class="steps">
      <div class="steps-item" v-for="step, index in stepsArr" :key="index" :class="{ active: steps === index + 1 }">
        <div class="dot"></div>
        <div class="label">{{ step.label }}</div>
        <div class="value">{{ step.value }}</div>
        <div class="date">{{ step.date }}</div>
      </div>
    </div>
    <div class="btn" v-if="!isPlay" @click="onPlay">
      <el-icon>
        <VideoPlay />
      </el-icon>
      回放
    </div>
    <div class="btn" v-else @click="onPause">
      <el-icon>
        <VideoPause />
      </el-icon>
      暂停
    </div>
  </div>
  <!-- 内容区 -->
  <div class="content">
    <div class="step-0" v-show="steps === 0">
      <div class="title">全景复盘</div>
      <div class="date">时间：<el-date-picker v-model="selectDate" type="daterange" /></div>
      <div class="item" @click="onRiskItemClick"> {{ formatToDate(currentDate) }} 内涝事件
      </div>
    </div>
    <div class="step-1" v-show="steps === 1">
      <div class="title">预警信息</div>
      <div class="item"><span>预警名称：</span>简阳街道【暴雨】红色预警</div>
      <div class="item"><span>预警内容：</span>根据最新气象监测，目前我市上空有强对流云团发展，预计未来3小时内将出现</div>
      <div class="item"><span>预警地点：</span>简阳市简城街道金水街社区健康路</div>
      <div class="item"><span>预警时间：</span>{{ formatToDateTime(currentDate) }}</div>
      <div class="title">实时数据</div>
      <div class="row">
        <div class="item">实时水位：<span>2m</span></div>
        <div class="item">警戒水位：<span>1.5m</span></div>
      </div>
      <div class="row">
        <div class="item">降雨量：<span>130mm</span></div>
      </div>
    </div>
    <div class="step-2" v-show="steps === 2">
      <div class="title">预案信息</div>
      <div class="row">
        <div class="item"><span>编制人：</span>防汛处</div>
        <div class="item"><span>编制时间：</span>{{ formatToDateTime(currentDate) }}</div>
      </div>
      <div class="row">
        <div class="item"><span>预案名称：</span>防汛应急预案</div>
        <div class="item"><span>行政区划：</span>简阳街道</div>
      </div>
      <div class="row">
        <div class="item"><span>区域风险：</span>洪水</div>
        <div class="item"><span>监测预警：</span>水位</div>
      </div>
      <div class="row">
        <div class="item"><span>预案类型：</span>应急预案</div>
        <div class="item"><span>应急响应：</span>Ⅰ级</div>
      </div>
      <div class="title">防汛对象</div>
      <at-table :config="tableConfig" />
      <div class="item"><span>响应流程：</span>响应流程</div>
      <div class="item"><span>应急处置：</span>应急处置</div>
      <div class="item"><span>应急资源：</span>防洪沙袋*30</div>
      <div class="item"><span>应急物资：</span>防洪沙袋*30</div>
      <div class="item"><span>应急通讯录：</span>李占时 16012341324</div>
    </div>
    <div class="step-3" v-show="steps === 3">
      <div class="title">任务下发</div>
      <div class="item"><span>任务名称：</span>防汛应急任务</div>
      <div class="item"><span>生成时间：</span>{{ formatToDateTime(currentDate) }}</div>
      <div class="item"><span>任务内容：</span>暴雨Ⅰ级防汛应急任务</div>
    </div>
    <div class="step-4" v-show="steps === 4">
      <div class="title">任务执行</div>
      <div class="item"><span>完成时间：</span>{{ formatToDateTime(currentDate) }}</div>
      <div class="item"><span>使用物资：</span>防洪沙袋*30</div>
      <div class="item"><span>处置人员：</span>村民10名</div>
      <div class="item"><span>处置工艺：</span>无</div>
      <div class="item"><span>备注：</span>无</div>
    </div>
    <div class="step-5" v-show="steps === 5">
      <div class="title">发起协同</div>
      <div class="item"><span>发起时间：</span>{{ formatToDateTime(currentDate) }}</div>
      <div class="item"><span>求助内容：</span>村民10名遭遇暴雨无法转移</div>
      <div class="item"><span>回复时间：</span>迅速支援</div>
      <div class="item"><span>回复人：</span>李占时</div>
      <div class="item"><span>回复内容：</span>已派应急人员前往</div>
    </div>
    <div class="step-6" v-show="steps === 6">
      <div class="title">完成</div>
      <div class="item"><span>完成时间：</span>{{ formatToDateTime(currentDate) }}</div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { initGisMap, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'
import { formatToDate, formatToDateTime } from '@/utils/dateUtil';
import icon0 from '@/assets/imgs/floodctrl/warning/icon-10.png'
import icon1 from '@/assets/imgs/floodctrl/warning/icon-11.png'
import icon2 from '@/assets/imgs/floodctrl/warning/icon-12.png'
import icon3 from '@/assets/imgs/floodctrl/warning/icon-13.png'
import icon4 from '@/assets/imgs/floodctrl/warning/icon-14.png'

const router = useRouter()
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);

const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const selectDate = ref<any[]>([new Date().setDate(new Date().getDate() - 30), new Date()])
const refs = ref<any>({})
const steps = ref<number>(0)
const currentDate = new Date(new Date().setDate(new Date().getDate() - 10))
const stepsArr = reactive([{
  label: '预警', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
}, {
  label: '预案', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
}, {
  label: '任务下发', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
}, {
  label: '任务执行', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
}, {
  label: '发起协同', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
}, {
  label: '完成', value: '王老吉', date: formatToDateTime(currentDate.setHours(currentDate.getHours() + 1))
},])
const isPlay = ref<boolean>(false)

const tableConfig = reactive<any>({
  list: [] as any,
  fields: {
    value: {
      label: '区域名称'
    },
    value1: {
      label: '区域负责人'
    },
    value2: {
      label: '单位地址'
    },
    value3: {
      label: '影响人口(万人)'
    },
    value4: {
      label: '逃生地址'
    },
    value5: {
      label: '逃生责任单位'
    },
    value6: {
      label: '逃生责任人'
    }
  }
})
const handleSearch = (data) => {

}
const onRiskItemClick = (item) => {
  steps.value = 1;
}
const timer = ref<any>(null)
const onPlay = () => {
  isPlay.value = true
  if (timer.value) clearInterval(timer.value)
  if (steps.value == stepsArr.length) steps.value = 0
  timer.value = setInterval(() => {
    steps.value++
    if (steps.value == stepsArr.length) {
      clearInterval(timer.value)
      isPlay.value = false
    }
  }, 1000 * 5)
}
const onPause = () => {
  isPlay.value = false
  clearInterval(timer.value)
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

const handleWran = (row: any) => {
  router.push({
    path: '/publish/warningAdd',
    query: {
      warnPreld: row.id
    }
  })
}
const keynoteList = reactive<any[]>([
  { id: 1, name: '水位监测站点', longitude: 104.567121, latitude: 30.399821, level: 0, isLed: false },
  { id: 2, name: '水位监测站点', longitude: 104.557101, latitude: 30.339841, level: 1, isLed: true },
  { id: 3, name: '水位监测站点', longitude: 104.617101, latitude: 30.419841, level: 2, isLed: false }
])

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

// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
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
.steps-card {

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

  .steps {
    display: flex;
    align-items: center;
    text-align: center;

    .steps-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
      position: relative;

      &.active {
        .label {
          color: rgba($color: #3A7DFF, $alpha: 1.0);
        }

        .value {
          color: rgba($color: #3A7DFF, $alpha: 0.8);
        }

        .date {
          color: rgba($color: #3A7DFF, $alpha: 0.6);
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
        background: #3A7DFF;
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
        background: #3A7DFF;
        border-radius: 2px 0px 0px 2px;
      }

      .dot {
        width: 12px;
        height: 12px;
        background: #3A7DFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
      }

      .label {
        margin-top: 8px;
        font-weight: 500;
        font-size: 14px;
        color: #333333;
      }

      .value {
        margin-top: 4px;
        font-weight: 400;
        font-size: 12px;
        color: #333333;
      }

      .date {
        font-weight: 400;
        font-size: 12px;
        color: #666666;
      }
    }
  }

  .btn {
    margin-right: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-weight: 400;
    font-size: 14px;
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

.content {
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
    margin-bottom: 16px;
  }



  .step-0 {

    .date {
      margin-bottom: 16px;
    }

    .item {
      border-radius: 4px 4px 4px 4px;
      padding: 6px 12px;
      color: #E23E41;
      background: rgba(226, 62, 65, 0.1);
      cursor: pointer;

      &+.item {
        margin-top: 12px;
      }
    }
  }

  .step-1,
  .step-3,
  .step-4,
  .step-5,
  .step-6 {
    .item {
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      flex: 1;

      span {
        color: #666666;
      }

      &+.item {
        margin-top: 12px;
      }

      &+.title {
        margin-top: 32px;
      }
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item {
        margin-top: 0;

        span {
          color: #3A7DFF;
        }
      }

      &+.row {
        margin-top: 12px;
      }
    }
  }

  .step-2 {
    .item {
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      flex: 1;

      span {
        color: #666666;
      }

      &+.item {
        margin-top: 12px;
      }

      &+.title {
        margin-top: 32px;
      }
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item {
        margin-top: 0;

        span {
          color: #666666;
        }
      }

      &+.row {
        margin-top: 12px;
      }

      &+.title {
        margin-top: 32px;
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
  width: 28px;
  height: 34px;
}
</style>