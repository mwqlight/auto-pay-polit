<template>
  <div class="error-boundary">
    <el-result
      v-if="hasError"
      icon="error"
      title="组件加载失败"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button type="primary" @click="retry">
          重新加载
        </el-button>
        <el-button @click="reset">
          重置
        </el-button>
      </template>
    </el-result>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

interface Props {
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '组件出现了未知错误，请刷新页面重试'
})

const hasError = ref(false)
const errorMessage = ref('')

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('ErrorBoundary caught an error:', err)
  console.error('Component info:', info)
  
  hasError.value = true
  errorMessage.value = props.fallback
  
  // 阻止错误继续向上传播
  return false
})

// 重试函数
const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  
  // 强制重新渲染组件
  // 这会触发组件重新挂载
  const component = getCurrentInstance()
  if (component) {
    component.proxy?.$forceUpdate?.()
  }
}

// 重置函数
const reset = () => {
  hasError.value = false
  errorMessage.value = ''
  
  // 刷新页面
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.el-result {
  text-align: center;
}
</style>