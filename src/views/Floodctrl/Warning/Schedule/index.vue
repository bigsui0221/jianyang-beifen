<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <!-- <button @click="handleInfo">+++</button> -->
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <el-button link type="primary" @click="handleDel(row)">删除</el-button>
      </template>
    </at-table>
    <at-table-dialog
      v-model="dialogConfig.visible"
      :config="dialogConfig"
      @submit="submitDialogForm"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { SchedulingPlanApi } from '@/api/Floodctrl/schedulingplan'
import { RegionApi } from '@/api/Floodctrl/region'
import * as DeptApi from '@/api/system/dept'
import { formatToDateTime } from '@/utils/dateUtil'

const message = useMessage() // 消息弹窗
const router = useRouter()

const atTableRef = ref()
const queryParams = reactive({})
const RegionList = ref<any[]>([])
const queryFields = reactive({
  regionId: {
    label: '行政区域',
    components: 'select',
    options: RegionList.value
  },
  schedulingName: {
    label: '排班名称',
    components: 'input'
  },
  // value5: {
  //   label: '计划状态',
  //   components: 'select',
  // }
})
const tableConfig = reactive({
  api: SchedulingPlanApi.getSchedulingPlanPage,
  fields: {
    index: true,
    // regionId: {
    //   label: '行政区域',
    //   options: [] as any[],
    // },
    regionName: {
      label: '行政区域',
    },
    schedulingName: {
      label: '排班名称'
    },
    planStartTime: {
      label: '计划开始时间',
      formatter: (row) => {
        // console.log(row,formatToDateTime(row ,'YYYY-MM-DD HH:mm:ss'));
        
        return formatToDateTime(row ,'YYYY-MM-DD HH:mm:ss')
      }
    },
    planEndTime: {
      label: '计划结束时间',
      formatter: (row) => {return formatToDateTime(row,'YYYY-MM-DD HH:mm:ss')}
    },
    // value5: {
    //   label: '计划状态'
    // },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '新增',
  readonly: false,
  width: '600px',
  formData: {},
  fields: {
    schedulingName: {
      label: '排班名称',
      components: 'input',
      required: true,
      row: 24
    },
    regionId: {
      label: '行政区域',
      components: 'select',
      required: true,
      options: [] as any[],
      // disabled: true,
      // formatter: (row) => {
      //   return RegionList.value.filter(item => item.id === row)[0].regionName
      // },
      row: 24
    },
    planStartTime: {
      label: '计划开始时间',
      components: 'date',
      required: true,
      row: 24
    },
    planEndTime: {
      label: '计划结束时间',
      components: 'date',
      required: true,
      row: 24
    },
    filePath: {
      label: '排班计划',
      components: 'uploadFile',
      row: 24,
      // required: true
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
}
const handleInfo = (row: any) => {
  router.push({ path: '/warning/schedule/info', query: { id: row.id } })
}
const handleEdit = (row: any) => {
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.formData = { ...row }
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    console.log('删除')
    SchedulingPlanApi.deleteSchedulingPlan(row.id).then(res =>{
      message.success('删除成功')
      atTableRef.value?.refresh()
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data,JSON.parse(data.filePath))


  if (data.id) {
    SchedulingPlanApi.updateSchedulingPlan({
      ...data,
      planEndTime: Date.parse(data.planEndTime),
      planStartTime: Date.parse(data.planStartTime),
    }).then(res =>{
      message.success('修改成功')
      dialogConfig.visible = false

      atTableRef.value?.refresh()
    })
  }else{
    SchedulingPlanApi.createSchedulingPlan({
      ...data,
      planEndTime: Date.parse(data.planEndTime),
      planStartTime: Date.parse(data.planStartTime),
      filePath: JSON.parse(data.filePath).map(item => { return item.url }).join(',')
    }).then(res =>{
      message.success('添加成功')
      dialogConfig.visible = false

      atTableRef.value?.refresh()
    })
  }
}
const handleTemplate = () => { 
  console.log(2222);
  let templateUrl = 'http://minio.zhsw.wiseaotu.com/jianyang/20250822/排班计划模版_1755830403485.xlsx'
  window.open(templateUrl, '_blank')
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  },
  template:{
    onClick: handleTemplate
  },
  // export: {
  //   api: SchedulingPlanApi.exportSchedulingPlan
  // }
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
    dialogConfig.fields.regionId.options = RegionList.value
  })
  
})
</script>
