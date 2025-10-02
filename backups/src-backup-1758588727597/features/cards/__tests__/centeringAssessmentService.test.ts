import { logger } from '../../../core/utils/logger';
import {
  centeringAssessmentService,
  CenteringAssessmentService,
} from '../services/centeringAssessmentService';
import type {
  CenteringAssessmentError,
  CenteringAssessmentHistory,
  CenteringAssessmentOptions,
  CenteringAssessmentRequest,
  CenteringAssessmentResult,
  CenteringAssessmentStats,
} from '../types/centering';

// Mock dependencies
jest.mock('../../../core/utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

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
      const instance1 = centeringAssessmentService;
      const instance2 = CenteringAssessmentService.getInstance();
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
      const error = new Error('Failed to load options');
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockRejectedValue(error);

      await expect(centeringAssessmentService.initialize()).rejects.toThrow(
        'Failed to load options'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'CenteringAssessmentService 初始化失敗:',
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
          modelVersion: 'v2.0.0',
          processingTimeMs: 2500,
          imageQualityScore: 0.92,
          confidence: 0.88,
          timestamp: new Date(),
          assessmentEngine: 'computer_vision',
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

      const result =
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
      expect(mockLogger.info).toHaveBeenCalledWith('置中評估成功', {
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
        '置中評估 API 返回失敗:',
        expect.objectContaining({
          code: mockError.code,
          message: mockError.message,
        })
      );
    });

    it('should throw an error if preprocessing fails', async () => {
      const error = new Error('Image preprocessing failed');
      jest
        .spyOn(centeringAssessmentService as any, 'preprocessImage')
        .mockRejectedValue(error);

      await expect(
        centeringAssessmentService.assessCentering(mockRequest)
      ).rejects.toThrow('Image preprocessing failed');
      expect(mockLogger.error).toHaveBeenCalledWith('置中評估失敗:', error);
    });
  });

  describe('getAssessmentHistory', () => {
    it('should successfully get assessment history', async () => {
      const userId = 'user123';
      const limit = 50;
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

      const result = await centeringAssessmentService.getAssessmentHistory(
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
      expect(mockLogger.info).toHaveBeenCalledWith('成功獲取評估歷史', {
        count: mockHistory.length,
      });
    });

    it('should throw an error if history API fails', async () => {
      const userId = 'user123';
      const errorMessage = 'Failed to fetch history';
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
        '獲取評估歷史失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getAssessmentStats', () => {
    it('should successfully get assessment stats', async () => {
      const userId = 'user123';
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

      const result =
        await centeringAssessmentService.getAssessmentStats(userId);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取置中評估統計', {
        userId,
      });
      expect(
        centeringAssessmentService['callGetAssessmentStatsAPI']
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStats);
      expect(mockLogger.info).toHaveBeenCalledWith('成功獲取評估統計', {
        totalAssessments: mockStats.totalAssessments,
        averageScore: mockStats.averageScore,
      });
    });

    it('should throw an error if stats API fails', async () => {
      const userId = 'user123';
      const errorMessage = 'Failed to fetch stats';
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
        '獲取評估統計失敗:',
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

      const result = await centeringAssessmentService.getAssessmentOptions();

      expect(mockLogger.info).toHaveBeenCalledWith('獲取置中評估選項');
      expect(
        centeringAssessmentService['callGetAssessmentOptionsAPI']
      ).toHaveBeenCalled();
      expect(result).toEqual(mockOptions);
      expect(mockLogger.info).toHaveBeenCalledWith('成功獲取評估選項', {
        options: mockOptions,
      });
    });

    it('should throw an error if options API fails', async () => {
      const error = new Error('Failed to fetch options');
      jest
        .spyOn(centeringAssessmentService as any, 'callGetAssessmentOptionsAPI')
        .mockRejectedValue(error);

      await expect(
        centeringAssessmentService.getAssessmentOptions()
      ).rejects.toThrow('Failed to fetch options');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取評估選項失敗:', error);
    });
  });

  describe('Real Algorithm Implementation Tests', () => {
    const mockRequest: CenteringAssessmentRequest = {
      imageData: 'base64_image_data',
      imageFormat: 'jpeg',
      cardId: 'card-123',
      userId: 'user123',
    };

    it('should perform real image preprocessing', async () => {
      jest
        .spyOn(centeringAssessmentService as any, 'performImagePreprocessing')
        .mockResolvedValue('processed_image_data');

      const result = await centeringAssessmentService['preprocessImage'](
        mockRequest.imageData,
        {} as any
      );

      expect(
        centeringAssessmentService['performImagePreprocessing']
      ).toHaveBeenCalledWith(mockRequest.imageData, {});
      expect(result).toBe('processed_image_data');
    });

    it('should perform real centering analysis', async () => {
      const mockContour = {
        bounds: { x: 100, y: 100, width: 600, height: 840 },
        corners: [
          { x: 100, y: 100 },
          { x: 700, y: 100 },
          { x: 700, y: 940 },
          { x: 100, y: 940 },
        ],
        confidence: 0.95,
      };

      jest
        .spyOn(centeringAssessmentService as any, 'detectCardContour')
        .mockResolvedValue(mockContour);
      jest
        .spyOn(centeringAssessmentService as any, 'analyzeCentering')
        .mockResolvedValue({
          horizontalOffset: 1.5,
          verticalOffset: -1.2,
          tolerance: 5.0,
          isCentered: true,
        });
      jest
        .spyOn(centeringAssessmentService as any, 'analyzeEdgeWear')
        .mockResolvedValue({
          top: {
            wearLevel: 'none',
            wearPercentage: 0,
            whiteEdge: false,
            chipping: false,
            location: { start: 0, end: 100 },
          },
          bottom: {
            wearLevel: 'light',
            wearPercentage: 12,
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
        });
      jest
        .spyOn(centeringAssessmentService as any, 'analyzeCornerWear')
        .mockResolvedValue({
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
            wearPercentage: 18,
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
        });
      jest
        .spyOn(centeringAssessmentService as any, 'analyzeSurfaceWear')
        .mockResolvedValue({
          scratches: [],
          dents: [],
          stains: [],
          overallCondition: 'excellent',
        });

      const result = await centeringAssessmentService[
        'performCenteringAnalysis'
      ](mockRequest.imageData, {} as any);

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.centeringScore).toBeGreaterThan(0);
      expect(result.edgeWearScore).toBeGreaterThan(0);
      expect(result.cornerWearScore).toBeGreaterThan(0);
      expect(result.surfaceWearScore).toBeGreaterThan(0);
      expect(result.metadata.assessmentEngine).toBe('computer_vision');
      expect(result.metadata.modelVersion).toBe('v2.0.0');
    });

    it('should calculate scores based on real analysis', () => {
      const centering = {
        horizontalOffset: 1.5,
        verticalOffset: -1.2,
        tolerance: 5.0,
        isCentered: true,
      };
      const edges = {
        top: {
          wearLevel: 'none',
          wearPercentage: 0,
          whiteEdge: false,
          chipping: false,
          location: { start: 0, end: 100 },
        },
        bottom: {
          wearLevel: 'light',
          wearPercentage: 12,
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
      };
      const corners = {
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
          wearPercentage: 18,
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
      };
      const surface = {
        scratches: [],
        dents: [],
        stains: [],
        overallCondition: 'excellent',
      };

      const scores = centeringAssessmentService['calculateScores'](
        centering,
        edges,
        corners,
        surface
      );

      expect(scores.overall).toBeGreaterThan(0);
      expect(scores.overall).toBeLessThanOrEqual(10);
      expect(scores.centering).toBeGreaterThan(0);
      expect(scores.edgeWear).toBeGreaterThan(0);
      expect(scores.cornerWear).toBeGreaterThan(0);
      expect(scores.surfaceWear).toBe(10);
    });

    it('should generate recommendations based on real analysis', () => {
      const centering = {
        horizontalOffset: 1.5,
        verticalOffset: -1.2,
        tolerance: 5.0,
        isCentered: true,
      };
      const edges = {
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
      };
      const corners = {
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
      };
      const surface = {
        scratches: [],
        dents: [],
        stains: [],
        overallCondition: 'excellent',
      };

      const recommendations = centeringAssessmentService[
        'generateRecommendations'
      ](centering, edges, corners, surface);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('description');
      expect(recommendations[0]).toHaveProperty('action');
      expect(recommendations[0]).toHaveProperty('impact');
    });

    it('should calculate confidence based on score variance', () => {
      const scores1 = {
        overall: 8.5,
        centering: 9.2,
        edgeWear: 8.0,
        cornerWear: 7.8,
        surfaceWear: 9.5,
      };
      const scores2 = {
        overall: 5.0,
        centering: 10.0,
        edgeWear: 1.0,
        cornerWear: 2.0,
        surfaceWear: 10.0,
      };

      const confidence1 =
        centeringAssessmentService['calculateConfidence'](scores1);
      const confidence2 =
        centeringAssessmentService['calculateConfidence'](scores2);

      expect(confidence1).toBeGreaterThan(confidence2);
      expect(confidence1).toBeGreaterThanOrEqual(0.5);
      expect(confidence1).toBeLessThanOrEqual(1.0);
    });
  });
});
