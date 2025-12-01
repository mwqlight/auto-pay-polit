/**
 * AutoPay Payment Platform - 交易监控页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="transaction-monitoring-container">
    <div class="page-header">
      <h2>交易监控</h2>
      <p class="page-description">实时监控交易状态、性能指标和异常情况</p>
    </div>

    <div class="monitoring-content">
      <!-- 实时状态概览 -->
      <el-card class="realtime-overview" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>实时交易概览</span>
              <el-tag :type="isRealtimeConnected ? 'success' : 'danger'" size="small">
                <el-icon><Connection v-if="isRealtimeConnected" /><CircleClose v-else /></el-icon>
                {{ isRealtimeConnected ? '实时连接中' : '连接断开' }}
              </el-tag>
            </div>
            <div class="header-actions">
              <el-button @click="refreshData" :icon="Refresh" size="small">
                刷新
              </el-button>
              <el-button @click="toggleRealtime" :icon="isRealtimeConnected ? VideoPause : VideoPlay" size="small">
                {{ isRealtimeConnected ? '暂停实时' : '开启实时' }}
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="realtime-stats">
          <div class="stat-item" v-for="item in realtimeStats" :key="item.key">
            <div class="stat-icon" :class="item.iconClass">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                {{ item.isGrowing ? '+' : '' }}{{ item.value }}
                <span class="stat-unit">{{ item.unit }}</span>
              </div>
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-change" :class="item.changeType">
                <el-icon><ArrowUp v-if="item.changeType === 'increase'" />
                  <ArrowDown v-else-if="item.changeType === 'decrease'" />
                  <Minus v-else />
                </el-icon>
                {{ item.change }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 交易趋势图表 -->
      <div class="charts-section">
        <el-card class="trend-chart" shadow="never">
          <template #header>
            <div class="card-header">
              <span>交易趋势分析</span>
              <div class="chart-controls">
                <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
                  <el-radio-button label="1h">1小时</el-radio-button>
                  <el-radio-button label="6h">6小时</el-radio-button>
                  <el-radio-button label="24h">24小时</el-radio-button>
                  <el-radio-button label="7d">7天</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="trendChartRef" class="chart-placeholder">
              <el-icon><TrendCharts /></el-icon>
              <span>交易趋势图表</span>
            </div>
          </div>
        </el-card>

        <el-card class="status-distribution" shadow="never">
          <template #header>
            <div class="card-header">
              <span>状态分布</span>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="statusChartRef" class="chart-placeholder">
              <el-icon><PieChart /></el-icon>
              <span>交易状态分布图</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 交易列表 -->
      <el-card class="transaction-list" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>实时交易流</span>
              <el-badge :value="liveTransactions.length" class="item">
                <el-icon><List /></el-icon>
              </el-badge>
            </div>
            <div class="header-actions">
              <el-button 
                @click="clearLiveTransactions" 
                :icon="Delete" 
                size="small"
                :disabled="liveTransactions.length === 0"
              >
                清空
              </el-button>
              <el-button @click="exportTransactions" :icon="Download" size="small">
                导出
              </el-button>
            </div>
          </div>
        </template>

        <!-- 筛选控件 -->
        <div class="search-filters">
          <el-row :gutter="16">
            <el-col :span="5">
              <el-input
                v-model="searchForm.orderNo"
                placeholder="订单号"
                :prefix-icon="Search"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-select v-model="searchForm.status" placeholder="状态" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="成功" value="SUCCESS" />
                <el-option label="失败" value="FAILED" />
                <el-option label="处理中" value="PENDING" />
                <el-option label="已退款" value="REFUNDED" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="searchForm.channel" placeholder="支付渠道" clearable>
                <el-option label="全部渠道" value="" />
                <el-option label="微信支付" value="WECHAT" />
                <el-option label="支付宝" value="ALIPAY" />
                <el-option label="银联支付" value="UNIONPAY" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                size="default"
              />
            </el-col>
            <el-col :span="5">
              <el-button @click="handleSearch" type="primary" :icon="Search">
                搜索
              </el-button>
              <el-button @click="handleReset" :icon="Refresh">
                重置
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 交易表格 -->
        <el-table
          v-loading="loading"
          :data="transactionList"
          class="transaction-table"
          size="small"
          height="500"
          :row-class-name="getRowClassName"
        >
          <el-table-column label="交易信息" min-width="180">
            <template #default="{ row }">
              <div class="transaction-info">
                <div class="order-no">{{ row.merchantOrderNo }}</div>
                <div class="channel-info">
                  <el-icon :class="`channel-icon channel-${row.channelCode.toLowerCase()}`">
                    <component :is="getChannelIcon(row.channelCode)" />
                  </el-icon>
                  <span class="channel-name">{{ getChannelName(row.channelCode) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="金额" width="100">
            <template #default="{ row }">
              <span class="amount" :class="getAmountClass(row.status)">
                ¥{{ formatCurrency(row.amount) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="响应时间" width="100">
            <template #default="{ row }">
              <span class="response-time" :class="getResponseTimeClass(row.responseTime)">
                {{ row.responseTime }}ms
              </span>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="140">
            <template #default="{ row }">
              <div class="time-info">
                <div class="create-time">{{ formatDateTime(row.createTime) }}</div>
                <div class="update-time" v-if="row.updateTime">更新: {{ formatTime(row.updateTime) }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="风险等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getRiskLevelType(row.riskLevel)" size="small">
                {{ getRiskLevelText(row.riskLevel) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="viewTransactionDetail(row)" :icon="View">
                  详情
                </el-button>
                <el-dropdown @command="(command) => handleTransactionAction(command, row)">
                  <el-button size="small" :icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="refund" v-if="row.status === 'SUCCESS'">
                        退款
                      </el-dropdown-item>
                      <el-dropdown-item command="retry" v-if="row.status === 'FAILED'">
                        重试
                      </el-dropdown-item>
                      <el-dropdown-item command="cancel" v-if="row.status === 'PENDING'">
                        取消
                      </el-dropdown-item>
                      <el-dropdown-item command="logs" divided>
                        查看日志
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="table-pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 异常交易监控 -->
      <el-card class="exception-monitor" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>异常交易监控</span>
              <el-badge :value="exceptionCount" :type="exceptionCount > 0 ? 'danger' : 'success'">
                <el-icon><Warning /></el-icon>
              </el-badge>
            </div>
            <div class="header-actions">
              <el-button @click="refreshExceptions" :icon="Refresh" size="small">
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <div class="exception-list" v-if="exceptionList.length > 0">
          <div 
            v-for="exception in exceptionList" 
            :key="exception.id" 
            class="exception-item"
            :class="exception.severity"
          >
            <div class="exception-header">
              <el-icon :class="getExceptionIconClass(exception.severity)">
                <Warning v-if="exception.severity === 'HIGH'" />
                <InfoFilled v-else-if="exception.severity === 'MEDIUM'" />
                <QuestionFilled v-else />
              </el-icon>
              <span class="exception-title">{{ exception.title }}</span>
              <el-tag :type="getExceptionTagType(exception.severity)" size="small">
                {{ getExceptionLevelText(exception.severity) }}
              </el-tag>
              <span class="exception-time">{{ formatTime(exception.occurTime) }}</span>
            </div>
            <div class="exception-content">
              <div class="exception-description">{{ exception.description }}</div>
              <div class="exception-actions">
                <el-button size="small" @click="handleException(exception)">
                  处理
                </el-button>
                <el-button size="small" @click="ignoreException(exception)">
                  忽略
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无异常交易" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Search, List, Delete, Download, View, More,
  Connection, CircleClose, VideoPlay, VideoPause,
  TrendCharts, PieChart, ArrowUp, ArrowDown, Minus,
  Warning, InfoFilled, QuestionFilled
} from '@element-plus/icons-vue'
import { usePaymentStore } from '@/store/payment'
import type { PaymentOrder } from '@/types'

const paymentStore = usePaymentStore()

// 响应式数据
const loading = ref(false)
const isRealtimeConnected = ref(true)
const trendPeriod = ref('24h')
const trendChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
let realtimeTimer: NodeJS.Timeout | null = null

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: '',
  channel: '',
  dateRange: [] as string[]
})

// 分页
const pagination = reactive({
  page: 1,
  size: 50,
  total: 0
})

// 实时统计数据
const realtimeStats = computed(() => [
  {
    key: 'total',
    label: '今日交易总数',
    value: 15420,
    unit: '笔',
    change: '+8.5%',
    changeType: 'increase',
    isGrowing: true,
    icon: 'Document',
    iconClass: 'total'
  },
  {
    key: 'success',
    label: '成功交易',
    value: 15189,
    unit: '笔',
    change: '98.5%',
    changeType: 'good',
    isGrowing: true,
    icon: 'CircleCheck',
    iconClass: 'success'
  },
  {
    key: 'amount',
    label: '交易总金额',
    value: 2834567.89,
    unit: '元',
    change: '+12.3%',
    changeType: 'increase',
    isGrowing: true,
    icon: 'Money',
    iconClass: 'amount'
  },
  {
    key: 'failed',
    label: '失败交易',
    value: 231,
    unit: '笔',
    change: '1.5%',
    changeType: 'decrease',
    isGrowing: false,
    icon: 'CircleClose',
    iconClass: 'failed'
  }
])

// 实时交易流
const liveTransactions = ref<any[]>([])

// 异常交易列表
const exceptionList = ref<any[]>([
  {
    id: 1,
    title: '渠道响应超时',
    description: '微信支付渠道响应时间超过5秒',
    severity: 'HIGH',
    occurTime: new Date(),
    merchantOrderNo: 'ORD202412011234'
  },
  {
    id: 2,
    title: '异常交易金额',
    description: '检测到大额交易需要人工审核',
    severity: 'MEDIUM',
    occurTime: new Date(Date.now() - 300000),
    merchantOrderNo: 'ORD202412011235'
  }
])

// 交易列表
const transactionList = computed(() => {
  // 这里应该根据实际API返回数据
  return []
})

// 异常数量
const exceptionCount = computed(() => exceptionList.value.length)

// 方法
function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

function formatDateTime(time: string): string {
  return new Date(time).toLocaleString('zh-CN')
}

function formatTime(time: string | Date): string {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

function getChannelIcon(code: string) {
  return 'CreditCard'
}

function getChannelName(code: string): string {
  const nameMap: Record<string, string> = {
    'WECHAT': '微信支付',
    'ALIPAY': '支付宝',
    'UNIONPAY': '银联支付'
  }
  return nameMap[code] || code
}

function getStatusTagType(status: string) {
  const typeMap: Record<string, string> = {
    'SUCCESS': 'success',
    'FAILED': 'danger',
    'PENDING': 'warning',
    'REFUNDED': 'info'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    'SUCCESS': '成功',
    'FAILED': '失败',
    'PENDING': '处理中',
    'REFUNDED': '已退款'
  }
  return textMap[status] || status
}

function getAmountClass(status: string) {
  return status === 'FAILED' ? 'amount-failed' : 'amount-success'
}

function getResponseTimeClass(time: number) {
  if (time <= 1000) return 'response-fast'
  if (time <= 3000) return 'response-normal'
  return 'response-slow'
}

function getRiskLevelType(level: string) {
  const typeMap: Record<string, string> = {
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'danger'
  }
  return typeMap[level] || 'info'
}

function getRiskLevelText(level: string) {
  const textMap: Record<string, string> = {
    'LOW': '低风险',
    'MEDIUM': '中风险',
    'HIGH': '高风险'
  }
  return textMap[level] || level
}

function getRowClassName({ row }: { row: PaymentOrder }) {
  if (row.riskLevel === 'HIGH') return 'high-risk-row'
  if (row.status === 'FAILED') return 'failed-row'
  return ''
}

function getExceptionIconClass(severity: string) {
  return `exception-icon severity-${severity.toLowerCase()}`
}

function getExceptionTagType(severity: string) {
  const typeMap: Record<string, string> = {
    'HIGH': 'danger',
    'MEDIUM': 'warning',
    'LOW': 'info'
  }
  return typeMap[severity] || 'info'
}

function getExceptionLevelText(severity: string) {
  const textMap: Record<string, string> = {
    'HIGH': '高危',
    'MEDIUM': '中危',
    'LOW': '低危'
  }
  return textMap[severity] || severity
}

async function handleSearch() {
  pagination.page = 1
  await loadTransactionData()
}

function handleReset() {
  searchForm.orderNo = ''
  searchForm.status = ''
  searchForm.channel = ''
  searchForm.dateRange = []
  pagination.page = 1
  loadTransactionData()
}

async function loadTransactionData() {
  try {
    loading.value = true
    // 这里调用API加载交易数据
    console.log('加载交易数据...')
  } catch (error) {
    console.error('加载交易数据失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSizeChange(size: number) {
  pagination.size = size
  loadTransactionData()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  loadTransactionData()
}

function refreshData() {
  loadTransactionData()
  loadExceptionData()
}

function toggleRealtime() {
  isRealtimeConnected.value = !isRealtimeConnected.value
  if (isRealtimeConnected.value) {
    startRealtimeMonitoring()
  } else {
    stopRealtimeMonitoring()
  }
}

function startRealtimeMonitoring() {
  realtimeTimer = setInterval(() => {
    // 模拟实时数据更新
    console.log('实时监控数据更新...')
  }, 3000)
}

function stopRealtimeMonitoring() {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

function clearLiveTransactions() {
  liveTransactions.value = []
}

function exportTransactions() {
  console.log('导出交易数据...')
}

function loadTrendData() {
  console.log('加载趋势数据:', trendPeriod.value)
}

function refreshExceptions() {
  loadExceptionData()
}

async function loadExceptionData() {
  // 加载异常交易数据
  console.log('加载异常交易数据...')
}

function viewTransactionDetail(transaction: PaymentOrder) {
  console.log('查看交易详情:', transaction)
}

function handleTransactionAction(command: string, transaction: PaymentOrder) {
  console.log('处理交易操作:', command, transaction)
}

function handleException(exception: any) {
  console.log('处理异常:', exception)
}

function ignoreException(exception: any) {
  exceptionList.value = exceptionList.value.filter(e => e.id !== exception.id)
}

// 生命周期
onMounted(() => {
  loadTransactionData()
  loadExceptionData()
  startRealtimeMonitoring()
})

onUnmounted(() => {
  stopRealtimeMonitoring()
})
</script>

<style scoped>
.transaction-monitoring-container {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.realtime-overview {
  margin-bottom: 24px;
}

.realtime-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.stat-icon.amount {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.failed {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-unit {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.increase {
  color: #67c23a;
}

.stat-change.decrease {
  color: #f56c6c;
}

.stat-change.good {
  color: #409eff;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 14px;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.search-filters {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.transaction-table {
  margin-bottom: 16px;
}

.transaction-table .high-risk-row {
  background-color: #fef0f0;
}

.transaction-table .failed-row {
  background-color: #f4f4f5;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.channel-icon {
  font-size: 16px;
}

.channel-name {
  font-size: 12px;
  color: #909399;
}

.amount {
  font-weight: 600;
}

.amount-success {
  color: #67c23a;
}

.amount-failed {
  color: #f56c6c;
}

.response-time {
  font-size: 12px;
  font-weight: 500;
}

.response-fast {
  color: #67c23a;
}

.response-normal {
  color: #e6a23c;
}

.response-slow {
  color: #f56c6c;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.create-time {
  font-size: 12px;
  color: #303133;
}

.update-time {
  font-size: 11px;
  color: #909399;
}

.table-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.exception-monitor {
  margin-top: 24px;
}

.exception-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exception-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  background: #fafafa;
}

.exception-item.severity-high {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.exception-item.severity-medium {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.exception-item.severity-low {
  border-left-color: #909399;
  background: #f4f4f5;
}

.exception-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.exception-icon {
  font-size: 16px;
}

.exception-icon.severity-high {
  color: #f56c6c;
}

.exception-icon.severity-medium {
  color: #e6a23c;
}

.exception-icon.severity-low {
  color: #909399;
}

.exception-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  flex: 1;
}

.exception-time {
  font-size: 12px;
  color: #909399;
}

.exception-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exception-description {
  font-size: 13px;
  color: #606266;
  flex: 1;
  margin-right: 16px;
}

.exception-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .realtime-stats {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .realtime-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .search-filters {
    padding: 12px;
  }
  
  .exception-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .exception-actions {
    align-self: stretch;
  }
}
</style>