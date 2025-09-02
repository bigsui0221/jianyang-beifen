<template>
  <!-- 搜索工作栏 -->
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
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="部门状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择部门状态"
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
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
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
      <!-- <el-button
        type="primary"
        plain
        class="!p-16px pt-0 pb-0 !h-32px lh-32px !border-[var(--el-color-primary)]"
        style="--el-button-text-color: var(--el-color-primary)"
        v-hasPermi="['system:role:create']"
        @click="openForm('create')"
      >
        <Icon icon="ep:circle-plus" class="mr-7px" />新增
      </el-button> -->

      <el-button
        type="primary"
        plain
        class="!p-16px pt-0 pb-0 !h-32px lh-32px !border-[var(--el-color-primary)]"
        style="--el-button-text-color: var(--el-color-primary)"
        @click="openForm('create')"
        v-hasPermi="['system:dept:create']"
      >
        <Icon icon="ep:plus" class="mr-7px" /> 新增
      </el-button>
      <el-button type="danger" plain @click="toggleExpandAll">
        <Icon icon="ep:sort" class="mr-7px" /> 展开/折叠
      </el-button>

      <!-- <el-button
        v-hasPermi="['system:role:export']"
        :loading="exportLoading"
        class="!p-16px pt-0 pb-0 !h-32px lh-32px"
        plain
        type="success"
        @click="handleExport"
      >
        <Icon class="mr-5px" icon="ep:download" />
        导出
      </el-button> -->
    </template>
    <el-table
      :height="tbMaxHeight"
      v-loading="loading"
      :data="list"
      row-key="id"
      :default-expand-all="isExpandAll"
      v-if="refreshTable"
    >
      <el-table-column prop="name" label="部门名称" />
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="sort" label="备注" />
      <!-- <el-table-column prop="leader" label="负责人">
        <template #default="scope">
          {{ userList.find((user) => user.id === scope.row.leaderUserId)?.nickname }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="status" label="状态">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column> -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column width="156" label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:dept:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:dept:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <DeptForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import DeptForm from './DeptForm.vue'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'UserWebDept' })

const maxHeight = useMaxHeight({
  main: 'layout-main',
  subtract: [20, 'page-search', 15, 32, 57, 40, 32, 20]
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const tbMaxHeight = ref<number>(0)
const loading = ref(true) // 列表的加载中
const list = ref() // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  name: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const isExpandAll = ref(true) // 是否展开，默认全部展开
const refreshTable = ref(true) // 重新渲染表格状态
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 查询部门列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    list.value = handleTree(data)
  } finally {
    loading.value = false
  }
}

/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.pageNo = 1
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeptApi.deleteDept(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  tbMaxHeight.value = maxHeight.getHeight()
  await getList()
  // 获取用户列表
  userList.value = await UserApi.getSimpleUserList()
})
</script>
