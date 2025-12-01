"""
API接口模块

统一的API接口导出。
"""

from __future__ import annotations

# 核心模块
from .config import Config, ConfigBuilder
from .client import HttpClient
from .async_client import AsyncHttpClient
from .service import AutoPayService
from .utils import *

# 数据模型
from .models import (
    # 枚举类型
    Environment,
    PaymentStatus,
    PaymentMethod,
    ChannelStatus,
    TransactionType,
    LogLevel,
    
    # 基础模型
    ApiResponse,
    PaginationParams,
    PaginatedResponse,
    
    # 配置模型
    ConfigData,
    
    # 支付模型
    PaymentRequest,
    PaymentResponse,
    PaymentQueryRequest,
    PaymentListRequest,
    PaymentStatistics,
    
    # 退款模型
    RefundRequest,
    RefundResponse,
    RefundListRequest,
    
    # 渠道模型
    ChannelInfo,
    ChannelStatistics,
    ChannelHealthInfo,
    
    # 账户模型
    AccountBalance,
    Transaction,
    TransactionListRequest,
    AccountStatistics,
    
    # 系统模型
    SystemHealth,
    VersionInfo,
    
    # 回调模型
    WebhookEvent,
    WebhookPayload,
    
    # 异常模型
    ErrorDetail,
    
    # 辅助函数
    format_decimal,
    parse_datetime,
    format_datetime,
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_LABELS,
    CHANNEL_STATUS_LABELS
)

# 服务模块
from .services.payment import PaymentService
from .services.refund import RefundService
from .services.channel import ChannelService
from .services.account import AccountService
from .services.system import SystemService
from .services.webhook import WebhookService

# 异常处理
from .exceptions import (
        AutoPayException,
        ConfigurationException,
        ValidationException,
        NetworkException,
        TimeoutException,
        AuthenticationException,
        PaymentException,
        RefundException,
        SignatureException,
        RateLimitException,
        create_exception_from_response,
        is_retryable_error,
        get_retry_delay
    )

__all__ = [
    # 配置相关
    "Config",
    "ConfigBuilder",
    
    # 客户端相关
    "HttpClient",
    "AsyncHttpClient",
    
    # 服务相关
    "AutoPayService",
    "PaymentService",
    "RefundService",
    "ChannelService",
    "AccountService",
    "SystemService",
    "WebhookService",
    
    # 数据模型
    "Environment",
    "PaymentStatus",
    "PaymentMethod",
    "ChannelStatus",
    "TransactionType",
    "LogLevel",
    "ApiResponse",
    "PaginationParams",
    "PaginatedResponse",
    "ConfigData",
    "PaymentRequest",
    "PaymentResponse",
    "PaymentQueryRequest",
    "PaymentListRequest",
    "PaymentStatistics",
    "RefundRequest",
    "RefundResponse",
    "RefundListRequest",
    "ChannelInfo",
    "ChannelStatistics",
    "ChannelHealthInfo",
    "AccountBalance",
    "Transaction",
    "TransactionListRequest",
    "AccountStatistics",
    "SystemHealth",
    "VersionInfo",
    "WebhookEvent",
    "WebhookPayload",
    "ErrorDetail",
    
    # 辅助函数
    "format_decimal",
    "parse_datetime",
    "format_datetime",
    "PAYMENT_METHOD_LABELS",
    "PAYMENT_STATUS_LABELS",
    "CHANNEL_STATUS_LABELS",
    
    # 异常处理
    "AutoPayException",
    "ConfigurationException",
    "ValidationException",
    "NetworkException",
    "TimeoutException",
    "AuthenticationException",
    "PaymentException",
    "RefundException",
    "SignatureException",
    "RateLimitException",
    "create_exception_from_response",
    "is_retryable_error",
    "get_retry_delay",
    
    # 工具函数
    "validate_required_fields"
]

# SDK版本信息
__version__ = "1.0.0"
__author__ = "AutoPay SDK Team"
__email__ = "sdk@autopay.com"
__description__ = "AutoPay Python SDK - 简洁易用的支付服务SDK"
__url__ = "https://github.com/autopay/python-sdk"

# SDK信息
SDK_INFO = {
    "name": "autopay-python-sdk",
    "version": __version__,
    "author": __author__,
    "email": __email__,
    "description": __description__,
    "url": __url__,
    "features": [
        "简洁易用的API接口",
        "同步和异步HTTP客户端",
        "完整的类型提示支持",
        "内置重试和错误处理",
        "支持所有主流支付渠道",
        "完整的单元测试覆盖",
        "详细的文档和示例"
    ],
    "supported_languages": ["Python 3.8+"],
    "supported_frameworks": [
        "FastAPI",
        "Django", 
        "Flask",
        "Tornado",
        "AIOHTTP",
        "Sanic"
    ]
}

def get_sdk_info() -> dict:
    """获取SDK信息
    
    Returns:
        SDK信息字典
    """
    return SDK_INFO.copy()

def print_sdk_info() -> None:
    """打印SDK信息"""
    print(f"AutoPay Python SDK v{__version__}")
    print(f"Description: {__description__}")
    print(f"Author: {__author__}")
    print(f"URL: {__url__}")
    print(f"Features: {', '.join(SDK_INFO['features'])}")

# 便捷创建函数
def create_client(**config_kwargs):
    """创建AutoPay服务客户端
    
    Args:
        **config_kwargs: 配置参数
        
    Returns:
        AutoPayService实例
    """
    return AutoPayService.create(**config_kwargs)

def create_client_from_dict(config_dict):
    """从字典创建AutoPay服务客户端
    
    Args:
        config_dict: 配置字典
        
    Returns:
        AutoPayService实例
    """
    return AutoPayService.create_with_dict(config_dict)

# 快速开始示例
QUICK_START_EXAMPLE = '''
# 快速开始示例
from autopay import create_client

# 创建客户端
client = create_client(
    api_key="your_api_key",
    secret_key="your_secret_key",
    environment="sandbox"
)

# 创建支付
payment = client.get_payment_service().create_payment({
    "amount": 100.00,
    "currency": "CNY",
    "method": "alipay",
    "description": "测试订单"
})

print(f"支付ID: {payment.payment_id}")
print(f"支付URL: {payment.payment_url}")
'''

# 模块初始化完成标识
_AUTOPAY_SDK_INITIALIZED = True