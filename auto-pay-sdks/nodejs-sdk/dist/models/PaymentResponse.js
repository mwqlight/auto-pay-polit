"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponse = void 0;
const types_1 = require("../types");
/**
 * 支付响应数据
 */
class PaymentResponse {
    constructor(data) {
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
    static create(data) {
        return new PaymentResponse(data);
    }
    /**
     * 检查支付状态
     */
    isPending() {
        return this.status === types_1.PaymentStatus.PENDING;
    }
    /**
     * 检查支付是否成功
     */
    isSuccess() {
        return this.status === types_1.PaymentStatus.SUCCESS;
    }
    /**
     * 检查支付是否失败
     */
    isFailed() {
        return this.status === types_1.PaymentStatus.FAILED;
    }
    /**
     * 检查支付是否取消
     */
    isCancelled() {
        return this.status === types_1.PaymentStatus.CANCELLED;
    }
    /**
     * 检查支付是否已过期
     */
    isExpired() {
        return this.status === types_1.PaymentStatus.EXPIRED;
    }
    /**
     * 检查支付是否处理中
     */
    isProcessing() {
        return this.status === types_1.PaymentStatus.PROCESSING;
    }
    /**
     * 检查支付是否可退款
     */
    isRefundable() {
        return this.isSuccess() && (!this.refundStatus || this.refundStatus === types_1.PaymentStatus.PENDING);
    }
    /**
     * 获取状态描述
     */
    getStatusText() {
        switch (this.status) {
            case types_1.PaymentStatus.PENDING:
                return '待支付';
            case types_1.PaymentStatus.PROCESSING:
                return '处理中';
            case types_1.PaymentStatus.SUCCESS:
                return '支付成功';
            case types_1.PaymentStatus.FAILED:
                return '支付失败';
            case types_1.PaymentStatus.CANCELLED:
                return '已取消';
            case types_1.PaymentStatus.EXPIRED:
                return '已过期';
            default:
                return '未知状态';
        }
    }
    /**
     * 获取支付类型
     */
    getChannelText() {
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
    toJSON() {
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
exports.PaymentResponse = PaymentResponse;
//# sourceMappingURL=PaymentResponse.js.map