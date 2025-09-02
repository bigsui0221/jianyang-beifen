import request from '@/config/axios'

// 预警记录 VO
export interface WarningPreInfoVO {
  id: number // id自增
  configId: number // 配置id
  name: string // 预警名称
  siteId: number // 所属站点，关联站点floodctrl_site表id
  scadaPointId: number // 物联网设备点位id
  status: number // 报警状态，0：待处理，1：已处理  2：已忽略
  warnLevel: string // 报警等级,字典：fx_warn_level
  warnValue: number // 报警上限
  collectValue: number // 预警值
  startTime: Date // 预警时间
  endTime: Date // 结束时间
  processUser: number // 处理人
}

// 预警记录 API
export const WarningPreInfoApi = {
  // 查询预警记录分页
  getWarningPreInfoPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/warning-pre-info/page`, params })
  },

  // 查询预警记录详情
  getWarningPreInfo: async (id: number) => {
    return await request.get({ url: `/floodctrl/warning-pre-info/get?id=` + id })
  },

  // 新增预警记录
  createWarningPreInfo: async (data: WarningPreInfoVO) => {
    return await request.post({ url: `/floodctrl/warning-pre-info/create`, data })
  },

  // 修改预警记录
  updateWarningPreInfo: async (data: WarningPreInfoVO) => {
    return await request.put({ url: `/floodctrl/warning-pre-info/update`, data })
  },

  // 删除预警记录
  deleteWarningPreInfo: async (data: any) => {
    return await request.delete({ url: `/floodctrl/warning-pre-info/delete`,data  })
  },
  // 修改预警记录
  putWarningPreIgnore: async (data: any) => {
    return await request.put({ url: `/floodctrl/warning-pre-info/ignore`, data })
  },
  // 导出预警记录 Excel
  exportWarningPreInfo: async (params) => {
    return await request.download({ url: `/floodctrl/warning-pre-info/export-excel`, params })
  },
}
