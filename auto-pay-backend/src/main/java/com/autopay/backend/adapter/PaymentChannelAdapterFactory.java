package com.autopay.backend.adapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 支付渠道适配器工厂
 * 
 * 负责管理和分发支付渠道适配器实例
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Component
public class PaymentChannelAdapterFactory {
    
    // 缓存适配器实例，键为渠道类型
    private final Map<Integer, PaymentChannelAdapter> adapterCache = new ConcurrentHashMap<>();
    
    // 注册的适配器列表
    private final List<PaymentChannelAdapter> registeredAdapters;
    
    @Autowired
    public PaymentChannelAdapterFactory(List<PaymentChannelAdapter> adapters) {
        this.registeredAdapters = adapters;
        // 初始化时注册所有适配器
        registerAdapters();
    }
    
    /**
     * 注册所有适配器
     */
    private void registerAdapters() {
        for (PaymentChannelAdapter adapter : registeredAdapters) {
            Integer channelType = adapter.getChannelType();
            if (channelType != null) {
                adapterCache.put(channelType, adapter);
                System.out.println("注册支付渠道适配器: " + adapter.getAdapterName() + " (类型: " + channelType + ")");
            }
        }
    }
    
    /**
     * 根据渠道类型获取适配器
     * 
     * @param channelType 渠道类型
     * @return 适配器实例
     * @throws PaymentException 适配器不存在异常
     */
    public PaymentChannelAdapter getAdapter(Integer channelType) throws PaymentException {
        PaymentChannelAdapter adapter = adapterCache.get(channelType);
        if (adapter == null) {
            throw new PaymentException.PaymentException(
                "CHANNEL_ADAPTER_NOT_FOUND", 
                "未找到渠道类型为 [" + channelType + "] 的支付适配器"
            );
        }
        return adapter;
    }
    
    /**
     * 根据渠道编码获取适配器
     * 
     * @param channelCode 渠道编码
     * @return 适配器实例
     * @throws PaymentException 适配器不存在异常
     */
    public PaymentChannelAdapter getAdapterByCode(String channelCode) throws PaymentException {
        for (PaymentChannelAdapter adapter : adapterCache.values()) {
            if (adapter.getAdapterName().toLowerCase().contains(channelCode.toLowerCase())) {
                return adapter;
            }
        }
        throw new PaymentException.PaymentException(
            "CHANNEL_ADAPTER_NOT_FOUND", 
            "未找到渠道编码为 [" + channelCode + "] 的支付适配器"
        );
    }
    
    /**
     * 动态注册适配器
     * 
     * @param channelType 渠道类型
     * @param adapter 适配器实例
     */
    public void registerAdapter(Integer channelType, PaymentChannelAdapter adapter) {
        if (channelType != null && adapter != null) {
            adapterCache.put(channelType, adapter);
            System.out.println("动态注册支付渠道适配器: " + adapter.getAdapterName() + " (类型: " + channelType + ")");
        }
    }
    
    /**
     * 移除适配器
     * 
     * @param channelType 渠道类型
     */
    public void unregisterAdapter(Integer channelType) {
        PaymentChannelAdapter removed = adapterCache.remove(channelType);
        if (removed != null) {
            System.out.println("移除支付渠道适配器: " + removed.getAdapterName() + " (类型: " + channelType + ")");
        }
    }
    
    /**
     * 获取所有已注册的适配器
     * 
     * @return 适配器映射表
     */
    public Map<Integer, PaymentChannelAdapter> getAllAdapters() {
        return new HashMap<>(adapterCache);
    }
    
    /**
     * 获取所有支持的渠道类型
     * 
     * @return 渠道类型列表
     */
    public List<Integer> getSupportedChannelTypes() {
        return adapterCache.keySet().stream()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * 检查指定渠道类型是否支持
     * 
     * @param channelType 渠道类型
     * @return 是否支持
     */
    public boolean supportsChannelType(Integer channelType) {
        return adapterCache.containsKey(channelType);
    }
    
    /**
     * 获取适配器描述信息
     * 
     * @return 适配器描述映射
     */
    public Map<Integer, String> getAdapterDescriptions() {
        Map<Integer, String> descriptions = new HashMap<>();
        adapterCache.forEach((type, adapter) -> {
            descriptions.put(type, adapter.getAdapterName());
        });
        return descriptions;
    }
    
    /**
     * 获取适配器支持的支付场景
     * 
     * @param channelType 渠道类型
     * @return 支持的场景列表
     */
    public List<String> getSupportedScenes(Integer channelType) {
        PaymentChannelAdapter adapter = adapterCache.get(channelType);
        if (adapter != null) {
            return adapter.getSupportedScenes();
        }
        return java.util.Collections.emptyList();
    }
    
    /**
     * 获取适配器支持的币种
     * 
     * @param channelType 渠道类型
     * @return 支持的币种列表
     */
    public List<String> getSupportedCurrencies(Integer channelType) {
        PaymentChannelAdapter adapter = adapterCache.get(channelType);
        if (adapter != null) {
            return adapter.getSupportedCurrencies();
        }
        return java.util.Collections.emptyList();
    }
    
    /**
     * 验证适配器配置
     * 
     * @param channelType 渠道类型
     * @param channel 渠道配置
     * @return 验证结果
     */
    public boolean validateAdapterConfig(Integer channelType, com.autopay.backend.entity.PaymentChannel channel) {
        try {
            PaymentChannelAdapter adapter = getAdapter(channelType);
            return adapter.validateConfig(channel);
        } catch (PaymentException.PaymentException e) {
            System.err.println("适配器配置验证失败: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * 执行健康检查
     * 
     * @param channelType 渠道类型
     * @param channel 渠道配置
     * @return 健康检查结果
     */
    public PaymentChannelAdapter.HealthCheckResult performHealthCheck(
            Integer channelType, 
            com.autopay.backend.entity.PaymentChannel channel) {
        try {
            PaymentChannelAdapter adapter = getAdapter(channelType);
            return adapter.healthCheck(channel);
        } catch (PaymentException.PaymentException e) {
            return PaymentChannelAdapter.HealthCheckResult.unhealthy(
                "健康检查失败: " + e.getMessage(),
                e.getMessage()
            );
        }
    }
}