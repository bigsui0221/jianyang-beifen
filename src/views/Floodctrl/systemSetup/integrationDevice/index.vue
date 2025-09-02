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
import { DeviceAggApi } from '@/api/Floodctrl/deviceagg'
import { DeviceApi } from '@/api/Floodctrl/device'

interface DeviceOption {
  label: string
  value: string
}


const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const List = ref<DeviceOption[]>([])
const queryFields = reactive({
  aggName: {
    label: '设备名称',
    components: 'input'
  }
})
const tableConfig = reactive({
  api: DeviceAggApi.getDeviceAggPage,
  fields: {
    index: true,
    aggName: {
      label: '名称'
    },
    deviceId: {
      label: '关联设备',
      formatter: (row) => { 
        console.log(toString.call(row));
        
        return row
      }
    },
    aggDeviceDataType: {
      label: '数据',
      formatter: (row) => { 
        return row.desc
      }
    },
    aggDeviceComputeMode: {
      label: '计算方式',
      formatter: (row) => { 
        return row.desc
      }
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
  formData: {},
  fields: {
    aggName: {
      label: '名称',
      components: 'input',
      required: true,
      row: 12
    },
    deviceId: {
      label: '关联设备',
      components: 'checkbox',
      required: true,
      // append:'㎡',
      row: 24,
      options: List.value
    },
    /*
     * 1：水位，2：断面流量，3：面雨量，4：笼罩面积，5：距平值，6：蒸发量，7：雨洪频率,
     可用值:WATER_LEVEL,CROSS_SECTIONAL_FLOW,AREA_RAINFALL,COVERAGE_AREA,ANOMALY,
     EVAPORATION_CAPACITY,RAINWATER_FREQUENCY,示例值(WATER_LEVEL)
     */
    aggDeviceDataType: {
      label: '数据',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '水位',
          value: 'WATER_LEVEL'
        },
        {
          label: '断面流量',
          value: 'CROSS_SECTIONAL_FLOW'
        },
        {
          label: '面雨量',
          value: 'AREA_RAINFALL'
        },
        {
          label: '笼罩面积',
          value: 'COVERAGE_AREA'
        },
        {
          label: '距平值',
          value: 'ANOMALY'
        },
        {
          label: '蒸发量',
          value: 'EVAPORATION_CAPACITY'
        },
        {
          label: '雨洪频率',
          value: 'RAINWATER_FREQUENCY'
        }
      ]
    },
    /*
    1:和，2：平均，3：泰森多边形,可用值:AND,AVG,TYSON,示例值(AND)
    */ 
    aggDeviceComputeMode: {
      label: '计算方式',
      components: 'select',
      required: true,
      row: 12,
      options: [
        {
          label: '和',
          value: 'AND'
        },
        {
          label: '平均',
          value: 'AVG'
        },
        {
          label: '泰森多边形',
          value: 'TYSON'
        }
      ]
    },
  }
})
const getDictOptions = async () => {
  
  await DeviceApi.getDevicePage({pageNo: 1, pageSize: 10}).then((res)=>{
    // console.log(res);
    List.value = res.list.map(item => ({
      label: item.deviceName,
      value: item.deviceId
    }))
    console.log(List.value);
    dialogConfig.fields.deviceId.options = List.value
    
  })
  
}
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleAdd = async () => {
  await getDictOptions()
  dialogConfig.visible = true
  dialogConfig.title = '新增'
  dialogConfig.formData = {}
  dialogConfig.readonly = false
}
const handleEdit = async(row: any) => {
  await getDictOptions()
  dialogConfig.visible = true
  dialogConfig.title = '编辑'
  // 清理选中数据的方法
  // 过滤掉不在选项列表中的值
  
  let idlist = row.deviceId !== '' && row.deviceId !== null ? row.deviceId.split(','): []
  console.log(idlist);
  
  idlist = idlist.filter(value => 
    List.value.some(option => option.value === value)
  );
  console.log(idlist);
  
  dialogConfig.formData = { ...row,
    deviceId: idlist,
    aggDeviceDataType: row.aggDeviceDataType.name,
    aggDeviceComputeMode: row.aggDeviceComputeMode.name
  }
  // console.log(dialogConfig.formData);
  dialogConfig.readonly = false
}
const handleDel = (row: any) => {
  message.delConfirm().then(() => {
    DeviceAggApi.deleteDeviceAgg(row.id).then(() => { 
      atTableRef.value?.refresh()
    })
  })
}
const submitDialogForm = (data) => {
  console.log(data)
  if (dialogConfig.title === '新增') { 
    DeviceAggApi.createDeviceAgg({
      ...data,
      deviceId: data.deviceId.join(',')
    }).then(() => { 
      message.success('操作成功')
      atTableRef.value?.refresh()
      dialogConfig.visible = false
    })
  }else{ 
    DeviceAggApi.updateDeviceAgg({
      ...data,
      deviceId: data.deviceId.join(','),
      aggDeviceComputeMode: data.aggDeviceComputeMode.name ? data.aggDeviceComputeMode.name : data.aggDeviceComputeMode,
      aggDeviceDataType: data.aggDeviceDataType.name ? data.aggDeviceDataType.name : data.aggDeviceDataType
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
