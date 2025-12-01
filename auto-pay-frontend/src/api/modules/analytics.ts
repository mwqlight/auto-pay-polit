import request from '@/utils/request'

/**
 * 数据分析相关API接口
 */

// 交易概览数据
export const getTransactionOverview = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/overview',
    method: 'get',
    params: { timeRange }
  })
}

// 交易趋势数据
export const getTransactionTrend = (dimension: string, timeRange: string) => {
  return request({
    url: '/api/v1/analytics/trend',
    method: 'get',
    params: { dimension, timeRange }
  })
}

// 渠道分析数据
export const getChannelAnalysis = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/channel',
    method: 'get',
    params: { timeRange }
  })
}

// 风控分析数据
export const getRiskAnalysis = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/risk',
    method: 'get',
    params: { timeRange }
  })
}

// 生成交易报表
export const generateTransactionReport = (params: {
  reportType: string
  timeRange: string
  format: string
}) => {
  return request({
    url: '/api/v1/analytics/report',
    method: 'post',
    data: params
  })
}

// 获取关键指标
export const getKeyMetrics = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/kpi',
    method: 'get',
    params: { timeRange }
  })
}

// 导出报表
export const exportReport = (params: {
  reportType: string
  timeRange: string
  format: string
}) => {
  return request({
    url: '/api/v1/analytics/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 获取实时统计数据
export const getRealtimeStats = () => {
  return request({
    url: '/api/v1/analytics/realtime',
    method: 'get'
  })
}

// 获取历史统计数据
export const getHistoricalStats = (params: {
  startDate: string
  endDate: string
  dimension?: string
}) => {
  return request({
    url: '/api/v1/analytics/historical',
    method: 'get',
    params
  })
}

// 获取风控统计信息
export const getRiskStatistics = (params: {
  startDate: string
  endDate: string
}) => {
  return request({
    url: '/api/v1/analytics/risk/statistics',
    method: 'get',
    params
  })
}

// 获取渠道排行榜
export const getChannelRanking = (params: {
  timeRange: string
  limit?: number
}) => {
  return request({
    url: '/api/v1/analytics/channel/ranking',
    method: 'get',
    params
  })
}

// 获取支付方式分布
export const getPaymentMethodDistribution = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/payment/distribution',
    method: 'get',
    params: { timeRange }
  })
}

// 获取地区分布数据
export const getRegionDistribution = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/region/distribution',
    method: 'get',
    params: { timeRange }
  })
}

// 获取设备类型分布
export const getDeviceDistribution = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/device/distribution',
    method: 'get',
    params: { timeRange }
  })
}

// 获取用户行为分析
export const getUserBehaviorAnalysis = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/user/behavior',
    method: 'get',
    params: { timeRange }
  })
}

// 获取转化率分析
export const getConversionAnalysis = (timeRange: string) => {
  return request({
    url: '/api/v1/analytics/conversion',
    method: 'get',
    params: { timeRange }
  })
}

// 获取自定义报表
export const getCustomReport = (params: {
  reportId: string
}) => {
  return request({
    url: '/api/v1/analytics/custom-report',
    method: 'get',
    params
  })
}

// 保存自定义报表
export const saveCustomReport = (report: {
  reportName: string
  reportConfig: any
}) => {
  return request({
    url: '/api/v1/analytics/custom-report',
    method: 'post',
    data: report
  })
}

// 删除自定义报表
export const deleteCustomReport = (reportId: string) => {
  return request({
    url: `/api/v1/analytics/custom-report/${reportId}`,
    method: 'delete'
  })
}

// 获取可用的报表模板
export const getReportTemplates = () => {
  return request({
    url: '/api/v1/analytics/templates',
    method: 'get'
  })
}

// 定时任务管理
export const getScheduledReports = () => {
  return request({
    url: '/api/v1/analytics/scheduled',
    method: 'get'
  })
}

export const createScheduledReport = (schedule: {
  reportName: string
  reportType: string
  timeRange: string
  schedule: string
  email?: string
}) => {
  return request({
    url: '/api/v1/analytics/scheduled',
    method: 'post',
    data: schedule
  })
}

export const deleteScheduledReport = (scheduleId: string) => {
  return request({
    url: `/api/v1/analytics/scheduled/${scheduleId}`,
    method: 'delete'
  })
}