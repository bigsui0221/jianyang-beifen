<template>
  <div class="venues-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h2>场所保障</h2>
          <p class="subtitle">重要场所安全监控与保障管理</p>
        </div>
      </template>
      
      <div class="content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="venue-card">
              <template #header>
                <div class="venue-header">
                  <h3>🏛️ 政府大楼</h3>
                  <el-tag type="success">正常</el-tag>
                </div>
              </template>
              <div class="venue-info">
                <div class="info-item">
                  <span class="label">安全等级:</span>
                  <span class="value">A级</span>
                </div>
                <div class="info-item">
                  <span class="label">人员数量:</span>
                  <span class="value">1,234人</span>
                </div>
                <div class="info-item">
                  <span class="label">监控设备:</span>
                  <span class="value">45台</span>
                </div>
                <div class="info-item">
                  <span class="label">最后检查:</span>
                  <span class="value">2小时前</span>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="venue-card">
              <template #header>
                <div class="venue-header">
                  <h3>🏥 医院</h3>
                  <el-tag type="warning">注意</el-tag>
                </div>
              </template>
              <div class="venue-info">
                <div class="info-item">
                  <span class="label">安全等级:</span>
                  <span class="value">A级</span>
                </div>
                <div class="info-item">
                  <span class="label">人员数量:</span>
                  <span class="value">2,567人</span>
                </div>
                <div class="info-item">
                  <span class="label">监控设备:</span>
                  <span class="value">78台</span>
                </div>
                <div class="info-item">
                  <span class="label">最后检查:</span>
                  <span class="value">30分钟前</span>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="venue-card">
              <template #header>
                <div class="venue-header">
                  <h3>🏫 学校</h3>
                  <el-tag type="success">正常</el-tag>
                </div>
              </template>
              <div class="venue-info">
                <div class="info-item">
                  <span class="label">安全等级:</span>
                  <span class="value">B级</span>
                </div>
                <div class="info-item">
                  <span class="label">人员数量:</span>
                  <span class="value">3,456人</span>
                </div>
                <div class="info-item">
                  <span class="label">监控设备:</span>
                  <span class="value">92台</span>
                </div>
                <div class="info-item">
                  <span class="label">最后检查:</span>
                  <span class="value">1小时前</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider />

      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const venueList = ref([
  {
    name: '市政府大楼',
    type: '政府机关',
    securityLevel: 'A级',
    personnel: '1,234',
    status: '正常',
    lastCheck: '2小时前'
  },
  {
    name: '市人民医院',
    type: '医疗机构',
    securityLevel: 'A级',
    personnel: '2,567',
    status: '注意',
    lastCheck: '30分钟前'
  },
  {
    name: '市第一中学',
    type: '教育机构',
    securityLevel: 'B级',
    personnel: '3,456',
    status: '正常',
    lastCheck: '1小时前'
  },
  {
    name: '市体育馆',
    type: '体育场馆',
    securityLevel: 'B级',
    personnel: '890',
    status: '正常',
    lastCheck: '3小时前'
  },
  {
    name: '市博物馆',
    type: '文化场所',
    securityLevel: 'A级',
    personnel: '156',
    status: '正常',
    lastCheck: '4小时前'
  }
])

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '正常': 'success',
    '注意': 'warning',
    '异常': 'danger'
  }
  return statusMap[status] || 'info'
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.venues-page {
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

.venue-card {
  margin-bottom: 20px;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.venue-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.venue-info {
  padding: 10px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 4px 0;
}

.info-item .label {
  color: #606266;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.section-card {
  margin-top: 20px;
}

.section-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}
</style>
