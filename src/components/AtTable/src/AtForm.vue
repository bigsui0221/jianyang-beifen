<template>
  <el-form ref="formRef" class="at-form" :model="formData" :rules="formRules"
    :label-width="formConfig.labelWidth || 'auto'" :label-position="formConfig.labelPosition || 'right'"
    label-suffix="：" :style="{ width: formConfig.width }" :validateOnRuleChange="formConfig.validateOnRuleChange"
    :disabled="formConfig.readonly">
    <input type="text" name="notautosubmit" style="display: none" />
    <el-row :gutter="formConfig.rowGutter ?? 16">
      <el-col :span="field.row" v-for="field in formFields" :key="field.prop">
        <AtTitle v-if="field.components == 'title'" :title="field.label" :class="field.class" :style="field.style" />
        <el-form-item v-else :label="field.label" :prop="field.prop" :class="'el-col-' + field.span"
          :label-position="field.labelPosition || 'right'">
          <template v-if="$slots[field.prop]">
            <slot :name="field.prop"></slot>
          </template>
          <span class="is-disabled" v-else-if="
            (['input', 'inputNumber', 'textarea', 'inputMap', 'date'].includes(field.components) ||
              formData[field.prop] === undefined) &&
            formConfig.readonly
          ">{{ fieldText(field) }}{{ field.append }}</span>
          <AtInputMap v-else-if="field.components === 'inputMap'" :config="field" v-model="formData[field.prop]"
            @change="field.onChange" />
          <el-input-number v-else-if="field.components === 'inputNumber'" v-model="formData[field.prop]"
            :min="field.min" :max="field.max" :step="field.step" :placeholder="placeholder(field)"
            :precision="field.precision" :controls="field.controls" :disabled="field.disabled" @change="field.onChange"
            clearable />
          <el-input :id="field.prop" v-else-if="field.components == 'input' && field.type == 'number'"
            :type="field.type" v-model.number="formData[field.prop]" :placeholder="placeholder(field)" clearable
            :maxlength="field.maxlength" :disabled="field.disabled" @change="field.onChange">
            <template #append v-if="field.append">{{ field.append }}</template>
          </el-input>
          <el-input :id="field.prop" v-else-if="['input', 'textarea'].includes(field.components)" :type="field.type"
            v-model="formData[field.prop]" :placeholder="placeholder(field)" :maxlength="field.maxlength" clearable
            :disabled="field.disabled" @change="field.onChange" :readonly="field.readonly" :rows="field.rows"
            resize="none">
            <template #append v-if="field.append">{{ field.append }}</template>
          </el-input>
          <AtSelect :id="field.prop" v-else-if="field.components === 'select'" :config="field"
            v-model.lazy="formData[field.prop]" @change="field.onChange" clearable filterable
            @options-change="field.optionsChange" :disabled="field.disabled" :placeholder="placeholder(field)" />
          <el-radio-group :id="field.prop" v-else-if="field.components === 'radioButton'" v-model="formData[field.prop]"
            @change="field.onChange" :disabled="field.disabled">
            <el-radio-button :label="item.value" v-for="item in field.options" :key="item.value"
              :disabled="item.disabled">{{
                item.label }}</el-radio-button>
          </el-radio-group>
          <el-radio-group :id="field.prop" v-else-if="field.components === 'radioGroup'" v-model="formData[field.prop]"
            @change="field.onChange" :disabled="field.disabled">
            <el-radio :label="item.value" v-for="item in field.options" :key="item.value">{{
              item.label
            }}</el-radio>
          </el-radio-group>
          <el-checkbox-group :id="field.prop" v-else-if="field.components === 'checkbox'" v-model="formData[field.prop]"
            @change="field.onChange" :disabled="field.disabled">
            <el-checkbox v-for="item in field.options" :label="item.value" :key="item.value">{{
              item.label
            }}</el-checkbox>
          </el-checkbox-group>
          <el-date-picker :id="field.prop" v-else-if="field.components == 'date'" :type="field.type" clearable
            v-model="formData[field.prop]" :placeholder="placeholder(field)" :disabled="field.disabled"
            @change="field.onChange" :format="field.format" :value-format="field.valueFormat" start-placeholder="开始日期"
            end-placeholder="结束日期" :default-time="field.defaultTime" />
          <el-switch v-bind="field" :id="field.prop" v-else-if="field.components === 'switch'"
            v-model="formData[field.prop]" />
          <UploadFile :id="field.prop" v-else-if="field.components === 'uploadFile'" v-model="formData[field.prop]"
            :disabled="field.disabled" clearable />
          <UploadImgs :id="field.prop" v-else-if="field.components === 'imagesFile'" v-model="formData[field.prop]"
            :disabled="field.disabled" clearable :limit="field.limit" />
          <Editor :id="field.prop" v-else-if="field.components === 'editor'" v-model="formData[field.prop]"
            :height="field.height" :readonly="field.disabled" />
          <span :id="field.prop" v-else>{{ fieldText(field) }}</span>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="formButtons.length > 0" class="at-form-button-group">
      <el-button v-for="btn in formButtons" :ref="btn.key" :key="btn.key" :type="btn.type" :icon="btn.icon"
        :size="btn.size" @click="onClick(btn)" :loading="btn.loading">{{ btn.label }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
defineOptions({ name: 'AtForm' })
import { UploadFile, UploadImgs } from '@/components/UploadFile'
const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['submit', 'cancel'])
const formRef = ref()
const formData = ref(props.config.formData || {})
// watch(() => props.config.formData, (val) => {
//   formData.value = val
// })

