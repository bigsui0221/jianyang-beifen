import request from '@/config/axios'

// 报警记录 VO
export interface AlarmListVO {
  id: number // id自增
  alarmId: number // 报警id
  alarmName: string // 报警名称
  siteId: number // 所属站点，关联站点floodctrl_site表id
  status: number // 报警状态，0：待处理，1：已接收  2：已忽略
  scadaPointId: number // 物联网设备点位id
  startTime: Date // 报警时间
  alarmRuleType: number // 报警规则,1:floodctrl_alarm_rule需要time_hour_number字段,2:floodctrl_alarm_rule不需要time_hour_number字段
  alarmLevel: string // 报警等级,字典：fx_alarm_level
  endTime: Date // 结束时间
  alarmValue: number // 报警上限
  collectValue: number // 采集值
}

// 报警记录 API
export const AlarmListApi = {
  // 查询报警记录分页
  getAlarmListPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/alarm-list/page`, params })
  },

  // 查询报警记录详情
  getAlarmList: async (id: number) => {
    return await request.get({ url: `/floodctrl/alarm-list/get?id=` + id })
  },

  // 新增报警记录
  createAlarmList: async (data: AlarmListVO) => {
    return await request.post({ url: `/floodctrl/alarm-list/create`, data })
  },

  // 修改报警记录
  updateAlarmList: async (data: AlarmListVO) => {
    return await request.put({ url: `/floodctrl/alarm-list/update`, data })
  },

  // 删除报警记录
  deleteAlarmList: async (id: number) => {
    return await request.delete({ url: `/floodctrl/alarm-list/delete?id=` + id })
  },

  // 导出报警记录 Excel
  exportAlarmList: async (params) => {
    return await request.download({ url: `/floodctrl/alarm-list/export-excel`, params })
  },
}