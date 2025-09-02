import request from '@/config/axios'

// 预警设置 VO
export interface WarningSetupVO {
  id: number // id自增
  warningName: string // 预警名称
  siteId: number // 关联站点floodctrl_site表id
  warningType: number // 预警分类,1:水文监测,2:气象监测,3:水质监测,4:工程安全监测,5:城市内涝监测
  phoneMessageType: number // 短信通知,1:组织结构,2:自定义告警人员
  redAlarmValue: number // 红色报警上限
  blueAlarmValue: number // 蓝色报警上限
  yellowAlarmValue: number // 黄色报警上限
  orangeAlarmValue: number // 橙色报警上限
}

// 预警设置 API
export const WarningSetupApi = {
  // 查询预警设置分页
  getWarningSetupPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/warning-setup/page`, params })
  },

  // 查询预警设置详情
  getWarningSetup: async (id: number) => {
    return await request.get({ url: `/floodctrl/warning-setup/get?id=` + id })
  },

  // 新增预警设置
  createWarningSetup: async (data: WarningSetupVO) => {
    return await request.post({ url: `/floodctrl/warning-setup/create`, data })
  },

  // 修改预警设置
  updateWarningSetup: async (data: WarningSetupVO) => {
    return await request.put({ url: `/floodctrl/warning-setup/update`, data })
  },

  // 删除预警设置
  deleteWarningSetup: async (id: number) => {
    return await request.delete({ url: `/floodctrl/warning-setup/delete?id=` + id })
  },

  // 导出预警设置 Excel
  exportWarningSetup: async (params) => {
    return await request.download({ url: `/floodctrl/warning-setup/export-excel`, params })
  },
}