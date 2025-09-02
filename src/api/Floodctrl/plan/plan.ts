import request from '@/config/axios'

// 预案管理信息 VO
export interface PlanVO {
  id: number // ID
  code: string // 预案编号
  name: string // 预案名称
  deptId: number // 所属街道id
  dgaeId: number // 风险点ID
  type: string // 预案：字典：fx_plan_type 1 应急预案
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 预案管理信息 API
export const PlanApi = {
  // 查询预案管理信息分页
  getPlanPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/plan/page`, params })
  },

  // 查询预案管理信息详情
  getPlan: async (id: number) => {
    return await request.get({ url: `/floodctrl/plan/get?id=` + id })
  },

  // 新增预案管理信息
  createPlan: async (data: PlanVO) => {
    return await request.post({ url: `/floodctrl/plan/create`, data })
  },

  // 修改预案管理信息
  updatePlan: async (data: PlanVO) => {
    return await request.put({ url: `/floodctrl/plan/update`, data })
  },

  // 删除预案管理信息
  deletePlan: async (id: number) => {
    return await request.delete({ url: `/floodctrl/plan/delete?id=` + id })
  },

  // 导出预案管理信息 Excel
  exportPlan: async (params) => {
    return await request.download({ url: `/floodctrl/plan/export-excel`, params })
  },
}
