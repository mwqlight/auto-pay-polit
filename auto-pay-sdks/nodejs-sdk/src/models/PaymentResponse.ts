import { PaymentStatus, Currency, PaymentChannel, CustomerInfo } from '../types';

/**
 * 支付响应数据
 */
export class PaymentResponse {
  public readonly paymentId: string;
  public readonly orderId: string;
  public readonly amount: number;
  public readonly currency: Currency;
  public readonly channel: PaymentChannel;
  public readonly status: PaymentStatus;
  public readonly description?: string;
  public readonly paymentUrl?: string;
  public readonly qrCode?: string;
  public readonly paymentMethod?: Record<string, any>;
  public readonly customer?: CustomerInfo;
  public readonly metadata?: Record<string, any>;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly expiresAt?: string;
  public readonly transactionId?: string;
  public readonly fees?: number;
  public readonly receivedAmount?: number;
  public readonly refundStatus?: PaymentStatus;
  public readonly cancelReason?: string;

  private constructor(data: PaymentResponseData) {
    this.paymentId = data.paymentId;
    this.orderId = data.orderId;
    this.amount = data.amount;
    this.currency = data.currency;
    this.channel = data.channel;
    this.status = data.status;
    this.description = data.description;
    this.paymentUrl = data.paymentUrl;
    this.qrCode = data.qrCode;
    this.paymentMethod = data.paymentMethod;
    this.customer = data.customer;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.expiresAt = data.expiresAt;
    this.transactionId = data.transactionId;
    this.fees = data.fees;
    this.receivedAmount = data.receivedAmount;
    this.refundStatus = data.refundStatus;
    this.cancelReason = data.cancelReason;
  }

  /**
   * 创建支付响应实例
   */
  public static create(data: PaymentResponseData): PaymentResponse {
    return new PaymentResponse(data);
  }

  /**
   * 检查支付状态
   */
  public isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  /**
   * 检查支付是否成功
   */
  public isSuccess(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  /**
   * 检查支付是否失败
   */
  public isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  /**
   * 检查支付是否取消
   */
  public isCancelled(): boolean {
    return this.status === PaymentStatus.CANCELLED;
  }

  /**
   * 检查支付是否已过期
   */
  public isExpired(): boolean {
    return this.status === PaymentStatus.EXPIRED;
  }

  /**
   * 检查支付是否处理中
   */
  public isProcessing(): boolean {
    return this.status === PaymentStatus.PROCESSING;
  }

  /**
   * 检查支付是否可退款
   */
  public isRefundable(): boolean {
    return this.isSuccess() && (!this.refundStatus || this.refundStatus === PaymentStatus.PENDING);
  }

  /**
   * 获取状态描述
   */
  public getStatusText(): string {
    switch (this.status) {
      case PaymentStatus.PENDING:
        return '待支付';
      case PaymentStatus.PROCESSING:
        return '处理中';
      case PaymentStatus.SUCCESS:
        return '支付成功';
      case PaymentStatus.FAILED:
        return '支付失败';
      case PaymentStatus.CANCELLED:
        return '已取消';
      case PaymentStatus.EXPIRED:
        return '已过期';
      default:
        return '未知状态';
    }
  }

  /**
   * 获取支付类型
   */
  public getChannelText(): string {
    switch (this.channel) {
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信支付';
      case 'unionpay':
        return '银联支付';
      case 'bank_card':
        return '银行卡';
      case 'balance':
        return '余额';
      default:
        return this.channel;
    }
  }

  /**
   * 转换为JSON对象
   */
  public toJSON(): PaymentResponseData {
    return {
      paymentId: this.paymentId,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      channel: this.channel,
      status: this.status,
      description: this.description,
      paymentUrl: this.paymentUrl,
      qrCode: this.qrCode,
      paymentMethod: this.paymentMethod,
      customer: this.customer,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      transactionId: this.transactionId,
      fees: this.fees,
      receivedAmount: this.receivedAmount,
      refundStatus: this.refundStatus,
      cancelReason: this.cancelReason
    };
  }
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