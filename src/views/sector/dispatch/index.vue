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
    <div class="panel-container resource-overview">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="调度资源概况" class="title-icon" />
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
          <img :src="titleIcon" alt="未结案事件" class="title-icon" />
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
                <button class="view-details-btn" @click="showEventDetail(event)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧悬浮区域 -->
  <div class="floating-panel right-panel">
    <transition name="panel-slide" mode="out-in">
    <!-- 默认模式：仓库管理 + 资源调度 -->
    <div v-if="rightPanelMode === 'default'" key="default" class="right-panel-group">
    <transition-group name="panel-stagger" tag="div" class="right-panel-group-inner" appear>
    <div class="panel-container equal" key="warehouse-panel">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="仓库管理" class="title-icon" />
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
                <button class="view-details-btn" @click="showWarehouseDetail(wh)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-container equal" key="resource-panel">
      <div class="container-header">
        <div class="header-icon">
          <img :src="titleIcon" alt="资源调度" class="title-icon" />
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
    </transition-group>
    </div>

    <!-- 事件详情模式 -->
    <div v-else-if="rightPanelMode === 'eventDetail'" key="eventDetail">
      <div class="panel-container equal">
        <div class="container-header clickable simple" @click="backToDefault">
          <div class="header-icon">
            <i class="icon-back"></i>
          </div>
          <h3>未结案事件</h3>
        </div>
        <div class="container-content">
          <div class="event-detail-wrapper">
            <!-- 头部点击即可关闭，内部不再需要返回栏 -->
            <div class="event-detail-grid">
              <div class="detail-row"><span class="detail-key">事件编号：</span><span class="detail-val">{{ selectedEvent?.eventCode || selectedEvent?.id || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">事件名称：</span><span class="detail-val">{{ selectedEvent?.eventTitle || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">事件类型：</span><span class="detail-val">{{ selectedEvent?.eventType?.desc || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">事件等级：</span><span class="detail-val">{{ selectedEvent?.eventLevel?.desc || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">上报人：</span><span class="detail-val">{{ selectedEvent?.reporter || '—' }}</span></div>
              <div class="detail-row detail-desc"><span class="detail-key">事件描述：</span><span class="detail-val">{{ selectedEvent?.eventDescription || '—' }}</span></div>
            </div>

            <div class="event-images" v-if="(selectedEvent?.imgUrls && selectedEvent.imgUrls.length)">
              <img v-for="(img,idx) in selectedEvent.imgUrls" :key="idx" :src="img" alt="图片" />
            </div>

            <div class="process-steps">
              <div class="steps-title">处理过程</div>
              <div class="steps">
                <div
                  class="step"
                  v-for="(step, idx) in (selectedEvent?.processList || [])"
                  :key="idx"
                  :class="stepClass(idx, step)"
                >
                  <div class="rail">
                    <div class="line"></div>
                    <div class="dot"></div>
                  </div>
                  <div class="meta">
                    <div class="name">{{ step.processName || '—' }}</div>
                    <div class="time">{{ formatTimestamp(step.processTime) }}</div>
                    <div class="person" v-if="step.processPerson">处理人：{{ step.processPerson }}</div>
                    <div class="info" v-if="step.processInfo">{{ step.processInfo }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 仓库详情模式 -->
    <div v-else-if="rightPanelMode === 'warehouseDetail'" key="warehouseDetail">
      <div class="panel-container equal">
        <div class="container-header clickable simple" @click="backToDefault">
          <div class="header-icon">
            <i class="icon-back"></i>
          </div>
          <h3>仓库详情</h3>
        </div>
        <div class="container-content">
          <div class="event-detail-wrapper">
            <div class="event-detail-grid">
              <div class="detail-row"><span class="detail-key">仓库编号：</span><span class="detail-val">{{ selectedWarehouse?.warehouseCode || selectedWarehouse?.id || selectedWarehouse?.warehouseId || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">仓库名称：</span><span class="detail-val">{{ selectedWarehouse?.name || selectedWarehouse?.warehouseName || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">地址：</span><span class="detail-val">{{ selectedWarehouse?.address || selectedWarehouse?.warehouseAddress || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">联系人：</span><span class="detail-val">{{ selectedWarehouse?.contactPerson || selectedWarehouse?.linkman || '—' }}</span></div>
              <div class="detail-row"><span class="detail-key">联系电话：</span><span class="detail-val">{{ selectedWarehouse?.contactNumber || selectedWarehouse?.phone || '—' }}</span></div>
              <div class="detail-row detail-desc" v-if="selectedWarehouse?.desc || selectedWarehouse?.remark || selectedWarehouse?.description">
                <span class="detail-key">仓库描述：</span>
                <span class="detail-val">{{ selectedWarehouse?.desc || selectedWarehouse?.remark || selectedWarehouse?.description }}</span>
              </div>
            </div>
            <div class="drawer-table" v-if="warehouseItems.length">
              <el-table :data="warehouseItems" height="240" size="small" stripe>
                <el-table-column label="名称" min-width="160">
                  <template #default="{ row }">{{ row.name || '—' }}</template>
                </el-table-column>
                <el-table-column label="规格/型号" min-width="160">
                  <template #default="{ row }">{{ row.spec || '—' }}</template>
                </el-table-column>
                <el-table-column label="单位" min-width="120">
                  <template #default="{ row }">{{ row.unit || '—' }}</template>
                </el-table-column>
                <el-table-column label="数量" min-width="120">
                  <template #default="{ row }">{{ row.quantity ?? '—' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { Search, Location } from "@element-plus/icons-vue";
import { initGisMap, createMarkerGraphic, createMarkerPopup, updatePopupPosition, esriModules } from "@/utils/gis";
import carIcon from "@/assets/imgs/sector/car.png";
import personIcon from "@/assets/imgs/sector/people.png";
import warehouseIcon from "@/assets/imgs/sector/house.png";
import titleIcon from "@/assets/imgs/sector/title-icon.png";
import { DispatchApi } from "@/api/sector/dispatch";

// REM 响应式设置 - 基于1920px设计稿
const setRem = () => {
  const designWidth = 1920 // 设计稿基准宽度
  const currentWidth = window.innerWidth
  // 计算缩放比例，以100px为基准字体大小
  const fontSize = Math.min((currentWidth / designWidth) * 100, 200) // 限制最大200px
  document.documentElement.style.fontSize = fontSize + 'px'
  console.log(`[Dispatch] 屏幕宽度: ${currentWidth}px, 根字体大小: ${fontSize}px`)
}

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const resourceLayer = shallowRef<any>(null);
const personLayer = shallowRef<any>(null);
const warehouseLayer = shallowRef<any>(null);
let clickHandle: any = null;
const isLoading = ref<boolean>(true);
const loadingText = ref<string>("地图加载中...");

const carResourceData = ref<any[]>([]);
const personResourceData = ref<any[]>([]);
const warehouseResourceData = ref<any[]>([]);
const unclosedEvents = ref<any[]>([]);
const searchQuery = ref<string>("");
const activeResourceTab = ref<string>("vehicles");
// 右侧面板模式：default | eventDetail | warehouseDetail
const rightPanelMode = ref<string>("default");
const selectedEvent = ref<any>(null);
const selectedWarehouse = ref<any>(null);
const warehouseItems = ref<any[]>([]);

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
  // 配置 Popup：启用并固定停靠到顶部中间，避免被左右面板遮挡
  try {
    mapView.value.popup.autoOpenEnabled = true;
    mapView.value.popup.visible = false;
    mapView.value.popup.dockEnabled = true;
    mapView.value.popup.dockOptions = {
      position: "top-center",
      breakpoint: false
    } as any;
  } catch (e) {
    console.warn("配置Popup失败", e);
  }
  // 初始化资源图层
  try {
    if (esriModules && map) {
      if (!resourceLayer.value) {
        resourceLayer.value = new esriModules.GraphicsLayer({ title: "车辆图层" });
        map.add(resourceLayer.value);
      }
      if (!personLayer.value) {
        personLayer.value = new esriModules.GraphicsLayer({ title: "人员图层" });
        map.add(personLayer.value);
      }
      if (!warehouseLayer.value) {
        warehouseLayer.value = new esriModules.GraphicsLayer({ title: "仓库图层" });
        map.add(warehouseLayer.value);
      }
    }
  } catch (e) {
    console.warn("初始化资源图层失败", e);
  }
  // 绑定点击命中检测（仅绑定一次）
  try {
    if (mapView.value) {
      // 清理旧的事件绑定
      clickHandle?.remove?.();
      clickHandle = mapView.value.on("click", async (event: any) => {
        try {
          const hit = await mapView.value!.hitTest(event);
          const allResults = hit?.results || [];
          console.log("hitTest results:", allResults);
          const layers = [resourceLayer.value, personLayer.value, warehouseLayer.value].filter(Boolean);
          const target = allResults.find((r: any) => layers.includes(r?.graphic?.layer)) || allResults[0];
          if (!target) {
            // 点击空白处：隐藏所有自定义弹窗
            popupDomMap.forEach((el) => (el.style.display = "none"));
            personPopupMap.forEach((el) => (el.style.display = "none"));
            warehousePopupMap.forEach((el) => (el.style.display = "none"));
            return;
          }
          const graphic = target.graphic;
          const attrs: any = graphic?.attributes || {};
          const pid = attrs.id;
          // 隐藏全部 DOM 弹窗
          popupDomMap.forEach((el) => (el.style.display = "none"));
          personPopupMap.forEach((el) => (el.style.display = "none"));
          warehousePopupMap.forEach((el) => (el.style.display = "none"));
          // 显示对应 DOM 弹窗（车辆 / 人员 / 仓库）
          const el = popupDomMap.get(pid) || personPopupMap.get(pid) || warehousePopupMap.get(pid);
          if (el) {
            el.style.display = "block";
            updatePopupPosition(el, graphic.geometry);
          }
        } catch (err) {
          console.warn("命中检测失败", err);
        }
      });
    }
  } catch {}
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
    
    // 数据加载完成后隐藏loading
    isLoading.value = false;
  } catch (error) {
    console.error("调用 DispatchApi 接口时出错:", error);
    // 即使出错也要隐藏loading
    isLoading.value = false;
  }
};

onMounted(async () => {
  // 设置 REM 响应式
  setRem()
  window.addEventListener('resize', setRem)
  
  // 先初始化地图
  await initMap();
  // 地图初始化完成后再获取数据
  await testDispatchApi();
});

onBeforeUnmount(() => {
  // 清理 REM 监听器
  window.removeEventListener('resize', setRem)
  
  try {
    clickHandle?.remove?.();
  } catch {}
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
      const marker = createMarkerGraphic(
        [lon, lat],
        carIcon,
        { id: row.id, type: "car" },
        { width: 20, height: 24 }
      );
      if (marker) resourceLayer.value.add(marker);
    }
    // 视图居中
    mapView.value.goTo({ center: [lon, lat], zoom: 14 });
  } catch (e) {
    console.warn("地图视图定位失败", e);
  }
};

// 渲染车辆点位到资源图层
const renderVehicleMarkers = () => {
  try {
    if (!esriModules || !gisMap.value) return;
    if (!resourceLayer.value) {
      resourceLayer.value = new esriModules.GraphicsLayer();
      gisMap.value.add(resourceLayer.value);
    }
    resourceLayer.value.removeAll();
    // 清理旧的 DOM 弹窗
    try {
      popupDomMap.forEach((el) => el?.remove?.());
      popupDomMap.clear();
    } catch {}
    const data = carResourceData.value || [];
    for (const item of data) {
      const lon = item.longitude;
      const lat = item.latitude;
      if (lon == null || lat == null) continue;
      const pid = item.id ?? item.carId ?? item.carCode ?? `${lon},${lat}`;
      const marker = createMarkerGraphic(
        [lon, lat],
        carIcon,
        { ...item, id: pid, type: "car" },
        { width: 20, height: 24 }
      );
      if (marker) resourceLayer.value.add(marker);

      // 创建并登记自定义 DOM 弹窗（默认隐藏）
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.transform = "translate(-50%, -100%)";
      el.style.pointerEvents = "auto";
      el.style.zIndex = "1001";
      el.style.display = "none";
      el.style.background = "rgba(0,0,0,0.75)";
      el.style.color = "#fff";
      el.style.padding = "8px 10px";
      el.style.border = "1px solid rgba(255,255,255,0.2)";
      el.style.borderRadius = "6px";
      el.style.fontSize = "12px";
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <div style="font-weight:600;">${item.carCode || item.name || "车辆"}</div>
          <button data-role="close" style="background:transparent;border:0;color:#fff;cursor:pointer;font-size:14px;line-height:1;">×</button>
        </div>
        <div>类型：${item.carType?.desc || "—"}</div>
        <div>联系人：${item.contactPerson || "—"}</div>
        <div>电话：${item.contactNumber || item.phone || "—"}</div>
        <div>状态：${item.carStatus?.desc || item.status?.desc || "—"}</div>
      `;
      try {
        const closeBtn = el.querySelector('[data-role="close"]') as HTMLElement | null;
        closeBtn?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          el.style.display = 'none';
        });
      } catch {}
      mapView.value?.container?.appendChild(el);
      createMarkerPopup(el, [lon, lat]);
      popupDomMap.set(pid, el);
    }
  } catch (e) {
    console.warn("渲染车辆点位失败", e);
  }
};

// 车辆数据变化时，自动刷新点位
watch(carResourceData, () => {
  renderVehicleMarkers();
});

// 渲染人员点位到人员图层
const renderPersonMarkers = () => {
  try {
    if (!esriModules || !gisMap.value) return;
    if (!personLayer.value) {
      personLayer.value = new esriModules.GraphicsLayer();
      gisMap.value.add(personLayer.value);
    }
    personLayer.value.removeAll();
    // 清理旧的人员 DOM 弹窗
    try {
      personPopupMap.forEach((el) => el?.remove?.());
      personPopupMap.clear();
    } catch {}
    const data = personResourceData.value || [];
    for (const item of data) {
      const lon = item.longitude ?? item.lon ?? item.lng;
      const lat = item.latitude ?? item.lat;
      if (lon == null || lat == null) continue;
      const pid = item.id ?? item.userId ?? item.personId ?? item.name ?? `${lon},${lat}`;
      const marker = createMarkerGraphic(
        [lon, lat],
        personIcon,
        { ...item, id: `person_${pid}`, type: "person" },
        { width: 18, height: 20 }
      );
      if (marker) personLayer.value.add(marker);

      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.transform = "translate(-50%, -100%)";
      el.style.pointerEvents = "auto";
      el.style.zIndex = "1001";
      el.style.display = "none";
      el.style.background = "rgba(0,0,0,0.75)";
      el.style.color = "#fff";
      el.style.padding = "8px 10px";
      el.style.border = "1px solid rgba(255,255,255,0.2)";
      el.style.borderRadius = "6px";
      el.style.fontSize = "12px";
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <div style="font-weight:600;">${
            item.name || item.userName || item.personName || item.carCode || "人员"
          }</div>
          <button data-role="close" style="background:transparent;border:0;color:#fff;cursor:pointer;font-size:14px;line-height:1;">×</button>
        </div>
        ${ item.carType?.desc ? `<div>类型：${item.carType.desc}</div>` : '' }
        <div>联系人：${ item.contactPerson || item.name || item.userName || item.personName || "—" }</div>
        <div>联系方式：${ item.phone || item.mobile || item.contactNumber || item.tel || "—" }</div>
        <div>状态：${ item.status?.desc || item.stateDesc || item.status || item.state || item.carStatus?.desc || "—" }</div>
      `;
      try {
        const closeBtn = el.querySelector('[data-role="close"]') as HTMLElement | null;
        closeBtn?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          el.style.display = 'none';
        });
      } catch {}
      mapView.value?.container?.appendChild(el);
      createMarkerPopup(el, [lon, lat]);
      personPopupMap.set(`person_${pid}`, el);
    }
  } catch (e) {
    console.warn("渲染人员点位失败", e);
  }
};

// 渲染仓库点位到仓库图层
const renderWarehouseMarkers = () => {
  try {
    if (!esriModules || !gisMap.value) return;
    if (!warehouseLayer.value) {
      warehouseLayer.value = new esriModules.GraphicsLayer();
      gisMap.value.add(warehouseLayer.value);
    }
    warehouseLayer.value.removeAll();
    // 清理旧的仓库 DOM 弹窗
    try {
      warehousePopupMap.forEach((el) => el?.remove?.());
      warehousePopupMap.clear();
    } catch {}
    const data = warehouseResourceData.value || [];
    for (const item of data) {
      const lon = item.longitude ?? item.lon ?? item.lng;
      const lat = item.latitude ?? item.lat;
      if (lon == null || lat == null) continue;
      const pid = item.id ?? item.warehouseId ?? item.warehouseCode ?? item.name ?? `${lon},${lat}`;
      const marker = createMarkerGraphic(
        [lon, lat],
        warehouseIcon,
        { ...item, id: `warehouse_${pid}`, type: "warehouse" },
        { width: 20, height: 24 }
      );
      if (marker) warehouseLayer.value.add(marker);

      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.transform = "translate(-50%, -100%)";
      el.style.pointerEvents = "auto";
      el.style.zIndex = "1001";
      el.style.display = "none";
      el.style.background = "rgba(0,0,0,0.75)";
      el.style.color = "#fff";
      el.style.padding = "8px 10px";
      el.style.border = "1px solid rgba(255,255,255,0.2)";
      el.style.borderRadius = "6px";
      el.style.fontSize = "12px";
      el.innerHTML = `
        <div style=\"display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;\">
          <div style=\"font-weight:600;\">${item.name || item.warehouseName || "仓库"}</div>
          <button data-role=\"close\" style=\"background:transparent;border:0;color:#fff;cursor:pointer;font-size:14px;line-height:1;\">×</button>
        </div>
        <div>地址：${item.address || item.warehouseAddress || "—"}</div>
        <div>联系人：${item.contactPerson || item.linkman || "—"}</div>
        <div>电话：${item.contactNumber || item.phone || "—"}</div>
      `;
      try {
        const closeBtn = el.querySelector('[data-role="close"]') as HTMLElement | null;
        closeBtn?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          el.style.display = 'none';
        });
      } catch {}
      mapView.value?.container?.appendChild(el);
      createMarkerPopup(el, [lon, lat]);
      warehousePopupMap.set(`warehouse_${pid}`, el);
    }
  } catch (e) {
    console.warn("渲染仓库点位失败", e);
  }
};

// 数据变化时自动刷新人员与仓库点位
watch(personResourceData, () => {
  renderPersonMarkers();
});
watch(warehouseResourceData, () => {
  renderWarehouseMarkers();
});

// 人员与仓库弹窗缓存
const personPopupMap = new Map<any, HTMLElement>();
const warehousePopupMap = new Map<any, HTMLElement>();

// 自定义弹窗 DOM 缓存：主键 -> 元素
const popupDomMap = new Map<any, HTMLElement>();

// 切换到事件详情并请求详情
const showEventDetail = async (event: any) => {
  // 先展示基本信息，立即切换右侧面板
  selectedEvent.value = event;
  rightPanelMode.value = "eventDetail";
  try {
    const id = event?.id ?? event?.eventId;
    if (id == null) return;
    const res = await DispatchApi.getEventDetail(id);
    const detail = (res && (res.data ?? res)) || null;
    if (detail) {
      // 用返回详情覆盖/合并已有字段
      selectedEvent.value = { ...event, ...detail };
    }
  } catch (err) {
    console.warn("获取事件详情失败", err);
  }
};

// 展示仓库详情：调用接口并切换到仓库详情面板
const showWarehouseDetail = async (warehouse: any) => {
  // 先展示基本信息，立即切换右侧面板
  selectedWarehouse.value = warehouse;
  warehouseItems.value = [];
  rightPanelMode.value = "warehouseDetail";
  try {
    const id = warehouse?.id ?? warehouse?.warehouseId;
    if (id == null) return;
    const res = await DispatchApi.getWarehouseDetail(id);
    const detail: any = (res && (res.data ?? res)) || {};
    selectedWarehouse.value = { ...warehouse, ...detail };
    // 兼容多种返回字段名（materialList 为示例中的字段）
    const rawItems = (detail.materialList || detail.items || detail.materials || detail.list || []) as any[];
    warehouseItems.value = Array.isArray(rawItems)
      ? rawItems.map((it: any) => ({
          name: it.name ?? it.materialName ?? it.itemName ?? it.productName ?? it.goodsName ?? it.material ?? '',
          spec: it.spec ?? it.model ?? it.specification ?? it.specificationModel ?? it.type ?? '',
          unit: it.unit ?? it.measuringUnit ?? it.uom ?? '',
          quantity: it.quantity ?? it.qty ?? it.amount ?? it.count ?? it.materialNum ?? 0,
        }))
      : [];
  } catch (err) {
    console.warn("获取仓库详情失败", err);
  }
};

// 返回右侧默认面板
const backToDefault = () => {
  rightPanelMode.value = "default";
};

// 时间戳格式化
const formatTimestamp = (ts: any): string => {
  if (!ts && ts !== 0) return "—";
  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return String(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
};

// 步骤样式计算：最后一步为待处理/当前，其余为已完成
const stepClass = (idx: number, _step: any) => {
  const total = selectedEvent.value?.processList?.length || 0;
  const isLast = idx === total - 1;
  return {
    completed: !isLast,
    current: isLast,
  };
};
</script>
<style lang="scss" scoped>
#mapContainer {
  width: 100vw;   /* 响应式宽度 */
  height: calc(100vh - 0.6rem); /* 100vh - 0.6rem(菜单栏高度，响应式) */
  position: relative;
}

/* 悬浮面板样式 */
.floating-panel {
  position: absolute;
  top: 0.84rem;     /* 24px / 100 = 0.24rem，上边距响应式 */
  bottom: 0.24rem;  /* 24px / 100 = 0.24rem，下边距响应式 */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;      /* 20px / 100 = 0.2rem，间距响应式 */
  overflow: hidden; /* 外层不滚动，由子容器滚动 */

  &.left-panel {
    left: 0.24rem;  /* 24px / 100 = 0.24rem，左边距响应式 */
    width: 5rem;    /* 500px / 100 = 5rem，宽度响应式 */
    // 高度由top和bottom自动计算
    overflow: hidden; /* 外层不滚动，由子容器滚动 */
  }
  
  &.right-panel {
    right: 0.24rem; /* 24px / 100 = 0.24rem，右边距响应式 */
    width: 5rem;    /* 500px / 100 = 5rem，宽度响应式 */
    display: flex;
    flex-direction: column;
    gap: 0.2rem;    /* 20px / 100 = 0.2rem，间距响应式 */
    // 高度由top和bottom自动计算
  }
}

/* 容器样式 - 深色主题 */
.panel-container {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient( 180deg, rgba(0,40,96,0) 0%, rgba(0,42,95,0.09) 23%, rgba(0,42,97,0.24) 45%, rgba(0,40,96,0.27) 100%), linear-gradient( 180deg, rgba(16,98,222,0.12) 0%, rgba(17,96,219,0.11) 55%, rgba(19,98,215,0.05) 76%, rgba(0,95,223,0.03) 100%), rgba(0,15,42,0.7);
  border-radius: 0.12rem;  /* 12px / 100 = 0.12rem，圆角响应式 */
  border: 0.02rem solid rgba(74, 144, 226, 0.6);  /* 2px / 100 = 0.02rem */
  box-shadow: 
    0 0.08rem 0.32rem rgba(0, 0, 0, 0.4),  /* 0 8px 32px → rem */
    inset 0 0.01rem 0 rgba(255, 255, 255, 0.1);  /* 0 1px 0 → rem */
  overflow: hidden;
  transition: all 0.3s ease;
  /* 让面板默认按内容高度渲染 */
  flex: 0 0 auto;

  &:hover {
    transform: translateY(-0.02rem);  /* -2px / 100 = -0.02rem */
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 0.12rem 0.4rem rgba(0, 0, 0, 0.5),  /* 0 12px 40px → rem */
      0 0 0.2rem rgba(74, 144, 226, 0.3),   /* 0 0 20px → rem */
      inset 0 0.01rem 0 rgba(255, 255, 255, 0.2);  /* 0 1px 0 → rem */
  }

  /* 第二个面板：占满剩余高度，内容区内部滚动 */
  &.resource-overview {
    flex: 0 0 auto; /* 根据内容自动调整高度，不压缩不拉伸 */
  }

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
        /* 强制 hover/当前行为深色主题，避免白底白字 */
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
    gap: 0.1rem;     /* 10px / 100 = 0.1rem，间距响应式 */
    padding: 0.08rem; /* 8px / 100 = 0.08rem，内边距响应式 */
    height: 0.28rem;  /* 28px / 100 = 0.28rem，高度响应式 */
    margin: 0.12rem;  /* 12px / 100 = 0.12rem，边距响应式 */
    border-bottom: 0.01rem solid rgba(255, 255, 255, 0.12);  /* 1px / 100 = 0.01rem */
    position: relative;
    z-index: 1;

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
      width: 0.32rem;   /* 32px / 100 = 0.32rem，图标容器响应式 */
      height: 0.32rem;  /* 32px / 100 = 0.32rem */
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      
      .title-icon {
        width: 0.25rem;  /* 25px / 100 = 0.25rem，标题图标响应式 */
        height: 0.25rem; /* 25px / 100 = 0.25rem */
      }

      i {
        width: 0.16rem;  /* 16px / 100 = 0.16rem */
        height: 0.16rem; /* 16px / 100 = 0.16rem */
        background: none;
        border-radius: 0.02rem;  /* 2px / 100 = 0.02rem */

        &.icon-back::before {
          content: "←";
          color: #9fd1ff;
          font-size: 0.16rem;  /* 16px / 100 = 0.16rem */
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
      font-size: 0.16rem;  /* 16px / 100 = 0.16rem，标题文字响应式 */
      color: #FFFFFF;
      text-shadow: 0px 0px 0.07rem rgba(75,180,229,0.69), 0px 0.02rem 0.08rem rgba(5,28,55,0.42);  /* 7px 2px 8px → rem */
      position: relative;
      z-index: 1;
    }
  }

/* 可点击头部，用于关闭事件详情 */
.clickable { cursor: pointer; }

/* 简洁头部样式 */
.container-header.simple {
  background: rgba(0, 0, 0, 0.35);
  box-shadow: none;
  border-bottom: 0.01rem solid rgba(255, 255, 255, 0.08);  /* 1px / 100 = 0.01rem */
}
.container-header.simple::before { display: none; }
.container-header.simple .header-icon {
  background: transparent;
  box-shadow: none;
}
.container-header.simple .header-icon i.icon-back::before {
  content: "←";
  color: #9fd1ff;
  font-size: 0.16rem;  /* 16px / 100 = 0.16rem */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.container-header.simple h3 {
  font-weight: 500;
}

/* 容器内容 */
.container-content {
  padding: 0.2rem;  /* 20px / 100 = 0.2rem，内边距响应式 */
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: #e6f4ff;
  overflow: auto;
  /* 优化滚动条样式，仅在需要时显示 */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(116, 159, 229, 0.6) transparent; /* Firefox */
}

.container-content::-webkit-scrollbar {
  width: 0.08rem;  /* 8px / 100 = 0.08rem */
}

.container-content::-webkit-scrollbar-track {
  background: transparent;
}

.container-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(116, 159, 229, 0.8), rgba(74, 144, 226, 0.6));
  border-radius: 0.06rem;  /* 6px / 100 = 0.06rem */
}

.container-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(140, 175, 235, 0.9), rgba(90, 155, 232, 0.8));
}

