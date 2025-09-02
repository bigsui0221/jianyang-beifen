import request from '@/config/axios'

// 历史洪水记录 VO
export interface FloodHistoryVO {
  id: number // ID
  code: string // 编号
  name: string // 洪水名称
  startTime: Date // 发生时间
  endTime: Date // 结束时间
  detail: string // 详情
}

// 历史洪水记录 API
export const FloodHistoryApi = {
  // 查询历史洪水记录分页
  getFloodHistoryPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/flood-history/page`, params })
  },

  // 查询历史洪水记录详情
  getFloodHistory: async (id: number) => {
    return await request.get({ url: `/floodctrl/flood-history/get?id=` + id })
  },

  // 新增历史洪水记录
  createFloodHistory: async (data: FloodHistoryVO) => {
    return await request.post({ url: `/floodctrl/flood-history/create`, data })
  },

  // 修改历史洪水记录
  updateFloodHistory: async (data: FloodHistoryVO) => {
    return await request.put({ url: `/floodctrl/flood-history/update`, data })
  },

  // 删除历史洪水记录
  deleteFloodHistory: async (id: number) => {
    return await request.delete({ url: `/floodctrl/flood-history/delete?id=` + id })
  },

  // 导出历史洪水记录 Excel
  exportFloodHistory: async (params) => {
    return await request.download({ url: `/floodctrl/flood-history/export-excel`, params })
  },
}
