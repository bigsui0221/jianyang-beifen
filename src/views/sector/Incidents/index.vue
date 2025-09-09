
<template>
   <div id="mapContainer" ref="mapRoot">
     <div class="panel-left">
       <div class="panel-container" ref="leftPanel">
         <div class="container-header">
           <div class="header-icon"><i class="icon-supervision"></i></div>
           <h3>事件概况</h3>
         </div>
         <div class="container-content">
          <div class="overview-cards">
            <div class="overview-card">
              <div class="card-title">待办事件</div>
              <div class="card-value">{{ eventOverviewData.pendingEvent || 0 }}</div>
            </div>
            <div class="overview-card">
              <div class="card-title">已办事件</div>
              <div class="card-value">{{ eventOverviewData.doneEvent || 0 }}</div>
            </div>
            <div class="overview-card">
              <div class="card-title">临期事件</div>
              <div class="card-value">{{ eventOverviewData.approachingEvent || 0 }}</div>
            </div>
          </div>

          <div class="pie-section">
            <div class="pie-card">
              <div class="pie-title">事件类型占比</div>
              <EChart v-if="eventTypeOption" :options="eventTypeOption" height="200px" width="100%" />
            </div>
            <div class="pie-card">
              <div class="pie-title">事件状态占比</div>
              <EChart v-if="eventStatusOption" :options="eventStatusOption" height="200px" width="100%" />
            </div>
          </div>
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
            <div class="notify-table">
              <div class="notify-thead">
                <div class="col title">标题</div>
                <div class="col status">状态</div>
                <div class="col sender">发送人</div>
                <div class="col time">时间</div>
              </div>
              <div class="notify-tbody">
                <div v-for="item in messageList" :key="item.id" class="notify-row">
                  <div class="col title" :title="item.messageTitle">{{ item.messageTitle }}</div>
                  <div class="col status">
                    <span :class="['status-badge', item.messageStatus?.name === 'UNREAD' ? 'unread' : 'read']">{{ item.messageStatus?.desc || '-' }}</span>
                  </div>
                  <div class="col sender" :title="item.sender">{{ item.sender }}</div>
                  <div class="col time">{{ formatMsgTime(item.deliveryTime) }}</div>
                </div>
              </div>
            </div>
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
            <div class="event-table">
              <div class="event-thead">
                <div class="col title">标题</div>
                <div class="col source">来源</div>
                <div class="col time">时间</div>
                <div class="col location">地点</div>
                <div class="col level">等级</div>
                <div class="col dept">部门</div>
                <div class="col status">状态</div>
                <div class="col overdue">超期</div>
                <div class="col action">操作</div>
              </div>
              <div class="event-tbody">
                <div v-for="row in eventList" :key="row.id" class="event-row">
                  <div class="col title" :title="row.eventTitle">{{ row.eventTitle }}</div>
                  <div class="col source">{{ row.eventSource?.desc || '-' }}</div>
                  <div class="col time">{{ formatMsgTime(row.reportTime) }}</div>
                  <div class="col location" :title="row.eventLocation">{{ row.eventLocation }}</div>
                  <div class="col level">
                    <span class="tag" :class="['level-' + (row.eventLevel?.name || 'NA').toLowerCase()]">{{ row.eventLevel?.desc || '-' }}</span>
                  </div>
                  <div class="col dept" :title="row.disposalDepartment">{{ row.disposalDepartment }}</div>
                  <div class="col status">
                    <span class="tag" :class="['status-' + (row.eventStatus?.name || 'NA').toLowerCase()]">{{ row.eventStatus?.desc || '-' }}</span>
                  </div>
                  <div class="col overdue">
                    <span class="tag" :class="['overdue-' + (row.overdueStatus?.name || 'NA').toLowerCase()]">{{ row.overdueStatus?.desc || '-' }}</span>
                  </div>
                  <div class="col action">
                    <button class="locate-btn" @click="locateEvent(row)">定位</button>
                  </div>
                </div>
              </div>
            </div>
           </div>
         </div>
       </div>
     </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { initGisMap, createMarkerGraphic, createMarkerPopup, updateAllPopupPositions } from '@/utils/gis'
import { MetricsEventOverviewAPI } from '@/api/sector/metrics'
import { esriModules } from '@/utils/gis'
import eventIcon from '@/assets/imgs/sector/液位检测点.png'
import EChart from '@/components/Echart/src/Echart.vue'

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const eventsLayer = shallowRef<any>(null);
const isLoading = ref(true)
const eventOverviewData = ref<{ pendingEvent?: number; doneEvent?: number; approachingEvent?: number }>({})
const eventTypeOption = ref<any>(null)
const eventStatusOption = ref<any>(null)
const messageList = ref<Array<any>>([])
const eventList = ref<Array<any>>([])
const eventTotal = ref<number>(0)
const mapRoot = ref<HTMLElement | null>(null)
const leftPanel = ref<HTMLElement | null>(null)
const eventPopupMap = new Map<string | number, HTMLElement>()
// 事件页暂不展示 loading 蒙层


