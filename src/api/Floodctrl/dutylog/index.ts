import request from '@/config/axios'

// 值班日志 VO
export interface DutyLogVO {
  id: number // id自增
  fillTime: string // 填报时间
  regionId: number // 所属行政区域，关联floodctrl_region表id
  classLeader: string // 带班人
  planUser: string // 值班人员，逗号隔开
  floodPreventionResNumber: number // 防汛响应数
  disasterWarningNumber: number // 山洪灾害预警数
  disasterPersionTransfer: number // 山洪灾害人员转移情况：1：有，0：无
  household: number // 转移户
  people: number // 转移人
  returnVehicles: number // 劝返车辆
  returnTourists: number // 劝返游客
  waterlogging: number // 内涝情况：1：有，0：无
  unWaterNumber: number // 未消退水位数
  reWaterNumber: number // 已消退水位数
  importantEvents: string // 重要事件
}

// 值班日志 API
export const DutyLogApi = {
  // 查询值班日志分页
  getDutyLogPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/duty-log/page`, params })
  },

  // 查询值班日志详情
  getDutyLog: async (id: number) => {
    return await request.get({ url: `/floodctrl/duty-log/get?id=` + id })
  },

  // 新增值班日志
  createDutyLog: async (data: DutyLogVO) => {
    return await request.post({ url: `/floodctrl/duty-log/create`, data })
  },

  // 修改值班日志
  updateDutyLog: async (data: DutyLogVO) => {
    return await request.put({ url: `/floodctrl/duty-log/update`, data })
  },

  // 删除值班日志
  deleteDutyLog: async (id: number) => {
    return await request.delete({ url: `/floodctrl/duty-log/delete?id=` + id })
  },

  // 导出值班日志 Excel
  exportDutyLog: async (params) => {
    return await request.download({ url: `/floodctrl/duty-log/export-excel`, params })
  },
}