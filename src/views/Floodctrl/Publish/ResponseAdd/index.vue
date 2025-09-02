<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <at-form ref="atFormRef" :config="formConfig">
      <template #noticeCheck>
        <el-checkbox-group class="notice-check-group" v-model="formConfig.formData.noticeCheck" label="通知方式">
          <el-checkbox label="1">站内信</el-checkbox>
          <el-select v-if="formConfig.formData?.noticeCheck?.includes('1')"
            v-model="formConfig.formData.notifyUserIdList" multiple collapse-tags collapse-tags-tooltip
            placeholder="请选择">
            <el-option v-for="item in notifyUserList" :key="item.id" :label="item.deptName + '-' + item.nickname"
              :value="item.id" />
          </el-select>
          <el-checkbox label="2">短信</el-checkbox>
          <el-select v-if="formConfig.formData?.noticeCheck?.includes('2')" v-model="formConfig.formData.msgUserIdList"
            multiple collapse-tags collapse-tags-tooltip placeholder="请选择">
            <el-option v-for="item in notifyUserList" :key="item.id" :label="item.deptName + '-' + item.nickname"
              :value="item.id" />
          </el-select>
          <el-checkbox label="3">传真</el-checkbox>
        </el-checkbox-group>
      </template>
    </at-form>
    <at-fixed-footer-btns>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </at-fixed-footer-btns>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { DisasterResponseApi } from '@/api/Floodctrl/publish/disasterresponse'
import { getSimpleUserList } from '@/api/system/user'
const message = useMessage()
const atFormRef = ref()
const formConfig = reactive({
  formData: {} as any,
  fields: {
    type: {
      label: '响应类型',
      components: 'radioButton',
      required: true,
      options: [
        {
          value: '1',
          label: '防汛响应'
        },
        {
          value: '2',
          label: '抗旱响应'
        }
      ],
      onChange: (val) => {
        if (val === '1') {
          formConfig.fields.disType.dictType = 'fx_disaster_wea_type'
        }
        if (val === '2') {
          formConfig.fields.disType.dictType = 'fx_disaster_dis_type'
        }
      }
    },
    title1: {
      components: 'title',
      label: '响应信息'
    },
    disType: {
      label: '灾害类型',
      components: 'select',
      dictType: 'fx_disaster_dis_type ',
      required: true,
      row: 12
    },
    deptId: {
      label: '响应区域',
      components: 'select',
      required: true,
      row: 12
    },
    level: {
      label: '响应等级',
      components: 'select',
      dictType: 'fx_disaster_response_level',
      required: true,
      row: 12
    },
    responseType: {
      label: '响应状态',
      components: 'select',
      dictType: 'fx_disaster_response_type',
      required: true,
      row: 12
    },
    name: {
      label: '响应标题',
      components: 'input',
      required: true
    },
    publishTimeValue: {
      label: '发布日期',
      components: 'date',
      required: true,
      row: 12,
      onChange: (val) => {
        formConfig.formData.publishTime = new Date(val).getTime()
      }
    },
    time: {
      label: '响应时间',
      components: 'date',
      type: 'datetimerange',
      required: true,
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      row: 12,
      onChange: (val) => {
        formConfig.formData.startTime = new Date(val[0]).getTime()
        formConfig.formData.endTime = new Date(val[1]).getTime()
      }
    },
    files: {
      label: '附件',
      components: 'uploadFile'
    },
    title2: {
      components: 'title',
      label: '响应发布'
    },
    content: {
      label: '响应内容',
      components: 'editor',
      required: true,
    },
    remark: {
      label: '备注',
      components: 'input',
      type: 'textarea'
    },
    title3: {
      components: 'title',
      label: '通知'
    },
    noticeCheck: {
      components: 'checkbox',
    }
  }
})
const handleSave = () => {
  atFormRef.value.validate().then((data) => {
    DisasterResponseApi.createDisasterResponse(data).then((res) => {
      message.success('保存成功')
      atFormRef.value?.resetFields()
    })
  })
}
const notifyUserList = ref<any>([])
const getNotifyUserList = () => {
  getSimpleUserList().then((res) => {
    notifyUserList.value = res
  })
}
onMounted(() => {
  getNotifyUserList()
})
</script>
<style lang="scss" scoped>
.notice-check-group {
  display: flex;
  align-items: center;

  .el-select {
    width: 200px;
    margin-right: 30px
  }
}
</style>