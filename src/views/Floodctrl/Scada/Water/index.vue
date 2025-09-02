<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <el-button class="table-open" type="primary" >多站点对比</el-button>
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
        <img src="@/assets/imgs/floodctrl/scada/icon-31.png" alt="" />水库
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-32.png" alt="" />水文站
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-33.png" alt="" />水位雨量站
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-34.png" alt="" />水位站
      </div>
    </div>
  </div>
  <!-- 水位过程线 -->
  <Dialog v-model="dialogDotVisible" :title="dotDialogTitle" width="65%">
    <div class="dialog-search">
      数据时段：<el-date-picker v-model="selectDate" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
      <el-button type="primary" style="margin-left: auto;">下载图片</el-button>
    </div>
    <Echart :options="echartsDotOptions" :height="420" />
  </Dialog>
  <!-- 多站点对比 -->
  <Dialog v-model="dialogVisible" title="多站点对比" width="65%">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleTableSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" :title="isEcharts ? '图表信息' : '列表信息'">
      <template #right>
        <el-button plain type="primary" v-if="isEcharts" :icon="Tickets" @click="isEcharts = false">列表</el-button>
        <el-button plain type="primary" v-else :icon="DataLine" @click="isEcharts = true">图表</el-button>
      </template>
    </at-table-operation>
    <Echart :options="echartsOptions" :height="420" v-if="isEcharts" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" v-else />
  </Dialog>
  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.siteName" :theme="themeColor(item.siteType?.name)"
    :trigger="isDataChecked ? 'always' : 'hover'" @click="onMarkerClick(item)">
    <template #main>
      <!-- <div class="my-marker-info">
        <div class="item">
          <span class="name">类型：</span>
          <span class="value">{{ item.siteType?.desc }}</span>
        </div>
      </div> -->
      <div class="my-marker-info" v-for="data, dindex in item.dataList" :key="dindex">
        <div class="item">
          <span class="name">{{ data.pointName }}：</span>
          <span class="value">{{ data.value }}{{ data.pointUnit }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-31.png" alt=""
        v-if="item.siteType?.name == 'RESERVOIR'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-32.png" alt=""
        v-else-if="item.siteType?.name == 'WATER_HYDROLOGY'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-33.png" alt=""
        v-else-if="item.siteType?.name == 'WATER_RAIN_STATION'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-34.png" alt="" v-else />
    </template>
  </at-marker>
</template>

<script lang="ts" setup>
import { Download, DataLine, Tickets } from '@element-plus/icons-vue'
import { initGisMap, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'

import * as UserApi from '@/api/system/user'
import { RealDataApi } from '@/api/Floodctrl/scada/realdata';
import { formatToDateTime } from '@/utils/dateUtil';
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const isEcharts = ref<boolean>(false)
const refs = ref<any>({})
const keynoteList = ref<any[]>([])
const themeColor = (type) => {
  switch (type) {
    case 'RESERVOIR':
      return '#01949c'
    case 'RESERVOIR':
      return '#14a800'
    case 'RESERVOIR':
      return '#cd6bc0'
    default:
      return '#4fc3f7'
  }
}
const handleSearch = (data) => {
}
const dialogDotVisible = ref<boolean>(false)
const selectDate = ref<any[]>([])
const echartsDotOptions = ref({})
const dotDialogTitle = ref('水位过程线')
const onMarkerClick = (item) => {
  dialogDotVisible.value = true
  dotDialogTitle.value = item.siteName + '水位过程线'
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
    setDotEchartsOptions(xData, seriesData, unitData)
  })
}
const setDotEchartsOptions = (xData, seriesData, unitData) => {
  echartsDotOptions.value = {
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
const onTableOpen = () => {
  dialogVisible.value = true
}
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  value2: {
    label: '街道',
    components: 'select',
    dictType: 'ai_platform'
  },
  value3: {
    label: '区域',
    components: 'select',
    dictType: 'ai_platform'
  },
  value4: {
    label: '时间段',
    components: 'date',
    type: 'daterange'
  }
})
const tableConfig = reactive({
  api: UserApi.getUserPage,
  fields: {
    value1: {
      label: '站点'
    },
    value2: {
      label: '1:00'
    },
    value3: {
      label: '1:00'
    },
    value4: {
      label: '1:00'
    },
    value5: {
      label: '1:00'
    },
    value6: {
      label: '1:00'
    },
    value7: {
      label: '1:00'
    },
    value8: {
      label: '1:00'
    }
  }
})
const handleTableSearch = () => {
  atTableRef.value?.refresh()
}
const echartsOptions = reactive<any>({
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
      name: '降雨量',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    },
    {
      name: '降雨量',
      data: [20, 32, 10, 34, 290, 330, 320],
      type: 'line',
      smooth: true
    }
  ],
})
const operationConfig = reactive({
  export: {
    icon: Download,
    label: '下载',
    onClick: () => {

    }
  },
})
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
  RealDataApi.getRealDataByWaterLevel().then(res => {
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
.table-open {
  position: absolute;
  top: 20px;
  right: 20px;
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

.dialog-search {
  display: flex;
  align-items: center;

  :deep(.el-date-editor) {
    width: 250px;
    flex: unset
  }

  .el-button {
    margin-left: auto;
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
