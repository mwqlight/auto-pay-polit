<template>
  <ErrorBoundary>
    <div 
      ref="chartRef" 
      :class="['chart-wrapper', { loading: loading }]"
      :style="{ height: height }"
    >
      <div v-if="loading" class="chart-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="error" class="chart-error">
        <el-result
          icon="error"
          title="图表加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button size="small" @click="retry">
              重试
            </el-button>
          </template>
        </el-result>
      </div>
      <div v-else-if="!hasData" class="chart-empty">
        <el-result
          icon="info"
          title="暂无数据"
          :sub-title="emptyText"
        />
      </div>
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import ErrorBoundary from './ErrorBoundary.vue'
import * as echarts from 'echarts'

interface Props {
  option: any
  height?: string
  loading?: boolean
  error?: string | null
  emptyText?: string
  data?: any[]
  config?: {
    theme?: string
    renderer?: 'canvas' | 'svg'
    notMerge?: boolean
    lazyUpdate?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  loading: false,
  error: null,
  emptyText: '暂无数据可显示',
  data: () => [],
  config: () => ({
    theme: 'default',
    renderer: 'canvas',
    notMerge: false,
    lazyUpdate: false
  })
})

const emit = defineEmits<{
  (e: 'chart-ready', chart: echarts.ECharts): void
  (e: 'chart-error', error: any): void
  (e: 'click', params: any): void
  (e: 'resize', chart: echarts.ECharts): void
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 检查是否有数据
const hasData = computed(() => {
  if (!props.data || props.data.length === 0) return false
  
  // 检查option中是否有有效数据
  if (props.option?.series) {
    const seriesData = props.option.series.some((s: any) => 
      s.data && s.data.length > 0
    )
    if (seriesData) return true
  }
  
  return props.data.length > 0
})

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) return
  
  try {
    // 如果已存在图表，先销毁
    if (chart) {
      chart.dispose()
    }
    
    // 创建新图表
    chart = echarts.init(chartRef.value, props.config.theme, {
      renderer: props.config.renderer
    })
    
    // 设置配置
    if (props.option) {
      chart.setOption(props.option, props.config.notMerge)
    }
    
    // 绑定事件
    chart.on('click', (params) => {
      emit('click', params)
    })
    
    chart.on('resize', () => {
      if (chart) {
        emit('resize', chart)
      }
    })
    
    emit('chart-ready', chart)
    
  } catch (error) {
    console.error('Failed to initialize chart:', error)
    emit('chart-error', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart || !props.option) return
  
  try {
    chart.setOption(props.option, props.config.notMerge, props.config.lazyUpdate)
  } catch (error) {
    console.error('Failed to update chart:', error)
    emit('chart-error', error)
  }
}

// 重试
const retry = () => {
  if (!chart) {
    initChart()
  } else {
    updateChart()
  }
}

// 监听option变化
watch(() => props.option, (newOption) => {
  if (newOption && chart) {
    nextTick(() => {
      updateChart()
    })
  }
}, { deep: true })

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && chart) {
    nextTick(() => {
      updateChart()
    })
  }
}, { deep: true })

// 监听loading变化
watch(() => props.loading, (newLoading) => {
  if (chart && !newLoading) {
    nextTick(() => {
      chart?.resize()
    })
  }
})

// 监听error变化
watch(() => props.error, (newError) => {
  if (newError) {
    ElMessage.error(`图表错误: ${newError}`)
  }
})

onMounted(() => {
  nextTick(() => {
    if (props.data && props.data.length > 0) {
      initChart()
    }
  })
  
  // 监听窗口大小变化
  const handleResize = () => {
    if (chart) {
      chart.resize()
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 保存事件监听器引用，用于清理
  ;(window as any).chartResizeHandler = handleResize
})

onUnmounted(() => {
  // 清理事件监听器
  if ((window as any).chartResizeHandler) {
    window.removeEventListener('resize', (window as any).chartResizeHandler)
    delete (window as any).chartResizeHandler
  }
  
  // 销毁图表
  if (chart) {
    chart.dispose()
    chart = null
  }
})

// 暴露图表实例给父组件
defineExpose({
  getChart: () => chart,
  resize: () => chart?.resize(),
  exportImage: () => chart?.getDataURL(),
  retry
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  position: relative;
  min-height: 200px;
}

.chart-loading,
.chart-error,
.chart-empty {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  z-index: 10;
}

.chart-loading {
  background: rgba(255, 255, 255, 0.9);
}

.chart-loading .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409eff;
}

.chart-error .el-result,
.chart-empty .el-result {
  padding: 20px;
}

.el-result {
  --el-result-icon-font-size: 48px;
}

.el-result__title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.el-result__subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.chart-wrapper.loading {
  cursor: wait;
}

.chart-wrapper.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  z-index: 5;
}
</style>