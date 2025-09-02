import request from '@/config/axios'

// 设备管理 VO
export interface DeviceVO {
  id: number // id自增
  deviceId: string // 设备ID
  deviceName: string // 设备名称
  pointCode: string // 数据指标code，关联floodctrl_scada_point
  pointName: string // 数据指标名称，引用floodctrl表zhsc_scada_point
  pointUnit: string // 数据指标单位，引用floodctrl_scada_point表
  deviceType: number // 设备类型，1：简易雨量站，2：预警广播，3：雨量站，4：水位站，5：水位雨量站，6：防汛视频，7：下穿隧道积水监测点位，8：声光报警
}

// 设备管理 API
export const DeviceApi = {
  // 查询设备管理分页
  getDevicePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/device/page`, params })
  },

  // 查询设备管理详情
  getDevice: async (id: number) => {
    return await request.get({ url: `/floodctrl/device/get?id=` + id })
  },
   // 根据设备ID获取设备指标
  getDevicePointInfoByDeviceId: async (deviceId: string) => {
    return await request.get({ url: `/floodctrl/device/getDevicePointInfoByDeviceId?deviceId=` + deviceId })
  },

  // 新增设备管理
  createDevice: async (data: DeviceVO) => {
    return await request.post({ url: `/floodctrl/device/create`, data })
  },

  // 修改设备管理
  updateDevice: async (data: DeviceVO) => {
    return await request.put({ url: `/floodctrl/device/update`, data })
  },

  // 删除设备管理
  deleteDevice: async (id: number) => {
    return await request.delete({ url: `/floodctrl/device/delete?id=` + id })
  },

  // 导出设备管理 Excel
  exportDevice: async (params) => {
    return await request.download({ url: `/floodctrl/device/export-excel`, params })
  },
}
