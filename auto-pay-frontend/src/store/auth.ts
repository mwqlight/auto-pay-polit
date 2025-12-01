/**
 * AutoPay Payment Platform - 认证状态管理
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.username || '')
  const userRealName = computed(() => user.value?.realName || userName.value)
  const userId = computed(() => user.value?.id || 0)

  // 动作
  /**
   * 用户登录
   */
  async function login(username: string, password: string) {
    try {
      const response = await userApi.login({ username, password })
      
      if (response.code === 200) {
        const { token: newToken, user: userInfo } = response.data
        
        token.value = newToken
        user.value = userInfo
        permissions.value = userInfo.permissions || []
        roles.value = userInfo.roles || []
        
        // 保存到本地存储
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userInfo))
        
        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败')
      return false
    }
  }

  /**
   * 用户登出
   */
  async function logout() {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地状态
      clearAuthData()
      
      // 跳转到登录页
      router.push('/login')
      
      ElMessage.success('已安全登出')
    }
  }

  /**
   * 获取当前用户信息
   */
  async function fetchCurrentUser() {
    try {
      const response = await userApi.getCurrentUser()
      
      if (response.code === 200) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除认证数据
      clearAuthData()
    }
  }

  /**
   * 修改密码
   */
  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await userApi.changePassword({ oldPassword, newPassword })
      
      if (response.code === 200) {
        ElMessage.success('密码修改成功')
        return true
      } else {
        ElMessage.error(response.message || '密码修改失败')
        return false
      }
    } catch (error: any) {
      console.error('修改密码失败:', error)
      ElMessage.error(error.response?.data?.message || '密码修改失败')
      return false
    }
  }

  /**
   * 检查权限
   */
  function hasPermission(permission: string): boolean {
    if (!permission) return true
    return permissions.value.includes(permission)
  }

  /**
   * 检查角色
   */
  function hasRole(role: string): boolean {
    if (!role) return true
    return roles.value.includes(role)
  }

  /**
   * 清除认证数据
   */
  function clearAuthData() {
    token.value = ''
    user.value = null
    permissions.value = []
    roles.value = []
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * 初始化认证状态
   */
  function initializeAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        
        // TODO: 可以在这里验证token的有效性
      } catch (error) {
        console.error('解析本地用户数据失败:', error)
        clearAuthData()
      }
    }
  }

  return {
    // 状态
    user,
    token,
    permissions,
    roles,
    
    // 计算属性
    isLoggedIn,
    userName,
    userRealName,
    userId,
    
    // 动作
    login,
    logout,
    fetchCurrentUser,
    changePassword,
    hasPermission,
    hasRole,
    clearAuthData,
    initializeAuth
  }
})