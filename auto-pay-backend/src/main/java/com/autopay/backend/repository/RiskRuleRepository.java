package com.autopay.backend.repository;

import com.autopay.backend.entity.RiskRule;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 风控规则数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface RiskRuleRepository extends BaseMapper<RiskRule> {
    
    /**
     * 查询启用的风控规则
     *
     * @return 风控规则列表
     */
    List<RiskRule> findEnabledRules();
    
    /**
     * 根据规则类型查询风控规则
     *
     * @param ruleType 规则类型
     * @return 风控规则列表
     */
    List<RiskRule> findByRuleType(@Param("ruleType") Integer ruleType);
    
    /**
     * 按优先级查询风控规则
     *
     * @return 风控规则列表
     */
    List<RiskRule> findByPriorityOrder();
}