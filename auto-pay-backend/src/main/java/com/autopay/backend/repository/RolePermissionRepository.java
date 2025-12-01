package com.autopay.backend.repository;

import com.autopay.backend.entity.RolePermission;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 角色权限关联数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface RolePermissionRepository extends BaseMapper<RolePermission> {
}