/* 调度资源概况 - 指标卡片样式 */
.metric-cards {
  display: flex;
  flex-direction: row;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
  justify-content: space-between;
}

.metric-card {
  flex: 1;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border-radius: 0.08rem;  /* 8px / 100 = 0.08rem，圆角响应式 */
  padding: 0.12rem 0.14rem;  /* 12px 14px / 100 → rem，内边距响应式 */
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px / 100 = 0.01rem */
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */
  display: flex;
  align-items: center;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */

  &:hover {
    transform: translateY(-0.01rem);  /* -1px / 100 = -0.01rem */
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.3);  /* 0 4px 12px → rem */
  }

  .card-icon {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    img {
      width: 0.56rem;  /* 56px / 100 = 0.56rem，图标尺寸响应式 */
      height: 0.56rem; /* 56px / 100 = 0.56rem */
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
    min-height: 0.4rem;  /* 40px / 100 = 0.4rem，最小高度响应式 */
  }

  .card-label {
    font-size: clamp(10px, 0.8vw, 14px);  /* 12px → clamp，卡片标签使用clamp确保可读性 */
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    align-self: flex-start;
    margin-bottom: auto;
  }

  .card-value {
    font-size: clamp(18px, 1.8vw, 32px);  /* 24px → clamp，卡片数值使用clamp确保可读性 */
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.3);  /* 0 2px 4px → rem */
    // align-self: flex-end;
    margin-top: auto;
  }
}

