package com.autopay.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 统一API响应结果
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Data
@Schema(description = "统一API响应结果")
public class ApiResult<T> {

    @Schema(description = "响应状态码")
    private Integer code;

    @Schema(description = "响应消息")
    private String message;

    @Schema(description = "响应数据")
    private T data;

    @Schema(description = "响应时间戳")
    private Long timestamp;

    public ApiResult() {
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResult(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功响应
     */
    public static <T> ApiResult<T> success() {
        return new ApiResult<>(200, "操作成功", null);
    }

    public static <T> ApiResult<T> success(T data) {
        return new ApiResult<>(200, "操作成功", data);
    }

    public static <T> ApiResult<T> success(String message, T data) {
        return new ApiResult<>(200, message, data);
    }

    /**
     * 失败响应
     */
    public static <T> ApiResult<T> error() {
        return new ApiResult<>(500, "系统异常", null);
    }

    public static <T> ApiResult<T> error(String message) {
        return new ApiResult<>(500, message, null);
    }

    public static <T> ApiResult<T> error(Integer code, String message) {
        return new ApiResult<>(code, message, null);
    }

    public static <T> ApiResult<T> error(Integer code, String message, T data) {
        return new ApiResult<>(code, message, data);
    }

    /**
     * 自定义响应
     */
    public static <T> ApiResult<T> result(Integer code, String message, T data) {
        return new ApiResult<>(code, message, data);
    }
}