<template>
  <div class="card">
    <at-title title="重点关注流量站">
      <template #right>
        <div class="title-right">
          当前站点：
          <el-select v-model="activeSite" placeholder="请选择站点" @change="onSiteChange">
            <el-option v-for="item, index in scrollList" :key="index" :label="item.siteName" :value="item.deviceId" />
          </el-select>
          <!-- <div class="scroll">
            <el-icon>
              <CaretLeft />
            </el-icon>
            <div class="scroll-list">
              <div class="scroll-item" v-for="item, index in scrollList" :key="index"
                :class="{ active: activeSite === index }" @click="onSiteClick(index)">{{ item.siteName }}</div>
            </div>
            <el-icon>
              <CaretRight />
            </el-icon>
          </div> -->
        </div>
      </template>
    </at-title>
    <div class="content">
      <Echart :options="echartsOptions" :height="240" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { RealDataApi } from '@/api/Floodctrl/scada/realdata'
import { SiteApi } from '@/api/Floodctrl/site'
import { formatToDateTime } from '@/utils/dateUtil'

const activeSite = ref(0)
const scrollList = ref<any[]>([])
const getSitePage = () => {
  SiteApi.getSitePage({ pageNo: 1, pageSize: 9999, siteType: 'KEY_SECTION_FLOW' }).then(res => {
    scrollList.value = res.list
    activeSite.value = scrollList.value[0].deviceId
    getDataListByInterval(scrollList.value[0].deviceId)
  })
}
const onSiteChange = (val) => {
  getDataListByInterval(val)
}
const echartsOptions = ref<any>({})
const setEchartsOptions = (xData, yData, seriesData, unitData) => {
  // 配置项
  echartsOptions.value = {
    grid: {
      top: 40,
      bottom: 30
    },
    // // 工具箱，可下载、切换等（可选）
    // toolbox: {
    //   feature: {
    //     saveAsImage: {} // 保存为图片
    //   }
    // },
    // 横轴（时间轴）
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        // 调整横轴文字大小，避免拥挤
        fontSize: 12
      },
      boundaryGap: false // 不留空白，让折线从左到右铺满
    },
    // 纵轴（双纵轴配置）
    yAxis: yData,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross' // 十字交叉线
      },
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
    // 系列数据（两条折线）
    series: seriesData
  };
}
const getDataListByInterval = (id) => {
  const selectDate = [new Date().setDate(new Date().getDate() - 1), new Date()]
  RealDataApi.getDataListByInterval({
    ts1: formatToDateTime(selectDate[0]),
    ts2: formatToDateTime(selectDate[1]),
    floodDeviceId: id,
    interval: '1h',
  }).then((res: any) => {
    let xData: any[] = []
    let yData: any[] = []
    let seriesData: any[] = []
    let unitData: any[] = []
    for (const key in res) {
      xData = res[key]?.map((item) => item.timeString)
      yData.push({
        // 左侧纵轴：流量
        type: 'value',
        name: `${res[key]?.[0].name}(${res[key]?.[0].unit})`,
        axisLabel: {
          formatter: '{value}'
        }
      })
      unitData.push(res[key]?.[0].unit)
      seriesData.push({
        name: res[key]?.[0].name,
        data: res[key]?.map((item) => item.logValue),
        type: 'line',
        smooth: true,
      })
    }
    setEchartsOptions(xData, yData, seriesData, unitData)
  })
}
onMounted(() => {
  getSitePage()
})
</script>
<style lang="scss" scoped>
.card {
  flex: 1;
}

.title-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  white-space: nowrap;

  .el-select {
    min-width: 170px;
    max-width: 350px;
  }

  .value {
    color: #3A7DFF;
  }

  .scroll {
    display: flex;
    align-items: center;

    .el-icon {
      background-color: #EDEDED;
      border-radius: 50%;
      padding: 2px;
      cursor: pointer;
    }

    .scroll-list {
      width: 200px;
      overflow-x: auto;
      white-space: nowrap;

      &::-webkit-scrollbar {
        display: none;
      }

      .scroll-item {
        display: inline-flex;
        margin: 0 5px;
        cursor: pointer;
        color: #999999;

        &.active {
          color: #3A7DFF;
        }
      }
    }
  }
}
</style>