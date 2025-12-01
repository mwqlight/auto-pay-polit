/**
 * 数据分析工具函数
 */
import type {
  TrendData,
  ChannelAnalysis,
  RiskAnalysis,
  AmountDistribution,
  HourlyStats
} from '@/types/analytics'

// 格式化数字
export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化金额
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// 格式化百分比
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

// 计算增长率
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// 获取风险等级颜色
export const getRiskLevelColor = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string => {
  const colors = {
    LOW: '#52c41a',
    MEDIUM: '#faad14',
    HIGH: '#fa8c16',
    CRITICAL: '#f5222d'
  }
  return colors[level]
}

// 获取风险等级文本
export const getRiskLevelText = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string => {
  const texts = {
    LOW: '低风险',
    MEDIUM: '中风险',
    HIGH: '高风险',
    CRITICAL: '严重风险'
  }
  return texts[level]
}

// 计算移动平均
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(0)
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / window)
    }
  }
  return result
}

// 计算标准差
export const calculateStandardDeviation = (data: number[]): number => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length
  return Math.sqrt(variance)
}

// 检测异常值
export const detectAnomalies = (data: number[], threshold: number = 2): number[] => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const stdDev = calculateStandardDeviation(data)
  const anomalies: number[] = []
  
  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev)
    if (zScore > threshold) {
      anomalies.push(index)
    }
  })
  
  return anomalies
}

// 获取时段标签
export const getHourLabel = (hour: number): string => {
  if (hour === 0) return '00:00'
  if (hour < 12) return `${hour.toString().padStart(2, '0')}:00`
  return `${hour}:00`
}

// 获取金额区间标签
export const getAmountRangeLabel = (min: number, max: number): string => {
  if (max === Infinity) return `${formatAmount(min)}+`
  return `${formatAmount(min)} - ${formatAmount(max)}`
}

// 导出数据为CSV
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 验证日期范围
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  
  return start <= end && start <= now && end <= now
}

// 获取相对日期
export const getRelativeDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

// 格式化时间范围显示
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  }
  
  if (start.getFullYear() !== end.getFullYear()) {
    formatOptions.year = 'numeric'
  }
  
  return `${start.toLocaleDateString('zh-CN', formatOptions)} - ${end.toLocaleDateString('zh-CN', formatOptions)}`
}

// 计算成功率等级
export const getSuccessRateLevel = (rate: number): 'EXCELLENT' | 'GOOD' | 'NORMAL' | 'POOR' => {
  if (rate >= 99) return 'EXCELLENT'
  if (rate >= 95) return 'GOOD'
  if (rate >= 90) return 'NORMAL'
  return 'POOR'
}

// 获取成功率等级颜色
export const getSuccessRateColor = (level: 'EXCELLENT' | 'GOOD' | 'NORMAL' | 'POOR'): string => {
  const colors = {
    EXCELLENT: '#52c41a',
    GOOD: '#1890ff',
    NORMAL: '#faad14',
    POOR: '#f5222d'
  }
  return colors[level]
}

// 获取成功率等级文本
export const getSuccessRateText = (level: 'EXCELLENT' | 'GOOD' | 'NORMAL' | 'POOR'): string => {
  const texts = {
    EXCELLENT: '优秀',
    GOOD: '良好',
    NORMAL: '一般',
    POOR: '较差'
  }
  return texts[level]
}

// 生成图表颜色
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#fa8c16', '#eb2f96', '#2f54eb', '#a0d911'
  ]
  
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  
  return colors
}

// 深度克隆对象
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}