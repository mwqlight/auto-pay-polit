"""
配置管理模块

提供AutoPay SDK的配置管理功能，支持多种配置方式：
- 直接初始化
- 构建器模式
- 环境变量
- 配置文件
"""

from __future__ import annotations

import os
from typing import Optional, Dict, Any, Union
from dataclasses import dataclass, field
from enum import Enum

from autopay.models import Environment, PaymentStatus, PaymentMethod, ApiResponse, PaginatedResponse

__all__ = [
    "Config",
    "ConfigBuilder",
    "Environment",
    "ConfigException"
]


class ConfigException(Exception):
    """配置异常"""
    pass


@dataclass
class Config:
    """AutoPay配置类"""
    
    # 必需参数
    api_key: str
    secret_key: str
    
    # 可选参数
    app_id: Optional[str] = None
    base_url: Optional[str] = None
    timeout: float = 30.0
    max_retries: int = 3
    retry_delay: float = 1.0
    enable_logging: bool = True
    environment: Environment = Environment.SANDBOX
    user_agent: str = "AutoPay-Python-SDK/1.0.0"
    headers: Dict[str, str] = field(default_factory=dict)
    verify_ssl: bool = True
    allow_redirects: bool = True
    
    def __init__(self, api_key: str, secret_key: str, app_id: Optional[str] = None, 
                 base_url: Optional[str] = None, timeout: float = 30.0, max_retries: int = 3,
                 retry_delay: float = 1.0, enable_logging: bool = True, 
                 environment: Union[Environment, str] = Environment.SANDBOX,
                 user_agent: str = "AutoPay-Python-SDK/1.0.0",
                 headers: Optional[Dict[str, str]] = None, verify_ssl: bool = True,
                 allow_redirects: bool = True):
        """初始化配置对象
        
        Args:
            api_key: API密钥
            secret_key: 密钥
            app_id: 应用ID
            base_url: 基础URL
            timeout: 超时时间
            max_retries: 最大重试次数
            retry_delay: 重试延迟
            enable_logging: 是否启用日志
            environment: 环境（支持字符串或枚举）
            user_agent: 用户代理
            headers: 请求头
            verify_ssl: 是否验证SSL
            allow_redirects: 是否允许重定向
        """
        # 处理环境参数 - 支持字符串和枚举
        if isinstance(environment, str):
            try:
                environment = Environment(environment.lower())
            except ValueError as e:
                raise ConfigException(f"无效的环境值: {environment}。有效选项: {', '.join([e.value for e in Environment])}")
        
        self.api_key = api_key
        self.secret_key = secret_key
        self.app_id = app_id
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.enable_logging = enable_logging
        self.environment = environment
        self.user_agent = user_agent
        self.headers = headers or {}
        self.verify_ssl = verify_ssl
        self.allow_redirects = allow_redirects
        
        # 执行后处理
        self._validate()
        self._set_default_values()
    
    def __post_init__(self):
        """配置后处理（dataclass兼容性）"""
        pass
    
    def _validate(self) -> None:
        """验证配置参数"""
        if not self.api_key or not self.api_key.strip():
            raise ConfigException("API密钥是必需的")
        
        if not self.secret_key or not self.secret_key.strip():
            raise ConfigException("密钥是必需的")
        
        if self.timeout <= 0:
            raise ConfigException("超时时间必须大于0")
        
        if self.max_retries < 0:
            raise ConfigException("重试次数不能小于0")
    
    def _set_default_values(self) -> None:
        """设置默认值"""
        if not self.base_url:
            if self.environment == Environment.PRODUCTION:
                self.base_url = "https://api.autopay.com"
            elif self.environment == Environment.STAGING:
                self.base_url = "https://api-staging.autopay.com"
            else:  # SANDBOX
                self.base_url = "https://api-sandbox.autopay.com"
        
        # 设置默认请求头
        default_headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        default_headers.update(self.headers)
        self.headers = default_headers
    
    @classmethod
    def create(cls, api_key: str, secret_key: str, **kwargs) -> Config:
        """创建配置对象
        
        Args:
            api_key: API密钥
            secret_key: 密钥
            **kwargs: 其他配置参数
            
        Returns:
            配置对象
        """
        return cls(api_key=api_key, secret_key=secret_key, **kwargs)
    
    @classmethod
    def from_env(cls) -> Config:
        """从环境变量创建配置
        
        环境变量：
        - AUTOPAY_API_KEY: API密钥
        - AUTOPAY_SECRET_KEY: 密钥
        - AUTOPAY_APP_ID: 应用ID
        - AUTOPAY_BASE_URL: 基础URL
        - AUTOPAY_TIMEOUT: 超时时间
        - AUTOPAY_ENVIRONMENT: 环境 (sandbox|production|staging)
        - AUTOPAY_LOG_LEVEL: 日志级别
        """
        api_key = os.getenv("AUTOPAY_API_KEY")
        secret_key = os.getenv("AUTOPAY_SECRET_KEY")
        
        if not api_key:
            raise ConfigException("请设置环境变量 AUTOPAY_API_KEY")
        if not secret_key:
            raise ConfigException("请设置环境变量 AUTOPAY_SECRET_KEY")
        
        # 解析环境
        env_str = os.getenv("AUTOPAY_ENVIRONMENT", "sandbox")
        environment = Environment(env_str.lower())
        
        return cls(
            api_key=api_key,
            secret_key=secret_key,
            app_id=os.getenv("AUTOPAY_APP_ID"),
            base_url=os.getenv("AUTOPAY_BASE_URL"),
            timeout=float(os.getenv("AUTOPAY_TIMEOUT", "30")),
            environment=environment,
            enable_logging=os.getenv("AUTOPAY_LOG_LEVEL", "INFO").upper() != "DISABLED"
        )
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> Config:
        """从字典创建配置
        
        Args:
            config_dict: 配置字典
            
        Returns:
            配置对象
            
        Raises:
            ConfigException: 无效的环境值或其他配置错误
        """
        # 处理环境枚举
        if "environment" in config_dict and isinstance(config_dict["environment"], str):
            try:
                config_dict["environment"] = Environment(config_dict["environment"])
            except ValueError as e:
                raise ConfigException(str(e))
        
        return cls(**config_dict)
    
    def get_api_key(self) -> str:
        """获取API密钥"""
        return self.api_key
    
    def get_secret_key(self) -> str:
        """获取密钥"""
        return self.secret_key
    
    def get_app_id(self) -> Optional[str]:
        """获取应用ID"""
        return self.app_id
    
    def get_base_url(self) -> str:
        """获取基础URL"""
        return self.base_url
    
    def get_timeout(self) -> float:
        """获取超时时间"""
        return self.timeout
    
    def get_max_retries(self) -> int:
        """获取最大重试次数"""
        return self.max_retries
    
    def get_retry_delay(self) -> float:
        """获取重试延迟"""
        return self.retry_delay
    
    def get_environment(self) -> Environment:
        """获取环境"""
        return self.environment
    
    def get_user_agent(self) -> str:
        """获取用户代理"""
        return self.user_agent
    
    def get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return self.headers.copy()
    
    def is_logging_enabled(self) -> bool:
        """是否启用日志"""
        return self.enable_logging
    
    def is_ssl_verification_enabled(self) -> bool:
        """是否启用SSL验证"""
        return self.verify_ssl
    
    def is_redirects_allowed(self) -> bool:
        """是否允许重定向"""
        return self.allow_redirects
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "api_key": self.api_key,
            "secret_key": self.secret_key,
            "app_id": self.app_id,
            "base_url": self.base_url,
            "timeout": self.timeout,
            "max_retries": self.max_retries,
            "retry_delay": self.retry_delay,
            "enable_logging": self.enable_logging,
            "environment": self.environment.value,
            "user_agent": self.user_agent,
            "headers": self.headers,
            "verify_ssl": self.verify_ssl,
            "allow_redirects": self.allow_redirects
        }
    
    def copy_with_updates(self, **updates) -> Config:
        """创建配置副本并更新指定字段
        
        Args:
            **updates: 更新的字段
            
        Returns:
            新的配置对象
        """
        config_dict = self.to_dict()
        config_dict.update(updates)
        
        # 处理环境枚举
        if "environment" in config_dict and isinstance(config_dict["environment"], str):
            config_dict["environment"] = Environment(config_dict["environment"])
        
        return Config(**config_dict)


