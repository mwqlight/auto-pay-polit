package autopay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	
	"golang.org/x/time/rate"
)

// ChannelService 渠道服务
type ChannelService struct {
	client      *http.Client
	baseURL     string
	apiKey      string
	logger      Logger
	rateLimiter *rate.Limiter
}

// NewChannelService 创建渠道服务
func NewChannelService(client *http.Client, baseURL, apiKey string, logger Logger, rateLimiter *rate.Limiter) *ChannelService {
	return &ChannelService{
		client:      client,
		baseURL:     baseURL,
		apiKey:      apiKey,
		logger:      logger,
		rateLimiter: rateLimiter,
	}
}

// List 获取渠道列表
func (s *ChannelService) List(ctx context.Context, query *ChannelQuery) (*ChannelListResponse, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels", s.baseURL)

	// 添加查询参数
	if query != nil {
		params := make(map[string]string)
		if query.Status != nil {
			params["status"] = string(*query.Status)
		}
		if query.Currency != nil {
			params["currency"] = string(*query.Currency)
		}
		if query.MinAmount != nil {
			params["min_amount"] = fmt.Sprintf("%f", *query.MinAmount)
		}
		if query.MaxAmount != nil {
			params["max_amount"] = fmt.Sprintf("%f", *query.MaxAmount)
		}
		if query.SuccessRate != nil {
			params["success_rate"] = fmt.Sprintf("%f", *query.SuccessRate)
		}
		if query.Query != "" {
			params["query"] = query.Query
		}
		if query.SortBy != "" {
			params["sort_by"] = query.SortBy
		}
		if query.SortOrder != "" {
			params["sort_order"] = query.SortOrder
		}
		if query.Page > 0 {
			params["page"] = fmt.Sprintf("%d", query.Page)
		}
		if query.PageSize > 0 {
			params["page_size"] = fmt.Sprintf("%d", query.PageSize)
		}

		// 添加查询参数到URL
		first := true
		for key, value := range params {
			if first {
				url += "?" + key + "=" + value
				first = false
			} else {
				url += "&" + key + "=" + value
			}
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
	var channelListResp ChannelListResponse
	if err := json.NewDecoder(resp.Body).Decode(&channelListResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	channelListResp.QueryTime = duration

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &channelListResp, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("渠道列表获取成功", "count", len(channelListResp.Channels), "duration", duration)
	return &channelListResp, nil
}

// Get 获取指定渠道信息
func (s *ChannelService) Get(ctx context.Context, code ChannelCode) (*Channel, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/%s", s.baseURL, code)

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
	var channel Channel
	if err := json.NewDecoder(resp.Body).Decode(&channel); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &channel, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("渠道信息获取成功", "code", code, "name", channel.Name, "duration", duration)
	return &channel, nil
}

// GetActiveChannels 获取活跃渠道
func (s *ChannelService) GetActiveChannels(ctx context.Context, currency Currency) ([]Channel, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/active", s.baseURL)
	if currency != "" {
		url += "?currency=" + string(currency)
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
	var channels []Channel
	if err := json.NewDecoder(resp.Body).Decode(&channels); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return channels, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("活跃渠道获取成功", "count", len(channels), "currency", currency, "duration", duration)
	return channels, nil
}

// GetChannelsForAmount 获取适合指定金额的渠道
func (s *ChannelService) GetChannelsForAmount(ctx context.Context, amount float64, currency Currency) ([]Channel, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/amount/%f", s.baseURL, amount)
	if currency != "" {
		url += "?currency=" + string(currency)
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
	var channels []Channel
	if err := json.NewDecoder(resp.Body).Decode(&channels); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return channels, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("适合金额的渠道获取成功", "amount", amount, "currency", currency, "count", len(channels), "duration", duration)
	return channels, nil
}

// Recommend 推荐渠道
func (s *ChannelService) Recommend(ctx context.Context, req *ChannelRecommendationRequest) (*ChannelRecommendation, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/recommend", s.baseURL)

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
	var recommendation ChannelRecommendation
	if err := json.NewDecoder(resp.Body).Decode(&recommendation); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &recommendation, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("渠道推荐获取成功", "amount", req.Amount, "currency", req.Currency, "score", recommendation.Score, "duration", duration)
	return &recommendation, nil
}

// Compare 对比渠道
func (s *ChannelService) Compare(ctx context.Context, codes []ChannelCode, criteria []string) (*ChannelComparison, error) {
	if len(codes) == 0 {
		return nil, fmt.Errorf("渠道代码列表不能为空")
	}

	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/compare", s.baseURL)

	// 构建请求体
	type CompareRequest struct {
		Channels []ChannelCode `json:"channels"`
		Criteria []string      `json:"criteria"`
	}
	req := CompareRequest{
		Channels: codes,
		Criteria: criteria,
	}

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
	var comparison ChannelComparison
	if err := json.NewDecoder(resp.Body).Decode(&comparison); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	comparison.GeneratedAt = time.Now()

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return &comparison, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("渠道对比获取成功", "count", len(codes), "criteria", criteria, "recommended", comparison.Recommended, "duration", duration)
	return &comparison, nil
}

// Stats 获取渠道统计
func (s *ChannelService) Stats(ctx context.Context, startDate, endDate time.Time) ([]ChannelStats, error) {
	// 限流
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("限流等待失败: %w", err)
	}

	// 构建URL
	url := fmt.Sprintf("%s/v1/channels/stats", s.baseURL)
	url += fmt.Sprintf("?start_date=%s&end_date=%s", 
		startDate.Format("2006-01-02T15:04:05Z"), 
		endDate.Format("2006-01-02T15:04:05Z"))

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
	var stats []ChannelStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode >= 400 {
		return stats, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	s.logger.Info("渠道统计获取成功", "count", len(stats), "start_date", startDate, "end_date", endDate, "duration", duration)
	return stats, nil
}

// setHeaders 设置请求头
func (s *ChannelService) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("User-Agent", "autopay-go-sdk/1.0.0")
}