/**
 * AutoPay Payment Platform - HTTP API 客户端
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiConfig } from '@/types'
import { ElMessage } from 'element-plus'

// 默认配置
const defaultConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  retries: 3
}

class HttpClient {
  private instance: AxiosInstance
  private config: ApiConfig

  constructor(config: ApiConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config }
    this.instance = axios.create(this.config)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加请求时间戳
        config.metadata = { startTime: Date.now() }
        
        // 添加认证token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 记录请求日志
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        
        return config
      },
      (error) => {
        console.error('[HTTP] Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data, config } = response
        const endTime = Date.now()
        const duration = endTime - (config.metadata?.startTime || endTime)

        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`, data)

        // 如果是流式响应或文件下载，直接返回
        if (config.responseType === 'blob' || config.responseType === 'stream') {
          return response
        }

        // 统一处理响应格式
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data as ApiResponse
        }

        // 兼容非标准格式
        return {
          code: response.status,
          message: 'Success',
          data: data,
          timestamp: Date.now()
        } as ApiResponse
      },
      (error) => {
        console.error('[HTTP] Response Error:', error)
        
        const { response, message } = error
        
        if (response) {
          const { status, data } = response
          
          // 处理不同HTTP状态码
          switch (status) {
            case 401:
              // 未认证，清除token并跳转到登录页
              localStorage.removeItem('token')
              window.location.href = '/login'
              ElMessage.error('登录已过期，请重新登录')
              break
              
            case 403:
              ElMessage.error('没有权限访问该资源')
              break
              
            case 404:
              ElMessage.error('请求的资源不存在')
              break
              
            case 500:
              ElMessage.error('服务器内部错误')
              break
              
            default:
              ElMessage.error(data?.message || message || '请求失败')
          }
        } else if (message.includes('timeout')) {
          ElMessage.error('请求超时，请检查网络连接')
        } else {
          ElMessage.error(message || '网络错误，请稍后重试')
        }
        
        return Promise.reject(error)
      }
    )
  }

  // GET请求
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, { params, ...config })
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config)
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }

  // 文件上传
  async upload<T = any>(url: string, file: File, params?: any): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (params) {
      Object.keys(params).forEach(key => {
        formData.append(key, params[key])
      })
    }

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // 文件下载
  async download(url: string, params?: any, filename?: string): Promise<void> {
    const response = await this.instance.get(url, { 
      params, 
      responseType: 'blob' 
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // 获取原始axios实例（用于特殊配置）
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建默认实例
const httpClient = new HttpClient()

export default httpClient