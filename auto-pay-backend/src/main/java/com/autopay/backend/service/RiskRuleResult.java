package com.autopay.backend.service;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 风控规则执行结果
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
public class RiskRuleResult {
    
    /**
     * 规则ID
     */
    private Long ruleId;
    
    /**
     * 规则名称
     */
    private String ruleName;
    
    /**
     * 规则类型
     */
    private Integer ruleType;
    
    /**
     * 是否触发
     */
    private Boolean triggered;
    
    /**
     * 风险分数
     */
    private BigDecimal riskScore;
    
    /**
     * 风险等级
     */
    private Integer riskLevel;
    
    /**
     * 触发原因
     */
    private String reason;
}