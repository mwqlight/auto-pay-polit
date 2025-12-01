/**
 * Node.js SDK 基本使用示例
 */

import AutoPay, { CreatePaymentRequest, QueryPaymentRequest, RefundPaymentRequest } from './src';

/**
 * 基本支付流程示例
 */
async function basicPaymentExample() {
  console.log('=== 基本支付流程示例 ===');

  try {
    // 1. 初始化SDK
    const autoPay = AutoPay.create(
      'your-api-key',
      'your-secret-key',
      {
        environment: 'sandbox', // 或 'production'
        enableLogging: true
      }
    );

    // 2. 创建支付请求
    const paymentRequest = new CreatePaymentRequest()
      .setOrderId('ORDER_' + Date.now())
      .setAmount(10000) // 100.00元，以分为单位
      .setCurrency('CNY')
      .setChannel('alipay') // 或 'wechat', 'bank_card'
      .setSubject('测试订单')
      .setDescription('这是一个测试订单')
      .setCallbackUrl('https://your-domain.com/callback')
      .setNotifyUrl('https://your-domain.com/notify')
      .setReturnUrl('https://your-domain.com/return')
      .setMetadata({
        userId: '12345',
        source: 'mobile_app'
      });

    // 3. 创建支付
    console.log('正在创建支付...');
    const paymentResponse = await autoPay.getService().createPayment(paymentRequest);

    if (paymentResponse.isSuccess()) {
      console.log('支付创建成功！');
      console.log('支付ID:', paymentResponse.getPaymentId());
      console.log('支付链接:', paymentResponse.getPaymentUrl());
      console.log('二维码:', paymentResponse.getQrCode());

      // 4. 查询支付状态
      const queryRequest = new QueryPaymentRequest()
        .setPaymentId(paymentResponse.getPaymentId());

      const queryResponse = await autoPay.getService().queryPayment(queryRequest);
      console.log('支付状态:', queryResponse.getStatus());

    } else {
      console.error('支付创建失败:', paymentResponse.getMessage());
    }

    // 5. 清理资源
    await autoPay.close();

  } catch (error) {
    console.error('支付流程异常:', error);
  }
}

/**
 * 高级支付流程示例（包含客户信息）
 */
async function advancedPaymentExample() {
  console.log('\n=== 高级支付流程示例 ===');

  try {
    const autoPay = AutoPay.create(
      'your-api-key',
      'your-secret-key'
    );

    // 创建带客户信息的支付请求
    const paymentRequest = new CreatePaymentRequest()
      .setOrderId('ADVANCED_ORDER_' + Date.now())
      .setAmount(50000) // 500.00元
      .setCurrency('CNY')
      .setChannel('wechat')
      .setSubject('高级测试订单')
      .setDescription('包含客户信息的测试订单')
      .setCustomerInfo({
        id: 'customer_123',
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        address: {
          country: '中国',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园'
        }
      })
      .setMetadata({
        campaignId: 'SUMMER2024',
        discount: '20%',
        version: 'v2.0'
      })
      .setTimeout(900); // 15分钟超时

    console.log('正在创建高级支付...');
    const paymentResponse = await autoPay.getService().createPayment(paymentRequest);

    if (paymentResponse.isSuccess()) {
      console.log('高级支付创建成功！');
      console.log('支付详情:', paymentResponse.getData());

      // 模拟用户支付过程...
      console.log('等待用户完成支付...');
      
      // 轮询查询支付状态
      let attempts = 0;
      const maxAttempts = 30; // 最多查询30次

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
        
        const queryRequest = new QueryPaymentRequest()
          .setPaymentId(paymentResponse.getPaymentId());
        
        const queryResponse = await autoPay.getService().queryPayment(queryRequest);
        
        console.log(`第${attempts + 1}次查询 - 支付状态: ${queryResponse.getStatus()}`);
        
        if (queryResponse.isPaid() || queryResponse.isFailed() || queryResponse.isClosed()) {
          console.log('支付流程结束');
          break;
        }
        
        attempts++;
      }

    } else {
      console.error('高级支付创建失败:', paymentResponse.getMessage());
    }

    await autoPay.close();

  } catch (error) {
    console.error('高级支付流程异常:', error);
  }
}

/**
 * 退款流程示例
 */
