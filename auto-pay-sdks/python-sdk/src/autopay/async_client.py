"""
异步HTTP客户端

基于aiohttp实现的异步HTTP客户端。
"""

from __future__ import annotations

import asyncio
import logging
import json
import time
from typing import Optional, Dict, Any, List, Union, Callable, Literal
from urllib.parse import urljoin, urlencode

import aiohttp
from aiohttp import ClientSession, ClientTimeout, ClientResponse, ClientConnectorError
try:
    from aiohttp_socks import ProxyConnector
except ImportError:
    ProxyConnector = None
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend

from .config import Config
from .exceptions import (
    NetworkException,
    TimeoutException,
    ValidationException,
    RateLimitException,
    AutoPayException
)


class AsyncHttpClient:
    """异步HTTP客户端"""
    
    def __init__(self, config: Config):
        """初始化异步HTTP客户端
        
        Args:
            config: 配置对象
        """
        self.config = config
        self.logger = logging.getLogger("autopay.async_client")
        self.session: Optional[ClientSession] = None
        self._request_count = 0
        self._last_request_time = 0.0
        
        # 请求限制配置
        self.rate_limit_enabled = getattr(config, 'rate_limit_enabled', True)
        self.rate_limit_requests = getattr(config, 'rate_limit_requests', 100)
        self.rate_limit_window = getattr(config, 'rate_limit_window', 60)
        self._request_times: List[float] = []
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        await self.close()
    
    async def _ensure_session(self) -> ClientSession:
        """确保session已创建"""
        if self.session is None or self.session.closed:
            connector = await self._create_connector()
            
            timeout = ClientTimeout(
                total=getattr(self.config, 'timeout_seconds', 30),
                connect=getattr(self.config, 'connect_timeout_seconds', 10),
                sock_read=getattr(self.config, 'read_timeout_seconds', 30)
            )
            
            self.session = ClientSession(
                connector=connector,
                timeout=timeout,
                headers={
                    'User-Agent': self.config.get_user_agent(),
                    'Content-Type': 'application/json'
                }
            )
        
        return self.session
    
    async def _create_connector(self):
        """创建连接器"""
        connector_kwargs = {
            'limit': getattr(self.config, 'connection_pool_size', 100),
            'limit_per_host': getattr(self.config, 'connection_pool_size_per_host', 30),
            'ttl_dns_cache': 300,
            'use_dns_cache': True,
            'keepalive_timeout': 60,
            'enable_cleanup_closed': True,
            'backend': 'default',
        }
        
        # 配置代理
        proxy_url = self.config.get_proxy_url()
        if proxy_url:
            # 使用SOCKS代理
            if proxy_url.startswith('socks://'):
                connector_kwargs['connector'] = ProxyConnector.from_url(proxy_url)
            else:
                connector_kwargs['connector'] = aiohttp.TCPConnector(**connector_kwargs)
                # 代理配置会在请求级别处理
        else:
            connector_kwargs['connector'] = aiohttp.TCPConnector(**connector_kwargs)
        
        return connector_kwargs.get('connector', aiohttp.TCPConnector(**connector_kwargs))
    
    def _check_rate_limit(self) -> None:
        """检查请求限制"""
        if not self.rate_limit_enabled:
            return
        
        now = time.time()
        
        # 清理过期的请求时间
        self._request_times = [t for t in self._request_times if now - t < self.rate_limit_window]
        
        # 检查是否超过限制
        if len(self._request_times) >= self.rate_limit_requests:
            raise RateLimitException(f"请求频率限制: 每{self.rate_limit_window}秒最多{self.rate_limit_requests}次请求")
        
        self._request_times.append(now)
    
    def _sign_request(
        self,
        method: str,
        path: str,
        query_params: Optional[Dict[str, Any]],
        body: Optional[Union[str, Dict[str, Any]]],
        headers: Optional[Dict[str, str]]
    ) -> str:
        """生成请求签名
        
        Args:
            method: HTTP方法
            path: 请求路径
            query_params: 查询参数
            body: 请求体
            headers: 请求头
            
        Returns:
            Base64编码的签名
        """
        from .utils import generate_signature, sort_dict_by_key
        
        # 构建签名字符串
        lines = [
            method.upper(),
            path,
            urlencode(sort_dict_by_key(query_params or {})) if query_params else '',
            json.dumps(body or {}, separators=(',', ':'), ensure_ascii=False) if body else '',
            headers.get('X-Timestamp', '') if headers else ''
        ]
        
        sign_string = '\n'.join(lines)
        
        # 使用RSA-SHA256签名
        secret_key = self.config.get_secret_key()
        if secret_key and secret_key.startswith('-----BEGIN'):
            try:
                # 私钥格式
                private_key = serialization.load_pem_private_key(
                    secret_key.encode('utf-8'),
                    password=None,
                    backend=default_backend()
                )
                
                signature_bytes = private_key.sign(
                    sign_string.encode('utf-8'),
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH
                    ),
                    hashes.SHA256()
                )
                
                import base64
                return base64.b64encode(signature_bytes).decode('utf-8')
            except Exception as e:
                self.logger.warning(f"RSA签名失败: {e}，使用HMAC签名")
        
        # 备用HMAC-SHA256签名
        return generate_signature(sign_string, self.config.get_secret_key())
    
    def _prepare_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Union[str, Dict[str, Any]]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """准备请求参数
        
        Args:
            method: HTTP方法
            endpoint: 端点
            params: 查询参数
            data: 请求体数据
            headers: 请求头
            timeout: 超时时间
            
        Returns:
            准备好的请求参数
        """
        # 合并默认头和自定义头
        request_headers = {
            'X-Timestamp': str(int(time.time() * 1000)),
            'X-Request-ID': f"async-{int(time.time() * 1000)}-{self._request_count}",
            **self.config.get_default_headers()
        }
        
        if headers:
            request_headers.update(headers)
        
        # 准备查询参数
        query_params = self.config.get_default_params() or {}
        if params:
            query_params.update(params)
        
        # 准备请求体
        request_data = data
        if data and not isinstance(data, str):
            request_data = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            request_headers['Content-Length'] = str(len(request_data))
        
        # 构建完整URL
        base_url = self.config.get_base_url()
        full_url = urljoin(base_url, endpoint.lstrip('/'))
        
        # 生成签名
        signature = self._sign_request(
            method, endpoint, query_params, request_data, request_headers
        )
        request_headers['Authorization'] = f"Bearer {signature}"
        
        return {
            'method': method.upper(),
            'url': full_url,
            'params': query_params,
            'data': request_data,
            'headers': request_headers,
            'timeout': timeout or self.config.get_timeout_seconds()
        }
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Union[str, Dict[str, Any]]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None,
        retries: int = 3,
        retry_delay: float = 1.0
    ) -> Dict[str, Any]:
        """发起HTTP请求
        
        Args:
            method: HTTP方法
            endpoint: 端点
            params: 查询参数
            data: 请求体
            headers: 请求头
            timeout: 超时时间
            retries: 重试次数
            retry_delay: 重试延迟
            
        Returns:
            响应数据
        """
        await self._ensure_session()
        
        if self.session is None:
            raise NetworkException("HTTP会话未初始化")
        
        self._check_rate_limit()
        self._request_count += 1
        self._last_request_time = time.time()
        
        # 准备请求参数
        request_params = self._prepare_request(
            method, endpoint, params, data, headers, timeout
        )
        
        last_exception = None
        
        for attempt in range(retries + 1):
            try:
                self.logger.debug(f"发起{attempt + 1}次请求: {request_params['method']} {request_params['url']}")
                
                async with self.session.request(**request_params) as response:
                    response_data = await self._handle_response(response)
                    
                    # 检查是否需要重试
                    if self._should_retry(response.status, response_data):
                        if attempt < retries:
                            delay = retry_delay * (2 ** attempt)
                            self.logger.warning(f"请求失败，{delay}秒后重试: {response.status}")
                            await asyncio.sleep(delay)
                            continue
                    
                    return response_data
            
            except asyncio.TimeoutError as e:
                last_exception = TimeoutException(f"请求超时: {method} {request_params['url']}")
                if attempt < retries:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise last_exception
            
            except (ClientConnectorError, aiohttp.ClientError) as e:
                last_exception = NetworkException(f"网络错误: {str(e)}")
                if attempt < retries:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise last_exception
            
            except Exception as e:
                last_exception = AutoPayException(f"未知错误: {str(e)}")
                if attempt < retries:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise last_exception
        
        if last_exception:
            raise last_exception
    
    def _should_retry(self, status_code: int, response_data: Dict[str, Any]) -> bool:
        """判断是否需要重试
        
        Args:
            status_code: HTTP状态码
            response_data: 响应数据
            
        Returns:
            是否需要重试
        """
        # 5xx错误和429（请求限制）需要重试
        if status_code >= 500 or status_code == 429:
            return True
        
        # 检查响应中的业务错误码
        if 'code' in response_data:
            error_code = response_data['code']
            # 假设这些错误码需要重试
            retry_codes = [10001, 10002, 10003]  # 服务器繁忙、网络错误等
            if error_code in retry_codes:
                return True
        
        return False
    
    async def _handle_response(self, response: ClientResponse) -> Dict[str, Any]:
        """处理响应
        
        Args:
            response: HTTP响应对象
            
        Returns:
            响应数据
            
        Raises:
            AutoPayException: 处理响应时发生错误
        """
        try:
            # 获取响应文本
            response_text = await response.text()
            
            # 记录响应信息
            self.logger.debug(f"响应状态: {response.status}, 内容: {response_text[:500]}...")
            
            # 检查HTTP状态码
            if response.status == 429:
                retry_after = response.headers.get('Retry-After', '60')
                raise RateLimitException(f"请求频率限制，超时 {retry_after} 秒后重试")
            
            if response.status >= 400:
                error_msg = f"HTTP错误 {response.status}"
                try:
                    error_data = json.loads(response_text)
                    if 'message' in error_data:
                        error_msg = error_data['message']
                    if 'code' in error_data:
                        error_msg = f"错误码 {error_data['code']}: {error_msg}"
                except json.JSONDecodeError:
                    error_msg = f"HTTP错误 {response.status}: {response_text}"
                
                raise NetworkException(error_msg)
            
            # 解析JSON响应
            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError:
                raise NetworkException(f"无效的JSON响应: {response_text}")
            
            # 检查业务状态码
            if 'code' in response_data:
                if response_data['code'] != 200:
                    message = response_data.get('message', '未知错误')
                    raise NetworkException(f"业务错误 {response_data['code']}: {message}")
            
            return response_data
        
        except AutoPayException:
            raise
        
        except Exception as e:
            raise AutoPayException(f"响应处理错误: {str(e)}")
    
    async def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """发起GET请求
        
        Args:
            endpoint: 端点
            params: 查询参数
            headers: 请求头
            timeout: 超时时间
            
        Returns:
            响应数据
        """
        return await self._make_request('GET', endpoint, params, None, headers, timeout)
    
    async def post(
        self,
        endpoint: str,
        data: Optional[Union[str, Dict[str, Any]]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """发起POST请求
        
        Args:
            endpoint: 端点
            data: 请求体数据
            params: 查询参数
            headers: 请求头
            timeout: 超时时间
            
        Returns:
            响应数据
        """
        return await self._make_request('POST', endpoint, params, data, headers, timeout)
    
    async def put(
        self,
        endpoint: str,
        data: Optional[Union[str, Dict[str, Any]]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """发起PUT请求
        
        Args:
            endpoint: 端点
            data: 请求体数据
            params: 查询参数
            headers: 请求头
            timeout: 超时时间
            
        Returns:
            响应数据
        """
        return await self._make_request('PUT', endpoint, params, data, headers, timeout)
    
    async def delete(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """发起DELETE请求
        
        Args:
            endpoint: 端点
            params: 查询参数
            headers: 请求头
            timeout: 超时时间
            
        Returns:
            响应数据
        """
        return await self._make_request('DELETE', endpoint, params, None, headers, timeout)
    
    async def batch_request(
        self,
        requests: List[Dict[str, Any]],
        timeout: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """批量请求
        
        Args:
            requests: 请求列表
            timeout: 超时时间
            
        Returns:
            响应列表
        """
        semaphores = asyncio.Semaphore(10)  # 限制并发数量
        
        async def single_request(request_params: Dict[str, Any]) -> Dict[str, Any]:
            async with semaphores:
                try:
                    return await self._make_request(
                        request_params.get('method', 'GET'),
                        request_params['endpoint'],
                        request_params.get('params'),
                        request_params.get('data'),
                        request_params.get('headers'),
                        timeout or request_params.get('timeout')
                    )
                except Exception as e:
                    return {'error': str(e), 'request': request_params}
        
        # 创建所有任务
        tasks = [single_request(req) for req in requests]
        
        # 并发执行所有请求
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理异常结果
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                processed_results.append({'error': str(result)})
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def close(self) -> None:
        """关闭客户端"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.logger.info("异步HTTP客户端已关闭")
    
    def get_request_count(self) -> int:
        """获取请求计数
        
        Returns:
            请求总数
        """
        return self._request_count
    
    def get_last_request_time(self) -> float:
        """获取最后请求时间
        
        Returns:
            最后请求时间戳
        """
        return self._last_request_time
    
    async def get_session_info(self) -> Dict[str, Any]:
        """获取会话信息
        
        Returns:
            会话信息
        """
        if not self.session or self.session.closed:
            return {'status': 'closed'}
        
        return {
            'status': 'active',
            'request_count': self._request_count,
            'last_request_time': self._last_request_time,
            'timeout_total': self.session.timeout.total,
            'timeout_connect': self.session.timeout.connect,
            'timeout_sock_read': self.session.timeout.sock_read
        }