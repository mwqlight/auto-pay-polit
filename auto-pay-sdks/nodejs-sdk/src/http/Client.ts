import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SDKConfig, RequestOptions, ApiResponse, ErrorInfo } from '../types';

/**
 * AutoPay SDK 异常类
 */
export class AutoPayException extends Error {
  public readonly code: number;
  public readonly status: number;
  public readonly requestId?: string;
  public readonly details?: any;

  constructor(
    message: string,
    code: number = 500,
    status: number = 500,
    requestId?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AutoPayException';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;

    // 保持错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AutoPayException);
    }
  }

  /**
   * 创建网络错误
   */
  static networkError(message: string, error?: any): AutoPayException {
    return new AutoPayException(
      `网络错误: ${message}`,
      10001,
      0,
      undefined,
      error?.message || error
    );
  }

  /**
   * 创建超时错误
   */
  static timeoutError(message: string = '请求超时'): AutoPayException {
    return new AutoPayException(
      `超时错误: ${message}`,
      10002,
      408
    );
  }

  /**
   * 创建认证错误
   */
  static authenticationError(message: string = '认证失败'): AutoPayException {
    return new AutoPayException(
      `认证错误: ${message}`,
      10003,
      401
    );
  }

  /**
   * 创建授权错误
   */
  static authorizationError(message: string = '授权失败'): AutoPayException {
    return new AutoPayException(
      `授权错误: ${message}`,
      10004,
      403
    );
  }

  /**
   * 创建业务错误
   */
  static businessError(
    message: string,
    code: number = 10005,
    details?: any
  ): AutoPayException {
    return new AutoPayException(
      `业务错误: ${message}`,
      code,
      400,
      undefined,
      details
    );
  }

  /**
   * 创建服务器错误
   */
  static serverError(
    message: string = '服务器内部错误',
    status: number = 500
  ): AutoPayException {
    return new AutoPayException(
      `服务器错误: ${message}`,
      10006,
      status
    );
  }

  /**
   * 转换为ErrorInfo
   */
  toErrorInfo(): ErrorInfo {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      requestId: this.requestId,
      timestamp: Date.now()
    };
  }
}

/**
 * HTTP客户端类
 */
export class HttpClient {
  private readonly config: SDKConfig;
  private readonly instance: any;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(config: SDKConfig) {
    this.config = config;
    this.maxRetries = 3;
    this.retryDelay = 1000;

    // 创建axios实例
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent || 'AutoPay Node.js SDK/1.0.0',
        'X-API-Key': config.apiKey,
        ...config.headers
      },
      // 响应拦截器
      transformResponse: [(data: any) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
          return data;
        }
      }]
    });

    // 设置拦截器
    this.setupInterceptors();
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // 添加请求时间戳
        config.headers = {
          ...config.headers,
          'X-Request-Time': Date.now().toString(),
        };

        // 记录请求日志
        if (this.config.enableLogging) {
          console.log(`[AutoPay] 请求: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error: any) => {
        if (this.config.enableLogging) {
          console.error('[AutoPay] 请求错误:', error);
        }
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 记录响应日志
        if (this.config.enableLogging) {
          console.log(`[AutoPay] 响应: ${response.status} ${response.config.url}`);
        }

        // 检查响应状态
        if (response.status >= 400) {
          throw this.handleHttpError(response);
        }

        return response;
      },
      async (error: any) => {
        // 记录错误日志
        if (this.config.enableLogging) {
          console.error('[AutoPay] 响应错误:', error.response?.data || error.message);
        }

        // 处理错误
        if (error.response) {
          throw this.handleHttpError(error.response);
        } else if (error.request) {
          throw AutoPayException.networkError('无响应', error);
        } else {
          throw AutoPayException.serverError(error.message);
        }
      }
    );
  }

  /**
   * 处理HTTP错误
   */
  private handleHttpError(response: AxiosResponse): AutoPayException {
    const { status, data } = response;
    const requestId = response.headers['x-request-id'];
    const message = data?.message || data?.error || '未知错误';
    const code = data?.code || status;

    switch (status) {
      case 400:
        return new AutoPayException(
          `请求参数错误: ${message}`,
          code,
          status,
          requestId,
          data?.details
        );
      case 401:
        return new AutoPayException(message, 10003, 401);
      case 403:
        return AutoPayException.authorizationError(message);
      case 404:
        return new AutoPayException(
          `资源不存在: ${message}`,
          code,
          status,
          requestId
        );
      case 408:
        return AutoPayException.timeoutError(message);
      case 429:
        return new AutoPayException(
          `请求频率限制: ${message}`,
          code,
          status,
          requestId
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return AutoPayException.serverError(message, status);
      default:
        return new AutoPayException(
          `HTTP错误 ${status}: ${message}`,
          code,
          status,
          requestId
        );
    }
  }

  /**
   * 发送GET请求
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'GET', undefined, options);
  }

  /**
   * 发送POST请求
   */
  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'POST', data, options);
  }

  /**
   * 发送PUT请求
   */
  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'PUT', data, options);
  }

  /**
   * 发送PATCH请求
   */
  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'PATCH', data, options);
  }

  /**
   * 发送DELETE请求
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, 'DELETE', undefined, options);
  }

  /**
   * 发送请求
   */
  async request<T = any>(url: string, method: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      // 合并配置
      const config: AxiosRequestConfig = {
        baseURL: this.config.baseUrl,
        timeout: options.timeout || this.config.timeout,
        method,
        url,
        headers: {
          'X-API-Key': this.config.apiKey,
          ...this.config.headers,
          ...options.headers
        }
      };

      // 添加请求数据
      if (data !== undefined) {
        config.data = data;
      }

      // 添加查询参数
      if (options.params) {
        config.params = options.params;
      }

      // 发送请求
      const response = await this.instance.request(config);
      
      // 检查响应结构
      const responseData = response.data;
      if (!responseData || typeof responseData !== 'object') {
        throw new AutoPayException('响应数据格式错误', 10007, 500);
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      if (error instanceof AutoPayException) {
        throw error;
      }

      // 处理axios错误
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        if (errorObj.code === 'ECONNABORTED') {
          throw AutoPayException.timeoutError('请求超时');
        }

        if (errorObj.code === 'ENOTFOUND' || errorObj.code === 'ECONNREFUSED') {
          throw AutoPayException.networkError('网络连接失败', error);
        }

        throw AutoPayException.serverError(`请求失败: ${errorObj.message || '未知错误'}`);
      }

      throw AutoPayException.serverError(`请求失败: ${String(error)}`);
    }
  }

  /**
   * 获取HTTP客户端实例（用于高级用法）
   */
  getInstance(): any {
    return this.instance;
  }

  /**
   * 关闭客户端
   */
  async close(): Promise<void> {
    if (this.instance?.defaults) {
      this.instance.defaults.timeout = 1000; // 快速超时
    }
  }
}