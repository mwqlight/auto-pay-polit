/**
 * 查询支付请求
 */
export class QueryPaymentRequest {
  public readonly paymentId?: string;
  public readonly orderId?: string;
  public readonly status?: string;
  public readonly channel?: string;
  public readonly startTime?: string;
  public readonly endTime?: string;
  public readonly page?: number;
  public readonly size?: number;
  public readonly sort?: string;
  public readonly order?: 'asc' | 'desc';

  public constructor(builder: QueryPaymentRequestBuilder) {
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
  public static builder(): QueryPaymentRequestBuilder {
    return new QueryPaymentRequestBuilder();
  }

  /**
   * 转换为查询参数
   */
  public toQueryParams(): Record<string, any> {
    const params: Record<string, any> = {};

    if (this.paymentId) params.payment_id = this.paymentId;
    if (this.orderId) params.order_id = this.orderId;
    if (this.status) params.status = this.status;
    if (this.channel) params.channel = this.channel;
    if (this.startTime) params.start_time = this.startTime;
    if (this.endTime) params.end_time = this.endTime;
    if (this.page) params.page = this.page;
    if (this.size) params.size = this.size;
    if (this.sort) params.sort = this.sort;
    if (this.order) params.order = this.order;

    return params;
  }
}

/**
 * 查询支付请求构建器
 */
export class QueryPaymentRequestBuilder {
  public paymentId?: string;
  public orderId?: string;
  public status?: string;
  public channel?: string;
  public startTime?: string;
  public endTime?: string;
  public page?: number;
  public size?: number;
  public sort?: string;
  public order?: 'asc' | 'desc';

  /**
   * 设置支付ID
   */
  public setPaymentId(paymentId: string): QueryPaymentRequestBuilder {
    this.paymentId = paymentId;
    return this;
  }

  /**
   * 设置订单ID
   */
  public setOrderId(orderId: string): QueryPaymentRequestBuilder {
    this.orderId = orderId;
    return this;
  }

  /**
   * 设置支付状态
   */
  public setStatus(status: string): QueryPaymentRequestBuilder {
    this.status = status;
    return this;
  }

  /**
   * 设置支付渠道
   */
  public setChannel(channel: string): QueryPaymentRequestBuilder {
    this.channel = channel;
    return this;
  }

  /**
   * 设置开始时间
   */
  public setStartTime(startTime: string): QueryPaymentRequestBuilder {
    this.startTime = startTime;
    return this;
  }

  /**
   * 设置结束时间
   */
  public setEndTime(endTime: string): QueryPaymentRequestBuilder {
    this.endTime = endTime;
    return this;
  }

  /**
   * 设置时间范围
   */
  public setTimeRange(startTime: string, endTime: string): QueryPaymentRequestBuilder {
    this.startTime = startTime;
    this.endTime = endTime;
    return this;
  }

  /**
   * 设置分页参数
   */
  public setPagination(page: number, size: number): QueryPaymentRequestBuilder {
    this.page = page;
    this.size = size;
    return this;
  }

  /**
   * 设置页码
   */
  public setPage(page: number): QueryPaymentRequestBuilder {
    this.page = page;
    return this;
  }

  /**
   * 设置每页大小
   */
  public setSize(size: number): QueryPaymentRequestBuilder {
    this.size = size;
    return this;
  }

  /**
   * 设置排序字段
   */
  public setSort(sort: string): QueryPaymentRequestBuilder {
    this.sort = sort;
    return this;
  }

  /**
   * 设置排序方向
   */
  public setOrder(order: 'asc' | 'desc'): QueryPaymentRequestBuilder {
    this.order = order;
    return this;
  }

  /**
   * 设置排序参数
   */
  public setSortBy(field: string, order: 'asc' | 'desc' = 'desc'): QueryPaymentRequestBuilder {
    this.sort = field;
    this.order = order;
    return this;
  }

  /**
   * 构建查询对象
   */
  public build(): QueryPaymentRequest {
    return new QueryPaymentRequest(this);
  }
}

/**
 * 退款请求
 */
export class RefundPaymentRequest {
  public readonly paymentId: string;
  public readonly amount?: number;
  public readonly reason?: string;
  public readonly metadata?: Record<string, any>;
  public readonly notifyUrl?: string;

  public constructor(builder: RefundPaymentRequestBuilder) {
    this.paymentId = builder.paymentId!;
    this.amount = builder.amount;
    this.reason = builder.reason;
    this.metadata = builder.metadata;
    this.notifyUrl = builder.notifyUrl;
  }

  /**
   * 创建构建器
   */
  public static builder(): RefundPaymentRequestBuilder {
    return new RefundPaymentRequestBuilder();
  }

  /**
   * 转换为JSON对象
   */
  public toJSON(): Record<string, any> {
    return {
      payment_id: this.paymentId,
      amount: this.amount,
      reason: this.reason,
      metadata: this.metadata,
      notify_url: this.notifyUrl
    };
  }
}

/**
 * 退款请求构建器
 */
export class RefundPaymentRequestBuilder {
  public paymentId?: string;
  public amount?: number;
  public reason?: string;
  public metadata?: Record<string, any>;
  public notifyUrl?: string;

  /**
   * 设置支付ID
   */
  public setPaymentId(paymentId: string): RefundPaymentRequestBuilder {
    this.paymentId = paymentId;
    return this;
  }

  /**
   * 设置退款金额
   */
  public setAmount(amount: number): RefundPaymentRequestBuilder {
    this.amount = amount;
    return this;
  }

  /**
   * 设置退款原因
   */
  public setReason(reason: string): RefundPaymentRequestBuilder {
    this.reason = reason;
    return this;
  }

  /**
   * 添加元数据
   */
  public setMetadata(metadata: Record<string, any>): RefundPaymentRequestBuilder {
    this.metadata = metadata;
    return this;
  }

  /**
   * 添加元数据项
   */
  public addMetadata(key: string, value: any): RefundPaymentRequestBuilder {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
    return this;
  }

  /**
   * 设置通知URL
   */
  public setNotifyUrl(notifyUrl: string): RefundPaymentRequestBuilder {
    this.notifyUrl = notifyUrl;
    return this;
  }

  /**
   * 验证参数
   */
  private validate(): void {
    if (!this.paymentId || this.paymentId.trim() === '') {
      throw new Error('支付ID不能为空');
    }
  }

  /**
   * 构建退款对象
   */
  public build(): RefundPaymentRequest {
    this.validate();
    return new RefundPaymentRequest(this);
  }
}