<template>
  <ContentWrap
    id="page-search"
    class="!mb-12px"
    title="值班中心"
    :border="false"
    padding="20px"
    :body-style="{ padding: '0' }"
  >
    <template #header>
      <el-button plain type="primary" @click="handleScheduleAdd"> 录入值班日志 </el-button>
      <el-button plain type="primary" @click="handleWarningAdd"> 预警发布 </el-button>
      <el-button plain type="primary" @click="handleResponseAdd"> 响应发布 </el-button>
    </template>
    <div class="dutyPanel w-1/1 grid grid-cols-[190px_1fr_1fr] gap-12px">
      <ContentWrap
        class="mb-0"
        padding="16px 20px"
        bgColor="#FAFAFA"
        borderColor="#ECECEC"
        :body-style="{ padding: '0' }"
      >
        <div class="mb-8px text-#666">天气状况：</div>
        <div class="text-#333 font-size-14px"> 
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" :class="'qi-' + weather?.icon + '-fill'" viewBox="0 0 16 16">
            <path d="M11.727 14.217A4.99 4.99 0 0 1 7.9 16a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 6a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z"/>
            <path d="M4.008 6.637a1.545 1.545 0 0 1 1.54-1.467.913.913 0 0 1 .108.012l.084.012a1 1 0 0 0 .961-.445 2.74 2.74 0 0 1 4.598 0 1 1 0 0 0 .961.445l.084-.012a.916.916 0 0 1 .108-.012 1.524 1.524 0 0 1 1.455 2.048c.312.135.602.316.86.538A2.484 2.484 0 0 0 12.136 4.2a3.74 3.74 0 0 0-6.27 0 2.506 2.506 0 0 0-.317-.032A2.548 2.548 0 0 0 3 6.717c.005.174.028.347.069.517.238-.3.569-.51.94-.597h-.001Z"/>
          </svg>&nbsp;&nbsp;&nbsp;&nbsp;
          {{ weather ? weather?.text + ' ' + weather?.temp + '℃':'无' }} </div>
      </ContentWrap>
      <ContentWrap
        class="mb-0"
        padding="16px 20px"
        bgColor="#FAFAFA"
        borderColor="#ECECEC"
        :body-style="{ padding: '0' }"
      >
        <div class="grid grid-cols-[auto_auto_100px] gap-48px text-#666">
          <div>
            <div class="mb-8px"> 今日值班: </div>
            <div class="flex flex-wrap gap-12px font-size-14px">
              <div v-if="!dayPlan">无</div>
              <div
                :class="[
                  'p-10px pt-0 pb-0',
                  'border-0.6px border-solid border-color-#D6D6D6 rounded-4px',
                  'line-height-26px text-center text-#333 whitespace-nowrap'
                ]"
                v-for="p in getNamesFromString(dayPlan?.planUser)"
                :key="p"
              >
                {{ p }}
              </div>
            </div>
          </div>
          <div>
            <div class="mb-8px"> 带班人:</div>
            <div class="flex flex-wrap gap-12px font-size-14px">
              <div v-if="!dayPlan">无</div>
              <div
                :class="[
                  'p-10px pt-0 pb-0',
                  'border-0.6px border-solid border-color-[var(--el-color-primary)] rounded-4px',
                  'line-height-26px text-center text-[var(--el-color-primary)] whitespace-nowrap'
                ]"
                v-for="p in getNamesFromString(dayPlan?.classLeader)"
                :key="p"
              >
                {{ p.replace('例如：', '') }}
              </div>
            </div>
          </div>
          <div>
            <div class="mb-8px"> 值班时间:</div>
            <div class="text-#333 fw-600 font-size-14px"> {{ dayPlan ? dayPlan?.periodTime : '无' }} </div>
          </div>
        </div>
      </ContentWrap>
      <ContentWrap
        class="mb-0"
        padding="16px 20px"
        bgColor="#FAFAFA"
        borderColor="#ECECEC"
        :body-style="{ padding: '0' }"
      >
        <div class="grid grid-cols-[auto_auto_100px] gap-48px text-#666">
          <div>
            <div class="mb-8px"> 下一班值班: </div>
            <div class="flex flex-wrap gap-12px font-size-14px">

              <div v-if="!tomorrowPlan">无</div>
              <div
                :class="[
                  'p-10px pt-0 pb-0',
                  'border-0.6px border-solid border-color-#D6D6D6 rounded-4px',
                  'line-height-26px text-center text-#333 whitespace-nowrap'
                ]"
                v-for="p in getNamesFromString(tomorrowPlan?.planUser)"
                :key="p"
              >
                {{ p }}
              </div>
            </div>
          </div>
          <div>
            <div class="mb-8px"> 下一班带班人:</div>
            <div class="flex flex-wrap gap-12px font-size-14px">
              <div v-if="!tomorrowPlan">无</div>
              
              <div
                :class="[
                  'p-10px pt-0 pb-0',
                  'border-0.6px border-solid border-color-[var(--el-color-primary)] rounded-4px',
                  'line-height-26px text-center text-[var(--el-color-primary)] whitespace-nowrap'
                ]"
                v-for="p in getNamesFromString(tomorrowPlan?.classLeader)"
                :key="p"
              >
                {{ p.replace('例如：', '') }}
              </div>
            </div>
          </div>
          <div>
            <div class="mb-8px"> 值班时间:</div>
            <div class="text-#333 fw-600 font-size-14px"> {{ tomorrowPlan ? tomorrowPlan?.periodTime : '无' }} </div>
          </div>
        </div>
      </ContentWrap>
    </div>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap class="!mb-0" :border="false" padding="20px" :body-style="{ padding: '0' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <TableReport :isDefault="false" :waterAuthority="waterAuthority" v-if="activeTab === '0'" />
    <TableFile :isDefault="false" :waterAuthority="waterAuthority" v-if="activeTab === '1'" />
    <TableTask :isDefault="false" :waterAuthority="waterAuthority"  v-if="activeTab === '2'" />
  </ContentWrap>

  <div class="mt-12px w-1/1 grid grid-cols-[6fr_5fr] gap-12px">
    <ContentWrap
      class="!mb-0"
      :border="false"
      padding="20px"
      :body-style="{ padding: '0' }"
      title="电话簿"
    >
      <el-row :gutter="16">
        <el-col :span="6" :xs="24">
          <DeptTree @node-click="handleDeptNodeClick" />
        </el-col>
        <el-col :span="18" :xs="24">
          <at-table ref="atTableRef" v-model:params="queryUserParams" :config="tableUserConfig" />
        </el-col>
      </el-row>
    </ContentWrap>
    <ContentWrap
      class="!mb-0"
      :border="false"
      padding="20px"
      :body-style="{ padding: '0' }"
      title="排班查询"
    >
      <template #header>
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item class="!mr-0" label="" prop="userId">
            <el-select
              v-model="userId"
              clearable
              filterable
              placeholder="请选择"
              class="!w-240px"
              @change="handleSearch"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.regionName"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <div class="schedule-list overflow-x-hidden overflow-y-auto h-[547px]">
        <div
          class="schedule-item pt-24px pb-24px flex b-b-1 border-0 border-solid border-[var(--el-border-color)]"
          v-for="item in Schedule"
          :key="item.id"
        >
          <div class="schedule-item__title w-[120px] font-500">{{item.regionName}}</div>
          <div class="schedule-item__content flex-[2]">
            <div class="font-500">带班人</div>
            <div class="mt-8px" style="font-size: 14px;"><span>{{ item.classLeader }}</span></div>
            <div class="font-500">值班人员</div>
            <div class="flex flex-wrap">
              <div class="mt-8px mr-16px" style="font-size: 14px;"
                ><span>{{ item.planUser }}</span></div
              >
            </div>
            <!-- <div class="mt-8px"><span>王老五</span><span class="ml-9px">15938294346</span></div> flex-[2]"-->
            <!-- <div class="mt-8px"><span>王老五</span><span class="ml-9px">15938294346</span></div> -->
          </div>
          <!-- <div class="schedule-item__content flex-1 h" >
            <div class="font-500">值班人员</div>
            <div class="flex flex-wrap">
              <div class="mt-8px mr-16px" style="font-size: 14px;"
                ><span>{{ item.planUser }}</span></div
              >
              <div class="mt-8px mr-16px"
                ><span>王老五</span><span class="ml-9px">15938294346</span></div
              >
              <div class="mt-8px mr-16px"
                ><span>王老五</span><span class="ml-9px">15938294346</span></div
              >
              <div class="mt-8px mr-16px"
                ><span>王老五</span><span class="ml-9px">15938294346</span></div
              >
              <div class="mt-8px mr-16px"
                ><span>王老五</span><span class="ml-9px">15938294346</span></div
              >
            </div>
          </div> -->
          <div class="schedule-item__content flex-1 h">
            <div class="font-500">值班日期</div>
            <div class="mt-8px mr-16px"><span style="font-size: 14px;">{{ formatToDateTime(item.planTime) }}</span></div>
          </div>
          <div class="schedule-item__content flex-1 h">
            <div class="font-500">值班时间</div>
            <div class="mt-8px"><span style="font-size: 14px;">{{ item.periodTime }}</span></div>
          </div>
        </div>
      </div>
    </ContentWrap>
  </div>
