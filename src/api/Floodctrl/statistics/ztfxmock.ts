import request from '@/config/axios'

// 专题分析模拟数据 VO
export interface ZtfxMockVO {
  id: number // id自增
  regionId: number // 区域id
  siteId: number // 站点id
  siteName: string // 站点名称
  content: string // 数据内容
  type: string // 数据类型：1水雨情统计 2雨洪频率分析 3历史同期对比  4雨洪过程对照 5雨水情简报 6汛期信息发布  7水情水势 8洪水频率计算  9均值分析
  dataType: string // 雨水情简报：1雨情 2水情 3水库
  dateTime: Date // 数据时间
}

// 专题分析模拟数据 API
export const ZtfxMockApi = {
  // 查询专题分析模拟数据分页
  getZtfxMockPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/ztfx-mock/page`, params })
  },

  // 查询专题分析模拟数据详情
  getZtfxMock: async (id: number) => {
    return await request.get({ url: `/floodctrl/ztfx-mock/get?id=` + id })
  },

  // 新增专题分析模拟数据
  createZtfxMock: async (data: ZtfxMockVO) => {
    return await request.post({ url: `/floodctrl/ztfx-mock/create`, data })
  },

  // 修改专题分析模拟数据
  updateZtfxMock: async (data: ZtfxMockVO) => {
    return await request.put({ url: `/floodctrl/ztfx-mock/update`, data })
  },

  // 删除专题分析模拟数据
  deleteZtfxMock: async (id: number) => {
    return await request.delete({ url: `/floodctrl/ztfx-mock/delete?id=` + id })
  },

  // 导出专题分析模拟数据 Excel
  exportZtfxMock: async (params) => {
    return await request.download({ url: `/floodctrl/ztfx-mock/export-excel`, params })
  },
  
  // 获取站点列表
  getStationListByZtfxType: async (params: any) => {
    return await request.get({ url: `/floodctrl/ztfx-mock/getStationListByZtfxType`, params })
  },
}
