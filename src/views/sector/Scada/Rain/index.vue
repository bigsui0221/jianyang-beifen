<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <div class="opt-box">
    <el-button type="primary" @click="$router.push('/statistics/rainfall')">雨情查询</el-button>
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
      <div class="title">等值线</div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-11.png" alt="" />平均降雨
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-12.png" alt="" />泰森多边形
      </div>
    </div>
    <div class="legend-card">
      <div class="title">图例</div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-13.png" alt="" />正常站点
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-14.png" alt="" />预警站点
      </div>
    </div>
  </div>

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.siteName" :theme="item.siteStatus == 2 ? '#e23e41' : '#12ba41'"
    :trigger="isDataChecked ? 'always' : 'hover'" @click="onMarkerClick(item)">
    <template #main>
      <div class="my-marker-info" v-for="data, dindex in item.dataList" :key="dindex">
        <div class="item">
          <span class="name">{{ data.pointName }}：</span>
          <span class="value">{{ data.value }}{{ data.pointUnit }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-14.png" alt="" v-if="item.siteStatus == 2" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-13.png" alt="" v-else />
    </template>
  </at-marker>

  <div class="info-card" v-if="dialogVisible">
    <at-title :title="dialogInfo.siteName">
      <template #right>
        <el-icon @click="dialogVisible = false">
          <Close />
        </el-icon>
      </template>
    </at-title>
    <div class="warning" v-if="dialogInfo.siteStatus == 2">超警戒</div>
    <div class="item">
      <div class="label">位置：</div>
      <div class="value">{{ dialogInfo.address }}</div>
    </div>
    <div class="item">
      <div class="label">实时雨量：</div>
      <div class="value">{{dialogInfo?.dataList?.find(item => item.pointName == '雨量')?.value}}mm</div>
    </div>
    <div class="item">
      <div class="label">警戒雨量：</div>
      <div class="value">{{ dialogInfo.rainSaValue }}mm</div>
    </div>
    <div class="item">
      <div class="label">上报时间：</div>
      <div class="value">{{ formatToDateTime(dialogInfo?.dataList?.[0]?.time) }}</div>
    </div>
    <at-title title="站点数据曲线">
      <template #right>
        <el-date-picker v-model="selectDate" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
        <el-button type="primary" link @click="$router.push('/statistics/rainfall')">更多</el-button>
      </template>
    </at-title>
    <Echart :options="echartsOptions" :height="320" />
  </div>
</template>

<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'
import { formatToDateTime } from '@/utils/dateUtil';
import { initGisMap, createPolygonGraphic, createMarkerPopup, updateAllPopupPositions, popups } from '@/utils/gis'
import { RealDataApi } from '@/api/Floodctrl/scada/realdata';

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const refs = ref<any>({})
const keynoteList = ref<any[]>([])

const handleSearch = (data) => {
  console.log(data)
}
const dialogVisible = ref<boolean>(false)
const dialogInfo = ref<any>({})
const selectDate = ref<any>([])
const echartsOptions = ref<any>({})
const onMarkerClick = (item) => {
  dialogVisible.value = true
  dialogInfo.value = item
  selectDate.value = [new Date().setDate(new Date().getDate() - 1), new Date()]
  nextTick(() => {
    getDataListByInterval(item)
  })
}
const getDataListByInterval = (item) => {
  RealDataApi.getDataListByInterval({
    ts1: formatToDateTime(selectDate.value[0]),
    ts2: formatToDateTime(selectDate.value[1]),
    floodDeviceId: item.deviceId,
    interval: '1h',
  }).then((res: any) => {
    let xData: any[] = []
    let seriesData: any[] = []
    let unitData: any[] = []
    for (const key in res) {
      xData = res[key]?.map((item) => item.timeString)
      unitData.push(res[key]?.[0].unit)
      seriesData.push({
        name: res[key]?.[0].name,
        data: res[key]?.map((item) => item.logValue),
        type: 'line',
        smooth: true,
      })
    }
    setEchartsOptions(xData, seriesData, unitData)
  })
}
const setEchartsOptions = (xData, seriesData, unitData) => {
  echartsOptions.value = {
    color: ["#5858CC", "#00C94A", "#FF9900", "#FF0000"],
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
                          <span>${item.seriesName}: ${item.value} ${unitData[item.seriesIndex]}</span>
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
    series: seriesData,
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
  isLoading.value = false;
  getRealDataByRain()
};
const getRealDataByRain = () => {
  RealDataApi.getRealDataByRain().then(res => {
    keynoteList.value = res
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
.opt-box {
  position: absolute;
  top: 20px;
  right: 20px;
}

.info-card {
  width: 400px;
  position: absolute;
  left: 20px;
  top: calc(20px + 20px + 32px);
  z-index: 2;
  border-radius: 8px;
  background-color: #fff;
  padding: 20px;
  padding-top: 0;

  .warning {
    color: rgb(226, 62, 65);
    margin-top: 8px;
  }

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

  .at-title {
    display: flex;
    align-items: center;
    padding-top: 20px;

    :deep(.el-date-editor) {
      margin-left: 12px;
      width: 210px;
      flex: unset;
    }

    .el-icon {
      font-size: 18px;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }
    }

    .el-icon,
    .el-button {
      margin-left: auto;
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
