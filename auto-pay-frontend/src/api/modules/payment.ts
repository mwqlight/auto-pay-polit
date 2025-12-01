/**
 * AutoPay Payment Platform - Payment API 模块
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import http from '@/api/http'
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentOrder, 
  PaymentStatistics,
  ApiResponse 
} from '@/types'

export interface CreatePaymentRequest {
  outTradeNo: string
  totalAmount: number
  currency: string
  subject: string
  body?: string
  scene: string
  clientIp?: string
  userAgent?: string
  deviceType?: string
  expireTime?: string
  notifyUrl?: string
  returnUrl?: string
  passbackParams?: string
}

export interface PaymentListRequest {
  page?: number
  size?: number
  userId?: number
  channelCode?: string
  status?: string
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface PaymentListResponse {
  items: PaymentOrder[]
  total: number
  page: number
  size: number
  pages: number
}

/**
 * 创建支付订单
 */
export function createPayment(data: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
  return http.post('/payments', data)
}

/**
 * 查询支付状态
 */
export function queryPayment(outTradeNo: string): Promise<ApiResponse<PaymentResponse>> {
  return http.get(`/payments/${outTradeNo}/status`)
}

/**
 * 关闭支付订单
 */
export function closePayment(outTradeNo: string): Promise<ApiResponse> {
  return http.post(`/payments/${outTradeNo}/close`)
}

/**
 * 获取支付订单列表
 */
export function getPaymentList(params: PaymentListRequest): Promise<ApiResponse<PaymentListResponse>> {
  return http.get('/payments', params)
}

/**
 * 根据交易号获取支付订单
 */
export function getPaymentByTradeNo(tradeNo: string): Promise<ApiResponse<PaymentOrder>> {
  return http.get(`/payments/trade/${tradeNo}`)
}

/**
 * 根据商户订单号获取支付订单
 */
export function getPaymentByOutTradeNo(outTradeNo: string): Promise<ApiResponse<PaymentOrder>> {
  return http.get(`/payments/out-trade/${outTradeNo}`)
}

/**
 * 获取支付统计信息
 */
export function getPaymentStatistics(): Promise<ApiResponse<PaymentStatistics>> {
  return http.get('/payments/statistics')
}

/**
 * 获取今日支付统计
 */
export function getTodayStatistics(): Promise<ApiResponse> {
  return http.get('/payments/statistics/today')
}

/**
 * 获取渠道统计数据
 */
export function getChannelStatistics(startTime: string, endTime: string): Promise<ApiResponse> {
  return http.get('/payments/statistics/channel', { startTime, endTime })
}

/**
 * 获取交易趋势数据
 */
export function getTransactionTrend(period: '7d' | '30d' | '90d'): Promise<ApiResponse> {
  return http.get('/payments/trend', { period })
}

/**
 * 重新支付
 */
export function retryPayment(outTradeNo: string): Promise<ApiResponse<PaymentResponse>> {
  return http.post(`/payments/${outTradeNo}/retry`)
}

/**
 * 申请退款
 */
export function refundPayment(outTradeNo: string, amount?: number, reason?: string): Promise<ApiResponse> {
  return http.post(`/payments/${outTradeNo}/refund`, { amount, reason })
}

/**
 * 获取退款列表
 */
export function getRefundList(params: any): Promise<ApiResponse> {
  return http.get('/payments/refunds', params)
}

/**
 * 处理支付回调
 */
export function handleChannelCallback(channelCode: string, callbackData: any): Promise<ApiResponse> {
  return http.post(`/payments/callback/${channelCode}`, callbackData)
}

/**
 * 执行渠道健康检查
 */
export function performChannelHealthCheck(): Promise<ApiResponse> {
  return http.post('/payments/channels/health-check')
}

/**
 * 重试失败的支付
 */
export function retryFailedPayments(): Promise<ApiResponse> {
  return http.post('/payments/retry-failed')
}

/**
 * 导出支付数据
 */
export function exportPaymentData(params: PaymentListRequest): Promise<void> {
  return http.download('/payments/export', params, 'payment-data.xlsx')
}

/**
 * 获取支付方式配置
 */
export function getPaymentMethods(): Promise<ApiResponse> {
  return http.get('/payments/methods')
}

export default {
  createPayment,
  queryPayment,
  closePayment,
  getPaymentList,
  getPaymentByTradeNo,
  getPaymentByOutTradeNo,
  getPaymentStatistics,
  getTodayStatistics,
  getChannelStatistics,
  getTransactionTrend,
  retryPayment,
  refundPayment,
  getRefundList,
  handleChannelCallback,
  performChannelHealthCheck,
  retryFailedPayments,
  exportPaymentData,
  getPaymentMethods
}