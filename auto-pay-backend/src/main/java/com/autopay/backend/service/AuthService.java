package com.autopay.backend.service;

import com.autopay.backend.dto.request.auth.*;
import com.autopay.backend.dto.response.auth.*;
import com.autopay.backend.entity.User;
import com.autopay.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证服务
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * 用户登录
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // 验证用户名和密码
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            User user = userService.getUserByUsername(request.getUsername());
            
            if (!user.getEnabled()) {
                throw new IllegalArgumentException("用户账户已被禁用");
            }

            // 生成JWT令牌
            String accessToken = jwtUtil.generateToken(user.getUsername(), user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getId());

            // 更新最后登录时间
            userService.updateLastLoginTime(user.getId());

            log.info("用户 {} 登录成功", user.getUsername());

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtUtil.getExpirationDateFromToken(accessToken))
                    .userInfo(UserInfo.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .merchantNo(user.getMerchantNo())
                            .build())
                    .build();

        } catch (AuthenticationException e) {
            log.error("用户 {} 登录失败: {}", request.getUsername(), e.getMessage());
            throw new IllegalArgumentException("用户名或密码错误");
        }
    }

    /**
     * 用户注册
     */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // 验证用户名是否已存在
        if (userService.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("用户名已存在");
        }

        // 验证邮箱是否已存在
        if (userService.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("邮箱已被注册");
        }

        // 验证手机号是否已存在
        if (userService.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("手机号已被注册");
        }

        // 验证商户号是否已存在
        if (request.getMerchantNo() != null && 
            userService.existsByMerchantNo(request.getMerchantNo())) {
            throw new IllegalArgumentException("商户号已存在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setMerchantNo(request.getMerchantNo());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setCreatedBy("system");
        user.setUpdatedBy("system");

        userService.createUser(user);

        log.info("用户 {} 注册成功", user.getUsername());

        return RegisterResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .message("注册成功")
                .build();
    }

    /**
     * 刷新令牌
     */
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        try {
            // 验证刷新令牌
            if (!jwtUtil.validateToken(request.getRefreshToken())) {
                throw new IllegalArgumentException("刷新令牌无效或已过期");
            }

            String username = jwtUtil.getUsernameFromToken(request.getRefreshToken());
            String tokenType = jwtUtil.getTokenType(request.getRefreshToken());

            if (!"refresh".equals(tokenType)) {
                throw new IllegalArgumentException("令牌类型不正确");
            }

            User user = userService.getUserByUsername(username);
            
            if (!user.getEnabled()) {
                throw new IllegalArgumentException("用户账户已被禁用");
            }

            // 生成新的访问令牌
            String newAccessToken = jwtUtil.generateToken(user.getUsername(), user.getId());

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtUtil.getExpirationDateFromToken(newAccessToken))
                    .build();

        } catch (Exception e) {
            log.error("刷新令牌失败: {}", e.getMessage());
            throw new IllegalArgumentException("刷新令牌失败");
        }
    }

    /**
     * 修改密码
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // 验证原密码
        User user = userService.getUserByUsername(request.getUsername());
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("原密码错误");
        }

        // 验证新密码和确认密码
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("新密码和确认密码不一致");
        }

        // 更新密码
        userService.updatePassword(user.getId(), request.getNewPassword());

        log.info("用户 {} 修改密码成功", user.getUsername());
    }

    /**
     * 重置密码
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 验证用户信息
        User user = userService.getUserByUsername(request.getUsername());
        
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        // 生成临时令牌
        String temporaryToken = jwtUtil.generateTemporaryToken(
                user.getUsername(), 
                user.getId(), 
                30 // 30分钟有效期
        );

        // TODO: 发送重置密码邮件或短信
        
        log.info("用户 {} 重置密码请求已处理", user.getUsername());
    }

    /**
     * 验证临时令牌
     */
    public ValidateTokenResponse validateTemporaryToken(ValidateTokenRequest request) {
        try {
            if (!jwtUtil.validateToken(request.getToken())) {
                return ValidateTokenResponse.builder()
                        .valid(false)
                        .message("令牌无效或已过期")
                        .build();
            }

            String tokenType = jwtUtil.getTokenType(request.getToken());
            if (!"temporary".equals(tokenType)) {
                return ValidateTokenResponse.builder()
                        .valid(false)
                        .message("令牌类型不正确")
                        .build();
            }

            return ValidateTokenResponse.builder()
                    .valid(true)
                    .message("令牌有效")
                    .build();

        } catch (Exception e) {
            return ValidateTokenResponse.builder()
                    .valid(false)
                    .message("令牌验证失败")
                    .build();
        }
    }

    /**
     * 登出
     */
    @Transactional
    public void logout(String username) {
        // TODO: 将令牌加入黑名单或删除刷新令牌缓存
        
        log.info("用户 {} 登出成功", username);
    }
}