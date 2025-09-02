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
      <Flowmeter />
    </div>
    <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
  </div>
</template>
<script lang="ts" setup>
import { Filter, MapLocation, Tickets } from '@element-plus/icons-vue'
import Flowmeter from '@/views/Floodctrl/Scada/Flowmeter/index.vue'
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
      label: '水位(m)'
    },
    value5: {
      label: '流量(m³/s)'
    },
    value6: {
      label: '超警戒流量(m³/s)'
    },
    value7: {
      label: '超保流量(m³/s)'
    },
    value8: {
      label: '水位涨幅(m)'
    },
    value9: {
      label: '流量涨幅(m³/s)'
    },
    value10: {
      label: '属性'
    },
    value11: {
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
      label: '水位',
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
        value4: '472.80',
        value5: '35.400',
        value6: '-92.120',
        value7: '-121.2',
        value8: '-0.020',
        value9: '-1.550',
        value10: '水文中心',
        value11: formatToDateTime(new Date().setDate(new Date().getDate() - i)),
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