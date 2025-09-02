<template>
  <div class="text-14px text-#333 font-400">
    <UserAvatar class="mt-20px" :img="userInfo?.avatar" />
    <div class="mt-20px">账号：{{ userInfo?.username }}</div>
    <div class="mt-20px">昵称：{{ userInfo?.nickname }}</div>
    <div class="mt-20px">手机：{{ userInfo?.mobile }}</div>
    <div class="mt-20px">邮箱：{{ userInfo?.email }}</div>
    <div class="mt-20px"> 创建时间：{{ formatDate(userInfo.createTime) }} </div>
  </div>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import UserAvatar from './UserAvatar.vue'

import { getUserProfile, ProfileVO } from '@/api/system/user/profile'

defineOptions({ name: 'ProfileUser' })

const userInfo = ref({} as ProfileVO)
const getUserInfo = async () => {
  const users = await getUserProfile()
  userInfo.value = users
}

// 暴露刷新方法
defineExpose({
  refresh: getUserInfo
})

onMounted(async () => {
  await getUserInfo()
})
</script>
