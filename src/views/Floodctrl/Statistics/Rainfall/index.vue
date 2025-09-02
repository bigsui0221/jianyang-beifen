<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div class="search">
      数据时间段：
      <div class="tab" v-for="tab, index in tabs" :key="index" :class="{ active: activeTab === index }"
        @click="onTabClick(index)">
        <span>{{ tab.label }}</span>
        <div class="daterange" v-if="index == 6">
          <el-date-picker v-model="queryParams.date" type="daterange" />
        </div>
      </div>
      <el-select v-model="queryParams.type" placeholder="请选择">
        <el-option label="面雨量" value="1" />
        <el-option label="距平计算" value="2" />
        <el-option label="笼罩面积统计" value="3" />
      </el-select>
      <at-select v-model="queryParams.deptId" :config="{
        prop: 'deptId'
      }" />
    </div>
    <at-table-operation title="图表信息" :config="operationConfig" />

    <div class="content">
      <div class="content-1" v-if="queryParams.type === '1'">
        <img src="@/assets/imgs/floodctrl/statistics/demo-1.jpg" />
      </div>
      <div class="content-2" v-if="queryParams.type === '2'">
        <Echart :options="echartsOptions" :height="420" />
      </div>
      <div class="content-1" v-if="queryParams.type === '3'">
        <img src="@/assets/imgs/floodctrl/statistics/demo-1.jpg" />
      </div>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { Download } from '@element-plus/icons-vue'

const tabs = [{
  label: '24小时',
  value: []
}, {
  label: '3日',
  value: []
}, {
  label: '上旬',
  value: []
}, {
  label: '中旬',
  value: []
}, {
  label: '下旬',
  value: []
}, {
  label: '本月',
  value: []
}, {
  label: '自定义时间：',
  value: []
}]
const activeTab = ref(0)
const queryParams = reactive({
  date: [], type: '1', deptId: ''
})
const onTabClick = (index) => {
  activeTab.value = index
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
      name: '距平值',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    },
  ],
})
const operationConfig = reactive({
  download: {
    label: '下载图片',
    icon: Download,
    type: 'primary',
    click: () => {
      console.log('download')
    }
  }
})

</script>
<style lang="scss" scoped>
.search {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .tab {
    margin-right: 12px;
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;

    span {
      min-width: 66px;
      border-bottom: 1px solid transparent;
      margin-right: 12px;
    }

    &:hover,
    &.active {
      span {
        color: #409eff;
        border-color: #409eff;
      }
    }
  }

  :deep(.el-date-editor).el-input__wrapper,
  .el-select {
    width: 200px;
    margin-right: 12px;
  }
}
.content{
  text-align: center;
}
</style>
