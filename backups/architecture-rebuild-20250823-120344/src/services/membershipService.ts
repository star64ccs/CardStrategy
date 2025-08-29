import { apiService } from './apiService';
import { MembershipStatus, FeatureUsage } from '@/types';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  MembershipStatusSchema,
  MembershipUsageSchema,
  MembershipLimitsSchema,
  MembershipFeaturesSchema,
} from '../utils/validationSchemas';
import { z } from 'zod';

// 升級會員請求驗證模式
const UpgradeMembershipRequestSchema = z.object({
  tier: z.enum(['trial', 'premium', 'vip'], {
    errorMap: () => ({ message: '無效的會員等級' }),
  }),
});

class MembershipService {
  // 獲取會員狀態
  async getStatus(): Promise<MembershipStatus> {
    try {
      const response =
        await apiService.get<MembershipStatus>('/membership/status');
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 升級會員
  async upgrade(tier: string): Promise<MembershipStatus> {
    try {
      const validationResult = validateInput(UpgradeMembershipRequestSchema, {
        tier,
      });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '升級參數驗證失敗');
      }
      const response = await apiService.post<MembershipStatus>(
        '/membership/upgrade',
        {
          tier: validationResult.data!.tier,
        }
      );
      const responseValidation = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 開始試用
  async startTrial(): Promise<MembershipStatus> {
    try {
      const response = await apiService.post<MembershipStatus>(
        '/membership/trial/start'
      );
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 取消試用
  async cancelTrial(): Promise<MembershipStatus> {
    try {
      const response = await apiService.post<MembershipStatus>(
        '/membership/trial/cancel'
      );
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 檢查功能使用量
  async checkFeatureUsage(feature: string): Promise<{ usage: FeatureUsage }> {
    try {
      const validationResult = validateInput(
        z.object({
          feature: z.string().min(1, '功能名稱不能為空'),
        }),
        { feature }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '功能名稱驗證失敗');
      }
      const response = await apiService.get<{ usage: FeatureUsage }>(
        `/membership/features/${validationResult.data!.feature}/usage`
      );
      const responseValidation = validateApiResponse(
        z.object({
          usage: MembershipUsageSchema,
        }),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '功能使用量數據驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 使用功能
  async useFeature(feature: string): Promise<{ usage: FeatureUsage }> {
    try {
      const validationResult = validateInput(
        z.object({
          feature: z.string().min(1, '功能名稱不能為空'),
        }),
        { feature }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '功能名稱驗證失敗');
      }
      const response = await apiService.post<{ usage: FeatureUsage }>(
        `/membership/features/${validationResult.data!.feature}/use`
      );
      const responseValidation = validateApiResponse(
        z.object({
          usage: MembershipUsageSchema,
        }),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '功能使用量數據驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取會員權益
  async getBenefits(): Promise<{
    free: string[];
    trial: string[];
    vip: string[];
  }> {
    try {
      const response = await apiService.get<{
        free: string[];
        trial: string[];
        vip: string[];
      }>('/membership/benefits');
      const validationResult = validateApiResponse(
        z.object({
          free: z.array(z.string()),
          trial: z.array(z.string()),
          vip: z.array(z.string()),
        }),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員權益數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取功能限制
  async getLimits(): Promise<{
    cardRecognition: number;
    conditionAnalysis: number;
    authenticityCheck: number;
    pricePrediction: number;
    aiChat: number;
  }> {
    try {
      const response = await apiService.get<{
        cardRecognition: number;
        conditionAnalysis: number;
        authenticityCheck: number;
        pricePrediction: number;
        aiChat: number;
      }>('/membership/limits');
      const validationResult = validateApiResponse(
        MembershipLimitsSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '功能限制數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取可用功能
  async getAvailableFeatures(): Promise<{
    cardRecognition: boolean;
    conditionAnalysis: boolean;
    authenticityCheck: boolean;
    pricePrediction: boolean;
    aiChat: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    exclusiveContent: boolean;
  }> {
    try {
      const response = await apiService.get<{
        cardRecognition: boolean;
        conditionAnalysis: boolean;
        authenticityCheck: boolean;
        pricePrediction: boolean;
        aiChat: boolean;
        advancedAnalytics: boolean;
        prioritySupport: boolean;
        exclusiveContent: boolean;
      }>('/membership/features');
      const validationResult = validateApiResponse(
        MembershipFeaturesSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '可用功能數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 檢查功能是否可用
  async isFeatureAvailable(feature: string): Promise<boolean> {
    try {
      const validationResult = validateInput(
        z.object({
          feature: z.string().min(1, '功能名稱不能為空'),
        }),
        { feature }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '功能名稱驗證失敗');
      }
      const response = await apiService.get<{ available: boolean }>(
        `/membership/features/${validationResult.data!.feature}/available`
      );
      const responseValidation = validateApiResponse(
        z.object({
          available: z.boolean(),
        }),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '功能可用性數據驗證失敗'
        );
      }
      return responseValidation.data!.available;
    } catch (error) {
      throw error;
    }
  }

  // 獲取試用狀態
  async getTrialStatus(): Promise<{
    isActive: boolean;
    endDate: string | null;
    daysRemaining: number;
  }> {
    try {
      const response = await apiService.get<{
        isActive: boolean;
        endDate: string | null;
        daysRemaining: number;
      }>('/membership/trial/status');
      const validationResult = validateApiResponse(
        z.object({
          isActive: z.boolean(),
          endDate: z.string().nullable(),
          daysRemaining: z.number().int().min(0),
        }),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '試用狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 續費會員
  async renew(): Promise<MembershipStatus> {
    try {
      const response =
        await apiService.post<MembershipStatus>('/membership/renew');
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 取消會員
  async cancel(): Promise<MembershipStatus> {
    try {
      const response =
        await apiService.post<MembershipStatus>('/membership/cancel');
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 暫停會員
  async pause(): Promise<MembershipStatus> {
    try {
      const response =
        await apiService.post<MembershipStatus>('/membership/pause');
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 恢復會員
  async resume(): Promise<MembershipStatus> {
    try {
      const response =
        await apiService.post<MembershipStatus>('/membership/resume');
      const validationResult = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取付款歷史
  async getPaymentHistory(): Promise<
    {
      id: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      description: string;
    }[]
  > {
    try {
      const response = await apiService.get<
        {
          id: string;
          amount: number;
          currency: string;
          status: string;
          date: string;
          description: string;
        }[]
      >('/membership/payments');
      const validationResult = validateApiResponse(
        z.array(
          z.object({
            id: z.string().uuid(),
            amount: z.number().positive(),
            currency: z.string().length(3),
            status: z.string(),
            date: z.string(),
            description: z.string(),
          })
        ),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '付款歷史數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取訂閱詳情
  async getSubscriptionDetails(): Promise<{
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    nextBillingDate: string;
  }> {
    try {
      const response = await apiService.get<{
        plan: string;
        status: string;
        startDate: string;
        endDate: string;
        autoRenew: boolean;
        nextBillingDate: string;
      }>('/membership/subscription');
      const validationResult = validateApiResponse(
        z.object({
          plan: z.string(),
          status: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          autoRenew: z.boolean(),
          nextBillingDate: z.string(),
        }),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '訂閱詳情數據驗證失敗'
        );
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新付款方式
  async updatePaymentMethod(paymentMethod: any): Promise<MembershipStatus> {
    try {
      const validationResult = validateInput(
        z.object({
          type: z.enum(['card', 'paypal', 'bank']),
          token: z.string().optional(),
          cardNumber: z.string().optional(),
          expiryMonth: z.number().int().min(1).max(12).optional(),
          expiryYear: z.number().int().min(2024).optional(),
          cvv: z.string().length(3).optional(),
        }),
        paymentMethod
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '付款方式數據驗證失敗'
        );
      }
      const response = await apiService.put<MembershipStatus>(
        '/membership/payment-method',
        validationResult.data
      );
      const responseValidation = validateApiResponse(
        MembershipStatusSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '會員狀態數據驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取發票
  async getInvoices(): Promise<MembershipStatus> {
    try {
      const response = await apiService.get<MembershipStatus>(
        '/membership/invoices'
      );
      const validationResult = validateApiResponse(
        z.array(
          z.object({
            id: z.string().uuid(),
            amount: z.number().positive(),
            currency: z.string().length(3),
            status: z.string(),
            date: z.string(),
            downloadUrl: z.string().url().optional(),
          })
        ),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '發票數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 下載發票
  async downloadInvoice(invoiceId: string): Promise<MembershipStatus> {
    try {
      const validationResult = validateInput(
        z.object({
          invoiceId: z.string().uuid('無效的發票 ID'),
        }),
        { invoiceId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '發票 ID 驗證失敗');
      }
      const response = await apiService.get<MembershipStatus>(
        `/membership/invoices/${validationResult.data!.invoiceId}/download`
      );
      const responseValidation = validateApiResponse(
        z.object({
          downloadUrl: z.string().url(),
          expiresAt: z.string(),
        }),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '下載鏈接數據驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取使用統計
  async getUsageStatistics(): Promise<{
    totalUsage: number;
    monthlyUsage: number;
    weeklyUsage: number;
    dailyUsage: number;
    featureBreakdown: { [key: string]: number };
  }> {
    const response = await apiService.get<{
      totalUsage: number;
      monthlyUsage: number;
      weeklyUsage: number;
      dailyUsage: number;
      featureBreakdown: { [key: string]: number };
    }>('/membership/usage/statistics');
    if (!response.data) {
      throw new Error('獲取使用統計失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取會員統計
  async getMembershipStatistics(): Promise<{
    totalUsers: number;
    freeUsers: number;
    trialUsers: number;
    vipUsers: number;
    conversionRate: number;
    revenue: number;
  }> {
    const response = await apiService.get<{
      totalUsers: number;
      freeUsers: number;
      trialUsers: number;
      vipUsers: number;
      conversionRate: number;
      revenue: number;
    }>('/membership/statistics');
    if (!response.data) {
      throw new Error('獲取會員統計失敗：無效的響應數據');
    }
    return response.data;
  }
}

export { MembershipService };
export const membershipService = new MembershipService();
export default membershipService;
