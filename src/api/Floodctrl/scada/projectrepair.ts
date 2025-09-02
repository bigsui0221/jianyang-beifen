import request from '@/config/axios'

// 水毁修复信息 VO
export interface ProjectRepairVO {
  id: number // ID
  code: string // 工程编码
  name: string // 工程名称
  riverName: string // 所属河流/流域
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  destoryDetail: string // 水毁情况
  destoryTime: Date // 水毁时间
  repairPlan: string // 修复计划
  repairTime: Date // 修复时间
  files: string // 工程文件（file的ID，以逗号隔开）
  remark: string // 备注
}

// 水毁修复信息 API
export const ProjectRepairApi = {
  // 查询水毁修复信息分页
  getProjectRepairPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/project-repair/page`, params })
  },

  // 查询水毁修复信息详情
  getProjectRepair: async (id: number) => {
    return await request.get({ url: `/floodctrl/project-repair/get?id=` + id })
  },

  // 新增水毁修复信息
  createProjectRepair: async (data: ProjectRepairVO) => {
    return await request.post({ url: `/floodctrl/project-repair/create`, data })
  },

  // 修改水毁修复信息
  updateProjectRepair: async (data: ProjectRepairVO) => {
    return await request.put({ url: `/floodctrl/project-repair/update`, data })
  },

  // 删除水毁修复信息
  deleteProjectRepair: async (id: number) => {
    return await request.delete({ url: `/floodctrl/project-repair/delete?id=` + id })
  },

  // 导出水毁修复信息 Excel
  exportProjectRepair: async (params) => {
    return await request.download({ url: `/floodctrl/project-repair/export-excel`, params })
  },
}
