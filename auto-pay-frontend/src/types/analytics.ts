/**
 * 数据分析相关类型定义
 */

// 基础数据类型
export interface DateRange {
  startDate: string
  endDate: string
}

export interface ChartData {
  xAxis: string[]
  yAxis: number[]
  series: {
    name: string
    data: number[]
  }[]
}

// KPI指标
export interface KPIMetrics {
  totalTransactions: number
  totalAmount: number
  successRate: number
  averageAmount: number
  dailyGrowth: number
  channelCount: number
}

// 交易概览
export interface TransactionOverview {
  totalTransactions: number
  totalAmount: number
  successCount: number
  failureCount: number
  successRate: number
  averageAmount: number
  peakHour: number
  peakHourCount: number
  todayTransactions: number
  todayAmount: number
  weeklyGrowth: number
  monthlyGrowth: number
}

// 趋势数据
export interface TrendData {
  date: string
  transactionCount: number
  amount: number
  successRate: number
}

// 渠道分析
export interface ChannelAnalysis {
  channelId: string
  channelName: string
  totalTransactions: number
  totalAmount: number
  successRate: number
  averageAmount: number
  failureCount: number
  marketShare: number
  growthRate: number
}

// 风控分析
export interface RiskAnalysis {
  totalChecks: number
  passedCount: number
  blockedCount: number
  blockRate: number
  riskLevels: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    count: number
    percentage: number
  }[]
  topRiskRules: {
    ruleId: string
    ruleName: string
    triggerCount: number
    blockRate: number
  }[]
  riskTrend: {
    date: string
    riskScore: number
    blockCount: number
  }[]
}

// 报表配置
export interface ReportConfig {
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  dateRange: DateRange
  metrics: string[]
  channels: string[]
  groupBy: 'DATE' | 'CHANNEL' | 'STATUS' | 'AMOUNT_RANGE'
  format: 'PDF' | 'EXCEL' | 'CSV'
  email?: string
}

// 实时监控
export interface RealTimeMetrics {
  currentTime: string
  activeTransactions: number
  todayTotal: number
  successRate: number
  avgResponseTime: number
  systemStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  topChannels: {
    name: string
    transactions: number
    successRate: number
  }[]
}

// 告警配置
export interface AlertConfig {
  id: string
  name: string
  metric: string
  condition: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS'
  threshold: number
  enabled: boolean
  channels: ('EMAIL' | 'SMS' | 'WEBHOOK')[]
  recipients: string[]
}

// 金额分布
export interface AmountDistribution {
  range: string
  count: number
  percentage: number
  amount: number
}

// 时段统计
export interface HourlyStats {
  hour: number
  transactions: number
  amount: number
  successRate: number
}

// 用户行为分析
export interface UserBehaviorAnalysis {
  userId: string
  totalTransactions: number
  averageAmount: number
  riskScore: number
  lastActivity: string
  preferredChannels: string[]
  transactionPattern: 'FREQUENT' | 'OCCASIONAL' | 'RARE'
}