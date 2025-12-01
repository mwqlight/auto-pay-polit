package com.autopay.sdk.client;

import com.autopay.sdk.config.AutoPayConfig;
import com.autopay.sdk.model.response.ApiResponse;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import okio.Buffer;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

/**
 * AutoPay HTTP客户端
 */
public class AutoPayClient {
    
    /**
     * 泛型类型引用类，类似于Jackson的TypeReference
     */
    public static abstract class TypeReference<T> {
        protected final Type type;
        
        protected TypeReference() {
            Type superClass = getClass().getGenericSuperclass();
            if (superClass instanceof ParameterizedType) {
                this.type = ((ParameterizedType) superClass).getActualTypeArguments()[0];
            } else {
                throw new IllegalArgumentException("TypeReference must be used with a parameterized type");
            }
        }
        
        public Type getType() {
            return type;
        }
    }
    
    private static final Logger logger = LoggerFactory.getLogger(AutoPayClient.class);
    
    private static final String SIGNATURE_ALGORITHM = "HmacSHA256";
    private static final String TIMESTAMP_HEADER = "X-AutoPay-Timestamp";
    private static final String SIGNATURE_HEADER = "X-AutoPay-Signature";
    private static final String API_KEY_HEADER = "X-AutoPay-ApiKey";
    private static final String API_VERSION = "v1";
    private static final String USER_AGENT = "AutoPay-Java-SDK/1.0.0";
    
    private final AutoPayConfig config;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public AutoPayClient(AutoPayConfig config) {
        this.config = config;
        this.objectMapper = new ObjectMapper();
        this.httpClient = createHttpClient();
    }
    
    /**
     * 创建HTTP客户端
     */
    private OkHttpClient createHttpClient() {
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .connectTimeout(config.getTimeout(), TimeUnit.SECONDS)
                .readTimeout(config.getTimeout(), TimeUnit.SECONDS)
                .writeTimeout(config.getTimeout(), TimeUnit.SECONDS);
        
        // 添加日志拦截器
        if (config.isEnableLogging()) {
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor(message -> {
                logger.debug("HTTP Request/Response: {}", message);
            });
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
            builder.addInterceptor(loggingInterceptor);
        }
        
        // 添加请求头拦截器
        builder.addInterceptor(chain -> {
            Request originalRequest = chain.request();
            Request.Builder requestBuilder = originalRequest.newBuilder()
                    .header("User-Agent", config.getUserAgent())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json");
            
            Request signedRequest = signRequest(requestBuilder.build());
            return chain.proceed(signedRequest);
        });
        
        return builder.build();
    }
    
    /**
     * 对请求进行签名
     */
    private Request signRequest(Request request) {
        try {
            // 生成时间戳
            String timestamp = String.valueOf(System.currentTimeMillis());
            
            // 构建签名字符串
            StringBuilder stringToSign = new StringBuilder();
            stringToSign.append(request.method()).append("\n");
            stringToSign.append(request.url().pathSegments().get(0)).append("\n");
            stringToSign.append(timestamp).append("\n");
            
            // 添加请求体进行签名（仅POST、PUT、PATCH）
            if (request.body() != null && !request.body().contentType().type().equals("multipart")) {
                RequestBody body = request.body();
                Buffer buffer = new Buffer();
                body.writeTo(buffer);
                String bodyString = buffer.readUtf8();
                stringToSign.append(bodyString);
            }
            
            // 生成签名
            String signature = generateSignature(stringToSign.toString(), config.getSecretKey());
            
            // 添加签名头
            Request.Builder requestBuilder = request.newBuilder()
                    .header(TIMESTAMP_HEADER, timestamp)
                    .header(SIGNATURE_HEADER, signature)
                    .header(API_KEY_HEADER, config.getApiKey());
            
            logger.debug("Signed request: method={}, path={}, timestamp={}, signature={}", 
                    request.method(), request.url().pathSegments().get(0), timestamp, signature);
            
            return requestBuilder.build();
            
        } catch (Exception e) {
            logger.error("Failed to sign request", e);
            throw new AutoPayException("Failed to sign request", e);
        }
    }
    
