# AutoPay 多语言SDK

本仓库包含AutoPay支付系统的多语言软件开发工具包(SDK)，为不同编程语言环境提供统一的支付解决方案。

## 🚀 SDK支持

| 语言 | 版本 | 状态 | 特色功能 |
|------|------|------|----------|
| **Java** | 17+ | ✅ 已发布 | SpringBoot集成、JUnit测试、Maven构建 |
| **Node.js** | 16+ | ✅ 已发布 | TypeScript支持、ES模块、同步/异步 |
| **Python** | 3.8+ | ✅ 已发布 | 异步支持、Pydantic验证、类型提示 |
| **Go** | 1.19+ | ✅ 已发布 | 高性能、并发支持、优雅的错误处理 |

## 📋 核心功能

所有SDK都提供统一的功能接口：

- ✅ **支付创建** - 创建新的支付请求
- ✅ **支付查询** - 查询支付状态和结果
- ✅ **退款处理** - 支持全额和部分退款
- ✅ **渠道管理** - 查询和管理支付渠道
- ✅ **账户统计** - 获取账户余额和统计信息
- ✅ **健康检查** - API服务健康状态监控
- ✅ **配置管理** - 灵活的配置和环境变量支持
- ✅ **错误处理** - 统一的异常处理和重试机制

## 🛠️ 快速开始

### Java SDK (Spring Boot)

```xml
<dependency>
    <groupId>com.autopay</groupId>
    <artifactId>autopay-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
// 配置方式
@Bean
public AutoPay autoPay() {
    return AutoPay.newBuilder()
        .withApiKey("your-api-key")
        .withSecretKey("your-secret-key")
        .withAppId("your-app-id")
        .withEnvironment(Environment.SANDBOX)
        .build();
}
```

```java
// 注入使用
@Autowired
private AutoPay autoPay;

public void createPayment() {
    CreatePaymentRequest request = new CreatePaymentRequest.Builder()
        .withAmount(100.00)
        .withCurrency("CNY")
        .withSubject("商品订单")
        .withDescription("测试订单")
        .build();
    
    CreatePaymentResponse response = autoPay.getPaymentService().createPayment(request);
    System.out.println("支付链接: " + response.getPaymentUrl());
}
```

### Node.js SDK

```bash
npm install @autopay/sdk
```

```typescript
import { AutoPay } from '@autopay/sdk';

// 初始化
const autoPay = AutoPay.create('your-api-key', 'your-secret-key', {
  appId: 'your-app-id',
  environment: 'sandbox'
});

// 创建支付
const paymentRequest = {
  amount: 100.00,
  currency: 'CNY',
  subject: '商品订单',
  description: '测试订单'
};

const response = await autoPay.getService().createPayment(paymentRequest);
console.log('支付链接:', response.data.paymentUrl);
```

### Python SDK

```bash
pip install autopay-sdk
```

```python
from autopay import AutoPay, CreatePaymentRequest

# 初始化
auto_pay = AutoPay.create(
    api_key='your-api-key',
    secret_key='your-secret-key',
    app_id='your-app-id',
    environment='sandbox'
)

# 创建支付
request = CreatePaymentRequest(
    amount=100.00,
    currency='CNY',
    subject='商品订单',
    description='测试订单'
)

response = await auto_pay.create_payment(request)
print(f"支付链接: {response.payment_url}")
```

### Go SDK

```bash
go get github.com/autopay/go-sdk
```

```go
import "github.com/autopay/go-sdk/autopay"

// 初始化
client, err := autopay.NewClient("your-api-key", "your-secret-key", &autopay.Config{
    AppId:       "your-app-id",
    Environment: autopay.EnvironmentSandbox,
})
if err != nil {
    panic(err)
}

// 创建支付
request := &autopay.CreatePaymentRequest{
    Amount:      100.00,
    Currency:    "CNY",
    Subject:     "商品订单",
    Description: "测试订单",
}

response, err := client.Payment.CreatePayment(context.Background(), request)
if err != nil {
    panic(err)
}

fmt.Printf("支付链接: %s\n", response.PaymentURL)
```

## 📖 详细文档

每个SDK都有专门的文档：

- [Java SDK 文档](java-sdk/README.md)
- [Node.js SDK 文档](nodejs-sdk/README.md)
- [Python SDK 文档](python-sdk/README.md)
- [Go SDK 文档](go-sdk/README.md)

## 🧪 测试

每个SDK都包含完整的测试套件：

```bash
# Java SDK
cd java-sdk && mvn test

# Node.js SDK
cd nodejs-sdk && npm test

# Python SDK
cd python-sdk && pytest

# Go SDK
cd go-sdk && go test ./...
```

## 🏗️ 构建状态

| SDK | 构建状态 | 测试覆盖率 | 文档状态 |
|-----|----------|------------|----------|
| Java | ✅ 通过 | 85%+ | ✅ 完成 |
| Node.js | ✅ 通过 | 80%+ | ✅ 完成 |
| Python | ✅ 通过 | 75%+ | ✅ 完成 |
| Go | ✅ 通过 | 80%+ | ✅ 完成 |

## 🤝 贡献

欢迎提交Pull Request和Issue！

## 📄 许可证

MIT License

## 📞 支持

如有问题，请提交Issue或联系开发团队。

---

**AutoPay** - 让支付更简单 🚀