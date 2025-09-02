import request from '@/config/axios'

// 事件节点管理 VO
export interface EventNodeVO {
  id: number // id自增
  eventId: number // 关联floodctrl_event表id
  noteStatus: number // 节点状态,1：生成任务，2：任务接收，3：任务协同，4：任务反馈
  parentId: number // 父节点id
  attachmentPath: string // 附件地址
  handleDeptId: number // 处理单位,关联system_dept表id
  submittedUserId: number // 报送人,关联system_user表id
  submissionTime: Date // 报送时间
  processingTimeLimit: number // 处理时限
  handleContext: string // 处理内容
  replyUserId: number // 回复人,关联system_user表id
}

// 事件节点管理 API
export const EventNodeApi = {
  // 查询事件节点管理分页
  getEventNodePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/event-node/page`, params })
  },

  // 查询事件节点管理详情
  getEventNode: async (id: number) => {
    return await request.get({ url: `/floodctrl/event-node/get?id=` + id })
  },

  // 新增事件节点管理
  createEventNode: async (data: EventNodeVO) => {
    return await request.post({ url: `/floodctrl/event-node/create`, data })
  },

  // 修改事件节点管理
  updateEventNode: async (data: EventNodeVO) => {
    return await request.put({ url: `/floodctrl/event-node/update`, data })
  },

  // 删除事件节点管理
  deleteEventNode: async (id: number) => {
    return await request.delete({ url: `/floodctrl/event-node/delete?id=` + id })
  },

  // 导出事件节点管理 Excel
  exportEventNode: async (params) => {
    return await request.download({ url: `/floodctrl/event-node/export-excel`, params })
  },
}