"""
账户服务模块

提供账户管理相关的API服务，包括：
- 账户余额查询
- 交易记录查询
- 账户统计信息
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List

from ..client import HttpClient
from ..exceptions import ValidationException
from ..models import (
    AccountBalance,
    Transaction,
    TransactionListRequest,
    AccountStatistics,
    PaginatedResponse,
    ApiResponse,
    TransactionType
)


class AccountService:
    """账户服务类"""
    
    def __init__(self, http_client: HttpClient):
        """初始化账户服务
        
        Args:
            http_client: HTTP客户端
        """
        self.http_client = http_client
        self.base_path = "/v1/account"
    
    def get_balance(self, currency: Optional[str] = None) -> List[AccountBalance]:
        """获取账户余额
        
        Args:
            currency: 货币代码，如果为空则获取所有
            
        Returns:
            余额信息列表
        """
        params = {}
        if currency:
            params["currency"] = currency
        
        response = self.http_client.get(f"{self.base_path}/balance", params=params)
        
        balance_data = response.get("data", {})
        balances = balance_data.get("items", [])
        
        result = []
        for balance in balances:
            result.append(self._parse_account_balance(balance))
        
        return result
    
    def get_transactions(self, request: TransactionListRequest) -> PaginatedResponse:
        """获取交易记录
        
        Args:
            request: 交易列表请求
            
        Returns:
            交易记录列表响应
        """
        # 准备查询参数
        params = request.to_dict() if request.to_dict() else {}
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/transactions", params=params)
        
        # 解析分页响应
        return self._parse_paginated_response(response, Transaction)
    
    def get_transaction(self, transaction_id: str) -> Transaction:
        """获取指定交易记录
        
        Args:
            transaction_id: 交易ID
            
        Returns:
            交易记录
            
        Raises:
            ValidationException: 参数验证失败
        """
        if not transaction_id:
            raise ValidationException("transaction_id不能为空")
        
        response = self.http_client.get(f"{self.base_path}/transactions/{transaction_id}")
        
        transaction_data = response.get("data", {})
        return self._parse_transaction(transaction_data)
    
    def get_statistics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        period: str = "daily"
    ) -> AccountStatistics:
        """获取账户统计信息
        
        Args:
            start_time: 开始时间
            end_time: 结束时间
            period: 统计期间 (daily, weekly, monthly, yearly)
            
        Returns:
            账户统计信息
        """
        params = {"period": period}
        if start_time:
            params["start_time"] = start_time.isoformat()
        if end_time:
            params["end_time"] = end_time.isoformat()
        
        response = self.http_client.get(f"{self.base_path}/statistics", params=params)
        
        stats_data = response.get("data", {})
        return self._parse_account_statistics(stats_data)
    
    def export_transactions(
        self,
        request: TransactionListRequest,
        format: str = "csv"
    ) -> Dict[str, Any]:
        """导出交易记录
        
        Args:
            request: 交易列表请求
            format: 导出格式 (csv, xlsx, json)
            
        Returns:
            导出结果
        """
        if format not in ["csv", "xlsx", "json"]:
            raise ValidationException("不支持的导出格式")
        
        # 准备查询参数
        params = request.to_dict() if request.to_dict() else {}
        params["format"] = format
        
        # 发起请求
        response = self.http_client.get(f"{self.base_path}/transactions/export", params=params)
        
        return response.get("data", {})
    
    def get_transaction_by_payment(self, payment_id: str) -> List[Transaction]:
        """根据支付ID获取关联的交易记录
        
        Args:
            payment_id: 支付ID
            
        Returns:
            交易记录列表
        """
        if not payment_id:
            raise ValidationException("payment_id不能为空")
        
        params = {"payment_id": payment_id}
        
        response = self.http_client.get(f"{self.base_path}/transactions/by-payment", params=params)
        
        transactions_data = response.get("data", {})
        transactions = transactions_data.get("items", [])
        
        result = []
        for transaction in transactions:
            result.append(self._parse_transaction(transaction))
        
        return result
    
    def search_transactions(
        self,
        keyword: str,
        transaction_type: Optional[TransactionType] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        pagination: Optional[Dict[str, Any]] = None
    ) -> PaginatedResponse:
        """搜索交易记录
        
        Args:
            keyword: 搜索关键词
            transaction_type: 交易类型
            start_time: 开始时间
            end_time: 结束时间
            pagination: 分页参数
            
        Returns:
            搜索结果
        """
        params = {"keyword": keyword}
        
        if transaction_type:
            params["transaction_type"] = transaction_type.value
        
        if start_time:
            params["start_time"] = start_time.isoformat()
        
        if end_time:
            params["end_time"] = end_time.isoformat()
        
        if pagination:
            params.update(pagination)
        
        response = self.http_client.get(f"{self.base_path}/transactions/search", params=params)
        
        # 解析分页响应
        return self._parse_paginated_response(response, Transaction)
    
    def get_revenue_daily(self, days: int = 30) -> List[Dict[str, Any]]:
        """获取每日收入统计
        
        Args:
            days: 天数，默认30天
            
        Returns:
            每日收入数据
        """
        if days <= 0 or days > 365:
            raise ValidationException("天数必须在1-365之间")
        
        params = {"days": days}
        
        response = self.http_client.get(f"{self.base_path}/revenue/daily", params=params)
        
        return response.get("data", {}).get("items", [])
    
    def get_revenue_monthly(self, months: int = 12) -> List[Dict[str, Any]]:
        """获取每月收入统计
        
        Args:
            months: 月数，默认12个月
            
        Returns:
            每月收入数据
        """
        if months <= 0 or months > 36:
            raise ValidationException("月数必须在1-36之间")
        
        params = {"months": months}
        
        response = self.http_client.get(f"{self.base_path}/revenue/monthly", params=params)
        
        return response.get("data", {}).get("items", [])
    
    def _parse_account_balance(self, data: Dict[str, Any]) -> AccountBalance:
        """解析账户余额"""
        return AccountBalance(
            currency=data.get("currency"),
            available_balance=Decimal(str(data.get("available_balance", "0"))),
            frozen_balance=Decimal(str(data.get("frozen_balance", "0"))),
            total_balance=Decimal(str(data.get("total_balance", "0"))),
            updated_at=datetime.fromisoformat(data.get("updated_at").replace('Z', '+00:00'))
        )
    
    def _parse_transaction(self, data: Dict[str, Any]) -> Transaction:
        """解析交易记录"""
        return Transaction(
            transaction_id=data.get("transaction_id"),
            type=TransactionType(data.get("type")),
            amount=Decimal(str(data.get("amount", "0"))),
            currency=data.get("currency"),
            status=data.get("status"),
            payment_id=data.get("payment_id"),
            description=data.get("description"),
            created_at=datetime.fromisoformat(data.get("created_at").replace('Z', '+00:00')),
            completed_at=datetime.fromisoformat(data.get("completed_at").replace('Z', '+00:00')) if data.get("completed_at") else None,
            metadata=data.get("metadata", {})
        )
    
    def _parse_account_statistics(self, data: Dict[str, Any]) -> AccountStatistics:
        """解析账户统计信息"""
        return AccountStatistics(
            total_income=Decimal(str(data.get("total_income", "0"))),
            total_outcome=Decimal(str(data.get("total_outcome", "0"))),
            transaction_count=data.get("transaction_count", 0),
            success_rate=data.get("success_rate", 0.0),
            average_transaction_amount=Decimal(str(data.get("average_transaction_amount", "0"))),
            period=data.get("period")
        )
    
    def _parse_paginated_response(self, response: Dict[str, Any], item_type) -> PaginatedResponse:
        """解析分页响应"""
        data = response.get("data", {})
        items_data = data.get("items", [])
        
        items = []
        for item_data in items_data:
            if item_type == Transaction:
                items.append(self._parse_transaction(item_data))
            else:
                items.append(item_data)
        
        return PaginatedResponse(
            items=items,
            total=data.get("total", 0),
            page=data.get("page", 1),
            page_size=data.get("page_size", 20),
            total_pages=data.get("total_pages", 1)
        )