<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-info :config="infoConfig">
      <template #record>
        <at-table ref="atTableRef" v-model:params="queryParams" :config="tableConfig" />
      </template>
    </at-info>
  </ContentWrap>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Index' })
import * as UserApi from '@/api/system/user'
const infoConfig = reactive({
  formData: {},
  fields: {
    value: {
      label: '值班类型'
    },
    title: {
      components: 'title',
      label: '值班信息'
    },
    value1: {
      label: '值班日期',
      row: 8
    },
    value2: {
      label: '星期',
      row: 8
    },
    value3: {
      label: '天气预报情况',
      row: 8
    },
    value4: {
      label: '带班人',
      row: 8
    },
    value5: {
      label: '值班人员',
      row: 8
    },
    title1: {
      components: 'title',
      label: '值班记录'
    },
    record: {
      label: '值班记录'
    },
    title2: {
      components: 'title',
      label: '交班注意事项'
    },
    value6: {
      label: '注意事项'
    },
    title3: {
      components: 'title',
      label: '接班信息'
    },
    value11: {
      label: '接班日期',
      row: 8
    },
    value12: {
      label: '星期',
      row: 16
    },
    value14: {
      label: '带班人',
      row: 8
    },
    value15: {
      label: '接班人员',
      row: 8
    }
  }
})
const queryParams = reactive({})
const tableConfig = reactive({
  api: UserApi.getUserPage,
  height:'300px',
  fields: {
    value1: {
      label: '记录时间'
    },
    value2: {
      label: '值班记录情况'
    }
  }
})
</script>