</template>
<script lang="ts" setup>
import { TableReport, TableFile, TableTask, DeptTree } from '../components'
import * as UserApi from '@/api/system/user'
import { RegionApi } from '@/api/Floodctrl/region'
import { SchedulingPlanDetailsApi } from '@/api/Floodctrl/scheduling/schedulingplandetails'
import * as  DeptApi  from '@/api/system/dept'
import { formatToDateTime } from '@/utils/dateUtil'
import { GISApi } from '@/api/Floodctrl/gis'


import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache()
let user = wsCache.get(CACHE_KEY.USER)

const waterAuthority = ref()
const weather = ref()

const dayPlan = ref()
const tomorrowPlan = ref()
const router = useRouter() // 路由
const tabs = computed(() =>[
  {
    label: waterAuthority.value ? '信息签收' : '信息上报',
    value: '0'
  },
  {
    label: '文件交换',
    value: '1',
    // number: 999
  },
  {
    label: waterAuthority.value ? '协同工单' : '任务工单',
    value: '2'
  }
])
var userList = reactive<any[]>([])
var originalUserList = reactive<any[]>([])
var Schedule = reactive<any[]>([])
const activeTab = ref('0')
const queryUserParams = reactive({
  deptId: ''
})
const tableUserConfig = reactive({
  api: UserApi.getUserPage,
  height: '500px',
  fields: {
    index: true,
    nickname: {
      label: '姓名'
    },
    deptName: {
      label: '部门'
    },
    mobile: {
      label: '电话'
    }
  }
})
const atTableRef = ref()

