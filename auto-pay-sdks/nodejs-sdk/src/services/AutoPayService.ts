import { HttpClient } from '../http/Client';
import { 
  ApiResponse, 
  PaymentCallback,
  Environment
} from '../types';
import { 
  PaymentResponse, 
  PaymentResponseData
} from '../models/PaymentResponse';
import { 
  CreatePaymentRequest,
  CreatePaymentRequestBuilder
} from '../models/CreatePaymentRequest';
import { 
  QueryPaymentRequest,
  RefundPaymentRequest
} from '../models/QueryPaymentRequest';
import { 
  ChannelInfo, 
  Statistics, 
  HealthCheckResult,
  PaginatedResponse,
  ErrorInfo
} from '../types';

/**
 * AutoPay 服务类
 */
export class AutoPayService {
  private readonly client: HttpClient;
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(client: HttpClient, secretKey?: string) {
    this.client = client;
    this.baseUrl = this.getBaseUrlFromClient();
    this.secretKey = secretKey || '';
  }

  /**
   * 获取客户端的base URL
   */
  private getBaseUrlFromClient(): string {
    // 这里需要从client获取baseURL，但为了简化，我们假设它是已知的
    return this.client.getInstance().defaults.baseURL;
  }

  /**
   * ===== 支付相关API =====
   */

