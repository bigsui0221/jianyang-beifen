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

// 事件概览
export const MetricsEventOverviewAPI = {
  /** 获取事件列表 */
  getEventList: async (params?: MetricsQueryParams) => {
    return await request.get({ url: `/sector/event-overview/getEventList`, params })
  },
  /** 获取事件统计 */
  getEventStat: async () => {
    return await request.get({ url: `/sector/event-overview/getEventStatistics` })
  },
  /** 获取事件概况 */
  getEventOverview: async () => {
    return await request.get({ url: `/sector/event-overview/getEventSummary` })
  },
  /** 获取消息通知 */
  getMessageNotification: async () => {
    return await request.get({ url: `/sector/event-overview/getMessageAlert` })
  }
}

// 场所保障
export const MetricsVenuesAPI = {
  /** 获取防汛重点场所 */
  getFloodControlVenues: async () => {
    return await request.get({ url: `/sector/key-venue/getFloodKeyVenue` })
  },
  /** 获取防汛保障监测数据 */
  getFloodControlMonitorData: async () => {
    return await request.get({ url: `/sector/key-venue/getFloodMonitorData` })
  },
  /** 获取雨量分布 */
  getRainfallDistribution: async () => {
    return await request.get({ url: `/sector/key-venue/getRainfallDistribution` })
  },
  /** 获取督导检查 */
  getSupervisionCheck: async () => {
    return await request.get({ url: `/sector/key-venue/getSupervisionInspection` })
  },
  /** 获取供排水重点场所 */
  getWaterSupplyDrainageVenues: async () => {
    return await request.get({ url: `/sector/key-venue/getSupplyKeyVenue` })
  },
  /** 获取供排水保障监测数据 */
  getWaterSupplyDrainageMonitorData: async () => {
    return await request.get({ url: `/sector/key-venue/getSupplyMonitorData` })
  },
  /** 获取预警信息 */
  getWarningInfo: async () => {
    return await request.get({ url: `/sector/key-venue/getWarningInfo` })
  },
  /** 获取水环境重点场所 */
  getWaterEnvironmentVenues: async () => {
    return await request.get({ url: `/sector/key-venue/getWaterKeyVenue` })
  },
  /** 获取水环境保障监测数据 */
  getWaterEnvironmentMonitorData: async () => {
    return await request.get({ url: `/sector/key-venue/getWaterMonitorData` })
  }
}

// 防汛保障
export const FloodControlAPI = {
  /** 获取内涝水位监测 */
  getInnerFloodWaterLevelMonitor: async (id: number) => {
    return await request.get({ url: `/sector/flood-guarantee/getFloodMonitor`, params: { id } })
  },
  /** 获取内涝水位监测详情 */
  getInnerFloodWaterLevelMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getFloodMonitorDetail`,
      params: { id }
    })
  },
  /** 获取雨情监测 */
  getRainfallMonitor: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getRainMonitor`,
      params: { id }
    })
  },
  /** 获取雨情监测详情 */
  getRainfallMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getRainMonitorDetail`,
      params: { id }
    })
  },
  /** 获取河道水位监测 */
  getRiverWaterLevelMonitor: async (id: number) => {
    return await request.get({ url: `/sector/flood-guarantee/getRiverMonitor`, params: { id } })
  },
  /** 获取河道水位监测详情 */
  getRiverWaterLevelMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getRiverMonitorDetail`,
      params: { id }
    })
  },
  /** 获取关联路线详情 */
  getAssociatedRouteDetail: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getRouteDetail`,
      params: { id }
    })
  },
  /** 获取隧道水位监测 */
  getTunnelWaterLevelMonitor: async (id: number) => {
    return await request.get({ url: `/sector/flood-guarantee/getTunnelMonitor`, params: { id } })
  },
  /** 获取隧道水位监测详情 */
  getTunnelWaterLevelMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/flood-guarantee/getTunnelMonitorDetail`,
      params: { id }
    })
  }
}

// 水环境保障
export const WaterEnvironmentAPI = {
  /** 获取排污口监测 */
  getPollutionOutletMonitor: async (id: number) => {
    return await request.get({
      url: `/sector/water-guarantee/getOutfallMonitor`,
      params: { id }
    })
  },
  /** 获取排污口监测详情 */
  getPollutionOutletMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/water-guarantee/getOutfallMonitorDetail`,
      params: { id }
    })
  },
  /** 获取水质监测 */
  getWaterQualityMonitor: async (id: number) => {
    return await request.get({
      url: `/sector/water-guarantee/getWaterMonitor`,
      params: { id }
    })
  },
  /** 获取水质监测详情 */
  getWaterQualityMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/water-guarantee/getWaterMonitorDetail`,
      params: { id }
    })
  }
}

// 供排水保障
export const WaterSupplyDrainageAPI = {
  /** 获取供水压力监测 */
  getWaterPressureMonitor: async (id: number) => {
    return await request.get({
      url: `/sector/supply-guarantee/getSupplyPressureMonitor`,
      params: { id }
    })
  },
  /** 获取供水压力监测详情 */
  getWaterPressureMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/supply-guarantee/getPressureMonitorDetail`,
      params: { id }
    })
  },
  /** 获取供水水质监测 */
  getWaterQualityMonitor: async (id: number) => {
    return await request.get({
      url: `/sector/supply-guarantee/getSupplyQualityMonitor`,
      params: { id }
    })
  },
  /** 获取供水水质监测详情 */
  getWaterQualityMonitorDetail: async (id: number) => {
    return await request.get({
      url: `/sector/supply-guarantee/getQualityMonitorDetail`,
      params: { id }
    })
  },
  /** 获取供排水量统计 */
  getWaterSupplyDrainageVolumeStat: async (id: number) => {
    return await request.get({
      url: `/sector/supply-guarantee/getSupplyDrainageStatistics`,
      params: { id }
    })
  }
}
