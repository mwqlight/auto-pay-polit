/**
 * AutoPay Payment Platform - 支付渠道详情对话框组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`渠道详情 - ${channel?.name || ''}`"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="channel-detail-dialog" v-if="channel">
      <div class="detail-content">
        <!-- 渠道基本信息 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>基本信息</span>
              <el-tag :type="getStatusTagType(channel.status)" size="small">
                {{ getStatusText(channel.status) }}
              </el-tag>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="info-item">
                <label>渠道编码:</label>
                <span class="info-value">{{ channel.channelCode }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>渠道名称:</label>
                <span class="info-value">{{ channel.name }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>优先级:</label>
                <span class="info-value">{{ channel.priority }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="24">
              <div class="info-item">
                <label>渠道描述:</label>
                <span class="info-value">{{ channel.description }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="info-item">
                <label>创建时间:</label>
                <span class="info-value">{{ formatDateTime(channel.createdAt) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>更新时间:</label>
                <span class="info-value">{{ formatDateTime(channel.updatedAt) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>创建人:</label>
                <span class="info-value">{{ channel.createdBy || '系统' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 性能指标 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>性能指标</span>
              <el-text size="small" type="info">实时数据</el-text>
            </div>
          </template>
          
          <div class="performance-grid">
            <div class="performance-item">
              <div class="performance-icon success">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="performance-content">
                <div class="performance-value" :class="getSuccessRateClass(channel.successRate)">
                  {{ channel.successRate }}%
                </div>
                <div class="performance-label">成功率</div>
                <div class="performance-trend">
                  <el-icon class="trend-up"><ArrowUp /></el-icon>
                  +0.5% 较昨日
                </div>
              </div>
            </div>
            
            <div class="performance-item">
              <div class="performance-icon response">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="performance-content">
                <div class="performance-value">{{ channel.avgResponseTime }}ms</div>
                <div class="performance-label">平均响应时间</div>
                <div class="performance-trend">
                  <el-icon class="trend-down"><ArrowDown /></el-icon>
                  -50ms 较昨日
                </div>
              </div>
            </div>
            
            <div class="performance-item">
              <div class="performance-icon fee">
                <el-icon><Money /></el-icon>
              </div>
              <div class="performance-content">
                <div class="performance-value">{{ channel.feeRate }}%</div>
                <div class="performance-label">交易费率</div>
                <div class="performance-trend">
                  <span class="trend-text">标准费率</span>
                </div>
              </div>
            </div>
            
            <div class="performance-item">
              <div class="performance-icon concurrency">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="performance-content">
                <div class="performance-value">{{ channel.maxConcurrency }}</div>
                <div class="performance-label">最大并发</div>
                <div class="performance-trend">
                  <span class="trend-text">{{ getConcurrencyUsage() }}% 当前使用</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 健康状态 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>健康状态</span>
              <div class="health-status">
                <el-icon :class="getHealthClass(channel.healthStatus)" size="16">
                  <component :is="getHealthIcon(channel.healthStatus)" />
                </el-icon>
                <span :class="`health-text ${getHealthClass(channel.healthStatus)}`">
                  {{ getHealthText(channel.healthStatus) }}
                </span>
              </div>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="health-info">
                <div class="health-item">
                  <label>最后检查时间:</label>
                  <span class="info-value">{{ formatDateTime(channel.lastHealthCheck) }}</span>
                </div>
                <div class="health-item">
                  <label>健康消息:</label>
                  <span class="info-value">{{ channel.healthMessage }}</span>
                </div>
                <div class="health-item">
                  <label>检查频率:</label>
                  <span class="info-value">每5分钟</span>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="health-chart">
                <div class="chart-placeholder">
                  <el-icon><PieChart /></el-icon>
                  <span>健康状态趋势图</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- API配置 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>API配置</span>
              <el-text size="small" type="info">敏感信息已隐藏</el-text>
            </div>
          </template>
          
          <div class="config-grid">
            <div class="config-item">
              <label>API地址:</label>
              <span class="info-value config-value">{{ channel.config?.apiUrl || '-' }}</span>
              <el-button size="small" text @click="copyToClipboard(channel.config?.apiUrl || '')">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
            
            <div class="config-item">
              <label>回调地址:</label>
              <span class="info-value config-value">{{ channel.config?.notifyUrl || '-' }}</span>
              <el-button size="small" text @click="copyToClipboard(channel.config?.notifyUrl || '')">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
            
            <div class="config-item">
              <label>签名算法:</label>
              <span class="info-value">{{ channel.config?.signAlgorithm || '-' }}</span>
            </div>
            
            <div class="config-item">
              <label>接入环境:</label>
              <span class="info-value">{{ getEnvironmentText(channel.config?.environment) }}</span>
            </div>
            
            <div class="config-item" v-if="channel.config?.merchantId">
              <label>商户号:</label>
              <span class="info-value">{{ maskMerchantId(channel.config.merchantId) }}</span>
            </div>
            
            <div class="config-item" v-if="channel.config?.appId">
              <label>应用ID:</label>
              <span class="info-value">{{ maskAppId(channel.config.appId) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 支付方式支持 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>支付方式支持</span>
            </div>
          </template>
          
          <div class="payment-methods">
            <div class="method-group">
              <label>支持的支付方式:</label>
              <div class="method-tags">
                <el-tag 
                  v-for="method in channel.paymentMethods" 
                  :key="method"
                  :type="getPaymentMethodTagType(method)"
                  size="small"
                  effect="plain"
                >
                  {{ getPaymentMethodText(method) }}
                </el-tag>
              </div>
            </div>
            
            <div class="method-group">
              <label>支持的货币:</label>
              <div class="method-tags">
                <el-tag 
                  v-for="currency in channel.supportedCurrencies" 
                  :key="currency"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  {{ getCurrencyText(currency) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 风险控制 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <span>风险控制</span>
              <el-tag 
                :type="getRiskLevelTagType(channel.riskControl?.riskLevel)" 
                size="small"
              >
                {{ getRiskLevelText(channel.riskControl?.riskLevel) }}
              </el-tag>
            </div>
          </template>
          
          <div class="risk-control">
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="risk-item">
                  <label>风控状态:</label>
                  <span class="info-value">
                    <el-switch
                      v-model="channel.riskControl.enabled"
                      disabled
                      active-text="启用"
                      inactive-text="禁用"
                    />
                  </span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="risk-item">
                  <label>风险等级:</label>
                  <span class="info-value">{{ getRiskLevelText(channel.riskControl?.riskLevel) }}</span>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="24">
              <el-col :span="8">
                <div class="risk-item">
                  <label>单笔最小金额:</label>
                  <span class="info-value">¥{{ channel.limits?.singleMinAmount }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="risk-item">
                  <label>单笔最大金额:</label>
                  <span class="info-value">¥{{ channel.limits?.singleMaxAmount }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="risk-item">
                  <label>日累计限额:</label>
                  <span class="info-value">¥{{ formatAmount(channel.limits?.dailyMaxAmount) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button @click="handleTestConnection" :loading="testing" :icon="Connection">
          测试连接
        </el-button>
        <el-button @click="handleViewLogs" :icon="Document">
          查看日志
        </el-button>
        <el-button type="primary" @click="handleEdit" :icon="Edit">
          编辑配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, Timer, Money, Connection, ArrowUp, ArrowDown,
  PieChart, DocumentCopy, Document, Edit, CircleCheck, CircleClose, Warning
} from '@element-plus/icons-vue'
import type { PaymentChannel } from '@/types'

const props = defineProps<{
  modelValue: boolean
  channel: PaymentChannel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit': [channel: PaymentChannel]
}>()

// 响应式数据
const testing = ref(false)

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 方法
function handleClose() {
  emit('update:modelValue', false)
}

function handleEdit() {
  if (props.channel) {
    emit('edit', props.channel)
  }
}

async function handleTestConnection() {
  if (!props.channel) return
  
  try {
    testing.value = true
    
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success(`${props.channel.name} 连接测试成功`)
  } catch (error) {
    ElMessage.error(`${props.channel.name} 连接测试失败`)
  } finally {
    testing.value = false
  }
}

function handleViewLogs() {
  ElMessage.info('日志查看功能开发中')
}

function getStatusTagType(status: string) {
  const typeMap: Record<string, string> = {
    'ENABLED': 'success',
    'DISABLED': 'info',
    'MAINTENANCE': 'warning'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '禁用',
    'MAINTENANCE': '维护中'
  }
  return textMap[status] || status
}

function getSuccessRateClass(rate: number) {
  if (rate >= 99) return 'excellent'
  if (rate >= 95) return 'good'
  if (rate >= 90) return 'warning'
  return 'error'
}

function getHealthClass(status: string) {
  const classMap: Record<string, string> = {
    'HEALTHY': 'healthy',
    'WARNING': 'warning',
    'UNHEALTHY': 'unhealthy'
  }
  return classMap[status] || 'unknown'
}

function getHealthIcon(status: string) {
  const iconMap: Record<string, string> = {
    'HEALTHY': 'CircleCheck',
    'WARNING': 'Warning',
    'UNHEALTHY': 'CircleClose'
  }
  return iconMap[status] || 'Warning'
}

function getHealthText(status: string) {
  const textMap: Record<string, string> = {
    'HEALTHY': '健康',
    'WARNING': '警告',
    'UNHEALTHY': '不健康'
  }
  return textMap[status] || status
}

function getEnvironmentText(env: string) {
  const envMap: Record<string, string> = {
    'SANDBOX': '沙箱环境',
    'PROD': '生产环境'
  }
  return envMap[env] || env
}

function getPaymentMethodText(method: string) {
  const methodMap: Record<string, string> = {
    'QR_CODE': '扫码支付',
    'H5': 'H5支付',
    'APP': 'APP支付',
    'WEB': '网页支付',
    'MINI_PROGRAM': '小程序支付'
  }
  return methodMap[method] || method
}

function getPaymentMethodTagType(method: string) {
  const typeMap: Record<string, string> = {
    'QR_CODE': 'primary',
    'H5': 'success',
    'APP': 'warning',
    'WEB': 'info',
    'MINI_PROGRAM': 'danger'
  }
  return typeMap[method] || 'info'
}

function getCurrencyText(currency: string) {
  const currencyMap: Record<string, string> = {
    'CNY': '人民币 (CNY)',
    'USD': '美元 (USD)',
    'EUR': '欧元 (EUR)',
    'HKD': '港币 (HKD)'
  }
  return currencyMap[currency] || currency
}

function getRiskLevelText(level: string) {
  const levelMap: Record<string, string> = {
    'LOW': '低风险',
    'MEDIUM': '中风险',
    'HIGH': '高风险'
  }
  return levelMap[level] || level
}

function getRiskLevelTagType(level: string) {
  const typeMap: Record<string, string> = {
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'danger'
  }
  return typeMap[level] || 'info'
}

function formatDateTime(date: string | Date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function formatAmount(amount: number | undefined) {
  if (!amount) return '0'
  return amount.toLocaleString('zh-CN')
}

function getConcurrencyUsage() {
  // 模拟并发使用率
  return Math.floor(Math.random() * 100)
}

function maskMerchantId(merchantId: string) {
  if (!merchantId) return '-'
  if (merchantId.length <= 6) return merchantId
  return merchantId.substring(0, 3) + '*'.repeat(merchantId.length - 6) + merchantId.substring(merchantId.length - 3)
}

function maskAppId(appId: string) {
  if (!appId) return '-'
  if (appId.length <= 8) return appId
  return appId.substring(0, 4) + '*'.repeat(appId.length - 8) + appId.substring(appId.length - 4)
}

function copyToClipboard(text: string) {
  if (!text) return
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}
</script>

<style scoped>
.channel-detail-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.health-text {
  font-size: 12px;
  font-weight: 500;
}

.health-text.healthy {
  color: #67c23a;
}

.health-text.warning {
  color: #e6a23c;
}

.health-text.unhealthy {
  color: #f56c6c;
}

.info-item {
  margin-bottom: 12px;
}

.info-item label {
  display: inline-block;
  width: 100px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.config-value {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.performance-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.performance-icon.success {
  background: #67c23a;
}

.performance-icon.response {
  background: #409eff;
}

.performance-icon.fee {
  background: #e6a23c;
}

.performance-icon.concurrency {
  background: #f56c6c;
}

.performance-content {
  flex: 1;
}

.performance-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.performance-value.excellent {
  color: #67c23a;
}

.performance-value.good {
  color: #409eff;
}

.performance-value.warning {
  color: #e6a23c;
}

.performance-value.error {
  color: #f56c6c;
}

.performance-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.performance-trend {
  font-size: 11px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #409eff;
}

.trend-text {
  color: #909399;
}

.health-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-chart {
  height: 120px;
}

.chart-placeholder {
  height: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.chart-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.config-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-group {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.method-group label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 100px;
  padding-top: 4px;
}

.method-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.risk-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.risk-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 120px;
}

.dialog-footer {
  text-align: right;
}

/* 滚动条样式 */
.channel-detail-dialog::-webkit-scrollbar {
  width: 6px;
}

.channel-detail-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.channel-detail-dialog::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.channel-detail-dialog::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-grid {
    grid-template-columns: 1fr;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .method-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .method-group label {
    min-width: auto;
  }
  
  .risk-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .risk-item label {
    min-width: auto;
  }
}
</style>