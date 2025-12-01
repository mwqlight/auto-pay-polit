#!/usr/bin/env python3
"""
AutoPay Python SDK 使用示例

本示例演示如何使用AutoPay Python SDK进行各种支付操作。
"""

import asyncio
import sys
from pathlib import Path

# 添加src目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from autopay import (
    create_client, 
    Environment, 
    PaymentMethod
)


def basic_example():
    """基础使用示例"""
    print("=== 基础使用示例 ===")
    
    # 创建AutoPay客户端
    client = create_client(
        api_key="your_api_key",
        secret_key="your_secret_key",
        environment=Environment.SANDBOX
    )
    
    try:
        # 1. 创建简单支付
        print("\n1. 创建简单支付:")
        payment_result = client.create_simple_payment(
            amount=100.00,
            currency="CNY",
            payment_method="alipay",
            description="测试订单 - 基础示例"
        )
        
        print(f"  支付ID: {payment_result['payment_id']}")
        print(f"  订单ID: {payment_result['order_id']}")
        print(f"  支付状态: {payment_result['status']}")
        print(f"  支付URL: {payment_result.get('payment_url', 'N/A')}")
        
        # 2. 验证支付状态
        print("\n2. 验证支付状态:")
        payment_id = payment_result['payment_id']
        is_paid = client.verify_payment(payment_id)
        print(f"  支付是否成功: {is_paid}")
        
        # 3. 获取渠道信息
        print("\n3. 获取默认渠道:")
        default_channel = client.get_default_channel("alipay")
        if default_channel:
            print(f"  渠道ID: {default_channel.channel_id}")
            print(f"  渠道名称: {default_channel.name}")
            print(f"  状态: {default_channel.status}")
        
        # 4. 获取账户摘要
        print("\n4. 获取账户摘要:")
        account_summary = client.get_account_summary()
        print(f"  余额信息: {account_summary['balances']}")
        print(f"  统计信息: {account_summary['statistics']}")
        
        print("\n✅ 基础示例运行成功!")
        
    except Exception as e:
        print(f"❌ 基础示例执行失败: {e}")
    
    finally:
        client.cleanup()


def advanced_example():
    """高级功能示例"""
    print("\n=== 高级功能示例 ===")
    
    client = create_client(
        api_key="your_api_key",
        secret_key="your_secret_key",
        environment=Environment.SANDBOX,
        timeout=60,
        max_retries=3
    )
    
    try:
        payment_service = client.get_payment_service()
        refund_service = client.get_refund_service()
        channel_service = client.get_channel_service()
        
        # 1. 创建复杂支付请求
        print("\n1. 创建复杂支付:")
        
        # 直接使用字典创建支付请求
        payment_data = {
            "amount": 299.99,
            "currency": "CNY",
            "method": PaymentMethod.WECHAT_PAY.value,
            "description": "高级示例 - 多功能支付",
            "order_id": f"ADV_{asyncio.get_event_loop().time()}",
            "notify_url": "https://your-domain.com/webhook",
            "return_url": "https://your-domain.com/return"
        }
        
        payment_response = payment_service.create_payment(payment_data)
        print(f"  支付ID: {payment_response.payment_id}")
        print(f"  支付状态: {payment_response.status.value}")
        print(f"  金额: {payment_response.amount}")
        print(f"  二维码: {payment_response.qr_code[:50]}..." if payment_response.qr_code else "  无二维码")
        
        # 2. 获取支付列表
        print("\n2. 获取支付列表:")
        payments = payment_service.get_payment_list(page=1, size=5)
        print(f"  总数: {payments.total}")
        print(f"  支付列表: {[p.payment_id for p in payments.items]}")
        
        # 3. 渠道管理
        print("\n3. 渠道健康检查:")
        health_summary = client.get_channel_health_summary()
        print(f"  总渠道数: {health_summary['total_channels']}")
        print(f"  健康渠道: {health_summary['healthy_channels']}")
        print(f"  警告渠道: {health_summary['warning_channels']}")
        
        # 4. 批量退款操作
        print("\n4. 批量退款操作:")
        refunds = [
            {"payment_id": "pay_123456", "amount": 50.00, "reason": "部分退款"},
            {"payment_id": "pay_123457", "amount": 30.00, "reason": "商品质量问题"}
        ]
        
        batch_result = refund_service.batch_refund(refunds)
        print(f"  批量退款结果: {batch_result}")
        
        print("\n✅ 高级示例运行成功!")
        
    except Exception as e:
        print(f"❌ 高级示例执行失败: {e}")
    
    finally:
        client.cleanup()


