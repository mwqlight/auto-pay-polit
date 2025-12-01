package com.autopay.sdk.service;

import com.autopay.sdk.client.AutoPayClient;
import com.autopay.sdk.config.AutoPayConfig;
import com.autopay.sdk.model.request.CreatePaymentRequest;
import com.autopay.sdk.model.request.QueryPaymentRequest;
import com.autopay.sdk.model.response.ApiResponse;
import com.autopay.sdk.model.response.PaymentResponse;

import java.util.List;
import java.util.Map;

/**
 * AutoPay服务接口
 */
public interface AutoPayService {
    
    // ===== 支付相关API =====
    
    /**
     * 创建支付订单
     */
    ApiResponse<PaymentResponse> createPayment(CreatePaymentRequest request);
    
    /**
     * 查询支付订单
     */
    ApiResponse<PaymentResponse> queryPayment(QueryPaymentRequest request);
    
    /**
     * 获取支付列表
     */
    ApiResponse<List<PaymentResponse>> getPayments(Map<String, Object> params);
    
    /**
     * 关闭支付订单
     */
    ApiResponse<Void> closePayment(String paymentId);
    
    /**
     * 申请退款
     */
    ApiResponse<PaymentResponse> refundPayment(String paymentId, Map<String, Object> refundParams);
    
    /**
     * 查询退款
     */
    ApiResponse<PaymentResponse> queryRefund(String refundId);
    
    /**
     * 获取支付统计
     */
    ApiResponse<Map<String, Object>> getPaymentStatistics(Map<String, Object> params);
    
    // ===== 渠道相关API =====
    
    /**
     * 获取支付渠道列表
     */
    ApiResponse<List<Map<String, Object>>> getChannels();
    
    /**
     * 获取渠道状态
     */
    ApiResponse<Map<String, Object>> getChannelStatus(String channelCode);
    
    /**
     * 切换渠道状态
     */
    ApiResponse<Map<String, Object>> toggleChannelStatus(String channelCode, Map<String, Object> params);
    
    // ===== 账户相关API =====
    
    /**
     * 获取账户余额
     */
    ApiResponse<Map<String, Object>> getBalance(String accountId);
    
    /**
     * 获取交易记录
     */
    ApiResponse<List<PaymentResponse>> getTransactions(Map<String, Object> params);
    
    /**
     * 获取账户统计
     */
    ApiResponse<Map<String, Object>> getAccountStatistics(Map<String, Object> params);
    
    // ===== 工具方法 =====
    
    /**
     * 获取SDK版本
     */
    String getVersion();
    
    /**
     * 健康检查
     */
    ApiResponse<Map<String, Object>> healthCheck();
    
    /**
     * 获取客户端配置
     */
    AutoPayConfig getConfig();
    
    /**
     * 获取HTTP客户端
     */
    AutoPayClient getClient();
    
    /**
     * 关闭连接
     */
    void close();
}