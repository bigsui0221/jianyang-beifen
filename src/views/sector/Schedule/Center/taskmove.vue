<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table :config="tableConfig1" style="height:200px"/>
    <at-info :config="infoConfig"  />
    <div class="mt-12px mb-12px flex justify-center w-100%">
      <div class="mr-20px">
        <div>
          风险点：
        </div>
        <div>
          <el-select v-model="riskPoints" multiple placeholder="请选择" style="width: 240px" @change="handleChange">
            <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div>
        <div>
          应急等级：
        </div>
        <div>
          <el-select v-model="taskLevel" placeholder="请选择" style="width: 240px" @change="handleChange2">
            <el-option
              v-for="item in options3"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div>
      <el-button type="primary" @click="addtask">添加任务</el-button>
    </div>
    <div v-if="taskDescriptionlist.length == 0">
      <div class="mt-12px mb-12px" >任务1</div>
      <div >
        <div>
          任务描述：
        </div>
        <div>
          <el-input
            v-model="taskDescription"
            style="width: 480px"
            :rows="4"
            type="textarea"
            placeholder="请输入内容"
          />
        </div>
      </div>
      <div >
        <div>
          工单负责人：
        </div>
        <div>
          <el-select v-model="chargeUserId" placeholder="请选择" style="width: 240px">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-for="(item,index) in taskDescriptionlist" :key="index">
        <div class="mt-12px mb-12px flex justify-between w-100" >
          <div>任务{{ index + 1 }}</div>
          <el-button type="primary" @click="handleDelete(item.id)">删除</el-button>
        </div>
        <div >
          <div>
            任务描述：
          </div>
          <!-- askDescription -->
          <div>
            <el-input
              v-model="item.askDescription"
              style="width: 480px"
              :rows="4"
              type="textarea"
              placeholder="请输入内容"
            />
          </div>
        </div>
        <div >
          <div>
            工单负责人：
          </div>
          <div>
            <el-select v-model="item.chargeUserId" placeholder="请选择" style="width: 240px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <at-fixed-footer-btns>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </at-fixed-footer-btns>
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { formatToDateTime } from '@/utils/dateUtil'
import { EventNodeApi } from '@/api/Floodctrl/eventnode'
import { EventApi } from '@/api/Floodctrl/event'
import { DangerAreaApi } from '@/api/Floodctrl/dangerarea'
import { SimplePlanApi } from '@/api/Floodctrl/simpleplan'

const { wsCache } = useCache()
let user = wsCache.get(CACHE_KEY.USER)
const queryParams = reactive({})
const { query } = useRoute() // 查询参数
const message = useMessage() // 消息弹窗
const router = useRouter()

const originalTaskDescriptionList = ref<any[]>([])
const taskDescriptionlist = ref<any[]>([])
const options = ref<any[]>([])
const options2 = ref<any[]>([])
const options3 = ref(
  [
    {
      label: '特别重大',
      value: 'SPECIAL_MAJOR'
    },
    {
      label: '重大',
      value: 'MAJOR'
    },
    {
      label: '较大',
      value: 'LARGER'
    },
    {
      label: '一般',
      value: 'GENERAL'
    }
  ]
)
const riskPoints = ref<any[]>([])
const taskLevel = ref()
const chargeUserId = ref()
const taskDescription = ref()

