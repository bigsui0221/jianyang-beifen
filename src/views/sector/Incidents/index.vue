
<template>
   <div id="mapContainer">
     <div class="panel-left">
       <div class="panel-container">
         <div class="container-header">
           <div class="header-icon"><i class="icon-supervision"></i></div>
           <h3>事件概况</h3>
         </div>
         <div class="container-content">
           <!-- TODO: 填充事件概况内容 -->
         </div>
       </div>
     </div>
     <div class="bottom-row">
       <div class="panel-left2">
         <div class="panel-container">
           <div class="container-header">
             <div class="header-icon"><i class="icon-warning"></i></div>
             <h3>消息通知</h3>
           </div>
           <div class="container-content">
             <!-- TODO: 填充消息通知内容 -->
           </div>
         </div>
       </div>
       <div class="panel-bottom">
         <div class="panel-container">
           <div class="container-header">
             <div class="header-icon"><i class="icon-list"></i></div>
             <h3>事件列表</h3>
           </div>
           <div class="container-content">
             <!-- TODO: 填充事件列表内容 -->
           </div>
         </div>
       </div>
     </div>
   </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { ref, shallowRef, onMounted } from 'vue'
import { initGisMap } from '@/utils/gis'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
// 事件页暂不展示 loading 蒙层


const initMap = async () => {
  console.log('初始化地图')
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  isLoading.value = false;
};

onMounted(() => {
  initMap()
})
</script>
<style lang="scss" scoped>
 #mapContainer {
    width: 100%;
    height: calc(100vh - 56px);
    position: relative;
    --bottom-panel-height: 340px;
    --panel-gap: 12px;
    --left-panel-width: 560px;
  }
 
  /* 复用 metrics 深色面板风格 */
  .panel-container {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
    backdrop-filter: blur(15px);
    border-radius: 12px;
    border: 2px solid rgba(74, 144, 226, 0.6);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .panel-container:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  .container-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    color: #e6f4ff;
  }
  .container-header h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
  }
  .container-content {
    padding: 12px 14px;
    flex: 1 1 auto;
    min-height: 0;
    color: #e6f4ff;
  }

  .panel-left {
    position: absolute;
    top: var(--panel-gap);
    left: var(--panel-gap);
    width: var(--left-panel-width);
    bottom: calc(var(--bottom-panel-height) + (var(--panel-gap) * 2));
    display: flex;
    flex-direction: column;
  }

  .bottom-row {
    position: absolute;
    left: var(--panel-gap);
    right: var(--panel-gap);
    bottom: var(--panel-gap);
    height: var(--bottom-panel-height);
    display: flex;
    gap: var(--panel-gap);
    align-items: stretch;
  }

  .panel-left2 {
    flex: 0 0 var(--left-panel-width);
    width: var(--left-panel-width);
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .panel-bottom {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
</style>
