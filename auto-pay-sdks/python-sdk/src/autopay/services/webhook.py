"""
回调处理服务模块

提供WebHook回调处理相关的功能，包括：
- 回调事件处理
- 签名验证
- 事件重试机制
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from urllib.parse import parse_qs, urlparse

from ..client import HttpClient
from ..exceptions import SignatureException, ValidationException
from ..models import WebhookPayload, WebhookEvent
from ..models import PaymentStatus


class WebhookService:
    """回调处理服务类"""
    
    def __init__(self, http_client: HttpClient, secret_key: str):
        """初始化回调处理服务
        
        Args:
            http_client: HTTP客户端
            secret_key: 回调密钥
        """
        self.http_client = http_client
        self.secret_key = secret_key
        self.logger = logging.getLogger("autopay.webhook")
        self.base_path = "/v1/webhooks"
        
        # 事件处理器映射
        self.event_handlers: Dict[str, Callable] = {}
        
        # 事件重试配置
        self.retry_config = {
            "max_retries": 3,
            "retry_intervals": [1, 5, 15],  # 重试间隔（分钟）
            "retry_count": 0
        }
    
    def register_handler(self, event_type: str, handler: Callable[[WebhookPayload], None]) -> None:
        """注册事件处理器
        
        Args:
            event_type: 事件类型
            handler: 事件处理函数
        """
        self.event_handlers[event_type] = handler
        self.logger.info(f"已注册事件处理器: {event_type}")
    
    def handle_webhook(self, payload: WebhookPayload) -> bool:
        """处理回调事件
        
        Args:
            payload: 回调载荷
            
        Returns:
            处理是否成功
        """
        try:
            # 验证签名
            if not payload.verify_signature(self.secret_key):
                raise SignatureException("回调签名验证失败")
            
            # 获取事件处理器
            handler = self.event_handlers.get(payload.event_type)
            if not handler:
                self.logger.warning(f"未注册事件处理器: {payload.event_type}")
                return False
            
            # 处理事件
            try:
                handler(payload)
                self.logger.info(f"事件处理成功: {payload.event_type}")
                return True
            except Exception as e:
                self.logger.error(f"事件处理失败: {payload.event_type}, 错误: {e}")
                return False
                
        except Exception as e:
            self.logger.error(f"回调处理异常: {e}")
            return False
    
    def verify_signature(
        self,
        payload: str,
        signature: str,
        timestamp: Optional[str] = None,
        nonce: Optional[str] = None
    ) -> bool:
        """验证回调签名
        
        Args:
            payload: 请求体
            signature: 签名
            timestamp: 时间戳
            nonce: 随机数
            
        Returns:
            签名是否有效
        """
        # 生成签名字符串
        sign_str = f"{payload}\n{timestamp}\n{nonce}" if timestamp and nonce else payload
        
        # HMAC-SHA256签名
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            sign_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # 时间戳验证（防止重放攻击）
        if timestamp:
            try:
                ts = int(timestamp)
                current_ts = int(datetime.now().timestamp() * 1000)
                if abs(current_ts - ts) > 300000:  # 5分钟
                    self.logger.warning("回调时间戳过期")
                    return False
            except ValueError:
                return False
        
        return hmac.compare_digest(signature, expected_signature)
    
    def parse_webhook_data(self, raw_data: str, headers: Dict[str, str]) -> WebhookPayload:
        """解析回调数据
        
        Args:
            raw_data: 原始数据
            headers: 请求头
            
        Returns:
            解析后的回调载荷
        """
        try:
            data = json.loads(raw_data)
        except json.JSONDecodeError as e:
            raise ValidationException(f"JSON格式错误: {e}")
        
        # 提取签名信息
        signature = headers.get("X-AutoPay-Signature")
        timestamp = headers.get("X-AutoPay-Timestamp")
        nonce = headers.get("X-AutoPay-Nonce")
        
        # 创建载荷对象
        payload = WebhookPayload(
            event_type=data.get("event_type"),
            event_id=data.get("event_id"),
            timestamp=datetime.fromisoformat(data.get("timestamp").replace('Z', '+00:00')),
            data=data.get("data", {}),
            signature=signature
        )
        
        return payload
    
    def process_webhook_request(self, raw_data: str, headers: Dict[str, str]) -> bool:
        """处理回调请求
        
        Args:
            raw_data: 原始请求数据
            headers: 请求头
            
        Returns:
            处理是否成功
        """
        try:
            # 解析数据
            payload = self.parse_webhook_data(raw_data, headers)
            
            # 验证签名
            if not self.verify_signature(
                raw_data,
                payload.signature or "",
                headers.get("X-AutoPay-Timestamp"),
                headers.get("X-AutoPay-Nonce")
            ):
                raise SignatureException("签名验证失败")
            
            # 处理事件
            return self.handle_webhook(payload)
            
        except Exception as e:
            self.logger.error(f"回调请求处理失败: {e}")
            return False
    
    def register_webhook(
        self,
        webhook_url: str,
        event_types: List[str],
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """注册WebHook
        
        Args:
            webhook_url: 回调URL
            event_types: 监听的事件类型
            description: 描述
            
        Returns:
            注册结果
        """
        data = {
            "webhook_url": webhook_url,
            "event_types": event_types,
            "description": description
        }
        
        response = self.http_client.post(f"{self.base_path}/register", data)
        
        return response.get("data", {})
    
    def get_webhooks(self) -> List[Dict[str, Any]]:
        """获取已注册的WebHook列表
        
        Returns:
            WebHook列表
        """
        response = self.http_client.get(f"{self.base_path}")
        
        data = response.get("data", {})
        return data.get("items", [])
    
    def delete_webhook(self, webhook_id: str) -> bool:
        """删除WebHook
        
        Args:
            webhook_id: WebHook ID
            
        Returns:
            是否删除成功
        """
        response = self.http_client.delete(f"{self.base_path}/{webhook_id}")
        
        return response.get("success", False)
    
    def get_webhook_logs(self, webhook_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取WebHook日志
        
        Args:
            webhook_id: WebHook ID
            
        Returns:
            日志列表
        """
        params = {}
        if webhook_id:
            params["webhook_id"] = webhook_id
        
        response = self.http_client.get(f"{self.base_path}/logs", params=params)
        
        data = response.get("data", {})
        return data.get("items", [])
    
    def test_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """测试WebHook
        
        Args:
            webhook_id: WebHook ID
            
        Returns:
            测试结果
        """
        response = self.http_client.post(f"{self.base_path}/{webhook_id}/test")
        
        return response.get("data", {})


