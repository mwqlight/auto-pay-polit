package com.autopay.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付订单实体类
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ap_payment_order")
public class PaymentOrder implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 系统交易号
     */
    @TableField("trade_no")
    private String tradeNo;

    /**
     * 商户订单号
     */
    @TableField("out_trade_no")
    private String outTradeNo;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 商户号
     */
    @TableField("merchant_no")
    private String merchantNo;

    /**
     * 支付渠道编码
     */
    @TableField("channel_code")
    private String channelCode;

    /**
     * 支付渠道交易号
     */
    @TableField("channel_trade_no")
    private String channelTradeNo;

    /**
     * 订单标题
     */
    @TableField("subject")
    private String subject;

    /**
     * 订单描述
     */
    @TableField("body")
    private String body;

    /**
     * 交易金额
     */
    @TableField("total_amount")
    private BigDecimal totalAmount;

    /**
     * 实际支付金额
     */
    @TableField("paid_amount")
    private BigDecimal paidAmount;

    /**
     * 币种
     */
    @TableField("currency")
    private String currency;

    /**
     * 支付场景: APP/H5/MP/PC/QR_CODE
     */
    @TableField("scene")
    private String scene;

    /**
     * 订单状态: 1-创建 2-支付中 3-已支付 4-已关闭 5-已退款 6-退款中 7-支付失败
     */
    @TableField("status")
    private Integer status;

    /**
     * 订单类型: 1-普通支付 2-预授权 3-分期付款 4-订阅支付
     */
    @TableField("order_type")
    private Integer orderType;

    /**
     * 支付时间
     */
    @TableField("pay_time")
    private LocalDateTime payTime;

    /**
     * 过期时间
     */
    @TableField("expire_time")
    private LocalDateTime expireTime;

    /**
     * 关闭时间
     */
    @TableField("close_time")
    private LocalDateTime closeTime;

    /**
     * 退款时间
     */
    @TableField("refund_time")
    private LocalDateTime refundTime;

    /**
     * 客户端IP
     */
    @TableField("client_ip")
    private String clientIp;

    /**
     * 用户代理
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 设备类型
     */
    @TableField("device_type")
    private String deviceType;

    /**
     * 回调通知URL
     */
    @TableField("notify_url")
    private String notifyUrl;

    /**
     * 支付完成返回URL
     */
    @TableField("return_url")
    private String returnUrl;

    /**
     * 附加参数(JSON格式)
     */
    @TableField("passback_params")
    private String passbackParams;

    /**
     * 支付信息(JSON格式)
     */
    @TableField("pay_info")
    private String payInfo;

    /**
     * 支付凭据(如prepayId、支付二维码等)
     */
    @TableField("pay_credentials")
    private String payCredentials;

    /**
     * 风险等级: 1-低风险 2-中风险 3-高风险
     */
    @TableField("risk_level")
    private Integer riskLevel;

    /**
     * 风控拦截标记: 0-未拦截 1-已拦截
     */
    @TableField("risk_blocked")
    private Integer riskBlocked;

    /**
     * 风控拦截原因
     */
    @TableField("risk_reason")
    private String riskReason;

    /**
     * 手续费
     */
    @TableField("fee_amount")
    private BigDecimal feeAmount;

    /**
     * 优惠金额
     */
    @TableField("discount_amount")
    private BigDecimal discountAmount;

    /**
     * 实际到账金额
     */
    @TableField("settlement_amount")
    private BigDecimal settlementAmount;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;

    /**
     * 扩展字段1
     */
    @TableField("ext_field1")
    private String extField1;

    /**
     * 扩展字段2
     */
    @TableField("ext_field2")
    private String extField2;

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
     * 订单状态枚举
     */
    public enum Status {
        CREATED(1, "创建"),
        PAYING(2, "支付中"),
        PAID(3, "已支付"),
        CLOSED(4, "已关闭"),
        REFUNDED(5, "已退款"),
        REFUNDING(6, "退款中"),
        FAILED(7, "支付失败");

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

        /**
         * 是否为终态状态
         */
        public boolean isTerminal() {
            return this == PAID || this == CLOSED || this == REFUNDED || this == FAILED;
        }

        /**
         * 是否可以支付
         */
        public boolean canPay() {
            return this == CREATED;
        }

        /**
         * 是否可以退款
         */
        public boolean canRefund() {
            return this == PAID;
        }

        /**
         * 是否可以关闭
         */
        public boolean canClose() {
            return this == CREATED || this == PAYING;
        }
    }

    /**
     * 订单类型枚举
     */
    public enum OrderType {
        NORMAL(1, "普通支付"),
        PRE_AUTHORIZE(2, "预授权"),
        INSTALLMENT(3, "分期付款"),
        SUBSCRIPTION(4, "订阅支付");

        private final Integer code;
        private final String description;

        OrderType(Integer code, String description) {
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
     * 支付场景枚举
     */
    public enum Scene {
        APP("APP", "APP支付"),
        H5("H5", "H5支付"),
        MP("MP", "小程序支付"),
        PC("PC", "PC网站支付"),
        QR_CODE("QR_CODE", "二维码支付");

        private final String code;
        private final String description;

        Scene(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 风险等级枚举
     */
    public enum RiskLevel {
        LOW(1, "低风险"),
        MEDIUM(2, "中风险"),
        HIGH(3, "高风险");

        private final Integer code;
        private final String description;

        RiskLevel(Integer code, String description) {
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