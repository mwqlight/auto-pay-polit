package com.autopay.backend.repository;

import com.autopay.backend.entity.RiskMonitoring;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 风控监控数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface RiskMonitoringRepository extends BaseMapper<RiskMonitoring> {
    
    /**
     * 分页查询风控监控记录
     *
     * @param page 分页参数
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param riskLevel 风险等级
     * @param status 处理状态
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 风控监控记录列表
     */
    Page<RiskMonitoring> findRiskMonitoringWithConditions(Page<RiskMonitoring> page,
                                                        @Param("userId") Long userId,
                                                        @Param("operationType") Integer operationType,
                                                        @Param("riskLevel") Integer riskLevel,
                                                        @Param("status") Integer status,
                                                        @Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询高风险用户
     *
     * @param limit 限制数量
     * @return 高风险用户列表
     */
    List<RiskMonitoring> findHighRiskUsers(@Param("limit") Integer limit);
    
    /**
     * 统计风控数据
     *
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 风控统计结果
     */
    Object findRiskStatistics(@Param("startTime") LocalDateTime startTime,
                             @Param("endTime") LocalDateTime endTime);
}