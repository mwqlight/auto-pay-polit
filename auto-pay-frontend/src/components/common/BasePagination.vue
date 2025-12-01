/**
 * AutoPay Payment Platform - 通用分页组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="base-pagination">
    <!-- 分页信息 -->
    <div v-if="showInfo" class="pagination-info">
      <span class="pagination-text">
        <template v-if="layout.includes('total')">
          显示第 <strong>{{ startItem }}</strong> 到 <strong>{{ endItem }}</strong> 条，
          共 <strong>{{ total }}</strong> 条
        </template>
        
        <template v-if="layout.includes('sizes')">
          ，每页显示
          <el-select
            v-model="localPageSize"
            :disabled="disabled"
            size="small"
            style="width: 90px;"
            @change="handlePageSizeChange"
          >
            <el-option
              v-for="size in pageSizes"
              :key="size"
              :label="size"
              :value="size"
            />
          </el-select>
          条
        </template>
      </span>
    </div>

    <!-- 分页控件 -->
    <el-pagination
      v-model:current-page="localCurrentPage"
      v-model:page-size="localPageSize"
      :page-sizes="pageSizes"
      :disabled="disabled"
      :background="background"
      :layout="computedLayout"
      :total="total"
      :hide-on-single-page="hideOnSinglePage"
      :pager-count="pagerCount"
      :small="small"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
      @prev-click="handlePrevClick"
      @next-click="handleNextClick"
    />

    <!-- 快速跳转 -->
    <div v-if="showQuickJumper" class="quick-jumper">
      <span>跳转到</span>
      <el-input
        v-model="quickJumpPage"
        :disabled="disabled"
        size="small"
        style="width: 60px; margin: 0 8px;"
        @keyup.enter="handleQuickJump"
        @blur="handleQuickJump"
      />
      <span>页</span>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="pagination-actions">
      <slot name="actions" :current-page="localCurrentPage" :page-size="localPageSize" />
    </div>

    <!-- 批量操作 -->
    <div v-if="showBatchActions && selectedItems.length > 0" class="batch-actions">
      <el-divider direction="vertical" />
      
      <el-text type="info" class="batch-info">
        已选择 {{ selectedItems.length }} 项
      </el-text>
      
      <slot name="batch-actions" :selected="selectedItems" :clear-selection="clearSelection" />
      
      <el-button
        v-if="showClearSelection"
        size="small"
        @click="clearSelection"
      >
        清空选择
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, readonly } from 'vue'

// 定义接口
export interface PaginationEmits {
  // 分页变化
  'update:current-page': [page: number]
  'update:page-size': [size: number]
  'current-change': [page: number]
  'size-change': [size: number]
  'prev-click': [page: number]
  'next-click': [page: number]
  
  // 选择相关
  'selection-change': [selected: any[]]
  'update:selected-items': [selected: any[]]
}

const props = withDefaults(defineProps<{
  // 分页基础属性
  currentPage?: number
  pageSize?: number
  total: number
  pageSizes?: number[]
  
  // 功能开关
  showInfo?: boolean
  showQuickJumper?: boolean
  showActions?: boolean
  showBatchActions?: boolean
  showClearSelection?: boolean
  
  // ElPagination原生属性
  background?: boolean
  disabled?: boolean
  hideOnSinglePage?: boolean
  layout?: string
  pagerCount?: number
  small?: boolean
  
  // 选择相关
  selectedItems?: any[]
  selectionKey?: string
  
  // 自定义样式
  align?: 'left' | 'center' | 'right'
}>(), {
  currentPage: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100, 200],
  showInfo: true,
  showQuickJumper: true,
  showActions: true,
  showBatchActions: false,
  showClearSelection: true,
  background: true,
  disabled: false,
  hideOnSinglePage: false,
  layout: 'total, sizes, prev, pager, next, jumper',
  pagerCount: 7,
  small: false,
  selectedItems: () => [],
  selectionKey: 'id',
  align: 'right'
})

const emit = defineEmits<PaginationEmits>()

// 响应式数据
const quickJumpPage = ref('')
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

// 计算属性
const startItem = computed(() => {
  if (props.total === 0) return 0
  return (localCurrentPage.value - 1) * localPageSize.value + 1
})

const endItem = computed(() => {
  const end = localCurrentPage.value * localPageSize.value
  return Math.min(end, props.total)
})

const computedLayout = computed(() => {
  let layout = props.layout
  if (!props.showInfo && layout.includes('total')) {
    layout = layout.replace('total,', '').replace('total', '')
  }
  if (!props.showQuickJumper && layout.includes('jumper')) {
    layout = layout.replace(',jumper', '').replace('jumper', '')
  }
  return layout
})

// 方法
function handleCurrentChange(page: number) {
  localCurrentPage.value = page
  emit('update:current-page', page)
  emit('current-change', page)
}

function handleSizeChange(size: number) {
  localPageSize.value = size
  localCurrentPage.value = 1 // 重置到第一页
  emit('update:page-size', size)
  emit('update:current-page', 1)
  emit('size-change', size)
}

function handlePrevClick(page: number) {
  emit('prev-click', page)
}

function handleNextClick(page: number) {
  emit('next-click', page)
}

function handleQuickJump() {
  const page = parseInt(quickJumpPage.value)
  if (page && page > 0 && page <= Math.ceil(props.total / localPageSize.value)) {
    localCurrentPage.value = page
    emit('update:current-page', page)
    emit('current-change', page)
  }
  quickJumpPage.value = '' // 清空输入
}

function clearSelection() {
  emit('selection-change', [])
  emit('update:selected-items', [])
}

// 监听属性变化
watch(() => props.currentPage, (newVal) => {
  localCurrentPage.value = newVal
})

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal
})

watch(() => props.total, (newVal) => {
  // 如果当前页超出范围，重置到最后一页
  const maxPage = Math.ceil(newVal / localPageSize.value)
  if (localCurrentPage.value > maxPage && maxPage > 0) {
    localCurrentPage.value = maxPage
    emit('update:current-page', maxPage)
    emit('current-change', maxPage)
  }
})

// 导出方法
defineExpose({
  // 当前页和页面大小
  localCurrentPage,
  localPageSize,
  
  // 快捷方法
  setCurrentPage: (page: number) => {
    localCurrentPage.value = page
    emit('update:current-page', page)
  },
  
  setPageSize: (size: number) => {
    localPageSize.value = size
    localCurrentPage.value = 1
    emit('update:page-size', size)
    emit('update:current-page', 1)
  },
  
  reset: () => {
    localCurrentPage.value = 1
    localPageSize.value = props.pageSize
    emit('update:current-page', 1)
    emit('update:page-size', props.pageSize)
  },
  
  // 页面信息
  getPageInfo: () => ({
    currentPage: localCurrentPage.value,
    pageSize: localPageSize.value,
    total: props.total,
    startItem: startItem.value,
    endItem: endItem.value,
    totalPages: Math.ceil(props.total / localPageSize.value)
  })
})
</script>

<style scoped>
.base-pagination {
  @apply w-full;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.base-pagination.align-left {
  justify-content: flex-start;
}

.base-pagination.align-center {
  justify-content: center;
}

.base-pagination.align-right {
  justify-content: flex-end;
}

.pagination-info {
  @apply flex items-center text-sm text-secondary;
  flex-shrink: 0;
}

.pagination-text {
  @apply leading-relaxed;
}

.pagination-text strong {
  @apply text-primary font-medium;
}

.quick-jumper {
  @apply flex items-center text-sm text-secondary;
  flex-shrink: 0;
}

.pagination-actions {
  @apply flex items-center gap-2;
  flex-shrink: 0;
}

.batch-actions {
  @apply flex items-center gap-2;
  flex-shrink: 0;
  margin-left: auto;
}

.batch-info {
  @apply font-medium;
}

/* Element Plus 分页样式覆盖 */
.base-pagination :deep(.el-pagination) {
  @apply flex items-center gap-2;
  flex-wrap: wrap;
}

