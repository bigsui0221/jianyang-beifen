<template>
  <at-form ref="atFormRef" :config="formConfig" />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => { }
  }
})
const atFormRef = ref()
const formConfig = reactive({
  formData: {} as any,
  labelWidth: '140px',
  rowGutter: 0,
  fields: {
    title1: {
      components: 'title',
      label: '防汛重点区域信息'
    },
    drownUnit: {
      label: '淹没单位',
      components: 'input',
      required: true,
      row: 12
    },
    type: {
      label: '类型',
      components: 'select',
      dictType: 'fx_key_area_type',
      required: true,
      row: 12
    },
    dgaeId: {
      label: '风险点名称',
      components: 'select',
      required: true,
      row: 12,
      onChange: (value, row) => {
        formConfig.formData.dgaeType = row.type
      }
    },
    dgaeType: {
      label: '风险点类型',
      components: 'select',
      dictType: 'fx_danger_type',
      required: true,
      row: 12,
      disabled: true,
    },
    deptId: {
      label: '行政区域',
      components: 'select',
      required: true,
      row: 12,
    },
    address: {
      label: '地址',
      components: 'inputMap',
      required: true,
      row: 12,
      onChange: (value) => {
        formConfig.formData.lon = value.longitude
        formConfig.formData.lat = value.latitude
      }
    },
    detailAddress: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 24
    },
    villageName: {
      label: '村名',
      components: 'input',
      required: true,
      row: 12
    },
    riverName: {
      label: '河名',
      components: 'input',
      required: true,
      row: 12
    },
    households: {
      label: '受威胁人口户数',
      components: 'input',
      required: true,
      row: 12,
      append: '户'
    },
    population: {
      label: '受威胁人口数',
      components: 'input',
      required: true,
      row: 12,
      append: '人'
    },
    remark: {
      labelPosition: 'top',
      label: '备注（说明转移人员中特殊人群数量，可投靠亲友人员数量）',
      components: 'input',
      type: 'textarea',
      required: true,
      placeholder: '转移人员中没有特殊人员'
    }
  }
})

watch(() => props.modelValue, (val) => {
  if (val)
    for (const key in val) {
      formConfig.formData[key] = val[key]
    }
}, { immediate: true, deep: true }
)
const validate = () => {
  return atFormRef.value.validate()
}
const formData = () => {
  return atFormRef.value.formData
}
const resetFields = () => {
  return atFormRef.value.resetFields()
}
defineExpose({ validate, resetFields, formData })
</script>
<style lang="scss" scoped>
.el-form {
  :deep(.el-form-item--label-top) {
    .el-form-item__label {
      padding-left: 77px;
    }

    .el-form-item__content {
      margin-left: 140px;
    }
  }
}
</style>
