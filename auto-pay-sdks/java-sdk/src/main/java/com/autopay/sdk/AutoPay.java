package com.autopay.sdk;

import com.autopay.sdk.client.AutoPayClient;
import com.autopay.sdk.client.AutoPayException;
import com.autopay.sdk.config.AutoPayConfig;
import com.autopay.sdk.model.response.ApiResponse;
import com.autopay.sdk.service.AutoPayService;
import com.autopay.sdk.service.impl.AutoPayServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * AutoPay SDK入口类
 */
public class AutoPay implements AutoCloseable {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoPay.class);
    
    private static final String DEFAULT_BASE_URL = "https://api.autopay.example.com";
    
    private final AutoPayConfig config;
    private final AutoPayClient client;
    private final AutoPayService service;
    
    private AutoPay(AutoPayConfig config) {
        this.config = config;
        this.client = new AutoPayClient(config);
        this.service = new AutoPayServiceImpl(client);
    }
    
    /**
     * 使用构建器创建AutoPay实例
     */
    public static Builder newBuilder() {
        return new Builder();
    }
    
    /**
     * 创建AutoPay实例（使用默认配置）
     */
    public static AutoPay create(String apiKey, String secretKey) {
        return newBuilder()
                .apiKey(apiKey)
                .secretKey(secretKey)
                .build();
    }
    
    /**
     * 获取服务接口实例
     */
    public AutoPayService getService() {
        return service;
    }
    
    /**
     * 获取配置
     */
    public AutoPayConfig getConfig() {
        return config;
    }
    
    /**
     * 获取HTTP客户端
     */
    public AutoPayClient getClient() {
        return client;
    }
    
    /**
     * 关闭连接
     */
    public void close() {
        logger.info("Closing AutoPay SDK");
        service.close();
    }
    
    /**
     * 健康检查
     */
    public boolean isHealthy() {
        try {
            ApiResponse<Map<String, Object>> response = service.healthCheck();
            return response.isSuccess();
        } catch (Exception e) {
            logger.error("Health check failed", e);
            return false;
        }
    }
    
    /**
     * AutoPay构建器
     */
    public static class Builder {
        private String baseUrl = DEFAULT_BASE_URL;
        private String apiKey;
        private String secretKey;
        private String appId;
        private int timeout = 30;
        private boolean enableLogging = true;
        private String userAgent = "AutoPayJavaSDK/1.0.0";
        private String environment = "production"; // production, sandbox, development
        
        /**
         * 设置API基础URL
         */
        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }
        
        /**
         * 设置API密钥
         */
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }
        
        /**
         * 设置密钥
         */
        public Builder secretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }
        
        /**
         * 设置应用ID
         */
        public Builder appId(String appId) {
            this.appId = appId;
            return this;
        }
        
        /**
         * 设置超时时间（秒）
         */
        public Builder timeout(int timeout) {
            this.timeout = timeout;
            return this;
        }
        
        /**
         * 启用/禁用日志
         */
        public Builder enableLogging(boolean enableLogging) {
            this.enableLogging = enableLogging;
            return this;
        }
        
        /**
         * 设置用户代理
         */
        public Builder userAgent(String userAgent) {
            this.userAgent = userAgent;
            return this;
        }
        
        /**
         * 设置环境
         */
        public Builder environment(String environment) {
            this.environment = environment;
            return this;
        }
        
        /**
         * 使用环境变量配置
         */
        public Builder fromEnvironment() {
            // 从环境变量读取配置
            String envBaseUrl = System.getenv("AUTOPAY_BASE_URL");
            if (envBaseUrl != null) {
                this.baseUrl = envBaseUrl;
            }
            
            String envApiKey = System.getenv("AUTOPAY_API_KEY");
            if (envApiKey != null) {
                this.apiKey = envApiKey;
            }
            
            String envSecretKey = System.getenv("AUTOPAY_SECRET_KEY");
            if (envSecretKey != null) {
                this.secretKey = envSecretKey;
            }
            
            String envAppId = System.getenv("AUTOPAY_APP_ID");
            if (envAppId != null) {
                this.appId = envAppId;
            }
            
            String envTimeout = System.getenv("AUTOPAY_TIMEOUT");
            if (envTimeout != null) {
                try {
                    this.timeout = Integer.parseInt(envTimeout);
                } catch (NumberFormatException e) {
                    logger.warn("Invalid timeout value in environment variable: {}", envTimeout);
                }
            }
            
            String envLogging = System.getenv("AUTOPAY_ENABLE_LOGGING");
            if (envLogging != null) {
                this.enableLogging = Boolean.parseBoolean(envLogging);
            }
            
            String envEnvironment = System.getenv("AUTOPAY_ENVIRONMENT");
            if (envEnvironment != null) {
                this.environment = envEnvironment;
            }
            
            return this;
        }
        
        /**
         * 构建AutoPay实例
         */
        public AutoPay build() {
            // 验证必需参数
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new AutoPayException("API key is required");
            }
            
            if (secretKey == null || secretKey.trim().isEmpty()) {
                throw new AutoPayException("Secret key is required");
            }
            
            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new AutoPayException("Base URL is required");
            }
            
            // 创建配置对象
            AutoPayConfig config = new AutoPayConfig.Builder()
                    .baseUrl(baseUrl)
                    .apiKey(apiKey)
                    .secretKey(secretKey)
                    .appId(appId)
                    .timeout(timeout)
                    .enableLogging(enableLogging)
                    .userAgent(userAgent)
                    .environment(environment)
                    .build();
            
            logger.info("AutoPay SDK configured for environment: {}", environment);
            
            return new AutoPay(config);
        }
    }
    
    /**
     * 自动关闭资源
     */
    public static void withAutoClose(AutoPay autoPay, AutoPayAction action) {
        try (AutoPay client = autoPay) {
            action.execute(client);
        } catch (Exception e) {
            logger.error("Error executing AutoPay action", e);
            throw new AutoPayException("Error executing AutoPay action", e);
        }
    }
    
    /**
     * 简化创建支付的静态方法
     */
    public static AutoPayQuickBuilder quickStart(String apiKey, String secretKey) {
        return new AutoPayQuickBuilder(apiKey, secretKey);
    }
    
    /**
     * 快速构建接口
     */
    public static class AutoPayQuickBuilder {
        private final String apiKey;
        private final String secretKey;
        private String baseUrl = DEFAULT_BASE_URL;
        private String environment = "production";
        
        public AutoPayQuickBuilder(String apiKey, String secretKey) {
            this.apiKey = apiKey;
            this.secretKey = secretKey;
        }
        
        public AutoPayQuickBuilder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }
        
        public AutoPayQuickBuilder sandbox() {
            this.environment = "sandbox";
            this.baseUrl = "https://api-sandbox.autopay.example.com";
            return this;
        }
        
        public AutoPayQuickBuilder development() {
            this.environment = "development";
            this.baseUrl = "http://localhost:8080/api";
            return this;
        }
        
        public AutoPay build() {
            return newBuilder()
                    .baseUrl(baseUrl)
                    .apiKey(apiKey)
                    .secretKey(secretKey)
                    .environment(environment)
                    .build();
        }
    }
    
    /**
     * 使用的接口函数式接口
     */
    @FunctionalInterface
    public interface AutoPayAction {
        void execute(AutoPay autoPay) throws Exception;
    }
}