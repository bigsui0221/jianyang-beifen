import request from '@/config/axios'

// 灾害预警通知人 VO
export interface DisasterNotifyUserVO {
  id: number // ID
  mainId: number // 预警/响应id
  type: string // 类型 1预警 2响应
  userId: string // 通知用户id
  notifyType: string // 通知类型 1站内信 2短信 3传真 
  status: number // 1发送成功 2发送失败
}

// 灾害预警通知人 API
export const DisasterNotifyUserApi = {
  // 查询灾害预警通知人分页
  getDisasterNotifyUserPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/disaster-notify-user/page`, params })
  },

  // 查询灾害预警通知人详情
  getDisasterNotifyUser: async (id: number) => {
    return await request.get({ url: `/floodctrl/disaster-notify-user/get?id=` + id })
  },

  // 新增灾害预警通知人
  createDisasterNotifyUser: async (data: DisasterNotifyUserVO) => {
    return await request.post({ url: `/floodctrl/disaster-notify-user/create`, data })
  },

  // 修改灾害预警通知人
  updateDisasterNotifyUser: async (data: DisasterNotifyUserVO) => {
    return await request.put({ url: `/floodctrl/disaster-notify-user/update`, data })
  },

  // 删除灾害预警通知人
  deleteDisasterNotifyUser: async (id: number) => {
    return await request.delete({ url: `/floodctrl/disaster-notify-user/delete?id=` + id })
  },

  // 导出灾害预警通知人 Excel
  exportDisasterNotifyUser: async (params) => {
    return await request.download({ url: `/floodctrl/disaster-notify-user/export-excel`, params })
  },
}
