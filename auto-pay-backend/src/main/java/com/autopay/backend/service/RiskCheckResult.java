package com.autopay.backend.service;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 风控检查结果
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
public class RiskCheckResult {
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 操作类型
     */
    private Integer operationType;
    
    /**
     * 检查时间
     */
    private LocalDateTime checkTime;
    
    /**
     * 风险分数
     */
    private BigDecimal riskScore;
    
    /**
     * 风险等级 (0:正常 1:低风险 2:中风险 3:高风险)
     */
    private Integer riskLevel;
    
    /**
     * 是否通过风控
     */
    private Boolean passed;
    
    /**
     * 风险原因
     */
    private String riskReasons;
    
    /**
     * 触发的规则
     */
    private List<RiskRuleResult> triggeredRules;
}