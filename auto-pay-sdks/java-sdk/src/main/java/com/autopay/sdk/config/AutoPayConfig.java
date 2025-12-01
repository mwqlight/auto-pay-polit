package com.autopay.sdk.config;

import java.util.Objects;

/**
 * AutoPay SDK配置类
 */
public class AutoPayConfig {
    
    private final String baseUrl;
    private final String apiKey;
    private final String secretKey;
    private final String appId;
    private final String environment;
    private final int timeout;
    private final boolean enableLogging;
    private final String userAgent;
    
    private AutoPayConfig(Builder builder) {
        this.baseUrl = builder.baseUrl;
        this.apiKey = builder.apiKey;
        this.secretKey = builder.secretKey;
        this.appId = builder.appId;
        this.environment = builder.environment;
        this.timeout = builder.timeout;
        this.enableLogging = builder.enableLogging;
        this.userAgent = builder.userAgent;
    }
    
    /**
     * 创建配置构建器
     */
    public static Builder newBuilder() {
        return new Builder();
    }
    
    /**
     * 从环境变量创建配置
     */
    public static AutoPayConfig fromEnvironment() {
        Builder builder = newBuilder();
        
        String baseUrl = System.getenv("AUTOPAY_BASE_URL");
        if (baseUrl != null) builder.baseUrl(baseUrl);
        
        String apiKey = System.getenv("AUTOPAY_API_KEY");
        if (apiKey != null) builder.apiKey(apiKey);
        
        String secretKey = System.getenv("AUTOPAY_SECRET_KEY");
        if (secretKey != null) builder.secretKey(secretKey);
        
        String appId = System.getenv("AUTOPAY_APP_ID");
        if (appId != null) builder.appId(appId);
        
        String timeout = System.getenv("AUTOPAY_TIMEOUT");
        if (timeout != null) builder.timeout(Integer.parseInt(timeout));
        
        String enableLogging = System.getenv("AUTOPAY_ENABLE_LOGGING");
        if (enableLogging != null) builder.enableLogging(Boolean.parseBoolean(enableLogging));
        
        return builder.build();
    }
    
    /**
     * 配置构建器
     */
    public static class Builder {
        private String baseUrl = "https://api.autopay.com";
        private String apiKey;
        private String secretKey;
        private String appId;
        private String environment = "production";
        private int timeout = 30;
        private boolean enableLogging = false;
        private String userAgent = "AutoPay-Java-SDK/1.0.0";
        
        /**
         * 设置基础URL
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
         * 设置是否启用日志
         */
        public Builder enableLogging(boolean enableLogging) {
            this.enableLogging = enableLogging;
            return this;
        }
        
        /**
         * 设置User-Agent
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
         * 构建配置对象
         */
        public AutoPayConfig build() {
            if (Objects.isNull(apiKey)) {
                throw new IllegalArgumentException("API Key不能为空");
            }
            if (Objects.isNull(secretKey)) {
                throw new IllegalArgumentException("Secret Key不能为空");
            }
            
            return new AutoPayConfig(this);
        }
    }
    
    // Getters
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public String getApiKey() {
        return apiKey;
    }
    
    public String getSecretKey() {
        return secretKey;
    }
    
    public String getAppId() {
        return appId;
    }
    
    public String getEnvironment() {
        return environment;
    }
    
    public int getTimeout() {
        return timeout;
    }
    
    public boolean isEnableLogging() {
        return enableLogging;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    /**
     * 获取完整的API路径
     */
    public String getApiUrl(String endpoint) {
        if (endpoint.startsWith("/")) {
            return baseUrl + endpoint;
        }
        return baseUrl + "/" + endpoint;
    }
    
    @Override
    public String toString() {
        return "AutoPayConfig{" +
                "baseUrl='" + baseUrl + '\'' +
                ", apiKey='" + apiKey + '\'' +
                ", secretKey='***'}" +
                ", appId='" + appId + '\'' +
                ", timeout=" + timeout +
                ", enableLogging=" + enableLogging +
                '}';
    }
}