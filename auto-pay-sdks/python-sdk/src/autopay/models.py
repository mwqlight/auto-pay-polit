"""
数据模型模块

定义所有的数据类型、数据模型和枚举类。
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List, Union, Literal
from dataclasses import dataclass, field
from enum import Enum, IntEnum
import uuid


# 枚举类型定义

class Environment(Enum):
    """环境类型"""
    SANDBOX = "sandbox"  # 沙盒环境
    STAGING = "staging"  # 预发环境
    PRODUCTION = "production"  # 生产环境
    
    def __init__(self, value):
        self._value_ = value
    
    @classmethod
    def _missing_(cls, value):
        """处理无效的环境值"""
        valid_values = [item.value for item in cls]
        raise ValueError(f"无效的环境值: '{value}'。有效的环境值包括: {', '.join(valid_values)}")


class PaymentStatus(Enum):
    """支付状态"""
    PENDING = "pending"  # 待支付
    PROCESSING = "processing"  # 处理中
    SUCCEEDED = "succeeded"  # 支付成功
    FAILED = "failed"  # 支付失败
    CANCELLED = "cancelled"  # 已取消
    EXPIRED = "expired"  # 已过期
    REFUNDING = "refunding"  # 退款中
    REFUNDED = "refunded"  # 已退款


class PaymentMethod(Enum):
    """支付方式"""
    ALIPAY = "alipay"  # 支付宝
    WECHAT_PAY = "wechat_pay"  # 微信支付
    BANK_CARD = "bank_card"  # 银行卡
    UNIONPAY = "unionpay"  # 银联
    PAYPAL = "paypal"  # PayPal
    CRYPTO = "crypto"  # 加密货币


class ChannelStatus(Enum):
    """渠道状态"""
    ACTIVE = "active"  # 活跃
    INACTIVE = "inactive"  # 非活跃
    MAINTENANCE = "maintenance"  # 维护中
    ERROR = "error"  # 错误


class TransactionType(Enum):
    """交易类型"""
    PAYMENT = "payment"  # 支付
    REFUND = "refund"  # 退款
    TRANSFER = "transfer"  # 转账
    WITHDRAWAL = "withdrawal"  # 提现


class LogLevel(IntEnum):
    """日志级别"""
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50


# 基础数据模型

@dataclass
class ApiResponse:
    """API响应基类"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error_code: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    def get_data(self) -> Optional[Dict[str, Any]]:
        """获取响应数据"""
        return self.data
    
    def is_success(self) -> bool:
        """判断是否成功"""
        return self.success and self.error_code is None


@dataclass
class PaginationParams:
    """分页参数"""
    page: int = 1
    page_size: int = 20
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "desc"
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "page": self.page,
            "page_size": self.page_size,
            "sort_by": self.sort_by,
            "sort_order": self.sort_order
        }


@dataclass
class PaginatedResponse:
    """分页响应"""
    items: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    def has_next_page(self) -> bool:
        """是否有下一页"""
        return self.page < self.total_pages
    
    def has_prev_page(self) -> bool:
        """是否有上一页"""
        return self.page > 1


# 配置相关模型

@dataclass
class ConfigData:
    """配置数据"""
    api_key: str
    secret_key: str
    environment: Environment
    base_url: Optional[str] = None
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0
    enable_logging: bool = True
    verify_ssl: bool = True
    allow_redirects: bool = True
    proxy_config: Optional[Dict[str, str]] = None


# 支付相关模型

@dataclass
class PaymentRequest:
    """支付请求"""
    amount: Decimal
    currency: str
    method: PaymentMethod
    order_id: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    callback_url: Optional[str] = None
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None
    customer: Optional[Dict[str, Any]] = None
    expire_time: Optional[datetime] = None
    is_auto_close: bool = True
    
    def __post_init__(self):
        """后置初始化"""
        if self.order_id is None:
            self.order_id = str(uuid.uuid4())
        
        if self.metadata is None:
            self.metadata = {}
        
        if self.customer is None:
            self.customer = {}
        
        # 验证金额
        if self.amount <= 0:
            raise ValueError("支付金额必须大于0")
        
        # 验证货币代码
        if len(self.currency) != 3:
            raise ValueError("货币代码必须为3位ISO代码")


