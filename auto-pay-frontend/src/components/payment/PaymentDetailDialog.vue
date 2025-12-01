/**
 * AutoPay Payment Platform - 支付订单详情对话框组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <el-dialog
    v-model="dialogVisible"
    title="支付订单详情"
    width="800px"
    @close="handleClose"
  >
    <div v-if="order" class="order-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4 class="section-title">基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号:</span>
            <span class="value">{{ order.merchantOrderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额:</span>
            <span class="value amount">¥{{ formatCurrency(order.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态:</span>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">支付渠道:</span>
            <el-tag>{{ getChannelName(order.channelCode) }}</el-tag>
          </div>
          <div class="info-item">
            <span class="label">支付场景:</span>
            <span class="value">{{ getSceneText(order.scene) }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品描述:</span>
            <span class="value">{{ order.description || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="detail-section">
        <h4 class="section-title">时间信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDateTime(order.createTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatDateTime(order.updateTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间:</span>
            <span class="value">{{ order.payTime ? formatDateTime(order.payTime) : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">过期时间:</span>
            <span class="value">{{ order.expireTime ? formatDateTime(order.expireTime) : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 渠道信息 -->
      <div class="detail-section">
        <h4 class="section-title">渠道信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">渠道订单号:</span>
            <span class="value">{{ order.channelOrderNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">渠道交易号:</span>
            <span class="value">{{ order.channelTradeNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">渠道状态:</span>
            <span class="value">{{ order.channelStatus || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">手续费:</span>
            <span class="value">¥{{ formatCurrency(order.feeAmount || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- 扩展信息 -->
      <div class="detail-section" v-if="order.metadata">
        <h4 class="section-title">扩展信息</h4>
        <div class="info-grid">
          <div class="info-item" v-for="(value, key) in order.metadata" :key="key">
            <span class="label">{{ key }}:</span>
            <span class="value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="detail-section" v-if="order.logs && order.logs.length > 0">
        <h4 class="section-title">操作日志</h4>
        <div class="logs-container">
          <div v-for="log in order.logs" :key="log.id" class="log-item">
            <div class="log-header">
              <span class="log-action">{{ log.action }}</span>
              <span class="log-time">{{ formatDateTime(log.createTime) }}</span>
            </div>
            <div class="log-content">{{ log.message }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="order?.status === 'PENDING'"
          type="warning" 
          @click="handleCloseOrder"
        >
          关闭订单
        </el-button>
        <el-button 
          v-if="order?.status === 'SUCCESS'"
          type="primary" 
          @click="handleQueryStatus"
        >
          查询状态
        </el-button>
        <el-button 
          v-if="order?.status === 'PENDING'"
          type="success" 
          @click="handleCopyOrderNo"
        >
          复制订单号
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { usePaymentStore } from '@/store/payment'
import type { PaymentOrder } from '@/types'

// Props
interface Props {
  modelValue: boolean
  order: PaymentOrder | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  order: null
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

// Store
const paymentStore = usePaymentStore()

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 方法
function handleClose() {
  emit('update:modelValue', false)
}

async function handleCloseOrder() {
  if (!props.order) return
  
  try {
    const success = await paymentStore.closePaymentOrder(props.order.id)
    if (success) {
      emit('refresh')
      handleClose()
    }
  } catch (error) {
    console.error('关闭订单失败:', error)
  }
}

async function handleQueryStatus() {
  if (!props.order) return
  
  try {
    const result = await paymentStore.queryPaymentStatus(props.order.id)
    if (result) {
      ElMessage.success('状态查询成功')
      emit('refresh')
    }
  } catch (error) {
    console.error('查询状态失败:', error)
  }
}

function handleCopyOrderNo() {
  if (!props.order) return
  
  navigator.clipboard.writeText(props.order.merchantOrderNo)
  ElMessage.success('订单号已复制到剪贴板')
}

function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

function formatDateTime(time: string): string {
  return new Date(time).toLocaleString('zh-CN')
}

function getChannelName(code: string): string {
  const channelMap: Record<string, string> = {
    'WECHAT': '微信支付',
    'ALIPAY': '支付宝',
    'UNIONPAY': '银联支付',
    'BANK': '网银支付'
  }
  return channelMap[code] || code
}

function getStatusType(status: string): string {
  const statusMap: Record<string, string> = {
    'SUCCESS': 'success',
    'PENDING': 'warning',
    'FAILED': 'danger',
    'CLOSED': 'info'
  }
  return statusMap[status] || 'info'
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'SUCCESS': '支付成功',
    'PENDING': '待支付',
    'FAILED': '支付失败',
    'CLOSED': '已关闭'
  }
  return statusMap[status] || '未知'
}

function getSceneText(scene: string): string {
  const sceneMap: Record<string, string> = {
    'WEB': 'PC网页',
    'H5': 'H5页面',
    'APP': '移动应用',
    'MINI_APP': '小程序'
  }
  return sceneMap[scene] || scene
}
</script>

<style scoped>
.order-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #303133;
}

.value.amount {
  font-weight: 600;
  color: #e6a23c;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-action {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-section {
    padding: 12px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .label {
    min-width: auto;
  }
}
</style>