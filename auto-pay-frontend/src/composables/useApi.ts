/**
 * AutoPay Payment Platform - API请求组合式函数
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import { ref, reactive, Ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios'

// API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  requestId?: string
}

// 分页响应接口
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// API错误接口
export interface ApiError {
  code: number
  message: string
  details?: any
}

// 请求参数接口
export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示loading
  showLoading?: boolean
  // loading文本
  loadingText?: string
  // 是否显示成功消息
  showSuccess?: boolean
  // 成功消息文本
  successMessage?: string
  // 是否显示错误消息
  showError?: boolean
  // 自定义错误处理
  customErrorHandler?: (error: ApiError) => boolean | void
  // 重试次数
  retryCount?: number
  // 重试延迟(毫秒)
  retryDelay?: number
}

// 组合式函数参数接口
export interface UseApiOptions {
  // 默认loading配置
  defaultShowLoading?: boolean
  defaultLoadingText?: string
  // 默认成功消息配置
  defaultShowSuccess?: boolean
  defaultSuccessMessage?: string
  // 默认错误消息配置
  defaultShowError?: boolean
  // 全局错误处理
  globalErrorHandler?: (error: ApiError) => void
  // 全局成功处理
  globalSuccessHandler?: (data: any, config: RequestConfig) => void
}

/**
 * 创建API请求组合式函数
 * @param axiosInstance Axios实例
 * @param options 配置选项
 */
export function useApi(axiosInstance: AxiosInstance, options: UseApiOptions = {}) {
  // 响应式状态
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const data = ref<any>(null)
  const requestConfig = ref<RequestConfig | null>(null)

  // 默认配置
  const defaults = {
    defaultShowLoading: false,
    defaultLoadingText: '加载中...',
    defaultShowSuccess: false,
    defaultSuccessMessage: '操作成功',
    defaultShowError: true,
    ...options
  }

  /**
   * 处理API响应
   */
  function handleResponse(response: AxiosResponse<ApiResponse>, config: RequestConfig) {
    const { data: responseData } = response
    
    // 业务成功
    if (responseData.code === 200) {
      data.value = responseData.data
      
      // 显示成功消息
      if (config.showSuccess ?? defaults.defaultShowSuccess) {
        const message = config.successMessage ?? defaults.defaultSuccessMessage
        if (message) {
          ElMessage.success(message)
        }
      }
      
      // 调用全局成功处理器
      options.globalSuccessHandler?.(responseData.data, config)
      
      return responseData.data
    } else {
      // 业务失败
      const apiError: ApiError = {
        code: responseData.code,
        message: responseData.message,
        details: responseData
      }
      
      // 自定义错误处理
      const customHandled = config.customErrorHandler?.(apiError)
      if (customHandled === true) {
        return Promise.reject(apiError)
      }
      
      // 显示错误消息
      if (config.showError ?? defaults.defaultShowError) {
        ElMessage.error(apiError.message)
      }
      
      // 全局错误处理
      options.globalErrorHandler?.(apiError)
      
      return Promise.reject(apiError)
    }
  }

  /**
   * 处理API错误
   */
  function handleError(err: AxiosError<ApiResponse>, config: RequestConfig): Promise<ApiError> {
    let apiError: ApiError

    if (err.response) {
      // 服务器响应错误
      const status = err.response.status
      const responseData = err.response.data
      
      if (responseData) {
        apiError = {
          code: responseData.code || status,
          message: responseData.message || `请求失败 (${status})`,
          details: responseData
        }
      } else {
        apiError = {
          code: status,
          message: `服务器错误 (${status})`,
          details: err.response
        }
      }
    } else if (err.request) {
      // 网络错误
      apiError = {
        code: 0,
        message: '网络连接失败，请检查网络设置',
        details: err.request
      }
    } else {
      // 其他错误
      apiError = {
        code: -1,
        message: err.message || '未知错误',
        details: err
      }
    }

    // 设置错误状态
    error.value = apiError
    
    // 显示错误消息
    if (config.showError ?? defaults.defaultShowError) {
      ElMessage.error(apiError.message)
    }
    
    // 全局错误处理
    options.globalErrorHandler?.(apiError)
    
    return Promise.reject(apiError)
  }

  /**
   * 重试请求
   */
  async function retryRequest(config: RequestConfig, retryCount: number = 0): Promise<any> {
    try {
      const response = await axiosInstance(config)
      return handleResponse(response, config)
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>
      const maxRetries = config.retryCount ?? 0
      
      if (retryCount < maxRetries) {
        const delay = config.retryDelay ?? 1000 * Math.pow(2, retryCount) // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay))
        return retryRequest(config, retryCount + 1)
      }
      
      return handleError(axiosError, config)
    }
  }

  /**
   * 发送请求
   */
  async function request<T = any>(config: RequestConfig): Promise<T> {
    // 合并默认配置
    const finalConfig: RequestConfig = {
      ...config,
      showLoading: config.showLoading ?? defaults.defaultShowLoading,
      loadingText: config.loadingText ?? defaults.defaultLoadingText,
      showSuccess: config.showSuccess ?? defaults.defaultShowSuccess,
      successMessage: config.successMessage ?? defaults.defaultSuccessMessage,
      showError: config.showError ?? defaults.defaultShowError,
    }

    // 设置加载状态
    if (finalConfig.showLoading) {
      loading.value = true
    }

    // 设置当前请求配置
    requestConfig.value = finalConfig
    error.value = null

    try {
      const result = await retryRequest(finalConfig)
      return result as T
    } finally {
      loading.value = false
    }
  }

  /**
   * GET请求
   */
  function get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>({
      url,
      method: 'GET',
      ...config
    })
  }

  /**
   * POST请求
   */
  function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT请求
   */
  function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * PATCH请求
   */
  function patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   */
  function del<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>({
      url,
      method: 'DELETE',
      ...config
    })
  }

  /**
   * 上传文件
   */
  function upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request<T>({
      url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }

  /**
   * 下载文件
   */
  function download(url: string, config?: RequestConfig): Promise<Blob> {
    return request<Blob>({
      url,
      method: 'GET',
      responseType: 'blob',
      ...config
    })
  }

  /**
   * 清空状态
   */
  function clear() {
    loading.value = false
    error.value = null
    data.value = null
    requestConfig.value = null
  }

  /**
   * 批量请求
   */
  function batch<T = any>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map(req => req()))
  }

  /**
   * 并发请求控制
   */
  async function batchWithLimit<T = any>(
    requests: Array<() => Promise<T>>, 
    limit: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<any>[] = []

    for (const request of requests) {
      const promise = request().then(result => {
        executing.splice(executing.indexOf(promise), 1)
        return result
      })
      
      results.push(promise)
      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }

    return Promise.all(results)
  }

  return {
    // 状态
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,
    data: readonly(data) as Readonly<Ref<any>>,
    requestConfig: readonly(requestConfig) as Readonly<Ref<RequestConfig | null>>,

    // 方法
    request,
    get,
    post,
    put,
    patch,
    del,
    upload,
    download,
    clear,
    batch,
    batchWithLimit
  }
}

