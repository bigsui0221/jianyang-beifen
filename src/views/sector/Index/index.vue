<template>
  <div class="content-wrap">
    <div class="row">
      <Card1 />
      <Card2 />
      <Card3 />
      <Card4 />
    </div>
    <div class="row">
      <Card5 />
      <Card6 />
      <Card7 />
    </div>
    <div class="row">
      <at-tabs v-model="activeTab" :tabs="tableTabs" />
      <component :is="tableTabs[activeTab].component" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Card1 from './components/src/card1.vue';
import Card2 from './components/src/card2.vue';
import Card3 from './components/src/card3.vue';
import Card4 from './components/src/card4.vue';
import Card5 from './components/src/card5.vue';
import Card6 from './components/src/card6.vue';
import Card7 from './components/src/card7.vue';
import Table1 from './components/src/table1.vue';
import Table2 from './components/src/table2.vue';
import Table3 from './components/src/table3.vue';
import Table4 from './components/src/table4.vue';
import Table5 from './components/src/table5.vue';
import Table6 from './components/src/table6.vue';

const activeTab = ref('0');
const tableTabs = [
  { label: '雨情', value: '0', component: Table1 },
  { label: '河道水情', value: '1', component: Table2 },
  { label: '水库水情', value: '2', component: Table3 },
  { label: '隧道水位', value: '3', component: Table4 },
  { label: '流量', value: '4', component: Table5 },
  { label: '内涝', value: '5', component: Table6 },
];
</script>
<style lang="scss" scoped>
.row {
  display: flex;
  align-items: stretch;

  &+.row {
    margin-top: 16px;
  }

  &:nth-child(1) {
    .card {
      height: 320px;
      flex-shrink: 0;

      &:nth-child(1) {
        width: 350px;
      }

      &:nth-child(2) {
        width: calc((100% - 350px) /10* 3.5 - 16px)
      }

      &:nth-child(3) {
        width: calc((100% - 350px) /10* 3 - 16px)
      }

      &:nth-child(4) {
        width: calc((100% - 350px) /10* 3.5 - 16px)
      }

      &+.card {
        margin-left: 16px;
      }
    }
  }

  &:nth-child(2) {
    .card {
      height: 300px;
      flex-shrink: 0;

      &:nth-child(1) {
        width: 35%;
      }

      &:nth-child(2) {
        width: calc(25% - 16px)
      }

      &:nth-child(3) {
        width: calc(40% - 16px)
      }
    }
  }

  &:nth-child(3) {
    background-color: #fff;
    border-radius: 8px;
    flex-direction: column;

    :deep(.at-tabs) {
      padding: 16px 20px 0;
      border-bottom: 1px solid #EDEDED;

      .el-card__body {
        padding-bottom: 0px;
      }
    }
  }

  .card {
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;

    &+.card {
      margin-left: 16px;
    }
  }
}
</style>
