<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用标识" prop="code">
        <el-input v-model="formData.code" placeholder="请输入应用标识" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="orderNum">
        <el-input v-model="formData.orderNum" placeholder="请输入显示顺序" />
      </el-form-item>
      <el-form-item label="应用入口" prop="url">
        <el-input v-model="formData.url" placeholder="请输入应用入口" />
      </el-form-item>
      <el-form-item label="接口文档" prop="apiUrl">
        <el-input v-model="formData.apiUrl" placeholder="请输入接口文档" />
      </el-form-item>
      <el-form-item label="图标" prop="iconId">
        <IconSelect v-model="formData.iconId" type="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as ApplicationApi from '@/api/omWeb/application'
import IconSelect from './IconSelect.vue'

defineOptions({ name: 'OmWebAppManageWebAppForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  code: '',
  orderNum: undefined,
  url: '',
  apiUrl: '',
  iconId: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '应用标识不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
  url: [{ required: true, message: '应用入口不能为空', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '接口文档不能为空', trigger: 'blur' }],
  iconId: [{ required: false, message: '图标不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ApplicationApi.getApplication(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    orderNum: undefined,
    url: '',
    apiUrl: '',
    iconId: undefined
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
    const data = formData.value as unknown as ApplicationApi.ApplicationVO
    if (formType.value === 'create') {
      await ApplicationApi.createApplication(data)
      message.success(t('common.createSuccess'))
    } else {
      await ApplicationApi.updateApplication(data)
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
