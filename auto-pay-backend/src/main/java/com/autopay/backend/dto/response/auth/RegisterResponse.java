package com.autopay.backend.dto.response.auth;

import lombok.Builder;
import lombok.Data;

/**
 * 注册响应DTO
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@Builder
public class RegisterResponse {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 消息
     */
    private String message;
}