async def async_example():
    """异步使用示例"""
    print("\n=== 异步使用示例 ===")
    
    from autopay import AsyncHttpClient, Config
    
    config = Config(
        api_key="your_api_key",
        secret_key="your_secret_key",
        environment=Environment.SANDBOX,
        timeout=60
    )
    
    try:
        # 创建异步客户端
        async with AsyncHttpClient(config) as http_client:
            # 并发创建多个支付
            print("\n1. 并发创建多个支付:")
            
            tasks = []
            for i in range(3):
                task = http_client.post('/api/v1/payments', {
                    "amount": 100.00 + i * 50,
                    "currency": "CNY",
                    "method": "alipay",
                    "description": f"异步示例订单 {i+1}",
                    "order_id": f"ASYNC_{i+1}_{asyncio.get_event_loop().time()}"
                })
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"  订单 {i+1}: 失败 - {result}")
                else:
                    payment_id = result.get('data', {}).get('payment_id', 'N/A')
                    print(f"  订单 {i+1}: 成功 - {payment_id}")
            
            # 批量请求示例
            print("\n2. 批量请求示例:")
            batch_requests = [
                {"method": "GET", "endpoint": "/api/v1/payments", "params": {"page": 1, "size": 10}},
                {"method": "GET", "endpoint": "/api/v1/refunds", "params": {"page": 1, "size": 5}},
                {"method": "GET", "endpoint": "/api/v1/channels"},
            ]
            
            batch_results = await http_client.batch_request(batch_requests)
            for i, result in enumerate(batch_results):
                if 'error' in result:
                    print(f"  请求 {i+1}: 失败 - {result['error']}")
                else:
                    print(f"  请求 {i+1}: 成功")
        
        print("\n✅ 异步示例运行成功!")
        
    except Exception as e:
        print(f"❌ 异步示例执行失败: {e}")


def webhook_example():
    """Webhook处理示例"""
    print("\n=== Webhook处理示例 ===")
    
    from autopay import WebhookService
    from autopay.models import WebhookEvent
    
    webhook_service = WebhookService(
        http_client=None,  # 在实际使用中需要传入HTTP客户端
        secret_key="your_webhook_secret"
    )
    
    try:
        # 1. 模拟Webhook事件
        print("\n1. 处理支付成功事件:")
        
        event_data = {
            "id": "evt_123456789",
            "type": "payment.succeeded",
            "created": 1234567890,
            "data": {
                "object": {
                    "id": "pay_123456789",
                    "amount": 10000,
                    "currency": "cny",
                    "status": "succeeded",
                    "order_id": "ORDER_123456"
                }
            }
        }
        
        # 2. 处理Webhook事件
        webhook_event = WebhookEvent(
            event_type=event_data['type'],
            resource_type='payment',
            resource_id=event_data['data']['object']['id'],
            status=event_data['data']['object']['status']
        )
        result = webhook_service.handle_webhook_event(webhook_event)
        
        print(f"  事件处理结果: {result}")
        
        # 3. 签名验证
        print("\n2. 验证Webhook签名:")
        
        # 直接调用签名验证方法
        is_valid = webhook_service.verify_signature(
            payload=event_data,
            signature="mock_signature",
            timestamp="1234567890"
        )
        print(f"  签名是否有效: {is_valid}")
        
        print("\n✅ Webhook示例运行成功!")
        
    except Exception as e:
        print(f"❌ Webhook示例执行失败: {e}")


def error_handling_example():
    """错误处理示例"""
    print("\n=== 错误处理示例 ===")
    
    from autopay.exceptions import (
        ConfigurationException,
        NetworkException,
        ValidationException,
        RateLimitException
    )
    
    # 1. 配置错误处理
    print("\n1. 配置错误处理:")
    try:
        invalid_client = create_client(
            api_key="",  # 无效的API密钥
            secret_key="",
            environment=Environment.SANDBOX
        )
    except Exception as e:
        print(f"  配置错误: {e}")
    
    # 2. 网络错误处理
    print("\n2. 网络错误处理:")
    try:
        # 模拟网络错误
        client = create_client(
            api_key="valid_key",
            secret_key="valid_secret",
            environment=Environment.SANDBOX,
            base_url="https://invalid-url.com"  # 无效的URL
        )
        payment = client.get_payment_service().create_payment({
            "amount": 100,
            "currency": "CNY",
            "method": "alipay"
        })
    except NetworkException as e:
        print(f"  网络错误: {e}")
    except Exception as e:
        print(f"  其他错误: {e}")
    
    # 3. 验证错误处理
    print("\n3. 验证错误处理:")
    try:
        client = create_client(
            api_key="valid_key",
            secret_key="valid_secret",
            environment=Environment.SANDBOX
        )
        payment_service = client.get_payment_service()
        
        # 尝试创建无效的支付
        payment_service.create_payment({
            "amount": -100,  # 负数金额
            "currency": "INVALID",  # 无效货币
            "method": "invalid_method"  # 无效支付方式
        })
    except ValidationException as e:
        print(f"  验证错误: {e}")
    except Exception as e:
        print(f"  其他错误: {e}")
    
    print("\n✅ 错误处理示例运行成功!")


def main():
    """主函数"""
    print("🚀 AutoPay Python SDK 示例程序")
    print("=" * 50)
    
    try:
        # 运行各种示例
        basic_example()
        advanced_example()
        
        # 异步示例
        print("\n运行异步示例...")
        asyncio.run(async_example())
        
        webhook_example()
        error_handling_example()
        
        print("\n" + "=" * 50)
        print("🎉 所有示例运行完成!")
        print("\n📚 更多详细信息请查看:")
        print("   - SDK文档: docs/")
        print("   - API文档: api/")
        print("   - GitHub: https://github.com/autopay/python-sdk")
        
    except KeyboardInterrupt:
        print("\n\n⏹️ 程序被用户中断")
    except Exception as e:
        print(f"\n\n💥 程序运行出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()