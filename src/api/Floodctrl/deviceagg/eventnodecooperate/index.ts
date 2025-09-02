import request from '@/config/axios'

// 事件节点协同 VO
export interface EventNodeCooperateVO {
  id: number // id自增
  eventNodeId: number // 事件节点id,关联floodctrl_event_node表id
  cooperateTime: Date // 协同时间
  problem: string // 问题
  reply: string // 回复
}

// 事件节点协同 API
export const EventNodeCooperateApi = {
  // 查询事件节点协同分页
  getEventNodeCooperatePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/event-node-cooperate/page`, params })
  },

  // 查询事件节点协同详情
  getEventNodeCooperate: async (id: number) => {
    return await request.get({ url: `/floodctrl/event-node-cooperate/get?id=` + id })
  },

  // 新增事件节点协同
  createEventNodeCooperate: async (data: EventNodeCooperateVO) => {
    return await request.post({ url: `/floodctrl/event-node-cooperate/create`, data })
  },

  // 修改事件节点协同
  updateEventNodeCooperate: async (data: EventNodeCooperateVO) => {
    return await request.put({ url: `/floodctrl/event-node-cooperate/update`, data })
  },

  // 删除事件节点协同
  deleteEventNodeCooperate: async (id: number) => {
    return await request.delete({ url: `/floodctrl/event-node-cooperate/delete?id=` + id })
  },

  // 导出事件节点协同 Excel
  exportEventNodeCooperate: async (params) => {
    return await request.download({ url: `/floodctrl/event-node-cooperate/export-excel`, params })
  },
}