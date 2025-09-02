import request from '@/config/axios'

export interface TenantConfigVO {
  id: number
  pwdMinLength: number
  pwdComplexity: string | string[]
  pwdForceChange: string
  repeatLogin: string
  applicationName: string
  applicationLogo: string
  createTime: Date
}
// 查询图标库详情
export const getTenantConfig = () => {
  return request.get({ url: '/system/tenant-config/get' })
}

// 新增图标库
export const createTenantConfig = (data: TenantConfigVO) => {
  return request.post({ url: '/system/tenant-config/create', data })
}

// 修改图标库
export const updateTenantConfig = (data: TenantConfigVO) => {
  return request.put({ url: '/system/tenant-config/update', data })
}
