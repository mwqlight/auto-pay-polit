/**
 * AutoPay Payment Platform - 用户登录页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/logo.svg" alt="AutoPay" class="logo" />
        <h1 class="title">AutoPay 支付平台</h1>
        <p class="subtitle">安全、高效的支付管理解决方案</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="验证码"
              size="large"
              prefix-icon="Shield"
              class="captcha-input"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img 
                v-if="captchaImage" 
                :src="captchaImage" 
                alt="验证码" 
                class="captcha-img"
              />
              <div v-else class="captcha-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <el-link type="primary" @click="showForgotPassword = true">
              忘记密码？
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <div class="security-notice">
          <el-icon><Shield /></el-icon>
          <span>您的登录信息将受到SSL加密保护</span>
        </div>
        <div class="system-info">
          <span>AutoPay v1.0.0 | © 2024 AutoPay Team</span>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="找回密码"
      width="400px"
      center
    >
      <el-form :model="forgotForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input 
            v-model="forgotForm.email" 
            placeholder="请输入注册邮箱"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForgotPassword = false">取消</el-button>
        <el-button type="primary" @click="handleForgotPassword">发送重置链接</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Shield, Picture } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const showForgotPassword = ref(false)
const captchaImage = ref('')

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: '',
  rememberMe: false
})

const forgotForm = reactive({
  email: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

// 方法
async function handleLogin() {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const success = await authStore.login(loginForm.username, loginForm.password)
    
    if (success) {
      // 登录成功后跳转到目标页面
      const redirect = route.query.redirect as string || '/dashboard'
      router.push(redirect)
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  } finally {
    loading.value = false
  }
}

async function refreshCaptcha() {
  try {
    // 这里应该调用获取验证码的API
    // const response = await userApi.getCaptcha()
    // captchaImage.value = response.data.image
    
    // 临时模拟验证码
    captchaImage.value = `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" fill="#f0f0f0"/>
        <text x="10" y="25" font-family="Arial" font-size="16" fill="#333">1234</text>
        <line x1="0" y1="20" x2="120" y2="20" stroke="#ddd" stroke-width="1"/>
      </svg>
    `)}`
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

async function handleForgotPassword() {
  if (!forgotForm.email) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  try {
    // 这里应该调用忘记密码的API
    // await userApi.forgotPassword({ email: forgotForm.email })
    
    ElMessage.success('重置链接已发送到您的邮箱，请查收')
    showForgotPassword.value = false
    forgotForm.email = ''
  } catch (error) {
    console.error('发送重置链接失败:', error)
  }
}

// 生命周期
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 400px;
  max-width: 90vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 32px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.captcha-image:hover {
  border-color: #409eff;
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  color: #c0c4cc;
  font-size: 18px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
  margin-bottom: 16px;
}

.system-info {
  color: #c0c4cc;
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-box {
    width: 100%;
    max-width: 350px;
    padding: 30px 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .captcha-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .captcha-image {
    width: 100%;
    height: 40px;
  }
}
</style>