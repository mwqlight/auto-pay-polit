package com.autopay.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付渠道配置实体类
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ap_payment_channel")
public class PaymentChannel implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 渠道编码(唯一)
     */
    @TableField("channel_code")
    private String channelCode;

    /**
     * 渠道名称
     */
    @TableField("channel_name")
    private String channelName;

    /**
     * 渠道类型: 1-微信 2-支付宝 3-银联 4-Apple Pay 5-Google Pay 6-PayPal 7-Stripe 8-云闪付
     */
    @TableField("channel_type")
    private Integer channelType;

    /**
     * 支付场景: APP/H5/MP/PC/QR_CODE
     */
    @TableField("payment_scene")
    private String paymentScene;

    /**
     * 支持币种(逗号分隔)
     */
    @TableField("support_currencies")
    private String supportCurrencies;

    /**
     * 渠道状态: 1-启用 2-禁用 3-维护中
     */
    @TableField("status")
    private Integer status;

    /**
     * 优先级(数字越小优先级越高)
     */
    @TableField("priority")
    private Integer priority;

    /**
     * 手续费率
     */
    @TableField("fee_rate")
    private BigDecimal feeRate;

    /**
     * 最小交易金额
     */
    @TableField("min_amount")
    private BigDecimal minAmount;

    /**
     * 最大交易金额
     */
    @TableField("max_amount")
    private BigDecimal maxAmount;

    /**
     * 单日限额
     */
    @TableField("daily_limit")
    private BigDecimal dailyLimit;

    /**
     * 单笔限额
     */
    @TableField("single_limit")
    private BigDecimal singleLimit;

    /**
     * API基础URL
     */
    @TableField("api_base_url")
    private String apiBaseUrl;

    /**
     * 商户ID/应用ID
     */
    @TableField("merchant_id")
    private String merchantId;

    /**
     * 应用密钥
     */
    @TableField("app_secret")
    private String appSecret;

    /**
     * 证书路径
     */
    @TableField("cert_path")
    private String certPath;

    /**
     * 证书密码
     */
    @TableField("cert_password")
    private String certPassword;

    /**
     * 回调URL
     */
    @TableField("notify_url")
    private String notifyUrl;

    /**
     * 返回URL
     */
    @TableField("return_url")
    private String returnUrl;

    /**
     * 加密方式
     */
    @TableField("encrypt_method")
    private String encryptMethod;

    /**
     * 签名算法
     */
    @TableField("sign_algorithm")
    private String signAlgorithm;

    /**
     * 渠道配置参数(JSON格式)
     */
    @TableField("channel_config")
    private String channelConfig;

    /**
     * 超时时间(秒)
     */
    @TableField("timeout")
    private Integer timeout;

    /**
     * 重试次数
     */
    @TableField("retry_count")
    private Integer retryCount;

    /**
     * 健康检查URL
     */
    @TableField("health_check_url")
    private String healthCheckUrl;

    /**
     * 最近健康检查时间
     */
    @TableField("last_health_check")
    private LocalDateTime lastHealthCheck;

    /**
     * 健康状态: 1-健康 2-异常 3-未知
     */
    @TableField("health_status")
    private Integer healthStatus;

    /**
     * 成功率(最近24小时)
     */
    @TableField("success_rate")
    private BigDecimal successRate;

    /**
     * 平均响应时间(毫秒)
     */
    @TableField("avg_response_time")
    private Integer avgResponseTime;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 创建者
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private String createBy;

    /**
     * 更新者
     */
    @TableField(value = "update_by", fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /**
     * 是否删除: 0-未删除 1-已删除
     */
    @TableField("deleted")
    @TableLogic
    private Integer deleted;

    /**
     * 渠道类型枚举
     */
    public enum ChannelType {
        WECHAT(1, "微信支付"),
        ALIPAY(2, "支付宝"),
        UNIONPAY(3, "银联支付"),
        APPLE_PAY(4, "Apple Pay"),
        GOOGLE_PAY(5, "Google Pay"),
        PAYPAL(6, "PayPal"),
        STRIPE(7, "Stripe"),
        UNIONCLOUD(8, "云闪付");

        private final Integer code;
        private final String description;

        ChannelType(Integer code, String description) {
            this.code = code;
            this.description = description;
        }

        public Integer getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 渠道状态枚举
     */
    public enum Status {
        ENABLED(1, "启用"),
        DISABLED(2, "禁用"),
        MAINTENANCE(3, "维护中");

        private final Integer code;
        private final String description;

        Status(Integer code, String description) {
            this.code = code;
            this.description = description;
        }

        public Integer getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 健康状态枚举
     */
    public enum HealthStatus {
        HEALTHY(1, "健康"),
        ABNORMAL(2, "异常"),
        UNKNOWN(3, "未知");

        private final Integer code;
        private final String description;

        HealthStatus(Integer code, String description) {
            this.code = code;
            this.description = description;
        }

        public Integer getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }
}