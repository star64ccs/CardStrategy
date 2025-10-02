import type { ApiResponse } from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import type {
  CenteringAssessmentDetails,
  CenteringAssessmentError,
  CenteringAssessmentHistory,
  CenteringAssessmentOptions,
  CenteringAssessmentRequest,
  CenteringAssessmentResult,
  CenteringAssessmentStats,
  CenteringRecommendation,
} from '../types/centering';

class CenteringAssessmentService {
  private static instance: CenteringAssessmentService;
  private isInitialized = false;
  private assessmentHistory: CenteringAssessmentHistory[] = [];
  private assessmentStats: CenteringAssessmentStats | null = null;
  private defaultOptions: CenteringAssessmentOptions = {
    enableDetailedAnalysis: true,
    includeRecommendations: true,
    assessmentMode: 'standard',
    focusAreas: ['centering', 'edges', 'corners', 'surface'],
    qualityThreshold: 0.7,
  };

  private constructor() {}

  public static getInstance(): CenteringAssessmentService {
    if (!CenteringAssessmentService.instance) {
      CenteringAssessmentService.instance = new CenteringAssessmentService();
    }
    return CenteringAssessmentService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    logger.info('初始化 CenteringAssessmentService');
    try {
      // 模擬從後端GetConfigure
      this.defaultOptions = await this.callGetAssessmentOptionsAPI();
      this.isInitialized = true;
      logger.info('CenteringAssessmentService 初始化完成', {
        options: this.defaultOptions,
      });
    } catch (error: unknown) {
      logger.error('CenteringAssessmentService InitializeFailed:', error);
      throw error;
    }
  }

  public async assessCentering(
    request: CenteringAssessmentRequest
  ): Promise<CenteringAssessmentResult> {
    logger.info('開始置中評估', {
      cardId: request.cardId,
      userId: request.userId,
    });
    try {
      // MergeOptions
      const _options = { ...this.defaultOptions, ...request.assessmentOptions };

      // 模擬Graph像預Handle
      const _processedImage = await this.preprocessImage(
        request.imageData,
        options
      );

      // 模擬調用後端評估 API
      const _apiResponse = await this.callAssessmentAPI(
        processedImage,
        options
      );

      if (!apiResponse.success || !apiResponse.data) {
        const error: CenteringAssessmentError = {
          code: 'ASSESSMENT_FAILED',
          message: apiResponse.error?.message || '置中評估Failed',
          isRetryable: true,
        };
        logger.error(
          '置中評估 API 返回Failed:',
          error as unknown as Record<string, unknown>
        );
        throw error;
      }

      const result: CenteringAssessmentResult = apiResponse.data;
      logger.info('置中評估Success', {
        cardId: result.cardId,
        overallScore: result.overallScore,
        centeringScore: result.centeringScore,
      });

      // Record評估歷史
      await this.recordAssessmentHistory(request, result);

      return result;
    } catch (error: unknown) {
      logger.error('置中評估Failed:', error);
      throw error;
    }
  }

