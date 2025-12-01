"""
支付服务模块

提供支付相关的所有API服务，包括：
- 支付创建、查询、关闭
- 退款操作
- 支付状态管理
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List

from ..client import HttpClient
from ..exceptions import AutoPayException, ValidationException
from ..models import (
    PaymentRequest,
    PaymentResponse,
    PaymentQueryRequest,
    PaymentListRequest,
    PaymentStatistics,
    PaymentStatus,
    PaginatedResponse,
    ApiResponse
)


class PaymentService:
    """支付服务类"""
    
    def __init__(self, http_client: HttpClient):
        """初始化支付服务
        
        Args:
            http_client: HTTP客户端
        """
        self.http_client = http_client
        self.base_path = "/v1/payments"
    
    def create_payment(self, request: PaymentRequest) -> PaymentResponse:
        """创建支付
        
        Args:
            request: 支付请求
            
        Returns:
            支付响应
            
        Raises:
            ValidationException: 参数验证失败
        """
        # 验证请求参数
        self._validate_payment_request(request)
        
        # 准备请求数据
        data = {
            "amount": str(request.amount),
            "currency": request.currency,
            "method": request.method.value,
            "order_id": request.order_id,
            "description": request.description,
            "metadata": request.metadata,
            "callback_url": request.callback_url,
            "return_url": request.return_url,
            "cancel_url": request.cancel_url,
            "customer": request.customer,
            "expire_time": request.expire_time.isoformat() if request.expire_time else None,
            "is_auto_close": request.is_auto_close
        }
        
        # 移除空值
        data = {k: v for k, v in data.items() if v is not None}
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}", data)
        
        # 解析响应
        return self._parse_payment_response(response)
    
    def get_payment(self, request: PaymentQueryRequest) -> PaymentResponse:
        """查询支付
        
        Args:
            request: 查询请求
            
        Returns:
            支付响应
            
        Raises:
            ValidationException: 参数验证失败
        """
        if not request.payment_id and not request.order_id:
            raise ValidationException("payment_id或order_id至少需要一个")
        
        # 准备查询参数
        params = {}
        if request.payment_id:
            params["payment_id"] = request.payment_id
        if request.order_id:
            params["order_id"] = request.order_id
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}", params=params)
        
        # 解析响应
        return self._parse_payment_response(response)
    
    def close_payment(self, payment_id: str) -> bool:
        """关闭支付
        
        Args:
            payment_id: 支付ID
            
        Returns:
            是否成功关闭
        """
        if not payment_id:
            raise ValidationException("payment_id不能为空")
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}/{payment_id}/close")
        
        # 检查响应
        return response.get("success", False)
    
    def list_payments(self, request: PaymentListRequest) -> PaginatedResponse:
        """获取支付列表
        
        Args:
            request: 列表请求
            
        Returns:
            支付列表响应
        """
        # 准备查询参数
        params = request.to_dict() if request.to_dict() else {}
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}", params=params)
        
        # 解析分页响应
        return self._parse_paginated_response(response, PaymentResponse)
    
    def get_payment_statistics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        payment_method: Optional[str] = None
    ) -> PaymentStatistics:
        """获取支付统计
        
        Args:
            start_time: 开始时间
            end_time: 结束时间
            payment_method: 支付方式
            
        Returns:
            支付统计
        """
        params = {}
        if start_time:
            params["start_time"] = start_time.isoformat()
        if end_time:
            params["end_time"] = end_time.isoformat()
        if payment_method:
            params["payment_method"] = payment_method
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/statistics", params=params)
        
        # 解析统计响应
        return self._parse_statistics_response(response)
    
    def verify_payment(self, payment_id: str, order_id: Optional[str] = None) -> Dict[str, Any]:
        """验证支付状态
        
        Args:
            payment_id: 支付ID
            order_id: 订单ID
            
        Returns:
            验证结果
        """
        if not payment_id:
            raise ValidationException("payment_id不能为空")
        
        params = {"payment_id": payment_id}
        if order_id:
            params["order_id"] = order_id
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/verify", params=params)
        
        return response.get("data", {})
    
    def cancel_payment(self, payment_id: str, reason: Optional[str] = None) -> bool:
        """取消支付
        
        Args:
            payment_id: 支付ID
            reason: 取消原因
            
        Returns:
            是否成功取消
        """
        if not payment_id:
            raise ValidationException("payment_id不能为空")
        
        data = {}
        if reason:
            data["reason"] = reason
        
        # 发起请求
        response = self.http_client.post(f"{self.base_path}/{payment_id}/cancel", data)
        
        return response.get("success", False)
    
    def _validate_payment_request(self, request: PaymentRequest) -> None:
        """验证支付请求"""
        if request.amount <= 0:
            raise ValidationException("支付金额必须大于0")
        
        if not request.currency or len(request.currency) != 3:
            raise ValidationException("货币代码必须为3位ISO代码")
        
        if not request.method:
            raise ValidationException("支付方式不能为空")
    
    def _parse_payment_response(self, response: Dict[str, Any]) -> PaymentResponse:
        """解析支付响应"""
        data = response.get("data", {})
        
        return PaymentResponse(
            payment_id=data.get("payment_id"),
            order_id=data.get("order_id"),
            status=PaymentStatus(data.get("status")),
            amount=Decimal(data.get("amount", "0")),
            currency=data.get("currency"),
            method=data.get("method"),
            qr_code=data.get("qr_code"),
            payment_url=data.get("payment_url"),
            description=data.get("description"),
            created_at=datetime.fromisoformat(data.get("created_at").replace('Z', '+00:00')),
            expire_time=datetime.fromisoformat(data.get("expire_time").replace('Z', '+00:00')) if data.get("expire_time") else None,
            metadata=data.get("metadata", {})
        )
    
    def _parse_paginated_response(self, response: Dict[str, Any], item_type) -> PaginatedResponse:
        """解析分页响应"""
        data = response.get("data", {})
        items_data = data.get("items", [])
        
        items = []
        for item_data in items_data:
            if item_type == PaymentResponse:
                items.append(self._parse_payment_response({"data": item_data}))
            else:
                items.append(item_data)
        
        return PaginatedResponse(
            items=items,
            total=data.get("total", 0),
            page=data.get("page", 1),
            page_size=data.get("page_size", 20),
            total_pages=data.get("total_pages", 1)
        )
    
    def _parse_statistics_response(self, response: Dict[str, Any]) -> PaymentStatistics:
        """解析统计响应"""
        data = response.get("data", {})
        
        return PaymentStatistics(
            total_count=data.get("total_count", 0),
            total_amount=Decimal(str(data.get("total_amount", "0"))),
            success_count=data.get("success_count", 0),
            success_amount=Decimal(str(data.get("success_amount", "0"))),
            failed_count=data.get("failed_count", 0),
            failed_amount=Decimal(str(data.get("failed_amount", "0"))),
            pending_count=data.get("pending_count", 0),
            pending_amount=Decimal(str(data.get("pending_amount", "0"))),
            refund_count=data.get("refund_count", 0),
            refund_amount=Decimal(str(data.get("refund_amount", "0")))
        )