/* 未结案事件样式 */
.unreslove-content {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
}

.event-search {
  margin-bottom: 0.04rem;  /* 4px / 100 = 0.04rem，边距响应式 */
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
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
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border-radius: 0.08rem;  /* 8px / 100 = 0.08rem，圆角响应式 */
  padding: 0.12rem 0.14rem;  /* 12px 14px / 100 → rem，内边距响应式 */
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px / 100 = 0.01rem */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */

  &:hover {
    transform: translateY(-0.01rem);  /* -1px / 100 = -0.01rem */
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.3);  /* 0 4px 12px → rem */
  }
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;  /* 8px / 100 = 0.08rem，间距响应式 */
}

.event-title {
  font-size: clamp(12px, 1vw, 16px);  /* 14px → clamp，事件标题使用clamp确保可读性 */
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.04rem;  /* 4px / 100 = 0.04rem，边距响应式 */
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.04rem;  /* 4px / 100 = 0.04rem，间距响应式 */
}

.event-detail-item {
  display: flex;
  align-items: flex-start;
  font-size: clamp(10px, 0.8vw, 14px);  /* 12px → clamp，事件详情使用clamp确保可读性 */
  line-height: 1.4;
}

.detail-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.04rem;  /* 4px / 100 = 0.04rem，边距响应式 */
  flex-shrink: 0;
}

