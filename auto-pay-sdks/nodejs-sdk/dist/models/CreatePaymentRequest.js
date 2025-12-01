"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentRequestBuilder = exports.CreatePaymentRequest = void 0;
/**
 * 创建支付请求
 */
class CreatePaymentRequest {
    constructor(builder) {
        this._orderId = builder.orderId;
        this._amount = builder.amount;
        this._currency = builder.currency;
        this._channel = builder.channel;
        this._description = builder.description;
        this._subject = builder.subject;
        this._body = builder.body;
        this._notifyUrl = builder.notifyUrl;
        this._returnUrl = builder.returnUrl;
        this._clientIp = builder.clientIp;
        this._customerId = builder.customerId;
        this._customer = builder.customer;
        this._metadata = builder.metadata;
        this._timeout = builder.timeout;
        this._extra = builder.extra;
    }
    /**
     * 创建构建器
     */
    static builder() {
        return new CreatePaymentRequestBuilder();
    }
    /**
     * 获取订单ID
     */
    get orderId() {
        return this._orderId;
    }
    /**
     * 获取支付金额
     */
    get amount() {
        return this._amount;
    }
    /**
     * 获取货币代码
     */
    get currency() {
        return this._currency;
    }
    /**
     * 获取支付渠道
     */
    get channel() {
        return this._channel;
    }
    /**
     * 获取订单描述
     */
    get description() {
        return this._description;
    }
    /**
     * 获取订单标题
     */
    get subject() {
        return this._subject;
    }
    /**
     * 获取订单内容
     */
    get body() {
        return this._body;
    }
    /**
     * 获取异步通知URL
     */
    get notifyUrl() {
        return this._notifyUrl;
    }
    /**
     * 获取同步返回URL
     */
    get returnUrl() {
        return this._returnUrl;
    }
    /**
     * 获取客户端IP
     */
    get clientIp() {
        return this._clientIp;
    }
    /**
     * 获取客户ID
     */
    get customerId() {
        return this._customerId;
    }
    /**
     * 获取客户信息
     */
    get customer() {
        return this._customer;
    }
    /**
     * 获取元数据
     */
    get metadata() {
        return this._metadata;
    }
    /**
     * 获取超时时间（秒）
     */
    get timeout() {
        return this._timeout;
    }
    /**
     * 获取额外参数
     */
    get extra() {
        return this._extra;
    }
    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            order_id: this._orderId,
            amount: this._amount,
            currency: this._currency,
            channel: this._channel,
            description: this._description,
            subject: this._subject,
            body: this._body,
            notify_url: this._notifyUrl,
            return_url: this._returnUrl,
            client_ip: this._clientIp,
            customer_id: this._customerId,
            customer: this._customer,
            metadata: this._metadata,
            timeout: this._timeout,
            ...this._extra
        };
    }
}
exports.CreatePaymentRequest = CreatePaymentRequest;
/**
 * 创建支付请求构建器
 */
