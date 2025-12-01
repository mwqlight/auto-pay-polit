/**
 * AutoPay Payment Platform - 创建支付订单页面
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <div class="payment-create-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>创建支付订单</h3>
          <el-button text @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="payment-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          
          <el-form-item label="商户订单号" prop="merchantOrderNo">
            <el-input 
              v-model="form.merchantOrderNo" 
              placeholder="请输入商户订单号"
              :disabled="isUpdate"
            >
              <template #append>
                <el-button @click="generateOrderNo" :loading="generating">
                  生成
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="支付金额" prop="amount">
            <el-input-number
              v-model="form.amount"
              :min="0.01"
              :max="999999"
              :precision="2"
              placeholder="请输入支付金额"
              style="width: 200px;"
            />
            <span class="amount-unit">元</span>
          </el-form-item>

          <el-form-item label="支付场景" prop="scene">
            <el-radio-group v-model="form.scene">
              <el-radio-button value="WEB">PC网页</el-radio-button>
              <el-radio-button value="H5">H5页面</el-radio-button>
              <el-radio-button value="APP">移动应用</el-radio-button>
              <el-radio-button value="MINI_APP">小程序</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 渠道配置 -->
        <div class="form-section">
          <h4 class="section-title">渠道配置</h4>
          
          <el-form-item label="支付渠道" prop="channelCode">
            <el-radio-group v-model="form.channelCode">
              <el-radio-button value="">智能推荐</el-radio-button>
              <el-radio-button value="WECHAT">微信支付</el-radio-button>
              <el-radio-button value="ALIPAY">支付宝</el-radio-button>
              <el-radio-button value="UNIONPAY">银联支付</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="回调地址" prop="notifyUrl">
            <el-input 
              v-model="form.notifyUrl" 
              placeholder="请输入支付结果回调地址"
            />
          </el-form-item>

          <el-form-item label="返回地址" prop="returnUrl">
            <el-input 
              v-model="form.returnUrl" 
              placeholder="支付完成后跳转地址"
            />
          </el-form-item>
        </div>

        <!-- 扩展参数 -->
        <div class="form-section">
          <h4 class="section-title">扩展参数</h4>
          
          <el-form-item label="附加数据">
            <el-input
              v-model="form.attachData"
              type="textarea"
              :rows="2"
              placeholder="可选的附加数据"
            />
          </el-form-item>

          <el-form-item label="订单过期时间">
            <el-date-picker
              v-model="form.expireTime"
              type="datetime"
              placeholder="选择过期时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disablePastDate"
              style="width: 240px;"
            />
            <el-text size="small" type="info">不设置则使用默认过期时间</el-text>
          </el-form-item>

          <el-form-item label="业务类型">
            <el-select v-model="form.businessType" placeholder="选择业务类型" style="width: 200px;">
              <el-option label="电商购物" value="ECOMMERCE" />
              <el-option label="游戏充值" value="GAME" />
              <el-option label="服务费" value="SERVICE_FEE" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 智能推荐 -->
        <div class="form-section" v-if="!form.channelCode">
          <h4 class="section-title">智能推荐</h4>
          
          <div class="channel-recommendations">
            <el-card 
              v-for="channel in recommendedChannels" 
              :key="channel.code"
              class="channel-card"
              :class="{ recommended: channel.isRecommended }"
              @click="selectChannel(channel.code)"
            >
              <div class="channel-header">
                <div class="channel-info">
                  <h5>{{ channel.name }}</h5>
                  <p class="channel-desc">{{ channel.description }}</p>
                </div>
                <div class="channel-stats">
                  <div class="stat-item">
                    <span class="label">成功率</span>
                    <span class="value">{{ channel.successRate }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">费率</span>
                    <span class="value">{{ channel.feeRate }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="channel-footer" v-if="channel.isRecommended">
                <el-tag type="success" size="small">
                  <el-icon><Star /></el-icon>
                  推荐
                </el-tag>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button @click="handlePreview">
            预览
          </el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            创建订单
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="订单预览"
      width="600px"
      center
    >
      <div class="preview-content">
        <div class="preview-item">
          <span class="label">商户订单号:</span>
          <span class="value">{{ form.merchantOrderNo }}</span>
        </div>
        <div class="preview-item">
          <span class="label">支付金额:</span>
          <span class="value amount">¥{{ formatCurrency(form.amount) }}</span>
        </div>
        <div class="preview-item">
          <span class="label">支付渠道:</span>
          <span class="value">{{ getChannelName(form.channelCode || 'AUTO') }}</span>
        </div>
        <div class="preview-item">
          <span class="label">支付场景:</span>
          <span class="value">{{ getSceneText(form.scene) }}</span>
        </div>
        <div class="preview-item">
          <span class="label">商品描述:</span>
          <span class="value">{{ form.description }}</span>
        </div>
        <div class="preview-item" v-if="form.notifyUrl">
          <span class="label">回调地址:</span>
          <span class="value">{{ form.notifyUrl }}</span>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showPreview = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Star } from '@element-plus/icons-vue'
import { usePaymentStore } from '@/store/payment'
import type { CreatePaymentRequest } from '@/types'

const router = useRouter()
const paymentStore = usePaymentStore()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const generating = ref(false)
const showPreview = ref(false)
const isUpdate = ref(false)

// 表单数据
const form = reactive<CreatePaymentRequest>({
  merchantOrderNo: '',
  amount: 0,
  scene: 'WEB',
  description: '',
  channelCode: '', // 空表示智能推荐
  notifyUrl: '',
  returnUrl: '',
  attachData: '',
  expireTime: '',
  businessType: ''
})

// 表单验证规则
const rules: FormRules = {
  merchantOrderNo: [
    { required: true, message: '请输入商户订单号', trigger: 'blur' },
    { min: 8, max: 32, message: '订单号长度在 8 到 32 个字符', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入支付金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '支付金额不能小于0.01', trigger: 'blur' }
  ],
  scene: [
    { required: true, message: '请选择支付场景', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  channelCode: [],
  notifyUrl: [
    { type: 'url', message: '请输入有效的回调地址', trigger: 'blur' }
  ],
  returnUrl: [
    { type: 'url', message: '请输入有效的返回地址', trigger: 'blur' }
  ]
}

// 推荐渠道数据
const recommendedChannels = computed(() => [
  {
    code: 'WECHAT',
    name: '微信支付',
    description: '适合移动端支付，用户体验优秀',
    successRate: 99.2,
    feeRate: 0.6,
    isRecommended: form.scene === 'APP' || form.scene === 'MINI_APP'
  },
  {
    code: 'ALIPAY',
    name: '支付宝',
    description: '覆盖面广，支持多种场景',
    successRate: 98.8,
    feeRate: 0.55,
    isRecommended: form.scene === 'H5' || form.scene === 'WEB'
  },
  {
    code: 'UNIONPAY',
    name: '银联支付',
    description: '支持银行卡直连，安全可靠',
    successRate: 97.5,
    feeRate: 0.5,
    isRecommended: form.amount > 1000
  }
])

// 方法
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const result = await paymentStore.createPaymentOrder(form)
    
    if (result) {
      ElMessage.success('支付订单创建成功')
      router.push(`/payments/detail/${result.id}`)
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置为默认值
  form.merchantOrderNo = ''
  form.amount = 0
  form.scene = 'WEB'
  form.description = ''
  form.channelCode = ''
  form.notifyUrl = ''
  form.returnUrl = ''
  form.attachData = ''
  form.expireTime = ''
  form.businessType = ''
}

function handlePreview() {
  showPreview.value = true
}

function selectChannel(code: string) {
  form.channelCode = code
}

async function generateOrderNo() {
  try {
    generating.value = true
    
    // 模拟生成订单号
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    form.merchantOrderNo = `ORD${timestamp}${random}`
    
    ElMessage.success('订单号生成成功')
  } catch (error) {
    console.error('生成订单号失败:', error)
  } finally {
    generating.value = false
  }
}

function disablePastDate(date: Date) {
  return date.getTime() < Date.now()
}

function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

function getChannelName(code: string): string {
  const channelMap: Record<string, string> = {
    'WECHAT': '微信支付',
    'ALIPAY': '支付宝',
    'UNIONPAY': '银联支付',
    'AUTO': '智能推荐'
  }
  return channelMap[code] || code
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
  // 预填充一些默认值
  form.notifyUrl = 'https://your-domain.com/api/payment/notify'
  form.returnUrl = 'https://your-domain.com/payment/result'
})
</script>

<style scoped>
.payment-create-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.payment-form {
  max-width: 800px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 8px;
}

.amount-unit {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.channel-recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.channel-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.channel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.channel-card.recommended {
  border-color: #67c23a;
  background: #f0f9ff;
}

.channel-card.recommended:hover {
  border-color: #409eff;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.channel-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.channel-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.channel-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item .label {
  font-size: 12px;
  color: #909399;
}

.stat-item .value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.channel-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.form-actions {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #ebeef5;
  margin-top: 32px;
}

.preview-content {
  padding: 16px 0;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.preview-item .value {
  font-size: 14px;
  color: #303133;
  text-align: right;
  word-break: break-all;
}

.preview-item .value.amount {
  font-weight: 600;
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }
  
  .channel-recommendations {
    grid-template-columns: 1fr;
  }
  
  .channel-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .channel-stats {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .preview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .preview-item .value {
    text-align: left;
  }
}
</style>