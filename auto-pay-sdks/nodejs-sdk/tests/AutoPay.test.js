"use strict";
/**
 * AutoPay SDK 基础测试
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AutoPay_1 = require("../src/AutoPay");
/**
 * 测试基础功能
 */
describe('AutoPay SDK', () => {
    /**
     * 测试SDK初始化
     */
    describe('初始化', () => {
        test('应该能够创建AutoPay实例', () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            expect(autoPay).toBeInstanceOf(AutoPay_1.AutoPay);
        });
        test('应该能够从配置对象创建实例', () => {
            const config = {
                apiKey: 'test-api-key',
                secretKey: 'test-secret-key'
            };
            const autoPay = AutoPay_1.AutoPay.fromConfig(config);
            expect(autoPay).toBeInstanceOf(AutoPay_1.AutoPay);
        });
        test('应该能够使用构建器模式创建实例', () => {
            const autoPay = AutoPay_1.AutoPay.newBuilder()
                .apiKey('test-api-key')
                .secretKey('test-secret-key')
                .build();
            expect(autoPay).toBeInstanceOf(AutoPay_1.AutoPay);
        });
    });
    /**
     * 测试配置获取
     */
    describe('配置管理', () => {
        test('应该能够获取配置', () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            const config = autoPay.getConfig();
            expect(config.getApiKey()).toBe('test-api-key');
            expect(config.getSecretKey()).toBe('test-secret-key');
        });
        test('应该能够获取环境信息', () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            expect(autoPay.getEnvironment()).toBeDefined();
            expect(autoPay.getBaseUrl()).toBeDefined();
        });
    });
    /**
     * 测试健康检查
     */
    describe('健康检查', () => {
        test('should be healthy after initialization', () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            expect(autoPay.isHealthy()).toBe(true);
        });
    });
    /**
     * 测试资源清理
     */
    describe('资源清理', () => {
        test('应该能够关闭实例', async () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            await expect(autoPay.close()).resolves.not.toThrow();
        });
        test('应该能够销毁实例', async () => {
            const autoPay = AutoPay_1.AutoPay.create('test-api-key', 'test-secret-key');
            await expect(autoPay.destroy()).resolves.not.toThrow();
        });
    });
    /**
     * 测试错误处理
     */
    describe('错误处理', () => {
        test('应该抛出错误当API密钥为空时', () => {
            expect(() => {
                AutoPay_1.AutoPay.create('', 'test-secret-key');
            }).toThrow('API密钥不能为空');
        });
        test('应该抛出错误当密钥为空时', () => {
            expect(() => {
                AutoPay_1.AutoPay.create('test-api-key', '');
            }).toThrow('密钥不能为空');
        });
        test('应该抛出错误当两个密钥都为空时', () => {
            expect(() => {
                AutoPay_1.AutoPay.create('', '');
            }).toThrow('API密钥不能为空');
        });
    });
});
//# sourceMappingURL=AutoPay.test.js.map