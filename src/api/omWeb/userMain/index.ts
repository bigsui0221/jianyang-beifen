import request from '@/config/axios'

export interface UserMainVO {
  id: number
  username: string
  nickname: string
  deptId: number
  postIds: string[]
  email: string
  mobile: string
  sex: number
  avatar: string
  loginIp: string
  status: number
  remark: string
  loginDate: Date
  createTime: Date
}

// 查询用户管理列表
export const getUserMainPage = (params: PageParam) => {
  return request.get({ url: '/system/user-main/page', params })
}

// 查询用户详情
export const getUserMain = (id: number) => {
  return request.get({ url: '/system/user-main/get?id=' + id })
}

// 新增用户
export const createUserMain = (data: UserMainVO) => {
  return request.post({ url: '/system/user-main/create', data })
}

// 修改用户
export const updateUserMain = (data: UserMainVO) => {
  return request.put({ url: '/system/user-main/update', data })
}

// 删除用户
export const deleteUserMain = (id: number) => {
  return request.delete({ url: '/system/user-main/delete?id=' + id })
}

// 导出用户
export const exportUserMain = (params: any) => {
  return request.download({ url: '/system/user-main/export', params })
}

// 下载用户导入模板
export const importUserMainTemplate = () => {
  return request.download({ url: '/system/user-main/get-import-template' })
}

// 用户密码重置
export const resetUserMainPassword = (id: number, password: string) => {
  const data = {
    id,
    password
  }
  return request.put({ url: '/system/user-main/update-password', data: data })
}

// 用户状态修改
export const updateUserMainStatus = (id: number, status: number) => {
  const data = {
    id,
    status
  }
  return request.put({ url: '/system/user-main/update-status', data: data })
}

// 获取用户精简信息列表
export const getSimpleUserMainList = (): Promise<UserMainVO[]> => {
  return request.get({ url: '/system/user-main/simple-list' })
}
