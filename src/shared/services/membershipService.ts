import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 會員等級
 */
export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  level: number;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    cardScans: number;
    aiAnalysis: number;
    storage: number;
    apiCalls: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User會員
 */
export interface UserMembership {
  id: string;
  userId: string;
  tierId: string;
  tier: MembershipTier;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  usage: {
    cardScans: number;
    aiAnalysis: number;
    storage: number;
    apiCalls: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 會員權益
 */
export interface MembershipBenefit {
  id: string;
  tierId: string;
  name: string;
  description: string;
  type: 'feature' | 'discount' | 'priority' | 'exclusive';
  value: string | number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Upgrade會員Request
 */
export interface UpgradeMembershipRequest {
  tierId: string;
  paymentMethod?: string;
  autoRenew?: boolean;
}

/**
 * 會員Service
 */
export class MembershipService {
  private readonly baseUrl = '/api/membership';

  /**
   * Get所有會員等級
   */
  async getMembershipTiers(): Promise<any> {
    try {
      logger.info('獲取會員等級列表');

      const _response = await api.get(`${this.baseUrl}/tiers`);

      if (response.success) {
        logger.info('會員等級列表GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '會員等級列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get會員等級列表Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get會員等級列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get會員等級列表時發生Error:', error);
      return {
        success: false,
        message: 'Get會員等級列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get會員等級詳情
   */
  async getMembershipTier(tierId: string): Promise<any> {
    try {
      logger.info('獲取會員等級詳情:', { tierId });

      const _response = await api.get(`${this.baseUrl}/tiers/${tierId}`);

      if (response.success) {
        logger.info('會員等級詳情GetSuccess:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '會員等級詳情GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get會員等級詳情Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get會員等級詳情Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get會員等級詳情時發生Error:', error);
      return {
        success: false,
        message: 'Get會員等級詳情時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser會員Status
   */
  async getUserMembership(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶會員狀態:', { userId });

      const _response = await api.get(`${this.baseUrl}/user/${userId}`);

      if (response.success) {
        logger.info('用戶會員狀態GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶會員狀態GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶會員狀態Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶會員狀態Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶會員狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶會員狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Upgrade會員
   */
  async upgradeMembership(
    userId: string,
    data: UpgradeMembershipRequest
  ): Promise<any> {
    try {
      logger.info('升級會員:', { userId, tierId: data.tierId });

      const _response = await api.post(`${this.baseUrl}/upgrade`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('會員升級Success:', { userId, tierId: data.tierId });
        return {
          success: true,
          data: response.data,
          message: '會員升級Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('會員升級Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '會員升級Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('升級會員時發生Error:', error);
      return {
        success: false,
        message: '升級會員時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Cancel會員
   */
  async cancelMembership(userId: string): Promise<any> {
    try {
      logger.info('取消會員:', { userId });

      const _response = await api.post(`${this.baseUrl}/cancel`, { userId });

      if (response.success) {
        logger.info('會員取消Success:', { userId });
        return {
          success: true,
          message: '會員取消Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消會員Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消會員Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消會員時發生Error:', error);
      return {
        success: false,
        message: '取消會員時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update會員Auto續費Settings
   */
  async updateAutoRenew(userId: string, autoRenew: boolean): Promise<any> {
    try {
      logger.info('更新會員自動續費設置:', { userId, autoRenew });

      const _response = await api.put(`${this.baseUrl}/auto-renew`, {
        userId,
        autoRenew,
      });

      if (response.success) {
        logger.info('自動續費SettingsUpdateSuccess:', { userId, autoRenew });
        return {
          success: true,
          message: '自動續費SettingsUpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update自動續費SettingsFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update自動續費SettingsFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update自動續費Settings時發生Error:', error);
      return {
        success: false,
        message: 'Update自動續費Settings時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get會員權益
   */
  async getMembershipBenefits(tierId: string): Promise<any> {
    try {
      logger.info('獲取會員權益:', { tierId });

      const _response = await api.get(
        `${this.baseUrl}/tiers/${tierId}/benefits`
      );

      if (response.success) {
        logger.info('會員權益GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '會員權益GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get會員權益Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get會員權益Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get會員權益時發生Error:', error);
      return {
        success: false,
        message: 'Get會員權益時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * CheckUser權限
   */
  async checkUserPermission(userId: string, feature: string): Promise<any> {
    try {
      logger.info('檢查用戶權限:', { userId, feature });

      const _response = await api.get(
        `${this.baseUrl}/permissions/${userId}?feature=${feature}`
      );

      if (response.success) {
        logger.info('用戶權限CheckSuccess:', {
          userId,
          feature,
          allowed: (response.data as any)?.allowed,
        });
        return {
          success: true,
          data: response.data,
          message: '用戶權限CheckSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Check用戶權限Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Check用戶權限Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Check用戶權限時發生Error:', error);
      return {
        success: false,
        message: 'Check用戶權限時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser使用量
   */
  async getUserUsage(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶使用量:', { userId });

      const _response = await api.get(`${this.baseUrl}/usage/${userId}`);

      if (response.success) {
        logger.info('用戶使用量GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶使用量GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶使用量Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶使用量Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶使用量時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶使用量時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get會員Service狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'membership',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            tiers: `${this.baseUrl}/tiers`,
            user: `${this.baseUrl}/user/:id`,
            upgrade: `${this.baseUrl}/upgrade`,
            cancel: `${this.baseUrl}/cancel`,
            permissions: `${this.baseUrl}/permissions/:id`,
            usage: `${this.baseUrl}/usage/:id`,
          },
        },
        message: '會員Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get會員Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get會員Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get會員Status
   */
  async getStatus(): Promise<any> {
    try {
      logger.info('獲取會員狀態');

      const _response = await api.get(`${this.baseUrl}/status`);

      if (response.success) {
        logger.info('會員狀態GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '會員狀態GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get會員狀態Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get會員狀態Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get會員狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get會員狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Upgrade會員
   */
  async upgrade(tier: string): Promise<any> {
    try {
      logger.info('升級會員:', { tier });

      const _response = await api.post(`${this.baseUrl}/upgrade`, {
        tierId: tier,
      });

      if (response.success) {
        logger.info('會員升級Success');
        return {
          success: true,
          data: response.data,
          message: '會員升級Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('會員升級Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '會員升級Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('會員升級時發生Error:', error);
      return {
        success: false,
        message: '會員升級時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Begin試用
   */
  async startTrial(): Promise<any> {
    try {
      logger.info('開始試用');

      const _response = await api.post(`${this.baseUrl}/trial/start`);

      if (response.success) {
        logger.info('試用開始Success');
        return {
          success: true,
          data: response.data,
          message: '試用開始Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('開始試用Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '開始試用Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('開始試用時發生Error:', error);
      return {
        success: false,
        message: '開始試用時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Cancel會員
   */
  async cancel(): Promise<any> {
    try {
      logger.info('取消會員');

      const _response = await api.post(`${this.baseUrl}/cancel`);

      if (response.success) {
        logger.info('會員取消Success');
        return {
          success: true,
          data: response.data,
          message: '會員取消Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消會員Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消會員Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消會員時發生Error:', error);
      return {
        success: false,
        message: '取消會員時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check功能使用情況
   */
  async checkFeatureUsage(feature: string): Promise<any> {
    try {
      logger.info('檢查功能使用情況:', { feature });

      const _response = await api.get(`${this.baseUrl}/usage/${feature}`);

      if (response.success) {
        logger.info('功能使用情況CheckSuccess');
        return {
          success: true,
          data: response.data,
          message: '功能使用情況CheckSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Check功能使用情況Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Check功能使用情況Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Check功能使用情況時發生Error:', error);
      return {
        success: false,
        message: 'Check功能使用情況時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 使用功能
   */
  async useFeature(feature: string): Promise<any> {
    try {
      logger.info('使用功能:', { feature });

      const _response = await api.post(`${this.baseUrl}/usage/${feature}`);

      if (response.success) {
        logger.info('功能使用Success');
        return {
          success: true,
          data: response.data,
          message: '功能使用Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('使用功能Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '使用功能Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('使用功能時發生Error:', error);
      return {
        success: false,
        message: '使用功能時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

export const _membershipService = new MembershipService();
