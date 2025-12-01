package com.autopay.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 风控规则实体类
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("sys_risk_rule")
public class RiskRule implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 规则名称
     */
    @TableField("rule_name")
    private String ruleName;

    /**
     * 规则类型 (1:金额限制 2:频率限制 3:地域限制 4:设备限制 5:黑名单 6:白名单)
     */
    @TableField("rule_type")
    private Integer ruleType;

    /**
     * 规则描述
     */
    @TableField("description")
    private String description;

    /**
     * 风险等级 (1:低风险 2:中风险 3:高风险)
     */
    @TableField("risk_level")
    private Integer riskLevel;

    /**
     * 规则条件 (JSON格式存储)
     */
    @TableField("rule_conditions")
    private String ruleConditions;

    /**
     * 阈值设置 (JSON格式存储)
     */
    @TableField("thresholds")
    private String thresholds;

    /**
     * 是否启用 (0:禁用 1:启用)
     */
    @TableField("enabled")
    private Boolean enabled;

    /**
     * 优先级
     */
    @TableField("priority")
    private Integer priority;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 创建人
     */
    @TableField(value = "created_by", fill = FieldFill.INSERT)
    private String createdBy;

    /**
     * 更新人
     */
    @TableField(value = "updated_by", fill = FieldFill.INSERT_UPDATE)
    private String updatedBy;
}