"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigBuilder = exports.AutoPayConfig = void 0;
/**
 * AutoPay 配置管理类
 */
class AutoPayConfig {
    /**
     * 构造函数
     */
    constructor(config) {
        this.apiKey = config.apiKey;
        this.secretKey = config.secretKey;
        this.appId = config.appId;
        this.baseUrl = config.baseUrl || this.getDefaultBaseUrl(config.environment);
        this.timeout = config.timeout || 30000; // 30秒
        this.enableLogging = config.enableLogging || false;
        this.userAgent = config.userAgent || 'AutoPay Node.js SDK/1.0.0';
        this.environment = config.environment || 'production';
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'Accept': 'application/json',
            ...config.headers
        };
    }
    /**
     * 创建配置实例
     */
    static create(config) {
        return new AutoPayConfig(config);
    }
    /**
     * 从环境变量创建配置
     */
    static fromEnvironment() {
        const config = {
            apiKey: process.env.AUTOPAY_API_KEY || '',
            secretKey: process.env.AUTOPAY_SECRET_KEY || '',
            appId: process.env.AUTOPAY_APP_ID,
            baseUrl: process.env.AUTOPAY_BASE_URL,
            timeout: process.env.AUTOPAY_TIMEOUT ? parseInt(process.env.AUTOPAY_TIMEOUT) : undefined,
            enableLogging: process.env.AUTOPAY_ENABLE_LOGGING === 'true',
            environment: process.env.AUTOPAY_ENVIRONMENT || 'production',
            userAgent: process.env.AUTOPAY_USER_AGENT,
            headers: this.parseHeadersFromEnv()
        };
        return new AutoPayConfig(config);
    }
    /**
     * 构建器模式
     */
    static newBuilder() {
        return new ConfigBuilder();
    }
    /**
     * 获取API密钥
     */
    getApiKey() {
        return this.apiKey;
    }
    /**
     * 获取密钥
     */
    getSecretKey() {
        return this.secretKey;
    }
    /**
     * 获取应用ID
     */
    getAppId() {
        return this.appId;
    }
    /**
     * 获取基础URL
     */
    getBaseUrl() {
        return this.baseUrl;
    }
    /**
     * 获取超时时间
     */
    getTimeout() {
        return this.timeout;
    }
    /**
     * 是否启用日志
     */
    isLoggingEnabled() {
        return this.enableLogging;
    }
    /**
     * 获取用户代理
     */
    getUserAgent() {
        return this.userAgent;
    }
    /**
     * 获取环境
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * 获取请求头
     */
    getHeaders() {
        return { ...this.headers };
    }
    /**
     * 获取完整的请求头（包含认证信息）
     */
    getAuthHeaders() {
        const headers = this.getHeaders();
        headers['X-API-Key'] = this.apiKey;
        if (this.appId) {
            headers['X-App-ID'] = this.appId;
        }
        return headers;
    }
    /**
     * 验证配置
     */
    validate() {
        if (!this.apiKey) {
            throw new Error('API密钥不能为空');
        }
        if (!this.secretKey) {
            throw new Error('密钥不能为空');
        }
        if (!this.baseUrl) {
            throw new Error('基础URL不能为空');
        }
    }
    /**
     * 获取默认基础URL
     */
    getDefaultBaseUrl(environment) {
        switch (environment) {
            case 'development':
                return 'http://localhost:8080/api/v1';
            case 'sandbox':
                return 'https://api-sandbox.autopay.com/v1';
            case 'production':
            default:
                return 'https://api.autopay.com/v1';
        }
    }
    /**
     * 从环境变量解析请求头
     */
    static parseHeadersFromEnv() {
        const headers = {};
        for (const [key, value] of Object.entries(process.env)) {
            if (key.startsWith('AUTOPAY_HEADER_')) {
                const headerName = key.replace('AUTOPAY_HEADER_', '').toLowerCase();
                if (value) {
                    headers[headerName] = value;
                }
            }
        }
        return headers;
    }
}
exports.AutoPayConfig = AutoPayConfig;
/**
 * 配置构建器
 */
class ConfigBuilder {
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
        const envConfig = AutoPayConfig.fromEnvironment();
        return this
            .apiKey(envConfig.getApiKey())
            .secretKey(envConfig.getSecretKey())
            .appId(envConfig.getAppId() || '')
            .baseUrl(envConfig.getBaseUrl())
            .timeout(envConfig.getTimeout())
            .enableLogging(envConfig.isLoggingEnabled())
            .userAgent(envConfig.getUserAgent())
            .environment(envConfig.getEnvironment());
    }
    /**
     * 构建配置对象
     */
    build() {
        if (!this.config.apiKey || !this.config.secretKey) {
            throw new Error('API密钥和密钥是必需的');
        }
        return new AutoPayConfig(this.config);
    }
}
exports.ConfigBuilder = ConfigBuilder;
//# sourceMappingURL=Config.js.map