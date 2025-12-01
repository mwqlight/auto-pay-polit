import { AutoPayConfig } from './config/Config';
import { HttpClient } from './http/Client';
import { AutoPayService } from './services/AutoPayService';
import { SDKConfig, Environment, HealthCheckResult } from './types';
/**
 * AutoPay SDK 主类
 */
export declare class AutoPay {
    private readonly config;
    private readonly client;
    private readonly service;
    private isInitialized;
    /**
     * 构造函数
     */
    constructor(config: AutoPayConfig);
    /**
     * 创建AutoPay实例（推荐方式）
     */
    static create(apiKey: string, secretKey: string, options?: Partial<SDKConfig>): AutoPay;
    /**
     * 从配置对象创建AutoPay实例
     */
    static fromConfig(config: SDKConfig): AutoPay;
    /**
     * 使用构建器模式创建AutoPay实例
     */
    static newBuilder(): AutoPayBuilder;
    /**
     * 从环境变量创建AutoPay实例
     */
    static fromEnvironment(): AutoPay;
    /**
     * 获取配置
     */
    getConfig(): AutoPayConfig;
    /**
     * 获取HTTP客户端（高级用户）
     */
    getClient(): HttpClient;
    /**
     * 获取服务实例
     */
    getService(): AutoPayService;
    /**
     * 检查SDK是否已初始化
     */
    isHealthy(): boolean;
    /**
     * 执行健康检查
     */
    checkHealth(): Promise<HealthCheckResult>;
    /**
     * 获取SDK版本信息
     */
    getVersion(): Promise<{
        sdk: string;
        api: string;
        environment: Environment;
    }>;
    /**
     * 关闭SDK（释放资源）
     */
    close(): Promise<void>;
    /**
     * 销毁实例（别名方法）
     */
    destroy(): Promise<void>;
    /**
     * 获取环境信息
     */
    getEnvironment(): Environment;
    /**
     * 获取基础URL
     */
    getBaseUrl(): string;
    /**
     * 获取API密钥
     */
    getApiKey(): string;
    /**
     * 是否启用日志
     */
    isLoggingEnabled(): boolean;
    /**
     * 获取超时时间
     */
    getTimeout(): number;
    /**
     * 获取请求头
     */
    getHeaders(): Record<string, string>;
}
/**
 * AutoPay 构建器
 */
export declare class AutoPayBuilder {
    private config;
    /**
     * 设置API密钥
     */
    apiKey(apiKey: string): AutoPayBuilder;
    /**
     * 设置密钥
     */
    secretKey(secretKey: string): AutoPayBuilder;
    /**
     * 设置应用ID
     */
    appId(appId: string): AutoPayBuilder;
    /**
     * 设置基础URL
     */
    baseUrl(baseUrl: string): AutoPayBuilder;
    /**
     * 设置超时时间
     */
    timeout(timeout: number): AutoPayBuilder;
    /**
     * 设置是否启用日志
     */
    enableLogging(enableLogging: boolean): AutoPayBuilder;
    /**
     * 设置用户代理
     */
    userAgent(userAgent: string): AutoPayBuilder;
    /**
     * 设置环境
     */
    environment(environment: Environment): AutoPayBuilder;
    /**
     * 设置请求头
     */
    headers(headers: Record<string, string>): AutoPayBuilder;
    /**
     * 从环境变量读取配置
     */
    fromEnvironment(): AutoPayBuilder;
    /**
     * 构建AutoPay实例
     */
    build(): AutoPay;
}
//# sourceMappingURL=AutoPay.d.ts.map