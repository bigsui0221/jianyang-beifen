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
      <el-form-item label="图标名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入图标名称"
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
      <el-button
        type="danger"
        plain
        class="!p-16px pt-0 pb-0 !h-32px lh-32px"
        :disabled="selectedIds.length === 0"
        @click="handleDelete()"
        ><Icon icon="ep:delete" class="mr-7px" /> 删除
      </el-button>
    </template>
    <el-table
      :height="tbMaxHeight"
      v-loading="loading"
      :data="list"
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :reserve-selection="true" width="55" />
      <el-table-column align="center" label="图标名称" prop="name" />
      <el-table-column align="center" label="图标" prop="url">
        <template #default="scope">
          <el-image style="width: 100px; height: 100px" :src="scope.row.url" fit="cover" />
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
          <el-button link type="primary" @click="openForm('update', scope.row)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)"> 删除 </el-button>
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
  <MenuIconForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as IconLibraryApi from '@/api/omWeb/iconLibrary'
import MenuIconForm from './MenuIconForm.vue'

defineOptions({ name: 'OmWebIconManageWebIcon' })

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
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  type: '2'
})
const queryFormRef = ref() // 搜索的表单

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await IconLibraryApi.getIconLibraryPage(queryParams)
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
const openForm = (type: string, row?: IconLibraryApi.IconLibraryVO) => {
  formRef.value.open(type, row)
}

/** 删除按钮操作 */
const handleDelete = async (row?: IconLibraryApi.IconLibraryVO) => {
  try {
    // 删除的二次确认
    await message.delConfirm(
      row ? `是否确认删除图标【${row.name}】？` : '是否确认删除选中的图标库？'
    )
    if (row) {
      await IconLibraryApi.deleteIconLibrary([row.id])
    } else {
      await IconLibraryApi.deleteIconLibrary(selectedIds.value)
    }
    // 发起删除
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 当表格选择项发生变化时会触发该事件  */
const handleSelectionChange = (array: IconLibraryApi.IconLibraryVO[]) => {
  selectedIds.value = []
  if (!array) {
    return
  }
  array.forEach((row) => selectedIds.value.push(row.id))
}

/** 初始化 **/
onMounted(() => {
  tbMaxHeight.value = maxHeight.getHeight()
  getList()
})
</script>
