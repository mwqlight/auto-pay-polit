/**
 * AutoPay Payment Platform - API 统一出口
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useApi } from '@/composables/useApi'

// 导出模块API
export { default as userApi } from './modules/user'
export { default as paymentApi } from './modules/payment'
export { default as channelApi } from './modules/paymentChannel'
export { default as dashboardApi } from './modules/dashboard'
export { default as systemApi } from './modules/system'

// API基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// 超时配置
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

// 创建Axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID
    config.headers['X-Request-ID'] = generateRequestId()
    
    // 添加时间戳
    config.headers['X-Client-Time'] = Date.now().toString()
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
    
    // 处理文件下载
    if (response.config.responseType === 'blob') {
      return response
    }
    
    // 统一响应格式处理
    if (response.data && typeof response.data === 'object') {
      // 如果已经包含标准响应格式，直接返回
      if ('code' in response.data && 'message' in response.data && 'data' in response.data) {
        return response
      }
      
      // 否则包装为标准格式
      return {
        ...response,
        data: {
          code: 200,
          message: 'success',
          data: response.data,
          timestamp: Date.now()
        }
      }
    }
    
    return response
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message)
    
    // 处理认证错误
    if (error.response?.status === 401) {
      // 清除认证信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // 处理权限错误
    if (error.response?.status === 403) {
      console.warn('访问被拒绝')
    }
    
    // 处理服务器错误
    if (error.response?.status >= 500) {
      console.error('服务器内部错误')
    }
    
    return Promise.reject(error)
  }
)

// 生成请求ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 创建API实例
export const api = useApi(axiosInstance, {
  // 全局配置
  defaultShowLoading: false,
  defaultLoadingText: '加载中...',
  defaultShowSuccess: false,
  defaultShowError: true,
  
  // 全局错误处理
  globalErrorHandler: (error) => {
    // 记录错误日志
    console.error('[Global Error Handler]', error)
    
    // 可以发送错误日志到监控系统
    if (error.code !== 200) {
      // 错误统计
      // errorTracker.report(error)
    }
  },
  
  // 全局成功处理
  globalSuccessHandler: (data, config) => {
    // 可以记录成功请求日志
    if (config.url) {
      console.log(`[API Success] ${config.method?.toUpperCase()} ${config.url}`)
    }
  }
})

// 导出实例和配置
export { axiosInstance }
export default api

// API端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify'
  },
  
  // 用户管理
  USER: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    RESET_PASSWORD: '/users/reset-password'
  },
  
  // 支付渠道
  CHANNEL: {
    LIST: '/channels',
    DETAIL: (id: number) => `/channels/${id}`,
    CREATE: '/channels',
    UPDATE: (id: number) => `/channels/${id}`,
    DELETE: (id: number) => `/channels/${id}`,
    TEST: (id: number) => `/channels/${id}/test`,
    TOGGLE_STATUS: (id: number) => `/channels/${id}/toggle-status`,
    METRICS: (id: number) => `/channels/${id}/metrics`,
    HEALTH_CHECK: (id: number) => `/channels/${id}/health`,
    PERFORMANCE: (id: number) => `/channels/${id}/performance`
  },
  
  // 支付订单
  PAYMENT: {
    LIST: '/payments',
    DETAIL: (id: number) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id: number) => `/payments/${id}`,
    DELETE: (id: number) => `/payments/${id}`,
    QUERY: (id: number) => `/payments/${id}/query`,
    CLOSE: (id: number) => `/payments/${id}/close`,
    REFUND: (id: number) => `/payments/${id}/refund`,
    CANCEL: (id: number) => `/payments/${id}/cancel`,
    STATISTICS: '/payments/statistics',
    EXPORT: '/payments/export',
    BATCH_DELETE: '/payments/batch-delete',
    BATCH_CLOSE: '/payments/batch-close'
  },
  
  // 统计数据
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
    TRANSACTION: '/statistics/transaction',
    CHANNEL: '/statistics/channel',
    TREND: '/statistics/trend',
    EXPORT: '/statistics/export'
  },
  
  // 系统配置
  SYSTEM: {
    CONFIG: '/system/config',
    HEALTH: '/system/health',
    METRICS: '/system/metrics',
    LOGS: '/system/logs',
    MAINTENANCE: '/system/maintenance'
  },
  
  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    AVATAR: '/upload/avatar'
  },
  
  // 导出
  EXPORT: {
    PAYMENTS: '/export/payments',
    STATISTICS: '/export/statistics',
    REPORTS: '/export/reports'
  }
}

// 请求配置常量
export const REQUEST_CONFIG = {
  // 通用配置
  COMMON: {
    showLoading: false,
    showError: true,
    retryCount: 2,
    retryDelay: 1000
  },
  
  // 列表请求配置
  LIST: {
    showLoading: true,
    showSuccess: false,
    showError: true
  },
  
  // 创建请求配置
  CREATE: {
    showLoading: true,
    showSuccess: true,
    successMessage: '创建成功',
    showError: true
  },
  
  // 更新请求配置
  UPDATE: {
    showLoading: true,
    showSuccess: true,
    successMessage: '更新成功',
    showError: true
  },
  
  // 删除请求配置
  DELETE: {
    showLoading: true,
    showSuccess: true,
    successMessage: '删除成功',
    showError: true
  },
  
  // 查询请求配置
  QUERY: {
    showLoading: false,
    showSuccess: false,
    showError: true
  },
  
  // 导出请求配置
  EXPORT: {
    showLoading: true,
    showSuccess: true,
    successMessage: '导出开始，请稍后查看下载',
    showError: true
  },
  
  // 上传请求配置
  UPLOAD: {
    showLoading: true,
    showSuccess: true,
    successMessage: '上传成功',
    showError: true
  }
}

// 错误码定义
export const ERROR_CODES = {
  // 成功
  SUCCESS: 200,
  
  // 客户端错误
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  
  // 服务器错误
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  
  // 业务错误码范围
  BUSINESS_ERROR_START: 10000,
  USER_NOT_FOUND: 10001,
  USER_DISABLED: 10002,
  INVALID_CREDENTIALS: 10003,
  TOKEN_EXPIRED: 10004,
  TOKEN_INVALID: 10005,
  
  CHANNEL_NOT_FOUND: 20001,
  CHANNEL_DISABLED: 20002,
  CHANNEL_CONFIG_ERROR: 20003,
  CHANNEL_CONNECTION_FAILED: 20004,
  
  PAYMENT_NOT_FOUND: 30001,
  PAYMENT_INVALID_STATUS: 30002,
  PAYMENT_AMOUNT_INVALID: 30003,
  PAYMENT_CURRENCY_INVALID: 30004,
  
  INSUFFICIENT_FUNDS: 40001,
  DAILY_LIMIT_EXCEEDED: 40002,
  MONTHLY_LIMIT_EXCEEDED: 40003,
  SUSPICIOUS_TRANSACTION: 40004
}

// 错误信息映射
export const ERROR_MESSAGES: Record<number, string> = {
  [ERROR_CODES.SUCCESS]: '操作成功',
  
  [ERROR_CODES.BAD_REQUEST]: '请求参数错误',
  [ERROR_CODES.UNAUTHORIZED]: '未授权访问',
  [ERROR_CODES.FORBIDDEN]: '访问被禁止',
  [ERROR_CODES.NOT_FOUND]: '资源不存在',
  [ERROR_CODES.METHOD_NOT_ALLOWED]: '请求方法不支持',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ERROR_CODES.BAD_GATEWAY]: '网关错误',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务不可用',
  
  // 业务错误信息
  [ERROR_CODES.USER_NOT_FOUND]: '用户不存在',
  [ERROR_CODES.USER_DISABLED]: '用户已被禁用',
  [ERROR_CODES.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ERROR_CODES.TOKEN_EXPIRED]: '认证令牌已过期',
  [ERROR_CODES.TOKEN_INVALID]: '认证令牌无效',
  
  [ERROR_CODES.CHANNEL_NOT_FOUND]: '支付渠道不存在',
  [ERROR_CODES.CHANNEL_DISABLED]: '支付渠道已被禁用',
  [ERROR_CODES.CHANNEL_CONFIG_ERROR]: '支付渠道配置错误',
  [ERROR_CODES.CHANNEL_CONNECTION_FAILED]: '支付渠道连接失败',
  
  [ERROR_CODES.PAYMENT_NOT_FOUND]: '支付订单不存在',
  [ERROR_CODES.PAYMENT_INVALID_STATUS]: '支付订单状态无效',
  [ERROR_CODES.PAYMENT_AMOUNT_INVALID]: '支付金额无效',
  [ERROR_CODES.PAYMENT_CURRENCY_INVALID]: '支付币种无效',
  
  [ERROR_CODES.INSUFFICIENT_FUNDS]: '余额不足',
  [ERROR_CODES.DAILY_LIMIT_EXCEEDED]: '超过日限额',
  [ERROR_CODES.MONTHLY_LIMIT_EXCEEDED]: '超过月限额',
  [ERROR_CODES.SUSPICIOUS_TRANSACTION]: '疑似欺诈交易'
}

// 状态码映射
export const STATUS_MESSAGES: Record<string, string> = {
  // 订单状态
  'PENDING': '待支付',
  'PROCESSING': '处理中',
  'SUCCESS': '支付成功',
  'FAILED': '支付失败',
  'CANCELLED': '已取消',
  'CLOSED': '已关闭',
  'REFUNDED': '已退款',
  'PARTIAL_REFUND': '部分退款',
  
  // 渠道状态
  'ACTIVE': '启用',
  'INACTIVE': '停用',
  'MAINTENANCE': '维护中',
  'ERROR': '异常',
  
  // 用户状态
  'ENABLED': '启用',
  'DISABLED': '禁用',
  'LOCKED': '锁定'
}