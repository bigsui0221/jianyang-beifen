<template>
  <Form ref="formRef" :rules="rules" :schema="schema" />
  <div class="text-right">
    <XButton :title="t('common.save')" type="primary" @click="submit()" />
  </div>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { FormSchema } from '@/types/form'
import type { FormExpose } from '@/components/Form'
import {
  getUserProfile,
  updateUserProfile,
  UserProfileUpdateReqVO
} from '@/api/system/user/profile'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage() // 消息弹窗
const userStore = useUserStore()

// 定义事件
const emit = defineEmits<{
  (e: 'success'): void
}>()

// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  email: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.rules.truemail'),
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur'
    }
  ]
})
const schema = reactive<FormSchema[]>([
  {
    field: 'nickname',
    label: '昵称',
    component: 'Input',
    formItemProps: {
      style: {
        width: '324px'
      }
    }
  },
  {
    field: 'mobile',
    label: '手机',
    component: 'Input',
    formItemProps: {
      style: {
        width: '324px'
      }
    }
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    formItemProps: {
      style: {
        width: '324px'
      }
    }
  }
])
const formRef = ref<FormExpose>() // 表单 Ref
const submit = () => {
  const elForm = unref(formRef)?.getElFormRef()
  if (!elForm) return
  elForm.validate(async (valid) => {
    if (valid) {
      const data = unref(formRef)?.formModel as UserProfileUpdateReqVO
      await updateUserProfile(data)
      message.success(t('common.updateSuccess'))
      const profile = await init()
      userStore.setUserNicknameAction(profile.nickname)
      // 发送成功事件
      emit('success')
    }
  })
}
const init = async () => {
  const res = await getUserProfile()
  unref(formRef)?.setValues(res)
  return res
}
onMounted(async () => {
  await init()
})
</script>
