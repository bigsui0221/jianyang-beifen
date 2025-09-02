import request from '@/config/axios'

// 预案信息(简易) VO
export interface SimplePlanVO {
  id: number // ID
  code: string // 预案编码
  name: string // 预案名称
  deptId: number // 所属街道id
  type: string // 预案：字典：fx_plan_type 1 应急预案
  level: string // 预案级别：字段：fx_plan_level 1I 级 2 II 级 3 III 级响应 4 IV级
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 预案信息(简易) API
export const SimplePlanApi = {
  // 查询预案信息(简易)分页
  getSimplePlanPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/simple-plan/page`, params })
  },

  // 查询预案信息(简易)详情
  getSimplePlan: async (id: number) => {
    return await request.get({ url: `/floodctrl/simple-plan/get?id=` + id })
  },

  // 新增预案信息(简易)
  createSimplePlan: async (data: SimplePlanVO) => {
    return await request.post({ url: `/floodctrl/simple-plan/create`, data })
  },

  // 修改预案信息(简易)
  updateSimplePlan: async (data: SimplePlanVO) => {
    return await request.put({ url: `/floodctrl/simple-plan/update`, data })
  },

  // 删除预案信息(简易)
  deleteSimplePlan: async (id: number) => {
    return await request.delete({ url: `/floodctrl/simple-plan/delete?id=` + id })
  },

  // 导出预案信息(简易) Excel
  exportSimplePlan: async (params) => {
    return await request.download({ url: `/floodctrl/simple-plan/export-excel`, params })
  },

  // 应急响应详情
  detail: async (data) => {
    return await request.post({ url: `/floodctrl/plan-response/detail`, data })
  },
}
