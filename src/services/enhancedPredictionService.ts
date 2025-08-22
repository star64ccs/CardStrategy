import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';

// 類型定義
export type EnhancedModelType =
  | 'enhancedLSTM'
  | 'transformer'
  | 'technicalEnsemble'
  | 'dynamicEnsemble';
export type Timeframe = '1d' | '7d' | '30d' | '90d' | '180d' | '365d';
export type Trend = 'up' | 'down' | 'stable';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface EnhancedPrediction {
  id: number;
  cardId: number;
  modelType: string;
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
    technicalStrength?: number;
    attentionStrength?: number;
    signalStrength?: number;
    modelAgreement?: number;
  };
  riskLevel: RiskLevel;
  predictionDate: string;
  targetDate: string;
  modelParameters: any;
}

export interface ModelComparison {
  cardId: number;
  timeframe: Timeframe;
  comparisons: {
    [key in EnhancedModelType]?:
      | {
          predictedPrice: number;
          confidence: number;
          trend: Trend;
          volatility: number;
          riskLevel: RiskLevel;
          factors: any;
        }
      | { error: string };
  };
  agreement: number;
  summary: {
    totalModels: number;
    successfulModels: number;
    averagePrice: string;
    priceVariance: string;
    modelAgreement: string;
  };
}

export interface TechnicalAnalysis {
  cardId: number;
  timeframe: Timeframe;
  analysis: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
    stochastic: number;
    williamsR: number;
    cci: number;
    currentPrice: number;
    priceChange: string;
    volatility: number;
    momentum: number;
  };
  signals: {
    indicator: string;
    signal: string;
    strength: '強' | '中' | '弱';
  }[];
  summary: {
    totalSignals: number;
    buySignals: number;
    sellSignals: number;
    strongSignals: number;
  };
}

export interface AccuracyAssessment {
  predictionId: number;
  cardId: number;
  modelType: string;
  timeframe: Timeframe;
  predictedPrice: number;
  actualPrice: number;
  absoluteError: string;
  percentageError: string;
  accuracy: string;
  accuracyGrade: 'A' | 'B' | 'C' | 'D';
  predictionDate: string;
  targetDate: string;
  daysElapsed: number;
}

export interface ModelPerformanceStats {
  modelStats: {
    modelType: string;
    totalPredictions: number;
    avgConfidence: string;
    avgAccuracy: string;
    highAccuracyCount: number;
    highAccuracyRate: string;
  }[];
  overallStats: {
    totalPredictions: number;
    avgConfidence: string;
    avgAccuracy: string;
    highAccuracyCount: number;
    highAccuracyRate: string;
  };
}

export interface EnhancedModelInfo {
  id: EnhancedModelType;
  name: string;
  description: string;
  accuracy: string;
  speed: string;
  complexity: string;
  features: string[];
  bestFor: string[];
}

export interface BatchPredictionResult {
  predictions: EnhancedPrediction[];
  errors: { cardId: number; error: string }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
  };
}

// 驗證模式
const EnhancedPredictionSchema = z.object({
  id: z.number(),
  cardId: z.number(),
  modelType: z.string(),
  timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
  predictedPrice: z.number(),
  confidence: z.number(),
  accuracy: z.number().nullable(),
  trend: z.enum(['up', 'down', 'stable']),
  volatility: z.number(),
  factors: z.object({
    trend: z.enum(['up', 'down', 'stable']),
    volatility: z.number(),
    momentum: z.number().optional(),
    technicalStrength: z.number().optional(),
    attentionStrength: z.number().optional(),
    signalStrength: z.number().optional(),
    modelAgreement: z.number().optional(),
  }),
  riskLevel: z.enum(['low', 'medium', 'high']),
  predictionDate: z.string(),
  targetDate: z.string(),
  modelParameters: z.any(),
});

const ModelComparisonSchema = z.object({
  cardId: z.number(),
  timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
  comparisons: z.record(
    z.union([
      z.object({
        predictedPrice: z.number(),
        confidence: z.number(),
        trend: z.enum(['up', 'down', 'stable']),
        volatility: z.number(),
        riskLevel: z.enum(['low', 'medium', 'high']),
        factors: z.any(),
      }),
      z.object({ error: z.string() }),
    ])
  ),
  agreement: z.number(),
  summary: z.object({
    totalModels: z.number(),
    successfulModels: z.number(),
    averagePrice: z.string(),
    priceVariance: z.string(),
    modelAgreement: z.string(),
  }),
});

