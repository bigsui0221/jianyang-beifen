import request from '@/config/axios'

export interface IconLibraryVO {
  id: number
  name: string
  url: string
  type: string
  createTime: Date
}

// 查询图标库管理列表
export const getIconLibraryPage = (params: PageParam) => {
  return request.get({ url: '/system/icon-library/page', params })
}

// 查询图标库详情
export const getIconLibrary = (id: number) => {
  return request.get({ url: '/system/icon-library/get?id=' + id })
}

// 新增图标库
export const createIconLibrary = (data: IconLibraryVO) => {
  return request.post({ url: '/system/icon-library/create', data })
}

// 修改图标库
export const updateIconLibrary = (data: IconLibraryVO) => {
  return request.put({ url: '/system/icon-library/update', data })
}

// 删除图标库
export const deleteIconLibrary = (ids: number[]) => {
  return request.delete({
    url: '/system/icon-library/delete',
    data: ids
  })
}

// 获取图标库列表
export const getIconLibraryWebList = (): Promise<IconLibraryVO[]> => {
  return request.get({ url: '/system/icon-library/list?type=1' })
}

// 获取图标库列表
export const getIconLibraryMenuList = (): Promise<IconLibraryVO[]> => {
  return request.get({ url: '/system/icon-library/list?type=2' })
}
