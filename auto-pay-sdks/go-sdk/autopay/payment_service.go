package autopay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
	
	"golang.org/x/time/rate"
)

// PaymentService 支付服务
type PaymentService struct {
	client      *http.Client
	baseURL     string
	apiKey      string
	logger      Logger
	rateLimiter *rate.Limiter
}

// NewPaymentService 创建支付服务
func NewPaymentService(client *http.Client, baseURL, apiKey string, logger Logger, rateLimiter *rate.Limiter) *PaymentService {
	return &PaymentService{
		client:      client,
		baseURL:     baseURL,
		apiKey:      apiKey,
		logger:      logger,
		rateLimiter: rateLimiter,
	}
}

// Create 创建支付
func (s *PaymentService) Create(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error) {
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("支付请求验证失败: %w", err)
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 设置默认值
	if req.Timeout == 0 {
		req.Timeout = 15 * time.Minute
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/payments", s.baseURL)

	// 构建请求体
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("JSON序列化失败: %w", err)
	}

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("创建HTTP请求失败: %w", err)
	}

	// 设置请求头
	s.setHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	// 发送请求
	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	duration := time.Since(startTime)

	if err != nil {
		s.logger.Error("HTTP请求失败", "error", err.Error(), "duration", duration)
		return nil, fmt.Errorf("HTTP请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var paymentResp PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&paymentResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &paymentResp, fmt.Errorf("HTTP %d: %v", resp.StatusCode, paymentResp.Errors)
	}

	s.logger.Info("支付创建成功", "out_trade_no", req.OutTradeNo, "amount", req.TotalAmount, "duration", duration)
	return &paymentResp, nil
}

