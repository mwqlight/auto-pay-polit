package com.autopay.backend.service;

import com.autopay.backend.entity.User;
import com.autopay.backend.dto.request.UserCreateRequest;
import com.autopay.backend.dto.request.UserUpdateRequest;
import com.autopay.backend.dto.response.ApiResult;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * 用户服务接口
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
public interface UserService extends IService<User> {

    /**
     * 创建用户
     */
    ApiResult<User> createUser(UserCreateRequest request);

    /**
     * 根据ID删除用户
     */
    ApiResult<Void> deleteUserById(Long id);

    /**
     * 更新用户信息
     */
    ApiResult<User> updateUser(Long id, UserUpdateRequest request);

    /**
     * 根据ID查询用户
     */
    ApiResult<User> getUserById(Long id);

    /**
     * 根据用户名查询用户
     */
    ApiResult<User> getUserByUsername(String username);

    /**
     * 根据邮箱查询用户
     */
    ApiResult<User> getUserByEmail(String email);

    /**
     * 根据手机号查询用户
     */
    ApiResult<User> getUserByPhone(String phone);

    /**
     * 根据商户号查询用户
     */
    ApiResult<User> getUserByMerchantNo(String merchantNo);

    /**
     * 分页查询用户列表
     */
    ApiResult<List<User>> getUserList(Integer page, Integer size, String keyword);

    /**
     * 批量启用/禁用用户
     */
    ApiResult<Void> batchEnableUsers(List<Long> userIds, boolean enabled);

    /**
     * 重置用户密码
     */
    ApiResult<Void> resetUserPassword(Long id, String newPassword);

    /**
     * 用户登录验证
     */
    ApiResult<User> authenticateUser(String username, String password);

    /**
     * 修改用户密码
     */
    ApiResult<Void> changePassword(Long id, String oldPassword, String newPassword);

    /**
     * 验证用户名是否可用
     */
    boolean isUsernameAvailable(String username, Long excludeId);

    /**
     * 验证邮箱是否可用
     */
    boolean isEmailAvailable(String email, Long excludeId);

    /**
     * 验证手机号是否可用
     */
    boolean isPhoneAvailable(String phone, Long excludeId);

    /**
     * 验证商户号是否可用
     */
    boolean isMerchantNoAvailable(String merchantNo, Long excludeId);
}