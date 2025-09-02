<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div class="flex w-100% mb-10" >
      <div class="flex justify-center flex-1">
        <div>行政区域：</div>
        <div>{{ infoData?.regionName }}</div>
      </div>
      <div class="flex justify-center flex-1">
        <div>计划时间：</div>
        <div>{{ formatToDateTime(infoData?.planStartTime) }}</div>
      </div>
      <div class="flex justify-center flex-1">
        <div>结束时间：</div>
        <div>{{ formatToDateTime(infoData?.planEndTime) }}</div>
      </div>
      <div class="flex justify-center flex-1">
        <div>排班名称：</div>
        <div>{{ infoData?.schedulingName }}</div>
      </div>
      <el-button class="ml-10" type="primary" @click="router.back()">返回</el-button>
    </div>
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig"/>

  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { SchedulingPlanApi } from '@/api/Floodctrl/schedulingplan'
import { RegionApi } from '@/api/Floodctrl/region'
import * as DeptApi from '@/api/system/dept'
import {SchedulingPlanDetailsApi} from '@/api/Floodctrl/schedulingplandetails'
import { formatToDateTime } from '@/utils/dateUtil'


const router = useRouter()
const { query } = useRoute() // 查询参数
const infoData = ref()

const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({
  schedulingPlanId: query.id
})
const RegionList = ref<any[]>([])

const tableConfig = reactive({
  api: SchedulingPlanDetailsApi.getSchedulingPlanDetailsPage,
  fields: {
    index: true,
    regionName: {
      label: '行政区域',
      // options: [] as any[],
    },
    planTime: {
      label: '日期',
      formatter: (row) => {
        // console.log(row,formatToDateTime(row ,'YYYY-MM-DD HH:mm:ss'));
        
        return formatToDateTime(row ,'YYYY-MM-DD HH:mm:ss')
      }
    },
    classLeader: {
      label: '带班人'
    },
    planUser: {
      label: '值班人员'
    },
    periodTime: {
      label: '值班时间段'
    },
    // value5: {
    //   label: '计划状态'
    // },
    // operation: {
    //   label: '操作',
    //   width: '160',
    //   fixed: 'right'
    // }
  }
})


onMounted(() => { 
  // DeptApi.getDeptPage({ pageNo: 1, pageSize: 100 }).then((res)=>{
  //   console.log(res);
  //   let areadata = res.map((item: any) => { 
  //   return { 
  //     label: item.name,
  //     value: item.id,
  //   }
  // })
  //   RegionList.value.splice(0, RegionList.value.length, ...areadata)
  //   tableConfig.fields.regionId.options = RegionList.value
  // })
  console.log(query.id);
  const queryId = query.id as unknown as number

  SchedulingPlanApi.getSchedulingPlan(queryId).then((res) =>{ 
   infoData.value = res
  })

  RegionApi.getRegionPage({
    pageNo: 1,
    pageSize: 1000,
  }).then((res) =>{
    console.log(res.list);
    let areadata = res.list.map((item: any) => { 
      return { 
        label: item.regionName,
        value: item.id,
      }
    })
    RegionList.value.splice(0, RegionList.value.length, ...areadata)
    // tableConfig.fields.regionId.options = RegionList.value
  })
  
})
</script>
