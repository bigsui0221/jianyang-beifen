import request from '@/config/axios'

// 防汛重点区域信息 VO
export interface KeyAreaVO {
  id: number // ID
  drownUnit: string // 淹没单位名称
  type: number // 单位类型：字典：fx_key_area_type 1-学校，2-医院，3-事业单位，4-城区，5-场镇，6-其它
  dgaeId: number // 风险点ID
  deptId: number // 部门id
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  villageName: string // 村名
  riverName: string // 所属河流/流域
  households: number // 户数，户
  population: number // 人口-人数，人
  buildings: number // 建筑物-栋
  remark: string // 备注
}

// 防汛重点区域信息 API
export const KeyAreaApi = {
  // 查询防汛重点区域信息分页
  getKeyAreaPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/key-area/page`, params })
  },

  // 查询防汛重点区域信息详情
  getKeyArea: async (id: number) => {
    return await request.get({ url: `/floodctrl/key-area/get?id=` + id })
  },

  // 新增防汛重点区域信息
  createKeyArea: async (data: KeyAreaVO) => {
    return await request.post({ url: `/floodctrl/key-area/create`, data })
  },

  // 修改防汛重点区域信息
  updateKeyArea: async (data: KeyAreaVO) => {
    return await request.put({ url: `/floodctrl/key-area/update`, data })
  },

  // 删除防汛重点区域信息
  deleteKeyArea: async (id: number) => {
    return await request.delete({ url: `/floodctrl/key-area/delete?id=` + id })
  },

  // 导出防汛重点区域信息 Excel
  exportKeyArea: async (params) => {
    return await request.download({ url: `/floodctrl/key-area/export-excel`, params })
  },

  // 获得防汛重点区域信息列表
  getKeyAreaAll: async () => {
    return await request.get({ url: `/floodctrl/key-area/all` })
  },
}
