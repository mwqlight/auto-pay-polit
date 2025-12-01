package com.autopay.backend.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.autopay.backend.entity.BaseEntity;

/**
 * 交易统计实体类
 * 按时间、渠道、金额等维度统计交易数据
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("transaction_statistics")
public class TransactionStatistics extends BaseEntity {

    /**
     * 统计维度：daily(按日)、monthly(按月)、yearly(按年)、channel(按渠道)、amount(按金额)
     */
    private String dimension;

    /**
     * 统计时间（格式：yyyy-MM-dd 或 yyyy-MM）
     */
    private String statisticTime;

    /**
     * 支付渠道ID
     */
    private Long paymentChannelId;

    /**
     * 支付渠道编码
     */
    private String channelCode;

    /**
     * 支付渠道名称
     */
    private String channelName;

    /**
     * 交易状态：成功、失败、待处理、退款等
     */
    private String transactionStatus;

    /**
     * 交易总笔数
     */
    private Long totalCount;

    /**
     * 成功笔数
     */
    private Long successCount;

    /**
     * 失败笔数
     */
    private Long failureCount;

    /**
     * 交易总金额（单位：分）
     */
    private Long totalAmount;

    /**
     * 成功交易总金额（单位：分）
     */
    private Long successAmount;

    /**
     * 平均交易金额（单位：分）
     */
    private Long averageAmount;

    /**
     * 成功率（百分比）
     */
    private Double successRate;

    /**
     * 失败率（百分比）
     */
    private Double failureRate;

    /**
     * 手续费总金额（单位：分）
     */
    private Long totalFee;

    /**
     * 净收入（单位：分）
     */
    private Long netAmount;

    /**
     * 统计开始时间
     */
    private String statStartTime;

    /**
     * 统计结束时间
     */
    private String statEndTime;

    /**
     * 统计数据生成时间
     */
    private String generatedAt;

    /**
     * 业务扩展字段1
     */
    private String extension1;

    /**
     * 业务扩展字段2
     */
    private String extension2;
}