const handleDeptNodeClick = (node: any) => {
  console.log('handleDeptNodeClick', node);
  queryUserParams.deptId	= node.id
  atTableRef.value?.refresh()
}
var userId = ref()
const queryParams = reactive({
  
})
const getNamesFromString = (str) => {
  // 处理空值或非字符串情况
  if (!str || typeof str !== 'string') return []
  // 处理空字符串
  if (str.trim() === '') return []
  return str
    .split(',')
    .map(item => {
      // 处理可能的空项
      if (!item || item.trim() === '') return ''
      
      // 分割并获取姓名部分
      const parts = item.split(':')
      return parts[0] ? parts[0].trim() : ''
    })
    // 过滤掉空字符串
    .filter(name => name.length > 0)
}
const handleSearch = (value) => { 
  console.log(value)
  if (!value) {
    // 如果没有筛选值，恢复所有数据
    Schedule.splice(0, Schedule.length, ...originalUserList)
    return
  }
  
  // 根据筛选条件过滤数据
  const deptvalue = userList.filter(item => item.id === value)
  console.log(deptvalue);
  
  const filtered = originalUserList.filter(item => item.regionName === deptvalue[0].regionName)
  console.log(filtered);
  
  Schedule.splice(0, Schedule.length, ...filtered)
  console.log(Schedule);
  
  //筛选e这个类型的数据
}
const handleScheduleAdd = () => {
  router.push({
    path: '/Schedule/Center/add',
  })
}
const handleWarningAdd = () => {
  router.push('/publish/warningAdd')
}
const handleResponseAdd = () => {
  router.push('/publish/responseAdd')
}
/** 初始化 **/
onMounted(async () => {
  RegionApi.getRegionPage({ pageNo: 1, pageSize: 100 }).then((res)=>{
    console.log(res);
    userList.splice(0, userList.length, ...res.list)
  })
  SchedulingPlanDetailsApi.getSchedulingPlanDetailsPage({ pageNo: 1, pageSize: 10 }).then((res)=>{ 
    console.log(res);
    originalUserList.splice(0, originalUserList.length, ...res.list)
    Schedule.splice(0, Schedule.length, ...res.list)
  })
  DeptApi.getDept(user.user.deptId).then((res)=>{
    console.log(res);
    waterAuthority.value = res.waterAuthority
  })
  SchedulingPlanDetailsApi.dayPlan().then(res=>{
    console.log(res);
    dayPlan.value = res
    console.log(dayPlan.value);
    
  })
  SchedulingPlanDetailsApi.tomorrowPlan().then(res=>{
    console.log(res);
    tomorrowPlan.value = res

  })

  //天气
  GISApi.publicWeather().then(res=>{
    console.log(res);
    weather.value = res
  })
})
</script>
<style lang="scss" scoped>

</style>
