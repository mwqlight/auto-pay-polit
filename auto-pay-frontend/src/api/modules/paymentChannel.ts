/**
 * AutoPay Payment Platform - Payment Channel API 模块
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import http from '@/api/http'
import type { PaymentChannel, ApiResponse } from '@/types'

export interface ChannelCreateRequest {
  channelCode: string
  channelName: string
  channelType: string
  paymentScene: string[] // JSON字符串格式
  priority: number
  status: number
  minAmount: number
  maxAmount?: number
  feeRate?: number
  singleDayLimit?: number
  singleMonthLimit?: number
  singleYearLimit?: number
  config: string // JSON格式的渠道配置
  description?: string
}

export interface ChannelUpdateRequest {
  channelName?: string
  paymentScene?: string[]
  priority?: number
  status?: number
  minAmount?: number
  maxAmount?: number
  feeRate?: number
  singleDayLimit?: number
  singleMonthLimit?: number
  singleYearLimit?: number
  config?: string
  description?: string
}

export interface ChannelListRequest {
  page?: number
  size?: number
  channelCode?: string
  channelType?: string
  status?: number
  healthStatus?: string
  keyword?: string
}

export interface ChannelListResponse {
  items: PaymentChannel[]
  total: number
  page: number
  size: number
  pages: number
}

/**
 * 获取支付渠道列表
 */
export function getChannelList(params: ChannelListRequest): Promise<ApiResponse<ChannelListResponse>> {
  return http.get('/channels', params)
}

/**
 * 根据ID获取支付渠道
 */
export function getChannelById(id: number): Promise<ApiResponse<PaymentChannel>> {
  return http.get(`/channels/${id}`)
}

/**
 * 根据渠道编码获取支付渠道
 */
export function getChannelByCode(channelCode: string): Promise<ApiResponse<PaymentChannel>> {
  return http.get(`/channels/code/${channelCode}`)
}

/**
 * 创建支付渠道
 */
export function createChannel(data: ChannelCreateRequest): Promise<ApiResponse<PaymentChannel>> {
  return http.post('/channels', data)
}

/**
 * 更新支付渠道
 */
export function updateChannel(id: number, data: ChannelUpdateRequest): Promise<ApiResponse<PaymentChannel>> {
  return http.put(`/channels/${id}`, data)
}

/**
 * 删除支付渠道
 */
export function deleteChannel(id: number): Promise<ApiResponse> {
  return http.delete(`/channels/${id}`)
}

/**
 * 启用/禁用支付渠道
 */
export function toggleChannelStatus(id: number, enabled: boolean): Promise<ApiResponse> {
  return http.post(`/channels/${id}/toggle-status`, { enabled })
}

/**
 * 获取启用的支付渠道
 */
export function getEnabledChannels(): Promise<ApiResponse<PaymentChannel[]>> {
  return http.get('/channels/enabled')
}

/**
 * 获取健康的支付渠道
 */
export function getHealthyChannels(): Promise<ApiResponse<PaymentChannel[]>> {
  return http.get('/channels/healthy')
}

/**
 * 获取渠道统计数据
 */
export function getChannelStatistics(startTime: string, endTime: string): Promise<ApiResponse> {
  return http.get('/channels/statistics', { startTime, endTime })
}

/**
 * 执行渠道健康检查
 */
export function performChannelHealthCheck(channelId?: number): Promise<ApiResponse> {
  return http.post('/channels/health-check', { channelId })
}

/**
 * 重置渠道健康状态
 */
export function resetChannelHealthStatus(id: number): Promise<ApiResponse> {
  return http.post(`/channels/${id}/reset-health`)
}

/**
 * 更新渠道优先级
 */
export function updateChannelPriority(id: number, priority: number): Promise<ApiResponse> {
  return http.post(`/channels/${id}/priority`, { priority })
}

/**
 * 测试渠道配置
 */
export function testChannelConfig(id: number, testData?: any): Promise<ApiResponse> {
  return http.post(`/channels/${id}/test-config`, testData)
}

/**
 * 批量启用/禁用渠道
 */
export function batchToggleChannels(channelIds: number[], enabled: boolean): Promise<ApiResponse> {
  return http.post('/channels/batch-toggle', { channelIds, enabled })
}

/**
 * 获取渠道配置模板
 */
export function getChannelConfigTemplate(channelType: string): Promise<ApiResponse> {
  return http.get(`/channels/config-template/${channelType}`)
}

/**
 * 获取渠道类型列表
 */
export function getChannelTypes(): Promise<ApiResponse> {
  return http.get('/channels/types')
}

/**
 * 获取支付场景列表
 */
export function getPaymentScenes(): Promise<ApiResponse> {
  return http.get('/channels/payment-scenes')
}

/**
 * 获取渠道健康检查日志
 */
export function getChannelHealthLogs(channelId: number, page?: number, size?: number): Promise<ApiResponse> {
  return http.get(`/channels/${channelId}/health-logs`, { page, size })
}

export default {
  getChannelList,
  getChannelById,
  getChannelByCode,
  createChannel,
  updateChannel,
  deleteChannel,
  toggleChannelStatus,
  getEnabledChannels,
  getHealthyChannels,
  getChannelStatistics,
  performChannelHealthCheck,
  resetChannelHealthStatus,
  updateChannelPriority,
  testChannelConfig,
  batchToggleChannels,
  getChannelConfigTemplate,
  getChannelTypes,
  getPaymentScenes,
  getChannelHealthLogs
}