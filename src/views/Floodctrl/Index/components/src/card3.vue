<template>
  <div class="card">
    <at-title title="河道水情" />
    <div class="content">
      <Echart :options="echartsOptions" :height="250"/>
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
    itemGap: 16,
    textStyle: {
      color: '#333',
      fontSize: 14
    },
  },
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '32%',
      style: {
        text: '总计',
        fontSize: 14,
        fill: '#333'
      },
      // 使文字基于自身中心对齐，方便居中
      textAlign: 'center',
      textVerticalAlign: 'middle',
    },
    {
      type: 'text',
      left: 'center',
      top: '40%',
      style: {
        text: '578',
        fontSize: 20,
        fill: '#000'
      },
      textAlign: 'center',
      textVerticalAlign: 'middle',
    }
  ],
  series: [
    {
      type: 'pie',
      radius: ['55%', '75%'],
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
        { value: 20, name: '超警戒' },
      ]
    }
  ]
})
</script>