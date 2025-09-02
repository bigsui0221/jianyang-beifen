<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <TabStation v-if="activeTab === '0'" />
    <TabGate v-if="activeTab === '1'" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { TabStation, TabGate } from './components'
const tabs = ref([
  {
    label: '泵站工程',
    value: '0'
  },
  {
    label: '水闸',
    value: '1'
  },
])
const activeTab = ref('0')
</script>
