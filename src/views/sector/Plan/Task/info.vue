<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <at-info :config="infoConfig" v-if="activeTab === '0'" />
    <at-table :config="tableConfig1" v-if="activeTab === '1'" />
    <el-steps direction="vertical" :active="1" v-if="activeTab === '2'">
      <el-step title="Step 1" />
      <el-step title="Step 2" />
      <el-step title="Step 3" />
    </el-steps>
    <at-table :config="tableConfig3" v-if="activeTab === '3'" />
    <at-table :config="tableConfig4" v-if="activeTab === '4'" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
const tabs = ref([
  {
    label: '基本信息',
    value: '0'
  },
  {
    label: '预案信息',
    value: '1'
  },
  {
    label: '流程节点',
    value: '2'
  },
  {
    label: '督办',
    value: '3'
  },
  {
    label: '协同',
    value: '4'
  }
])
const activeTab = ref('0')
const infoConfig = reactive({
  formData: {},
  fields: {
    title: {
      label: '任务信息',
      components: 'title'
    },
    value: {
      label: '任务名称',
      row: 8
    },
    value1: {
      label: '所属街道',
      row: 8
    },
    value01: {
      label: '创建时间',
      row: 8
    },
    value7: {
      label: '地址',
    },
    value2: {
      label: '测站名称',
      row: 8
    },
    value9: {
      label: '风险点',
      row: 8
    },
    value8: {
      label: '应急等级',
      row: 8
    },
    value03: {
      label: '任务描述'
    },
    title2: {
      label: '耗时',
      components: 'title'
    },
    value4: {
      label: '接收时间',
      row: 12
    },
    value5: {
      label: '工单负责人',
      row: 12
    },
    value3: {
      label: '处理时限',
      row: 12
    },
    value6: {
      label: '耗时',
      row: 12
    },
    title3: {
      label: '处理过程',
      components: 'title'
    },
    value06: {
      label: '完成时间',
      row: 12
    },
    value10: {
      label: '使用物资',
      row: 12
    },
    value07: {
      label: '处置人员',
      row: 12
    },
    value08: {
      label: '处置工艺',
      row: 12
    },
    value09: {
      label: '备注',
      row: 24
    },
  }
})
const tableConfig1 = reactive({
  api: UserApi.getUserPage,
  fields: {
    value1: {
      label: '预警时间'
    },
    value2: {
      label: '预警名称'
    },
    value3: {
      label: '预警等级'
    },
  }
})
const tableConfig3 = reactive({
  api: UserApi.getUserPage,
  fields: {
    value1: {
      label: '督办时间'
    },
    value2: {
      label: '督办人'
    },
    value3: {
      label: '督办内容'
    },
  }
})
const tableConfig4 = reactive({
  api: UserApi.getUserPage,
  fields: {
    value1: {
      label: '协同时间'
    },
    value2: {
      label: '问题'
    },
    value3: {
      label: '回复'
    }, 
    value4: {
      label: '回复时间'
    },
    value5: {
      label: '回复单位'
    },
  }
})
</script>
