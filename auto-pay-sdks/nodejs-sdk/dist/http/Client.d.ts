import { SDKConfig, RequestOptions, ApiResponse, ErrorInfo } from '../types';
/**
 * AutoPay SDK 异常类
 */
export declare class AutoPayException extends Error {
    readonly code: number;
    readonly status: number;
    readonly requestId?: string;
    readonly details?: any;
    constructor(message: string, code?: number, status?: number, requestId?: string, details?: any);
    /**
     * 创建网络错误
     */
    static networkError(message: string, error?: any): AutoPayException;
    /**
     * 创建超时错误
     */
    static timeoutError(message?: string): AutoPayException;
    /**
     * 创建认证错误
     */
    static authenticationError(message?: string): AutoPayException;
    /**
     * 创建授权错误
     */
    static authorizationError(message?: string): AutoPayException;
    /**
     * 创建业务错误
     */
    static businessError(message: string, code?: number, details?: any): AutoPayException;
    /**
     * 创建服务器错误
     */
    static serverError(message?: string, status?: number): AutoPayException;
    /**
     * 转换为ErrorInfo
     */
    toErrorInfo(): ErrorInfo;
}
/**
 * HTTP客户端类
 */
export declare class HttpClient {
    private readonly config;
    private readonly instance;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(config: SDKConfig);
    /**
     * 设置拦截器
     */
    private setupInterceptors;
    /**
     * 处理HTTP错误
     */
    private handleHttpError;
    /**
     * 发送GET请求
     */
    get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 发送POST请求
     */
    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 发送PUT请求
     */
    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 发送PATCH请求
     */
    patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 发送DELETE请求
     */
    delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 发送请求
     */
    request<T = any>(url: string, method: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    /**
     * 获取HTTP客户端实例（用于高级用法）
     */
    getInstance(): any;
    /**
     * 关闭客户端
     */
    close(): Promise<void>;
}
//# sourceMappingURL=Client.d.ts.map