/**
 * AutoPay Payment Platform - Vue Router 配置
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// 路由组件懒加载
const Layout = () => import('@/components/layout/AppLayout.vue')
const Login = () => import('@/views/auth/Login.vue')

// 功能模块组件
const Dashboard = () => import('@/views/dashboard/Index.vue')
const PaymentList = () => import('@/views/payment/List.vue')
const PaymentDetail = () => import('@/views/payment/Detail.vue')
const PaymentCreate = () => import('@/views/payment/Create.vue')
const ChannelList = () => import('@/views/channel/List.vue')
const ChannelConfig = () => import('@/views/channel/Config.vue')
const AnalyticsDashboard = () => import('@/views/analytics/AnalyticsDashboard.vue')
const RiskManagement = () => import('@/views/risk/Management.vue')
const UserManagement = () => import('@/views/user/Management.vue')
const SystemSettings = () => import('@/views/system/Settings.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: '用户登录'
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
      title: '首页'
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '数据总览',
          icon: 'dashboard',
          permission: 'dashboard:view'
        }
      },
      {
        path: '/payments',
        name: 'Payment',
        meta: {
          title: '支付管理',
          icon: 'payment'
        },
        children: [
          {
            path: 'list',
            name: 'PaymentList',
            component: PaymentList,
            meta: {
              title: '支付订单',
              icon: 'list',
              permission: 'payment:view'
            }
          },
          {
            path: 'create',
            name: 'PaymentCreate',
            component: PaymentCreate,
            meta: {
              title: '创建支付',
              icon: 'plus',
              permission: 'payment:create'
            }
          }
        ]
      },
      {
        path: '/channels',
        name: 'Channel',
        meta: {
          title: '渠道管理',
          icon: 'channel'
        },
        children: [
          {
            path: 'list',
            name: 'ChannelList',
            component: ChannelList,
            meta: {
              title: '渠道列表',
              icon: 'list',
              permission: 'channel:view'
            }
          },
          {
            path: 'config/:id?',
            name: 'ChannelConfig',
            component: ChannelConfig,
            meta: {
              title: '渠道配置',
              icon: 'setting',
              permission: 'channel:config'
            }
          }
        ]
      },
      {
        path: '/analytics',
        name: 'Analytics',
        component: Analytics,
        meta: {
          title: '数据分析',
          icon: 'analytics',
          permission: 'analytics:view'
        },
        children: [
          {
            path: 'dashboard',
            name: 'AnalyticsDashboard',
            component: () => import('@/views/analytics/AnalyticsDashboard.vue'),
            meta: {
              title: '数据驾驶舱',
              permission: 'analytics:dashboard'
            }
          }
        ]
      },
      {
        path: '/risk',
        name: 'RiskManagement',
        component: RiskManagement,
        meta: {
          title: '风险控制',
          icon: 'shield',
          permission: 'risk:view'
        }
      },
      {
        path: '/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: {
          title: '用户管理',
          icon: 'user',
          permission: 'user:view'
        }
      },
      {
        path: '/settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: {
          title: '系统设置',
          icon: 'setting',
          permission: 'system:view'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      requiresAuth: false,
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AutoPay 支付平台`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isLoggedIn) {
      // 如果用户未登录，重定向到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查权限
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      // 如果没有权限，显示403页面
      next({
        name: 'Forbidden',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  console.log(`路由跳转: ${from.fullPath} -> ${to.fullPath}`)
})

export default router