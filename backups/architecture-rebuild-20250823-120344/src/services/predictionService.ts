import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 預測模型類型
export type ModelType =
  | 'linear'
  | 'polynomial'
  | 'exponential'
  | 'arima'
  | 'lstm'
  | 'ensemble';

// 時間框架類型
export type Timeframe = '1d' | '7d' | '30d' | '90d' | '180d' | '365d';

// 趨勢類型
export type Trend = 'up' | 'down' | 'stable';

// 風險等級類型
export type RiskLevel = 'low' | 'medium' | 'high';

// 預測結果接口
export interface Prediction {
  id: number;
  cardId: number;
  modelType: ModelType;
  timeframe: Timeframe;
  predictedPrice: number;
  confidence: number;
  accuracy: number | null;
  trend: Trend;
  volatility: number;
  factors: {
    trend: Trend;
    volatility: number;
    momentum?: number;
    curvature?: number;
    smoothing?: number;
    meanReversion?: string;
    patternStrength?: number;
    modelAgreement?: number;
  };
  riskLevel: RiskLevel;
  predictionDate: string;
  targetDate: string;
  modelParameters: any;
}

// 預測歷史接口
export interface PredictionHistory {
  predictions: Prediction[];
  total: number;
  cardId: number;
}

// 準確性計算結果接口
export interface AccuracyResult {
  predictionId: number;
  actualPrice: number;
  predictedPrice: number;
  accuracy: number;
  error: number;
}

