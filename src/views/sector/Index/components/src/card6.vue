<template>
  <div class="card">
    <at-title title="城市内涝" />
    <div class="content">
      <div class="circle">
        <div class="item" v-for="item, index in list" :key="index" :style="{ '--color': item.color }">
          <div class="value">{{ item.value }}</div>
          <div class="label">{{ item.label }}</div>
        </div>
      </div>
      <div class="rect">
        <div class="item" v-for="item, index in list" :key="index"
          :style="{ 'background-color': item.color, width: getWidth(item) }"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const list = ref([{
  value: 32,
  label: '正常',
  color: "#3A7DFF"
}, {
  value: 3,
  label: '超警戒',
  color: '#F99100'
}, {
  value: 0,
  label: '超保证',
  color: "#E23E41"
}])
const getWidth = (item) => {
  return (item.value / list.value.reduce((pre, cur) => pre + cur.value, 0) * 100).toFixed(2) + '%'
}
</script>
<style lang="scss" scoped>
.content {
  height: calc(100% - 24px - 16px);
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .circle {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .item {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid var(--color);
      color: var(--color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &+.item {
        margin-left: 26px;
      }

      .value {
        font-size: 16px;
      }

      .label {
        font-size: 14px;
      }
    }
  }

  .rect {
    display: flex;
    align-items: center;

    .item {
      width: 100%;
      height: 10px;
      border-radius: 20px;

      &+.item {
        margin-left: 2px;
      }
    }
  }
}
</style>