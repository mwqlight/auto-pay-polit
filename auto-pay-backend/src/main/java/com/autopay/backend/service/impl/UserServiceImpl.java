package com.autopay.backend.service.impl;

import cn.hutool.core.util.StrUtil;
import com.autopay.backend.entity.User;
import com.autopay.backend.dto.request.UserCreateRequest;
import com.autopay.backend.dto.request.UserUpdateRequest;
import com.autopay.backend.dto.response.ApiResult;
import com.autopay.backend.repository.UserRepository;
import com.autopay.backend.service.UserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户服务实现类
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserRepository, User> implements UserService {

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<User> createUser(UserCreateRequest request) {
        try {
            // 1. 验证参数
            validateUserCreateRequest(request);

            // 2. 检查用户名、邮箱、手机号是否已存在
            if (!isUsernameAvailable(request.getUsername(), null)) {
                return ApiResult.error("用户名已存在");
            }
            
            if (StrUtil.isNotBlank(request.getEmail()) && !isEmailAvailable(request.getEmail(), null)) {
                return ApiResult.error("邮箱已存在");
            }
            
            if (StrUtil.isNotBlank(request.getPhone()) && !isPhoneAvailable(request.getPhone(), null)) {
                return ApiResult.error("手机号已存在");
            }
            
            if (StrUtil.isNotBlank(request.getMerchantNo()) && !isMerchantNoAvailable(request.getMerchantNo(), null)) {
                return ApiResult.error("商户号已存在");
            }

            // 3. 创建用户
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setRealName(request.getRealName());
            user.setMerchantNo(request.getMerchantNo());
            user.setUserType(User.UserType.NORMAL.getCode());
            user.setStatus(User.Status.ACTIVE.getCode());
            user.setLoginCount(0);
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            user.setCreateBy(request.getUsername());
            user.setUpdateBy(request.getUsername());

            save(user);

            log.info("创建用户成功: {}, 用户名: {}", user.getId(), user.getUsername());
            return ApiResult.success("用户创建成功", user);

        } catch (Exception e) {
            log.error("创建用户失败", e);
            return ApiResult.error("创建用户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<Void> deleteUserById(Long id) {
        try {
            if (id == null || id <= 0) {
                return ApiResult.error("用户ID无效");
            }

            User user = getById(id);
            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            removeById(id);

            log.info("删除用户成功: {}, 用户名: {}", id, user.getUsername());
            return ApiResult.success("用户删除成功", null);

        } catch (Exception e) {
            log.error("删除用户失败: {}", id, e);
            return ApiResult.error("删除用户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<User> updateUser(Long id, UserUpdateRequest request) {
        try {
            if (id == null || id <= 0) {
                return ApiResult.error("用户ID无效");
            }

            User user = getById(id);
            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            // 验证用户名、邮箱、手机号是否被其他用户使用
            if (StrUtil.isNotBlank(request.getUsername()) && 
                !isUsernameAvailable(request.getUsername(), id)) {
                return ApiResult.error("用户名已存在");
            }
            
            if (StrUtil.isNotBlank(request.getEmail()) && 
                !isEmailAvailable(request.getEmail(), id)) {
                return ApiResult.error("邮箱已存在");
            }
            
            if (StrUtil.isNotBlank(request.getPhone()) && 
                !isPhoneAvailable(request.getPhone(), id)) {
                return ApiResult.error("手机号已存在");
            }

            // 更新用户信息
            if (StrUtil.isNotBlank(request.getUsername())) {
                user.setUsername(request.getUsername());
            }
            if (StrUtil.isNotBlank(request.getRealName())) {
                user.setRealName(request.getRealName());
            }
            if (StrUtil.isNotBlank(request.getEmail())) {
                user.setEmail(request.getEmail());
            }
            if (StrUtil.isNotBlank(request.getPhone())) {
                user.setPhone(request.getPhone());
            }
            if (StrUtil.isNotBlank(request.getMerchantNo())) {
                user.setMerchantNo(request.getMerchantNo());
            }
            if (request.getUserType() != null) {
                user.setUserType(request.getUserType());
            }
            if (request.getStatus() != null) {
                user.setStatus(request.getStatus());
            }

            user.setUpdateTime(LocalDateTime.now());
            user.setUpdateBy("system");

            updateById(user);

            log.info("更新用户成功: {}, 用户名: {}", id, user.getUsername());
            return ApiResult.success("用户更新成功", user);

        } catch (Exception e) {
            log.error("更新用户失败: {}", id, e);
            return ApiResult.error("更新用户失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> getUserById(Long id) {
        try {
            if (id == null || id <= 0) {
                return ApiResult.error("用户ID无效");
            }

            User user = getById(id);
            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            return ApiResult.success("查询成功", user);

        } catch (Exception e) {
            log.error("查询用户失败: {}", id, e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> getUserByUsername(String username) {
        try {
            if (StrUtil.isBlank(username)) {
                return ApiResult.error("用户名不能为空");
            }

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, username);
            User user = getOne(wrapper);

            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            return ApiResult.success("查询成功", user);

        } catch (Exception e) {
            log.error("根据用户名查询用户失败: {}", username, e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> getUserByEmail(String email) {
        try {
            if (StrUtil.isBlank(email)) {
                return ApiResult.error("邮箱不能为空");
            }

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, email);
            User user = getOne(wrapper);

            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            return ApiResult.success("查询成功", user);

        } catch (Exception e) {
            log.error("根据邮箱查询用户失败: {}", email, e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> getUserByPhone(String phone) {
        try {
            if (StrUtil.isBlank(phone)) {
                return ApiResult.error("手机号不能为空");
            }

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getPhone, phone);
            User user = getOne(wrapper);

            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            return ApiResult.success("查询成功", user);

        } catch (Exception e) {
            log.error("根据手机号查询用户失败: {}", phone, e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> getUserByMerchantNo(String merchantNo) {
        try {
            if (StrUtil.isBlank(merchantNo)) {
                return ApiResult.error("商户号不能为空");
            }

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getMerchantNo, merchantNo);
            User user = getOne(wrapper);

            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            return ApiResult.success("查询成功", user);

        } catch (Exception e) {
            log.error("根据商户号查询用户失败: {}", merchantNo, e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<List<User>> getUserList(Integer page, Integer size, String keyword) {
        try {
            page = page != null && page > 0 ? page : 1;
            size = size != null && size > 0 ? Math.min(size, 100) : 10;
            
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            
            if (StringUtils.isNotBlank(keyword)) {
                wrapper.and(w -> w.like(User::getUsername, keyword)
                    .or().like(User::getRealName, keyword)
                    .or().like(User::getEmail, keyword)
                    .or().like(User::getPhone, keyword));
            }
            
            wrapper.orderByDesc(User::getCreateTime);

            // TODO: 实现分页查询
            List<User> users = list(wrapper);
            
            return ApiResult.success("查询成功", users);

        } catch (Exception e) {
            log.error("查询用户列表失败", e);
            return ApiResult.error("查询失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<Void> batchEnableUsers(List<Long> userIds, boolean enabled) {
        try {
            if (userIds == null || userIds.isEmpty()) {
                return ApiResult.error("用户ID列表不能为空");
            }

            for (Long userId : userIds) {
                User user = getById(userId);
                if (user != null) {
                    user.setStatus(enabled ? User.Status.ACTIVE.getCode() : User.Status.DISABLED.getCode());
                    user.setUpdateTime(LocalDateTime.now());
                    user.setUpdateBy("system");
                    updateById(user);
                }
            }

            log.info("批量{}用户成功，数量: {}", enabled ? "启用" : "禁用", userIds.size());
            return ApiResult.success("批量操作成功", null);

        } catch (Exception e) {
            log.error("批量启用/禁用用户失败", e);
            return ApiResult.error("批量操作失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<Void> resetUserPassword(Long id, String newPassword) {
        try {
            if (id == null || id <= 0) {
                return ApiResult.error("用户ID无效");
            }

            User user = getById(id);
            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            if (StrUtil.isBlank(newPassword) || newPassword.length() < 6) {
                return ApiResult.error("新密码长度不能少于6位");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdateTime(LocalDateTime.now());
            user.setUpdateBy("system");

            updateById(user);

            log.info("重置用户密码成功: {}", id);
            return ApiResult.success("密码重置成功", null);

        } catch (Exception e) {
            log.error("重置用户密码失败: {}", id, e);
            return ApiResult.error("密码重置失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResult<User> authenticateUser(String username, String password) {
        try {
            if (StrUtil.isBlank(username) || StrUtil.isBlank(password)) {
                return ApiResult.error("用户名和密码不能为空");
            }

            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, username);
            User user = getOne(wrapper);

            if (user == null) {
                return ApiResult.error("用户名或密码错误");
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ApiResult.error("用户名或密码错误");
            }

            if (user.getStatus().equals(User.Status.DISABLED.getCode())) {
                return ApiResult.error("用户已被禁用");
            }

            // 更新登录信息
            user.setLastLoginTime(LocalDateTime.now());
            user.setLoginCount(user.getLoginCount() + 1);
            updateById(user);

            log.info("用户登录成功: {}", username);
            return ApiResult.success("登录成功", user);

        } catch (Exception e) {
            log.error("用户登录验证失败: {}", username, e);
            return ApiResult.error("登录失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResult<Void> changePassword(Long id, String oldPassword, String newPassword) {
        try {
            if (id == null || id <= 0) {
                return ApiResult.error("用户ID无效");
            }

            User user = getById(id);
            if (user == null) {
                return ApiResult.error("用户不存在");
            }

            if (StrUtil.isBlank(oldPassword) || !passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ApiResult.error("原密码不正确");
            }

            if (StrUtil.isBlank(newPassword) || newPassword.length() < 6) {
                return ApiResult.error("新密码长度不能少于6位");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdateTime(LocalDateTime.now());
            user.setUpdateBy(user.getUsername());

            updateById(user);

            log.info("用户修改密码成功: {}", id);
            return ApiResult.success("密码修改成功", null);

        } catch (Exception e) {
            log.error("修改用户密码失败: {}", id, e);
            return ApiResult.error("密码修改失败: " + e.getMessage());
        }
    }

    @Override
    public boolean isUsernameAvailable(String username, Long excludeId) {
        if (StrUtil.isBlank(username)) {
            return false;
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        if (excludeId != null) {
            wrapper.ne(User::getId, excludeId);
        }

        return getOne(wrapper) == null;
    }

    @Override
    public boolean isEmailAvailable(String email, Long excludeId) {
        if (StrUtil.isBlank(email)) {
            return true;
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, email);
        if (excludeId != null) {
            wrapper.ne(User::getId, excludeId);
        }

        return getOne(wrapper) == null;
    }

    @Override
    public boolean isPhoneAvailable(String phone, Long excludeId) {
        if (StrUtil.isBlank(phone)) {
            return true;
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getPhone, phone);
        if (excludeId != null) {
            wrapper.ne(User::getId, excludeId);
        }

        return getOne(wrapper) == null;
    }

    @Override
    public boolean isMerchantNoAvailable(String merchantNo, Long excludeId) {
        if (StrUtil.isBlank(merchantNo)) {
            return true;
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getMerchantNo, merchantNo);
        if (excludeId != null) {
            wrapper.ne(User::getId, excludeId);
        }

        return getOne(wrapper) == null;
    }

    /**
     * 验证创建用户请求参数
     */
    private void validateUserCreateRequest(UserCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("用户创建请求参数不能为空");
        }

        if (StrUtil.isBlank(request.getUsername())) {
            throw new IllegalArgumentException("用户名不能为空");
        }

        if (request.getUsername().length() < 3 || request.getUsername().length() > 20) {
            throw new IllegalArgumentException("用户名长度必须在3-20个字符之间");
        }

        if (StrUtil.isBlank(request.getPassword()) || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("密码长度不能少于6位");
        }
    }
}