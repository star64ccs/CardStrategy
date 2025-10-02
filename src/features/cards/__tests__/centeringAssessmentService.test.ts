import { logger } from '../../../core/utils/logger';
import {
  centeringAssessmentService,
  CenteringAssessmentService,
} from '../services/centeringAssessmentService';
import type {
  CenteringAssessmentRequest,
  CenteringAssessmentResult,
  CenteringAssessmentError,
  CenteringAssessmentHistory,
  CenteringAssessmentStats,
  CenteringAssessmentOptions,
} from '../types/centering';

// Mock dependencies
jest.mock('../../../core/utils/logger');

const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('CenteringAssessmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (centeringAssessmentService as any).instance = null;
    (centeringAssessmentService as any).isInitialized = false;
    (centeringAssessmentService as any).assessmentHistory = [];
    (centeringAssessmentService as any).assessmentStats = null;
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const _instance1 = centeringAssessmentService;
      const _instance2 = CenteringAssessmentService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service and load options', async () => {
      const mockOptions: CenteringAssessmentOptions = {
        enableDetailedAnalysis: true,
        includeRecommendations: true,
        assessmentMode: 'detailed',
        focusAreas: ['centering', 'edges', 'corners', 'surface'],
        qualityThreshold: 0.8,
      };
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockResolvedValue(mockOptions);

      await centeringAssessmentService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '初始化 CenteringAssessmentService'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'CenteringAssessmentService 初始化完成',
        { options: mockOptions }
      );
      expect((centeringAssessmentService as any).isInitialized).toBe(true);
      expect((centeringAssessmentService as any).defaultOptions).toEqual(
        mockOptions
      );
    });

    it('should not re-initialize if already initialized', async () => {
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockResolvedValue({});
      await centeringAssessmentService.initialize();
      mockLogger.info.mockClear();

      await centeringAssessmentService.initialize();

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        '初始化 CenteringAssessmentService'
      );
    });

    it('should throw an error if options loading fails', async () => {
      const _error = new Error('Failed to load options');
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockRejectedValue(error);

      await expect(centeringAssessmentService.initialize()).rejects.toThrow(
        'Failed to load options'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'CenteringAssessmentService InitializeFailed:',
        error
      );
    });
  });

  describe('assessCentering', () => {
    const mockRequest: CenteringAssessmentRequest = {
      imageData: 'base64_image_data',
      imageFormat: 'jpeg',
      cardId: 'card-123',
      userId: 'user123',
    };

    it('should successfully assess centering', async () => {
      const mockResult: CenteringAssessmentResult = {
        cardId: 'card-123',
        overallScore: 8.5,
        centeringScore: 9.2,
        edgeWearScore: 8.0,
        cornerWearScore: 7.8,
        surfaceWearScore: 9.5,
        details: {
          centering: {
            horizontalOffset: 2.5,
            verticalOffset: -1.8,
            tolerance: 5.0,
            isCentered: true,
          },
          edges: {
            top: {
              wearLevel: 'none',
              wearPercentage: 0,
              whiteEdge: false,
              chipping: false,
              location: { start: 0, end: 100 },
            },
            bottom: {
              wearLevel: 'light',
              wearPercentage: 15,
              whiteEdge: true,
              chipping: false,
              location: { start: 0, end: 100 },
            },
            left: {
              wearLevel: 'none',
              wearPercentage: 0,
              whiteEdge: false,
              chipping: false,
              location: { start: 0, end: 100 },
            },
            right: {
              wearLevel: 'none',
              wearPercentage: 0,
              whiteEdge: false,
              chipping: false,
              location: { start: 0, end: 100 },
            },
          },
          corners: {
            topLeft: {
              wearLevel: 'none',
              wearPercentage: 0,
              rounded: false,
              chipped: false,
              whiteCorner: false,
            },
            topRight: {
              wearLevel: 'none',
              wearPercentage: 0,
              rounded: false,
              chipped: false,
              whiteCorner: false,
            },
            bottomLeft: {
              wearLevel: 'light',
              wearPercentage: 20,
              rounded: false,
              chipped: false,
              whiteCorner: true,
            },
            bottomRight: {
              wearLevel: 'none',
              wearPercentage: 0,
              rounded: false,
              chipped: false,
              whiteCorner: false,
            },
          },
          surface: {
            scratches: [],
            dents: [],
            stains: [],
            overallCondition: 'excellent',
          },
        },
        recommendations: [],
        metadata: {
          modelVersion: 'v1.0.0',
          processingTimeMs: 2500,
          imageQualityScore: 0.92,
          confidence: 0.88,
          timestamp: new Date(),
          assessmentEngine: 'ai_vision',
          imageResolution: { width: 1920, height: 1080 },
          lightingConditions: 'good',
          cameraAngle: 'perpendicular',
        },
        status: 'success',
      };
      jest
        .spyOn(centeringAssessmentService as any, 'preprocessImage')
        .mockResolvedValue(mockRequest.imageData);
      jest
        .spyOn(centeringAssessmentService as any, 'callAssessmentAPI')
        .mockResolvedValue({ success: true, data: mockResult });
      jest
        .spyOn(centeringAssessmentService as any, 'recordAssessmentHistory')
        .mockResolvedValue(undefined);

      const _result =
        await centeringAssessmentService.assessCentering(mockRequest);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '開始置中評估',
        expect.any(Object)
      );
      expect(
        centeringAssessmentService['preprocessImage']
      ).toHaveBeenCalledWith(mockRequest.imageData, expect.any(Object));
      expect(
        centeringAssessmentService['callAssessmentAPI']
      ).toHaveBeenCalledWith(mockRequest.imageData, expect.any(Object));
      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalledWith('置中評估Success', {
        cardId: mockResult.cardId,
        overallScore: mockResult.overallScore,
        centeringScore: mockResult.centeringScore,
      });
      expect(
        centeringAssessmentService['recordAssessmentHistory']
      ).toHaveBeenCalledWith(mockRequest, mockResult);
    });

    it('should throw an error if assessment API fails', async () => {
      const mockError: CenteringAssessmentError = {
        code: 'ASSESSMENT_FAILED',
        message: 'Backend assessment failed',
        isRetryable: true,
      };
      jest
        .spyOn(centeringAssessmentService as any, 'preprocessImage')
        .mockResolvedValue(mockRequest.imageData);
      jest
        .spyOn(centeringAssessmentService as any, 'callAssessmentAPI')
        .mockResolvedValue({
          success: false,
          errorMessage: mockError.message,
          errorCode: mockError.code,
        });

      await expect(
        centeringAssessmentService.assessCentering(mockRequest)
      ).rejects.toEqual(
        expect.objectContaining({
          code: mockError.code,
          message: mockError.message,
          isRetryable: mockError.isRetryable,
        })
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '置中評估 API 返回Failed:',
        expect.objectContaining({
          code: mockError.code,
          message: mockError.message,
        })
      );
    });

    it('should throw an error if preprocessing fails', async () => {
      const _error = new Error('Image preprocessing failed');
      jest
        .spyOn(centeringAssessmentService as any, 'preprocessImage')
        .mockRejectedValue(error);

      await expect(
        centeringAssessmentService.assessCentering(mockRequest)
      ).rejects.toThrow('Image preprocessing failed');
      expect(mockLogger.error).toHaveBeenCalledWith('置中評估Failed:', error);
    });
  });

  describe('getAssessmentHistory', () => {
    it('should successfully get assessment history', async () => {
      const _userId = 'user123';
      const _limit = 50;
      const mockHistory: CenteringAssessmentHistory[] = [
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
            overallScore: 8.5,
            centeringScore: 9.2,
            edgeWearScore: 8.0,
            cornerWearScore: 7.8,
            surfaceWearScore: 9.5,
            details: {} as any,
            recommendations: [],
            metadata: {} as any,
            status: 'success',
          },
          improvement: 0.5,
        },
      ];
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentHistoryAPI')
        .mockResolvedValue({
          success: true,
          data: mockHistory,
        });

      const _result = await centeringAssessmentService.getAssessmentHistory(
        userId,
        limit
      );

      expect(mockLogger.info).toHaveBeenCalledWith('獲取置中評估歷史', {
        userId,
        limit,
      });
      expect(
        centeringAssessmentService['callGetAssessmentHistoryAPI']
      ).toHaveBeenCalledWith(userId, limit);
      expect(result).toEqual(mockHistory);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGet評估歷史', {
        count: mockHistory.length,
      });
    });

    it('should throw an error if history API fails', async () => {
      const _userId = 'user123';
      const _errorMessage = 'Failed to fetch history';
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentHistoryAPI')
        .mockResolvedValue({
          success: false,
          errorMessage,
        });

      await expect(
        centeringAssessmentService.getAssessmentHistory(userId)
      ).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get評估歷史Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getAssessmentStats', () => {
    it('should successfully get assessment stats', async () => {
      const _userId = 'user123';
      const mockStats: CenteringAssessmentStats = {
        totalAssessments: 25,
        averageScore: 8.2,
        scoreDistribution: {
          excellent: 8,
          good: 12,
          fair: 4,
          poor: 1,
          veryPoor: 0,
        },
        mostCommonIssues: [
          {
            issue: '邊緣磨損',
            frequency: 15,
            averageImpact: 1.2,
          },
        ],
        assessmentTrends: [
          {
            date: new Date(),
            averageScore: 8.2,
            assessmentCount: 3,
          },
        ],
      };
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentStatsAPI')
        .mockResolvedValue({
          success: true,
          data: mockStats,
        });

      const _result =
        await centeringAssessmentService.getAssessmentStats(userId);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取置中評估統計', {
        userId,
      });
      expect(
        centeringAssessmentService['callGetAssessmentStatsAPI']
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStats);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGet評估統計', {
        totalAssessments: mockStats.totalAssessments,
        averageScore: mockStats.averageScore,
      });
    });

    it('should throw an error if stats API fails', async () => {
      const _userId = 'user123';
      const _errorMessage = 'Failed to fetch stats';
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentStatsAPI')
        .mockResolvedValue({
          success: false,
          errorMessage,
        });

      await expect(
        centeringAssessmentService.getAssessmentStats(userId)
      ).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get評估統計Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getAssessmentOptions', () => {
    it('should successfully get assessment options', async () => {
      const mockOptions: CenteringAssessmentOptions = {
        enableDetailedAnalysis: true,
        includeRecommendations: true,
        assessmentMode: 'standard',
        focusAreas: ['centering', 'edges', 'corners', 'surface'],
        qualityThreshold: 0.7,
      };
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockResolvedValue(mockOptions);

      const _result = await centeringAssessmentService.getAssessmentOptions();

      expect(mockLogger.info).toHaveBeenCalledWith('獲取置中評估選項');
      expect(
        centeringAssessmentService['callGetAssessmentOptionsAPI']
      ).toHaveBeenCalled();
      expect(result).toEqual(mockOptions);
      expect(mockLogger.info).toHaveBeenCalledWith('SuccessGet評估選項', {
        options: mockOptions,
      });
    });

    it('should throw an error if options API fails', async () => {
      const _error = new Error('Failed to fetch options');
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockRejectedValue(error);

      await expect(
        centeringAssessmentService.getAssessmentOptions()
      ).rejects.toThrow('Failed to fetch options');
      expect(mockLogger.error).toHaveBeenCalledWith('Get評估選項Failed:', error);
    });
  });
});
