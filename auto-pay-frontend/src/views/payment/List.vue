/**
 * AutoPay Payment Platform - 支付订单列表页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="payment-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-card>
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input 
              v-model="searchForm.merchantOrderNo" 
              placeholder="请输入订单号"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          
          <el-form-item label="订单状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态"
              clearable
              style="width: 150px;"
            >
              <el-option label="全部" value="" />
              <el-option label="待支付" value="PENDING" />
              <el-option label="支付成功" value="SUCCESS" />
              <el-option label="支付失败" value="FAILED" />
              <el-option label="已关闭" value="CLOSED" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="支付渠道">
            <el-select 
              v-model="searchForm.channelCode" 
              placeholder="请选择渠道"
              clearable
              style="width: 150px;"
            >
              <el-option label="全部" value="" />
              <el-option label="微信支付" value="WECHAT" />
              <el-option label="支付宝" value="ALIPAY" />
              <el-option label="银联支付" value="UNIONPAY" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 360px;"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="$router.push('/payments/create')">
          <el-icon><Plus /></el-icon>
          创建支付
        </el-button>
        <el-button @click="handleBatchExport" :disabled="selectedOrders.length === 0">
          <el-icon><Download /></el-icon>
          导出选中
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <span class="total-info">共 {{ pagination.total }} 条记录</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-card>
        <el-table 
          :data="orders" 
          stripe 
          v-loading="loading"
          @selection-change="handleSelectionChange"
          class="payment-table"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="merchantOrderNo" label="订单号" width="180" />
          
          <el-table-column prop="amount" label="支付金额" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ formatCurrency(row.amount) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="channelCode" label="支付渠道" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getChannelName(row.channelCode) }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="订单状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="scene" label="支付场景" width="100">
            <template #default="{ row }">
              {{ getSceneText(row.scene) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="updateTime" label="更新时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" size="small" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              
              <el-button 
                v-if="row.status === 'PENDING'"
                text type="warning" 
                size="small" 
                @click="handleCloseOrder(row)"
              >
                关闭订单
              </el-button>
              
              <el-button 
                v-if="row.status === 'SUCCESS'"
                text type="success" 
                size="small" 
                @click="handleQueryStatus(row)"
              >
                查询状态
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 订单详情对话框 -->
    <PaymentDetailDialog
      v-model="showDetailDialog"
      :order="currentOrder"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { usePaymentStore } from '@/store/payment'
import type { PaymentOrder } from '@/types'
import PaymentDetailDialog from '@/components/payment/PaymentDetailDialog.vue'

const paymentStore = usePaymentStore()

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const currentOrder = ref<PaymentOrder | null>(null)
const selectedOrders = ref<PaymentOrder[]>([])

// 搜索表单
const searchForm = reactive({
  merchantOrderNo: '',
  status: '',
  channelCode: '',
  dateRange: [] as string[]
})

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 计算属性
const orders = computed(() => paymentStore.orders)

// 方法
async function handleSearch() {
  pagination.current = 1
  await loadOrders()
}

function handleReset() {
  searchForm.merchantOrderNo = ''
  searchForm.status = ''
  searchForm.channelCode = ''
  searchForm.dateRange = []
  
  handleSearch()
}

function handleRefresh() {
  loadOrders()
}

async function loadOrders() {
  try {
    loading.value = true
    
    const params = {
      page: pagination.current,
      size: pagination.size,
      merchantOrderNo: searchForm.merchantOrderNo,
      status: searchForm.status,
      channelCode: searchForm.channelCode,
      dateRange: searchForm.dateRange
    }
    
    await paymentStore.fetchOrders(params)
    
    // 更新分页信息
    pagination.total = paymentStore.orders.length
  } catch (error) {
    console.error('加载订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(selection: PaymentOrder[]) {
  selectedOrders.value = selection
}

function handleSizeChange(size: number) {
  pagination.size = size
  loadOrders()
}

function handleCurrentChange(current: number) {
  pagination.current = current
  loadOrders()
}

function handleViewDetail(order: PaymentOrder) {
  currentOrder.value = order
  showDetailDialog.value = true
}

async function handleCloseOrder(order: PaymentOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要关闭订单 ${order.merchantOrderNo} 吗？`,
      '关闭确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const success = await paymentStore.closePaymentOrder(order.id)
    if (success) {
      await loadOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关闭订单失败:', error)
    }
  }
}

async function handleQueryStatus(order: PaymentOrder) {
  try {
    const result = await paymentStore.queryPaymentStatus(order.id)
    if (result) {
      ElMessage.success('状态查询成功')
      await loadOrders()
    }
  } catch (error) {
    console.error('查询状态失败:', error)
  }
}

function handleBatchExport() {
  // 批量导出逻辑
  console.log('批量导出:', selectedOrders.value)
  ElMessage.info('导出功能开发中...')
}

function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.payment-list-container {
  padding: 0;
}

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  color: #606266;
  font-size: 14px;
}

.table-container {
  margin-bottom: 16px;
}

.payment-table {
  width: 100%;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-wrap: wrap;
  }
  
  .search-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }
  
  .search-form :deep(.el-form-item__content) {
    width: 100%;
  }
  
  .search-form :deep(.el-date-editor) {
    width: 100% !important;
  }
}
</style>