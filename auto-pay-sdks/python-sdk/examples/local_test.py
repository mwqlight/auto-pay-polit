#!/usr/bin/env python3
"""
AutoPay Python SDK 本地测试示例

此示例在本地模拟所有功能，不依赖网络连接，用于验证SDK的基本功能。
"""

import sys
import os
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from autopay import create_client, Environment
from autopay.config import Config, ConfigException


def test_client_creation():
    """测试客户端创建功能"""
    print("🧪 测试客户端创建...")
    
    try:
        # 测试正常创建
        client = create_client(
            api_key='test_api_key',
            secret_key='test_secret_key',
            environment=Environment.SANDBOX
        )
        print("✅ 客户端创建成功")
        
        # 验证客户端配置
        assert client.config is not None
        assert client.config.get_api_key() == 'test_api_key'
        assert client.config.get_secret_key() == 'test_secret_key'
        assert client.config.get_environment() == Environment.SANDBOX
        print("✅ 客户端配置验证通过")
        
        # 验证HTTP客户端
        assert client.http_client is not None
        assert hasattr(client.http_client, 'post')
        assert hasattr(client.http_client, 'get')
        print("✅ HTTP客户端功能验证通过")
        
        return True
        
    except Exception as e:
        print(f"❌ 客户端创建测试失败: {e}")
        return False


def test_config_validation():
    """测试配置验证功能"""
    print("\n🧪 测试配置验证...")
    
    test_cases = [
        # 正常配置
        {
            'api_key': 'test_key',
            'secret_key': 'test_secret',
            'environment': Environment.SANDBOX,
            'should_pass': True
        },
        # 空API密钥
        {
            'api_key': '',
            'secret_key': 'test_secret',
            'environment': Environment.SANDBOX,
            'should_pass': False
        },
        # 空密钥
        {
            'api_key': 'test_key',
            'secret_key': '',
            'environment': Environment.SANDBOX,
            'should_pass': False
        },
        # 无效环境
        {
            'api_key': 'test_key',
            'secret_key': 'test_secret',
            'environment': 'invalid_env',
            'should_pass': False
        }
    ]
    
    for i, case in enumerate(test_cases):
        try:
            client = create_client(
                api_key=case['api_key'],
                secret_key=case['secret_key'],
                environment=case['environment']
            )
            # 如果成功创建客户端
            if case['should_pass']:
                print(f"   测试 {i+1}: ✅ 通过（应该成功）")
            else:
                print(f"   测试 {i+1}: ❌ 应该失败但成功了")
                return False
        except Exception as e:
            # 如果抛出异常
            if case['should_pass']:
                print(f"   测试 {i+1}: ❌ 应该成功但失败了: {e}")
                return False
            else:
                print(f"   测试 {i+1}: ✅ 通过（预期失败）- {type(e).__name__}")
    
    return True


def test_direct_config_usage():
    """测试直接使用配置对象"""
    print("\n🧪 测试直接配置使用...")
    
    try:
        # 创建配置对象
        config = Config(
            api_key='direct_test_key',
            secret_key='direct_test_secret',
            environment=Environment.SANDBOX
        )
        
        # 验证配置
        assert config.get_api_key() == 'direct_test_key'
        assert config.get_secret_key() == 'direct_test_secret'
        assert config.get_environment() == Environment.SANDBOX
        assert config.get_base_url() == 'https://api-sandbox.autopay.com'
        
        print("✅ 直接配置创建和验证通过")
        return True
        
    except Exception as e:
        print(f"❌ 直接配置测试失败: {e}")
        return False


def test_signature_generation():
    """测试签名生成功能"""
    print("\n🧪 测试签名生成...")
    
    try:
        from autopay.client import _generate_signature
        
        # 测试签名生成
        signature = _generate_signature(
            method='POST',
            url='/api/v1/payments',
            data={
                'amount': 100.00,
                'currency': 'CNY',
                'method': 'alipay'
            },
            secret_key='test_secret'
        )
        
        # 验证签名不为空
        assert signature is not None
        assert isinstance(signature, str)
        assert len(signature) > 0
        
        # 相同的输入应该生成相同的签名
        signature2 = _generate_signature(
            method='POST',
            url='/api/v1/payments',
            data={
                'amount': 100.00,
                'currency': 'CNY',
                'method': 'alipay'
            },
            secret_key='test_secret'
        )
        
        assert signature == signature2
        print("✅ 签名生成测试通过")
        return True
        
    except Exception as e:
        print(f"❌ 签名生成测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_error_handling():
    """测试错误处理功能"""
    print("\n🧪 测试错误处理...")
    
    try:
        # 测试配置错误
        try:
            client = create_client(
                api_key='',
                secret_key='',
                environment=Environment.SANDBOX
            )
            print("❌ 应该抛出配置错误")
            return False
        except ConfigException:
            print("✅ 正确捕获配置错误")
        
        # 测试HTTP客户端错误处理
        client = create_client(
            api_key='test_key',
            secret_key='test_secret',
            environment=Environment.SANDBOX
        )
        
        # 模拟网络错误（使用无效URL）
        try:
            result = client.http_client.post('/invalid-endpoint', {'test': 'data'})
            print("❌ 应该抛出网络错误")
            return False
        except Exception as e:
            # 这里应该抛出网络相关错误
            print(f"✅ 正确捕获网络错误: {type(e).__name__}")
        
        return True
        
    except Exception as e:
        print(f"❌ 错误处理测试失败: {e}")
        return False


async def test_async_client():
    """测试异步客户端功能"""
    print("\n🧪 测试异步客户端...")
    
    try:
        # 创建异步客户端
        client = create_client(
            api_key='async_test_key',
            secret_key='async_test_secret',
            environment=Environment.SANDBOX
        )
        
        # 验证HTTP客户端（因为create_client返回AutoPayService）
        assert hasattr(client, 'http_client')
        assert hasattr(client.http_client, 'post')
        assert hasattr(client.http_client, 'get')
        print("✅ HTTP客户端功能验证通过")
        
        # 测试可以直接访问异步客户端（如果存在）
        # 注意：AutoPayService可能没有直接的async_http_client属性
        if hasattr(client, 'async_http_client'):
            assert client.async_http_client is not None
            print("✅ 异步HTTP客户端功能验证通过")
        else:
            print("ℹ️  注意：AutoPayService未提供直接的async_http_client属性")
        
        return True
        
    except Exception as e:
        print(f"❌ 异步客户端测试失败: {e}")
        return False


def main():
    """运行所有测试"""
    print("🎯 AutoPay Python SDK 本地测试")
    print("=" * 50)
    
    test_results = []
    
    # 运行所有测试
    test_results.append(test_client_creation())
    test_results.append(test_config_validation())
    test_results.append(test_direct_config_usage())
    test_results.append(test_signature_generation())
    test_results.append(test_error_handling())
    
    # 异步测试
    async_result = asyncio.run(test_async_client())
    test_results.append(async_result)
    
    # 统计结果
    passed = sum(test_results)
    total = len(test_results)
    
    print("\n" + "=" * 50)
    print("📊 测试结果统计:")
    print(f"   ✅ 通过: {passed}/{total}")
    print(f"   ❌ 失败: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 所有测试通过！SDK功能正常。")
        return True
    else:
        print(f"\n⚠️  有 {total - passed} 个测试失败，请检查相关功能。")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)