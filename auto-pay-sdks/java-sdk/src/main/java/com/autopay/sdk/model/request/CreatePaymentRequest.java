package com.autopay.sdk.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * 创建支付请求模型
 */
public class CreatePaymentRequest {
    
    @JsonProperty("order_id")
    private String orderId;
    
    @JsonProperty("amount")
    private BigDecimal amount;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("channel")
    private String channel;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("notify_url")
    private String notifyUrl;
    
    @JsonProperty("return_url")
    private String returnUrl;
    
    @JsonProperty("client_ip")
    private String clientIp;
    
    @JsonProperty("extra")
    private Map<String, Object> extra;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    @JsonProperty("timeout")
    private Integer timeout;
    
    @JsonProperty("payment_method")
    private String paymentMethod;
    
    @JsonProperty("customer_id")
    private String customerId;
    
    @JsonProperty("customer")
    private CustomerInfo customer;
    
    // 构造方法
    public CreatePaymentRequest() {
        this.extra = new HashMap<>();
        this.metadata = new HashMap<>();
    }
    
    public CreatePaymentRequest(String orderId, BigDecimal amount, String currency, String channel) {
        this();
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.channel = channel;
    }
    
    // Builder模式
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private CreatePaymentRequest request = new CreatePaymentRequest();
        
        public Builder orderId(String orderId) {
            request.orderId = orderId;
            return this;
        }
        
        public Builder amount(BigDecimal amount) {
            request.amount = amount;
            return this;
        }
        
        public Builder amount(double amount) {
            request.amount = BigDecimal.valueOf(amount);
            return this;
        }
        
        public Builder currency(String currency) {
            request.currency = currency;
            return this;
        }
        
        public Builder channel(String channel) {
            request.channel = channel;
            return this;
        }
        
        public Builder description(String description) {
            request.description = description;
            return this;
        }
        
        public Builder notifyUrl(String notifyUrl) {
            request.notifyUrl = notifyUrl;
            return this;
        }
        
        public Builder returnUrl(String returnUrl) {
            request.returnUrl = returnUrl;
            return this;
        }
        
        public Builder clientIp(String clientIp) {
            request.clientIp = clientIp;
            return this;
        }
        
        public Builder extra(String key, Object value) {
            request.extra.put(key, value);
            return this;
        }
        
        public Builder metadata(String key, Object value) {
            request.metadata.put(key, value);
            return this;
        }
        
        public Builder timeout(Integer timeout) {
            request.timeout = timeout;
            return this;
        }
        
        public Builder paymentMethod(String paymentMethod) {
            request.paymentMethod = paymentMethod;
            return this;
        }
        
        public Builder customerId(String customerId) {
            request.customerId = customerId;
            return this;
        }
        
        public Builder customer(CustomerInfo customer) {
            request.customer = customer;
            return this;
        }
        
        public CreatePaymentRequest build() {
            // 验证必需参数
            if (request.orderId == null || request.orderId.trim().isEmpty()) {
                throw new IllegalArgumentException("订单ID不能为空");
            }
            if (request.amount == null || request.amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("支付金额必须大于0");
            }
            if (request.currency == null || request.currency.trim().isEmpty()) {
                throw new IllegalArgumentException("货币代码不能为空");
            }
            if (request.channel == null || request.channel.trim().isEmpty()) {
                throw new IllegalArgumentException("支付渠道不能为空");
            }
            
            return request;
        }
    }
    
    /**
     * 客户信息内部类
     */
    public static class CustomerInfo {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("address")
        private String address;
        
        // 默认构造方法
        public CustomerInfo() {}
        
        public CustomerInfo(String name, String email) {
            this.name = name;
            this.email = email;
        }
        
        // Getter和Setter
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPhone() {
            return phone;
        }
        
        public void setPhone(String phone) {
            this.phone = phone;
        }
        
        public String getAddress() {
            return address;
        }
        
        public void setAddress(String address) {
            this.address = address;
        }
        
        @Override
        public String toString() {
            return String.format("CustomerInfo{name='%s', email='%s', phone='%s'}", 
                    name, email, phone);
        }
    }
    
    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getChannel() {
        return channel;
    }
    
    public void setChannel(String channel) {
        this.channel = channel;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getNotifyUrl() {
        return notifyUrl;
    }
    
    public void setNotifyUrl(String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }
    
    public String getReturnUrl() {
        return returnUrl;
    }
    
    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }
    
    public String getClientIp() {
        return clientIp;
    }
    
    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }
    
    public Map<String, Object> getExtra() {
        return extra;
    }
    
    public void setExtra(Map<String, Object> extra) {
        this.extra = extra;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    public Integer getTimeout() {
        return timeout;
    }
    
    public void setTimeout(Integer timeout) {
        this.timeout = timeout;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public CustomerInfo getCustomer() {
        return customer;
    }
    
    public void setCustomer(CustomerInfo customer) {
        this.customer = customer;
    }
    
    @Override
    public String toString() {
        return "CreatePaymentRequest{" +
                "orderId='" + orderId + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", channel='" + channel + '\'' +
                ", description='" + description + '\'' +
                ", notifyUrl='" + notifyUrl + '\'' +
                ", returnUrl='" + returnUrl + '\'' +
                ", clientIp='" + clientIp + '\'' +
                ", extra=" + extra +
                ", metadata=" + metadata +
                ", timeout=" + timeout +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", customerId='" + customerId + '\'' +
                ", customer=" + customer +
                '}';
    }
}