# AutoPay Java SDK

AutoPay Java SDK 提供了一个简单易用的Java客户端库，用于与AutoPay支付平台进行交互。

## 功能特性

- ✅ **完整API支持** - 支持所有AutoPay平台API
- ✅ **签名验证** - 内置请求签名和响应验证
- ✅ **异步操作** - 支持异步支付回调处理
- ✅ **重试机制** - 智能重试和错误处理
- ✅ **多环境支持** - 支持生产、测试、开发环境
- ✅ **类型安全** - 完整的TypeScript类型定义
- ✅ **连接池** - 高效的HTTP连接管理
- ✅ **配置灵活** - 支持构建器模式和链式调用

## 快速开始

### 环境要求

- Java 8+
- Maven 3.6+

### 安装

#### 从Maven仓库安装

```xml
<dependency>
    <groupId>com.autopay</groupId>
    <artifactId>autopay-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### 手动构建

```bash
git clone https://github.com/autopay/java-sdk.git
cd java-sdk
mvn clean install
```

### 基本使用

```java
import com.autopay.sdk.AutoPay;
import com.autopay.sdk.model.request.CreatePaymentRequest;
import com.autopay.sdk.model.response.ApiResponse;
import com.autopay.sdk.model.response.PaymentResponse;

public class PaymentExample {
    public static void main(String[] args) {
        // 1. 创建AutoPay实例
        AutoPay autoPay = AutoPay.create("your_api_key", "your_secret_key");
        
        try {
            // 2. 创建支付订单
            CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId("ORDER_" + System.currentTimeMillis())
                .amount(100.00)
                .currency("CNY")
                .channel("alipay")
                .description("测试订单")
                .build();
            
            // 3. 发送支付请求
            ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
            
            if (response.isSuccess()) {
                PaymentResponse payment = response.getData();
                System.out.println("支付创建成功: " + payment.getPaymentId());
                System.out.println("支付链接: " + payment.getPaymentUrl());
            } else {
                System.err.println("支付失败: " + response.getMessage());
            }
            
        } finally {
            // 4. 关闭连接
            autoPay.close();
        }
    }
}
```

## API文档

### AutoPay类

#### 创建实例

```java
// 方法1: 使用create静态方法
AutoPay autoPay = AutoPay.create("api_key", "secret_key");

// 方法2: 使用构建器模式
AutoPay autoPay = AutoPay.newBuilder()
    .apiKey("your_api_key")
    .secretKey("your_secret_key")
    .baseUrl("https://api.autopay.example.com")
    .timeout(30)
    .enableLogging(true)
    .build();

// 方法3: 从环境变量读取
AutoPay autoPay = AutoPay.newBuilder()
    .fromEnvironment()
    .build();
```

#### 环境变量支持

SDK支持以下环境变量：

```bash
AUTOPAY_BASE_URL=https://api.autopay.example.com
AUTOPAY_API_KEY=your_api_key
AUTOPAY_SECRET_KEY=your_secret_key
AUTOPAY_APP_ID=your_app_id
AUTOPAY_TIMEOUT=30
AUTOPAY_ENABLE_LOGGING=true
AUTOPAY_ENVIRONMENT=production
```

### 支付相关API

#### 创建支付

```java
CreatePaymentRequest request = CreatePaymentRequest.builder()
    .orderId("ORDER_123456")
    .amount(BigDecimal.valueOf(99.99))
    .currency("CNY")
    .channel("alipay")
    .description("订单描述")
    .customerId("CUSTOMER_001")
    .metadata("promotion_code", "DISCOUNT20")
    .build();

ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
```

#### 查询支付

```java
// 按支付ID查询
QueryPaymentRequest queryRequest = QueryPaymentRequest.builder()
    .paymentId("PAY_123456")
    .build();

ApiResponse<PaymentResponse> response = autoPay.getService().queryPayment(queryRequest);

// 按条件查询列表
Map<String, Object> params = new HashMap<>();
params.put("start_time", "2024-01-01 00:00:00");
params.put("end_time", "2024-01-31 23:59:59");
params.put("status", "success");
params.put("page", 1);
params.put("size", 20);

ApiResponse<List<PaymentResponse>> response = autoPay.getService().getPayments(params);
```

#### 关闭支付

```java
ApiResponse<Void> response = autoPay.getService().closePayment("PAY_123456");
```

#### 申请退款

```java
Map<String, Object> refundParams = new HashMap<>();
refundParams.put("amount", 50.00);
refundParams.put("reason", "用户申请退款");

