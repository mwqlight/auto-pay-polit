/**
 * 查询支付请求
 */
export declare class QueryPaymentRequest {
    readonly paymentId?: string;
    readonly orderId?: string;
    readonly status?: string;
    readonly channel?: string;
    readonly startTime?: string;
    readonly endTime?: string;
    readonly page?: number;
    readonly size?: number;
    readonly sort?: string;
    readonly order?: 'asc' | 'desc';
    constructor(builder: QueryPaymentRequestBuilder);
    /**
     * 创建构建器
     */
    static builder(): QueryPaymentRequestBuilder;
    /**
     * 转换为查询参数
     */
    toQueryParams(): Record<string, any>;
}
/**
 * 查询支付请求构建器
 */
export declare class QueryPaymentRequestBuilder {
    paymentId?: string;
    orderId?: string;
    status?: string;
    channel?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    /**
     * 设置支付ID
     */
    setPaymentId(paymentId: string): QueryPaymentRequestBuilder;
    /**
     * 设置订单ID
     */
    setOrderId(orderId: string): QueryPaymentRequestBuilder;
    /**
     * 设置支付状态
     */
    setStatus(status: string): QueryPaymentRequestBuilder;
    /**
     * 设置支付渠道
     */
    setChannel(channel: string): QueryPaymentRequestBuilder;
    /**
     * 设置开始时间
     */
    setStartTime(startTime: string): QueryPaymentRequestBuilder;
    /**
     * 设置结束时间
     */
    setEndTime(endTime: string): QueryPaymentRequestBuilder;
    /**
     * 设置时间范围
     */
    setTimeRange(startTime: string, endTime: string): QueryPaymentRequestBuilder;
    /**
     * 设置分页参数
     */
    setPagination(page: number, size: number): QueryPaymentRequestBuilder;
    /**
     * 设置页码
     */
    setPage(page: number): QueryPaymentRequestBuilder;
    /**
     * 设置每页大小
     */
    setSize(size: number): QueryPaymentRequestBuilder;
    /**
     * 设置排序字段
     */
    setSort(sort: string): QueryPaymentRequestBuilder;
    /**
     * 设置排序方向
     */
    setOrder(order: 'asc' | 'desc'): QueryPaymentRequestBuilder;
    /**
     * 设置排序参数
     */
    setSortBy(field: string, order?: 'asc' | 'desc'): QueryPaymentRequestBuilder;
    /**
     * 构建查询对象
     */
    build(): QueryPaymentRequest;
}
/**
 * 退款请求
 */
export declare class RefundPaymentRequest {
    readonly paymentId: string;
    readonly amount?: number;
    readonly reason?: string;
    readonly metadata?: Record<string, any>;
    readonly notifyUrl?: string;
    constructor(builder: RefundPaymentRequestBuilder);
    /**
     * 创建构建器
     */
    static builder(): RefundPaymentRequestBuilder;
    /**
     * 转换为JSON对象
     */
    toJSON(): Record<string, any>;
}
/**
 * 退款请求构建器
 */
export declare class RefundPaymentRequestBuilder {
    paymentId?: string;
    amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
    notifyUrl?: string;
    /**
     * 设置支付ID
     */
    setPaymentId(paymentId: string): RefundPaymentRequestBuilder;
    /**
     * 设置退款金额
     */
    setAmount(amount: number): RefundPaymentRequestBuilder;
    /**
     * 设置退款原因
     */
    setReason(reason: string): RefundPaymentRequestBuilder;
    /**
     * 添加元数据
     */
    setMetadata(metadata: Record<string, any>): RefundPaymentRequestBuilder;
    /**
     * 添加元数据项
     */
    addMetadata(key: string, value: any): RefundPaymentRequestBuilder;
    /**
     * 设置通知URL
     */
    setNotifyUrl(notifyUrl: string): RefundPaymentRequestBuilder;
    /**
     * 验证参数
     */
    private validate;
    /**
     * 构建退款对象
     */
    build(): RefundPaymentRequest;
}
//# sourceMappingURL=QueryPaymentRequest.d.ts.map