.detail-value {
  color: #ffffff;
  flex: 1;
  word-break: break-all;
}

.event-action {
  flex-shrink: 0;
  margin-left: 0.12rem;  /* 12px / 100 = 0.12rem，边距响应式 */
}

.view-details-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 0.04rem;  /* 4px / 100 = 0.04rem，圆角响应式 */
  padding: 0.06rem 0.12rem;  /* 6px 12px / 100 → rem，内边距响应式 */
  font-size: clamp(10px, 0.8vw, 14px);  /* 12px → clamp，按钮文字使用clamp确保可读性 */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.2);  /* 0 2px 4px → rem */

  &:hover {
    background: linear-gradient(135deg, #357abd 0%, #2e6ba8 100%);
    box-shadow: 0 0.04rem 0.08rem rgba(0, 0, 0, 0.3);  /* 0 4px 8px → rem */
    transform: translateY(-0.01rem);  /* -1px / 100 = -0.01rem */
  }

  &:active {
    transform: translateY(0);
  }
}


/* 仓库管理样式（参考未结案事件列表） */
.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
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
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(53, 122, 189, 0.22) 100%);
  border-radius: 0.08rem;  /* 8px / 100 = 0.08rem，圆角响应式 */
  padding: 0.12rem 0.14rem;  /* 12px 14px / 100 → rem，内边距响应式 */
  border: 0.01rem solid rgba(74, 144, 226, 0.3);  /* 1px / 100 = 0.01rem */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 0.02rem 0.08rem rgba(0, 0, 0, 0.2);  /* 0 2px 8px → rem */

  &:hover {
    transform: translateY(-0.01rem);  /* -1px / 100 = -0.01rem */
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.3);  /* 0 4px 12px → rem */
  }
}

