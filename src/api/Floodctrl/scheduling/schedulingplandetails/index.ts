import request from '@/config/axios'

// 排班计划详情 VO
export interface SchedulingPlanDetailsVO {
  id: number // id自增
  schedulingPlanId: number // 关联排班计划表：floodctrl_scheduling_plan表id
  planTime: Date // 值班日期
  classLeader: string // 带班人,多个名称以逗号分隔
  planUser: string // 值班人员，逗号隔开
  periodTime: string // 值班时间段：09:00-18:00
}

// 排班计划详情 API
export const SchedulingPlanDetailsApi = {
  // 查询排班计划详情分页
  getSchedulingPlanDetailsPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/scheduling-plan-details/page`, params })
  },

  // 查询排班计划详情详情
  getSchedulingPlanDetails: async (id: number) => {
    return await request.get({ url: `/floodctrl/scheduling-plan-details/get?id=` + id })
  },

  // 新增排班计划详情
  createSchedulingPlanDetails: async (data: SchedulingPlanDetailsVO) => {
    return await request.post({ url: `/floodctrl/scheduling-plan-details/create`, data })
  },

  // 修改排班计划详情
  updateSchedulingPlanDetails: async (data: SchedulingPlanDetailsVO) => {
    return await request.put({ url: `/floodctrl/scheduling-plan-details/update`, data })
  },

  // 删除排班计划详情
  deleteSchedulingPlanDetails: async (id: number) => {
    return await request.delete({ url: `/floodctrl/scheduling-plan-details/delete?id=` + id })
  },

  // 导出排班计划详情 Excel
  exportSchedulingPlanDetails: async (params) => {
    return await request.download({ url: `/floodctrl/scheduling-plan-details/export-excel`, params })
  },

  // 今日值班
  dayPlan: async () => {
    return await request.get({ url: `/floodctrl/scheduling-plan-details/dayPlan`})
  },

  // 明日值班
  tomorrowPlan: async () => {
    return await request.get({ url: `/floodctrl/scheduling-plan-details/tomorrowPlan`})
  },
}