const fieldText = computed(() => {
  return (field) => {
    if (field.formatter) {
      if (typeof field.formatter === 'function' && formData.value[field.prop]) {
        return field.formatter(formData.value[field.prop])
      }
    } else {
      return formData.value[field.prop] ?? '-'
    }
  }
})

const buttonGroup = ref({
  submit: {
    label: '保存',
    type: 'primary',
    validate: true
  },
  cancel: {
    label: '取消',
    type: 'default'
  }
})

const formConfig = computed(() => {
  const config = { ...props.config }
  config.width = config.width || '100%'
  return config
})
const formFields = computed(() => {
  let arr: any[] = []
  const config = formConfig.value as any
  for (const key in config?.fields) {
    let field = config?.fields[key]
    if (field.hide) continue
    field.prop = key
    field.row = field.row || 24
    field.span = field.span || 24
    if (field.components == 'date') {
      if (field.type == 'daterange') {
        formData.value[field.prop] = formData.value[field.prop] ?? []
        field.defaultTime = field.defaultTime ?? [new Date(2000, 1, 1, 0, 0, 0),
        new Date(2000, 2, 1, 23, 59, 59),]
      } else {
        field.defaultTime = field.defaultTime ?? undefined
      }
      if (field.valueFormat) {
        field.valueFormat = field.valueFormat
      } else {
        field.valueFormat = ['date', 'daterange'].includes(field.type) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss'
      }
    }
    if (field.components == 'inputNumber') {
      field.precision = field.precision ?? 2
      field.controls = field.controls ?? false
    }
    if (field.components === 'select') {
      field.optionsChange =
        field.optionsChange && field.optionsChange instanceof Function
          ? field.optionsChange
          : () => { }
    }
    if (config.visible && field.options && field.options instanceof Function) {
      field.options().then((res) => (field.options = res))
      field.options = []
    }
    field.onChange =
      field.onChange && field.onChange instanceof Function ? field.onChange : () => { }
    if (field.components == 'title') {
      field.row = 24
    }
    field.rows = field.rows || 2
    if (field.disabled !== undefined) field.disabled = field.disabled
    if (config.readonly != undefined) field.disabled = config.readonly
    arr.push(field)
  }
  return arr
})
const formRules = computed(() => {
  let rules = {}
  for (const key in props.config?.fields) {
    let field = props.config?.fields[key]
    rules[key] = props.config?.rules?.[key] || []
    if (field.required && !props.config.readonly) {
      rules[key].unshift({
        required: true,
        message: `${field.placeholder ?? componentPlaceholder(field.components) + (field.label ?? '')
          }`,
        trigger: componentPlaceholder(field.components) == '请输入' ? 'blur' : 'change'
      })
    }
    if (field.min !== undefined && field.max !== undefined) {
      rules[key].push({
        type: 'number',
        min: field.min,
        max: field.max,
        message: `${field.label}值在${field.min}到${field.max}之间`,
        trigger: 'blur'
      })
    } else if (field.min !== undefined) {
      rules[key].push({
        type: 'number',
        min: field.min,
        message: `${field.label}不能小于${field.min}`,
        trigger: 'blur'
      })
    } else if (field.max !== undefined) {
      rules[key].push({
        type: 'number',
        max: field.max,
        message: `${field.label}不能大于${field.max}`,
        trigger: 'blur'
      })
    }
    if (field.rules) {
      rules[key] = [...rules[key], ...field.rules]
    }
    if (rules[key].length == 0) delete rules[key]
  }
  return rules
})
const formButtons = computed(() => {
  let arr: any[] = []
  for (const key in props.config.button) {
    let obj = props.config.button[key]
    let btn = buttonGroup.value[key]
    arr.push({ ...btn, ...obj, key })
  }
  return arr
})