.warehouse-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;  /* 8px / 100 = 0.08rem，间距响应式 */
}

.warehouse-title {
  font-size: clamp(12px, 1vw, 18px);  /* 16px → clamp，仓库标题使用clamp确保可读性 */
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.04rem;  /* 4px / 100 = 0.04rem，边距响应式 */
}

.warehouse-details {
  display: flex;
  flex-direction: column;
  gap: 0.04rem;  /* 4px / 100 = 0.04rem，间距响应式 */
}

.warehouse-detail-row {
  display: flex;
  gap: 0.24rem;  /* 24px / 100 = 0.24rem，间距响应式 */
}

.warehouse-detail-item {
  display: flex;
  align-items: flex-start;
  font-size: clamp(10px, 0.8vw, 14px);  /* 12px → clamp，仓库详情使用clamp确保可读性 */
  line-height: 1.4;
}

.warehouse-action {
  flex-shrink: 0;
  margin-left: 0.12rem;  /* 12px / 100 = 0.12rem，边距响应式 */
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
/* 事件详情样式 */
.event-detail-wrapper { display: flex; flex-direction: column; gap: 16px; }
.event-detail-header { display: flex; align-items: center; justify-content: space-between; }
.event-detail-title { font-size: 16px; color: #ffffff; font-weight: 600; }
.back-btn {
  background: transparent;
  color: #9fd1ff;
  border: 1px solid rgba(74, 144, 226, 0.5);
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
}
.event-detail-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.detail-row { display: flex; font-size: 12px; line-height: 1.5; }
.detail-key { color: rgba(255,255,255,0.7); margin-right: 6px; flex-shrink: 0; }
.detail-val { color: #ffffff; flex: 1; }
.detail-desc .detail-val { white-space: pre-wrap; }
.event-images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.event-images img { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(74,144,226,0.3); }
.process-timeline { display: flex; flex-direction: column; gap: 8px; }
.process-timeline .timeline-title { font-size: 14px; color: #e6f4ff; font-weight: 600; }
.timeline-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
.timeline-list::-webkit-scrollbar { display: none; }
.timeline-item { display: flex; gap: 10px; align-items: flex-start; }
.timeline-item .dot { width: 8px; height: 8px; border-radius: 50%; background: #4a90e2; margin-top: 6px; }
.timeline-item .content { flex: 1; font-size: 12px; color: #fff; }
.timeline-item .content .row { margin-bottom: 2px; }

/* 右侧面板切换动画 */
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; transform: translateX(24px); }
.panel-slide-enter-active,
.panel-slide-leave-active { transition: all .25s ease; }
.panel-slide-enter-to,
.panel-slide-leave-from { opacity: 1; transform: translateX(0); }

/* 默认面板内两块子面板的进入动画（交错） */
.right-panel-group-inner { display: contents; }
.panel-stagger-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.panel-stagger-enter-active { transition: all .28s cubic-bezier(.2,.7,.2,1); }
.panel-stagger-enter-to { opacity: 1; transform: translateY(0) scale(1); }
.panel-stagger-leave-active { transition: all .18s ease; opacity: 0; transform: translateY(8px) scale(0.98); }
.panel-stagger-move { transition: transform .28s ease; }

/* 进入时小延迟实现错峰 */
.panel-stagger-enter-from[key="resource-panel"] { transition-delay: .06s; }

/* 步骤进度样式 */
.process-steps { display: flex; flex-direction: column; gap: 10px; }
.process-steps .steps-title { font-size: 14px; color: #e6f4ff; font-weight: 600; }
.process-steps .steps { position: relative; display: flex; flex-direction: column; gap: 14px; }
.process-steps .step { display: grid; grid-template-columns: 16px 1fr; gap: 12px; align-items: start; }
.process-steps .step .rail { position: relative; width: 16px; height: 100%; }
.process-steps .step .rail .line { position: absolute; left: 7px; top: 0; bottom: -14px; width: 2px; background: rgba(255,255,255,0.15); }
.process-steps .step:last-child .rail .line { bottom: 6px; }
.process-steps .step .rail .dot { position: absolute; top: 6px; left: 3px; width: 10px; height: 10px; border-radius: 50%; background: #4a90e2; box-shadow: 0 0 0 2px rgba(74,144,226,0.35); }
.process-steps .step.completed .rail .line { background: rgba(79,199,120,0.5); }
.process-steps .step.completed .rail .dot { background: #4fc778; box-shadow: 0 0 0 2px rgba(79,199,120,0.35); }
.process-steps .step.current .rail .dot { background: #faad14; box-shadow: 0 0 0 2px rgba(250,173,20,0.35); }
.process-steps .meta { display: flex; flex-direction: column; gap: 2px; color: #fff; }
.process-steps .meta .name { font-weight: 600; }
.process-steps .meta .time { font-size: 12px; color: rgba(255,255,255,0.7); }
.process-steps .meta .person { font-size: 12px; color: rgba(255,255,255,0.9); }
.process-steps .meta .info { font-size: 12px; color: rgba(255,255,255,0.95); }

/* 右侧默认两面板外层，不影响父级flex布局 */
.right-panel-group { display: contents; }

/* 仓库详情弹框内表格，复用右侧资源表格风格 */
.drawer-table {
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
