package com.autopay.sdk.service.impl;

import com.autopay.sdk.client.AutoPayClient;
import com.autopay.sdk.client.AutoPayException;
import com.autopay.sdk.config.AutoPayConfig;
import com.autopay.sdk.model.request.CreatePaymentRequest;
import com.autopay.sdk.model.request.QueryPaymentRequest;
import com.autopay.sdk.model.response.ApiResponse;
import com.autopay.sdk.model.response.PaymentResponse;
import com.autopay.sdk.service.AutoPayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/**
 * AutoPay服务接口实现
 */
public class AutoPayServiceImpl implements AutoPayService {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoPayServiceImpl.class);
    
    private static final String VERSION = "1.0.0";
    
    private final AutoPayClient client;
    private final ObjectMapper objectMapper;
    
    public AutoPayServiceImpl(AutoPayConfig config) {
        this.client = new AutoPayClient(config);
        this.objectMapper = new ObjectMapper();
    }
    
    public AutoPayServiceImpl(AutoPayClient client) {
        this.client = client;
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<PaymentResponse> createPayment(CreatePaymentRequest request) {
        logger.info("Creating payment with orderId: {}", request.getOrderId());
        return (ApiResponse<PaymentResponse>) client.post("payments", request, PaymentResponse.class);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<PaymentResponse> queryPayment(QueryPaymentRequest request) {
        logger.info("Querying payment with id: {}", request.getPaymentId());
        return (ApiResponse<PaymentResponse>) client.get("payments/" + request.getPaymentId(), null, PaymentResponse.class);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<List<PaymentResponse>> getPayments(Map<String, Object> params) {
        logger.info("Getting payments with params: {}", params);
        return (ApiResponse<List<PaymentResponse>>) client.get("payments", params, 
                new AutoPayClient.TypeReference<List<PaymentResponse>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Void> closePayment(String paymentId) {
        logger.info("Closing payment with id: {}", paymentId);
        return (ApiResponse<Void>) client.delete("payments/" + paymentId, Void.class);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<PaymentResponse> refundPayment(String paymentId, Map<String, Object> refundParams) {
        logger.info("Refunding payment with id: {}", paymentId);
        return (ApiResponse<PaymentResponse>) client.post("payments/" + paymentId + "/refunds", refundParams, PaymentResponse.class);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<PaymentResponse> queryRefund(String refundId) {
        logger.info("Querying refund with id: {}", refundId);
        return (ApiResponse<PaymentResponse>) client.get("refunds/" + refundId, null, PaymentResponse.class);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> getPaymentStatistics(Map<String, Object> params) {
        logger.info("Getting payment statistics with params: {}", params);
        return (ApiResponse<Map<String, Object>>) client.get("statistics/payments", params,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<List<Map<String, Object>>> getChannels() {
        logger.info("Getting available payment channels");
        return (ApiResponse<List<Map<String, Object>>>) client.get("channels", null,
                new AutoPayClient.TypeReference<List<Map<String, Object>>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> getChannelStatus(String channelCode) {
        logger.info("Getting channel status for: {}", channelCode);
        return (ApiResponse<Map<String, Object>>) client.get("channels/" + channelCode + "/status", null,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> toggleChannelStatus(String channelCode, Map<String, Object> params) {
        logger.info("Toggling channel status for: {} with params: {}", channelCode, params);
        return (ApiResponse<Map<String, Object>>) client.put("channels/" + channelCode + "/toggle", params,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> getBalance(String accountId) {
        logger.info("Getting balance for account: {}", accountId);
        return (ApiResponse<Map<String, Object>>) client.get("accounts/" + accountId + "/balance", null,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<List<PaymentResponse>> getTransactions(Map<String, Object> params) {
        logger.info("Getting transactions with params: {}", params);
        return (ApiResponse<List<PaymentResponse>>) client.get("transactions", params,
                new AutoPayClient.TypeReference<List<PaymentResponse>>() {});
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> getAccountStatistics(Map<String, Object> params) {
        logger.info("Getting account statistics with params: {}", params);
        return (ApiResponse<Map<String, Object>>) client.get("statistics/account", params,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    public String getVersion() {
        return VERSION;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public ApiResponse<Map<String, Object>> healthCheck() {
        logger.info("Performing health check");
        return (ApiResponse<Map<String, Object>>) client.get("health", null,
                new AutoPayClient.TypeReference<Map<String, Object>>() {});
    }
    
    @Override
    public AutoPayConfig getConfig() {
        return client.getConfig();
    }
    
    @Override
    public AutoPayClient getClient() {
        return client;
    }
    
    @Override
    public void close() {
        logger.info("Closing AutoPay service");
        client.close();
    }
}