.base-pagination :deep(.el-pagination__total) {
  @apply font-normal text-secondary;
}

.base-pagination :deep(.el-pagination__sizes) {
  @apply flex items-center;
}

.base-pagination :deep(.el-pagination__jump) {
  @apply flex items-center;
}

.base-pagination :deep(.el-pagination__editor) {
  @apply flex items-center;
}

.base-pagination :deep(.el-pagination .el-input__inner) {
  text-align: center;
}

/* 小尺寸样式 */
.base-pagination.small :deep(.el-pagination) {
  @apply text-sm;
}

/* 自定义分页按钮样式 */
.base-pagination :deep(.el-pager li) {
  min-width: 32px;
  height: 32px;
  line-height: 30px;
}

.base-pagination :deep(.el-pagination .btn-prev),
.base-pagination :deep(.el-pagination .btn-next) {
  min-width: 32px;
  height: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .base-pagination {
    @apply flex-col gap-3;
    justify-content: center;
  }
  
  .pagination-info {
    @apply justify-center text-center;
    order: 1;
  }
  
  .base-pagination :deep(.el-pagination) {
    @apply justify-center;
    order: 2;
  }
  
  .quick-jumper {
    @apply justify-center;
    order: 3;
  }
  
  .pagination-actions {
    @apply justify-center;
    order: 4;
  }
  
  .batch-actions {
    @apply justify-center;
    margin-left: 0;
    order: 5;
  }
  
  /* 移动端隐藏部分信息 */
  .pagination-text {
    @apply text-xs;
  }
  
  .pagination-text strong {
    @apply text-sm;
  }
}

@media (max-width: 480px) {
  .base-pagination :deep(.el-pagination .el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
    font-size: 12px;
  }
  
  .base-pagination :deep(.el-pagination .btn-prev),
  .base-pagination :deep(.el-pagination .btn-next) {
    min-width: 28px;
    height: 28px;
  }
  
  .pagination-info {
    @apply text-xs;
  }
  
  .quick-jumper {
    @apply text-xs;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .base-pagination {
    background-color: var(--bg-color-dark);
    border-color: var(--border-color-dark);
  }
  
  .pagination-info,
  .quick-jumper {
    color: var(--text-color-dark);
  }
}

/* 打印样式 */
@media print {
  .base-pagination {
    @apply hidden;
  }
}
</style>