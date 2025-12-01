package com.autopay.backend.adapter;

import com.autopay.backend.dto.request.PaymentRequest;
import com.autopay.backend.dto.response.PaymentResponse;
import com.autopay.backend.entity.PaymentChannel;

/**
 * 支付渠道适配器接口
 * 
 * 定义所有支付渠道必须实现的标准方法
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
public interface PaymentChannelAdapter {
    
    /**
     * 创建支付订单
     * 
     * @param request 支付请求参数
     * @param channel 支付渠道配置
     * @return 支付响应结果
     * @throws PaymentException 支付异常
     */
    PaymentResponse createPayment(PaymentRequest request, PaymentChannel channel) throws PaymentException;
    
    /**
     * 查询支付状态
     * 
     * @param outTradeNo 商户订单号
     * @param channel 支付渠道配置
     * @return 支付状态响应
     * @throws PaymentException 支付异常
     */
    PaymentResponse queryPayment(String outTradeNo, PaymentChannel channel) throws PaymentException;
    
    /**
     * 关闭支付订单
     * 
     * @param outTradeNo 商户订单号
     * @param channel 支付渠道配置
     * @return 关闭结果
     * @throws PaymentException 支付异常
     */
    PaymentResponse closePayment(String outTradeNo, PaymentChannel channel) throws PaymentException;
    
    /**
     * 申请退款
     * 
     * @param outTradeNo 商户订单号
     * @param refundAmount 退款金额
     * @param refundReason 退款原因
     * @param channel 支付渠道配置
     * @return 退款结果
     * @throws PaymentException 支付异常
     */
    PaymentResponse refundPayment(String outTradeNo, java.math.BigDecimal refundAmount, 
                                String refundReason, PaymentChannel channel) throws PaymentException;
    
    /**
     * 处理渠道回调
     * 
     * @param callbackData 回调数据
     * @param channel 支付渠道配置
     * @return 回调处理结果
     * @throws PaymentException 支付异常
     */
    PaymentResponse handleCallback(java.util.Map<String, Object> callbackData, PaymentChannel channel) throws PaymentException;
    
    /**
     * 验证渠道配置
     * 
     * @param channel 支付渠道配置
     * @return 验证结果
     * @throws PaymentException 配置验证异常
     */
    boolean validateConfig(PaymentChannel channel) throws PaymentException;
    
    /**
     * 执行健康检查
     * 
     * @param channel 支付渠道配置
     * @return 健康检查结果
     * @throws PaymentException 健康检查异常
     */
    HealthCheckResult healthCheck(PaymentChannel channel) throws PaymentException;
    
    /**
     * 生成渠道特定的签名
     * 
     * @param data 待签名的数据
     * @param channel 支付渠道配置
     * @return 签名结果
     * @throws PaymentException 签名异常
     */
    String generateSignature(java.util.Map<String, Object> data, PaymentChannel channel) throws PaymentException;
    
    /**
     * 验证渠道返回的签名
     * 
     * @param data 数据
     * @param signature 签名
     * @param channel 支付渠道配置
     * @return 验证结果
     * @throws PaymentException 签名验证异常
     */
    boolean verifySignature(java.util.Map<String, Object> data, String signature, PaymentChannel channel) throws PaymentException;
    
    /**
     * 获取支持的支付场景
     * 
     * @return 支持的支付场景列表
     */
    java.util.List<String> getSupportedScenes();
    
    /**
     * 获取支持的币种
     * 
     * @return 支持的币种列表
     */
    java.util.List<String> getSupportedCurrencies();
    
    /**
     * 获取适配器对应的渠道类型
     * 
     * @return 渠道类型代码
     */
    Integer getChannelType();
    
    /**
     * 获取适配器名称
     * 
     * @return 适配器名称
     */
    String getAdapterName();
    
    /**
     * 渠道支付异常类
     */
    class PaymentException extends Exception {
        private String errorCode;
        private String errorMessage;
        
        public PaymentException(String message) {
            super(message);
            this.errorMessage = message;
        }
        
        public PaymentException(String errorCode, String message) {
            super(message);
            this.errorCode = errorCode;
            this.errorMessage = message;
        }
        
        public PaymentException(String message, Throwable cause) {
            super(message, cause);
            this.errorMessage = message;
        }
        
        public PaymentException(String errorCode, String message, Throwable cause) {
            super(message, cause);
            this.errorCode = errorCode;
            this.errorMessage = message;
        }
        
        public String getErrorCode() {
            return errorCode;
        }
        
        public void setErrorCode(String errorCode) {
            this.errorCode = errorCode;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
    
    /**
     * 健康检查结果类
     */
    class HealthCheckResult {
        private boolean healthy;
        private String message;
        private Long responseTime;
        private String errorDetails;
        private java.time.LocalDateTime checkTime;
        
        public HealthCheckResult(boolean healthy, String message) {
            this.healthy = healthy;
            this.message = message;
            this.checkTime = java.time.LocalDateTime.now();
        }
        
        public HealthCheckResult(boolean healthy, String message, Long responseTime) {
            this(healthy, message);
            this.responseTime = responseTime;
        }
        
        public static HealthCheckResult healthy(String message) {
            return new HealthCheckResult(true, message);
        }
        
        public static HealthCheckResult healthy(String message, Long responseTime) {
            return new HealthCheckResult(true, message, responseTime);
        }
        
        public static HealthCheckResult unhealthy(String message) {
            return new HealthCheckResult(false, message);
        }
        
        public static HealthCheckResult unhealthy(String message, String errorDetails) {
            HealthCheckResult result = new HealthCheckResult(false, message);
            result.setErrorDetails(errorDetails);
            return result;
        }
        
        // Getters and Setters
        public boolean isHealthy() {
            return healthy;
        }
        
        public void setHealthy(boolean healthy) {
            this.healthy = healthy;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public Long getResponseTime() {
            return responseTime;
        }
        
        public void setResponseTime(Long responseTime) {
            this.responseTime = responseTime;
        }
        
        public String getErrorDetails() {
            return errorDetails;
        }
        
        public void setErrorDetails(String errorDetails) {
            this.errorDetails = errorDetails;
        }
        
        public java.time.LocalDateTime getCheckTime() {
            return checkTime;
        }
        
        public void setCheckTime(java.time.LocalDateTime checkTime) {
            this.checkTime = checkTime;
        }
    }
}