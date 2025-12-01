package autopay

import (
	"encoding/json"
	"fmt"
	"time"
)

// RefundStatus 退款状态
type RefundStatus string

const (
	RefundPending   RefundStatus = "PENDING"   // 待退款
	RefundProcessing RefundStatus = "PROCESSING" // 处理中
	RefundSuccess   RefundStatus = "SUCCESS"   // 退款成功
	RefundFailed    RefundStatus = "FAILED"    // 退款失败
	RefundPartial   RefundStatus = "PARTIAL"   // 部分退款
	RefundCancelled RefundStatus = "CANCELLED" // 退款取消
)

// RefundRequest 退款请求
type RefundRequest struct {
	OutTradeNo     string            `json:"out_trade_no"`      // 商户订单号
	TradeNo        string            `json:"trade_no"`          // 平台订单号
	RefundAmount   float64           `json:"refund_amount"`     // 退款金额
	Currency       Currency          `json:"currency"`          // 货币类型
	RefundReason   string            `json:"refund_reason"`     // 退款原因
	NotifyURL      string            `json:"notify_url"`        // 异步通知地址
	BatchNo        string            `json:"batch_no"`          // 商户退款单号
	AttachData     map[string]interface{} `json:"attach_data"`   // 附加数据
	Metadata       map[string]string `json:"metadata"`          // 元数据
	CustomFields   map[string]interface{} `json:"custom_fields"` // 自定义字段
	Timeout        time.Duration     `json:"timeout"`           // 超时时间
}

// Validate 验证退款请求
func (r *RefundRequest) Validate() error {
	if r.OutTradeNo == "" && r.TradeNo == "" {
		return fmt.Errorf("商户订单号和平台订单号至少填写一个")
	}
	if r.RefundAmount <= 0 {
		return fmt.Errorf("退款金额必须大于0")
	}
	if r.Currency == "" {
		return fmt.Errorf("货币类型不能为空")
	}
	if r.RefundReason == "" {
		return fmt.Errorf("退款原因不能为空")
	}
	if r.RefundAmount > 0 && r.OutTradeNo == "" && r.TradeNo == "" {
		return fmt.Errorf("退款需要关联的订单信息")
	}
	return nil
}

// RefundResponse 退款响应
type RefundResponse struct {
	OutTradeNo     string        `json:"out_trade_no"`      // 商户订单号
	TradeNo        string        `json:"trade_no"`          // 平台订单号
	RefundNo       string        `json:"refund_no"`         // 退款单号
	OutRefundNo    string        `json:"out_refund_no"`     // 商户退款单号
	Status         RefundStatus  `json:"status"`            // 退款状态
	RefundAmount   float64       `json:"refund_amount"`     // 退款金额
	Currency       Currency      `json:"currency"`          // 货币类型
	OriginalAmount float64       `json:"original_amount"`   // 原始订单金额
	RefundReason   string        `json:"refund_reason"`     // 退款原因
	RefundMethod   string        `json:"refund_method"`     // 退款方式
	TransactionID  string        `json:"transaction_id"`    // 第三方退款交易ID
	ChannelCode    string        `json:"channel_code"`      // 渠道代码
	ChannelMsg     string        `json:"channel_msg"`       // 渠道消息
	OrderTime      time.Time     `json:"order_time"`        // 下单时间
	SubmitTime     time.Time     `json:"submit_time"`       // 提交时间
	ProcessTime    time.Time     `json:"process_time"`      // 处理时间
	CompleteTime   *time.Time    `json:"complete_time"`     // 完成时间
	ExpireTime     time.Time     `json:"expire_time"`       // 过期时间
	AttachData     map[string]interface{} `json:"attach_data"` // 附加数据
	Metadata       map[string]string `json:"metadata"`       // 元数据
	CustomFields   map[string]interface{} `json:"custom_fields"` // 自定义字段
	Errors         []string      `json:"errors,omitempty"`  // 错误信息
	Warnings       []string      `json:"warnings,omitempty"` // 警告信息
}

// IsSuccess 检查退款是否成功
func (r *RefundResponse) IsSuccess() bool {
	return r.Status == RefundSuccess
}

// IsFailed 检查退款是否失败
func (r *RefundResponse) IsFailed() bool {
	return r.Status == RefundFailed
}

// IsPartial 检查是否部分退款
func (r *RefundResponse) IsPartial() bool {
	return r.Status == RefundPartial
}

// CanRetry 检查是否可重试
func (r *RefundResponse) CanRetry() bool {
	return r.Status == RefundFailed
}

// ToJSON 转换为JSON字符串
func (r *RefundResponse) ToJSON() (string, error) {
	data, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON序列化失败: %w", err)
	}
	return string(data), nil
}

// RefundQueryRequest 退款查询请求
type RefundQueryRequest struct {
	OutTradeNo  string `json:"out_trade_no"`  // 商户订单号
	TradeNo     string `json:"trade_no"`      // 平台订单号
	OutRefundNo string `json:"out_refund_no"` // 商户退款单号
	RefundNo    string `json:"refund_no"`     // 退款单号
}

