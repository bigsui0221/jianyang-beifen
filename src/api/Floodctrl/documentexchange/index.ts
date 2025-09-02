import request from '@/config/axios'

// 文件交换 VO
export interface DocumentExchangeVO {
  id: number // id自增
  exchangeTime: Date // 交换时间
  documentTitle: string // 文件标题
  description: string // 文件描述
  documentType: string // 文件类型
  urgency: number // 文件交换紧急程度，1：特别重大，2：重大，3:较大,4:一般
  receivingDeptId: number // 接收单位,关联system_dept表id
  submissionChannel: number // 文件交换报送渠道,1:值班值守
  submissionUserId: number // 报送人,关联system_user表id
  submissionDeptId: number // 报送单位,关联system_dept表id
  submissionTime: Date // 报送时间
  attachmentPath: string // 附件地址
  sendStatus: number // 发送状态：0：为发送，1：已发送
  signforStatus: number // 签收状态：0：未签收，1：已签收
}

// 文件交换 API
export const DocumentExchangeApi = {
  // 查询文件交换分页
  getDocumentExchangePage: async (params: any) => {
    return await request.get({ url: `/floodctrl/document-exchange/page`, params })
  },

  // 查询文件交换详情
  getDocumentExchange: async (id: number) => {
    return await request.get({ url: `/floodctrl/document-exchange/get?id=` + id })
  },

  // 新增文件交换
  createDocumentExchange: async (data: DocumentExchangeVO) => {
    return await request.post({ url: `/floodctrl/document-exchange/create`, data })
  },

  // 修改文件交换
  updateDocumentExchange: async (data: DocumentExchangeVO) => {
    return await request.put({ url: `/floodctrl/document-exchange/update`, data })
  },

  // 删除文件交换
  deleteDocumentExchange: async (id: number) => {
    return await request.delete({ url: `/floodctrl/document-exchange/delete?id=` + id })
  },

  // 导出文件交换 Excel
  exportDocumentExchange: async (params) => {
    return await request.download({ url: `/floodctrl/document-exchange/export-excel`, params })
  },

  // 文件交换签收
  signFor: async (id: number) => {
    return await request.put({ url: `/floodctrl/document-exchange/signFor?id=` + id })
  },
}
