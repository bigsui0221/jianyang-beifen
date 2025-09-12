<template>
  <!-- 地图容器 -->
  <div id="mapContainer">
  </div>
  
  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicSecurity'">
    <!-- 督导检查 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="实时天气" class="title-icon" />
        </div>
        <h3>实时天气</h3>
      </div>
      <div class="container-content">
    
      </div>
    </div>
    
    <!-- 雨量分布 -->
    <div class="panel-container flex-2">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="雨量分布" class="title-icon" />
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
    <div class="panel-container flex-3 right3-panel">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="预警信息" class="title-icon" />
        </div>
        <h3>预警信息</h3>
      </div>
      <div class="container-content">
        <div class="warning-list">
          <div
            class="warning-item"
            v-for="(item, idx) in metricsState.flowDistribution"
            :key="idx"
          >
            <div class="warning-main">
              <div class="warning-type">{{ item.warningTitle }}</div>
              <div class="warning-message">{{ item.warningContent }}</div>
            </div>
            <div class="warning-meta">
              <div class="warning-tag" :class="getWarningTagClass(item.warningLevel?.name)">
                {{ item.warningLevel?.desc || '-' }}
              </div>
              <div class="warning-time">{{ formatTime(item.warningTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共管理：左侧占位 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicManagement'">
    <!-- 污水处理检测 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="污水处理检测" class="title-icon" />
        </div>
        <h3>污水处理检测</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards row-cards">
          <div class="metric-card">
            <div class="card-label">污水站总数</div>
            <div class="card-value">{{ metricsState.pmSummary.totalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">水质异常数据</div>
            <div class="card-value">{{ metricsState.pmSummary.abnormalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">处理量超额数量</div>
            <div class="card-value">{{ metricsState.pmSummary.excessNum }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 污水处理量统计 -->
    <div class="panel-container flex-2">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="污水处理量统计" class="title-icon" />
        </div>
        <h3>污水处理量统计</h3>
      </div>
      <div class="container-content">
        <div class="rainfall-content">
          <div class="rainfall-map">
            <div class="map-placeholder">处理量图表占位</div>
          </div>
          <div class="rainfall-legend">
            <div class="legend-item" v-for="item in metricsState.pmFlowStats" :key="item.name">
              <span class="legend-label">{{ item.name }}</span>
              <span class="legend-count">{{ item.value }} 万m³/日</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 污水厂监测数据 -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="污水厂监测数据" class="title-icon" />
        </div>
        <h3>污水厂监测数据</h3>
      </div>
      <div class="container-content">
        <div class="table-wrapper">
          <!-- 加载状态时显示骨架屏 -->
          <div v-if="loadingState.managementLoading" class="table-skeleton">
            <div class="skeleton-table-row" v-for="i in 6" :key="i"></div>
          </div>
          <!-- 数据加载完成后显示真实表格 -->
          <el-table v-else :data="metricsState.pmPlants" height="100%" stripe border>
            <el-table-column prop="name" label="厂站" width="140" />
            <el-table-column prop="flow" label="当日处理量(m³/日)" width="160" />
            <el-table-column prop="tp" label="总磷(mg/L)" width="120" />
            <el-table-column prop="tn" label="总氮(mg/L)" width="120" />
            <el-table-column prop="nh3" label="氨氮(mg/L)" width="120" />
            <el-table-column prop="cod" label="COD(mg/L)" width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共服务：左侧占位 -->
  <div class="floating-panel left-panel" v-if="metricsState.sceneActive === 'publicService'">
    <div class="panel-container fill">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="供水量概况" class="title-icon" />
        </div>
        <h3>供水量概况</h3>
      </div>
      <div class="container-content">
        <!-- 自定义 Tabs -->
        <div class="custom-tabs">
          <div class="custom-tabs-header">
            <button
              v-for="(s, sIdx) in metricsState.service.list"
              :key="sIdx"
              class="custom-tab-btn"
              :class="{ active: metricsState.service.active === String(sIdx) }"
              @click="metricsState.service.active = String(sIdx)"
            >{{ s.stationName || `供水厂${sIdx+1}` }}</button>
          </div>
        </div>

        <div class="metric-cards row-cards two-rows">
          <div class="metric-card">
            <div class="card-label">今日计划供水量</div>
            <div class="card-value">{{ metricsState.currentSupply?.todayPlanNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">今日供水量</div>
            <div class="card-value">{{ metricsState.currentSupply?.todaySupplyNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">昨日供水量</div>
            <div class="card-value">{{ metricsState.currentSupply?.yesterdaySupplyNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">当月供水量总计</div>
            <div class="card-value">{{ metricsState.currentSupply?.thisMonthNum ?? '-' }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">当年供水量总计</div>
            <div class="card-value">{{ metricsState.currentSupply?.thisYearNum ?? '-' }}</div>
          </div>
        </div>

        <!-- 月供水量统计柱状图 -->
        <div class="chart-title">月供水量统计</div>
        <div class="chart-wrapper" style="margin-top: 0.08rem; height: 2.6rem;"> <!-- 8px → 0.08rem, 260px → 2.6rem，图表容器响应式 -->
          <!-- 加载状态时显示骨架屏 -->
          <div v-if="loadingState.serviceLoading" class="skeleton-chart"></div>
          <!-- 数据加载完成后显示真实图表 -->
          <EChart v-else :options="metricsState.serviceMonthChartOptions" width="100%" height="100%" />
        </div>

        <!-- 近七日供水量统计（实供 vs 计划） -->
        <div class="chart-title" style="margin-top: 0.08rem;">近七日供水量统计</div> <!-- 8px → 0.08rem，标题间距响应式 -->
        <div class="chart-wrapper" style="margin-top: 0.12rem; height: 2.2rem;"> <!-- 12px → 0.12rem, 220px → 2.2rem，图表容器响应式 -->
          <!-- 加载状态时显示骨架屏 -->
          <div v-if="loadingState.serviceLoading" class="skeleton-chart"></div>
          <!-- 数据加载完成后显示真实图表 -->
          <EChart v-else :options="metricsState.serviceWeekChartOptions" width="100%" height="100%" />
        </div>
      </div>
    </div>
  </div>
  
  <!-- 右侧悬浮区域：改为单个面板（Tab + 统计卡片 + 表格） -->
  <div class="floating-panel right-panel" v-if="metricsState.sceneActive === 'publicSecurity'">
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="实时监测数据" class="title-icon" />
        </div>
        <h3>实时监测数据</h3>
      </div>
      <div class="container-content">
        <!-- 自定义 Tabs -->
        <div class="custom-tabs">
          <div class="custom-tabs-header">
            <button
              class="custom-tab-btn"
              :class="{ active: metricsState.panel.activeTab === 'river' }"
              @click="metricsState.panel.activeTab = 'river'"
            >河道水情</button>
            <button
              class="custom-tab-btn"
              :class="{ active: metricsState.panel.activeTab === 'reservoir' }"
              @click="metricsState.panel.activeTab = 'reservoir'"
            >水库水情</button>
            <button
              class="custom-tab-btn"
              :class="{ active: metricsState.panel.activeTab === 'tunnel' }"
              @click="metricsState.panel.activeTab = 'tunnel'"
            >下穿隧道</button>
            <button
              class="custom-tab-btn"
              :class="{ active: metricsState.panel.activeTab === 'ponding' }"
              @click="metricsState.panel.activeTab = 'ponding'"
            >内涝点</button>
          </div>
        </div>

        <!-- 统计卡片（横向） -->
        <div class="stats-row" v-if="metricsState.panel.activeTab !== 'reservoir'">
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.total }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.total }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.alarm }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.alarm }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.serious }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.serious }}</div>
          </div>
        </div>
        <div class="stats-row" v-else>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.total }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.total }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.alarm }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.alarm }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.serious }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.serious }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">{{ metricsState.panelLabels.verification }}</div>
            <div class="card-value" :class="{ 'skeleton-loader': loadingState.dataLoading }">{{ loadingState.dataLoading ? '' : metricsState.panelStats.verification }}</div>
          </div>
        </div>

        <!-- 表格（自适应撑满剩余高度） -->
        <div class="table-wrapper">
          <!-- 加载状态时显示骨架屏 -->
          <div v-if="loadingState.dataLoading" class="table-skeleton">
            <div class="skeleton-table-row" v-for="i in 8" :key="i"></div>
          </div>
          <!-- 数据加载完成后显示真实表格 -->
          <el-table
            v-else
            :data="metricsState.panelTable"
            height="100%"
            stripe
            border
          >
            <el-table-column v-for="col in metricsState.panelColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>

  <!-- 公共管理：右侧栈式布局（1:3:3） -->
  <div class="right-stack" v-if="metricsState.sceneActive === 'publicManagement'">
    <!-- 右1：排水管网监测点统计 -->
    <div class="panel-container flex-1">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="排水管网监测点统计" class="title-icon" />
        </div>
        <h3>排水管网监测点统计</h3>
      </div>
      <div class="container-content">
        <div class="stats-row right3-cards-row">
          <div class="metric-card">
            <div class="card-label">检测点总数</div>
            <div class="card-value">{{ metricsState.pmDrainageStat.totalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">液位报警总数</div>
            <div class="card-value">{{ metricsState.pmDrainageStat.alarmNum }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右2：排水管网检测数据 -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="排水管网检测数据" class="title-icon" />
        </div>
        <h3>排水管网检测数据</h3>
      </div>
      <div class="container-content">
        <div class="table-wrapper">
          <el-table :data="metricsState.pmPipes" height="100%" stripe border>
            <el-table-column prop="name" label="监测点" width="140" />
            <el-table-column prop="liquidLevel" label="液位(m)" width="100" />
            <el-table-column prop="traffic" label="流量(m³/h)" width="120" />
            <el-table-column prop="time" label="采集时间" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 右3：河道巡河统计（含图表预留） -->
    <div class="panel-container flex-3">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="河道巡河统计" class="title-icon" />
        </div>
        <h3>河道巡河统计</h3>
      </div>
      <div class="container-content">
        <div class="stats-row stats-row--compact">
          <div class="metric-card">
            <div class="card-label">巡河完成率</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.completionRate }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">水质报警数</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.alarmNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">问题结办率</div>
            <div class="card-value">{{ metricsState.pmRiverPatrol.caseClosureRate }}</div>
          </div>
        </div>
        <div class="chart-wrapper">
          <EChart :options="metricsState.pmRiverChartOptions" width="100%" height="100%" />
        </div>
      </div>
    </div>
  </div>

  <!-- 公共服务：右侧占位 -->
  <div class="floating-panel right-panel right-two-panels" v-if="metricsState.sceneActive === 'publicService'">
    <!-- 右1：仅展示三个水厂 PH/浊度/余氯 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="出水水质检测" class="title-icon" />
        </div>
        <h3>出水水质检测</h3>
      </div>
      <div class="container-content">
        <div class="ps-top3">
          <div class="plant-block" v-for="item in metricsState.serviceQualityTop3" :key="item.id">
            <div class="plant-title">
              <span>{{ item.stationName }}</span>
              <el-button size="small" type="primary" text @click="metricsState.goPlantDetail(item)">查看全部</el-button>
            </div>
            <div class="row-cards compact">
              <div class="metric-card">
                <div class="card-label">PH</div>
                <div class="card-value">{{ item.publicHealth }}</div>
              </div>
              <div class="metric-card">
                <div class="card-label">浊度(NTU)</div>
                <div class="card-value">{{ item.turbidity }}</div>
              </div>
              <div class="metric-card">
                <div class="card-label">余氯(mg/L)</div>
                <div class="card-value">{{ item.residualChlorine }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右2：完整表格放这里 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="出水水质检测数据" class="title-icon" />
        </div>
        <h3>出水水质检测数据</h3>
      </div>
      <div class="container-content">
        <div class="stats-row">
          <div class="metric-card">
            <div class="card-label">监测点总数</div>
            <div class="card-value">{{ metricsState.serviceNetworkStat.totalNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">压力报警数</div>
            <div class="card-value">{{ metricsState.serviceNetworkStat.pressureAlarmNum }}</div>
          </div>
          <div class="metric-card">
            <div class="card-label">水质报警数</div>
            <div class="card-value">{{ metricsState.serviceNetworkStat.potabilityAlarmNum }}</div>
          </div>
        </div>
        <div class="table-wrapper">
          <!-- 加载状态时显示骨架屏 -->
          <div v-if="loadingState.serviceLoading" class="table-skeleton">
            <div class="skeleton-table-row" v-for="i in 6" :key="i"></div>
          </div>
          <!-- 数据加载完成后显示真实表格 -->
          <el-table v-else :data="metricsState.serviceNetworkQuality" height="100%" stripe border>
            <el-table-column prop="stationName" label="监测点" width="160" />
            <el-table-column prop="pressure" label="压力(MPa)" width="120" />
            <el-table-column prop="residualChlorine" label="余氯(mg/L)" width="130" />
            <el-table-column prop="turbidity" label="浊度(NTU)" width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="metricsState.centerOnPoint(row)">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 底部三项操作 -->
  <div class="bottom-actions">
    <!-- 隐藏的图片预渲染容器，确保所有图片都被浏览器缓存 -->
    <div class="preload-images">
      <img :src="iconSecure" alt="公共安全" style="display: none;" />
      <img :src="iconManage" alt="公共管理" style="display: none;" />
      <img :src="iconService" alt="公共服务" style="display: none;" />
      <img :src="iconSecureActive" alt="公共安全激活" style="display: none;" />
      <img :src="iconManageActive" alt="公共管理激活" style="display: none;" />
      <img :src="iconServiceActive" alt="公共服务激活" style="display: none;" />
    </div>
    
    <div class="action-item secure" :class="{ active: metricsState.sceneActive === 'publicSecurity' }" @click="metricsState.setScene('publicSecurity')">
      <div class="action-icon">
        <img 
          :key="'secure-' + metricsState.sceneActive" 
          :src="metricsState.sceneActive === 'publicSecurity' ? iconSecureActive : iconSecure" 
          alt="公共安全" 
          @load="onImageLoad('secure', $event)"
          @error="onImageError('secure', $event)"
        />
      </div>
      <div class="action-label">公共安全</div>
    </div>
    <div class="action-item manage" :class="{ active: metricsState.sceneActive === 'publicManagement' }" @click="metricsState.setScene('publicManagement')">
      <div class="action-icon">
        <img 
          :key="'manage-' + metricsState.sceneActive" 
          :src="metricsState.sceneActive === 'publicManagement' ? iconManageActive : iconManage" 
          alt="公共管理" 
          @load="onImageLoad('manage', $event)"
          @error="onImageError('manage', $event)"
        />
      </div>
      <div class="action-label">公共管理</div>
    </div>
    <div class="action-item service" :class="{ active: metricsState.sceneActive === 'publicService' }" @click="metricsState.setScene('publicService')">
      <div class="action-icon">
        <img 
          :key="'service-' + metricsState.sceneActive" 
          :src="metricsState.sceneActive === 'publicService' ? iconServiceActive : iconService" 
          alt="公共服务" 
          @load="onImageLoad('service', $event)"
          @error="onImageError('service', $event)"
        />
      </div>
      <div class="action-label">公共服务</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { shallowRef, reactive, onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { ElLoading } from 'element-plus'
import { initGisMap, esriModules, createMarkerGraphic, createMarkerPopup, updateAllPopupPositions, popups } from '@/utils/gis'
import { MetricsAPI, MetricsManagementAPI, MetricsServiceAPI } from '@/api/sector/metrics'
import riverIcon from '@/assets/imgs/sector/河道水情.png'
import reservoirIcon from '@/assets/imgs/sector/水位监测.png'
import tunnelIcon from '@/assets/imgs/sector/下穿隧道.png'
import pondingIcon from '@/assets/imgs/sector/内涝点.png'
import plantIcon from '@/assets/imgs/sector/污水站.png'
import liquidIcon from '@/assets/imgs/sector/液位检测点.png'
import waterQualityIcon from '@/assets/imgs/sector/水质监测点.png'
import iconSecure from '@/assets/imgs/sector/公共安全.png'
import iconManage from '@/assets/imgs/sector/公共管理.png'
import iconService from '@/assets/imgs/sector/公共服务.png'
import iconSecureActive from '@/assets/imgs/sector/publicsafe-active.png'
import iconManageActive from '@/assets/imgs/sector/publimagc-active.png'
import iconServiceActive from '@/assets/imgs/sector/publickserve-active.png'
import titleIcon from '@/assets/imgs/sector/title-icon.png'
import { useMetricsScene } from './useMetricsScene'
import EChart from '@/components/Echart/src/Echart.vue'
import { useRouter } from 'vue-router'

// 加载状态管理 - 优先声明
const loadingState = reactive({
  mapLoading: false,
  dataLoading: false,
  managementLoading: false,
  serviceLoading: false,
  mapRendered: false,        // 地图是否渲染完成
  markersRendered: false,    // 标记点是否渲染完成
  allDataReady: false,
  iconsPreloaded: false      // 图标是否预加载完成
})

// Element Plus 全局加载实例
let globalLoading: any = null

// REM 响应式设置 - 基于1920px设计稿
const setRem = () => {
  const designWidth = 1920 // 设计稿基准宽度
  const currentWidth = window.innerWidth
  // 计算缩放比例，以100px为基准字体大小
  const fontSize = Math.min((currentWidth / designWidth) * 100, 200) // 限制最大200px
  document.documentElement.style.fontSize = fontSize + 'px'
  console.log(`屏幕宽度: ${currentWidth}px, 根字体大小: ${fontSize}px`)
}

// 图标预加载功能 - 优化版
const imageCache = new Map() // 图片缓存
const preloadImages = () => {
  const imageUrls = [
    iconSecure,
    iconManage, 
    iconService,
    iconSecureActive,
    iconManageActive,
    iconServiceActive
  ]
  
  console.log('开始预加载底部按钮图标...', imageUrls.length + '个')
  
  const promises = imageUrls.map(url => {
    // 如果已经缓存，直接返回成功
    if (imageCache.has(url)) {
      console.log('图片已缓存，跳过预加载:', url)
      return Promise.resolve(url)
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // 设置超时机制，避免单个图片加载过久
      const timeout = setTimeout(() => {
        console.warn('图片预加载超时:', url)
        reject(new Error(`Timeout loading ${url}`))
      }, 5000) // 5秒超时
      
      img.onload = () => {
        clearTimeout(timeout)
        imageCache.set(url, img) // 缓存图片
        console.log('图片预加载完成:', url.split('/').pop())
        resolve(url)
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        console.error('图片预加载失败:', url)
        reject(new Error(`Failed to load ${url}`))
      }
      
      img.src = url
    })
  })
  
  return Promise.allSettled(promises)
    .then((results) => {
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      console.log(`图标预加载完成: 成功${successful}个, 失败${failed}个`)
      
      // 只要有超过一半的图片加载成功就继续
      if (successful >= imageUrls.length / 2) {
        loadingState.iconsPreloaded = true
        console.log('底部按钮图标预加载就绪')
      } else {
        console.warn('图标预加载成功率过低，但继续执行')
        loadingState.iconsPreloaded = true
      }
      
      return successful
    })
    .catch((error) => {
      console.error('图标预加载出错:', error)
      loadingState.iconsPreloaded = true // 确保不会阻塞页面加载
      return 0
    })
}

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const router = useRouter()
const metricsLayer = shallowRef<any>(null);
const popupDomList: HTMLElement[] = [];
// 右3 图表配置
const pmRiverChartOptions = ref<any>({})
const buildPmRiverChartOptions = (list: any[]) => {
  const x = (list || []).map((i: any) => i?.riverPatrolTarget ?? '-')
  const needed = (list || []).map((i: any) => i?.neededNum ?? 0)
  const completed = (list || []).map((i: any) => i?.completedNum ?? 0)
  const rate = (list || []).map((i: any) => Number(String(i?.completionRate ?? '0').replace('%','')))
  return {
    color: ['#4A90E2', '#FFD166', '#34D399'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.35)' } }
    },
    grid: { left: 36, right: 16, top: 24, bottom: 28, containLabel: true },
    legend: { data: ['计划次数','完成次数','完成率'], textStyle: { color: '#e6f4ff' } },
    xAxis: [{
      type: 'category',
      data: x,
      axisLabel: { color: '#cfe8ff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } },
      axisTick: { show: false }
    }],
    yAxis: [
      {
        type: 'value',
        name: '次数',
        nameTextStyle: { color: '#cfe8ff' },
        axisLabel: { color: '#cfe8ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
      },
      {
        type: 'value',
        name: '完成率(%)',
        nameTextStyle: { color: '#cfe8ff' },
        axisLabel: { color: '#cfe8ff' },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
      }
    ],
    series: [
      {
        name: '计划次数',
        type: 'bar',
        barWidth: 14,
        data: needed,
        yAxisIndex: 0,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#66A9FF' },
              { offset: 1, color: '#2B68C5' }
            ]
          }
        }
      },
      {
        name: '完成次数',
        type: 'bar',
        barWidth: 14,
        data: completed,
        yAxisIndex: 0,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FFE08A' },
              { offset: 1, color: '#F5B30E' }
            ]
          }
        }
      },
      {
        name: '完成率',
        type: 'line',
        data: rate,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#34D399' }
      }
    ]
  }
}

// 右3 图表：保持与接口同步

// 公共服务 - 月供水量图表配置
const serviceMonthChartOptions = ref<any>({})
const buildServiceMonthChartOptions = (list: any[]) => {
  const months = (list || []).map((i: any) => i?.statisticsDate ?? '-')
  const monthSupply = (list || []).map((i: any) => i?.monthSupplyNum ?? 0)
  const sequential = (list || []).map((i: any) => i?.sequentialSupplyNum ?? 0)
  return {
    color: ['#66A9FF', '#34D399'],
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 16, top: 24, bottom: 28, containLabel: true },
    legend: { data: ['本月供水量', '去年同期'], textStyle: { color: '#e6f4ff' } },
    xAxis: [{
      type: 'category',
      data: months,
      axisLabel: { color: '#cfe8ff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } },
      axisTick: { show: false }
    }],
    yAxis: [{
      type: 'value',
      name: '供水量',
      nameTextStyle: { color: '#cfe8ff' },
      axisLabel: { color: '#cfe8ff' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
    }],
    series: [
      { name: '本月供水量', type: 'bar', barWidth: 14, data: monthSupply },
      { name: '去年同期', type: 'bar', barWidth: 14, data: sequential }
    ]
  }
}

// 公共服务 - 近七日供水量图表配置
const serviceWeekChartOptions = ref<any>({})
const buildServiceWeekChartOptions = (list: any[]) => {
  const days = (list || []).map((i: any) => i?.statisticsDate ?? '-')
  const supplied = (list || []).map((i: any) => i?.thatDaySupplyNum ?? 0)
  const planned = (list || []).map((i: any) => i?.thatDayPlanNum ?? 0)
  return {
    color: ['#66A9FF', '#FFD166'],
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 16, top: 24, bottom: 28, containLabel: true },
    legend: { data: ['实供', '计划'], textStyle: { color: '#e6f4ff' } },
    xAxis: [{
      type: 'category',
      data: days,
      axisLabel: { color: '#cfe8ff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } },
      axisTick: { show: false }
    }],
    yAxis: [{
      type: 'value',
      name: '供水量',
      nameTextStyle: { color: '#cfe8ff' },
      axisLabel: { color: '#cfe8ff' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
    }],
    series: [
      { name: '实供', type: 'line', smooth: true, showSymbol: false, data: supplied },
      { name: '计划', type: 'line', smooth: true, showSymbol: false, data: planned }
    ]
  }
}

/** 格式化毫秒时间戳为 YYYY/MM/DD HH:mm:ss */
function formatTime(ts?: number | string) {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  const pad = (n: number) => `${n}`.padStart(2, '0')
  const Y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const D = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${Y}/${M}/${D} ${h}:${m}:${s}`
}

/**
 * 指标页-公共安全相关数据
 * 说明来源：`src/api/sector/metrics/index.ts` 中各 API 方法注释
 */
const metricsState = reactive({
  /** 获取内涝点数据：内涝点（易涝点）监测/告警数据列表 */
  carResource: [] as any[],
  /** 获取雨量分布：各行政区/网格的降雨统计与等级，用于分段着色 */
  rainfallDistribution: [] as any[],
  /** 获取水库水情：水库名称、水位、入/出库流量等监测数据 */
  reservoirCondition: [] as any[],
  /** 获取河道水情：河道（断面）水位、流量等监测数据 */
  riverCondition: [] as any[],
  /** 获取隧道数据（接口为 getTunnelCondition）：城市隧道积水/设施状态等数据 */
  watergateCondition: [] as any[],
  /** 获取预警信息：气象/山洪/防汛等综合预警条目列表 */
  flowDistribution: [] as any[]
})

// 公共管理（演示数据，可替换为真实接口结果）
metricsState.pmSummary = reactive({
  totalNum: 0,
  abnormalNum: 0,
  excessNum: 0
})

metricsState.pmFlowStats = reactive([
  { name: '简阳城区', value: 12.6 },
  { name: '石桥片区', value: 6.2 },
  { name: '石盘片区', value: 3.8 }
])

metricsState.pmPlants = reactive<any[]>([])
metricsState.pmPipes = reactive<any[]>([])
metricsState.pmDrainageStat = reactive({ totalNum: 0, alarmNum: 0 })
metricsState.pmRiverPatrol = reactive({
  completionRate: '-',
  alarmNum: 0,
  caseClosureRate: '-',
  detailList: [] as any[]
})

// 公共服务 - 供水量概况
metricsState.service = reactive({
  list: [] as any[],
  active: '0' as string
})
// 公共服务 - 出水水质（右1）
metricsState.serviceQuality = reactive<any[]>([])
metricsState.serviceQualityStats = reactive({
  total: 0,
  avgPublicHealth: '-',
  avgTurbidity: '-',
  avgResidualChlorine: '-'
} as any)
// 公共服务 - 管网水质（右2表格）
metricsState.serviceNetworkQuality = reactive<any[]>([])
metricsState.serviceNetworkStat = reactive({ totalNum: 0, pressureAlarmNum: 0, potabilityAlarmNum: 0 })
// 暴露月供水量图表给模板
// @ts-ignore
// eslint-disable-next-line
metricsState.serviceMonthChartOptions = serviceMonthChartOptions
// 暴露七日供水量图表给模板
// @ts-ignore
// eslint-disable-next-line
metricsState.serviceWeekChartOptions = serviceWeekChartOptions

const initMap = async () => {
  try {
    loadingState.mapLoading = true
    updateGlobalLoading() // 立即显示遮罩
    console.log('初始化地图')
    const { map, view } = await initGisMap(document.getElementById('mapContainer'))
    console.log('地图初始化完成', map, view)
    mapView.value = view
    gisMap.value = map
    
    // 创建图层
    if (esriModules && !metricsLayer.value) {
      metricsLayer.value = new esriModules.GraphicsLayer();
      gisMap.value.add(metricsLayer.value);
    }
    
    // 监听地图渲染完成
    view.when(() => {
      console.log('地图视图渲染完成')
      loadingState.mapRendered = true
      loadingState.mapLoading = false
      updateGlobalLoading()
      checkAllRenderComplete()
      
      // 地图渲染完成后立即尝试渲染
      setTimeout(() => {
        console.log('地图渲染完成，立即尝试渲染点位')
        renderMetricMarkers()
      }, 100)
    })
    
    // 检查是否可以渲染标记
    checkAndRenderMarkers()
  } catch (error) {
    console.error('地图初始化失败:', error)
    loadingState.mapLoading = false
    updateGlobalLoading()
  }
};

const fetchAllMetrics = async () => {
  try {
    loadingState.dataLoading = true
    updateGlobalLoading() // 在开始加载前就显示遮罩
    console.log('开始加载公共安全数据...')
    
    const [
      carResource,
      rainfallDistribution,
      reservoirCondition,
      riverCondition,
      watergateCondition,
      flowDistribution
    ] = await Promise.all([
      MetricsAPI.getCarResource(),
      MetricsAPI.getRainfallDistribution(),
      MetricsAPI.getReservoirCondition(),
      MetricsAPI.getRiverCondition(),
      MetricsAPI.getWatergateCondition(),
      MetricsAPI.getFlowDistribution()
    ])

    console.log('公共安全数据加载完成')
    
    // 将接口数据写入响应式状态
    metricsState.carResource = (carResource as any) ?? []
    metricsState.rainfallDistribution = (rainfallDistribution as any) ?? []
    metricsState.reservoirCondition = (reservoirCondition as any) ?? []
    metricsState.riverCondition = (riverCondition as any) ?? []
    metricsState.watergateCondition = (watergateCondition as any) ?? []
    metricsState.flowDistribution = (flowDistribution as any) ?? []
    
    loadingState.dataLoading = false
    updateGlobalLoading()
    // 检查是否可以渲染标记（如果地图已准备好）
    if (loadingState.mapRendered) {
      checkAndRenderMarkers()
    }
    // 数据加载完成后直接渲染
    if (loadingState.mapRendered) {
      console.log('数据加载完成，直接渲染')
      renderMetricMarkers()
    }
  } catch (error) {
    console.error('fetchAllMetrics error', error)
    loadingState.dataLoading = false
    updateGlobalLoading()
  }
}

// 打印“公共管理”全部接口返回
const fetchAllManagementAndLog = async () => {
  try {
    loadingState.managementLoading = true
    updateGlobalLoading() // 在开始加载前就显示遮罩
    const [
      waterPipeDetectionData,
      drainageDetectPointStat,
      riverPatrolPointStat,
      wastewaterPlantData,
      sewagePlantData,
      sewageVolumeStat
    ] = await Promise.all([
      MetricsManagementAPI.getWaterPipeDetectionData(),
      MetricsManagementAPI.getDrainageDetectPointStat(),
      MetricsManagementAPI.getRiverPatrolPointStat(),
      MetricsManagementAPI.getWastewaterPlantData(),
      MetricsManagementAPI.getSewagePlantData(),
      MetricsManagementAPI.getSewageVolumeStat()
    ])

    console.log('[Management] getWaterPipeDetectionData', waterPipeDetectionData)
    console.log('[Management] getDrainageDetectPointStat', drainageDetectPointStat)
    console.log('[Management] getRiverPatrolPointStat', riverPatrolPointStat)
    console.log('[Management] getWastewaterPlantData', wastewaterPlantData)
    console.log('[Management] getSewagePlantData', sewagePlantData)
    console.log('[Management] getSewageVolumeStat', sewageVolumeStat)

    // 将污水处理监测数据同步到左1摘要
    try {
      const d: any = sewagePlantData as any
      metricsState.pmSummary.totalNum = d?.totalNum ?? 0
      metricsState.pmSummary.abnormalNum = d?.abnormalNum ?? 0
      metricsState.pmSummary.excessNum = d?.excessNum ?? 0
    } catch {}

    // 映射污水厂监测数据 → 左3表格
    try {
      const list: any[] = (wastewaterPlantData as any) || []
      metricsState.pmPlants.splice(0, metricsState.pmPlants.length, ...list.map((it: any) => ({
        name: it?.stationName ?? '-',
        flow: it?.thisDayNum ?? '-',
        tp: it?.totalPhosphorus ?? '-',
        tn: it?.totalNitrogen ?? '-',
        nh3: it?.ammoniaNitrogen ?? '-',
        cod: it?.chemicalOxygenDemand ?? '-',
        longitude: it?.longitude,
        latitude: it?.latitude,
        type: 'plant'
      })))
    } catch {}

    // 映射排水管网检测数据 → 右侧表格
    try {
      const list: any[] = (waterPipeDetectionData as any) || []
      metricsState.pmPipes.splice(0, metricsState.pmPipes.length, ...list.map((it: any) => ({
        name: it?.stationName ?? '-',
        liquidLevel: it?.liquidLevel ?? '-',
        traffic: it?.traffic ?? '-',
        time: formatTime(it?.collectionTime),
        longitude: it?.longitude,
        latitude: it?.latitude,
        type: 'pipe'
      })))
    } catch {}

    // 映射排水管网监测点统计 → 右1卡片
    try {
      const s: any = drainageDetectPointStat as any
      metricsState.pmDrainageStat.totalNum = s?.totalNum ?? 0
      metricsState.pmDrainageStat.alarmNum = s?.alarmNum ?? 0
    } catch {}

    // 映射河道巡河统计 → 右3卡片与图例
    try {
      const r: any = riverPatrolPointStat as any
      metricsState.pmRiverPatrol.completionRate = r?.completionRate ?? '-'
      metricsState.pmRiverPatrol.alarmNum = r?.alarmNum ?? 0
      metricsState.pmRiverPatrol.caseClosureRate = r?.caseClosureRate ?? '-'
      metricsState.pmRiverPatrol.detailList = Array.isArray(r?.detailList) ? r.detailList : []
      // 生成 ECharts 配置
      pmRiverChartOptions.value = buildPmRiverChartOptions(metricsState.pmRiverPatrol.detailList)
      // 此时 metricsState 已初始化，安全挂载到其中供模板使用
      // @ts-ignore
      // eslint-disable-next-line
      metricsState.pmRiverChartOptions = pmRiverChartOptions
    } catch {}
    
    loadingState.managementLoading = false
    updateGlobalLoading()
    if (loadingState.mapRendered) {
      checkAndRenderMarkers()
    }
    // 强制触发一次渲染，确保点位显示
    setTimeout(() => {
      if (loadingState.mapRendered) {
        console.log('公共管理数据加载完成，强制触发渲染')
    
        renderMetricMarkers()
      }
    }, 100)
  } catch (e) {
    console.error('fetchAllManagementAndLog error', e)
    loadingState.managementLoading = false
    updateGlobalLoading()
  }
}

// 打印“公共服务”全部接口返回
const fetchAllServiceAndLog = async () => {
  try {
    loadingState.serviceLoading = true
    updateGlobalLoading() // 在开始加载前就显示遮罩
    const [
      waterQualityData,
      networkWaterQualityData,
      waterSupplyPointStat
    ] = await Promise.all([
      MetricsServiceAPI.getWaterQualityData(),
      MetricsServiceAPI.getNetworkWaterQualityData(),
      MetricsServiceAPI.getWaterSupplyPointStat()
    ])

    console.log('公共服务数据加载完成')
    console.log('[Service] getWaterQualityData', waterQualityData)
    console.log('[Service] getNetworkWaterQualityData', networkWaterQualityData)
    console.log('[Service] getWaterSupplyPointStat', waterSupplyPointStat)

    // 映射出水水质检测 → 右1
    try {
      const list: any[] = Array.isArray(waterQualityData as any) ? (waterQualityData as any) : []
      metricsState.serviceQuality.splice(0, metricsState.serviceQuality.length, ...list.map((it: any) => ({
        id: it?.id,
        stationName: it?.stationName ?? '-',
        publicHealth: it?.publicHealth ?? '-',
        turbidity: it?.turbidity ?? '-',
        residualChlorine: it?.residualChlorine ?? '-',
        longitude: it?.longitude,
        latitude: it?.latitude
      })))
      const n = metricsState.serviceQuality.length
      metricsState.serviceQualityStats.total = n
      if (n > 0) {
        const avg = (arr: number[]) => (arr.reduce((a, b) => a + (Number(b) || 0), 0) / n)
        const ph = avg(metricsState.serviceQuality.map((i: any) => Number(i.publicHealth) || 0))
        const turb = avg(metricsState.serviceQuality.map((i: any) => Number(i.turbidity) || 0))
        const rc = avg(metricsState.serviceQuality.map((i: any) => Number(i.residualChlorine) || 0))
        metricsState.serviceQualityStats.avgPublicHealth = ph.toFixed(3)
        metricsState.serviceQualityStats.avgTurbidity = turb.toFixed(3)
        metricsState.serviceQualityStats.avgResidualChlorine = rc.toFixed(3)
      } else {
        metricsState.serviceQualityStats.avgPublicHealth = '-'
        metricsState.serviceQualityStats.avgTurbidity = '-'
        metricsState.serviceQualityStats.avgResidualChlorine = '-'
      }
    } catch {}

    // 映射管网水质检测 → 右2（兼容对象含统计与 dataList 的结构）
    try {
      const nw = networkWaterQualityData as any
      // 统计
      if (nw && typeof nw === 'object' && !Array.isArray(nw)) {
        metricsState.serviceNetworkStat.totalNum = nw?.totalNum ?? 0
        metricsState.serviceNetworkStat.pressureAlarmNum = nw?.pressureAlarmNum ?? 0
        metricsState.serviceNetworkStat.potabilityAlarmNum = nw?.potabilityAlarmNum ?? 0
      } else {
        metricsState.serviceNetworkStat.totalNum = Array.isArray(nw) ? nw.length : 0
        metricsState.serviceNetworkStat.pressureAlarmNum = 0
        metricsState.serviceNetworkStat.potabilityAlarmNum = 0
      }
      const list: any[] = Array.isArray(nw) ? nw : (Array.isArray(nw?.dataList) ? nw.dataList : [])
      metricsState.serviceNetworkQuality.splice(0, metricsState.serviceNetworkQuality.length, ...list.map((it: any) => ({
        id: it?.id,
        stationName: it?.stationName ?? '-',
        pressure: it?.pressure ?? '-',
        residualChlorine: it?.residualChlorine ?? '-',
        turbidity: it?.turbidity ?? '-',
        longitude: it?.longitude,
        latitude: it?.latitude
      })))
    } catch {}

    // 同步供水厂数据到状态
    try {
      const list: any[] = Array.isArray(waterSupplyPointStat as any) ? (waterSupplyPointStat as any) : []
      metricsState.service.list = list
      if (list.length > 0) {
        const idx = Number(metricsState.service.active)
        if (!Number.isInteger(idx) || idx < 0 || idx >= list.length) {
          metricsState.service.active = '0'
        }
      }
    } catch {}
    
    loadingState.serviceLoading = false
    updateGlobalLoading()
    if (loadingState.mapRendered) {
      checkAndRenderMarkers()
    }
    // 强制触发一次渲染，确保点位显示
    setTimeout(() => {
      if (loadingState.mapRendered) {
        console.log('公共服务数据加载完成，强制触发渲染')

        renderMetricMarkers()
      }
    }, 100)
  } catch (e) {
    console.error('fetchAllServiceAndLog error', e)
    loadingState.serviceLoading = false
    updateGlobalLoading()
  }
}

// metrics 页面内的场景切换（默认公共安全）
const sceneCtx = useMetricsScene()
metricsState.sceneActive = sceneCtx.active

// 优化的场景切换函数
metricsState.setScene = async (newScene: string) => {
  const oldScene = metricsState.sceneActive
  if (oldScene === newScene) return
  
  console.log(`场景切换: ${oldScene} -> ${newScene}`)
  
  // 确保图标预加载完成，避免切换时图片丢失
  if (!loadingState.iconsPreloaded) {
    console.log('等待图标预加载完成...')
    await preloadImages()
  }
  
  // 立即更新场景
  sceneCtx.setScene(newScene)
  metricsState.sceneActive = newScene
  
  // 重置渲染状态
  loadingState.markersRendered = false
  loadingState.allDataReady = false
  
  // 清理当前渲染内容
  if (metricsLayer.value) {
    metricsLayer.value.removeAll()
  }
  cleanupPopups()
  
  // 根据新场景加载数据（如果尚未加载）
  if (newScene === 'publicSecurity' && loadingState.dataLoading === undefined) {
    loadingState.dataLoading = true
    updateGlobalLoading() // 立即显示遮罩
    await fetchAllMetrics()
  } else if (newScene === 'publicManagement' && loadingState.managementLoading === undefined) {
    loadingState.managementLoading = true
    updateGlobalLoading() // 立即显示遮罩
    await fetchAllManagementAndLog()
  } else if (newScene === 'publicService' && loadingState.serviceLoading === undefined) {
    loadingState.serviceLoading = true
    updateGlobalLoading() // 立即显示遮罩
    await fetchAllServiceAndLog()
  }
  
  // 重新渲染当前场景的数据
  if (loadingState.mapRendered) {
    checkAndRenderMarkers()
  }
  
  // 确保在场景切换后立即尝试渲染
  setTimeout(() => {
    if (loadingState.mapRendered) {
      console.log('场景切换完成，强制触发渲染')
      renderMetricMarkers()
    }
  }, 200)
}

// 智能渲染检查：只有当地图和当前场景的数据都准备好时才渲染
const checkAndRenderMarkers = () => {
  if (loadingState.mapLoading || !loadingState.mapRendered) {
    console.log('地图还在加载或渲染中，等待渲染')
    return
  }
  
  const currentScene = metricsState.sceneActive
  let canRender = false
  
  if (currentScene === 'publicSecurity' && !loadingState.dataLoading) {
    canRender = true
    console.log('公共安全数据就绪，可以渲染')
  } else if (currentScene === 'publicManagement' && !loadingState.managementLoading) {
    canRender = true
    console.log('公共管理数据就绪，可以渲染')
  } else if (currentScene === 'publicService' && !loadingState.serviceLoading) {
    canRender = true
    console.log('公共服务数据就绪，可以渲染')
  }
  
  if (canRender) {
    try {
      console.log('开始渲染地图标记点...')
      // 重置标记渲染状态
      loadingState.markersRendered = false
      renderMetricMarkers()
    } catch (error) {
      console.warn('渲染标记点失败:', error)
    }
  } else {
    // 即使数据还没完全加载，也尝试渲染已有的数据
    console.log('数据还在加载中，尝试渲染已有数据...')
    try {
      renderMetricMarkers()
    } catch (error) {
      console.warn('渲染已有数据失败:', error)
    }
  }
}

// Element Plus 全局加载状态管理
const updateGlobalLoading = () => {
  const isLoading = loadingState.mapLoading || loadingState.dataLoading || loadingState.managementLoading || loadingState.serviceLoading
  
  if (isLoading && !globalLoading) {
    // 显示全局加载遮罩
    globalLoading = ElLoading.service({
      lock: true,
      text: '正在加载数据...',
      background: 'linear-gradient(135deg, #0a1e3c 0%, #1a2b4a 100%)',
      customClass: 'metrics-global-loading'
    })
    console.log('显示Element Plus全局加载遮罩')
  } else if (!isLoading && globalLoading) {
    // 隐藏全局加载遮罩
    globalLoading.close()
    globalLoading = null
    console.log('隐藏Element Plus全局加载遮罩')
  }
}

// 检查所有渲染是否完成
const checkAllRenderComplete = () => {
  // 检查是否所有数据都加载完成且地图和标记点都渲染完成，以及图标预加载完成
  const allDataLoaded = !loadingState.dataLoading && !loadingState.managementLoading && !loadingState.serviceLoading
  const allRendered = loadingState.mapRendered && loadingState.markersRendered
  const iconsReady = loadingState.iconsPreloaded
  
  if (allDataLoaded && allRendered && iconsReady && !loadingState.allDataReady) {
    loadingState.allDataReady = true
    console.log('所有数据加载完成，地图和标记点都渲染完成，图标预加载完成，页面就绪！')
    
    // 确保全局加载遮罩被隐藏
    updateGlobalLoading()
    
    // 添加一个小延时，确保用户能看到完整的渲染效果
    setTimeout(() => {
      console.log('页面加载完成，显示给用户')
    }, 200)
  }
}

// 简化的初始化流程 - 参考场所保障页面
const initializeApp = async () => {
  console.log('开始初始化应用...')
  
  // 立即显示初始加载状态，防止用户看到空白页面
  loadingState.mapLoading = true
  updateGlobalLoading()
  
  // 1. 初始化地图
  await initMap()
  
  // 2. 等待地图完全初始化
  setTimeout(async () => {
    console.log('地图初始化完成，开始加载数据...')
    
    // 3. 根据当前场景加载数据
    const currentScene = metricsState.sceneActive
    
    if (currentScene === 'publicSecurity') {
      await fetchAllMetrics()
    } else if (currentScene === 'publicManagement') {
      await fetchAllManagementAndLog()
    } else if (currentScene === 'publicService') {
      await fetchAllServiceAndLog()
    } else {
      await fetchAllMetrics()
    }
    
    // 4. 数据加载完成后立即渲染
    console.log('数据加载完成，立即渲染点位')
    renderMetricMarkers()
    
    // 后台并行加载其他数据
    if (currentScene !== 'publicSecurity') {
      fetchAllMetrics().catch(console.error)
    }
    if (currentScene !== 'publicManagement') {
      fetchAllManagementAndLog().catch(console.error)
    }
    if (currentScene !== 'publicService') {
      fetchAllServiceAndLog().catch(console.error)
    }
  }, 1000)
}

onMounted(() => {
  // 设置 REM 响应式
  setRem()
  window.addEventListener('resize', setRem)
  
  initializeApp().catch(error => {
    console.error('应用初始化失败:', error)
  })
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理 REM 监听器
  window.removeEventListener('resize', setRem)
  
  // 清理定时器
 
  // 清理弹窗
  cleanupPopups()
  

  
  // 清理全局加载遮罩
  if (globalLoading) {
    globalLoading.close()
    globalLoading = null
  }
  
  // 重置渲染状态
  loadingState.mapRendered = false
  loadingState.markersRendered = false
  loadingState.allDataReady = false
  
  console.log('组件已清理，资源释放完成')
})

/** 根据当前场景/Tab 返回图标与弹窗标题 */
const getLayerAsset = () => {
  // 公共管理：根据条目类型选择图标（管网/污水厂）
  if (metricsState.sceneActive === 'publicManagement') {
    return { icon: liquidIcon, title: '管网与污水厂' }
  }
  // 公共服务：使用水质监测点图标
  if (metricsState.sceneActive === 'publicService') {
    return { icon: waterQualityIcon, title: '公共服务' }
  }
  // 公共安全：依据 Tab
  const type = metricsState.panel.activeTab
  switch (type) {
    case 'river':
      return { icon: riverIcon, title: '河道水情' }
    case 'reservoir':
      return { icon: reservoirIcon, title: '水库水情' }
    case 'tunnel':
      return { icon: tunnelIcon, title: '下穿隧道' }
    default:
      return { icon: pondingIcon, title: '内涝点' }
  }
}

// 简化的渲染函数，直接渲染
const directRender = () => {
  try {
    renderMetricMarkers()
  } catch (e) {
    console.warn('渲染标记点失败:', e)
  }
}

/** 清理旧弹窗 DOM 与登记 */
const cleanupPopups = () => {
  try { popupDomList.forEach((el) => el?.remove?.()) } catch {}
  popupDomList.length = 0
  try { popups.length = 0 } catch {}
}

/** 渲染指标点位到地图 - 简化版本，参考场所保障页面 */
const renderMetricMarkers = () => {
  console.log('开始渲染地图标记点...')
  
  if (!esriModules || !gisMap.value || !mapView.value) {
    console.warn('地图资源未准备好，跳过渲染')
    return
  }
  if (!metricsLayer.value) {
    metricsLayer.value = new esriModules.GraphicsLayer()
    gisMap.value.add(metricsLayer.value)
  }
  
  // 清理
  metricsLayer.value.removeAll()
  cleanupPopups()

  const { icon, title } = getLayerAsset()
  const list =
    metricsState.sceneActive === 'publicManagement'
      ? ([...(metricsState.pmPipes || []), ...(metricsState.pmPlants || [])])
      : metricsState.sceneActive === 'publicService'
        ? (metricsState.serviceNetworkQuality || [])
        : (currentList.value || [])
        
  console.log(`渲染标记点: ${metricsState.sceneActive} - ${metricsState.panel.activeTab}, 数量: ${list.length}`)
  console.log('渲染列表:', list)
  
  // 简化渲染逻辑，参考场所保障页面
  const graphics = []
  
  for (const item of list) {
    const lon = item?.longitude
    const lat = item?.latitude
    if (lon == null || lat == null) continue
    
    // 公共管理下根据类型选择不同图标
    const markerIcon = (metricsState.sceneActive === 'publicManagement')
      ? (item?.type === 'plant' ? plantIcon : liquidIcon)
      : icon
      
    const marker = createMarkerGraphic(
      [lon, lat],
      markerIcon,
      { id: item?.id, type: metricsState.panel.activeTab },
      { width: 28, height: 34 }
    )
    if (marker) {
      graphics.push(marker)
    }

    // 简易弹窗
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.transform = 'translate(-50%, -100%)'
    el.style.pointerEvents = 'auto'
    el.style.zIndex = '800'
    el.style.display = 'none'
    el.style.background = 'rgba(0,0,0,0.75)'
    el.style.color = '#fff'
    el.style.padding = '6px 8px'
    el.style.border = '1px solid rgba(255,255,255,0.2)'
    el.style.borderRadius = '6px'
    el.style.fontSize = '12px'
    
    // 公共服务：标题使用点位名称，展示关键指标
    if (metricsState.sceneActive === 'publicService') {
      const lines = [
        `<div><b>压力：</b>${item?.pressure ?? '-'} MPa</div>`,
        `<div><b>余氯：</b>${item?.residualChlorine ?? '-'} mg/L</div>`,
        `<div><b>浊度：</b>${item?.turbidity ?? '-'} NTU</div>`
      ].join('')
      const titleText = item?.stationName ?? '-'
      el.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${titleText}</div>${lines}`
    } else {
      el.innerHTML = `<div style="font-weight:600;margin-bottom:2px;">${title}</div>
        <div>${item?.stationName ?? item?.name ?? '-'}</div>
        <div style="opacity:.8;">${formatTime(item?.collectionTime)}</div>`
    }
    mapView.value.container?.appendChild(el)
    popupDomList.push(el)
    createMarkerPopup(el, [lon, lat])
    el.style.display = 'block'
  }
  
  // 批量添加标记点
  if (graphics.length > 0) {
    metricsLayer.value.addMany(graphics)
  }
  
  console.log(`渲染完成: ${graphics.length}个标记点`)
  
  // 标记渲染完成
  loadingState.markersRendered = true
  checkAllRenderComplete()
}

// 当数据或 Tab 变化时重绘（需在 panel 初始化后注册）
let stopMetricsWatcher: any

// 右侧单面板：Tabs/统计卡片/表格
metricsState.panel = reactive({
  activeTab: 'river' as 'river' | 'reservoir' | 'tunnel' | 'ponding'
})

// 简化的监听器，直接渲染
stopMetricsWatcher = watch(
  [
    () => metricsState.panel.activeTab,
    () => metricsState.riverCondition,
    () => metricsState.reservoirCondition,
    () => metricsState.watergateCondition,
    () => metricsState.carResource,
    () => metricsState.sceneActive,            // 场景切换时重绘
    () => metricsState.pmPipes                 // 公共管理：管网监测数据变化时重绘
  ],
  () => {
    directRender() // 直接渲染
  },
  { deep: true }
)

const columnsMap = {
  river: [
    { prop: 'name', label: '站名', width: 120 },
    { prop: 'river', label: '河流', width: 100 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'flow', label: '流量(m³/h)', width: 120 },
    { prop: 'time', label: '采集时间' }
  ],
  reservoir: [
    { prop: 'name', label: '站名', width: 120 },
    { prop: 'river', label: '河流', width: 100 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'amplitude', label: '涨落(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ],
  tunnel: [
    { prop: 'name', label: '站名', width: 140 },
    { prop: 'area', label: '区域', width: 120 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ],
  ponding: [
    { prop: 'name', label: '点位', width: 140 },
    { prop: 'area', label: '区域', width: 120 },
    { prop: 'level', label: '水位(m)', width: 100 },
    { prop: 'time', label: '采集时间' }
  ]
} as const

metricsState.panelColumns = computed(() => columnsMap[metricsState.panel.activeTab])

// 当前供水厂数据
metricsState.currentSupply = computed<any>(() => {
  try {
    const list = (metricsState.service?.list || []) as any[]
    const idx = Number(metricsState.service?.active || '0')
    return list?.[idx] ?? null
  } catch {
    return null
  }
})

// 监听当前供水厂变化并更新图表
watch(
  () => [metricsState.service.active, metricsState.service.list],
  () => {
    try {
      const list = (metricsState.currentSupply?.monthSupplyList || []) as any[]
      serviceMonthChartOptions.value = buildServiceMonthChartOptions(list)
      const week = (metricsState.currentSupply?.weekSupplyList || []) as any[]
      serviceWeekChartOptions.value = buildServiceWeekChartOptions(week)
    } catch {}
  },
  { deep: true }
)

// 右1展示前三个厂的水质数据
metricsState.serviceQualityTop3 = computed<any[]>(() => {
  try {
    const list = metricsState.serviceQuality as any[]
    return (list || []).slice(0, 3)
  } catch {
    return []
  }
})

const currentList = computed<any[]>(() => {
  switch (metricsState.panel.activeTab) {
    case 'river': {
      const data = metricsState.riverCondition as any
      // 尝试多种数据结构
      if (data && Array.isArray(data.detailList)) {
        return data.detailList
      } else if (data && Array.isArray(data)) {
        return data
      } else if (data && data.data && Array.isArray(data.data)) {
        return data.data
      }
      return []
    }
    case 'reservoir': {
      const data = metricsState.reservoirCondition as any
      if (data && Array.isArray(data.detailList)) {
        return data.detailList
      } else if (data && Array.isArray(data)) {
        return data
      } else if (data && data.data && Array.isArray(data.data)) {
        return data.data
      }
      return []
    }
    case 'tunnel': {
      const data = metricsState.watergateCondition as any
      if (data && Array.isArray(data.detailList)) {
        return data.detailList
      } else if (data && Array.isArray(data)) {
        return data
      } else if (data && data.data && Array.isArray(data.data)) {
        return data.data
      }
      return []
    }
    case 'ponding': {
      const data = metricsState.carResource as any
      if (data && Array.isArray(data.detailList)) {
        return data.detailList
      } else if (data && Array.isArray(data)) {
        return data
      } else if (data && data.data && Array.isArray(data.data)) {
        return data.data
      }
      return []
    }
    default:
      return []
  }
})

const mapToRow = (item: any) => {
  if (metricsState.panel.activeTab === 'river') {
    return {
      name: item?.stationName ?? '-',
      river: item?.riverName ?? '-',
      level: item?.waterLevel ?? '-',
      flow: item?.traffic ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  if (metricsState.panel.activeTab === 'reservoir') {
    return {
      name: item?.stationName ?? '-',
      river: item?.riverName ?? '-',
      level: item?.waterLevel ?? '-',
      amplitude: item?.waterLevelAmplitude ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    return {
      name: item?.stationName ?? '-',
      area: item?.areaName ?? '-',
      level: item?.waterLevel ?? '-',
      time: formatTime(item?.collectionTime),
      longitude: item?.longitude,
      latitude: item?.latitude
    }
  }
  return {
    name: item?.stationName ?? item?.pointName ?? '-',
    area: item?.areaName ?? '-',
    level: item?.waterLevel ?? '-',
    time: formatTime(item?.collectionTime),
    longitude: item?.longitude,
    latitude: item?.latitude
  }
}

metricsState.panelTable = computed(() => currentList.value.map(mapToRow))

metricsState.panelStats = computed(() => {
  if (metricsState.panel.activeTab === 'river') {
    const data = metricsState.riverCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.warmNum ?? 0,
      serious: data?.guaranteeNum ?? 0
    }
  }
  if (metricsState.panel.activeTab === 'reservoir') {
    const data = metricsState.reservoirCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.floodLimitNum ?? 0, // 超汛限
      serious: data?.designNum ?? 0, // 超设计
      verification: data?.verificationNum ?? 0 // 超校核
    }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    const data = metricsState.watergateCondition as any
    return {
      total: data?.totalNum ?? currentList.value.length ?? 0,
      alarm: data?.cautionNum ?? 0, // 预警
      serious: data?.alertNum ?? 0  // 警报
    }
  }
  const list = currentList.value
  return {
    total: list.length ?? 0,
    alarm: list.filter((i: any) => ['YELLOW_ALERT', 'ORANGE_ALERT'].includes(i?.warningLevel?.name) || i?.alarm === true).length || 0,
    serious: list.filter((i: any) => ['RED_ALERT'].includes(i?.warningLevel?.name) || i?.serious === true).length || 0
  }
})

// 统计卡文案
metricsState.panelLabels = computed(() => {
  if (metricsState.panel.activeTab === 'reservoir') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超设计报警数', verification: '超校核报警数' }
  }
  if (metricsState.panel.activeTab === 'tunnel') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
  }
  if (metricsState.panel.activeTab === 'ponding') {
    return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
  }
  return { total: '监测总数', alarm: '超警示报警数', serious: '超警戒报警数' }
})

/** 将预警级别名称映射到样式类 */
const getWarningTagClass = (levelName?: string) => {
  switch (levelName) {
    case 'RED_ALERT':
      return 'red'
    case 'ORANGE_ALERT':
      return 'orange'
    case 'YELLOW_ALERT':
      return 'yellow'
    default:
      return ''
  }
}

 

/** 地图定位到表格行坐标 */
metricsState.centerOnPoint = (row: any) => {
  const lon = row?.longitude ?? row?.lon ?? row?.lng
  const lat = row?.latitude ?? row?.lat
  if (!mapView.value || lon == null || lat == null) return
  try {
    mapView.value.goTo({ center: [lon, lat], zoom: 14 })
  } catch (e) {
    console.warn('地图视图定位失败', e)
  }
}

// 跳转水厂详情
metricsState.goPlantDetail = (row: any) => {
  const id = row?.id ?? row?.plantId
  if (id == null) return
  router.push({ name: 'MetricsPlantDetail', params: { id } })
}

// 图片加载事件处理
const onImageLoad = (type: string, event: Event) => {
  const img = event.target as HTMLImageElement
  console.log(`底部按钮图片加载成功: ${type} - ${img.src.split('/').pop()}`)
}

const onImageError = (type: string, event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn(`底部按钮图片加载失败: ${type} - ${img.src}`)
  
  // 可以在这里设置默认图片或重试机制
  // img.src = defaultIconPath
}
</script>
<style lang="scss" scoped>
#mapContainer {
  width: 100vw;  /* 设计稿宽度 */
  height: calc(100vh - 0.6rem); /* 100vh - 0.6rem(菜单栏高度，响应式) */
  position: relative;
}

/* 底部三项操作 - REM响应式优化 */
.bottom-actions {
  position: absolute;
  left: 9.6rem;  /* 960px / 100 = 9.6rem，居中定位 */
  bottom: 0;     /* 贴合底部 */
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 0.4rem;     /* 40px / 100 = 0.4rem */
  align-items: flex-end;
  padding: 0.35rem 0.36rem 0.15rem; /* 35px 36px 15px → 0.35rem 0.36rem 0.15rem，进一步增加上内边距，让内容更高 */
  
  /* 隐藏的图片预渲染容器 */
  .preload-images {
    position: absolute;
    top: -9999px; /* 移出视线但不使用 display: none，让浏览器可以加载图片 */
    left: -9999px;
    pointer-events: none;
    opacity: 0;
  }
  
  /* 梯形底板 */
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 6.86rem;  /* 686px / 100 = 6.86rem，指定宽度 */
    height: 0.58rem; /* 58px / 100 = 0.58rem，调整为0.58rem */
    background: linear-gradient(180deg, rgba(17, 50, 92, 0.72) 0%, rgba(10, 30, 60, 0.72) 100%);
    border: 1px solid rgba(74, 144, 226, 0.35);
    border-bottom: none; /* 底部无边框，贴合底部 */
    box-shadow:
      0 10px 26px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    /* 创建梯形：上边比下边窄 */
    clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
    backdrop-filter: blur(8px);
    z-index: -1;
  }
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem */ /* 增加图片和文字之间的间距 */
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    filter: brightness(1.05);
  }
}

.action-icon {
  width: 0.85rem;  /* 85px / 100 = 0.85rem，操作图标跟随整体缩放 */
  height: 0.75rem; /* 75px / 100 = 0.75rem */
  padding-top: 0.08rem; /* 8px / 100 = 0.08rem，调整内边距 */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.action-icon i {
  width: 0.4rem;   /* 40px / 100 = 0.4rem，小图标跟随整体缩放 */
  height: 0.4rem;  /* 40px / 100 = 0.4rem */
  // border-radius: 50%;
  // background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 100%);
  // box-shadow:
  //   0 4px 12px rgba(0, 0, 0, 0.3),
  //   inset 0 1px 0 rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.22rem;  /* 22px → 0.22rem，操作按钮文字跟随整体缩放 */
}

.action-icon img {
  width: 0.85rem;  /* 85px / 100 = 0.85rem，图标图片跟随整体缩放 */
  height: 0.75rem; /* 75px / 100 = 0.75rem */
  object-fit: contain;
  border-radius: 50%;
}

.action-label {
  color: #fff; /* 所有文字默认为白色 */
  font-size: 0.14rem;  /* 14px → 0.14rem，按钮文字跟随整体缩放 */
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

/* 选中项文字颜色 */
.action-item.secure.active .action-label,
.action-item.manage.active .action-label,
.action-item.service.active .action-label {
  color: #F2C36C; /* 选中项使用金色 */
}
.floating-panel {
  position: absolute;
  top: 50%;       /* 垂直居中 */
  transform: translateY(-50%); /* 垂直居中 */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;     /* 20px / 100 = 0.2rem */
  height: 9.7rem;  /* 970px / 100 = 9.7rem，指定高度 */
  width: 4.9rem;   /* 490px / 100 = 4.9rem，指定宽度 */
  overflow-y: auto;
  margin: 0;
  padding: 0;
  
  &.left-panel {
    left: 0.24rem;   /* 24px / 100 = 0.24rem，统一边距为24px */
    top: 0.84rem;    /* 0.6rem(菜单高度) + 0.24rem(边距) = 0.84rem */
    bottom: 0.24rem; /* 24px / 100 = 0.24rem，下边距 */
    transform: none; /* 取消垂直居中，使用top/bottom定位 */
  }
  
  &.right-panel {
    right: 0.24rem;  /* 24px / 100 = 0.24rem，统一边距为24px */
    top: 0.84rem;    /* 0.6rem(菜单高度) + 0.24rem(边距) = 0.84rem */
    bottom: 0.24rem; /* 24px / 100 = 0.24rem，下边距 */
    transform: none; /* 取消垂直居中，使用top/bottom定位 */
  }
}


.right-two-panels {
  top: 0.84rem;    /* 0.6rem(菜单高度) + 0.24rem(边距) = 0.84rem */
  bottom: 0.24rem; /* 24px / 100 = 0.24rem，下边距 */
  transform: none; /* 取消垂直居中，使用top/bottom定位 */
}
.right-two-panels > .panel-container {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
}
.right-two-panels > .panel-container .container-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 公共服务右1 顶部三厂块样式 */
.ps-top3 {
  display: flex;
  flex-direction: column;
  gap: 0.14rem;  /* 14px / 100 = 0.14rem */
}
.ps-top3 .plant-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;   /* 10px / 100 = 0.1rem */
}
.ps-top3 .plant-title {
  color: #e6f4ff;
  font-size: 0.14rem;  /* 14px → 0.14rem，面板标题跟随整体缩放 */
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.row-cards.compact {
  gap: 0.12rem;  /* 12px / 100 = 0.12rem */
}
.row-cards.compact .metric-card { padding: 0.12rem; /* 12px / 100 = 0.12rem */ }
.row-cards.compact .metric-card .card-label { font-size: clamp(10px, 0.7vw, 14px); margin-bottom: 0.06rem; /* 数据标签使用clamp确保可读性 */ }
.row-cards.compact .metric-card .card-value { font-size: clamp(16px, 1.2vw, 24px); /* 数据值使用clamp确保可读性 */ }

/* 公共管理两个右侧浮窗的垂直分布 */
.right-panel--stats {
  top: 0.84rem;    /* 0.6rem(菜单高度) + 0.24rem(边距) = 0.84rem */
  transform: none; /* 取消垂直居中，使用top定位 */
  /* 统计卡较矮，避免滚动条 */
  height: auto;
  overflow: visible;
}
.right-panel--stats .panel-container {
  max-height: 2.1rem; /* 210px / 100 = 2.1rem */
}
.right-panel--stats .container-content {
  flex: 0 0 auto;
}


.right-panel--pipes {
  top: 0.84rem;    /* 0.6rem(菜单高度) + 0.24rem(边距) = 0.84rem */
  transform: none; /* 取消垂直居中，使用top定位 */
  max-height: 3rem; /* 300px / 100 = 3rem，保持原有高度 */
  overflow-y: auto;
}
.right-panel--pipes .panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 右3 浮窗：固定在底部，避免与右2重叠 */
.right-panel--river {
  bottom: 24px;  /* 下边距24px */
  top: auto;
  height: 440px; /* 固定高度，便于右2计算剩余空间 */
  overflow: hidden;
}
.right-panel--pipes .container-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.right-panel--pipes .table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
}

/* 公共管理右侧 1:3:3 栈式布局容器 */
.right-stack {
  position: absolute;
  right: 0.24rem;  /* 24px / 100 = 0.24rem，统一边距为24px */
  top: 50%;        /* 垂直居中 */
  transform: translateY(-50%); /* 垂直居中 */
  width: 4.9rem;  /* 490px / 100 = 4.9rem，固定宽度 */
  height: 9.7rem; /* 970px / 100 = 9.7rem，固定高度 */
  display: flex;
  flex-direction: column;
  gap: 0.2rem;    /* 20px / 100 = 0.2rem */
}
.right-stack .panel-container.flex-1 { flex: 1 1 0; }
.right-stack .panel-container.flex-3 { flex: 3 1 0; }
.right-stack .panel-container .container-content { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.right-stack .panel-container .table-wrapper { flex: 1 1 auto; min-height: 0; }

/* 右侧（1:3:3）中的表格深色主题，保持与其他表格一致 */
.right-stack {
  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.08rem 0;  /* 8px / 100 = 0.08rem */
    font-size: clamp(10px, 0.7vw, 14px);  /* 表格内容使用clamp确保可读性 */
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.06rem 0;  /* 6px / 100 = 0.06rem */
    font-size: clamp(10px, 0.7vw, 14px);  /* 表格内容使用clamp确保可读性 */
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* 右3 卡片缩小，图表更大 */
.right3-panel .right3-cards-row .metric-card {
  padding: 0.12rem;  /* 12px / 100 = 0.12rem */
}
.right3-panel .right3-cards-row .metric-card .card-label { font-size: clamp(9px, 0.6vw, 13px); margin-bottom: 6px; /* 右侧面板标签使用clamp */ }
.right3-panel .right3-cards-row .metric-card .card-value { font-size: clamp(16px, 1.2vw, 24px); /* 右侧面板数值使用clamp */ }

/* 容器样式 - 深色主题 */
.panel-container {
  display: flex;             /* 作为列布局，让内容区可伸缩 */
  flex-direction: column;
  min-height: 0;             /* 允许在父级 flex 容器内收缩高度 */
  // background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  background: linear-gradient( 180deg, rgba(0,40,96,0) 0%, rgba(0,42,95,0.09) 23%, rgba(0,42,97,0.24) 45%, rgba(0,40,96,0.27) 100%), linear-gradient( 180deg, rgba(16,98,222,0.12) 0%, rgba(17,96,219,0.11) 55%, rgba(19,98,215,0.05) 76%, rgba(0,95,223,0.03) 100%), rgba(0,15,42,0.7);
  // backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

.panel-container.fill {
  height: 100%;
}

/* 左侧三个面板的纵向比例控制（1:2:3） */
.left-panel .panel-container.flex-1 { 
  flex: 1 1 0; 
  min-height: 120px; /* 确保有足够的最小高度 */
}
.left-panel .panel-container.flex-2 { flex: 2 1 0; }
.left-panel .panel-container.flex-3 { flex: 3 1 0; }

/* 容器头部 - 深色主题 */
.container-header {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(74, 144, 226, 0.1) 20%, 
    rgba(74, 144, 226, 0.3) 40%, 
    rgba(74, 144, 226, 0.6) 50%, 
    rgba(74, 144, 226, 0.3) 60%, 
    rgba(74, 144, 226, 0.1) 80%, 
    transparent 100%
  );
  color: white;
  display: flex;
  align-items: center;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem */
  // border-bottom: 1px solid rgba(74, 144, 226, 0.3);
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 4.6rem;   /* 460px / 100 = 4.6rem，头部宽度跟随整体缩放 */
  height: 0.28rem;  /* 28px / 100 = 0.28rem，头部高度跟随整体缩放 */
  padding: 0.08rem;   /* 8px / 100 = 0.08rem */
  margin: 0.12rem 0.12rem;  /* 12px / 100 = 0.12rem */
  
  /* 添加一个额外的渐变层来增强效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(53, 122, 189, 0.1) 25%, 
      rgba(53, 122, 189, 0.4) 50%, 
      rgba(53, 122, 189, 0.1) 75%, 
      transparent 100%
    );
    pointer-events: none;
  }
  
  .header-icon {
    width: 0.32rem;  /* 32px / 100 = 0.32rem，图标容器跟随整体缩放 */
    height: 0.32rem; /* 32px / 100 = 0.32rem */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    
    .title-icon {
      width: 0.25rem;  /* 25px / 100 = 0.25rem，标题图标跟随整体缩放 */
      height: 0.25rem; /* 25px / 100 = 0.25rem */
    }
    
    i {
      width: 0.16rem;  /* 16px / 100 = 0.16rem，小图标跟随整体缩放 */
      height: 0.16rem; /* 16px / 100 = 0.16rem */
      background: none;
      border-radius: 2px;
      
      &.icon-supervision::before {
        content: "🔍";
        color: #4A90E2;
        font-size: 0.14rem;  /* 14px → 0.14rem，图标文字跟随整体缩放 */
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-rainfall::before {
        content: "🌧️";
        font-size: 0.14rem;  /* 14px → 0.14rem，图标文字跟随整体缩放 */
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      
      &.icon-warning::before {
        content: "⚠️";
        font-size: 0.14rem;  /* 14px → 0.14rem，图标文字跟随整体缩放 */
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
    font-family: 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
    font-weight: normal;
    font-size: 0.16rem;  /* 16px → 0.16rem，界面文字跟随整体缩放 */
    color: #FFFFFF;
    text-shadow: 0px 0px 7px rgba(75,180,229,0.69), 0px 2px 8px rgba(5,28,55,0.42);
    position: relative;
    z-index: 1;
  }
}

/* 容器内容 */
.container-content {
  padding: 0.2rem;   /* 20px / 100 = 0.2rem */
  flex: 1 1 auto;    /* 填满面板剩余空间 */
  min-height: 0;     /* 避免因内容撑开导致比例失效 */
  display: flex;      /* 让内部列表可按剩余高度伸展 */
  flex-direction: column;
  // background: rgba(0, 0, 0, 0.3);
}

/* 污水处理检测容器内容优化 */
.left-panel .panel-container.flex-1 .container-content {
  padding: 0.16rem 0.2rem 0.2rem 0.2rem; /* 16px 20px 20px 20px → rem，调整上边距，给卡片更多空间 */
  justify-content: flex-start;
}

/* 表格自适应容器剩余高度 */
.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 6px;
  /* 让 el-table 在 flex 子容器内按百分比高度工作 */
  display: flex;
}
.table-wrapper :deep(.el-table) {
  flex: 1 1 auto;
}

/* 右3 图表容器占满空间 */
.chart-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.chart-title {
  margin-top: 10px;
  color: #e6f4ff;
  font-size: 0.14rem;  /* 14px → 0.14rem，标题文字跟随整体缩放 */
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* 右3 上方卡片：紧凑样式 */
.stats-row--compact .metric-card { padding: 12px; }
.stats-row--compact .metric-card .card-label { font-size: clamp(9px, 0.6vw, 13px); margin-bottom: 6px; /* 紧凑卡片标签使用clamp */ }
.stats-row--compact .metric-card .card-value { font-size: clamp(16px, 1.2vw, 24px); /* 紧凑卡片数值使用clamp */ }

/* 督导检查 - 指标卡片样式 */
.metric-cards {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;  /* 16px / 100 = 0.16rem */
}

.row-cards {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem */
  flex-wrap: wrap;
  margin-bottom: 8px; /* 添加底部间距 */
}

.row-cards .metric-card {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.14rem;  /* 14px / 100 = 0.14rem */
}

/* 两行卡片排布：5张卡片在两行内自动换行 */
/* 更均匀的两行卡片排布：第一行 3 列，第二行 2 列 */
.two-rows {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.1rem;   /* 10px / 100 = 0.1rem */
}
.two-rows .metric-card { grid-column: span 2; }
.two-rows .metric-card:nth-child(n+4) { grid-column: span 3; }

/* 左1横排卡片（公共管理-污水处理检测）优化高度和间距 */
.left-panel .row-cards .metric-card {
  height: auto; /* 改为自适应高度 */
  min-height: 100px; /* 设置最小高度确保内容完整显示 */
  padding: 0.16rem 0.12rem; /* 16px 12px → rem，调整内边距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-panel .row-cards .metric-card .card-label {
  font-size: clamp(10px, 0.7vw, 14px); /* 数据标签使用clamp确保可读性 */
  margin-bottom: 10px;
  line-height: 1.2;
}

.left-panel .row-cards .metric-card .card-value {
  font-size: clamp(20px, 1.5vw, 30px); /* 数据值使用clamp确保可读性 */
  font-weight: 600;
  line-height: 1.1;
}

/* 右侧面板 - 横向统计卡片行 */
.stats-row {
  display: flex;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem */
  margin-top: 0.08rem;  /* 8px / 100 = 0.08rem */
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.stats-row .metric-card {
  flex: 1 1 0;
}

.tabs-compact {
  margin-top: -6px;
  margin-bottom: 6px;
}

/* 自定义 tabs 样式，参考 dispatch 页面 */
.custom-tabs {
  margin-top: -6px;
  margin-bottom: 6px;
}

.custom-tabs-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  gap: 0;
  margin-bottom: 8px;
  padding: 0 0 4px 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-tab-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  border: none;
  font-size: 0.14rem;  /* 14px → 0.14rem，按钮文字跟随整体缩放 */
  padding: 0.04rem 0.12rem;  /* 4px 12px → rem */
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.custom-tab-btn.active {
  color: #9fd1ff;
  position: relative;
}

.custom-tab-btn.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 2px;
  background: #4a90e2;
}

/* 右侧表格深色主题，参考 dispatch 页面 */
.right-panel {
  :deep(.el-tabs__header) {
    margin: 0 0 6px;
  }
  :deep(.el-tabs__item) {
    color: #e6f4ff;
  }
  :deep(.el-tabs__item.is-active) {
    color: #fff;
    font-weight: 600;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* 统一左右面板表格深色主题（左3表格复用相同风格） */
.left-panel {
  :deep(.el-table) {
    --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
    --el-table-tr-bg-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(74, 144, 226, 0.18);
    --el-table-border-color: rgba(255, 255, 255, 0.08);
    background: transparent;
    color: #e6f4ff;
  }
  :deep(.el-table th.el-table__cell) {
    background: rgba(255, 255, 255, 0.06);
    color: #e6f4ff;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  :deep(.el-table__body tr:hover>td),
  :deep(.el-table__body tr.el-table__row:hover>td) {
    background: rgba(74, 144, 226, 0.18) !important;
    color: #e6f4ff !important;
  }
  :deep(.el-table__body tr.el-table__row--current>td) {
    background: rgba(74, 144, 226, 0.24) !important;
    color: #ffffff !important;
  }
  :deep(.el-table .cell) { color: inherit; }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.03);
  }
}
/* 左侧面板 Tabs 样式（优化白边效果，统一深色风格） */
.left-panel {
  :deep(.el-tabs__header) {
    margin: 0 0 6px;
    border-bottom: 0 none;
  }
  :deep(.el-tabs__nav-wrap::after) { /* 移除底部分隔线 */
    height: 0 !important;
  }
  :deep(.el-tabs__item) {
    color: #cfe8ff;
    border: none;
    background: transparent;
  }
  :deep(.el-tabs__item.is-active) {
    color: #ffffff;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }
  :deep(.el-tabs__active-bar) {
    background-color: #66A9FF;
    height: 3px;
    border-radius: 2px;
  }
}

.metric-card {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(53, 122, 189, 0.3) 100%);
  border-radius: 12px;
  padding: 0.2rem;   /* 20px / 100 = 0.2rem */
  text-align: center;
  border: 2px solid rgba(74, 144, 226, 0.4);
  position: relative;
  transition: all 0.3s ease;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  
  // 第一个卡片 - 绿色文字
  &:nth-child(1) {
    .card-label {
      color: #3EEAB7;
    }
    .card-value {
      color: #3EEAB7;
    }
  }
  
  // 第二个卡片 - 橙色文字
  &:nth-child(2) {
    .card-label {
      color: #FF722C;
    }
    .card-value {
      color: #FF722C;
    }
  }
  
  // 第三个卡片 - 红色文字
  &:nth-child(3) {
    .card-label {
      color: #FF5353;
    }
    .card-value {
      color: #FF5353;
    }
  }
  
  .card-label {
    font-size: clamp(11px, 0.75vw, 15px);  /* 卡片标签使用clamp确保可读性 */
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
    font-weight: 500;
    line-height: 1.2;
  }
  
  .card-value {
    font-size: clamp(22px, 1.8vw, 36px);  /* 卡片数值使用clamp确保可读性 */
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1;
  }
}

/* 雨量分布样式 */
.rainfall-content {
  display: flex;
  gap: 0.2rem;   /* 20px / 100 = 0.2rem */
}

.rainfall-map {
  flex: 1;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(53, 122, 189, 0.2) 100%);
  border-radius: 8px;
  padding: 0.2rem;   /* 20px / 100 = 0.2rem */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 144, 226, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  
  .map-placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.14rem;  /* 14px → 0.14rem，地图提示文字跟随整体缩放 */
  }
}

.rainfall-legend {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;  /* 8px / 100 = 0.08rem */
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.04rem 0;  /* 4px / 100 = 0.04rem */
  
  &.highlight {
    .legend-label {
      color: #4A90E2;
    }
  }
  
  .legend-label {
    font-size: clamp(10px, 0.7vw, 14px);  /* 图例标签使用clamp确保可读性 */
    color: white;
  }
  
  .legend-count {
    font-size: clamp(10px, 0.7vw, 14px);  /* 图例数值使用clamp确保可读性 */
    color: white;
    font-weight: 600;
  }
}

/* 预警信息样式 */
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;  /* 8px / 100 = 0.08rem */
  flex: 1 1 auto;     /* 占满可用高度 */
  min-height: 0;      /* 允许在父容器内收缩 */
  overflow-y: auto;   /* 超出滚动 */
  padding-right: 6px; /* 给滚动条预留一点空间 */
  /* 隐藏滚动条（各主流浏览器） */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.warning-list::-webkit-scrollbar { /* Chrome/Safari */
  width: 0;
  height: 0;
}

.warning-item {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border-radius: 8px;
  padding: 0.12rem 0.14rem;  /* 12px 14px → rem */
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右布局 */
  gap: 0.1rem;   /* 10px / 100 = 0.1rem */
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .warning-main {
    display: flex;
    flex-direction: column;
    gap: 0.04rem;  /* 4px / 100 = 0.04rem */
    min-width: 0; /* 使文本在 flex 中可收缩 */
  }
  
  .warning-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* 右对齐 */
    gap: 0.06rem;  /* 6px / 100 = 0.06rem */
    flex: 0 0 auto;
  }
  
  .warning-type {
    font-size: clamp(10px, 0.7vw, 14px);  /* 警告类型使用clamp确保可读性 */
    color: rgba(255, 255, 255, 0.7);
  }
  
  .warning-message {
    font-size: clamp(12px, 0.85vw, 16px);  /* 警告信息使用clamp确保可读性 */
    color: white;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-all;
  }
  
  .warning-tag {
    display: inline-block;
    padding: 0.02rem 0.08rem;  /* 2px 8px → rem */
    border-radius: 4px;
    font-size: clamp(9px, 0.6vw, 13px);  /* 警告标签使用clamp确保可读性 */
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
    font-size: clamp(9px, 0.6vw, 13px);  /* 警告时间使用clamp确保可读性 */
    color: #999;
  }
}

/* DataV自适应：移除响应式设计，统一使用1920x1080设计稿的固定尺寸 */

/* Element Plus 全局加载遮罩自定义样式 */
:deep(.metrics-global-loading) {
  .el-loading-mask {
    background: linear-gradient(135deg, #0a1e3c 0%, #1a2b4a 100%) !important;
  }
  
  .el-loading-text {
    color: #e6f4ff !important;
    font-size: clamp(14px, 1vw, 18px) !important;  /* 加载文字使用clamp确保可读性 */
    margin-top: 16px !important;
  }
  
  .el-loading-spinner {
    .circular {
      width: 60px !important;
      height: 60px !important;
    }
    
    .path {
      stroke: #4A90E2 !important;
      stroke-width: 3 !important;
    }
  }
}

/* 骨架屏样式 */
.skeleton-loader {
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-card {
  @extend .skeleton-loader;
  height: 80px;
  margin-bottom: 12px;
}

.skeleton-table-row {
  @extend .skeleton-loader;
  height: 40px;
  margin-bottom: 0.08rem;  /* 8px / 100 = 0.08rem */
  border-radius: 4px;
}

.table-skeleton {
  padding: 0.12rem;  /* 12px / 100 = 0.12rem */
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skeleton-chart {
  @extend .skeleton-loader;
  height: 100%;
  border-radius: 8px;
}
</style>
