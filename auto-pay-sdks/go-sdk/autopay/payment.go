package autopay

import (
	"encoding/json"
	"fmt"
	"time"
)

// OrderStatus 订单状态
type OrderStatus string

const (
	StatusPending   OrderStatus = "PENDING"   // 待支付
	StatusPaid      OrderStatus = "PAID"      // 已支付
	StatusFailed    OrderStatus = "FAILED"    // 支付失败
	StatusCancelled OrderStatus = "CANCELLED" // 已取消
	StatusExpired   OrderStatus = "EXPIRED"   // 已过期
	StatusRefunded  OrderStatus = "REFUNDED"  // 已退款
	StatusPartial   OrderStatus = "PARTIAL"   // 部分退款
)

// PaymentMethod 支付方式
type PaymentMethod string

const (
	MethodAlipay    PaymentMethod = "alipay"    // 支付宝
	MethodWeChat   PaymentMethod = "wechat"    // 微信支付
	MethodBankCard PaymentMethod = "bank_card" // 银行卡
	MethodUnionPay PaymentMethod = "unionpay"  // 银联
	MethodCredit   PaymentMethod = "credit"    // 信用卡
)

// PaymentRequest 支付请求
type PaymentRequest struct {
	OutTradeNo     string            `json:"out_trade_no"`     // 商户订单号
	TotalAmount    float64           `json:"total_amount"`     // 订单金额
	Currency       Currency          `json:"currency"`         // 货币类型
	Subject        string            `json:"subject"`          // 商品标题
	Body           string            `json:"body"`             // 商品描述
	PaymentMethod  PaymentMethod     `json:"payment_method"`   // 支付方式
	NotifyURL      string            `json:"notify_url"`       // 异步通知地址
	ReturnURL      string            `json:"return_url"`       // 返回地址
	AttachData     map[string]interface{} `json:"attach_data"`   // 附加数据
	Timeout        time.Duration     `json:"timeout"`          // 超时时间
	Metadata       map[string]string `json:"metadata"`         // 元数据
	CustomFields   map[string]interface{} `json:"custom_fields"` // 自定义字段
}

// Validate 验证支付请求
func (p *PaymentRequest) Validate() error {
	if p.OutTradeNo == "" {
		return fmt.Errorf("商户订单号不能为空")
	}
	if p.TotalAmount <= 0 {
		return fmt.Errorf("订单金额必须大于0")
	}
	if p.Currency == "" {
		return fmt.Errorf("货币类型不能为空")
	}
	if p.Subject == "" {
		return fmt.Errorf("商品标题不能为空")
	}
	if p.PaymentMethod == "" {
		return fmt.Errorf("支付方式不能为空")
	}
	return nil
}

// PaymentResponse 支付响应
type PaymentResponse struct {
	OutTradeNo     string            `json:"out_trade_no"`      // 商户订单号
	TradeNo        string            `json:"trade_no"`          // 平台订单号
	Status         OrderStatus       `json:"status"`            // 订单状态
	TotalAmount    float64           `json:"total_amount"`      // 订单金额
	Currency       Currency          `json:"currency"`          // 货币类型
	Subject        string            `json:"subject"`           // 商品标题
	Body           string            `json:"body"`              // 商品描述
	PaymentMethod  PaymentMethod     `json:"payment_method"`    // 支付方式
	QRCodeURL      string            `json:"qr_code_url"`       // 二维码URL（扫码支付）
	PaymentURL     string            `json:"payment_url"`       // 支付URL
	TransactionID  string            `json:"transaction_id"`    // 第三方交易ID
	ChannelCode    string            `json:"channel_code"`      // 渠道代码
	ChannelMsg     string            `json:"channel_msg"`       // 渠道消息
	OrderTime      time.Time         `json:"order_time"`        // 下单时间
	ExpireTime     time.Time         `json:"expire_time"`       // 过期时间
	PaidTime       *time.Time        `json:"paid_time"`         // 支付时间
	FailedTime     *time.Time        `json:"failed_time"`       // 失败时间
	AttachData     map[string]interface{} `json:"attach_data"`   // 附加数据
	Metadata       map[string]string `json:"metadata"`          // 元数据
	CustomFields   map[string]interface{} `json:"custom_fields"` // 自定义字段
	Errors         []string          `json:"errors,omitempty"`  // 错误信息
	Warnings       []string          `json:"warnings,omitempty"` // 警告信息
}

// IsPaid 检查是否已支付
func (p *PaymentResponse) IsPaid() bool {
	return p.Status == StatusPaid
}

// IsFailed 检查是否失败
func (p *PaymentResponse) IsFailed() bool {
	return p.Status == StatusFailed
}

// IsExpired 检查是否过期
func (p *PaymentResponse) IsExpired() bool {
	return p.Status == StatusExpired
}

// CanRetry 检查是否可重试
func (p *PaymentResponse) CanRetry() bool {
	return p.Status == StatusFailed || p.Status == StatusExpired
}

// ToJSON 转换为JSON字符串
func (p *PaymentResponse) ToJSON() (string, error) {
	data, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON序列化失败: %w", err)
	}
	return string(data), nil
}

