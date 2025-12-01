"""
工具函数模块

提供常用的工具函数和辅助方法。
"""

from __future__ import annotations

import hashlib
import hmac
import base64
import json
import time
import uuid
import calendar
from typing import Any, Dict, List, Optional, Union, Callable
from datetime import datetime, timedelta
from functools import wraps
from decimal import Decimal


def generate_uuid() -> str:
    """生成UUID
    
    Returns:
        UUID字符串
    """
    return str(uuid.uuid4())


def generate_timestamp() -> int:
    """生成时间戳（毫秒）
    
    Returns:
        当前时间戳（毫秒）
    """
    return int(time.time() * 1000)


def generate_order_id(prefix: str = "ORD") -> str:
    """生成订单号
    
    Args:
        prefix: 前缀
        
    Returns:
        订单号
    """
    timestamp = str(int(time.time()))
    random_suffix = str(uuid.uuid4()).replace('-', '')[-8:]
    return f"{prefix}{timestamp}{random_suffix}"


def generate_payment_id(prefix: str = "PAY") -> str:
    """生成支付号
    
    Args:
        prefix: 前缀
        
    Returns:
        支付号
    """
    timestamp = str(int(time.time()))
    random_suffix = str(uuid.uuid4()).replace('-', '')[-8:]
    return f"{prefix}{timestamp}{random_suffix}"


def generate_signature(
    data: Union[str, bytes],
    secret_key: str,
    algorithm: str = "sha256"
) -> str:
    """生成签名
    
    Args:
        data: 待签名的数据
        secret_key: 密钥
        algorithm: 算法名称
        
    Returns:
        Base64编码的签名
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    secret_key_bytes = secret_key.encode('utf-8')
    
    if algorithm == "sha256":
        signature = hmac.new(secret_key_bytes, data, hashlib.sha256).digest()
    elif algorithm == "sha1":
        signature = hmac.new(secret_key_bytes, data, hashlib.sha1).digest()
    else:
        raise ValueError(f"不支持的签名算法: {algorithm}")
    
    return base64.b64encode(signature).decode('utf-8')


def verify_signature(
    data: Union[str, bytes],
    signature: str,
    secret_key: str,
    algorithm: str = "sha256"
) -> bool:
    """验证签名
    
    Args:
        data: 原始数据
        signature: 待验证的签名
        secret_key: 密钥
        algorithm: 算法名称
        
    Returns:
        签名是否有效
    """
    expected_signature = generate_signature(data, secret_key, algorithm)
    return hmac.compare_digest(expected_signature, signature)


def encode_base64(data: str) -> str:
    """Base64编码
    
    Args:
        data: 待编码的数据
        
    Returns:
        Base64编码结果
    """
    return base64.b64encode(data.encode('utf-8')).decode('utf-8')


def decode_base64(data: str) -> str:
    """Base64解码
    
    Args:
        data: Base64编码的字符串
        
    Returns:
        解码结果
    """
    return base64.b64decode(data.encode('utf-8')).decode('utf-8')


def dict_to_query_string(params: Dict[str, Any], exclude_null: bool = True) -> str:
    """将字典转换为查询字符串
    
    Args:
        params: 参数字典
        exclude_null: 是否排除空值
        
    Returns:
        查询字符串
    """
    query_params = []
    
    for key, value in params.items():
        if exclude_null and (value is None or value == ""):
            continue
        
        if isinstance(value, (list, tuple)):
            for item in value:
                query_params.append(f"{key}={item}")
        else:
            query_params.append(f"{key}={value}")
    
    return "&".join(query_params)


def sort_dict_by_key(obj: Dict[str, Any]) -> Dict[str, Any]:
    """按key排序字典
    
    Args:
        obj: 字典对象
        
    Returns:
        排序后的字典
    """
    return dict(sorted(obj.items()))


def camel_to_snake(camel_str: str) -> str:
    """驼峰命名转蛇形命名
    
    Args:
        camel_str: 驼峰命名字符串
        
    Returns:
        蛇形命名字符串
    """
    result = ""
    for i, char in enumerate(camel_str):
        if char.isupper():
            if i > 0 and camel_str[i-1].islower():
                result += "_"
            elif i > 0 and i + 1 < len(camel_str) and camel_str[i+1].islower():
                result += "_"
        result += char.lower()
    return result


def snake_to_camel(snake_str: str) -> str:
    """蛇形命名转驼峰命名
    
    Args:
        snake_str: 蛇形命名字符串
        
    Returns:
        驼峰命名字符串
    """
    result = ""
    next_upper = False
    
    for i, char in enumerate(snake_str):
        if char == "_":
            next_upper = True
        else:
            if next_upper:
                result += char.upper()
                next_upper = False
            else:
                result += char
    
    return result


def format_decimal(value: Union[str, float, int, Decimal], precision: int = 2) -> str:
    """格式化小数
    
    Args:
        value: 数值
        precision: 小数位数
        
    Returns:
        格式化后的字符串
    """
    if isinstance(value, Decimal):
        return str(value.quantize(Decimal('0.01')))
    
    decimal_value = Decimal(str(value))
    return str(decimal_value.quantize(Decimal('0.01')))


def safe_parse_float(value: Any) -> Optional[float]:
    """安全转换为浮点数
    
    Args:
        value: 待转换的值
        
    Returns:
        转换后的浮点数，转换失败返回None
    """
    try:
        if isinstance(value, Decimal):
            return float(value)
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_parse_int(value: Any) -> Optional[int]:
    """安全转换为整数
    
    Args:
        value: 待转换的值
        
    Returns:
        转换后的整数，转换失败返回None
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def mask_sensitive_data(data: str, mask_char: str = "*", show_first: int = 2, show_last: int = 2) -> str:
    """掩码敏感数据
    
    Args:
        data: 原始数据
        mask_char: 掩码字符
        show_first: 前几位显示
        show_last: 后几位显示
        
    Returns:
        掩码后的数据
    """
    if not data or len(data) <= show_first + show_last:
        return mask_char * len(data)
    
    start = data[:show_first]
    end = data[-show_last:] if show_last > 0 else ""
    middle = mask_char * (len(data) - show_first - show_last)
    
    return start + middle + end


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """验证必填字段
    
    Args:
        data: 数据字典
        required_fields: 必填字段列表
        
    Returns:
        缺失的字段列表
    """
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            missing_fields.append(field)
    
    return missing_fields


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
    retry_on_exceptions: tuple = (Exception,)
) -> Callable:
    """重试装饰器
    
    Args:
        max_retries: 最大重试次数
        base_delay: 基础延迟时间（秒）
        max_delay: 最大延迟时间（秒）
        backoff_factor: 退避因子
        retry_on_exceptions: 需要重试的异常类型
        
    Returns:
        装饰器函数
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except retry_on_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        break
                    
                    # 计算延迟时间
                    delay = base_delay * (backoff_factor ** attempt)
                    delay = min(delay, max_delay)
                    
                    # 添加随机抖动
                    import random
                    jitter = delay * 0.1 * random.random()
                    delay += jitter
                    
                    time.sleep(delay)
            
            raise last_exception
        
        return wrapper
    return decorator


def timeout(seconds: int) -> Callable:
    """超时装饰器
    
    Args:
        seconds: 超时时间（秒）
        
    Returns:
        装饰器函数
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError(f"Function {func.__name__} timed out after {seconds} seconds")
            
            # 设置信号处理器
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            
            try:
                return func(*args, **kwargs)
            finally:
                # 恢复原信号处理器
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        
        return wrapper
    return decorator


