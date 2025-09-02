<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <el-button type="primary" @click="back" class="mb-10">返回</el-button>
    <Info v-if="isInfo" v-model="formData" />
    <!-- <Form v-model="formData" ref="formRef" /> -->
    <el-tabs
      v-model="activeName"
      type="card"
      class="demo-tabs"
      @tab-click="handleClick"
      v-if="isInfo"
    >
      <el-tab-pane label="入库记录" name="first">
        <Leader v-model="insidedata" :isInfo="isInfo"/>
      </el-tab-pane>
      <el-tab-pane label="出库记录" name="second">
        <Materials v-model="outdata" :isInfo="isInfo" />
      </el-tab-pane>
    </el-tabs>
    <Leader v-model="insidedata" :isInfo="isInfo" v-if="!isInfo && isinside"/>
    <Materials v-model="outdata" :isInfo="isInfo" v-if="!isInfo && !isinside"/>
    <!-- <Line v-model="formData.line" :isInfo="isInfo" /> -->
    <at-fixed-footer-btns v-if="!isInfo">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </at-fixed-footer-btns>
  </ContentWrap>
</template>

<script lang="ts" setup>


import { Form, Info, Leader, Line, Materials } from './components'
import { MaterialsTypeApi } from '@/api/Floodctrl/materialstype'
import { MaterialsApi } from '@/api/Floodctrl/materials'
import type { TabsPaneContext } from 'element-plus'

const activeName = ref('first')


const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
const route = useRoute()
const router = useRouter()
const isInfo = route.query.io === '1'
const isinside = route.query.rr === '1'
const formData = reactive({} as any)
const insidedata = reactive([] as any)
const outdata = reactive([] as any)

const formRef = ref()
const handleSave = () => {
  console.log(formData)
  formRef.value.validate().then((data) => {
    console.log('验证通过', data)
  }).catch((error) => {
    console.log('验证失败', error)
  })
}
const back = () => {
  router.back()
}
onBeforeMount(() => {
  const id = Number(route.query.id)
  if(id){
    MaterialsTypeApi.getMaterialsType(id).then((res) => {
      console.log(res)
      Object.assign(formData, res)
    })
  }
  MaterialsApi.getMaterialsPage({
    materialsTypeId: id ? id :''
  }).then((res) => {
    
    console.log(res)
    Object.assign(insidedata, res.list)
    
  })
})
</script>
