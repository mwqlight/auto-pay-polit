"""
异常处理模块

定义AutoPay SDK的所有异常类型，提供统一的错误处理机制。
"""

from __future__ import annotations

from typing import Optional, Dict, Any, Union


__all__ = [
    "AutoPayException",
    "ConfigurationException",
    "NetworkException",
    "ValidationException",
    "AuthenticationException",
    "PaymentException",
    "RefundException",
    "SignatureException",
    "TimeoutException",
    "RateLimitException"
]


class AutoPayException(Exception):
    """AutoPay SDK 基础异常类"""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        http_status: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        cause: Optional[Exception] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.http_status = http_status
        self.details = details or {}
        self.cause = cause
        self.timestamp = self._get_timestamp()
    
    def _get_timestamp(self) -> str:
        """获取时间戳"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "error_code": self.error_code,
            "http_status": self.http_status,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp
        }
    
    def __str__(self) -> str:
        """字符串表示"""
        parts = [f"AutoPayError: {self.message}"]
        if self.error_code:
            parts.append(f"Error Code: {self.error_code}")
        if self.http_status:
            parts.append(f"HTTP Status: {self.http_status}")
        if self.details:
            parts.append(f"Details: {self.details}")
        return " | ".join(parts)


class ConfigurationException(AutoPayException):
    """配置异常"""
    
    @classmethod
    def missing_api_key(cls) -> ConfigurationException:
        """缺少API密钥"""
        return cls("API密钥是必需的", error_code="CONFIG_MISSING_API_KEY")
    
    @classmethod
    def missing_secret_key(cls) -> ConfigurationException:
        """缺少密钥"""
        return cls("密钥是必需的", error_code="CONFIG_MISSING_SECRET_KEY")
    
    @classmethod
    def invalid_environment(cls, environment: str) -> ConfigurationException:
        """无效的环境"""
        return cls(
            f"无效的环境配置: {environment}",
            error_code="CONFIG_INVALID_ENVIRONMENT"
        )
    
    @classmethod
    def invalid_timeout(cls, timeout: Union[int, float]) -> ConfigurationException:
        """无效的超时时间"""
        return cls(
            f"超时时间必须大于0，实际值: {timeout}",
            error_code="CONFIG_INVALID_TIMEOUT"
        )


class NetworkException(AutoPayException):
    """网络异常"""
    
    @classmethod
    def connection_error(cls, message: str, cause: Optional[Exception] = None) -> NetworkException:
        """连接错误"""
        return cls(message, error_code="NETWORK_CONNECTION_ERROR", cause=cause)
    
    @classmethod
    def timeout_error(cls, cause: Optional[Exception] = None) -> NetworkException:
        """超时错误"""
        return cls("请求超时", error_code="NETWORK_TIMEOUT_ERROR", cause=cause)
    
    @classmethod
    def ssl_error(cls, message: str, cause: Optional[Exception] = None) -> NetworkException:
        """SSL错误"""
        return cls(message, error_code="NETWORK_SSL_ERROR", cause=cause)
    
    @classmethod
    def dns_error(cls, message: str, cause: Optional[Exception] = None) -> NetworkException:
        """DNS错误"""
        return cls(message, error_code="NETWORK_DNS_ERROR", cause=cause)
    
    @classmethod
    def bad_response(cls, status_code: int, message: str) -> NetworkException:
        """响应错误"""
        return cls(
            f"响应错误 (状态码: {status_code}): {message}",
            error_code="NETWORK_BAD_RESPONSE",
            http_status=status_code
        )


class ValidationException(AutoPayException):
    """参数验证异常"""
    
    @classmethod
    def missing_field(cls, field_name: str) -> ValidationException:
        """缺少必需字段"""
        return cls(
            f"缺少必需字段: {field_name}",
            error_code="VALIDATION_MISSING_FIELD"
        )
    
    @classmethod
    def invalid_format(cls, field_name: str, expected_format: str) -> ValidationException:
        """格式错误"""
        return cls(
            f"字段 {field_name} 格式不正确，期望格式: {expected_format}",
            error_code="VALIDATION_INVALID_FORMAT"
        )
    
    @classmethod
    def invalid_value(cls, field_name: str, value: Any, reason: str) -> ValidationException:
        """值错误"""
        return cls(
            f"字段 {field_name} 值无效 ({value}): {reason}",
            error_code="VALIDATION_INVALID_VALUE"
        )
    
    @classmethod
    def out_of_range(cls, field_name: str, value: Union[int, float], min_val: Union[int, float], max_val: Union[int, float]) -> ValidationException:
        """超出范围"""
        return cls(
            f"字段 {field_name} 值 {value} 超出范围 [{min_val}, {max_val}]",
            error_code="VALIDATION_OUT_OF_RANGE"
        )


class AuthenticationException(AutoPayException):
    """认证异常"""
    
    @classmethod
    def invalid_credentials(cls) -> AuthenticationException:
        """凭证无效"""
        return cls("API密钥或密钥无效", error_code="AUTH_INVALID_CREDENTIALS")
    
    @classmethod
    def expired_credentials(cls) -> AuthenticationException:
        """凭证已过期"""
        return cls("API凭证已过期", error_code="AUTH_EXPIRED_CREDENTIALS")
    
    @classmethod
    def insufficient_permissions(cls, permission: str) -> AuthenticationException:
        """权限不足"""
        return cls(f"权限不足: {permission}", error_code="AUTH_INSUFFICIENT_PERMISSIONS")
    
    @classmethod
    def signature_verification_failed(cls) -> AuthenticationException:
        """签名验证失败"""
        return cls("签名验证失败", error_code="AUTH_SIGNATURE_VERIFICATION_FAILED")


class PaymentException(AutoPayException):
    """支付异常"""
    
    @classmethod
    def payment_not_found(cls, payment_id: str) -> PaymentException:
        """支付不存在"""
        return cls(
            f"支付记录不存在: {payment_id}",
            error_code="PAYMENT_NOT_FOUND"
        )
    
    @classmethod
    def insufficient_balance(cls, required_amount: int, available_amount: int) -> PaymentException:
        """余额不足"""
        return cls(
            f"余额不足，需要: {required_amount}，可用: {available_amount}",
            error_code="PAYMENT_INSUFFICIENT_BALANCE"
        )
    
    @classmethod
    def channel_unavailable(cls, channel: str) -> PaymentException:
        """渠道不可用"""
        return cls(
            f"支付渠道不可用: {channel}",
            error_code="PAYMENT_CHANNEL_UNAVAILABLE"
        )
    
    @classmethod
    def duplicate_payment(cls, order_id: str) -> PaymentException:
        """重复支付"""
        return cls(
            f"重复支付: {order_id}",
            error_code="PAYMENT_DUPLICATE"
        )
    
    @classmethod
    def payment_failed(cls, payment_id: str, reason: str) -> PaymentException:
        """支付失败"""
        return cls(
            f"支付失败 ({payment_id}): {reason}",
            error_code="PAYMENT_FAILED"
        )


class RefundException(AutoPayException):
    """退款异常"""
    
    @classmethod
    def refund_not_found(cls, refund_id: str) -> RefundException:
        """退款记录不存在"""
        return cls(
            f"退款记录不存在: {refund_id}",
            error_code="REFUND_NOT_FOUND"
        )
    
    @classmethod
    def cannot_refund(cls, payment_id: str, reason: str) -> RefundException:
        """无法退款"""
        return cls(
            f"支付 {payment_id} 无法退款: {reason}",
            error_code="REFUND_CANNOT_REFUND"
        )
    
    @classmethod
    def insufficient_balance_for_refund(cls, refund_amount: int, available_amount: int) -> RefundException:
        """退款余额不足"""
        return cls(
            f"退款余额不足，需要: {refund_amount}，可用: {available_amount}",
            error_code="REFUND_INSUFFICIENT_BALANCE"
        )


class SignatureException(AutoPayException):
    """签名异常"""
    
    @classmethod
    def invalid_signature(cls) -> SignatureException:
        """签名无效"""
        return cls("签名无效", error_code="SIGNATURE_INVALID")
    
    @classmethod
    def missing_signature(cls) -> SignatureException:
        """缺少签名"""
        return cls("缺少签名", error_code="SIGNATURE_MISSING")
    
    @classmethod
    def signature_mismatch(cls, expected: str, actual: str) -> SignatureException:
        """签名不匹配"""
        return cls(
            f"签名不匹配，期望: {expected}，实际: {actual}",
            error_code="SIGNATURE_MISMATCH"
        )


class TimeoutException(AutoPayException):
    """超时异常"""
    
    @classmethod
    def request_timeout(cls, operation: str, timeout_seconds: float) -> TimeoutException:
        """请求超时"""
        return cls(
            f"{operation} 操作超时 ({timeout_seconds}秒)",
            error_code="TIMEOUT_REQUEST_TIMEOUT"
        )


class RateLimitException(AutoPayException):
    """限流异常"""
    
    @classmethod
    def rate_limit_exceeded(
        cls,
        limit: int,
        window_seconds: int,
        retry_after: Optional[int] = None
    ) -> RateLimitException:
        """超过限流"""
        message = f"请求频率超过限制: {limit}次/{window_seconds}秒"
        if retry_after:
            message += f"，请在 {retry_after} 秒后重试"
        
        details = {
            "limit": limit,
            "window_seconds": window_seconds,
            "retry_after": retry_after
        }
        
        return cls(message, error_code="RATE_LIMIT_EXCEEDED", details=details)
    
    @classmethod
    def quota_exceeded(cls, quota_type: str, limit: int) -> RateLimitException:
        """配额超限"""
        return cls(
            f"{quota_type} 配额超限: {limit}",
            error_code="RATE_LIMIT_QUOTA_EXCEEDED"
        )


# 辅助函数
def create_exception_from_response(
    response_data: Dict[str, Any],
    http_status: Optional[int] = None
) -> AutoPayException:
    """从响应数据创建异常
    
    Args:
        response_data: 响应数据
        http_status: HTTP状态码
        
    Returns:
        异常实例
    """
    error_code = response_data.get("code") or response_data.get("error_code")
    message = response_data.get("message") or response_data.get("error", "未知错误")
    details = response_data.get("data") or response_data.get("details")
    
    # 根据错误码类型创建相应异常
    if error_code:
        error_code_lower = str(error_code).lower()
        
        if "config" in error_code_lower or "validate" in error_code_lower:
            return ValidationException(message, error_code=error_code, http_status=http_status, details=details)
        elif "auth" in error_code_lower or "unauthorized" in error_code_lower:
            return AuthenticationException(message, error_code=error_code, http_status=http_status, details=details)
        elif "payment" in error_code_lower:
            return PaymentException(message, error_code=error_code, http_status=http_status, details=details)
        elif "refund" in error_code_lower:
            return RefundException(message, error_code=error_code, http_status=http_status, details=details)
        elif "signature" in error_code_lower:
            return SignatureException(message, error_code=error_code, http_status=http_status, details=details)
        elif "rate_limit" in error_code_lower:
            return RateLimitException(message, error_code=error_code, http_status=http_status, details=details)
        elif "network" in error_code_lower or "timeout" in error_code_lower:
            return NetworkException(message, error_code=error_code, http_status=http_status, details=details)
    
    # 默认返回基础异常
    return AutoPayException(message, error_code=error_code, http_status=http_status, details=details)


def is_retryable_error(error: Exception) -> bool:
    """判断错误是否可重试
    
    Args:
        error: 异常对象
        
    Returns:
        是否可重试
    """
    if isinstance(error, NetworkException):
        return True
    elif isinstance(error, TimeoutException):
        return True
    elif isinstance(error, RateLimitException):
        return True
    elif isinstance(error, AuthenticationException):
        # 认证错误通常不可重试
        return False
    elif isinstance(error, ValidationException):
        # 参数验证错误不可重试
        return False
    elif isinstance(error, PaymentException):
        # 支付相关错误根据类型判断
        return "insufficient_balance" in str(error) or "channel_unavailable" in str(error)
    
    return False


def get_retry_delay(error: Exception, attempt: int, base_delay: float = 1.0) -> float:
    """计算重试延迟时间
    
    Args:
        error: 异常对象
        attempt: 重试次数
        base_delay: 基础延迟时间
        
    Returns:
        延迟时间（秒）
    """
    if isinstance(error, RateLimitException):
        # 限流错误使用响应头中的重试时间
        retry_after = error.details.get("retry_after")
        if retry_after:
            return max(retry_after, base_delay)
        
        # 指数退避策略
        return min(base_delay * (2 ** attempt), 300)  # 最大5分钟
    
    elif isinstance(error, NetworkException) or isinstance(error, TimeoutException):
        # 网络错误使用指数退避策略
        return min(base_delay * (1.5 ** attempt), 60)  # 最大1分钟
    
    return base_delay