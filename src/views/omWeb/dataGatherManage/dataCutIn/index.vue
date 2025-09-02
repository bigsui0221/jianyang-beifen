<template>
  <!-- 搜索 -->
  <ContentWrap
    id="page-search"
    :border="false"
    padding="0px"
    :body-style="{ padding: '24px 32px' }"
  >
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
      @submit.prevent
    >
      <el-form-item label="账号" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入账号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择用户状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap
    class="!mb-0"
    :border="false"
    padding="32px"
    :body-style="{ padding: '0' }"
    title="列表信息"
  >
    <template #header>
      <el-button
        type="primary"
        plain
        class="!p-16px pt-0 pb-0 !h-32px lh-32px !border-[var(--el-color-primary)]"
        style="--el-button-text-color: var(--el-color-primary)"
        @click="openForm('create')"
      >
        <Icon icon="ep:circle-plus" class="mr-7px" />新增
      </el-button>

      <el-button
        :loading="exportLoading"
        class="!p-16px pt-0 pb-0 !h-32px lh-32px"
        plain
        type="success"
        @click="handleExport"
      >
        <Icon class="mr-5px" icon="ep:download" />
        导出
      </el-button>
    </template>
    <el-table :height="tbMaxHeight" v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" key="id" prop="id" />
      <el-table-column label="账号" align="center" prop="username" :show-overflow-tooltip="true" />
      <el-table-column label="昵称" align="center" prop="nickname" :show-overflow-tooltip="true" />
      <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
      <el-table-column
        label="最后一次登录时间"
        align="center"
        prop="loginDate"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="最后一次登录IP" align="center" prop="loginIp" width="180" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="224" fixed="right">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button type="primary" link @click="openForm('update', scope.row.id)">
              修改
            </el-button>
            <el-button type="primary" link @click="handleResetPwd(scope.row)"> 重置密码 </el-button>
            <el-button
              :type="{ 0: 'success', 1: 'info' }[scope.row.status]"
              link
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status !== CommonStatusEnum.ENABLE ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row.id)"> 删除 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      margin="0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 添加或修改用户对话框 -->
  <DataCutInForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserMainApi from '@/api/omWeb/userMain'
import DataCutInForm from './DataCutInForm.vue'

defineOptions({ name: 'OmPersonnelManage' })

const maxHeight = useMaxHeight({
  main: 'layout-main',
  subtract: [20, 'page-search', 15, 32, 57, 40, 'pagination', 32, 20]
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const tbMaxHeight = ref<number>(0)
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  nickname: undefined,
  username: undefined,
  // mobile: undefined,
  status: undefined,
  deptId: undefined
  // createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserMainApi.getUserMainPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserMainApi.UserMainVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status !== CommonStatusEnum.ENABLE ? '启用' : '停用'
    const status = {
      0: 1,
      1: 0
    }
    await message.confirm('确认要 "' + text + '" "' + row.username + '" 用户吗?')
    // 发起修改状态
    await UserMainApi.updateUserMainStatus(row.id, status[row.status])
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    // row.status =
    //   row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserMainApi.exportUserMain(queryParams)
    download.excel(data, '用户数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserMainApi.deleteUserMain(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserMainApi.UserMainVO) => {
  try {
    // 重置的二次确认
    await message.delConfirm(
      `是否将账号【${row.username}】、昵称【${row.nickname}】的密码重置为“123456”？`
    )
    // 发起重置
    await UserMainApi.resetUserMainPassword(row.id, '123456')
    message.success('密码重置成功！')
  } catch {}
}

/** 初始化 */
onMounted(() => {
  tbMaxHeight.value = maxHeight.getHeight()
  getList()
})
</script>
