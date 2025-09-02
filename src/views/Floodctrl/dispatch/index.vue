<template>
  <!-- 地图容器 -->
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`">
  </div> 
  
  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel">
    <!-- 调度资源概况 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-supervision"></i>
        </div>
        <h3>督导检查</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards">
          <div class="metric-card">
            <div class="card-label">督导检查总数</div>
            <div class="card-value">300件</div>
          </div>
          <div class="metric-card">
            <div class="card-label">无问题数量</div>
            <div class="card-value">269件</div>
          </div>
          <div class="metric-card">
            <div class="card-label">有问题数量</div>
            <div class="card-value">31件</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 未结案事件 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-rainfall"></i>
        </div>
        <h3>雨量分布</h3>
      </div>
      <div class="container-content">
        <div class="rainfall-content">
          <div class="rainfall-map">
            <div class="map-placeholder">地图区域</div>
          </div>
          <div class="rainfall-legend">
            <div class="legend-item">
              <span class="legend-label">无雨</span>
              <span class="legend-count">119</span>
            </div>
            <div class="legend-item highlight">
              <span class="legend-label">0-9</span>
              <span class="legend-count">69</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">10-24</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">25-49</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">50-99</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">100-249</span>
              <span class="legend-count">0</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">>=250</span>
              <span class="legend-count">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预警信息 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-warning"></i>
        </div>
        <h3>预警信息</h3>
      </div>
      <div class="container-content">
        <div class="warning-list">
          <div class="warning-item">
            <div class="warning-type">气象预警</div>
            <div class="warning-message">XXXXX暴雨红色预警</div>
            <div class="warning-tag red">红色预警</div>
            <div class="warning-time">2025/05/21 12:30:32</div>
          </div>
          <div class="warning-item">
            <div class="warning-type">山洪预警</div>
            <div class="warning-message">XXXXX山洪黄色预警</div>
            <div class="warning-tag yellow">黄色预警</div>
            <div class="warning-time">2025/05/21 12:30:32</div>
          </div>
          <div class="warning-item">
            <div class="warning-type">防汛预警</div>
            <div class="warning-message">XXXXX防汛橙色预警</div>
            <div class="warning-tag orange">橙色预警</div>
            <div class="warning-time">2025/05/21 12:30:32</div>
          </div>
          <div class="warning-item">
            <div class="warning-type">气象预警</div>
            <div class="warning-message">XXXXX暴雨红色预警</div>
            <div class="warning-tag red">红色预警</div>
            <div class="warning-time">2025/05/21 12:30:32</div>
          </div>
          <div class="warning-item">
            <div class="warning-type">气象预警</div>
            <div class="warning-message">XXXXX暴雨红色预警</div>
            <div class="warning-tag red">红色预警</div>
            <div class="warning-time">2025/05/21 12:30:32</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted } from 'vue'
import { initGisMap } from '@/utils/gis'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')


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
}

/* 悬浮面板样式 */
.floating-panel {
  position: absolute;
  top: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  
  &.left-panel {
    left: 20px;
    width: 400px;
  }
}

/* 容器样式 - 深色主题 */
.panel-container {
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

/* 容器头部 - 深色主题 */
.container-header {
  background: linear-gradient(90deg, rgba(74, 144, 226, 0.9) 0%, rgba(74, 144, 226, 0.6) 30%, rgba(74, 144, 226, 0.3) 60%, rgba(74, 144, 226, 0.1) 80%, transparent 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(74, 144, 226, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  
  /* 添加一个额外的渐变层来增强效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(53, 122, 189, 0.4) 0%, rgba(53, 122, 189, 0.2) 50%, transparent 100%);
    pointer-events: none;
  }
  
  .header-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    z-index: 1;
    
    i {
      width: 16px;
      height: 16px;
      background: none;
      border-radius: 2px;
      
      &.icon-supervision::before {
        content: "🔍";
        color: #4A90E2;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-rainfall::before {
        content: "🌧️";
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-warning::before {
        content: "⚠️";
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
  }
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
    position: relative;
    z-index: 1;
  }
}

/* 容器内容 */
.container-content {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
}

/* 督导检查 - 指标卡片样式 */
.metric-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-card {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(53, 122, 189, 0.3) 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 2px solid rgba(74, 144, 226, 0.4);
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.6);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .card-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .card-value {
    font-size: 28px;
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

/* 雨量分布样式 */
.rainfall-content {
  display: flex;
  gap: 20px;
}

.rainfall-map {
  flex: 1;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.2) 100%);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 144, 226, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  
  .map-placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
}

.rainfall-legend {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  
  &.highlight {
    .legend-label {
      color: #4A90E2;
    }
  }
  
  .legend-label {
    font-size: 12px;
    color: white;
  }
  
  .legend-count {
    font-size: 12px;
    color: white;
    font-weight: 600;
  }
}

/* 预警信息样式 */
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-item {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.2) 100%);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateX(4px);
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .warning-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .warning-message {
    font-size: 14px;
    color: white;
    font-weight: 500;
  }
  
  .warning-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    width: fit-content;
    
    &.red {
      background: #FF4D4F;
    }
    
    &.yellow {
      background: #FAAD14;
    }
    
    &.orange {
      background: #FF7A00;
    }
  }
  
  .warning-time {
    font-size: 11px;
    color: #999;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-panel {
    &.left-panel {
      width: 350px;
    }
  }
  
  .rainfall-content {
    flex-direction: column;
  }
  
  .rainfall-legend {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .floating-panel {
    &.left-panel {
      left: 10px;
      width: calc(100% - 20px);
    }
  }
  
  .container-header {
    padding: 12px 16px;
    
    h3 {
      font-size: 14px;
    }
  }
  
  .container-content {
    padding: 16px;
  }
  
  .metric-card {
    padding: 16px;
    
    .card-value {
      font-size: 20px;
    }
  }
}
</style>
