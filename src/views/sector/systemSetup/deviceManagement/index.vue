<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table-operation v-model:params="queryParams" :config="operationConfig" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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
import { DeviceApi } from '@/api/Floodctrl/device'
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const pointList = ref<{ label: string; value: string; unit?: string }[]>([])

const queryFields = reactive({
  deviceId: {
    label: '设备ID',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: DeviceApi.getDevicePage,
  fields: {
    index: true,
    deviceType: {
      label: '设备类型',
      formatter: (row) => {
        return row.desc
      }
    },
    deviceId: {
      label: '设备ID'
    },
    pointName: {
      label: '数据指标'
    },
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
  formData: {} as any,
  fields: {
    deviceType: {
      label: '设备类型',
      components: 'select',
      required: true,
      row: 24,
      /**
       * 1：简易雨量站，2：预警广播，3：雨量站，4：水位站，5：水位雨量站，6：防汛视频，7：下穿隧道积水监测点位，8：声光报警,
       * 可用值:SIMPLE_RAINFALL_STATION,WARNING_BROADCAST,RAINFALL_STATION,GAUGING_STATION,WATER_RAINFALL_STATION,FLOOD_VIDEO,
       * TUNNEL_WATER_ACCUMULATION_MONITORING_STATION,AUDIBLE_VISUAL_ALARM
       */
      options: [
        {
          label: '简易雨量站',
          value: 'SIMPLE_RAINFALL_STATION'
        },
        {
          label: '预警广播',
          value: 'WARNING_BROADCAST'
        },
        {
          label: '雨量站',
          value: 'RAINFALL_STATION'
        },
        {
          label: '水位站',
          value: 'GAUGING_STATION'
        },
        {
          label: '水位雨量站',
          value: 'WATER_RAINFALL_STATION'
        },
        {
          label: '防汛视频',
          value: 'FLOOD_VIDEO'
        },
        {
          label: '下穿隧道积水监测点位',
          value: 'TUNNEL_WATER_ACCUMULATION_MONITORING_STATION'
        },
        {
          label: '声光报警',
          value: 'AUDIBLE_VISUAL_ALARM'
        }
      ]
    },
    deviceId: {
      label: '设备ID',
      components: 'input',
      required: true,
      row: 24
    },
    pointCode: {
      label: '数据指标',
      components: 'checkbox',
      options: pointList.value,
      required: false,
      row: 24,
      
    }
  }
})
const getDictOptions = async (row: any) => {
  console.log();
  
  await DeviceApi.getDevicePointInfoByDeviceId(row.deviceId).then((res)=>{
    console.log(res);
    
    pointList.value = res.map(item => ({
      label: item.pointName,
      value: item.pointCode,
      unit: item.pointUnit
    }))
    // console.log(pointList.value);
    dialogConfig.fields.pointCode.options = pointList.value
    
  })
  
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = () => {
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
  dialogConfig.fields.pointCode.options = []
}
//深拷贝
function deepClone(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  let newObj: any = Array.isArray(obj) ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key])
    }
  }
  return newObj
}
const handleEdit = async (row: any) => {
  await getDictOptions(row)
  
  let rowData = deepClone(row);

  rowData.deviceType = rowData.deviceType.name;

  // const arr: { label: any,value: any }[] = []
  // let codearr = rowData.pointCode !== '' && rowData.pointCode !== null ? rowData.pointCode.split(','): []
  // let namearr = rowData.pointName !== '' && rowData.pointName !== null ? rowData.pointName.split(','): []
  
  // if(codearr.length > 0){
  //   codearr.forEach((item,index) => {
  //     arr.push({
  //       value: item,
  //       label: namearr[index]
  //     })
  //   })
  // }
  
  
  rowData.pointCode = rowData.pointCode !== '' && rowData.pointCode !== null ? rowData.pointCode.split(','): []
  dialogConfig.formData = { ...rowData }
  // console.log(dialogConfig.formData);
  
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    DeviceApi.deleteDevice(row.id)
    atTableRef.value?.refresh()
  })
}
const submitDialogForm = (data) => {
  // console.log(data,dialogConfig)
  if(dialogConfig.title === '新增'){
    DeviceApi.createDevice(data).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }else{
    // console.log({
    //   ...data,
    //   pointCode: data.pointCode.join(','),
    //   pointName: data.pointCode == '' || data.pointCode == null ? '' : pointList.value.map(item => item.label).join(',') ,
    //   pointUnit: data.pointCode == '' || data.pointCode == null ? '' : pointList.value.map(item => item.unit).join(',')
    // });

    DeviceApi.updateDevice({
      ...data,
      pointCode: data.pointCode.join(','), 
      pointName: data.pointCode == '' || data.pointCode == null ? '' : pointList.value.map(item => item.label).join(',') ,
      pointUnit: data.pointCode == '' || data.pointCode == null ? '' : pointList.value.map(item => item.unit).join(',')
    }).then(() => {
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd
  }
})
</script>
