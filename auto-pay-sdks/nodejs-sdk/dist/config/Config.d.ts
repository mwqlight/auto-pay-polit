import { SDKConfig, Environment } from '../types';
/**
 * AutoPay 配置管理类
 */
export declare class AutoPayConfig {
    private readonly apiKey;
    private readonly secretKey;
    private readonly appId?;
    private readonly baseUrl;
    private readonly timeout;
    private readonly enableLogging;
    private readonly userAgent;
    private readonly environment;
    private readonly headers;
    /**
     * 构造函数
     */
    constructor(config: SDKConfig);
    /**
     * 创建配置实例
     */
    static create(config: SDKConfig): AutoPayConfig;
    /**
     * 从环境变量创建配置
     */
    static fromEnvironment(): AutoPayConfig;
    /**
     * 构建器模式
     */
    static newBuilder(): ConfigBuilder;
    /**
     * 获取API密钥
     */
    getApiKey(): string;
    /**
     * 获取密钥
     */
    getSecretKey(): string;
    /**
     * 获取应用ID
     */
    getAppId(): string | undefined;
    /**
     * 获取基础URL
     */
    getBaseUrl(): string;
    /**
     * 获取超时时间
     */
    getTimeout(): number;
    /**
     * 是否启用日志
     */
    isLoggingEnabled(): boolean;
    /**
     * 获取用户代理
     */
    getUserAgent(): string;
    /**
     * 获取环境
     */
    getEnvironment(): Environment;
    /**
     * 获取请求头
     */
    getHeaders(): Record<string, string>;
    /**
     * 获取完整的请求头（包含认证信息）
     */
    getAuthHeaders(): Record<string, string>;
    /**
     * 验证配置
     */
    validate(): void;
    /**
     * 获取默认基础URL
     */
    private getDefaultBaseUrl;
    /**
     * 从环境变量解析请求头
     */
    private static parseHeadersFromEnv;
}
/**
 * 配置构建器
 */
export declare class ConfigBuilder {
    private config;
    /**
     * 设置API密钥
     */
    apiKey(apiKey: string): ConfigBuilder;
    /**
     * 设置密钥
     */
    secretKey(secretKey: string): ConfigBuilder;
    /**
     * 设置应用ID
     */
    appId(appId: string): ConfigBuilder;
    /**
     * 设置基础URL
     */
    baseUrl(baseUrl: string): ConfigBuilder;
    /**
     * 设置超时时间
     */
    timeout(timeout: number): ConfigBuilder;
    /**
     * 设置是否启用日志
     */
    enableLogging(enableLogging: boolean): ConfigBuilder;
    /**
     * 设置用户代理
     */
    userAgent(userAgent: string): ConfigBuilder;
    /**
     * 设置环境
     */
    environment(environment: Environment): ConfigBuilder;
    /**
     * 设置请求头
     */
    headers(headers: Record<string, string>): ConfigBuilder;
    /**
     * 从环境变量读取配置
     */
    fromEnvironment(): ConfigBuilder;
    /**
     * 构建配置对象
     */
    build(): AutoPayConfig;
}
//# sourceMappingURL=Config.d.ts.map