# AutoPay Node.js SDK

[![npm version](https://img.shields.io/npm/v/@autopay/sdk.svg)](https://www.npmjs.com/package/@autopay/sdk)
[![Node Version](https://img.shields.io/node/v/@autopay/sdk.svg)](https://nodejs.org)
[![License](https://img.shields.io/npm/l/@autopay/sdk.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/travis/autopay/nodejs-sdk.svg)](https://travis-ci.org/autopay/nodejs-sdk)
[![Coverage](https://img.shields.io/coveralls/autopay/nodejs-sdk.svg)](https://coveralls.io/github/autopay/nodejs-sdk)

AutoPay Node.js SDK 是一个用于快速集成支付功能的 TypeScript/JavaScript SDK，支持多种支付渠道，包括支付宝、微信支付、银行卡等。

## ✨ 特性

- 🚀 **现代化 TypeScript** 支持，提供完整的类型定义
- 🔒 **安全可靠** 完整的签名验证和安全机制
- 🔄 **异步处理** 基于 Promise 和 async/await 的异步 API
- 🏗️ **模块化设计** 清晰的结构，便于扩展和维护
- 📊 **完善的日志** 内置日志记录，便于调试和监控
- ⚡ **高性能** 基于 Axios 的高性能 HTTP 客户端
- 🛡️ **错误处理** 完善的错误处理和异常管理
- 📱 **多平台支持** Node.js 14+, Web 浏览器, React Native
- 🔧 **灵活配置** 支持多种配置方式，包括环境变量
- 📦 **轻量级** 零依赖或最小化依赖策略

## 📦 安装

### npm
```bash
npm install @autopay/sdk
```

### yarn
```bash
yarn add @autopay/sdk
```

### pnpm
```bash
pnpm add @autopay/sdk
```

### 直接使用 ES 模块
```typescript
import AutoPay from '@autopay/sdk';
```

## 🚀 快速开始

### 1. 基本使用

```typescript
import AutoPay, { CreatePaymentRequest } from '@autopay/sdk';

// 初始化SDK
const autoPay = AutoPay.create('your-api-key', 'your-secret-key');

// 创建支付请求
const paymentRequest = new CreatePaymentRequest()
  .setOrderId('ORDER_123456')
  .setAmount(10000) // 100.00元，以分为单位
  .setCurrency('CNY')
  .setChannel('alipay')
  .setSubject('测试订单')
  .setDescription('这是一个测试订单');

// 创建支付
const paymentResponse = await autoPay.getService().createPayment(paymentRequest);

if (paymentResponse.isSuccess()) {
  console.log('支付创建成功！');
  console.log('支付ID:', paymentResponse.getPaymentId());
  console.log('支付链接:', paymentResponse.getPaymentUrl());
} else {
  console.error('支付创建失败:', paymentResponse.getMessage());
}
```

### 2. 使用配置对象

```typescript
import AutoPay from '@autopay/sdk';

const autoPay = AutoPay.fromConfig({
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key',
  environment: 'sandbox', // 'sandbox' | 'production'
  enableLogging: true,
  timeout: 30000
});
```

### 3. 使用构建器模式

```typescript
import AutoPay from '@autopay/sdk';

const autoPay = AutoPay.newBuilder()
  .apiKey('your-api-key')
  .secretKey('your-secret-key')
  .environment('sandbox')
  .enableLogging(true)
  .build();
```

### 4. 从环境变量读取配置

```typescript
import AutoPay from '@autopay/sdk';

// 确保设置了以下环境变量：
// AUTOPAY_API_KEY=your-api-key
// AUTOPAY_SECRET_KEY=your-secret-key
// AUTOPAY_ENVIRONMENT=sandbox

const autoPay = AutoPay.fromEnvironment();
```

## 📚 API 文档

### AutoPay 主类

#### 创建实例

| 方法 | 描述 | 参数 |
|------|------|------|
| `create(apiKey, secretKey, options?)` | 创建实例（推荐） | `apiKey: string`, `secretKey: string`, `options?: Partial<SDKConfig>` |
| `fromConfig(config)` | 从配置对象创建 | `config: SDKConfig` |
| `newBuilder()` | 使用构建器创建 | 无 |
| `fromEnvironment()` | 从环境变量创建 | 无 |

#### 实例方法

| 方法 | 描述 | 返回类型 |
|------|------|----------|
| `getConfig()` | 获取配置 | `AutoPayConfig` |
| `getClient()` | 获取HTTP客户端 | `HttpClient` |
| `getService()` | 获取服务实例 | `AutoPayService` |
| `checkHealth()` | 健康检查 | `Promise<HealthCheckResult>` |
| `getVersion()` | 获取版本信息 | `Promise<{ sdk: string; api: string; environment: string }>` |
| `close()` | 关闭实例 | `Promise<void>` |
| `reset()` | 重置连接 | `Promise<void>` |

### 支付相关 API

#### 创建支付

```typescript
import { CreatePaymentRequest } from '@autopay/sdk';

const paymentRequest = new CreatePaymentRequest()
  .setOrderId('ORDER_123456')
  .setAmount(10000)
  .setCurrency('CNY')
  .setChannel('alipay')
  .setSubject('订单标题')
  .setDescription('订单描述')
  .setCallbackUrl('https://your-domain.com/callback')
  .setNotifyUrl('https://your-domain.com/notify')
  .setReturnUrl('https://your-domain.com/return')
  .setCustomerInfo({
    id: 'customer_123',
    name: '张三',
    email: 'user@example.com',
    phone: '13800138000'
  })
  .setMetadata({
    userId: '12345',
    source: 'mobile_app'
  });

const response = await autoPay.getService().createPayment(paymentRequest);
```

#### 查询支付

```typescript
import { QueryPaymentRequest } from '@autopay/sdk';

const queryRequest = new QueryPaymentRequest()
  .setPaymentId('payment_123456');

const response = await autoPay.getService().queryPayment(queryRequest);
```

#### 关闭支付

```typescript
const response = await autoPay.getService().closePayment('payment_123456');
```

#### 退款

```typescript
import { RefundPaymentRequest } from '@autopay/sdk';

const refundRequest = new RefundPaymentRequest()
  .setPaymentId('payment_123456')
  .setAmount(5000) // 50.00元
  .setReason('用户申请退款')
  .setRefundNo('REFUND_123456');

const response = await autoPay.getService().refundPayment(refundRequest);
```

### 渠道管理 API

#### 获取可用渠道

```typescript
const response = await autoPay.getService().getChannels();
```

#### 获取渠道状态

```typescript
const response = await autoPay.getService().getChannelStatus();
```

#### 切换渠道状态

```typescript
const response = await autoPay.getService().switchChannel('alipay', false); // 禁用支付宝
```

### 账户管理 API

#### 获取账户余额

```typescript
const response = await autoPay.getService().getBalance();
```

#### 获取交易记录

```typescript
const response = await autoPay.getService().getTransactions({
  startTime: new Date('2024-01-01'),
  endTime: new Date(),
  page: 1,
  limit: 50
});
```

#### 获取统计信息

```typescript
const response = await autoPay.getService().getStatistics({
  date: new Date()
});
```

## 📝 数据模型

### CreatePaymentRequest

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `orderId` | `string` | 是 | 订单ID |
| `amount` | `number` | 是 | 支付金额（分） |
| `currency` | `string` | 是 | 货币代码 |
| `channel` | `string` | 是 | 支付渠道 |
| `subject` | `string` | 是 | 订单标题 |
| `description` | `string` | 否 | 订单描述 |
| `callbackUrl` | `string` | 否 | 回调URL |
| `notifyUrl` | `string` | 否 | 通知URL |
| `returnUrl` | `string` | 否 | 返回URL |
| `customerInfo` | `CustomerInfo` | 否 | 客户信息 |
| `metadata` | `Record<string, any>` | 否 | 自定义元数据 |
| `timeout` | `number` | 否 | 超时时间（秒） |

### PaymentResponse

| 方法 | 描述 |
|------|------|
| `isSuccess()` | 是否成功 |
| `getPaymentId()` | 获取支付ID |
| `getPaymentUrl()` | 获取支付URL |
| `getQrCode()` | 获取二维码 |
| `getStatus()` | 获取支付状态 |
| `isPaid()` | 是否已支付 |
| `isFailed()` | 是否失败 |
| `isClosed()` | 是否已关闭 |
| `getData()` | 获取完整数据 |

### QueryPaymentRequest

| 字段 | 类型 | 描述 |
|------|------|------|
| `paymentId` | `string` | 支付ID |
| `orderId` | `string` | 订单ID |
| `startTime` | `Date` | 开始时间 |
| `endTime` | `Date` | 结束时间 |
| `status` | `PaymentStatus` | 支付状态 |
| `channel` | `string` | 支付渠道 |
| `page` | `number` | 页码 |
| `limit` | `number` | 每页数量 |
| `refundId` | `string` | 退款ID |

## 🔧 配置选项

```typescript
interface SDKConfig {
  apiKey: string;           // API密钥
  secretKey: string;        // 密钥
  appId?: string;           // 应用ID
  baseUrl?: string;         // 基础URL
  timeout?: number;         // 超时时间（毫秒）
  enableLogging?: boolean;  // 是否启用日志
  userAgent?: string;       // 用户代理
  environment?: Environment;// 环境
  headers?: Record<string, string>; // 自定义请求头
}
```

## 🚨 错误处理

SDK 提供了完善的错误处理机制：

```typescript
try {
  const response = await autoPay.getService().createPayment(paymentRequest);
  
  if (!response.isSuccess()) {
    console.error('支付创建失败:', response.getMessage());
    console.error('错误代码:', response.getCode());
  }
} catch (error) {
  if (error.name === 'AutoPayException') {
    console.error('AutoPay异常:', error.message);
    console.error('错误类型:', error.type);
    console.error('错误代码:', error.code);
  } else {
    console.error('其他错误:', error.message);
  }
}
```

## 📋 支持的支付渠道

- `alipay` - 支付宝
- `wechat` - 微信支付
- `bank_card` - 银行卡
- `unionpay` - 银联
- `jdpay` - 京东支付
- `baifubao` - 百度钱包

## 📊 日志和调试

### 启用日志

```typescript
const autoPay = AutoPay.create('api-key', 'secret-key', {
  enableLogging: true
});
```

### 自定义日志配置

```typescript
// 可以通过环境变量配置
process.env.AUTOPAY_LOG_LEVEL = 'debug'; // 'error', 'warn', 'info', 'debug'
```

### 健康检查

```typescript
const healthResult = await autoPay.checkHealth();
console.log('SDK健康状态:', healthResult.status);
console.log('服务状态:', healthResult.services);
```

## 🧪 测试

### 运行测试
```bash
npm test
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 运行 lint 检查
```bash
npm run lint
```

### 修复 lint 问题
```bash
npm run lint:fix
```

## 📦 打包

### 构建生产版本
```bash
npm run build
```

### 发布到 npm
```bash
npm run publish
```

## 🛠️ 开发

### 环境要求
- Node.js 14.0+
- npm 6.0+ 或 yarn 1.20+ 或 pnpm 6.0+

### 开发模式
```bash
npm run dev
```

### 目录结构
```
src/
├── config/          # 配置管理
├── http/            # HTTP客户端
├── models/          # 数据模型
├── services/        # 业务服务
├── types/           # 类型定义
├── utils/           # 工具函数
├── AutoPay.ts       # 主类
└── index.ts         # 入口文件
```

## 📄 许可证

MIT License - 详情请查看 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系我们

- 📧 Email: support@autopay.com
- 🌐 Website: https://www.autopay.com
- 📱 微信: AutoPaySupport
- 💬 QQ群: 123456789

## 🗺️ 路线图

- [x] 基础支付功能
- [x] 多渠道支持
- [x] 退款功能
- [x] 批量查询
- [ ] 实时通知处理
- [ ] 支付分账
- [ ] Webhook 支持
- [ ] React Native 适配
- [ ] 批量退款
- [ ] 风控系统集成

## 📈 更新日志

### v1.0.0 (2024-01-15)
- 🎉 初始版本发布
- ✨ 支持支付宝、微信支付
- 📊 完善的类型定义
- 🔒 安全签名验证
- 📝 完整的文档

## 🏷️ 版本

当前版本：v1.0.0

支持 Node.js 版本：14.0+

---

**💡 提示**: 如果您在使用过程中遇到问题，请查看 [FAQ](docs/FAQ.md) 或联系我们的技术支持团队。