class ConfigBuilder:
    """配置构建器"""
    
    def __init__(self):
        self._api_key: Optional[str] = None
        self._secret_key: Optional[str] = None
        self._app_id: Optional[str] = None
        self._base_url: Optional[str] = None
        self._timeout: float = 30.0
        self._max_retries: int = 3
        self._retry_delay: float = 1.0
        self._enable_logging: bool = True
        self._environment: Environment = Environment.SANDBOX
        self._user_agent: str = "AutoPay-Python-SDK/1.0.0"
        self._headers: Dict[str, str] = {}
        self._verify_ssl: bool = True
        self._allow_redirects: bool = True
    
    def api_key(self, api_key: str) -> ConfigBuilder:
        """设置API密钥"""
        self._api_key = api_key
        return self
    
    def secret_key(self, secret_key: str) -> ConfigBuilder:
        """设置密钥"""
        self._secret_key = secret_key
        return self
    
    def app_id(self, app_id: str) -> ConfigBuilder:
        """设置应用ID"""
        self._app_id = app_id
        return self
    
    def base_url(self, base_url: str) -> ConfigBuilder:
        """设置基础URL"""
        self._base_url = base_url
        return self
    
    def timeout(self, timeout: float) -> ConfigBuilder:
        """设置超时时间"""
        self._timeout = timeout
        return self
    
    def max_retries(self, max_retries: int) -> ConfigBuilder:
        """设置最大重试次数"""
        self._max_retries = max_retries
        return self
    
    def retry_delay(self, retry_delay: float) -> ConfigBuilder:
        """设置重试延迟"""
        self._retry_delay = retry_delay
        return self
    
    def enable_logging(self, enable_logging: bool) -> ConfigBuilder:
        """设置是否启用日志"""
        self._enable_logging = enable_logging
        return self
    
    def environment(self, environment: Union[Environment, str]) -> ConfigBuilder:
        """设置环境
        
        Args:
            environment: 环境枚举或字符串
            
        Returns:
            构建器实例
            
        Raises:
            ConfigException: 无效的环境值
        """
        if isinstance(environment, str):
            try:
                self._environment = Environment(environment)
            except ValueError as e:
                raise ConfigException(str(e))
        else:
            self._environment = environment
        return self
    
    def user_agent(self, user_agent: str) -> ConfigBuilder:
        """设置用户代理"""
        self._user_agent = user_agent
        return self
    
    def headers(self, headers: Dict[str, str]) -> ConfigBuilder:
        """设置请求头"""
        self._headers = headers.copy()
        return self
    
    def add_header(self, key: str, value: str) -> ConfigBuilder:
        """添加请求头"""
        self._headers[key] = value
        return self
    
    def verify_ssl(self, verify_ssl: bool) -> ConfigBuilder:
        """设置是否验证SSL"""
        self._verify_ssl = verify_ssl
        return self
    
    def allow_redirects(self, allow_redirects: bool) -> ConfigBuilder:
        """设置是否允许重定向"""
        self._allow_redirects = allow_redirects
        return self
    
    def from_environment(self) -> ConfigBuilder:
        """从环境变量读取配置"""
        try:
            config = Config.from_env()
            self.api_key(config.get_api_key())
            self.secret_key(config.get_secret_key())
            self.app_id(config.get_app_id())
            self.base_url(config.get_base_url())
            self.timeout(config.get_timeout())
            self.enable_logging(config.is_logging_enabled())
            self.environment(config.get_environment())
            self.user_agent(config.get_user_agent())
            self.headers(config.get_headers())
            self.verify_ssl(config.is_ssl_verification_enabled())
            self.allow_redirects(config.is_redirects_allowed())
        except ConfigException:
            # 如果环境变量不完整，忽略错误
            pass
        return self
    
    def build(self) -> Config:
        """构建配置对象"""
        if not self._api_key:
            raise ConfigException("API密钥是必需的")
        if not self._secret_key:
            raise ConfigException("密钥是必需的")
        
        return Config(
            api_key=self._api_key,
            secret_key=self._secret_key,
            app_id=self._app_id,
            base_url=self._base_url,
            timeout=self._timeout,
            max_retries=self._max_retries,
            retry_delay=self._retry_delay,
            enable_logging=self._enable_logging,
            environment=self._environment,
            user_agent=self._user_agent,
            headers=self._headers,
            verify_ssl=self._verify_ssl,
            allow_redirects=self._allow_redirects
        )