def get_current_date_string(format: str = "%Y-%m-%d") -> str:
    """获取当前日期字符串
    
    Args:
        format: 日期格式
        
    Returns:
        格式化后的日期字符串
    """
    return datetime.now().strftime(format)


def get_date_range(days: int, end_date: Optional[datetime] = None) -> tuple[datetime, datetime]:
    """获取日期范围
    
    Args:
        days: 天数
        end_date: 结束日期，默认为当前时间
        
    Returns:
        开始和结束日期的元组
    """
    if end_date is None:
        end_date = datetime.now()
    
    start_date = end_date - timedelta(days=days)
    
    return start_date, end_date


def convert_datetime_to_milliseconds(dt: datetime) -> int:
    """将datetime转换为毫秒时间戳
    
    Args:
        dt: datetime对象
        
    Returns:
        毫秒时间戳
    """
    return int(dt.timestamp() * 1000)


def convert_milliseconds_to_datetime(ms: int) -> datetime:
    """将毫秒时间戳转换为datetime
    
    Args:
        ms: 毫秒时间戳
        
    Returns:
        datetime对象
    """
    return datetime.fromtimestamp(ms / 1000.0)


def calculate_percentage(part: Union[int, float], total: Union[int, float], precision: int = 2) -> float:
    """计算百分比
    
    Args:
        part: 部分值
        total: 总值
        precision: 小数位数
        
    Returns:
        百分比
    """
    if total == 0:
        return 0.0
    
    percentage = (part / total) * 100
    return round(percentage, precision)


def format_currency(amount: Union[str, float, Decimal], currency: str = "USD", symbol: bool = False) -> str:
    """格式化货币
    
    Args:
        amount: 金额
        currency: 货币代码
        symbol: 是否显示符号
        
    Returns:
        格式化后的货币字符串
    """
    currency_symbols = {
        "USD": "$",
        "CNY": "¥",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥",
        "KRW": "₩"
    }
    
    symbol_str = ""
    if symbol and currency in currency_symbols:
        symbol_str = currency_symbols[currency]
    
    formatted_amount = format_decimal(amount, 2)
    
    if symbol_str:
        return f"{symbol_str}{formatted_amount}"
    else:
        return f"{formatted_amount} {currency}"