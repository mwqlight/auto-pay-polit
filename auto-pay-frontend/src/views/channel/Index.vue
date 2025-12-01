/**
 * AutoPay Payment Platform - 支付渠道管理页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="payment-channel-container">
    <div class="page-header">
      <h2>支付渠道管理</h2>
      <p class="page-description">管理支付渠道配置、状态监控和性能分析</p>
    </div>

    <div class="channel-content">
      <!-- 状态概览 -->
      <el-card class="status-overview" shadow="never">
        <template #header>
          <div class="card-header">
            <span>渠道状态概览</span>
          </div>
        </template>
        
        <div class="status-grid">
          <div class="status-item" v-for="item in statusOverview" :key="item.key">
            <div class="status-icon" :class="item.iconClass">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-value">{{ item.value }}</div>
              <div class="status-label">{{ item.label }}</div>
              <div class="status-change" :class="item.changeType">
                {{ item.change }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 渠道列表 -->
      <el-card class="channel-list" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>渠道列表</span>
              <el-badge :value="channelStore.channelList.length" class="item">
                <el-icon><List /></el-icon>
              </el-badge>
            </div>
            <div class="header-actions">
              <el-button 
                type="primary" 
                @click="showCreateDialog = true"
                :icon="Plus"
              >
                添加渠道
              </el-button>
              <el-button 
                @click="batchTestChannels"
                :icon="Connection"
                :loading="testingChannels"
              >
                健康检查
              </el-button>
            </div>
          </div>
        </template>

        <!-- 搜索和筛选 -->
        <div class="search-filters">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索渠道名称或编码"
                :prefix-icon="Search"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-select v-model="searchForm.status" placeholder="状态筛选" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="启用" value="ENABLED" />
                <el-option label="禁用" value="DISABLED" />
                <el-option label="维护中" value="MAINTENANCE" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="searchForm.type" placeholder="渠道类型" clearable>
                <el-option label="全部类型" value="" />
                <el-option label="微信支付" value="WECHAT" />
                <el-option label="支付宝" value="ALIPAY" />
                <el-option label="银联支付" value="UNIONPAY" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-col>
            <el-col :span="10">
              <el-button @click="handleSearch" type="primary" :icon="Search">
                搜索
              </el-button>
              <el-button @click="handleReset" :icon="Refresh">
                重置
              </el-button>
              <el-button @click="exportChannels" :icon="Download">
                导出
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 渠道表格 -->
        <el-table
          v-loading="loading"
          :data="filteredChannels"
          @selection-change="handleSelectionChange"
          class="channel-table"
          size="small"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="渠道信息" min-width="200">
            <template #default="{ row }">
              <div class="channel-info">
                <div class="channel-logo">
                  <el-icon :class="`channel-icon channel-${row.channelCode.toLowerCase()}`">
                    <component :is="getChannelIcon(row.channelCode)" />
                  </el-icon>
                </div>
                <div class="channel-details">
                  <div class="channel-name">{{ row.name }}</div>
                  <div class="channel-code">{{ row.channelCode }}</div>
                  <div class="channel-desc">{{ row.description }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="性能指标" width="200">
            <template #default="{ row }">
              <div class="performance-metrics">
                <div class="metric-item">
                  <span class="metric-label">成功率</span>
                  <span class="metric-value" :class="getSuccessRateClass(row.successRate)">
                    {{ row.successRate }}%
                  </span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">响应时间</span>
                  <span class="metric-value">{{ row.avgResponseTime }}ms</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">费率</span>
                  <span class="metric-value">{{ row.feeRate }}%</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="最近健康检查" width="160">
            <template #default="{ row }">
              <div class="health-status">
                <div class="health-indicator" :class="getHealthClass(row.healthStatus)">
                  <el-icon><CircleCheck v-if="row.healthStatus === 'HEALTHY'" />
                    <CircleClose v-else-if="row.healthStatus === 'UNHEALTHY'" />
                    <Warning v-else />
                  </el-icon>
                </div>
                <div class="health-info">
                  <div class="health-time">{{ formatTime(row.lastHealthCheck) }}</div>
                  <div class="health-message">{{ row.healthMessage }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button 
                  size="small" 
                  @click="viewChannelDetail(row)"
                  :icon="View"
                >
                  详情
                </el-button>
                <el-button 
                  size="small" 
                  @click="editChannel(row)"
                  :icon="Edit"
                >
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  @click="testChannel(row)"
                  :icon="Connection"
                  :loading="testingChannels.has(row.id)"
                >
                  测试
                </el-button>
                <el-dropdown @command="(command) => handleMoreAction(command, row)">
                  <el-button size="small" :icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="toggle">
                        {{ row.status === 'ENABLED' ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="config">
                        配置管理
                      </el-dropdown-item>
                      <el-dropdown-item command="logs">
                        查看日志
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        删除
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
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 性能图表 -->
      <el-card class="performance-charts" shadow="never">
        <template #header>
          <div class="card-header">
            <span>性能趋势分析</span>
          </div>
        </template>
        
        <div class="charts-grid">
          <div class="chart-item">
            <h5>成功率趋势</h5>
            <div class="chart-placeholder success-trend">
              <el-icon><TrendCharts /></el-icon>
              <span>成功率趋势图表</span>
            </div>
          </div>
          <div class="chart-item">
            <h5>响应时间分布</h5>
            <div class="chart-placeholder response-time">
              <el-icon><Timer /></el-icon>
              <span>响应时间分布图</span>
            </div>
          </div>
          <div class="chart-item">
            <h5>交易量分布</h5>
            <div class="chart-placeholder volume-dist">
              <el-icon><PieChart /></el-icon>
              <span>交易量分布图</span>
            </div>
          </div>
          <div class="chart-item">
            <h5>错误率分析</h5>
            <div class="chart-placeholder error-rate">
              <el-icon><Warning /></el-icon>
              <span>错误率分析图表</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建渠道对话框 -->
    <ChannelCreateDialog
      v-model="showCreateDialog"
      @success="handleChannelCreated"
    />

    <!-- 渠道详情对话框 -->
    <ChannelDetailDialog
      v-model="showDetailDialog"
      :channel="selectedChannel"
      @edit="editChannel"
    />

    <!-- 编辑渠道对话框 -->
    <ChannelEditDialog
      v-model="showEditDialog"
      :channel="selectedChannel"
      @success="handleChannelUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Refresh, Download, List, Connection,
  View, Edit, More, CircleCheck, CircleClose, Warning,
  TrendCharts, Timer, PieChart
} from '@element-plus/icons-vue'
import { usePaymentStore } from '@/store/payment'
import ChannelCreateDialog from '@/components/channel/ChannelCreateDialog.vue'
import ChannelDetailDialog from '@/components/channel/ChannelDetailDialog.vue'
import ChannelEditDialog from '@/components/channel/ChannelEditDialog.vue'
import type { PaymentChannel } from '@/types'

const paymentStore = usePaymentStore()
const channelStore = paymentStore // alias

// 响应式数据
const loading = ref(false)
const testingChannels = ref<Set<number>>(new Set())
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const selectedChannel = ref<PaymentChannel | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  type: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 状态概览数据
const statusOverview = computed(() => [
  {
    key: 'total',
    label: '总渠道数',
    value: channelStore.channelList.length,
    icon: 'Collection',
    iconClass: 'total',
    change: '+2 较上月',
    changeType: 'increase'
  },
  {
    key: 'active',
    label: '运行中',
    value: channelStore.channelList.filter(c => c.status === 'ENABLED').length,
    icon: 'CircleCheck',
    iconClass: 'active',
    change: '98.5% 可用率',
    changeType: 'good'
  },
  {
    key: 'warning',
    label: '预警',
    value: channelStore.channelList.filter(c => c.healthStatus === 'WARNING').length,
    icon: 'Warning',
    iconClass: 'warning',
    change: '-1 较上周',
    changeType: 'decrease'
  },
  {
    key: 'error',
    label: '故障',
    value: channelStore.channelList.filter(c => c.healthStatus === 'UNHEALTHY').length,
    icon: 'CircleClose',
    iconClass: 'error',
    change: '0 新故障',
    changeType: 'stable'
  }
])

// 过滤后的渠道列表
const filteredChannels = computed(() => {
  let result = channelStore.channelList

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(channel => 
      channel.name.toLowerCase().includes(keyword) ||
      channel.channelCode.toLowerCase().includes(keyword)
    )
  }

  if (searchForm.status) {
    result = result.filter(channel => channel.status === searchForm.status)
  }

  if (searchForm.type) {
    result = result.filter(channel => channel.channelCode === searchForm.type)
  }

  return result
})

// 方法
async function handleSearch() {
  pagination.page = 1
  await loadChannels()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.type = ''
  pagination.page = 1
  loadChannels()
}

async function loadChannels() {
  try {
    loading.value = true
    await channelStore.fetchChannelList()
    pagination.total = channelStore.channelList.length
  } catch (error) {
    console.error('加载渠道列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(selection: PaymentChannel[]) {
  console.log('选中项:', selection)
}

function handleSizeChange(size: number) {
  pagination.size = size
  loadChannels()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  loadChannels()
}

function getChannelIcon(code: string) {
  // 这里可以根据渠道代码返回对应的图标组件
  return 'CreditCard'
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

function formatTime(time: string | Date) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

async function viewChannelDetail(channel: PaymentChannel) {
  selectedChannel.value = channel
  showDetailDialog.value = true
}

function editChannel(channel: PaymentChannel) {
  selectedChannel.value = channel
  showEditDialog.value = true
  showDetailDialog.value = false
}

async function testChannel(channel: PaymentChannel) {
  testingChannels.value.add(channel.id)
  try {
    const result = await channelStore.testChannelHealth(channel.id)
    ElMessage.success(`${channel.name} 健康检查完成`)
  } catch (error) {
    ElMessage.error(`${channel.name} 健康检查失败`)
  } finally {
    testingChannels.value.delete(channel.id)
  }
}

async function batchTestChannels() {
  testingChannels.value.clear()
  const channels = channelStore.channelList.filter(c => c.status === 'ENABLED')
  
  testingChannels.value = new Set(channels.map(c => c.id))
  
  try {
    await channelStore.batchTestChannelHealth()
    ElMessage.success('批量健康检查完成')
  } catch (error) {
    ElMessage.error('批量健康检查失败')
  } finally {
    testingChannels.value.clear()
  }
}

function handleMoreAction(command: string, channel: PaymentChannel) {
  switch (command) {
    case 'toggle':
      toggleChannelStatus(channel)
      break
    case 'config':
      showConfigDialog(channel)
      break
    case 'logs':
      showLogsDialog(channel)
      break
    case 'delete':
      deleteChannel(channel)
      break
  }
}

async function toggleChannelStatus(channel: PaymentChannel) {
  const action = channel.status === 'ENABLED' ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}渠道 "${channel.name}" 吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await channelStore.toggleChannelStatus(channel.id)
    ElMessage.success(`渠道已${action}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换渠道状态失败:', error)
    }
  }
}

function showConfigDialog(channel: PaymentChannel) {
  ElMessage.info('配置管理功能开发中')
}

function showLogsDialog(channel: PaymentChannel) {
  ElMessage.info('日志查看功能开发中')
}

async function deleteChannel(channel: PaymentChannel) {
  try {
    await ElMessageBox.confirm(
      `确定要删除渠道 "${channel.name}" 吗？此操作不可恢复！`,
      '确认删除',
      { type: 'error' }
    )
    
    await channelStore.deleteChannel(channel.id)
    ElMessage.success('渠道删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除渠道失败:', error)
    }
  }
}

function exportChannels() {
  ElMessage.info('导出功能开发中')
}

function handleChannelCreated() {
  loadChannels()
  showCreateDialog.value = false
}

function handleChannelUpdated() {
  loadChannels()
  showEditDialog.value = false
}

// 生命周期
onMounted(() => {
  loadChannels()
})
</script>

<style scoped>
.payment-channel-container {
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

.channel-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-overview .status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.status-icon.total {
  background: #409eff;
}

.status-icon.active {
  background: #67c23a;
}

.status-icon.warning {
  background: #e6a23c;
}

.status-icon.error {
  background: #f56c6c;
}

.status-content {
  flex: 1;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.status-label {
  font-size: 14px;
  color: #606266;
  margin: 4px 0;
}

.status-change {
  font-size: 12px;
  font-weight: 500;
}

.status-change.increase {
  color: #67c23a;
}

.status-change.decrease {
  color: #67c23a;
}

.status-change.good {
  color: #67c23a;
}

.status-change.stable {
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-filters {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.channel-table {
  margin-bottom: 16px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-icon {
  font-size: 20px;
  color: #409eff;
}

.channel-details {
  flex: 1;
}

.channel-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.channel-code {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.channel-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.metric-label {
  color: #909399;
}

.metric-value {
  font-weight: 600;
}

.metric-value.excellent {
  color: #67c23a;
}

.metric-value.good {
  color: #409eff;
}

.metric-value.warning {
  color: #e6a23c;
}

.metric-value.error {
  color: #f56c6c;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.health-indicator.healthy {
  color: #67c23a;
}

.health-indicator.warning {
  color: #e6a23c;
}

.health-indicator.unhealthy {
  color: #f56c6c;
}

.health-info {
  flex: 1;
}

.health-time {
  font-size: 12px;
  color: #303133;
  margin-bottom: 2px;
}

.health-message {
  font-size: 11px;
  color: #909399;
}

.table-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.chart-item h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.chart-placeholder {
  height: 200px;
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
  font-size: 32px;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filters .el-col {
    margin-bottom: 8px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .channel-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .performance-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .health-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>