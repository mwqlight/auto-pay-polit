package com.autopay.backend.repository;

import com.autopay.backend.entity.PaymentChannel;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 支付渠道数据访问层
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Mapper
public interface PaymentChannelRepository extends BaseMapper<PaymentChannel> {

    /**
     * 根据渠道编码查询
     */
    @Select("SELECT * FROM ap_payment_channel WHERE channel_code = #{channelCode} AND deleted = 0")
    PaymentChannel findByChannelCode(@Param("channelCode") String channelCode);

    /**
     * 查询启用的渠道
     */
    @Select("SELECT * FROM ap_payment_channel WHERE status = 1 AND deleted = 0 ORDER BY priority ASC")
    List<PaymentChannel> findEnabledChannels();

    /**
     * 根据支付场景查询渠道
     */
    @Select("SELECT * FROM ap_payment_channel WHERE status = 1 AND payment_scene LIKE CONCAT('%', #{scene}, '%') AND deleted = 0 ORDER BY priority ASC")
    List<PaymentChannel> findByScene(@Param("scene") String scene);

    /**
     * 查询健康的渠道
     */
    @Select("SELECT * FROM ap_payment_channel WHERE status = 1 AND health_status = 1 AND deleted = 0 ORDER BY priority ASC")
    List<PaymentChannel> findHealthyChannels();

    /**
     * 根据渠道类型查询
     */
    @Select("SELECT * FROM ap_payment_channel WHERE channel_type = #{channelType} AND deleted = 0")
    List<PaymentChannel> findByChannelType(@Param("channelType") Integer channelType);

    /**
     * 查询需要健康检查的渠道
     */
    @Select("SELECT * FROM ap_payment_channel WHERE status = 1 AND health_check_url IS NOT NULL AND " +
            "(last_health_check IS NULL OR last_health_check <= DATE_SUB(NOW(), INTERVAL #{interval} SECOND)) AND deleted = 0")
    List<PaymentChannel> findChannelsForHealthCheck(@Param("interval") Integer interval);
}