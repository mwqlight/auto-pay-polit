package com.autopay.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 支付响应DTO
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Data
@Schema(description = "支付响应结果")
public class PaymentResponse {

    @Schema(description = "系统交易号")
    private String tradeNo;

    @Schema(description = "商户订单号")
    private String outTradeNo;

    @Schema(description = "支付金额")
    private String totalAmount;

    @Schema(description = "币种")
    private String currency;

    @Schema(description = "支付状态")
    private String status;

    @Schema(description = "支付渠道")
    private String channel;

    @Schema(description = "渠道交易号")
    private String channelTradeNo;

    @Schema(description = "支付时间")
    private LocalDateTime payTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "过期时间")
    private LocalDateTime expireTime;

    @Schema(description = "关闭时间")
    private LocalDateTime closeTime;

    @Schema(description = "支付信息")
    private Map<String, Object> payInfo;

    @Schema(description = "支付链接")
    private String payUrl;

    @Schema(description = "深链接")
    private String deeplink;

    @Schema(description = "二维码数据")
    private String qrCode;

    @Schema(description = "支付凭据")
    private String credentials;

    @Schema(description = "附加信息")
    private Map<String, Object> metadata;

    @Schema(description = "错误信息")
    private String errorMessage;

    @Schema(description = "错误代码")
    private String errorCode;
}