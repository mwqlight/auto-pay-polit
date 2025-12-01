import { SDKConfig, BaseConfigOptions, Environment } from '../types';

/**
 * AutoPay 配置管理类
 */
export class AutoPayConfig {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly appId?: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly userAgent: string;
  private readonly environment: Environment;
  private readonly headers: Record<string, string>;

  /**
   * 构造函数
   */
  public constructor(config: SDKConfig) {
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
  public static create(config: SDKConfig): AutoPayConfig {
    return new AutoPayConfig(config);
  }

  /**
   * 从环境变量创建配置
   */
  public static fromEnvironment(): AutoPayConfig {
    const config: SDKConfig = {
      apiKey: process.env.AUTOPAY_API_KEY || '',
      secretKey: process.env.AUTOPAY_SECRET_KEY || '',
      appId: process.env.AUTOPAY_APP_ID,
      baseUrl: process.env.AUTOPAY_BASE_URL,
      timeout: process.env.AUTOPAY_TIMEOUT ? parseInt(process.env.AUTOPAY_TIMEOUT) : undefined,
      enableLogging: process.env.AUTOPAY_ENABLE_LOGGING === 'true',
      environment: (process.env.AUTOPAY_ENVIRONMENT as Environment) || 'production',
      userAgent: process.env.AUTOPAY_USER_AGENT,
      headers: this.parseHeadersFromEnv()
    };

    return new AutoPayConfig(config);
  }

  /**
   * 构建器模式
   */
  public static newBuilder(): ConfigBuilder {
    return new ConfigBuilder();
  }

  /**
   * 获取API密钥
   */
  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * 获取密钥
   */
  public getSecretKey(): string {
    return this.secretKey;
  }

  /**
   * 获取应用ID
   */
  public getAppId(): string | undefined {
    return this.appId;
  }

  /**
   * 获取基础URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * 获取超时时间
   */
  public getTimeout(): number {
    return this.timeout;
  }

  /**
   * 是否启用日志
   */
  public isLoggingEnabled(): boolean {
    return this.enableLogging;
  }

  /**
   * 获取用户代理
   */
  public getUserAgent(): string {
    return this.userAgent;
  }

  /**
   * 获取环境
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * 获取请求头
   */
  public getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * 获取完整的请求头（包含认证信息）
   */
  public getAuthHeaders(): Record<string, string> {
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
  public validate(): void {
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
  private getDefaultBaseUrl(environment?: Environment): string {
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
  private static parseHeadersFromEnv(): Record<string, string> {
    const headers: Record<string, string> = {};
    
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

/**
 * 配置构建器
 */
export class ConfigBuilder {
  private config: Partial<SDKConfig> = {};

  /**
   * 设置API密钥
   */
  public apiKey(apiKey: string): ConfigBuilder {
    this.config.apiKey = apiKey;
    return this;
  }

  /**
   * 设置密钥
   */
  public secretKey(secretKey: string): ConfigBuilder {
    this.config.secretKey = secretKey;
    return this;
  }

  /**
   * 设置应用ID
   */
  public appId(appId: string): ConfigBuilder {
    this.config.appId = appId;
    return this;
  }

  /**
   * 设置基础URL
   */
  public baseUrl(baseUrl: string): ConfigBuilder {
    this.config.baseUrl = baseUrl;
    return this;
  }

  /**
   * 设置超时时间
   */
  public timeout(timeout: number): ConfigBuilder {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * 设置是否启用日志
   */
  public enableLogging(enableLogging: boolean): ConfigBuilder {
    this.config.enableLogging = enableLogging;
    return this;
  }

  /**
   * 设置用户代理
   */
  public userAgent(userAgent: string): ConfigBuilder {
    this.config.userAgent = userAgent;
    return this;
  }

  /**
   * 设置环境
   */
  public environment(environment: Environment): ConfigBuilder {
    this.config.environment = environment;
    return this;
  }

  /**
   * 设置请求头
   */
  public headers(headers: Record<string, string>): ConfigBuilder {
    this.config.headers = headers;
    return this;
  }

  /**
   * 从环境变量读取配置
   */
  public fromEnvironment(): ConfigBuilder {
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
  public build(): AutoPayConfig {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('API密钥和密钥是必需的');
    }

    return new AutoPayConfig(this.config as SDKConfig);
  }
}