"""
主服务类

整合所有服务模块，提供统一的接口入口。
"""

from __future__ import annotations

import logging
from typing import Optional, Dict, Any, List

from .client import HttpClient
from .config import Config
from .models import (
    Environment,
    PaymentRequest,
    RefundRequest,
    ChannelInfo,
    AccountBalance,
    SystemHealth
)
from .services.payment import PaymentService
from .services.refund import RefundService
from .services.channel import ChannelService
from .services.account import AccountService
from .services.system import SystemService
from .services.webhook import WebhookService
from .exceptions import AutoPayException, ConfigurationException


class AutoPayService:
    """AutoPay统一服务类"""
    
    def __init__(self, config: Config):
        """初始化AutoPay服务
        
        Args:
            config: 配置对象
            
        Raises:
            ConfigurationException: 配置验证失败
        """
        self.config = config
        self.logger = logging.getLogger("autopay.service")
        
        # 验证配置
        self._validate_config()
        
        # 初始化HTTP客户端
        self.http_client = HttpClient(config)
        
        # 初始化各服务模块
        self.payment_service = PaymentService(self.http_client)
        self.refund_service = RefundService(self.http_client)
        self.channel_service = ChannelService(self.http_client)
        self.account_service = AccountService(self.http_client)
        self.system_service = SystemService(self.http_client)
        
        # 初始化Webhook服务
        self.webhook_service = WebhookService(self.http_client, config.get_secret_key())
        
        self.logger.info("AutoPay服务初始化成功")
    
    @classmethod
    def create(cls, **config_kwargs) -> AutoPayService:
        """创建AutoPay服务实例
        
        Args:
            **config_kwargs: 配置参数
            
        Returns:
            AutoPay服务实例
            
        Raises:
            ConfigurationException: 配置验证失败
        """
        config = Config(**config_kwargs)
        return cls(config)
    
    @classmethod
    def create_with_dict(cls, config_dict: Dict[str, Any]) -> AutoPayService:
        """从字典创建AutoPay服务实例
        
        Args:
            config_dict: 配置字典
            
        Returns:
            AutoPay服务实例
        """
        config = Config.from_dict(config_dict)
        return cls(config)
    
    def get_payment_service(self) -> PaymentService:
        """获取支付服务
        
        Returns:
            支付服务实例
        """
        return self.payment_service
    
    def get_refund_service(self) -> RefundService:
        """获取退款服务
        
        Returns:
            退款服务实例
        """
        return self.refund_service
    
    def get_channel_service(self) -> ChannelService:
        """获取渠道服务
        
        Returns:
            渠道服务实例
        """
        return self.channel_service
    
    def get_account_service(self) -> AccountService:
        """获取账户服务
        
        Returns:
            账户服务实例
        """
        return self.account_service
    
    def get_system_service(self) -> SystemService:
        """获取系统服务
        
        Returns:
            系统服务实例
        """
        return self.system_service
    
    def get_webhook_service(self) -> WebhookService:
        """获取Webhook服务
        
        Returns:
            Webhook服务实例
        """
        return self.webhook_service
    
    def get_config(self) -> Config:
        """获取配置对象
        
        Returns:
            配置对象
        """
        return self.config
    
    def get_health_status(self) -> SystemHealth:
        """获取系统健康状态
        
        Returns:
            系统健康信息
        """
        return self.system_service.get_health()
    
    def verify_payment(self, payment_id: str, order_id: Optional[str] = None) -> bool:
        """快速验证支付状态
        
        Args:
            payment_id: 支付ID
            order_id: 订单ID
            
        Returns:
            支付是否成功
        """
        result = self.payment_service.verify_payment(payment_id, order_id)
        return result.get("success", False)
    
    def get_default_channel(self, payment_method: str) -> Optional[ChannelInfo]:
        """获取默认渠道
        
        Args:
            payment_method: 支付方式
            
        Returns:
            默认渠道信息
        """
        from .models import PaymentMethod
        
        try:
            method = PaymentMethod(payment_method)
            return self.channel_service.get_default_channel(method)
        except ValueError:
            return None
    
    def create_simple_payment(
        self,
        amount: float,
        currency: str,
        payment_method: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """创建简单支付
        
        Args:
            amount: 金额
            currency: 货币代码
            payment_method: 支付方式
            description: 描述
            
        Returns:
            支付结果
        """
        from .models import PaymentMethod, Decimal
        
        method = PaymentMethod(payment_method)
        
        request = PaymentRequest(
            amount=Decimal(str(amount)),
            currency=currency,
            method=method,
            description=description
        )
        
        response = self.payment_service.create_payment(request)
        
        return {
            "payment_id": response.payment_id,
            "order_id": response.order_id,
            "status": response.status.value,
            "amount": str(response.amount),
            "currency": response.currency,
            "method": response.method.value,
            "qr_code": response.qr_code,
            "payment_url": response.payment_url,
            "created_at": response.created_at.isoformat()
        }
    
    def batch_refund(self, refunds: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量退款
        
        Args:
            refunds: 退款列表
            
        Returns:
            批量退款结果
        """
        return self.refund_service.batch_refund(refunds)
    
    def get_account_summary(self) -> Dict[str, Any]:
        """获取账户摘要信息
        
        Returns:
            账户摘要
        """
        # 获取余额
        balances = self.account_service.get_balance()
        balance_dict = {}
        for balance in balances:
            balance_dict[balance.currency] = {
                "available": str(balance.available_balance),
                "frozen": str(balance.frozen_balance),
                "total": str(balance.total_balance)
            }
        
        # 获取统计信息
        stats = self.account_service.get_statistics()
        
        return {
            "balances": balance_dict,
            "statistics": {
                "total_income": str(stats.total_income),
                "total_outcome": str(stats.total_outcome),
                "transaction_count": stats.transaction_count,
                "success_rate": stats.success_rate,
                "average_amount": str(stats.average_transaction_amount),
                "period": stats.period
            }
        }
    
    def get_channel_health_summary(self) -> Dict[str, Any]:
        """获取渠道健康摘要
        
        Returns:
            渠道健康摘要
        """
        health_info = self.channel_service.get_channel_health()
        
        summary = {
            "total_channels": len(health_info),
            "healthy_channels": 0,
            "warning_channels": 0,
            "critical_channels": 0,
            "channels": []
        }
        
        for health in health_info:
            if health.status == "healthy":
                summary["healthy_channels"] += 1
            elif health.status == "warning":
                summary["warning_channels"] += 1
            elif health.status == "critical":
                summary["critical_channels"] += 1
            
            summary["channels"].append({
                "channel_id": health.channel_id,
                "status": health.status,
                "response_time": health.response_time,
                "success_rate": health.success_rate,
                "last_check": health.last_check.isoformat()
            })
        
        return summary
    
    def export_transaction_report(
        self,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        format: str = "csv"
    ) -> Dict[str, Any]:
        """导出交易报告
        
        Args:
            start_time: 开始时间
            end_time: 结束时间
            format: 导出格式
            
        Returns:
            导出结果
        """
        from .models import TransactionListRequest, PaginationParams
        from datetime import datetime
        
        request = TransactionListRequest()
        
        if start_time:
            try:
                request.start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        if end_time:
            try:
                request.end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        return self.account_service.export_transactions(request, format)
    
    def cleanup(self) -> None:
        """清理资源"""
        try:
            self.http_client.close()
            self.logger.info("AutoPay服务资源清理完成")
        except Exception as e:
            self.logger.error(f"资源清理失败: {e}")
    
    def _validate_config(self) -> None:
        """验证配置"""
        if not self.config.get_api_key():
            raise ConfigurationException("API Key不能为空")
        
        if not self.config.get_secret_key():
            raise ConfigurationException("Secret Key不能为空")
        
        if not self.config.get_base_url():
            raise ConfigurationException("Base URL不能为空")