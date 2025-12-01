package autopay

import "time"

// ErrorResponse 错误响应
type ErrorResponse struct {
	Code      string            `json:"code"`                // 错误代码
	Message   string            `json:"message"`             // 错误消息
	Details   map[string]interface{} `json:"details"`        // 详细信息
	RequestID string            `json:"request_id"`          // 请求ID
	Timestamp time.Time         `json:"timestamp"`           // 时间戳
	Help      string            `json:"help,omitempty"`      // 帮助信息
}

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status     string           `json:"status"`              // 状态
	Version    string           `json:"version"`             // 版本
	Uptime     time.Duration    `json:"uptime"`              // 运行时间
	Timestamp  time.Time        `json:"timestamp"`           // 时间戳
	Services   map[string]string `json:"services,omitempty"` // 依赖服务状态
	Database   string           `json:"database,omitempty"`  // 数据库状态
	Redis      string           `json:"redis,omitempty"`     // Redis状态
	MessageBus string           `json:"message_bus,omitempty"` // 消息队列状态
}

// Pagination 分页信息
type Pagination struct {
	Page     int64 `json:"page"`      // 当前页码
	PageSize int64 `json:"page_size"` // 每页数量
	Total    int64 `json:"total"`     // 总数量
	HasMore  bool  `json:"has_more"`  // 是否有更多
}

// ListResponse 列表响应
type ListResponse struct {
	Items     []interface{} `json:"items"`               // 列表项
	Pagination Pagination   `json:"pagination"`          // 分页信息
	QueryTime time.Duration `json:"query_time"`          // 查询时间
}

// BatchResponse 批处理响应
type BatchResponse struct {
	BatchID       string        `json:"batch_id"`        // 批处理ID
	TotalCount    int           `json:"total_count"`     // 总数量
	SuccessCount  int           `json:"success_count"`   // 成功数量
	FailedCount   int           `json:"failed_count"`    // 失败数量
	Status        string        `json:"status"`          // 批处理状态
	SubmitTime    time.Time     `json:"submit_time"`     // 提交时间
	ProcessTime   time.Time     `json:"process_time"`    // 处理时间
	EndTime       *time.Time    `json:"end_time"`        // 完成时间
	Duration      time.Duration `json:"duration"`        // 处理耗时
	Errors        []string      `json:"errors"`          // 错误信息
	Warnings      []string      `json:"warnings"`        // 警告信息
}

// CommonResponse 通用响应
type CommonResponse struct {
	Code    int         `json:"code"`     // 状态码
	Message string      `json:"message"`  // 消息
	Data    interface{} `json:"data"`     // 数据
	Success bool        `json:"success"`  // 是否成功
}

// CommonListResponse 通用列表响应
type CommonListResponse struct {
	Code    int           `json:"code"`     // 状态码
	Message string        `json:"message"`  // 消息
	Data    []interface{} `json:"data"`     // 数据
	Success bool          `json:"success"`  // 是否成功
	Pagination Pagination `json:"pagination"` // 分页信息
}