/**
 * AutoPay Payment Platform - 通用搜索组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="base-search">
    <!-- 折叠搜索表单 -->
    <el-collapse v-model="activeCollapse" class="search-collapse">
      <el-collapse-item name="search" :title="collapseTitle">
        <div class="search-form-container">
          <el-form
            ref="formRef"
            :model="searchForm"
            :label-width="labelWidth"
            :inline="inline"
            class="search-form"
            @submit.prevent="handleSearch"
          >
            <!-- 动态搜索字段 -->
            <template v-for="field in searchFields" :key="field.key">
              <el-form-item
                :label="field.label"
                :prop="field.key"
                class="search-field"
              >
                <!-- 输入框 -->
                <el-input
                  v-if="field.type === 'input'"
                  v-model="searchForm[field.key]"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  @keyup.enter="handleSearch"
                />
                
                <!-- 下拉选择 -->
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="searchForm[field.key]"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  :multiple="field.multiple"
                  :filterable="field.filterable"
                  :remote="field.remote"
                  :loading="field.loading"
                  @change="(value) => handleFieldChange(field, value)"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="option in field.options || []"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                    :disabled="option.disabled"
                  />
                </el-select>
                
                <!-- 日期选择 -->
                <el-date-picker
                  v-else-if="field.type === 'date'"
                  v-model="searchForm[field.key]"
                  type="date"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  :format="field.format || 'YYYY-MM-DD'"
                  :value-format="field.valueFormat || 'YYYY-MM-DD'"
                  style="width: 100%;"
                />
                
                <!-- 日期时间选择 -->
                <el-date-picker
                  v-else-if="field.type === 'datetime'"
                  v-model="searchForm[field.key]"
                  type="datetime"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  :format="field.format || 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="field.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
                  style="width: 100%;"
                />
                
                <!-- 日期范围选择 -->
                <el-date-picker
                  v-else-if="field.type === 'daterange'"
                  v-model="searchForm[field.key]"
                  type="daterange"
                  :start-placeholder="field.startPlaceholder || '开始日期'"
                  :end-placeholder="field.endPlaceholder || '结束日期'"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  :format="field.format || 'YYYY-MM-DD'"
                  :value-format="field.valueFormat || 'YYYY-MM-DD'"
                  style="width: 100%;"
                />
                
                <!-- 日期时间范围选择 -->
                <el-date-picker
                  v-else-if="field.type === 'datetimerange'"
                  v-model="searchForm[field.key]"
                  type="datetimerange"
                  :start-placeholder="field.startPlaceholder || '开始日期时间'"
                  :end-placeholder="field.endPlaceholder || '结束日期时间'"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  :format="field.format || 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="field.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
                  style="width: 100%;"
                />
                
                <!-- 数字输入框 -->
                <el-input-number
                  v-else-if="field.type === 'number'"
                  v-model="searchForm[field.key]"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  :min="field.min"
                  :max="field.max"
                  :precision="field.precision"
                  :controls="field.controls !== false"
                  :controls-position="field.controlsPosition || 'right'"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  style="width: 100%;"
                />
                
                <!-- 数字范围输入 -->
                <div v-else-if="field.type === 'numberRange'" class="number-range-input">
                  <el-input-number
                    v-model="searchForm[field.startKey]"
                    :placeholder="field.startPlaceholder || '最小值'"
                    :min="field.min"
                    :max="field.max"
                    :precision="field.precision"
                    :controls="field.controls !== false"
                    :controls-position="field.controlsPosition || 'right'"
                    :clearable="field.clearable !== false"
                    :disabled="field.disabled"
                    style="width: 48%;"
                  />
                  <span class="range-separator">{{ field.separator || '~' }}</span>
                  <el-input-number
                    v-model="searchForm[field.endKey]"
                    :placeholder="field.endPlaceholder || '最大值'"
                    :min="field.min"
                    :max="field.max"
                    :precision="field.precision"
                    :controls="field.controls !== false"
                    :controls-position="field.controlsPosition || 'right'"
                    :clearable="field.clearable !== false"
                    :disabled="field.disabled"
                    style="width: 48%;"
                  />
                </div>
                
                <!-- 单选按钮 -->
                <el-radio-group
                  v-else-if="field.type === 'radio'"
                  v-model="searchForm[field.key]"
                  :disabled="field.disabled"
                  @change="(value) => handleFieldChange(field, value)"
                >
                  <el-radio-button
                    v-for="option in field.options || []"
                    :key="option.value"
                    :label="option.value"
                    :disabled="option.disabled"
                  >
                    {{ option.label }}
                  </el-radio-button>
                </el-radio-group>
                
                <!-- 复选框组 -->
                <el-checkbox-group
                  v-else-if="field.type === 'checkbox'"
                  v-model="searchForm[field.key]"
                  :disabled="field.disabled"
                  @change="(value) => handleFieldChange(field, value)"
                >
                  <el-checkbox
                    v-for="option in field.options || []"
                    :key="option.value"
                    :label="option.value"
                    :disabled="option.disabled"
                  >
                    {{ option.label }}
                  </el-checkbox>
                </el-checkbox-group>
                
                <!-- 开关 -->
                <el-switch
                  v-else-if="field.type === 'switch'"
                  v-model="searchForm[field.key]"
                  :disabled="field.disabled"
                  :active-text="field.activeText"
                  :inactive-text="field.inactiveText"
                  :active-color="field.activeColor"
                  :inactive-color="field.inactiveColor"
                  @change="(value) => handleFieldChange(field, value)"
                />
                
                <!-- 自定义组件 -->
                <component
                  v-else-if="field.type === 'custom'"
                  :is="field.component"
                  v-model="searchForm[field.key]"
                  v-bind="field.props"
                  @change="(value) => handleFieldChange(field, value)"
                  @update:model-value="(value) => searchForm[field.key] = value"
                />
                
                <!-- 默认输入框 -->
                <el-input
                  v-else
                  v-model="searchForm[field.key]"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  :clearable="field.clearable !== false"
                  :disabled="field.disabled"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </template>

            <!-- 操作按钮 -->
            <div class="search-actions" :class="{ 'text-center': !inline }">
              <el-button 
                v-if="showSearch"
                type="primary" 
                :icon="Search"
                :loading="loading"
                @click="handleSearch"
              >
                搜索
              </el-button>
              
              <el-button 
                v-if="showReset"
                :icon="Refresh"
                @click="handleReset"
              >
                重置
              </el-button>
              
              <el-button 
                v-if="showExport"
                :icon="Download"
                @click="handleExport"
              >
                导出
              </el-button>
              
              <slot name="actions" :form="searchForm" :reset="handleReset" :search="handleSearch" />
            </div>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 快捷搜索栏 -->
    <div v-if="showQuickSearch && quickSearchFields.length > 0" class="quick-search-bar">
      <div class="quick-search-header">
        <span class="quick-search-title">快捷搜索</span>
      </div>
      <div class="quick-search-fields">
        <div
          v-for="field in quickSearchFields"
          :key="field.key"
          class="quick-search-field"
        >
          <el-input
            v-if="field.type === 'input'"
            v-model="searchForm[field.key]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :clearable="field.clearable !== false"
            :disabled="field.disabled"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon v-if="field.icon"><component :is="field.icon" /></el-icon>
            </template>
          </el-input>
          
          <el-select
            v-else-if="field.type === 'select'"
            v-model="searchForm[field.key]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            :disabled="field.disabled"
            :filterable="field.filterable"
            style="width: 150px;"
          >
            <el-option
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="searchForm[field.key]"
            type="daterange"
            :start-placeholder="field.startPlaceholder || '开始'"
            :end-placeholder="field.endPlaceholder || '结束'"
            :clearable="field.clearable !== false"
            :disabled="field.disabled"
            :format="field.format || 'MM-DD'"
            :value-format="field.valueFormat || 'MM-dd'"
            style="width: 220px;"
          />
          
          <!-- 其他类型的快捷搜索字段 -->
          <div v-else class="quick-search-unsupported">
            <el-tag type="info" size="small">暂不支持此类型</el-tag>
          </div>
        </div>
        
        <div class="quick-search-actions">
          <el-button 
            type="primary"
            :icon="Search"
            :loading="loading"
            @click="handleSearch"
            size="small"
          >
            搜索
          </el-button>
          
          <el-button 
            :icon="Refresh"
            @click="handleReset"
            size="small"
          >
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div v-if="showResultStats && resultCount >= 0" class="search-stats">
      <el-text type="info">
        共找到 <strong>{{ resultCount }}</strong> 条结果
        <span v-if="searchTime">，用时 {{ searchTime }}ms</span>
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'

// 定义接口
export interface SearchField {
  key: string
  label: string
  type: 'input' | 'select' | 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'number' | 'numberRange' | 'radio' | 'checkbox' | 'switch' | 'custom'
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  
  // select类型
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  multiple?: boolean
  filterable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<any[]>
  loading?: boolean
  
  // date类型
  format?: string
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  
  // number类型
  min?: number
  max?: number
  precision?: number
  controls?: boolean
  controlsPosition?: 'right'
  startKey?: string
  endKey?: string
  separator?: string
  startPlaceholder?: string
  endPlaceholder?: string
  
  // radio/checkbox类型
  value?: any
  
  // switch类型
  activeText?: string
  inactiveText?: string
  activeColor?: string
  inactiveColor?: string
  
  // 自定义类型
  component?: any
  props?: Record<string, any>
  
  // 其他
  icon?: any
  defaultValue?: any
}

const props = withDefaults(defineProps<{
  // 搜索字段配置
  fields: SearchField[]
  
  // 布局配置
  inline?: boolean
  labelWidth?: string
  
  // 功能开关
  showCollapse?: boolean
  showQuickSearch?: boolean
  showSearch?: boolean
  showReset?: boolean
  showExport?: boolean
  showResultStats?: boolean
  
  // 状态
  loading?: boolean
  resultCount?: number
  searchTime?: number
  
  // 快捷搜索字段
  quickSearchFields?: SearchField[]
}>(), {
  fields: () => [],
  inline: true,
  labelWidth: '80px',
  showCollapse: true,
  showQuickSearch: true,
  showSearch: true,
  showReset: true,
  showExport: false,
  showResultStats: true,
  loading: false,
  resultCount: -1,
  searchTime: undefined,
  quickSearchFields: () => []
})

const emit = defineEmits<{
  // 搜索相关
  'search': [form: Record<string, any>]
  'reset': []
  'export': [form: Record<string, any>]
  
  // 字段变化
  'field-change': [field: SearchField, value: any]
  'update:model-value': [form: Record<string, any>]
}>()

// 响应式数据
const formRef = ref()
const activeCollapse = ref('search')
const searchForm = reactive<Record<string, any>>({})

// 计算属性
const searchFields = computed(() => props.fields)
const quickSearchFields = computed(() => props.quickSearchFields)

const collapseTitle = computed(() => {
  const activeFields = searchFields.value.filter(field => {
    const value = searchForm[field.key]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== undefined && value !== null && value !== ''
  })
  return activeFields.length > 0 
    ? `搜索条件 (${activeFields.length}个)` 
    : '搜索条件'
})

// 方法
function initializeForm() {
  searchFields.value.forEach(field => {
    if (field.type === 'numberRange') {
      // 数字范围类型的初始化
      if (field.startKey) {
        searchForm[field.startKey] = field.defaultValue || null
      }
      if (field.endKey) {
        searchForm[field.endKey] = field.defaultValue || null
      }
    } else if (field.type === 'checkbox') {
      // 复选框类型初始化为数组
      searchForm[field.key] = field.defaultValue || []
    } else {
      // 其他类型
      searchForm[field.key] = field.defaultValue || null
    }
  })
}

function handleSearch() {
  const searchParams = { ...searchForm }
  
  // 处理数字范围字段
  searchFields.value.forEach(field => {
    if (field.type === 'daterange' || field.type === 'datetimerange') {
      // 处理日期范围
      if (Array.isArray(searchParams[field.key]) && searchParams[field.key].length === 2) {
        searchParams[`${field.key}Start`] = searchParams[field.key][0]
        searchParams[`${field.key}End`] = searchParams[field.key][1]
        delete searchParams[field.key]
      }
    } else if (field.type === 'numberRange') {
      // 处理数字范围
      if (field.startKey && field.endKey) {
        searchParams[`${field.key}Min`] = searchForm[field.startKey]
        searchParams[`${field.key}Max`] = searchForm[field.endKey]
        delete searchParams[field.startKey]
        delete searchParams[field.endKey]
      }
    }
  })
  
  emit('search', searchParams)
  emit('update:model-value', { ...searchParams })
}

function handleReset() {
  // 重置表单
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = null
    }
  })
  
  // 重新初始化默认值
  searchFields.value.forEach(field => {
    if (field.type === 'checkbox') {
      searchForm[field.key] = field.defaultValue || []
    } else if (field.type !== 'numberRange') {
      searchForm[field.key] = field.defaultValue || null
    } else if (field.type === 'numberRange') {
      if (field.startKey) searchForm[field.startKey] = field.defaultValue || null
      if (field.endKey) searchForm[field.endKey] = field.defaultValue || null
    }
  })
  
  emit('reset')
  emit('update:model-value', searchForm)
}

function handleExport() {
  emit('export', { ...searchForm })
}

function handleFieldChange(field: SearchField, value: any) {
  emit('field-change', field, value)
}

// 监听字段配置变化，初始化表单
watch(() => props.fields, () => {
  initializeForm()
}, { immediate: true })

// 导出方法
defineExpose({
  searchForm,
  handleSearch,
  handleReset,
  formRef
})
</script>

<style scoped>
.base-search {
  @apply w-full;
}

.search-collapse {
  @apply mb-4;
}

.search-collapse :deep(.el-collapse-item__header) {
  @apply font-medium;
}

.search-form-container {
  @apply pt-4;
}

.search-form {
  @apply w-full;
}

.search-field {
  @apply mb-4;
}

.search-actions {
  @apply flex items-center gap-2;
}

.search-actions.text-center {
  @apply justify-center;
  padding-top: 24px;
}

.quick-search-bar {
  @apply bg-white border border-light rounded p-4 mb-4;
}

.quick-search-header {
  @apply mb-3;
}

.quick-search-title {
  @apply text-sm font-medium text-secondary;
}

.quick-search-fields {
  @apply flex items-center gap-4 flex-wrap;
}

.quick-search-field {
  @apply flex items-center gap-2;
}

.quick-search-actions {
  @apply flex items-center gap-2;
  margin-left: auto;
}

.quick-search-unsupported {
  @apply py-2;
}

.number-range-input {
  @apply flex items-center gap-2 w-full;
}

.range-separator {
  @apply text-secondary;
  min-width: 20px;
  text-align: center;
}

.search-stats {
  @apply flex items-center justify-between mb-4 p-3 bg-lighter rounded;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-actions {
    @apply flex-col w-full;
  }
  
  .search-actions.text-center {
    @apply items-start;
  }
  
  .quick-search-fields {
    @apply flex-col gap-3;
  }
  
  .quick-search-field {
    @apply w-full;
  }
  
  .quick-search-actions {
    @apply w-full justify-center;
    margin-left: 0;
  }
  
  .search-stats {
    @apply flex-col gap-2 text-center;
  }
  
  .number-range-input {
    @apply flex-col gap-1;
  }
  
  .range-separator {
    @apply hidden;
  }
}
</style>