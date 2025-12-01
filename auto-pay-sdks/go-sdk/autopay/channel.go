package autopay

import (
	"encoding/json"
	"fmt"
	"time"
)

// ChannelStatus 渠道状态
type ChannelStatus string

const (
	ChannelActive   ChannelStatus = "ACTIVE"   // 活跃
	ChannelInactive ChannelStatus = "INACTIVE" // 不活跃
	ChannelMaintenance ChannelStatus = "MAINTENANCE" // 维护中
	ChannelDisabled ChannelStatus = "DISABLED" // 禁用
)

// ChannelCode 渠道代码
type ChannelCode string

const (
	ChannelAlipay       ChannelCode = "alipay"       // 支付宝
	ChannelWeChatPay   ChannelCode = "wechat_pay"   // 微信支付
	ChannelUnionPay    ChannelCode = "unionpay"     // 银联支付
	ChannelCreditCard  ChannelCode = "credit_card"  // 信用卡
	ChannelBankTransfer ChannelCode = "bank_transfer" // 银行转账
	ChannelCrypto      ChannelCode = "cryptocurrency" // 加密货币
	ChannelPayPal      ChannelCode = "paypal"       // PayPal
)

// Channel 支付渠道信息
type Channel struct {
	Code          ChannelCode     `json:"code"`           // 渠道代码
	Name          string          `json:"name"`           // 渠道名称
	Status        ChannelStatus   `json:"status"`         // 渠道状态
	Version       string          `json:"version"`        // 渠道版本
	Description   string          `json:"description"`    // 渠道描述
	SupportedCurrencies []Currency `json:"supported_currencies"` // 支持的货币类型
	MinAmount     float64         `json:"min_amount"`     // 最小交易金额
	MaxAmount     float64         `json:"max_amount"`     // 最大交易金额
	FeeRate       float64         `json:"fee_rate"`       // 费率
	FixedFee      float64         `json:"fixed_fee"`      // 固定手续费
	Timeout       time.Duration   `json:"timeout"`        // 超时时间
	SuccessRate   float64         `json:"success_rate"`   // 成功率
	AverageDelay  time.Duration   `json:"average_delay"`  // 平均延迟
	Feature       map[string]interface{} `json:"feature"` // 功能特性
	Metadata      map[string]string `json:"metadata"`     // 元数据
	CreatedAt     time.Time       `json:"created_at"`     // 创建时间
	UpdatedAt     time.Time       `json:"updated_at"`     // 更新时间
}

// IsActive 检查渠道是否活跃
func (c *Channel) IsActive() bool {
	return c.Status == ChannelActive
}

// IsAvailable 检查渠道是否可用
func (c *Channel) IsAvailable() bool {
	return c.Status == ChannelActive && c.SuccessRate >= 0.8
}

// IsCurrencySupported 检查是否支持指定货币
func (c *Channel) IsCurrencySupported(currency Currency) bool {
	for _, supported := range c.SupportedCurrencies {
		if supported == currency {
			return true
		}
	}
	return false
}

// CanProcessAmount 检查是否可处理指定金额
func (c *Channel) CanProcessAmount(amount float64) bool {
	return amount >= c.MinAmount && amount <= c.MaxAmount
}

// CalculateFee 计算手续费
func (c *Channel) CalculateFee(amount float64) float64 {
	return amount*c.FeeRate + c.FixedFee
}

// ToJSON 转换为JSON字符串
func (c *Channel) ToJSON() (string, error) {
	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON序列化失败: %w", err)
	}
	return string(data), nil
}

// ChannelConfig 渠道配置
type ChannelConfig struct {
	Code       ChannelCode           `json:"code"`        // 渠道代码
	Name       string                `json:"name"`        // 渠道名称
	Enabled    bool                  `json:"enabled"`     // 是否启用
	Priority   int                   `json:"priority"`    // 优先级（数字越小优先级越高）
	Conditions map[string]interface{} `json:"conditions"` // 启用条件
	Settings   map[string]interface{} `json:"settings"`   // 渠道特定设置
	RateLimit  *RateLimit            `json:"rate_limit"`  // 限流配置
	Timeout    time.Duration         `json:"timeout"`     // 超时时间
	Retries    int                   `json:"retries"`     // 重试次数
}

// RateLimit 限流配置
type RateLimit struct {
	Enabled   bool          `json:"enabled"`   // 是否启用限流
	Rate      int           `json:"rate"`      // 每秒请求数
	Burst     int           `json:"burst"`     // 突发请求数
	Unit      string        `json:"unit"`      // 时间单位
}

