<template>
  <ContentWrap :border="false" padding="12px 20px 20px 20px" :body-style="{ padding: '0' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <TableReport v-if="activeTab === '0'"/>
    <TableFile v-if="activeTab === '1'" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { TableReport, TableFile, TableTask, DeptTree } from '../components'
const route = useRoute()
const active = route.query.a
const tabs = ref([
  {
    label: '信息上报',
    value: '0'
  },
  {
    label: '文件交换',
    value: '1',
    // number: 999
  }
])
const activeTab = ref((active || '0') as string)
</script>
