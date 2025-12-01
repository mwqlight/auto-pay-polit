# AutoPay Go SDK

AutoPay Go SDK 提供了高性能、易用的 Go 语言支付接口，支持支付、退款、渠道管理等核心功能。

## 特性

- 🚀 **高性能**: 基于 Go 语言原生特性，支持高并发处理
- 🔒 **安全可靠**: 支持 JWT 认证、数据加密、限流控制
- 📊 **功能完整**: 支持支付、退款、批量操作、统计分析
- 🛡️ **容错性强**: 内置重试机制、熔断器、错误恢复
- 📝 **易于使用**: 简洁的 API 设计，完整的文档和示例

## 快速开始

### 安装

```bash
go get github.com/autopay-sdk/autopay
```

### 基础使用

```go
package main

import (
    "context"
    "fmt"
    "time"
    
    "github.com/autopay-sdk/autopay"
)

func main() {
    // 创建配置
    config := autopay.NewConfig("your-api-key", "your-secret-key", autopay.EnvironmentSandbox)
    
    // 创建客户端
    client, err := autopay.NewClient(config)
    if err != nil {
        panic(err)
    }
    
    ctx := context.Background()
    
    // 创建支付
    paymentReq := &autopay.PaymentRequest{
        OutTradeNo:    "ORDER_20241201_001",
        Amount:        100.50,
        Currency:      autopay.CurrencyCNY,
        Subject:       "订单支付",
        Body:          "商品描述",
        NotifyURL:     "https://your-domain.com/notify",
        ReturnURL:     "https://your-domain.com/return",
    }
    
    paymentResp, err := client.Payment().Create(ctx, paymentReq)
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("支付创建成功: %+v\n", paymentResp)
    
    // 查询支付状态
    queryReq := &autopay.PaymentQueryRequest{
        OutTradeNo: paymentReq.OutTradeNo,
    }
    
    queryResp, err := client.Payment().Query(ctx, queryReq)
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("支付查询结果: %+v\n", queryResp)
}
```

### 批量支付

```go
// 创建多个支付请求
requests := []autopay.PaymentRequest{
    {
        OutTradeNo: "ORDER_20241201_001",
        Amount:     100.50,
        Currency:   autopay.CurrencyCNY,
        Subject:    "商品1",
        Body:       "商品1描述",
        NotifyURL:  "https://your-domain.com/notify",
    },
    {
        OutTradeNo: "ORDER_20241201_002",
        Amount:     200.00,
        Currency:   autopay.CurrencyCNY,
        Subject:    "商品2",
        Body:       "商品2描述",
        NotifyURL:  "https://your-domain.com/notify",
    },
}

// 批量处理（最多10个并发）
batchResp, err := client.Payment().BatchCreate(ctx, requests, 10)
if err != nil {
    panic(err)
}

fmt.Printf("批量支付结果: 总数=%d, 成功=%d, 失败=%d\n", 
    batchResp.TotalCount, batchResp.SuccessCount, batchResp.FailedCount)
```

### 退款处理

```go
// 创建退款
refundReq := &autopay.RefundRequest{
    OutTradeNo:   "ORDER_20241201_001",
    RefundAmount: 50.00,
    Currency:     autopay.CurrencyCNY,
    RefundReason: "用户申请退款",
}

refundResp, err := client.Refund().Create(ctx, refundReq)
if err != nil {
    panic(err)
}

fmt.Printf("退款创建成功: %+v\n", refundResp)
```

## API 文档

### 支付服务 (Payment Service)

#### Create 创建支付
```go
func (s *PaymentService) Create(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error)
```

#### Query 查询支付
```go
func (s *PaymentService) Query(ctx context.Context, req *PaymentQueryRequest) (*PaymentQueryResponse, error)
```

#### Cancel 取消支付
```go
func (s *PaymentService) Cancel(ctx context.Context, req *PaymentCancelRequest) (*PaymentCancelResponse, error)
```

#### BatchCreate 批量创建支付
```go
func (s *PaymentService) BatchCreate(ctx context.Context, requests []PaymentRequest, maxWorkers int) (*PaymentBatchResponse, error)
```

#### Statistics 支付统计
```go
func (s *PaymentService) Statistics(ctx context.Context, req *PaymentStatisticsRequest) (*PaymentStatisticsResponse, error)
```

### 退款服务 (Refund Service)

#### Create 创建退款
```go
func (s *RefundService) Create(ctx context.Context, req *RefundRequest) (*RefundResponse, error)
```

#### Query 查询退款
```go
func (s *RefundService) Query(ctx context.Context, req *RefundQueryRequest) (*RefundQueryResponse, error)
```

#### Cancel 取消退款
```go
func (s *RefundService) Cancel(ctx context.Context, req *RefundCancelRequest) (*RefundCancelResponse, error)
```

#### BatchCreate 批量创建退款
```go
func (s *RefundService) BatchCreate(ctx context.Context, requests []RefundRequest, maxWorkers int) (*RefundBatchResponse, error)
```

