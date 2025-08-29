import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import { z } from 'zod';

// AI準確率提升配置
export interface AIAccuracyEnhancementConfig {
  // 訓練數據配置
  trainingData: {
    minDataPoints: number;
    targetAccuracy: number;
    dataAugmentation: boolean;
    qualityThreshold: number;
    autoCollection: boolean;
  };

  // 模型優化配置
  modelOptimization: {
    useEnsemble: boolean;
    adaptiveLearning: boolean;
    crossValidation: boolean;
    hyperparameterTuning: boolean;
    modelVersioning: boolean;
  };

  // 實時反饋配置
  realTimeFeedback: {
    userCorrectionCollection: boolean;
    confidenceThreshold: number;
    autoRetraining: boolean;
    feedbackValidation: boolean;
    correctionReward: boolean;
  };

  // 性能監控配置
  performanceMonitoring: {
    accuracyTracking: boolean;
    driftDetection: boolean;
    alertThreshold: number;
    performanceDashboard: boolean;
    automatedReports: boolean;
  };
}

// 訓練數據統計
export interface TrainingDataStats {
  totalDataPoints: number;
  highQualityData: number;
  lowQualityData: number;
  dataDistribution: {
    cardTypes: Record<string, number>;
    rarities: Record<string, number>;
    conditions: Record<string, number>;
  };
  accuracyByCategory: {
    cardType: Record<string, number>;
    rarity: Record<string, number>;
    condition: Record<string, number>;
  };
  dataQualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    overallScore: number;
  };
}

// 模型性能指標
export interface ModelPerformanceMetrics {
  currentAccuracy: number;
  targetAccuracy: number;
  improvementNeeded: number;
  modelVersion: string;
  lastUpdated: string;
  performanceHistory: {
    date: string;
    accuracy: number;
    confidence: number;
    processingTime: number;
  }[];
  accuracyByModel: {
    modelName: string;
    accuracy: number;
    confidence: number;
    usageCount: number;
  }[];
}

// 用戶反饋數據
export interface UserFeedbackData {
  feedbackId: string;
  userId: string;
  cardId: string;
  originalPrediction: {
    cardName: string;
    confidence: number;
    alternatives: string[];
  };
  userCorrection: {
    correctCardName: string;
    confidence: number;
    reason: string;
  };
  feedbackQuality: number;
  timestamp: string;
  status: 'pending' | 'validated' | 'incorporated' | 'rejected';
}

// 準確率提升建議
export interface AccuracyImprovementSuggestion {
  category: 'data' | 'model' | 'preprocessing' | 'postprocessing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedTime: string;
  dependencies: string[];
}

// AI準確率提升服務類
class AIAccuracyEnhancementService {
  private config: AIAccuracyEnhancementConfig = {
    trainingData: {
      minDataPoints: 10000,
      targetAccuracy: 0.95,
      dataAugmentation: true,
      qualityThreshold: 0.8,
      autoCollection: true,
    },
    modelOptimization: {
      useEnsemble: true,
      adaptiveLearning: true,
      crossValidation: true,
      hyperparameterTuning: true,
      modelVersioning: true,
    },
    realTimeFeedback: {
      userCorrectionCollection: true,
      confidenceThreshold: 0.7,
      autoRetraining: true,
      feedbackValidation: true,
      correctionReward: true,
    },
    performanceMonitoring: {
      accuracyTracking: true,
      driftDetection: true,
      alertThreshold: 0.05,
      performanceDashboard: true,
      automatedReports: true,
    },
  };

