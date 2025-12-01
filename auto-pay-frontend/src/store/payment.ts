/**
 * AutoPay Payment Platform - 支付状态管理
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaymentOrder, PaymentChannel, CreatePaymentRequest } from '@/types'
import { paymentApi } from '@/api'
import { ElMessage } from 'element-plus'

export const usePaymentStore = defineStore('payment', () => {
  // 状态
  const orders = ref<PaymentOrder[]>([])
  const currentOrder = ref<PaymentOrder | null>(null)
  const channels = ref<PaymentChannel[]>([])
  const loading = ref(false)
  const searchParams = ref({
    page: 1,
    size: 20,
    merchantOrderNo: '',
    status: '',
    channelCode: '',
    dateRange: [] as string[]
  })

  // 计算属性
  const totalOrders = computed(() => orders.value.length)
  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'PENDING').length)
  const successOrders = computed(() => orders.value.filter(o => o.status === 'SUCCESS').length)
  const failedOrders = computed(() => orders.value.filter(o => o.status === 'FAILED').length)
  const activeChannels = computed(() => channels.value.filter(c => c.enabled))

  // 动作
  /**
   * 获取支付订单列表
   */
  async function fetchOrders(params?: typeof searchParams.value) {
    try {
      loading.value = true
      
      const queryParams = params || searchParams.value
      const response = await paymentApi.getPaymentList(queryParams)
      
      if (response.code === 200) {
        orders.value = response.data.items || []
        
        // 更新搜索参数
        if (!params) {
          searchParams.value = { ...queryParams, ...response.data.pagination }
        }
      } else {
        ElMessage.error(response.message || '获取订单列表失败')
      }
    } catch (error: any) {
      console.error('获取订单列表失败:', error)
      ElMessage.error(error.response?.data?.message || '获取订单列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取支付订单详情
   */
  async function fetchOrderDetail(id: number) {
    try {
      loading.value = true
      const response = await paymentApi.getPaymentDetail(id)
      
      if (response.code === 200) {
        currentOrder.value = response.data
        return response.data
      } else {
        ElMessage.error(response.message || '获取订单详情失败')
        return null
      }
    } catch (error: any) {
      console.error('获取订单详情失败:', error)
      ElMessage.error(error.response?.data?.message || '获取订单详情失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建支付订单
   */
  async function createPaymentOrder(request: CreatePaymentRequest) {
    try {
      loading.value = true
      const response = await paymentApi.createPayment(request)
      
      if (response.code === 200) {
        ElMessage.success('支付订单创建成功')
        
        // 刷新订单列表
        await fetchOrders()
        
        return response.data
      } else {
        ElMessage.error(response.message || '创建支付订单失败')
        return null
      }
    } catch (error: any) {
      console.error('创建支付订单失败:', error)
      ElMessage.error(error.response?.data?.message || '创建支付订单失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 关闭支付订单
   */
  async function closePaymentOrder(id: number) {
    try {
      const response = await paymentApi.closePayment(id)
      
      if (response.code === 200) {
        ElMessage.success('订单关闭成功')
        
        // 更新当前订单状态
        if (currentOrder.value?.id === id) {
          currentOrder.value.status = 'CLOSED'
        }
        
        // 刷新订单列表
        await fetchOrders()
        
        return true
      } else {
        ElMessage.error(response.message || '关闭订单失败')
        return false
      }
    } catch (error: any) {
      console.error('关闭订单失败:', error)
      ElMessage.error(error.response?.data?.message || '关闭订单失败')
      return false
    }
  }

  /**
   * 查询支付状态
   */
  async function queryPaymentStatus(id: number) {
    try {
      const response = await paymentApi.queryPaymentStatus(id)
      
      if (response.code === 200) {
        // 更新订单状态
        const order = orders.value.find(o => o.id === id)
        if (order) {
          order.status = response.data.status
          order.updateTime = response.data.updateTime
        }
        
        if (currentOrder.value?.id === id) {
          currentOrder.value.status = response.data.status
          currentOrder.value.updateTime = response.data.updateTime
        }
        
        return response.data
      } else {
        ElMessage.error(response.message || '查询支付状态失败')
        return null
      }
    } catch (error: any) {
      console.error('查询支付状态失败:', error)
      ElMessage.error(error.response?.data?.message || '查询支付状态失败')
      return null
    }
  }

  /**
   * 获取支付渠道列表
   */
  async function fetchChannels() {
    try {
      const response = await paymentApi.getChannelList()
      
      if (response.code === 200) {
        channels.value = response.data || []
      } else {
        ElMessage.error(response.message || '获取渠道列表失败')
      }
    } catch (error: any) {
      console.error('获取渠道列表失败:', error)
      ElMessage.error(error.response?.data?.message || '获取渠道列表失败')
    }
  }

  /**
   * 智能选择支付渠道
   */
  function selectOptimalChannel(request: CreatePaymentRequest): PaymentChannel | null {
    // 根据规则选择最优渠道
    const availableChannels = channels.value.filter(channel => 
      channel.enabled && 
      channel.supportedScenes.includes(request.scene) &&
      (!channel.dailyLimit || channel.dailyUsed < channel.dailyLimit) &&
      channel.healthy === 'HEALTHY'
    )

    if (availableChannels.length === 0) {
      return null
    }

    // 按优先级和成本排序
    return availableChannels.sort((a, b) => {
      // 首先按优先级排序
      if (a.priority !== b.priority) {
        return b.priority - a.priority // 优先级高的在前
      }
      
      // 如果优先级相同，选择成本低的
      return a.feeRate - b.feeRate
    })[0]
  }

  /**
   * 重置搜索参数
   */
  function resetSearchParams() {
    searchParams.value = {
      page: 1,
      size: 20,
      merchantOrderNo: '',
      status: '',
      channelCode: '',
      dateRange: []
    }
  }

  /**
   * 清除当前订单
   */
  function clearCurrentOrder() {
    currentOrder.value = null
  }

  return {
    // 状态
    orders,
    currentOrder,
    channels,
    loading,
    searchParams,
    
    // 计算属性
    totalOrders,
    pendingOrders,
    successOrders,
    failedOrders,
    activeChannels,
    
    // 动作
    fetchOrders,
    fetchOrderDetail,
    createPaymentOrder,
    closePaymentOrder,
    queryPaymentStatus,
    fetchChannels,
    selectOptimalChannel,
    resetSearchParams,
    clearCurrentOrder
  }
})