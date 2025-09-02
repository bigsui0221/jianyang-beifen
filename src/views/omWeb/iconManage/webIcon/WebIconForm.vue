<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="图标名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入图标名称" />
      </el-form-item>
      <el-form-item label="图标" prop="url">
        <UploadImg v-model="formData.url" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as IconLibraryApi from '@/api/omWeb/iconLibrary'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'OmWebAppManageWebAppForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: Number(undefined),
  name: '',
  url: '',
  type: '1'
})
const formRules = reactive({
  name: [{ required: true, message: '图标名称不能为空', trigger: 'blur' }],
  url: [{ required: true, message: '图标不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, row?: IconLibraryApi.IconLibraryVO) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (row) {
    formData.value = unref(cloneDeep(row))
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: Number(undefined),
    name: '',
    url: '',
    type: '1'
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as IconLibraryApi.IconLibraryVO
    if (formType.value === 'create') {
      await IconLibraryApi.createIconLibrary(data)
      message.success(t('common.createSuccess'))
    } else {
      await IconLibraryApi.updateIconLibrary(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
