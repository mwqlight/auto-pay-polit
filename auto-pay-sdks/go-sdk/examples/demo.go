package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func main() {
	fmt.Println("=== AutoPay Go SDK 示例 ===")

	// 1. 创建客户端配置
	config := &Config{
		APIKey:        "your_api_key_here",
		Environment:   EnvironmentSandbox,
		Timeout:       30 * time.Second,
		MaxWorkers:    10,
		RateLimit:     100,
		RateBurst:     20,
		EnableLogging: true,
		LogLevel:      "info",
	}

	// 2. 创建客户端
	client, err := NewClient(config)
	if err != nil {
		fmt.Printf("创建客户端失败: %v\n", err)
		return
	}
	defer client.Close()

	fmt.Printf("✅ 客户端创建成功: %s\n", config.BaseURL)

	// 3. 执行健康检查
	health, err := client.HealthCheck(context.Background())
	if err != nil {
		fmt.Printf("❌ 健康检查失败: %v\n", err)
	} else {
		fmt.Printf("✅ 健康检查成功: %+v\n", health)
	}

	fmt.Println("\n=== 支付功能演示 ===")

	// 4. 创建单笔支付
	paymentReq := &PaymentRequest{
		Amount:      1000,
		Currency:    CurrencyCNY,
		Method:      "alipay",
		OrderNo:     "ORDER_" + uuid.New().String()[:8],
		Description: "测试支付订单",
		CallbackURL: "https://your-domain.com/callback",
		ReturnURL:   "https://your-domain.com/return",
		Metadata: map[string]interface{}{
			"user_id": "12345",
			"source":  "mobile_app",
		},
	}

	paymentResp, err := client.Payments().Create(context.Background(), paymentReq)
	if err != nil {
		fmt.Printf("❌ 创建支付失败: %v\n", err)
	} else {
		fmt.Printf("✅ 支付创建成功: %+v\n", paymentResp)
	}

	// 5. 查询支付状态
	if paymentResp != nil {
		paymentDetail, err := client.Payments().Get(context.Background(), paymentResp.PaymentNo)
		if err != nil {
			fmt.Printf("❌ 查询支付失败: %v\n", err)
		} else {
			fmt.Printf("✅ 支付详情查询成功: %+v\n", paymentDetail)
		}
	}

	// 6. 批量支付演示
	fmt.Println("\n=== 批量支付演示 ===")
	batchPayments := make([]PaymentRequest, 5)
	for i := 0; i < 5; i++ {
		batchPayments[i] = PaymentRequest{
			Amount:      500 + i*100,
			Currency:    CurrencyCNY,
			Method:      "wechat",
			OrderNo:     "BATCH_" + uuid.New().String()[:8],
			Description: fmt.Sprintf("批量支付测试 %d", i+1),
			CallbackURL: "https://your-domain.com/callback",
			ReturnURL:   "https://your-domain.com/return",
		}
	}

	batchResults, err := client.Payments().BatchCreate(context.Background(), batchPayments, 3)
	if err != nil {
		fmt.Printf("❌ 批量支付失败: %v\n", err)
	} else {
		fmt.Printf("✅ 批量支付成功: %d 笔\n", len(batchResults))
		for i, result := range batchResults {
			if result != nil {
				fmt.Printf("  支付 %d: %s (状态: %s)\n", i+1, result.PaymentNo, result.Status)
			}
		}
	}

	fmt.Println("\n=== 退款功能演示 ===")

	// 7. 创建退款
	refundReq := &RefundRequest{
		Amount:          500,
		Currency:        CurrencyCNY,
		OrderNo:         "REFUND_" + uuid.New().String()[:8],
		OriginalOrderNo: paymentReq.OrderNo,
		Description:     "测试退款申请",
		CallbackURL:     "https://your-domain.com/refund-callback",
		Metadata: map[string]interface{}{
			"refund_reason": "用户申请",
			"admin_id":      "admin_001",
		},
	}

	refundResp, err := client.Refunds().Create(context.Background(), refundReq)
	if err != nil {
		fmt.Printf("❌ 创建退款失败: %v\n", err)
	} else {
		fmt.Printf("✅ 退款创建成功: %+v\n", refundResp)
	}

	// 8. 查询退款状态
	if refundResp != nil {
		refundDetail, err := client.Refunds().Get(context.Background(), refundResp.RefundNo)
		if err != nil {
			fmt.Printf("❌ 查询退款失败: %v\n", err)
		} else {
			fmt.Printf("✅ 退款详情查询成功: %+v\n", refundDetail)
		}
	}

	// 9. 批量退款演示
	fmt.Println("\n=== 批量退款演示 ===")
	batchRefunds := make([]RefundRequest, 3)
	for i := 0; i < 3; i++ {
		batchRefunds[i] = RefundRequest{
			Amount:          200 + i*50,
			Currency:        CurrencyCNY,
			OrderNo:         "BATCH_REF_" + uuid.New().String()[:8],
			OriginalOrderNo: batchPayments[i].OrderNo,
			Description:     fmt.Sprintf("批量退款测试 %d", i+1),
			CallbackURL:     "https://your-domain.com/refund-callback",
		}
	}

	batchRefundResults, err := client.Refunds().BatchCreate(context.Background(), batchRefunds, 2)
	if err != nil {
		fmt.Printf("❌ 批量退款失败: %v\n", err)
	} else {
		fmt.Printf("✅ 批量退款成功: %d 笔\n", len(batchRefundResults))
		for i, result := range batchRefundResults {
			if result != nil {
				fmt.Printf("  退款 %d: %s (状态: %s)\n", i+1, result.RefundNo, result.Status)
			}
		}
	}

	fmt.Println("\n=== 渠道管理演示 ===")

	// 10. 获取所有渠道
	channels, err := client.Channels().GetChannels(context.Background())
	if err != nil {
		fmt.Printf("❌ 获取渠道失败: %v\n", err)
	} else {
		fmt.Printf("✅ 渠道列表获取成功: %d 个\n", len(channels))
		for _, channel := range channels {
			status := "启用"
			if !channel.Enabled {
				status = "禁用"
			}
			fmt.Printf("  渠道: %s (%s) - 状态: %s\n", channel.Name, channel.Description, status)
		}
	}

	// 11. 获取已启用的渠道
	enabledChannels, err := client.Channels().GetEnabledChannels(context.Background())
	if err != nil {
		fmt.Printf("❌ 获取已启用渠道失败: %v\n", err)
	} else {
		fmt.Printf("✅ 已启用渠道: %d 个\n", len(enabledChannels))
		for _, channel := range enabledChannels {
			fmt.Printf("  已启用渠道: %s (%s)\n", channel.Name, channel.Description)
		}
	}

	// 12. 根据支付方式获取渠道
	alipayChannels, err := client.Channels().GetChannelsByMethod(context.Background(), "alipay")
	if err != nil {
		fmt.Printf("❌ 根据支付方式获取渠道失败: %v\n", err)
	} else {
		fmt.Printf("✅ 支付宝渠道: %d 个\n", len(alipayChannels))
		for _, channel := range alipayChannels {
			fmt.Printf("  支付宝渠道: %s\n", channel.Name)
		}
	}

	fmt.Println("\n=== 列表查询演示 ===")

	// 13. 获取支付列表
	payments, err := client.Payments().List(context.Background(), 1, 10)
	if err != nil {
		fmt.Printf("❌ 获取支付列表失败: %v\n", err)
	} else {
		fmt.Printf("✅ 支付列表获取成功: %d 笔\n", len(payments))
		for i, payment := range payments {
			fmt.Printf("  支付 %d: %s - %s (%d %s)\n", 
				i+1, payment.PaymentNo, payment.Status, payment.Amount, payment.Currency)
		}
	}

	// 14. 获取退款列表
	refunds, err := client.Refunds().List(context.Background(), 1, 10)
	if err != nil {
		fmt.Printf("❌ 获取退款列表失败: %v\n", err)
	} else {
		fmt.Printf("✅ 退款列表获取成功: %d 笔\n", len(refunds))
		for i, refund := range refunds {
			fmt.Printf("  退款 %d: %s - %s (%d %s)\n", 
				i+1, refund.RefundNo, refund.Status, refund.Amount, refund.Currency)
		}
	}

	// 15. 打印统计信息
	stats := client.GetStats()
	fmt.Printf("\n=== 客户端统计信息 ===\n")
	fmt.Printf("请求总数: %d\n", stats.RequestCount)
	fmt.Printf("成功总数: %d\n", stats.SuccessCount)
	fmt.Printf("错误总数: %d\n", stats.ErrorCount)
	fmt.Printf("重试总数: %d\n", stats.RetryCount)
	fmt.Printf("活跃请求: %d\n", stats.ActiveRequests)

	fmt.Println("\n=== 示例演示完成 ===")
	fmt.Println("🎉 AutoPay Go SDK 所有功能演示完成！")
}