import request from '@/config/axios'

// 灾害响应信息 VO
export interface DisasterResponseVO {
  id: number // ID
  type: number // 响应分类：1-防汛响应，2-抗旱响应
  name: string // 响应信息标题
  disType: string // 灾害类型：字典：fx_disaster_dis_type 气象：fx_disaster_wea_type 1暴雨 2大风 3雷雨大风 4 干旱  4暴雪 5大雾 6高温 7寒潮;1山洪灾害
  level: string // 响应等级：字典：fx_disaster_response_level 1I 级响应 2 II 级响应 3 III 级响应 4 IV级响应
  responseType: string // 响应类型：字典：fx_disaster_response_type 1-新增响应，2-响应升级，3-响应降级
  publishTime: Date // 发布时间
  startTime: Date // 响应开始时间
  endTime: Date // 响应结束时间
  content: string // 响应内容（富文本html）
  deptId: number // 响应区域
  remark: string // 备注
  files: string // 发布提交的附件，以file表的ID逗号串连
}

/**灾害响应信息 API */
export const DisasterResponseApi = {
  // 查询灾害响应信息分页
  getDisasterResponsePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/disaster-response/page`, params })
  },

  // 查询灾害响应信息详情
  getDisasterResponse: async (id: number) => {
    return await request.get({ url: `/floodctrl/disaster-response/get?id=` + id })
  },

  // 新增灾害响应信息
  createDisasterResponse: async (data: DisasterResponseVO) => {
    return await request.post({ url: `/floodctrl/disaster-response/create`, data })
  },

  // 修改灾害响应信息
  updateDisasterResponse: async (data: DisasterResponseVO) => {
    return await request.put({ url: `/floodctrl/disaster-response/update`, data })
  },

  // 删除灾害响应信息
  deleteDisasterResponse: async (id: number) => {
    return await request.delete({ url: `/floodctrl/disaster-response/delete?id=` + id })
  },

  // 导出灾害响应信息 Excel
  exportDisasterResponse: async (params) => {
    return await request.download({ url: `/floodctrl/disaster-response/export-excel`, params })
  },

  // 获得灾害预警信息统计
  getDisasterResponsePageCount: async (params: any) => {
    return await request.get({ url: `/floodctrl/disaster-response/pageCount`, params })
  },
  // 按类型统计
  getDisasterResponseCountByType: async () => {
    return await request.get({ url: `/floodctrl/disaster-response/countByType` })
  },
  // 按区域统计
  getDisasterResponseCountByRegion: async () => {
    return await request.get({ url: `/floodctrl/disaster-response/countByRegion` })
  },
  // 按区域统计
  getDisasterResponseCountByLevel: async (params) => {
    return await request.get({ url: `/floodctrl/disaster-response/countByLevel`, params })
  },
  // 修改灾害响应信息
  changeDisasterResponseStatus: async (id: number) => {
    return await request.put({ url: `/floodctrl/disaster-response/changeStatus/` + id })
  }
}
