<template>
  <div class="content">
    <div class="head-content">
      <div class="head-card">
        <div style="font-size: 16px;color: #a3a1a1 ;">物品总数</div>
        <div style="font-size: 36px;font-weight: 500;">{{ materialsSums }}</div>
      </div>
      <div class="head-card">
        <div style="font-size: 16px;color: #a3a1a1 ;">仓库总数</div>
        <div style="font-size: 36px;font-weight: 500;">{{ warehouseSums }}</div>
      </div>
      <div class="head-card">
        <div style="font-size: 16px;color: #a3a1a1 ;">今日入库物资</div>
        <div style="font-size: 36px;font-weight: 500;">{{ inMaterialsSums }}</div>
      </div>
      <div class="head-card">
        <div style="font-size: 16px;color: #a3a1a1 ;">今日出库物资</div>
        <div style="font-size: 36px;font-weight: 500;">{{ outMaterialsSums }}</div>
      </div>
    </div>
    <div class="inout-data">
      <div class="data-head">
        <div class="data-title">出入库统计</div>
        <div class="data-time">
          <el-date-picker v-model="value1" type="monthrange" range-separator="~" start-placeholder="开始月份"
            end-placeholder="结束月份" class="date-picker" @change="handleDateChange"/>
          <div class="data-download">下载</div>
        </div>
      </div>
      <Echart :options="echartsOptions2" :height="420" />

    </div>

    <div class="inout-data">
      <div class="data-head">
        <div class="data-title">仓库统计</div>
        <div class="data-time">
          <!-- <el-date-picker
            v-model="value1"
            type="monthrange"
            range-separator="~"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            class="date-picker"
          /> -->
          <div class="data-download" style="flex:1">下载</div>
        </div>
      </div>
      <Echart :options="echartsOptions1" :height="420" />
    </div>
    <div class="inout-data">
      <div class="data-head">
        <div class="data-title">行政区划</div>
        <div class="data-time">
          <!-- <el-date-picker
            v-model="value1"
            type="monthrange"
            range-separator="~"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            class="date-picker"

          /> -->
          <div class="data-download" style="flex:1">下载</div>
        </div>
      </div>
      <Echart :options="echartsOptions3" :height="420" />

    </div>
  </div>
</template>

<script setup>
import { WarehouseApi } from '@/api/Floodctrl/warehouse'
import { MaterialsApi } from '@/api/Floodctrl/materials'
const value1 = ref('')
const value2 = ref('')

const shortcuts = [
  {
    text: 'This month',
    value: [new Date(), new Date()],
  },
  {
    text: 'This year',
    value: () => {
      const end = new Date()
      const start = new Date(new Date().getFullYear(), 0)
      return [start, end]
    },
  },
  {
    text: 'Last 6 months',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    },
  },
]
const warehouseSums = ref(0)
const materialsSums = ref()
const inMaterialsSums = ref()
const outMaterialsSums = ref()
const inoutMaterialsStats = ref([])
const warehouseInoutMaterialsStats = ref([])
const warehouseMaterialsPercentageStats = ref([])

const arr = reactive([])
const echartsOptions2 = reactive({
  color: ["#5858CC", "#00C94A"],
  grid: {
    left: 40,
    right: 20,
    top: 40,
    bottom: 60
  },
  legend: {
    icon: "rect",
    top: 0,
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
    boundaryGap: true,
    data: Array.from({ length: 12 }, (_, index) => index)
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      if (params.length === 0) return '';
      const fullXText = params[0].name;
      let result = `<div style="font-weight: bold; margin-bottom: 5px;">${fullXText}月</div>`;
      params.forEach(item => {
        result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 5px;"></span>
                          <span>${item.seriesName}: ${item.value}</span>
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
      name: '出库',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'bar',
    },
    {
      name: '入库',
      data: [20, 32, 10, 34, 290, 330, 320],
      type: 'bar',
    }
  ],
})

const echartsOptions1 = reactive({
  color: ["#5858CC", "#00C94A"],
  grid: {
    left: 40,
    right: 20,
    top: 40,
    bottom: 60
  },
  legend: {
    icon: "rect",
    top: 0,
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
    boundaryGap: true,
    data: Array.from({ length: 12 }, (_, index) => index)
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      if (params.length === 0) return '';
      const fullXText = params[0].name;
      let result = `<div style="font-weight: bold; margin-bottom: 5px;">${fullXText}月</div>`;
      params.forEach(item => {
        result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 5px;"></span>
                          <span>${item.seriesName}: ${item.value} </span>
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
      name: '出库',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'bar',
      barWidth: '5%'
    },
    {
      name: '入库',
      data: [20, 32, 10, 34, 290, 330, 320],
      type: 'bar',
      barWidth: '5%'
    }
  ],
})

const echartsOptions3 = reactive({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      name: '类型数量',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          formatter: '{b}: {c} ({d}%)'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '高新区' },
        { value: 735, name: '锦江区' },
        { value: 580, name: '青羊区' },
        { value: 484, name: '金牛区' },
        { value: 300, name: '武侯区' },
        { value: 300, name: '天府新区' }
      ]
    }
  ]
})

