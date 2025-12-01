package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/autopay-sdk/autopay"
)

// 创建示例配置
func createSampleConfig() *autopay.Config {
	config := autopay.NewConfig("your_api_key", "your_secret_key", autopay.EnvironmentSandbox)
	config.SetTimeout(30 * time.Second)
	config.SetMaxRetries(3)
	config.SetEnableLogging(true)
	return config
}

// 健康检查示例
func healthCheckExample(client *autopay.Client) {
	fmt.Println("=== 健康检查示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	health, err := client.HealthCheck(ctx)
	if err != nil {
		log.Printf("健康检查失败: %v", err)
		return
	}
	
	fmt.Printf("状态: %s\n", health.Status)
	fmt.Printf("版本: %s\n", health.Version)
	fmt.Printf("运行时间: %v\n", health.Uptime)
	fmt.Printf("数据库状态: %s\n", health.Database)
	fmt.Printf("Redis状态: %s\n", health.Redis)
	fmt.Printf("时间戳: %s\n", health.Timestamp.Format("2006-01-02 15:04:05"))
}

// 单笔支付示例
func singlePaymentExample(client *autopay.Client) {
	fmt.Println("\n=== 单笔支付示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// 创建支付请求
	paymentReq := autopay.PaymentRequest{
		OutTradeNo:     fmt.Sprintf("order_%d", time.Now().Unix()),
		TotalAmount:    99.99,
		Currency:       autopay.CurrencyCNY,
		Subject:        "测试商品购买",
		Body:           "这是一个测试商品",
		PaymentMethod:  autopay.MethodAlipay,
		NotifyURL:      "https://your-domain.com/webhook/payment",
		ReturnURL:      "https://your-domain.com/return",
		Timeout:        15 * time.Minute,
		AttachData: map[string]interface{}{
			"user_id":    "123456",
			"product_id": "PROD001",
			"quantity":   1,
		},
		Metadata: map[string]string{
			"channel":     "web",
			"source":      "mobile_app",
			"campaign_id": "SPRING2024",
		},
		CustomFields: map[string]interface{}{
			"discount_amount": 10.0,
			"vip_level":       "gold",
		},
	}
	
	// 创建支付
	paymentResp, err := client.Payments().Create(ctx, &paymentReq)
	if err != nil {
		log.Printf("支付创建失败: %v", err)
		return
	}
	
	fmt.Printf("订单号: %s\n", paymentResp.OutTradeNo)
	fmt.Printf("平台订单号: %s\n", paymentResp.TradeNo)
	fmt.Printf("订单状态: %s\n", paymentResp.Status)
	fmt.Printf("支付金额: %.2f %s\n", paymentResp.TotalAmount, paymentResp.Currency)
	fmt.Printf("支付方式: %s\n", paymentResp.PaymentMethod)
	fmt.Printf("二维码URL: %s\n", paymentResp.QRCodeURL)
	fmt.Printf("支付URL: %s\n", paymentResp.PaymentURL)
	
	// 查询支付状态
	queryReq := autopay.PaymentQueryRequest{
		OutTradeNo: paymentResp.OutTradeNo,
	}
	
	queryResp, err := client.Payments().Query(ctx, &queryReq)
	if err != nil {
		log.Printf("支付查询失败: %v", err)
		return
	}
	
	fmt.Printf("查询状态: %s\n", queryResp.Status)
	if queryResp.IsPaid() {
		fmt.Println("✅ 支付成功!")
	} else if queryResp.IsFailed() {
		fmt.Println("❌ 支付失败!")
	}
}

// 批量支付示例
func batchPaymentExample(client *autopay.Client) {
	fmt.Println("\n=== 批量支付示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	
	// 创建批量支付请求
	var paymentRequests []autopay.PaymentRequest
	
	for i := 1; i <= 5; i++ {
		orderID := fmt.Sprintf("batch_order_%d_%d", time.Now().Unix(), i)
		paymentReq := autopay.PaymentRequest{
			OutTradeNo:    orderID,
			TotalAmount:   50.0 + float64(i)*10,
			Currency:      autopay.CurrencyCNY,
			Subject:       fmt.Sprintf("批量测试订单 %d", i),
			Body:          "批量支付测试",
			PaymentMethod: autopay.MethodWeChat,
			NotifyURL:     "https://your-domain.com/webhook/batch_payment",
			ReturnURL:     "https://your-domain.com/return",
			Timeout:       15 * time.Minute,
			AttachData: map[string]interface{}{
				"batch_id":   fmt.Sprintf("batch_%d", time.Now().Unix()),
				"batch_size": 5,
				"index":      i,
			},
		}
		paymentRequests = append(paymentRequests, paymentReq)
	}
	
	// 执行批量支付
	batchResp, err := client.Payments().BatchCreate(ctx, paymentRequests, 3) // 最大并发数3
	if err != nil {
		log.Printf("批量支付失败: %v", err)
		return
	}
	
	fmt.Printf("批量ID: %s\n", batchResp.BatchID)
	fmt.Printf("总订单数: %d\n", batchResp.TotalCount)
	fmt.Printf("成功数量: %d\n", batchResp.SuccessCount)
	fmt.Printf("失败数量: %d\n", batchResp.FailedCount)
	fmt.Printf("处理耗时: %v\n", batchResp.Duration)
	fmt.Printf("批处理状态: %s\n", batchResp.Status)
	
	// 显示成功的支付
	if len(batchResp.GetSuccessResults()) > 0 {
		fmt.Println("\n成功支付的订单:")
		for i, result := range batchResp.GetSuccessResults() {
			fmt.Printf("  %d. %s - %.2f %s (%s)\n", 
				i+1, result.OutTradeNo, result.TotalAmount, result.Currency, result.Status)
		}
	}
	
	// 显示失败的支付
	if len(batchResp.GetFailedResults()) > 0 {
		fmt.Println("\n失败的支付:")
		for i, result := range batchResp.GetFailedResults() {
			fmt.Printf("  %d. %s - 错误: %v\n", 
				i+1, result.OutTradeNo, result.Errors)
		}
	}
}

// 单笔退款示例
func singleRefundExample(client *autopay.Client) {
	fmt.Println("\n=== 单笔退款示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// 创建退款请求
	refundReq := autopay.RefundRequest{
		OutTradeNo:   "order_1640995200", // 假设的订单号
		RefundAmount: 50.00,
		Currency:     autopay.CurrencyCNY,
		RefundReason: "商品质量问题",
		BatchNo:      fmt.Sprintf("refund_%d", time.Now().Unix()),
		NotifyURL:    "https://your-domain.com/webhook/refund",
		AttachData: map[string]interface{}{
			"user_id":    "123456",
			"refund_type": "partial",
			"images":     []string{"img1.jpg", "img2.jpg"},
		},
		Metadata: map[string]string{
			"reason_category": "quality",
			"urgency":        "normal",
		},
	}
	
	// 创建退款
	refundResp, err := client.Refunds().Create(ctx, &refundReq)
	if err != nil {
		log.Printf("退款创建失败: %v", err)
		return
	}
	
	fmt.Printf("商户订单号: %s\n", refundResp.OutTradeNo)
	fmt.Printf("退款单号: %s\n", refundResp.RefundNo)
	fmt.Printf("商户退款单号: %s\n", refundResp.OutRefundNo)
	fmt.Printf("退款状态: %s\n", refundResp.Status)
	fmt.Printf("退款金额: %.2f %s\n", refundResp.RefundAmount, refundResp.Currency)
	fmt.Printf("退款原因: %s\n", refundResp.RefundReason)
	
	if refundResp.IsSuccess() {
		fmt.Println("✅ 退款成功!")
	} else if refundResp.IsFailed() {
		fmt.Println("❌ 退款失败!")
	}
}

// 批量退款示例
func batchRefundExample(client *autopay.Client) {
	fmt.Println("\n=== 批量退款示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	
	// 创建批量退款请求
	var refundRequests []autopay.RefundRequest
	
	orders := []string{"order_1640995201", "order_1640995202", "order_1640995203"}
	
	for i, orderID := range orders {
		refundReq := autopay.RefundRequest{
			OutTradeNo:   orderID,
			RefundAmount: 25.00 + float64(i)*5,
			Currency:     autopay.CurrencyCNY,
			RefundReason: "批量退款测试",
			BatchNo:      fmt.Sprintf("batch_refund_%d_%d", time.Now().Unix(), i+1),
			NotifyURL:    "https://your-domain.com/webhook/batch_refund",
			AttachData: map[string]interface{}{
				"batch_id":   fmt.Sprintf("batch_refund_%d", time.Now().Unix()),
				"batch_size": len(orders),
				"index":      i + 1,
			},
		}
		refundRequests = append(refundRequests, refundReq)
	}
	
	// 执行批量退款
	batchResp, err := client.Refunds().BatchCreate(ctx, refundRequests, 2) // 最大并发数2
	if err != nil {
		log.Printf("批量退款失败: %v", err)
		return
	}
	
	fmt.Printf("批量ID: %s\n", batchResp.BatchID)
	fmt.Printf("总订单数: %d\n", batchResp.TotalCount)
	fmt.Printf("成功数量: %d\n", batchResp.SuccessCount)
	fmt.Printf("失败数量: %d\n", batchResp.FailedCount)
	fmt.Printf("处理耗时: %v\n", batchResp.Duration)
	fmt.Printf("批处理状态: %s\n", batchResp.Status)
}

// 渠道管理示例
func channelManagementExample(client *autopay.Client) {
	fmt.Println("\n=== 渠道管理示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// 获取活跃渠道列表
	query := autopay.ChannelQuery{
		Status:      autopay.ChannelStatusPtr(autopay.ChannelActive),
		Currency:    autopay.CurrencyPtr(autopay.CurrencyCNY),
		Page:        1,
		PageSize:    10,
		SortBy:      "success_rate",
		SortOrder:   "desc",
	}
	
	channelList, err := client.Channels().List(ctx, &query)
	if err != nil {
		log.Printf("获取渠道列表失败: %v", err)
		return
	}
	
	fmt.Printf("找到 %d 个活跃渠道:\n", len(channelList.Channels))
	for i, channel := range channelList.Channels {
		fmt.Printf("  %d. %s (%s) - 成功率: %.2f%%\n", 
			i+1, channel.Name, channel.Code, channel.SuccessRate*100)
		fmt.Printf("     支持货币: %v\n", channel.SupportedCurrencies)
		fmt.Printf("     金额范围: %.2f - %.2f\n", channel.MinAmount, channel.MaxAmount)
		fmt.Printf("     手续费: %.2f%% + %.2f\n", channel.FeeRate*100, channel.FixedFee)
		fmt.Println()
	}
	
	// 获取适合指定金额的渠道
	if len(channelList.Channels) > 0 {
		channels, err := client.Channels().GetChannelsForAmount(ctx, 100.0, autopay.CurrencyCNY)
		if err != nil {
			log.Printf("获取适合金额的渠道失败: %v", err)
			return
		}
		
		fmt.Printf("适合100元交易的渠道有 %d 个:\n", len(channels))
		for i, channel := range channels {
			fmt.Printf("  %d. %s - 手续费: %.2f\n", 
				i+1, channel.Name, channel.CalculateFee(100.0))
		}
	}
	
	// 获取渠道推荐
	recommendReq := autopay.ChannelRecommendationRequest{
		Amount:        200.0,
		Currency:      autopay.CurrencyCNY,
		PaymentMethod: autopay.MethodAlipay,
		CustomerRegion: "CN",
		BusinessType:  "e-commerce",
		Priority:      []string{"cost", "success_rate", "speed"},
	}
	
	recommendation, err := client.Channels().Recommend(ctx, &recommendReq)
	if err != nil {
		log.Printf("获取渠道推荐失败: %v", err)
		return
	}
	
	fmt.Printf("\n推荐分数: %.2f\n", recommendation.Score)
	fmt.Printf("推荐原因: %v\n", recommendation.Reasons)
	fmt.Printf("风险级别: %s\n", recommendation.RiskLevel)
	fmt.Printf("预估延迟: %v\n", recommendation.EstimatedDelay)
	fmt.Printf("预估费用: %.2f\n", recommendation.EstimatedFee)
	
	if len(recommendation.Channels) > 0 {
		fmt.Printf("推荐渠道: %s\n", recommendation.Channels[0].Name)
	}
}

// 统计信息示例
func statisticsExample(client *autopay.Client) {
	fmt.Println("\n=== 统计信息示例 ===")
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	// 获取支付统计
	startDate := time.Now().AddDate(0, 0, -7) // 7天前
	endDate := time.Now()
	
	paymentStatsReq := autopay.PaymentStatisticsRequest{
		StartDate: startDate,
		EndDate:   endDate,
		GroupBy:   "day",
		Filters: map[string]interface{}{
			"currency": autopay.CurrencyCNY,
		},
	}
	
	paymentStats, err := client.Payments().Statistics(ctx, &paymentStatsReq)
	if err != nil {
		log.Printf("获取支付统计失败: %v", err)
		return
	}
	
	fmt.Printf("支付统计 (7天内):\n")
	fmt.Printf("  总订单数: %d\n", paymentStats.TotalCount)
	fmt.Printf("  总金额: %.2f\n", paymentStats.TotalAmount)
	fmt.Printf("  成功订单: %d\n", paymentStats.SuccessCount)
	fmt.Printf("  成功金额: %.2f\n", paymentStats.SuccessAmount)
	fmt.Printf("  失败订单: %d\n", paymentStats.FailedCount)
	fmt.Printf("  失败金额: %.2f\n", paymentStats.FailedAmount)
	fmt.Printf("  平均金额: %.2f\n", paymentStats.AverageAmount)
	fmt.Printf("  退款订单: %d\n", paymentStats.RefundCount)
	fmt.Printf("  退款金额: %.2f\n", paymentStats.RefundAmount)
	fmt.Printf("  查询耗时: %v\n", paymentStats.QueryTime)
	
	// 获取退款统计
	refundStatsReq := autopay.RefundStatisticsRequest{
		StartDate: startDate,
		EndDate:   endDate,
		GroupBy:   "day",
	}
	
	refundStats, err := client.Refunds().Statistics(ctx, &refundStatsReq)
	if err != nil {
		log.Printf("获取退款统计失败: %v", err)
		return
	}
	
	fmt.Printf("\n退款统计 (7天内):\n")
	fmt.Printf("  总退款单: %d\n", refundStats.TotalCount)
	fmt.Printf("  总退款金额: %.2f\n", refundStats.TotalAmount)
	fmt.Printf("  成功退款: %d\n", refundStats.SuccessCount)
	fmt.Printf("  成功退款金额: %.2f\n", refundStats.SuccessAmount)
	fmt.Printf("  失败退款: %d\n", refundStats.FailedCount)
	fmt.Printf("  失败退款金额: %.2f\n", refundStats.FailedAmount)
	fmt.Printf("  部分退款: %d\n", refundStats.PartialCount)
	fmt.Printf("  部分退款金额: %.2f\n", refundStats.PartialAmount)
	fmt.Printf("  平均退款金额: %.2f\n", refundStats.AverageRefundAmount)
	fmt.Printf("  查询耗时: %v\n", refundStats.QueryTime)
}

// 主函数
func main() {
	fmt.Println("=== AutoPay Go SDK 完整示例 ===")
	fmt.Println("注意: 这是一个演示示例，实际使用时请替换为真实的API密钥")
	
	// 创建客户端
	// 注意: 实际使用时请替换为真实的API密钥
	config := autopay.NewConfig("your_api_key_here", "your_secret_key_here", autopay.EnvironmentSandbox)
	
	client, err := autopay.NewClient(config)
	if err != nil {
		log.Fatalf("创建客户端失败: %v", err)
	}
	defer client.Close()
	
	fmt.Printf("客户端创建成功 - 环境: %s, 基础URL: %s\n", 
		client.GetConfig().Environment, client.GetConfig().BaseURL)
	
	// 运行各种示例
	healthCheckExample(client)
	singlePaymentExample(client)
	batchPaymentExample(client)
	singleRefundExample(client)
	batchRefundExample(client)
	channelManagementExample(client)
	statisticsExample(client)
	
	fmt.Println("\n=== 示例运行完成 ===")
	fmt.Println("注意: 实际使用时，请确保替换为真实的API密钥和服务器地址")
}