/**
 * 创建数据获取组合式函数
 */
export function useDataFetch<T = any>(apiFunction: () => Promise<T>, options: RequestConfig = {}) {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const data = ref<T | null>(null)
  
  const fetchData = async (config: RequestConfig = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunction()
      data.value = result
      return result
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = () => fetchData(options)
  
  const clear = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    // 状态
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,
    data: readonly(data) as Readonly<Ref<T | null>>,

    // 方法
    fetchData,
    refresh,
    clear
  }
}

/**
 * 创建分页数据获取组合式函数
 */
export function usePaginatedDataFetch<T = any>(
  apiFunction: (params: any) => Promise<PaginatedResponse<T>>,
  options: RequestConfig & { 
    defaultPageSize?: number
    autoFetch?: boolean
  } = {}
) {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const data = ref<T[]>([])
  
  // 分页参数
  const currentPage = ref(1)
  const pageSize = ref(options.defaultPageSize ?? 20)
  const total = ref(0)
  const totalPages = ref(0)
  
  // 搜索参数
  const searchParams = ref<Record<string, any>>({})

  const fetchData = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const finalParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...searchParams.value,
        ...params
      }
      
      const result = await apiFunction(finalParams)
      
      if (result.data) {
        data.value = result.data.items
        total.value = result.data.total
        totalPages.value = result.data.totalPages
        currentPage.value = result.data.page
        pageSize.value = result.data.pageSize
      }
      
      return result
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  // 页码变化处理
  const handlePageChange = (page: number) => {
    currentPage.value = page
    return fetchData()
  }

  // 页面大小变化处理
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一页
    return fetchData()
  }

  // 搜索处理
  const handleSearch = (params: Record<string, any>) => {
    searchParams.value = params
    currentPage.value = 1
    return fetchData()
  }

  // 重置
  const reset = () => {
    currentPage.value = 1
    pageSize.value = options.defaultPageSize ?? 20
    searchParams.value = {}
    data.value = []
    total.value = 0
    totalPages.value = 0
    error.value = null
  }

  // 刷新当前页
  const refresh = () => {
    return fetchData()
  }

  return {
    // 状态
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,
    data: readonly(data) as Readonly<Ref<T[]>>,
    
    // 分页状态
    currentPage: readonly(currentPage) as Readonly<Ref<number>>,
    pageSize: readonly(pageSize) as Readonly<Ref<number>>,
    total: readonly(total) as Readonly<Ref<number>>,
    totalPages: readonly(totalPages) as Readonly<Ref<number>>,
    
    // 方法
    fetchData,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    reset,
    refresh
  }
}

// 工具函数：创建通知
export function createNotification() {
  const success = (title: string, message: string) => {
    ElNotification.success({ title, message })
  }

  const error = (title: string, message: string) => {
    ElNotification.error({ title, message })
  }

  const warning = (title: string, message: string) => {
    ElNotification.warning({ title, message })
  }

  const info = (title: string, message: string) => {
    ElNotification.info({ title, message })
  }

  return {
    success,
    error,
    warning,
    info
  }
}