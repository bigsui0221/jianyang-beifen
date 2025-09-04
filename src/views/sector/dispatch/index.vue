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
import { DispatchApi } from "@/api/sector/dispatch";

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
  isLoading.value = false;
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

onBeforeUnmount(() => {
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

/* 可点击头部，用于关闭事件详情 */
.clickable { cursor: pointer; }

/* 简洁头部样式 */
.container-header.simple {
  background: rgba(0, 0, 0, 0.35);
  box-shadow: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.container-header.simple::before { display: none; }
.container-header.simple .header-icon {
  background: transparent;
  box-shadow: none;
}
.container-header.simple .header-icon i.icon-back::before {
  content: "←";
  color: #9fd1ff;
  font-size: 16px;
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
