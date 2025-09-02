import request from '@/config/axios'

// 自动告警人员 VO
export interface AutoAlarmUserVO {
  id: number // id自增
  userName: string // 名称
  userPhone: string // 接收告警手机号码
  post: string // 接收告警人员职位
}

// 自动告警人员 API
export const AutoAlarmUserApi = {
  // 查询自动告警人员分页
  getAutoAlarmUserPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/auto-alarm-user/page`, params })
  },

  // 查询自动告警人员详情
  getAutoAlarmUser: async (id: number) => {
    return await request.get({ url: `/floodctrl/auto-alarm-user/get?id=` + id })
  },

  // 新增自动告警人员
  createAutoAlarmUser: async (data: AutoAlarmUserVO) => {
    return await request.post({ url: `/floodctrl/auto-alarm-user/create`, data })
  },

  // 修改自动告警人员
  updateAutoAlarmUser: async (data: AutoAlarmUserVO) => {
    return await request.put({ url: `/floodctrl/auto-alarm-user/update`, data })
  },

  // 删除自动告警人员
  deleteAutoAlarmUser: async (id: number) => {
    return await request.delete({ url: `/floodctrl/auto-alarm-user/delete?id=` + id })
  },

  // 导出自动告警人员 Excel
  exportAutoAlarmUser: async (params) => {
    return await request.download({ url: `/floodctrl/auto-alarm-user/export-excel`, params })
  },
}