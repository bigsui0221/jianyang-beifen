<template>
  <el-form
    ref="formRef"
    v-loading="formLoading"
    :model="formData"
    :rules="formRules"
    :hide-required-asterisk="true"
    label-width="160px"
  >
    <ContentWrap
      id="page-search"
      :border="false"
      padding="0px"
      :body-style="{ padding: '24px 32px' }"
    >
      <p class="mb-24px text-16px text-#333 font-500">密码安全级别</p>
      <el-form-item label="密码最小长度" prop="pwdMinLength">
        <el-input
          class="!w-240px"
          v-model="formData.pwdMinLength"
          placeholder="请输入密码最小长度"
          @blur="submitForm"
        />
        <span class="ml-16px text-16px text-#FF4D4F font-400"
          >注：默认为最小密码长度为6，数字+字母的组合</span
        >
      </el-form-item>
      <el-form-item label="密码复杂度" prop="pwdComplexity">
        <el-checkbox-group v-model="formData.pwdComplexity" @change="submitForm">
          <el-checkbox label="数字" value="1" />
          <el-checkbox label="字母" value="2" />
          <el-checkbox label="特殊字符" value="3" />
          <el-checkbox label="大写字母" value="4" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="首次登录必须修改密码" prop="pwdForceChange">
        <el-checkbox v-model="formData.pwdForceChange" @change="submitForm" />
      </el-form-item>
      <el-form-item label="允许同一用户重复登录" prop="repeatLogin">
        <el-checkbox v-model="formData.repeatLogin" @change="submitForm" />
      </el-form-item>
    </ContentWrap>
    <ContentWrap
      id="page-search"
      :border="false"
      padding="0px"
      :body-style="{ padding: '24px 32px' }"
    >
      <p class="mb-24px text-16px text-#333 font-500">界面基础信息</p>
      <el-form-item label="平台名称" prop="applicationName">
        <el-input
          class="!w-240px"
          v-model="formData.applicationName"
          placeholder="请输入平台名称"
          @change="submitForm"
        />
      </el-form-item>
      <el-form-item label="Logo" prop="applicationLogo">
        <UploadImg
          v-model="formData.applicationLogo"
          :showPrompt="false"
          @on-success="submitForm"
        />
      </el-form-item>
    </ContentWrap>
  </el-form>
</template>
<script lang="ts" setup>
import * as TenantConfigApi from '@/api/omWeb/tenantConfig'
import { FormRules } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash-es'
import { isArray } from 'min-dash'

defineOptions({ name: 'OmPersonnelManageForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  pwdMinLength: 6,
  pwdComplexity: [],
  pwdForceChange: true,
  repeatLogin: true,
  applicationName: '',
  applicationLogo: ''
})
const formRules = reactive<FormRules>({
  pwdMinLength: [
    { required: true, message: '密码最小长度不能为空', trigger: 'blur' },
    {
      pattern: /^[1-9]\d*$/, // 正整数校验（1, 2, 3...）
      message: '请输入正整数',
      trigger: 'change'
    }
  ],
  pwdComplexity: [{ required: true, message: '密码复杂度不能为空', trigger: 'blur' }],
  applicationName: [
    {
      required: true,
      message: '平台名称不能为空',
      trigger: 'blur'
    }
  ],
  applicationLogo: [
    {
      required: true,
      message: 'Logo不能为空',
      trigger: ['change']
    }
  ]
})
const oldFormData = ref({
  id: undefined,
  pwdMinLength: 6,
  pwdComplexity: [],
  pwdForceChange: true,
  repeatLogin: true,
  applicationName: '',
  applicationLogo: ''
})
const formRef = ref() // 表单 Ref

/** 获取配置 */
const getConfig = async () => {
  formLoading.value = true
  try {
    const data = await TenantConfigApi.getTenantConfig()
    data.pwdForceChange = data.pwdForceChange === '1'
    data.repeatLogin = data.repeatLogin === '1'
    data.pwdComplexity = data.pwdComplexity ? data.pwdComplexity.split(',') : []
    formData.value = data
    oldFormData.value = cloneDeep(data)
  } finally {
    formLoading.value = false
  }
}

/** 提交表单 */
const submitForm = async () => {
  if (isEqual(formData.value, oldFormData.value)) {
    return // 如果数据没有变化，则不提交
  }
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = cloneDeep(formData.value) as unknown as TenantConfigApi.TenantConfigVO
    data.pwdForceChange = data.pwdForceChange ? '1' : '0'
    data.repeatLogin = data.repeatLogin ? '1' : '0'
    data.pwdComplexity =
      data.pwdComplexity && isArray(data.pwdComplexity) ? data.pwdComplexity.join(',') : ''
    await TenantConfigApi.updateTenantConfig(data)
    message.success(t('common.updateSuccess'))
    await getConfig()
  } finally {
    formLoading.value = false
  }
}
onMounted(() => {
  getConfig()
})
</script>
