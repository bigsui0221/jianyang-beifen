<template>
  <div class="monitoring-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h2>数据监控</h2>
          <p class="subtitle">实时数据监控与分析平台</p>
        </div>
      </template>
      
      <div class="content">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="metric-card">
              <div class="metric-content">
                <div class="metric-icon">📊</div>
                <div class="metric-info">
                  <div class="metric-value">{{ realTimeData.totalDevices }}</div>
                  <div class="metric-label">在线设备</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="metric-card">
              <div class="metric-content">
                <div class="metric-icon">📈</div>
                <div class="metric-info">
                  <div class="metric-value">{{ realTimeData.dataPoints }}</div>
                  <div class="metric-label">数据点数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="metric-card">
              <div class="metric-content">
                <div class="metric-icon">⚡</div>
                <div class="metric-info">
                  <div class="metric-value">{{ realTimeData.alerts }}</div>
                  <div class="metric-label">告警数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="metric-card">
              <div class="metric-content">
                <div class="metric-icon">🔄</div>
                <div class="metric-info">
                  <div class="metric-value">{{ realTimeData.uptime }}%</div>
                  <div class="metric-label">系统可用率</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <h3>实时数据流</h3>
              </template>
              <div class="chart-container">
                <div class="data-stream">
                  <div 
                    v-for="(item, index) in dataStream" 
                    :key="index"
                    class="stream-item"
                    :class="item.type"
                  >
                    <span class="stream-time">{{ item.time }}</span>
                    <span class="stream-value">{{ item.value }}</span>
                    <span class="stream-unit">{{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <h3>告警信息</h3>
              </template>
              <el-table :data="alertList" style="width: 100%" max-height="300">
                <el-table-column prop="time" label="时间" width="120" />
                <el-table-column prop="device" label="设备" />
                <el-table-column prop="message" label="告警信息" />
                <el-table-column prop="level" label="级别" width="80">
                  <template #default="scope">
                    <el-tag :type="getAlertType(scope.row.level)">
                      {{ scope.row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-card class="section-card">
          <template #header>
            <h3>监控大屏</h3>
          </template>
          <div class="monitoring-dashboard">
            <el-empty description="监控大屏加载中..." />
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const realTimeData = ref({
  totalDevices: 1247,
  dataPoints: 15680,
  alerts: 3,
  uptime: 99.8
})

const dataStream = ref([
  { time: '14:30:15', value: '23.5', unit: '°C', type: 'normal' },
  { time: '14:30:10', value: '45.2', unit: '%', type: 'warning' },
  { time: '14:30:05', value: '78.9', unit: 'm³/s', type: 'normal' },
  { time: '14:30:00', value: '12.3', unit: 'm', type: 'normal' },
  { time: '14:29:55', value: '156.7', unit: 'Pa', type: 'normal' }
])

const alertList = ref([
  {
    time: '14:25',
    device: '水位传感器-001',
    message: '水位超过警戒线',
    level: '高'
  },
  {
    time: '14:20',
    device: '温度传感器-003',
    message: '温度异常升高',
    level: '中'
  },
  {
    time: '14:15',
    device: '压力传感器-002',
    message: '压力值波动异常',
    level: '低'
  }
])

let timer: NodeJS.Timeout | null = null

const getAlertType = (level: string) => {
  const levelMap: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return levelMap[level] || 'info'
}

const updateRealTimeData = () => {
  // 模拟实时数据更新
  realTimeData.value.totalDevices += Math.floor(Math.random() * 3) - 1
  realTimeData.value.dataPoints += Math.floor(Math.random() * 10)
  realTimeData.value.uptime = 99.5 + Math.random() * 0.5
  
  // 添加新的数据流
  const now = new Date()
  const timeStr = now.toTimeString().slice(0, 8)
  const newData = {
    time: timeStr,
    value: (Math.random() * 100).toFixed(1),
    unit: '°C',
    type: Math.random() > 0.8 ? 'warning' : 'normal'
  }
  
  dataStream.value.unshift(newData)
  if (dataStream.value.length > 10) {
    dataStream.value.pop()
  }
}

onMounted(() => {
  // 启动实时数据更新
  timer = setInterval(updateRealTimeData, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.monitoring-page {
  padding: 20px;
}

.page-card {
  min-height: 600px;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.metric-card {
  margin-bottom: 20px;
}

.metric-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.metric-icon {
  font-size: 32px;
  margin-right: 16px;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.chart-container {
  height: 300px;
  overflow-y: auto;
}

.data-stream {
  padding: 10px;
}

.stream-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  background-color: #f5f7fa;
  border-left: 4px solid #409eff;
}

.stream-item.warning {
  border-left-color: #e6a23c;
  background-color: #fdf6ec;
}

.stream-item.danger {
  border-left-color: #f56c6c;
  background-color: #fef0f0;
}

.stream-time {
  font-size: 12px;
  color: #909399;
  width: 60px;
}

.stream-value {
  font-weight: bold;
  color: #303133;
  flex: 1;
  text-align: center;
}

.stream-unit {
  font-size: 12px;
  color: #606266;
  width: 40px;
  text-align: right;
}

.section-card {
  margin-top: 20px;
}

.section-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.monitoring-dashboard {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
