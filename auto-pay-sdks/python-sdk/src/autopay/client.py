"""
HTTP客户端模块

提供同步和异步HTTP客户端，支持请求重试、日志记录、签名验证等功能。
"""

from __future__ import annotations

import json
import time
import logging
from typing import Optional, Dict, Any, Union, AsyncIterator
from urllib.parse import urljoin, urlencode

import requests
import aiohttp
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

from .config import Config
from .exceptions import (
    NetworkException,
    TimeoutException,
    SignatureException,
    AuthenticationException
)

__all__ = [
    "HttpClient",
    "AsyncHttpClient"
]


def _create_logger(config: Config) -> logging.Logger:
    """创建日志记录器"""
    logger = logging.getLogger("autopay.http")
    
    if config.is_logging_enabled() and not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        log_level = logging.DEBUG if config.get_environment().value == "sandbox" else logging.INFO
        logger.setLevel(log_level)
    
    return logger


def _generate_signature(
    method: str,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    data: Optional[Dict[str, Any]] = None,
    secret_key: str = ""
) -> str:
    """生成请求签名
    
    Args:
        method: HTTP方法
        url: 请求URL
        params: URL参数
        data: 请求体
        secret_key: 密钥
        
    Returns:
        签名字符串
    """
    import hmac
    import base64
    import hashlib
    
    # 准备签名字符串
    sign_str = f"{method}\n{url}\n"
    
    # 组合参数
    all_params = {}
    if params:
        all_params.update(params)
    if data:
        all_params.update(data)
    
    # 按键排序并拼接
    if all_params:
        sorted_params = sorted(all_params.items())
        param_str = "&".join([f"{k}={v}" for k, v in sorted_params])
        sign_str += param_str
    else:
        sign_str += ""
    
    # HMAC-SHA256签名
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_str.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    return base64.b64encode(signature).decode('utf-8')


