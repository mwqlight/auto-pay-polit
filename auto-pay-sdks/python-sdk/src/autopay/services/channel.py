"""
渠道服务模块

提供支付渠道管理相关的API服务，包括：
- 渠道信息查询
- 渠道状态管理
- 渠道健康监控
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict, Any, List

from ..client import HttpClient
from ..exceptions import ValidationException
from ..models import (
    ChannelInfo,
    ChannelHealthInfo,
    ChannelStatistics,
    PaginatedResponse,
    ApiResponse,
    ChannelStatus
)


class ChannelService:
    """渠道服务类"""
    
    def __init__(self, http_client: HttpClient):
        """初始化渠道服务
        
        Args:
            http_client: HTTP客户端
        """
        self.http_client = http_client
        self.base_path = "/v1/channels"
    
    def get_channels(self) -> List[ChannelInfo]:
        """获取所有渠道信息
        
        Returns:
            渠道信息列表
        """
        response = self.http_client.get(self.base_path)
        
        channels_data = response.get("data", {})
        channels = channels_data.get("items", [])
        
        result = []
        for channel_data in channels:
            result.append(self._parse_channel_info(channel_data))
        
        return result
    
    def get_channel(self, channel_id: str) -> ChannelInfo:
        """获取指定渠道信息
        
        Args:
            channel_id: 渠道ID
            
        Returns:
            渠道信息
            
        Raises:
            ValidationException: 参数验证失败
        """
        if not channel_id:
            raise ValidationException("channel_id不能为空")
        
        response = self.http_client.get(f"{self.base_path}/{channel_id}")
        
        channel_data = response.get("data", {})
        return self._parse_channel_info(channel_data)
    
    def get_default_channel(self, payment_method: PaymentMethod) -> ChannelInfo:
        """获取指定支付方式的默认渠道
        
        Args:
            payment_method: 支付方式
            
        Returns:
            默认渠道信息
        """
        params = {"payment_method": payment_method.value}
        
        response = self.http_client.get(f"{self.base_path}/default", params=params)
        
        channel_data = response.get("data", {})
        return self._parse_channel_info(channel_data)
    
    def set_default_channel(self, channel_id: str) -> bool:
        """设置默认渠道
        
        Args:
            channel_id: 渠道ID
            
        Returns:
            是否设置成功
        """
        if not channel_id:
            raise ValidationException("channel_id不能为空")
        
        response = self.http_client.post(f"{self.base_path}/{channel_id}/set-default")
        
        return response.get("success", False)
    
    def update_channel_status(self, channel_id: str, status: ChannelStatus) -> bool:
        """更新渠道状态
        
        Args:
            channel_id: 渠道ID
            status: 新状态
            
        Returns:
            是否更新成功
        """
        if not channel_id:
            raise ValidationException("channel_id不能为空")
        
        if not status:
            raise ValidationException("status不能为空")
        
        data = {"status": status.value}
        
        response = self.http_client.patch(f"{self.base_path}/{channel_id}", data)
        
        return response.get("success", False)
    
    def get_channel_health(self, channel_id: Optional[str] = None) -> List[ChannelHealthInfo]:
        """获取渠道健康信息
        
        Args:
            channel_id: 渠道ID，如果为空则获取所有
            
        Returns:
            渠道健康信息列表
        """
        params = {}
        if channel_id:
            params["channel_id"] = channel_id
        
        response = self.http_client.get(f"{self.base_path}/health", params=params)
        
        health_data = response.get("data", {})
        health_items = health_data.get("items", [])
        
        result = []
        for health_item in health_items:
            result.append(self._parse_channel_health_info(health_item))
        
        return result
    
    def get_channel_statistics(
        self,
        channel_id: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[ChannelStatistics]:
        """获取渠道统计信息
        
        Args:
            channel_id: 渠道ID
            start_time: 开始时间
            end_time: 结束时间
            
        Returns:
            渠道统计信息列表
        """
        params = {}
        if channel_id:
            params["channel_id"] = channel_id
        if start_time:
            params["start_time"] = start_time.isoformat()
        if end_time:
            params["end_time"] = end_time.isoformat()
        
        response = self.http_client.get(f"{self.base_path}/statistics", params=params)
        
        stats_data = response.get("data", {})
        stats_items = stats_data.get("items", [])
        
        result = []
        for stats_item in stats_items:
            result.append(self._parse_channel_statistics(stats_item))
        
        return result
    
    def switch_channel(self, channel_id: str, enabled: bool) -> bool:
        """切换渠道启用状态
        
        Args:
            channel_id: 渠道ID
            enabled: 是否启用
            
        Returns:
            是否切换成功
        """
        if not channel_id:
            raise ValidationException("channel_id不能为空")
        
        data = {"enabled": enabled}
        
        response = self.http_client.post(f"{self.base_path}/{channel_id}/switch", data)
        
        return response.get("success", False)
    
    def test_channel(self, channel_id: str) -> Dict[str, Any]:
        """测试渠道连通性
        
        Args:
            channel_id: 渠道ID
            
        Returns:
            测试结果
        """
        if not channel_id:
            raise ValidationException("channel_id不能为空")
        
        response = self.http_client.post(f"{self.base_path}/{channel_id}/test")
        
        return response.get("data", {})
    
    def _parse_channel_info(self, data: Dict[str, Any]) -> ChannelInfo:
        """解析渠道信息"""
        return ChannelInfo(
            channel_id=data.get("channel_id"),
            name=data.get("name"),
            method=PaymentMethod(data.get("method")),
            status=ChannelStatus(data.get("status")),
            is_default=data.get("is_default", False),
            priority=data.get("priority", 0),
            config=data.get("config", {}),
            health_status=data.get("health_status", {}),
            metadata=data.get("metadata", {})
        )
    
    def _parse_channel_health_info(self, data: Dict[str, Any]) -> ChannelHealthInfo:
        """解析渠道健康信息"""
        return ChannelHealthInfo(
            channel_id=data.get("channel_id"),
            status=data.get("status"),
            response_time=data.get("response_time", 0.0),
            success_rate=data.get("success_rate", 0.0),
            last_check=datetime.fromisoformat(data.get("last_check").replace('Z', '+00:00')),
            details=data.get("details", {})
        )
    
    def _parse_channel_statistics(self, data: Dict[str, Any]) -> ChannelStatistics:
        """解析渠道统计信息"""
        from decimal import Decimal
        
        return ChannelStatistics(
            channel_id=data.get("channel_id"),
            total_transactions=data.get("total_transactions", 0),
            success_rate=data.get("success_rate", 0.0),
            total_amount=Decimal(str(data.get("total_amount", "0"))),
            average_response_time=data.get("average_response_time", 0.0),
            error_rate=data.get("error_rate", 0.0),
            uptime=data.get("uptime", 0.0)
        )