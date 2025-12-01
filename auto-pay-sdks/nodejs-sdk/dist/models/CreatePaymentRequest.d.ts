import { Currency, PaymentChannel, CustomerInfo, Metadata } from '../types';
/**
 * 创建支付请求
 */
export declare class CreatePaymentRequest {
    private readonly _orderId;
    private readonly _amount;
    private readonly _currency;
    private readonly _channel;
    private readonly _description?;
    private readonly _subject?;
    private readonly _body?;
    private readonly _notifyUrl?;
    private readonly _returnUrl?;
    private readonly _clientIp?;
    private readonly _customerId?;
    private readonly _customer?;
    private readonly _metadata?;
    private readonly _timeout?;
    private readonly _extra?;
    constructor(builder: CreatePaymentRequestBuilder);
    /**
     * 创建构建器
     */
    static builder(): CreatePaymentRequestBuilder;
    /**
     * 获取订单ID
     */
    get orderId(): string;
    /**
     * 获取支付金额
     */
    get amount(): number;
    /**
     * 获取货币代码
     */
    get currency(): Currency;
    /**
     * 获取支付渠道
     */
    get channel(): PaymentChannel;
    /**
     * 获取订单描述
     */
    get description(): string | undefined;
    /**
     * 获取订单标题
     */
    get subject(): string | undefined;
    /**
     * 获取订单内容
     */
    get body(): string | undefined;
    /**
     * 获取异步通知URL
     */
    get notifyUrl(): string | undefined;
    /**
     * 获取同步返回URL
     */
    get returnUrl(): string | undefined;
    /**
     * 获取客户端IP
     */
    get clientIp(): string | undefined;
    /**
     * 获取客户ID
     */
    get customerId(): string | undefined;
    /**
     * 获取客户信息
     */
    get customer(): CustomerInfo | undefined;
    /**
     * 获取元数据
     */
    get metadata(): Metadata | undefined;
    /**
     * 获取超时时间（秒）
     */
    get timeout(): number | undefined;
    /**
     * 获取额外参数
     */
    get extra(): Record<string, any> | undefined;
    /**
     * 转换为JSON对象
     */
    toJSON(): Record<string, any>;
}
/**
 * 创建支付请求构建器
 */
export declare class CreatePaymentRequestBuilder {
    private _orderId?;
    private _amount?;
    private _currency?;
    private _channel?;
    private _description?;
    private _subject?;
    private _body?;
    private _notifyUrl?;
    private _returnUrl?;
    private _clientIp?;
    private _customerId?;
    private _customer?;
    private _metadata?;
    private _timeout?;
    private _extra?;
    /**
     * 获取/设置订单ID
     */
    get orderId(): string | undefined;
    set orderId(value: string);
    /**
     * 获取/设置支付金额
     */
    get amount(): number | undefined;
    set amount(value: number);
    /**
     * 获取/设置货币代码
     */
    get currency(): Currency | undefined;
    set currency(value: Currency);
    /**
     * 获取/设置支付渠道
     */
    get channel(): PaymentChannel | undefined;
    set channel(value: PaymentChannel);
    /**
     * 获取/设置订单描述
     */
    get description(): string | undefined;
    set description(value: string);
    /**
     * 获取/设置订单标题
     */
    get subject(): string | undefined;
    set subject(value: string);
    /**
     * 获取/设置订单内容
     */
    get body(): string | undefined;
    set body(value: string);
    /**
     * 获取/设置异步通知URL
     */
    get notifyUrl(): string | undefined;
    set notifyUrl(value: string);
    /**
     * 获取/设置同步返回URL
     */
    get returnUrl(): string | undefined;
    set returnUrl(value: string);
    /**
     * 获取/设置客户端IP
     */
    get clientIp(): string | undefined;
    set clientIp(value: string);
    /**
     * 获取/设置客户ID
     */
    get customerId(): string | undefined;
    set customerId(value: string);
    /**
     * 获取/设置客户信息
     */
    get customer(): CustomerInfo | undefined;
    set customer(value: CustomerInfo);
    /**
     * 获取/设置元数据
     */
    get metadata(): Metadata | undefined;
    set metadata(value: Metadata);
    /**
     * 获取/设置超时时间（秒）
     */
    get timeout(): number | undefined;
    set timeout(value: number);
    /**
     * 获取/设置额外参数
     */
    get extra(): Record<string, any> | undefined;
    set extra(value: Record<string, any>);
    /**
     * 设置订单ID
     */
    setOrderId(orderId: string): CreatePaymentRequestBuilder;
    /**
     * 设置支付金额
     */
    setAmount(amount: number): CreatePaymentRequestBuilder;
    /**
     * 设置货币代码
     */
    setCurrency(currency: Currency): CreatePaymentRequestBuilder;
    /**
     * 设置支付渠道
     */
    setChannel(channel: PaymentChannel): CreatePaymentRequestBuilder;
    /**
     * 设置订单描述
     */
    setDescription(description: string): CreatePaymentRequestBuilder;
    /**
     * 设置订单标题
     */
    setSubject(subject: string): CreatePaymentRequestBuilder;
    /**
     * 设置订单内容
     */
    setBody(body: string): CreatePaymentRequestBuilder;
    /**
     * 设置异步通知URL
     */
    setNotifyUrl(notifyUrl: string): CreatePaymentRequestBuilder;
    /**
     * 设置同步返回URL
     */
    setReturnUrl(returnUrl: string): CreatePaymentRequestBuilder;
    /**
     * 设置客户端IP
     */
    setClientIp(clientIp: string): CreatePaymentRequestBuilder;
    /**
     * 设置客户ID
     */
    setCustomerId(customerId: string): CreatePaymentRequestBuilder;
    /**
     * 设置客户信息
     */
    setCustomer(customer: CustomerInfo): CreatePaymentRequestBuilder;
    /**
     * 设置元数据
     */
    setMetadata(metadata: Metadata): CreatePaymentRequestBuilder;
    /**
     * 添加元数据项
     */
    addMetadata(key: string, value: any): CreatePaymentRequestBuilder;
    /**
     * 设置超时时间（秒）
     */
    setTimeout(timeout: number): CreatePaymentRequestBuilder;
    /**
     * 设置额外参数
     */
    setExtra(extra: Record<string, any>): CreatePaymentRequestBuilder;
    /**
     * 添加额外参数
     */
    addExtra(key: string, value: any): CreatePaymentRequestBuilder;
    /**
     * 验证参数
     */
    private validate;
    /**
     * 构建请求对象
     */
    build(): CreatePaymentRequest;
}
//# sourceMappingURL=CreatePaymentRequest.d.ts.map