async function refundExample() {
  console.log('\n=== 退款流程示例 ===');

  try {
    const autoPay = AutoPay.create(
      'your-api-key',
      'your-secret-key'
    );

    // 假设已有支付ID，现在需要退款
    const paymentId = 'payment_123456';

    // 创建部分退款请求
    const refundRequest = new RefundPaymentRequest()
      .setPaymentId(paymentId)
      .setAmount(3000) // 退30.00元
      .setReason('用户申请退款')
      .setRefundNo('REFUND_' + Date.now());

    console.log('正在处理退款...');
    const refundResponse = await autoPay.getService().refundPayment(refundRequest);

    if (refundResponse.isSuccess()) {
      console.log('退款申请成功！');
      console.log('退款单号:', refundResponse.getRefundId());
      console.log('退款状态:', refundResponse.getStatus());

      // 查询退款状态
      const queryRequest = new QueryPaymentRequest()
        .setRefundId(refundResponse.getRefundId());

      const queryResponse = await autoPay.getService().queryRefund(queryRequest);
      console.log('退款查询结果:', queryResponse.getData());

    } else {
      console.error('退款申请失败:', refundResponse.getMessage());
    }

    await autoPay.close();

  } catch (error) {
    console.error('退款流程异常:', error);
  }
}

/**
 * 批量查询示例
 */
async function batchQueryExample() {
  console.log('\n=== 批量查询示例 ===');

  try {
    const autoPay = AutoPay.create(
      'your-api-key',
      'your-secret-key'
    );

    // 查询指定时间范围内的支付记录
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前
    const endTime = new Date(); // 当前时间

    const queryRequest = new QueryPaymentRequest()
      .setStartTime(startTime)
      .setEndTime(endTime)
      .setPage(1)
      .setLimit(50);

    console.log('正在查询24小时内的支付记录...');
    const queryResponse = await autoPay.getService().queryPayments(queryRequest);

    if (queryResponse.isSuccess()) {
      console.log(`找到${queryResponse.getTotal()}条支付记录`);
      
      const payments = queryResponse.getData().items || [];
      payments.forEach((payment: any, index: number) => {
        console.log(`${index + 1}. 支付ID: ${payment.paymentId}, 状态: ${payment.status}, 金额: ${payment.amount}`);
      });

    } else {
      console.error('批量查询失败:', queryResponse.getMessage());
    }

    await autoPay.close();

  } catch (error) {
    console.error('批量查询异常:', error);
  }
}

/**
 * 渠道管理示例
 */
async function channelManagementExample() {
  console.log('\n=== 渠道管理示例 ===');

  try {
    const autoPay = AutoPay.create(
      'your-api-key',
      'your-secret-key'
    );

    // 1. 获取所有可用渠道
    console.log('正在获取可用支付渠道...');
    const channelsResponse = await autoPay.getService().getChannels();

    if (channelsResponse.isSuccess()) {
      console.log('可用支付渠道:', channelsResponse.getData().channels);
    }

    // 2. 获取渠道状态
    console.log('正在获取渠道状态...');
    const statusResponse = await autoPay.getService().getChannelStatus();

    if (statusResponse.isSuccess()) {
      console.log('渠道状态:', statusResponse.getData());
    }

    // 3. 健康检查
    console.log('正在执行健康检查...');
    const healthResult = await autoPay.checkHealth();
    console.log('健康检查结果:', healthResult);

    await autoPay.close();

  } catch (error) {
    console.error('渠道管理异常:', error);
  }
}

/**
 * 错误处理示例
 */
async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===');

  try {
    const autoPay = AutoPay.create(
      'invalid-api-key', // 故意使用无效的API密钥
      'invalid-secret-key'
    );

    // 尝试创建支付，这将失败
    const paymentRequest = new CreatePaymentRequest()
      .setOrderId('ERROR_TEST_' + Date.now())
      .setAmount(1000)
      .setCurrency('CNY')
      .setChannel('alipay')
      .setSubject('错误测试订单');

    const paymentResponse = await autoPay.getService().createPayment(paymentRequest);

    if (!paymentResponse.isSuccess()) {
      console.log('预期的错误:', paymentResponse.getMessage());
      console.log('错误代码:', paymentResponse.getCode());
    }

    await autoPay.close();

  } catch (error: any) {
    if (error.name === 'AutoPayException') {
      console.log('捕获到AutoPay异常:', error.message);
      console.log('错误类型:', error.type);
      console.log('错误代码:', error.code);
    } else {
      console.error('其他类型错误:', error.message);
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('AutoPay Node.js SDK 使用示例');
  console.log('=====================================\n');

  // 运行所有示例
  await basicPaymentExample();
  await advancedPaymentExample();
  await refundExample();
  await batchQueryExample();
  await channelManagementExample();
  await errorHandlingExample();

  console.log('\n所有示例执行完成！');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  main().catch(console.error);
}