  // 獲取當前配置
  getConfig(): AIAccuracyEnhancementConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<AIAccuracyEnhancementConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('✅ AI準確率提升配置已更新', { config: this.config });
  }

  // 收集訓練數據
  async collectTrainingData(options?: {
    cardTypes?: string[];
    rarities?: string[];
    conditions?: string[];
    minQuality?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    dataCollected: number;
    qualityScore: number;
    distribution: Record<string, number>;
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 開始收集訓練數據', { options });

        const response = await apiService.post(
          '/ai/accuracy/training-data/collect',
          {
            config: this.config.trainingData,
            options,
          }
        );

        logger.info('✅ 訓練數據收集完成', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 數據增強
  async augmentTrainingData(
    dataId: string,
    augmentationMethods: string[]
  ): Promise<{
    success: boolean;
    augmentedDataCount: number;
    qualityMetrics: {
      originalQuality: number;
      augmentedQuality: number;
      improvement: number;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 開始數據增強', { dataId, augmentationMethods });

        const response = await apiService.post(
          `/ai/accuracy/training-data/${dataId}/augment`,
          {
            methods: augmentationMethods,
            config: this.config.trainingData,
          }
        );

        logger.info('✅ 數據增強完成', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 模型優化
  async optimizeModel(options?: {
    optimizationType: 'ensemble' | 'hyperparameter' | 'architecture' | 'all';
    targetAccuracy?: number;
    maxIterations?: number;
  }): Promise<{
    success: boolean;
    newAccuracy: number;
    improvement: number;
    modelVersion: string;
    optimizationDetails: {
      method: string;
      parameters: Record<string, any>;
      performance: Record<string, number>;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 開始模型優化', { options });

        const response = await apiService.post('/ai/accuracy/model/optimize', {
          config: this.config.modelOptimization,
          options,
        });

        logger.info('✅ 模型優化完成', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 收集用戶反饋
  async collectUserFeedback(
    feedback: Omit<UserFeedbackData, 'feedbackId' | 'timestamp' | 'status'>
  ): Promise<{
    success: boolean;
    feedbackId: string;
    qualityScore: number;
    reward?: number;
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 收集用戶反饋', { feedback });

        const response = await apiService.post(
          '/ai/accuracy/feedback/collect',
          {
            feedback,
            config: this.config.realTimeFeedback,
          }
        );

        logger.info('✅ 用戶反饋收集完成', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 驗證反饋質量
  async validateFeedback(feedbackId: string): Promise<{
    success: boolean;
    isValid: boolean;
    qualityScore: number;
    validationDetails: {
      consistency: number;
      reliability: number;
      completeness: number;
    };
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 驗證反饋質量', { feedbackId });

        const response = await apiService.post(
          `/ai/accuracy/feedback/${feedbackId}/validate`,
          {
            config: this.config.realTimeFeedback,
          }
        );

        logger.info('✅ 反饋驗證完成', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 自動重新訓練
  async autoRetrain(
    trigger:
      | 'accuracy_drop'
      | 'data_increase'
      | 'feedback_threshold'
      | 'scheduled'
  ): Promise<{
    success: boolean;
    retrainingId: string;
    estimatedTime: string;
    expectedImprovement: number;
  }> {
    return withErrorHandling(
      async () => {
        logger.info('🔄 開始自動重新訓練', { trigger });

        const response = await apiService.post(
          '/ai/accuracy/model/auto-retrain',
          {
            trigger,
            config: {
              ...this.config.modelOptimization,
              ...this.config.realTimeFeedback,
            },
          }
        );

        logger.info('✅ 自動重新訓練已啟動', { result: response.data });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 獲取訓練數據統計
  async getTrainingDataStats(): Promise<TrainingDataStats> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          '/ai/accuracy/training-data/stats'
        );
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 獲取模型性能指標
  async getModelPerformanceMetrics(): Promise<ModelPerformanceMetrics> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/ai/accuracy/model/performance');
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 獲取準確率提升建議
  async getAccuracyImprovementSuggestions(): Promise<
    AccuracyImprovementSuggestion[]
  > {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          '/ai/accuracy/improvement-suggestions'
        );
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 監控準確率變化
  async monitorAccuracyChange(timeRange: '1d' | '7d' | '30d' | '90d'): Promise<{
    currentAccuracy: number;
    previousAccuracy: number;
    change: number;
    trend: 'improving' | 'declining' | 'stable';
    alerts: {
      type: 'accuracy_drop' | 'drift_detected' | 'performance_degradation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: string;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai/accuracy/monitor?timeRange=${timeRange}`
        );
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 生成準確率報告
  async generateAccuracyReport(options?: {
    includeTrainingData?: boolean;
    includeModelPerformance?: boolean;
    includeUserFeedback?: boolean;
    includeSuggestions?: boolean;
    format?: 'json' | 'pdf' | 'csv';
  }): Promise<{
    success: boolean;
    reportId: string;
    downloadUrl?: string;
    summary: {
      currentAccuracy: number;
      targetAccuracy: number;
      improvementNeeded: number;
      topSuggestions: string[];
      nextActions: string[];
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai/accuracy/report/generate', {
          config: this.config.performanceMonitoring,
          options,
        });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 設置準確率目標
  async setAccuracyTarget(
    target: number,
    deadline: string
  ): Promise<{
    success: boolean;
    currentAccuracy: number;
    targetAccuracy: number;
    gap: number;
    estimatedEffort: string;
    milestones: {
      date: string;
      targetAccuracy: number;
      description: string;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai/accuracy/target/set', {
          target,
          deadline,
          config: this.config,
        });
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }

  // 獲取準確率提升進度
  async getAccuracyImprovementProgress(): Promise<{
    currentAccuracy: number;
    targetAccuracy: number;
    progress: number;
    remainingWork: number;
    estimatedCompletion: string;
    recentImprovements: {
      date: string;
      improvement: number;
      method: string;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/ai/accuracy/progress');
        return response.data;
      },
      { service: 'AIAccuracyEnhancement' }
    )();
  }
}

// 創建單例實例
export { AIAccuracyEnhancementService };
export const aiAccuracyEnhancementService = new AIAccuracyEnhancementService();
