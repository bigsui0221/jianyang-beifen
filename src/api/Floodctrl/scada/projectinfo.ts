import request from '@/config/axios'

// 防洪工程信息 VO
export interface ProjectInfoVO {
  id: number // ID
  code: string // 工程编码
  name: string // 工程名称
  type: number // 工程类型：枚举 1-堤防工程，2-中小河流治理，3-水美乡村工程，4-水土流失治理
  status: number // 状态：1-在建，2-已建（建成），默认-2
  address: string // 位置（详细地址）
  lon: number // 经度
  lat: number // 纬度
  riverName: string // 所在河流
  content: string // 内容描述
}

// 防洪工程信息 API
export const ProjectInfoApi = {
  // 查询防洪工程信息分页
  getProjectInfoPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/project-info/page`, params })
  },

  // 查询防洪工程信息详情
  getProjectInfo: async (id: number) => {
    return await request.get({ url: `/floodctrl/project-info/get?id=` + id })
  },

  // 新增防洪工程信息
  createProjectInfo: async (data: ProjectInfoVO) => {
    return await request.post({ url: `/floodctrl/project-info/create`, data })
  },

  // 修改防洪工程信息
  updateProjectInfo: async (data: ProjectInfoVO) => {
    return await request.put({ url: `/floodctrl/project-info/update`, data })
  },

  // 删除防洪工程信息
  deleteProjectInfo: async (id: number) => {
    return await request.delete({ url: `/floodctrl/project-info/delete?id=` + id })
  },

  // 导出防洪工程信息 Excel
  exportProjectInfo: async (params) => {
    return await request.download({ url: `/floodctrl/project-info/export-excel`, params })
  },
}
