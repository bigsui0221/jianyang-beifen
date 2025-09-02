<template>
  <doc-alert title="功能权限" url="https://doc.iocoder.cn/resource-permission" />
  <doc-alert title="数据权限" url="https://doc.iocoder.cn/data-permission" />

  <ContentWrap
    id="page-search"
    :border="false"
    padding="0px"
    :body-style="{ padding: '24px 32px' }"
  >
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
      @submit.prevent
    >
      <el-form-item label="应用名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入应用名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery"> 搜索 </el-button>
        <el-button @click="resetQuery"> 重置 </el-button>
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
        type="primary"
        plain
        class="!p-16px pt-0 pb-0 !h-32px lh-32px !border-[var(--el-color-primary)]"
        style="--el-button-text-color: var(--el-color-primary)"
        @click="openForm('create')"
      >
        <Icon icon="ep:circle-plus" class="mr-7px" />新增
      </el-button>
    </template>
    <el-table :height="tbMaxHeight" v-loading="loading" :data="list">
      <el-table-column align="center" label="应用名称" prop="name" />
      <el-table-column align="center" label="应用标识" prop="code" />
      <el-table-column align="center" label="排序" prop="orderNum" />
      <el-table-column label="应用入口" align="center" prop="url" />
      <el-table-column align="center" label="接口文档" prop="apiUrl" />
      <el-table-column align="center" label="图标" prop="iconId" width="100">
        <template #default="scope">
          <img
            height="64px"
            filter="cover"
            :src="iconList.find((icon) => icon.id === scope.row.iconId)?.url"
            class="rounded-4px"
          />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column width="184" align="center" label="操作" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button
            link
            preIcon="ep:basketball"
            title="菜单配置"
            type="primary"
            @click="openAssignMenuForm(scope.row)"
          >
            菜单配置
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      margin="0"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <WebAppForm ref="formRef" @success="getList" />

  <el-drawer v-model="menuDrawer" size="80%" :with-header="false" :destroy-on-close="true">
    <Menu :applicationId />
  </el-drawer>
</template>
<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as ApplicationApi from '@/api/omWeb/application'
import * as IconLibraryApi from '@/api/omWeb/iconLibrary'
import WebAppForm from './WebAppForm.vue'
import Menu from './Menu/index.vue'
const iconList = ref<IconLibraryApi.IconLibraryVO[]>([])

defineOptions({ name: 'OmWebAppManageWebApp' })

const maxHeight = useMaxHeight({
  main: 'layout-main',
  subtract: [20, 'page-search', 15, 32, 57, 40, 'pagination', 32, 20]
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const tbMaxHeight = ref<number>(0)
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: '',
  name: '',
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

const menuDrawer = ref(false) // 菜单抽屉
const applicationId = ref<number | undefined>(undefined)

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ApplicationApi.getApplicationPage(queryParams)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 菜单权限操作 */
const openAssignMenuForm = async (row: ApplicationApi.ApplicationVO) => {
  applicationId.value = row.id
  menuDrawer.value = true
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ApplicationApi.deleteApplication(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  tbMaxHeight.value = maxHeight.getHeight()
  iconList.value = await IconLibraryApi.getIconLibraryWebList()
  getList()
})
</script>
