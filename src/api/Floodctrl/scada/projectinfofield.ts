import request from '@/config/axios'

// 防洪工程字段信息 VO
export interface ProjectInfoFieldVO {
  id: number // id
  projectType: string // 工程类型 字典：floodctrl_project_info_type
  label: string // 字段显示值
  value: string // 字段值
  unit: string // 单位
  type: string // 字段类型
  orderNum: number // 排序
}

// 防洪工程字段信息 API
export const ProjectInfoFieldApi = {
  // 查询防洪工程字段信息分页
  getProjectInfoFieldPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/project-info-field/page`, params })
  },

  // 查询防洪工程字段信息详情
  getProjectInfoField: async (id: number) => {
    return await request.get({ url: `/floodctrl/project-info-field/get?id=` + id })
  },

  // 新增防洪工程字段信息
  createProjectInfoField: async (data: ProjectInfoFieldVO) => {
    return await request.post({ url: `/floodctrl/project-info-field/create`, data })
  },

  // 修改防洪工程字段信息
  updateProjectInfoField: async (data: ProjectInfoFieldVO) => {
    return await request.put({ url: `/floodctrl/project-info-field/update`, data })
  },

  // 删除防洪工程字段信息
  deleteProjectInfoField: async (id: number) => {
    return await request.delete({ url: `/floodctrl/project-info-field/delete?id=` + id })
  },

  // 导出防洪工程字段信息 Excel
  exportProjectInfoField: async (params) => {
    return await request.download({ url: `/floodctrl/project-info-field/export-excel`, params })
  },
  // 查询防洪工程字段信息列表
  getProjectInfoFieldList: async (params: any) => {
    return await request.get({ url: `/floodctrl/project-info-field/list`, params })
  },
}
