import request from '@/config/axios'

// 区域管理 VO
export interface RegionVO {
  id: number // id自增
  fid: number // 父级ID
  deptId: number // 所属组织架构，关联system_dept表id
  longitude: number // 经度
  latitude: number // 纬度
  mapAddress: string // 经纬度地址
  regionRectangle: string // 区域矩形坐标数组
  backgroundStyle: string // 区域矩形背景样式
  borderStyle: string // 区域矩形边框样式
}

// 区域管理 API
export const RegionApi = {
  // 查询区域管理分页
  getRegionPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/region/page`, params })
  },

  // 查询区域管理详情
  getRegion: async (id: number) => {
    return await request.get({ url: `/floodctrl/region/get?id=` + id })
  },

  // 新增区域管理
  createRegion: async (data: any) => {
    return await request.post({ url: `/floodctrl/region/create`, data })
  },

  // 修改区域管理
  updateRegion: async (data: RegionVO) => {
    return await request.put({ url: `/floodctrl/region/update`, data })
  },

  // 删除区域管理
  deleteRegion: async (id: number) => {
    return await request.delete({ url: `/floodctrl/region/delete?id=` + id })
  },

  // 导出区域管理 Excel
  exportRegion: async (params) => {
    return await request.download({ url: `/floodctrl/region/export-excel`, params })
  },
}
