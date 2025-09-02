import request from '@/config/axios'

// 事件节点任务 VO
export interface EventNodeTaskVO {
  id: number // id自增
  eventNodeId: number // 事件节点id,关联floodctrl_event_node表id
  taskDescription: string // 任务描述
  chargeUserId: number // 负责人，关联system_user表id
  completionTime: Date // 完成时间
  useMaterials: string // 使用物资
  disposalPersionnel: string // 处置人员
  workmanship: string // 处理工艺
  taskStatus: number // 节点任务状态，1：未开始，2：进行中，3：需协同，4：已完成
  cooperate: number // 是否需要协同，1：需要，0：不需要
}

// 事件节点任务 API
export const EventNodeTaskApi = {
  // 查询事件节点任务分页
  getEventNodeTaskPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/event-node-task/page`, params })
  },

  // 查询事件节点任务详情
  getEventNodeTask: async (id: number) => {
    return await request.get({ url: `/floodctrl/event-node-task/get?id=` + id })
  },

  // 新增事件节点任务
  createEventNodeTask: async (data: EventNodeTaskVO) => {
    return await request.post({ url: `/floodctrl/event-node-task/create`, data })
  },

  // 修改事件节点任务
  updateEventNodeTask: async (data: EventNodeTaskVO) => {
    return await request.put({ url: `/floodctrl/event-node-task/update`, data })
  },

  // 删除事件节点任务
  deleteEventNodeTask: async (id: number) => {
    return await request.delete({ url: `/floodctrl/event-node-task/delete?id=` + id })
  },

  // 导出事件节点任务 Excel
  exportEventNodeTask: async (params) => {
    return await request.download({ url: `/floodctrl/event-node-task/export-excel`, params })
  },
}