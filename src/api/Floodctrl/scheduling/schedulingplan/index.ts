import request from '@/config/axios'

// 排班计划 VO
export interface SchedulingPlanVO {
  id: number // id自增
  regionId: number // 行政区域，关联floodctrl_region表id
  schedulingName: string // 排班名称
  planStartTime: Date // 计划开始时间
  planEndTime: Date // 计划结束时间
  filePath: string // 排班文件路径
}

// 排班计划 API
export const SchedulingPlanApi = {
  // 查询排班计划分页
  getSchedulingPlanPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/scheduling-plan/page`, params })
  },

  // 查询排班计划详情
  getSchedulingPlan: async (id: number) => {
    return await request.get({ url: `/floodctrl/scheduling-plan/get?id=` + id })
  },

  // 新增排班计划
  createSchedulingPlan: async (data: SchedulingPlanVO) => {
    return await request.post({ url: `/floodctrl/scheduling-plan/create`, data })
  },

  // 修改排班计划
  updateSchedulingPlan: async (data: SchedulingPlanVO) => {
    return await request.put({ url: `/floodctrl/scheduling-plan/update`, data })
  },

  // 删除排班计划
  deleteSchedulingPlan: async (id: number) => {
    return await request.delete({ url: `/floodctrl/scheduling-plan/delete?id=` + id })
  },

  // 导出排班计划 Excel
  exportSchedulingPlan: async (params) => {
    return await request.download({ url: `/floodctrl/scheduling-plan/export-excel`, params })
  },
}