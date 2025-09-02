<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <Info v-if="isInfo" v-model="formData" />
    <Form v-model="formData" ref="formRef" v-else />
    <el-button type="primary" @click="editLine" :link="isInfo">{{ isInfo ? '查看逃生路线' : '添加逃生路线' }}</el-button>
    <Leader v-model="formData.directorList" :isInfo="isInfo" />
    <Materials v-model="formData.goodsList" :isInfo="isInfo" />
    <at-fixed-footer-btns v-if="!isInfo">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </at-fixed-footer-btns>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { Form, Info, Leader, Materials } from './components'
import { KeyAreaApi } from '@/api/Floodctrl/plan/keyarea'
const message = useMessage()
const router = useRouter()
const route = useRoute()
const isInfo = route.query.io === '1'
const id = route.query.id ? Number(route.query.id) : null
const formData = ref<any>({
  goodsList: [],
  directorList: [],
  route: ''
})
const formRef = ref()
const handleSave = () => {
  formRef.value.validate().then((data) => {
    let promise = KeyAreaApi.createKeyArea
    if (data.id)
      promise = KeyAreaApi.updateKeyArea
    promise(data).then((res) => {
      message.success('保存成功')
      if (!data.id) {
        formData.value = {}
        formData.value.goodsList = []
        formData.value.directorList = []
        formRef.value?.resetFields()
      }
    })
  }).catch((error) => {
    console.log('验证失败', error)
  })
}
const editLine = () => {
  if (id) {
    sessionStorage.setItem('plankeyinfo', JSON.stringify(formData.value))
  } else {
    sessionStorage.setItem('plankeyinfo', JSON.stringify(formRef.value.formData()))
  }
  router.push({
    path: '/plan/keylist/map',
    query: {
      io: route.query.io
    }
  })
}
const setPlankeyinfo = () => {
  if (sessionStorage.getItem('keylistadd')) {
    sessionStorage.removeItem('keylistadd')
  } else {
    let obj: any = sessionStorage.getItem('plankeyinfo')
    if (obj) {
      obj = JSON.parse(obj)
      for (const key in obj) {
        formData.value[key] = obj[key]
      }
    }
  }
}
onMounted(() => {
  if (id) {
    KeyAreaApi.getKeyArea(id).then((res) => {
      for (const key in res) {
        formData.value[key] = res[key]
      }
      setPlankeyinfo()
    })
  } else {
    setPlankeyinfo()
  }
})
</script>
<style lang="scss" scoped>
:deep(.at-table-operation) {
  margin-top: 18px;
}
</style>
