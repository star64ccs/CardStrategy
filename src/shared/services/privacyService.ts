import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 隱私Settings
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
 * DataRequest
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
 * 隱私政策Agree
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
 * Update隱私SettingsRequest
 */
export interface UpdatePrivacySettingsRequest {
  profileVisibility?: PrivacySettings['profileVisibility'];
  dataSharing?: Partial<PrivacySettings['dataSharing']>;
  notifications?: Partial<PrivacySettings['notifications']>;
  dataRetention?: Partial<PrivacySettings['dataRetention']>;
}

/**
 * CreateDataRequest
 */
export interface CreateDataRequestRequest {
  type: DataRequest['type'];
  description: string;
}

/**
 * 隱私Service
 */
export class PrivacyService {
  private readonly baseUrl = '/api/privacy';

  /**
   * GetUser隱私Settings
   */
  async getPrivacySettings(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶隱私設置:', { userId });

      const _response = await api.get(`${this.baseUrl}/settings/${userId}`);

      if (response.success) {
        logger.info('用戶隱私SettingsGetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶隱私SettingsGetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶隱私SettingsFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶隱私SettingsFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶隱私Settings時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶隱私Settings時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update隱私Settings
   */
  async updatePrivacySettings(
    userId: string,
    data: UpdatePrivacySettingsRequest
  ): Promise<any> {
    try {
      logger.info('更新隱私設置:', { userId, updates: data });

      const _response = await api.put(
        `${this.baseUrl}/settings/${userId}`,
        data
      );

      if (response.success) {
        logger.info('隱私SettingsUpdateSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私SettingsUpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update隱私SettingsFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update隱私SettingsFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update隱私Settings時發生Error:', error);
      return {
        success: false,
        message: 'Update隱私Settings時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * CreateDataRequest
   */
  async createDataRequest(
    userId: string,
    data: CreateDataRequestRequest
  ): Promise<any> {
    try {
      logger.info('創建數據請求:', { userId, type: data.type });

      const _response = await api.post(`${this.baseUrl}/data-requests`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('數據請求CreateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '數據請求CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Create數據請求Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Create數據請求Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create數據請求時發生Error:', error);
      return {
        success: false,
        message: 'Create數據請求時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUserDataRequestList
   */
  async getUserDataRequests(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶數據請求列表:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/data-requests/user/${userId}`
      );

      if (response.success) {
        logger.info('用戶數據請求列表GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶數據請求列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶數據請求列表Failed:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || 'Get用戶數據請求列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶數據請求列表時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶數據請求列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetDataRequest詳情
   */
  async getDataRequest(requestId: string): Promise<any> {
    try {
      logger.info('獲取數據請求詳情:', { requestId });

      const _response = await api.get(
        `${this.baseUrl}/data-requests/${requestId}`
      );

      if (response.success) {
        logger.info('數據請求詳情GetSuccess:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '數據請求詳情GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get數據請求詳情Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get數據請求詳情Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get數據請求詳情時發生Error:', error);
      return {
        success: false,
        message: 'Get數據請求詳情時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * CancelDataRequest
   */
  async cancelDataRequest(requestId: string): Promise<any> {
    try {
      logger.info('取消數據請求:', { requestId });

      const _response = await api.delete(
        `${this.baseUrl}/data-requests/${requestId}`
      );

      if (response.success) {
        logger.info('數據請求取消Success:', { requestId });
        return {
          success: true,
          message: '數據請求取消Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消數據請求Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消數據請求Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消數據請求時發生Error:', error);
      return {
        success: false,
        message: '取消數據請求時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Record隱私政策Agree
   */
  async recordPrivacyConsent(
    userId: string,
    policyVersion: string,
    consentType: PrivacyConsent['consentType'] = 'explicit'
  ): Promise<any> {
    try {
      logger.info('記錄隱私政策同意:', { userId, policyVersion, consentType });

      const _response = await api.post(`${this.baseUrl}/consent`, {
        userId,
        policyVersion,
        consentType,
      });

      if (response.success) {
        logger.info('隱私政策同意記錄Success:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '隱私政策同意記錄Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('記錄隱私政策同意Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '記錄隱私政策同意Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('記錄隱私政策同意時發生Error:', error);
      return {
        success: false,
        message: '記錄隱私政策同意時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser隱私政策AgreeRecord
   */
  async getUserPrivacyConsents(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶隱私政策同意記錄:', { userId });

      const _response = await api.get(`${this.baseUrl}/consent/user/${userId}`);

      if (response.success) {
        logger.info('用戶隱私政策同意記錄GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶隱私政策同意記錄GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶隱私政策同意記錄Failed:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || 'Get用戶隱私政策同意記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶隱私政策同意記錄時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶隱私政策同意記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * DeleteUserData
   */
  async deleteUserData(userId: string, dataTypes?: string[]): Promise<any> {
    try {
      logger.info('刪除用戶數據:', { userId, dataTypes });

      const _response = await api.post(`${this.baseUrl}/delete-data`, {
        userId,
        dataTypes: dataTypes || ['all'],
      });

      if (response.success) {
        logger.info('用戶數據DeleteSuccess:', { userId });
        return {
          success: true,
          message: '用戶數據DeleteSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Delete用戶數據Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Delete用戶數據Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Delete用戶數據時發生Error:', error);
      return {
        success: false,
        message: 'Delete用戶數據時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetData使用Report
   */
  async getDataUsageReport(userId: string): Promise<any> {
    try {
      logger.info('獲取數據使用報告:', { userId });

      const _response = await api.get(`${this.baseUrl}/data-usage/${userId}`);

      if (response.success) {
        logger.info('數據使用報告GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據使用報告GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get數據使用報告Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get數據使用報告Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get數據使用報告時發生Error:', error);
      return {
        success: false,
        message: 'Get數據使用報告時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get隱私Service狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

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
        message: '隱私Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get隱私Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get隱私Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get隱私SettingsConfigure
   */
  async getPrivacySettingsConfig(region: string): Promise<any> {
    try {
      logger.info('獲取隱私設置配置:', { region });

      const _response = await api.get(
        `${this.baseUrl}/settings/config/${region}`
      );

      if (response.success) {
        logger.info('隱私SettingsConfigureGetSuccess:', { region });
        return {
          success: true,
          data: response.data,
          message: '隱私SettingsConfigureGetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get隱私SettingsConfigureFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get隱私SettingsConfigureFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get隱私SettingsConfigure時發生Error:', error);
      return {
        success: false,
        message: 'Get隱私SettingsConfigure時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchUpdateAgree
   */
  async batchUpdateConsent(userId: string, consents: unknown[]): Promise<any> {
    try {
      logger.info('批量更新同意:', { userId, consentCount: consents.length });

      const _response = await api.post(`${this.baseUrl}/consent/batch`, {
        userId,
        consents,
      });

      if (response.success) {
        logger.info('批量Update同意Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '批量Update同意Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量Update同意Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量Update同意Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量Update同意時發生Error:', error);
      return {
        success: false,
        message: '批量Update同意時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get隱私Preferences
   */
  async getPrivacyPreferences(userId: string): Promise<any> {
    try {
      logger.info('獲取隱私偏好:', { userId });

      const _response = await api.get(`${this.baseUrl}/preferences/${userId}`);

      if (response.success) {
        logger.info('隱私偏好GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私偏好GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get隱私偏好Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get隱私偏好Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get隱私偏好時發生Error:', error);
      return {
        success: false,
        message: 'Get隱私偏好時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update隱私Preferences
   */
  async updatePrivacyPreferences(
    userId: string,
    preferences: unknown
  ): Promise<any> {
    try {
      logger.info('更新隱私偏好:', { userId, preferences });

      const _response = await api.put(
        `${this.baseUrl}/preferences/${userId}`,
        preferences
      );

      if (response.success) {
        logger.info('隱私偏好UpdateSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私偏好UpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update隱私偏好Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update隱私偏好Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update隱私偏好時發生Error:', error);
      return {
        success: false,
        message: 'Update隱私偏好時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * RecordAgree
   */
  async recordConsent(userId: string, consentData: unknown): Promise<any> {
    try {
      logger.info('記錄同意:', { userId, consentData });

      const _response = await api.post(`${this.baseUrl}/consent/record`, {
        userId,
        ...consentData,
      });

      if (response.success) {
        logger.info('同意記錄Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意記錄Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('記錄同意Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '記錄同意Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('記錄同意時發生Error:', error);
      return {
        success: false,
        message: '記錄同意時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 撤回Agree
   */
  async withdrawConsent(userId: string, purpose: string): Promise<any> {
    try {
      logger.info('撤回同意:', { userId, purpose });

      const _response = await api.post(`${this.baseUrl}/consent/withdraw`, {
        userId,
        purpose,
      });

      if (response.success) {
        logger.info('同意撤回Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意撤回Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('撤回同意Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '撤回同意Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('撤回同意時發生Error:', error);
      return {
        success: false,
        message: '撤回同意時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetAgree歷史
   */
  async getConsentHistory(userId: string): Promise<any> {
    try {
      logger.info('獲取同意歷史:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/consent/history/${userId}`
      );

      if (response.success) {
        logger.info('同意歷史GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get同意歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get同意歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get同意歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get同意歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * SubmitData權利Request
   */
  async submitDataRightsRequest(
    userId: string,
    requestData: unknown
  ): Promise<any> {
    try {
      logger.info('提交數據權利請求:', { userId, requestData });

      const _response = await api.post(`${this.baseUrl}/data-rights/request`, {
        userId,
        ...requestData,
      });

      if (response.success) {
        logger.info('數據權利請求提交Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據權利請求提交Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('提交數據權利請求Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '提交數據權利請求Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('提交數據權利請求時發生Error:', error);
      return {
        success: false,
        message: '提交數據權利請求時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetData權利Request歷史
   */
  async getDataRightsRequestHistory(userId: string): Promise<any> {
    try {
      logger.info('獲取數據權利請求歷史:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/data-rights/history/${userId}`
      );

      if (response.success) {
        logger.info('數據權利請求歷史GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '數據權利請求歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get數據權利請求歷史Failed:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || 'Get數據權利請求歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get數據權利請求歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get數據權利請求歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get隱私法要求
   */
  async getPrivacyLawRequirements(region: string): Promise<any> {
    try {
      logger.info('獲取隱私法要求:', { region });

      const _response = await api.get(`${this.baseUrl}/privacy-laws/${region}`);

      if (response.success) {
        logger.info('隱私法要求GetSuccess:', { region });
        return {
          success: true,
          data: response.data,
          message: '隱私法要求GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get隱私法要求Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get隱私法要求Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get隱私法要求時發生Error:', error);
      return {
        success: false,
        message: 'Get隱私法要求時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * VerifyAge
   */
  async verifyAge(userId: string, birthDate: string): Promise<any> {
    try {
      logger.info('驗證年齡:', { userId, birthDate });

      const _response = await api.post(`${this.baseUrl}/age-verification`, {
        userId,
        birthDate,
      });

      if (response.success) {
        logger.info('年齡VerifySuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '年齡VerifySuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('年齡VerifyFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || '年齡VerifyFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('年齡Verify時發生Error:', error);
      return {
        success: false,
        message: '年齡Verify時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Request家長Agree
   */
  async requestParentalConsent(
    userId: string,
    parentEmail: string
  ): Promise<any> {
    try {
      logger.info('請求家長同意:', { userId, parentEmail });

      const _response = await api.post(`${this.baseUrl}/parental-consent`, {
        userId,
        parentEmail,
      });

      if (response.success) {
        logger.info('家長同意請求Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '家長同意請求Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('請求家長同意Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '請求家長同意Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('請求家長同意時發生Error:', error);
      return {
        success: false,
        message: '請求家長同意時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * ExportUserData
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      logger.info('導出用戶數據:', { userId });

      const _response = await api.get(`${this.baseUrl}/export/${userId}`);

      if (response.success) {
        logger.info('用戶數據導出Success:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶數據導出Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('導出用戶數據Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '導出用戶數據Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('導出用戶數據時發生Error:', error);
      return {
        success: false,
        message: '導出用戶數據時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check隱私合規性
   */
  async checkPrivacyCompliance(userId: string, region: string): Promise<any> {
    try {
      logger.info('檢查隱私合規性:', { userId, region });

      const _response = await api.post(`${this.baseUrl}/compliance/check`, {
        userId,
        region,
      });

      if (response.success) {
        logger.info('隱私合規性CheckSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私合規性CheckSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Check隱私合規性Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Check隱私合規性Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Check隱私合規性時發生Error:', error);
      return {
        success: false,
        message: 'Check隱私合規性時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get隱私儀Table板
   */
  async getPrivacyDashboard(userId: string): Promise<any> {
    try {
      logger.info('獲取隱私儀表板:', { userId });

      const _response = await api.get(`${this.baseUrl}/dashboard/${userId}`);

      if (response.success) {
        logger.info('隱私儀表板GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '隱私儀表板GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get隱私儀表板Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get隱私儀表板Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get隱私儀表板時發生Error:', error);
      return {
        success: false,
        message: 'Get隱私儀表板時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * CheckAgreeUpdate
   */
  async checkConsentRenewal(userId: string): Promise<any> {
    try {
      logger.info('檢查同意更新:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/consent/renewal/${userId}`
      );

      if (response.success) {
        logger.info('同意UpdateCheckSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '同意UpdateCheckSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Check同意UpdateFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Check同意UpdateFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Check同意Update時發生Error:', error);
      return {
        success: false,
        message: 'Check同意Update時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

export const _privacyService = new PrivacyService();
