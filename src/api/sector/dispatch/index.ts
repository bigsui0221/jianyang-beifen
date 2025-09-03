import request from '@/config/axios'

export const DispatchApi = {
  /** 获取车辆资源 */
  getCarResource: async () => {
    return await request.get({ url: `/sector/command-dispatch/getCarResource` })
  },

  /** 获取事件详情 */
  getEventDetail: async (id: string | number) => {
    return await request.get({ url: `/sector/command-dispatch/getEventDetail`, params: { id } })
  },

  /** 获取人员资源 */
  getPersonResource: async () => {
    return await request.get({ url: `/sector/command-dispatch/getCarResource` })
  },

  /** 获取调度资源概况 */
  getResourceOverview: async () => {
    return await request.get({ url: `/sector/command-dispatch/getResourceOverview` })
  },

  /** 获取未结案事件 */
  getUnresolvedEvent: async (eventTitle: string | number) => {
    return await request.get({
      url: `/sector/command-dispatch/getUnclosedCaseEvent`,
      params: { eventTitle }
    })
  },

  /** 获取仓库详情 */
  getWarehouseDetail: async (id: string | number) => {
    return await request.get({ url: `/sector/command-dispatch/getWarehouseDetail`, params: { id } })
  },

  /** 获取仓库管理 */
  getWarehouseManagement: async () => {
    return await request.get({ url: `/sector/command-dispatch/getWarehouseManagement` })
  }
}
