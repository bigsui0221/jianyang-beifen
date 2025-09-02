import request from '@/config/axios'

// 仓库管理 VO
export interface WarehouseVO {
  id: number // id自增
  warehouseName: string // 仓库名称
  regionId: number // 关联floodctrl_region表id
  contactsUserId: number // 联系人,关联system_user表id
  perionChargeUserId: number // 负责人,关联system_user表id
  longitude: number // 仓库地址经度
  latitude: number // 仓库地址纬度
  mapAddress: string // 经纬度地址文字
  address: string // 仓库详细地址
  noticeMethod: number // 通知方式，1：站内信，2：短信
}

// 仓库管理 API
export const WarehouseApi = {
  // 查询仓库管理分页
  getWarehousePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/warehouse/page`, params })
  },

  // 查询仓库管理详情
  getWarehouse: async (id: number) => {
    return await request.get({ url: `/floodctrl/warehouse/get?id=` + id })
  },

  // 新增仓库管理
  createWarehouse: async (data: WarehouseVO) => {
    return await request.post({ url: `/floodctrl/warehouse/create`, data })
  },

  // 修改仓库管理
  updateWarehouse: async (data: WarehouseVO) => {
    return await request.put({ url: `/floodctrl/warehouse/update`, data })
  },

  // 删除仓库管理
  deleteWarehouse: async (id: number) => {
    return await request.delete({ url: `/floodctrl/warehouse/delete?id=` + id })
  },

  // 导出仓库管理 Excel
  exportWarehouse: async (params) => {
    return await request.download({ url: `/floodctrl/warehouse/export-excel`, params })
  },

  // 仓库总和
  warehouseSum: async () => {
    return await request.get({ url: `/floodctrl/materials/warehouseSum` })
  },
}