#### Statistics 退款统计
```go
func (s *RefundService) Statistics(ctx context.Context, req *RefundStatisticsRequest) (*RefundStatisticsResponse, error)
```

### 渠道服务 (Channel Service)

#### Recommend 推荐支付渠道
```go
func (s *ChannelService) Recommend(ctx context.Context, req *ChannelRecommendRequest) (*ChannelRecommendResponse, error)
```

#### Compare 比较支付渠道
```go
func (s *ChannelService) Compare(ctx context.Context, req *ChannelCompareRequest) (*ChannelCompareResponse, error)
```

#### Stats 渠道统计
```go
func (s *ChannelService) Stats(ctx context.Context, req *ChannelStatsRequest) (*ChannelStatsResponse, error)
```

## 高级配置

### 自定义客户端配置

```go
config := &autopay.Config{
    BaseURL:        "https://api.autopay.com",
    APIKey:         "your-api-key",
    SecretKey:      "your-secret-key",
    Environment:    autopay.EnvironmentProduction,
    Timeout:        30 * time.Second,
    ConnectTimeout: 10 * time.Second,
    ReadTimeout:    30 * time.Second,
    MaxIdleConns:   100,
    RateLimit:      100,
    RateBurst:      20,
    MaxRetries:     3,
    RetryDelay:     1 * time.Second,
    BackoffFactor:  2.0,
    MaxWorkers:     10,
    EnableLogging:  true,
    LogLevel:       "info",
}
```

### 日志配置

SDK 支持自定义日志实现：

```go
type CustomLogger struct{}

func (l *CustomLogger) Info(msg string, args ...interface{}) {
    // 实现 Info 日志
}

func (l *CustomLogger) Error(msg string, args ...interface{}) {
    // 实现 Error 日志
}

func (l *CustomLogger) Debug(msg string, args ...interface{}) {
    // 实现 Debug 日志
}

// 使用自定义日志
config := autopay.DefaultConfig()
config.EnableLogging = true

client, err := autopay.NewClientWithLogger(config, &CustomLogger{})
```

### 限流配置

```go
// 创建自定义限流器
rateLimiter := rate.NewLimiter(rate.Every(time.Second/50), 10) // 每秒50个请求，突发10个

client, err := autopay.NewClientWithRateLimiter(config, rateLimiter)
```

## 错误处理

SDK 提供了统一的错误处理机制：

```go
paymentResp, err := client.Payment().Create(ctx, paymentReq)
if err != nil {
    // 处理错误
    switch e := err.(type) {
    case *autopay.APIError:
        fmt.Printf("API错误: %d - %s\n", e.Code, e.Message)
    case *autopay.NetworkError:
        fmt.Printf("网络错误: %s\n", e.Error())
    default:
        fmt.Printf("未知错误: %s\n", e.Error())
    }
    return
}
```

## 并发安全

SDK 的所有方法都是并发安全的，可以在多个 goroutine 中同时使用：

```go
// 并发处理多个支付
var wg sync.WaitGroup
for i := 0; i < 100; i++ {
    wg.Add(1)
    go func(index int) {
        defer wg.Done()
        
        req := &autopay.PaymentRequest{
            OutTradeNo: fmt.Sprintf("ORDER_%d", index),
            Amount:     100.00,
            Currency:   autopay.CurrencyCNY,
            Subject:    fmt.Sprintf("订单 %d", index),
        }
        
        resp, err := client.Payment().Create(ctx, req)
        if err != nil {
            fmt.Printf("订单 %d 处理失败: %s\n", index, err.Error())
        } else {
            fmt.Printf("订单 %d 处理成功: %s\n", index, resp.TradeNo)
        }
    }(i)
}
wg.Wait()
```

## 性能优化

### 连接池配置

```go
config := autopay.DefaultConfig()
config.MaxIdleConns = 200
config.MaxIdleConnsPerHost = 50
config.IdleConnTimeout = 120 * time.Second
```

### 批量操作优化

```go
// 对于大量支付，建议使用批量接口
requests := generateLargePaymentRequests(10000)

// 批量处理，控制并发数
batchResp, err := client.Payment().BatchCreate(ctx, requests, 50) // 50个并发
```

### 缓存配置

```go
// 启用结果缓存（如果支持）
config := autopay.DefaultConfig()
config.EnableCache = true
config.CacheTTL = 5 * time.Minute
```

## 最佳实践

1. **使用上下文**: 始终使用 `context.Context` 进行超时和取消控制
2. **合理设置并发数**: 根据 API 限制和系统性能调整 `maxWorkers`
3. **错误处理**: 正确处理各种类型的错误，包括网络错误和业务错误
4. **重试机制**: 对于临时性失败，利用内置的重试机制
5. **监控日志**: 启用日志记录，便于问题排查和性能监控
6. **资源清理**: 确保在应用程序结束时关闭客户端

## 兼容性

- Go 1.18+

## 许可证

MIT License

## 支持

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/autopay-sdk/go-sdk/issues
- 邮箱: support@autopay.com
- 文档: https://docs.autopay.com/go-sdk