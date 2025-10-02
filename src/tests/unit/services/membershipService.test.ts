import { apiService } from '../../../services/apiService';
import { membershipService } from '../../../services/membershipService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const _mockApiService = apiService as jest.Mocked<typeof apiService>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('MembershipService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembershipStatus', () => {
    it('應該SuccessGet會員狀態', async () => {
      const _mockStatus = {
        tier: 'premium',
        status: 'active',
        expiresAt: '2024-12-31T23:59:59Z',
        features: ['ai_analysis', 'price_alerts'],
      };
      mockApiService.get.mockResolvedValue(mockStatus);

      const _result = await membershipService.getMembershipStatus();

      expect(result).toEqual(mockStatus);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/status');
      expect(mockLogger.info).toHaveBeenCalledWith('Get會員狀態Success', {
        status: mockStatus,
      });
    });

    it('應該HandleGet會員狀態Failed', async () => {
      const _error = new Error('API Error');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getMembershipStatus()).rejects.toThrow(
        'API Error'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get會員狀態Failed:', error);
    });
  });

  describe('upgradeMembership', () => {
    const _mockUpgradeData = {
      tier: 'premium',
      paymentMethod: 'credit_card',
      billingCycle: 'monthly',
    };

    it('應該Success升級會員', async () => {
      const _mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z',
        },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.upgradeMembership(mockUpgradeData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/upgrade',
        mockUpgradeData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('會員升級Success', {
        tier: mockUpgradeData.tier,
      });
    });

    it('應該Handle升級Failed', async () => {
      const _error = new Error('升級Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        membershipService.upgradeMembership(mockUpgradeData)
      ).rejects.toThrow('升級Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('會員升級Failed:', error);
    });

    it('應該驗證輸入數據', async () => {
      const _invalidData = { tier: '' };

      await expect(
        membershipService.upgradeMembership(invalidData)
      ).rejects.toThrow();
      expect(mockApiService.post).not.toHaveBeenCalled();
    });
  });

  describe('startTrial', () => {
    const _mockTrialData = {
      tier: 'premium',
      duration: 7,
    };

    it('應該Success開始試用期', async () => {
      const _mockResponse = {
        success: true,
        trial: {
          tier: 'premium',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-08T00:00:00Z',
          status: 'active',
        },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.startTrial(mockTrialData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/trial/start',
        mockTrialData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('試用期開始Success', {
        tier: mockTrialData.tier,
      });
    });

    it('應該Handle開始試用期Failed', async () => {
      const _error = new Error('試用期開始Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.startTrial(mockTrialData)).rejects.toThrow(
        '試用期開始Failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('試用期開始Failed:', error);
    });
  });

  describe('cancelTrial', () => {
    it('應該Success取消試用期', async () => {
      const _mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.cancelTrial();

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/trial/cancel'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('試用期取消Success');
    });

    it('應該Handle取消試用期Failed', async () => {
      const _error = new Error('取消試用期Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(membershipService.cancelTrial()).rejects.toThrow(
        '取消試用期Failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('試用期取消Failed:', error);
    });
  });

  describe('checkFeatureUsage', () => {
    it('應該SuccessCheck功能使用情況', async () => {
      const _mockUsage = {
        feature: 'ai_analysis',
        usage: 5,
        limit: 10,
        resetDate: '2024-02-01T00:00:00Z',
      };
      mockApiService.get.mockResolvedValue(mockUsage);

      const _result = await membershipService.checkFeatureUsage('ai_analysis');

      expect(result).toEqual(mockUsage);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/membership/features/ai_analysis/usage'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Check功能使用情況Success', {
        feature: 'ai_analysis',
      });
    });

    it('應該HandleCheck功能使用情況Failed', async () => {
      const _error = new Error('CheckFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(
        membershipService.checkFeatureUsage('ai_analysis')
      ).rejects.toThrow('CheckFailed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Check功能使用情況Failed:',
        error
      );
    });
  });

  describe('recordFeatureUsage', () => {
    const _mockUsageData = {
      feature: 'ai_analysis',
      usage: 1,
      metadata: { cardId: 'card-123' },
    };

    it('應該Success記錄功能使用', async () => {
      const _mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.recordFeatureUsage(mockUsageData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/features/usage',
        mockUsageData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('功能使用記錄Success', {
        feature: mockUsageData.feature,
      });
    });

    it('應該Handle記錄功能使用Failed', async () => {
      const _error = new Error('記錄Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        membershipService.recordFeatureUsage(mockUsageData)
      ).rejects.toThrow('記錄Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('功能使用記錄Failed:', error);
    });
  });

  describe('getMembershipBenefits', () => {
    it('應該SuccessGet會員福利', async () => {
      const _mockBenefits = {
        tier: 'premium',
        benefits: [
          { name: 'AI 分析', description: '無限次 AI 卡片分析' },
          { name: '價格提醒', description: '即時價格變動提醒' },
        ],
      };
      mockApiService.get.mockResolvedValue(mockBenefits);

      const _result = await membershipService.getMembershipBenefits();

      expect(result).toEqual(mockBenefits);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/benefits');
      expect(mockLogger.info).toHaveBeenCalledWith('Get會員福利Success');
    });

    it('應該HandleGet會員福利Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getMembershipBenefits()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get會員福利Failed:', error);
    });
  });

  describe('getFeatureLimits', () => {
    it('應該SuccessGet功能限制', async () => {
      const _mockLimits = {
        ai_analysis: { daily: 10, monthly: 100 },
        price_alerts: { daily: 5, monthly: 50 },
        portfolio_items: { total: 1000 },
      };
      mockApiService.get.mockResolvedValue(mockLimits);

      const _result = await membershipService.getFeatureLimits();

      expect(result).toEqual(mockLimits);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/membership/features/limits'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Get功能限制Success');
    });

    it('應該HandleGet功能限制Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getFeatureLimits()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get功能限制Failed:', error);
    });
  });

  describe('getAvailableFeatures', () => {
    it('應該SuccessGet可用功能列表', async () => {
      const _mockFeatures = [
        { id: 'ai_analysis', name: 'AI 分析', description: '智能卡片分析' },
        { id: 'price_alerts', name: '價格提醒', description: '價格變動提醒' },
        { id: 'portfolio', name: '投資組合', description: '投資組合管理' },
      ];
      mockApiService.get.mockResolvedValue(mockFeatures);

      const _result = await membershipService.getAvailableFeatures();

      expect(result).toEqual(mockFeatures);
      expect(mockApiService.get).toHaveBeenCalledWith('/membership/features');
      expect(mockLogger.info).toHaveBeenCalledWith('Get可用功能列表Success');
    });

    it('應該HandleGet可用功能列表Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getAvailableFeatures()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get可用功能列表Failed:',
        error
      );
    });
  });

  describe('isFeatureAvailable', () => {
    it('應該SuccessCheck功能是否可用', async () => {
      const _mockAvailability = {
        available: true,
        reason: null,
        usage: { current: 5, limit: 10 },
      };
      mockApiService.get.mockResolvedValue(mockAvailability);

      const _result = await membershipService.isFeatureAvailable('ai_analysis');

      expect(result).toEqual(mockAvailability);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/membership/features/ai_analysis/availability'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Check功能可用性Success', {
        feature: 'ai_analysis',
      });
    });

    it('應該HandleCheck功能可用性Failed', async () => {
      const _error = new Error('CheckFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(
        membershipService.isFeatureAvailable('ai_analysis')
      ).rejects.toThrow('CheckFailed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Check功能可用性Failed:',
        error
      );
    });
  });

  describe('getTrialStatus', () => {
    it('應該SuccessGet試用期狀態', async () => {
      const _mockTrialStatus = {
        hasTrial: true,
        trialActive: false,
        trialUsed: true,
        trialEndDate: '2024-01-08T00:00:00Z',
        canStartTrial: false,
      };
      mockApiService.get.mockResolvedValue(mockTrialStatus);

      const _result = await membershipService.getTrialStatus();

      expect(result).toEqual(mockTrialStatus);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/membership/trial/status'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Get試用期狀態Success');
    });

    it('應該HandleGet試用期狀態Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(membershipService.getTrialStatus()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get試用期狀態Failed:',
        error
      );
    });
  });

  describe('renewMembership', () => {
    const _mockRenewalData = {
      paymentMethod: 'credit_card',
      autoRenew: true,
    };

    it('應該Success續費會員', async () => {
      const _mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'active',
          expiresAt: '2025-01-31T23:59:59Z',
        },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.renewMembership(mockRenewalData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/renew',
        mockRenewalData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('會員續費Success');
    });

    it('應該Handle續費Failed', async () => {
      const _error = new Error('續費Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        membershipService.renewMembership(mockRenewalData)
      ).rejects.toThrow('續費Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('會員續費Failed:', error);
    });
  });

  describe('cancelMembership', () => {
    const _mockCancellationData = {
      reason: 'too_expensive',
      feedback: '價格太高',
    };

    it('應該Success取消會員', async () => {
      const _mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'cancelled',
          expiresAt: '2024-01-31T23:59:59Z',
        },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result =
        await membershipService.cancelMembership(mockCancellationData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/cancel',
        mockCancellationData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('會員取消Success');
    });

    it('應該Handle取消Failed', async () => {
      const _error = new Error('取消Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        membershipService.cancelMembership(mockCancellationData)
      ).rejects.toThrow('取消Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('會員取消Failed:', error);
    });
  });

  describe('pauseMembership', () => {
    const _mockPauseData = {
      reason: 'temporary_break',
      duration: 30,
    };

    it('應該Success暫停會員', async () => {
      const _mockResponse = {
        success: true,
        membership: {
          tier: 'premium',
          status: 'paused',
          pauseEndDate: '2024-03-01T00:00:00Z',
        },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await membershipService.pauseMembership(mockPauseData);

      expect(result).toEqual(mockResponse);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/membership/pause',
        mockPauseData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('會員暫停Success');
    });

    it('應該Handle暫停Failed', async () => {
      const _error = new Error('暫停Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        membershipService.pauseMembership(mockPauseData)
      ).rejects.toThrow('暫停Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('會員暫停Failed:', error);
    });
  });
});
