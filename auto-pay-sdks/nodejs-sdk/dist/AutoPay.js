"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPayBuilder = exports.AutoPay = void 0;
const Config_1 = require("./config/Config");
const Client_1 = require("./http/Client");
const AutoPayService_1 = require("./services/AutoPayService");
/**
 * AutoPay SDK 主类
 */
class AutoPay {
    /**
     * 构造函数
     */
    constructor(config) {
        this.isInitialized = false;
        this.config = config;
        // 验证配置
        this.config.validate();
        // 创建HTTP客户端
        this.client = new Client_1.HttpClient({
            apiKey: config.getApiKey(),
            secretKey: config.getSecretKey(),
            appId: config.getAppId(),
            baseUrl: config.getBaseUrl(),
            timeout: config.getTimeout(),
            enableLogging: config.isLoggingEnabled(),
            userAgent: config.getUserAgent(),
            environment: config.getEnvironment(),
            headers: config.getHeaders()
        });
        // 创建服务实例
        this.service = new AutoPayService_1.AutoPayService(this.client);
        this.isInitialized = true;
    }
    /**
     * 创建AutoPay实例（推荐方式）
     */
    static create(apiKey, secretKey, options = {}) {
        const config = {
            apiKey,
            secretKey,
            ...options
        };
        return AutoPay.fromConfig(config);
    }
    /**
     * 从配置对象创建AutoPay实例
     */
    static fromConfig(config) {
        const autoPayConfig = Config_1.AutoPayConfig.create(config);
        return new AutoPay(autoPayConfig);
    }
    /**
     * 使用构建器模式创建AutoPay实例
     */
    static newBuilder() {
        return new AutoPayBuilder();
    }
    /**
     * 从环境变量创建AutoPay实例
     */
    static fromEnvironment() {
        const config = Config_1.AutoPayConfig.fromEnvironment();
        return new AutoPay(config);
    }
    /**
     * 获取配置
     */
    getConfig() {
        return this.config;
    }
    /**
     * 获取HTTP客户端（高级用户）
     */
    getClient() {
        return this.client;
    }
    /**
     * 获取服务实例
     */
    getService() {
        return this.service;
    }
    /**
     * 检查SDK是否已初始化
     */
    isHealthy() {
        return this.isInitialized;
    }
    /**
     * 执行健康检查
     */
    async checkHealth() {
        try {
            const response = await this.service.healthCheck();
            if (response.code === 200) {
                return {
                    status: 'healthy',
                    timestamp: Date.now(),
                    services: response.data.services
                };
            }
            else {
                return {
                    status: 'degraded',
                    timestamp: Date.now(),
                    services: response.data.services,
                    metrics: response.data
                };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: Date.now(),
                services: { api: false }
            };
        }
    }
    /**
     * 获取SDK版本信息
     */
    async getVersion() {
        try {
            const response = await this.service.getVersion();
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 关闭SDK（释放资源）
     */
    async close() {
        try {
            await this.client.close();
            this.isInitialized = false;
        }
        catch (error) {
            console.error('[AutoPay] 关闭时发生错误:', error);
        }
    }
    /**
     * 销毁实例（别名方法）
     */
    async destroy() {
        return this.close();
    }
    /**
     * 获取环境信息
     */
    getEnvironment() {
        return this.config.getEnvironment();
    }
    /**
     * 获取基础URL
     */
    getBaseUrl() {
        return this.config.getBaseUrl();
    }
    /**
     * 获取API密钥
     */
    getApiKey() {
        return this.config.getApiKey();
    }
    /**
     * 是否启用日志
     */
    isLoggingEnabled() {
        return this.config.isLoggingEnabled();
    }
    /**
     * 获取超时时间
     */
    getTimeout() {
        return this.config.getTimeout();
    }
    /**
     * 获取请求头
     */
    getHeaders() {
        return this.config.getHeaders();
    }
}
exports.AutoPay = AutoPay;
/**
 * AutoPay 构建器
 */
class AutoPayBuilder {
    constructor() {
        this.config = {};
    }
    /**
     * 设置API密钥
     */
    apiKey(apiKey) {
        this.config.apiKey = apiKey;
        return this;
    }
    /**
     * 设置密钥
     */
    secretKey(secretKey) {
        this.config.secretKey = secretKey;
        return this;
    }
    /**
     * 设置应用ID
     */
    appId(appId) {
        this.config.appId = appId;
        return this;
    }
    /**
     * 设置基础URL
     */
    baseUrl(baseUrl) {
        this.config.baseUrl = baseUrl;
        return this;
    }
    /**
     * 设置超时时间
     */
    timeout(timeout) {
        this.config.timeout = timeout;
        return this;
    }
    /**
     * 设置是否启用日志
     */
    enableLogging(enableLogging) {
        this.config.enableLogging = enableLogging;
        return this;
    }
    /**
     * 设置用户代理
     */
    userAgent(userAgent) {
        this.config.userAgent = userAgent;
        return this;
    }
    /**
     * 设置环境
     */
    environment(environment) {
        this.config.environment = environment;
        return this;
    }
    /**
     * 设置请求头
     */
    headers(headers) {
        this.config.headers = headers;
        return this;
    }
    /**
     * 从环境变量读取配置
     */
    fromEnvironment() {
        const config = Config_1.AutoPayConfig.fromEnvironment();
        this.config = {
            apiKey: config.getApiKey(),
            secretKey: config.getSecretKey(),
            appId: config.getAppId(),
            baseUrl: config.getBaseUrl(),
            timeout: config.getTimeout(),
            enableLogging: config.isLoggingEnabled(),
            userAgent: config.getUserAgent(),
            environment: config.getEnvironment(),
            headers: config.getHeaders()
        };
        return this;
    }
    /**
     * 构建AutoPay实例
     */
    build() {
        if (!this.config.apiKey || !this.config.secretKey) {
            throw new Error('API密钥和密钥是必需的');
        }
        return new AutoPay(Config_1.AutoPayConfig.create(this.config));
    }
}
exports.AutoPayBuilder = AutoPayBuilder;
//# sourceMappingURL=AutoPay.js.map