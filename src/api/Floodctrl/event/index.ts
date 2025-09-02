import request from '@/config/axios'

// 事件管理 VO
export interface EventVO {
  id: number // id自增
  eventClass: number // 事件分类，1：信息上报事件，2：普通事件，3：预警登记
  eventTitle: string // 事件标题
  eventNumber: string // 事件编号
  incidentTime: Date // 事发时间
  eventDescription: string // 事发原因
  genericPlanIds: string // 关联预案id,多个id使用逗号分隔
  eventLevel: number // 事件等级，1：特别重大，2：重大，3：较大，4：一般
  longitude: number // 事件地址经度
  latitude: number // 事件地址纬度
  mapAddress: string // 经纬度对应的映射地址
  address: string // 详细地址
  eventType: number // 事件类型，1：突发事件，2：预警事件，3：自闭环事件，4：多跨事件
  submissionDeptId: number // 报送对象,关联system_dept表id
  processingTimeLimit: number // 处理时限（小时）
  cityCenter: number // 是否同步城运中心，1：同步，0：不同步
  attachmentPath: string // 附件地址
  submittedUserId: number // 报送人,关联system_user表id
  submissionTime: Date // 报送时间
  eventStatus: number // 事件状态，1：上报，2：已分派，3：处理中，4结案
}

// 事件管理 API
export const EventApi = {
  // 查询事件管理分页
  getEventPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/event/page`, params })
  },

  // 查询事件管理详情
  getEvent: async (id: number) => {
    return await request.get({ url: `/floodctrl/event/get?id=` + id })
  },

  // 新增事件管理
  createEvent: async (data: EventVO) => {
    return await request.post({ url: `/floodctrl/event/create`, data })
  },

  // 修改事件管理
  updateEvent: async (data: EventVO) => {
    return await request.put({ url: `/floodctrl/event/update`, data })
  },

  // 删除事件管理
  deleteEvent: async (id: number) => {
    return await request.delete({ url: `/floodctrl/event/delete?id=` + id })
  },

  // 导出事件管理 Excel
  exportEvent: async (params) => {
    return await request.download({ url: `/floodctrl/event/export-excel`, params })
  },

  // 续报
  resubmit: async (params) => {
    return await request.post({ url: `/floodctrl/event/resubmit`, params})
  },

  // 获取事件流程节点-树形结构
  getEventProcessNodesTree: async (id: number) => {
    return await request.get({ url: `/floodctrl/event/getEventProcessNodesTree?eventId=` + id })
  },

  // 续报
  infoReportExamine: async (params) => {
    return await request.post({ url: `/floodctrl/event/infoReportExamine`, params})
  },

  // 任务下发
  taskDistribution: async (params) => {
    return await request.post({ url: `/floodctrl/event/taskDistribution`, params})
  },

  // 回复协同
  replyCopperate: async (params) => {
    return await request.post({ url: `/floodctrl/event/replyCopperate`, params})
  },
}
