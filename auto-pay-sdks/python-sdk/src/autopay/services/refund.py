"""
退款服务模块

提供退款相关的所有API服务，包括：
- 退款创建、查询
- 退款状态管理
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List

from ..client import HttpClient
from ..exceptions import ValidationException
from ..models import (
    RefundRequest,
    RefundResponse,
    RefundListRequest,
    PaginatedResponse,
    ApiResponse
)


class RefundService:
    """退款服务类"""
    
    def __init__(self, http_client: HttpClient):
        """初始化退款服务
        
        Args:
            http_client: HTTP客户端
        """
        self.http_client = http_client
        self.base_path = "/v1/refunds"
    
    def create_refund(self, request: RefundRequest) -> RefundResponse:
        """创建退款
        
        Args:
            request: 退款请求
            
        Returns:
            退款响应
            
        Raises:
            ValidationException: 参数验证失败
        """
        # 验证请求参数
        self._validate_refund_request(request)
        
        # 准备请求数据
        data = {
            "payment_id": request.payment_id,
            "amount": str(request.amount) if request.amount else None,
            "reason": request.reason,
            "metadata": request.metadata,
            "callback_url": request.callback_url
        }
        
        # 移除空值
        data = {k: v for k, v in data.items() if v is not None}
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}", data)
        
        # 解析响应
        return self._parse_refund_response(response)
    
    def get_refund(self, refund_id: str) -> RefundResponse:
        """查询退款
        
        Args:
            refund_id: 退款ID
            
        Returns:
            退款响应
            
        Raises:
            ValidationException: 参数验证失败
        """
        if not refund_id:
            raise ValidationException("refund_id不能为空")
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/{refund_id}")
        
        # 解析响应
        return self._parse_refund_response(response)
    
    def list_refunds(self, request: RefundListRequest) -> PaginatedResponse:
        """获取退款列表
        
        Args:
            request: 列表请求
            
        Returns:
            退款列表响应
        """
        # 准备查询参数
        params = request.to_dict() if request.to_dict() else {}
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}", params=params)
        
        # 解析分页响应
        return self._parse_paginated_response(response, RefundResponse)
    
    def cancel_refund(self, refund_id: str, reason: Optional[str] = None) -> bool:
        """取消退款
        
        Args:
            refund_id: 退款ID
            reason: 取消原因
            
        Returns:
            是否成功取消
        """
        if not refund_id:
            raise ValidationException("refund_id不能为空")
        
        data = {}
        if reason:
            data["reason"] = reason
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}/{refund_id}/cancel", data)
        
        return response.get("success", False)
    
    def get_refund_statistics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """获取退款统计
        
        Args:
            start_time: 开始时间
            end_time: 结束时间
            
        Returns:
            退款统计
        """
        params = {}
        if start_time:
            params["start_time"] = start_time.isoformat()
        if end_time:
            params["end_time"] = end_time.isoformat()
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/statistics", params=params)
        
        return response.get("data", {})
    
    def batch_refund(self, refunds: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量退款
        
        Args:
            refunds: 退款列表
            
        Returns:
            批量退款结果
        """
        if not refunds:
            raise ValidationException("退款列表不能为空")
        
        data = {"refunds": refunds}
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}/batch", data)
        
        return response.get("data", {})
    
    def _validate_refund_request(self, request: RefundRequest) -> None:
        """验证退款请求"""
        if not request.payment_id:
            raise ValidationException("payment_id不能为空")
        
        if request.amount and request.amount <= 0:
            raise ValidationException("退款金额必须大于0")
    
    def _parse_refund_response(self, response: Dict[str, Any]) -> RefundResponse:
        """解析退款响应"""
        data = response.get("data", {})
        
        return RefundResponse(
            refund_id=data.get("refund_id"),
            payment_id=data.get("payment_id"),
            amount=Decimal(data.get("amount", "0")),
            reason=data.get("reason"),
            status=PaymentStatus(data.get("status")),
            created_at=datetime.fromisoformat(data.get("created_at").replace('Z', '+00:00')),
            completed_at=datetime.fromisoformat(data.get("completed_at").replace('Z', '+00:00')) if data.get("completed_at") else None,
            metadata=data.get("metadata", {})
        )
    
    def _parse_paginated_response(self, response: Dict[str, Any], item_type) -> PaginatedResponse:
        """解析分页响应"""
        data = response.get("data", {})
        items_data = data.get("items", [])
        
        items = []
        for item_data in items_data:
            if item_type == RefundResponse:
                items.append(self._parse_refund_response({"data": item_data}))
            else:
                items.append(item_data)
        
        return PaginatedResponse(
            items=items,
            total=data.get("total", 0),
            page=data.get("page", 1),
            page_size=data.get("page_size", 20),
            total_pages=data.get("total_pages", 1)
        )