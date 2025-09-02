import request from '@/config/axios'

// 灾害预警信息 VO
export interface DisasterWarnVO {
  id: number // ID
  type: number // 预警分类：1-气象预警，2-灾害预警
  name: string // 预警信息标题
  disType: string // 灾害类型：字典：fx_disaster_dis_type 气象：fx_disaster_wea_type 1暴雨 2大风 3雷雨大风 4 干旱  4暴雪 5大雾 6高温 7寒潮;1山洪灾害
  level: string // 预警等级：字典：fx_disaster_warn_level 1蓝色预警 2黄色预警 3橙色预警 4红色预警
  warnType: string // 预警类型：字典：fx_disaster_warn_type 1-新增预警，2-预警升级，3-预警降级
  publishTime: Date // 发布时间
  startTime: Date // 预警开始时间
  endTime: Date // 预警结束时间
  content: string // 预警内容（富文本html）
  deptId: number // 响应区域
  remark: string // 备注
  files: string // 发布提交的附件，以file表的ID逗号串连
}

/**灾害预警信息 API*/
export const DisasterWarnApi = {
  // 查询灾害预警信息分页
  getDisasterWarnPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/disaster-warn/page`, params })
  },

  // 查询灾害预警信息详情
  getDisasterWarn: async (id: number) => {
    return await request.get({ url: `/floodctrl/disaster-warn/get?id=` + id })
  },

  // 新增灾害预警信息
  createDisasterWarn: async (data: DisasterWarnVO) => {
    return await request.post({ url: `/floodctrl/disaster-warn/create`, data })
  },

  // 修改灾害预警信息
  updateDisasterWarn: async (data: DisasterWarnVO) => {
    return await request.put({ url: `/floodctrl/disaster-warn/update`, data })
  },

  // 删除灾害预警信息
  deleteDisasterWarn: async (id: number) => {
    return await request.delete({ url: `/floodctrl/disaster-warn/delete?id=` + id })
  },

  // 导出灾害预警信息 Excel
  exportDisasterWarn: async (params) => {
    return await request.download({ url: `/floodctrl/disaster-warn/export-excel`, params })
  },
  // 获得灾害预警信息统计
  getDisasterWarnPageCount: async (params: any) => {
    return await request.get({ url: `/floodctrl/disaster-warn/pageCount`, params })
  },
  // 按类型统计
  getDisasterWarnCountByType: async () => {
    return await request.get({ url: `/floodctrl/disaster-warn/countByType` })
  },
  // 按区域统计
  getDisasterWarnCountByRegion: async () => {
    return await request.get({ url: `/floodctrl/disaster-warn/countByRegion` })
  },
  // 按等级统计
  getDisasterWarnCountByLevel: async (params) => {
    return await request.get({ url: `/floodctrl/disaster-warn/countByLevel`, params })
  },
  // 修改灾害预警信息
  changeDisasterWarnStatus: async (id: number) => {
    return await request.put({ url: `/floodctrl/disaster-warn/changeStatus/` + id })
  }
}
