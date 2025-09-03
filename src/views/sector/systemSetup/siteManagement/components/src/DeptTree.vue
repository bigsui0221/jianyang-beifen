<template>
  <div class="flex w-500px">
    <div class="flex-1">
      <div class="mb-20px">行政区划</div>
      <div class="head-container">
        <el-input v-model="areaName" class="mb-20px" clearable placeholder="请输入行政区划">
          <template #prefix>
            <Icon icon="ep:search" />
          </template>
        </el-input>
      </div>
      <div class="head-container">
        <div style="cursor: pointer;" v-for="item in filteredAreaData" :key="item.id" @click="handleClick(item)">{{ 
          item.regionName }}</div>
      </div>
    </div>
    <div class="ml-50px flex-1">
      <div class="mb-20px flex flex-justify-between">
        <div>站点列表</div>
        <el-button type="primary" @click="handleAdd">+</el-button>
      </div>
      <el-select
        v-model="sitevalue"
        class="mr-2 mb-20px"
        filterable
        @change="onTimeUnitChange"
      >
        <el-option
          v-for="item in siteList"
          :key="item.siteType.name"
          :label="item.siteType.desc"
          :value="item.siteType.name"
        />
      </el-select>
      <div class="head-container">
        <el-input v-model="siteName" class="mb-20px" clearable placeholder="请输入站点列表">
          <template #prefix>
            <Icon icon="ep:search" />
          </template>
        </el-input>
      </div>
      <div class="head-container">
        <div style="cursor: pointer;" v-for="item in filteredSiteList" :key="item.id" @click="handleNodeClick(item)">{{ 
          item.siteName }}</div>
        <!-- <el-tree ref="treeRef" :data="siteList" :expand-on-click-node="false" :filter-node-method="filterNode"
          :props="defaultProps" default-expand-all highlight-current node-key="id" @node-click="handleNodeClick" /> -->
      </div>
    </div>
  </div>


</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'
import {  TIME_UNIT_TYPES  } from '@/components/SimpleProcessDesignerV2/src/consts'
import {RegionApi} from '@/api/Floodctrl/region'  
import {SiteApi} from '@/api/Floodctrl/site'



defineOptions({ name: 'SystemUserDeptTree' })

const areaName = ref('')
const siteName = ref('')
const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()
const sitevalue = ref()
const areadata = ref()
const siteList = ref()
/** 获得部门树 */
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}
// 添加响应式状态
const selectedRegionId = ref<string | number | null>(null)
const selectedSiteType = ref<string | null>(null)
//获得区域数据
const getRegion = async () => {
  const res = await RegionApi.getRegionPage({
    pageNo: 1,
    pageSize: 1000,
  })
  console.log(res.list);
  areadata.value = res.list
}
//获得站点数据
const getSite = async () => {
  const res = await SiteApi.getSitePage({
    pageNo: 1,
    pageSize: 1000,
  })
  console.log(res.list);
  //过滤掉没有siteType字段值的数据
  siteList.value = res.list.filter(item => item.siteType !== null)
  console.log(siteList.value);

}
const onTimeUnitChange = (value:any) => {
  console.log('siteType.name',value);
  // siteList.value = siteList.value.filter((item) => item.siteType.name.includes(e))
  console.log(siteList.value);
  selectedSiteType.value = value
  
  // 如果传入空值或undefined，重置筛选
  if (!value) {
    selectedSiteType.value = null
  }

}
/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

/** 处理部门被点击 */
const handleNodeClick = async (row: any) => {
  emits('node-click', row)
}
const handleAdd = () => { 
  emits('add')
}
const emits = defineEmits(['node-click','add'])

const handleClick = (row: any) => { 
  // 切换选中状态：如果再次点击已选中的区域，则取消筛选
  if (selectedRegionId.value === row.id) {
    selectedRegionId.value = null
  } else {
    selectedRegionId.value = row.id
  }
}

/** 监听deptName */
const filteredAreaData = computed(() => {
  if (!areaName.value) return areadata.value
  console.log('filteredAreaData',areadata.value)
  return areadata.value.filter(item => 
    item.regionName.includes(areaName.value)
  )
})

const filteredSiteList = computed(() => {
  if (!siteList.value) return []
  
  let result = [...siteList.value]
  
  // 1. 按区域ID筛选
  if (selectedRegionId.value !== null) {
    result = result.filter(item => 
      item.regionId === selectedRegionId.value
    )
  }
  
  // 2. 按站点名称筛选
  if (siteName.value) {
    result = result.filter(item => 
      item.siteName.includes(siteName.value)
    )
  }
  
  // 3. 按站点类型筛选
  if (selectedSiteType.value) {
    result = result.filter(item => 
      item.siteType?.name === selectedSiteType.value
    )
  }
  
  return result
})

/** 初始化 */
onMounted(async () => {
  await getTree()
  await getRegion()
  await getSite()
})
</script>