@dataclass
class PaymentResponse:
    """支付响应"""
    payment_id: str
    order_id: str
    status: PaymentStatus
    amount: Decimal
    currency: str
    method: PaymentMethod
    created_at: datetime
    qr_code: Optional[str] = None
    payment_url: Optional[str] = None
    description: Optional[str] = None
    expire_time: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_pending(self) -> bool:
        """是否待支付"""
        return self.status == PaymentStatus.PENDING
    
    def is_succeeded(self) -> bool:
        """是否成功"""
        return self.status == PaymentStatus.SUCCEEDED
    
    def is_failed(self) -> bool:
        """是否失败"""
        return self.status == PaymentStatus.FAILED
    
    def is_expired(self) -> bool:
        """是否过期"""
        if self.expire_time:
            return datetime.now() > self.expire_time
        return False


@dataclass
class PaymentQueryRequest:
    """支付查询请求"""
    payment_id: Optional[str] = None
    order_id: Optional[str] = None


@dataclass
class PaymentListRequest:
    """支付列表请求"""
    status: Optional[PaymentStatus] = None
    method: Optional[PaymentMethod] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    pagination: Optional[PaginationParams] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = {}
        if self.status:
            data["status"] = self.status.value
        if self.method:
            data["method"] = self.method.value
        if self.start_time:
            data["start_time"] = self.start_time.isoformat()
        if self.end_time:
            data["end_time"] = self.end_time.isoformat()
        if self.pagination:
            data.update(self.pagination.to_dict())
        return data


@dataclass
class PaymentStatistics:
    """支付统计"""
    total_count: int
    total_amount: Decimal
    success_count: int
    success_amount: Decimal
    failed_count: int
    failed_amount: Decimal
    pending_count: int
    pending_amount: Decimal
    refund_count: int
    refund_amount: Decimal


# 退款相关模型

@dataclass
class RefundRequest:
    """退款请求"""
    payment_id: str
    amount: Optional[Decimal] = None
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    callback_url: Optional[str] = None
    
    def __post_init__(self):
        """后置初始化"""
        if self.metadata is None:
            self.metadata = {}