# 预定义的事件处理器

def payment_succeeded_handler(payload: WebhookPayload) -> None:
    """支付成功事件处理器"""
    payment_data = payload.data
    payment_id = payment_data.get("payment_id")
    order_id = payment_data.get("order_id")
    amount = payment_data.get("amount")
    
    print(f"支付成功 - 支付ID: {payment_id}, 订单ID: {order_id}, 金额: {amount}")


def payment_failed_handler(payload: WebhookPayload) -> None:
    """支付失败事件处理器"""
    payment_data = payload.data
    payment_id = payment_data.get("payment_id")
    order_id = payment_data.get("order_id")
    error_message = payment_data.get("error_message")
    
    print(f"支付失败 - 支付ID: {payment_id}, 订单ID: {order_id}, 错误: {error_message}")


def refund_completed_handler(payload: WebhookPayload) -> None:
    """退款完成事件处理器"""
    refund_data = payload.data
    refund_id = refund_data.get("refund_id")
    payment_id = refund_data.get("payment_id")
    amount = refund_data.get("amount")
    
    print(f"退款完成 - 退款ID: {refund_id}, 支付ID: {payment_id}, 金额: {amount}")


def channel_status_changed_handler(payload: WebhookPayload) -> None:
    """渠道状态变更事件处理器"""
    channel_data = payload.data
    channel_id = channel_data.get("channel_id")
    old_status = channel_data.get("old_status")
    new_status = channel_data.get("new_status")
    
    print(f"渠道状态变更 - 渠道ID: {channel_id}, 状态: {old_status} -> {new_status}")


# 默认事件类型映射
DEFAULT_EVENT_HANDLERS = {
    "payment.succeeded": payment_succeeded_handler,
    "payment.failed": payment_failed_handler,
    "refund.completed": refund_completed_handler,
    "channel.status_changed": channel_status_changed_handler,
}