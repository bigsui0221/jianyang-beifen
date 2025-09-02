<template>
  <div class="card">
    <at-title title="城市内涝" />
    <div class="content">
      <div class="item">
        <div class="title">隧道水位</div>
        <Echart :options="echartsOptions"/>
      </div>
      <div class="item">
        <div class="title">内涝</div>
        <Echart :options="echartsOptions"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const echartsOptions = ref<any>({
  color: ['#3A7DFF', '#14C9C9', '#F7BA1E'],
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: 0,
    left: 'center',
    orient: 'horizontal',
    itemGap: 12,
    textStyle: {
      color: '#333',
      fontSize: 12
    },
  },
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '30%',
      style: {
        text: '总计',
        fontSize: 14,
        fill: '#333',
        textAlign: 'center',
        textVerticalAlign: 'middle',
      },
    },
    {
      type: 'text',
      left: 'center',
      top: '40%',
      style: {
        text: '645',
        fontSize: 20,
        fill: '#000',
        textAlign: 'center',
        textVerticalAlign: 'middle',
      },
    }
  ],
  series: [
    {
      type: 'pie',
      radius: ['55%', '70%'],
      center: ['50%', '40%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      }, // 高亮（hover）状态的标签配置
      emphasis: {
        label: {
          show: false,  // 关闭高亮时的中间文本
          fontSize: 0,  // 进一步确保文本不显示
          formatter: ''  // 清空文本内容
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 270, name: '正常' },
        { value: 20, name: '超保证' },
        { value: 5, name: '超警戒' },
      ]
    }
  ]
})
</script>
<style lang="scss" scoped>
.content {
  padding-top: 8px;
  display: flex;
  align-items: center;
  height: calc(100% - 24px);
  .item {
    width: 50%;
    height: 100%;

    &:first-child {
      border-right: 1px solid #E1E1E1;
    }

    .title {
      text-align: center;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
    }

    .v-echart {
      width: 100%;
      height: calc(100% - 24px);
    }
  }
}
</style>