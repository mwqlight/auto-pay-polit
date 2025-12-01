package com.autopay.backend.service;

import com.autopay.backend.entity.TransactionStatistics;
import com.autopay.backend.repository.TransactionStatisticsRepository;
import com.autopay.backend.repository.RiskMonitoringRepository;
import com.autopay.backend.repository.TransactionRepository;
import com.autopay.backend.repository.PaymentChannelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据分析服务
 * 提供交易统计分析、风控监控、报表生成等功能
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionStatisticsRepository statisticsRepository;
    private final RiskMonitoringRepository riskMonitoringRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentChannelRepository paymentChannelRepository;

    /**
     * 获取交易概览数据
     */
    public Map<String, Object> getTransactionOverview(String timeRange) {
        log.info("获取交易概览数据，时间范围：{}", timeRange);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        
        // 1. 获取实时概览数据
        TransactionStatistics realtimeData = statisticsRepository.getRealtimeOverview();
        
        // 2. 获取渠道排行
        List<TransactionStatistics> channelRanking = statisticsRepository.getChannelRanking(startDate, endDate, 5);
        
        // 3. 获取小时趋势
        List<TransactionStatistics> hourlyTrend = statisticsRepository.getHourlyTrend();
        
        // 4. 组装返回数据
        Map<String, Object> result = new HashMap<>();
        result.put("realtime", realtimeData);
        result.put("channelRanking", channelRanking);
        result.put("hourlyTrend", hourlyTrend);
        result.put("timeRange", timeRange);
        result.put("startDate", startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        result.put("endDate", endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        log.info("交易概览数据获取完成");
        return result;
    }

    /**
     * 获取交易趋势数据
     */
    public Map<String, Object> getTransactionTrend(String dimension, String timeRange) {
        log.info("获取交易趋势数据，维度：{}，时间范围：{}", dimension, timeRange);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        
        List<TransactionStatistics> trendData;
        
        switch (dimension.toLowerCase()) {
            case "daily":
                trendData = statisticsRepository.getDailyStatistics(startDate, endDate);
                break;
            case "monthly":
                trendData = statisticsRepository.getMonthlyStatistics(startDate, endDate);
                break;
            default:
                throw new IllegalArgumentException("不支持的统计维度：" + dimension);
        }
        
        // 按时间排序
        trendData = trendData.stream()
                .sorted(Comparator.comparing(TransactionStatistics::getStatisticTime))
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("dimension", dimension);
        result.put("timeRange", timeRange);
        result.put("startDate", startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        result.put("endDate", endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        result.put("trendData", trendData);
        
        return result;
    }

    /**
     * 获取渠道分析数据
     */
    public Map<String, Object> getChannelAnalysis(String timeRange) {
        log.info("获取渠道分析数据，时间范围：{}", timeRange);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        String dateStr = timeRange + " 分析";
        
        // 1. 获取渠道统计
        List<TransactionStatistics> channelStats = statisticsRepository.getChannelStatistics(startDate, endDate, dateStr);
        
        // 2. 获取渠道排行
        List<TransactionStatistics> channelRanking = statisticsRepository.getChannelRanking(startDate, endDate, 10);
        
        // 3. 获取渠道分布（按金额区间）
        List<TransactionStatistics> amountDistribution = statisticsRepository.getAmountDistribution(startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        result.put("channelStats", channelStats);
        result.put("channelRanking", channelRanking);
        result.put("amountDistribution", amountDistribution);
        result.put("timeRange", timeRange);
        result.put("totalChannels", channelRanking.size());
        
        return result;
    }

    /**
     * 获取风控分析数据
     */
    public Map<String, Object> getRiskAnalysis(String timeRange) {
        log.info("获取风控分析数据，时间范围：{}", timeRange);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        
        // 1. 获取风险监控统计
        List<TransactionStatistics> riskStats = riskMonitoringRepository.findRiskStatistics(
                startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        // 2. 获取高风险用户列表
        List<Map<String, Object>> highRiskUsers = riskMonitoringRepository.findHighRiskUsers(10);
        
        // 3. 风险等级分布
        Map<String, Long> riskLevelDistribution = riskStats.stream()
                .collect(Collectors.groupingBy(
                        ts -> Optional.ofNullable(ts.getExtension1()).orElse("UNKNOWN"),
                        Collectors.counting()));
        
        Map<String, Object> result = new HashMap<>();
        result.put("riskStats", riskStats);
        result.put("highRiskUsers", highRiskUsers);
        result.put("riskLevelDistribution", riskLevelDistribution);
        result.put("timeRange", timeRange);
        result.put("totalRisks", riskStats.size());
        
        return result;
    }

    /**
     * 生成交易报表
     */
    public Map<String, Object> generateTransactionReport(String reportType, String timeRange, String format) {
        log.info("生成交易报表，类型：{}，时间范围：{}，格式：{}", reportType, timeRange, format);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        
        // 1. 获取基础数据
        Map<String, Object> overviewData = getTransactionOverview(timeRange);
        Map<String, Object> trendData = getTransactionTrend("daily", timeRange);
        Map<String, Object> channelData = getChannelAnalysis(timeRange);
        
        // 2. 生成报表内容
        Map<String, Object> report = new HashMap<>();
        report.put("reportId", UUID.randomUUID().toString());
        report.put("reportType", reportType);
        report.put("timeRange", timeRange);
        report.put("startDate", startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        report.put("endDate", endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        report.put("overview", overviewData);
        report.put("trendAnalysis", trendData);
        report.put("channelAnalysis", channelData);
        report.put("format", format);
        
        // 3. 根据格式生成不同类型的报表
        switch (format.toLowerCase()) {
            case "summary":
                report.put("summary", generateSummaryReport(overviewData, trendData, channelData));
                break;
            case "detail":
                report.put("details", generateDetailedReport(trendData, channelData));
                break;
            default:
                report.put("summary", generateSummaryReport(overviewData, trendData, channelData));
                break;
        }
        
        log.info("交易报表生成完成");
        return report;
    }

    /**
     * 获取关键指标（KPI）
     */
    public Map<String, Object> getKeyMetrics(String timeRange) {
        log.info("获取关键指标，时间范围：{}", timeRange);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByRange(timeRange);
        
        // 获取实时概览数据
        TransactionStatistics realtimeData = statisticsRepository.getRealtimeOverview();
        
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalTransactions", realtimeData.getTotalCount());
        kpis.put("successRate", realtimeData.getSuccessRate());
        kpis.put("totalAmount", realtimeData.getTotalAmount());
        kpis.put("successAmount", realtimeData.getSuccessAmount());
        kpis.put("netRevenue", realtimeData.getNetAmount());
        kpis.put("averageAmount", realtimeData.getAverageAmount());
        kpis.put("timeRange", timeRange);
        kpis.put("asOfTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        // 计算环比和同比增长
        Map<String, Double> growth = calculateGrowthRates(startDate, endDate);
        kpis.put("growthRates", growth);
        
        return kpis;
    }

    /**
     * 生成汇总报表
     */
    private Map<String, Object> generateSummaryReport(Map<String, Object> overview, 
                                                     Map<String, Object> trend, 
                                                     Map<String, Object> channel) {
        Map<String, Object> summary = new HashMap<>();
        
        // 基础统计
        TransactionStatistics realtime = (TransactionStatistics) overview.get("realtime");
        summary.put("totalTransactions", realtime.getTotalCount());
        summary.put("totalSuccess", realtime.getSuccessCount());
        summary.put("totalFailure", realtime.getFailureCount());
        summary.put("successRate", realtime.getSuccessRate());
        summary.put("totalRevenue", realtime.getSuccessAmount());
        summary.put("netRevenue", realtime.getNetAmount());
        
        // 渠道分析
        List<TransactionStatistics> ranking = (List<TransactionStatistics>) channel.get("channelRanking");
        if (!ranking.isEmpty()) {
            TransactionStatistics topChannel = ranking.get(0);
            summary.put("topChannel", Map.of(
                "code", topChannel.getChannelCode(),
                "name", topChannel.getChannelName(),
                "amount", topChannel.getSuccessAmount()
            ));
        }
        
        // 趋势分析
        List<TransactionStatistics> trendData = (List<TransactionStatistics>) trend.get("trendData");
        if (trendData.size() >= 2) {
            TransactionStatistics latest = trendData.get(trendData.size() - 1);
            TransactionStatistics previous = trendData.get(trendData.size() - 2);
            
            double amountGrowth = 0.0;
            if (previous.getSuccessAmount() != null && previous.getSuccessAmount() > 0) {
                amountGrowth = (double) (latest.getSuccessAmount() - previous.getSuccessAmount()) / previous.getSuccessAmount();
            }
            
            summary.put("trendAnalysis", Map.of(
                "direction", amountGrowth >= 0 ? "up" : "down",
                "growthRate", amountGrowth * 100
            ));
        }
        
        return summary;
    }

    /**
     * 生成详细报表
     */
    private Map<String, Object> generateDetailedReport(Map<String, Object> trend, Map<String, Object> channel) {
        Map<String, Object> details = new HashMap<>();
        
        // 趋势详情
        details.put("trendData", trend.get("trendData"));
        
        // 渠道详情
        details.put("channelData", channel);
        
        // 金额分布
        details.put("amountDistribution", channel.get("amountDistribution"));
        
        return details;
    }

    /**
     * 计算增长率
     */
    private Map<String, Double> calculateGrowthRates(LocalDateTime startDate, LocalDateTime endDate) {
        // 获取当前周期的数据
        TransactionStatistics currentPeriod = statisticsRepository.getRealtimeOverview();
        
        // 获取上一个周期的数据（简化处理，实际需要根据时间范围计算）
        Map<String, Double> growth = new HashMap<>();
        
        // 模拟增长率计算
        growth.put("transactionGrowth", 5.2); // 交易量增长
        growth.put("revenueGrowth", 8.7);     // 收入增长
        growth.put("successRateGrowth", 1.1); // 成功率提升
        
        return growth;
    }

    /**
     * 根据时间范围获取开始时间
     */
    private LocalDateTime getStartDateByRange(String timeRange) {
        LocalDateTime endDate = LocalDateTime.now();
        
        switch (timeRange.toLowerCase()) {
            case "today":
                return endDate.toLocalDate().atStartOfDay();
            case "yesterday":
                return endDate.minusDays(1).toLocalDate().atStartOfDay();
            case "7days":
                return endDate.minusDays(7);
            case "30days":
                return endDate.minusDays(30);
            case "90days":
                return endDate.minusDays(90);
            case "1year":
                return endDate.minusYears(1);
            default:
                return endDate.minusDays(30);
        }
    }
}