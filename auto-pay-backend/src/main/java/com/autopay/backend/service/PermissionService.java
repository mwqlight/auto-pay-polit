package com.autopay.backend.service;

import com.autopay.backend.entity.Permission;
import com.autopay.backend.entity.Role;
import com.autopay.backend.entity.RolePermission;
import com.autopay.backend.entity.UserRole;
import com.autopay.backend.repository.PermissionRepository;
import com.autopay.backend.repository.RolePermissionRepository;
import com.autopay.backend.repository.RoleRepository;
import com.autopay.backend.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 权限管理服务
 * 提供角色管理、权限管理、用户权限查询等功能
 *
 * @author autoPay
 * @since 2024-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    /**
     * 根据用户ID查询用户权限
     */
    public List<String> getUserPermissions(Long userId) {
        log.debug("查询用户权限，用户ID：{}", userId);
        
        // 1. 查询用户角色
        List<UserRole> userRoles = userRoleRepository.findRolesByUserId(userId);
        if (userRoles.isEmpty()) {
            log.warn("用户 {} 没有分配任何角色", userId);
            return new ArrayList<>();
        }
        
        // 2. 提取角色ID列表
        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());
        
        // 3. 查询用户权限
        List<Permission> permissions = permissionRepository.findPermissionsByUserId(userId);
        
        // 4. 提取权限编码
        return permissions.stream()
                .map(Permission::getPermissionCode)
                .collect(Collectors.toList());
    }

    /**
     * 根据用户ID查询用户角色
     */
    public List<String> getUserRoles(Long userId) {
        log.debug("查询用户角色，用户ID：{}", userId);
        
        List<UserRole> userRoles = userRoleRepository.findRolesByUserId(userId);
        if (userRoles.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 批量查询角色信息
        List<String> roleCodes = new ArrayList<>();
        for (UserRole userRole : userRoles) {
            Role role = roleRepository.selectById(userRole.getRoleId());
            if (role != null) {
                roleCodes.add(role.getRoleCode());
            }
        }
        
        return roleCodes;
    }

    /**
     * 检查用户是否有指定权限
     */
    public Boolean hasPermission(Long userId, String permissionCode) {
        List<String> userPermissions = getUserPermissions(userId);
        return userPermissions.contains(permissionCode);
    }

    /**
     * 检查用户是否有指定角色
     */
    public Boolean hasRole(Long userId, String roleCode) {
        List<String> userRoles = getUserRoles(userId);
        return userRoles.contains(roleCode);
    }

    /**
     * 为用户分配角色
     */
    @Transactional
    public void assignRolesToUser(Long userId, List<Long> roleIds) {
        log.info("为用户 {} 分配角色：{}", userId, roleIds);
        
        // 1. 删除用户现有角色
        userRoleRepository.deleteRolesByUserId(userId);
        
        // 2. 批量分配新角色
        if (!roleIds.isEmpty()) {
            userRoleRepository.assignRolesToUser(userId, roleIds);
        }
        
        log.info("用户 {} 角色分配完成", userId);
    }

    /**
     * 为角色分配权限
     */
    @Transactional
    public void assignPermissionsToRole(Long roleId, List<Long> permissionIds) {
        log.info("为角色 {} 分配权限：{}", roleId, permissionIds);
        
        // TODO: 实现为角色分配权限的逻辑
        // 需要先删除角色现有的权限关联，然后添加新的权限关联
        
        log.info("角色 {} 权限分配完成", roleId);
    }

    /**
     * 创建角色
     */
    @Transactional
    public Long createRole(Role role) {
        log.info("创建角色：{}", role.getRoleName());
        
        // 检查角色编码是否已存在
        Role existingRole = roleRepository.findByRoleCode(role.getRoleCode());
        if (existingRole != null) {
            throw new IllegalArgumentException("角色编码已存在");
        }
        
        roleRepository.insert(role);
        
        log.info("角色创建成功，ID：{}", role.getId());
        return role.getId();
    }

    /**
     * 更新角色
     */
    @Transactional
    public void updateRole(Long roleId, Role role) {
        log.info("更新角色，ID：{}", roleId);
        
        role.setId(roleId);
        roleRepository.updateById(role);
        
        log.info("角色更新成功");
    }

    /**
     * 删除角色
     */
    @Transactional
    public void deleteRole(Long roleId) {
        log.info("删除角色，ID：{}", roleId);
        
        // 1. 删除用户角色关联
        // TODO: 实现删除角色相关的用户关联
        
        // 2. 删除角色权限关联
        // TODO: 实现删除角色相关的权限关联
        
        // 3. 删除角色
        roleRepository.deleteById(roleId);
        
        log.info("角色删除成功");
    }

    /**
     * 查询所有角色
     */
    public List<Role> getAllRoles() {
        return roleRepository.selectList(null);
    }

    /**
     * 查询角色详情
     */
    public Role getRoleById(Long roleId) {
        return roleRepository.selectById(roleId);
    }

    /**
     * 查询所有权限
     */
    public List<Permission> getAllPermissions() {
        return permissionRepository.selectList(null);
    }

    /**
     * 查询权限详情
     */
    public Permission getPermissionById(Long permissionId) {
        return permissionRepository.selectById(permissionId);
    }

    /**
     * 创建权限
     */
    @Transactional
    public Long createPermission(Permission permission) {
        log.info("创建权限：{}", permission.getPermissionName());
        
        // 检查权限编码是否已存在
        // TODO: 实现检查逻辑
        
        permissionRepository.insert(permission);
        
        log.info("权限创建成功，ID：{}", permission.getId());
        return permission.getId();
    }

    /**
     * 更新权限
     */
    @Transactional
    public void updatePermission(Long permissionId, Permission permission) {
        log.info("更新权限，ID：{}", permissionId);
        
        permission.setId(permissionId);
        permissionRepository.updateById(permission);
        
        log.info("权限更新成功");
    }

    /**
     * 删除权限
     */
    @Transactional
    public void deletePermission(Long permissionId) {
        log.info("删除权限，ID：{}", permissionId);
        
        // 1. 删除角色权限关联
        // TODO: 实现删除权限相关的角色关联
        
        // 2. 删除权限
        permissionRepository.deleteById(permissionId);
        
        log.info("权限删除成功");
    }

    /**
     * 获取角色的权限列表
     */
    public List<Permission> getRolePermissions(Long roleId) {
        return permissionRepository.findPermissionsByRoleId(roleId);
    }

    /**
     * 检查权限编码是否存在
     */
    public Boolean existsPermissionCode(String permissionCode) {
        // TODO: 实现检查权限编码是否存在的逻辑
        return false;
    }

    /**
     * 检查角色编码是否存在
     */
    public Boolean existsRoleCode(String roleCode) {
        Role role = roleRepository.findByRoleCode(roleCode);
        return role != null;
    }
}