<template>
  <ContentWrap
    class="!mb-12px"
    title="值班情况"
    :border="false"
    padding="20px"
    :body-style="{ padding: '0' }"
  >
    <at-info :config="infoConfig" v-if="query.id" />
    <at-form ref="atFormRef" :config="formConfig" v-else
  /></ContentWrap>
  <ContentWrap
    class="!mb-12px"
    title="防汛特征值"
    :border="false"
    padding="20px"
    :body-style="{ padding: '0' }"
  >
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
      </template>
    </at-table>
  </ContentWrap>
  <at-fixed-footer-btns>
    <el-button type="primary" @click="router.back()">返回</el-button>
    <el-button type="primary" @click="handleSave" v-if="!query.id">保存</el-button>
  </at-fixed-footer-btns>
  
  <at-table-dialog v-model="dialogConfig.visible" :config="dialogConfig" @submit="submitDialogForm" />
</template>

<script lang="ts" setup>
defineOptions({ name: 'Index' })
import * as UserApi from '@/api/system/user'
import { RegionApi } from '@/api/Floodctrl/region'
import {DutyLogApi} from '@/api/Floodctrl/dutylog'
const message = useMessage() // 消息弹窗
const router = useRouter()

const { query } = useRoute() // 查询参数

const atFormRef = ref()
var regionList = reactive<any[]>([])
const formConfig = reactive({
  formData: {} as any,
  fields: {
    fillTime: {
      label: ' 填报时间',
      components: 'date',
      required: true,
      row: 12
    },
    regionId: {
      label: '所属行政区域',
      components: 'select',
      options: regionList,
      required: true,
      row: 12
    },
    classLeader: {
      label: '带班人',
      components: 'input',
      required: true,
      row: 12
    },
    planUser: {
      label: '值班人',
      components: 'input',
      required: true,
      row: 12
    },
    floodPreventionResNumber: {
      label: '防汛响应',
      components: 'input',
      required: true,
      row: 12
    },
    disasterWarningNumber: {
      label: '山洪灾害预警',
      components: 'input',
      required: true,
      row: 12
    },
    disasterPersionTransfer: {
      label: '山洪灾害人员转移情况',
      components: 'radioButton',
      required: true,
      row: 12,
      options: [
        {
          value: false,
          label: '无'
        },
        {
          value: true,
          label: '有'
        }
      ]
    },
    waterlogging: {
      label: '内涝情况',
      components: 'radioButton',
      required: true,
      row: 12,
      options: [
        {
          value: false,
          label: '无'
        },
        {
          value: true,
          label: '有'
        }
      ]
    },
    household: {
      label: '山洪灾害转移人口',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '户',
      row: 6
    },
    people: {
      components: 'input',
      
      required: true,
      append: '人',
      row: 6
    },
    returnVehicles: {
      label: '劝返车辆',
      components: 'input',
      required: true,
      append: '辆',
      placeholder: '请输入',
      row: 6
    },
    returnTourists: {
      label: '劝返游客',
      components: 'input',
      required: true,
      append: '人',
      placeholder: '请输入',
      row: 6
    },
    unWaterNumber: {
      label: '未消退积水点位',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '个',
      row: 6
    },
    reWaterNumber: {
      label: '已消退积水点位',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '个',
      row: 6
    },
    importantEvents: {
      label: '重要事件',
      components: 'input',
      type: 'textarea',
      required: true,
      placeholder: '记现场设备情况：\r\n排渍情况：\r\n员工安全情况：',
      rows: 5
    }
  }
})
const infoConfig = reactive({
  formData: {} as any,
  fields: {
    fillTime: {
      label: ' 填报时间',
      components: 'date',
      required: true,
      row: 12
    },
    regionName: {
      label: '所属行政区域',
      components: 'select',
      // options: regionList,
      required: true,
      row: 12
    },
    classLeader: {
      label: '带班人',
      components: 'input',
      required: true,
      row: 12
    },
    planUser: {
      label: '值班人',
      components: 'input',
      required: true,
      row: 12
    },
    floodPreventionResNumber: {
      label: '防汛响应',
      components: 'input',
      required: true,
      
      row: 12
    },
    disasterWarningNumber: {
      label: '山洪灾害预警',
      components: 'input',
      required: true,
      
      row: 12
    },
    disasterPersionTransfer: {
      label: '山洪灾害人员转移情况',
      components: 'radioButton',
      required: true,
      row: 12,
      formatter: (row) =>{
        return row?'是':'否'
      },
      options: [
        {
          value: false,
          label: '无'
        },
        {
          value: true,
          label: '有'
        }
      ]
    },
    waterlogging: {
      label: '内涝情况',
      components: 'radioButton',
      required: true,
      row: 12,
      options: [
        {
          value: false,
          label: '无'
        },
        {
          value: true,
          label: '有'
        }
      ],
      formatter: (row) =>{
        return row?'是':'否'
      },
    },
    household: {
      label: '山洪灾害转移人口',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '户',
      row: 6
    },
    people: {
      components: 'input',
      label: '山洪灾害转移人口',
      required: true,
      append: '人',
      row: 6
    },
    returnVehicles: {
      label: '劝返车辆',
      components: 'input',
      required: true,
      append: '辆',
      placeholder: '请输入',
      row: 6
    },
    returnTourists: {
      label: '劝返游客',
      components: 'input',
      required: true,
      append: '人',
      placeholder: '请输入',
      row: 6
    },
    unWaterNumber: {
      label: '未消退积水点位',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '个',
      row: 6
    },
    reWaterNumber: {
      label: '已消退积水点位',
      components: 'input',
      required: true,
      placeholder: '请输入',
      append: '个',
      row: 6
    },
    importantEvents: {
      label: '重要事件',
      components: 'input',
      type: 'textarea',
      required: true,
      placeholder: '记现场设备情况：\r\n排渍情况：\r\n员工安全情况：',
      rows: 5
    }
  }
})
const queryParams = reactive({})
const tableConfig = reactive({
  api: UserApi.getUserPage,
  height: '300px',
  fields: {
    value1: {
      label: '记录时间'
    },
    value2: {
      label: '河道名称'
    },
    value3: {
      label: '实时数据'
    },
    value4: {
      label: '超警戒水位'
    },
    value5: {
      label: '超保证水位'
    },
    operation: {
      label: '操作',
      width: '80',
      fixed: 'right'
    }
  }
})
const dialogConfig = reactive({
  visible: false,
  title: '编辑',
  formData: {},
  width: '500px',
  fields: {
    value1: {
      label: '记录时间',
      components: 'input',
      row: 24,
      disabled: true
    },
    value2: {
      label: '河道名称',
      components: 'input',
      row: 24,
      disabled: true
    },
    value3: {
      label: '实时数据',
      components: 'input',
      row: 24,
      required: true
    },
    value4: {
      label: '超警戒水位',
      components: 'input',
      row: 24,
      disabled: true
    },
    value5: {
      label: '超保证水位',
      components: 'input',
      row: 24,
      disabled: true
    }
  }
})
const submitDialogForm = (data) => {
  console.log(data)
}
const handleEdit = (row) => {
  console.log(row)
  dialogConfig.visible = true
  dialogConfig.formData = { ...row }
}
const handleSave = () => {
  atFormRef.value.validate().then(() => {
    console.log('保存',formConfig.formData)
    if(formConfig.formData.id){
      DutyLogApi.updateDutyLog(formConfig.formData).then((res) => { 
        console.log(res)
        message.success('保存成功')
        router.back()
      })
    }else{
      DutyLogApi.createDutyLog(formConfig.formData).then((res) => { 
        message.success('保存成功')
        router.back()
      })
    }
   
  })
}
onBeforeMount(() => { 
  RegionApi.getRegionPage({}).then((res) => {
    regionList = res.list.map(item => ({
      label: item.regionName,
      value: item.id
    }))
    formConfig.fields.regionId.options = regionList
    // regionList.splice(0, regionList.length, ...res.list)
    console.log(regionList);
  })
  const queryId = query.id as unknown as number
  if(queryId){
    DutyLogApi.getDutyLog(queryId).then((res) => { 
      // Object.assign(formConfig.formData, res)
      Object.assign(infoConfig.formData, res)

    })
  }
  
})
</script>
