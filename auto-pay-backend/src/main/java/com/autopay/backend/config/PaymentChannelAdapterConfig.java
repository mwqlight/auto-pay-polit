package com.autopay.backend.config;

import com.autopay.backend.adapter.PaymentChannelAdapter;
import com.autopay.backend.adapter.PaymentChannelAdapterFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;

/**
 * 支付渠道适配器配置类
 * 
 * 配置适配器工厂和相关Bean
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@Configuration
public class PaymentChannelAdapterConfig {
    
    /**
     * 注册适配器工厂Bean
     * 
     * @param adapters 所有支付渠道适配器实现
     * @return 适配器工厂实例
     */
    @Bean
    @Primary
    public PaymentChannelAdapterFactory paymentChannelAdapterFactory(
            @Autowired List<PaymentChannelAdapter> adapters) {
        System.out.println("初始化支付渠道适配器工厂，检测到 " + adapters.size() + " 个适配器");
        
        PaymentChannelAdapterFactory factory = new PaymentChannelAdapterFactory(adapters);
        
        // 输出注册的适配器信息
        System.out.println("已注册的支付渠道适配器:");
        adapters.forEach(adapter -> {
            System.out.println("  - " + adapter.getAdapterName() + " (类型: " + adapter.getChannelType() + ")");
        });
        
        return factory;
    }
}