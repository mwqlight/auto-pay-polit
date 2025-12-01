/**
 * AutoPay Payment Platform - 统计分析API模块
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import http from '@/api/http'
import type { ApiResponse } from '@/types'

// 统计分析类型定义
export interface DateRange {
  startDate: string
  endDate: string
}

export interface ChannelFilter {
  channelIds?: number[]
  channelTypes?: string[]
}

export interface StatisticsQueryParams extends DateRange, ChannelFilter {
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH'
  groupBy?: 'CHANNEL' | 'STATUS' | 'SCENE' | 'TIME'
}

export interface TransactionStatistics {
  date: string
  totalAmount: number
  totalCount: number
  successAmount: number
  successCount: number
  failureAmount: number
  failureCount: number
  refundAmount: number
  refundCount: number
  feeAmount: number
  successRate: number
}

export interface ChannelStatistics {
  channelId: number
  channelCode: string
  channelName: string
  channelType: string
  totalAmount: number
  totalCount: number
  successAmount: number
  successCount: number
  successRate: number
  avgAmount: number
  feeAmount: number
  avgResponseTime: number
}

export interface StatusStatistics {
  status: string
  statusName: string
  count: number
  amount: number
  percentage: number
}

export interface SceneStatistics {
  scene: string
  sceneName: string
  count: number
  amount: number
  percentage: number
}

export interface TopMerchants {
  merchantId: number
  merchantName: string
  totalAmount: number
  totalCount: number
  successCount: number
  successRate: number
}

export interface ErrorAnalysis {
  errorCode: string
  errorMessage: string
  count: number
  percentage: number
  channels: string[]
  lastOccurTime: string
}

export interface PerformanceMetrics {
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  throughput: number
  errorRate: number
  availability: number
}

export interface ReportConfig {
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  name: string
  description?: string
  schedule?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  recipients?: string[]
  enabled: boolean
}

export interface ExportRequest {
  type: 'transactions' | 'channels' | 'summary'
  format: 'excel' | 'csv' | 'pdf'
  params: StatisticsQueryParams
  fileName?: string
}

export interface StatisticsSummary {
  totalAmount: number
  totalCount: number
  successRate: number
  avgAmount: number
  totalFee: number
  growthRate: number
  growthAmount: number
}

// 列表响应类型
export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

/**
 * 获取交易统计
 */
