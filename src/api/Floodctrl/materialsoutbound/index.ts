import request from '@/config/axios'

// 物资出库管理 VO
export interface MaterialsOutboundVO {
  id: number // id自增
  outBatch: string // 出库批次
  applicantName: string // 申请人
  warehouseId: number // 仓库，关联floodctrl_warehouse表id
  handleUserId: number // 经手人，关联system_user表id
  outType: number // 出库类别，1：报废，2：救援
  outReason: string // 出库原因
  materialsId: number // 关联物资管理：floodctrl_materials表ID
  outNumber: number // 出库数量
}

// 物资出库管理 API
export const MaterialsOutboundApi = {
  // 查询物资出库管理分页
  getMaterialsOutboundPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials-outbound/page`, params })
  },

  // 查询物资出库管理详情
  getMaterialsOutbound: async (id: number) => {
    return await request.get({ url: `/floodctrl/materials-outbound/get?id=` + id })
  },

  // 新增物资出库管理
  createMaterialsOutbound: async (data: MaterialsOutboundVO) => {
    return await request.post({ url: `/floodctrl/materials-outbound/create`, data })
  },

  // 修改物资出库管理
  updateMaterialsOutbound: async (data: MaterialsOutboundVO) => {
    return await request.put({ url: `/floodctrl/materials-outbound/update`, data })
  },

  // 删除物资出库管理
  deleteMaterialsOutbound: async (id: number) => {
    return await request.delete({ url: `/floodctrl/materials-outbound/delete?id=` + id })
  },

  // 导出物资出库管理 Excel
  exportMaterialsOutbound: async (params) => {
    return await request.download({ url: `/floodctrl/materials-outbound/export-excel`, params })
  },
}