import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 隱私設置
 */
export interface PrivacySettings {
  id: string;
  userId: string;
  profileVisibility: 'public' | 'friends' | 'private';
  dataSharing: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    research: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  dataRetention: {
    scanHistory: number; // days
    searchHistory: number; // days
    activityLogs: number; // days
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 數據請求
 */
export interface DataRequest {
  id: string;
  userId: string;
  type: 'export' | 'deletion' | 'correction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
}

/**
 * 隱私政策同意
 */
export interface PrivacyConsent {
  id: string;
  userId: string;
  policyVersion: string;
  consentDate: Date;
  consentType: 'explicit' | 'implicit';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 更新隱私設置請求
 */
export interface UpdatePrivacySettingsRequest {
  profileVisibility?: PrivacySettings['profileVisibility'];
  dataSharing?: Partial<PrivacySettings['dataSharing']>;
  notifications?: Partial<PrivacySettings['notifications']>;
  dataRetention?: Partial<PrivacySettings['dataRetention']>;
}

/**
 * 創建數據請求
 */
export interface CreateDataRequestRequest {
  type: DataRequest['type'];
  description: string;
}

/**
 * 隱私服務
 */
export class PrivacyService {
  private readonly baseUrl = '/api/privacy';

  /**
   * 獲取用戶隱私設置
   */
  async getPrivacySettings(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶隱私設置:', { userId });

      const response = await api.get(`${this.baseUrl}/settings/${userId}`);

      if (response.success) {
        logger.info('用戶隱私設置獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶隱私設置獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶隱私設置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶隱私設置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶隱私設置時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶隱私設置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新隱私設置
   */
  async updatePrivacySettings(
    userId: string,
    data: UpdatePrivacySettingsRequest
  ): Promise<any> {
    try {
      logger.info('更新隱私設置:', { userId, updates: data });

      const response = await api.put(
        `${this.baseUrl}/settings/${userId}`,
        data
      );

      if (response.success) {
        logger.info('隱私設置更新成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私設置更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新隱私設置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新隱私設置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新隱私設置時發生錯誤:', error);
      return {
        success: false,
        message: '更新隱私設置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 創建數據請求
   */
  async createDataRequest(
    userId: string,
    data: CreateDataRequestRequest
  ): Promise<any> {
    try {
      logger.info('創建數據請求:', { userId, type: data.type });

      const response = await api.post(`${this.baseUrl}/data-requests`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('數據請求創建成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '數據請求創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('創建數據請求失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '創建數據請求失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建數據請求時發生錯誤:', error);
      return {
        success: false,
        message: '創建數據請求時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶數據請求列表
   */
  async getUserDataRequests(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶數據請求列表:', { userId });

      const response = await api.get(
        `${this.baseUrl}/data-requests/user/${userId}`
      );

      if (response.success) {
        logger.info('用戶數據請求列表獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶數據請求列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶數據請求列表失敗:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || '獲取用戶數據請求列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶數據請求列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶數據請求列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取數據請求詳情
   */
  async getDataRequest(requestId: string): Promise<any> {
    try {
      logger.info('獲取數據請求詳情:', { requestId });

      const response = await api.get(
        `${this.baseUrl}/data-requests/${requestId}`
      );

      if (response.success) {
        logger.info('數據請求詳情獲取成功:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '數據請求詳情獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取數據請求詳情失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取數據請求詳情失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取數據請求詳情時發生錯誤:', error);
      return {
        success: false,
        message: '獲取數據請求詳情時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 取消數據請求
   */
  async cancelDataRequest(requestId: string): Promise<any> {
    try {
      logger.info('取消數據請求:', { requestId });

      const response = await api.delete(
        `${this.baseUrl}/data-requests/${requestId}`
      );

      if (response.success) {
        logger.info('數據請求取消成功:', { requestId });
        return {
          success: true,
          message: '數據請求取消成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消數據請求失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消數據請求失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消數據請求時發生錯誤:', error);
      return {
        success: false,
        message: '取消數據請求時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 記錄隱私政策同意
   */
  async recordPrivacyConsent(
    userId: string,
    policyVersion: string,
    consentType: PrivacyConsent['consentType'] = 'explicit'
  ): Promise<any> {
    try {
      logger.info('記錄隱私政策同意:', { userId, policyVersion, consentType });

      const response = await api.post(`${this.baseUrl}/consent`, {
        userId,
        policyVersion,
        consentType,
      });

      if (response.success) {
        logger.info('隱私政策同意記錄成功:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '隱私政策同意記錄成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('記錄隱私政策同意失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '記錄隱私政策同意失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('記錄隱私政策同意時發生錯誤:', error);
      return {
        success: false,
        message: '記錄隱私政策同意時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶隱私政策同意記錄
   */
  async getUserPrivacyConsents(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶隱私政策同意記錄:', { userId });

      const response = await api.get(`${this.baseUrl}/consent/user/${userId}`);

      if (response.success) {
        logger.info('用戶隱私政策同意記錄獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶隱私政策同意記錄獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶隱私政策同意記錄失敗:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || '獲取用戶隱私政策同意記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶隱私政策同意記錄時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶隱私政策同意記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 刪除用戶數據
   */
  async deleteUserData(userId: string, dataTypes?: string[]): Promise<any> {
    try {
      logger.info('刪除用戶數據:', { userId, dataTypes });

      const response = await api.post(`${this.baseUrl}/delete-data`, {
        userId,
        dataTypes: dataTypes || ['all'],
      });

      if (response.success) {
        logger.info('用戶數據刪除成功:', { userId });
        return {
          success: true,
          message: '用戶數據刪除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('刪除用戶數據失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '刪除用戶數據失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('刪除用戶數據時發生錯誤:', error);
      return {
        success: false,
        message: '刪除用戶數據時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取數據使用報告
   */
  async getDataUsageReport(userId: string): Promise<any> {
    try {
      logger.info('獲取數據使用報告:', { userId });

      const response = await api.get(`${this.baseUrl}/data-usage/${userId}`);

      if (response.success) {
        logger.info('數據使用報告獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據使用報告獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取數據使用報告失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取數據使用報告失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取數據使用報告時發生錯誤:', error);
      return {
        success: false,
        message: '獲取數據使用報告時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取隱私服務狀態');

      const response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'privacy',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            settings: `${this.baseUrl}/settings/:userId`,
            dataRequests: `${this.baseUrl}/data-requests`,
            consent: `${this.baseUrl}/consent`,
            deleteData: `${this.baseUrl}/delete-data`,
            dataUsage: `${this.baseUrl}/data-usage/:userId`,
          },
        },
        message: '隱私服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取隱私服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取隱私服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取隱私設置配置
   */
  async getPrivacySettingsConfig(region: string): Promise<any> {
    try {
      logger.info('獲取隱私設置配置:', { region });

      const response = await api.get(
        `${this.baseUrl}/settings/config/${region}`
      );

      if (response.success) {
        logger.info('隱私設置配置獲取成功:', { region });
        return {
          success: true,
          data: response.data,
          message: '隱私設置配置獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取隱私設置配置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取隱私設置配置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取隱私設置配置時發生錯誤:', error);
      return {
        success: false,
        message: '獲取隱私設置配置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量更新同意
   */
  async batchUpdateConsent(userId: string, consents: unknown[]): Promise<any> {
    try {
      logger.info('批量更新同意:', { userId, consentCount: consents.length });

      const response = await api.post(`${this.baseUrl}/consent/batch`, {
        userId,
        consents,
      });

      if (response.success) {
        logger.info('批量更新同意成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '批量更新同意成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量更新同意失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量更新同意失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量更新同意時發生錯誤:', error);
      return {
        success: false,
        message: '批量更新同意時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取隱私偏好
   */
  async getPrivacyPreferences(userId: string): Promise<any> {
    try {
      logger.info('獲取隱私偏好:', { userId });

      const response = await api.get(`${this.baseUrl}/preferences/${userId}`);

      if (response.success) {
        logger.info('隱私偏好獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私偏好獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取隱私偏好失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取隱私偏好失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取隱私偏好時發生錯誤:', error);
      return {
        success: false,
        message: '獲取隱私偏好時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新隱私偏好
   */
  async updatePrivacyPreferences(
    userId: string,
    preferences: unknown
  ): Promise<any> {
    try {
      logger.info('更新隱私偏好:', { userId, preferences });

      const response = await api.put(
        `${this.baseUrl}/preferences/${userId}`,
        preferences
      );

      if (response.success) {
        logger.info('隱私偏好更新成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私偏好更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新隱私偏好失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新隱私偏好失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新隱私偏好時發生錯誤:', error);
      return {
        success: false,
        message: '更新隱私偏好時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 記錄同意
   */
  async recordConsent(userId: string, consentData: unknown): Promise<any> {
    try {
      logger.info('記錄同意:', { userId, consentData });

      const response = await api.post(`${this.baseUrl}/consent/record`, {
        userId,
        ...consentData,
      });

      if (response.success) {
        logger.info('同意記錄成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意記錄成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('記錄同意失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '記錄同意失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('記錄同意時發生錯誤:', error);
      return {
        success: false,
        message: '記錄同意時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 撤回同意
   */
  async withdrawConsent(userId: string, purpose: string): Promise<any> {
    try {
      logger.info('撤回同意:', { userId, purpose });

      const response = await api.post(`${this.baseUrl}/consent/withdraw`, {
        userId,
        purpose,
      });

      if (response.success) {
        logger.info('同意撤回成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意撤回成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('撤回同意失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '撤回同意失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('撤回同意時發生錯誤:', error);
      return {
        success: false,
        message: '撤回同意時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取同意歷史
   */
  async getConsentHistory(userId: string): Promise<any> {
    try {
      logger.info('獲取同意歷史:', { userId });

      const response = await api.get(
        `${this.baseUrl}/consent/history/${userId}`
      );

      if (response.success) {
        logger.info('同意歷史獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取同意歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取同意歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取同意歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取同意歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 提交數據權利請求
   */
  async submitDataRightsRequest(
    userId: string,
    requestData: unknown
  ): Promise<any> {
    try {
      logger.info('提交數據權利請求:', { userId, requestData });

      const response = await api.post(`${this.baseUrl}/data-rights/request`, {
        userId,
        ...requestData,
      });

      if (response.success) {
        logger.info('數據權利請求提交成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據權利請求提交成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('提交數據權利請求失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '提交數據權利請求失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('提交數據權利請求時發生錯誤:', error);
      return {
        success: false,
        message: '提交數據權利請求時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取數據權利請求歷史
   */
  async getDataRightsRequestHistory(userId: string): Promise<any> {
    try {
      logger.info('獲取數據權利請求歷史:', { userId });

      const response = await api.get(
        `${this.baseUrl}/data-rights/history/${userId}`
      );

      if (response.success) {
        logger.info('數據權利請求歷史獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據權利請求歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取數據權利請求歷史失敗:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || '獲取數據權利請求歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取數據權利請求歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取數據權利請求歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取隱私法要求
   */
  async getPrivacyLawRequirements(region: string): Promise<any> {
    try {
      logger.info('獲取隱私法要求:', { region });

      const response = await api.get(`${this.baseUrl}/privacy-laws/${region}`);

      if (response.success) {
        logger.info('隱私法要求獲取成功:', { region });
        return {
          success: true,
          data: response.data,
          message: '隱私法要求獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取隱私法要求失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取隱私法要求失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取隱私法要求時發生錯誤:', error);
      return {
        success: false,
        message: '獲取隱私法要求時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 驗證年齡
   */
  async verifyAge(userId: string, birthDate: string): Promise<any> {
    try {
      logger.info('驗證年齡:', { userId, birthDate });

      const response = await api.post(`${this.baseUrl}/age-verification`, {
        userId,
        birthDate,
      });

      if (response.success) {
        logger.info('年齡驗證成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '年齡驗證成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('年齡驗證失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '年齡驗證失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('年齡驗證時發生錯誤:', error);
      return {
        success: false,
        message: '年齡驗證時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 請求家長同意
   */
  async requestParentalConsent(
    userId: string,
    parentEmail: string
  ): Promise<any> {
    try {
      logger.info('請求家長同意:', { userId, parentEmail });

      const response = await api.post(`${this.baseUrl}/parental-consent`, {
        userId,
        parentEmail,
      });

      if (response.success) {
        logger.info('家長同意請求成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '家長同意請求成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('請求家長同意失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '請求家長同意失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('請求家長同意時發生錯誤:', error);
      return {
        success: false,
        message: '請求家長同意時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 導出用戶數據
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      logger.info('導出用戶數據:', { userId });

      const response = await api.get(`${this.baseUrl}/export/${userId}`);

      if (response.success) {
        logger.info('用戶數據導出成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶數據導出成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('導出用戶數據失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '導出用戶數據失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('導出用戶數據時發生錯誤:', error);
      return {
        success: false,
        message: '導出用戶數據時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 檢查隱私合規性
   */
  async checkPrivacyCompliance(userId: string, region: string): Promise<any> {
    try {
      logger.info('檢查隱私合規性:', { userId, region });

      const response = await api.post(`${this.baseUrl}/compliance/check`, {
        userId,
        region,
      });

      if (response.success) {
        logger.info('隱私合規性檢查成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私合規性檢查成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('檢查隱私合規性失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '檢查隱私合規性失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('檢查隱私合規性時發生錯誤:', error);
      return {
        success: false,
        message: '檢查隱私合規性時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取隱私儀表板
   */
  async getPrivacyDashboard(userId: string): Promise<any> {
    try {
      logger.info('獲取隱私儀表板:', { userId });

      const response = await api.get(`${this.baseUrl}/dashboard/${userId}`);

      if (response.success) {
        logger.info('隱私儀表板獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私儀表板獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取隱私儀表板失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取隱私儀表板失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取隱私儀表板時發生錯誤:', error);
      return {
        success: false,
        message: '獲取隱私儀表板時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 檢查同意更新
   */
  async checkConsentRenewal(userId: string): Promise<any> {
    try {
      logger.info('檢查同意更新:', { userId });

      const response = await api.get(
        `${this.baseUrl}/consent/renewal/${userId}`
      );

      if (response.success) {
        logger.info('同意更新檢查成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意更新檢查成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('檢查同意更新失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '檢查同意更新失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('檢查同意更新時發生錯誤:', error);
      return {
        success: false,
        message: '檢查同意更新時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

export const privacyService = new PrivacyService();
