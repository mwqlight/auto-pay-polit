/**
 * AutoPay Payment Platform - TypeScript 类型定义
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

// ============== 通用类型 ==============
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// ============== 用户相关类型 ==============
export interface User {
  id: number
  username: string
  email?: string
  phone?: string
  realName?: string
  merchantNo?: string
  userType: UserType
  status: UserStatus
  lastLoginTime?: string
  loginCount: number
  createTime: string
  updateTime: string
  createBy: string
  updateBy: string
}

export enum UserType {
  NORMAL = 1,
  ADMIN = 2,
  SYSTEM = 3
}

export enum UserStatus {
  ACTIVE = 1,
  DISABLED = 0
}

export interface UserCreateRequest {
  username: string
  password: string
  email?: string
  phone?: string
  realName?: string
  merchantNo?: string
  userType?: UserType
  status?: UserStatus
}

export interface UserUpdateRequest {
  username?: string
  email?: string
  phone?: string
  realName?: string
  merchantNo?: string
  userType?: UserType
  status?: UserStatus
}

// ============== 支付渠道相关类型 ==============
export interface PaymentChannel {
  id: number
  channelCode: string
  channelName: string
  channelType: ChannelType
  paymentScene: string // JSON字符串格式，存储支持的支付场景
  status: ChannelStatus
  priority: number
  healthStatus: ChannelHealth
  minAmount: number
  maxAmount?: number
  feeRate?: number
  singleDayLimit?: number
  singleMonthLimit?: number
  singleYearLimit?: number
  config: string // JSON字符串格式，存储渠道配置
  description?: string
  createTime: string
  updateTime: string
  createBy: string
  updateBy: string
}

export enum ChannelType {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
  UNIONPAY = 'UNIONPAY',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO'
}

export enum ChannelStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum ChannelHealth {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  MAINTENANCE = 'MAINTENANCE',
  UNKNOWN = 'UNKNOWN'
}

// ============== 支付订单相关类型 ==============
export interface PaymentOrder {
  id: number
  tradeNo: string // 系统交易号
  outTradeNo: string // 商户订单号
  userId: number
  merchantNo: string
  channelCode: string
  channelTradeNo?: string // 渠道交易号
  subject: string
  body?: string
  totalAmount: number
  currency: string
  scene: PaymentScene
  status: PaymentStatus
  orderType: OrderType
  riskLevel: RiskLevel
  clientIp?: string
  userAgent?: string
  deviceType?: DeviceType
  payCredentials?: string // 支付凭证，如二维码链接
  notifyUrl?: string
  returnUrl?: string
  passbackParams?: string // 回传参数
  expireTime: string
  payTime?: string
  closeTime?: string
  refundTime?: string
  createTime: string
  updateTime: string
  createBy: string
  updateBy: string
}

export enum PaymentScene {
  WEB = 'WEB',
  H5 = 'H5',
  APP = 'APP',
  QR_CODE = 'QR_CODE',
  MINI_PROGRAM = 'MINI_PROGRAM',
  POS = 'POS',
  API = 'API'
}

export enum PaymentStatus {
  CREATED = 1,     // 已创建
  PENDING = 2,     // 待支付
  SUCCESS = 3,     // 支付成功
  FAILED = 4,      // 支付失败
  EXPIRED = 5,     // 已过期
  CANCELLED = 6,   // 已取消
  REFUNDING = 7,   // 退款中
  REFUNDED = 8,    // 已退款
  CLOSED = 9       // 已关闭
}

export enum OrderType {
  NORMAL = 1,
  TEST = 2,
  SAMPLE = 3,
  SUBSCRIPTION = 4
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum DeviceType {
  PC = 'PC',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  UNKNOWN = 'UNKNOWN'
}

// ============== 支付请求和响应类型 ==============
export interface PaymentRequest {
  outTradeNo: string // 商户订单号
  totalAmount: number // 支付金额
  currency: string // 币种
  subject: string // 商品标题
  body?: string // 商品描述
  scene: PaymentScene // 支付场景
  clientIp?: string // 客户端IP
  userAgent?: string // 用户代理
  deviceType?: DeviceType // 设备类型
  expireTime?: string // 过期时间
  notifyUrl?: string // 异步通知地址
  returnUrl?: string // 同步跳转地址
  passbackParams?: string // 回传参数
}

export interface PaymentResponse {
  tradeNo: string // 系统交易号
  outTradeNo: string // 商户订单号
  totalAmount: string // 支付金额
  currency: string // 币种
  status: string // 订单状态
  channel: string // 支付渠道
  channelTradeNo?: string // 渠道交易号
  payTime?: string // 支付时间
  createTime: string // 创建时间
  expireTime: string // 过期时间
  closeTime?: string // 关闭时间
  credentials?: string // 支付凭证（如二维码等）
  codeUrl?: string // 支付URL
  qrCode?: string // 二维码内容
  payInfo?: string // 支付信息
  extend?: Record<string, any> // 扩展信息
}

// ============== 统计和分析相关类型 ==============
export interface PaymentStatistics {
  totalTransactions: number
  totalAmount: number
  successfulTransactions: number
  failedTransactions: number
  successRate: number
  avgAmount: number
  channelStatistics: ChannelStat[]
  dailyTrend: DailyStat[]
  hourlyTrend: HourlyStat[]
  riskTransactions: number
  refundTransactions: number
}

export interface ChannelStat {
  channelCode: string
  channelName: string
  transactionCount: number
  totalAmount: number
  successRate: number
}

export interface DailyStat {
  date: string
  transactionCount: number
  totalAmount: number
  successCount: number
  failedCount: number
}

export interface HourlyStat {
  hour: number
  transactionCount: number
  totalAmount: number
}

// ============== 风控相关类型 ==============
export interface RiskRule {
  id: number
  ruleName: string
  ruleType: RiskRuleType
  condition: string // JSON格式的条件配置
  action: RiskAction
  threshold: number
  enabled: boolean
  description?: string
}

export enum RiskRuleType {
  AMOUNT_LIMIT = 'AMOUNT_LIMIT',
  FREQUENCY_LIMIT = 'FREQUENCY_LIMIT',
  TIME_WINDOW = 'TIME_WINDOW',
  BLACKLIST = 'BLACKLIST',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION'
}

export enum RiskAction {
  BLOCK = 'BLOCK',
  WARN = 'WARN',
  LOG = 'LOG',
  REQUIRE_VERIFICATION = 'REQUIRE_VERIFICATION'
}

export interface RiskAlert {
  id: number
  tradeNo: string
  riskLevel: RiskLevel
  riskType: RiskRuleType
  description: string
  actionTaken: RiskAction
  status: AlertStatus
  createTime: string
  resolvedTime?: string
}

export enum AlertStatus {
  NEW = 'NEW',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

// ============== 系统配置相关类型 ==============
export interface SystemConfig {
  id: number
  configKey: string
  configValue: string
  configType: ConfigType
  description?: string
  group?: string
  enabled: boolean
  createTime: string
  updateTime: string
}

export enum ConfigType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON'
}

// ============== 日志和审计相关类型 ==============
export interface AuditLog {
  id: number
  userId: number
  username: string
  action: string
  resource: string
  resourceId?: string
  description: string
  ipAddress: string
  userAgent: string
  requestMethod: string
  requestPath: string
  responseStatus: number
  duration: number
  createTime: string
}

export interface SystemLog {
  id: number
  level: LogLevel
  logger: string
  message: string
  stack?: string
  userId?: number
  username?: string
  ipAddress: string
  userAgent: string
  createTime: string
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// ============== API配置类型 ==============
export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  retries: number
}

export interface ApiError {
  code: number
  message: string
  details?: any
}

// ============== 导航和布局类型 ==============
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  permission?: string
  hidden?: boolean
}

export interface BreadcrumbItem {
  title: string
  path?: string
}

// ============== 表单相关类型 ==============
export interface FormField {
  key: string
  label: string
  type: 'text' | 'number' | 'password' | 'select' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'textarea' | 'file'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  rules?: Array<any>
  disabled?: boolean
  clearable?: boolean
}

export interface FormConfig {
  fields: FormField[]
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: number | string
  submitText?: string
  resetText?: string
  showActions?: boolean
}

// ============== 表格相关类型 ==============
export interface TableColumn {
  key: string
  title: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right' | boolean
  sortable?: boolean | 'ascending' | 'descending'
  filterable?: boolean
  render?: (value: any, record: any) => string | VNode
  align?: 'left' | 'center' | 'right'
}

export interface TableConfig {
  columns: TableColumn[]
  dataSource: any[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
  }
  rowSelection?: {
    selectedRowKeys: any[]
    onChange: (selectedRowKeys: any[], selectedRows: any[]) => void
  }
}

// ============== 工具类型 ==============
export type Dict<T extends string> = Record<T, T>

export type Nullable<T> = T | null

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>