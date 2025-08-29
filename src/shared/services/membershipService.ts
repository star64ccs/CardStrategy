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
 * 用戶會員
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
 * 升級會員請求
 */
export interface UpgradeMembershipRequest {
  tierId: string;
  paymentMethod?: string;
  autoRenew?: boolean;
}

/**
 * 會員服務
 */
export class MembershipService {
  private readonly baseUrl = '/api/membership';

  /**
   * 獲取所有會員等級
   */
  async getMembershipTiers(): Promise<any> {
    try {
      logger.info('獲取會員等級列表');

      const _response = await api.get(`${this.baseUrl}/tiers`);

      if (response.success) {
        logger.info('會員等級列表獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '會員等級列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取會員等級列表失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取會員等級列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取會員等級列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取會員等級列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取會員等級詳情
   */
  async getMembershipTier(tierId: string): Promise<any> {
    try {
      logger.info('獲取會員等級詳情:', { tierId });

      const _response = await api.get(`${this.baseUrl}/tiers/${tierId}`);

      if (response.success) {
        logger.info('會員等級詳情獲取成功:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '會員等級詳情獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取會員等級詳情失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取會員等級詳情失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取會員等級詳情時發生錯誤:', error);
      return {
        success: false,
        message: '獲取會員等級詳情時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶會員狀態
   */
  async getUserMembership(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶會員狀態:', { userId });

      const _response = await api.get(`${this.baseUrl}/user/${userId}`);

      if (response.success) {
        logger.info('用戶會員狀態獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶會員狀態獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶會員狀態失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶會員狀態失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶會員狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶會員狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 升級會員
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
        logger.info('會員升級成功:', { userId, tierId: data.tierId });
        return {
          success: true,
          data: response.data,
          message: '會員升級成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('會員升級失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '會員升級失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('升級會員時發生錯誤:', error);
      return {
        success: false,
        message: '升級會員時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 取消會員
   */
  async cancelMembership(userId: string): Promise<any> {
    try {
      logger.info('取消會員:', { userId });

      const _response = await api.post(`${this.baseUrl}/cancel`, { userId });

      if (response.success) {
        logger.info('會員取消成功:', { userId });
        return {
          success: true,
          message: '會員取消成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消會員失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消會員失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消會員時發生錯誤:', error);
      return {
        success: false,
        message: '取消會員時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新會員自動續費設置
   */
  async updateAutoRenew(userId: string, autoRenew: boolean): Promise<any> {
    try {
      logger.info('更新會員自動續費設置:', { userId, autoRenew });

      const _response = await api.put(`${this.baseUrl}/auto-renew`, {
        userId,
        autoRenew,
      });

      if (response.success) {
        logger.info('自動續費設置更新成功:', { userId, autoRenew });
        return {
          success: true,
          message: '自動續費設置更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新自動續費設置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新自動續費設置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新自動續費設置時發生錯誤:', error);
      return {
        success: false,
        message: '更新自動續費設置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取會員權益
   */
  async getMembershipBenefits(tierId: string): Promise<any> {
    try {
      logger.info('獲取會員權益:', { tierId });

      const _response = await api.get(
        `${this.baseUrl}/tiers/${tierId}/benefits`
      );

      if (response.success) {
        logger.info('會員權益獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '會員權益獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取會員權益失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取會員權益失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取會員權益時發生錯誤:', error);
      return {
        success: false,
        message: '獲取會員權益時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 檢查用戶權限
   */
  async checkUserPermission(userId: string, feature: string): Promise<any> {
    try {
      logger.info('檢查用戶權限:', { userId, feature });

      const _response = await api.get(
        `${this.baseUrl}/permissions/${userId}?feature=${feature}`
      );

      if (response.success) {
        logger.info('用戶權限檢查成功:', {
          userId,
          feature,
          allowed: (response.data as any)?.allowed,
        });
        return {
          success: true,
          data: response.data,
          message: '用戶權限檢查成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('檢查用戶權限失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '檢查用戶權限失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('檢查用戶權限時發生錯誤:', error);
      return {
        success: false,
        message: '檢查用戶權限時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶使用量
   */
  async getUserUsage(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶使用量:', { userId });

      const _response = await api.get(`${this.baseUrl}/usage/${userId}`);

      if (response.success) {
        logger.info('用戶使用量獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '用戶使用量獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶使用量失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶使用量失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶使用量時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶使用量時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取會員服務狀態');

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
        message: '會員服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取會員服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取會員服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取會員狀態
   */
  async getStatus(): Promise<any> {
    try {
      logger.info('獲取會員狀態');

      const _response = await api.get(`${this.baseUrl}/status`);

      if (response.success) {
        logger.info('會員狀態獲取成功');
        return {
          success: true,
          data: response.data,
          message: '會員狀態獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取會員狀態失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取會員狀態失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取會員狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取會員狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 升級會員
   */
  async upgrade(tier: string): Promise<any> {
    try {
      logger.info('升級會員:', { tier });

      const _response = await api.post(`${this.baseUrl}/upgrade`, {
        tierId: tier,
      });

      if (response.success) {
        logger.info('會員升級成功');
        return {
          success: true,
          data: response.data,
          message: '會員升級成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('會員升級失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '會員升級失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('會員升級時發生錯誤:', error);
      return {
        success: false,
        message: '會員升級時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 開始試用
   */
  async startTrial(): Promise<any> {
    try {
      logger.info('開始試用');

      const _response = await api.post(`${this.baseUrl}/trial/start`);

      if (response.success) {
        logger.info('試用開始成功');
        return {
          success: true,
          data: response.data,
          message: '試用開始成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('開始試用失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '開始試用失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('開始試用時發生錯誤:', error);
      return {
        success: false,
        message: '開始試用時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 取消會員
   */
  async cancel(): Promise<any> {
    try {
      logger.info('取消會員');

      const _response = await api.post(`${this.baseUrl}/cancel`);

      if (response.success) {
        logger.info('會員取消成功');
        return {
          success: true,
          data: response.data,
          message: '會員取消成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('取消會員失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '取消會員失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('取消會員時發生錯誤:', error);
      return {
        success: false,
        message: '取消會員時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 檢查功能使用情況
   */
  async checkFeatureUsage(feature: string): Promise<any> {
    try {
      logger.info('檢查功能使用情況:', { feature });

      const _response = await api.get(`${this.baseUrl}/usage/${feature}`);

      if (response.success) {
        logger.info('功能使用情況檢查成功');
        return {
          success: true,
          data: response.data,
          message: '功能使用情況檢查成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('檢查功能使用情況失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '檢查功能使用情況失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('檢查功能使用情況時發生錯誤:', error);
      return {
        success: false,
        message: '檢查功能使用情況時發生錯誤',
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
        logger.info('功能使用成功');
        return {
          success: true,
          data: response.data,
          message: '功能使用成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('使用功能失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '使用功能失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('使用功能時發生錯誤:', error);
      return {
        success: false,
        message: '使用功能時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

export const _membershipService = new MembershipService();