const TechnicalAnalysisSchema = z.object({
  cardId: z.number(),
  timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
  analysis: z.object({
    rsi: z.number(),
    macd: z.object({
      macd: z.number(),
      signal: z.number(),
      histogram: z.number(),
    }),
    bollingerBands: z.object({
      upper: z.number(),
      middle: z.number(),
      lower: z.number(),
    }),
    stochastic: z.number(),
    williamsR: z.number(),
    cci: z.number(),
    currentPrice: z.number(),
    priceChange: z.string(),
    volatility: z.number(),
    momentum: z.number(),
  }),
  signals: z.array(
    z.object({
      indicator: z.string(),
      signal: z.string(),
      strength: z.enum(['強', '中', '弱']),
    })
  ),
  summary: z.object({
    totalSignals: z.number(),
    buySignals: z.number(),
    sellSignals: z.number(),
    strongSignals: z.number(),
  }),
});

class EnhancedPredictionService {
  /**
   * 增強預測卡牌價格
   */
  async predictCardPrice(
    cardId: number,
    timeframe: Timeframe,
    modelType: EnhancedModelType = 'dynamicEnsemble'
  ): Promise<ApiResponse<EnhancedPrediction>> {
    try {
      // 輸入驗證
      const input = { cardId, timeframe, modelType };
      const validation = validateInput(
        input,
        z.object({
          cardId: z.number().int().positive(),
          timeframe: z.enum(['1d', '7d', '30d', '30d', '90d', '180d', '365d']),
          modelType: z.enum([
            'enhancedLSTM',
            'transformer',
            'technicalEnsemble',
            'dynamicEnsemble',
          ]),
        })
      );

      if (!validation.success) {
        return {
          success: false,
          message: '輸入驗證失敗',
          errors: validation.errors,
        };
      }

      const response = await apiService.post(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.ENHANCED_PREDICT,
        input
      );

      // 響應驗證
      const responseValidation = validateApiResponse(
        response,
        EnhancedPredictionSchema
      );
      if (!responseValidation.success) {
        logger.error('增強預測響應驗證失敗:', responseValidation.errors);
        return {
          success: false,
          message: '響應數據格式錯誤',
          errors: responseValidation.errors,
        };
      }

      return {
        success: true,
        message: '增強預測成功',
        data: responseValidation.data,
      };
    } catch (error) {
      logger.error('增強預測失敗:', error);
      return {
        success: false,
        message: '增強預測失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 批量增強預測
   */
  async batchPredict(
    cardIds: number[],
    timeframe: Timeframe,
    modelType: EnhancedModelType = 'dynamicEnsemble'
  ): Promise<ApiResponse<BatchPredictionResult>> {
    try {
      // 輸入驗證
      const input = { cardIds, timeframe, modelType };
      const validation = validateInput(
        input,
        z.object({
          cardIds: z.array(z.number().int().positive()).min(1).max(50),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
          modelType: z.enum([
            'enhancedLSTM',
            'transformer',
            'technicalEnsemble',
            'dynamicEnsemble',
          ]),
        })
      );

      if (!validation.success) {
        return {
          success: false,
          message: '輸入驗證失敗',
          errors: validation.errors,
        };
      }

      const response = await apiService.post(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.ENHANCED_BATCH,
        input
      );

      return {
        success: true,
        message: '批量增強預測成功',
        data: response.data,
      };
    } catch (error) {
      logger.error('批量增強預測失敗:', error);
      return {
        success: false,
        message: '批量增強預測失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 模型性能比較
   */
  async compareModels(
    cardId: number,
    timeframe: Timeframe
  ): Promise<ApiResponse<ModelComparison>> {
    try {
      // 輸入驗證
      const input = { cardId, timeframe };
      const validation = validateInput(
        input,
        z.object({
          cardId: z.number().int().positive(),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
        })
      );

      if (!validation.success) {
        return {
          success: false,
          message: '輸入驗證失敗',
          errors: validation.errors,
        };
      }

      const response = await apiService.post(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.MODEL_COMPARISON,
        input
      );

      // 響應驗證
      const responseValidation = validateApiResponse(
        response,
        ModelComparisonSchema
      );
      if (!responseValidation.success) {
        logger.error('模型比較響應驗證失敗:', responseValidation.errors);
        return {
          success: false,
          message: '響應數據格式錯誤',
          errors: responseValidation.errors,
        };
      }

      return {
        success: true,
        message: '模型比較成功',
        data: responseValidation.data,
      };
    } catch (error) {
      logger.error('模型比較失敗:', error);
      return {
        success: false,
        message: '模型比較失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 技術指標分析
   */
  async getTechnicalAnalysis(
    cardId: number,
    timeframe: Timeframe = '30d'
  ): Promise<ApiResponse<TechnicalAnalysis>> {
    try {
      // 輸入驗證
      const validation = validateInput(
        { cardId, timeframe },
        z.object({
          cardId: z.number().int().positive(),
          timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),
        })
      );

      if (!validation.success) {
        return {
          success: false,
          message: '輸入驗證失敗',
          errors: validation.errors,
        };
      }

      const response = await apiService.get(
        `${API_ENDPOINTS.ENHANCED_PREDICTIONS.TECHNICAL_ANALYSIS}/${cardId}?timeframe=${timeframe}`
      );

      // 響應驗證
      const responseValidation = validateApiResponse(
        response,
        TechnicalAnalysisSchema
      );
      if (!responseValidation.success) {
        logger.error('技術指標分析響應驗證失敗:', responseValidation.errors);
        return {
          success: false,
          message: '響應數據格式錯誤',
          errors: responseValidation.errors,
        };
      }

      return {
        success: true,
        message: '技術指標分析成功',
        data: responseValidation.data,
      };
    } catch (error) {
      logger.error('技術指標分析失敗:', error);
      return {
        success: false,
        message: '技術指標分析失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 預測準確性評估
   */
  async assessAccuracy(
    predictionId: number
  ): Promise<ApiResponse<AccuracyAssessment>> {
    try {
      // 輸入驗證
      const validation = validateInput(
        { predictionId },
        z.object({
          predictionId: z.number().int().positive(),
        })
      );

      if (!validation.success) {
        return {
          success: false,
          message: '輸入驗證失敗',
          errors: validation.errors,
        };
      }

      const response = await apiService.post(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.ACCURACY_ASSESSMENT,
        { predictionId }
      );

      return {
        success: true,
        message: '準確性評估成功',
        data: response.data,
      };
    } catch (error) {
      logger.error('準確性評估失敗:', error);
      return {
        success: false,
        message: '準確性評估失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 獲取模型性能統計
   */
  async getPerformanceStats(): Promise<ApiResponse<ModelPerformanceStats>> {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.PERFORMANCE_STATS
      );

      return {
        success: true,
        message: '性能統計獲取成功',
        data: response.data,
      };
    } catch (error) {
      logger.error('獲取性能統計失敗:', error);
      return {
        success: false,
        message: '獲取性能統計失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 獲取增強模型列表
   */
  async getEnhancedModels(): Promise<ApiResponse<EnhancedModelInfo[]>> {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.ENHANCED_PREDICTIONS.ENHANCED_MODELS
      );

      return {
        success: true,
        message: '增強模型列表獲取成功',
        data: response.data,
      };
    } catch (error) {
      logger.error('獲取增強模型列表失敗:', error);
      return {
        success: false,
        message: '獲取增強模型列表失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  // 輔助方法
  /**
   * 格式化預測結果
   */
  formatPrediction(prediction: EnhancedPrediction) {
    return {
      ...prediction,
      predictedPriceFormatted: `$${prediction.predictedPrice.toFixed(2)}`,
      confidenceFormatted: `${(prediction.confidence * 100).toFixed(1)}%`,
      accuracyFormatted: prediction.accuracy
        ? `${(prediction.accuracy * 100).toFixed(1)}%`
        : '待評估',
      volatilityFormatted: `${(prediction.volatility * 100).toFixed(2)}%`,
    };
  }

  /**
   * 獲取趨勢圖標
   */
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

  /**
   * 獲取風險等級顏色
   */
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

  /**
   * 獲取模型顯示名稱
   */
  getModelDisplayName(modelType: EnhancedModelType): string {
    const modelNames = {
      enhancedLSTM: '增強LSTM',
      transformer: 'Transformer',
      technicalEnsemble: '技術指標集成',
      dynamicEnsemble: '動態集成',
    };
    return modelNames[modelType] || modelType;
  }

  /**
   * 獲取時間框架顯示名稱
   */
  getTimeframeDisplayName(timeframe: Timeframe): string {
    const timeframeNames = {
      '1d': '1天',
      '7d': '7天',
      '30d': '30天',
      '90d': '90天',
      '180d': '180天',
      '365d': '365天',
    };
    return timeframeNames[timeframe] || timeframe;
  }

  /**
   * 獲取準確性等級描述
   */
  getAccuracyGradeDescription(grade: 'A' | 'B' | 'C' | 'D'): string {
    const descriptions = {
      A: '優秀 (90%+)',
      B: '良好 (80-89%)',
      C: '一般 (70-79%)',
      D: '較差 (<70%)',
    };
    return descriptions[grade] || '未知';
  }

  /**
   * 獲取信號強度描述
   */
  getSignalStrengthDescription(strength: '強' | '中' | '弱'): string {
    const descriptions = {
      強: '強烈信號，建議關注',
      中: '中等信號，謹慎考慮',
      弱: '微弱信號，僅供參考',
    };
    return descriptions[strength] || '未知信號';
  }
}

export { EnhancedPredictionService };
export const enhancedPredictionService = new EnhancedPredictionService();
