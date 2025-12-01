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

// RefundService 退款服务
type RefundService struct {
	client      *http.Client
	baseURL     string
	apiKey      string
	logger      Logger
	rateLimiter *rate.Limiter
}

// NewRefundService 创建退款服务
func NewRefundService(client *http.Client, baseURL, apiKey string, logger Logger, rateLimiter *rate.Limiter) *RefundService {
	return &RefundService{
		client:      client,
		baseURL:     baseURL,
		apiKey:      apiKey,
		logger:      logger,
		rateLimiter: rateLimiter,
	}
}

// Create 创建退款
func (s *RefundService) Create(ctx context.Context, req *RefundRequest) (*RefundResponse, error) {
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("退款请求验证失败: %w", err)
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 设置默认值
	if req.Timeout == 0 {
		req.Timeout = 10 * time.Minute
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/refunds", s.baseURL)

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
	var refundResp RefundResponse
	if err := json.NewDecoder(resp.Body).Decode(&refundResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &refundResp, fmt.Errorf("HTTP %d: %v", resp.StatusCode, refundResp.Errors)
	}

	s.logger.Info("退款创建成功", "out_trade_no", req.OutTradeNo, "refund_amount", req.RefundAmount, "duration", duration)
	return &refundResp, nil
}

// Query 查询退款
func (s *RefundService) Query(ctx context.Context, req *RefundQueryRequest) (*RefundQueryResponse, error) {
	if req.OutTradeNo == "" && req.TradeNo == "" && req.OutRefundNo == "" && req.RefundNo == "" {
		return nil, fmt.Errorf("至少需要提供一个查询参数")
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/refunds/query", s.baseURL)
	queryParams := make(map[string]string)
	if req.OutTradeNo != "" {
		queryParams["out_trade_no"] = req.OutTradeNo
	}
	if req.TradeNo != "" {
		queryParams["trade_no"] = req.TradeNo
	}
	if req.OutRefundNo != "" {
		queryParams["out_refund_no"] = req.OutRefundNo
	}
	if req.RefundNo != "" {
		queryParams["refund_no"] = req.RefundNo
	}

	// 添加查询参数
	first := true
	for key, value := range queryParams {
		if first {
			url += "?" + key + "=" + value
			first = false
		} else {
			url += "&" + key + "=" + value
		}
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
	var refundResp RefundQueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&refundResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	refundResp.QueryTime = time.Now()

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &refundResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("退款查询成功", "out_trade_no", req.OutTradeNo, "trade_no", req.TradeNo, "duration", duration)
	return &refundResp, nil
}

// Cancel 取消退款
func (s *RefundService) Cancel(ctx context.Context, req *RefundCancelRequest) (*RefundCancelResponse, error) {
	if req.OutRefundNo == "" && req.RefundNo == "" {
		return nil, fmt.Errorf("商户退款单号和退款单号至少填写一个")
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/refunds/cancel", s.baseURL)

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
	var cancelResp RefundCancelResponse
	if err := json.NewDecoder(resp.Body).Decode(&cancelResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &cancelResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("退款取消成功", "out_refund_no", req.OutRefundNo, "refund_no", req.RefundNo, "duration", duration)
	return &cancelResp, nil
}

// BatchCreate 批量创建退款
func (s *RefundService) BatchCreate(ctx context.Context, requests []RefundRequest, maxWorkers int) (*RefundBatchResponse, error) {
	if len(requests) == 0 {
		return nil, fmt.Errorf("退款请求列表不能为空")
	}

	if maxWorkers <= 0 {
		maxWorkers = 10
	}

	// 生成批量ID
	batchID := fmt.Sprintf("batch_%d", time.Now().UnixNano())

	// 创建工作池
	workerPool := make(chan struct{}, maxWorkers)
	results := make(chan RefundResponse, len(requests))
	errors := make(chan error, len(requests))
	var wg sync.WaitGroup

	startTime := time.Now()

	// 启动工作协程
	for i, req := range requests {
		wg.Add(1)
		go func(index int, refundReq RefundRequest) {
			defer wg.Done()
			workerPool <- struct{}{}
			defer func() { <-workerPool }()

			// 验证请求
			if err := refundReq.Validate(); err != nil {
				errors <- fmt.Errorf("请求 %d 验证失败: %w", index, err)
				return
			}

			// 创建退款
			resp, err := s.Create(ctx, &refundReq)
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
	var successfulResults []RefundResponse
	var allErrors []string

	for result := range results {
		successfulResults = append(successfulResults, result)
	}

	for err := range errors {
		allErrors = append(allErrors, err.Error())
	}

	// 构建批处理响应
	duration := time.Since(startTime)
	response := &RefundBatchResponse{
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

	s.logger.Info("批量退款处理完成", "batch_id", batchID, "total", len(requests), "success", len(successfulResults), "failed", len(allErrors), "duration", duration)
	return response, nil
}

// Statistics 获取退款统计
func (s *RefundService) Statistics(ctx context.Context, req *RefundStatisticsRequest) (*RefundStatisticsResponse, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/refunds/statistics", s.baseURL)
	
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
	var statsResp RefundStatisticsResponse
	if err := json.NewDecoder(resp.Body).Decode(&statsResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	statsResp.QueryTime = duration

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &statsResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("退款统计获取成功", "start_date", req.StartDate, "end_date", req.EndDate, "duration", duration)
	return &statsResp, nil
}

// setHeaders 设置请求头
func (s *RefundService) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("User-Agent", "autopay-go-sdk/1.0.0")
}