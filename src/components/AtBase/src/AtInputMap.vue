<template>
  <div class="at-input-map">
    <el-select filterable remote v-model="mapValue" :remote-method="remoteMethod" :loading="selectLoading"
      placeholder="请输入或打开地图" @change="handleSelectChange">
      <el-option v-for="item in addressList" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <el-button class="btn-map" link type="primary" @click="openMap">地图</el-button>
  </div>
  <Dialog title="地图选取" v-model="dialogVisible" destroy-on-close :width="width" :maxHeight="maxHeight"
    :fullscreen="fullscreen" append-to-body :before-close="beforeClose" :class="{ html5Dialog: screenWidth < 768 }">
    <div id="mapContainer" v-loading="isLoading"
      :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
      :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
    <!-- 搜索区 -->
    <at-map-search :map="mapView" @click="handleSearch" />
  </Dialog>
</template>
<script setup lang="ts">
import { GISApi } from '@/api/Floodctrl/gis'
import { initGisMap, reverseGeocoding } from '@/utils/gis'

const emit = defineEmits(['update:modelValue', 'change', 'close'])
const props = defineProps({
  modelValue: {
    type: String,
    default: () => ''
  },
  config: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: String,
    default: () => '80%'
  },
  maxHeight: {
    type: String,
    default: () => '400px'
  },
  fullscreen: {
    type: Boolean,
    default: () => true
  }
})
let mapValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const selectLoading = ref<boolean>(false)
const addressList = ref<any>([])
const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);

const dialogVisible = ref<boolean>(false)
const message = useMessage() // 消息弹窗
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const screenWidth = window.screen.width

const beforeClose = () => {
  dialogVisible.value = false
  emit('close')
}
const handleSearch = () => {

}
const handleSelectChange = (item) => {
  let obj = addressList.value.find(e => e.value == item)
  if (obj)
    emit('change', {
      mapAddress: obj.value,
      longitude: obj.longitude,
      latitude: obj.latitude
    })
}
const remoteMethod = (keyword) => {
  if (keyword.length < 2) return;
  GISApi.getKeywordSearch(keyword).then(res => {
    addressList.value = res.map(e => {
      return {
        label: e.name,
        value: e.name,
        longitude: e.location.lng,
        latitude: e.location.lat
      }
    })
  })
}
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  isLoading.value = false;
  view.on('click', async (e) => {
    const { mapPoint } = e
    const res: any = await reverseGeocoding([mapPoint.longitude, mapPoint.latitude])
    if (res && res.length > 0) {
      const address = res[0].sf_rgeo_result.name
      await message.delConfirm(`确认选择当前地址 ${address}`)
      mapValue.value = address
      beforeClose()
      emit('change', {
        mapAddress: address,
        longitude: mapPoint.longitude,
        latitude: mapPoint.latitude
      })
    }
  })
}
const openMap = () => {
  dialogVisible.value = true
  nextTick(() => {
    initMap()
  })
}

onUnmounted(() => {
  isLoading.value = true
  loadingText.value = '地图加载中...'
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
.at-input-map {
  display: flex;
  align-items: center;
  width: 100%;

  :deep(.el-select) {
    .el-select__placeholder {
      width: calc(100% - 40px);
    }
  }

  .btn-map {
    position: absolute;
    right: 12px;
  }
}

#mapContainer {
  width: 100%;
  height: 60vh;

  @media screen and (max-width: 768px) {
    height: calc(100vh - 16px * 2 - 53px) !important;
  }
}

#panel {
  background-color: white;
  max-height: 90%;
  overflow-y: auto;
  width: 300px;
}

.searchBox {
  position: absolute;
  background-color: white;
  max-height: 90%;
  overflow-y: auto;
  top: 85px;
  left: 31px;
  width: 300px;
}
</style>
