package autopay

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
	
	"golang.org/x/time/rate"
)

// Currency 货币类型
type Currency string

const (
	CurrencyCNY Currency = "CNY"
	CurrencyUSD Currency = "USD"
	CurrencyEUR Currency = "EUR"
	CurrencyHKD Currency = "HKD"
)

// Environment 环境类型
type Environment string

const (
	EnvironmentProduction Environment = "production"
	EnvironmentSandbox   Environment = "sandbox"
)

// Config 客户端配置
type Config struct {
	BaseURL           string
	APIKey            string
	SecretKey         string
	Environment       Environment
	Timeout           time.Duration
	MaxWorkers        int
	RateLimit         int
	RateBurst         int
	EnableLogging     bool
	LogLevel          string
	SkipTLSVerify     bool
	ProxyURL          string
	MaxRetries        int
	RetryDelay        time.Duration
	BackoffFactor     float64
	ConnectTimeout    time.Duration
	ReadTimeout       time.Duration
	MaxIdleConns      int
	MaxIdleConnsPerHost int
	IdleConnTimeout   time.Duration
	UseHTTPS          bool
}

// DefaultConfig 创建默认配置
func DefaultConfig() *Config {
	return &Config{
		Timeout:             30 * time.Second,
		ConnectTimeout:      10 * time.Second,
		ReadTimeout:         30 * time.Second,
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 30,
		IdleConnTimeout:     90 * time.Second,
		RateLimit:           100,
		RateBurst:           20,
		MaxRetries:          3,
		RetryDelay:          1 * time.Second,
		BackoffFactor:       2.0,
		MaxWorkers:          10,
		EnableLogging:       true,
		LogLevel:            "info",
	}
}

// NewConfig 创建新配置
func NewConfig(apiKey, secretKey string, environment Environment) *Config {
	config := DefaultConfig()
	config.APIKey = apiKey
	config.SecretKey = secretKey
	config.Environment = environment
	
	if environment == EnvironmentSandbox {
		config.BaseURL = "https://sandbox-api.autopay.com"
	} else {
		config.BaseURL = "https://api.autopay.com"
	}
	
	return config
}

// Validate 验证配置
func (c *Config) Validate() error {
	if c.APIKey == "" {
		return fmt.Errorf("API密钥不能为空")
	}
	if c.SecretKey == "" {
		return fmt.Errorf("密钥不能为空")
	}
	if c.Environment == "" {
		return fmt.Errorf("环境类型不能为空")
	}
	return nil
}

// Client HTTP客户端
type Client struct {
	config      *Config
	client      *http.Client
	logger      Logger
	rateLimiter *rate.Limiter
	mu          sync.RWMutex
	stats       *Stats
}

