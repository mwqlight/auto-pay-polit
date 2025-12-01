#!/usr/bin/env python3
"""
AutoPay Python SDK 简化示例程序
演示基本的使用方法
"""

import asyncio
from autopay import create_client, Environment


def basic_example():
    """基础使用示例"""
    print("🚀 AutoPay Python SDK 基础使用示例")
    print("=" * 50)
    
    try:
        # 1. 创建客户端
        print("\n1. 创建客户端:")
        client = create_client(
            api_key="your_api_key",
            secret_key="your_secret_key",
            environment=Environment.SANDBOX
        )
        print("✅ 客户端创建成功")
        
        # 2. 创建支付
        print("\n2. 创建支付:")
        # 直接使用HTTP客户端发送请求
        payment_response = client.http_client.post('/api/v1/payments', {
            "amount": 100.00,
            "currency": "CNY", 
            "method": "alipay",
            "description": "测试支付",
            "order_id": "TEST_ORDER_001"
        })
        
        if payment_response.get('success'):
            print(f"✅ 支付创建成功:")
            print(f"   支付ID: {payment_response.get('data', {}).get('payment_id', 'N/A')}")
            print(f"   支付状态: {payment_response.get('data', {}).get('status', 'unknown')}")
        else:
            print(f"❌ 支付创建失败: {payment_response.get('message', '未知错误')}")
        
        # 3. 获取支付信息
        print("\n3. 获取支付信息:")
        payment_id = payment_response.get('data', {}).get('payment_id')
        if payment_id:
            payment_info = client.http_client.get(f'/api/v1/payments/{payment_id}')
            if payment_info.get('success'):
                print(f"✅ 支付信息获取成功")
                print(f"   金额: {payment_info.get('data', {}).get('amount', 'N/A')}")
                print(f"   状态: {payment_info.get('data', {}).get('status', 'unknown')}")
            else:
                print(f"❌ 获取支付信息失败: {payment_info.get('message')}")
        else:
            print("❌ 无法获取支付信息：缺少支付ID")
        
        # 4. 渠道健康检查
        print("\n4. 渠道健康检查:")
        health = client.get_channel_health_summary()
        print(f"✅ 渠道状态:")
        print(f"   总渠道数: {health['total_channels']}")
        print(f"   健康渠道: {health['healthy_channels']}")
        
        print("\n🎉 基础示例运行完成!")
        
    except Exception as e:
        print(f"❌ 示例执行失败: {e}")
        print("💡 请检查API密钥配置是否正确")
    
    finally:
        try:
            client.cleanup()
        except:
            pass


async def async_example():
    """异步使用示例"""
    print("\n📱 AutoPay Python SDK 异步使用示例")
    print("=" * 50)
    
    try:
        # 创建异步客户端
        print("\n1. 创建异步客户端:")
        client = create_client(
            api_key="your_api_key",
            secret_key="your_secret_key", 
            environment=Environment.SANDBOX
        )
        print("✅ 异步客户端创建成功")
        
        # 模拟并发支付创建
        print("\n2. 模拟并发支付:")
        payments = []
        for i in range(3):
            payment_data = {
                'amount': 50.0 + i * 10,
                'currency': 'CNY',
                'method': 'alipay',
                'description': f'异步支付测试 {i+1}',
                'order_id': f'ASYNC_TEST_{i+1}'
            }
            
            # 直接发送HTTP请求
            response = await client.http_client.post('/api/v1/payments', payment_data)
            if response.get('success'):
                payments.append(response)
                payment_id = response.get('data', {}).get('payment_id', 'N/A')
                print(f"   创建支付 {i+1}: {payment_id}")
            else:
                print(f"   创建支付 {i+1}: 失败 - {response.get('message', '未知错误')}")
        
        print(f"✅ 完成了 {len(payments)} 个支付创建")
        
        print("\n🎉 异步示例运行完成!")
        
    except Exception as e:
        print(f"❌ 异步示例执行失败: {e}")
    
    finally:
        try:
            client.cleanup()
        except:
            pass


def error_handling_example():
    """错误处理示例"""
    print("\n🛡️  AutoPay Python SDK 错误处理示例")
    print("=" * 50)
    
    # 1. 配置错误处理
    print("\n1. 配置错误处理:")
    try:
        client = create_client(
            api_key="",  # 无效的API密钥
            secret_key="",
            environment=Environment.SANDBOX
        )
    except Exception as e:
        print(f"   ✅ 正确捕获配置错误: {type(e).__name__}")
    
    # 2. 正常配置验证
    print("\n2. 正常配置:")
    try:
        client = create_client(
            api_key="test_key",
            secret_key="test_secret",
            environment=Environment.SANDBOX
        )
        print("   ✅ 客户端创建成功")
        client.cleanup()
    except Exception as e:
        print(f"   ❌ 创建失败: {e}")
    
    print("\n✅ 错误处理示例完成!")


def main():
    """主函数"""
    print("🎯 AutoPay Python SDK 示例程序")
    print("这是一个完整的AutoPay Python SDK使用演示")
    
    # 运行各种示例
    basic_example()
    asyncio.run(async_example())
    error_handling_example()
    
    print("\n🎊 所有示例运行完成!")
    print("\n📖 更多信息请参考:")
    print("   - README.md: 项目说明和快速开始")
    print("   - docs/: 详细文档目录")
    print("   - examples/: 更多示例代码")


if __name__ == "__main__":
    main()