// ChannelQuery 渠道查询参数
type ChannelQuery struct {
	Status      *ChannelStatus `json:"status,omitempty"`      // 渠道状态
	Currency    *Currency      `json:"currency,omitempty"`    // 货币类型
	MinAmount   *float64       `json:"min_amount,omitempty"`  // 最小金额
	MaxAmount   *float64       `json:"max_amount,omitempty"`  // 最大金额
	SuccessRate *float64       `json:"success_rate,omitempty"` // 最低成功率
	Query       string         `json:"query,omitempty"`       // 模糊搜索
	SortBy      string         `json:"sort_by,omitempty"`     // 排序字段
	SortOrder   string         `json:"sort_order,omitempty"`  // 排序方向
	Page        int            `json:"page,omitempty"`        // 页码
	PageSize    int            `json:"page_size,omitempty"`   // 每页数量
}

// ChannelListResponse 渠道列表响应
type ChannelListResponse struct {
	Channels []Channel         `json:"channels"` // 渠道列表
	Total    int64             `json:"total"`    // 总数量
	Page     int               `json:"page"`     // 当前页码
	PageSize int               `json:"page_size"` // 每页数量
	HasMore  bool              `json:"has_more"` // 是否有更多
	QueryTime time.Duration    `json:"query_time"` // 查询耗时
}

// ChannelStats 渠道统计数据
type ChannelStats struct {
	Code                ChannelCode `json:"code"`                 // 渠道代码
	Name                string      `json:"name"`                 // 渠道名称
	TransactionCount    int64       `json:"transaction_count"`    // 交易总数
	TotalAmount         float64     `json:"total_amount"`         // 总金额
	SuccessCount        int64       `json:"success_count"`        // 成功交易数
	FailedCount         int64       `json:"failed_count"`         // 失败交易数
	SuccessRate         float64     `json:"success_rate"`         // 成功率
	AverageAmount       float64     `json:"average_amount"`       // 平均金额
	AverageFee          float64     `json:"average_fee"`          // 平均手续费
	TotalFee            float64     `json:"total_fee"`            // 总手续费
	RefundCount         int64       `json:"refund_count"`         // 退款次数
	RefundAmount        float64     `json:"refund_amount"`        // 退款金额
	PeakTPS             float64     `json:"peak_tps"`             // 峰值TPS
	AverageDelay        time.Duration `json:"average_delay"`      // 平均延迟
	MinDelay            time.Duration `json:"min_delay"`          // 最小延迟
	MaxDelay            time.Duration `json:"max_delay"`          // 最大延迟
	LastUpdate          time.Time   `json:"last_update"`          // 最后更新时间
}

// ChannelRecommendation 渠道推荐
type ChannelRecommendation struct {
	Channels        []Channel `json:"channels"`         // 推荐的渠道
	Score           float64   `json:"score"`            // 推荐分数
	Reasons         []string  `json:"reasons"`          // 推荐原因
	RiskLevel       string    `json:"risk_level"`       // 风险级别
	EstimatedDelay  time.Duration `json:"estimated_delay"` // 预估延迟
	EstimatedFee    float64   `json:"estimated_fee"`    // 预估费用
	Alternatives    []Channel `json:"alternatives"`     // 备选渠道
}

// ChannelRecommendationRequest 渠道推荐请求
type ChannelRecommendationRequest struct {
	Amount     float64           `json:"amount"`      // 交易金额
	Currency   Currency          `json:"currency"`    // 货币类型
	PaymentMethod PaymentMethod   `json:"payment_method"` // 支付方式
	CustomerRegion string        `json:"customer_region"` // 客户地区
	BusinessType string          `json:"business_type"`   // 业务类型
	Priority    []string         `json:"priority"`         // 优先级条件
	Constraints map[string]interface{} `json:"constraints"` // 约束条件
}

// ChannelComparison 渠道对比
type ChannelComparison struct {
	Channels      []ChannelComparisonItem `json:"channels"`       // 对比渠道列表
	ComparisonCriteria []string           `json:"comparison_criteria"` // 对比维度
	Recommended    string                 `json:"recommended"`   // 推荐渠道
	Summary        map[string]interface{} `json:"summary"`       // 对比总结
	GeneratedAt    time.Time              `json:"generated_at"`  // 生成时间
}

// ChannelComparisonItem 渠道对比项目
type ChannelComparisonItem struct {
	Channel     Channel                `json:"channel"`           // 渠道信息
	Scores      map[string]float64     `json:"scores"`            // 各维度评分
	Pros        []string               `json:"pros"`              // 优点
	Cons        []string               `json:"cons"`              // 缺点
	OverallScore float64               `json:"overall_score"`     // 综合评分
}