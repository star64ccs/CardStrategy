import { membershipService } from '../../../services/membershipService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('MembershipService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembershipStatus', () => {
    it('應該成功獲取會員狀態', async () => {
      const mockStatus = {
        tier: 'premium',
        status: 'active',
        expiresAt: '2024-12-31T23:59:59Z',
        features: ['ai_analysis', 'price_alerts']
      };
      mockApiService.get.mockResolvedValue(mockStatus);

      const result = await membershipService.getMembershipStatus();

      expect(result).toEqual(mockStatus);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/status');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取會員狀態成功', { status: mockStatus });
    });

    it('應該處理獲取會員狀態失敗', async () => {
      const error = new Error('API 錯誤');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getMembershipStatus()).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取會員狀態失敗:', error);
    });
  });

  describe('upgradeMembership', () => {
    const mockUpgradeData = {
      tier: 'premium',
      paymentMethod: 'credit_card',
      billingCycle: 'monthly'
    };

    it('應該成功升級會員', async () => {
      const mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z'
        }
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.upgradeMembership(mockUpgradeData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/upgrade', mockUpgradeData);
      expect(mockLogger.info).toHaveBeenCalledWith('會員升級成功', { tier: mockUpgradeData.tier });
    });

    it('應該處理升級失敗', async () => {
      const error = new Error('升級失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.upgradeMembership(mockUpgradeData)).rejects.toThrow('升級失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('會員升級失敗:', error);
    });

    it('應該驗證輸入數據', async () => {
      const invalidData = { tier: '' };

      await expect(membershipService.upgradeMembership(invalidData)).rejects.toThrow();
      expect(mockApiService.post).not.toHaveBeenCalled();
    });
  });

  describe('startTrial', () => {
    const mockTrialData = {
      tier: 'premium',
      duration: 7
    };

    it('應該成功開始試用期', async () => {
      const mockResponse = {
        success: true,
        trial: {
          tier: 'premium',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-08T00:00:00Z',
          status: 'active'
        }
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.startTrial(mockTrialData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/trial/start', mockTrialData);
      expect(mockLogger.info).toHaveBeenCalledWith('試用期開始成功', { tier: mockTrialData.tier });
    });

    it('應該處理開始試用期失敗', async () => {
      const error = new Error('試用期開始失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.startTrial(mockTrialData)).rejects.toThrow('試用期開始失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('試用期開始失敗:', error);
    });
  });

  describe('cancelTrial', () => {
    it('應該成功取消試用期', async () => {
      const mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.cancelTrial();

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/trial/cancel');
      expect(mockLogger.info).toHaveBeenCalledWith('試用期取消成功');
    });

    it('應該處理取消試用期失敗', async () => {
      const error = new Error('取消試用期失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.cancelTrial()).rejects.toThrow('取消試用期失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('試用期取消失敗:', error);
    });
  });

  describe('checkFeatureUsage', () => {
    it('應該成功檢查功能使用情況', async () => {
      const mockUsage = {
        feature: 'ai_analysis',
        usage: 5,
        limit: 10,
        resetDate: '2024-02-01T00:00:00Z'
      };
      mockApiService.get.mockResolvedValue(mockUsage);

      const result = await membershipService.checkFeatureUsage('ai_analysis');

      expect(result).toEqual(mockUsage);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/features/ai_analysis/usage');
      expect(mockLogger.info).toHaveBeenCalledWith('檢查功能使用情況成功', { feature: 'ai_analysis' });
    });

    it('應該處理檢查功能使用情況失敗', async () => {
      const error = new Error('檢查失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.checkFeatureUsage('ai_analysis')).rejects.toThrow('檢查失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('檢查功能使用情況失敗:', error);
    });
  });

  describe('recordFeatureUsage', () => {
    const mockUsageData = {
      feature: 'ai_analysis',
      usage: 1,
      metadata: { cardId: 'card-123' }
    };

    it('應該成功記錄功能使用', async () => {
      const mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.recordFeatureUsage(mockUsageData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/features/usage', mockUsageData);
      expect(mockLogger.info).toHaveBeenCalledWith('功能使用記錄成功', { feature: mockUsageData.feature });
    });

    it('應該處理記錄功能使用失敗', async () => {
      const error = new Error('記錄失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.recordFeatureUsage(mockUsageData)).rejects.toThrow('記錄失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('功能使用記錄失敗:', error);
    });
  });

  describe('getMembershipBenefits', () => {
    it('應該成功獲取會員福利', async () => {
      const mockBenefits = {
        tier: 'premium',
        benefits: [
          { name: 'AI 分析', description: '無限次 AI 卡片分析' },
          { name: '價格提醒', description: '即時價格變動提醒' }
        ]
      };
      mockApiService.get.mockResolvedValue(mockBenefits);

      const result = await membershipService.getMembershipBenefits();

      expect(result).toEqual(mockBenefits);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/benefits');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取會員福利成功');
    });

    it('應該處理獲取會員福利失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getMembershipBenefits()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取會員福利失敗:', error);
    });
  });

  describe('getFeatureLimits', () => {
    it('應該成功獲取功能限制', async () => {
      const mockLimits = {
        ai_analysis: { daily: 10, monthly: 100 },
        price_alerts: { daily: 5, monthly: 50 },
        portfolio_items: { total: 1000 }
      };
      mockApiService.get.mockResolvedValue(mockLimits);

      const result = await membershipService.getFeatureLimits();

      expect(result).toEqual(mockLimits);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/features/limits');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取功能限制成功');
    });

    it('應該處理獲取功能限制失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getFeatureLimits()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取功能限制失敗:', error);
    });
  });

  describe('getAvailableFeatures', () => {
    it('應該成功獲取可用功能列表', async () => {
      const mockFeatures = [
        { id: 'ai_analysis', name: 'AI 分析', description: '智能卡片分析' },
        { id: 'price_alerts', name: '價格提醒', description: '價格變動提醒' },
        { id: 'portfolio', name: '投資組合', description: '投資組合管理' }
      ];
      mockApiService.get.mockResolvedValue(mockFeatures);

      const result = await membershipService.getAvailableFeatures();

      expect(result).toEqual(mockFeatures);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/features');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取可用功能列表成功');
    });

    it('應該處理獲取可用功能列表失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getAvailableFeatures()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取可用功能列表失敗:', error);
    });
  });

  describe('isFeatureAvailable', () => {
    it('應該成功檢查功能是否可用', async () => {
      const mockAvailability = {
        available: true,
        reason: null,
        usage: { current: 5, limit: 10 }
      };
      mockApiService.get.mockResolvedValue(mockAvailability);

      const result = await membershipService.isFeatureAvailable('ai_analysis');

      expect(result).toEqual(mockAvailability);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/features/ai_analysis/availability');
      expect(mockLogger.info).toHaveBeenCalledWith('檢查功能可用性成功', { feature: 'ai_analysis' });
    });

    it('應該處理檢查功能可用性失敗', async () => {
      const error = new Error('檢查失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.isFeatureAvailable('ai_analysis')).rejects.toThrow('檢查失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('檢查功能可用性失敗:', error);
    });
  });

  describe('getTrialStatus', () => {
    it('應該成功獲取試用期狀態', async () => {
      const mockTrialStatus = {
        hasTrial: true,
        trialActive: false,
        trialUsed: true,
        trialEndDate: '2024-01-08T00:00:00Z',
        canStartTrial: false
      };
      mockApiService.get.mockResolvedValue(mockTrialStatus);

      const result = await membershipService.getTrialStatus();

      expect(result).toEqual(mockTrialStatus);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/trial/status');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取試用期狀態成功');
    });

    it('應該處理獲取試用期狀態失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getTrialStatus()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取試用期狀態失敗:', error);
    });
  });

  describe('renewMembership', () => {
    const mockRenewalData = {
      paymentMethod: 'credit_card',
      autoRenew: true
    };

    it('應該成功續費會員', async () => {
      const mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'active',
          expiresAt: '2025-01-31T23:59:59Z'
        }
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.renewMembership(mockRenewalData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/renew', mockRenewalData);
      expect(mockLogger.info).toHaveBeenCalledWith('會員續費成功');
    });

    it('應該處理續費失敗', async () => {
      const error = new Error('續費失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.renewMembership(mockRenewalData)).rejects.toThrow('續費失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('會員續費失敗:', error);
    });
  });

  describe('cancelMembership', () => {
    const mockCancellationData = {
      reason: 'too_expensive',
      feedback: '價格太高'
    };

    it('應該成功取消會員', async () => {
      const mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'cancelled',
          expiresAt: '2024-01-31T23:59:59Z'
        }
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.cancelMembership(mockCancellationData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/cancel', mockCancellationData);
      expect(mockLogger.info).toHaveBeenCalledWith('會員取消成功');
    });

    it('應該處理取消失敗', async () => {
      const error = new Error('取消失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.cancelMembership(mockCancellationData)).rejects.toThrow('取消失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('會員取消失敗:', error);
    });
  });

  describe('pauseMembership', () => {
    const mockPauseData = {
      reason: 'temporary_break',
      duration: 30
    };

    it('應該成功暫停會員', async () => {
      const mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'paused',
          pauseEndDate: '2024-03-01T00:00:00Z'
        }
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await membershipService.pauseMembership(mockPauseData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/membership/pause', mockPauseData);
      expect(mockLogger.info).toHaveBeenCalledWith('會員暫停成功');
    });

    it('應該處理暫停失敗', async () => {
      const error = new Error('暫停失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.pauseMembership(mockPauseData)).rejects.toThrow('暫停失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('會員暫停失敗:', error);
    });
  });
});
