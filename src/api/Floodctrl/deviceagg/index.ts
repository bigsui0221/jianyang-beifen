import request from '@/config/axios'

// 聚合设备 VO
export interface DeviceAggVO {
  id: number // id自增
  aggName: string // 聚合设备名称
  deviceId: string // 关联设备管理的id,可多个,floodctrl_device
  aggDeviceDataType: number // 聚合设备数据类型，1：水位，2：断面流量，3：面雨量，4：笼罩面积，5：距平值，6：蒸发量，7：雨洪频率
  aggDeviceComputeMode: number // 聚合设备计算方式，1:和，2：平均，3：泰森多边形
}

// 聚合设备 API
export const DeviceAggApi = {
  // 查询聚合设备分页
  getDeviceAggPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/device-agg/page`, params })
  },

  // 查询聚合设备详情
  getDeviceAgg: async (id: number) => {
    return await request.get({ url: `/floodctrl/device-agg/get?id=` + id })
  },

  // 新增聚合设备
  createDeviceAgg: async (data: DeviceAggVO) => {
    return await request.post({ url: `/floodctrl/device-agg/create`, data })
  },

  // 修改聚合设备
  updateDeviceAgg: async (data: DeviceAggVO) => {
    return await request.put({ url: `/floodctrl/device-agg/update`, data })
  },

  // 删除聚合设备
  deleteDeviceAgg: async (id: number) => {
    return await request.delete({ url: `/floodctrl/device-agg/delete?id=` + id })
  },

  // 导出聚合设备 Excel
  exportDeviceAgg: async (params) => {
    return await request.download({ url: `/floodctrl/device-agg/export-excel`, params })
  },
}