<template>
  <div>
    <div class="card-box">
      <div class="card-item" v-for="item, index in tabs" :key="index">
        <img :src="item.icon" />
        <div class="info">
          <div class="title">{{ item.label }}</div>
          <div class="nums">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <el-radio-group v-model="radioValue" @change="onRadioChange">
          <el-radio-button :label="item.label" :value="index" v-for="item, index in tabs" :key="index" />
        </el-radio-group>
        <p class="warning" v-if="!isWarning">简阳市：暂无预警</p>
        <div id="map" v-loading="isLoading"
          :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
          :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`">
        </div>
        <div class="warning-box">
          <div class="warning-item" v-for="item, index in warningValue" :key="index">
            <img :src="warningIcon[index]" />
            <div class="info">
              <div class="title">{{ warningText[index] }}</div>
              <div class="nums">{{ warningValue[index] }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <at-title :title="tabs[radioValue].label + '信息'" />
        <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
        <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
          <template #status="{ row }">
            {{ row.status == '0' ? '关闭' : '启动' }}
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="onSwitchChange(row.id)" />
          </template>
        </at-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import icon1 from '@/assets/imgs/floodctrl/publish/icon-1.png'
import icon2 from '@/assets/imgs/floodctrl/publish/icon-2.png'
import icon3 from '@/assets/imgs/floodctrl/publish/icon-3.png'
import icon4 from '@/assets/imgs/floodctrl/publish/icon-4.png'
import icon11 from '@/assets/imgs/floodctrl/publish/icon-11.png'
import icon12 from '@/assets/imgs/floodctrl/publish/icon-12.png'
import icon13 from '@/assets/imgs/floodctrl/publish/icon-13.png'
import icon14 from '@/assets/imgs/floodctrl/publish/icon-14.png'
import icon15 from '@/assets/imgs/floodctrl/publish/icon-15.png'
import { initGisMap } from '@/utils/gis'
import { DisasterWarnApi } from '@/api/Floodctrl/publish/disasterwarn'
import { DisasterResponseApi } from '@/api/Floodctrl/publish/disasterresponse'
const message = useMessage()
const tabs = reactive([{
  label: '气象预警',
  value: '0',
  icon: icon1
}, {
  label: '灾害预警',
  value: '0',
  icon: icon2
}, {
  label: '防汛响应',
  value: '0',
  icon: icon3
}, {
  label: '抗旱响应',
  value: '0',
  icon: icon4
}])
const radioValue = ref(0)

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const warningText = computed(() => {
  return radioValue.value > 1 ? ['I 级响应', 'II 级响应', 'III 级响应', 'IV 级响应', '无响应'] : ['红色预警', '橙色预警', '黄色预警', '蓝色预警', '无预警']
})
const warningValue = reactive([0, 0, 0, 0, 0])
const warningIcon = ref([icon11, icon12, icon13, icon14, icon15])
const atTableRef = ref()
const queryParams = reactive({
  type: '1'
})
const queryFields = reactive({
  deptId: {
    label: '区县',
    components: 'select',
  },
  publishTime: {
    label: '时间',
    components: 'date',
    type: 'daterange'
  },
  status: {
    label: '状态',
    components: 'select',
    options: [{
      value: '0',
      label: '关闭'
    }, {
      value: '1',
      label: '启动'
    }]
  },
})
const tableConfig = reactive({
  api: DisasterWarnApi.getDisasterWarnPage,
  immediate: false,
  fields: {
    deptName: {
      label: '地区'
    },
    disTypeName: {
      label: '气象灾难名称'
    },
    levelName: {
      label: '预警等级'
    },
    name: {
      label: '预警标题'
    },
    status: {
      label: '预警状态'
    },
    publishTime: {
      label: '发布时间',
      formatter: 'dateTime'
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('map'))
  console.log(map, view)
  mapView.value = view
  mapView.value.zoom = 9
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  // 禁用拖动（平移）
  view.on("drag", function (event) {
    event.stopPropagation();
  });

  // 禁用触摸设备上的拖动
  view.on("drag-start", function (event) {
    event.stopPropagation();
  });

  // 禁用鼠标滚轮缩放
  view.on("mouse-wheel", function (event) {
    event.stopPropagation();
  });

  // 禁用双击缩放
  view.on("double-click", function (event) {
    event.stopPropagation();
  });

  // 禁用键盘导航（箭头键移动地图）
  view.on("key-down", function (event) {
    const prohibitedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-", "="];
    if (prohibitedKeys.includes(event.key)) {
      event.stopPropagation();
    }
  });
};
const getDisasterWarnCountByType = () => {
  DisasterWarnApi.getDisasterWarnCountByType().then(res => {
    tabs[0].value = res.weaWarn
    tabs[1].value = res.disWarn
    tabs[2].value = res.fxRes
    tabs[3].value = res.khRes

  })
}
const isWarning = computed(() => {
  return warningValue[0] > 0 || warningValue[1] > 0 || warningValue[2] > 0 || warningValue[3] > 0
})
const onRadioChange = () => {
  tableConfig.api = radioValue.value > 1 ? DisasterResponseApi.getDisasterResponsePage : DisasterWarnApi.getDisasterWarnPage
  let typeArr = ['1', '2', '1', '2']
  queryParams.type = typeArr[radioValue.value]
  getDisasterPageCount()
  handleSearch()
}
const getDisasterPageCount = () => {
  let promise = DisasterWarnApi.getDisasterWarnPageCount
  if (radioValue.value > 1) {
    promise = DisasterResponseApi.getDisasterResponsePageCount
  }
  promise({
    type: queryParams.type
  }).then(res => {
    warningValue[0] = res.disNum.red ?? res.disNum['1']
    warningValue[1] = res.disNum.orange ?? res.disNum['2']
    warningValue[2] = res.disNum.yellow ?? res.disNum['3']
    warningValue[3] = res.disNum.blue ?? res.disNum['4']
    warningValue[4] = res.disNum.normal
  })
}
const onSwitchChange = (id) => {
  if (!id) return
  let promise = DisasterWarnApi.changeDisasterWarnStatus
  if (radioValue.value > 1) {
    promise = DisasterResponseApi.changeDisasterResponseStatus
  }
  promise(id).then(res => {
    message.success('操作成功')
    handleSearch()
    getDisasterPageCount()
  })
}
onMounted(() => {
  initMap()
  getDisasterWarnCountByType()
  getDisasterPageCount()
  handleSearch()
})
onUnmounted(() => {
  if (mapView.value) {
    mapView.value.destroy();
    mapView.value = null;
  }
  if (gisMap.value) {
    gisMap.value.destroy()
    gisMap.value = null
  }
})
</script>
<style lang="scss" scoped>
.card-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;

  .card-item {
    background: #F7F7F7;
    border-radius: 8px;
    flex: 1;
    padding: 24px 32px;
    display: flex;

    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .title {
      font-weight: 600;
      font-size: 16px;
      color: #666666;
    }

    .nums {
      font-weight: bold;
      font-size: 32px;
      color: #333333;
      line-height: 1;
    }

    &+.card-item {
      margin-left: 20px;
    }
  }
}

.content {
  display: flex;
  margin-top: 16px;

  .left {
    width: 500px;
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;
    flex-shrink: 0;

    .warning {
      margin-top: 24px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
    }

    #map {
      margin-top: 12px;
      height: 460px;
    }

    .warning-box {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .warning-item {
        display: flex;
        width: 33.33%;
        margin-top: 32px;

        img {
          width: 24px;
          height: 24px;
          margin-right: 12px;
        }

        .info {
          .title {
            font-weight: 400;
            font-size: 14px;
            color: #333333;
          }

          .nums {
            font-weight: 400;
            font-size: 14px;
            color: #333333;
          }
        }
      }
    }
  }

  .right {
    margin-left: 16px;
    border-radius: 8px;
    background-color: #fff;
    padding: 20px;

    .at-title {
      margin-bottom: 16px;
    }
  }
}
</style>