const placeholder = (field) => {
  if (props.config.readonly || field.disabled) return '-'
  return field.placeholder || componentPlaceholder(field.components) + (field.label ?? '')
}
const componentPlaceholder = (componentName) => {
  if (['input', 'textarea', 'inputNumber'].includes(componentName)) {
    return '请输入'
  } else if (['uploadFile'].includes(componentName)) {
    return '请上传'
  } else {
    return '请选择'
  }
}
const validate = () => {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        resolve(formData.value)
      })
      .catch(() => {
        reject()
      })
  })
}
const onClick = (btn) => {
  if (btn.validate) {
    validate()
      .then(() => {
        btn.onClick && btn.onClick(formData.value)
      })
      .catch(() => { })
  } else {
    btn.onClick && btn.onClick()
  }
}
const resetFields = () => {
  formRef.value.resetFields()
}
const clearValidate = () => {
  formRef.value.clearValidate()
}
defineExpose({ validate, resetFields, clearValidate, formData })
</script>

<style lang="scss" scoped>
.el-form {
  :deep(.el-row) {
    display: flex;
    flex-wrap: wrap;

    // .el-form-item {
    //   display: flex;
    // }

    .el-col:has(.is-disabled),
    .el-col:has(.upload-file.disabled) {
      .el-form-item {

        // margin-bottom: 0;
        .el-form-item__label {
          &::before {
            display: none;
          }
        }

        .el-select {
          font-size: 0;

          .el-select__wrapper {
            // font-size: 0;

            &.is-disabled {
              padding: 4px 0;
              border: 0;
              background: transparent;
              box-shadow: none;

              .el-select__suffix {
                display: none;
              }

              .el-select__selected-item {
                color: var(--el-text-color-regular)
              }
            }
          }
        }
      }

      &+.el-col-24:not(:has(.is-disabled, .upload-file.disabled)) {
        margin-top: 12px;
      }
    }

    .is-disabled {
      input {
        // background-color: transparent;
        // border-color: transparent;
        // color: #333;
        // padding: 0;
      }

      textarea {
        // background-color: transparent;
        // border-color: transparent;
        // color: #333;
      }

      .el-input__suffix,
      .el-input__prefix {
        //display: none;
      }

      .el-input__inner {
        &:hover {
          border-color: transparent;
        }
      }

      .el-input-group__append {
        background-color: transparent;
        border-color: transparent;
      }
    }

    .at-title {
      margin-bottom: 18px;
    }

    .el-input-number {
      width: 100%;

      input {
        text-align: left;
      }
    }

    .el-radio {
      color: #333;
    }

    .el-radio-group {
      .el-radio-button {
        &+.el-radio-button {
          margin-left: 16px;
        }

        &:not(.is-active) {
          .el-radio-button__inner {
            border: var(--el-border);
          }
        }

        .el-radio-button__inner {
          min-width: 100px;
          border-radius: var(--el-border-radius-base);
        }
      }
    }

    // .el-input__inner:read-only{
    //     background-color: #ccc;
    // }
    .el-date-editor {
      --el-date-editor-width: 100%;
    }

    .upload-file {
      &.disabled {
        .upload-file-uploader {
          display: none;
        }

        .el-upload-list__item {
          border: none;

          .ele-upload-list__item-content-action {
            display: none;
          }
        }
      }
    }
  }
}
</style>
