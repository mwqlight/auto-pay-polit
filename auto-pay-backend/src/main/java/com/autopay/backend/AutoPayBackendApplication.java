package com.autopay.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * AutoPay全渠道支付驾驶舱平台 - 后端服务启动类
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */
@SpringBootApplication
@MapperScan("com.autopay.backend.repository")
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class AutoPayBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoPayBackendApplication.class, args);
        
        System.out.println("""
            🚀 AutoPay Backend Service Started Successfully!
            █████████████████████████████████████████████████
            
            📊 支付驾驶舱后端服务已启动
            🌍 API文档: http://localhost:8080/api/doc.html
            💊 健康检查: http://localhost:8080/api/actuator/health
            📈 监控指标: http://localhost:8080/api/actuator/prometheus
            🛠 Druid监控: http://localhost:8080/api/druid/
            
            🎯 核心功能模块:
            ✅ 全渠道支付管理
            ✅ 交易订单处理
            ✅ 风控安全监控
            ✅ 数据分析报表
            ✅ 退款对账管理
            
            🔧 技术栈:
            ✅ Spring Boot 3.2
            ✅ Spring Security
            ✅ MyBatis Plus
            ✅ Redis缓存
            ✅ MySQL数据库
            ✅ RabbitMQ消息队列
            ✅ Elasticsearch
            
            🎨 高科技支付驾驶舱 = 极致的支付体验！
            """);
    }
}