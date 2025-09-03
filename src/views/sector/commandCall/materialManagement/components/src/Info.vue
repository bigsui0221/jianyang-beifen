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
const atFormRef = ref()
const formConfig = reactive({
  formData: props.modelValue,
  fields: {
    title1: {
      components: 'title',
      label: '基本信息'
    },
    materialsName: {
      label: '物资名称',
      row: 12
    },
    value2: {
      label: '行政区域',
      row: 12
    },
    value3: {
      label: '规格型号',
      row: 12
    },
    unitMeasurement: {
      label: '计量单位',
      row: 12
    },
    value5: {
      label: '当前数量',
      row: 24,
      span: 12
    },
    value6: {
      label: '告警阈值',
      row: 12
    },
    value7: {
      label: '仓库名称',
      row: 12
    },
    value8: {
      label: '联系人',
      row: 12
    },
    value9: {
      label: '联系电话',
      row: 12
    },
    value10: {
      label: '负责人',
      row: 12,
    },
    value11: {
      label: '联系电话',
      row: 12,
    },
    value12: {
      row: 12,
      label: '存储地点',
    },
    value13: {
      row: 12,
      label: '通知方式：',
    }
  }
})
console.log(props.modelValue);

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