// const handleDateChange = (value) => { 
//   console.log(value);
//   console.log(value1.value);
//   const date = new Date(value1.value[0]);
//   const timestamp = date.getTime(); // 返回毫秒时间戳
//   console.log(timestamp);
  
// }
// 在你的 script setup 中添加以下方法
const getMonthRangeTimestamps = () => {
  const now = new Date()
  // 当前月份第一天
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  // 12个月前的第一天
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  
  return {
    startTime: twelveMonthsAgo.getTime(),
    endTime: currentMonthStart.getTime()
  }
}

// 时间处理方法
const handleDateChange = (value) => {
  if (value && value.length === 2) {
    // 处理开始月份
    const startDate = new Date(value[0])
    const startOfMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1, 
      0, 0, 0, 0
    )
    
    // 处理结束月份 - 设置为最后一天 23:59:59
    const endDate = new Date(value[1])
    const endOfMonth = new Date(
      endDate.getFullYear(), 
      endDate.getMonth() + 1,
      0, 
      23, 59, 59, 999
    )
    
    const startTime = startOfMonth.getTime()
    const endTime = endOfMonth.getTime()
    
    console.log('查询时间范围:')
    console.log('从:', startOfMonth.toLocaleString())
    console.log('到:', endOfMonth.toLocaleString())
    
    // 调用API获取数据
    fetchInoutMaterialsStats(startTime, endTime)
  }
}

//开始月1日0点到结束月1日0点

// const handleDateChange = (value) => {
//   console.log(value)
//   console.log(value1.value)
  
//   if (value && value.length === 2) {
//     // 开始时间
//     const startDate = new Date(value[0])
//     const startTimestamp = startDate.getTime()
    
//     // 结束时间
//     const endDate = new Date(value[1])
//     const endTimestamp = endDate.getTime()
    
//     console.log('开始时间戳:', startTimestamp)
//     console.log('结束时间戳:', endTimestamp)
    
//     // 调用API获取数据
//     fetchInoutMaterialsStats(startTimestamp, endTimestamp)
//   } else {
//     // 如果没有选择日期，使用默认范围：当年1月1日到当前时间
//     const now = new Date()
//     const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    
//     const startTime = startOfYear.getTime()
//     const endTime = now.getTime()
    
//     fetchInoutMaterialsStats(startTime, endTime)
//   }
// }

//默认12个月前1日0点到结束月1日0点

// const handleDateChange = (value) => {
//   console.log(value)
//   console.log(value1.value)
  
//   if (value && value.length === 2) {
//     // 开始月份
//     const startDate = new Date(value[0])
//     const startTimestamp = new Date(startDate.getFullYear(), startDate.getMonth(), 1).getTime()
    
//     // 结束月份
//     const endDate = new Date(value[1])
//     const endTimestamp = new Date(endDate.getFullYear(), endDate.getMonth(), 1).getTime()
    
//     console.log('开始时间戳:', startTimestamp)
//     console.log('结束时间戳:', endTimestamp)
    
//     // 调用API获取数据
//     fetchInoutMaterialsStats(startTimestamp, endTimestamp)
//   } else {
//     // 如果没有选择日期，使用默认的12个月范围
//     const { startTime, endTime } = getMonthRangeTimestamps()
//     fetchInoutMaterialsStats(startTime, endTime)
//   }
// }

