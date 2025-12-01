package com.autopay.sdk.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 查询支付请求模型
 */
public class QueryPaymentRequest {
    
    @JsonProperty("payment_id")
    private String paymentId;
    
    @JsonProperty("order_id")
    private String orderId;
    
    @JsonProperty("merchant_id")
    private String merchantId;
    
    @JsonProperty("channel")
    private String channel;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("start_time")
    private String startTime;
    
    @JsonProperty("end_time")
    private String endTime;
    
    @JsonProperty("page")
    private int page = 1;
    
    @JsonProperty("size")
    private int size = 20;
    
    @JsonProperty("sort_by")
    private String sortBy = "created_at";
    
    @JsonProperty("sort_order")
    private String sortOrder = "desc"; // asc, desc
    
    // 构造方法
    public QueryPaymentRequest() {}
    
    public QueryPaymentRequest(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public QueryPaymentRequest(String paymentId, String orderId) {
        this.paymentId = paymentId;
        this.orderId = orderId;
    }
    
    // Builder模式
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private final QueryPaymentRequest request = new QueryPaymentRequest();
        
        public Builder paymentId(String paymentId) {
            request.setPaymentId(paymentId);
            return this;
        }
        
        public Builder orderId(String orderId) {
            request.setOrderId(orderId);
            return this;
        }
        
        public Builder merchantId(String merchantId) {
            request.setMerchantId(merchantId);
            return this;
        }
        
        public Builder channel(String channel) {
            request.setChannel(channel);
            return this;
        }
        
        public Builder status(String status) {
            request.setStatus(status);
            return this;
        }
        
        public Builder startTime(String startTime) {
            request.setStartTime(startTime);
            return this;
        }
        
        public Builder endTime(String endTime) {
            request.setEndTime(endTime);
            return this;
        }
        
        public Builder page(int page) {
            request.setPage(page);
            return this;
        }
        
        public Builder size(int size) {
            request.setSize(size);
            return this;
        }
        
        public Builder sortBy(String sortBy) {
            request.setSortBy(sortBy);
            return this;
        }
        
        public Builder sortOrder(String sortOrder) {
            request.setSortOrder(sortOrder);
            return this;
        }
        
        public QueryPaymentRequest build() {
            return request;
        }
    }
    
    // Getter和Setter方法
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
    
    public String getMerchantId() {
        return merchantId;
    }
    
    public void setMerchantId(String merchantId) {
        this.merchantId = merchantId;
    }
    
    public String getChannel() {
        return channel;
    }
    
    public void setChannel(String channel) {
        this.channel = channel;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
    
    public String getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    @Override
    public String toString() {
        return String.format("QueryPaymentRequest{paymentId='%s', orderId='%s', channel='%s', status='%s', page=%d, size=%d}", 
                paymentId, orderId, channel, status, page, size);
    }
}