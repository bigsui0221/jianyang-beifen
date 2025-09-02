import request from '@/config/axios'

// 水闸信息 VO
export interface SluiceStInfoVO {
  id: number // ID
  code: string // 闸门编码
  name: string // 闸门名称
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  type: number // 泵站类型：字典：fx_gate_type 节制闸、进水闸、排水闸、挡潮闸、分洪闸
  buildTime: Date // 建设年份
  operateUnit: string // 运行/管理单位
  operatePerson: string // 运行/管理单位负责人
  operatePhone: string // 运行/管理单位负责人电话
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 水闸信息 API
export const SluiceStInfoApi = {
  // 查询水闸信息分页
  getSluiceStInfoPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/sluice-st-info/page`, params })
  },

  // 查询水闸信息详情
  getSluiceStInfo: async (id: number) => {
    return await request.get({ url: `/floodctrl/sluice-st-info/get?id=` + id })
  },

  // 新增水闸信息
  createSluiceStInfo: async (data: SluiceStInfoVO) => {
    return await request.post({ url: `/floodctrl/sluice-st-info/create`, data })
  },

  // 修改水闸信息
  updateSluiceStInfo: async (data: SluiceStInfoVO) => {
    return await request.put({ url: `/floodctrl/sluice-st-info/update`, data })
  },

  // 删除水闸信息
  deleteSluiceStInfo: async (id: number) => {
    return await request.delete({ url: `/floodctrl/sluice-st-info/delete?id=` + id })
  },

  // 导出水闸信息 Excel
  exportSluiceStInfo: async (params) => {
    return await request.download({ url: `/floodctrl/sluice-st-info/export-excel`, params })
  },
  // 框选查询
  getSluiceStInfoBoxSelect: async (data: any) => {
    return await request.post({ url: `/floodctrl/sluice-st-info/box-select`, data })
  },
}
