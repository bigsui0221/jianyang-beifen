import request from '@/config/axios'

// 风险点（危险区）信息 VO
export interface DangerAreaVO {
  id: number // ID
  code: string // 风险点编码
  name: string // 风险点名称
  type: number // 风险点类型：字典：fx_danger_type 1-沿江低洼地，2-中小流域低洼地，3-山洪灾害，4-其它
  riskLevel: number // 风险等级：字典：fx_level_type 1-极高风险，2-高风险，3-中风险，4-低风险，只有山洪灾害有风险等级
  projId: string // 工程ID（可能多个，以逗号隔开）
  projName: string // 工程名称（可能多个，以逗号隔开）
  households: number // 户数，户
  population: number // 人口-人数，人
  buildings: number // 建筑物-栋
  adareaId: number // 所属行政区域ID
  adareaName: string // 所属行政区域名称
  entpId: string // 企事业单位ID（可能多个，以逗号隔开）
  entpName: string // 企事业单位名称（可能多个，以逗号隔开）
  dgaeArea: string // 区域图形（polygon）
  fillColor: string // 填充颜色
  borderColor: string // 边框颜色
  deptId: number // 部门/街道乡镇ID，数据隔离
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 风险点（危险区）信息 API
export const DangerAreaApi = {
  // 查询风险点（危险区）信息分页
  getDangerAreaPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/danger-area/page`, params })
  },

  // 查询风险点（危险区）信息详情
  getDangerArea: async (id: number) => {
    return await request.get({ url: `/floodctrl/danger-area/get?id=` + id })
  },

  // 新增风险点（危险区）信息
  createDangerArea: async (data: DangerAreaVO) => {
    return await request.post({ url: `/floodctrl/danger-area/create`, data })
  },

  // 修改风险点（危险区）信息
  updateDangerArea: async (data: DangerAreaVO) => {
    return await request.put({ url: `/floodctrl/danger-area/update`, data })
  },

  // 删除风险点（危险区）信息
  deleteDangerArea: async (id: number) => {
    return await request.delete({ url: `/floodctrl/danger-area/delete?id=` + id })
  },

  // 导出风险点（危险区）信息 Excel
  exportDangerArea: async (params) => {
    return await request.download({ url: `/floodctrl/danger-area/export-excel`, params })
  },
}