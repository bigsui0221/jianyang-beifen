import request from '@/config/axios'
// GIS API
export const GISApi = {
  /** 获取gis token */
  getGISToken: async () => {
    return await request.get({ url: `/floodctrl/gis/getToken` })
  },
  /** 关键词搜索 */
  getKeywordSearch: async (keyword: string) => {
    return await request.get({ url: `/floodctrl/gis/keywordSearch`, params: { keyword } })
  },

  /** 简阳天气预报 */
  publicWeather: async () => {
    return await request.get({ url: `/floodctrl/gis/publicWeather` })
  }
}
