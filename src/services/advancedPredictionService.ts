import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 高級預測模型類型
export type AdvancedModelType =
  | 'deepLSTM'
  | 'attentionTransformer'
  | 'ensembleGRU'
  | 'hybridCNN'
  | 'reinforcementLearning'
  | 'bayesianOptimization'
  | 'adaptiveEnsemble';

export type Timeframe = '1d' | '7d' | '30d' | '90d' | '180d' | '365d';
export type Trend = 'up' | 'down' | 'stable';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'very_high' | 'high' | 'medium' | 'low';

// 高級預測結果接口
export interface AdvancedPrediction {
  id: number;
  cardId: number;
  modelType: AdvancedModelType;
  timeframe: Timeframe;
  predictedPrice: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  accuracy: number | null;
  trend: Trend;
  volatility: number;
  momentum: number;
  riskLevel: RiskLevel;
  predictionDate: string;
  targetDate: string;

  // 高級分析指標
  advancedMetrics: {
    marketSentiment: number;
    technicalStrength: number;
    fundamentalScore: number;
    momentumIndex: number;
    volatilityIndex: number;
    trendStrength: number;
    supportResistance: {
      support: number;
      resistance: number;
      currentPosition: number;
    };
    volumeAnalysis: {
      volumeTrend: number;
      volumeStrength: number;
      unusualVolume: boolean;
    };
    pricePatterns: {
      pattern: string;
      reliability: number;
      completion: number;
    };
  };

  // 多模型集成結果
  ensembleResults: {
    modelPredictions: {
      modelName: string;
      prediction: number;
      confidence: number;
      weight: number;
      accuracy: number;
    }[];
    consensusPrediction: number;
    modelAgreement: number;
    predictionVariance: number;
  };

  // 風險評估
  riskAssessment: {
    overallRisk: RiskLevel;
    marketRisk: number;
    volatilityRisk: number;
    liquidityRisk: number;
    eventRisk: number;
    riskFactors: string[];
  };

  // 技術指標
  technicalIndicators: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    stochastic: number;
    williamsR: number;
    cci: number;
    adx: number;
    obv: number;
    vwap: number;
  };

  // 市場情緒分析
  sentimentAnalysis: {
    socialMediaSentiment: number;
    newsSentiment: number;
    searchTrends: number;
    marketFearGreed: number;
    overallSentiment: number;
  };

  // 預測解釋
  predictionExplanation: {
    mainFactors: string[];
    confidenceFactors: string[];
    riskFactors: string[];
    recommendation: string;
    nextUpdateTime: string;
  };
}

// 模型性能統計
export interface ModelPerformance {
  modelType: AdvancedModelType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number;
  rmse: number;
  totalPredictions: number;
  successfulPredictions: number;
  averageConfidence: number;
  lastUpdated: string;
}

// 高級預測服務
class AdvancedPredictionService {
  private baseUrl = '/advanced-predictions';
  private modelWeights: Record<AdvancedModelType, number>;
  private performanceCache: Map<string, ModelPerformance>;
  private lastUpdateTime: Date;

  constructor() {
    // 初始化模型權重（基於歷史性能動態調整）
    this.modelWeights = {
      deepLSTM: 0.25,
      attentionTransformer: 0.20,
      ensembleGRU: 0.20,
      hybridCNN: 0.15,
      reinforcementLearning: 0.10,
      bayesianOptimization: 0.05,
      adaptiveEnsemble: 0.05
    };

    this.performanceCache = new Map();
    this.lastUpdateTime = new Date();
  }

