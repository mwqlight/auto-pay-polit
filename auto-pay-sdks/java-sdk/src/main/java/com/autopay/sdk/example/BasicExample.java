package com.autopay.sdk.example;

import com.autopay.sdk.AutoPay;
import com.autopay.sdk.client.AutoPayException;
import com.autopay.sdk.model.request.CreatePaymentRequest;
import com.autopay.sdk.model.request.QueryPaymentRequest;
import com.autopay.sdk.model.response.ApiResponse;
import com.autopay.sdk.model.response.PaymentResponse;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * AutoPay SDK使用示例
 */
public class BasicExample {
    
    public static void main(String[] args) {
        // 创建AutoPay实例
        AutoPay autoPay = AutoPay.create("your_api_key", "your_secret_key");
        
        try {
            // 基本支付流程示例
            basicPaymentFlow(autoPay);
            
            // 高级支付流程示例
            advancedPaymentFlow(autoPay);
            
            // 批量查询示例
            batchQueryExample(autoPay);
            
        } catch (AutoPayException e) {
            System.err.println("AutoPay错误: " + e.getMessage());
            System.err.println("错误代码: " + e.getCode());
        } finally {
            // 关闭连接
            autoPay.close();
        }
    }
    
    /**
     * 基本支付流程
     */
    private static void basicPaymentFlow(AutoPay autoPay) {
        System.out.println("=== 基本支付流程 ===");
        
        // 1. 创建支付订单
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId("ORDER_" + System.currentTimeMillis())
                .amount(100.00)
                .currency("CNY")
                .channel("alipay")
                .description("测试订单")
                .build();
        
        System.out.println("创建支付订单: " + request);
        
        ApiResponse<PaymentResponse> paymentResponse = autoPay.getService().createPayment(request);
        
        if (paymentResponse.isSuccess()) {
            PaymentResponse payment = paymentResponse.getData();
            System.out.println("支付创建成功: " + payment.getPaymentId());
            
            // 2. 查询支付状态
            QueryPaymentRequest queryRequest = QueryPaymentRequest.builder()
                    .paymentId(payment.getPaymentId())
                    .build();
            
            ApiResponse<PaymentResponse> queryResponse = autoPay.getService().queryPayment(queryRequest);
            if (queryResponse.isSuccess()) {
                System.out.println("支付状态: " + queryResponse.getData().getStatus());
            }
            
        } else {
            System.err.println("支付创建失败: " + paymentResponse.getMessage());
        }
    }
    
    /**
     * 高级支付流程
     */
    private static void advancedPaymentFlow(AutoPay autoPay) {
        System.out.println("=== 高级支付流程 ===");
        
        // 创建带有客户信息的支付订单
        CreatePaymentRequest.CustomerInfo customerInfo = new CreatePaymentRequest.CustomerInfo(
                "张三", "zhangsan@example.com"
        );
        customerInfo.setPhone("13800138000");
        
        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId("ADVANCED_" + System.currentTimeMillis())
                .amount(299.99)
                .currency("CNY")
                .channel("wechat_pay")
                .description("高级套餐订单")
                .customerId("CUSTOMER_001")
                .customer(customerInfo)
                .metadata("promotion_code", "DISCOUNT20")
                .metadata("source", "mobile_app")
                .timeout(1800) // 30分钟超时
                .build();
        
        System.out.println("创建高级支付订单");
        
        ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
        
        if (response.isSuccess()) {
            PaymentResponse payment = response.getData();
            System.out.println("支付详情:");
            System.out.println("  支付ID: " + payment.getPaymentId());
            System.out.println("  订单ID: " + payment.getOrderId());
            System.out.println("  金额: " + payment.getAmount());
            System.out.println("  状态: " + payment.getStatus());
            System.out.println("  创建时间: " + payment.getCreatedAt());
        }
        
        // 关闭订单示例
        if (response.isSuccess()) {
            String paymentId = response.getData().getPaymentId();
            ApiResponse<Void> closeResponse = autoPay.getService().closePayment(paymentId);
            if (closeResponse.isSuccess()) {
                System.out.println("订单关闭成功");
            }
        }
    }
    
    /**
     * 批量查询示例
     */
    private static void batchQueryExample(AutoPay autoPay) {
        System.out.println("=== 批量查询示例 ===");
        
        // 构建查询条件
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("start_time", "2024-01-01 00:00:00");
        queryParams.put("end_time", "2024-01-31 23:59:59");
        queryParams.put("status", "success");
        queryParams.put("channel", "alipay");
        queryParams.put("page", 1);
        queryParams.put("size", 10);
        
        ApiResponse<java.util.List<PaymentResponse>> response = autoPay.getService().getPayments(queryParams);
        
        if (response.isSuccess()) {
            java.util.List<PaymentResponse> payments = response.getData();
            System.out.println("查询到支付记录: " + payments.size() + " 条");
            
            for (PaymentResponse payment : payments) {
                System.out.println("  支付ID: " + payment.getPaymentId() + 
                                 ", 状态: " + payment.getStatus() + 
                                 ", 金额: " + payment.getAmount());
            }
        }
    }
}