  /**
   * 创建支付
   */
  public async createPayment(request: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.post('/payments', request.toJSON());
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 查询支付
   */
  public async queryPayment(request: QueryPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const queryParams = request.toQueryParams();
      const response = await this.client.get('/payments', { params: queryParams });
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取支付列表
   */
  public async getPayments(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>> {
    try {
      const response = await this.client.get('/payments', { params });
      const paginatedData = response.data as any;
      
      // 转换支付响应数据
      const payments = (paginatedData.data?.items || []).map((item: PaymentResponseData) => 
        PaymentResponse.create(item)
      );
      
      return {
        ...response,
        data: {
          items: payments,
          total: paginatedData.data?.total || 0,
          page: paginatedData.data?.page || 1,
          size: paginatedData.data?.size || 10,
          pages: paginatedData.data?.pages || 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取支付详情
   */
  public async getPaymentById(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取支付详情（按订单ID）
   */
  public async getPaymentByOrderId(orderId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.get(`/payments/order/${orderId}`);
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 关闭支付
   */
  public async closePayment(paymentId: string, reason?: string): Promise<ApiResponse<void>> {
    try {
      return await this.client.patch(`/payments/${paymentId}/close`, { reason });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 申请退款
   */
  public async refundPayment(paymentId: string, request: RefundPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.post(`/payments/${paymentId}/refund`, request.toJSON());
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取退款列表
   */
  public async getRefunds(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>> {
    try {
      const response = await this.client.get('/refunds', { params });
      const paginatedData = response.data as any;
      
      const refunds = (paginatedData.data?.items || []).map((item: PaymentResponseData) => 
        PaymentResponse.create(item)
      );
      
      return {
        ...response,
        data: {
          items: refunds,
          total: paginatedData.data?.total || 0,
          page: paginatedData.data?.page || 1,
          size: paginatedData.data?.size || 10,
          pages: paginatedData.data?.pages || 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ===== 渠道管理API =====
   */

  /**
   * 获取支付渠道列表
   */
  public async getChannels(): Promise<ApiResponse<ChannelInfo[]>> {
    try {
      return await this.client.get('/channels');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取渠道详情
   */
  public async getChannel(channelCode: string): Promise<ApiResponse<ChannelInfo>> {
    try {
      return await this.client.get(`/channels/${channelCode}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取渠道状态
   */
  public async getChannelStatus(channelCode: string): Promise<ApiResponse<{ enabled: boolean }>> {
    try {
      return await this.client.get(`/channels/${channelCode}/status`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 切换渠道状态
   */
  public async toggleChannelStatus(channelCode: string, enabled: boolean): Promise<ApiResponse<{ enabled: boolean }>> {
    try {
      return await this.client.patch(`/channels/${channelCode}/status`, { enabled });
    } catch (error) {
      throw error;
    }
  }

  /**
   * ===== 账户管理API =====
   */

  /**
   * 获取账户余额
   */
  public async getBalance(): Promise<ApiResponse<{ available: number; frozen: number; total: number }>> {
    try {
      return await this.client.get('/account/balance');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取交易记录
   */
  public async getTransactions(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<PaymentResponse>>> {
    try {
      const response = await this.client.get('/account/transactions', { params });
      const paginatedData = response.data as any;
      
      const transactions = (paginatedData.data?.items || []).map((item: PaymentResponseData) => 
        PaymentResponse.create(item)
      );
      
      return {
        ...response,
        data: {
          items: transactions,
          total: paginatedData.data?.total || 0,
          page: paginatedData.data?.page || 1,
          size: paginatedData.data?.size || 10,
          pages: paginatedData.data?.pages || 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  public async getPaymentStatistics(params: Record<string, any> = {}): Promise<ApiResponse<Statistics>> {
    try {
      return await this.client.get('/statistics/payments', { params });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取日统计
   */
  public async getDailyStatistics(date?: string): Promise<ApiResponse<Statistics>> {
    try {
      const params = date ? { date } : {};
      return await this.client.get('/statistics/daily', { params });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取月统计
   */
  public async getMonthlyStatistics(year: number, month: number): Promise<ApiResponse<Statistics>> {
    try {
      return await this.client.get('/statistics/monthly', { 
        params: { year, month } 
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * ===== 系统管理API =====
   */

  /**
   * 健康检查
   */
  public async healthCheck(): Promise<ApiResponse<HealthCheckResult>> {
    try {
      return await this.client.get('/health');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取版本信息
   */
  public async getVersion(): Promise<ApiResponse<{ sdk: string; api: string; environment: Environment }>> {
    try {
      return await this.client.get('/version');
    } catch (error) {
      throw error;
    }
  }

  /**
   * ===== 回调处理API =====
   */

  /**
   * 处理支付回调
   */
  public async handlePaymentCallback(callbackData: PaymentCallback): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    try {
      // 验证回调签名
      if (!this.verifyCallbackSignature(callbackData, this.secretKey)) {
        return {
          code: 400,
          message: '签名验证失败',
          data: { success: false, message: '签名验证失败' },
          timestamp: Date.now()
        };
      }

      // 处理回调数据
      console.log('处理支付回调:', callbackData);
      
      return {
        code: 200,
        message: '回调处理成功',
        data: { success: true, message: '回调处理成功' },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('处理回调失败:', error);
      return {
        code: 500,
        message: '回调处理失败',
        data: { success: false, message: '回调处理失败' },
        timestamp: Date.now()
      };
    }
  }

  /**
   * 验证回调签名
   */
  public verifyCallbackSignature(callbackData: PaymentCallback, secretKey: string): boolean {
    // 这里应该实现签名验证逻辑
    // 暂时返回true，实际项目中需要根据具体签名算法实现
    return true;
  }

  /**
   * ===== 辅助工具API =====
   */

  /**
   * 验证支付
   */
  public async verifyPayment(paymentId: string): Promise<ApiResponse<{ valid: boolean; payment?: PaymentResponse }>> {
    try {
      const response = await this.client.get(`/payments/${paymentId}/verify`);
      
      if (response.data && response.data.payment) {
        const paymentData = response.data.payment as PaymentResponseData;
        const payment = PaymentResponse.create(paymentData);
        
        return {
          ...response,
          data: {
            valid: response.data.valid,
            payment
          }
        };
      }
      
      return response as ApiResponse<{ valid: boolean; payment?: PaymentResponse }>;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 同步支付状态
   */
  public async syncPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.post(`/payments/${paymentId}/sync`);
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 重试支付
   */
  public async retryPayment(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await this.client.post(`/payments/${paymentId}/retry`);
      const paymentData = response.data as PaymentResponseData;
      const payment = PaymentResponse.create(paymentData);
      
      return {
        ...response,
        data: payment
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取错误信息
   */
  public async getErrorInfo(errorCode: string): Promise<ApiResponse<ErrorInfo>> {
    try {
      return await this.client.get(`/errors/${errorCode}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取支持的钱包类型
   */
  public async getSupportedWallets(): Promise<ApiResponse<string[]>> {
    try {
      return await this.client.get('/wallets');
    } catch (error) {
      throw error;
    }
  }
}