const initMap = async () => {
  console.log('初始化地图')
  try {
    const { map, view } = await initGisMap(document.getElementById('mapContainer'))
    console.log('地图初始化成功:', { map, view })
    mapView.value = view
    gisMap.value = map
    
    console.log('esriModules 状态:', !!esriModules)
    console.log('eventsLayer.value 状态:', !!eventsLayer.value)
    
    if (esriModules && !eventsLayer.value) {
      eventsLayer.value = new esriModules.GraphicsLayer({ title: '事件图层' })
      gisMap.value.add(eventsLayer.value)
      console.log('创建并添加事件图层:', eventsLayer.value)
    }
    
    // 视图范围变化时更新弹窗位置
    try {
      mapView.value?.watch && mapView.value.watch('extent', () => updateAllPopupPositions())
      console.log('设置地图范围监听器')
    } catch (error) {
      console.warn('设置地图监听器失败:', error)
    }
    
    isLoading.value = false;
    console.log('地图初始化完成')
  } catch (error) {
    console.error('地图初始化失败:', error)
    isLoading.value = false;
  }
};

function buildPieOption(title: string, list: Array<{ statisticsItemName: string; statisticsItemRate: string }>) {
  const data = (list || []).map((item) => ({
    name: item.statisticsItemName,
    value: parseFloat(String(item.statisticsItemRate).replace('%', '')) || 0
  }))
  return {
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'middle',
      textStyle: { color: '#e6f4ff' }
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data
      }
    ]
  }
}

function formatMsgTime(ts?: number | string) {
  const timeNum = Number(ts)
  if (!timeNum || Number.isNaN(timeNum)) return '-'
  const d = new Date(timeNum)
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parsePx(val: string) {
  const n = parseFloat(val || '0')
  return Number.isFinite(n) ? n : 0
}

function adjustBottomPanelHeight() {
  const container = mapRoot.value as HTMLElement
  const left = leftPanel.value as HTMLElement
  if (!container || !left) return
  const styles = getComputedStyle(container)
  const gap = parsePx(styles.getPropertyValue('--panel-gap')) || 12
  const containerHeight = container.clientHeight
  const leftNeeded = left.scrollHeight
  const available = containerHeight - gap - gap // top gap + bottom gap
  let proposed = available - leftNeeded - gap // middle gap between left与bottom
  const minH = 200
  const maxH = 420
  proposed = Math.max(minH, Math.min(maxH, proposed))
  container.style.setProperty('--bottom-panel-height', `${Math.round(proposed)}px`)
}

const onResize = () => {
  adjustBottomPanelHeight()
  updateAllPopupPositions()
}

function renderEventMarkers() {
  try {
    console.log('开始渲染事件点...')
    console.log('esriModules:', !!esriModules)
    console.log('gisMap.value:', !!gisMap.value)
    console.log('mapView.value:', !!mapView.value)
    console.log('eventList.value:', eventList.value)
    
    if (!esriModules || !gisMap.value || !mapView.value) {
      console.error('缺少必要的GIS组件:', { esriModules: !!esriModules, gisMap: !!gisMap.value, mapView: !!mapView.value })
      return
    }
    
    // 检查地图视图是否准备就绪
    if (!mapView.value.ready) {
      console.warn('地图视图未准备就绪，延迟渲染')
      setTimeout(() => renderEventMarkers(), 1000)
      return
    }
    
    if (!eventsLayer.value) {
      eventsLayer.value = new esriModules.GraphicsLayer({ title: '事件图层' })
      gisMap.value.add(eventsLayer.value)
      console.log('创建事件图层:', eventsLayer.value)
    }
    
    eventsLayer.value.removeAll()
    // 移除旧弹窗
    eventPopupMap.forEach((el) => el.remove())
    eventPopupMap.clear()
    
    console.log('渲染事件点数量:', eventList.value?.length || 0, 'icon:', eventIcon)
    
    // 如果没有真实数据，添加测试数据来验证功能
    let dataToRender = eventList.value

    for (const row of dataToRender) {
      console.log('处理事件:', row)
      const lon = Number(row.longitude)
      const lat = Number(row.latitude)
      console.log('坐标:', { lon, lat, isValidLon: Number.isFinite(lon), isValidLat: Number.isFinite(lat) })
      
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        console.warn('跳过无效坐标的事件:', row.id, { lon, lat })
        continue
      }
      
      const graphic = createMarkerGraphic([lon, lat], eventIcon, { id: row.id }, { width: 24, height: 24 })
      console.log('创建的图形对象:', graphic)
      
      if (graphic) {
        eventsLayer.value.add(graphic)
        console.log('已添加图形到图层')
        
        // 添加点击事件来显示弹窗
        mapView.value.on('click', (event: any) => {
          mapView.value.hitTest(event).then((response: any) => {
            if (response.results.length > 0) {
              const result = response.results[0]
              if (result.graphic && result.graphic.attributes && result.graphic.attributes.id === row.id) {
                // 找到对应的弹窗并显示
                const popup = eventPopupMap.get(row.id)
                if (popup) {
                  popup.style.display = popup.style.display === 'none' ? 'block' : 'none'
                  console.log('切换弹窗显示状态:', popup.style.display)
                }
              }
            }
          })
        })
      } else {
        console.error('创建图形失败')
      }

      // 简易弹窗
      const el = document.createElement('div')
      el.className = 'event-popup'
      el.innerHTML = `<div class="title">${row.eventTitle || ''}</div><div class="sub">${row.eventLocation || ''}</div>`
      el.style.position = 'absolute'
      el.style.transform = 'translate(-50%, -100%)'
      el.style.pointerEvents = 'auto'
      el.style.display = 'none' // 初始隐藏
      mapView.value?.container?.appendChild(el)
      createMarkerPopup(el, [lon, lat])
      eventPopupMap.set(row.id, el)
      console.log('创建弹窗:', el)
    }
    
    console.log('图层中的图形数量:', eventsLayer.value.graphics.length)
    updateAllPopupPositions()
    console.log('完成事件点渲染')
  } catch (e) {
    console.error('渲染事件点失败', e)
  }
}

