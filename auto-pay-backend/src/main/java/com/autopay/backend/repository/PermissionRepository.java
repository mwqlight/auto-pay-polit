package com.autopay.backend.repository;

import com.autopay.backend.entity.Permission;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 权限数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface PermissionRepository extends BaseMapper<Permission> {
    
    /**
     * 根据用户ID查询权限列表
     *
     * @param userId 用户ID
     * @return 权限列表
     */
    List<Permission> findPermissionsByUserId(@Param("userId") Long userId);
    
    /**
     * 根据角色ID查询权限列表
     *
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<Permission> findPermissionsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 查询所有API权限
     *
     * @return API权限列表
     */
    List<Permission> findApiPermissions();
}