ApiResponse<PaymentResponse> response = autoPay.getService().refundPayment("PAY_123456", refundParams);
```

### 渠道管理API

#### 获取支付渠道

```java
ApiResponse<List<Map<String, Object>>> response = autoPay.getService().getChannels();
```

#### 获取渠道状态

```java
ApiResponse<Map<String, Object>> response = autoPay.getService().getChannelStatus("alipay");
```

#### 切换渠道状态

```java
Map<String, Object> params = Map.of("enabled", true);
ApiResponse<Map<String, Object>> response = autoPay.getService().toggleChannelStatus("alipay", true);
```

### 账户管理API

#### 获取账户余额

```java
ApiResponse<Map<String, Object>> response = autoPay.getService().getBalance();
```

#### 获取交易记录

```java
Map<String, Object> params = new HashMap<>();
params.put("start_time", "2024-01-01");
params.put("end_time", "2024-01-31");

ApiResponse<List<PaymentResponse>> response = autoPay.getService().getTransactions(params);
```

### 统计数据API

#### 获取支付统计

```java
Map<String, Object> params = new HashMap<>();
params.put("start_time", "2024-01-01");
params.put("end_time", "2024-01-31");
params.put("group_by", "day");

ApiResponse<Map<String, Object>> response = autoPay.getService().getPaymentStatistics(params);
```

## 数据模型

### CreatePaymentRequest

创建支付请求的数据模型：

```java
public class CreatePaymentRequest {
    private String orderId;          // 订单ID (必需)
    private BigDecimal amount;       // 支付金额 (必需)
    private String currency;         // 货币代码 (必需)
    private String channel;          // 支付渠道 (必需)
    private String description;      // 订单描述
    private String notifyUrl;        // 回调通知URL
    private String returnUrl;        // 返回URL
    private String clientIp;         // 客户端IP
    private String customerId;       // 客户ID
    private CustomerInfo customer;   // 客户信息
    private Map<String, Object> metadata;  // 元数据
    private Integer timeout;         // 超时时间(秒)
}
```

### PaymentResponse

支付响应的数据模型：

```java
public class PaymentResponse {
    private String paymentId;        // 支付ID
    private String orderId;          // 订单ID
    private BigDecimal amount;       // 支付金额
    private String currency;         // 货币代码
    private String channel;          // 支付渠道
    private PaymentStatus status;    // 支付状态
    private String paymentUrl;       // 支付链接
    private String qrCode;           // 二维码
    private CustomerInfo customer;   // 客户信息
    private String createdAt;        // 创建时间
    private String updatedAt;        // 更新时间
}
```

### 支付状态枚举

```java
public enum PaymentStatus {
    PENDING,      // 待支付
    PROCESSING,   // 处理中
    SUCCESS,      // 支付成功
    FAILED,       // 支付失败
    CANCELLED,    // 已取消
    EXPIRED       // 已过期
}
```

## 错误处理

SDK提供了完善的错误处理机制：

```java
try {
    ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
    
    if (response.isSuccess()) {
        // 处理成功响应
        PaymentResponse payment = response.getData();
    } else {
        // 处理业务错误
        System.err.println("错误代码: " + response.getCode());
        System.err.println("错误信息: " + response.getMessage());
    }
    
} catch (AutoPayException e) {
    // 处理系统异常
    System.err.println("SDK异常: " + e.getMessage());
    System.err.println("错误代码: " + e.getCode());
}
```

## 配置选项

### AutoPayConfig

```java
AutoPayConfig config = new AutoPayConfig.Builder()
    .baseUrl("https://api.autopay.example.com")  // API基础URL
    .apiKey("your_api_key")                      // API密钥
    .secretKey("your_secret_key")                // 密钥
    .appId("your_app_id")                        // 应用ID
    .timeout(30)                                 // 超时时间(秒)
    .enableLogging(true)                         // 是否启用日志
    .userAgent("AutoPayJavaSDK/1.0.0")           // 用户代理
    .environment("production")                    // 环境
    .build();
```

### 环境配置

```java
// 生产环境
AutoPay autoPay = AutoPay.newBuilder()
    .baseUrl("https://api.autopay.example.com")
    .apiKey("prod_api_key")
    .secretKey("prod_secret_key")
    .environment("production")
    .build();

// 测试环境
AutoPay autoPay = AutoPay.newBuilder()
    .baseUrl("https://api-sandbox.autopay.example.com")
    .apiKey("test_api_key")
    .secretKey("test_secret_key")
    .environment("sandbox")
    .build();

// 开发环境
AutoPay autoPay = AutoPay.newBuilder()
    .baseUrl("http://localhost:8080/api")
    .apiKey("dev_api_key")
    .secretKey("dev_secret_key")
    .environment("development")
    .build();
```

## 最佳实践

### 1. 使用try-with-resources确保资源释放

```java
try (AutoPay autoPay = AutoPay.create("api_key", "secret_key")) {
    ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
    // 处理响应
} // 自动关闭连接
```

### 2. 使用构建器模式构建请求

```java
CreatePaymentRequest request = CreatePaymentRequest.builder()
    .orderId("ORDER_123")
    .amount(BigDecimal.valueOf(99.99))
    .currency("CNY")
    .channel("alipay")
    .description("测试订单")
    .metadata("source", "mobile_app")
    .build();
