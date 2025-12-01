/**
 * AutoPay Payment Platform - 通用表格组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="base-table">
    <!-- 表格操作栏 -->
    <div class="table-header" v-if="showHeader">
      <div class="header-left">
        <slot name="header-left">
          <div class="default-header">
            <h3 class="table-title" v-if="title">{{ title }}</h3>
            <el-tag v-if="total > 0" type="info" size="small">
              共 {{ total }} 条记录
            </el-tag>
          </div>
        </slot>
      </div>
      <div class="header-right">
        <slot name="header-right">
          <div class="default-actions">
            <el-button 
              v-if="showRefresh"
              :icon="Refresh" 
              @click="handleRefresh"
              size="small"
            >
              刷新
            </el-button>
            <el-button 
              v-if="showColumnSetting"
              :icon="Setting" 
              @click="showColumnDialog = true"
              size="small"
            >
              列设置
            </el-button>
          </div>
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :stripe="stripe"
        :border="border"
        :size="size"
        :height="height"
        :max-height="maxHeight"
        :row-key="rowKey"
        :default-sort="defaultSort"
        :highlight-current-row="highlightCurrentRow"
        :show-summary="showSummary"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDoubleClick"
        @current-change="handleCurrentChange"
        @select="handleSelect"
        @select-all="handleSelectAll"
        class="main-table"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="showSelection"
          type="selection"
          :width="selectionWidth"
          :fixed="selectionFixed"
          :reserve-selection="reserveSelection"
          align="center"
        />

        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          :label="indexLabel"
          :width="indexWidth"
          :fixed="indexFixed"
          align="center"
          :index="indexMethod"
        />

        <!-- 动态列 -->
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :show-overflow-tooltip="column.showOverflowTooltip !== false"
            :align="column.align || 'left'"
            :header-align="column.headerAlign"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
          >
            <!-- 表头自定义 -->
            <template #header="scope">
              <slot :name="`header-${column.prop}`" :scope="scope">
                {{ column.label }}
              </slot>
            </template>

            <!-- 单元格内容 -->
            <template #default="scope">
              <slot :name="column.prop" :scope="scope" :row="scope.row" :column="column">
                <!-- 默认渲染 -->
                <template v-if="!column.render">
                  <!-- 格式化处理 -->
                  <span v-if="column.formatter">
                    {{ column.formatter(scope.row, column, scope.$index) }}
                  </span>
                  <!-- 状态标签 -->
                  <el-tag 
                    v-else-if="column.type === 'tag'"
                    :type="getTagType(scope.row, column)"
                    :size="column.tagSize || 'small'"
                  >
                    {{ scope.row[column.prop] }}
                  </el-tag>
                  <!-- 状态指示器 -->
                  <div 
                    v-else-if="column.type === 'status'"
                    class="status-indicator"
                    :class="getStatusClass(scope.row, column)"
                  >
                    <span class="status-dot" :class="getStatusDotClass(scope.row, column)"></span>
                    {{ scope.row[column.prop] }}
                  </div>
                  <!-- 进度条 -->
                  <div v-else-if="column.type === 'progress'" class="progress-cell">
                    <el-progress
                      :percentage="scope.row[column.prop]"
                      :color="column.progressColor"
                      :show-text="column.showProgressText !== false"
                      :stroke-width="column.progressStrokeWidth || 6"
                    />
                  </div>
                  <!-- 图片 -->
                  <el-image
                    v-else-if="column.type === 'image'"
                    :src="scope.row[column.prop]"
                    :preview-src-list="column.preview ? [scope.row[column.prop]] : []"
                    :fit="column.fit || 'cover'"
                    :lazy="column.lazy !== false"
                    :style="column.imageStyle"
                    class="table-image"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><PictureRounded /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <!-- 链接 -->
                  <a 
                    v-else-if="column.type === 'link'"
                    :href="scope.row[column.linkHrefProp] || '#'"
                    :target="column.linkTarget || '_blank'"
                    class="table-link"
                    @click="handleLinkClick(scope.row, scope.$index, column)"
                  >
                    {{ scope.row[column.prop] }}
                  </a>
                  <!-- 默认文本 -->
                  <span v-else>{{ scope.row[column.prop] }}</span>
                </template>
              </slot>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column
          v-if="showActions && actionColumns.length > 0"
          :label="actionLabel"
          :width="actionWidth"
          :fixed="actionFixed || 'right'"
          align="center"
        >
          <template #default="scope">
            <div class="action-buttons">
              <template v-for="action in actionColumns" :key="action.key">
                <!-- 按钮类型操作 -->
                <el-button
                  v-if="action.type === 'button'"
                  :type="action.buttonType || 'text'"
                  :size="action.size || 'small'"
                  :icon="action.icon"
                  :disabled="action.disabled && action.disabled(scope.row, scope.$index)"
                  :loading="action.loading && action.loading(scope.row, scope.$index)"
                  @click="handleActionClick(action, scope.row, scope.$index)"
                >
                  {{ action.label }}
                </el-button>

                <!-- 下拉菜单类型操作 -->
                <el-dropdown
                  v-else-if="action.type === 'dropdown'"
                  trigger="click"
                  @command="(command) => handleDropdownCommand(command, scope.row, scope.$index)"
                >
                  <el-button :type="action.buttonType || 'text'" :size="action.size || 'small'">
                    {{ action.label }}
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in action.items"
                        :key="item.key"
                        :command="item.key"
                        :disabled="item.disabled && item.disabled(scope.row, scope.$index)"
                        :divided="item.divided"
                      >
                        <el-icon v-if="item.icon" class="dropdown-icon">
                          <component :is="item.icon" />
                        </el-icon>
                        {{ item.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <!-- 开关类型操作 -->
                <el-switch
                  v-else-if="action.type === 'switch'"
                  :model-value="scope.row[action.prop]"
                  :disabled="action.disabled && action.disabled(scope.row, scope.$index)"
                  @change="(value) => handleSwitchChange(action, scope.row, scope.$index, value)"
                />

                <!-- 自定义操作 -->
                <div v-else-if="action.type === 'custom'" class="custom-action">
                  <slot :name="`action-${action.key}`" :scope="scope" :action="action" />
                </div>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <slot name="empty">
          <el-empty :description="emptyText">
            <template #image>
              <el-icon class="empty-icon"><DocumentDelete /></el-icon>
            </template>
          </el-empty>
        </slot>
      </div>
    </div>

    <!-- 表格底部 -->
    <div class="table-footer" v-if="showFooter">
      <slot name="footer">
        <div class="default-footer">
          <div class="footer-left" v-if="showSelectionInfo && selectedRows.length > 0">
            <el-text type="info">
              已选择 {{ selectedRows.length }} 项
            </el-text>
            <el-button 
              type="text" 
              size="small" 
              @click="clearSelection"
            >
              清空选择
            </el-button>
          </div>
          <div class="footer-right">
            <base-pagination
              v-if="showPagination"
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="pageSizes"
              :layout="paginationLayout"
              @size-change="handleSizeChange"
              @current-change="handleCurrentPageChange"
            />
          </div>
        </div>
      </slot>
    </div>

    <!-- 列设置对话框 -->
    <el-dialog
      v-model="showColumnDialog"
      title="列设置"
      width="500px"
      append-to-body
    >
      <div class="column-settings">
        <el-checkbox-group v-model="visibleColumnProps">
          <div class="column-checkboxes">
            <el-checkbox
              v-for="column in allColumns"
              :key="column.prop"
              :label="column.prop"
              :disabled="column.required"
            >
              {{ column.label }}
              <el-tag v-if="column.required" size="small" type="info">必选</el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showColumnDialog = false">取消</el-button>
          <el-button @click="resetColumnVisibility">重置</el-button>
          <el-button type="primary" @click="applyColumnVisibility">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Setting, 
  PictureRounded, 
  ArrowDown, 
  DocumentDelete,
  type TableInstance,
  type TableColumnInstance 
} from '@element-plus/icons-vue'
import BasePagination from './BasePagination.vue'

// 定义接口
export interface ColumnConfig {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | string
  sortable?: boolean | string
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  type?: 'text' | 'tag' | 'status' | 'progress' | 'image' | 'link'
  formatter?: (row: any, column: ColumnConfig, cellValue: any, index: number) => string
  tagType?: string
  statusProp?: string
  progressColor?: string
  showProgressText?: boolean
  progressStrokeWidth?: number
  fit?: string
  lazy?: boolean
  imageStyle?: string
  preview?: boolean
  linkHrefProp?: string
  linkTarget?: string
  required?: boolean
  render?: (scope: any) => string | JSX.Element
}

export interface ActionConfig {
  key: string
  type: 'button' | 'dropdown' | 'switch' | 'custom'
  label: string
  buttonType?: string
  size?: string
  icon?: any
  disabled?: (row: any, index: number) => boolean
  loading?: (row: any, index: number) => boolean
  prop?: string // 用于switch类型
  items?: DropdownItem[]
  divided?: boolean
}

export interface DropdownItem {
  key: string
  label: string
  icon?: any
  disabled?: (row: any, index: number) => boolean
  divided?: boolean
}

const props = withDefaults(defineProps<{
  // 数据
  data?: any[]
  columns?: ColumnConfig[]
  actions?: ActionConfig[]
  
  // 状态
  loading?: boolean
  total?: number
  
  // 配置
  title?: string
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  height?: string | number
  maxHeight?: string | number
  rowKey?: string | ((row: any) => string)
  highlightCurrentRow?: boolean
  showSummary?: boolean
  sumText?: string
  summaryMethod?: (param: any) => string[]
  
  // 功能开关
  showHeader?: boolean
  showFooter?: boolean
  showSelection?: boolean
  showIndex?: boolean
  showActions?: boolean
  showPagination?: boolean
  showRefresh?: boolean
  showColumnSetting?: boolean
  showSelectionInfo?: boolean
  
  // 尺寸配置
  selectionWidth?: string | number
  indexWidth?: string | number
  actionWidth?: string | number
  indexLabel?: string
  actionLabel?: string
  
  // 固定配置
  selectionFixed?: boolean | string
  indexFixed?: boolean | string
  actionFixed?: boolean | string
  
  // 分页配置
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  paginationLayout?: string
  
  // 其他
  reserveSelection?: boolean
  defaultSort?: any
  emptyText?: string
  visibleColumns?: string[]
}>(), {
  data: () => [],
  columns: () => [],
  actions: () => [],
  loading: false,
  total: 0,
  stripe: true,
  border: true,
  size: 'default',
  showHeader: true,
  showFooter: true,
  showSelection: false,
  showIndex: false,
  showActions: true,
  showPagination: true,
  showRefresh: true,
  showColumnSetting: true,
  showSelectionInfo: true,
  selectionWidth: 55,
  indexWidth: 60,
  actionWidth: 120,
  indexLabel: '#',
  actionLabel: '操作',
  selectionFixed: false,
  indexFixed: false,
  actionFixed: 'right',
  currentPage: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  reserveSelection: true,
  defaultSort: { prop: '', order: null },
  emptyText: '暂无数据',
  visibleColumns: () => []
})

const emit = defineEmits<{
  // 事件
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'update:visibleColumns': [columns: string[]]
  
  // 表格事件
  'selection-change': [selection: any[]]
  'sort-change': [sort: any]
  'row-click': [row: any, column: any, event: Event]
  'row-double-click': [row: any, column: any, event: Event]
  'current-change': [currentRow: any, oldCurrentRow: any]
  'select': [selection: any[], row: any]
  'select-all': [selection: any[]]
  
  // 操作事件
  'action-click': [action: ActionConfig, row: any, index: number]
  'dropdown-command': [command: string, row: any, index: number]
  'switch-change': [action: ActionConfig, row: any, index: number, value: any]
  'link-click': [row: any, index: number, column: ColumnConfig]
  
  // 其他事件
  'refresh': []
  'size-change': [size: number]
  'current-page-change': [page: number]
}>()

// 响应式数据
const tableRef = ref<TableInstance>()
const showColumnDialog = ref(false)
const visibleColumnProps = ref<string[]>([...props.visibleColumns])
const selectedRows = ref<any[]>([])

// 计算属性
const tableData = computed(() => props.data || [])
const allColumns = computed(() => props.columns || [])
const actionColumns = computed(() => props.actions || [])
const visibleColumns = computed(() => {
  if (visibleColumnProps.value.length === 0) {
    return allColumns.value.filter(col => col.required !== false)
  }
  return allColumns.value.filter(col => visibleColumnProps.value.includes(col.prop))
})

// 方法
function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
  emit('selection-change', selection)
}

function handleSortChange(sort: any) {
  emit('sort-change', sort)
}

function handleRowClick(row: any, column: any, event: Event) {
  emit('row-click', row, column, event)
}

function handleRowDoubleClick(row: any, column: any, event: Event) {
  emit('row-double-click', row, column, event)
}

function handleCurrentChange(currentRow: any, oldCurrentRow: any) {
  emit('current-change', currentRow, oldCurrentRow)
}

function handleSelect(selection: any[], row: any) {
  emit('select', selection, row)
}

function handleSelectAll(selection: any[]) {
  emit('select-all', selection)
}

function handleActionClick(action: ActionConfig, row: any, index: number) {
  emit('action-click', action, row, index)
}

function handleDropdownCommand(command: string, row: any, index: number) {
  emit('dropdown-command', command, row, index)
}

function handleSwitchChange(action: ActionConfig, row: any, index: number, value: any) {
  emit('switch-change', action, row, index, value)
}

function handleLinkClick(row: any, index: number, column: ColumnConfig) {
  emit('link-click', row, index, column)
}

function handleRefresh() {
  emit('refresh')
}

function handleSizeChange(size: number) {
  emit('update:pageSize', size)
  emit('size-change', size)
}

function handleCurrentPageChange(page: number) {
  emit('update:currentPage', page)
  emit('current-page-change', page)
}

function clearSelection() {
  tableRef.value?.clearSelection()
}

function toggleSelection(row?: any, selected?: boolean) {
  tableRef.value?.toggleSelection(row, selected)
}

function toggleAllSelection() {
  tableRef.value?.toggleAllSelection()
}

function setCurrentRow(row?: any) {
  tableRef.value?.setCurrentRow(row)
}

function indexMethod(index: number) {
  return (props.currentPage - 1) * props.pageSize + index + 1
}

function getTagType(row: any, column: ColumnConfig) {
  if (column.tagType) return column.tagType
  
  // 根据值自动判断标签类型
  const value = row[column.prop]
  if (typeof value === 'string') {
    if (value.includes('成功') || value === 'active' || value === 'enabled') {
      return 'success'
    } else if (value.includes('失败') || value === 'inactive' || value === 'disabled') {
      return 'danger'
    } else if (value.includes('警告') || value === 'warning') {
      return 'warning'
    }
  }
  return 'info'
}

function getStatusClass(row: any, column: ColumnConfig) {
  const prop = column.statusProp || column.prop
  const value = row[prop]
  return `status-${value}`
}

function getStatusDotClass(row: any, column: ColumnConfig) {
  const prop = column.statusProp || column.prop
  const value = row[prop]
  return `dot-${value}`
}

function resetColumnVisibility() {
  visibleColumnProps.value = allColumns.value
    .filter(col => col.required !== false)
    .map(col => col.prop)
}

function applyColumnVisibility() {
  emit('update:visibleColumns', [...visibleColumnProps.value])
  showColumnDialog.value = false
}

// 监听visibleColumns变化
watch(() => props.visibleColumns, (newColumns) => {
  if (newColumns.length > 0) {
    visibleColumnProps.value = [...newColumns]
  }
}, { immediate: true })

// 导出方法
defineExpose({
  tableRef,
  selectedRows,
  clearSelection,
  toggleSelection,
  toggleAllSelection,
  setCurrentRow
})
</script>

<style scoped>
.base-table {
  @apply w-full;
}

.table-header {
  @apply flex justify-between items-center mb-4;
  min-height: 40px;
}

.header-left {
  @apply flex-1;
}

.header-right {
  @apply flex items-center gap-2;
}

.default-header {
  @apply flex items-center gap-3;
}

.table-title {
  @apply text-lg font-medium text-primary mb-0;
}

.table-container {
  @apply relative;
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-base);
  overflow: hidden;
}

.main-table {
  @apply w-full;
}

.empty-state {
  @apply flex items-center justify-center py-16;
  min-height: 200px;
  background: var(--white);
}

.empty-icon {
  @apply text-4xl text-secondary;
}

.table-footer {
  @apply mt-4;
}

.default-footer {
  @apply flex justify-between items-center;
  min-height: 40px;
}

.footer-left {
  @apply flex items-center gap-3;
}

.footer-right {
  @apply flex-1;
}

.action-buttons {
  @apply flex items-center justify-center gap-1 flex-wrap;
}

.custom-action {
  @apply inline-block;
}

.status-indicator {
  @apply flex items-center;
}

.status-dot {
  @apply w-2 h-2 rounded-full mr-2;
}

.dot-success {
  @apply bg-success;
}

.dot-warning {
  @apply bg-warning;
}

.dot-danger {
  @apply bg-danger;
}

.dot-info {
  @apply bg-info;
}

.progress-cell {
  @apply w-full;
}

.table-image {
  @apply w-8 h-8 rounded;
}

.image-error {
  @apply w-full h-full flex items-center justify-center bg-gray-100 text-secondary;
}

.table-link {
  @apply text-primary hover:text-primary-dark no-underline hover:underline;
}

.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-checkboxes {
  @apply space-y-3;
}

.dropdown-icon {
  @apply mr-2;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header {
    @apply flex-col items-start gap-2;
  }
  
  .header-left,
  .header-right {
    @apply w-full;
  }
  
  .default-footer {
    @apply flex-col items-start gap-2;
  }
  
  .footer-left,
  .footer-right {
    @apply w-full;
  }
  
  .action-buttons {
    @apply flex-col;
  }
}
</style>