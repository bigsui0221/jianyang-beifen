<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div class="search">
      数据时间段：
      <div class="tab" v-for="tab, index in tabs" :key="index" :class="{ active: activeTab === index }"
        @click="onTabClick(index)">
        <span>{{ tab.label }}</span>
        <div class="daterange" v-if="index == 5">
          <el-date-picker v-model="queryParams.daterange" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期" />
        </div>
      </div>
      <at-select v-model="queryParams.siteId" :config="{
        label: '站点',
        components: 'select',
        api: ZtfxMockApi.getStationListByZtfxType,
        params: {
          type: 2
        },
        response: (data) => {
          return data.map((item: any) => {
            return {
              label: item.siteName,
              value: item.id
            }
          })
        }
      }" />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ZtfxMockApi } from '@/api/Floodctrl/statistics/ztfxmock'
import { formatToDateTime } from '@/utils/dateUtil'

const atTableRef = ref()
const tabs = [{
  label: '1小时',
  daterange: [new Date().setHours(new Date().getHours() - 1), new Date()],
}, {
  label: '3小时',
  value: [new Date().setHours(new Date().getHours() - 3), new Date()],
}, {
  label: '6小时',
  value: [new Date().setHours(new Date().getHours() - 6), new Date()],
}, {
  label: '12小时',
  value: [new Date().setHours(new Date().getHours() - 12), new Date()],
}, {
  label: '24小时',
  value: [new Date().setHours(new Date().getHours() - 24), new Date()],
}, {
  label: '自定义时间：',
}]
const activeTab = ref(0)
const queryParams = reactive<any>({
  daterange: [],
  type: '2',
  startTime: null,
  endTime: null
})
const onTabClick = (index) => {
  activeTab.value = index
  queryParams.startTime = formatToDateTime(tabs[index]?.value?.[0])
  queryParams.endTime = formatToDateTime(tabs[index]?.value?.[1])
}
const tableConfig = reactive({
  api: ZtfxMockApi.getZtfxMockPage,
  exclude: ['daterange'],
  immediate: false,
  fields: {
    index: true,
    siteName: {
      label: '站点'
    },
    rainfall: {
      label: '降雨量'
    },
    overAlert: {
      label: '超警戒',
      formatter: (val) => {
        return val ? '是' : '否'
      }
    },
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const resetQuery = () => {
  queryParams.daterange = []
  queryParams.type = '2'
  queryParams.startTime = null
  queryParams.endTime = null
}
onMounted(() => {
  onTabClick(4)
  handleSearch()
})
</script>
<style lang="scss" scoped>
.search {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .tab {
    margin-right: 12px;
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;

    span {
      min-width: 66px;
      border-bottom: 1px solid transparent;
      margin-right: 12px;
    }

    &:hover,
    &.active {
      span {
        color: #409eff;
        border-color: #409eff;
      }
    }
  }

  :deep(.el-date-editor).el-input__wrapper,
  .el-select {
    width: 200px;
    margin-right: 12px;
  }
}
</style>
