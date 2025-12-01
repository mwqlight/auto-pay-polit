"""
系统服务模块

提供系统管理相关的API服务，包括：
- 系统健康检查
- 版本信息
- 系统配置
- 日志管理
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict, Any, List

from ..client import HttpClient
from ..exceptions import ValidationException
from ..models import (
    SystemHealth,
    VersionInfo,
    ApiResponse,
    ConfigData
)


class SystemService:
    """系统服务类"""
    
    def __init__(self, http_client: HttpClient):
        """初始化系统服务
        
        Args:
            http_client: HTTP客户端
        """
        self.http_client = http_client
        self.base_path = "/v1/system"
    
    def get_health(self) -> SystemHealth:
        """获取系统健康状态
        
        Returns:
            系统健康信息
        """
        response = self.http_client.get(f"{self.base_path}/health")
        
        health_data = response.get("data", {})
        return self._parse_system_health(health_data)
    
    def get_version(self) -> VersionInfo:
        """获取系统版本信息
        
        Returns:
            版本信息
        """
        response = self.http_client.get(f"{self.base_path}/version")
        
        version_data = response.get("data", {})
        return self._parse_version_info(version_data)
    
    def get_config(self) -> Dict[str, Any]:
        """获取系统配置
        
        Returns:
            系统配置
        """
        response = self.http_client.get(f"{self.base_path}/config")
        
        return response.get("data", {})
    
    def update_config(self, config: Dict[str, Any]) -> bool:
        """更新系统配置
        
        Args:
            config: 配置数据
            
        Returns:
            是否更新成功
        """
        response = self.http_client.patch(f"{self.base_path}/config", config)
        
        return response.get("success", False)
    
    def get_logs(
        self,
        level: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取系统日志
        
        Args:
            level: 日志级别
            start_time: 开始时间
            end_time: 结束时间
            limit: 返回数量限制
            
        Returns:
            日志列表
        """
        params = {"limit": limit}
        
        if level:
            params["level"] = level
        
        if start_time:
            params["start_time"] = start_time.isoformat()
        
        if end_time:
            params["end_time"] = end_time.isoformat()
        
        response = self.http_client.get(f"{self.base_path}/logs", params=params)
        
        logs_data = response.get("data", {})
        return logs_data.get("items", [])
    
    def get_metrics(self) -> Dict[str, Any]:
        """获取系统指标
        
        Returns:
            系统指标
        """
        response = self.http_client.get(f"{self.base_path}/metrics")
        
        return response.get("data", {})
    
    def get_uptime(self) -> Dict[str, Any]:
        """获取系统运行时间
        
        Returns:
            运行时间信息
        """
        response = self.http_client.get(f"{self.base_path}/uptime")
        
        return response.get("data", {})
    
    def get_services_status(self) -> Dict[str, Any]:
        """获取各个服务状态
        
        Returns:
            服务状态
        """
        response = self.http_client.get(f"{self.base_path}/services")
        
        return response.get("data", {})
    
    def restart_service(self, service_name: str) -> bool:
        """重启指定服务
        
        Args:
            service_name: 服务名称
            
        Returns:
            是否重启成功
        """
        response = self.http_client.post(f"{self.base_path}/services/{service_name}/restart")
        
        return response.get("success", False)
    
    def get_environment_info(self) -> Dict[str, Any]:
        """获取环境信息
        
        Returns:
            环境信息
        """
        response = self.http_client.get(f"{self.base_path}/environment")
        
        return response.get("data", {})
    
    def test_connectivity(self) -> Dict[str, Any]:
        """测试系统连通性
        
        Returns:
            连通性测试结果
        """
        response = self.http_client.get(f"{self.base_path}/connectivity")
        
        return response.get("data", {})
    
    def get_maintenance_info(self) -> Dict[str, Any]:
        """获取维护信息
        
        Returns:
            维护信息
        """
        response = self.http_client.get(f"{self.base_path}/maintenance")
        
        return response.get("data", {})
    
    def _parse_system_health(self, data: Dict[str, Any]) -> SystemHealth:
        """解析系统健康信息"""
        return SystemHealth(
            status=data.get("status"),
            version=data.get("version"),
            uptime=data.get("uptime", 0.0),
            services=data.get("services", {}),
            metrics=data.get("metrics", {})
        )
    
    def _parse_version_info(self, data: Dict[str, Any]) -> VersionInfo:
        """解析版本信息"""
        return VersionInfo(
            version=data.get("version"),
            build_time=data.get("build_time"),
            commit_hash=data.get("commit_hash"),
            features=data.get("features", []),
            changelog=data.get("changelog")
        )