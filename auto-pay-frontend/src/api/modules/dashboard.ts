/**
 * AutoPay Payment Platform - Dashboard API 模块
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import http from '@/api/http'
import type { ApiResponse } from '@/types'

// 仪表盘数据类型定义
export interface DashboardStats {
  todayTransactionAmount: number
  todayTransactionCount: number
  successRate: number
  activeChannels: number
  yesterdayComparison: {
    amountChange: number
    amountChangePercent: number
    countChange: number
    countChangePercent: number
    rateChange: number
  }
}

export interface TransactionTrend {
  date: string
  amount: number
  count: number
  successCount: number
  failedCount: number
}

export interface ChannelDistribution {
  channelId: number
  channelName: string
  amount: number
  count: number
  percentage: number
}

export interface RecentOrder {
  id: string
  amount: number
  status: string
  channelName: string
  createdAt: string
  customerName?: string
}

export interface ChannelStatus {
  channelId: number
  channelName: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE'
  lastCheckTime: string
  responseTime: number
  successRate: number
}

export interface SystemStatus {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  cpu: number
  memory: number
  disk: number
  activeConnections: number
  databaseStatus: 'CONNECTED' | 'DISCONNECTED'
  cacheStatus: 'CONNECTED' | 'DISCONNECTED'
}

export interface DashboardData {
  stats: DashboardStats
  trends: TransactionTrend[]
  channelDistribution: ChannelDistribution[]
  recentOrders: RecentOrder[]
  channelStatuses: ChannelStatus[]
  systemStatus: SystemStatus
}

export interface TrendResponse {
  items: TransactionTrend[]
  total: number
  summary: {
    totalAmount: number
    totalCount: number
    averageAmount: number
    growthRate: number
  }
}

export interface RealtimeData {
  currentOnlineUsers: number
  currentTransactionsPerMinute: number
  systemLoad: number
  lastUpdated: string
}

export interface DashboardListRequest {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  channelIds?: number[]
}

export interface DashboardListResponse {
  items: any[]
  total: number
  page: number
  size: number
  pages: number
}

/**
 * 获取仪表盘数据
 */
export function getDashboardData(params?: DashboardListRequest): Promise<ApiResponse<DashboardData>> {
  return http.get('/dashboard', params)
}

/**
 * 获取交易趋势数据
 */
export function getTransactionTrends(params: {
  startDate: string
  endDate: string
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH'
  channelIds?: number[]
}): Promise<ApiResponse<TrendResponse>> {
  return http.get('/dashboard/trends', params)
}

/**
 * 获取渠道分布数据
 */
export function getChannelDistribution(params?: {
  dateRange?: [string, string]
  channelIds?: number[]
}): Promise<ApiResponse<{
    items: ChannelDistribution[]
    total: number
  }>> {
  return http.get('/dashboard/channel-distribution', params)
}

/**
 * 获取最近订单
 */
export function getRecentOrders(params?: {
  limit?: number
  status?: string[]
}): Promise<ApiResponse<{
    items: RecentOrder[]
    total: number
  }>> {
  return http.get('/dashboard/recent-orders', params)
}

/**
 * 获取渠道状态
 */
export function getChannelStatuses(): Promise<ApiResponse<{
  items: ChannelStatus[]
  total: number
}>> {
  return http.get('/dashboard/channel-statuses')
}

/**
 * 获取系统状态
 */
export function getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
  return http.get('/dashboard/system-status')
}

/**
 * 获取实时数据刷新
 */
export function getRealtimeData(): Promise<ApiResponse<RealtimeData>> {
  return http.get('/dashboard/realtime')
}

/**
 * 导出统计数据
 */
export function exportStatistics(params: {
  type: 'dashboard' | 'transactions' | 'channels'
  startDate: string
  endDate: string
  format: 'excel' | 'csv' | 'pdf'
  channelIds?: number[]
}): Promise<void> {
  return http.download('/dashboard/export', params, `dashboard-${params.type}.${params.format}`)
}

export default {
  getDashboardData,
  getTransactionTrends,
  getChannelDistribution,
  getRecentOrders,
  getChannelStatuses,
  getSystemStatus,
  getRealtimeData,
  exportStatistics
}