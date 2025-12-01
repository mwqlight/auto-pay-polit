package com.autopay.backend.service;

import com.autopay.backend.entity.PaymentChannel;
import com.autopay.backend.entity.PaymentOrder;
import com.autopay.backend.dto.request.PaymentRequest;
import com.autopay.backend.dto.response.ApiResult;
import com.autopay.backend.dto.response.PaymentResponse;

import java.util.List;

/**
 * 支付服务接口
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
public interface PaymentService {

    /**
     * 创建支付订单
     */
    ApiResult<PaymentResponse> createPayment(PaymentRequest request);

    /**
     * 查询支付状态
     */
    ApiResult<PaymentResponse> queryPayment(String outTradeNo);

    /**
     * 关闭支付订单
     */
    ApiResult<Void> closePayment(String outTradeNo);

    /**
     * 处理渠道回调
     */
    ApiResult<Void> handleChannelCallback(String channelCode, String callbackData);

    /**
     * 智能路由选择渠道
     */
    PaymentChannel selectOptimalChannel(String scene, java.math.BigDecimal amount);

    /**
     * 查询用户的支付订单列表
     */
    ApiResult<List<PaymentOrder>> queryPaymentOrders(Long userId, Integer page, Integer size);

    /**
     * 获取支付统计信息
     */
    ApiResult<java.util.Map<String, Object>> getPaymentStatistics();

    /**
     * 渠道健康检查
     */
    ApiResult<Void> performChannelHealthCheck();

    /**
     * 重试失败的支付
     */
    ApiResult<Void> retryFailedPayments();
}