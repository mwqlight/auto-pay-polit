import { AutoPayConfig } from './config/Config';
import { HttpClient } from './http/Client';
import { AutoPayService } from './services/AutoPayService';
import { SDKConfig, Environment, HealthCheckResult } from './types';

/**
 * AutoPay SDK 主类
 */
export class AutoPay {
  private readonly config: AutoPayConfig;
  private readonly client: HttpClient;
  private readonly service: AutoPayService;
  private isInitialized: boolean = false;

  /**
   * 构造函数
   */
  public constructor(config: AutoPayConfig) {
    this.config = config;
    
    // 验证配置
    this.config.validate();
    
    // 创建HTTP客户端
    this.client = new HttpClient({
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
    this.service = new AutoPayService(this.client);
    
    this.isInitialized = true;
  }

  /**
   * 创建AutoPay实例（推荐方式）
   */
  public static create(apiKey: string, secretKey: string, options: Partial<SDKConfig> = {}): AutoPay {
    const config: SDKConfig = {
      apiKey,
      secretKey,
      ...options
    };

    return AutoPay.fromConfig(config);
  }

  /**
   * 从配置对象创建AutoPay实例
   */
  public static fromConfig(config: SDKConfig): AutoPay {
    const autoPayConfig = AutoPayConfig.create(config);
    return new AutoPay(autoPayConfig);
  }

  /**
   * 使用构建器模式创建AutoPay实例
   */
  public static newBuilder(): AutoPayBuilder {
    return new AutoPayBuilder();
  }

  /**
   * 从环境变量创建AutoPay实例
   */
  public static fromEnvironment(): AutoPay {
    const config = AutoPayConfig.fromEnvironment();
    return new AutoPay(config);
  }

  /**
   * 获取配置
   */
  public getConfig(): AutoPayConfig {
    return this.config;
  }

  /**
   * 获取HTTP客户端（高级用户）
   */
  public getClient(): HttpClient {
    return this.client;
  }

  /**
   * 获取服务实例
   */
  public getService(): AutoPayService {
    return this.service;
  }

  /**
   * 检查SDK是否已初始化
   */
  public isHealthy(): boolean {
    return this.isInitialized;
  }

  /**
   * 执行健康检查
   */
  public async checkHealth(): Promise<HealthCheckResult> {
    try {
      const response = await this.service.healthCheck();
      
      if (response.code === 200) {
        return {
          status: 'healthy',
          timestamp: Date.now(),
          services: response.data.services
        };
      } else {
        return {
          status: 'degraded',
          timestamp: Date.now(),
          services: response.data.services,
          metrics: response.data
        };
      }
    } catch (error) {
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
  public async getVersion(): Promise<{ sdk: string; api: string; environment: Environment }> {
    try {
      const response = await this.service.getVersion();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 关闭SDK（释放资源）
   */
  public async close(): Promise<void> {
    try {
      await this.client.close();
      this.isInitialized = false;
    } catch (error) {
      console.error('[AutoPay] 关闭时发生错误:', error);
    }
  }

  /**
   * 销毁实例（别名方法）
   */
  public async destroy(): Promise<void> {
    return this.close();
  }

  /**
   * 获取环境信息
   */
  public getEnvironment(): Environment {
    return this.config.getEnvironment();
  }

  /**
   * 获取基础URL
   */
  public getBaseUrl(): string {
    return this.config.getBaseUrl();
  }

  /**
   * 获取API密钥
   */
  public getApiKey(): string {
    return this.config.getApiKey();
  }

  /**
   * 是否启用日志
   */
  public isLoggingEnabled(): boolean {
    return this.config.isLoggingEnabled();
  }

  /**
   * 获取超时时间
   */
  public getTimeout(): number {
    return this.config.getTimeout();
  }

  /**
   * 获取请求头
   */
  public getHeaders(): Record<string, string> {
    return this.config.getHeaders();
  }
}

/**
 * AutoPay 构建器
 */
export class AutoPayBuilder {
  private config: Partial<SDKConfig> = {};

  /**
   * 设置API密钥
   */
  public apiKey(apiKey: string): AutoPayBuilder {
    this.config.apiKey = apiKey;
    return this;
  }

  /**
   * 设置密钥
   */
  public secretKey(secretKey: string): AutoPayBuilder {
    this.config.secretKey = secretKey;
    return this;
  }

  /**
   * 设置应用ID
   */
  public appId(appId: string): AutoPayBuilder {
    this.config.appId = appId;
    return this;
  }

  /**
   * 设置基础URL
   */
  public baseUrl(baseUrl: string): AutoPayBuilder {
    this.config.baseUrl = baseUrl;
    return this;
  }

  /**
   * 设置超时时间
   */
  public timeout(timeout: number): AutoPayBuilder {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * 设置是否启用日志
   */
  public enableLogging(enableLogging: boolean): AutoPayBuilder {
    this.config.enableLogging = enableLogging;
    return this;
  }

  /**
   * 设置用户代理
   */
  public userAgent(userAgent: string): AutoPayBuilder {
    this.config.userAgent = userAgent;
    return this;
  }

  /**
   * 设置环境
   */
  public environment(environment: Environment): AutoPayBuilder {
    this.config.environment = environment;
    return this;
  }

  /**
   * 设置请求头
   */
  public headers(headers: Record<string, string>): AutoPayBuilder {
    this.config.headers = headers;
    return this;
  }

  /**
   * 从环境变量读取配置
   */
  public fromEnvironment(): AutoPayBuilder {
    const config = AutoPayConfig.fromEnvironment();
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
  public build(): AutoPay {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('API密钥和密钥是必需的');
    }

    return new AutoPay(AutoPayConfig.create(this.config as SDKConfig));
  }
}