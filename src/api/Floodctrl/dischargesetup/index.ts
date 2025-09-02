import request from '@/config/axios'

// 水位流量管理 VO
export interface DischargeSetupVO {
  id: number // id自增
  siteId: number // 站点，关联floodctrl_site表id
  dischargeComputeType: number // 计算方法，1:经验似和与理论约束结合
  sectionalArea: number // 断面面积㎡
  waterSurfaceGradient: number // 水面比降
  roughness: number // 糙率
}

// 水位流量管理 API
export const DischargeSetupApi = {
  // 查询水位流量管理分页
  getDischargeSetupPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/discharge-setup/page`, params })
  },

  // 查询水位流量管理详情
  getDischargeSetup: async (id: number) => {
    return await request.get({ url: `/floodctrl/discharge-setup/get?id=` + id })
  },

  // 新增水位流量管理
  createDischargeSetup: async (data: DischargeSetupVO) => {
    return await request.post({ url: `/floodctrl/discharge-setup/create`, data })
  },

  // 修改水位流量管理
  updateDischargeSetup: async (data: DischargeSetupVO) => {
    return await request.put({ url: `/floodctrl/discharge-setup/update`, data })
  },

  // 删除水位流量管理
  deleteDischargeSetup: async (id: number) => {
    return await request.delete({ url: `/floodctrl/discharge-setup/delete?id=` + id })
  },

  // 导出水位流量管理 Excel
  exportDischargeSetup: async (params) => {
    return await request.download({ url: `/floodctrl/discharge-setup/export-excel`, params })
  },
}