// 获取出入库统计数据
const fetchInoutMaterialsStats = (startTime, endTime) => {
  MaterialsApi.inoutMaterialsStat({
    startTime: startTime,
    endTime: endTime
  }).then(res => {
    inoutMaterialsStats.value = res
    console.log(res)
    
    // 更新图表数据
    updateChartOptions(res)
  })
}

// 更新图表选项
const updateChartOptions = (data) => {
  // 处理x轴数据（月份）
  const xAxisData = data.map(item => {
    const date = new Date(item.month)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
  })
  
  // 处理入库数据
  const inData = data.map(item => item.inTotal || 0)
  
  // 处理出库数据
  const outData = data.map(item => item.outTotal || 0)
  
  // 更新图表配置
  echartsOptions2.xAxis.data = xAxisData
  echartsOptions2.series[0].data = outData // 出库
  echartsOptions2.series[1].data = inData  // 入库
}
onBeforeMount(() => {
  // WarehouseApi.warehouseSum().then((res) => { 
  //   console.log(res);
  //   warehouseSums.value = res
  // })

  // 设置默认日期范围为最近12个月
  // const now = new Date()
  // const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  // const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // 设置默认日期范围为当年1月1日到当前时间
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1) // 默认就是 00:00:00
  startOfYear.setHours(0, 0, 0, 0) // 确保时间为 00:00:00.000
  
  // 设置默认日期选择
  value1.value = [startOfYear, now]
  
  // 设置默认日期选择
  // value1.value = [twelveMonthsAgo, currentMonth]

  // 获取初始数据
  handleDateChange(value1.value)

  MaterialsApi.materialsSum().then((res) => {
    materialsSums.value = res
    console.log(res);
  })
  MaterialsApi.todayInMaterialsSum().then((res) => {
    inMaterialsSums.value = res
    console.log(res);
  })
  MaterialsApi.todayOutMaterialsSum().then((res) => {
    outMaterialsSums.value = res
    console.log(res);
  })
  // 时间戳
  // MaterialsApi.inoutMaterialsStat({startTime: '2025-07-01', endTime: '202-08-31'}).then(res=>{
  //   inoutMaterialsStats.value = res
  //   console.log(res);

  // })
  MaterialsApi.warehouseInoutMaterialsStat().then(res => {
    warehouseInoutMaterialsStats.value = res
    const xAxisData = res.map(item => {
      return item.warehouseName
    })
    // 处理入库数据
    const inData = res.map(item => item.inTotal || 0)
    
    // 处理出库数据
    const outData = res.map(item => item.outTotal || 0)
    
    // 更新图表配置
    echartsOptions1.xAxis.data = xAxisData
    echartsOptions1.series[0].data = outData // 出库
    echartsOptions1.series[1].data = inData  // 入库
    console.log(res);

  })
  MaterialsApi.warehouseMaterialsPercentageStat().then(res => {
    warehouseMaterialsPercentageStats.value = res
    // console.log(res);
    // 更新饼图数据
    updatePieChartOptions(res)
  })
})
// 更新饼图选项
const updatePieChartOptions = (data) => {
  echartsOptions3.series[0].data = data.map(item => ({
    value: item.percentage,
    name: item.deptName
  }))
}
</script>

<style scoped>
.content {

  width: 100%;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin: 0 auto;
  padding: 20px;
}

.head-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 100%;
  height: 150px;
}

.head-card {
  height: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: 1px solid #dadada;
  margin: 10px;
  border-radius: 5px;

}

.inout-data {
  width: 100%;
  height: 500px;
  margin: 20px 0;
  padding: 10px;
}

.data-head {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100px;
  padding: 10px;
  margin: 20px 0;
  border-bottom: 1px solid rgb(219, 219, 219);
}

.data-title {
  font-size: 24px;
  color: rgb(0, 193, 252);
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.data-time {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.data-download {
  width: 50%;
  display: flex;
  justify-content: flex-end;
  color: rgb(0, 193, 252);
}

.echartdom {
  width: 100%;
  height: 400px;
  /* background-color: aquamarine; */
}
</style>