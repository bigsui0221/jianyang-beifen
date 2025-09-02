<template>
  <ContentWrap
    id="page-search"
    :border="false"
    padding="0px"
    :body-style="{ padding: '24px 32px' }"
  >
    <p class="text-#000 text-16px font-500">{{ t('profile.user.title') }}</p>
    <ProfileUser ref="profileUserRef" />
  </ContentWrap>

  <ContentWrap
    id="page-search"
    :border="false"
    padding="0px"
    :body-style="{ padding: '24px 32px' }"
  >
    <el-tabs v-model="activeName" class="profile-tabs" style="height: 400px" tab-position="top">
      <el-tab-pane class="w-[fit-content]" label="基础信息" name="basicInfo">
        <BasicInfo @success="handleBasicInfoSuccess" />
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="resetPwd">
        <ResetPwd />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { BasicInfo, ProfileUser, ResetPwd } from './components'

const { t } = useI18n()
defineOptions({ name: 'Profile' })
const activeName = ref('basicInfo')
const profileUserRef = ref()

// 处理基本信息更新成功
const handleBasicInfoSuccess = async () => {
  await profileUserRef.value?.refresh()
}
</script>
<style scoped>
.user {
  max-height: 960px;
  padding: 15px 20px 20px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-card .el-card__header, .el-card .el-card__body) {
  padding: 15px !important;
}

.profile-tabs > .el-tabs__content {
  padding: 32px;
  font-weight: 600;
  color: #6b778c;
}

.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>
