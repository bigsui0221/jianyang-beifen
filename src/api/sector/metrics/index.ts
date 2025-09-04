import request from '@/config/axios'

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
