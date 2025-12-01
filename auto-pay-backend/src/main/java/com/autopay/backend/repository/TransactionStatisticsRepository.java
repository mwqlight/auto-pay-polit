package com.autopay.backend.repository;

import com.autopay.backend.entity.TransactionStatistics;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 交易统计数据访问层接口
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface TransactionStatisticsRepository extends BaseMapper<TransactionStatistics> {

    /**
     * 按日统计交易数据
     */
    @Select("""
        SELECT 
            'daily' as dimension,
            DATE(created_at) as statistic_time,
            payment_channel_id,
            channel_code,
            channel_name,
            transaction_status,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) as failure_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount,
            AVG(amount) as average_amount,
            ROUND(SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate,
            ROUND(SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as failure_rate,
            SUM(platform_fee) as total_fee,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN (amount - platform_fee) ELSE 0 END) as net_amount,
            DATE_FORMAT(DATE(created_at), '%Y-%m-%d 00:00:00') as stat_start_time,
            DATE_FORMAT(DATE(created_at), '%Y-%m-%d 23:59:59') as stat_end_time,
            NOW() as generated_at
        FROM transaction 
        WHERE created_at BETWEEN #{startDate} AND #{endDate}
        GROUP BY DATE(created_at), payment_channel_id, channel_code, channel_name, transaction_status
        ORDER BY statistic_time DESC
    """)
    List<TransactionStatistics> getDailyStatistics(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * 按月统计交易数据
     */
    @Select("""
        SELECT 
            'monthly' as dimension,
            DATE_FORMAT(created_at, '%Y-%m') as statistic_time,
            payment_channel_id,
            channel_code,
            channel_name,
            transaction_status,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) as failure_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount,
            AVG(amount) as average_amount,
            ROUND(SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate,
            ROUND(SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as failure_rate,
            SUM(platform_fee) as total_fee,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN (amount - platform_fee) ELSE 0 END) as net_amount,
            DATE_FORMAT(DATE_FORMAT(created_at, '%Y-%m-01'), '%Y-%m-%d %H:%i:%s') as stat_start_time,
            DATE_FORMAT(LAST_DAY(created_at), '%Y-%m-%d %H:%i:%s') as stat_end_time,
            NOW() as generated_at
        FROM transaction 
        WHERE created_at BETWEEN #{startDate} AND #{endDate}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), payment_channel_id, channel_code, channel_name, transaction_status
        ORDER BY statistic_time DESC
    """)
    List<TransactionStatistics> getMonthlyStatistics(@Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * 按渠道统计交易数据
     */
    @Select("""
        SELECT 
            'channel' as dimension,
            #{dateStr} as statistic_time,
            payment_channel_id,
            channel_code,
            channel_name,
            transaction_status,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) as failure_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount,
            AVG(amount) as average_amount,
            ROUND(SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate,
            ROUND(SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as failure_rate,
            SUM(platform_fee) as total_fee,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN (amount - platform_fee) ELSE 0 END) as net_amount,
            #{startDate} as stat_start_time,
            #{endDate} as stat_end_time,
            NOW() as generated_at
        FROM transaction 
        WHERE created_at BETWEEN #{startDate} AND #{endDate}
        GROUP BY payment_channel_id, channel_code, channel_name, transaction_status
        ORDER BY total_amount DESC
    """)
    List<TransactionStatistics> getChannelStatistics(@Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate, 
                                                     @Param("dateStr") String dateStr);

    /**
     * 获取实时交易概览数据
     */
    @Select("""
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) as failure_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate,
            SUM(platform_fee) as total_fee
        FROM transaction 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    """)
    TransactionStatistics getRealtimeOverview();

    /**
     * 获取渠道排行数据
     */
    @Select("""
        SELECT 
            channel_code,
            channel_name,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount,
            ROUND(SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
        FROM transaction 
        WHERE created_at BETWEEN #{startDate} AND #{endDate}
        GROUP BY channel_code, channel_name
        ORDER BY success_amount DESC
        LIMIT #{limit}
    """)
    List<TransactionStatistics> getChannelRanking(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate, 
                                                  @Param("limit") int limit);

    /**
     * 获取近24小时趋势数据
     */
    @Select("""
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as statistic_time,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount
        FROM transaction 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')
        ORDER BY statistic_time
    """)
    List<TransactionStatistics> getHourlyTrend();

    /**
     * 获取金额分布统计
     */
    @Select("""
        SELECT 
            CASE 
                WHEN amount < 1000 THEN '0-10元'
                WHEN amount < 5000 THEN '10-50元'
                WHEN amount < 10000 THEN '50-100元'
                WHEN amount < 50000 THEN '100-500元'
                WHEN amount < 100000 THEN '500-1000元'
                ELSE '1000元以上'
            END as dimension,
            COUNT(*) as total_count,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN transaction_status = 'SUCCESS' THEN amount ELSE 0 END) as success_amount
        FROM transaction 
        WHERE created_at BETWEEN #{startDate} AND #{endDate}
        GROUP BY 
            CASE 
                WHEN amount < 1000 THEN '0-10元'
                WHEN amount < 5000 THEN '10-50元'
                WHEN amount < 10000 THEN '50-100元'
                WHEN amount < 50000 THEN '100-500元'
                WHEN amount < 100000 THEN '500-1000元'
                ELSE '1000元以上'
            END
        ORDER BY MIN(amount)
    """)
    List<TransactionStatistics> getAmountDistribution(@Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
}