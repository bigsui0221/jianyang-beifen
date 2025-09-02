import request from '@/config/axios'

/** 物联网数据 API */
export const RealDataApi = {
  /** 雨情监测实时数据 */
  getRealDataByRain: async () => {
    return await request.get({ url: `/floodctrl/td-data/realDataByRain` })
  },

  /** 水位监测实时数据 */
  getRealDataByWaterLevel: async () => {
    return await request.get({ url: `/floodctrl/td-data/realDataByWaterLevel` })
  },

  /** 流量监测实时数据 */
  getRealDataByFlow: async () => {
    return await request.get({ url: `/floodctrl/td-data/realDataByFlow` })
  },

  /** 内涝监测 */
  getRealDataByInnerFlood: async () => {
    return await request.get({ url: `/floodctrl/td-data/realDataByInnerFlood` })
  },
  /** 按时间间隔获取监测点历史数据 */
  getDataListByInterval: async (data: any) => {
    return await request.post({ url: `/floodctrl/td-data/dataListByInterval`, data })
  }
}