```

### 3. 错误处理和重试

```java
public ApiResponse<PaymentResponse> createPaymentWithRetry(CreatePaymentRequest request, int maxRetries) {
    for (int i = 0; i < maxRetries; i++) {
        try {
            return autoPay.getService().createPayment(request);
        } catch (AutoPayException e) {
            if (i == maxRetries - 1) {
                throw e; // 最后一次重试失败，抛出异常
            }
            // 等待后重试
            try {
                Thread.sleep(1000 * (i + 1));
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(ie);
            }
        }
    }
    throw new RuntimeException("Unexpected error");
}
```

### 4. 异步回调处理

```java
@Component
public class PaymentCallbackHandler {
    
    @PostMapping("/payment/callback")
    public ResponseEntity<String> handlePaymentCallback(@RequestBody Map<String, Object> callbackData) {
        try {
            // 验证回调签名
            verifyCallbackSignature(callbackData);
            
            // 处理支付状态更新
            String paymentId = (String) callbackData.get("payment_id");
            String status = (String) callbackData.get("status");
            
            // 更新本地订单状态
            updateOrderStatus(paymentId, status);
            
            return ResponseEntity.ok("success");
            
        } catch (Exception e) {
            logger.error("处理支付回调失败", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error");
        }
    }
}
```

## 调试和日志

### 启用详细日志

```java
AutoPay autoPay = AutoPay.newBuilder()
    .apiKey("your_api_key")
    .secretKey("your_secret_key")
    .enableLogging(true)  // 启用HTTP请求日志
    .build();
```

### 健康检查

```java
// 检查SDK连接状态
boolean isHealthy = autoPay.isHealthy();
System.out.println("SDK健康状态: " + (isHealthy ? "健康" : "异常"));

// 执行健康检查API
ApiResponse<Map<String, Object>> response = autoPay.getService().healthCheck();
if (response.isSuccess()) {
    System.out.println("API服务正常");
}
```

## 性能优化

### 1. 连接池配置

```java
OkHttpClient httpClient = new OkHttpClient.Builder()
    .connectionPool(new ConnectionPool(5, 5, TimeUnit.MINUTES))
    .build();
```

### 2. 批量操作

```java
// 批量创建支付（示例）
List<CreatePaymentRequest> requests = createBatchRequests();
List<ApiResponse<PaymentResponse>> responses = new ArrayList<>();

for (CreatePaymentRequest request : requests) {
    try {
        ApiResponse<PaymentResponse> response = autoPay.getService().createPayment(request);
        responses.add(response);
    } catch (AutoPayException e) {
        responses.add(ApiResponse.error(e.getCode(), e.getMessage()));
    }
}
```

## 常见问题

### Q: 如何处理网络超时？

A: 在配置中增加超时时间：

```java
AutoPay autoPay = AutoPay.newBuilder()
    .apiKey("your_api_key")
    .secretKey("your_secret_key")
    .timeout(60)  // 增加到60秒
    .build();
```

### Q: 如何处理签名错误？

A: 检查API密钥和密钥是否正确：

```java
// 确保使用正确的密钥
AutoPay autoPay = AutoPay.newBuilder()
    .apiKey(System.getenv("AUTOPAY_API_KEY"))
    .secretKey(System.getenv("AUTOPAY_SECRET_KEY"))
    .build();
```

### Q: 如何处理大额支付？

A: 对于大额支付，建议：

1. 增加超时时间
2. 使用异步回调
3. 实现重试机制

### Q: 如何在Spring Boot中使用？

A: 创建配置Bean：

```java
@Configuration
public class AutoPayConfig {
    
    @Bean
    public AutoPay autoPay() {
        return AutoPay.newBuilder()
            .apiKey(environment.getProperty("autopay.api.key"))
            .secretKey(environment.getProperty("autopay.secret.key"))
            .baseUrl(environment.getProperty("autopay.base.url"))
            .build();
    }
    
    @Bean
    public AutoPayService autoPayService(AutoPay autoPay) {
        return autoPay.getService();
    }
}
```

## 贡献指南

我们欢迎社区贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](LICENSE) 文件。

## 技术支持

- 📧 邮箱: support@autopay.example.com
- 📞 电话: 400-123-4567
- 💬 在线客服: https://autopay.example.com/support
- 📖 文档: https://docs.autopay.example.com
- 🐛 问题反馈: https://github.com/autopay/java-sdk/issues

## 更新日志

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- ✅ 完整的API支持
- ✅ 签名验证功能
- ✅ 错误处理机制
- ✅ 示例代码和文档