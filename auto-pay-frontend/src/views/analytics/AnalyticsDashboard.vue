<template>
  <div class="analytics-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>数据分析驾驶舱</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          @change="handleDateRangeChange"
        />
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="success" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>

    <!-- KPI指标卡片 -->
    <div class="kpi-cards">
      <div class="kpi-card">
        <div class="kpi-icon">
          <el-icon size="24"><Money /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ formatAmount(overviewData.totalAmount) }}</div>
          <div class="kpi-label">交易总额</div>
          <div class="kpi-change" :class="getGrowthClass(overviewData.revenueGrowth)">
            {{ getGrowthText(overviewData.revenueGrowth) }}
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">
          <el-icon size="24"><TrendCharts /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ overviewData.totalTransactions?.toLocaleString() || 0 }}</div>
          <div class="kpi-label">交易笔数</div>
          <div class="kpi-change" :class="getGrowthClass(overviewData.transactionGrowth)">
            {{ getGrowthText(overviewData.transactionGrowth) }}
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">
          <el-icon size="24"><SuccessFilled /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ (overviewData.successRate || 0).toFixed(2) }}%</div>
          <div class="kpi-label">成功率</div>
          <div class="kpi-change" :class="getGrowthClass(overviewData.successRateGrowth)">
            {{ getGrowthText(overviewData.successRateGrowth) }}
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon">
          <el-icon size="24"><Wallet /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ formatAmount(overviewData.netRevenue) }}</div>
          <div class="kpi-label">净收入</div>
          <div class="kpi-change" :class="getGrowthClass(overviewData.netGrowth)">
            {{ getGrowthText(overviewData.netGrowth) }}
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
          <el-radio-group v-model="trendDimension" size="small" @change="loadTrendData">
            <el-radio-button label="daily">日</el-radio-button>
            <el-radio-button label="monthly">月</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-container">
          <div ref="trendChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 渠道分析图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>渠道分析</h3>
        </div>
        <div class="chart-container">
          <div ref="channelChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 风险监控图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>风险监控</h3>
        </div>
        <div class="chart-container">
          <div ref="riskChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 金额分布图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>金额分布</h3>
        </div>
        <div class="chart-container">
          <div ref="amountChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 详细表格 -->
    <div class="tables-section">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="渠道排行" name="channel">
          <el-table :data="channelRanking" stripe style="width: 100%">
            <el-table-column prop="channelCode" label="渠道编码" width="120" />
            <el-table-column prop="channelName" label="渠道名称" width="150" />
            <el-table-column prop="totalCount" label="交易笔数" width="120" sortable>
              <template #default="scope">
                {{ scope.row.totalCount?.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="successAmount" label="成功金额" width="150" sortable>
              <template #default="scope">
                {{ formatAmount(scope.row.successAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="successRate" label="成功率" width="100" sortable>
              <template #default="scope">
                {{ (scope.row.successRate || 0).toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column prop="totalFee" label="手续费" width="120">
              <template #default="scope">
                {{ formatAmount(scope.row.totalFee) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="风险监控" name="risk">
          <el-table :data="riskMonitoring" stripe style="width: 100%">
            <el-table-column prop="userName" label="用户名" width="120" />
            <el-table-column prop="operationType" label="操作类型" width="120" />
            <el-table-column prop="riskScore" label="风险分数" width="100" sortable />
            <el-table-column prop="riskLevel" label="风险等级" width="100">
              <template #default="scope">
                <el-tag :type="getRiskTagType(scope.row.riskLevel)">
                  {{ scope.row.riskLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="监控时间" width="180" />
            <el-table-column prop="riskReasons" label="风险原因" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 报表生成对话框 -->
    <el-dialog v-model="reportDialogVisible" title="生成报表" width="600px">
      <el-form :model="reportForm" label-width="80px">
        <el-form-item label="报表类型">
          <el-select v-model="reportForm.type" placeholder="选择报表类型">
            <el-option label="交易概览" value="transaction_overview" />
            <el-option label="渠道分析" value="channel_analysis" />
            <el-option label="风控报告" value="risk_report" />
            <el-option label="综合报表" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="reportForm.timeRange" placeholder="选择时间范围">
            <el-option label="今天" value="today" />
            <el-option label="最近7天" value="7days" />
            <el-option label="最近30天" value="30days" />
            <el-option label="最近90天" value="90days" />
          </el-select>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="reportForm.format">
            <el-radio value="pdf">PDF</el-radio>
            <el-radio value="excel">Excel</el-radio>
            <el-radio value="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="generateReport">生成报表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  ElMessage, 
  ElLoading,
  ElButton,
  ElDatePicker,
  ElRadioGroup,
  ElRadioButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTabs,
  ElTabPane,
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElIcon
} from 'element-plus'
import { 
  Refresh, 
  Download, 
  Money, 
  TrendCharts, 
  SuccessFilled, 
  Wallet 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 接口定义
interface TransactionData {
  totalTransactions: number
  successRate: number
  totalAmount: number
  successAmount: number
  netRevenue: number
  averageAmount: number
}

interface KPIData extends TransactionData {
  transactionGrowth?: number
  revenueGrowth?: number
  successRateGrowth?: number
  netGrowth?: number
}

interface ChannelData {
  channelCode: string
  channelName: string
  totalCount: number
  successAmount: number
  successRate: number
  totalFee: number
}

interface RiskData {
  userName: string
  operationType: string
  riskScore: number
  riskLevel: string
  createdAt: string
  riskReasons: string
}

// 响应式数据
const loading = ref(false)
const dateRange = ref<[string, string]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
  new Date().toISOString().slice(0, 19).replace('T', ' ')
])

const trendDimension = ref('daily')
const activeTab = ref('channel')

const overviewData = reactive<KPIData>({
  totalTransactions: 0,
  successRate: 0,
  totalAmount: 0,
  successAmount: 0,
  netRevenue: 0,
  averageAmount: 0,
  transactionGrowth: 0,
  revenueGrowth: 0,
  successRateGrowth: 0,
  netGrowth: 0
})

const channelRanking = ref<ChannelData[]>([])
const riskMonitoring = ref<RiskData[]>([])

const reportDialogVisible = ref(false)
const reportForm = reactive({
  type: '',
  timeRange: '7days',
  format: 'pdf'
})

// 图表引用
const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()
const riskChartRef = ref<HTMLElement>()
const amountChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null
let riskChart: echarts.ECharts | null = null
let amountChart: echarts.ECharts | null = null

// 方法定义
const loadOverviewData = async () => {
  try {
    loading.value = true
    // TODO: 调用API获取概览数据
    // const response = await analyticsApi.getTransactionOverview(dateRange.value)
    // Object.assign(overviewData, response.data)
    
    // 模拟数据
    Object.assign(overviewData, {
      totalTransactions: 125480,
      successRate: 98.65,
      totalAmount: 2567890000, // 金额(分)
      successAmount: 2534320000,
      netRevenue: 2456789000,
      averageAmount: 20450,
      transactionGrowth: 12.5,
      revenueGrowth: 8.7,
      successRateGrowth: 0.3,
      netGrowth: 9.2
    })
  } catch (error) {
    ElMessage.error('获取概览数据失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  try {
    // TODO: 调用API获取趋势数据
    // const response = await analyticsApi.getTransactionTrend(trendDimension.value, getTimeRange())
    
    // 模拟数据
    const mockTrendData = generateMockTrendData()
    renderTrendChart(mockTrendData)
  } catch (error) {
    ElMessage.error('获取趋势数据失败')
  }
}

const loadChannelData = async () => {
  try {
    // TODO: 调用API获取渠道数据
    // const response = await analyticsApi.getChannelAnalysis(getTimeRange())
    
    // 模拟数据
    const mockChannelData = generateMockChannelData()
    channelRanking.value = mockChannelData
    renderChannelChart(mockChannelData)
  } catch (error) {
    ElMessage.error('获取渠道数据失败')
  }
}

const loadRiskData = async () => {
  try {
    // TODO: 调用API获取风险数据
    // const response = await analyticsApi.getRiskAnalysis(getTimeRange())
    
    // 模拟数据
    const mockRiskData = generateMockRiskData()
    riskMonitoring.value = mockRiskData
    renderRiskChart(mockRiskData)
    renderAmountChart()
  } catch (error) {
    ElMessage.error('获取风险数据失败')
  }
}

const refreshData = async () => {
  await Promise.all([
    loadOverviewData(),
    loadTrendData(),
    loadChannelData(),
    loadRiskData()
  ])
  ElMessage.success('数据刷新成功')
}

const handleDateRangeChange = () => {
  refreshData()
}

const exportReport = () => {
  reportDialogVisible.value = true
}

const generateReport = async () => {
  try {
    if (!reportForm.type) {
      ElMessage.warning('请选择报表类型')
      return
    }
    
    // TODO: 调用API生成报表
    ElMessage.success('报表生成成功，正在下载...')
    reportDialogVisible.value = false
  } catch (error) {
    ElMessage.error('报表生成失败')
  }
}

// 工具方法
const formatAmount = (amount: number | undefined) => {
  if (!amount) return '¥0.00'
  return `¥${(amount / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
}

const getGrowthClass = (growth: number | undefined) => {
  if (!growth) return 'neutral'
  return growth >= 0 ? 'positive' : 'negative'
}

const getGrowthText = (growth: number | undefined) => {
  if (!growth) return '0.00%'
  const prefix = growth >= 0 ? '+' : ''
  return `${prefix}${growth.toFixed(2)}%`
}

const getRiskTagType = (riskLevel: string) => {
  switch (riskLevel) {
    case 'HIGH': return 'danger'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'success'
    default: return 'info'
  }
}

const getTimeRange = () => {
  // 从dateRange计算时间范围
  return 'custom'
}

// 图表渲染方法
const renderTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return
  
  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '交易趋势分析'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['交易金额', '交易笔数']
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time)
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '笔数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '交易金额',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => (item.amount / 100).toFixed(2)),
        smooth: true
      },
      {
        name: '交易笔数',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.count),
        smooth: true
      }
    ]
  }
  
  trendChart.setOption(option)
}

const renderChannelChart = (data: ChannelData[]) => {
  if (!channelChartRef.value) return
  
  if (channelChart) {
    channelChart.dispose()
  }
  
  channelChart = echarts.init(channelChartRef.value)
  
  const option = {
    title: {
      text: '渠道交易分布'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.channelName)
    },
    series: [
      {
        name: '交易金额',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          value: item.successAmount,
          name: item.channelName
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  channelChart.setOption(option)
}

const renderRiskChart = (data: RiskData[]) => {
  if (!riskChartRef.value) return
  
  if (riskChart) {
    riskChart.dispose()
  }
  
  riskChart = echarts.init(riskChartRef.value)
  
  // 统计风险等级分布
  const riskDistribution = data.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const option = {
    title: {
      text: '风险等级分布'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(riskDistribution).map(([level, count]) => ({
          value: count,
          name: level
        }))
      }
    ]
  }
  
  riskChart.setOption(option)
}

const renderAmountChart = () => {
  if (!amountChartRef.value) return
  
  if (amountChart) {
    amountChart.dispose()
  }
  
  amountChart = echarts.init(amountChartRef.value)
  
  // 模拟金额分布数据
  const amountDistribution = [
    { range: '0-10元', count: 45230, amount: 281450 },
    { range: '10-50元', count: 38240, amount: 1256780 },
    { range: '50-100元', count: 28450, amount: 2145630 },
    { range: '100-500元', count: 12350, amount: 3456780 },
    { range: '500-1000元', count: 980, amount: 725400 },
    { range: '1000元以上', count: 230, amount: 456780 }
  ]
  
  const option = {
    title: {
      text: '交易金额分布'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['交易笔数', '交易金额']
    },
    xAxis: {
      type: 'category',
      data: amountDistribution.map(item => item.range)
    },
    yAxis: [
      {
        type: 'value',
        name: '笔数',
        position: 'left'
      },
      {
        type: 'value',
        name: '金额(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '交易笔数',
        type: 'bar',
        data: amountDistribution.map(item => item.count)
      },
      {
        name: '交易金额',
        type: 'line',
        yAxisIndex: 1,
        data: amountDistribution.map(item => item.amount)
      }
    ]
  }
  
  amountChart.setOption(option)
}

// 模拟数据生成方法
const generateMockTrendData = () => {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      time: date.toISOString().slice(0, 10),
      amount: Math.floor(Math.random() * 100000000) + 50000000,
      count: Math.floor(Math.random() * 5000) + 2000
    })
  }
  return data
}

const generateMockChannelData = (): ChannelData[] => {
  return [
    { channelCode: 'WX', channelName: '微信支付', totalCount: 45230, successAmount: 1123456789, successRate: 99.2, totalFee: 5617284 },
    { channelCode: 'ALIPAY', channelName: '支付宝', totalCount: 38450, successAmount: 987654321, successRate: 98.9, totalFee: 4938271 },
    { channelCode: 'UNIONPAY', channelName: '银联支付', totalCount: 25680, successAmount: 654321098, successRate: 98.5, totalFee: 3271605 },
    { channelCode: 'BANK', channelName: '网银支付', totalCount: 12450, successAmount: 234567890, successRate: 97.8, totalFee: 1172840 },
    { channelCode: 'OTHER', channelName: '其他渠道', totalCount: 3670, successAmount: 56789012, successRate: 96.5, totalFee: 283945 }
  ]
}

const generateMockRiskData = (): RiskData[] => {
  return [
    { userName: 'user001', operationType: '提现', riskScore: 85, riskLevel: 'HIGH', createdAt: '2024-01-15 10:30:00', riskReasons: '异常交易频率，短时间内多次大额提现' },
    { userName: 'user002', operationType: '转账', riskScore: 72, riskLevel: 'MEDIUM', createdAt: '2024-01-15 11:15:00', riskReasons: '异地登录，设备指纹异常' },
    { userName: 'user003', operationType: '支付', riskScore: 68, riskLevel: 'MEDIUM', createdAt: '2024-01-15 12:00:00', riskReasons: '交易金额超过历史平均值' },
    { userName: 'user004', operationType: '注册', riskScore: 45, riskLevel: 'LOW', createdAt: '2024-01-15 13:45:00', riskReasons: '可疑设备特征' },
    { userName: 'user005', operationType: '提现', riskScore: 78, riskLevel: 'HIGH', createdAt: '2024-01-15 14:20:00', riskReasons: 'IP地理位置异常' }
  ]
}

// 响应式处理
const handleResize = () => {
  if (trendChart) trendChart.resize()
  if (channelChart) channelChart.resize()
  if (riskChart) riskChart.resize()
  if (amountChart) amountChart.resize()
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    refreshData()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) trendChart.dispose()
  if (channelChart) channelChart.dispose()
  if (riskChart) riskChart.dispose()
  if (amountChart) amountChart.dispose()
})
</script>

<style scoped>
.analytics-dashboard {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.kpi-change {
  font-size: 12px;
  font-weight: 600;
}

.kpi-change.positive {
  color: #67c23a;
}

.kpi-change.negative {
  color: #f56c6c;
}

.kpi-change.neutral {
  color: #909399;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.chart-container {
  height: 350px;
  padding: 20px;
}

.chart {
  width: 100%;
  height: 100%;
}

.tables-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .kpi-cards {
    grid-template-columns: 1fr;
  }
}
</style>