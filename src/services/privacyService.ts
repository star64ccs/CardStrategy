import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import {
  PrivacyPreferences,
  ConsentRecord,
  DataRightsRequest,
  PrivacyLawRequirement,
  RegionCode,
  DataProcessingPurpose,
  ConsentType,
  LegalBasis,
  PrivacySettingsConfig
} from '../types/privacy';

class PrivacyService {
  private baseUrl = '/privacy';

  // 獲取用戶隱私偏好
  async getPrivacyPreferences(userId: string): Promise<PrivacyPreferences> {
    try {
      const response = await apiService.get(`${this.baseUrl}/preferences/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取隱私偏好失敗', { userId, error });
      throw error;
    }
  }

  // 更新隱私偏好
  async updatePrivacyPreferences(
    userId: string,
    preferences: Partial<PrivacyPreferences>
  ): Promise<PrivacyPreferences> {
    try {
      const response = await apiService.put(`${this.baseUrl}/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      logger.error('更新隱私偏好失敗', { userId, error });
      throw error;
    }
  }

  // 記錄同意
  async recordConsent(
    userId: string,
    consentData: {
      consentType: ConsentType;
      purpose: DataProcessingPurpose;
      legalBasis: LegalBasis;
      region: RegionCode;
      language: string;
      consentMethod: 'web' | 'mobile' | 'email' | 'phone' | 'in_person';
      consentVersion: string;
    }
  ): Promise<ConsentRecord> {
    try {
      const response = await apiService.post(`${this.baseUrl}/consent`, {
        userId,
        ...consentData,
        grantedAt: new Date(),
        isActive: true
      });
      return response.data;
    } catch (error) {
      logger.error('記錄同意失敗', { userId, error });
      throw error;
    }
  }

  // 撤回同意
  async withdrawConsent(
    userId: string,
    purpose: DataProcessingPurpose
  ): Promise<ConsentRecord> {
    try {
      const response = await apiService.post(`${this.baseUrl}/consent/withdraw`, {
        userId,
        purpose,
        withdrawnAt: new Date()
      });
      return response.data;
    } catch (error) {
      logger.error('撤回同意失敗', { userId, purpose, error });
      throw error;
    }
  }

  // 獲取同意歷史
  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/consent/history/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取同意歷史失敗', { userId, error });
      throw error;
    }
  }

  // 提交數據權利請求
  async submitDataRightsRequest(
    userId: string,
    requestData: {
      requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }
  ): Promise<DataRightsRequest> {
    try {
      const response = await apiService.post(`${this.baseUrl}/rights-request`, {
        userId,
        ...requestData,
        status: 'pending',
        deadline: this.calculateDeadline(requestData.priority)
      });
      return response.data;
    } catch (error) {
      logger.error('提交數據權利請求失敗', { userId, error });
      throw error;
    }
  }

  // 獲取數據權利請求狀態
  async getDataRightsRequestStatus(requestId: string): Promise<DataRightsRequest> {
    try {
      const response = await apiService.get(`${this.baseUrl}/rights-request/${requestId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取數據權利請求狀態失敗', { requestId, error });
      throw error;
    }
  }

  // 獲取用戶數據權利請求歷史
  async getDataRightsRequestHistory(userId: string): Promise<DataRightsRequest[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/rights-request/history/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取數據權利請求歷史失敗', { userId, error });
      throw error;
    }
  }

  // 獲取地區隱私法律要求
  async getPrivacyLawRequirements(region: RegionCode): Promise<PrivacyLawRequirement[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/laws/${region}`);
      return response.data;
    } catch (error) {
      logger.error('獲取隱私法律要求失敗', { region, error });
      throw error;
    }
  }

  // 獲取隱私設置配置
  async getPrivacySettingsConfig(region: RegionCode): Promise<PrivacySettingsConfig> {
    try {
      const response = await apiService.get(`${this.baseUrl}/config/${region}`);
      return response.data;
    } catch (error) {
      logger.error('獲取隱私設置配置失敗', { region, error });
      throw error;
    }
  }

  // 驗證年齡
  async verifyAge(userId: string, birthDate: Date): Promise<{
    isMinor: boolean;
    age: number;
    requiresParentalConsent: boolean;
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/age-verification`, {
        userId,
        birthDate
      });
      return response.data;
    } catch (error) {
      logger.error('年齡驗證失敗', { userId, error });
      throw error;
    }
  }

  // 請求父母同意
  async requestParentalConsent(
    userId: string,
    parentEmail: string
  ): Promise<{
    requestId: string;
    status: 'pending' | 'sent' | 'verified' | 'rejected';
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/parental-consent`, {
        userId,
        parentEmail
      });
      return response.data;
    } catch (error) {
      logger.error('請求父母同意失敗', { userId, error });
      throw error;
    }
  }

  // 導出用戶數據
  async exportUserData(userId: string): Promise<{
    downloadUrl: string;
    expiresAt: Date;
    format: 'json' | 'csv' | 'xml';
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/export/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('導出用戶數據失敗', { userId, error });
      throw error;
    }
  }

  // 刪除用戶數據
  async deleteUserData(userId: string): Promise<{
    status: 'pending' | 'processing' | 'completed';
    estimatedCompletion: Date;
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/delete/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('刪除用戶數據失敗', { userId, error });
      throw error;
    }
  }

  // 獲取數據處理記錄
  async getDataProcessingRecords(userId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/processing-records/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取數據處理記錄失敗', { userId, error });
      throw error;
    }
  }

  // 獲取第三方數據處理者列表
  async getThirdPartyProcessors(): Promise<any[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/third-party-processors`);
      return response.data;
    } catch (error) {
      logger.error('獲取第三方數據處理者失敗', { error });
      throw error;
    }
  }

  // 獲取隱私政策版本
  async getPrivacyPolicyVersion(
    region: RegionCode,
    language: string
  ): Promise<any> {
    try {
      const response = await apiService.get(`${this.baseUrl}/privacy-policy`, {
        params: { region, language }
      });
      return response.data;
    } catch (error) {
      logger.error('獲取隱私政策失敗', { region, language, error });
      throw error;
    }
  }

  // 檢查隱私合規性
  async checkPrivacyCompliance(
    userId: string,
    region: RegionCode
  ): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/compliance-check`, {
        userId,
        region
      });
      return response.data;
    } catch (error) {
      logger.error('檢查隱私合規性失敗', { userId, region, error });
      throw error;
    }
  }

  // 發送隱私通知
  async sendPrivacyNotification(
    userId: string,
    notificationType: 'policy_update' | 'consent_change' | 'data_breach' | 'legal_update',
    message: string
  ): Promise<{
    sent: boolean;
    notificationId: string;
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/notifications`, {
        userId,
        type: notificationType,
        message
      });
      return response.data;
    } catch (error) {
      logger.error('發送隱私通知失敗', { userId, notificationType, error });
      throw error;
    }
  }

  // 本地存儲隱私偏好
  async savePrivacyPreferencesLocally(preferences: PrivacyPreferences): Promise<void> {
    try {
      await storage.setItem('privacy_preferences', JSON.stringify(preferences));
    } catch (error) {
      logger.error('本地保存隱私偏好失敗', { error });
    }
  }

  // 從本地獲取隱私偏好
  async getPrivacyPreferencesLocally(): Promise<PrivacyPreferences | null> {
    try {
      const data = await storage.getItem('privacy_preferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('本地獲取隱私偏好失敗', { error });
      return null;
    }
  }

  // 計算數據權利請求截止日期
  private calculateDeadline(priority: 'low' | 'medium' | 'high' | 'urgent'): Date {
    const now = new Date();
    const days = {
      low: 30,
      medium: 15,
      high: 7,
      urgent: 3
    };

    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + days[priority]);
    return deadline;
  }

  // 獲取用戶當前地區
  private async getUserRegion(): Promise<RegionCode> {
    try {
      // 可以通過 IP 地址或用戶設置來確定地區
      const response = await apiService.get('/user/region');
      return response.data.region;
    } catch (error) {
      // 默認返回歐盟
      return 'EU';
    }
  }

  // 檢查是否需要重新同意
  async checkConsentRenewal(userId: string): Promise<{
    needsRenewal: boolean;
    reasons: string[];
    purposes: DataProcessingPurpose[];
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/consent/renewal-check/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('檢查同意更新失敗', { userId, error });
      throw error;
    }
  }

  // 批量更新同意
  async batchUpdateConsent(
    userId: string,
    consents: {
      purpose: DataProcessingPurpose;
      consented: boolean;
      legalBasis: LegalBasis;
    }[]
  ): Promise<ConsentRecord[]> {
    try {
      const response = await apiService.post(`${this.baseUrl}/consent/batch-update`, {
        userId,
        consents
      });
      return response.data;
    } catch (error) {
      logger.error('批量更新同意失敗', { userId, error });
      throw error;
    }
  }

  // 獲取隱私儀表板數據
  async getPrivacyDashboard(userId: string): Promise<{
    consentSummary: {
      total: number;
      active: number;
      expired: number;
      withdrawn: number;
    };
    dataRightsSummary: {
      pending: number;
      completed: number;
      rejected: number;
    };
    complianceScore: number;
    lastUpdated: Date;
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/dashboard/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取隱私儀表板失敗', { userId, error });
      throw error;
    }
  }
}

export const privacyService = new PrivacyService();