    /**
     * 生成签名
     */
    private String generateSignature(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(SIGNATURE_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), SIGNATURE_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new AutoPayException("Failed to generate signature", e);
        }
    }
    
    /**
     * 构建URL
     */
    private String buildUrl(String endpoint, Map<String, Object> params) {
        String baseUrl = config.getBaseUrl();
        String fullEndpoint = API_VERSION + "/" + endpoint;
        String baseFullUrl = config.getApiUrl("/" + fullEndpoint);
        
        if (params != null && !params.isEmpty()) {
            StringBuilder urlBuilder = new StringBuilder(baseFullUrl);
            urlBuilder.append("?");
            boolean first = true;
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                if (entry.getValue() != null) {
                    if (!first) {
                        urlBuilder.append("&");
                    }
                    urlBuilder.append(entry.getKey()).append("=").append(entry.getValue().toString());
                    first = false;
                }
            }
            return urlBuilder.toString();
        }
        
        return baseFullUrl;
    }
    
    /**
     * 验证响应签名
     */
    private void verifyResponseSignature(Response response, String responseBody) {
        String signatureHeader = response.header(SIGNATURE_HEADER);
        if (StringUtils.isEmpty(signatureHeader)) {
            logger.warn("No signature header in response");
            return;
        }
        
        String timestampHeader = response.header(TIMESTAMP_HEADER);
        if (StringUtils.isEmpty(timestampHeader)) {
            logger.warn("No timestamp header in response");
            return;
        }
        
        try {
            // 验证时间戳（防重放攻击）
            long responseTime = Long.parseLong(timestampHeader);
            long currentTime = System.currentTimeMillis();
            long timeDiff = Math.abs(currentTime - responseTime);
            
            if (timeDiff > 300000) { // 5分钟过期
                throw new AutoPayException("Response timestamp expired");
            }
            
            // 验证签名
            StringBuilder stringToSign = new StringBuilder();
            stringToSign.append(response.code()).append("\n");
            stringToSign.append(responseBody).append("\n");
            stringToSign.append(timestampHeader);
            
            String expectedSignature = generateSignature(stringToSign.toString(), config.getSecretKey());
            
            if (!signatureHeader.equals(expectedSignature)) {
                throw new AutoPayException("Invalid signature");
            }
            
            logger.debug("Response signature verified successfully");
            
        } catch (Exception e) {
            logger.error("Failed to verify response signature", e);
            throw new AutoPayException("Failed to verify response signature", e);
        }
    }
    
    /**
     * 发送GET请求
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> get(String endpoint, Map<String, Object> params, Class<T> responseType) {
        return (ApiResponse<T>) executeRequest("GET", endpoint, params, null, responseType);
    }
    
    /**
     * 发送GET请求（支持复杂泛型类型）
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> get(String endpoint, Map<String, Object> params, TypeReference<T> typeRef) {
        JavaType javaType = objectMapper.getTypeFactory().constructType(typeRef.getType());
        return (ApiResponse<T>) executeRequest("GET", endpoint, params, null, javaType.getRawClass(), javaType);
    }
    
    /**
     * 发送POST请求
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> post(String endpoint, Object body, Class<T> responseType) {
        return (ApiResponse<T>) executeRequest("POST", endpoint, null, body, responseType);
    }
    
    /**
     * 发送POST请求（支持复杂泛型类型）
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> post(String endpoint, Object body, TypeReference<T> typeRef) {
        JavaType javaType = objectMapper.getTypeFactory().constructType(typeRef.getType());
        return (ApiResponse<T>) executeRequest("POST", endpoint, null, body, javaType.getRawClass(), javaType);
    }
    
    /**
     * 发送PUT请求
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> put(String endpoint, Object body, Class<T> responseType) {
        return (ApiResponse<T>) executeRequest("PUT", endpoint, null, body, responseType);
    }
    
    /**
     * 发送PUT请求（支持复杂泛型类型）
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> put(String endpoint, Object body, TypeReference<T> typeRef) {
        JavaType javaType = objectMapper.getTypeFactory().constructType(typeRef.getType());
        return (ApiResponse<T>) executeRequest("PUT", endpoint, null, body, javaType.getRawClass(), javaType);
    }
    
    /**
     * 发送DELETE请求
     */
    @SuppressWarnings("unchecked")
    public <T> ApiResponse<T> delete(String endpoint, Class<T> responseType) {
        return (ApiResponse<T>) executeRequest("DELETE", endpoint, null, null, responseType);
    }
    
    /**
     * 执行HTTP请求
     * @param method HTTP方法
     * @param endpoint API端点
     * @param params 查询参数
     * @param body 请求体
     * @param responseType 响应类型（用于类型转换，仅用于兼容）
     * @return 响应结果
     */
    private ApiResponse<Object> executeRequest(String method, String endpoint, 
                                             Map<String, Object> params, 
                                             Object body, 
                                             Class<?> responseType) {
        return executeRequest(method, endpoint, params, body, responseType, null);
    }
    
    /**
     * 执行HTTP请求（支持复杂泛型类型）
     * @param method HTTP方法
     * @param endpoint API端点
     * @param params 查询参数
     * @param body 请求体
     * @param responseType 响应类型
     * @param javaType JavaType对象（用于复杂泛型类型）
     * @return 响应结果
     */
    private ApiResponse<Object> executeRequest(String method, String endpoint, 
                                             Map<String, Object> params, 
                                             Object body, 
                                             Class<?> responseType,
                                             JavaType javaType) {
        try {
            String url = buildUrl(endpoint, params);
            logger.debug("Sending {} request to: {}", method, url);
            
            RequestBody requestBody = null;
            if (body != null) {
                String jsonBody = objectMapper.writeValueAsString(body);
                requestBody = RequestBody.create(jsonBody, MediaType.parse("application/json; charset=utf-8"));
                logger.trace("Request body: {}", jsonBody);
            }
            
            Request.Builder requestBuilder = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", USER_AGENT)
                    .addHeader("Content-Type", "application/json; charset=utf-8");
            
            switch (method.toUpperCase()) {
                case "GET":
                    // GET请求不支持body
                    break;
                case "POST":
                    requestBuilder.post(requestBody != null ? requestBody : RequestBody.create(new byte[0], null));
                    break;
                case "PUT":
                    requestBuilder.put(requestBody != null ? requestBody : RequestBody.create(new byte[0], null));
                    break;
                case "DELETE":
                    requestBuilder.delete();
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported HTTP method: " + method);
            }
            
            Response response = httpClient.newCall(requestBuilder.build()).execute();
             String responseBody = response.body() != null ? response.body().string() : "";
             logger.debug("Raw response: {}", responseBody);
            
            if (!response.isSuccessful()) {
                logger.error("HTTP request failed with code: {}", response.code());
                return createErrorResponse("HTTP request failed with code: " + response.code());
            }

            // 解析响应为泛型ApiResponse<T>
            ApiResponse<Object> apiResponse;
            
            // 如果提供了JavaType，则使用它；否则创建默认的JavaType
            if (javaType != null) {
                JavaType responseTypeRef = objectMapper.getTypeFactory()
                        .constructParametricType(ApiResponse.class, javaType);
                apiResponse = objectMapper.readValue(responseBody, responseTypeRef);
            } else {
                JavaType responseTypeRef = objectMapper.getTypeFactory()
                        .constructParametricType(ApiResponse.class, responseType);
                apiResponse = objectMapper.readValue(responseBody, responseTypeRef);
            }
            
            return apiResponse;
            
        } catch (Exception e) {
            logger.error("Request execution failed", e);
            return createErrorResponse("Request execution failed: " + e.getMessage());
        }
    }
    
    /**
     * 创建错误响应
     */
    @SuppressWarnings("unchecked")
    private ApiResponse<Object> createErrorResponse(String message) {
        ApiResponse<Object> errorResponse = new ApiResponse<>();
        errorResponse.setCode(500);
        errorResponse.setMessage(message);
        errorResponse.setTimestamp(System.currentTimeMillis());
        errorResponse.setData(null);
        return errorResponse;
    }
    
    /**
     * 获取配置
     */
    public AutoPayConfig getConfig() {
        return config;
    }
    
    /**
     * 关闭客户端
     */
    public void close() {
        if (httpClient != null) {
            httpClient.dispatcher().executorService().shutdown();
            httpClient.connectionPool().evictAll();
        }
    }
}