async function locateEvent(row: any) {
  const lon = Number(row.longitude)
  const lat = Number(row.latitude)
  if (!mapView.value || !Number.isFinite(lon) || !Number.isFinite(lat)) return
  try {
    const z = mapView.value.zoom
    await mapView.value.goTo({ center: [lon, lat], zoom: z }, { animate: true, duration: 700 })
  } catch (e) {}
}

const printEventOverviewData = async () => {
  try {
    const [eventListRes, eventStatRes, eventOverviewRes, messageNotification] = await Promise.all([
      MetricsEventOverviewAPI.getEventList(),
      MetricsEventOverviewAPI.getEventStat(),
      MetricsEventOverviewAPI.getEventOverview(),
      MetricsEventOverviewAPI.getMessageNotification()
    ])
    console.log('事件列表 getEventList =>', eventListRes)
    console.log('事件统计 getEventStat =>', eventStatRes)
    console.log('事件概况 getEventOverview =>', eventOverviewRes)
    console.log('消息通知 getMessageNotification =>', messageNotification)

    const data = (eventOverviewRes && eventOverviewRes.data) ? eventOverviewRes.data : eventOverviewRes
    if (data && (typeof data === 'object')) {
      eventOverviewData.value = {
        pendingEvent: Number(data.pendingEvent ?? 0),
        doneEvent: Number(data.doneEvent ?? 0),
        approachingEvent: Number(data.approachingEvent ?? 0)
      }
    }

    const stat = (eventStatRes && eventStatRes.data) ? eventStatRes.data : eventStatRes
    if (stat && typeof stat === 'object') {
      eventTypeOption.value = buildPieOption('事件类型', stat.eventTypeList || [])
      eventStatusOption.value = buildPieOption('事件状态', stat.eventStatusList || [])
    }

    const listRes = (eventListRes && eventListRes.data) ? eventListRes.data : eventListRes
    if (listRes && typeof listRes === 'object') {
      eventList.value = Array.isArray(listRes.list) ? listRes.list : []
      eventTotal.value = Number(listRes.total ?? eventList.value.length)
    }

    const msg = (messageNotification && messageNotification.data) ? messageNotification.data : messageNotification
    if (Array.isArray(msg)) {
      messageList.value = msg
    }

    await nextTick()
    adjustBottomPanelHeight()
    renderEventMarkers()
  } catch (error) {
    console.error('获取 MetricsEventOverviewAPI 数据失败:', error)
  }
}

watch(eventList, () => {
  renderEventMarkers()
})