class HttpClient:
    """同步HTTP客户端"""
    
    def __init__(self, config: Config):
        """初始化HTTP客户端
        
        Args:
            config: 配置对象
        """
        self.config = config
        self.session = requests.Session()
        self.logger = _create_logger(config)
        
        # 设置会话默认参数
        self.session.timeout = config.get_timeout()
        self.session.verify = config.is_ssl_verification_enabled()
        self.session.allow_redirects = config.is_redirects_allowed()
        
        # 设置默认请求头
        headers = config.get_headers()
        for key, value in headers.items():
            self.session.headers[key] = value
    
    def _prepare_url(self, path: str) -> str:
        """准备请求URL
        
        Args:
            path: API路径
            
        Returns:
            完整URL
        """
        return urljoin(self.config.get_base_url(), path)
    
    def _prepare_data(self, data: Optional[Dict[str, Any]]) -> Optional[str]:
        """准备请求数据
        
        Args:
            data: 请求数据
            
        Returns:
            JSON字符串
        """
        if data is None:
            return None
        return json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    
    def _add_signature(
        self,
        method: str,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """添加签名到请求头
        
        Args:
            method: HTTP方法
            url: 请求URL
            params: URL参数
            data: 请求数据
            
        Returns:
            签名请求头
        """
        signature = _generate_signature(
            method=method,
            url=url,
            params=params,
            data=data,
            secret_key=self.config.get_secret_key()
        )
        
        return {
            "X-AutoPay-Signature": signature,
            "X-AutoPay-Timestamp": str(int(time.time() * 1000)),
            "X-AutoPay-Nonce": str(int(time.time() * 1000))
        }
    
    def _make_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发起HTTP请求
        
        Args:
            method: HTTP方法
            path: API路径
            params: URL参数
            data: 请求数据
            headers: 额外请求头
            
        Returns:
            响应数据
        """
        url = self._prepare_url(path)
        json_data = self._prepare_data(data)
        
        # 准备请求头
        request_headers = {}
        if headers:
            request_headers.update(headers)
        
        # 添加签名
        signature_headers = self._add_signature(method, url, params, data)
        request_headers.update(signature_headers)
        request_headers.update(self.config.get_headers())
        
        # 移除Content-Length（requests会自动设置）
        request_headers.pop("Content-Length", None)
        
        self.logger.debug(f"请求: {method} {url}")
        if params:
            self.logger.debug(f"参数: {params}")
        if json_data:
            self.logger.debug(f"数据: {json_data}")
        
        # 发起请求
        max_retries = self.config.get_max_retries()
        retry_delay = self.config.get_retry_delay()
        
        for attempt in range(max_retries + 1):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    params=params,
                    data=json_data,
                    headers=request_headers
                )
                
                # 记录响应
                self.logger.debug(f"响应: {response.status_code}")
                if response.text:
                    self.logger.debug(f"响应内容: {response.text}")
                
                # 解析响应
                if response.status_code == 200:
                    try:
                        response_data = response.json()
                        return response_data
                    except json.JSONDecodeError as e:
                        raise NetworkException(
                            f"响应JSON解析失败: {e}",
                            http_status=response.status_code
                        )
                
                elif response.status_code == 401:
                    raise AuthenticationException("认证失败，请检查API密钥")
                elif response.status_code == 403:
                    raise AuthenticationException("权限不足")
                elif response.status_code == 429:
                    # 限流错误
                    if attempt < max_retries:
                        self.logger.warning(f"限流，第{attempt + 1}次重试...")
                        time.sleep(retry_delay * (2 ** attempt))
                        continue
                    else:
                        raise AuthenticationException("请求频率过高，请稍后重试")
                
                else:
                    # 其他错误
                    try:
                        error_data = response.json()
                        message = error_data.get("message", f"HTTP {response.status_code}")
                        raise NetworkException(message, http_status=response.status_code)
                    except:
                        raise NetworkException(f"HTTP {response.status_code}: {response.text}")
                        
            except requests.exceptions.Timeout:
                if attempt < max_retries:
                    self.logger.warning(f"超时，第{attempt + 1}次重试...")
                    time.sleep(retry_delay * (2 ** attempt))
                    continue
                else:
                    raise TimeoutException(f"请求超时 ({self.config.get_timeout()}秒)")
                    
            except requests.exceptions.ConnectionError as e:
                if attempt < max_retries:
                    self.logger.warning(f"连接错误，第{attempt + 1}次重试...")
                    time.sleep(retry_delay * (2 ** attempt))
                    continue
                else:
                    raise NetworkException(f"连接错误: {e}")
                    
            except Exception as e:
                raise NetworkException(f"请求异常: {e}")
        
        # 这里不会到达，但为类型检查保留
        raise NetworkException("未知错误")
    
    def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """GET请求
        
        Args:
            path: API路径
            params: URL参数
            
        Returns:
            响应数据
        """
        return self._make_request("GET", path, params=params)
    
    def post(self, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """POST请求
        
        Args:
            path: API路径
            data: 请求数据
            
        Returns:
            响应数据
        """
        return self._make_request("POST", path, data=data)
    
    def put(self, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """PUT请求
        
        Args:
            path: API路径
            data: 请求数据
            
        Returns:
            响应数据
        """
        return self._make_request("PUT", path, data=data)
    
    def delete(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """DELETE请求
        
        Args:
            path: API路径
            params: URL参数
            
        Returns:
            响应数据
        """
        return self._make_request("DELETE", path, params=params)
    
    def close(self) -> None:
        """关闭客户端"""
        self.session.close()


class AsyncHttpClient:
    """异步HTTP客户端"""
    
    def __init__(self, config: Config):
        """初始化异步HTTP客户端
        
        Args:
            config: 配置对象
        """
        self.config = config
        self.logger = _create_logger(config)
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """获取或创建会话"""
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(
                limit=100,
                limit_per_host=10,
                verify_ssl=self.config.is_ssl_verification_enabled()
            )
            
            timeout = aiohttp.ClientTimeout(
                total=self.config.get_timeout()
            )
            
            self._session = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout,
                headers=self.config.get_headers()
            )
        
        return self._session
    
    async def _prepare_url(self, path: str) -> str:
        """准备请求URL"""
        return urljoin(self.config.get_base_url(), path)
    
    async def _prepare_data(self, data: Optional[Dict[str, Any]]) -> Optional[str]:
        """准备请求数据"""
        if data is None:
            return None
        return json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    
    async def _add_signature(
        self,
        method: str,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """添加签名到请求头"""
        signature = _generate_signature(
            method=method,
            url=url,
            params=params,
            data=data,
            secret_key=self.config.get_secret_key()
        )
        
        return {
            "X-AutoPay-Signature": signature,
            "X-AutoPay-Timestamp": str(int(time.time() * 1000)),
            "X-AutoPay-Nonce": str(int(time.time() * 1000))
        }
    
    async def _make_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """发起HTTP请求"""
        session = await self._get_session()
        url = await self._prepare_url(path)
        json_data = await self._prepare_data(data)
        
        # 准备请求头
        request_headers = {}
        if headers:
            request_headers.update(headers)
        
        # 添加签名
        signature_headers = await self._add_signature(method, url, params, data)
        request_headers.update(signature_headers)
        request_headers.update(self.config.get_headers())
        
        # 移除Content-Length
        request_headers.pop("Content-Length", None)
        
        self.logger.debug(f"异步请求: {method} {url}")
        if params:
            self.logger.debug(f"参数: {params}")
        if json_data:
            self.logger.debug(f"数据: {json_data}")
        
        # 重试逻辑
        max_retries = self.config.get_max_retries()
        retry_delay = self.config.get_retry_delay()
        
        for attempt in range(max_retries + 1):
            try:
                async with session.request(
                    method=method,
                    url=url,
                    params=params,
                    data=json_data,
                    headers=request_headers
                ) as response:
                    
                    self.logger.debug(f"异步响应: {response.status}")
                    text = await response.text()
                    if text:
                        self.logger.debug(f"响应内容: {text}")
                    
                    if response.status == 200:
                        try:
                            response_data = await response.json()
                            return response_data
                        except aiohttp.ContentTypeError as e:
                            raise NetworkException(
                                f"响应JSON解析失败: {e}",
                                http_status=response.status
                            )
                    
                    elif response.status == 401:
                        raise AuthenticationException("认证失败，请检查API密钥")
                    elif response.status == 403:
                        raise AuthenticationException("权限不足")
                    elif response.status == 429:
                        if attempt < max_retries:
                            self.logger.warning(f"限流，第{attempt + 1}次重试...")
                            await asyncio.sleep(retry_delay * (2 ** attempt))
                            continue
                        else:
                            raise AuthenticationException("请求频率过高，请稍后重试")
                    
                    else:
                        try:
                            error_data = await response.json()
                            message = error_data.get("message", f"HTTP {response.status}")
                            raise NetworkException(message, http_status=response.status)
                        except:
                            raise NetworkException(f"HTTP {response.status}: {text}")
                            
            except asyncio.TimeoutError:
                if attempt < max_retries:
                    self.logger.warning(f"超时，第{attempt + 1}次重试...")
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                else:
                    raise TimeoutException(f"请求超时 ({self.config.get_timeout()}秒)")
                    
            except aiohttp.ClientError as e:
                if attempt < max_retries:
                    self.logger.warning(f"连接错误，第{attempt + 1}次重试...")
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                else:
                    raise NetworkException(f"连接错误: {e}")
                    
            except Exception as e:
                raise NetworkException(f"请求异常: {e}")
        
        raise NetworkException("未知错误")
    
    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """异步GET请求"""
        return await self._make_request("GET", path, params=params)
    
    async def post(self, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """异步POST请求"""
        return await self._make_request("POST", path, data=data)
    
    async def put(self, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """异步PUT请求"""
        return await self._make_request("PUT", path, data=data)
    
    async def delete(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """异步DELETE请求"""
        return await self._make_request("DELETE", path, params=params)
    
    async def close(self) -> None:
        """关闭客户端"""
        if self._session and not self._session.closed:
            await self._session.close()