/**
 * AutoPay Node.js SDK 类型定义
 */

// 环境配置
export type Environment = 'production' | 'sandbox' | 'development';

// 支付渠道类型
export type PaymentChannel = 'alipay' | 'wechat' | 'unionpay' | 'bank_card' | 'balance';

// 货币代码
export type Currency = 'CNY' | 'USD' | 'EUR' | 'HKD' | 'JPY' | 'GBP';

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// 响应状态码
export enum ResponseCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// API响应基类
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 成功响应判断
export const isSuccess = (response: ApiResponse): boolean => response.code === ResponseCode.SUCCESS;

// 错误响应判断
export const isError = (response: ApiResponse): boolean => response.code !== ResponseCode.SUCCESS;

// 基础配置选项
export interface BaseConfigOptions {
  baseUrl?: string;
  timeout?: number;
  enableLogging?: boolean;
  userAgent?: string;
  environment?: Environment;
  headers?: Record<string, string>;
}

// SDK配置
export interface SDKConfig extends BaseConfigOptions {
  apiKey: string;
  secretKey: string;
  appId?: string;
}

// 基础请求选项
export interface RequestOptions extends BaseConfigOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// HTTP客户端选项
export interface HttpClientOptions extends BaseConfigOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

// 分页参数
export interface PaginationOptions {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 错误信息
export interface ErrorInfo {
  code: number;
  message: string;
  details?: any;
  requestId?: string;
  timestamp?: number;
}

// 客户端信息
export interface ClientInfo {
  userAgent?: string;
  ip?: string;
  platform?: string;
  version?: string;
}

// 时间范围
export interface TimeRange {
  startTime: string;
  endTime: string;
}

// 查询参数
export interface QueryParams extends PaginationOptions {
  [key: string]: any;
}

// 元数据
export interface Metadata {
  [key: string]: any;
}

// 客户信息
export interface CustomerInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

// 支付相关信息
export interface PaymentInfo {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  channel: PaymentChannel;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// 渠道信息
export interface ChannelInfo {
  code: string;
  name: string;
  type: PaymentChannel;
  enabled: boolean;
  priority: number;
  configuration?: Record<string, any>;
  limits?: {
    minAmount?: number;
    maxAmount?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
  };
  fees?: {
    rate: number;
    fixed: number;
  };
}

// 统计数据
export interface Statistics {
  totalAmount: number;
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  averageAmount: number;
  peakHour?: string;
}

// 健康检查结果
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    api: boolean;
    database?: boolean;
    redis?: boolean;
  };
  metrics?: Record<string, any>;
}

// 版本信息
export interface VersionInfo {
  sdk: string;
  api: string;
  environment: Environment;
}

// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// 日志配置
export interface LoggerConfig {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  format?: string;
}

// 回调通知
export interface PaymentCallback {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  channel: PaymentChannel;
  signature: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// 通知响应
export interface CallbackResponse {
  success: boolean;
  message?: string;
  data?: any;
}