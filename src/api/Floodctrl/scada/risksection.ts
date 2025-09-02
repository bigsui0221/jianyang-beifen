import request from '@/config/axios'

// 险工险段信息 VO
export interface RiskSectionVO {
  id: number // ID
  code: string // 工程编码
  name: string // 工程名称
  riverName: string // 所属河流/流域
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 险工险段信息 API
export const RiskSectionApi = {
  // 查询险工险段信息分页
  getRiskSectionPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/risk-section/page`, params })
  },

  // 查询险工险段信息详情
  getRiskSection: async (id: number) => {
    return await request.get({ url: `/floodctrl/risk-section/get?id=` + id })
  },

  // 新增险工险段信息
  createRiskSection: async (data: RiskSectionVO) => {
    return await request.post({ url: `/floodctrl/risk-section/create`, data })
  },

  // 修改险工险段信息
  updateRiskSection: async (data: RiskSectionVO) => {
    return await request.put({ url: `/floodctrl/risk-section/update`, data })
  },

  // 删除险工险段信息
  deleteRiskSection: async (id: number) => {
    return await request.delete({ url: `/floodctrl/risk-section/delete?id=` + id })
  },

  // 导出险工险段信息 Excel
  exportRiskSection: async (params) => {
    return await request.download({ url: `/floodctrl/risk-section/export-excel`, params })
  },
}
