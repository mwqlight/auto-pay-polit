import { HttpClient } from '../http/Client';
import { ApiResponse, PaymentCallback, Environment } from '../types';
import { PaymentResponse } from '../models/PaymentResponse';
import { CreatePaymentRequest } from '../models/CreatePaymentRequest';
import { QueryPaymentRequest, RefundPaymentRequest } from '../models/QueryPaymentRequest';
import { ChannelInfo, Statistics, HealthCheckResult, PaginatedResponse, ErrorInfo } from '../types';
/**
 * AutoPay 服务类
 */
export declare class AutoPayService {
    private readonly client;
    private readonly baseUrl;
    private readonly secretKey;
    constructor(client: HttpClient, secretKey?: string);
    /**
     * 获取客户端的base URL
     */
    private getBaseUrlFromClient;
    /**
     * ===== 支付相关API =====
     */
    /**
     * 创建支付
     */
    createPayment(request: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 查询支付
     */
    queryPayment(request: QueryPaymentRequest): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 获取支付列表
     */
    getPayments(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>>;
    /**
     * 获取支付详情
     */
    getPaymentById(paymentId: string): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 获取支付详情（按订单ID）
     */
    getPaymentByOrderId(orderId: string): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 关闭支付
     */
    closePayment(paymentId: string, reason?: string): Promise<ApiResponse<void>>;
    /**
     * 申请退款
     */
    refundPayment(paymentId: string, request: RefundPaymentRequest): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 获取退款列表
     */
    getRefunds(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>>;
    /**
     * ===== 渠道管理API =====
     */
    /**
     * 获取支付渠道列表
     */
    getChannels(): Promise<ApiResponse<ChannelInfo[]>>;
    /**
     * 获取渠道详情
     */
    getChannel(channelCode: string): Promise<ApiResponse<ChannelInfo>>;
    /**
     * 获取渠道状态
     */
    getChannelStatus(channelCode: string): Promise<ApiResponse<{
        enabled: boolean;
    }>>;
    /**
     * 切换渠道状态
     */
    toggleChannelStatus(channelCode: string, enabled: boolean): Promise<ApiResponse<{
        enabled: boolean;
    }>>;
    /**
     * ===== 账户管理API =====
     */
    /**
     * 获取账户余额
     */
    getBalance(): Promise<ApiResponse<{
        available: number;
        frozen: number;
        total: number;
    }>>;
    /**
     * 获取交易记录
     */
    getTransactions(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>>;
    /**
     * 获取统计信息
     */
    getPaymentStatistics(params?: Record<string, any>): Promise<ApiResponse<Statistics>>;
    /**
     * 获取日统计
     */
    getDailyStatistics(date?: string): Promise<ApiResponse<Statistics>>;
    /**
     * 获取月统计
     */
    getMonthlyStatistics(year: number, month: number): Promise<ApiResponse<Statistics>>;
    /**
     * ===== 系统管理API =====
     */
    /**
     * 健康检查
     */
    healthCheck(): Promise<ApiResponse<HealthCheckResult>>;
    /**
     * 获取版本信息
     */
    getVersion(): Promise<ApiResponse<{
        sdk: string;
        api: string;
        environment: Environment;
    }>>;
    /**
     * ===== 回调处理API =====
     */
    /**
     * 处理支付回调
     */
    handlePaymentCallback(callbackData: PaymentCallback): Promise<ApiResponse<{
        success: boolean;
        message?: string;
    }>>;
    /**
     * 验证回调签名
     */
    verifyCallbackSignature(callbackData: PaymentCallback, secretKey: string): boolean;
    /**
     * ===== 辅助工具API =====
     */
    /**
     * 验证支付
     */
    verifyPayment(paymentId: string): Promise<ApiResponse<{
        valid: boolean;
        payment?: PaymentResponse;
    }>>;
    /**
     * 同步支付状态
     */
    syncPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 重试支付
     */
    retryPayment(paymentId: string): Promise<ApiResponse<PaymentResponse>>;
    /**
     * 获取错误信息
     */
    getErrorInfo(errorCode: string): Promise<ApiResponse<ErrorInfo>>;
    /**
     * 获取支持的钱包类型
     */
    getSupportedWallets(): Promise<ApiResponse<string[]>>;
}
//# sourceMappingURL=AutoPayService.d.ts.map