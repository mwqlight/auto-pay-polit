"use strict";
/**
 * AutoPay Node.js SDK 类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.isError = exports.isSuccess = exports.ResponseCode = exports.PaymentStatus = void 0;
// 支付状态
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["SUCCESS"] = "success";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["EXPIRED"] = "expired";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// 响应状态码
var ResponseCode;
(function (ResponseCode) {
    ResponseCode[ResponseCode["SUCCESS"] = 200] = "SUCCESS";
    ResponseCode[ResponseCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseCode[ResponseCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseCode[ResponseCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseCode[ResponseCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseCode[ResponseCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(ResponseCode || (exports.ResponseCode = ResponseCode = {}));
// 成功响应判断
const isSuccess = (response) => response.code === ResponseCode.SUCCESS;
exports.isSuccess = isSuccess;
// 错误响应判断
const isError = (response) => response.code !== ResponseCode.SUCCESS;
exports.isError = isError;
// 日志级别
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=index.js.map