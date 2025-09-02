import request from '@/config/axios'

// 应急组织 VO
export interface EmergencyPersonnelVO {
  id: number // id
  deptId: number // 部门id
  name: string // 名称
  phone: string // 电话
  post: string // 职责
  postDesc: string // 职责描述
  remark: string // 备注
}

// 应急组织 API
export const EmergencyPersonnelApi = {
  // 查询应急组织分页
  getEmergencyPersonnelPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/emergency-personnel/page`, params })
  },

  // 查询应急组织详情
  getEmergencyPersonnel: async (id: number) => {
    return await request.get({ url: `/floodctrl/emergency-personnel/get?id=` + id })
  },

  // 新增应急组织
  createEmergencyPersonnel: async (data: EmergencyPersonnelVO) => {
    return await request.post({ url: `/floodctrl/emergency-personnel/create`, data })
  },

  // 修改应急组织
  updateEmergencyPersonnel: async (data: EmergencyPersonnelVO) => {
    return await request.put({ url: `/floodctrl/emergency-personnel/update`, data })
  },

  // 删除应急组织
  deleteEmergencyPersonnel: async (id: number) => {
    return await request.delete({ url: `/floodctrl/emergency-personnel/delete?id=` + id })
  },

  // 导出应急组织 Excel
  exportEmergencyPersonnel: async (params) => {
    return await request.download({ url: `/floodctrl/emergency-personnel/export-excel`, params })
  },
}