// PaymentQueryRequest 支付查询请求
type PaymentQueryRequest struct {
	OutTradeNo string `json:"out_trade_no"` // 商户订单号
	TradeNo    string `json:"trade_no"`     // 平台订单号
}

// PaymentQueryResponse 支付查询响应
type PaymentQueryResponse struct {
	PaymentResponse
	QueryTime      time.Time `json:"query_time"`      // 查询时间
	OriginalAmount float64   `json:"original_amount"` // 原始金额
	RefundAmount   float64   `json:"refund_amount"`   // 已退款金额
	FeeAmount      float64   `json:"fee_amount"`      // 手续费
}

// PaymentCancelRequest 支付取消请求
type PaymentCancelRequest struct {
	OutTradeNo string `json:"out_trade_no"` // 商户订单号
	TradeNo    string `json:"trade_no"`     // 平台订单号
	Reason     string `json:"reason"`       // 取消原因
}

// PaymentCancelResponse 支付取消响应
type PaymentCancelResponse struct {
	OutTradeNo  string    `json:"out_trade_no"`  // 商户订单号
	TradeNo     string    `json:"trade_no"`      // 平台订单号
	Status      OrderStatus `json:"status"`      // 订单状态
	CancelTime  time.Time `json:"cancel_time"`   // 取消时间
	Reason      string    `json:"reason"`        // 取消原因
	Success     bool      `json:"success"`       // 是否成功
	Message     string    `json:"message"`       // 消息
}

// PaymentBatchRequest 批量支付请求
type PaymentBatchRequest struct {
	Requests   []PaymentRequest `json:"requests"`    // 支付请求列表
	BatchID    string           `json:"batch_id"`    // 批量ID
	NotifyURL  string           `json:"notify_url"`  // 异步通知地址
	CallbackURL string          `json:"callback_url"` // 回调地址
	Metadata   map[string]string `json:"metadata"`   // 元数据
}

// PaymentBatchResponse 批量支付响应
type PaymentBatchResponse struct {
	BatchID       string            `json:"batch_id"`        // 批量ID
	TotalCount    int               `json:"total_count"`     // 总数量
	SuccessCount  int               `json:"success_count"`   // 成功数量
	FailedCount   int               `json:"failed_count"`    // 失败数量
	ProcessingCount int             `json:"processing_count"` // 处理中数量
	Status        string            `json:"status"`          // 批处理状态
	Results       []PaymentResponse `json:"results"`         // 支付结果列表
	SubmitTime    time.Time         `json:"submit_time"`     // 提交时间
	ProcessTime   time.Time         `json:"process_time"`    // 处理时间
	EndTime       *time.Time        `json:"end_time"`        // 完成时间
	Duration      time.Duration     `json:"duration"`        // 处理耗时
	Errors        []string          `json:"errors,omitempty"` // 错误信息
	Warnings      []string          `json:"warnings,omitempty"` // 警告信息
}

// GetSuccessResults 获取成功的支付结果
func (p *PaymentBatchResponse) GetSuccessResults() []PaymentResponse {
	var results []PaymentResponse
	for _, result := range p.Results {
		if result.IsPaid() {
			results = append(results, result)
		}
	}
	return results
}

// GetFailedResults 获取失败的支付结果
func (p *PaymentBatchResponse) GetFailedResults() []PaymentResponse {
	var results []PaymentResponse
	for _, result := range p.Results {
		if result.IsFailed() {
			results = append(results, result)
		}
	}
	return results
}

// HasErrors 检查是否有错误
func (p *PaymentBatchResponse) HasErrors() bool {
	return len(p.Errors) > 0
}

// IsCompleted 检查是否已完成
func (p *PaymentBatchResponse) IsCompleted() bool {
	return p.Status == "COMPLETED" || p.Status == "FAILED"
}

// PaymentStatisticsRequest 支付统计请求
type PaymentStatisticsRequest struct {
	StartDate time.Time `json:"start_date"` // 开始日期
	EndDate   time.Time `json:"end_date"`   // 结束日期
	GroupBy   string    `json:"group_by"`   // 分组方式: day, week, month, payment_method, channel
	Filters   map[string]interface{} `json:"filters"` // 筛选条件
}

// PaymentStatisticsResponse 支付统计响应
type PaymentStatisticsResponse struct {
	TotalCount      int64   `json:"total_count"`       // 总订单数
	TotalAmount     float64 `json:"total_amount"`      // 总金额
	SuccessCount    int64   `json:"success_count"`     // 成功订单数
	SuccessAmount   float64 `json:"success_amount"`    // 成功金额
	FailedCount     int64   `json:"failed_count"`      // 失败订单数
	FailedAmount    float64 `json:"failed_amount"`     // 失败金额
	AverageAmount   float64 `json:"average_amount"`    // 平均金额
	RefundCount     int64   `json:"refund_count"`      // 退款订单数
	RefundAmount    float64 `json:"refund_amount"`     // 退款金额
	FeeAmount       float64 `json:"fee_amount"`        // 手续费
	StatisticsData  []map[string]interface{} `json:"statistics_data"` // 统计详情
	Period          string    `json:"period"`          // 统计周期
	GeneratedAt     time.Time `json:"generated_at"`    // 生成时间
	QueryTime       time.Duration `json:"query_time"`  // 查询耗时
}