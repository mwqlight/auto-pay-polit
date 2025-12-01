import { PaymentStatus, Currency, PaymentChannel, CustomerInfo } from '../types';
/**
 * 支付响应数据
 */
export declare class PaymentResponse {
    readonly paymentId: string;
    readonly orderId: string;
    readonly amount: number;
    readonly currency: Currency;
    readonly channel: PaymentChannel;
    readonly status: PaymentStatus;
    readonly description?: string;
    readonly paymentUrl?: string;
    readonly qrCode?: string;
    readonly paymentMethod?: Record<string, any>;
    readonly customer?: CustomerInfo;
    readonly metadata?: Record<string, any>;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly expiresAt?: string;
    readonly transactionId?: string;
    readonly fees?: number;
    readonly receivedAmount?: number;
    readonly refundStatus?: PaymentStatus;
    readonly cancelReason?: string;
    private constructor();
    /**
     * 创建支付响应实例
     */
    static create(data: PaymentResponseData): PaymentResponse;
    /**
     * 检查支付状态
     */
    isPending(): boolean;
    /**
     * 检查支付是否成功
     */
    isSuccess(): boolean;
    /**
     * 检查支付是否失败
     */
    isFailed(): boolean;
    /**
     * 检查支付是否取消
     */
    isCancelled(): boolean;
    /**
     * 检查支付是否已过期
     */
    isExpired(): boolean;
    /**
     * 检查支付是否处理中
     */
    isProcessing(): boolean;
    /**
     * 检查支付是否可退款
     */
    isRefundable(): boolean;
    /**
     * 获取状态描述
     */
    getStatusText(): string;
    /**
     * 获取支付类型
     */
    getChannelText(): string;
    /**
     * 转换为JSON对象
     */
    toJSON(): PaymentResponseData;
}
/**
 * 支付响应数据接口
 */
export interface PaymentResponseData {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: Currency;
    channel: PaymentChannel;
    status: PaymentStatus;
    description?: string;
    paymentUrl?: string;
    qrCode?: string;
    paymentMethod?: Record<string, any>;
    customer?: CustomerInfo;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    transactionId?: string;
    fees?: number;
    receivedAmount?: number;
    refundStatus?: PaymentStatus;
    cancelReason?: string;
}
/**
 * 批量操作响应
 */
export interface BatchOperationResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}
/**
 * 批量创建支付响应
 */
export interface BatchCreatePaymentResponse {
    successCount: number;
    failedCount: number;
    results: BatchOperationResponse<PaymentResponse>[];
    totalAmount?: number;
}
//# sourceMappingURL=PaymentResponse.d.ts.map