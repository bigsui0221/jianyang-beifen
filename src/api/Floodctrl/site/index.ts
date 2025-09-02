import request from '@/config/axios'

// 站点管理 VO
export interface SiteVO {
  id: number // id自增
  regionId: number // 关联区域管理id,floodctrl_region
  siteDeviceType: number // 站点设备类型，1：聚合设备，2：设备
  deviceId: number // 根据site_device_type取值	聚合设备:关联的是聚合设备：floodctrl_device_agg表的id	设备:关联的是设备管理：floodctrl_device表的id
  siteName: string // 站点名称
  sort: number // 排序
  ledReminder: number // 关联设备管理：floodctrl_device表id
  longitude: number // 地址经度
  latitude: number // 地址纬度
  mapAddress: string // 地图地点地址
  address: string // 详细地址
  siteType: number // 站点类型，1：水位站，2：河道水位，3：水库，4：隧道水位，5：流量，6：内涝
  gsEwlIndexType: number // site_type为1的保证水位指标类型，1：水位，2：降雨量，3：流量
  gsEwlValue: number // site_type为1的保证水位值
  gsWwlIndexType: number // site_type为1警戒指标类型，1：水位，2：降雨量，3：流量
  gsWwlValue: number // site_type为1的警戒值
  rwlEwlIndexType: number // site_type为2保证水位指标类型，1：水位，2：降雨量，3：流量
  rwlEwlValue: number // site_type为2保证水位值
  rwlWwlIndexType: number // site_type为2警戒指标类型，1：水位，2：降雨量，3：流量
  rwlWwlValue: number // site_type为2警戒值
  rerFclIndexType: number // site_type为3汛限水位指标类型，1：水位，2：降雨量，3：流量
  rerFclValue: number // site_type为3汛限水位值
  rerDwlIndexType: number // site_type为3设计水位指标类型，1：水位，2：降雨量，3：流量
  rerDwlValue: number // site_type为3的设计水位值
  rerCtwlIndexType: number // site_type为3的校核水位指标类型，1：水位，2：降雨量，3：流量
  rerCtwlValue: number // site_type为3的校核水位值
  twlWaIndexType: number // site_type为4的警示水位指标类型，1：水位，2：降雨量，3：流量
  twlWaValue: number // site_type为4的警示水位值
  twlWsIndexType: number // site_type为4的警戒水位指标类型，1：水位，2：降雨量，3：流量
  twlWsValue: number // site_type为4的警戒水位值
  dcgAtfIndexType: number // site_type为5的警戒流量指标类型，1：水位，2：降雨量，3：流量
  dcgAtfValue: number // site_type为5的警戒流量值
  dcgEtfIndexType: number // site_type为5的保证流量指标类型，1：水位，2：降雨量，3：流量
  dcgEtfValue: number // site_type为5的保证流量值
  wlSwIndexType: number // site_type为6的超警示指标类型，1：水位，2：降雨量，3：流量
  wlSwValue: number // site_type为6的超警示值
  wlSaIndexType: number // site_type为6的超警戒指标类型，1：水位，2：降雨量，3：流量
  wlSaValue: number // site_type为6的超警戒值
}

// 站点管理 API
export const SiteApi = {
  // 查询站点管理分页
  getSitePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/site/page`, params })
  },

  // 查询站点管理详情
  getSite: async (id: number) => {
    return await request.get({ url: `/floodctrl/site/get?id=` + id })
  },

  // 新增站点管理
  createSite: async (data: any) => {
    return await request.post({ url: `/floodctrl/site/create`, data })
  },

  // 修改站点管理
  updateSite: async (data: any) => {
    return await request.put({ url: `/floodctrl/site/update`, data })
  },

  // 删除站点管理
  deleteSite: async (id: number) => {
    return await request.delete({ url: `/floodctrl/site/delete?id=` + id })
  },

  // 导出站点管理 Excel
  exportSite: async (params) => {
    return await request.download({ url: `/floodctrl/site/export-excel`, params })
  },

  /** 框选查询站点 */
  getSiteBoxSelect: async (data: any) => {
    return await request.post({ url: `/floodctrl/site/box-select`, data })
  },
}
