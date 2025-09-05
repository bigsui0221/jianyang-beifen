import request from '@/config/axios'

// 统一查询参数类型（分页 + 条件）
export type MetricsQueryParams = Partial<{
  pageNo: number
  pageSize: number
  stationName: string
  location: string
  collectionStartTime: string
  collectionEndTime: string
}>

// 公共安全
export const MetricsAPI = {
  /** 获取内涝点数据 */
  getCarResource: async () => {
    return await request.get({ url: `/sector/public-safety/getFloodCondition` })
  },

  /** 获取雨量分布 */
  getRainfallDistribution: async () => {
    return await request.get({ url: `/sector/public-safety/getRainfallDistribution` })
  },

  /** 获取水库水情 */
  getReservoirCondition: async () => {
    return await request.get({ url: `/sector/public-safety/getReservoirCondition` })
  },

  /** 获取河道水情 */
  getRiverCondition: async () => {
    return await request.get({ url: `/sector/public-safety/getRiverCondition` })
  },

  /** 获取隧道数据 */
  getWatergateCondition: async () => {
    return await request.get({ url: `/sector/public-safety/getTunnelCondition` })
  },

  /** 获取预警信息 */
  getFlowDistribution: async () => {
    return await request.get({ url: `/sector/public-safety/getWarningInfo` })
  }
}

// 公共管理
export const MetricsManagementAPI = {
  /** 排水管网检测数据 */
  getWaterPipeDetectionData: async () => {
    return await request.get({ url: `/sector/public-administration/getDrainageDetectData` })
  },
  /** 排水管网监测点统计 */
  getDrainageDetectPointStat: async () => {
    return await request.get({ url: `/sector/public-administration/getDrainageMonitor` })
  },
  /** 河道巡河监测点统计 */
  getRiverPatrolPointStat: async () => {
    return await request.get({ url: `/sector/public-administration/getRiverChannel` })
  },
  /** 污水厂监测数据 */
  getWastewaterPlantData: async () => {
    return await request.get({ url: `/sector/public-administration/getSewageDetectData` })
  },
  /** 污水处理监测数据 */
  getSewagePlantData: async () => {
    return await request.get({ url: `/sector/public-administration/getSewageMonitor` })
  },
  /** 获取污水处理量统计 */
  getSewageVolumeStat: async () => {
    return await request.get({ url: `/sector/public-administration/getSewageStatistics` })
  }
}

// 公共服务

export const MetricsServiceAPI = {
  /** 获取出厂水水质监测数据 */
  getWaterQualityData: async () => {
    return await request.get({ url: `/sector/public-utility/getFactoryWaterMonitor` })
  },
  /** 获取管网水质监测数据 */
  getNetworkWaterQualityData: async () => {
    return await request.get({ url: `/sector/public-utility/getPipelineWaterMonitor` })
  },
  /** 获取管网水质监测点统计 */
  getWaterSupplyPointStat: async () => {
    return await request.get({ url: `/sector/public-utility/getWaterSupply` })
  }
}

// 公共服务详情页

export const MetricsServiceDetailAPI = {
  /** 获取污水处理监测数据 */
  getSewagePlantData: async (params?: MetricsQueryParams) => {
    return await request.get({ url: `/sector/statistics-data/getSewageMonitorData`, params })
  },
  /** 获取污水处理监测点统计 */
  getSewagePlantPointStat: async (params?: MetricsQueryParams) => {
    return await request.get({ url: `/sector/statistics-data/getDrainageMonitorData`, params })
  },
  /** 获取供水水质监测数据 */
  getWaterQualityData: async (params?: MetricsQueryParams) => {
    return await request.get({ url: `/sector/statistics-data/getWaterSupplyMonitorData`, params })
  },
  /** 获取供水水质监测点统计 */
  getWaterQualityPointStat: async (params?: MetricsQueryParams) => {
    return await request.get({ url: `/sector/statistics-data/getPipelineWaterMonitorData`, params })
  }
}
