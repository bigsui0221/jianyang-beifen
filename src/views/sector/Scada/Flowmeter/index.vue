<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
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
        <img src="@/assets/imgs/floodctrl/scada/icon-21.png" alt="" />供水取水量
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-22.png" alt="" />渠道流量
      </div>
      <div class="item">
        <img src="@/assets/imgs/floodctrl/scada/icon-23.png" alt="" />重要断面流量
      </div>
    </div>
  </div>

  <Dialog v-model="dialogVisible" :title="dialogTitle" width="65%">
    <div class="dialog-search">
      <div>数据时段：</div>
      <el-date-picker v-model="selectDate" type="daterange" placeholder="选择日期" />
      <el-button type="primary" @click="onDownLoadImages">下载图片</el-button>
    </div>
    <Echart :options="echartsOptions" :height="420" v-if="dialogVisible" />
  </Dialog>

  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.siteName" :theme="themeColor(item.siteType?.name)" :trigger="isDataChecked ? 'always' : 'hover'"
    @click="onMarkerClick(item)">
    <template #main>
      <div class="my-marker-info" v-for="data, dindex in item.dataList" :key="dindex">
        <div class="item">
          <span class="name">{{ data.pointName }}：</span>
          <span class="value">{{ data.value }}{{ data.pointUnit }}</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-21.png" alt=""
        v-if="item.siteType?.name == 'WATER_SUPPLY_AND_WITHDRAWAL'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-22.png" alt=""
        v-else-if="item.siteType?.name == 'CHANNEL_FLOW'" />
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/scada/icon-23.png" alt="" v-else />
    </template>
  </at-marker>
</template>

<script lang="ts" setup>
import { RealDataApi } from '@/api/Floodctrl/scada/realdata';
import { formatToDateTime } from '@/utils/dateUtil';
import { initGisMap, popups, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDataChecked = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const dialogTitle = ref<string>('监测站流量过程线')
const refs = ref<any>({})
const selectDate = ref<any>([])
const keynoteList = ref<any[]>([])
const themeColor = (type) => {
  switch (type) {
    case 'WATER_SUPPLY_AND_WITHDRAWAL':
      return '#058bad'
    case 'CHANNEL_FLOW':
      return '#009d73'
    default:
      return '#5f57b7'
  }
}
const handleSearch = (data) => {
}

const onMarkerClick = (item) => {
  dialogTitle.value = (item.siteName ?? '') + '流量过程线'
  dialogVisible.value = true
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
const onDownLoadImages = () => {

}

const echartsOptions = ref<any>({})

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
  getRealDataByFlow()
};
const getRealDataByFlow = () => {
  RealDataApi.getRealDataByFlow().then(res => {
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
