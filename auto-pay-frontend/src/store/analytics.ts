import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DateRange,
  TransactionOverview,
  TrendData,
  ChannelAnalysis,
  RiskAnalysis,
  RealTimeMetrics,
  AlertConfig,
  AmountDistribution,
  HourlyStats
} from '@/types/analytics'
import * as analyticsApi from '@/api/modules/analytics'

export const useAnalyticsStore = defineStore('analytics', () => {
  // 状态
  const overview = ref<TransactionOverview | null>(null)
  const trendData = ref<TrendData[]>([])
  const channelAnalysis = ref<ChannelAnalysis[]>([])
  const riskAnalysis = ref<RiskAnalysis | null>(null)
  const realTimeMetrics = ref<RealTimeMetrics | null>(null)
  const amountDistribution = ref<AmountDistribution[]>([])
  const hourlyStats = ref<HourlyStats[]>([])
  const alerts = ref<AlertConfig[]>([])
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 时间范围
  const dateRange = ref<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  // 计算属性
  const totalTransactions = computed(() => overview.value?.totalTransactions || 0)
  const totalAmount = computed(() => overview.value?.totalAmount || 0)
  const successRate = computed(() => overview.value?.successRate || 0)
  const blockRate = computed(() => riskAnalysis.value?.blockRate || 0)
  
  // 图表数据
  const trendChartData = computed(() => ({
    dates: trendData.value.map(item => item.date),
    transactions: trendData.value.map(item => item.transactionCount),
    amounts: trendData.value.map(item => item.amount),
    successRates: trendData.value.map(item => item.successRate)
  }))
  
  const channelChartData = computed(() => ({
    names: channelAnalysis.value.map(item => item.channelName),
    transactions: channelAnalysis.value.map(item => item.totalTransactions),
    successRates: channelAnalysis.value.map(item => item.successRate),
    marketShare: channelAnalysis.value.map(item => item.marketShare)
  }))
  
  const hourlyChartData = computed(() => ({
    hours: hourlyStats.value.map(item => item.hour),
    transactions: hourlyStats.value.map(item => item.transactions),
    amounts: hourlyStats.value.map(item => item.amount)
  }))
  
  // Actions
  const setDateRange = (range: DateRange) => {
    dateRange.value = range
  }
  
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
    if (isLoading) {
      error.value = null
    }
  }
  
  const setError = (err: string | null) => {
    error.value = err
    loading.value = false
  }
  
  // 获取交易概览
  const fetchOverview = async () => {
    try {
      setLoading(true)
      const data = await analyticsApi.getTransactionOverview(dateRange.value)
      overview.value = data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易概览失败')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // 获取趋势数据
  const fetchTrendData = async (type: 'daily' | 'monthly' = 'daily') => {
    try {
      const data = await analyticsApi.getTransactionTrend(dateRange.value, type)
      trendData.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取趋势数据失败')
      throw err
    }
  }
  
  // 获取渠道分析
  const fetchChannelAnalysis = async () => {
    try {
      const data = await analyticsApi.getChannelAnalysis(dateRange.value)
      channelAnalysis.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取渠道分析失败')
      throw err
    }
  }
  
  // 获取风控分析
  const fetchRiskAnalysis = async () => {
    try {
      const data = await analyticsApi.getRiskAnalysis(dateRange.value)
      riskAnalysis.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取风控分析失败')
      throw err
    }
  }
  
  // 获取实时指标
  const fetchRealTimeMetrics = async () => {
    try {
      const data = await analyticsApi.getRealTimeMetrics()
      realTimeMetrics.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取实时指标失败')
      throw err
    }
  }
  
  // 获取金额分布
  const fetchAmountDistribution = async () => {
    try {
      const data = await analyticsApi.getAmountDistribution(dateRange.value)
      amountDistribution.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取金额分布失败')
      throw err
    }
  }
  
  // 获取时段统计
  const fetchHourlyStats = async () => {
    try {
      const data = await analyticsApi.getHourlyStats(dateRange.value)
      hourlyStats.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取时段统计失败')
      throw err
    }
  }
  
  // 生成报表
  const generateReport = async (config: any) => {
    try {
      setLoading(true)
      const response = await analyticsApi.generateReport(config)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成报表失败')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  // 获取告警配置
  const fetchAlerts = async () => {
    try {
      const data = await analyticsApi.getAlerts()
      alerts.value = data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取告警配置失败')
      throw err
    }
  }
  
  // 创建告警
  const createAlert = async (alert: Omit<AlertConfig, 'id'>) => {
    try {
      const data = await analyticsApi.createAlert(alert)
      alerts.value.push(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建告警失败')
      throw err
    }
  }
  
  // 更新告警
  const updateAlert = async (id: string, alert: Partial<AlertConfig>) => {
    try {
      const data = await analyticsApi.updateAlert(id, alert)
      const index = alerts.value.findIndex(a => a.id === id)
      if (index !== -1) {
        alerts.value[index] = data
      }
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新告警失败')
      throw err
    }
  }
  
  // 删除告警
  const deleteAlert = async (id: string) => {
    try {
      await analyticsApi.deleteAlert(id)
      const index = alerts.value.findIndex(a => a.id === id)
      if (index !== -1) {
        alerts.value.splice(index, 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除告警失败')
      throw err
    }
  }
  
  // 清除错误
  const clearError = () => {
    error.value = null
  }
  
  // 重置状态
  const reset = () => {
    overview.value = null
    trendData.value = []
    channelAnalysis.value = []
    riskAnalysis.value = null
    realTimeMetrics.value = null
    amountDistribution.value = []
    hourlyStats.value = []
    alerts.value = []
    loading.value = false
    error.value = null
  }
  
  return {
    // 状态
    overview,
    trendData,
    channelAnalysis,
    riskAnalysis,
    realTimeMetrics,
    amountDistribution,
    hourlyStats,
    alerts,
    loading,
    error,
    dateRange,
    
    // 计算属性
    totalTransactions,
    totalAmount,
    successRate,
    blockRate,
    trendChartData,
    channelChartData,
    hourlyChartData,
    
    // Actions
    setDateRange,
    setLoading,
    setError,
    clearError,
    reset,
    fetchOverview,
    fetchTrendData,
    fetchChannelAnalysis,
    fetchRiskAnalysis,
    fetchRealTimeMetrics,
    fetchAmountDistribution,
    fetchHourlyStats,
    generateReport,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})