// RefundQueryResponse 退款查询响应
type RefundQueryResponse struct {
	RefundResponse
	QueryTime      time.Time `json:"query_time"`      // 查询时间
	RemainingAmount float64 `json:"remaining_amount"` // 剩余可退款金额
	ProcessedAmount  float64 `json:"processed_amount"` // 已处理退款金额
	ProcessingFee    float64 `json:"processing_fee"`   // 手续费
}

// RefundCancelRequest 退款取消请求
type RefundCancelRequest struct {
	OutRefundNo string `json:"out_refund_no"` // 商户退款单号
	RefundNo    string `json:"refund_no"`     // 退款单号
	Reason      string `json:"reason"`        // 取消原因
}

// RefundCancelResponse 退款取消响应
type RefundCancelResponse struct {
	OutRefundNo string    `json:"out_refund_no"` // 商户退款单号
	RefundNo    string    `json:"refund_no"`     // 退款单号
	Status      RefundStatus `json:"status"`     // 退款状态
	CancelTime  time.Time `json:"cancel_time"`   // 取消时间
	Reason      string    `json:"reason"`        // 取消原因
	Success     bool      `json:"success"`       // 是否成功
	Message     string    `json:"message"`       // 消息
}

// RefundBatchRequest 批量退款请求
type RefundBatchRequest struct {
	Requests   []RefundRequest `json:"requests"`        // 退款请求列表
	BatchID    string          `json:"batch_id"`        // 批量ID
	NotifyURL  string          `json:"notify_url"`      // 异步通知地址
	CallbackURL string         `json:"callback_url"`    // 回调地址
	Metadata   map[string]string `json:"metadata"`      // 元数据
}

// RefundBatchResponse 批量退款响应
type RefundBatchResponse struct {
	BatchID       string         `json:"batch_id"`        // 批量ID
	TotalCount    int            `json:"total_count"`     // 总数量
	SuccessCount  int            `json:"success_count"`   // 成功数量
	FailedCount   int            `json:"failed_count"`    // 失败数量
	ProcessingCount int          `json:"processing_count"` // 处理中数量
	Status        string         `json:"status"`          // 批处理状态
	Results       []RefundResponse `json:"results"`        // 退款结果列表
	SubmitTime    time.Time      `json:"submit_time"`     // 提交时间
	ProcessTime   time.Time      `json:"process_time"`    // 处理时间
	EndTime       *time.Time     `json:"end_time"`        // 完成时间
	Duration      time.Duration  `json:"duration"`        // 处理耗时
	Errors        []string       `json:"errors,omitempty"` // 错误信息
	Warnings      []string       `json:"warnings,omitempty"` // 警告信息
}

// GetSuccessResults 获取成功的退款结果
func (r *RefundBatchResponse) GetSuccessResults() []RefundResponse {
	var results []RefundResponse
	for _, result := range r.Results {
		if result.IsSuccess() {
			results = append(results, result)
		}
	}
	return results
}

// GetFailedResults 获取失败的退款结果
func (r *RefundBatchResponse) GetFailedResults() []RefundResponse {
	var results []RefundResponse
	for _, result := range r.Results {
		if result.IsFailed() {
			results = append(results, result)
		}
	}
	return results
}

// HasErrors 检查是否有错误
func (r *RefundBatchResponse) HasErrors() bool {
	return len(r.Errors) > 0
}

// IsCompleted 检查是否已完成
func (r *RefundBatchResponse) IsCompleted() bool {
	return r.Status == "COMPLETED" || r.Status == "FAILED"
}

// RefundStatisticsRequest 退款统计请求
type RefundStatisticsRequest struct {
	StartDate time.Time `json:"start_date"` // 开始日期
	EndDate   time.Time `json:"end_date"`   // 结束日期
	GroupBy   string    `json:"group_by"`   // 分组方式: day, week, month, payment_method, channel
	Filters   map[string]interface{} `json:"filters"` // 筛选条件
}

// RefundStatisticsResponse 退款统计响应
type RefundStatisticsResponse struct {
	TotalCount         int64   `json:"total_count"`          // 总退款单数
	TotalAmount        float64 `json:"total_amount"`         // 总退款金额
	SuccessCount       int64   `json:"success_count"`        // 成功退款单数
	SuccessAmount      float64 `json:"success_amount"`       // 成功退款金额
	FailedCount        int64   `json:"failed_count"`         // 失败退款单数
	FailedAmount       float64 `json:"failed_amount"`        // 失败退款金额
	PartialCount       int64   `json:"partial_count"`        // 部分退款单数
	PartialAmount      float64 `json:"partial_amount"`       // 部分退款金额
	AverageRefundAmount float64 `json:"average_refund_amount"` // 平均退款金额
	ProcessingFee      float64 `json:"processing_fee"`       // 手续费
	StatisticsData     []map[string]interface{} `json:"statistics_data"` // 统计详情
	Period             string    `json:"period"`             // 统计周期
	GeneratedAt        time.Time `json:"generated_at"`       // 生成时间
	QueryTime          time.Duration `json:"query_time"`     // 查询耗时
}