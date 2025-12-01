package com.autopay.backend.repository;

import com.autopay.backend.entity.Role;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 角色数据访问层
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Mapper
public interface RoleRepository extends BaseMapper<Role> {
    
    /**
     * 根据角色编码查询角色
     *
     * @param roleCode 角色编码
     * @return 角色信息
     */
    Role findByRoleCode(@Param("roleCode") String roleCode);
}