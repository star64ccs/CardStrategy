import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import { z } from 'zod';

// 價格預測優化配置
export interface PricePredictionOptimizationConfig {
  // 市場因素配置
  marketFactors: {
    sentimentAnalysis: boolean;
    eventImpact: boolean;
    seasonalFactors: boolean;
    competitiveAnalysis: boolean;
    socialMediaTrends: boolean;
    newsAnalysis: boolean;
  };

  // 模型架構配置
  modelArchitecture: {
    useDeepLearning: boolean;
    useEnsemble: boolean;
    useLSTM: boolean;
    useTransformer: boolean;
    useAttention: boolean;
    crossValidation: boolean;
  };

  // 特徵工程配置
  featureEngineering: {
    technicalIndicators: boolean;
    fundamentalAnalysis: boolean;
    marketMicrostructure: boolean;
    sentimentFeatures: boolean;
    temporalFeatures: boolean;
    interactionFeatures: boolean;
  };

  // 預測驗證配置
  predictionValidation: {
    accuracyTracking: boolean;
    confidenceCalibration: boolean;
    backtesting: boolean;
    outOfSampleTesting: boolean;
    modelComparison: boolean;
  };
}

// 市場因素數據
export interface MarketFactorsData {
  sentiment: {
    overall: number;
    positive: number;
    negative: number;
    neutral: number;
    sources: {
      social: number;
      news: number;
      forum: number;
    };
  };
  events: {
    upcoming: {
      name: string;
      date: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
    }[];
    recent: {
      name: string;
      date: string;
      impact: number;
      priceChange: number;
    }[];
  };
  seasonal: {
    currentSeason: string;
    seasonalFactor: number;
    historicalPattern: number[];
  };
  competitive: {
    marketShare: number;
    competitorPrices: Record<string, number>;
    marketPosition: string;
  };
}

// 模型性能指標
export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  confidence: number;
  modelType: string;
  trainingDate: string;
  validationResults: {
    inSample: {
      accuracy: number;
      mape: number;
    };
    outOfSample: {
      accuracy: number;
      mape: number;
    };
    crossValidation: {
      accuracy: number;
      stdDev: number;
    };
  };
}

// 預測結果驗證
export interface PredictionValidation {
  predictionId: string;
  cardId: string;
  predictedPrice: number;
  actualPrice: number;
  accuracy: number;
  error: number;
  confidence: number;
  predictionDate: string;
  validationDate: string;
  factors: {
    marketSentiment: number;
    eventImpact: number;
    seasonalFactor: number;
    technicalIndicators: number;
  };
}

// 模型比較結果
export interface ModelComparisonResult {
  models: {
    name: string;
    type: string;
    accuracy: number;
    mape: number;
    confidence: number;
    trainingTime: number;
    predictionTime: number;
    advantages: string[];
    disadvantages: string[];
  }[];
  bestModel: string;
  ensemblePerformance: {
    accuracy: number;
    confidence: number;
    stability: number;
  };
}

// 特徵重要性分析
export interface FeatureImportanceAnalysis {
  features: {
    name: string;
    importance: number;
    correlation: number;
    stability: number;
    category: string;
  }[];
  topFeatures: string[];
  featureInteractions: {
    feature1: string;
    feature2: string;
    interactionStrength: number;
  }[];
}

// 價格預測優化服務類
class PricePredictionOptimizationService {
  private config: PricePredictionOptimizationConfig = {
    marketFactors: {
      sentimentAnalysis: true,
      eventImpact: true,
      seasonalFactors: true,
      competitiveAnalysis: true,
      socialMediaTrends: true,
      newsAnalysis: true,
    },
    modelArchitecture: {
      useDeepLearning: true,
      useEnsemble: true,
      useLSTM: true,
      useTransformer: true,
      useAttention: true,
      crossValidation: true,
    },
    featureEngineering: {
      technicalIndicators: true,
      fundamentalAnalysis: true,
      marketMicrostructure: true,
      sentimentFeatures: true,
      temporalFeatures: true,
      interactionFeatures: true,
    },
    predictionValidation: {
      accuracyTracking: true,
      confidenceCalibration: true,
      backtesting: true,
      outOfSampleTesting: true,
      modelComparison: true,
    },
  };

