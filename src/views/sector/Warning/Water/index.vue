<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.siteName" :theme="warningColor(item.level)" @click="onMarkerClick(item)">
    <template #main>
      <div class="my-marker-info" v-for="data, dindex in item.dataList" :key="dindex">
        <div class="item">
          <span class="name">{{ data.pointName }}：</span>
          <span class="value">{{ data.value }}{{ data.pointUnit }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/marker/icon-10.png" alt="" />
    </template>
  </at-marker>

  <div class="content">
    <at-title>沱江上游7*24h来水预报
      <template #right><el-button type="primary" link @click="isExpand = !isExpand">展开/收起</el-button></template>
    </at-title>
    <div class="expand-content" :class="{ 'expand': isExpand }">
      <div class="title">
        <at-select v-model="selectValue" :config="selectConfig" @change="onSelectChange" />
        <div class="legend">
          <div class="legend-item" v-for="item, index in legend" :key='index'>
            <div class="rect" :style="{ backgroundColor: item.color }"></div>
            <div class="value">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <Echart :options="echartsOptions" :height="400" />
    </div>
  </div>

  <Dialog v-model="dialogVisible" :title="dialogTitle" width="65%" class="info-dialog">
    <div class="warning" :style="{ color: warningColor(dialogInfo.level) }">{{ warningText }}</div>
    <div class="item">位置：{{ dialogInfo.address }}</div>
    <div class="item">
      <span>实时流量：{{dialogInfo.dataList.find(e => e.pointName == '流量')?.value}}m³/s</span>
      <span>警戒流量：{{ dialogInfo.rainSaValue ?? '-' }}m³/s</span>
      <span>更新时间：{{ formatToDateTime(dialogInfo.dataList[0].time) }}</span>
    </div>
    <at-title title="站点实时数据监测">
      <template #right><el-button type="primary" link>更多</el-button></template>
    </at-title>
    <Echart :options="dotEchartsOptions" :height="420" />
  </Dialog>
</template>

<script lang="ts" setup>

import { RealDataApi } from '@/api/Floodctrl/scada/realdata';
import { formatToDateTime } from '@/utils/dateUtil';
import { initGisMap, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);

const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const selectValue = ref<string>('')
const selectConfig = reactive({
  options: []
})
const legend = reactive([
  {
    color: '#E23E41',
    label: '警戒流量',
    value: 150
  }, {
    color: '#f59a23',
    label: '保证流量',
    value: 140
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
const refs = ref<any>({})
const isExpand = ref<boolean>(true)
const echartsOptions = ref<any>({})
const setEchartsOptions = (xData, seriesData) => {
  echartsOptions.value = {
    color: ["#5858CC", "#00C94A"],
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 60
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
      data: xData
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
        name: '当前流量',
        data: seriesData,
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
      // {
      //   name: '预测流量',
      //   data: [20, 32, 10, 34, 290, 330, 320],
      //   type: 'line',
      //   smooth: true,
      //   areaStyle: {
      //     color: {
      //       type: 'linear',
      //       x: 0,
      //       y: 0,
      //       x2: 0,
      //       y2: 1,
      //       colorStops: [{
      //         offset: 0, color: 'rgba(0, 201, 74, 0.20)' // 0% 处的颜色
      //       }, {
      //         offset: 1, color: 'rgba(0, 201, 74, 0)' // 100% 处的颜色
      //       }],
      //       global: false
      //     }
      //   }
      // }
    ],
  }
}
const keynoteList = ref<any[]>([])

const handleSearch = (data) => {

}

const dialogVisible = ref<boolean>(false)
const dialogTitle = ref<string>('')
const dialogInfo = ref<any>({})
const warningText = computed(() => {
  switch (dialogInfo.value.level) {
    case 1:
      return '红色Ⅰ级预警'
    case 2:
      return '橙色Ⅱ级预警'
    case 3:
      return '黄色Ⅲ级预警'
    case 4:
      return '蓝色Ⅳ级预警'
    default:
      return ''
  }
})
const warningColor = (level) => {
  switch (level) {
    case 1:
      return '#E23E41'
    case 2:
      return '#f59a23'
    case 3:
      return '#ff0'
    case 4:
      return '#3A7DFF'
    default:
      return '#3A7DFF'
  }
}
const dotEchartsOptions = ref<any>({})
const onMarkerClick = (item) => {
  dialogInfo.value = item
  dialogTitle.value = `${item.siteName}`
  dialogVisible.value = true
  nextTick(() => {
    getDataListByInterval(item.deviceId)
  })
}
const onSelectChange = (val) => {
  getDataListByInterval(val, '1')
}
const setDotEchartsOptions = (xData, seriesData) => {
  dotEchartsOptions.value = {
    color: ["#5858CC", "#00C94A"],
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 60
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
      data: xData
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
        name: '实时流量',
        data: seriesData,
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
    ],
  }
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
  getRealDataByFlow()
};

const getRealDataByFlow = () => {
  RealDataApi.getRealDataByFlow().then(res => {
    keynoteList.value = res
    selectConfig.options = res.map(item => ({
      label: item.siteName,
      value: item.deviceId
    }))
    selectValue.value = res[0].deviceId
    getDataListByInterval(selectValue.value, '1')
    nextTick(() => {
      setKeynoteMarker()
    })
  })
}
const getDataListByInterval = (deviceId, type = '0') => {
  const selectDate = [new Date().setDate(new Date().getDate() - 1), new Date()]
  RealDataApi.getDataListByInterval({
    ts1: formatToDateTime(selectDate[0]),
    ts2: formatToDateTime(selectDate[1]),
    floodDeviceId: deviceId,
    interval: '1h',
  }).then((res: any) => {
    let xData: any[] = []
    let seriesData: any[] = []
    for (const key in res) {
      if (key.indexOf('FLOW') == -1) continue
      xData = res[key]?.map((item) => item.timeString)
      seriesData = res[key]?.map((item) => item.logValue)
    }
    if (type === '0')
      setDotEchartsOptions(xData, seriesData)
    else
      setEchartsOptions(xData, seriesData)
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
.info-dialog {
  .warning {
    margin-bottom: 8px;
    font-weight: bold;
  }

  .item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    span {
      margin-right: 30px;
    }
  }

  .at-title {
    .el-button {
      margin-left: auto;
    }
  }
}

.content {
  background: #FFFFFF;
  border-radius: 8px 8px 8px 8px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  padding: 20px;
  z-index: 99;

  .at-title {
    .el-button {
      margin-left: auto;
    }
  }

  .expand-content {
    height: 0;
    overflow: hidden;
    transition: height 0.3s;

    &.expand {
      height: 452px;
    }
  }

  .title {
    margin-top: 16px;
    display: flex;
    align-items: center;

    .at-select {
      width: 200px;
    }

    .legend {
      display: flex;
      align-items: center;
      margin-left: auto;

      &-item {
        display: flex;
        align-items: center;
        margin-left: 40px;
        font-weight: 400;
        font-size: 14px;
        color: #333333;

        .rect {
          border-radius: 1px 1px 1px 1px;
          width: 12px;
          height: 3px;
          margin-right: 8px;
        }
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
