import request from '@/config/axios'

// 事件督办 VO
export interface SuperviseHandleVO {
  eventId: number // 关联floodctrl_event表id
  superviseHandleUserId: number // 报送人,关联system_user表id
  context: string // 督办内容
  id: number // id自增
}

// 事件督办 API
export const SuperviseHandleApi = {
  // 查询事件督办分页
  getSuperviseHandlePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/supervise-handle/page`, params })
  },

  // 查询事件督办详情
  getSuperviseHandle: async (id: number) => {
    return await request.get({ url: `/floodctrl/supervise-handle/get?id=` + id })
  },

  // 新增事件督办
  createSuperviseHandle: async (data: SuperviseHandleVO) => {
    return await request.post({ url: `/floodctrl/supervise-handle/create`, data })
  },

  // 修改事件督办
  updateSuperviseHandle: async (data: SuperviseHandleVO) => {
    return await request.put({ url: `/floodctrl/supervise-handle/update`, data })
  },

  // 删除事件督办
  deleteSuperviseHandle: async (id: number) => {
    return await request.delete({ url: `/floodctrl/supervise-handle/delete?id=` + id })
  },

  // 导出事件督办 Excel
  exportSuperviseHandle: async (params) => {
    return await request.download({ url: `/floodctrl/supervise-handle/export-excel`, params })
  },
}