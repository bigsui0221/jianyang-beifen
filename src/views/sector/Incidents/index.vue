
<template>
   <div id="mapContainer" ref="mapRoot" v-loading="isLoading" element-loading-text="数据加载中...">
     <div class="panel-left">
       <div class="panel-container" ref="leftPanel">
         <div class="container-header">
           <div class="header-icon">
             <img :src="titleIcon" alt="事件概况" class="title-icon" />
           </div>
           <h3>事件概况</h3>
         </div>
         <div class="container-content">
          <div class="overview-cards">
            <div class="overview-card pending-card">
              <div class="card-title">待办事件</div>
              <div class="card-value">{{ eventOverviewData.pendingEvent || 0 }}</div>
            </div>
            <div class="overview-card done-card">
              <div class="card-title">已办事件</div>
              <div class="card-value">{{ eventOverviewData.doneEvent || 0 }}</div>
            </div>
            <div class="overview-card approaching-card">
              <div class="card-title">临期事件</div>
              <div class="card-value">{{ eventOverviewData.approachingEvent || 0 }}</div>
            </div>
          </div>

          <div class="pie-section">
            <div class="pie-card">
              <div class="pie-title">事件类型占比</div>
              <EChart v-if="eventTypeOption" :options="eventTypeOption" height="1.9rem" width="100%" /> <!-- 190px → 1.9rem，图表高度响应式 -->
            </div>
            <div class="pie-card">
              <div class="pie-title">事件状态占比</div>
              <EChart v-if="eventStatusOption" :options="eventStatusOption" height="1.9rem" width="100%" /> <!-- 190px → 1.9rem，图表高度响应式 -->
            </div>
          </div>
         </div>
       </div>
     </div>
     <div class="bottom-row">
       <div class="panel-left2">
         <div class="panel-container">
           <div class="container-header">
             <div class="header-icon">
               <img :src="titleIcon" alt="消息通知" class="title-icon" />
             </div>
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
             <div class="header-icon">
               <img :src="titleIcon" alt="事件列表" class="title-icon" />
             </div>
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
import titleIcon from '@/assets/imgs/sector/title-icon.png'
import EChart from '@/components/Echart/src/Echart.vue'

// REM 响应式设置 - 基于1920px设计稿
const setRem = () => {
  const designWidth = 1920 // 设计稿基准宽度
  const currentWidth = window.innerWidth
  // 计算缩放比例，以100px为基准字体大小
  const fontSize = Math.min((currentWidth / designWidth) * 100, 200) // 限制最大200px
  document.documentElement.style.fontSize = fontSize + 'px'
  console.log(`[Incidents] 屏幕宽度: ${currentWidth}px, 根字体大小: ${fontSize}px`)
}

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
    
    console.log('地图初始化完成')
  } catch (error) {
    console.error('地图初始化失败:', error)
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
    
    // 数据加载完成后隐藏loading
    isLoading.value = false
  } catch (error) {
    console.error('获取 MetricsEventOverviewAPI 数据失败:', error)
    // 即使出错也要隐藏loading
    isLoading.value = false
  }
}

watch(eventList, () => {
  renderEventMarkers()
})

onMounted(async () => {
  // 设置 REM 响应式
  setRem()
  window.addEventListener('resize', setRem)
  
  // 先初始化地图
  await initMap()
  // 地图初始化完成后再获取数据并渲染
  await printEventOverviewData()
  window.addEventListener('resize', onResize)
  nextTick(adjustBottomPanelHeight)
})

