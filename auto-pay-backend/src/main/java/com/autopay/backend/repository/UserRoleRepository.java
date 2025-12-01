package com.autopay.backend.repository;

import com.autopay.backend.entity.UserRole;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户角色关联数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface UserRoleRepository extends BaseMapper<UserRole> {
    
    /**
     * 根据用户ID查询角色列表
     *
     * @param userId 用户ID
     * @return 角色列表
     */
    List<UserRole> findRolesByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色ID查询用户列表
     *
     * @param roleId 角色ID
     * @return 用户列表
     */
    List<UserRole> findUsersByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 删除用户的所有角色
     *
     * @param userId 用户ID
     * @return 影响行数
     */
    int deleteRolesByUserId(@Param("userId") Long userId);
    
    /**
     * 为用户分配角色
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 影响行数
     */
    int assignRolesToUser(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);
}