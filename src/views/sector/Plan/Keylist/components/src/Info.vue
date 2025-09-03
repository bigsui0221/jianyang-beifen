<template>
  <at-info :config="formConfig" />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => { }
  }
})
const formConfig = reactive({
  formData: props.modelValue,
  fields: {
    title1: {
      components: 'title',
      label: '防汛重点区域信息'
    },
    drownUnit: {
      label: '淹没单位',
      row: 12
    },
    typeName: {
      label: '类型',
      row: 12
    },
    dgaeTypeName: {
      label: '风险点类型',
      row: 12
    },
    dgaeName: {
      label: '风险点名称',
      row: 12
    },
    deptName: {
      label: '行政区域',
      row: 24,
      span: 12
    },
    address: {
      label: '地址',
      row: 12
    },
    detailAddress: {
      label: '详细地址',
      row: 12
    },
    villageName: {
      label: '村名',
      row: 12
    },
    riverName: {
      label: '河名',
      row: 12
    },
    households: {
      label: '受威胁人口户数',
      row: 12,
      append: '户'
    },
    population: {
      label: '受威胁人口数',
      row: 12,
      append: '人'
    },
    remark: {
      className: 'top',
      label: '备注（说明转移人员中特殊人群数量，可投靠亲友人员数量）',
      placeholder: '转移人员中没有特殊人员'
    }
  }
})
</script>
<style lang="scss" scoped>
.at-info {
  :deep(.at-info-item) {
    &.top {
      .at-info-item-label {
        margin-left: 77px;
      }
    }
  }
}
</style>