class CreatePaymentRequestBuilder {
    /**
     * 获取/设置订单ID
     */
    get orderId() {
        return this._orderId;
    }
    set orderId(value) {
        this._orderId = value;
    }
    /**
     * 获取/设置支付金额
     */
    get amount() {
        return this._amount;
    }
    set amount(value) {
        this._amount = value;
    }
    /**
     * 获取/设置货币代码
     */
    get currency() {
        return this._currency;
    }
    set currency(value) {
        this._currency = value;
    }
    /**
     * 获取/设置支付渠道
     */
    get channel() {
        return this._channel;
    }
    set channel(value) {
        this._channel = value;
    }
    /**
     * 获取/设置订单描述
     */
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    /**
     * 获取/设置订单标题
     */
    get subject() {
        return this._subject;
    }
    set subject(value) {
        this._subject = value;
    }
    /**
     * 获取/设置订单内容
     */
    get body() {
        return this._body;
    }
    set body(value) {
        this._body = value;
    }
    /**
     * 获取/设置异步通知URL
     */
    get notifyUrl() {
        return this._notifyUrl;
    }
    set notifyUrl(value) {
        this._notifyUrl = value;
    }
    /**
     * 获取/设置同步返回URL
     */
    get returnUrl() {
        return this._returnUrl;
    }
    set returnUrl(value) {
        this._returnUrl = value;
    }
    /**
     * 获取/设置客户端IP
     */
    get clientIp() {
        return this._clientIp;
    }
    set clientIp(value) {
        this._clientIp = value;
    }
    /**
     * 获取/设置客户ID
     */
    get customerId() {
        return this._customerId;
    }
    set customerId(value) {
        this._customerId = value;
    }
    /**
     * 获取/设置客户信息
     */
    get customer() {
        return this._customer;
    }
    set customer(value) {
        this._customer = value;
    }
    /**
     * 获取/设置元数据
     */
    get metadata() {
        return this._metadata;
    }
    set metadata(value) {
        this._metadata = value;
    }
    /**
     * 获取/设置超时时间（秒）
     */
    get timeout() {
        return this._timeout;
    }
    set timeout(value) {
        this._timeout = value;
    }
    /**
     * 获取/设置额外参数
     */
    get extra() {
        return this._extra;
    }
    set extra(value) {
        this._extra = value;
    }
    /**
     * 设置订单ID
     */
    setOrderId(orderId) {
        this.orderId = orderId;
        return this;
    }
    /**
     * 设置支付金额
     */
    setAmount(amount) {
        this.amount = amount;
        return this;
    }
    /**
     * 设置货币代码
     */
    setCurrency(currency) {
        this.currency = currency;
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
     * 设置订单描述
     */
    setDescription(description) {
        this.description = description;
        return this;
    }
    /**
     * 设置订单标题
     */
    setSubject(subject) {
        this.subject = subject;
        return this;
    }
    /**
     * 设置订单内容
     */
    setBody(body) {
        this.body = body;
        return this;
    }
    /**
     * 设置异步通知URL
     */
    setNotifyUrl(notifyUrl) {
        this.notifyUrl = notifyUrl;
        return this;
    }
    /**
     * 设置同步返回URL
     */
    setReturnUrl(returnUrl) {
        this.returnUrl = returnUrl;
        return this;
    }
    /**
     * 设置客户端IP
     */
    setClientIp(clientIp) {
        this.clientIp = clientIp;
        return this;
    }
    /**
     * 设置客户ID
     */
    setCustomerId(customerId) {
        this.customerId = customerId;
        return this;
    }
    /**
     * 设置客户信息
     */
    setCustomer(customer) {
        this.customer = customer;
        return this;
    }
    /**
     * 设置元数据
     */
    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }
    /**
     * 添加元数据项
     */
    addMetadata(key, value) {
        if (!this._metadata) {
            this._metadata = {};
        }
        this._metadata[key] = value;
        return this;
    }
    /**
     * 设置超时时间（秒）
     */
    setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }
    /**
     * 设置额外参数
     */
    setExtra(extra) {
        this.extra = extra;
        return this;
    }
    /**
     * 添加额外参数
     */
    addExtra(key, value) {
        if (!this._extra) {
            this._extra = {};
        }
        this._extra[key] = value;
        return this;
    }
    /**
     * 验证参数
     */
    validate() {
        if (!this._orderId || this._orderId.trim() === '') {
            throw new Error('订单ID不能为空');
        }
        if (!this._amount || this._amount <= 0) {
            throw new Error('支付金额必须大于0');
        }
        if (!this._currency) {
            throw new Error('货币代码不能为空');
        }
        if (!this._channel) {
            throw new Error('支付渠道不能为空');
        }
    }
    /**
     * 构建请求对象
     */
    build() {
        this.validate();
        return new CreatePaymentRequest(this);
    }
}
exports.CreatePaymentRequestBuilder = CreatePaymentRequestBuilder;
//# sourceMappingURL=CreatePaymentRequest.js.map