  // 獲取當前配置
  getConfig(): PricePredictionOptimizationConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<PricePredictionOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('✅ 價格預測優化配置已更新', { config: this.config });
  }

  // 整合市場因素
  async integrateMarketFactors(
    cardId: string,
    timeframe: string
  ): Promise<{
    success: boolean;
    marketFactors: MarketFactorsData;
    impactScore: number;
    confidence: number;
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 整合市場因素', { cardId, timeframe });

        const response = await apiService.post(
          '/ai/prediction/market-factors/integrate',
          {
            cardId,
            timeframe,
            config: this.config.marketFactors,
          }
        );

        logger.info('✅ 市場因素整合完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 改進模型架構
  async improveModelArchitecture(options?: {
    architectureType: 'deep_learning' | 'ensemble' | 'hybrid' | 'all';
    targetAccuracy?: number;
    maxTrainingTime?: number;
    useGPU?: boolean;
  }): Promise<{
    success: boolean;
    newModelVersion: string;
    performance: ModelPerformanceMetrics;
    trainingTime: number;
    improvements: {
      accuracy: number;
      confidence: number;
      stability: number;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 改進模型架構', { options });

        const response = await apiService.post(
          '/ai/prediction/model/improve-architecture',
          {
            config: this.config.modelArchitecture,
            options,
          }
        );

        logger.info('✅ 模型架構改進完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 優化特徵工程
  async optimizeFeatureEngineering(
    dataId: string,
    featureTypes: string[]
  ): Promise<{
    success: boolean;
    optimizedFeatures: number;
    featureImportance: FeatureImportanceAnalysis;
    performanceImprovement: number;
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 優化特徵工程', { dataId, featureTypes });

        const response = await apiService.post(
          `/ai/prediction/features/${dataId}/optimize`,
          {
            featureTypes,
            config: this.config.featureEngineering,
          }
        );

        logger.info('✅ 特徵工程優化完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 驗證預測準確性
  async validatePredictionAccuracy(predictionId: string): Promise<{
    success: boolean;
    validation: PredictionValidation;
    accuracyMetrics: {
      overall: number;
      byTimeframe: Record<string, number>;
      byCardType: Record<string, number>;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 驗證預測準確性', { predictionId });

        const response = await apiService.post(
          `/ai/prediction/${predictionId}/validate`,
          {
            config: this.config.predictionValidation,
          }
        );

        logger.info('✅ 預測準確性驗證完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 比較模型性能
  async compareModelPerformance(modelIds: string[]): Promise<{
    success: boolean;
    comparison: ModelComparisonResult;
    recommendations: string[];
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 比較模型性能', { modelIds });

        const response = await apiService.post(
          '/ai/prediction/models/compare',
          {
            modelIds,
            config: this.config.predictionValidation,
          }
        );

        logger.info('✅ 模型性能比較完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 執行回測
  async performBacktesting(options: {
    startDate: string;
    endDate: string;
    cardIds?: string[];
    modelVersion?: string;
  }): Promise<{
    success: boolean;
    backtestResults: {
      totalPredictions: number;
      accuratePredictions: number;
      averageAccuracy: number;
      averageMAPE: number;
      profitLoss: number;
      sharpeRatio: number;
    };
    detailedResults: {
      date: string;
      cardId: string;
      predictedPrice: number;
      actualPrice: number;
      accuracy: number;
      profitLoss: number;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 執行回測', { options });

        const response = await apiService.post('/ai/prediction/backtest', {
          options,
          config: this.config.predictionValidation,
        });

        logger.info('✅ 回測完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 獲取特徵重要性分析
  async getFeatureImportanceAnalysis(
    modelId: string
  ): Promise<FeatureImportanceAnalysis> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai/prediction/model/${modelId}/feature-importance`
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 獲取模型性能指標
  async getModelPerformanceMetrics(
    modelId: string
  ): Promise<ModelPerformanceMetrics> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai/prediction/model/${modelId}/performance`
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 獲取預測驗證歷史
  async getPredictionValidationHistory(
    cardId?: string,
    limit?: number
  ): Promise<{
    validations: PredictionValidation[];
    summary: {
      totalValidations: number;
      averageAccuracy: number;
      averageConfidence: number;
      accuracyTrend: 'improving' | 'declining' | 'stable';
    };
  }> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        if (cardId) params.append('cardId', cardId);
        if (limit) params.append('limit', limit.toString());

        const response = await apiService.get(
          `/ai/prediction/validation-history?${params}`
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 校準預測置信度
  async calibratePredictionConfidence(modelId: string): Promise<{
    success: boolean;
    calibrationResults: {
      beforeCalibration: {
        averageConfidence: number;
        accuracy: number;
        calibrationError: number;
      };
      afterCalibration: {
        averageConfidence: number;
        accuracy: number;
        calibrationError: number;
      };
      improvement: number;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 校準預測置信度', { modelId });

        const response = await apiService.post(
          `/ai/prediction/model/${modelId}/calibrate-confidence`,
          {
            config: this.config.predictionValidation,
          }
        );

        logger.info('✅ 預測置信度校準完成', { result: response.data });
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 生成預測優化報告
  async generateOptimizationReport(options?: {
    includeMarketFactors?: boolean;
    includeModelComparison?: boolean;
    includeFeatureAnalysis?: boolean;
    includeBacktestResults?: boolean;
    format?: 'json' | 'pdf' | 'csv';
  }): Promise<{
    success: boolean;
    reportId: string;
    downloadUrl?: string;
    summary: {
      currentAccuracy: number;
      targetAccuracy: number;
      improvementNeeded: number;
      topOptimizations: string[];
      nextSteps: string[];
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/ai/prediction/optimization-report/generate',
          {
            config: this.config,
            options,
          }
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 設置預測準確率目標
  async setPredictionAccuracyTarget(
    target: number,
    deadline: string
  ): Promise<{
    success: boolean;
    currentAccuracy: number;
    targetAccuracy: number;
    gap: number;
    estimatedEffort: string;
    optimizationPlan: {
      phase: string;
      description: string;
      expectedImprovement: number;
      timeline: string;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/ai/prediction/accuracy-target/set',
          {
            target,
            deadline,
            config: this.config,
          }
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }

  // 獲取優化進度
  async getOptimizationProgress(): Promise<{
    currentAccuracy: number;
    targetAccuracy: number;
    progress: number;
    recentOptimizations: {
      date: string;
      optimization: string;
      improvement: number;
    }[];
    nextOptimizations: {
      optimization: string;
      expectedImpact: number;
      estimatedTime: string;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          '/ai/prediction/optimization-progress'
        );
        return response.data;
      },
      { service: 'PricePredictionOptimization' }
    )();
  }
}

// 導出服務類和實例
export { PricePredictionOptimizationService };
export const pricePredictionOptimizationService =
  new PricePredictionOptimizationService();
