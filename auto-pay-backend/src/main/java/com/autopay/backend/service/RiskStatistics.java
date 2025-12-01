package com.autopay.backend.service;

import lombok.Data;

import java.util.List;

/**
 * 风控统计信息
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
public class RiskStatistics {
    
    /**
     * 总检查次数
     */
    private Long totalChecks;
    
    /**
     * 通过次数
     */
    private Long passedChecks;
    
    /**
     * 拦截次数
     */
    private Long blockedChecks;
    
    /**
     * 风险等级分布
     */
    private RiskLevelDistribution riskLevelDistribution;
    
    /**
     * 操作类型统计
     */
    private List<OperationTypeStats> operationTypeStats;
    
    /**
     * 时间段统计
     */
    private List<TimeRangeStats> timeRangeStats;
    
    @Data
    public static class RiskLevelDistribution {
        private Long normal;
        private Long lowRisk;
        private Long mediumRisk;
        private Long highRisk;
    }
    
    @Data
    public static class OperationTypeStats {
        private Integer operationType;
        private String operationName;
        private Long count;
        private Long blockedCount;
        private Double blockRate;
    }
    
    @Data
    public static class TimeRangeStats {
        private String timeRange;
        private Long count;
        private Long blockedCount;
        private Double blockRate;
    }
}