<template>
  <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" v-if="props.isInfo"/>

  <at-table-operation title="申请信息"  v-if="!props.isInfo"/>
  <div class="mt-10 mb-10 flex" v-if="!props.isInfo">
    <span class="mr-10">申请批次：{{ year+month+day+hours+minutes }}</span>
    <span class="mr-10">申请时间：{{ formattedTime }}</span>
    <span class="mr-10">申请人：简阳</span>
    <span>仓库：街道</span>
  </div>
  <at-table-operation title="出库单"  v-if="!props.isInfo"/>
  <div class="mt-10 mb-10 flex" v-if="!props.isInfo">
    <span class="w-70">出库类别：</span>
    <el-select v-model="outType" style="width: 50%;">
      <el-option  key="" label="报废" value="SCRAP" />
      <el-option  key="" label="救援" value="RESCUE" />
    </el-select>
    <span class="w-70">出库原因：</span>
    <el-input v-model="outReason" class="w-20"/>
  </div>
  <at-table-operation title="入库记录" :config="operationConfig" v-if="!props.isInfo"/>
  
  <at-table ref="atTableRef" :config="tableConfig">
    <template #materialsTypeId="{ row }">
      <!-- <el-input v-model="row.materialsTypeId" placeholder="请输入" v-if="row.isSave === false" /> -->
      <el-select v-model="row.materialsTypeId" v-if="row.isSave === false" >
        <el-option v-for="item in Materialstypelist" :key="item.id" :label="item.materialsName" :value="item.id" />
      </el-select>
      <span v-else>{{ row.materialsTypeId }}</span>
    </template>
    <template #outNumber="{ row }">
      <el-input-number v-model="row.outNumber" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.outNumber }}</span>
    </template>
    <template #operation="{ row }">
      <el-button link type="primary" v-if="row.isSave === false" @click="handleSave(row)">保存</el-button>
      <el-button link type="danger" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
</template>

<script lang="ts" setup>
import { MaterialsTypeApi } from '@/api/Floodctrl/materialstype'

import { MaterialsOutboundApi } from '@/api/Floodctrl/materialsoutbound'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache()
const message = useMessage() // 消息弹窗
const emit = defineEmits(['update:modelValue'])
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
const outType = ref('');
const outReason = ref('');
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  isInfo: {
    type: Boolean,
    default: false
  }
})
var Materialstypelist = reactive<any[]>([])

const tableConfig = reactive({
  list: props.modelValue as any[],
  height: '300px',
  fields: {
    index: true,
    materialsTypeId: {
      label: '物资名称',
      formatter: (row) => {
        return getmaterialsname(row)
      }
    },
    value2: {
      label: '物资类型'
    },
    value3: {
      label: '库存数量'
    },
    outNumber: {
      label: '使用数量'
    },
    value5: {
      label: '物资单位'
    },
    operation: {
      label: '操作',
      width: '120',
      fixed: 'right'
    } as any
  }
})
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  inBatch: {
    label: '批次',
    components: 'input'
  },
  supplier: {
    label: '供应商',
    components: 'input'
  },
})
const handleSearch = () => {
  //无法搜索
  
}
const getmaterialsname = (id: number)=>{
  const item = Materialstypelist.find((item) => item.id === id)
  return item ? item.materialsName : ''
}
const handleAdd = () => {
  let count = tableConfig.list.filter((item) => !item.isSave).length
  if (count === 0)
    tableConfig.list.push({ isSave: false })
  else
    message.warning('请先保存当前数据')
}
const handleSave = (row) => {
  // if (!row.value4) {
  //   message.warning('请输入完整信息')
  //   return
  // }
  console.log(row);
  let user = wsCache.get(CACHE_KEY.USER)
  row.applicantName = user.user.nickname
  row.handleUserId = user.user.id
  row.id = tableConfig.list.length > 0 ? tableConfig.list[tableConfig.list.length - 1].id + 1 : 1
  MaterialsOutboundApi.createMaterialsOutbound(row).then(() => {
    message.success('保存成功')
  })
  row.isSave = true
  emit('update:modelValue', tableConfig.list)
}
const handleDel = (row) => {
  tableConfig.list = tableConfig.list.filter((item) => item !== row)
  MaterialsOutboundApi.deleteMaterialsOutbound(row.id).then(() => {
    message.success('删除成功')
  })
  emit('update:modelValue', tableConfig.list)
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '添加物资'
  } as any
})
onMounted(() => {
  if (props.isInfo) {
    tableConfig.fields.operation = false
    operationConfig.add = false
    MaterialsTypeApi.getMaterialsTypePage({pageNo:1,pageSize:100}).then((res) => {
      console.log(res)
      Materialstypelist.splice(0, Materialstypelist.length, ...res.list)
      console.log(Materialstypelist);
      
    })
  }
})
</script>
