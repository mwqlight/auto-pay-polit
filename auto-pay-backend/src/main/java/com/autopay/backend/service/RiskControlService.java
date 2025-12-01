package com.autopay.backend.service;

import com.autopay.backend.entity.RiskMonitoring;
import com.autopay.backend.entity.RiskRule;
import com.autopay.backend.repository.RiskMonitoringRepository;
import com.autopay.backend.repository.RiskRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 风控服务
 * 提供实时风控检查、规则管理、监控记录等功能
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RiskControlService {

    private final RiskRuleRepository riskRuleRepository;
    private final RiskMonitoringRepository riskMonitoringRepository;

    /**
     * 执行风控检查
     */
    @Transactional
    public RiskCheckResult performRiskCheck(RiskCheckRequest request) {
        log.info("开始执行风控检查，用户：{}，操作类型：{}", request.getUsername(), request.getOperationType());

        RiskCheckResult result = new RiskCheckResult();
        result.setUsername(request.getUsername());
        result.setOrderNo(request.getOrderNo());
        result.setOperationType(request.getOperationType());
        result.setCheckTime(LocalDateTime.now());

        // 1. 查询启用的风控规则
        List<RiskRule> rules = riskRuleRepository.findEnabledRules();
        
        BigDecimal totalRiskScore = BigDecimal.ZERO;
        StringBuilder riskReasons = new StringBuilder();

        // 2. 逐个规则检查
        for (RiskRule rule : rules) {
            RiskRuleResult ruleResult = evaluateRule(rule, request);
            if (ruleResult.isTriggered()) {
                totalRiskScore = totalRiskScore.add(ruleResult.getRiskScore());
                if (riskReasons.length() > 0) {
                    riskReasons.append("; ");
                }
                riskReasons.append(ruleResult.getReason());
                
                // 记录风控监控
                saveRiskMonitoring(request, rule, ruleResult);
            }
        }

        // 3. 计算总体风险等级
        Integer riskLevel = calculateRiskLevel(totalRiskScore);
        Boolean passed = determineIfPassed(riskLevel, request.getOperationType());

        result.setRiskScore(totalRiskScore);
        result.setRiskLevel(riskLevel);
        result.setPassed(passed);
        result.setRiskReasons(riskReasons.toString());

        // 4. 记录风控检查结果
        logRiskCheckResult(result);

        return result;
    }

    /**
     * 评估单个风控规则
     */
    private RiskRuleResult evaluateRule(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());
        result.setTriggered(false);

        try {
            switch (rule.getRuleType()) {
                case 1: // 金额限制
                    result = evaluateAmountLimit(rule, request);
                    break;
                case 2: // 频率限制
                    result = evaluateFrequencyLimit(rule, request);
                    break;
                case 3: // 地域限制
                    result = evaluateGeographicLimit(rule, request);
                    break;
                case 4: // 设备限制
                    result = evaluateDeviceLimit(rule, request);
                    break;
                case 5: // 黑名单
                    result = evaluateBlacklist(rule, request);
                    break;
                case 6: // 白名单
                    result = evaluateWhitelist(rule, request);
                    break;
                default:
                    log.warn("未知的风控规则类型：{}", rule.getRuleType());
            }
        } catch (Exception e) {
            log.error("风控规则执行异常，规则ID：{}，错误：{}", rule.getId(), e.getMessage());
        }

        return result;
    }

    /**
     * 金额限制检查
     */
    private RiskRuleResult evaluateAmountLimit(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        if (request.getAmount() == null) {
            return result;
        }

        // TODO: 从thresholds中解析金额限制条件
        // 例如：{"maxAmount": 10000, "minAmount": 0.01}
        
        // 模拟检查逻辑
        if (request.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            result.setTriggered(true);
            result.setRiskScore(new BigDecimal("30"));
            result.setReason("单笔交易金额超过限制");
        }

        return result;
    }

    /**
     * 频率限制检查
     */
    private RiskRuleResult evaluateFrequencyLimit(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        // TODO: 查询用户最近的操作频率
        // 例如：1小时内支付次数、1天内支付次数等
        
        // 模拟检查逻辑
        Integer recentCount = 5; // 假设查询到最近1小时有5次操作
        
        if (recentCount > 3) {
            result.setTriggered(true);
            result.setRiskScore(new BigDecimal("20"));
            result.setReason("操作频率过高");
        }

        return result;
    }

    /**
     * 地域限制检查
     */
    private RiskRuleResult evaluateGeographicLimit(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        // TODO: 基于IP地址判断地理位置
        // 检查是否在限制区域
        
        return result;
    }

    /**
     * 设备限制检查
     */
    private RiskRuleResult evaluateDeviceLimit(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        // TODO: 检查设备指纹
        // 例如：新设备、异常设备等
        
        return result;
    }

    /**
     * 黑名单检查
     */
    private RiskRuleResult evaluateBlacklist(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        // TODO: 检查用户、IP、设备等是否在黑名单中
        
        return result;
    }

    /**
     * 白名单检查
     */
    private RiskRuleResult evaluateWhitelist(RiskRule rule, RiskCheckRequest request) {
        RiskRuleResult result = new RiskRuleResult();
        result.setRuleId(rule.getId());
        result.setRuleName(rule.getRuleName());
        result.setRuleType(rule.getRuleType());

        // TODO: 检查用户、IP、设备等是否在白名单中
        // 如果在白名单中，风险直接为0
        
        return result;
    }

    /**
     * 计算风险等级
     */
    private Integer calculateRiskLevel(BigDecimal riskScore) {
        if (riskScore.compareTo(new BigDecimal("10")) <= 0) {
            return 0; // 正常
        } else if (riskScore.compareTo(new BigDecimal("30")) <= 0) {
            return 1; // 低风险
        } else if (riskScore.compareTo(new BigDecimal("60")) <= 0) {
            return 2; // 中风险
        } else {
            return 3; // 高风险
        }
    }

    /**
     * 判断是否通过风控
     */
    private Boolean determineIfPassed(Integer riskLevel, Integer operationType) {
        // 根据操作类型确定风险容忍度
        switch (operationType) {
            case 1: // 登录
                return riskLevel <= 1;
            case 2: // 支付
                return riskLevel <= 0;
            case 3: // 退款
                return riskLevel <= 1;
            case 4: // 提现
                return riskLevel <= 0;
            case 5: // 修改信息
                return riskLevel <= 1;
            default:
                return true;
        }
    }

    /**
     * 保存风控监控记录
     */
    @Transactional
    private void saveRiskMonitoring(RiskCheckRequest request, RiskRule rule, RiskRuleResult ruleResult) {
        RiskMonitoring monitoring = new RiskMonitoring();
        monitoring.setUserId(request.getUserId());
        monitoring.setUsername(request.getUsername());
        monitoring.setOrderNo(request.getOrderNo());
        monitoring.setOperationType(request.getOperationType());
        monitoring.setRiskRuleId(rule.getId());
        monitoring.setRiskRuleName(rule.getRuleName());
        monitoring.setRiskLevel(ruleResult.getRiskLevel());
        monitoring.setRiskScore(ruleResult.getRiskScore());
        monitoring.setTriggerReason(ruleResult.getReason());
        monitoring.setStatus(0); // 待处理
        monitoring.setDeviceInfo(request.getDeviceInfo());
        monitoring.setIpAddress(request.getIpAddress());
        monitoring.setOperationTime(LocalDateTime.now());
        monitoring.setCreatedAt(LocalDateTime.now());

        riskMonitoringRepository.insert(monitoring);
    }

    /**
     * 记录风控检查结果
     */
    private void logRiskCheckResult(RiskCheckResult result) {
        log.info("风控检查完成 - 用户：{}，订单：{}，风险等级：{}，总分：{}，通过：{}，原因：{}", 
                result.getUsername(), result.getOrderNo(), result.getRiskLevel(), 
                result.getRiskScore(), result.getPassed(), result.getRiskReasons());
    }

    /**
     * 查询风控监控记录
     */
    public List<RiskMonitoring> getRiskMonitoringRecords(RiskMonitoringQuery query) {
        // TODO: 实现分页查询逻辑
        return null;
    }

    /**
     * 获取风控统计信息
     */
    public RiskStatistics getRiskStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        // TODO: 实现统计查询逻辑
        RiskStatistics stats = new RiskStatistics();
        return stats;
    }
}