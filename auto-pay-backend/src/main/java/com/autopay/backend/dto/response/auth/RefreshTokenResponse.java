package com.autopay.backend.dto.response.auth;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 刷新令牌响应DTO
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@Builder
public class RefreshTokenResponse {

    /**
     * 新的访问令牌
     */
    private String accessToken;

    /**
     * 令牌类型
     */
    private String tokenType;

    /**
     * 过期时间
     */
    private LocalDateTime expiresIn;
}