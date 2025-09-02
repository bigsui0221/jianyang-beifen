<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-table-search v-model="queryParams" :fields="queryFields" @search="handleSearch" />
    <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig">
      <template #operation="{ row }">
        <el-button link type="primary" @click="handleInfo(row)">详情</el-button>
        <!-- <el-button link type="primary" @click="handleWatch(row)">值班</el-button> -->
      </template>
    </at-table>
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { DutyLogApi } from '@/api/Floodctrl/dutylog'
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const atTableRef = ref()
const queryParams = reactive({})
const queryFields = reactive({
  fillTime: {
    label: '值班日期',
    components: 'date'
  },
  planUser: {
    label: '值班人员',
    components: 'select',
    options: [] as any
    // dictType: 'ai_platform'
  },
  // value4: {
  //   label: '值班类型',
  //   components: 'select',
  //   dictType: 'ai_platform'
  // }
})
const tableConfig = reactive({
  api: DutyLogApi.getDutyLogPage,
  fields: {
    index: true,
    fillTime: {
      label: '值班日期'
    },
    planUser: {
      label: '值班人员',
      options: [] as any
    },
    classLeader: {
      label: '带班人员',
      options: [] as any
    },
    operation: {
      label: '操作',
      width: '160',
      fixed: 'right'
    }
  }
})
const handleSearch = () => {
  atTableRef.value?.refresh()
}
const handleInfo = (row: any) => {
  router.push({
    path: '/Schedule/Center/add',
    query: {
      id: row.id
    }
  })
}
const handleWatch = (row: any) => {
  router.push({
    path: '/Schedule/Center/add',
  })
}
onMounted(() => { 
  UserApi.getSimpleUserList().then(res => {
    // userList.value = res
    const userList = res.map(item => { 
      return { 
        label: item.nickname,
        value: item.id
      }
    })
    tableConfig.fields.classLeader.options = userList
    tableConfig.fields.planUser.options = userList
    queryFields.planUser.options = userList
  })
})
</script>
