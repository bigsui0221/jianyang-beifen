<template>
  <!-- 搜索区 -->
  <div class="searchBox">
    <el-input v-model="placeSearchValue" placeholder="请输入地址进行搜索" @keydown.enter="handleSearch" clearable
      @clear="handleClear" />
    <div id="panel"></div>
    <div class="address-list" v-loading="loading" v-if="addressList.length > 0">
      <div class="address-item" v-for="item, index in addressList" :key="index" @click="onAddressItemClick(item)">
        <div class=" name">{{ item.name }}</div>
        <div class="address">{{ item.address }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GISApi } from '@/api/Floodctrl/gis'
import { createMarkerGraphic } from '@/utils/gis'
import icon from '@/assets/imgs/floodctrl/base/icon-1.png'
const emit = defineEmits(['click'])
const props = defineProps({
  map: {
    type: Object,
    default: () => ({})
  }
})
watch(() => props.map, () => {

})
const loading = ref(false)
const placeSearchValue = ref<string>('')
const addressList = ref<any>([])
const handleSearch = () => {
  loading.value = true
  GISApi.getKeywordSearch(placeSearchValue.value).then((res) => {
    addressList.value = res
  }).finally(() => {
    loading.value = false
  })
}
const handleClear = () => {
  addressList.value = []
}
const onAddressItemClick = (item) => {
  emit('click', item)
  let position: [number, number] = [Number(item.location.lng), Number(item.location.lat)]
  props.map?.goTo({
    target: position,
    zoom: 16,
    duration: 1500
  })
    .then(() => {
      createSearchMarker(position)
    })
    .catch(error => {
      console.error("移动到坐标失败：", error);
    });
}
const createSearchMarker = (position) => {
  props.map.graphics.forEach(graphic => {
    // 检查当前图形是否为自定义marker
    if (graphic.attributes && graphic.attributes.type === "search") {
      props.map.graphics.remove(graphic);
    }
  });
  const marker = createMarkerGraphic(position, icon, { type: 'search' })
  props.map.graphics.add(marker)
}
onMounted(() => {

})
</script>

<style lang="scss" scoped>
#panel {
  background-color: #fff;
  max-height: 90%;
  overflow-y: auto;
  width: 300px;
}

.searchBox {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 300px;
  z-index: 99;

  .address-list {
    margin-top: 8px;
    background-color: #fff;
    max-height: 400px;
    overflow-y: auto;
    border-radius: 4px;
    padding: 8px;

    &::-webkit-scrollbar {
      display: none;
    }

    .address-item {
      padding: 8px 8px;
      border-radius: 4px;

      &:hover {
        cursor: pointer;
        background-color: rgba($color: #000000, $alpha: .1);
      }

      .name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .address {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>
