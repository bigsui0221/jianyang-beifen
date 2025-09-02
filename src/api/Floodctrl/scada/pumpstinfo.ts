import request from '@/config/axios'

// 泵站工程信息 VO
export interface PumpStInfoVO {
  id: number // ID
  code: string // 泵站编码
  name: string // 泵站名称
  wtwkName: string // 水厂名称（waterworks）
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  pumpModel: string // 泵站型号
  pumpScale: string // 泵站规模
  buildTime: Date // 建设年份
  operateUnit: string // 运行/管理单位
  operatePerson: string // 运行/管理单位负责人
  operatePhone: string // 运行/管理单位负责人电话
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 泵站工程信息 API
export const PumpStInfoApi = {
  // 查询泵站工程信息分页
  getPumpStInfoPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/pump-st-info/page`, params })
  },

  // 查询泵站工程信息详情
  getPumpStInfo: async (id: number) => {
    return await request.get({ url: `/floodctrl/pump-st-info/get?id=` + id })
  },

  // 新增泵站工程信息
  createPumpStInfo: async (data: PumpStInfoVO) => {
    return await request.post({ url: `/floodctrl/pump-st-info/create`, data })
  },

  // 修改泵站工程信息
  updatePumpStInfo: async (data: PumpStInfoVO) => {
    return await request.put({ url: `/floodctrl/pump-st-info/update`, data })
  },

  // 删除泵站工程信息
  deletePumpStInfo: async (id: number) => {
    return await request.delete({ url: `/floodctrl/pump-st-info/delete?id=` + id })
  },

  // 导出泵站工程信息 Excel
  exportPumpStInfo: async (params) => {
    return await request.download({ url: `/floodctrl/pump-st-info/export-excel`, params })
  },
}
