package com.autopay.backend.dto.response.auth;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 登录响应DTO
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@Builder
public class LoginResponse {

    /**
     * 访问令牌
     */
    private String accessToken;

    /**
     * 刷新令牌
     */
    private String refreshToken;

    /**
     * 令牌类型
     */
    private String tokenType;

    /**
     * 过期时间
     */
    private LocalDateTime expiresIn;

    /**
     * 用户信息
     */
    private UserInfo userInfo;
}