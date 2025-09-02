<template>
  <div
    class="flex items-center justify-center mb-40px h-32px line-height-32px text-center text-32px font-bold text-#0A1B39 xl:text-center xl:text-32px"
  >
    <img class="h-32px w-32px mr-16px" src="@/assets/imgs/logo-web.png" /><div>{{
      getFormTitle
    }}</div>
  </div>
</template>
<script lang="ts" setup>
import { LoginStateEnum, useLoginState } from './useLogin'

defineOptions({ name: 'LoginFormTitle' })

const { t } = useI18n()

const { getLoginState } = useLoginState()

const getFormTitle = computed(() => {
  const titleObj = {
    [LoginStateEnum.RESET_PASSWORD]: t('sys.login.forgetFormTitle'),
    [LoginStateEnum.LOGIN]: import.meta.env.VITE_APP_TITLE
  }
  return titleObj[unref(getLoginState)]
})
</script>
