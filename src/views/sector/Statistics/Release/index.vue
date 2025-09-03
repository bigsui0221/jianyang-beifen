<template>
  <div class="echart-box">
    <div class="echart-card">
      <at-title title="预警区域统计" />
      <Echart :options="echartsOptions[0]" :height="350" />
    </div>
    <div class="echart-card">
      <at-title title="预警年度统计">
        <template #right>
          <at-select v-model="regionId2" :config="{ prop: 'regionId', onChange: onRegionId2Change }" />
        </template>
      </at-title>
      <Echart :options="echartsOptions[1]" :height="350" />
    </div>
    <div class="echart-card">
      <at-title title="响应区域统计" />
      <Echart :options="echartsOptions[2]" :height="350" />
    </div>
    <div class="echart-card">
      <at-title title="响应年度统计">
        <template #right>
          <at-select v-model="regionId4" :config="{ prop: 'regionId', onChange: onRegionId2Change }" />
        </template>
      </at-title>
      <Echart :options="echartsOptions[3]" :height="350" />
    </div>
  </div>
  <div class="table-box">
    <at-title title="通知记录" />
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </div>
</template>

<script lang="ts" setup>
import { DisasterWarnApi } from '@/api/Floodctrl/publish/disasterwarn'
import { DisasterResponseApi } from '@/api/Floodctrl/publish/disasterresponse'
import { DisasterNotifyUserApi } from '@/api/Floodctrl/publish/disasternotifyuser'

const atTableRef = ref()
const queryParams = reactive<any>({})
const queryFields = reactive({
  daterange: {
    label: '数据时间段',
    components: 'date',
    type: 'daterange',
    onChange: (val) => {
      queryParams.startTime = val[0]
      queryParams.endTime = val[1]
    }
  },
})
const tableConfig = reactive({
  api: DisasterNotifyUserApi.getDisasterNotifyUserPage,
  fields: {
    index: true,
    regionName: {
      label: '发布区域'
    },
    type: {
      label: '类型',
      formatter: (val) => {
        return val === 1 ? '预警' : '响应'
      }
    },
    levelName: {
      label: '等级'
    },
    name: {
      label: '标题'
    },
    createTime: {
      label: '通知时间',
      formatter: 'dateTime'
    },
    notifyType: {
      label: '通知方式',
      formatter: (val) => {
        return val === 1 ? '站内信' : val === 2 ? '短信' : '传真'
      }
    },
    nickname: {
      label: '接收单位'
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const regionId2 = ref('')
const regionId4 = ref('')
const echartsOptions = reactive<any>([{}, {}, {}, {}])

const setEchartsOptions = (index, data) => {
  echartsOptions[index] = {
    color: ["rgb(240, 72, 100)", "rgb(250 204 20)", 'rgb(255 255 0)', 'rgb(24, 144, 255)', 'rgb(47, 194, 91)', 'rgb(133, 67, 224)', 'rgb(133, 67, 224)'],
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      itemGap: 16,
      textStyle: {
        color: '#333',
        fontSize: 14
      },
    },
    series: [
      {
        name: '数量',
        type: 'pie',
        center: ['50%', '40%'],
        radius: '50%',
        data: data,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
        },
        hoverOffset: 5, // 缩小悬浮时的偏移量（默认10）
        emphasis: {
          animation: false,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}
const onRegionId2Change = () => {
  DisasterWarnApi.getDisasterWarnCountByLevel({
    regionId: regionId2.value
  }).then(res => {
    setEchartsOptions(1, res.map(item => {
      return { value: item.num, name: item.levelName }
    }))
  })
}
const onRegionId4Change = () => {
  DisasterResponseApi.getDisasterResponseCountByLevel({
    regionId: regionId4.value
  }).then(res => {
    setEchartsOptions(3, res.map(item => {
      return { value: item.num, name: item.levelName }
    }))
  })
}
onMounted(() => {
  DisasterWarnApi.getDisasterWarnCountByRegion().then(res => {
    setEchartsOptions(0, res.map(item => {
      return { value: item.num, name: item.regionName }
    }))
  })
  onRegionId2Change()
  DisasterResponseApi.getDisasterResponseCountByRegion().then(res => {
    setEchartsOptions(2, res.map(item => {
      return { value: item.num, name: item.regionName }
    }))
  })
  onRegionId4Change()
})
</script>
<style lang="scss" scoped>
.echart-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .echart-card {
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    width: calc(25% - 12px);

    .at-title {
      display: flex;
      align-items: center;

      .at-select {
        margin-left: auto;
        width: 200px;
      }
    }
  }
}

.table-box {
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  margin-top: 20px;

  .at-title {
    margin-bottom: 16px;
  }
}
</style>