// Logger 日志接口
type Logger interface {
	Info(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Debug(msg string, args ...interface{})
}

// DefaultLogger 默认日志实现
type DefaultLogger struct {
	enabled bool
	level   string
}

// NewDefaultLogger 创建默认日志
func NewDefaultLogger(enabled bool, level string) Logger {
	return &DefaultLogger{
		enabled: enabled,
		level:   level,
	}
}

// Info 信息日志
func (l *DefaultLogger) Info(msg string, args ...interface{}) {
	if !l.enabled {
		return
	}
	fmt.Printf("[INFO] "+msg+"\n", args...)
}

// Error 错误日志
func (l *DefaultLogger) Error(msg string, args ...interface{}) {
	if !l.enabled {
		return
	}
	fmt.Printf("[ERROR] "+msg+"\n", args...)
}

// Debug 调试日志
func (l *DefaultLogger) Debug(msg string, args ...interface{}) {
	if !l.enabled {
		return
	}
	fmt.Printf("[DEBUG] "+msg+"\n", args...)
}

// Stats 统计信息
type Stats struct {
	RequestCount   uint64 `json:"request_count"`
	SuccessCount   uint64 `json:"success_count"`
	ErrorCount     uint64 `json:"error_count"`
	RetryCount     uint64 `json:"retry_count"`
	ActiveRequests int32  `json:"active_requests"`
}

// Clone 克隆统计信息
func (s *Stats) Clone() *Stats {
	return &Stats{
		RequestCount:   s.RequestCount,
		SuccessCount:   s.SuccessCount,
		ErrorCount:     s.ErrorCount,
		RetryCount:     s.RetryCount,
		ActiveRequests: s.ActiveRequests,
	}
}

// NewClient 创建新客户端
func NewClient(config *Config) (*Client, error) {
	if config == nil {
		return nil, fmt.Errorf("配置不能为空")
	}

	// 设置默认值
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	if config.ConnectTimeout == 0 {
		config.ConnectTimeout = 10 * time.Second
	}
	if config.ReadTimeout == 0 {
		config.ReadTimeout = 30 * time.Second
	}
	if config.MaxIdleConns == 0 {
		config.MaxIdleConns = 100
	}
	if config.MaxIdleConnsPerHost == 0 {
		config.MaxIdleConnsPerHost = 30
	}
	if config.IdleConnTimeout == 0 {
		config.IdleConnTimeout = 90 * time.Second
	}
	if config.RateLimit == 0 {
		config.RateLimit = 100
	}
	if config.RateBurst == 0 {
		config.RateBurst = 20
	}
	if config.MaxRetries == 0 {
		config.MaxRetries = 3
	}
	if config.RetryDelay == 0 {
		config.RetryDelay = 1 * time.Second
	}
	if config.BackoffFactor == 0 {
		config.BackoffFactor = 2.0
	}

	// 设置基础URL
	if config.BaseURL == "" {
		if config.Environment == EnvironmentSandbox {
			config.BaseURL = "https://sandbox-api.autopay.com"
		} else {
			config.BaseURL = "https://api.autopay.com"
		}
	}

	// 创建HTTP客户端
	httpClient := &http.Client{
		Timeout: config.Timeout,
		Transport: &http.Transport{
			MaxIdleConns:        config.MaxIdleConns,
			MaxIdleConnsPerHost: config.MaxIdleConnsPerHost,
			IdleConnTimeout:     config.IdleConnTimeout,
		},
	}

	// 创建限流器
	rateLimiter := rate.NewLimiter(rate.Limit(config.RateLimit), config.RateBurst)

	client := &Client{
		config:      config,
		client:      httpClient,
		logger:      NewDefaultLogger(config.EnableLogging, config.LogLevel),
		rateLimiter: rateLimiter,
		stats:       &Stats{},
	}

	client.logger.Info("AutoPay客户端初始化完成", "base_url", config.BaseURL, "environment", config.Environment)

	return client, nil
}

// New 创建新客户端（便捷方法）
func New(apiKey, secretKey string, environment Environment) (*Client, error) {
	config := NewConfig(apiKey, secretKey, environment)
	return NewClient(config)
}

// NewSandbox 创建沙盒环境客户端
func NewSandbox(apiKey, secretKey string) (*Client, error) {
	return New(apiKey, secretKey, EnvironmentSandbox)
}

// NewProduction 创建生产环境客户端
func NewProduction(apiKey, secretKey string) (*Client, error) {
	return New(apiKey, secretKey, EnvironmentProduction)
}

// HealthCheck 健康检查
func (c *Client) HealthCheck(ctx context.Context) (*HealthResponse, error) {
	c.logger.Info("执行健康检查")

	url := c.config.BaseURL + "/v1/health"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建HTTP请求失败: %w", err)
	}

	c.setRequestHeaders(req)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP请求失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("健康检查失败: HTTP %d", resp.StatusCode)
	}

	var health HealthResponse
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return nil, fmt.Errorf("解析健康检查响应失败: %w", err)
	}

	health.Status = "ok"
	health.Timestamp = time.Now()
	health.Version = "1.0.0"

	return &health, nil
}

// Payments 获取支付服务
func (c *Client) Payments() *PaymentService {
	return &PaymentService{
		client:      c.client,
		baseURL:     c.config.BaseURL,
		apiKey:      c.config.APIKey,
		logger:      c.logger,
		rateLimiter: c.rateLimiter,
	}
}

// Refunds 获取退款服务
func (c *Client) Refunds() *RefundService {
	return &RefundService{
		client:      c.client,
		baseURL:     c.config.BaseURL,
		apiKey:      c.config.APIKey,
		logger:      c.logger,
		rateLimiter: c.rateLimiter,
	}
}

// Channels 获取渠道服务
func (c *Client) Channels() *ChannelService {
	return &ChannelService{
		client:      c.client,
		baseURL:     c.config.BaseURL,
		apiKey:      c.config.APIKey,
		logger:      c.logger,
		rateLimiter: c.rateLimiter,
	}
}

// BatchProcess 批量处理支付/退款
func (c *Client) BatchProcess(ctx context.Context, requests interface{}, maxWorkers int) (interface{}, error) {
	if maxWorkers <= 0 {
		maxWorkers = c.config.MaxWorkers
	}

	switch req := requests.(type) {
	case []PaymentRequest:
		return c.Payments().BatchCreate(ctx, req, maxWorkers)
	case []RefundRequest:
		return c.Refunds().BatchCreate(ctx, req, maxWorkers)
	default:
		return nil, fmt.Errorf("不支持的请求类型: %T", requests)
	}
}

// Close 关闭客户端
func (c *Client) Close() error {
	c.client.CloseIdleConnections()
	c.logger.Info("AutoPay客户端已关闭")
	return nil
}

// GetStats 获取统计信息
func (c *Client) GetStats() *Stats {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.stats.Clone()
}

// GetConfig 获取配置
func (c *Client) GetConfig() *Config {
	return c.config
}

// setRequestHeaders 设置请求头
func (c *Client) setRequestHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	req.Header.Set("User-Agent", "autopay-go-sdk/1.0.0")
}