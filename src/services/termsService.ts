import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { notificationService } from './notificationService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import {
  TermsType,
  TermsVersion,
  UserConsent,
  TermsConfig,
  TermsConsentRequest,
  TermsConsentResponse,
  TermsQueryParams,
  TermsStatistics,
  TermsComplianceCheck,
  TermsExportOptions,
  ConsentStatus
} from '../types/terms';

class TermsService {
  private baseUrl = '/terms';
  private config: TermsConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  // 初始化服務
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadConfiguration();
      this.isInitialized = true;
      logger.info('條款同意服務已初始化');
    } catch (error) {
      logger.error('初始化條款同意服務失敗:', error);
      throw error;
    }
  }

  // 獲取默認配置
  private getDefaultConfig(): TermsConfig {
    return {
      requireAllTerms: true,
      allowPartialConsent: false,
      consentExpiryDays: 365,
      showOnFirstLaunch: true,
      showOnUpdate: true,
      showOnLogin: false,
      notifyOnExpiry: true,
      notifyOnUpdate: true,
      requireExplicitConsent: true,
      requireAgeVerification: false,
      minimumAge: 13,
      defaultLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en-US', 'ja-JP']
    };
  }

  // 加載配置
  private async loadConfiguration(): Promise<void> {
    try {
      const config = await storage.get('terms_config');
      if (config) {
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      logger.warn('加載條款配置失敗，使用默認配置:', error);
    }
  }

  // 獲取條款版本
  async getTermsVersion(type: TermsType, language?: string): Promise<TermsVersion> {
    try {
      const params: TermsQueryParams = {
        type,
        language: language || this.config.defaultLanguage,
        status: 'active',
        includeContent: true
      };

      const response = await apiService.get(`${this.baseUrl}/version`, { params });
      return response.data;
    } catch (error) {
      logger.error('獲取條款版本失敗:', { type, language, error });
      throw error;
    }
  }

  // 獲取所有活躍條款
  async getActiveTerms(language?: string): Promise<TermsVersion[]> {
    try {
      const params: TermsQueryParams = {
        language: language || this.config.defaultLanguage,
        status: 'active',
        includeContent: true
      };

      const response = await apiService.get(`${this.baseUrl}/active`, { params });
      return response.data;
    } catch (error) {
      logger.error('獲取活躍條款失敗:', { language, error });
      throw error;
    }
  }

  // 檢查用戶同意狀態
  async checkUserConsent(userId: string): Promise<TermsComplianceCheck> {
    try {
      const response = await apiService.get(`${this.baseUrl}/compliance/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('檢查用戶同意狀態失敗:', { userId, error });
      throw error;
    }
  }

  // 記錄用戶同意
  async recordConsent(request: TermsConsentRequest): Promise<TermsConsentResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/consent`, request);

      if (response.success && response.data) {
        // 更新本地存儲
        await this.updateLocalConsent(userId, request.termsType, response.data.consent);

        // 檢查是否需要通知
        if (response.data.allTermsAccepted) {
          await this.notifyTermsAccepted(userId);
        }
      }

      return response;
    } catch (error) {
      logger.error('記錄用戶同意失敗:', { request, error });
      throw error;
    }
  }

  // 批量同意條款
  async acceptAllTerms(userId: string, language?: string): Promise<TermsConsentResponse> {
    try {
      const activeTerms = await this.getActiveTerms(language);
      const consentRequests: TermsConsentRequest[] = activeTerms.map(terms => ({
        userId,
        termsType: terms.type,
        action: 'accept',
        version: terms.version
      }));

      const response = await apiService.post(`${this.baseUrl}/consent/batch`, {
        userId,
        consents: consentRequests
      });

      if (response.success) {
        // 更新本地存儲
        await this.updateLocalConsents(userId, response.data.consents);

        // 通知條款已接受
        await this.notifyTermsAccepted(userId);
      }

      return response;
    } catch (error) {
      logger.error('批量同意條款失敗:', { userId, error });
      throw error;
    }
  }

  // 獲取用戶同意歷史
  async getUserConsentHistory(userId: string): Promise<UserConsent[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/consent/history/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('獲取用戶同意歷史失敗:', { userId, error });
      throw error;
    }
  }

  // 撤回同意
  async withdrawConsent(userId: string, termsType: TermsType): Promise<TermsConsentResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/consent/withdraw`, {
        userId,
        termsType
      });

      if (response.success) {
        // 更新本地存儲
        await this.updateLocalConsent(userId, termsType, response.data.consent);

        // 通知同意已撤回
        await this.notifyConsentWithdrawn(userId, termsType);
      }

      return response;
    } catch (error) {
      logger.error('撤回同意失敗:', { userId, termsType, error });
      throw error;
    }
  }

  // 檢查條款更新
  async checkTermsUpdates(userId: string): Promise<TermsVersion[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/updates/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('檢查條款更新失敗:', { userId, error });
      throw error;
    }
  }

  // 獲取條款統計
  async getTermsStatistics(): Promise<TermsStatistics> {
    try {
      const response = await apiService.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      logger.error('獲取條款統計失敗:', error);
      throw error;
    }
  }

  // 導出條款數據
  async exportTermsData(options: TermsExportOptions): Promise<any> {
    try {
      const response = await apiService.post(`${this.baseUrl}/export`, options);
      return response.data;
    } catch (error) {
      logger.error('導出條款數據失敗:', { options, error });
      throw error;
    }
  }

  // 更新本地同意記錄
  private async updateLocalConsent(userId: string, termsType: TermsType, consent: UserConsent): Promise<void> {
    try {
      const key = `terms_consent_${userId}_${termsType}`;
      await storage.set(key, consent);
    } catch (error) {
      logger.warn('更新本地同意記錄失敗:', { userId, termsType, error });
    }
  }

  // 批量更新本地同意記錄
  private async updateLocalConsents(userId: string, consents: UserConsent[]): Promise<void> {
    try {
      const updates = consents.map(consent =>
        this.updateLocalConsent(userId, consent.termsType, consent)
      );
      await Promise.all(updates);
    } catch (error) {
      logger.warn('批量更新本地同意記錄失敗:', { userId, error });
    }
  }

  // 通知條款已接受
  private async notifyTermsAccepted(userId: string): Promise<void> {
    try {
      await notificationService.sendNotification({
        userId,
        type: 'terms_accepted',
        title: '條款同意完成',
        message: '您已成功同意所有必要條款，現在可以使用完整功能。',
        data: {
          action: 'terms_accepted',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.warn('發送條款接受通知失敗:', { userId, error });
    }
  }

  // 通知同意已撤回
  private async notifyConsentWithdrawn(userId: string, termsType: TermsType): Promise<void> {
    try {
      await notificationService.sendNotification({
        userId,
        type: 'consent_withdrawn',
        title: '同意已撤回',
        message: `您已撤回對 ${this.getTermsTypeDisplayName(termsType)} 的同意。`,
        data: {
          action: 'consent_withdrawn',
          termsType,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.warn('發送同意撤回通知失敗:', { userId, termsType, error });
    }
  }

  // 獲取條款類型顯示名稱
  private getTermsTypeDisplayName(type: TermsType): string {
    const displayNames = {
      purchase_refund_policy: '購買及退款政策',
      disclaimer: '免責聲明',
      cookie_policy: 'Cookie 政策',
      terms_of_use: '使用條款',
      ai_usage_policy: 'AI 使用政策'
    };
    return displayNames[type] || type;
  }

  // 檢查用戶是否可以訪問應用
  async canUserAccessApp(userId: string): Promise<boolean> {
    try {
      const compliance = await this.checkUserConsent(userId);
      return compliance.canUseApp;
    } catch (error) {
      logger.error('檢查用戶訪問權限失敗:', { userId, error });
      return false;
    }
  }

  // 獲取待處理條款
  async getPendingTerms(userId: string): Promise<TermsVersion[]> {
    try {
      const compliance = await this.checkUserConsent(userId);
      if (compliance.pendingTerms.length === 0) {
        return [];
      }

      const activeTerms = await this.getActiveTerms();
      return activeTerms.filter(terms =>
        compliance.pendingTerms.includes(terms.type)
      );
    } catch (error) {
      logger.error('獲取待處理條款失敗:', { userId, error });
      return [];
    }
  }

  // 獲取配置
  getConfig(): TermsConfig {
    return { ...this.config };
  }

  // 更新配置
  async updateConfig(newConfig: Partial<TermsConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
      await storage.set('terms_config', this.config);
      logger.info('條款配置已更新:', newConfig);
    } catch (error) {
      logger.error('更新條款配置失敗:', { newConfig, error });
      throw error;
    }
  }
}

export const termsService = new TermsService();