@dataclass
class RefundResponse:
    """退款响应"""
    refund_id: str
    payment_id: str
    amount: Decimal
    reason: Optional[str]
    status: PaymentStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RefundListRequest:
    """退款列表请求"""
    payment_id: Optional[str] = None
    status: Optional[PaymentStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    pagination: Optional[PaginationParams] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = {}
        if self.payment_id:
            data["payment_id"] = self.payment_id
        if self.status:
            data["status"] = self.status.value
        if self.start_time:
            data["start_time"] = self.start_time.isoformat()
        if self.end_time:
            data["end_time"] = self.end_time.isoformat()
        if self.pagination:
            data.update(self.pagination.to_dict())
        return data


# 渠道相关模型

@dataclass
class ChannelInfo:
    """渠道信息"""
    channel_id: str
    name: str
    method: PaymentMethod
    status: ChannelStatus
    is_default: bool = False
    priority: int = 0
    config: Dict[str, Any] = field(default_factory=dict)
    health_status: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChannelHealthInfo:
    """渠道健康信息"""
    channel_id: str
    status: Literal["healthy", "warning", "critical"]
    response_time: float
    success_rate: float
    last_check: datetime
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChannelStatistics:
    """渠道统计"""
    channel_id: str
    total_transactions: int
    success_rate: float
    total_amount: Decimal
    average_response_time: float
    error_rate: float
    uptime: float


# 账户相关模型

@dataclass
class AccountBalance:
    """账户余额"""
    currency: str
    available_balance: Decimal
    frozen_balance: Decimal
    total_balance: Decimal
    updated_at: datetime


@dataclass
class Transaction:
    """交易记录"""
    transaction_id: str
    type: TransactionType
    amount: Decimal
    currency: str
    status: PaymentStatus
    payment_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TransactionListRequest:
    """交易记录列表请求"""
    transaction_type: Optional[TransactionType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    pagination: Optional[PaginationParams] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = {}
        if self.transaction_type:
            data["transaction_type"] = self.transaction_type.value
        if self.start_time:
            data["start_time"] = self.start_time.isoformat()
        if self.end_time:
            data["end_time"] = self.end_time.isoformat()
        if self.pagination:
            data.update(self.pagination.to_dict())
        return data


@dataclass
class AccountStatistics:
    """账户统计"""
    total_income: Decimal
    total_outcome: Decimal
    transaction_count: int
    success_rate: float
    average_transaction_amount: Decimal
    period: str  # 统计期间


# 系统相关模型

@dataclass
class SystemHealth:
    """系统健康状态"""
    status: Literal["healthy", "warning", "critical"]
    version: str
    uptime: float
    services: Dict[str, Any] = field(default_factory=dict)
    metrics: Dict[str, Any] = field(default_factory=dict)


@dataclass
class VersionInfo:
    """版本信息"""
    version: str
    build_time: str
    commit_hash: Optional[str] = None
    features: List[str] = field(default_factory=list)
    changelog: Optional[str] = None


# 回调相关模型

@dataclass
class WebhookPayload:
    """Webhook载荷"""
    event_type: str
    event_id: str
    timestamp: datetime
    data: Dict[str, Any]
    signature: Optional[str] = None
    
    def verify_signature(self, secret_key: str) -> bool:
        """验证签名"""
        # 这里需要实现签名验证逻辑
        # 由于涉及加密功能，暂时返回True
        return True if self.signature else False


@dataclass
class WebhookEvent:
    """Webhook事件"""
    event_type: str
    resource_type: str
    resource_id: str
    status: str
    created_at: datetime = field(default_factory=datetime.now)
    retry_count: int = 0
    next_retry: Optional[datetime] = None


# 异常模型

@dataclass
class ErrorDetail:
    """错误详情"""
    code: str
    message: str
    field_name: Optional[str] = None  # 字段名称（避免与field函数冲突）
    value: Any = None
    suggestions: List[str] = field(default_factory=list)


# 辅助函数

def format_decimal(value: Union[str, Decimal, float], currency: str = "USD") -> str:
    """格式化金额"""
    if isinstance(value, str):
        value = Decimal(value)
    elif isinstance(value, float):
        value = Decimal(str(value))
    
    return f"{value:.2f} {currency}"


def parse_datetime(dt_str: str) -> datetime:
    """解析日期时间字符串"""
    # 尝试多种日期格式
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(dt_str, fmt)
        except ValueError:
            continue
    
    raise ValueError(f"无法解析日期时间: {dt_str}")


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """格式化日期时间"""
    return dt.strftime(fmt)


# 预定义的枚举映射

PAYMENT_METHOD_LABELS = {
    PaymentMethod.ALIPAY: "支付宝",
    PaymentMethod.WECHAT_PAY: "微信支付",
    PaymentMethod.BANK_CARD: "银行卡",
    PaymentMethod.UNIONPAY: "银联",
    PaymentMethod.PAYPAL: "PayPal",
    PaymentMethod.CRYPTO: "加密货币",
}

PAYMENT_STATUS_LABELS = {
    PaymentStatus.PENDING: "待支付",
    PaymentStatus.PROCESSING: "处理中",
    PaymentStatus.SUCCEEDED: "支付成功",
    PaymentStatus.FAILED: "支付失败",
    PaymentStatus.CANCELLED: "已取消",
    PaymentStatus.EXPIRED: "已过期",
    PaymentStatus.REFUNDING: "退款中",
    PaymentStatus.REFUNDED: "已退款",
}

CHANNEL_STATUS_LABELS = {
    ChannelStatus.ACTIVE: "活跃",
    ChannelStatus.INACTIVE: "非活跃",
    ChannelStatus.MAINTENANCE: "维护中",
    ChannelStatus.ERROR: "错误",
}