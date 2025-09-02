<template>
  <div class="card">
    <at-title title="水库水情" />
    <div class="content">
      <div class="item" v-for="item, index in list" :key="index">
        <div class="value" :style="{ color: item.color }">{{ item.value }}</div>
        <Echart :options="getEchartsOptions(index)" :height="75" />
        <div class="label" :style="{ color: item.color }">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { hexToRgba } from '@/utils/gis'

const list = ref([{
  value: 270,
  label: '正常',
  color: '#3A7DFF'
},
{
  value: 4,
  label: '超汛限',
  color: '#F99100'
},
{
  value: 0,
  label: '超设计',
  color: '#A947FF'
},
{
  value: 0,
  label: '超校核',
  color: '#E23E41'
}])
const getEchartsOptions = (index) => {
  const color = list.value[index].color
  return {
    color: color,
    grid: {
      left: 0,
      right: 0,
      top: 40 - index * 10,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 29 }, (_, index) => index)
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: '水位',
        data: [100, 112, 125, 137, 150, 162, 175, 162, 150, 137, 125, 137, 150, 162, 175, 162, 150, 162, 175, 162, 150, 137, 125, 112, 100, 112, 125, 137, 150],
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
              offset: 0, color: getColor(color, 0.3) // 0% 处的颜色
            }, {
              offset: 1, color: getColor(color, 0.1) // 100% 处的颜色
            }],
            global: false
          }
        },
      },
    ],
  } as any
}
const getColor = (color, alpha = 1) => {
  let arr = hexToRgba(color, alpha)
  return `rgba(${arr[0]},${arr[1]},${arr[2]},${arr[3]})`
}
onMounted(() => {

})
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;

  .item {
    margin-top: 8px;
    text-align: center;
    width: calc(50% - 10px);

    .v-echart {
      width: 100%;
      border-right: 3px solid #E4E4E4;
      overflow: hidden;
      position: relative;

      &::before {
        display: block;
        content: "";
        width: 10px;
        height: 0;
        border-left: 0px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 80px solid #E4E4E4;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
      }
    }

    .value,
    .label {
      font-weight: 500;
      font-size: 14px;
    }
  }
}
</style>