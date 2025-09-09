<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>

  <!-- 左侧悬浮区域（占位版） -->
  <div class="floating-panel left-panel">
    <div class="left-panel-header" @click="goBack">
      <span class="back-arrow">←</span>
      <span class="header-title">XXXX重点场所</span>
    </div>
    <div class="panel-container">
      <div class="container-header"><h3>雨情检测</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
    <div class="panel-container">
      <div class="container-header"><h3>隧道水位监测</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
    <div class="panel-container">
      <div class="container-header"><h3>河道水位监测</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
    <div class="panel-container">
      <div class="container-header"><h3>内涝水位监测</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
  </div>

  <!-- 右侧悬浮区域（占位版） -->
  <div class="floating-panel right-panel">
    <div class="panel-container">
      <div class="container-header"><h3>监测数据</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
    <div class="panel-container">
      <div class="container-header"><h3>供排水重点场所</h3></div>
      <div class="container-content"><div class="table-wrapper">-</div></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted, onUnmounted } from 'vue'
import { initGisMap } from '@/utils/gis'
import { useRouter } from 'vue-router'

const gisMap = shallowRef<any>(null)
const mapView = shallowRef<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const router = useRouter()
const goBack = () => {
  router.push({ name: 'Venues' })
}

onMounted(async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  mapView.value = view
  gisMap.value = map
  isLoading.value = false
})

onUnmounted(() => {
  // 可按需清理地图资源
})
</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: calc(100vh - 56px);
  position: relative;
}
.floating-panel {
  position: absolute;
  top: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px);
  overflow-y: auto;
}
.floating-panel.left-panel { left: 20px; width: 560px; }
.floating-panel.right-panel { right: 20px; width: 560px; }
.left-panel-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(10,30,60,0.6); border: 1px solid rgba(74,144,226,0.35); border-radius: 8px; cursor: pointer; }
.left-panel-header .back-arrow { font-size: 18px; color: #cfe6ff; }
.left-panel-header .header-title { color: #e6f4ff; font-weight: 700; }
.panel-container {
  background: linear-gradient(180deg, rgba(17, 50, 92, 0.65) 0%, rgba(10, 30, 60, 0.6) 100%);
  border: 1px solid rgba(74, 144, 226, 0.35);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-container.flex-1 { flex: 1; }
.panel-container.flex-2 { flex: 2; }
.panel-container.flex-3 { flex: 3; }
.panel-container .container-header {
  padding: 12px 14px; color: #e6f4ff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(90deg, rgba(53, 122, 189, 0.22) 0%, rgba(53, 122, 189, 0.12) 60%, transparent 100%);
}
.panel-container .container-content { padding: 12px; flex: 1; overflow: auto; }
.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { height: 100%; }
.rainfall-content { display: flex; gap: 12px; }
.rainfall-map { flex: 1; min-height: 160px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.rainfall-legend { width: 160px; display: flex; flex-direction: column; gap: 8px; }
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }
.floating-panel {
  position: absolute;
  top: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px);
  overflow-y: auto;
}
.floating-panel.left-panel { left: 20px; width: 560px; }
.floating-panel.right-panel { right: 20px; width: 560px; }
.panel-container {
  background: linear-gradient(180deg, rgba(17, 50, 92, 0.65) 0%, rgba(10, 30, 60, 0.6) 100%);
  border: 1px solid rgba(74, 144, 226, 0.35);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-container.flex-1 { flex: 1; }
.panel-container.flex-2 { flex: 2; }
.panel-container.flex-3 { flex: 3; }
.panel-container .container-header {
  padding: 12px 14px; color: #e6f4ff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(90deg, rgba(53, 122, 189, 0.22) 0%, rgba(53, 122, 189, 0.12) 60%, transparent 100%);
}
.panel-container .container-content { padding: 12px; flex: 1; overflow: auto; }
.right-panel { gap: 12px; }
.right-panel > .panel-container { flex: 1 1 0; min-height: 0; }
.table-wrapper { height: 100%; }
.rainfall-content { display: flex; gap: 12px; }
.rainfall-map { flex: 1; min-height: 160px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; }
.rainfall-legend { width: 160px; display: flex; flex-direction: column; gap: 8px; }
.rainfall-legend .legend-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; }
</style>


