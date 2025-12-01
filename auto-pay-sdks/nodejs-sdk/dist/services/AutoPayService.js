"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPayService = void 0;
const PaymentResponse_1 = require("../models/PaymentResponse");
/**
 * AutoPay 服务类
 */
class AutoPayService {
    constructor(client, secretKey) {
        this.client = client;
        this.baseUrl = this.getBaseUrlFromClient();
        this.secretKey = secretKey || '';
    }
    /**
     * 获取客户端的base URL
     */
    getBaseUrlFromClient() {
        // 这里需要从client获取baseURL，但为了简化，我们假设它是已知的
        return this.client.getInstance().defaults.baseURL;
    }
    /**
     * ===== 支付相关API =====
     */
    /**
     * 创建支付
     */
    async createPayment(request) {
        try {
            const response = await this.client.post('/payments', request.toJSON());
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 查询支付
     */
    async queryPayment(request) {
        try {
            const queryParams = request.toQueryParams();
            const response = await this.client.get('/payments', { params: queryParams });
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取支付列表
     */
    async getPayments(params = {}) {
        try {
            const response = await this.client.get('/payments', { params });
            const paginatedData = response.data;
            // 转换支付响应数据
            const payments = (paginatedData.data?.items || []).map((item) => PaymentResponse_1.PaymentResponse.create(item));
            return {
                ...response,
                data: {
                    items: payments,
                    total: paginatedData.data?.total || 0,
                    page: paginatedData.data?.page || 1,
                    size: paginatedData.data?.size || 10,
                    pages: paginatedData.data?.pages || 1
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取支付详情
     */
    async getPaymentById(paymentId) {
        try {
            const response = await this.client.get(`/payments/${paymentId}`);
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取支付详情（按订单ID）
     */
    async getPaymentByOrderId(orderId) {
        try {
            const response = await this.client.get(`/payments/order/${orderId}`);
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 关闭支付
     */
    async closePayment(paymentId, reason) {
        try {
            return await this.client.patch(`/payments/${paymentId}/close`, { reason });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 申请退款
     */
    async refundPayment(paymentId, request) {
        try {
            const response = await this.client.post(`/payments/${paymentId}/refund`, request.toJSON());
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取退款列表
     */
    async getRefunds(params = {}) {
        try {
            const response = await this.client.get('/refunds', { params });
            const paginatedData = response.data;
            const refunds = (paginatedData.data?.items || []).map((item) => PaymentResponse_1.PaymentResponse.create(item));
            return {
                ...response,
                data: {
                    items: refunds,
                    total: paginatedData.data?.total || 0,
                    page: paginatedData.data?.page || 1,
                    size: paginatedData.data?.size || 10,
                    pages: paginatedData.data?.pages || 1
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * ===== 渠道管理API =====
     */
    /**
     * 获取支付渠道列表
     */
    async getChannels() {
        try {
            return await this.client.get('/channels');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取渠道详情
     */
    async getChannel(channelCode) {
        try {
            return await this.client.get(`/channels/${channelCode}`);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取渠道状态
     */
    async getChannelStatus(channelCode) {
        try {
            return await this.client.get(`/channels/${channelCode}/status`);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 切换渠道状态
     */
    async toggleChannelStatus(channelCode, enabled) {
        try {
            return await this.client.patch(`/channels/${channelCode}/status`, { enabled });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * ===== 账户管理API =====
     */
    /**
     * 获取账户余额
     */
    async getBalance() {
        try {
            return await this.client.get('/account/balance');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取交易记录
     */
    async getTransactions(params = {}) {
        try {
            const response = await this.client.get('/account/transactions', { params });
            const paginatedData = response.data;
            const transactions = (paginatedData.data?.items || []).map((item) => PaymentResponse_1.PaymentResponse.create(item));
            return {
                ...response,
                data: {
                    items: transactions,
                    total: paginatedData.data?.total || 0,
                    page: paginatedData.data?.page || 1,
                    size: paginatedData.data?.size || 10,
                    pages: paginatedData.data?.pages || 1
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取统计信息
     */
    async getPaymentStatistics(params = {}) {
        try {
            return await this.client.get('/statistics/payments', { params });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取日统计
     */
    async getDailyStatistics(date) {
        try {
            const params = date ? { date } : {};
            return await this.client.get('/statistics/daily', { params });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取月统计
     */
    async getMonthlyStatistics(year, month) {
        try {
            return await this.client.get('/statistics/monthly', {
                params: { year, month }
            });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * ===== 系统管理API =====
     */
    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            return await this.client.get('/health');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取版本信息
     */
    async getVersion() {
        try {
            return await this.client.get('/version');
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * ===== 回调处理API =====
     */
    /**
     * 处理支付回调
     */
    async handlePaymentCallback(callbackData) {
        try {
            // 验证回调签名
            if (!this.verifyCallbackSignature(callbackData, this.secretKey)) {
                return {
                    code: 400,
                    message: '签名验证失败',
                    data: { success: false, message: '签名验证失败' },
                    timestamp: Date.now()
                };
            }
            // 处理回调数据
            console.log('处理支付回调:', callbackData);
            return {
                code: 200,
                message: '回调处理成功',
                data: { success: true, message: '回调处理成功' },
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error('处理回调失败:', error);
            return {
                code: 500,
                message: '回调处理失败',
                data: { success: false, message: '回调处理失败' },
                timestamp: Date.now()
            };
        }
    }
    /**
     * 验证回调签名
     */
    verifyCallbackSignature(callbackData, secretKey) {
        // 这里应该实现签名验证逻辑
        // 暂时返回true，实际项目中需要根据具体签名算法实现
        return true;
    }
    /**
     * ===== 辅助工具API =====
     */
    /**
     * 验证支付
     */
    async verifyPayment(paymentId) {
        try {
            const response = await this.client.get(`/payments/${paymentId}/verify`);
            if (response.data && response.data.payment) {
                const paymentData = response.data.payment;
                const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
                return {
                    ...response,
                    data: {
                        valid: response.data.valid,
                        payment
                    }
                };
            }
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 同步支付状态
     */
    async syncPaymentStatus(paymentId) {
        try {
            const response = await this.client.post(`/payments/${paymentId}/sync`);
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 重试支付
     */
    async retryPayment(paymentId) {
        try {
            const response = await this.client.post(`/payments/${paymentId}/retry`);
            const paymentData = response.data;
            const payment = PaymentResponse_1.PaymentResponse.create(paymentData);
            return {
                ...response,
                data: payment
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取错误信息
     */
    async getErrorInfo(errorCode) {
        try {
            return await this.client.get(`/errors/${errorCode}`);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * 获取支持的钱包类型
     */
    async getSupportedWallets() {
        try {
            return await this.client.get('/wallets');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AutoPayService = AutoPayService;
//# sourceMappingURL=AutoPayService.js.map