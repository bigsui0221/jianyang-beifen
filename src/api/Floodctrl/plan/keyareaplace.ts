import request from '@/config/axios'

// 避灾场所信息 VO
export interface KeyAreaPlaceVO {
  id: number // ID
  name: string // 场所名称
  dgaeType: string // 防汛风险：风险点类型：字典：fx_danger_type 1-沿江低洼地，2-中小流域低洼地，3-山洪灾害，4-其它
  chargeUnit: string // 责任单位
  director: string // 责任人（人名-电话，逗号隔开）
  area: number // 面积（㎡）
  capacity: number // 容纳人数
  reqDesc: string // 防汛物资（描述）
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  desc: string // 安置点简介
  deptId: number // 部门/街道乡镇ID 可能进行数据隔离
  remark: string // 备注
  enable: number // 是否启用：0-否，1-启用，默认-1
}

// 避灾场所信息 API
export const KeyAreaPlaceApi = {
  // 查询避灾场所信息分页
  getKeyAreaPlacePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/key-area-place/page`, params })
  },

  // 查询避灾场所信息详情
  getKeyAreaPlace: async (id: number) => {
    return await request.get({ url: `/floodctrl/key-area-place/get?id=` + id })
  },

  // 新增避灾场所信息
  createKeyAreaPlace: async (data: KeyAreaPlaceVO) => {
    return await request.post({ url: `/floodctrl/key-area-place/create`, data })
  },

  // 修改避灾场所信息
  updateKeyAreaPlace: async (data: KeyAreaPlaceVO) => {
    return await request.put({ url: `/floodctrl/key-area-place/update`, data })
  },

  // 删除避灾场所信息
  deleteKeyAreaPlace: async (id: number) => {
    return await request.delete({ url: `/floodctrl/key-area-place/delete?id=` + id })
  },

  // 导出避灾场所信息 Excel
  exportKeyAreaPlace: async (params) => {
    return await request.download({ url: `/floodctrl/key-area-place/export-excel`, params })
  },
}
