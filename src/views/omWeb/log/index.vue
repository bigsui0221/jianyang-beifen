<template>
  <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" />

  <ContentWrap
    id="page-search"
    :border="false"
    padding="0px"
    :body-style="{ padding: '24px 32px' }"
  >
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="操作模块" prop="operateModule">
        <el-input
          v-model="queryParams.operateModule"
          placeholder="请输入操作模块"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item label="操作人" prop="userId">
        <el-select
          v-model="queryParams.userId"
          clearable
          filterable
          placeholder="请选择操作人员"
          class="!w-240px"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="operateName">
        <el-input
          v-model="queryParams.operateName"
          placeholder="请输入描述"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item label="请求时间" prop="beginTime">
        <el-date-picker
          v-model="queryParams.beginTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"> 搜索</el-button>
        <el-button @click="resetQuery"> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap
    class="!mb-0"
    :border="false"
    padding="32px"
    :body-style="{ padding: '0' }"
    title="列表信息"
  >
    <template #header>
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
      <el-table-column label="时间" align="center" prop="beginTime" width="180">
        <template #default="scope">
          <span>{{ formatDate(scope.row.beginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP" align="center" prop="userIp" width="180" />
      <el-table-column label="操作模块" align="center" prop="operateModule" width="200" />
      <el-table-column label="操作人" align="center" prop="userName" width="200" />
      <el-table-column label="描述" align="center" prop="operateName" />
    </el-table>
    <!-- 分页组件 -->
    <Pagination
      margin="0"
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>
<script lang="ts" setup>
import download from '@/utils/download'
import { formatDate } from '@/utils/formatTime'
import * as ApiAccessLogApi from '@/api/infra/apiAccessLog'
import * as UserApi from '@/api/system/user'
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

defineOptions({ name: 'InfraApiAccessLog' })

const maxHeight = useMaxHeight({
  main: 'layout-main',
  subtract: [20, 'page-search', 15, 32, 57, 40, 'pagination', 32, 20]
})
const message = useMessage() // 消息弹窗

const tbMaxHeight = ref<number>(0)
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  operateModule: undefined,
  userId: undefined,
  operateName: undefined,
  applicationRealCode: 'system-server',
  beginTime: [
    formatDate(new Date(new Date().getTime() - 1 * 60 * 60 * 1000)),
    formatDate(new Date())
  ]
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ApiAccessLogApi.getApiAccessLogPage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ApiAccessLogApi.exportApiAccessLog(queryParams)
    download.excel(data, 'API 访问日志.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  tbMaxHeight.value = maxHeight.getHeight()
  getList()
  // 获得用户列表
  userList.value = await UserApi.getSimpleUserList()
})
</script>
