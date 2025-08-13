import { apiService } from './apiService';
import { MembershipStatus, FeatureUsage } from '@/types';

class MembershipService {
  // 獲取會員狀態
  async getStatus(): Promise<MembershipStatus> {
    const response = await apiService.get<MembershipStatus>('/membership/status');
    if (!response.data) {
      throw new Error('獲取會員狀態失敗：無效的響應數據');
    }
    return response.data;
  }

  // 升級會員
  async upgrade(tier: string): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/upgrade', { tier });
    if (!response.data) {
      throw new Error('升級會員失敗：無效的響應數據');
    }
    return response.data;
  }

  // 開始試用
  async startTrial(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/trial/start');
    if (!response.data) {
      throw new Error('開始試用失敗：無效的響應數據');
    }
    return response.data;
  }

  // 取消試用
  async cancelTrial(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/trial/cancel');
    if (!response.data) {
      throw new Error('取消試用失敗：無效的響應數據');
    }
    return response.data;
  }

  // 檢查功能使用量
  async checkFeatureUsage(feature: string): Promise<{ usage: FeatureUsage }> {
    const response = await apiService.get<{ usage: FeatureUsage }>(`/membership/features/${feature}/usage`);
    if (!response.data) {
      throw new Error('檢查功能使用量失敗：無效的響應數據');
    }
    return response.data;
  }

  // 使用功能
  async useFeature(feature: string): Promise<{ usage: FeatureUsage }> {
    const response = await apiService.post<{ usage: FeatureUsage }>(`/membership/features/${feature}/use`);
    if (!response.data) {
      throw new Error('使用功能失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取會員權益
  async getBenefits(): Promise<{
    free: string[];
    trial: string[];
    vip: string[];
  }> {
    const response = await apiService.get<{
      free: string[];
      trial: string[];
      vip: string[];
    }>('/membership/benefits');
    if (!response.data) {
      throw new Error('獲取會員權益失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取功能限制
  async getLimits(): Promise<{
    cardRecognition: number;
    conditionAnalysis: number;
    authenticityCheck: number;
    pricePrediction: number;
    aiChat: number;
  }> {
    const response = await apiService.get<{
      cardRecognition: number;
      conditionAnalysis: number;
      authenticityCheck: number;
      pricePrediction: number;
      aiChat: number;
    }>('/membership/limits');
    if (!response.data) {
      throw new Error('獲取功能限制失敗：無效的響應數據');
    }
    return response.data;
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
    if (!response.data) {
      throw new Error('獲取可用功能失敗：無效的響應數據');
    }
    return response.data;
  }

  // 檢查功能是否可用
  async isFeatureAvailable(feature: string): Promise<boolean> {
    const response = await apiService.get<{ available: boolean }>(`/membership/features/${feature}/available`);
    if (!response.data) {
      throw new Error('檢查功能可用性失敗：無效的響應數據');
    }
    return response.data.available;
  }

  // 獲取試用狀態
  async getTrialStatus(): Promise<{
    isActive: boolean;
    endDate: string | null;
    daysRemaining: number;
  }> {
    const response = await apiService.get<{
      isActive: boolean;
      endDate: string | null;
      daysRemaining: number;
    }>('/membership/trial/status');
    if (!response.data) {
      throw new Error('獲取試用狀態失敗：無效的響應數據');
    }
    return response.data;
  }

  // 續費會員
  async renew(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/renew');
    if (!response.data) {
      throw new Error('續費會員失敗：無效的響應數據');
    }
    return response.data;
  }

  // 取消會員
  async cancel(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/cancel');
    if (!response.data) {
      throw new Error('取消會員失敗：無效的響應數據');
    }
    return response.data;
  }

  // 暫停會員
  async pause(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/pause');
    if (!response.data) {
      throw new Error('暫停會員失敗：無效的響應數據');
    }
    return response.data;
  }

  // 恢復會員
  async resume(): Promise<MembershipStatus> {
    const response = await apiService.post<MembershipStatus>('/membership/resume');
    if (!response.data) {
      throw new Error('恢復會員失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取付款歷史
  async getPaymentHistory(): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    description: string;
  }[]> {
    const response = await apiService.get<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      description: string;
    }[]>('/membership/payments');
    if (!response.data) {
      throw new Error('獲取付款歷史失敗：無效的響應數據');
    }
    return response.data;
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
    const response = await apiService.get<{
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      autoRenew: boolean;
      nextBillingDate: string;
    }>('/membership/subscription');
    if (!response.data) {
      throw new Error('獲取訂閱詳情失敗：無效的響應數據');
    }
    return response.data;
  }

  // 更新付款方式
  async updatePaymentMethod(paymentMethod: any): Promise<MembershipStatus> {
    const response = await apiService.put<MembershipStatus>('/membership/payment-method', paymentMethod);
    if (!response.data) {
      throw new Error('更新付款方式失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取發票
  async getInvoices(): Promise<MembershipStatus> {
    const response = await apiService.get<MembershipStatus>('/membership/invoices');
    if (!response.data) {
      throw new Error('獲取發票失敗：無效的響應數據');
    }
    return response.data;
  }

  // 下載發票
  async downloadInvoice(invoiceId: string): Promise<MembershipStatus> {
    const response = await apiService.get<MembershipStatus>(`/membership/invoices/${invoiceId}/download`);
    if (!response.data) {
      throw new Error('下載發票失敗：無效的響應數據');
    }
    return response.data;
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

export const membershipService = new MembershipService();
export default membershipService;
