<template>
  <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" v-if="props.isInfo"/>
  <at-table-operation title="申请信息"  v-if="!props.isInfo" />
  <div class="mt-10 mb-10 flex" v-if="!props.isInfo">
    <span class="mr-10">申请批次：{{ year+month+day+hours+minutes }}</span>
    <span class="mr-10">申请时间：{{ formattedTime }}</span>
    <span class="mr-10">申请人：简阳</span>
    <span>仓库：街道</span>
  </div>

  <at-table-operation title="入库记录" :config="operationConfig" v-if="!props.isInfo"/>

  <at-table ref="atTableRef" :config="tableConfig">
    <!-- 物资名称 -->
    <template #materialsTypeId="{ row }">
      <!-- <el-input v-model="row.materialsTypeId" placeholder="请输入" v-if="row.isSave === false" /> -->
      <el-select v-model="row.materialsTypeId" v-if="row.isSave === false" >
        <el-option v-for="item in Materialstypelist" :key="item.id" :label="item.materialsName" :value="item.id" />
      </el-select>
      <span v-else>{{ row.materialsTypeId }}</span>
    </template>
    <!-- 批次 数量 供应商 供应商联系人 供应商联系电话 生产日期 有效期 采购日期 申请人 申请日期 经办人 经办人电话 -->
    <template #inBatch="{ row }">
      <el-input v-model="row.inBatch" placeholder="年月日时分序号" v-if="row.isSave === false" />
      <span v-else>{{ row.inBatch }}</span>
    </template>
    <template #reportNumber="{ row }">
      <el-input v-model="row.reportNumber" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.reportNumber }}</span>
    </template>
    <template #supplier="{ row }">
      <el-input v-model="row.supplier" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.supplier }}</span>
    </template>
    <template #supplierUser="{ row }">
      <el-input v-model="row.supplierUser" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.supplierUser }}</span>
    </template>
    <template #supplierPhone="{ row }">
      <el-input v-model="row.supplierPhone" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.supplierPhone }}</span>
    </template>
    <template #produceTime="{ row }">
      <el-input v-model="row.produceTime" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.produceTime }}</span>
    </template>
    <template #effectiveTime="{ row }">
      <el-input v-model="row.effectiveTime" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.effectiveTime }}</span>
    </template>
    <template #purchaseTime="{ row }">
      <el-input v-model="row.purchaseTime" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.purchaseTime }}</span>
    </template>
    <template #alarmThreshold="{ row }">
      <el-input v-model="row.alarmThreshold" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.alarmThreshold }}</span>
    </template>
    <template #specificationModel="{ row }">
      <el-input v-model="row.specificationModel" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.specificationModel }}</span>
    </template>
    <!-- <template #specificationModel="{ row }">
      <el-input v-model="row.specificationModel" placeholder="请输入" v-if="row.isSave === false" />
      <span v-else>{{ row.specificationModel }}</span>
    </template>
    -->






    <template #operation="{ row }">
      <el-button link type="primary" v-if="row.isSave === false" @click="handleSave(row)">保存</el-button>
      <el-button link type="danger" @click="handleDel(row)">删除</el-button>
    </template>
  </at-table>
</template>

<script lang="ts" setup>
import { MaterialsTypeApi } from '@/api/Floodctrl/materialstype'
import { MaterialsApi } from '@/api/Floodctrl/materials'
const message = useMessage() // 消息弹窗
const emit = defineEmits(['update:modelValue'])
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache()
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
  //批次 数量 供应商 供应商联系人 供应商联系电话 生产日期 有效期 采购日期 申请人 申请日期 经办人 经办人电话
  fields: {
    index: true,
    materialsTypeId: {
      label: '物资名称',
      formatter: (row) => {
        return getmaterialsname(row)
      }
    },
    inBatch: {
      label: '批次'
    },
    reportNumber: {
      label: '数量'
    },
    supplier: {
      label: '供应商'
    },
    supplierUser: {
      label: '供应商联系人'
    },
    supplierPhone: {
      label: '供应商联系电话'
    },
    produceTime: {
      label: '生产日期'
    },
    effectiveTime: {
      label: '有效期'
    },
    purchaseTime: {
      label: '采购日期'
    },
    alarmThreshold: {
      label: '报警阈值'
    },
    specificationModel: {
      label: '规格型号'
    },
    applicantName: {
      label: '申请人'
    },
    warehouseId: {
      label: '仓库'
    },
    handleUserId: {
      label: '经办人'
    },
    residueNumber: {
      label: '剩余数'
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
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

const getmaterialsname = (id: number)=>{
  const item = Materialstypelist.find((item) => item.id === id)
  return item ? item.materialsName : ''
}
const handleSearch = () => {
  //无法搜索
  
}
const handleAdd = () => {
  let count = tableConfig.list.filter((item) => !item.isSave).length
  if (count === 0)
    tableConfig.list.push({ isSave: false })
  else
    message.warning('请先保存当前数据')
}
const handleSave = (row) => {
  // if (!row.value1 || !row.value2 || !row.value3 || !row.value4) {
  //   message.warning('请输入完整信息')
  //   return
  // }
  console.log(row);
  let user = wsCache.get(CACHE_KEY.USER)
  row.applicantName = user.user.nickname
  row.handleUserId = user.user.id
  row.id = tableConfig.list.length > 0 ? tableConfig.list[tableConfig.list.length - 1].id + 1 : 1
  MaterialsApi.createMaterials(row).then(() => { 
    message.success('保存成功')
  })
  row.isSave = true

  emit('update:modelValue', tableConfig.list)
}
const handleDel = (row) => {
  tableConfig.list = tableConfig.list.filter((item) => item !== row)
  MaterialsApi.deleteMaterials(row.id).then(() => { 
    message.success('删除成功')
  })
  emit('update:modelValue', tableConfig.list)
}
const operationConfig = reactive({
  add: {
    onClick: handleAdd,
    label: '添加记录'
  } as any
})
onMounted(() => {
  if (props.isInfo) {
    tableConfig.fields.operation = false
    operationConfig.add = false
    console.log(Materialstypelist);
    MaterialsTypeApi.getMaterialsTypePage({pageNo:1,pageSize:100}).then((res) => {
      console.log(res)
      Materialstypelist.splice(0, Materialstypelist.length, ...res.list)
      console.log(Materialstypelist);
      
    })
  }
})
</script>
