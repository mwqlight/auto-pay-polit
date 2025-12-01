package com.autopay.backend.repository;

import com.autopay.backend.entity.PaymentOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 支付订单数据访问层接口
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Mapper
public interface PaymentOrderRepository extends BaseMapper<PaymentOrder> {

    /**
     * 根据商户订单号查询支付订单
     */
    @Select("SELECT * FROM payment_order WHERE out_trade_no = #{outTradeNo}")
    PaymentOrder findByOutTradeNo(@Param("outTradeNo") String outTradeNo);

    /**
     * 根据用户ID查询支付订单列表
     */
    @Select("SELECT * FROM payment_order WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<PaymentOrder> findByUserId(@Param("userId") Long userId);

    /**
     * 根据渠道编码查询支付订单
     */
    @Select("SELECT * FROM payment_order WHERE channel_code = #{channelCode} ORDER BY create_time DESC")
    List<PaymentOrder> findByChannelCode(@Param("channelCode") String channelCode);

    /**
     * 根据状态查询支付订单
     */
    @Select("SELECT * FROM payment_order WHERE status = #{status} ORDER BY create_time DESC")
    List<PaymentOrder> findByStatus(@Param("status") Integer status);

    /**
     * 根据创建时间范围查询支付订单
     */
    @Select("SELECT * FROM payment_order WHERE create_time BETWEEN #{startTime} AND #{endTime} ORDER BY create_time DESC")
    List<PaymentOrder> findByCreateTimeRange(@Param("startTime") LocalDateTime startTime, 
                                           @Param("endTime") LocalDateTime endTime);

    /**
     * 查询用户在某时间范围内的订单数量
     */
    @Select("SELECT COUNT(*) FROM payment_order WHERE user_id = #{userId} AND create_time BETWEEN #{startTime} AND #{endTime}")
    int countByUserIdAndCreateTimeRange(@Param("userId") Long userId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);

    /**
     * 查询超过指定时间未支付的订单
     */
    @Select("SELECT * FROM payment_order WHERE status = #{status} AND expire_time < #{expireTime}")
    List<PaymentOrder> findExpiredUnpaidOrders(@Param("status") Integer status, 
                                             @Param("expireTime") LocalDateTime expireTime);

    /**
     * 统计指定时间范围内的交易金额
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM payment_order " +
            "WHERE status = #{status} AND create_time BETWEEN #{startTime} AND #{endTime}")
    String sumAmountByTimeRange(@Param("status") Integer status,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    /**
     * 统计渠道交易量和交易额
     */
    @Select("SELECT channel_code, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total " +
            "FROM payment_order " +
            "WHERE status = #{status} AND create_time BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY channel_code " +
            "ORDER BY total DESC")
    List<Map<String, Object>> getChannelStatistics(@Param("status") Integer status,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * 根据商户号和订单状态统计
     */
    @Select("SELECT merchant_no, status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total " +
            "FROM payment_order " +
            "WHERE create_time BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY merchant_no, status " +
            "ORDER BY merchant_no, status")
    List<Map<String, Object>> getMerchantStatistics(@Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime);
}