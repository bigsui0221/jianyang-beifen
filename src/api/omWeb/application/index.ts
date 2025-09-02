import request from '@/config/axios'

export interface ApplicationVO {
  id: number
  applicationId: number
  name: string
  code: string
  realCode: string
  orderNum: number
  iconId: number
  type: string
  url: string
  apiUrl: string
  createTime: Date
}

// 查询子应用管理列表
export const getApplicationPage = (params: PageParam) => {
  return request.get({ url: '/system/application/page', params })
}

// 查询子应用详情
export const getApplication = (id: number) => {
  return request.get({ url: '/system/application/get?id=' + id })
}

// 新增子应用
export const createApplication = (data: ApplicationVO) => {
  return request.post({ url: '/system/application/create', data })
}

// 修改子应用
export const updateApplication = (data: ApplicationVO) => {
  return request.put({ url: '/system/application/update', data })
}

// 删除子应用
export const deleteApplication = (id: number) => {
  return request.delete({ url: '/system/application/delete?id=' + id })
}

// 获取子应用列表
export const getApplicationList = (): Promise<ApplicationVO[]> => {
  return request.get({ url: '/system/application/list' })
}

// 获取当前角色子应用列表
export const getApplicationOwnList = (): Promise<ApplicationVO[]> => {
  return request.get({ url: '/system/application/ownList' })
}
