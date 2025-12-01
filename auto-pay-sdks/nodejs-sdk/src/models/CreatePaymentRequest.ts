import { Currency, PaymentChannel, CustomerInfo, Metadata } from '../types';

/**
 * 创建支付请求
 */
export class CreatePaymentRequest {
  private readonly _orderId: string;
  private readonly _amount: number;
  private readonly _currency: Currency;
  private readonly _channel: PaymentChannel;
  private readonly _description?: string;
  private readonly _subject?: string;
  private readonly _body?: string;
  private readonly _notifyUrl?: string;
  private readonly _returnUrl?: string;
  private readonly _clientIp?: string;
  private readonly _customerId?: string;
  private readonly _customer?: CustomerInfo;
  private readonly _metadata?: Metadata;
  private readonly _timeout?: number;
  private readonly _extra?: Record<string, any>;

  public constructor(builder: CreatePaymentRequestBuilder) {
    this._orderId = builder.orderId!;
    this._amount = builder.amount!;
    this._currency = builder.currency!;
    this._channel = builder.channel!;
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
  public static builder(): CreatePaymentRequestBuilder {
    return new CreatePaymentRequestBuilder();
  }

  /**
   * 获取订单ID
   */
  public get orderId(): string {
    return this._orderId;
  }

  /**
   * 获取支付金额
   */
  public get amount(): number {
    return this._amount;
  }

  /**
   * 获取货币代码
   */
  public get currency(): Currency {
    return this._currency;
  }

  /**
   * 获取支付渠道
   */
  public get channel(): PaymentChannel {
    return this._channel;
  }

  /**
   * 获取订单描述
   */
  public get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取订单标题
   */
  public get subject(): string | undefined {
    return this._subject;
  }

  /**
   * 获取订单内容
   */
  public get body(): string | undefined {
    return this._body;
  }

  /**
   * 获取异步通知URL
   */
  public get notifyUrl(): string | undefined {
    return this._notifyUrl;
  }

  /**
   * 获取同步返回URL
   */
  public get returnUrl(): string | undefined {
    return this._returnUrl;
  }

  /**
   * 获取客户端IP
   */
  public get clientIp(): string | undefined {
    return this._clientIp;
  }

  /**
   * 获取客户ID
   */
  public get customerId(): string | undefined {
    return this._customerId;
  }

  /**
   * 获取客户信息
   */
  public get customer(): CustomerInfo | undefined {
    return this._customer;
  }

  /**
   * 获取元数据
   */
  public get metadata(): Metadata | undefined {
    return this._metadata;
  }

  /**
   * 获取超时时间（秒）
   */
  public get timeout(): number | undefined {
    return this._timeout;
  }

  /**
   * 获取额外参数
   */
  public get extra(): Record<string, any> | undefined {
    return this._extra;
  }

  /**
   * 转换为JSON对象
   */
  public toJSON(): Record<string, any> {
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

/**
 * 创建支付请求构建器
 */
export class CreatePaymentRequestBuilder {
  private _orderId?: string;
  private _amount?: number;
  private _currency?: Currency;
  private _channel?: PaymentChannel;
  private _description?: string;
  private _subject?: string;
  private _body?: string;
  private _notifyUrl?: string;
  private _returnUrl?: string;
  private _clientIp?: string;
  private _customerId?: string;
  private _customer?: CustomerInfo;
  private _metadata?: Metadata;
  private _timeout?: number;
  private _extra?: Record<string, any>;

  /**
   * 获取/设置订单ID
   */
  public get orderId(): string | undefined {
    return this._orderId;
  }

  public set orderId(value: string) {
    this._orderId = value;
  }

  /**
   * 获取/设置支付金额
   */
  public get amount(): number | undefined {
    return this._amount;
  }

  public set amount(value: number) {
    this._amount = value;
  }

  /**
   * 获取/设置货币代码
   */
  public get currency(): Currency | undefined {
    return this._currency;
  }

  public set currency(value: Currency) {
    this._currency = value;
  }

  /**
   * 获取/设置支付渠道
   */
  public get channel(): PaymentChannel | undefined {
    return this._channel;
  }

  public set channel(value: PaymentChannel) {
    this._channel = value;
  }

  /**
   * 获取/设置订单描述
   */
  public get description(): string | undefined {
    return this._description;
  }

  public set description(value: string) {
    this._description = value;
  }

  /**
   * 获取/设置订单标题
   */
  public get subject(): string | undefined {
    return this._subject;
  }

  public set subject(value: string) {
    this._subject = value;
  }

  /**
   * 获取/设置订单内容
   */
  public get body(): string | undefined {
    return this._body;
  }

  public set body(value: string) {
    this._body = value;
  }

  /**
   * 获取/设置异步通知URL
   */
  public get notifyUrl(): string | undefined {
    return this._notifyUrl;
  }

  public set notifyUrl(value: string) {
    this._notifyUrl = value;
  }

  /**
   * 获取/设置同步返回URL
   */
  public get returnUrl(): string | undefined {
    return this._returnUrl;
  }

  public set returnUrl(value: string) {
    this._returnUrl = value;
  }

  /**
   * 获取/设置客户端IP
   */
  public get clientIp(): string | undefined {
    return this._clientIp;
  }

  public set clientIp(value: string) {
    this._clientIp = value;
  }

  /**
   * 获取/设置客户ID
   */
  public get customerId(): string | undefined {
    return this._customerId;
  }

  public set customerId(value: string) {
    this._customerId = value;
  }

  /**
   * 获取/设置客户信息
   */
  public get customer(): CustomerInfo | undefined {
    return this._customer;
  }

  public set customer(value: CustomerInfo) {
    this._customer = value;
  }

  /**
   * 获取/设置元数据
   */
  public get metadata(): Metadata | undefined {
    return this._metadata;
  }

  public set metadata(value: Metadata) {
    this._metadata = value;
  }

  /**
   * 获取/设置超时时间（秒）
   */
  public get timeout(): number | undefined {
    return this._timeout;
  }

  public set timeout(value: number) {
    this._timeout = value;
  }

  /**
   * 获取/设置额外参数
   */
  public get extra(): Record<string, any> | undefined {
    return this._extra;
  }

  public set extra(value: Record<string, any>) {
    this._extra = value;
  }

  /**
   * 设置订单ID
   */
  public setOrderId(orderId: string): CreatePaymentRequestBuilder {
    this.orderId = orderId;
    return this;
  }

  /**
   * 设置支付金额
   */
  public setAmount(amount: number): CreatePaymentRequestBuilder {
    this.amount = amount;
    return this;
  }

  /**
   * 设置货币代码
   */
  public setCurrency(currency: Currency): CreatePaymentRequestBuilder {
    this.currency = currency;
    return this;
  }

  /**
   * 设置支付渠道
   */
  public setChannel(channel: PaymentChannel): CreatePaymentRequestBuilder {
    this.channel = channel;
    return this;
  }

  /**
   * 设置订单描述
   */
  public setDescription(description: string): CreatePaymentRequestBuilder {
    this.description = description;
    return this;
  }

  /**
   * 设置订单标题
   */
  public setSubject(subject: string): CreatePaymentRequestBuilder {
    this.subject = subject;
    return this;
  }

  /**
   * 设置订单内容
   */
  public setBody(body: string): CreatePaymentRequestBuilder {
    this.body = body;
    return this;
  }

  /**
   * 设置异步通知URL
   */
  public setNotifyUrl(notifyUrl: string): CreatePaymentRequestBuilder {
    this.notifyUrl = notifyUrl;
    return this;
  }

  /**
   * 设置同步返回URL
   */
  public setReturnUrl(returnUrl: string): CreatePaymentRequestBuilder {
    this.returnUrl = returnUrl;
    return this;
  }

  /**
   * 设置客户端IP
   */
  public setClientIp(clientIp: string): CreatePaymentRequestBuilder {
    this.clientIp = clientIp;
    return this;
  }

  /**
   * 设置客户ID
   */
  public setCustomerId(customerId: string): CreatePaymentRequestBuilder {
    this.customerId = customerId;
    return this;
  }

  /**
   * 设置客户信息
   */
  public setCustomer(customer: CustomerInfo): CreatePaymentRequestBuilder {
    this.customer = customer;
    return this;
  }

  /**
   * 设置元数据
   */
  public setMetadata(metadata: Metadata): CreatePaymentRequestBuilder {
    this.metadata = metadata;
    return this;
  }

  /**
   * 添加元数据项
   */
  public addMetadata(key: string, value: any): CreatePaymentRequestBuilder {
    if (!this._metadata) {
      this._metadata = {};
    }
    this._metadata[key] = value;
    return this;
  }

  /**
   * 设置超时时间（秒）
   */
  public setTimeout(timeout: number): CreatePaymentRequestBuilder {
    this.timeout = timeout;
    return this;
  }

  /**
   * 设置额外参数
   */
  public setExtra(extra: Record<string, any>): CreatePaymentRequestBuilder {
    this.extra = extra;
    return this;
  }

  /**
   * 添加额外参数
   */
  public addExtra(key: string, value: any): CreatePaymentRequestBuilder {
    if (!this._extra) {
      this._extra = {};
    }
    this._extra[key] = value;
    return this;
  }

  /**
   * 验证参数
   */
  private validate(): void {
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
  public build(): CreatePaymentRequest {
    this.validate();
    return new CreatePaymentRequest(this);
  }
}