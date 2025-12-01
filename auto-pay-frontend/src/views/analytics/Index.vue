<template>
  <div class="analytics-index">
    <PageHeader 
      title="数据分析中心" 
      subtitle="全面的支付数据分析与报表生成平台"
      icon="analytics"
    />
    
    <div class="analytics-content">
      <!-- 快捷入口卡片 -->
      <el-row :gutter="20" class="quick-entry">
        <el-col :span="6">
          <el-card class="quick-card" shadow="hover" @click="$router.push('/analytics/dashboard')">
            <div class="card-content">
              <el-icon class="card-icon" size="24"><TrendCharts /></el-icon>
              <h3>数据驾驶舱</h3>
              <p>实时监控业务指标和趋势分析</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="quick-card" shadow="hover" @click="goToReports">
            <div class="card-content">
              <el-icon class="card-icon" size="24"><Document /></el-icon>
              <h3>报表中心</h3>
              <p>生成和管理各类数据报表</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="quick-card" shadow="hover" @click="goToAlerts">
            <div class="card-content">
              <el-icon class="card-icon" size="24"><Bell /></el-icon>
              <h3>监控告警</h3>
              <p>设置和管理数据监控告警</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="quick-card" shadow="hover" @click="goToExport">
            <div class="card-content">
              <el-icon class="card-icon" size="24"><Download /></el-icon>
              <h3>数据导出</h3>
              <p>导出原始数据和分析结果</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 快速概览 -->
      <el-row :gutter="20" class="quick-overview">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>今日交易概况</span>
                <el-button size="small" @click="refreshData">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </template>
            
            <div class="overview-stats" v-loading="loading">
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(todayStats.totalTransactions) }}</div>
                <div class="stat-label">今日交易数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatAmount(todayStats.totalAmount) }}</div>
                <div class="stat-label">今日金额</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatPercentage(todayStats.successRate) }}</div>
                <div class="stat-label">成功率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ todayStats.activeChannels }}</div>
                <div class="stat-label">活跃渠道</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>系统状态</span>
            </template>
            
            <div class="system-status">
              <div class="status-item">
                <span class="status-label">数据处理状态</span>
                <el-tag :type="getStatusType(systemStatus.dataProcessing)">
                  {{ getStatusText(systemStatus.dataProcessing) }}
                </el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">实时分析</span>
                <el-tag :type="getStatusType(systemStatus.realTimeAnalysis)">
                  {{ getStatusText(systemStatus.realTimeAnalysis) }}
                </el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">报表生成</span>
                <el-tag :type="getStatusType(systemStatus.reportGeneration)">
                  {{ getStatusText(systemStatus.reportGeneration) }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 最近活动 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近报表</span>
                <el-button size="small" text @click="$router.push('/analytics/reports')">
                  查看全部
                </el-button>
              </div>
            </template>
            
            <div class="recent-reports">
              <div 
                v-for="report in recentReports" 
                :key="report.id" 
                class="report-item"
              >
                <div class="report-info">
                  <div class="report-name">{{ report.name }}</div>
                  <div class="report-meta">
                    {{ report.type }} · {{ formatDateTime(report.createdAt) }}
                  </div>
                </div>
                <div class="report-actions">
                  <el-button size="small" text @click="downloadReport(report.id)">
                    <el-icon><Download /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>告警通知</span>
                <el-button size="small" text @click="$router.push('/analytics/alerts')">
                  查看全部
                </el-button>
              </div>
            </template>
            
            <div class="recent-alerts">
              <div 
                v-for="alert in recentAlerts" 
                :key="alert.id" 
                class="alert-item"
                :class="`alert-${alert.severity.toLowerCase()}`"
              >
                <div class="alert-info">
                  <div class="alert-message">{{ alert.message }}</div>
                  <div class="alert-meta">
                    {{ alert.source }} · {{ formatRelativeTime(alert.timestamp) }}
                  </div>
                </div>
                <div class="alert-status">
                  <el-tag :type="getAlertTagType(alert.status)" size="small">
                    {{ getAlertStatusText(alert.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  TrendCharts, 
  Document, 
  Bell, 
  Download, 
  Refresh 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAnalyticsStore } from '@/store/analytics'
import { formatNumber, formatAmount, formatPercentage } from '@/utils/analytics'

// 状态
const loading = ref(false)
const todayStats = ref({
  totalTransactions: 0,
  totalAmount: 0,
  successRate: 0,
  activeChannels: 0
})

const systemStatus = ref({
  dataProcessing: 'healthy',
  realTimeAnalysis: 'healthy',
  reportGeneration: 'healthy'
})

const recentReports = ref([
  {
    id: '1',
    name: '日交易报表_20241201',
    type: '日报',
    createdAt: '2024-12-01 09:00:00'
  },
  {
    id: '2',
    name: '渠道分析报表_202411',
    type: '月报',
    createdAt: '2024-11-30 18:00:00'
  },
  {
    id: '3',
    name: '风险监控报表_2024W48',
    type: '周报',
    createdAt: '2024-11-29 10:30:00'
  }
])

const recentAlerts = ref([
  {
    id: '1',
    message: '支付宝渠道成功率低于阈值',
    severity: 'warning',
    source: '风控系统',
    timestamp: '2024-12-01 14:30:00',
    status: 'active'
  },
  {
    id: '2',
    message: '微信支付响应时间异常',
    severity: 'info',
    source: '性能监控',
    timestamp: '2024-12-01 13:45:00',
    status: 'resolved'
  }
])

const analyticsStore = useAnalyticsStore()

// 格式化日期时间
const formatDateTime = (datetime: string): string => {
  return new Date(datetime).toLocaleString('zh-CN')
}

// 格式化相对时间
const formatRelativeTime = (datetime: string): string => {
  const now = new Date()
  const time = new Date(datetime)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 获取状态类型
const getStatusType = (status: string): string => {
  const types = {
    healthy: 'success',
    warning: 'warning',
    error: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const texts = {
    healthy: '正常',
    warning: '警告',
    error: '异常'
  }
  return texts[status as keyof typeof texts] || '未知'
}

// 获取告警标签类型
const getAlertTagType = (status: string): string => {
  const types = {
    active: 'danger',
    acknowledged: 'warning',
    resolved: 'success'
  }
  return types[status as keyof typeof types] || 'info'
}

// 获取告警状态文本
const getAlertStatusText = (status: string): string => {
  const texts = {
    active: '活跃',
    acknowledged: '已确认',
    resolved: '已解决'
  }
  return texts[status as keyof typeof texts] || '未知'
}

// 导航函数
const goToReports = () => {
  ElMessage.info('报表中心功能开发中...')
}

const goToAlerts = () => {
  ElMessage.info('监控告警功能开发中...')
}

const goToExport = () => {
  ElMessage.info('数据导出功能开发中...')
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await analyticsStore.fetchOverview()
    await analyticsStore.fetchRealTimeMetrics()
    
    // 更新今日数据
    if (analyticsStore.overview) {
      todayStats.value = {
        totalTransactions: analyticsStore.overview.totalTransactions,
        totalAmount: analyticsStore.overview.totalAmount,
        successRate: analyticsStore.overview.successRate,
        activeChannels: analyticsStore.channelAnalysis.length
      }
    }
    
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 下载报表
const downloadReport = (id: string) => {
  ElMessage.info(`下载报表 ${id}...`)
}

// 初始化
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.analytics-index {
  padding: 0;
}

.analytics-content {
  margin-top: 20px;
}

.quick-entry {
  margin-bottom: 30px;
}

.quick-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 140px;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.card-icon {
  color: #409eff;
  margin-bottom: 12px;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content p {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.quick-overview {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.system-status {
  padding: 10px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.recent-reports,
.recent-alerts {
  max-height: 300px;
  overflow-y: auto;
}

.report-item,
.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child,
.alert-item:last-child {
  border-bottom: none;
}

.report-info,
.alert-info {
  flex: 1;
}

.report-name,
.alert-message {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.report-meta,
.alert-meta {
  font-size: 12px;
  color: #909399;
}

.alert-item.warning {
  background: rgba(250, 173, 20, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  margin: 4px 0;
}

.alert-item.info {
  background: rgba(24, 144, 255, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  margin: 4px 0;
}

.report-actions {
  margin-left: 12px;
}

.alert-status {
  margin-left: 12px;
}
</style>