const operationConfig = reactive({
})
const infoConfig = reactive({
  formData: {} as any,
  fields: {
    title: {
      label: '任务信息',
      components: 'title'
    },
    eventTitle: {
      label: '任务名称',
      row: 8
    },
    // value1: {
    //   label: '所属街道',
    //   row: 8
    // },
    mapAddress: {
      label: '地址',
      row: 8
    },
    address: {
      label: '详细地址',
    },
    // value1: {
    //   label: '所属街道',
    //   row: 8
    // },
    processingTimeLimits: {
      label: '耗时（小时）',
      row: 8,
      formatter: (row) => {
        const startTime =  infoConfig.formData.submissionTime ? new Date( infoConfig.formData.submissionTime).getTime() : null; // 上报时间
        if (!startTime) return '-'; // 如果没有上报时间，返回默认值
        
        let endTime;
        if (infoConfig.formData.eventStatus?.name === 'CLOSE_CASE') {
          // 如果事件状态是已结束，则使用事件结束时间
          endTime = infoConfig.formData.endTime ? new Date(infoConfig.formData.endTime).getTime() : null;
        } else {
          // 否则使用当前时间
          endTime = Date.now();
        }

        if (!endTime) return '-'; // 如果没有结束时间或当前时间无效，返回默认值

        // 计算时间差（毫秒转小时）
        const diffInHours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2);
        return `${diffInHours} 小时`;
      }
    },
    // value9: {
    //   label: '风险点',
    //   row: 8
    // },
    // value8: {
    //   label: '应急等级',
    //   row: 8
    // },
    // value03: {
    //   label: '任务描述'
    // },
    // title2: {
    //   label: '耗时',
    //   components: 'title'
    // },
    // value4: {
    //   label: '接收时间',
    //   row: 12
    // },
    // value5: {
    //   label: '工单负责人',
    //   row: 12
    // },
    processingTimeLimit: {
      label: '处理时限',
      row: 12
    },
    // value6: {
    //   label: '耗时',
    //   row: 12
    // },
    // title3: {
    //   label: '处理过程',
    //   components: 'title'
    // },
    // value06: {
    //   label: '完成时间',
    //   row: 12
    // },
    // value10: {
    //   label: '使用物资',
    //   row: 12
    // },
    // value07: {
    //   label: '处置人员',
    //   row: 12
    // },
    // value08: {
    //   label: '处置工艺',
    //   row: 12
    // },
    // value09: {
    //   label: '备注',
    //   row: 24
    // },
  }
})
const tableConfig1 = reactive({
  // api: UserApi.getUserPage,
  list: infoConfig.formData.alarmListRespVOS,
  fields: {
    startTime: {
      label: '预警时间',
      formatter: (row) => {
        return formatToDateTime(row,'YYYY-MM-DD HH:mm:ss')
      }
    },
    alarmName: {
      label: '预警名称'
    },
    alarmLevelName: {
      label: '预警等级'
    },
  }
})
const handleSave = () => {
  let params = [] as any
  taskDescriptionlist.value.forEach(item => { 
    params.push({
      eventNodeId: query.id,
      eventId: infoConfig.formData.id,
      riskPoints: riskPoints.value.join(','),
      taskLevel: taskLevel.value,
      taskDescription: item.taskDescription,
      chargeUserId: item.chargeUserId * 1,
    })
  })
  // const data = {
  //   eventNodeId: query.id,
  //   eventId: infoConfig.formData.id,
  //   riskPoints: riskPoints.value.join(','),
  //   taskLevel: taskLevel.value,
  //   taskDescription:taskDescription.value,
  //   chargeUserId: chargeUserId.value,
  // }
  
  EventApi.taskDistribution(params).then(res => {
    message.success('保存成功')
    router.back()
  })
}
const handleChange = (value) => {
  // 更新筛选结果
  // taskDescriptionlist.value = [...filteredTaskDescriptionList.value]
  console.log(riskPoints.value,taskLevel.value);
  
  SimplePlanApi.detail({
    dgaeIdList: riskPoints.value,
    level: taskLevel.value}).then(res => { 
      res.data.forEach(item => {
        item.taskDescription = item.goodsNames
        item.chargeUserId = null
      })
      taskDescriptionlist.value = [...res.data]
    })
}
const handleChange2 = (value) => {
  // 更新筛选结果
  // taskDescriptionlist.value = [...filteredTaskDescriptionList.value]
  SimplePlanApi.detail({
    dgaeIdList: riskPoints.value,
    level: taskLevel.value}).then(res => { 
      res.data.forEach(item => {
        item.taskDescription = item.goodsNames
        item.chargeUserId = null
      })
      taskDescriptionlist.value = [...res.data]
    })
}
// 筛选后的数据
const filteredTaskDescriptionList = computed(() => {
  if (!originalTaskDescriptionList.value.length) return []
  
  return originalTaskDescriptionList.value.filter(item => {
    // 风险点筛选（多选）
    let riskMatch = true
    if (riskPoints.value && riskPoints.value.length > 0) {
      // 根据你的数据结构调整这里的判断逻辑
      riskMatch = riskPoints.value.some(rp => 
        item.riskPoints?.includes(rp) || item.riskPointId === rp
      )
    }
    
    // 应急等级筛选
    let levelMatch = true
    if (taskLevel.value) {
      levelMatch = item.taskLevel === taskLevel.value
    }
    
    return riskMatch && levelMatch
  })
})
// 删除任务
const handleDelete = (item) => {
  message.delConfirm().then(() => {
    console.log('删除')
    taskDescriptionlist.value = taskDescriptionlist.value.filter(task => task.id !== item.id)
  })
}
const addtask = () => {
  // 添加任务
  console.log('添加任务')
  if(taskDescriptionlist.value.length > 0){
    taskDescriptionlist.value.push({
      taskDescription: '',
      chargeUserId: null,
      id: taskDescriptionlist.value.length + 1094
    })
  }
  
}

onMounted(() => {
  const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号

  EventNodeApi.getEventNode(queryId).then(res =>{
    EventApi.getEvent(res.eventId).then(res => {
      // infoConfig.formData = res
      Object.assign(infoConfig.formData,res)
      UserApi.getUserPage({pageNo: 1,pageSize: 1000,deptId: infoConfig.formData.deptId}).then(res => {
        console.log(res)
        options.value = res.list.map(item => {
          return {
            label: item.username,
            value: item.id
          }
        })
      })
    })
  })
  DangerAreaApi.getDangerAreaPage({pageNo: 1, pageSize: 100}).then(res =>{
    options2.value = res.list.map(item => {
      return {
        label: item.name,
        value: item.id
      }
    })
  })
  // SimplePlanApi.getSimplePlanPage({pageNo: 1, pageSize: 100}).then(res =>{
  //   // 风险点是否是数组无法确定，此接口暂时不满足页面需求
  //   // 工单负责人字段需要添加在原始数组里.默认是空字符串
  //   // 保存原始数据
  //   originalTaskDescriptionList.value = res.list
  //   // 初始化显示列表
  //   taskDescriptionlist.value = [...res.list]
  //   // taskDescriptionlist.value.splice(0, taskDescriptionlist.value.length, ...res.list)
  //   // taskDescriptionlist.value = res.data.list
  // })
})
</script>