// 批量預測結果接口
export interface BatchPredictionResult {
  predictions: Prediction[];
  errors: {
    cardId: number;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// 模型信息接口
export interface ModelInfo {
  id: ModelType;
  name: string;
  description: string;
  minDataPoints: number;
  accuracy: string;
  speed: string;
  complexity: string;
}

// 統計信息接口
export interface PredictionStatistics {
  totalPredictions: number;
  recentPredictions: number;
  modelStats: {
    modelType: ModelType;
    count: number;
    avgConfidence: number;
    avgAccuracy: number;
  }[];
  accuracyStats: {
    overallAccuracy: number;
    accuracyCount: number;
  };
}

// 預測服務類
class PredictionService {
  // 預測卡牌價格
  async predictCardPrice(
    cardId: number,
    timeframe: Timeframe,
    modelType: ModelType = 'ensemble'
  ): Promise<ApiResponse<Prediction>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardId: z.number().int().positive('卡牌ID必須是正整數'),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
          modelType: z.enum([
            'linear',
            'polynomial',
            'exponential',
            'arima',
            'lstm',
            'ensemble',
          ]),
        }),
        { cardId, timeframe, modelType }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '預測參數驗證失敗');
      }

      const response = await apiService.post<Prediction>(
        '/predictions/predict',
        {
          cardId: validationResult.data!.cardId,
          timeframe: validationResult.data!.timeframe,
          modelType: validationResult.data!.modelType,
        }
      );

      const responseValidation = validateApiResponse(
        z.object({
          id: z.number(),
          cardId: z.number(),
          modelType: z.enum([
            'linear',
            'polynomial',
            'exponential',
            'arima',
            'lstm',
            'ensemble',
          ]),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
          predictedPrice: z.number().positive(),
          confidence: z.number().min(0).max(1),
          accuracy: z.number().min(0).max(1).nullable(),
          trend: z.enum(['up', 'down', 'stable']),
          volatility: z.number().min(0),
          factors: z
            .object({
              trend: z.enum(['up', 'down', 'stable']),
              volatility: z.number().min(0),
            })
            .passthrough(),
          riskLevel: z.enum(['low', 'medium', 'high']),
          predictionDate: z.string(),
          targetDate: z.string(),
          modelParameters: z.any(),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '預測結果數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Predict card price error:', { error: error.message });
      throw error;
    }
  }

  // 獲取預測歷史
  async getPredictionHistory(
    cardId: number,
    limit: number = 50
  ): Promise<ApiResponse<PredictionHistory>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardId: z.number().int().positive('卡牌ID必須是正整數'),
          limit: z.number().int().min(1).max(100),
        }),
        { cardId, limit }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '參數驗證失敗');
      }

      const response = await apiService.get<PredictionHistory>(
        `/predictions/history/${validationResult.data!.cardId}?limit=${validationResult.data!.limit}`
      );

      const responseValidation = validateApiResponse(
        z.object({
          predictions: z.array(
            z.object({
              id: z.number(),
              cardId: z.number(),
              modelType: z.enum([
                'linear',
                'polynomial',
                'exponential',
                'arima',
                'lstm',
                'ensemble',
              ]),
              timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
              predictedPrice: z.number().positive(),
              confidence: z.number().min(0).max(1),
              accuracy: z.number().min(0).max(1).nullable(),
              trend: z.enum(['up', 'down', 'stable']),
              volatility: z.number().min(0),
              factors: z
                .object({
                  trend: z.enum(['up', 'down', 'stable']),
                  volatility: z.number().min(0),
                })
                .passthrough(),
              riskLevel: z.enum(['low', 'medium', 'high']),
              predictionDate: z.string(),
              targetDate: z.string(),
              modelParameters: z.any(),
            })
          ),
          total: z.number(),
          cardId: z.number(),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '預測歷史數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get prediction history error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 計算預測準確性
  async calculatePredictionAccuracy(
    predictionId: number
  ): Promise<ApiResponse<AccuracyResult | null>> {
    try {
      const validationResult = validateInput(
        z.object({
          predictionId: z.number().int().positive('預測ID必須是正整數'),
        }),
        { predictionId }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '預測ID驗證失敗');
      }

      const response = await apiService.post<AccuracyResult | null>(
        `/predictions/accuracy/${validationResult.data!.predictionId}`
      );

      if (response.data === null) {
        return {
          ...response,
          data: null,
        };
      }

      const responseValidation = validateApiResponse(
        z.object({
          predictionId: z.number(),
          actualPrice: z.number().positive(),
          predictedPrice: z.number().positive(),
          accuracy: z.number().min(0).max(1),
          error: z.number().min(0),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '準確性計算結果驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Calculate prediction accuracy error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 批量預測
  async batchPredict(
    cardIds: number[],
    timeframe: Timeframe,
    modelType: ModelType = 'ensemble'
  ): Promise<ApiResponse<BatchPredictionResult>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardIds: z.array(z.number().int().positive()).min(1).max(10),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
          modelType: z.enum([
            'linear',
            'polynomial',
            'exponential',
            'arima',
            'lstm',
            'ensemble',
          ]),
        }),
        { cardIds, timeframe, modelType }
      );

      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '批量預測參數驗證失敗'
        );
      }

      const response = await apiService.post<BatchPredictionResult>(
        '/predictions/batch',
        {
          cardIds: validationResult.data!.cardIds,
          timeframe: validationResult.data!.timeframe,
          modelType: validationResult.data!.modelType,
        }
      );

      const responseValidation = validateApiResponse(
        z.object({
          predictions: z.array(
            z.object({
              id: z.number(),
              cardId: z.number(),
              modelType: z.enum([
                'linear',
                'polynomial',
                'exponential',
                'arima',
                'lstm',
                'ensemble',
              ]),
              timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
              predictedPrice: z.number().positive(),
              confidence: z.number().min(0).max(1),
              accuracy: z.number().min(0).max(1).nullable(),
              trend: z.enum(['up', 'down', 'stable']),
              volatility: z.number().min(0),
              factors: z
                .object({
                  trend: z.enum(['up', 'down', 'stable']),
                  volatility: z.number().min(0),
                })
                .passthrough(),
              riskLevel: z.enum(['low', 'medium', 'high']),
              predictionDate: z.string(),
              targetDate: z.string(),
              modelParameters: z.any(),
            })
          ),
          errors: z.array(
            z.object({
              cardId: z.number(),
              error: z.string(),
            })
          ),
          summary: z.object({
            total: z.number(),
            successful: z.number(),
            failed: z.number(),
          }),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '批量預測結果驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Batch predict error:', { error: error.message });
      throw error;
    }
  }

  // 獲取可用模型列表
  async getAvailableModels(): Promise<ApiResponse<ModelInfo[]>> {
    try {
      const response = await apiService.get<ModelInfo[]>('/predictions/models');

      const responseValidation = validateApiResponse(
        z.array(
          z.object({
            id: z.enum([
              'linear',
              'polynomial',
              'exponential',
              'arima',
              'lstm',
              'ensemble',
            ]),
            name: z.string(),
            description: z.string(),
            minDataPoints: z.number().int().min(1),
            accuracy: z.string(),
            speed: z.string(),
            complexity: z.string(),
          })
        ),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '模型列表數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get available models error:', { error: error.message });
      throw error;
    }
  }

  // 獲取預測統計信息
  async getPredictionStatistics(): Promise<ApiResponse<PredictionStatistics>> {
    try {
      const response = await apiService.get<PredictionStatistics>(
        '/predictions/statistics'
      );

      const responseValidation = validateApiResponse(
        z.object({
          totalPredictions: z.number().int().min(0),
          recentPredictions: z.number().int().min(0),
          modelStats: z.array(
            z.object({
              modelType: z.enum([
                'linear',
                'polynomial',
                'exponential',
                'arima',
                'lstm',
                'ensemble',
              ]),
              count: z.number().int().min(0),
              avgConfidence: z.number().min(0).max(1),
              avgAccuracy: z.number().min(0).max(1),
            })
          ),
          accuracyStats: z.object({
            overallAccuracy: z.number().min(0).max(1),
            accuracyCount: z.number().int().min(0),
          }),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '統計信息數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get prediction statistics error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 刪除預測記錄
  async deletePrediction(predictionId: number): Promise<ApiResponse<void>> {
    try {
      const validationResult = validateInput(
        z.object({
          predictionId: z.number().int().positive('預測ID必須是正整數'),
        }),
        { predictionId }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '預測ID驗證失敗');
      }

      const response = await apiService.delete<void>(
        `/predictions/${validationResult.data!.predictionId}`
      );

      return response;
    } catch (error: any) {
      logger.error('❌ Delete prediction error:', { error: error.message });
      throw error;
    }
  }

  // 格式化預測結果
  formatPrediction(prediction: Prediction) {
    return {
      ...prediction,
      predictedPriceFormatted: `$${prediction.predictedPrice.toFixed(2)}`,
      confidenceFormatted: `${(prediction.confidence * 100).toFixed(1)}%`,
      accuracyFormatted: prediction.accuracy
        ? `${(prediction.accuracy * 100).toFixed(1)}%`
        : 'N/A',
      volatilityFormatted: `${(prediction.volatility * 100).toFixed(1)}%`,
      predictionDateFormatted: new Date(
        prediction.predictionDate
      ).toLocaleDateString(),
      targetDateFormatted: new Date(prediction.targetDate).toLocaleDateString(),
      trendIcon: this.getTrendIcon(prediction.trend),
      riskLevelColor: this.getRiskLevelColor(prediction.riskLevel),
    };
  }

  // 獲取趨勢圖標
  getTrendIcon(trend: Trend): string {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '❓';
    }
  }

  // 獲取風險等級顏色
  getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  }

  // 獲取模型顯示名稱
  getModelDisplayName(modelType: ModelType): string {
    const modelNames: Record<ModelType, string> = {
      linear: '線性回歸',
      polynomial: '多項式回歸',
      exponential: '指數平滑',
      arima: 'ARIMA模型',
      lstm: 'LSTM神經網絡',
      ensemble: '集成模型',
    };
    return modelNames[modelType] || modelType;
  }

  // 獲取時間框架顯示名稱
  getTimeframeDisplayName(timeframe: Timeframe): string {
    const timeframeNames: Record<Timeframe, string> = {
      '1d': '1天',
      '7d': '7天',
      '30d': '30天',
      '90d': '90天',
      '180d': '180天',
      '365d': '365天',
    };
    return timeframeNames[timeframe] || timeframe;
  }
}

// 導出預測服務實例
export { PredictionService };
export const predictionService = new PredictionService();