  // 高級單卡預測
  async predictAdvanced(
    cardId: number,
    timeframe: Timeframe,
    options?: {
      useAllModels?: boolean;
      includeSentiment?: boolean;
      includeTechnicalAnalysis?: boolean;
      confidenceThreshold?: number;
    }
  ): Promise<AdvancedPrediction> {
    try {
      logger.info(`開始高級預測: 卡片ID ${cardId}, 時間框架 ${timeframe}`);

      const response = await apiService.post(`${this.baseUrl}/predict`, {
        cardId,
        timeframe,
        options: {
          useAllModels: options?.useAllModels ?? true,
          includeSentiment: options?.includeSentiment ?? true,
          includeTechnicalAnalysis: options?.includeTechnicalAnalysis ?? true,
          confidenceThreshold: options?.confidenceThreshold ?? 0.8
        }
      });

      if (!response.success) {
        throw new Error(response.message || '預測失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('高級預測失敗:', error);
      throw error;
    }
  }

  // 批量高級預測
  async predictBatchAdvanced(
    cardIds: number[],
    timeframe: Timeframe,
    options?: {
      parallelProcessing?: boolean;
      batchSize?: number;
      priorityCards?: number[];
    }
  ): Promise<AdvancedPrediction[]> {
    try {
      logger.info(`開始批量高級預測: ${cardIds.length} 張卡片`);

      const response = await apiService.post(`${this.baseUrl}/batch-predict`, {
        cardIds,
        timeframe,
        options: {
          parallelProcessing: options?.parallelProcessing ?? true,
          batchSize: options?.batchSize ?? 10,
          priorityCards: options?.priorityCards ?? []
        }
      });

      if (!response.success) {
        throw new Error(response.message || '批量預測失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('批量高級預測失敗:', error);
      throw error;
    }
  }

  // 模型性能比較
  async compareModelPerformance(
    cardId: number,
    timeframe: Timeframe,
    dateRange?: { start: string; end: string }
  ): Promise<{
    cardId: number;
    timeframe: Timeframe;
    comparisons: Record<AdvancedModelType, ModelPerformance>;
    bestModel: AdvancedModelType;
    overallAccuracy: number;
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/model-comparison`, {
        params: { cardId, timeframe, dateRange }
      });

      if (!response.success) {
        throw new Error(response.message || '模型比較失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('模型性能比較失敗:', error);
      throw error;
    }
  }

  // 高級技術分析
  async getAdvancedTechnicalAnalysis(
    cardId: number,
    timeframe: Timeframe
  ): Promise<{
    cardId: number;
    timeframe: Timeframe;
    technicalIndicators: any;
    patternRecognition: any;
    supportResistance: any;
    volumeAnalysis: any;
    momentumAnalysis: any;
    trendAnalysis: any;
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/technical-analysis/${cardId}`, {
        params: { timeframe }
      });

      if (!response.success) {
        throw new Error(response.message || '技術分析失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('高級技術分析失敗:', error);
      throw error;
    }
  }

  // 市場情緒分析
  async getMarketSentiment(
    cardId: number,
    timeframe: Timeframe
  ): Promise<{
    cardId: number;
    timeframe: Timeframe;
    socialMediaSentiment: number;
    newsSentiment: number;
    searchTrends: number;
    marketFearGreed: number;
    overallSentiment: number;
    sentimentFactors: string[];
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/sentiment-analysis/${cardId}`, {
        params: { timeframe }
      });

      if (!response.success) {
        throw new Error(response.message || '情緒分析失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('市場情緒分析失敗:', error);
      throw error;
    }
  }

  // 預測準確性評估
  async assessPredictionAccuracy(
    predictionId: number
  ): Promise<{
    predictionId: number;
    cardId: number;
    modelType: AdvancedModelType;
    actualPrice: number;
    predictedPrice: number;
    accuracy: number;
    error: number;
    percentageError: number;
    accuracyLevel: 'excellent' | 'good' | 'fair' | 'poor';
    improvement: number;
  }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/accuracy-assessment`, {
        predictionId
      });

      if (!response.success) {
        throw new Error(response.message || '準確性評估失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('預測準確性評估失敗:', error);
      throw error;
    }
  }

  // 獲取模型性能統計
  async getModelPerformanceStats(): Promise<{
    overallStats: {
      totalPredictions: number;
      averageAccuracy: number;
      bestModel: AdvancedModelType;
      worstModel: AdvancedModelType;
      accuracyImprovement: number;
    };
    modelStats: Record<AdvancedModelType, ModelPerformance>;
    recentPerformance: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/performance-stats`);

      if (!response.success) {
        throw new Error(response.message || '獲取性能統計失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('獲取模型性能統計失敗:', error);
      throw error;
    }
  }

  // 獲取高級模型列表
  async getAdvancedModels(): Promise<{
    models: {
      type: AdvancedModelType;
      name: string;
      description: string;
      accuracy: number;
      confidence: number;
      lastUpdated: string;
      status: 'active' | 'training' | 'maintenance';
    }[];
    totalModels: number;
    activeModels: number;
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/advanced-models`);

      if (!response.success) {
        throw new Error(response.message || '獲取模型列表失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('獲取高級模型列表失敗:', error);
      throw error;
    }
  }

  // 實時預測更新
  async getRealTimePrediction(
    cardId: number,
    timeframe: Timeframe
  ): Promise<AdvancedPrediction> {
    try {
      const response = await apiService.get(`${this.baseUrl}/real-time/${cardId}`, {
        params: { timeframe }
      });

      if (!response.success) {
        throw new Error(response.message || '實時預測失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('實時預測失敗:', error);
      throw error;
    }
  }

  // 預測歷史分析
  async getPredictionHistory(
    cardId: number,
    timeframe: Timeframe,
    limit: number = 50
  ): Promise<{
    cardId: number;
    timeframe: Timeframe;
    predictions: AdvancedPrediction[];
    accuracyTrend: number[];
    confidenceTrend: number[];
    performanceMetrics: {
      averageAccuracy: number;
      averageConfidence: number;
      successRate: number;
      improvementRate: number;
    };
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/prediction-history/${cardId}`, {
        params: { timeframe, limit }
      });

      if (!response.success) {
        throw new Error(response.message || '獲取預測歷史失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('獲取預測歷史失敗:', error);
      throw error;
    }
  }

  // 風險評估
  async assessRisk(
    cardId: number,
    timeframe: Timeframe
  ): Promise<{
    cardId: number;
    timeframe: Timeframe;
    overallRisk: RiskLevel;
    riskScore: number;
    riskFactors: {
      factor: string;
      impact: 'high' | 'medium' | 'low';
      probability: number;
      description: string;
    }[];
    recommendations: string[];
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/risk-assessment/${cardId}`, {
        params: { timeframe }
      });

      if (!response.success) {
        throw new Error(response.message || '風險評估失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('風險評估失敗:', error);
      throw error;
    }
  }

  // 更新模型權重
  async updateModelWeights(): Promise<void> {
    try {
      const performanceStats = await this.getModelPerformanceStats();

      // 基於性能動態調整權重
      const totalAccuracy = Object.values(performanceStats.modelStats)
        .reduce((sum, model) => sum + model.accuracy, 0);

      Object.keys(this.modelWeights).forEach(modelType => {
        const modelStats = performanceStats.modelStats[modelType as AdvancedModelType];
        if (modelStats) {
          this.modelWeights[modelType as AdvancedModelType] = modelStats.accuracy / totalAccuracy;
        }
      });

      logger.info('模型權重已更新:', this.modelWeights);
    } catch (error) {
      logger.error('更新模型權重失敗:', error);
    }
  }

  // 獲取當前模型權重
  getModelWeights(): Record<AdvancedModelType, number> {
    return { ...this.modelWeights };
  }

  // 格式化預測結果
  formatPrediction(prediction: AdvancedPrediction): {
    price: string;
    confidence: string;
    trend: string;
    risk: string;
    recommendation: string;
  } {
    return {
      price: `$${prediction.predictedPrice.toFixed(2)}`,
      confidence: `${(prediction.confidence * 100).toFixed(1)}%`,
      trend: this.getTrendText(prediction.trend),
      risk: this.getRiskText(prediction.riskLevel),
      recommendation: prediction.predictionExplanation.recommendation
    };
  }

  private getTrendText(trend: Trend): string {
    switch (trend) {
      case 'up': return '上升趨勢';
      case 'down': return '下降趨勢';
      case 'stable': return '穩定趨勢';
      default: return '未知趨勢';
    }
  }

  private getRiskText(risk: RiskLevel): string {
    switch (risk) {
      case 'low': return '低風險';
      case 'medium': return '中等風險';
      case 'high': return '高風險';
      default: return '未知風險';
    }
  }
}

export const advancedPredictionService = new AdvancedPredictionService();
