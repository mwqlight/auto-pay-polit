"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.AutoPayException = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * AutoPay SDK 异常类
 */
class AutoPayException extends Error {
    constructor(message, code = 500, status = 500, requestId, details) {
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
    static networkError(message, error) {
        return new AutoPayException(`网络错误: ${message}`, 10001, 0, undefined, error?.message || error);
    }
    /**
     * 创建超时错误
     */
    static timeoutError(message = '请求超时') {
        return new AutoPayException(`超时错误: ${message}`, 10002, 408);
    }
    /**
     * 创建认证错误
     */
    static authenticationError(message = '认证失败') {
        return new AutoPayException(`认证错误: ${message}`, 10003, 401);
    }
    /**
     * 创建授权错误
     */
    static authorizationError(message = '授权失败') {
        return new AutoPayException(`授权错误: ${message}`, 10004, 403);
    }
    /**
     * 创建业务错误
     */
    static businessError(message, code = 10005, details) {
        return new AutoPayException(`业务错误: ${message}`, code, 400, undefined, details);
    }
    /**
     * 创建服务器错误
     */
    static serverError(message = '服务器内部错误', status = 500) {
        return new AutoPayException(`服务器错误: ${message}`, 10006, status);
    }
    /**
     * 转换为ErrorInfo
     */
    toErrorInfo() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            requestId: this.requestId,
            timestamp: Date.now()
        };
    }
}
exports.AutoPayException = AutoPayException;
/**
 * HTTP客户端类
 */
class HttpClient {
    constructor(config) {
        this.config = config;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        // 创建axios实例
        this.instance = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': config.userAgent || 'AutoPay Node.js SDK/1.0.0',
                'X-API-Key': config.apiKey,
                ...config.headers
            },
            // 响应拦截器
            transformResponse: [(data) => {
                    try {
                        return typeof data === 'string' ? JSON.parse(data) : data;
                    }
                    catch (error) {
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
    setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use((config) => {
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
        }, (error) => {
            if (this.config.enableLogging) {
                console.error('[AutoPay] 请求错误:', error);
            }
            return Promise.reject(error);
        });
        // 响应拦截器
        this.instance.interceptors.response.use((response) => {
            // 记录响应日志
            if (this.config.enableLogging) {
                console.log(`[AutoPay] 响应: ${response.status} ${response.config.url}`);
            }
            // 检查响应状态
            if (response.status >= 400) {
                throw this.handleHttpError(response);
            }
            return response;
        }, async (error) => {
            // 记录错误日志
            if (this.config.enableLogging) {
                console.error('[AutoPay] 响应错误:', error.response?.data || error.message);
            }
            // 处理错误
            if (error.response) {
                throw this.handleHttpError(error.response);
            }
            else if (error.request) {
                throw AutoPayException.networkError('无响应', error);
            }
            else {
                throw AutoPayException.serverError(error.message);
            }
        });
    }
    /**
     * 处理HTTP错误
     */
    handleHttpError(response) {
        const { status, data } = response;
        const requestId = response.headers['x-request-id'];
        const message = data?.message || data?.error || '未知错误';
        const code = data?.code || status;
        switch (status) {
            case 400:
                return new AutoPayException(`请求参数错误: ${message}`, code, status, requestId, data?.details);
            case 401:
                return new AutoPayException(message, 10003, 401);
            case 403:
                return AutoPayException.authorizationError(message);
            case 404:
                return new AutoPayException(`资源不存在: ${message}`, code, status, requestId);
            case 408:
                return AutoPayException.timeoutError(message);
            case 429:
                return new AutoPayException(`请求频率限制: ${message}`, code, status, requestId);
            case 500:
            case 502:
            case 503:
            case 504:
                return AutoPayException.serverError(message, status);
            default:
                return new AutoPayException(`HTTP错误 ${status}: ${message}`, code, status, requestId);
        }
    }
    /**
     * 发送GET请求
     */
    async get(url, options = {}) {
        return this.request(url, 'GET', undefined, options);
    }
    /**
     * 发送POST请求
     */
    async post(url, data, options = {}) {
        return this.request(url, 'POST', data, options);
    }
    /**
     * 发送PUT请求
     */
    async put(url, data, options = {}) {
        return this.request(url, 'PUT', data, options);
    }
    /**
     * 发送PATCH请求
     */
    async patch(url, data, options = {}) {
        return this.request(url, 'PATCH', data, options);
    }
    /**
     * 发送DELETE请求
     */
    async delete(url, options = {}) {
        return this.request(url, 'DELETE', undefined, options);
    }
    /**
     * 发送请求
     */
    async request(url, method, data, options = {}) {
        try {
            // 合并配置
            const config = {
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
            return responseData;
        }
        catch (error) {
            if (error instanceof AutoPayException) {
                throw error;
            }
            // 处理axios错误
            if (error && typeof error === 'object') {
                const errorObj = error;
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
    getInstance() {
        return this.instance;
    }
    /**
     * 关闭客户端
     */
    async close() {
        if (this.instance?.defaults) {
            this.instance.defaults.timeout = 1000; // 快速超时
        }
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=Client.js.map