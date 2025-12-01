/**
 * AutoPay Payment Platform - 应用布局组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-left">
        <!-- 菜单折叠按钮 -->
        <el-button 
          text 
          @click="toggleSidebar"
          class="sidebar-toggle"
        >
          <el-icon><Menu /></el-icon>
        </el-button>
        
        <!-- Logo和标题 -->
        <div class="logo">
          <img src="/logo.svg" alt="AutoPay" class="logo-img" />
          <h2 class="logo-title">AutoPay 支付平台</h2>
        </div>
      </div>

      <div class="header-right">
        <!-- 系统状态指示器 -->
        <div class="system-status">
          <el-tooltip content="系统运行正常" placement="bottom">
            <el-icon class="status-icon healthy"><CircleCheck /></el-icon>
          </el-tooltip>
          <span class="status-text">运行正常</span>
        </div>

        <!-- 通知中心 -->
        <el-dropdown @command="handleNotification">
          <el-button text class="notification-btn">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="view-all">查看所有通知</el-dropdown-item>
              <el-dropdown-item command="mark-read">全部标为已读</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 用户信息下拉菜单 -->
        <el-dropdown @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="authStore.user?.avatar">
              {{ authStore.userRealName.charAt(0) }}
            </el-avatar>
            <span class="username">{{ authStore.userRealName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                账户设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '64px' : '240px'" class="app-sidebar">
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <!-- 单个菜单项 -->
            <el-menu-item 
              v-if="!route.children || route.children.length === 1"
              :index="route.children ? route.children[0].path : route.path"
              class="menu-item"
            >
              <el-icon><component :is="getMenuIcon(route.meta?.icon)" /></el-icon>
              <template #title>{{ route.meta?.title }}</template>
            </el-menu-item>

            <!-- 子菜单 -->
            <el-sub-menu v-else :index="route.path" class="sub-menu">
              <template #title>
                <el-icon><component :is="getMenuIcon(route.meta?.icon)" /></el-icon>
                <span>{{ route.meta?.title }}</span>
              </template>
              <el-menu-item 
                v-for="child in route.children" 
                :key="child.path"
                :index="child.path"
                class="sub-menu-item"
              >
                <el-icon><component :is="getMenuIcon(child.meta?.icon)" /></el-icon>
                <template #title>{{ child.meta?.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main class="app-main">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-container" v-if="breadcrumb.length > 0">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumb" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Menu, 
  CircleCheck, 
  Bell, 
  ArrowDown, 
  User, 
  Setting, 
  SwitchButton,
  Dashboard,
  List,
  Plus,
  Channel,
  Analytics,
  Shield,
  User as UserIcon
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 状态
const sidebarCollapsed = ref(false)
const unreadCount = ref(5)

// 计算属性
const activeMenu = computed(() => route.path)
const breadcrumb = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    title: item.meta?.title,
    path: item.path
  }))
})

const menuRoutes = computed(() => {
  // 过滤需要权限验证的路由
  return router.getRoutes().find(r => r.path === '/')?.children?.filter(child => {
    return child.meta?.title && child.meta?.permission ? 
           authStore.hasPermission(child.meta.permission as string) : 
           true
  }) || []
})

// 方法
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function getMenuIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    'dashboard': Dashboard,
    'list': List,
    'plus': Plus,
    'channel': Channel,
    'analytics': Analytics,
    'shield': Shield,
    'user': UserIcon
  }
  return iconMap[iconName] || List
}

function handleNotification(command: string) {
  switch (command) {
    case 'view-all':
      router.push('/notifications')
      break
    case 'mark-read':
      unreadCount.value = 0
      ElMessage.success('所有通知已标为已读')
      break
  }
}

async function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '退出确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        await authStore.logout()
      } catch {
        // 用户取消
      }
      break
  }
}

// 生命周期
onMounted(() => {
  // 初始化系统状态
  console.log('系统布局组件已加载')
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  font-size: 18px;
  color: #606266;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #f0f9ff;
  border-radius: 4px;
}

.status-icon {
  font-size: 16px;
}

.status-icon.healthy {
  color: #67c23a;
}

.status-text {
  font-size: 12px;
  color: #606266;
}

.notification-btn {
  font-size: 16px;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.app-container {
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s ease;
}

.sidebar-menu {
  border: none;
  height: 100%;
}

.menu-item,
.sub-menu-item {
  height: 48px;
  line-height: 48px;
}

.sub-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.app-main {
  padding: 24px;
  background: #f5f7fa;
  overflow: auto;
}

.breadcrumb-container {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-content {
  min-height: calc(100vh - 160px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .username {
    display: none;
  }
  
  .logo-title {
    display: none;
  }
  
  .app-main {
    padding: 16px;
  }
}
</style>