<template>
  <at-form ref="atFormRef" :config="formConfig" />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => { }
  }
})
const atFormRef = ref()
const formConfig = reactive({
  formData: props.modelValue,
  labelWidth: '140px',
  rowGutter: 0,
  fields: {
    title1: {
      components: 'title',
      label: '防汛重点区域信息'
    },
    value1: {
      label: '淹没单位',
      components: 'input',
      required: true,
      row: 12
    },
    value2: {
      label: '类型',
      components: 'select',
      dictType: 'ai_platform',
      required: true,
      row: 12
    },
    value3: {
      label: '风险点类型',
      components: 'select',
      dictType: 'ai_platform',
      required: true,
      row: 12
    },
    value4: {
      label: '风险点名称',
      components: 'select',
      dictType: 'ai_platform',
      required: true,
      row: 12
    },
    value5: {
      label: '行政区域',
      components: 'select',
      dictType: 'ai_platform',
      required: true,
      row: 24,
      span: 12
    },
    value6: {
      label: '地址',
      components: 'input',
      required: true,
      row: 12
    },
    value7: {
      label: '详细地址',
      components: 'input',
      required: true,
      row: 12
    },
    value8: {
      label: '村名',
      components: 'input',
      required: true,
      row: 12
    },
    value9: {
      label: '河名',
      components: 'input',
      required: true,
      row: 12
    },
    value10: {
      label: '受威胁人口户数',
      components: 'input',
      required: true,
      row: 12,
      append: '户'
    },
    value11: {
      label: '受威胁人口数',
      components: 'input',
      required: true,
      row: 12,
      append: '人'
    },
    value12: {
      labelPosition: 'top',
      label: '备注（说明转移人员中特殊人群数量，可投靠亲友人员数量）',
      components: 'input',
      type: 'textarea',
      required: true,
      placeholder: '转移人员中没有特殊人员'
    }
  }
})
const validate = () => {
  return atFormRef.value.validate()
}
defineExpose({ validate })
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
