import request from '@/config/axios'

// 物资分类 VO
export interface MaterialsTypeVO {
  id: number // id自增
  materialsName: string // 物资名称
  unitMeasurement: string // 计量单位
}

// 物资分类 API
export const MaterialsTypeApi = {
  // 查询物资分类分页
  getMaterialsTypePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/materials-type/page`, params })
  },

  // 查询物资分类详情
  getMaterialsType: async (id: number) => {
    return await request.get({ url: `/floodctrl/materials-type/get?id=` + id })
  },

  // 新增物资分类
  createMaterialsType: async (data: MaterialsTypeVO) => {
    return await request.post({ url: `/floodctrl/materials-type/create`, data })
  },

  // 修改物资分类
  updateMaterialsType: async (data: MaterialsTypeVO) => {
    return await request.put({ url: `/floodctrl/materials-type/update`, data })
  },

  // 删除物资分类
  deleteMaterialsType: async (id: number) => {
    return await request.delete({ url: `/floodctrl/materials-type/delete?id=` + id })
  },

  // 导出物资分类 Excel
  exportMaterialsType: async (params) => {
    return await request.download({ url: `/floodctrl/materials-type/export-excel`, params })
  },
}