package com.autopay.sdk.client;

/**
 * AutoPay SDK异常类
 */
public class AutoPayException extends RuntimeException {
    
    private int code;
    private String status;
    
    public AutoPayException(String message) {
        super(message);
    }
    
    public AutoPayException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public AutoPayException(String message, int code) {
        super(message);
        this.code = code;
    }
    
    public AutoPayException(String message, String status) {
        super(message);
        this.status = status;
    }
    
    public AutoPayException(String message, int code, String status) {
        super(message);
        this.code = code;
        this.status = status;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getStatus() {
        return status;
    }
    
    @Override
    public String toString() {
        return String.format("AutoPayException{code=%d, status='%s', message='%s'}", 
                code, status, getMessage());
    }
}