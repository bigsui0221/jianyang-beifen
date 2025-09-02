<template>
  <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" />
  <doc-alert title="三方登陆" url="https://doc.iocoder.cn/social-user/" />
  <doc-alert title="Excel 导入导出" url="https://doc.iocoder.cn/excel-import-and-export/" />

  <el-row :gutter="20">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="h-1/1">
        <DeptTree @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
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
          <!-- <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-240px"
            />
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="handleQuery">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
            <!-- <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['system:user:create']"
            >
              <Icon icon="ep:plus" /> 新增
            </el-button>
            <el-button
              type="warning"
              plain
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >
              <Icon icon="ep:upload" /> 导入
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['system:user:export']"
            >
              <Icon icon="ep:download" />导出
            </el-button> -->
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
            v-hasPermi="['system:user:create']"
            @click="openForm('create')"
          >
            <Icon icon="ep:circle-plus" class="mr-7px" />新增
          </el-button>

          <el-button
            v-hasPermi="['system:user:export']"
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
          <el-table-column
            label="账号"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="昵称"
            align="center"
            prop="nickname"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="部门"
            align="center"
            key="deptName"
            prop="deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="角色" key="roleIds">
            <template #default="scope">
              {{ showRoleLabel(scope.row.roleIds) }}
            </template>
          </el-table-column>
          <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
          <el-table-column
            label="最后一次登录时间"
            align="center"
            prop="loginDate"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column label="最后一次登录IP" align="center" prop="loginIp" width="180" />
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
                <el-button
                  type="primary"
                  link
                  @click="openForm('update', scope.row.id)"
                  v-hasPermi="['system:user:update']"
                >
                  修改
                </el-button>
                <el-button
                  type="primary"
                  link
                  @click="handleResetPwd(scope.row)"
                  v-hasPermi="['system:user:update-password']"
                >
                  重置密码
                </el-button>
                <el-button
                  :type="{ 0: 'success', 1: 'info' }[scope.row.status]"
                  link
                  @click="handleStatusChange(scope.row)"
                  v-hasPermi="['system:user:update']"
                >
                  {{ scope.row.status !== CommonStatusEnum.ENABLE ? '停用' : '启用' }}
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleDelete(scope.row.id)"
                  v-hasPermi="['system:user:delete']"
                >
                  删除
                </el-button>
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
    </el-col>
  </el-row>

  <!-- 添加或修改用户对话框 -->
  <UserForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import * as RoleApi from '@/api/system/role'
import UserForm from './UserForm.vue'
import DeptTree from './DeptTree.vue'

defineOptions({ name: 'UserWebUser' })

const maxHeight = useMaxHeight({
  main: 'layout-main',
  subtract: [20, 'page-search', 15, 32, 57, 40, 'pagination', 32, 20]
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const roleList = ref<RoleApi.RoleVO[]>([])

const getSimpleRoleList = async () => {
  roleList.value = await RoleApi.getSimpleRoleList()
}

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
    const data = await UserApi.getUserPage(queryParams)
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

/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  queryParams.deptId = row.id
  await getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status !== CommonStatusEnum.ENABLE ? '启用' : '停用'
    const status = {
      0: 1,
      1: 0
    }
    await message.confirm('确认要 "' + text + '" "' + row.username + '" 用户吗?')
    // 发起修改状态
    await UserApi.updateUserStatus(row.id, status[row.status])
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
    const data = await UserApi.exportUser(queryParams)
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
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    // 重置的二次确认
    await message.delConfirm(
      `是否将账号【${row.username}】、昵称【${row.nickname}】的密码重置为“123456”？`
    )
    // 发起重置
    await UserApi.resetUserPassword(row.id, '123456')
    message.success('密码重置成功！')
  } catch {}
}

/** 显示角色 */
const showRoleLabel = (postIds: number[]) => {
  const showRoleList = roleList.value.filter((role: RoleApi.RoleVO) => {
    return postIds?.some((r: number) => r === role.id)
  })
  const roleNames = showRoleList.map((role) => role.name).join(' | ')
  return roleNames || '无角色'
}
/** 初始化 */
onMounted(() => {
  getSimpleRoleList()
  tbMaxHeight.value = maxHeight.getHeight()
  getList()
})
</script>