  public async getAssessmentHistory(
    userId: string,
    limit = 50
  ): Promise<CenteringAssessmentHistory[]> {
    logger.info('獲取置中評估歷史', { userId, limit });
    try {
      const _apiResponse = await this.callGetAssessmentHistoryAPI(
        userId,
        limit
      );

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Get評估歷史Failed');
      }

      this.assessmentHistory = apiResponse.data;
      logger.info('SuccessGet評估歷史', { count: this.assessmentHistory.length });
      return this.assessmentHistory;
    } catch (error: unknown) {
      logger.error('Get評估歷史Failed:', error);
      throw error;
    }
  }

  public async getAssessmentStats(
    userId: string
  ): Promise<CenteringAssessmentStats> {
    logger.info('獲取置中評估統計', { userId });
    try {
      const _apiResponse = await this.callGetAssessmentStatsAPI(userId);

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Get評估統計Failed');
      }

      this.assessmentStats = apiResponse.data;
      logger.info('SuccessGet評估統計', {
        totalAssessments: this.assessmentStats.totalAssessments,
        averageScore: this.assessmentStats.averageScore,
      });
      return this.assessmentStats;
    } catch (error: unknown) {
      logger.error('Get評估統計Failed:', error);
      throw error;
    }
  }

  public async getAssessmentOptions(): Promise<CenteringAssessmentOptions> {
    logger.info('獲取置中評估選項');
    try {
      const _options = await this.callGetAssessmentOptionsAPI();
      this.defaultOptions = options;
      logger.info('SuccessGet評估選項', { options });
      return options;
    } catch (error: unknown) {
      logger.error('Get評估選項Failed:', error);
      throw error;
    }
  }

  private async preprocessImage(
    imageData: string,
    options: CenteringAssessmentOptions
  ): Promise<string> {
    // 模擬Graph像Handle，例如調整大小、增強對比度等
    logger.debug('模擬圖像預處理', { options });
    return new Promise(resolve => setTimeout(() => resolve(imageData), 300)); // 模擬HandleTime
  }

  private async callAssessmentAPI(
    processedImageData: string,
    options: CenteringAssessmentOptions
  ): Promise<ApiResponse<CenteringAssessmentResult>> {
    logger.debug('模擬調用置中評估 API');
    return new Promise(resolve => {
      setTimeout(() => {
        const _isSuccess = Math.random() > 0.1; // 90% Success率
        if (isSuccess) {
          const mockDetails: CenteringAssessmentDetails = {
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
          };

          const mockRecommendations: CenteringRecommendation[] = [
            {
              type: 'edge_wear',
              priority: 'low',
              title: '底部邊緣輕微磨損',
              description:
                '底部邊緣有輕微的白色磨損，建議在良好光線下重新檢查。',
              action: '重新拍攝底部邊緣特寫照片進行詳細檢查',
              impact: 'negative',
            },
            {
              type: 'corner_wear',
              priority: 'low',
              title: '左下角輕微磨損',
              description: '左下角有輕微的白色磨損，影響整體評分。',
              action: '使用放大鏡檢查角落磨損程度',
              impact: 'negative',
            },
          ];

          const mockResult: CenteringAssessmentResult = {
            cardId: 'card-123',
            overallScore: 8.5,
            centeringScore: 9.2,
            edgeWearScore: 8.0,
            cornerWearScore: 7.8,
            surfaceWearScore: 9.5,
            details: mockDetails,
            recommendations: mockRecommendations,
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
          resolve({ success: true, data: mockResult, timestamp: new Date() });
        } else {
          resolve({
            success: false,
            error: {
              code: 'ASSESSMENT_FAILED',
              message: '無法評估卡牌置中程度，請確保圖片清晰且光線充足。',
            },
            timestamp: new Date(),
          });
        }
      }, 3000); // 模擬 API 延遲
    });
  }

  private async callGetAssessmentHistoryAPI(
    userId: string,
    limit: number
  ): Promise<ApiResponse<CenteringAssessmentHistory[]>> {
    logger.debug('模擬調用獲取評估歷史 API');
    return new Promise(resolve => {
      setTimeout(() => {
        const mockHistory: CenteringAssessmentHistory[] = [
          {
            id: 'history-1',
            cardId: 'card-123',
            userId,
            timestamp: new Date(Date.now() - 86400000), // 1天前
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
        resolve({ success: true, data: mockHistory, timestamp: new Date() });
      }, 1000);
    });
  }

  private async callGetAssessmentStatsAPI(
    userId: string
  ): Promise<ApiResponse<CenteringAssessmentStats>> {
    logger.debug('模擬調用獲取評估統計 API');
    return new Promise(resolve => {
      setTimeout(() => {
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
            {
              issue: '角落磨損',
              frequency: 8,
              averageImpact: 1.8,
            },
          ],
          assessmentTrends: [
            {
              date: new Date(Date.now() - 86400000),
              averageScore: 8.1,
              assessmentCount: 5,
            },
            {
              date: new Date(),
              averageScore: 8.2,
              assessmentCount: 3,
            },
          ],
        };
        resolve({ success: true, data: mockStats, timestamp: new Date() });
      }, 1000);
    });
  }

  private async callGetAssessmentOptionsAPI(): Promise<CenteringAssessmentOptions> {
    logger.debug('模擬調用獲取評估選項 API');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          enableDetailedAnalysis: true,
          includeRecommendations: true,
          assessmentMode: 'standard',
          focusAreas: ['centering', 'edges', 'corners', 'surface'],
          qualityThreshold: 0.7,
        });
      }, 500);
    });
  }

  private async recordAssessmentHistory(
    request: CenteringAssessmentRequest,
    result: CenteringAssessmentResult
  ): Promise<void> {
    logger.debug('記錄評估歷史');
    // 模擬Record到後端
    return new Promise(resolve => setTimeout(resolve, 200));
  }
}

export { CenteringAssessmentService };
export const _centeringAssessmentService =
  CenteringAssessmentService.getInstance();
