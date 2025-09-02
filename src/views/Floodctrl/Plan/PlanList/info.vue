<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-form ref="atFormRef" :config="formConfig" />
    <at-table-operation title="防汛重点" />
    <at-table ref="atTableRef" :config="tableConfig" :params="queryFormParams" />
    <at-table-operation title="应急响应" />
    <at-table ref="atTableMaterialsRef" :config="tableMaterialsConfig">
      <template #content="{ row }">
        <el-input v-model="row.content" placeholder="请输入" v-if="!isInfo" />
        <span v-else>{{ row.content }}</span>
      </template>
      <template #goodsList="{ row }">
        <span>{{ goodsListText(row.goodsList) }}</span>
        <el-button link type="primary" @click="handleAddMaterials(row)" v-if="!isInfo">{{ row?.goodsList?.length > 0 ?
          '修改' : '添加'
          }}</el-button>
      </template>
    </at-table>
    <at-fixed-footer-btns v-if="!isInfo">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </at-fixed-footer-btns>

    <Dialog v-model="dialogVisible" title="添加应急资源" width="65%">
      <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
      <at-table ref="atTableDialogRef" :config="tableDialogConfig" @load-end="handleLoadEnd">
        <template #needNum="{ row }">
          <span v-if="isInfo">{{ row.needNum }}</span>
          <el-input-number v-model="row.needNum" placeholder="请输入" v-else @change="handleNumChange(row)" :min="0"
            :max="row.residueNumber" />
        </template>
      </at-table>
      <template #footer>
        <el-button type="primary" @click="handleAddGood">添加</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </template>
    </Dialog>
  </ContentWrap>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Index' })
import { MaterialsApi } from '@/api/Floodctrl/materials';
import { KeyAreaApi } from '@/api/Floodctrl/plan/keyarea';
import { PlanApi } from '@/api/Floodctrl/plan/plan';
import { getDictLabel, getDictOptions } from '@/utils/dict';
const message = useMessage() // 消息弹窗
const route = useRoute()
const isInfo = route.query.io === '1' ? true : false;
const id = route.query.id;
const dialogVisible = ref(false)
const queryFormParams = reactive({
  dageId: ''
})
const formConfig = reactive({
  formData: {
    responseList: []
  } as any,
  readonly: false,
  fields: {
    title: {
      components: 'title',
      label: '预案信息'
    },
    type: {
      components: 'select',
      label: '预案类型',
      dictType: 'fx_plan_emerg_type',
      required: true,
      row: 12,
    },
    name: {
      label: '预案名称',
      components: 'input',
      row: 12,
      required: true,
    },
    deptId: {
      label: '行政区划',
      components: 'select',
      row: 12,
      required: true,
    },
    dgaeId: {
      label: '风险点',
      components: 'select',
      row: 12,
      required: true,
      onChange: (val) => {
        getKeyAreaPage(val)
      }
    }
  }
})
const tableConfig = reactive({
  api: KeyAreaApi.getKeyAreaPage,
  immediate: false,
  height: '300px',
  fields: {
    drownUnit: {
      label: '防汛重点'
    },
    households: {
      label: '受威胁户数'
    },
    population: {
      label: '受威胁人口数'
    },
    remarks: {
      label: '其他'
    }
  }
})
const tableMaterialsConfig = reactive({
  list: formConfig.formData.responseList,
  height: 'auto',
  fields: {
    level: {
      label: '响应等级',
      formatter: (val) => {
        return getDictLabel('fx_plan_response_level', val)
      }
    },
    content: {
      label: '应急处置'
    },
    goodsList: {
      label: '应急资源'
    }
  }
})
const atTableRef = ref()
const getKeyAreaPage = (dgaeId) => {
  queryFormParams.dageId = dgaeId
  atTableRef.value?.refresh()
}
const queryParams = reactive({})
const atTableDialogRef = ref()
const queryFields = reactive({
  warehouseId: {
    label: '仓库',
    components: 'select',
    dictType: 'ai_platform'
  },
  materialsTypeName: {
    label: '物资名称',
    components: 'input'
  },
  specificationModel: {
    label: '规格型号',
    components: 'input'
  },
})
const tableDialogConfig = reactive({
  api: MaterialsApi.getMaterialsPage,
  height: '300px',
  fields: {
    warehouseName: {
      label: '仓库'
    },
    materialsTypeName: {
      label: '物资名称'
    },
    specificationModel: {
      label: '规格型号'
    },
    residueNumber: {
      label: '库存数量'
    },
    needNum: {
      label: '需求数量'
    },
    unitMeasurement: {
      label: '单位'
    },
  }
})
const goodsListText = (list) => {
  return list?.map((item) => item.goodsName + '*' + item.needNum).join('、') ?? ''
}
/** 当前操作的应急响应 */
const currentResponse = ref<any>({})
const handleSearch = () => {
  atTableDialogRef.value?.refresh()
}
const handleAddMaterials = (row) => {
  dialogVisible.value = true
  currentResponse.value = JSON.parse(JSON.stringify(row))
}
const handleLoadEnd = (data) => {
  data.forEach((item) => {
    const obj: any = currentResponse.value?.goodsList?.find((i: any) => i.goodsId === item.id)
    if (obj) {
      item.needNum = obj.needNum
    } else {
      item.needNum = 0
    }
  })
}
const atFormRef = ref()
const handleSave = () => {
  atFormRef.value.validate().then(data => {
    let promise = PlanApi.createPlan
    if (data.id)
      promise = PlanApi.updatePlan
    promise(data).then(() => {
      message.success('保存成功')
      if (!data.id) {
        atFormRef.value.resetFields()
        resetResponseList()
        atTableRef.value?.clear()
      }
    })
  })
}
const handleNumChange = (row) => {
  let index = currentResponse.value?.goodsList.findIndex((item: any) => item.goodsId === row.id)
  if (index > -1) {
    currentResponse.value.goodsList[index].needNum = row.needNum
  } else {
    currentResponse.value.goodsList.push({
      mainId: formConfig.formData.id,
      goodsId: row.id,
      needNum: row.needNum,
      goodsName: row.materialsTypeName,
    })
  }
}
const handleAddGood = () => {
  let index = formConfig.formData.responseList.findIndex((item) => item.level === currentResponse.value.level)
  formConfig.formData.responseList.splice(index, 1, { ...currentResponse.value })
  dialogVisible.value = false
}
const resetResponseList = () => {
  formConfig.formData.responseList.length = 0
  getDictOptions('fx_plan_response_level').forEach((item) => {
    formConfig.formData.responseList.push({
      level: item.value,
      levelName: item.label,
      goodsList: []
    })
  })
}
onMounted(() => {
  if (isInfo) {
    formConfig.readonly = true
  }
  if (!id) {
    resetResponseList()
  } else {
    PlanApi.getPlan(Number(id)).then((res) => {
      for (const key in res) {
        formConfig.formData[key] = res[key]
      }
      tableMaterialsConfig.list = res.responseList
      getKeyAreaPage(res.dgaeId)
    })
  }
})
</script>
<style lang="scss" scoped>
:deep(.el-table) {
  .el-table__cell {
    &.goodsList {
      .cell {
        display: flex;
        align-items: center;
        justify-content: center;

        .el-button {
          margin-left: 10px;
        }

      }
    }
  }
}
</style>