onMounted(async () => {
  // 先初始化地图
  await initMap()
  // 地图初始化完成后再获取数据并渲染
  await printEventOverviewData()
  window.addEventListener('resize', onResize)
  nextTick(adjustBottomPanelHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  eventPopupMap.forEach((el) => el.remove())
  eventPopupMap.clear()
})
</script>
<style lang="scss" scoped>
 #mapContainer {
    width: 100%;
    height: calc(100vh - 56px);
    position: relative;
    /* 适当减少底部区高度，增大左侧上方区域占比 */
    --bottom-panel-height: 280px;
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
    overflow: auto;
    /* 优化滚动条样式，仅在需要时显示 */
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: rgba(116, 159, 229, 0.6) transparent; /* Firefox */
  }
  .container-content::-webkit-scrollbar {
    width: 8px;
  }
  .container-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .container-content::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(116, 159, 229, 0.8), rgba(74, 144, 226, 0.6));
    border-radius: 6px;
  }
  .container-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(140, 175, 235, 0.9), rgba(90, 155, 232, 0.8));
  }
 
  .overview-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    /* 移除固定高度，避免后续图表被裁剪 */
  }
  .overview-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(74, 144, 226, 0.4);
    border-radius: 10px;
    padding: 12px;
    min-height: 96px;
  }
  .card-title {
    font-size: 14px;
    color: #a9c7f7;
  }
  .card-value {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 800;
    color: #fff;
  }
 
  .pie-section {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .pie-card {
    background: rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(74, 144, 226, 0.25);
    border-radius: 10px;
    padding: 8px 8px 0;
  }
  .pie-title {
    font-size: 14px;
    font-weight: 600;
    color: #e6f4ff;
    margin: 0 0 6px 4px;
  }

  /* 消息通知表格样式，保持与面板主题一致 */
  .notify-table {
    width: 100%;
    border: 1px solid rgba(74, 144, 226, 0.25);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
  }
  .notify-thead {
    display: grid;
    grid-template-columns: 1fr 80px 100px 160px;
    padding: 8px 10px;
    background: rgba(74, 144, 226, 0.12);
    color: #cfe2ff;
    font-weight: 600;
    font-size: 13px;
  }
  .notify-tbody {
    max-height: 100%;
  }
  .notify-row {
    display: grid;
    grid-template-columns: 1fr 80px 100px 160px;
    padding: 8px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    align-items: center;
    color: #e6f4ff;
    font-size: 13px;
  }
  .notify-row:hover {
    background: rgba(74, 144, 226, 0.08);
  }
  .notify-row .col.title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status-badge {
    display: inline-block;
    min-width: 44px;
    padding: 2px 8px;
    border-radius: 999px;
    text-align: center;
    font-size: 12px;
  }
  .status-badge.read {
    background: rgba(76, 175, 80, 0.15);
    color: #9be199;
    border: 1px solid rgba(76, 175, 80, 0.35);
  }
  .status-badge.unread {
    background: rgba(255, 99, 71, 0.15);
    color: #ffb0a3;
    border: 1px solid rgba(255, 99, 71, 0.35);
  }

  /* 事件列表表格样式，延续一致风格 */
  .event-table {
    width: 100%;
    border: 1px solid rgba(74, 144, 226, 0.25);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
  }
  .event-thead {
    display: grid;
    grid-template-columns: 2fr 110px 160px 1.6fr 90px 110px 110px 90px 90px;
    padding: 8px 10px;
    background: rgba(74, 144, 226, 0.12);
    color: #cfe2ff;
    font-weight: 600;
    font-size: 13px;
  }
  .event-row {
    display: grid;
    grid-template-columns: 2fr 110px 160px 1.6fr 90px 110px 110px 90px 90px;
    padding: 8px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    align-items: center;
    color: #e6f4ff;
    font-size: 13px;
  }
  .event-row:hover {
    background: rgba(74, 144, 226, 0.08);
  }
  .event-row .col.title,
  .event-row .col.location,
  .event-row .col.dept {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
    font-size: 12px;
    white-space: nowrap;
  }
  .level-general { color: #cfe2ff; }
  .level-larger { color: #ffd27d; }
  .level-major { color: #ff9f7f; }
  .level-special_major { color: #ff6b6b; }
  .status-assigned { color: #76d9ff; }
  .status-report { color: #a9c7f7; }
  .status-processing { color: #ffd27d; }
  .status-close_case { color: #9be199; }
  .overdue-overdue { color: #ff9f7f; }
  .overdue-not_overdue { color: #9be199; }

  .panel-left {
    position: absolute;
    top: var(--panel-gap);
    left: var(--panel-gap);
    width: var(--left-panel-width);
    /* 与下方左2之间保持固定 1 个间距 */
    bottom: calc(var(--bottom-panel-height) + var(--panel-gap));
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
  .locate-btn {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(74, 144, 226, 0.5);
    background: rgba(74, 144, 226, 0.15);
    color: #cfe2ff;
    cursor: pointer;
  }
  .locate-btn:hover {
    background: rgba(74, 144, 226, 0.25);
  }
  .event-popup {
    background: rgba(0, 0, 0, 0.65);
    border: 1px solid rgba(74, 144, 226, 0.6);
    border-radius: 8px;
    padding: 8px 10px;
    color: #e6f4ff;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  }
  .event-popup .title {
    font-size: 13px;
    font-weight: 700;
  }
  .event-popup .sub {
    margin-top: 2px;
    font-size: 12px;
    color: #a9c7f7;
  }
</style>
