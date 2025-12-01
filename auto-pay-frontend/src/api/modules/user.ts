/**
 * AutoPay Payment Platform - User API 模块
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import http from '@/api/http'
import type { User, UserCreateRequest, UserUpdateRequest, ApiResponse, PageResult } from '@/types'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export interface UserListRequest {
  page?: number
  size?: number
  keyword?: string
}

export interface UserListResponse {
  items: User[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  newPassword: string
}

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return http.post('/auth/login', data)
}

/**
 * 用户登出
 */
export function logout(): Promise<ApiResponse> {
  return http.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<ApiResponse<User>> {
  return http.get('/auth/profile')
}

/**
 * 修改密码
 */
export function changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
  return http.post('/auth/change-password', data)
}

/**
 * 重置密码
 */
export function resetPassword(id: number, data: ResetPasswordRequest): Promise<ApiResponse> {
  return http.post(`/users/${id}/reset-password`, data)
}

/**
 * 创建用户
 */
export function createUser(data: UserCreateRequest): Promise<ApiResponse<User>> {
  return http.post('/users', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: UserUpdateRequest): Promise<ApiResponse<User>> {
  return http.put(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number): Promise<ApiResponse> {
  return http.delete(`/users/${id}`)
}

/**
 * 根据ID获取用户
 */
export function getUserById(id: number): Promise<ApiResponse<User>> {
  return http.get(`/users/${id}`)
}

/**
 * 根据用户名获取用户
 */
export function getUserByUsername(username: string): Promise<ApiResponse<User>> {
  return http.get(`/users/username/${username}`)
}

/**
 * 根据邮箱获取用户
 */
export function getUserByEmail(email: string): Promise<ApiResponse<User>> {
  return http.get(`/users/email/${email}`)
}

/**
 * 根据手机号获取用户
 */
export function getUserByPhone(phone: string): Promise<ApiResponse<User>> {
  return http.get(`/users/phone/${phone}`)
}

/**
 * 根据商户号获取用户
 */
export function getUserByMerchantNo(merchantNo: string): Promise<ApiResponse<User>> {
  return http.get(`/users/merchant/${merchantNo}`)
}

/**
 * 获取用户列表
 */
export function getUserList(params: UserListRequest): Promise<ApiResponse<UserListResponse>> {
  return http.get('/users', params)
}

/**
 * 批量启用/禁用用户
 */
export function batchEnableUsers(userIds: number[], enabled: boolean): Promise<ApiResponse> {
  return http.post('/users/batch-enable', { userIds, enabled })
}

/**
 * 验证用户名是否可用
 */
export function checkUsernameAvailable(username: string, excludeId?: number): Promise<ApiResponse<boolean>> {
  return http.get('/users/check-username', { username, excludeId })
}

/**
 * 验证邮箱是否可用
 */
export function checkEmailAvailable(email: string, excludeId?: number): Promise<ApiResponse<boolean>> {
  return http.get('/users/check-email', { email, excludeId })
}

/**
 * 验证手机号是否可用
 */
export function checkPhoneAvailable(phone: string, excludeId?: number): Promise<ApiResponse<boolean>> {
  return http.get('/users/check-phone', { phone, excludeId })
}

/**
 * 验证商户号是否可用
 */
export function checkMerchantNoAvailable(merchantNo: string, excludeId?: number): Promise<ApiResponse<boolean>> {
  return http.get('/users/check-merchant', { merchantNo, excludeId })
}

/**
 * 获取用户统计数据
 */
export function getUserStatistics(): Promise<ApiResponse> {
  return http.get('/users/statistics')
}

export default {
  login,
  logout,
  getCurrentUser,
  changePassword,
  resetPassword,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByPhone,
  getUserByMerchantNo,
  getUserList,
  batchEnableUsers,
  checkUsernameAvailable,
  checkEmailAvailable,
  checkPhoneAvailable,
  checkMerchantNoAvailable,
  getUserStatistics
}