// Query 查询支付
func (s *PaymentService) Query(ctx context.Context, req *PaymentQueryRequest) (*PaymentQueryResponse, error) {
	if req.OutTradeNo == "" && req.TradeNo == "" {
		return nil, fmt.Errorf("商户订单号和平台订单号至少填写一个")
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/payments/query", s.baseURL)
	if req.OutTradeNo != "" {
		url += "?out_trade_no=" + req.OutTradeNo
	} else {
		url += "?trade_no=" + req.TradeNo
	}

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建HTTP请求失败: %w", err)
	}

	// 设置请求头
	s.setHeaders(httpReq)

	// 发送请求
	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	duration := time.Since(startTime)

	if err != nil {
		s.logger.Error("HTTP请求失败", "error", err.Error(), "duration", duration)
		return nil, fmt.Errorf("HTTP请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var paymentResp PaymentQueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&paymentResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	paymentResp.QueryTime = time.Now()

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &paymentResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("支付查询成功", "out_trade_no", req.OutTradeNo, "trade_no", req.TradeNo, "duration", duration)
	return &paymentResp, nil
}

// Cancel 取消支付
func (s *PaymentService) Cancel(ctx context.Context, req *PaymentCancelRequest) (*PaymentCancelResponse, error) {
	if req.OutTradeNo == "" && req.TradeNo == "" {
		return nil, fmt.Errorf("商户订单号和平台订单号至少填写一个")
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/payments/cancel", s.baseURL)

	// 构建请求体
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("JSON序列化失败: %w", err)
	}

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("创建HTTP请求失败: %w", err)
	}

	// 设置请求头
	s.setHeaders(httpReq)

	// 发送请求
	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	duration := time.Since(startTime)

	if err != nil {
		s.logger.Error("HTTP请求失败", "error", err.Error(), "duration", duration)
		return nil, fmt.Errorf("HTTP请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var cancelResp PaymentCancelResponse
	if err := json.NewDecoder(resp.Body).Decode(&cancelResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &cancelResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("支付取消成功", "out_trade_no", req.OutTradeNo, "trade_no", req.TradeNo, "duration", duration)
	return &cancelResp, nil
}

// BatchCreate 批量创建支付
func (s *PaymentService) BatchCreate(ctx context.Context, requests []PaymentRequest, maxWorkers int) (*PaymentBatchResponse, error) {
	if len(requests) == 0 {
		return nil, fmt.Errorf("支付请求列表不能为空")
	}

	if maxWorkers <= 0 {
		maxWorkers = 10
	}

	// 生成批量ID
	batchID := fmt.Sprintf("batch_%d", time.Now().UnixNano())

	// 创建批处理请求
	_ = PaymentBatchRequest{
		Requests:  requests,
		BatchID:   batchID,
	}

	// 创建工作池
	workerPool := make(chan struct{}, maxWorkers)
	results := make(chan PaymentResponse, len(requests))
	errors := make(chan error, len(requests))
	var wg sync.WaitGroup

	startTime := time.Now()

	// 启动工作协程
	for i, req := range requests {
		wg.Add(1)
		go func(index int, paymentReq PaymentRequest) {
			defer wg.Done()
			workerPool <- struct{}{}
			defer func() { <-workerPool }()

			// 验证请求
			if err := paymentReq.Validate(); err != nil {
				errors <- fmt.Errorf("请求 %d 验证失败: %w", index, err)
				return
			}

			// 创建支付
			resp, err := s.Create(ctx, &paymentReq)
			if err != nil {
				errors <- fmt.Errorf("请求 %d 创建失败: %w", index, err)
				return
			}

			results <- *resp
		}(i, req)
	}

	// 等待所有工作协程完成
	go func() {
		wg.Wait()
		close(results)
		close(errors)
	}()

	// 收集结果
	var successfulResults []PaymentResponse
	var allErrors []string

	for result := range results {
		successfulResults = append(successfulResults, result)
	}

	for err := range errors {
		allErrors = append(allErrors, err.Error())
	}

	// 构建批处理响应
	duration := time.Since(startTime)
	response := &PaymentBatchResponse{
		BatchID:        batchID,
		TotalCount:     len(requests),
		SuccessCount:   len(successfulResults),
		FailedCount:    len(allErrors),
		ProcessingCount: 0,
		Results:        successfulResults,
		Status:         "COMPLETED",
		SubmitTime:     time.Now(),
		ProcessTime:    time.Now(),
		Duration:       duration,
		Errors:         allErrors,
	}

	s.logger.Info("批量支付处理完成", "batch_id", batchID, "total", len(requests), "success", len(successfulResults), "failed", len(allErrors), "duration", duration)
	return response, nil
}

// Statistics 获取支付统计
func (s *PaymentService) Statistics(ctx context.Context, req *PaymentStatisticsRequest) (*PaymentStatisticsResponse, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/payments/statistics", s.baseURL)
	
	// 添加查询参数
	queryParams := []string{}
	if req.StartDate.IsZero() {
		return nil, fmt.Errorf("开始日期不能为空")
	}
	if req.EndDate.IsZero() {
		return nil, fmt.Errorf("结束日期不能为空")
	}
	
	queryParams = append(queryParams, fmt.Sprintf("start_date=%s", req.StartDate.Format("2006-01-02T15:04:05Z")))
	queryParams = append(queryParams, fmt.Sprintf("end_date=%s", req.EndDate.Format("2006-01-02T15:04:05Z")))
	
	if req.GroupBy != "" {
		queryParams = append(queryParams, fmt.Sprintf("group_by=%s", req.GroupBy))
	}
	
	if len(queryParams) > 0 {
		url += "?" + strings.Join(queryParams, "&")
	}

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建HTTP请求失败: %w", err)
	}

	// 设置请求头
	s.setHeaders(httpReq)

	// 发送请求
	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	duration := time.Since(startTime)

	if err != nil {
		s.logger.Error("HTTP请求失败", "error", err.Error(), "duration", duration)
		return nil, fmt.Errorf("HTTP请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var statsResp PaymentStatisticsResponse
	if err := json.NewDecoder(resp.Body).Decode(&statsResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	statsResp.QueryTime = duration

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &statsResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("支付统计获取成功", "start_date", req.StartDate, "end_date", req.EndDate, "duration", duration)
	return &statsResp, nil
}

// setHeaders 设置请求头
func (s *PaymentService) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("User-Agent", "autopay-go-sdk/1.0.0")
}