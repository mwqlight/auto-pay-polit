"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundPaymentRequestBuilder = exports.RefundPaymentRequest = exports.QueryPaymentRequestBuilder = exports.QueryPaymentRequest = void 0;
/**
 * 查询支付请求
 */
class QueryPaymentRequest {
    constructor(builder) {
        this.paymentId = builder.paymentId;
        this.orderId = builder.orderId;
        this.status = builder.status;
        this.channel = builder.channel;
        this.startTime = builder.startTime;
        this.endTime = builder.endTime;
        this.page = builder.page;
        this.size = builder.size;
        this.sort = builder.sort;
        this.order = builder.order;
    }
    /**
     * 创建构建器
     */
    static builder() {
        return new QueryPaymentRequestBuilder();
    }
    /**
     * 转换为查询参数
     */
    toQueryParams() {
        const params = {};
        if (this.paymentId)
            params.payment_id = this.paymentId;
        if (this.orderId)
            params.order_id = this.orderId;
        if (this.status)
            params.status = this.status;
        if (this.channel)
            params.channel = this.channel;
        if (this.startTime)
            params.start_time = this.startTime;
        if (this.endTime)
            params.end_time = this.endTime;
        if (this.page)
            params.page = this.page;
        if (this.size)
            params.size = this.size;
        if (this.sort)
            params.sort = this.sort;
        if (this.order)
            params.order = this.order;
        return params;
    }
}
exports.QueryPaymentRequest = QueryPaymentRequest;
/**
 * 查询支付请求构建器
 */
class QueryPaymentRequestBuilder {
    /**
     * 设置支付ID
     */
    setPaymentId(paymentId) {
        this.paymentId = paymentId;
        return this;
    }
    /**
     * 设置订单ID
     */
    setOrderId(orderId) {
        this.orderId = orderId;
        return this;
    }
    /**
     * 设置支付状态
     */
    setStatus(status) {
        this.status = status;
        return this;
    }
    /**
     * 设置支付渠道
     */
    setChannel(channel) {
        this.channel = channel;
        return this;
    }
    /**
     * 设置开始时间
     */
    setStartTime(startTime) {
        this.startTime = startTime;
        return this;
    }
    /**
     * 设置结束时间
     */
    setEndTime(endTime) {
        this.endTime = endTime;
        return this;
    }
    /**
     * 设置时间范围
     */
    setTimeRange(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
        return this;
    }
    /**
     * 设置分页参数
     */
    setPagination(page, size) {
        this.page = page;
        this.size = size;
        return this;
    }
    /**
     * 设置页码
     */
    setPage(page) {
        this.page = page;
        return this;
    }
    /**
     * 设置每页大小
     */
    setSize(size) {
        this.size = size;
        return this;
    }
    /**
     * 设置排序字段
     */
    setSort(sort) {
        this.sort = sort;
        return this;
    }
    /**
     * 设置排序方向
     */
    setOrder(order) {
        this.order = order;
        return this;
    }
    /**
     * 设置排序参数
     */
    setSortBy(field, order = 'desc') {
        this.sort = field;
        this.order = order;
        return this;
    }
    /**
     * 构建查询对象
     */
    build() {
        return new QueryPaymentRequest(this);
    }
}
exports.QueryPaymentRequestBuilder = QueryPaymentRequestBuilder;
/**
 * 退款请求
 */
class RefundPaymentRequest {
    constructor(builder) {
        this.paymentId = builder.paymentId;
        this.amount = builder.amount;
        this.reason = builder.reason;
        this.metadata = builder.metadata;
        this.notifyUrl = builder.notifyUrl;
    }
    /**
     * 创建构建器
     */
    static builder() {
        return new RefundPaymentRequestBuilder();
    }
    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            payment_id: this.paymentId,
            amount: this.amount,
            reason: this.reason,
            metadata: this.metadata,
            notify_url: this.notifyUrl
        };
    }
}
exports.RefundPaymentRequest = RefundPaymentRequest;
/**
 * 退款请求构建器
 */
class RefundPaymentRequestBuilder {
    /**
     * 设置支付ID
     */
    setPaymentId(paymentId) {
        this.paymentId = paymentId;
        return this;
    }
    /**
     * 设置退款金额
     */
    setAmount(amount) {
        this.amount = amount;
        return this;
    }
    /**
     * 设置退款原因
     */
    setReason(reason) {
        this.reason = reason;
        return this;
    }
    /**
     * 添加元数据
     */
    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }
    /**
     * 添加元数据项
     */
    addMetadata(key, value) {
        if (!this.metadata) {
            this.metadata = {};
        }
        this.metadata[key] = value;
        return this;
    }
    /**
     * 设置通知URL
     */
    setNotifyUrl(notifyUrl) {
        this.notifyUrl = notifyUrl;
        return this;
    }
    /**
     * 验证参数
     */
    validate() {
        if (!this.paymentId || this.paymentId.trim() === '') {
            throw new Error('支付ID不能为空');
        }
    }
    /**
     * 构建退款对象
     */
    build() {
        this.validate();
        return new RefundPaymentRequest(this);
    }
}
exports.RefundPaymentRequestBuilder = RefundPaymentRequestBuilder;
//# sourceMappingURL=QueryPaymentRequest.js.map