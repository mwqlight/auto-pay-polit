package com.autopay.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付请求DTO
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Data
@Schema(description = "支付请求参数")
public class PaymentRequest {

    @Schema(description = "商户订单号", example = "ORDER_202401011200000001", required = true)
    @NotBlank(message = "商户订单号不能为空")
    private String outTradeNo;

    @Schema(description = "支付金额", example = "0.01", required = true)
    @NotNull(message = "支付金额不能为空")
    @DecimalMin(value = "0.01", message = "支付金额必须大于0")
    private BigDecimal totalAmount;

    @Schema(description = "币种", example = "CNY", required = true)
    @NotBlank(message = "币种不能为空")
    private String currency;

    @Schema(description = "订单标题", example = "测试商品", required = true)
    @NotBlank(message = "订单标题不能为空")
    private String subject;

    @Schema(description = "订单描述", example = "测试商品详情")
    private String body;

    @Schema(description = "支付场景", example = "APP", required = true,
            allowableValues = {"APP", "H5", "MP", "PC", "QR_CODE"})
    @NotBlank(message = "支付场景不能为空")
    private String scene;

    @Schema(description = "支付渠道", example = "WECHAT", required = true,
            allowableValues = {"WECHAT", "ALIPAY", "UNIONPAY", "APPLE_PAY", "GOOGLE_PAY", "PAYPAL", "STRIPE", "UNIONCLOUD"})
    @NotBlank(message = "支付渠道不能为空")
    private String channel;

    @Schema(description = "异步通知URL", example = "https://your-domain.com/pay/notify")
    private String notifyUrl;

    @Schema(description = "支付完成返回URL", example = "https://your-domain.com/pay/return")
    private String returnUrl;

    @Schema(description = "订单过期时间", example = "2024-01-01T12:30:00")
    private LocalDateTime timeExpire;

    @Schema(description = "附加参数", example = "{\"userId\":\"10001\",\"productId\":\"20001\"}")
    private String passbackParams;

    @Schema(description = "客户端IP地址", example = "192.168.1.100")
    private String clientIp;

    @Schema(description = "设备类型", example = "PC")
    private String deviceType;

    @Schema(description = "用户代理", example = "Mozilla/5.0...")
    private String userAgent;
}