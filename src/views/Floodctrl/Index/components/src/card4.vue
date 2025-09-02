<template>
  <div class="card">
    <el-radio-group v-model="radioValue">
      <el-radio-button label="雷达回波图" value="1" />
      <el-radio-button label="卫星云图" value="2" />
    </el-radio-group>
    <img :src="demo1" class="img" />
  </div>
</template>
<script lang="ts" setup>
import demo1 from '@/assets/imgs/floodctrl/scada/demo-1.png'
const radioValue = ref('1')
</script>
<style lang="scss" scoped>
.img {
  margin-top: 12px;
  width: 100%;
  height: calc(100% - 32px - 12px);
  object-fit: cover;
}
</style>