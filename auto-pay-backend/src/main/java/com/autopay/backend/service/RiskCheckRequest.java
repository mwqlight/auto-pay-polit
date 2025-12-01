package com.autopay.backend.service;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 风控检查请求
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
public class RiskCheckRequest {
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 操作类型 (1:登录 2:支付 3:退款 4:提现 5:修改信息)
     */
    private Integer operationType;
    
    /**
     * 交易金额
     */
    private BigDecimal amount;
    
    /**
     * 设备信息
     */
    private String deviceInfo;
    
    /**
     * IP地址
     */
    private String ipAddress;
    
    /**
     * 地理位置
     */
    private String location;
}