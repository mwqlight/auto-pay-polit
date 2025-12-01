/**
 * AutoPay Payment Platform - 数据总览页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon today-payment">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ formatCurrency(stats.todayAmount) }}</div>
          <div class="stat-label">今日交易额</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.todayGrowth }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon today-order">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.todayCount }}</div>
          <div class="stat-label">今日订单数</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.orderGrowth }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success-rate">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.successRate }}%</div>
          <div class="stat-label">成功率</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.rateGrowth }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active-channel">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeChannels }}/{{ stats.totalChannels }}</div>
          <div class="stat-label">活跃渠道</div>
          <div class="stat-change">
            {{ stats.healthyChannels }} 健康
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 交易趋势图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>交易趋势</h3>
          <div class="chart-controls">
            <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
              <el-radio-button label="7d">7天</el-radio-button>
              <el-radio-button label="30d">30天</el-radio-button>
              <el-radio-button label="90d">90天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-content">
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 渠道分布图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>渠道分布</h3>
          <el-button text type="primary" size="small" @click="refreshChannelData">
            刷新
          </el-button>
        </div>
        <div class="chart-content">
          <div ref="channelChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="details-grid">
      <!-- 最近订单 -->
      <div class="detail-card">
        <div class="detail-header">
          <h3>最近订单</h3>
          <el-button text type="primary" size="small" @click="$router.push('/payments/list')">
            查看全部
          </el-button>
        </div>
        <div class="detail-content">
          <el-table :data="recentOrders" stripe size="small" v-loading="loading">
            <el-table-column prop="merchantOrderNo" label="订单号" width="140" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                ¥{{ formatCurrency(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button text type="primary" size="small" @click="viewOrder(row.id)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 渠道状态 -->
      <div class="detail-card">
        <div class="detail-header">
          <h3>渠道状态</h3>
          <el-button text type="primary" size="small" @click="$router.push('/channels/list')">
            全部管理
          </el-button>
        </div>
        <div class="detail-content">
          <div class="channel-status-list">
            <div 
              v-for="channel in channelStatus" 
              :key="channel.code" 
              class="channel-item"
            >
              <div class="channel-info">
                <span class="channel-name">{{ channel.name }}</span>
                <el-tag 
                  :type="channel.status === 'HEALTHY' ? 'success' : 'danger'" 
                  size="small"
                >
                  {{ getChannelStatusText(channel.status) }}
                </el-tag>
              </div>
              <div class="channel-stats">
                <span class="stat-item">成功率: {{ channel.successRate }}%</span>
                <span class="stat-item">QPS: {{ channel.qps }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="system-status-card">
      <h3>系统状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">CPU使用率</span>
          <el-progress 
            :percentage="systemStatus.cpuUsage" 
            :color="getProgressColor(systemStatus.cpuUsage)"
            :stroke-width="6"
          />
          <span class="status-value">{{ systemStatus.cpuUsage }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">内存使用率</span>
          <el-progress 
            :percentage="systemStatus.memoryUsage" 
            :color="getProgressColor(systemStatus.memoryUsage)"
            :stroke-width="6"
          />
          <span class="status-value">{{ systemStatus.memoryUsage }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">数据库连接</span>
          <span class="status-value">{{ systemStatus.dbConnections }}/{{ systemStatus.maxDbConnections }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Redis状态</span>
          <span :class="['status-value', systemStatus.redisStatus ? 'healthy' : 'unhealthy']">
            {{ systemStatus.redisStatus ? '正常' : '异常' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Money, 
  Document, 
  CircleCheck, 
  Connection, 
  ArrowUp 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePaymentStore } from '@/store/payment'
import type { PaymentOrder, PaymentChannel } from '@/types'

const router = useRouter()
const paymentStore = usePaymentStore()

// 响应式数据
const loading = ref(false)
const trendPeriod = ref('7d')
const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()

// 统计数据
const stats = reactive({
  todayAmount: 125680.50,
  todayCount: 1247,
  successRate: 98.5,
  activeChannels: 8,
  totalChannels: 12,
  healthyChannels: 10,
  todayGrowth: 15.2,
  orderGrowth: 8.7,
  rateGrowth: 2.1
})

// 最近订单
const recentOrders = ref<PaymentOrder[]>([
  {
    id: 1,
    merchantOrderNo: 'ORD202412011234',
    amount: 299.00,
    status: 'SUCCESS',
    createTime: '2024-12-01 14:30:25'
  },
  {
    id: 2,
    merchantOrderNo: 'ORD202412011233',
    amount: 1580.00,
    status: 'PENDING',
    createTime: '2024-12-01 14:28:10'
  },
  {
    id: 3,
    merchantOrderNo: 'ORD202412011232',
    amount: 89.90,
    status: 'FAILED',
    createTime: '2024-12-01 14:25:33'
  }
])

// 渠道状态
const channelStatus = ref([
  { code: 'WECHAT', name: '微信支付', status: 'HEALTHY', successRate: 99.2, qps: 156 },
  { code: 'ALIPAY', name: '支付宝', status: 'HEALTHY', successRate: 98.8, qps: 142 },
  { code: 'UNIONPAY', name: '银联支付', status: 'HEALTHY', successRate: 97.5, qps: 89 },
  { code: 'BANK', name: '网银支付', status: 'MAINTENANCE', successRate: 0, qps: 0 }
])

// 系统状态
const systemStatus = reactive({
  cpuUsage: 45,
  memoryUsage: 62,
  dbConnections: 25,
  maxDbConnections: 100,
  redisStatus: true
})

// 方法
function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
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
    'SUCCESS': '成功',
    'PENDING': '处理中',
    'FAILED': '失败',
    'CLOSED': '已关闭'
  }
  return statusMap[status] || '未知'
}

function getChannelStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'HEALTHY': '健康',
    'MAINTENANCE': '维护中',
    'ERROR': '异常',
    'DISABLED': '已禁用'
  }
  return statusMap[status] || '未知'
}

function getProgressColor(percentage: number): string {
  if (percentage < 60) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

function viewOrder(id: number) {
  router.push(`/payments/detail/${id}`)
}

async function loadTrendData() {
  // 加载趋势数据
  console.log('加载趋势数据，周期:', trendPeriod.value)
}

async function refreshChannelData() {
  // 刷新渠道数据
  console.log('刷新渠道数据')
}

// 生命周期
onMounted(async () => {
  // 初始化图表
  await nextTick()
  
  // 这里应该初始化ECharts
  // initTrendChart()
  // initChannelChart()
  
  console.log('Dashboard页面已加载')
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.stat-icon.today-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.today-order {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.success-rate {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.active-channel {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #67c23a;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #ebeef5;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-content {
  padding: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.detail-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-content {
  padding: 20px;
}

.channel-status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.channel-item:last-child {
  border-bottom: none;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-name {
  font-size: 14px;
  color: #303133;
}

.channel-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 12px;
  color: #909399;
}

.system-status-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.system-status-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.status-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.status-value.healthy {
  color: #67c23a;
}

.status-value.unhealthy {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>