import request from '@/config/axios'

// 物资管理（入库） VO
export interface MaterialsVO {
  id: number // id自增
  inBatch: string // 入库批次
  warehouseId: number // 仓库，关联floodctrl_warehouse表id
  applicantName: string // 申请人
  handleUserId: number // 经手人,关联system_user表id
  materialsTypeId: number // 物资名称，关联物资分类：floodctrl_materials_type表id
  specificationModel: string // 规格型号
  reportNumber: number // 上报数量
  alarmThreshold: number // 告警阈值
  supplier: string // 供应商
  supplierPhone: string // supplier_phone
  supplierUser: string // 供应商联系人
  produceTime: Date // 生产日期
  effectiveTime: Date // 有效截止期期
  purchaseTime: Date // 采购日期
}

// 物资管理（入库） API
export const MaterialsApi = {
  // 查询物资管理（入库）分页
  getMaterialsPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials/page`, params })
  },

  // 查询物资管理（入库）详情
  getMaterials: async (id: number) => {
    return await request.get({ url: `/floodctrl/materials/get?id=` + id })
  },

  // 新增物资管理（入库）
  createMaterials: async (data: MaterialsVO) => {
    return await request.post({ url: `/floodctrl/materials/create`, data })
  },

  // 修改物资管理（入库）
  updateMaterials: async (data: MaterialsVO) => {
    return await request.put({ url: `/floodctrl/materials/update`, data })
  },

  // 删除物资管理（入库）
  deleteMaterials: async (id: number) => {
    return await request.delete({ url: `/floodctrl/materials/delete?id=` + id })
  },

  // 导出物资管理（入库） Excel
  exportMaterials: async (params) => {
    return await request.download({ url: `/floodctrl/materials/export-excel`, params })
  },


  // 物资超限提醒
  overLimitPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials/overLimitPage`, params })
  },

  // 物资超限提醒
  periodValidityPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials/periodValidityPage`, params })
  },

  // 物资总量
  materialsSum: async () => {
    return await request.get({ url: `/floodctrl/materials/materialsSum`})
  },

  // 今日入库物资总量
  todayInMaterialsSum: async () => {
    return await request.get({ url: `/floodctrl/materials/todayInMaterialsSum` })
  },

  // 今日出库物资总量
  todayOutMaterialsSum: async () => {
    return await request.get({ url: `/floodctrl/materials/todayOutMaterialsSum` })
  },

  // 出入库统计
  inoutMaterialsStat: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials/inoutMaterialsStat?startTime=`+ params.startTime + '&endTime=' + params.endTime })
  },

  // 仓库统计
  warehouseInoutMaterialsStat: async () => {
    return await request.get({ url: `/floodctrl/materials/warehouseInoutMaterialsStat` })
  },

  // 行政区划统计
  warehouseMaterialsPercentageStat: async () => {
    return await request.get({ url: `/floodctrl/materials/warehouseMaterialsPercentageStat` })
  },
}
