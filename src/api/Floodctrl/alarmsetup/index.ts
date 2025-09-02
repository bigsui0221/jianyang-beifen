import request from '@/config/axios'

// 报警设置 VO
export interface AlarmSetupVO {
  id: number // id自增
  alarmName: string // 报警名称
  siteId: number // 所属站点，关联站点floodctrl_site表id
  runStatus: number // 报警状态，0：停用，1：启用
  phoneMessageType: number // 短信通知,1:组织结构,2:自定义告警人员
  alarmRuleType: number // 报警规则,1:floodctrl_alarm_rule需要time_hour_number字段,2:floodctrl_alarm_rule不需要time_hour_number字段
}

// 报警设置 API
export const AlarmSetupApi = {
  // 查询报警设置分页
  getAlarmSetupPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/alarm-setup/page`, params })
  },

  // 查询报警设置详情
  getAlarmSetup: async (id: number) => {
    return await request.get({ url: `/floodctrl/alarm-setup/get?id=` + id })
  },

  // 新增报警设置
  createAlarmSetup: async (data: AlarmSetupVO) => {
    return await request.post({ url: `/floodctrl/alarm-setup/create`, data })
  },

  // 修改报警设置
  updateAlarmSetup: async (data: AlarmSetupVO) => {
    return await request.put({ url: `/floodctrl/alarm-setup/update`, data })
  },

  // 删除报警设置
  deleteAlarmSetup: async (id: number) => {
    return await request.delete({ url: `/floodctrl/alarm-setup/delete?id=` + id })
  },

  // 导出报警设置 Excel
  exportAlarmSetup: async (params) => {
    return await request.download({ url: `/floodctrl/alarm-setup/export-excel`, params })
  },
}