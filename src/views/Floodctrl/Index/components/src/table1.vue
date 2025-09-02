<template>
  <div class="card">
    <div class="search">
      <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
      <div class="right">
        <el-button type="primary" link @click="onFilterClick">
          筛选<el-icon>
            <Filter />
          </el-icon>
        </el-button>
        <el-radio-group v-model="isList" size="small">
          <el-radio-button :value="true">
            <el-icon>
              <Tickets />
            </el-icon>
          </el-radio-button>
          <el-radio-button :value="false">
            <el-icon>
              <MapLocation />
            </el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" v-if="isList" />
    <div class="map-box" v-else>
      <Rain />
    </div>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
  </div>
</template>
<script lang="ts" setup>
import { Filter, MapLocation, Tickets } from '@element-plus/icons-vue'
import Rain from '@/views/Floodctrl/Scada/Rain/index.vue'
import { formatToDateTime } from '@/utils/dateUtil'
import { SiteApi } from '@/api/Floodctrl/site'
const atTableRef = ref()
const isList = ref(true)
const queryParams = reactive({})
const queryFields = reactive({
  value1: {
    label: '',
    components: 'select',
    options: [{ label: '站名', value: '1' }, { label: '河道名', value: '2' }]
  },
  value2: {
    label: '',
    components: 'input',
    placeholder: '搜索关键字'
  }
})
const tableConfig = reactive({
  list: [] as any,
  height: 'auto',
  fields: {
    value1: {
      label: '站名'
    },
    value2: {
      label: '行政区'
    },
    value3: {
      label: '位置'
    },
    value4: {
      label: '当日累计(mm)'
    },
    value5: {
      label: '昨日累计(mm)'
    },
    value6: {
      label: '一小时雨量(mm)'
    },
    value7: {
      label: '实时雨量(mm)'
    },
    value8: {
      label: '属性'
    },
    value9: {
      label: '采集时间'
    },
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '筛选',
  readonly: false,
  width: '500px',
  formData: queryParams,
  fields: {
    deptId: {
      label: '行政区域',
      components: 'select',
      row: 24
    },
    value3: {
      label: '雨量',
      components: 'select',
      row: 24
    },
    value4: {
      label: '来源',
      components: 'select',
      row: 24
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const onFilterClick = () => {
  dialogConfig.visible = true
}
const submitDialogForm = () => {
  dialogConfig.visible = false
  handleSearch()
}
const getTableList = () => {
  SiteApi.getSitePage({ pageNo: 1, pageSize: 9999, siteType: 'WATER_RAIN_STATION' }).then(res => {
    res.list.forEach((item: any, i: number) => {
      tableConfig.list.push({
        value1: item.siteName,
        value2: item.regionName,
        value3: item.mapAddress,
        value4: '1.000',
        value5: '0.500',
        value6: '1.000',
        value7: '0.000',
        value8: '水利处',
        value9: formatToDateTime(new Date().setDate(new Date().getDate() - i)),
      })
    })
  })
}
onMounted(() => {
  getTableList()
})
</script>
<style lang="scss" scoped>
.search {
  display: flex;
  align-items: center;

  .right {
    margin-left: auto;
    margin-bottom: 18px;
    display: flex;
    align-items: center;

    .el-radio-group {
      margin-left: 20px;
    }
  }
}

.map-box {
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>