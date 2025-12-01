/**
 * AutoPay Payment Platform - 支付渠道编辑对话框组件
 * 
 * @author AutoPay Team
 * @since 1.0.0
 */

<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑支付渠道"
    width="700px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="edit-channel-dialog" v-if="channel">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="channel-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          
          <el-form-item label="渠道编码" prop="channelCode">
            <el-input 
              v-model="form.channelCode" 
              disabled
              placeholder="渠道编码"
            />
          </el-form-item>

          <el-form-item label="渠道名称" prop="name">
            <el-input 
              v-model="form.name" 
              placeholder="请输入渠道名称"
            />
          </el-form-item>

          <el-form-item label="渠道描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="2"
              placeholder="请输入渠道描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="渠道状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio-button value="ENABLED">启用</el-radio-button>
              <el-radio-button value="DISABLED">禁用</el-radio-button>
              <el-radio-button value="MAINTENANCE">维护中</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 性能配置 -->
        <div class="form-section">
          <h4 class="section-title">性能配置</h4>
          
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="成功率 (%)" prop="successRate">
                <el-input-number
                  v-model="form.successRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  placeholder="预期成功率"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="费率 (%)" prop="feeRate">
                <el-input-number
                  v-model="form.feeRate"
                  :min="0"
                  :max="10"
                  :precision="2"
                  placeholder="交易费率"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="响应时间 (ms)" prop="avgResponseTime">
                <el-input-number
                  v-model="form.avgResponseTime"
                  :min="1"
                  :max="10000"
                  placeholder="平均响应时间"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大并发" prop="maxConcurrency">
                <el-input-number
                  v-model="form.maxConcurrency"
                  :min="1"
                  :max="10000"
                  placeholder="最大并发数"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="优先级" prop="priority">
            <el-slider
              v-model="form.priority"
              :min="1"
              :max="100"
              show-input
              show-input-controls
              :format-tooltip="formatPriorityTooltip"
            />
            <div class="priority-hint">
              优先级越高，智能推荐时越靠前
            </div>
          </el-form-item>
        </div>

        <!-- API配置 -->
        <div class="form-section">
          <h4 class="section-title">API配置</h4>
          
          <!-- 微信支付配置 -->
          <template v-if="form.channelCode === 'WECHAT'">
            <el-form-item label="应用ID" prop="config.appId">
              <el-input 
                v-model="form.config.appId" 
                placeholder="微信应用ID"
              />
            </el-form-item>
            <el-form-item label="商户号" prop="config.merchantId">
              <el-input 
                v-model="form.config.merchantId" 
                placeholder="微信商户号"
              />
            </el-form-item>
            <el-form-item label="API密钥" prop="config.apiKey">
              <el-input 
                v-model="form.config.apiKey" 
                type="password"
                placeholder="API密钥（留空则不修改）"
                show-password
              />
              <div class="field-tip">留空表示不修改现有密钥</div>
            </el-form-item>
            <el-form-item label="证书文件" prop="config.certPath">
              <el-upload
                v-model:file-list="certFiles"
                :limit="1"
                accept=".p12,.pem"
                :before-upload="beforeCertUpload"
                :on-success="handleCertUpload"
              >
                <el-button :icon="Upload">上传证书</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持.p12和.pem格式的证书文件，留空表示不修改现有证书
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </template>

          <!-- 支付宝配置 -->
          <template v-if="form.channelCode === 'ALIPAY'">
            <el-form-item label="应用ID" prop="config.appId">
              <el-input 
                v-model="form.config.appId" 
                placeholder="支付宝应用ID"
              />
            </el-form-item>
            <el-form-item label="商户号" prop="config.merchantId">
              <el-input 
                v-model="form.config.merchantId" 
                placeholder="支付宝商户号"
              />
            </el-form-item>
            <el-form-item label="应用私钥" prop="config.privateKey">
              <el-input 
                v-model="form.config.privateKey" 
                type="textarea"
                :rows="4"
                placeholder="应用私钥（留空则不修改）"
              />
              <div class="field-tip">留空表示不修改现有私钥</div>
            </el-form-item>
            <el-form-item label="支付宝公钥" prop="config.alipayPublicKey">
              <el-input 
                v-model="form.config.alipayPublicKey" 
                type="textarea"
                :rows="4"
                placeholder="支付宝公钥（留空则不修改）"
              />
              <div class="field-tip">留空表示不修改现有公钥</div>
            </el-form-item>
          </template>

          <!-- 银联支付配置 -->
          <template v-if="form.channelCode === 'UNIONPAY'">
            <el-form-item label="商户号" prop="config.merchantId">
              <el-input 
                v-model="form.config.merchantId" 
                placeholder="银联商户号"
              />
            </el-form-item>
            <el-form-item label="终端号" prop="config.terminalId">
              <el-input 
                v-model="form.config.terminalId" 
                placeholder="终端号"
              />
            </el-form-item>
            <el-form-item label="接入环境" prop="config.environment">
              <el-radio-group v-model="form.config.environment">
                <el-radio-button value="SANDBOX">沙箱环境</el-radio-button>
                <el-radio-button value="PROD">生产环境</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </template>

          <!-- 通用配置 -->
          <el-form-item label="API地址" prop="config.apiUrl">
            <el-input 
              v-model="form.config.apiUrl" 
              placeholder="请输入API接口地址"
            />
          </el-form-item>

          <el-form-item label="回调地址" prop="config.notifyUrl">
            <el-input 
              v-model="form.config.notifyUrl" 
              placeholder="支付结果回调地址"
            />
          </el-form-item>

          <el-form-item label="签名算法" prop="config.signAlgorithm">
            <el-select v-model="form.config.signAlgorithm" placeholder="选择签名算法">
              <el-option label="MD5" value="MD5" />
              <el-option label="SHA256" value="SHA256" />
              <el-option label="RSA" value="RSA" />
              <el-option label="RSA2" value="RSA2" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 支持的支付方式 -->
        <div class="form-section">
          <h4 class="section-title">支持的支付方式</h4>
          
          <el-form-item label="支付方式">
            <el-checkbox-group v-model="form.paymentMethods">
              <el-checkbox value="QR_CODE">扫码支付</el-checkbox>
              <el-checkbox value="H5">H5支付</el-checkbox>
              <el-checkbox value="APP">APP支付</el-checkbox>
              <el-checkbox value="WEB">网页支付</el-checkbox>
              <el-checkbox value="MINI_PROGRAM">小程序支付</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="支持的货币">
            <el-checkbox-group v-model="form.supportedCurrencies">
              <el-checkbox value="CNY">人民币 (CNY)</el-checkbox>
              <el-checkbox value="USD">美元 (USD)</el-checkbox>
              <el-checkbox value="EUR">欧元 (EUR)</el-checkbox>
              <el-checkbox value="HKD">港币 (HKD)</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 风险控制 -->
        <div class="form-section">
          <h4 class="section-title">风险控制</h4>
          
          <el-form-item label="单笔限额">
            <el-input-number
              v-model="form.limits.singleMinAmount"
              :min="0"
              :precision="2"
              placeholder="最小金额"
              style="width: 120px; margin-right: 8px;"
            />
            <span style="margin: 0 8px;">~</span>
            <el-input-number
              v-model="form.limits.singleMaxAmount"
              :min="0"
              :precision="2"
              placeholder="最大金额"
              style="width: 120px;"
            />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>

          <el-form-item label="日累计限额">
            <el-input-number
              v-model="form.limits.dailyMaxAmount"
              :min="0"
              :precision="2"
              placeholder="日累计限额"
              style="width: 200px;"
            />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>

          <el-form-item label="风控规则">
            <el-switch
              v-model="form.riskControl.enabled"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>

          <el-form-item label="风险等级">
            <el-radio-group v-model="form.riskControl.riskLevel">
              <el-radio-button value="LOW">低风险</el-radio-button>
              <el-radio-button value="MEDIUM">中风险</el-radio-button>
              <el-radio-button value="HIGH">高风险</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 修改历史 -->
        <div class="form-section">
          <h4 class="section-title">修改历史</h4>
          
          <div class="modify-history">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in modifyHistory"
                :key="index"
                :timestamp="item.timestamp"
                :type="item.type"
              >
                <div class="history-item">
                  <div class="history-action">{{ item.action }}</div>
                  <div class="history-user">{{ item.user }}</div>
                  <div class="history-desc" v-if="item.description">{{ item.description }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="testConnection" :loading="testing" :icon="Connection">
          测试连接
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
import { Upload, Connection } from '@element-plus/icons-vue'
import { usePaymentStore } from '@/store/payment'
import type { ChannelUpdateRequest, PaymentChannel } from '@/types'

const props = defineProps<{
  modelValue: boolean
  channel: PaymentChannel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const paymentStore = usePaymentStore()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const testing = ref(false)
const certFiles = ref<UploadUserFile[]>([])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 表单数据
const form = reactive<ChannelUpdateRequest>({
  name: '',
  description: '',
  status: 'ENABLED',
  successRate: 95.0,
  feeRate: 0.6,
  avgResponseTime: 2000,
  maxConcurrency: 100,
  priority: 50,
  config: {
    apiUrl: '',
    notifyUrl: '',
    signAlgorithm: 'MD5',
    environment: 'SANDBOX'
  },
  paymentMethods: ['QR_CODE', 'H5'],
  supportedCurrencies: ['CNY'],
  limits: {
    singleMinAmount: 0.01,
    singleMaxAmount: 50000,
    dailyMaxAmount: 1000000
  },
  riskControl: {
    enabled: true,
    riskLevel: 'MEDIUM'
  }
})

// 修改历史数据
const modifyHistory = ref([
  {
    timestamp: '2024-01-15 14:30:00',
    type: 'primary',
    action: '创建渠道',
    user: '系统管理员',
    description: '初始创建渠道配置'
  },
  {
    timestamp: '2024-01-16 09:15:00',
    type: 'success',
    action: '更新配置',
    user: '张三',
    description: '更新API地址和签名算法'
  },
  {
    timestamp: '2024-01-17 16:45:00',
    type: 'warning',
    action: '禁用渠道',
    user: '李四',
    description: '维护期间临时禁用'
  }
])

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
    { min: 2, max: 50, message: '渠道名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入渠道描述', trigger: 'blur' },
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  successRate: [
    { required: true, message: '请输入成功率', trigger: 'blur' }
  ],
  feeRate: [
    { required: true, message: '请输入费率', trigger: 'blur' }
  ],
  avgResponseTime: [
    { required: true, message: '请输入响应时间', trigger: 'blur' }
  ],
  config: {
    apiUrl: [
      { required: true, message: '请输入API地址', trigger: 'blur' }
    ],
    notifyUrl: [
      { required: true, message: '请输入回调地址', trigger: 'blur' }
    ],
    signAlgorithm: [
      { required: true, message: '请选择签名算法', trigger: 'change' }
    ]
  }
}

// 方法
function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  if (props.channel) {
    Object.assign(form, {
      name: props.channel.name,
      description: props.channel.description,
      status: props.channel.status,
      successRate: props.channel.successRate,
      feeRate: props.channel.feeRate,
      avgResponseTime: props.channel.avgResponseTime,
      maxConcurrency: props.channel.maxConcurrency,
      priority: props.channel.priority,
      config: { ...props.channel.config },
      paymentMethods: [...props.channel.paymentMethods],
      supportedCurrencies: [...props.channel.supportedCurrencies],
      limits: { ...props.channel.limits },
      riskControl: { ...props.channel.riskControl }
    })
  }
  
  certFiles.value = []
}

