import request from '@/config/axios'

// 物资类目信息管理 VO
export interface CmdadCategoryVO {
  id: number // ID
  pid: number // 分类父级ID，默认-0（顶级节点pid为0）
  typeKey: string // 物资类型编码
  typeValue: string // 物资类型名称
  typeSpecs: string // 规格型号
  typeInfo: string // 类目描述
  image: string // 图片地址
  sort: number // 排序
  measureUnit: string // 计量单位（个，件，副等）
  status: number // 状态：0-不启用，1-启用，默认-1
  isLastNode: number // 是否是最终节点：0-否，1-是，默认-0（预备字段，可能不用）
  minStock: number // 最小库存量（告警阈值）（低于最小库存时告警，设置后所有仓库遵循同一规则）
  applyToAll: number // 是否将最小库存告警规则应用到所有仓库-分类：0-否，1-是，默认-1（不应用则初始化后告警规则无数据）
  isSysMail: number // 通知方式-站内信：0-否，1-是，默认-0
  isMes: number // 通知方式-短信：0-否，1-是，默认-0
  contactPerson: string // 联系人名称
  contactPhone: string // 联系人电话
  chargePerson: string // 负责人名称
  chargePhone: string // 负责人电话
  isQualityDate: number // 是否有保质期：0-否，1-是，默认-0
  goodsFeature: string // 物资类型特性（比如易燃，易潮等）
  storageEnv: string // 存储环境要求（JSON格式）
  adareaId: number // 所属行政区域ID
  adareaName: string // 所属行政区域名称
  deptId: number // 部门/街道乡镇ID（可能进行数据隔离，按理为共用字段）
  remark: string // 备注
}

// 物资类目信息管理 API
export const CmdadCategoryApi = {
  // 查询物资类目信息管理分页
  getCmdadCategoryPage: async (params: any) => {
    return await request.get({ url: `/floodctrl/cmdad-category/page`, params })
  },

  // 查询物资类目信息管理详情
  getCmdadCategory: async (id: number) => {
    return await request.get({ url: `/floodctrl/cmdad-category/get?id=` + id })
  },

  // 新增物资类目信息管理
  createCmdadCategory: async (data: CmdadCategoryVO) => {
    return await request.post({ url: `/floodctrl/cmdad-category/create`, data })
  },

  // 修改物资类目信息管理
  updateCmdadCategory: async (data: CmdadCategoryVO) => {
    return await request.put({ url: `/floodctrl/cmdad-category/update`, data })
  },

  // 删除物资类目信息管理
  deleteCmdadCategory: async (id: number) => {
    return await request.delete({ url: `/floodctrl/cmdad-category/delete?id=` + id })
  },

  // 导出物资类目信息管理 Excel
  exportCmdadCategory: async (params) => {
    return await request.download({ url: `/floodctrl/cmdad-category/export-excel`, params })
  },
}