<template>
  <div class="content-wrap">
    <div class="left">
      <div class="card">
        <at-title title="雷达回波图" />
        <div class="search">
          查询时间：<el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" />
          <el-button type="primary" @click="onSearch">查询</el-button>
        </div>
        <div class="content">
          <div class="time-list">
            <div class="time-item" v-for="item, index in radarMapList" :key="index"
              :class="{ active: index === activeRadarMap }">
              {{ item.time }}</div>
          </div>
          <div class="img-box">
            <img :src="radarMapList?.[activeRadarMap]?.image" />
          </div>
        </div>
      </div>
      <div class="card weather">
        <at-title title="气象云图" />
        <div class="content">
          <div class="time-list">
            <div class="time-item" v-for="item, index in weatherList" :key="index"
              :class="{ active: index === activeWeatherTime }">
              {{ item.time }}</div>
          </div>
          <div class="img-box">
            <img :src="weatherList?.[activeWeatherTime]?.image" />
          </div>
        </div>
      </div>
    </div>
    <div class="right card">
      <at-title title="天气预报">
        <template #right>
          <el-radio-group v-model="radioValue">
            <el-radio-button label="24小时预报" value="24" />
            <el-radio-button label="72小时预报" value="72" />
          </el-radio-group>
        </template>
      </at-title>
      <div class="title">{{ radioValue }}小时天气预报</div>
      <div class="sub">
        <span>四川省气象台</span>
        <span>第25期</span>
        <span>{{ oneHourAgo }}</span>
      </div>
      <div class="content">
        <p>
          白天时段（上午至傍晚）：天气以多云为主，午后逐渐转为阴天，局部地区可能出现短暂小雨。气温在18°C至22°C之间波动，体感较为凉爽。东南风轻柔，风速约2-3级，湿度约80%。建议外出携带雨具以防突发降雨，紫外线强度中等，需注意防晒。
        </p>
        <p>夜间时段（傍晚至次日清晨）：阴天为主，小雨概率增加，雨势较小但持续时间较长。气温逐渐下降，最低至15°C左右，风力减弱，湿度升至90%左右，体感微凉。夜间出行建议增添薄外套，并注意路面湿滑。</p>
        <p>其他提示：空气质量指数（AQI）约为70，属于良好范围，但敏感人群仍需留意。降水可能导致能见度降低，驾车需保持安全车距。总体适宜室内活动，若外出请关注实时天气变化调整计划。</p>
        <p>
          白天时段（上午至傍晚）：天气以多云为主，午后逐渐转为阴天，局部地区可能出现短暂小雨。气温在18°C至22°C之间波动，体感较为凉爽。东南风轻柔，风速约2-3级，湿度约80%。建议外出携带雨具以防突发降雨，紫外线强度中等，需注意防晒。
        </p>
        <p>夜间时段（傍晚至次日清晨）：阴天为主，小雨概率增加，雨势较小但持续时间较长。气温逐渐下降，最低至15°C左右，风力减弱，湿度升至90%左右，体感微凉。夜间出行建议增添薄外套，并注意路面湿滑。</p>
        <p>其他提示：空气质量指数（AQI）约为70，属于良好范围，但敏感人群仍需留意。降水可能导致能见度降低，驾车需保持安全车距。总体适宜室内活动，若外出请关注实时天气变化调整计划。</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatToDate } from '@/utils/dateUtil'
import demo1 from '@/assets/imgs/floodctrl/scada/demo-1.png'

const dateRange = ref([])
const onSearch = () => {
  console.log(dateRange.value)
}
const activeRadarMap = ref(0)
const radarMapList = reactive<any[]>([])
const activeWeatherTime = ref(0)
const weatherList = reactive<any[]>([])

const radioValue = ref('24')

const getRadarMapList = () => {
  const yesterday = new Date();
  for (let i = 1; i < 10; i++) {
    yesterday.setDate(yesterday.getDate() - i);
    radarMapList.push({
      time: formatToDate(yesterday),
      image: demo1
    })
  }
}
const getWeatherList = () => {
  weatherList.push(...[{
    time: '24小时',
    image: demo1
  }, {
    time: '48小时',
    image: demo1
  }, {
    time: '72小时',
    image: demo1
  }, {
    time: '96小时',
    image: demo1
  },])
}

const oneHourAgo = computed(() => {
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
  return formatToDate(oneHourAgo, 'YYYY年MM月DD日hh时');
})
onMounted(() => {
  getRadarMapList()
  getWeatherList()
})
</script>

<style lang="scss" scoped>
.content-wrap {
  display: flex;

  .left {
    flex-shrink: 0;
    margin-right: 12px;
    width: 40%;

    .card {
      width: 100%;

      &+.card {
        margin-top: 12px;
      }
    }

    .search {
      margin-top: 16px;
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #333333;

      :deep(.el-date-editor) {
        width: 250px;
        flex: unset
      }

      .el-button {
        margin-left: auto;
      }
    }

    .content {
      margin-top: 20px;
      display: flex;
      width: 100%;

      .time-list {
        width: 160px;
        text-align: center;
        padding-bottom: 16px;

        .time-item {
          margin-top: 16px;
          font-weight: 400;
          font-size: 14px;
          color: #666666;

          &.active {
            color: #3A7DFF;
          }
        }
      }

      .img-box {
        width: calc(100% - 160px);

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .weather {
      .time-item {
        border-radius: 2px 2px 2px 2px;
        border: 1px solid #D9D9D9;
        padding: 0 20px;
        display: inline-flex;
        line-height: 32px;
      }
    }
  }

  .right {
    background-color: #fff;

    .at-title {
      .el-radio-group {
        margin-left: auto;
      }
    }

    .title {
      font-weight: 500;
      font-size: 28px;
      color: #E23E41;
      margin-top: 24px;
    }

    .sub {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      font-size: 14px;
      color: #333333;
      margin-top: 24px;
    }

    .content {
      margin-top: 16px;
      line-height: 25px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;

      p {
        margin: 0;
      }
    }
  }

  .card {
    background: #FFFFFF;
    border-radius: 8px 8px 8px 8px;
    padding: 20px;
  }
}
</style>
