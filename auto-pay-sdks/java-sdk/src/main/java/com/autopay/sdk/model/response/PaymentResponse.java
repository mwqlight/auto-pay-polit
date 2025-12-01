package com.autopay.sdk.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 支付响应模型
 */
public class PaymentResponse {
    
    @JsonProperty("payment_id")
    private String paymentId;
    
    @JsonProperty("order_id")
    private String orderId;
    
    @JsonProperty("payment_method")
    private String paymentMethod;
    
    @JsonProperty("channel")
    private String channel;
    
    @JsonProperty("amount")
    private BigDecimal amount;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("status")
    private PaymentStatus status;
    
    @JsonProperty("subject")
    private String subject;
    
    @JsonProperty("body")
    private String body;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("client_ip")
    private String clientIp;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    @JsonProperty("paid_at")
    private LocalDateTime paidAt;
    
    @JsonProperty("expired_at")
    private LocalDateTime expiredAt;
    
    @JsonProperty("timeout")
    private Integer timeout;
    
    @JsonProperty("refund_amount")
    private BigDecimal refundAmount;
    
    @JsonProperty("channel_response")
    private Map<String, Object> channelResponse;
    
    @JsonProperty("customer_info")
    private CustomerInfo customerInfo;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    @JsonProperty("extra")
    private Map<String, Object> extra;
    
    @JsonProperty("qr_code")
    private String qrCode;
    
    @JsonProperty("deeplink")
    private String deeplink;
    
    @JsonProperty("next_action")
    private String nextAction;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    @JsonProperty("error_code")
    private String errorCode;
    
    public enum PaymentStatus {
        @JsonProperty("pending")
        PENDING("pending"),
        
        @JsonProperty("processing")
        PROCESSING("processing"),
        
        @JsonProperty("succeeded")
        SUCCEEDED("succeeded"),
        
        @JsonProperty("failed")
        FAILED("failed"),
        
        @JsonProperty("cancelled")
        CANCELLED("cancelled"),
        
        @JsonProperty("refunded")
        REFUNDED("refunded"),
        
        @JsonProperty("expired")
        EXPIRED("expired");
        
        private final String value;
        
        PaymentStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    public static class CustomerInfo {
        @JsonProperty("customer_id")
        private String customerId;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("name")
        private String name;
        
        public CustomerInfo() {}
        
        public CustomerInfo(String customerId, String email, String phone, String name) {
            this.customerId = customerId;
            this.email = email;
            this.phone = phone;
            this.name = name;
        }
        
        // Getters and Setters
        public String getCustomerId() {
            return customerId;
        }
        
        public void setCustomerId(String customerId) {
            this.customerId = customerId;
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
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        @Override
        public String toString() {
            return "CustomerInfo{" +
                    "customerId='" + customerId + '\'' +
                    ", email='" + email + '\'' +
                    ", phone='" + phone + '\'' +
                    ", name='" + name + '\'' +
                    '}';
        }
    }
    
    // 构造函数
    public PaymentResponse() {}
    
    // Getters and Setters
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getChannel() {
        return channel;
    }
    
    public void setChannel(String channel) {
        this.channel = channel;
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
    
    public PaymentStatus getStatus() {
        return status;
    }
    
    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getClientIp() {
        return clientIp;
    }
    
    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }
    
    public void setExpiredAt(LocalDateTime expiredAt) {
        this.expiredAt = expiredAt;
    }
    
    public Integer getTimeout() {
        return timeout;
    }
    
    public void setTimeout(Integer timeout) {
        this.timeout = timeout;
    }
    
    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
    
    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public Map<String, Object> getChannelResponse() {
        return channelResponse;
    }
    
    public void setChannelResponse(Map<String, Object> channelResponse) {
        this.channelResponse = channelResponse;
    }
    
    public CustomerInfo getCustomerInfo() {
        return customerInfo;
    }
    
    public void setCustomerInfo(CustomerInfo customerInfo) {
        this.customerInfo = customerInfo;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    public Map<String, Object> getExtra() {
        return extra;
    }
    
    public void setExtra(Map<String, Object> extra) {
        this.extra = extra;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
    
    public String getDeeplink() {
        return deeplink;
    }
    
    public void setDeeplink(String deeplink) {
        this.deeplink = deeplink;
    }
    
    public String getNextAction() {
        return nextAction;
    }
    
    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    // 辅助方法
    public boolean isPending() {
        return status == PaymentStatus.PENDING;
    }
    
    public boolean isProcessing() {
        return status == PaymentStatus.PROCESSING;
    }
    
    public boolean isSucceeded() {
        return status == PaymentStatus.SUCCEEDED;
    }
    
    public boolean isFailed() {
        return status == PaymentStatus.FAILED;
    }
    
    public boolean isCancelled() {
        return status == PaymentStatus.CANCELLED;
    }
    
    public boolean isRefunded() {
        return status == PaymentStatus.REFUNDED;
    }
    
    public boolean isExpired() {
        return status == PaymentStatus.EXPIRED;
    }
    
    public boolean isCompleted() {
        return status == PaymentStatus.SUCCEEDED || status == PaymentStatus.REFUNDED;
    }
    
    public boolean isTerminal() {
        return status == PaymentStatus.SUCCEEDED || 
               status == PaymentStatus.FAILED || 
               status == PaymentStatus.CANCELLED || 
               status == PaymentStatus.REFUNDED || 
               status == PaymentStatus.EXPIRED;
    }
    
    @Override
    public String toString() {
        return "PaymentResponse{" +
                "paymentId='" + paymentId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", channel='" + channel + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", status=" + status +
                ", subject='" + subject + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", paidAt=" + paidAt +
                ", expiredAt=" + expiredAt +
                ", errorMessage='" + errorMessage + '\'' +
                ", errorCode='" + errorCode + '\'' +
                '}';
    }
}