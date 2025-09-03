<template>
  <!-- 地图容器 -->
  <div
    id="mapContainer"
    v-loading="isLoading"
    :element-loading-background="`rgba(${
      loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'
    })`"
    :element-loading-text="loadingText"
    :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"
  ></div>

  <!-- 左侧悬浮区域 -->
  <div class="floating-panel left-panel">
    <!-- 调度资源概况 -->
    <div class="panel-container">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-supervision"></i>
        </div>
        <h3>调度资源概况</h3>
      </div>
      <div class="container-content">
        <div class="metric-cards">
          <div class="metric-card">
            <div class="card-icon">
              <img src="@/assets/imgs/sector/car.png" alt="车辆" />
            </div>
            <div class="card-content">
              <div class="card-label">车辆总数</div>
              <div class="card-value">{{ resourceCounts.vehicles }}</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="card-icon">
              <img src="@/assets/imgs/sector/people.png" alt="人员" />
            </div>
            <div class="card-content">
              <div class="card-label">人员总数</div>
              <div class="card-value">{{ resourceCounts.personnel }}</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="card-icon">
              <img src="@/assets/imgs/sector/house.png" alt="仓库" />
            </div>
            <div class="card-content">
              <div class="card-label">仓库总数</div>
              <div class="card-value">{{ resourceCounts.warehouses }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未结案事件 -->
    <div class="panel-container stretch">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-unreslove"></i>
        </div>
        <h3>未结案事件</h3>
      </div>
      <div class="container-content">
        <div class="unreslove-content">
          <el-input
            v-model="searchQuery"
            placeholder="搜索 标题/类型/地址/联系人/电话"
            clearable
            :prefix-icon="Search"
            class="event-search"
          />
          <div class="event-list">
            <div class="event-card" v-for="event in filteredEvents" :key="event.id">
              <div class="event-info">
                <div class="event-title">{{ event.eventTitle }}</div>
                <div class="event-details">
                  <div class="event-detail-item">
                    <span class="detail-label">事件类型:</span>
                    <span class="detail-value">{{ event.eventType?.desc }}</span>
                  </div>
                  <div class="event-detail-item">
                    <span class="detail-label">地址:</span>
                    <span class="detail-value">{{ event.eventAddress }}</span>
                  </div>
                  <div class="event-detail-item">
                    <span class="detail-label">联系人:</span>
                    <span class="detail-value">{{ event.contactPerson }}</span>
                  </div>
                  <div class="event-detail-item">
                    <span class="detail-label">电话:</span>
                    <span class="detail-value">{{ event.contactNumber }}</span>
                  </div>
                </div>
              </div>
              <div class="event-action">
                <button class="view-details-btn">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧悬浮区域 -->
  <div class="floating-panel right-panel">
    <div class="panel-container equal">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-warning"></i>
        </div>
        <h3>仓库管理</h3>
      </div>
      <div class="container-content">
        <div class="right-content-box">
          <div class="warehouse-list">
            <div
              class="warehouse-card"
              v-for="wh in warehouseResourceData"
              :key="wh.id || wh.warehouseId"
            >
              <div class="warehouse-info">
                <div class="warehouse-title">{{ wh.name || wh.warehouseName || '—' }}</div>
                <div class="warehouse-details">
                  <div class="warehouse-detail-item">
                    <span class="detail-label">地址：</span>
                    <span class="detail-value">{{ wh.address || wh.warehouseAddress || '—' }}</span>
                  </div>
                  <div class="warehouse-detail-row">
                    <div class="warehouse-detail-item">
                      <span class="detail-label">联系人：</span>
                      <span class="detail-value">{{ wh.contactPerson || wh.linkman || '—' }}</span>
                    </div>
                    <div class="warehouse-detail-item">
                      <span class="detail-label">电话：</span>
                      <span class="detail-value">{{ wh.contactNumber || wh.phone || '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="warehouse-action">
                <button class="view-details-btn">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-container equal">
      <div class="container-header">
        <div class="header-icon">
          <i class="icon-warning"></i>
        </div>
        <h3>资源调度</h3>
      </div>
      <div class="container-content">
        <div class="right-content-box">
          <div class="resource-tabs">
            <div class="resource-tabs-header">
              <button
                class="resource-tab-btn"
                :class="{ active: activeResourceTab === 'vehicles' }"
                @click="activeResourceTab = 'vehicles'"
              >车辆资源</button>
              <button
                class="resource-tab-btn"
                :class="{ active: activeResourceTab === 'persons' }"
                @click="activeResourceTab = 'persons'"
              >人员资源</button>
            </div>
            <div class="resource-tabs-content">
              <template v-if="activeResourceTab === 'vehicles'">
                <el-table :data="carResourceData" height="100%" size="small" stripe>
                  <el-table-column label="车辆编号" prop="carCode" min-width="120" />
                  <el-table-column label="类型" min-width="100">
                    <template #default="{ row }">
                      {{ row.carType?.desc || '—' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="联系人" prop="contactPerson" min-width="120" />
                  <el-table-column label="状态" min-width="100">
                    <template #default="{ row }">
                      <el-tag :type="row.carStatus?.name === 'ONLINE' ? 'success' : 'info'" size="small">
                        {{ row.carStatus?.desc || '—' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" fixed="right">
                    <template #default="{ row }">
                      <el-button type="primary" plain circle size="small" @click="centerOnCar(row)">
                        <el-icon :size="16"><Location /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
              <template v-else>
                <el-table :data="personResourceData" height="100%" size="small" stripe>
                  <el-table-column label="姓名" min-width="120">
                    <template #default="{ row }">
                      {{ row.name || row.userName || row.personName || row.contactPerson || '—' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="联系方式" min-width="130">
                    <template #default="{ row }">
                      {{ row.phone || row.mobile || row.contactNumber || row.tel || '—' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="部门" min-width="140">
                    <template #default="{ row }">
                      {{ row.department || row.departmentName || row.deptName || row.orgName || '—' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" min-width="100">
                    <template #default="{ row }">
                      <el-tag :type="(row.status?.name || row.state || row.carStatus?.name) === 'ONLINE' ? 'success' : 'info'" size="small">
                        {{ row.status?.desc || row.stateDesc || row.carStatus?.desc || row.status || row.state || '—' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" fixed="right">
                    <template #default="{ row }">
                      <el-button type="primary" plain circle size="small" @click="centerOnCar(row)">
                        <el-icon :size="16"><Location /></el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted, computed } from "vue";
import { Search, Location } from "@element-plus/icons-vue";
import { initGisMap, createMarkerGraphic, esriModules } from "@/utils/gis";
import carIcon from "@/assets/imgs/sector/car.png";
import { DispatchApi } from "@/api/sector/dispatch";

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const resourceLayer = shallowRef<any>(null);
const isLoading = ref<boolean>(true);
const loadingText = ref<string>("地图加载中...");

const carResourceData = ref<any[]>([]);
const personResourceData = ref<any[]>([]);
const warehouseResourceData = ref<any[]>([]);
const unclosedEvents = ref<any[]>([]);
const searchQuery = ref<string>("");
const activeResourceTab = ref<string>("vehicles");

const filteredEvents = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase();
  if (!kw) return unclosedEvents.value;
  return unclosedEvents.value.filter((e: any) => {
    const title = e.eventTitle || "";
    const type = e.eventType?.desc || "";
    const addr = e.eventAddress || "";
    const contact = e.contactPerson || "";
    const phone = e.contactNumber || "";
    return [title, type, addr, contact, phone]
      .some(v => String(v).toLowerCase().includes(kw));
  });
});

const resourceCounts = ref<any>({
  vehicles: 0,
  personnel: 0,
  warehouses: 0,
});

const initMap = async () => {
  console.log("初始化地图");
  const { map, view } = await initGisMap(document.getElementById("mapContainer"));
  console.log(map, view);
  mapView.value = view;
  gisMap.value = map;
  isLoading.value = false;
  // 初始化资源图层
  try {
    if (esriModules && map && !resourceLayer.value) {
      resourceLayer.value = new esriModules.GraphicsLayer();
      map.add(resourceLayer.value);
    }
  } catch (e) {
    console.warn("初始化资源图层失败", e);
  }
};

// 调用 DispatchApi 中不需要参数的接口
const testDispatchApi = async () => {
  try {
    console.log("=== 开始调用 DispatchApi 接口 ===");

    // 1. 获取车辆资源
    console.log("1. 调用 getCarResource (获取车辆资源):");
    const carResource = await DispatchApi.getCarResource();
    console.log("车辆资源数据:", carResource);

    // 存储车辆资源数据并更新计数
    if (carResource && carResource.data) {
      carResourceData.value = Array.isArray(carResource.data)
        ? carResource.data
        : [carResource.data];
    } else if (Array.isArray(carResource)) {
      // 如果API直接返回数组
      carResourceData.value = carResource;
    }

    // 直接使用数组长度
    resourceCounts.value.vehicles = carResourceData.value.length;

    // 2. 获取人员资源
    console.log("2. 调用 getPersonResource (获取人员资源):");
    const personResource = await DispatchApi.getPersonResource();
    console.log("人员资源数据:", personResource);

    // 存储人员资源数据并更新计数
    if (personResource && personResource.data) {
      personResourceData.value = Array.isArray(personResource.data)
        ? personResource.data
        : [personResource.data];
    } else if (Array.isArray(personResource)) {
      // 如果API直接返回数组
      personResourceData.value = personResource;
    }

    // 直接使用数组长度
    resourceCounts.value.personnel = personResourceData.value.length;

    // 3. 获取调度资源概况
    console.log("3. 调用 getResourceOverview (获取调度资源概况):");
    const resourceOverview = await DispatchApi.getResourceOverview();
    console.log("调度资源概况数据:", resourceOverview);

    // 4. 获取仓库管理
    console.log("4. 调用 getWarehouseManagement (获取仓库管理):");
    const warehouseManagement = await DispatchApi.getWarehouseManagement();
    console.log("仓库管理数据:", warehouseManagement);

    // 存储仓库资源数据并更新计数
    if (warehouseManagement && warehouseManagement.data) {
      warehouseResourceData.value = Array.isArray(warehouseManagement.data)
        ? warehouseManagement.data
        : [warehouseManagement.data];
    } else if (Array.isArray(warehouseManagement)) {
      // 如果API直接返回数组
      warehouseResourceData.value = warehouseManagement;
    }

    // 直接使用数组长度
    resourceCounts.value.warehouses = warehouseResourceData.value.length;

    // 5. 获取未结案事件
    console.log("5. 调用 getUnresolvedEvent (获取未结案事件):");
    const unclosedCaseEvent = await DispatchApi.getUnresolvedEvent("");
    console.log("未结案事件数据:", unclosedCaseEvent);

    // 存储未结案事件数据
    if (unclosedCaseEvent && unclosedCaseEvent.data) {
      unclosedEvents.value = Array.isArray(unclosedCaseEvent.data)
        ? unclosedCaseEvent.data
        : [unclosedCaseEvent.data];
    } else if (Array.isArray(unclosedCaseEvent)) {
      unclosedEvents.value = unclosedCaseEvent;
    }

    console.log("=== DispatchApi 接口调用完成 ===");
    console.log("资源计数:", resourceCounts.value);
  } catch (error) {
    console.error("调用 DispatchApi 接口时出错:", error);
  }
};

onMounted(() => {
  initMap();
  // 延迟调用 API，确保地图初始化完成
  setTimeout(() => {
    testDispatchApi();
  }, 2000);
});

// 添加点并定位到车辆位置
const centerOnCar = (row: any) => {
  const lon = row.longitude;
  const lat = row.latitude;
  if (!mapView.value || lon == null || lat == null) return;
  try {
    // 确保有资源图层
    if (esriModules && gisMap.value && !resourceLayer.value) {
      resourceLayer.value = new esriModules.GraphicsLayer();
      gisMap.value.add(resourceLayer.value);
    }
    // 清理旧要素并添加新点
    if (resourceLayer.value) {
      resourceLayer.value.removeAll();
      const marker = createMarkerGraphic([lon, lat], carIcon, { id: row.id, type: "car" });
      if (marker) resourceLayer.value.add(marker);
    }
    // 视图居中
    mapView.value.goTo({ center: [lon, lat], zoom: 14 });
  } catch (e) {
    console.warn("地图视图定位失败", e);
  }
};
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
  height: 100%;

  &.left-panel {
    left: 20px;
    width: 500px;
    // 第二个panel-container布满剩下的高度
  }
  
  &.right-panel {
    right: 20px;
    width: 500px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: calc(100vh - 100px);
    overflow: hidden; /* 外层不滚动，由子容器滚动 */
  }
}

/* 容器样式 - 深色主题 */
.panel-container {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  /* 让面板默认按内容高度渲染 */
  flex: 0 0 auto;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(74, 144, 226, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  /* 第二个面板：占满剩余高度，内容区内部滚动 */
  &.stretch {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .container-content {
      flex: 1 1 auto;
      min-height: 0; /* 防止子元素撑开 */
      overflow: hidden; /* 外层不滚动 */
      display: flex;
      flex-direction: column;

      .unreslove-content {
        flex: 1 1 auto;
        min-height: 0;

        .event-list {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto; /* 在这里滚动 */
        }
      }
    }
  }
  
  /* 右侧两个面板：等分父容器高度，内部可滚动 */
  &.equal {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;

    .container-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .right-content-box {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        /* 隐藏滚动条但保持滚动功能 */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        &::-webkit-scrollbar { display: none; }

        /* 资源 tabs 使表格自适应剩余高度 */
        .resource-tabs {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* 自定义 tabs 布局 */
        .resource-tabs-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          gap: 16px;
          padding-bottom: 12px;
          margin-bottom: 12px;
          background: linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0));
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .resource-tab-btn {
          background: transparent;
          color: rgba(255, 255, 255, 0.75);
          border: none;
          font-weight: 600;
          padding: 4px 2px;
          cursor: pointer;
        }
        .resource-tab-btn.active {
          color: #9fd1ff;
          position: relative;
        }
        .resource-tab-btn.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -13px;
          height: 2px;
          background: #4a90e2;
        }
        .resource-tabs-content {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
        }

        /* 表格深色主题优化 */
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
        :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
          background: rgba(255, 255, 255, 0.03);
        }
        :deep(.el-button.is-circle) {
          background: rgba(74, 144, 226, 0.2);
          border-color: rgba(74, 144, 226, 0.5);
        }
        :deep(.el-button.is-circle:hover) {
          background: rgba(74, 144, 226, 0.35);
        }
      }
    }
  }
}

/* 容器头部 - 深色主题 */
.container-header {
  background: linear-gradient(
    90deg,
    rgba(74, 144, 226, 0.9) 0%,
    rgba(74, 144, 226, 0.6) 30%,
    rgba(74, 144, 226, 0.3) 60%,
    rgba(74, 144, 226, 0.1) 80%,
    transparent 100%
  );
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
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(53, 122, 189, 0.4) 0%,
      rgba(53, 122, 189, 0.2) 50%,
      transparent 100%
    );
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    z-index: 1;

    i {
      width: 16px;
      height: 16px;
      background: none;
      border-radius: 2px;

      &.icon-supervision::before {
        content: "🔍";
        color: #4a90e2;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      &.icon-unreslove::before {
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

/* 调度资源概况 - 指标卡片样式 */
.metric-cards {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: space-between;
}

.metric-card {
  flex: 1;
  // background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  // border-radius: 12px;
  // padding: 16px;
  // border: 2px solid rgba(74, 144, 226, 0.4);
  position: relative;
  // transition: all 0.3s ease;
  // box-shadow:
  //   0 4px 16px rgba(0, 0, 0, 0.3),
  //   inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;

  .card-icon {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    img {
      width: 56px;
      height: 56px;
    }
  }

  .card-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    min-height: 40px;
  }

  .card-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    align-self: flex-start;
    margin-bottom: auto;
  }

  .card-value {
    font-size: 24px;
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    // align-self: flex-end;
    margin-top: auto;
  }
}

/* 未结案事件样式 */
.unreslove-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-search {
  margin-bottom: 4px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 占满父容器剩余高度，由父级flex控制 */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;

  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.event-card {
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-title {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-detail-item {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.4;
}

.detail-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 4px;
  flex-shrink: 0;
}

.detail-value {
  color: #ffffff;
  flex: 1;
  word-break: break-all;
}

.event-action {
  flex-shrink: 0;
  margin-left: 12px;
}

.view-details-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(135deg, #357abd 0%, #2e6ba8 100%);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 仓库管理样式（参考未结案事件列表） */
.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;

  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar { display: none; }
}

.warehouse-card {
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }
}

.warehouse-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warehouse-title {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.warehouse-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.warehouse-detail-row {
  display: flex;
  gap: 24px;
}

.warehouse-detail-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.warehouse-action {
  flex-shrink: 0;
  margin-left: 12px;
}

/* 仓库管理样式（参考未结案事件列表） */
.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.warehouse-card {
  background: linear-gradient(135deg, rgba(13, 41, 79, 0.9) 0%, rgba(25, 57, 99, 0.8) 100%);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }
}

.warehouse-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warehouse-title {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.warehouse-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warehouse-detail-row {
  display: flex;
  gap: 24px;
}

.warehouse-detail-item {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.4;
}

.warehouse-action {
  flex-shrink: 0;
  margin-left: 12px;
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
      background: #ff4d4f;
    }

    &.yellow {
      background: #faad14;
    }

    &.orange {
      background: #ff7a00;
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

  .metric-cards {
    flex-direction: column;
    gap: 12px;
  }

  .metric-card {
    padding: 12px;
    gap: 8px;

    &::after {
      height: 4px;
    }

    .card-icon img {
      width: 28px;
      height: 28px;
    }

    .card-content {
      min-height: 32px;
    }

    .card-label {
      font-size: 11px;
    }

    .card-value {
      font-size: 18px;
    }
  }

  .event-list {
    max-height: 300px;
  }

  .event-card {
    padding: 12px;
  }

  .event-title {
    font-size: 13px;
  }

  .event-detail-item {
    font-size: 11px;
  }

  .view-details-btn {
    padding: 4px 8px;
    font-size: 11px;
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
    padding: 10px 8px;
    gap: 6px;

    &::after {
      height: 3px;
      width: 70%;
    }

    .card-icon img {
      width: 24px;
      height: 24px;
    }

    .card-content {
      min-height: 28px;
    }

    .card-label {
      font-size: 10px;
    }

    .card-value {
      font-size: 16px;
    }
  }
}
</style>
