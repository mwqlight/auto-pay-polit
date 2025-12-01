/**
 * AutoPay Node.js SDK 类型定义
 */
export type Environment = 'production' | 'sandbox' | 'development';
export type PaymentChannel = 'alipay' | 'wechat' | 'unionpay' | 'bank_card' | 'balance';
export type Currency = 'CNY' | 'USD' | 'EUR' | 'HKD' | 'JPY' | 'GBP';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare enum ResponseCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
}
export declare const isSuccess: (response: ApiResponse) => boolean;
export declare const isError: (response: ApiResponse) => boolean;
export interface BaseConfigOptions {
    baseUrl?: string;
    timeout?: number;
    enableLogging?: boolean;
    userAgent?: string;
    environment?: Environment;
    headers?: Record<string, string>;
}
export interface SDKConfig extends BaseConfigOptions {
    apiKey: string;
    secretKey: string;
    appId?: string;
}
export interface RequestOptions extends BaseConfigOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
}
export interface HttpClientOptions extends BaseConfigOptions {
    maxRetries?: number;
    retryDelay?: number;
    retryCondition?: (error: any) => boolean;
}
export interface PaginationOptions {
    page?: number;
    size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
export interface ErrorInfo {
    code: number;
    message: string;
    details?: any;
    requestId?: string;
    timestamp?: number;
}
export interface ClientInfo {
    userAgent?: string;
    ip?: string;
    platform?: string;
    version?: string;
}
export interface TimeRange {
    startTime: string;
    endTime: string;
}
export interface QueryParams extends PaginationOptions {
    [key: string]: any;
}
export interface Metadata {
    [key: string]: any;
}
export interface CustomerInfo {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    [key: string]: any;
}
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
export interface Statistics {
    totalAmount: number;
    totalCount: number;
    successCount: number;
    failedCount: number;
    successRate: number;
    averageAmount: number;
    peakHour?: string;
}
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
export interface VersionInfo {
    sdk: string;
    api: string;
    environment: Environment;
}
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export interface LoggerConfig {
    level?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
    filePath?: string;
    format?: string;
}
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
export interface CallbackResponse {
    success: boolean;
    message?: string;
    data?: any;
}
//# sourceMappingURL=index.d.ts.map