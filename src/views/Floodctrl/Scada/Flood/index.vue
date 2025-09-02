<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <TabFlood v-if="activeTab === '0'" />
    <TabProject v-if="activeTab === '1'" />
    <TabRepair v-if="activeTab === '2'" />
    <TabRisk v-if="activeTab === '3'" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { TabFlood, TabProject, TabRepair, TabRisk } from './components'
const tabs = ref([
  {
    label: '防洪工程',
    value: '0'
  },
  {
    label: '险工险段',
    value: '1'
  },
  {
    label: '水毁修复',
    value: '2'
  },
  {
    label: '风险点',
    value: '3'
  }
])
const activeTab = ref('0')
</script>