onBeforeUnmount(() => {
  // 清理 REM 监听器
  window.removeEventListener('resize', setRem)
  
  window.removeEventListener('resize', onResize)
  eventPopupMap.forEach((el) => el.remove())
  eventPopupMap.clear()
})
</script>
<style lang="scss" scoped>
 #mapContainer {
  width: 100vw;   /* 响应式宽度 */
  height: calc(100vh - 0.6rem); /* 100vh - 0.6rem(菜单栏高度，响应式) */
  position: relative;
  
  /* CSS变量定义 - 转换为rem */
  --left-panel-width: 4.9rem;    /* 490px / 100 = 4.9rem，事件概况框宽度 */
  --bottom-panel-height: 3.45rem; /* 345px / 100 = 3.45rem，消息通知框高度 */
  --panel-gap: 0.12rem;          /* 12px / 100 = 0.12rem，面板间距 */
}
 
  /* 复用 metrics 深色面板风格 */
  .panel-container {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: linear-gradient( 180deg, rgba(0,40,96,0) 0%, rgba(0,42,95,0.09) 23%, rgba(0,42,97,0.24) 45%, rgba(0,40,96,0.27) 100%), linear-gradient( 180deg, rgba(16,98,222,0.12) 0%, rgba(17,96,219,0.11) 55%, rgba(19,98,215,0.05) 76%, rgba(0,95,223,0.03) 100%), rgba(0,15,42,0.7);
    border-radius: 0.12rem;  /* 12px / 100 = 0.12rem，圆角响应式 */
    border: 0.02rem solid rgba(74, 144, 226, 0.6);  /* 2px / 100 = 0.02rem */
    box-shadow: 
      0 0.08rem 0.32rem rgba(0, 0, 0, 0.4),  /* 0 8px 32px → rem */
      inset 0 0.01rem 0 rgba(255, 255, 255, 0.1);  /* 0 1px 0 → rem */
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .panel-container:hover {
    transform: translateY(-0.02rem);  /* -2px / 100 = -0.02rem */
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 0.12rem 0.4rem rgba(0, 0, 0, 0.5),  /* 0 12px 40px → rem */
      0 0 0.2rem rgba(74, 144, 226, 0.3),   /* 0 0 20px → rem */
      inset 0 0.01rem 0 rgba(255, 255, 255, 0.2);  /* 0 1px 0 → rem */
  }
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
  }

  .container-header h3 {
    margin: 0;
    font-family: 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', sans-serif;
    font-weight: normal;
    font-size: 0.16rem;  /* 16px / 100 = 0.16rem，标题文字响应式 */
    color: #FFFFFF;
    text-shadow: 0px 0px 0.07rem rgba(75,180,229,0.69), 0px 0.02rem 0.08rem rgba(5,28,55,0.42);  /* 7px 2px 8px → rem */
    position: relative;
    z-index: 1;
  }
  .container-content {
    padding: 0.2rem;  /* 20px / 100 = 0.2rem，内边距响应式 */
    flex: 1 1 auto;
    min-height: 0;
    color: #e6f4ff;
    overflow: hidden; /* 隐藏左1面板的滚动条 */
    display: flex;
    flex-direction: column;
  }
 
  .overview-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
    /* 移除固定高度，避免后续图表被裁剪 */
  }
  .overview-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.06);
    border: 0.01rem solid rgba(74, 144, 226, 0.4);  /* 1px / 100 = 0.01rem */
    border-radius: 0.1rem;   /* 10px / 100 = 0.1rem，圆角响应式 */
    padding: 0.12rem;        /* 12px / 100 = 0.12rem，内边距响应式 */
    height: 0.9rem;          /* 90px / 100 = 0.9rem，高度响应式 */
  }
  .card-title {
    font-size: 0.14rem;  /* 14px / 100 = 0.14rem，界面文字跟随整体缩放 */
    color: #a9c7f7;
  }
  .card-value {
    margin-top: 0.08rem;  /* 8px / 100 = 0.08rem，边距响应式 */
    font-size: clamp(22px, 1.8vw, 36px);  /* 数据值使用clamp确保可读性 */
    font-weight: 800;
    color: #fff;
  }
  
  /* 不同卡片的数字颜色 */
  .pending-card .card-value {
    color: #3EEAB7;
  }
  
  .done-card .card-value {
    color: #22BFFF;
  }
  
  .approaching-card .card-value {
    color: #F7BA1E;
  }
 
  .pie-section {
    margin-top: 0.12rem;  /* 12px / 100 = 0.12rem，边距响应式 */
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.12rem;  /* 12px / 100 = 0.12rem，间距响应式 */
  }
  .pie-card {
    background: rgba(0, 0, 0, 0.08);
    border: 0.01rem solid rgba(74, 144, 226, 0.25);  /* 1px / 100 = 0.01rem */
    border-radius: 0.1rem;  /* 10px / 100 = 0.1rem，圆角响应式 */
    padding: 0.08rem 0.08rem 0;  /* 8px 8px 0 → rem，内边距响应式 */
  }
  .pie-title {
    font-size: 0.14rem;  /* 14px / 100 = 0.14rem，界面文字跟随整体缩放 */
    font-weight: 600;
    color: #e6f4ff;
    margin: 0 0 0.06rem 0.04rem;  /* 0 0 6px 4px → rem，边距响应式 */
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
    grid-template-columns: 1fr 0.8rem 1rem 1.6rem;  /* 80px 100px 160px → rem */
    padding: 0.08rem 0.1rem;  /* 8px 10px → rem，内边距响应式 */
    background: rgba(74, 144, 226, 0.12);
    color: #cfe2ff;
    font-weight: 600;
    font-size: clamp(11px, 0.75vw, 15px);  /* 13px → clamp，表格标题使用clamp确保可读性 */
  }
  .notify-tbody {
    max-height: 2rem;  /* 200px / 100 = 2rem，最大高度响应式 */
    overflow-y: auto; /* 添加垂直滚动 */
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  .notify-tbody::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  .notify-row {
    display: grid;
    grid-template-columns: 1fr 0.8rem 1rem 1.6rem;  /* 80px 100px 160px → rem */
    padding: 0.08rem 0.1rem;  /* 8px 10px → rem，内边距响应式 */
    border-top: 0.01rem solid rgba(255, 255, 255, 0.06);  /* 1px / 100 = 0.01rem */
    align-items: center;
    color: #e6f4ff;
    font-size: clamp(11px, 0.75vw, 15px);  /* 13px → clamp，表格内容使用clamp确保可读性 */
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
    min-width: 0.44rem;  /* 44px / 100 = 0.44rem，最小宽度响应式 */
    padding: 0.02rem 0.08rem;  /* 2px 8px → rem，内边距响应式 */
    border-radius: 9.99rem;  /* 999px → 9.99rem，圆形在rem下保持 */
    text-align: center;
    font-size: clamp(10px, 0.7vw, 14px);  /* 12px → clamp，状态文字使用clamp确保可读性 */
  }
  .status-badge.read {
    background: rgba(76, 175, 80, 0.15);
    color: #9be199;
    border: 0.01rem solid rgba(76, 175, 80, 0.35);  /* 1px / 100 = 0.01rem */
  }
  .status-badge.unread {
    background: rgba(255, 99, 71, 0.15);
    color: #ffb0a3;
    border: 0.01rem solid rgba(255, 99, 71, 0.35);  /* 1px / 100 = 0.01rem */
  }

  /* 事件列表表格样式，延续一致风格 */
  .event-table {
    width: 100%;
    border: 0.01rem solid rgba(74, 144, 226, 0.25);  /* 1px / 100 = 0.01rem */
    border-radius: 0.08rem;  /* 8px / 100 = 0.08rem，圆角响应式 */
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
  }
  .event-thead {
    display: grid;
    grid-template-columns: 2fr 1.1rem 1.6rem 1.6fr 0.9rem 1.1rem 1.1rem 0.9rem 0.9rem;  /* 110px 160px 90px → rem */
    padding: 0.08rem 0.1rem;  /* 8px 10px → rem，内边距响应式 */
    background: rgba(74, 144, 226, 0.12);
    color: #cfe2ff;
    font-weight: 600;
    font-size: clamp(11px, 0.75vw, 15px);  /* 13px → clamp，表格标题使用clamp确保可读性 */
  }
  .event-tbody {
    max-height: 2rem;  /* 200px / 100 = 2rem，最大高度响应式 */
    overflow-y: auto; /* 添加垂直滚动 */
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  .event-tbody::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
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
    top: 0.24rem;  /* 固定0.24rem边距 */
    left: 0.24rem; /* 24px / 100 = 0.24rem，左边距与metrics保持一致 */
    width: var(--left-panel-width);
    height: 6rem; /* 固定6rem高度 */
    display: flex;
    flex-direction: column;
  }

  .bottom-row {
    position: absolute;
    left: 0.24rem;   /* 24px / 100 = 0.24rem，左边距与metrics保持一致 */
    right: 0.24rem;  /* 24px / 100 = 0.24rem，右边距与metrics保持一致 */
    top: 6.48rem;    /* panel-left的top(0.24rem) + height(6rem) + 间隔(0.24rem) = 6.48rem */
    bottom: 0.24rem; /* 24px / 100 = 0.24rem，底部边距 */
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
    padding: 0.04rem 0.1rem;  /* 4px 10px → rem，内边距响应式 */
    border-radius: 0.06rem;   /* 6px / 100 = 0.06rem，圆角响应式 */
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
    /* 确保悬浮框距离上下和左边都保持24px */
    min-width: 200px;
    max-width: 300px;
    z-index: 1000;
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
