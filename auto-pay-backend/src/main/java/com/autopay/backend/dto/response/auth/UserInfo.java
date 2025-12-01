package com.autopay.backend.dto.response.auth;

import lombok.Builder;
import lombok.Data;

/**
 * 用户信息
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Data
@Builder
public class UserInfo {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 商户号
     */
    private String merchantNo;
}