export function getTransactionStatistics(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<TransactionStatistics>>> {
  return http.get('/statistics/transactions', params)
}

/**
 * 获取渠道统计
 */
export function getChannelStatistics(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<ChannelStatistics>>> {
  return http.get('/statistics/channels', params)
}

/**
 * 获取状态统计
 */
export function getStatusStatistics(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<StatusStatistics>>> {
  return http.get('/statistics/status', params)
}

/**
 * 获取支付场景统计
 */
export function getSceneStatistics(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<SceneStatistics>>> {
  return http.get('/statistics/scenes', params)
}

/**
 * 获取交易趋势数据
 */
export function getTransactionTrends(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<TransactionStatistics>>> {
  return http.get('/statistics/trends', params)
}

/**
 * 获取商户排行
 */
export function getTopMerchants(params: StatisticsQueryParams & {
  limit?: number
  sortBy?: 'amount' | 'count' | 'rate'
}): Promise<ApiResponse<ListResponse<TopMerchants>>> {
  return http.get('/statistics/top-merchants', params)
}

/**
 * 获取错误分析
 */
export function getErrorAnalysis(params: StatisticsQueryParams): Promise<ApiResponse<ListResponse<ErrorAnalysis>>> {
  return http.get('/statistics/errors', params)
}

/**
 * 获取性能指标
 */
export function getPerformanceMetrics(params: StatisticsQueryParams): Promise<ApiResponse<PerformanceMetrics>> {
  return http.get('/statistics/performance', params)
}

/**
 * 获取统计概览
 */
export function getStatisticsSummary(params: StatisticsQueryParams): Promise<ApiResponse<StatisticsSummary>> {
  return http.get('/statistics/summary', params)
}

/**
 * 获取实时统计
 */
export function getRealTimeStatistics(): Promise<ApiResponse<{
  currentOnline: number
  todayTransactions: number
  todayAmount: number
  successRate: number
  avgResponseTime: number
}>> {
  return http.get('/statistics/realtime')
}

/**
 * 获取时间段对比数据
 */
export function getComparisonData(params: {
  currentPeriod: DateRange
  previousPeriod: DateRange
  channelIds?: number[]
}): Promise<ApiResponse<{
  current: StatisticsSummary
  previous: StatisticsSummary
  comparison: {
    amountGrowth: number
    amountGrowthPercent: number
    countGrowth: number
    countGrowthPercent: number
    rateChange: number
  }
}>> {
  return http.get('/statistics/comparison', params)
}

/**
 * 获取渠道健康度统计
 */
export function getChannelHealthStatistics(params: StatisticsQueryParams): Promise<ApiResponse<{
  healthyChannels: number
  unhealthyChannels: number
  avgResponseTime: number
  availability: number
  channelDetails: Array<{
    channelId: number
    channelName: string
    status: 'HEALTHY' | 'WARNING' | 'ERROR'
    responseTime: number
    successRate: number
    lastCheckTime: string
  }>
}>> {
  return http.get('/statistics/channel-health', params)
}

/**
 * 获取异常交易统计
 */
export function getExceptionStatistics(params: StatisticsQueryParams): Promise<ApiResponse<{
  totalExceptions: number
  exceptionRate: number
  topExceptions: ListResponse<ErrorAnalysis>
  exceptionsByHour: Array<{
    hour: number
    count: number
  }>
}>> {
  return http.get('/statistics/exceptions', params)
}

/**
 * 获取支付渠道配置统计
 */
export function getChannelConfigStatistics(): Promise<ApiResponse<{
  totalChannels: number
  enabledChannels: number
  channelTypes: Array<{
    type: string
    count: number
    enabledCount: number
  }>
  scenes: Array<{
    scene: string
    sceneName: string
    channelCount: number
    enabledChannelCount: number
  }>
}>> {
  return http.get('/statistics/channel-config')
}

/**
 * 创建定时报告
 */
export function createScheduledReport(report: ReportConfig): Promise<ApiResponse<ReportConfig>> {
  return http.post('/statistics/reports/scheduled', report)
}

/**
 * 获取定时报告列表
 */
export function getScheduledReports(): Promise<ApiResponse<ListResponse<ReportConfig>>> {
  return http.get('/statistics/reports/scheduled')
}

/**
 * 更新定时报告
 */
export function updateScheduledReport(id: number, report: Partial<ReportConfig>): Promise<ApiResponse<ReportConfig>> {
  return http.put(`/statistics/reports/scheduled/${id}`, report)
}

/**
 * 删除定时报告
 */
export function deleteScheduledReport(id: number): Promise<ApiResponse> {
  return http.delete(`/statistics/reports/scheduled/${id}`)
}

/**
 * 立即生成报告
 */
export function generateReportNow(config: Omit<ReportConfig, 'id' | 'schedule'>): Promise<ApiResponse<{
  reportId: string
  downloadUrl: string
  generatedAt: string
}>> {
  return http.post('/statistics/reports/generate', config)
}

/**
 * 导出统计报表
 */
export function exportStatistics(params: ExportRequest): Promise<void> {
  const fileName = params.fileName || `${params.type}-statistics-${Date.now()}.${params.format}`
  return http.download('/statistics/export', params, fileName)
}

/**
 * 获取报表模板列表
 */
export function getReportTemplates(): Promise<ApiResponse<Array<{
  id: string
  name: string
  description: string
  type: string
  defaultParams: any
}>>> {
  return http.get('/statistics/report-templates')
}

export default {
  getTransactionStatistics,
  getChannelStatistics,
  getStatusStatistics,
  getSceneStatistics,
  getTransactionTrends,
  getTopMerchants,
  getErrorAnalysis,
  getPerformanceMetrics,
  getStatisticsSummary,
  getRealTimeStatistics,
  getComparisonData,
  getChannelHealthStatistics,
  getExceptionStatistics,
  getChannelConfigStatistics,
  createScheduledReport,
  getScheduledReports,
  updateScheduledReport,
  deleteScheduledReport,
  generateReportNow,
  exportStatistics,
  getReportTemplates
}