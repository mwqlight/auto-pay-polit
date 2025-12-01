package com.autopay.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 风控监控记录实体类
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("sys_risk_monitoring")
public class RiskMonitoring implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 用户名
     */
    @TableField("username")
    private String username;

    /**
     * 交易订单号
     */
    @TableField("order_no")
    private String orderNo;

    /**
     * 操作类型 (1:登录 2:支付 3:退款 4:提现 5:修改信息)
     */
    @TableField("operation_type")
    private Integer operationType;

    /**
     * 风控规则ID
     */
    @TableField("risk_rule_id")
    private Long riskRuleId;

    /**
     * 风控规则名称
     */
    @TableField("risk_rule_name")
    private String riskRuleName;

    /**
     * 风险等级 (0:正常 1:低风险 2:中风险 3:高风险)
     */
    @TableField("risk_level")
    private Integer riskLevel;

    /**
     * 风险分数 (0-100)
     */
    @TableField("risk_score")
    private BigDecimal riskScore;

    /**
     * 触发原因
     */
    @TableField("trigger_reason")
    private String triggerReason;

    /**
     * 处理状态 (0:待处理 1:已通过 2:已拒绝 3:已人工处理)
     */
    @TableField("status")
    private Integer status;

    /**
     * 处理结果
     */
    @TableField("result")
    private String result;

    /**
     * 设备信息
     */
    @TableField("device_info")
    private String deviceInfo;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 操作时间
     */
    @TableField("operation_time")
    private LocalDateTime operationTime;

    /**
     * 处理时间
     */
    @TableField("handle_time")
    private LocalDateTime handleTime;

    /**
     * 处理人
     */
    @TableField("handler")
    private String handler;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}