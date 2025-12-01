package com.autopay.backend.repository;

import com.autopay.backend.entity.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户数据访问层
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Mapper
public interface UserRepository extends BaseMapper<User> {

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM ap_user WHERE username = #{username} AND deleted = 0")
    User findByUsername(@Param("username") String username);

    /**
     * 根据邮箱查询用户
     */
    @Select("SELECT * FROM ap_user WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);

    /**
     * 根据手机号查询用户
     */
    @Select("SELECT * FROM ap_user WHERE phone = #{phone} AND deleted = 0")
    User findByPhone(@Param("phone") String phone);

    /**
     * 根据商户号查询用户
     */
    @Select("SELECT * FROM ap_user WHERE merchant_no = #{merchantNo} AND deleted = 0")
    User findByMerchantNo(@Param("merchantNo") String merchantNo);

    /**
     * 查询所有企业用户
     */
    @Select("SELECT * FROM ap_user WHERE user_type = 2 AND deleted = 0")
    List<User> findEnterpriseUsers();

    /**
     * 根据状态查询用户
     */
    @Select("SELECT * FROM ap_user WHERE status = #{status} AND deleted = 0")
    List<User> findByStatus(@Param("status") Integer status);

    /**
     * 查询最近登录的用户
     */
    @Select("SELECT * FROM ap_user WHERE last_login_time >= #{startTime} AND deleted = 0 ORDER BY last_login_time DESC")
    List<User> findRecentLoginUsers(@Param("startTime") String startTime);
}