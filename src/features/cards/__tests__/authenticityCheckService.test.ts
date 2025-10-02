import { logger } from '../../../core/utils/logger';
import {
  authenticityCheckService,
  AuthenticityCheckService,
} from '../services/authenticityCheckService';
import type {
  AuthenticityCheckRequest,
  AuthenticityCheckResult,
  AuthenticityCheckError,
  AuthenticityCheckHistory,
  AuthenticityCheckStats,
  AuthenticityCheckOptions,
} from '../types/authenticity';

// Mock dependencies
jest.mock('../../../core/utils/logger');

const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('AuthenticityCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (authenticityCheckService as any).instance = null;
    (authenticityCheckService as any).isInitialized = false;
    (authenticityCheckService as any).checkHistory = [];
    (authenticityCheckService as any).checkStats = null;
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const _instance1 = authenticityCheckService;
      const _instance2 = AuthenticityCheckService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service and load options', async () => {
      const mockOptions: AuthenticityCheckOptions = {
        enableDetailedAnalysis: true,
        includeSecurityFeatures: true,
        checkMode: 'comprehensive',
        focusAreas: [
          'printing',
          'colors',
          'text',
          'security_features',
          'materials',
        ],
        qualityThreshold: 0.9,
        enableComparison: true,
      };
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckOptionsAPI')
        .mockResolvedValue(mockOptions);

      await authenticityCheckService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '初始化 AuthenticityCheckService'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'AuthenticityCheckService 初始化完成',
        { options: mockOptions }
      );
      expect((authenticityCheckService as any).isInitialized).toBe(true);
      expect((authenticityCheckService as any).defaultOptions).toEqual(
        mockOptions
      );
    });

    it('should not re-initialize if already initialized', async () => {
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckOptionsAPI')
        .mockResolvedValue({});
      await authenticityCheckService.initialize();
      mockLogger.info.mockClear();

      await authenticityCheckService.initialize();

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        '初始化 AuthenticityCheckService'
      );
    });

    it('should throw an error if options loading fails', async () => {
      const _error = new Error('Failed to load options');
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckOptionsAPI')
        .mockRejectedValue(error);

      await expect(authenticityCheckService.initialize()).rejects.toThrow(
        'Failed to load options'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'AuthenticityCheckService InitializeFailed:',
        error
      );
    });
  });

  describe('checkAuthenticity', () => {
    const mockRequest: AuthenticityCheckRequest = {
      imageData: 'base64_image_data',
      imageFormat: 'jpeg',
      cardId: 'card-123',
      userId: 'user123',
    };

    it('should successfully check authenticity for authentic card', async () => {
      const mockResult: AuthenticityCheckResult = {
        cardId: 'card-123',
        isAuthentic: true,
        confidence: 0.92,
        riskLevel: 'low',
        riskFactors: [
          {
            type: 'printing_quality',
            severity: 'minor',
            description: '印刷質量輕微偏差，在正常範圍內',
            confidence: 0.8,
          },
        ],
        securityFeatures: [
          {
            type: 'hologram',
            isPresent: true,
            isAuthentic: true,
            quality: 'excellent',
            confidence: 0.9,
            description: '全息圖案清晰，反光效果正常',
          },
        ],
        recommendations: [
          {
            type: 'verification',
            priority: 'low',
            title: '建議進行專業鑑定',
            description:
              '雖然初步檢查顯示為真卡，但建議進行專業鑑定以確保100%準確性',
            action: '聯繫專業鑑定機構進行詳細檢查',
            impact: 'positive',
          },
        ],
        metadata: {
          modelVersion: 'v1.0.0',
          processingTimeMs: 3500,
          imageQualityScore: 0.88,
          confidence: 0.92,
          timestamp: new Date(),
          checkEngine: 'ai_vision',
          imageResolution: { width: 1920, height: 1080 },
          lightingConditions: 'good',
          cameraAngle: 'perpendicular',
        },
        status: 'success',
      };
      jest
        .spyOn(authenticityCheckService as any, 'preprocessImage')
        .mockResolvedValue(mockRequest.imageData);
      jest
        .spyOn(authenticityCheckService as any, 'callCheckAPI')
        .mockResolvedValue({ success: true, data: mockResult });
      jest
        .spyOn(authenticityCheckService as any, 'recordCheckHistory')
        .mockResolvedValue(undefined);

      const _result =
        await authenticityCheckService.checkAuthenticity(mockRequest);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '開始防偽檢查',
        expect.any(Object)
      );
      expect(authenticityCheckService['preprocessImage']).toHaveBeenCalledWith(
        mockRequest.imageData,
        expect.any(Object)
      );
      expect(authenticityCheckService['callCheckAPI']).toHaveBeenCalledWith(
        mockRequest.imageData,
        expect.any(Object)
      );
      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalledWith('防偽CheckSuccess', {
        cardId: mockResult.cardId,
        isAuthentic: mockResult.isAuthentic,
        confidence: mockResult.confidence,
        riskLevel: mockResult.riskLevel,
      });
      expect(
        authenticityCheckService['recordCheckHistory']
      ).toHaveBeenCalledWith(mockRequest, mockResult);
    });

    it('should successfully check authenticity for fake card', async () => {
      const mockResult: AuthenticityCheckResult = {
        cardId: 'card-123',
        isAuthentic: false,
        confidence: 0.75,
        riskLevel: 'high',
        riskFactors: [
          {
            type: 'color_mismatch',
            severity: 'major',
            description: '顏色與正版卡牌存在明顯差異',
            confidence: 0.9,
            location: { x: 50, y: 100, width: 200, height: 150 },
            evidence: '顏色飽和度異常，色調偏移',
          },
        ],
        securityFeatures: [
          {
            type: 'hologram',
            isPresent: true,
            isAuthentic: false,
            quality: 'poor',
            confidence: 0.3,
            description: '全息圖案模糊，反光效果異常',
          },
        ],
        recommendations: [
          {
            type: 'expert_review',
            priority: 'critical',
            title: '疑似假卡，需要專家審查',
            description: '檢測到多個可疑特徵，建議立即停止交易並尋求專家意見',
            action: '立即聯繫專業鑑定師進行詳細檢查',
            impact: 'negative',
          },
        ],
        metadata: {
          modelVersion: 'v1.0.0',
          processingTimeMs: 3500,
          imageQualityScore: 0.88,
          confidence: 0.75,
          timestamp: new Date(),
          checkEngine: 'ai_vision',
          imageResolution: { width: 1920, height: 1080 },
          lightingConditions: 'good',
          cameraAngle: 'perpendicular',
        },
        status: 'success',
      };
      jest
        .spyOn(authenticityCheckService as any, 'preprocessImage')
        .mockResolvedValue(mockRequest.imageData);
      jest
        .spyOn(authenticityCheckService as any, 'callCheckAPI')
        .mockResolvedValue({ success: true, data: mockResult });
      jest
        .spyOn(authenticityCheckService as any, 'recordCheckHistory')
        .mockResolvedValue(undefined);

      const _result =
        await authenticityCheckService.checkAuthenticity(mockRequest);

      expect(result).toEqual(mockResult);
      expect(result.isAuthentic).toBe(false);
      expect(result.riskLevel).toBe('high');
    });

    it('should throw an error if check API fails', async () => {
      const mockError: AuthenticityCheckError = {
        code: 'CHECK_FAILED',
        message: 'Backend check failed',
        isRetryable: true,
      };
      jest
        .spyOn(authenticityCheckService as any, 'preprocessImage')
        .mockResolvedValue(mockRequest.imageData);
      jest
        .spyOn(authenticityCheckService as any, 'callCheckAPI')
        .mockResolvedValue({
          success: false,
          errorMessage: mockError.message,
          errorCode: mockError.code,
        });

      await expect(
        authenticityCheckService.checkAuthenticity(mockRequest)
      ).rejects.toEqual(
        expect.objectContaining({
          code: mockError.code,
          message: mockError.message,
          isRetryable: mockError.isRetryable,
        })
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '防偽Check API 返回Failed:',
        expect.objectContaining({
          code: mockError.code,
          message: mockError.message,
        })
      );
    });

    it('should throw an error if preprocessing fails', async () => {
      const _error = new Error('Image preprocessing failed');
      jest
        .spyOn(authenticityCheckService as any, 'preprocessImage')
        .mockRejectedValue(error);

      await expect(
        authenticityCheckService.checkAuthenticity(mockRequest)
      ).rejects.toThrow('Image preprocessing failed');
      expect(mockLogger.error).toHaveBeenCalledWith('防偽CheckFailed:', error);
    });
  });

  describe('getCheckHistory', () => {
    it('should successfully get check history', async () => {
      const _userId = 'user123';
      const _limit = 50;
      const mockHistory: AuthenticityCheckHistory[] = [
        {
          id: 'history-1',
          cardId: 'card-123',
          userId,
          timestamp: new Date(),
          request: {
            imageData: 'base64_data',
            imageFormat: 'jpeg',
            cardId: 'card-123',
            userId,
          },
          result: {
            cardId: 'card-123',
            isAuthentic: true,
            confidence: 0.92,
            riskLevel: 'low',
            riskFactors: [],
            securityFeatures: [],
            recommendations: [],
            metadata: {} as any,
            status: 'success',
          },
          statusChange: {
            from: 'medium',
            to: 'low',
            reason: '重新檢查後確認為真卡',
          },
        },
      ];
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckHistoryAPI')
        .mockResolvedValue({
          success: true,
          data: mockHistory,
        });

      const _result = await authenticityCheckService.getCheckHistory(
        userId,
        limit
      );

      expect(mockLogger.info).toHaveBeenCalledWith('獲取防偽檢查歷史', {
        userId,
        limit,
      });
      expect(
        authenticityCheckService['callGetCheckHistoryAPI']
      ).toHaveBeenCalledWith(userId, limit);
      expect(result).toEqual(mockHistory);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGetCheck歷史', {
        count: mockHistory.length,
      });
    });

    it('should throw an error if history API fails', async () => {
      const _userId = 'user123';
      const _errorMessage = 'Failed to fetch history';
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckHistoryAPI')
        .mockResolvedValue({
          success: false,
          errorMessage,
        });

      await expect(
        authenticityCheckService.getCheckHistory(userId)
      ).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'GetCheck歷史Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getCheckStats', () => {
    it('should successfully get check stats', async () => {
      const _userId = 'user123';
      const mockStats: AuthenticityCheckStats = {
        totalChecks: 150,
        authenticCards: 120,
        suspiciousCards: 20,
        fakeCards: 10,
        averageConfidence: 0.85,
        riskLevelDistribution: {
          low: 100,
          medium: 30,
          high: 15,
          critical: 5,
        },
        mostCommonRiskFactors: [
          {
            factor: '顏色不匹配',
            frequency: 25,
            averageSeverity: 2.5,
          },
        ],
        checkTrends: [
          {
            date: new Date(),
            totalChecks: 32,
            fakeDetectionRate: 0.063,
          },
        ],
      };
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckStatsAPI')
        .mockResolvedValue({
          success: true,
          data: mockStats,
        });

      const _result = await authenticityCheckService.getCheckStats(userId);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取防偽檢查統計', {
        userId,
      });
      expect(
        authenticityCheckService['callGetCheckStatsAPI']
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStats);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGetCheck統計', {
        totalChecks: mockStats.totalChecks,
        fakeDetectionRate: '6.67%',
      });
    });

    it('should throw an error if stats API fails', async () => {
      const _userId = 'user123';
      const _errorMessage = 'Failed to fetch stats';
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckStatsAPI')
        .mockResolvedValue({
          success: false,
          errorMessage,
        });

      await expect(
        authenticityCheckService.getCheckStats(userId)
      ).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'GetCheck統計Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getCheckOptions', () => {
    it('should successfully get check options', async () => {
      const mockOptions: AuthenticityCheckOptions = {
        enableDetailedAnalysis: true,
        includeSecurityFeatures: true,
        checkMode: 'standard',
        focusAreas: [
          'printing',
          'colors',
          'text',
          'security_features',
          'materials',
        ],
        qualityThreshold: 0.8,
        enableComparison: false,
      };
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckOptionsAPI')
        .mockResolvedValue(mockOptions);

      const _result = await authenticityCheckService.getCheckOptions();

      expect(mockLogger.info).toHaveBeenCalledWith('獲取防偽檢查選項');
      expect(
        authenticityCheckService['callGetCheckOptionsAPI']
      ).toHaveBeenCalled();
      expect(result).toEqual(mockOptions);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGetCheck選項', {
        options: mockOptions,
      });
    });

    it('should throw an error if options API fails', async () => {
      const _error = new Error('Failed to fetch options');
      jest
        .spyOn(authenticityCheckService as any, 'callGetCheckOptionsAPI')
        .mockRejectedValue(error);

      await expect(authenticityCheckService.getCheckOptions()).rejects.toThrow(
        'Failed to fetch options'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('GetCheck選項Failed:', error);
    });
  });
});