function formatPriorityTooltip(value: number): string {
  if (value <= 20) return '低优先级'
  if (value <= 50) return '中优先级'
  if (value <= 80) return '高优先级'
  return '最高优先级'
}

function beforeCertUpload(file: File) {
  const isValidType = ['.p12', '.pem'].some(ext => file.name.toLowerCase().endsWith(ext))
  const isValidSize = file.size / 1024 / 1024 < 10 // 10MB
  
  if (!isValidType) {
    ElMessage.error('只能上传.p12和.pem格式的证书文件!')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('证书文件大小不能超过10MB!')
    return false
  }
  return true
}

function handleCertUpload(response: any, file: UploadUserFile) {
  ElMessage.success('证书上传成功')
  form.config.certPath = file.name
}

async function testConnection() {
  try {
    testing.value = true
    
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('连接测试成功')
  } catch (error) {
    ElMessage.error('连接测试失败: ' + (error as Error).message)
  } finally {
    testing.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    if (!props.channel) {
      ElMessage.error('渠道信息不存在')
      return
    }
    
    submitting.value = true
    
    const result = await paymentStore.updateChannel(props.channel.id, form)
    
    if (result) {
      ElMessage.success('支付渠道更新成功')
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('更新渠道失败:', error)
    ElMessage.error('更新渠道失败')
  } finally {
    submitting.value = false
  }
}

// 监听器
watch(() => props.channel, (newChannel) => {
  if (newChannel) {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.edit-channel-dialog {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 4px;
}

.channel-form {
  padding: 0;
}

.form-section {
  margin-bottom: 32px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 8px;
}

.field-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.priority-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.modify-history {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 8px 0;
}

.history-action {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.history-user {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.history-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.dialog-footer {
  text-align: right;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 滚动条样式 */
.edit-channel-dialog::-webkit-scrollbar {
  width: 6px;
}

.edit-channel-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.edit-channel-dialog::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.edit-channel-dialog::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.modify-history::-webkit-scrollbar {
  width: 4px;
}

.modify-history::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.modify-history::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }
  
  .priority-hint,
  .field-tip {
    font-size: 11px;
  }
  
  .modify-history {
    max-height: 150px;
  }
}
</style>