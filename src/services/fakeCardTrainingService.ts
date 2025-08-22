import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput } from '../utils/validationService';
import { z } from 'zod';

// 假卡訓練數據類型
export interface FakeCardTrainingData {
  id: string;
  cardName: string;
  cardType: string;
  fakeType: 'counterfeit' | 'reprint' | 'custom' | 'proxy';
  imageUrls: string[];
  description: string;
  fakeIndicators: string[];
  submissionDate: string;
  status: 'approved' | 'rejected';
  reviewerNotes?: string;
  trainingFeatures: {
    visualFeatures: string[];
    textFeatures: string[];
    materialFeatures: string[];
    printingFeatures: string[];
  };
  aiTrainingMetrics: {
    confidenceScore: number;
    accuracyScore: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
}

// 訓練模型配置
export interface TrainingModelConfig {
  modelType: 'authenticity' | 'grading' | 'hybrid';
  algorithm: 'cnn' | 'transformer' | 'ensemble';
  trainingEpochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  dataAugmentation: boolean;
  useTransferLearning: boolean;
  pretrainedModel?: string;
}

// 訓練結果
export interface TrainingResult {
  modelId: string;
  modelVersion: string;
  trainingMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
    validationAccuracy: number;
  };
  trainingTime: number;
  dataSize: {
    totalSamples: number;
    fakeSamples: number;
    realSamples: number;
    validationSamples: number;
  };
  performance: {
    averageInferenceTime: number;
    memoryUsage: number;
    modelSize: number;
  };
  deploymentStatus: 'training' | 'ready' | 'deployed' | 'failed';
}

// 模型評估結果
export interface ModelEvaluationResult {
  modelId: string;
  evaluationMetrics: {
    overallAccuracy: number;
    precisionByType: Record<string, number>;
    recallByType: Record<string, number>;
    confusionMatrix: number[][];
    rocCurve: Array<{ fpr: number; tpr: number }>;
    aucScore: number;
  };
  performanceAnalysis: {
    fastPredictions: number;
    slowPredictions: number;
    errorAnalysis: Array<{
      cardId: string;
      predictedType: string;
      actualType: string;
      confidence: number;
      errorReason: string;
    }>;
  };
  recommendations: string[];
}

// 假卡訓練服務類
class FakeCardTrainingService {
  private config = {
    baseUrl: API_ENDPOINTS.FAKE_CARD.DATABASE,
    trainingEndpoint: '/training',
    evaluationEndpoint: '/evaluation',
    deploymentEndpoint: '/deployment',
  };

  // 獲取假卡訓練數據
  async getTrainingData(
    filters?: {
      fakeType?: string[];
      status?: 'approved' | 'rejected';
      dateRange?: { start: string; end: string };
      minSamples?: number;
    }
  ): Promise<ApiResponse<FakeCardTrainingData[]>> {
    try {
      const response = await apiService.get<FakeCardTrainingData[]>(
        `${this.config.baseUrl}/training-data`,
        { params: filters }
      );

      logger.info('✅ 成功獲取假卡訓練數據', {
        count: response.data?.length || 0,
        filters,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取假卡訓練數據失敗:', { error: error.message });
      throw error;
    }
  }

  // 開始模型訓練
  async startTraining(
    config: TrainingModelConfig,
    dataFilters?: any
  ): Promise<ApiResponse<{ trainingId: string; estimatedTime: number }>> {
    try {
      const validationResult = validateInput(
        z.object({
          modelType: z.enum(['authenticity', 'grading', 'hybrid']),
          algorithm: z.enum(['cnn', 'transformer', 'ensemble']),
          trainingEpochs: z.number().min(1).max(1000),
          batchSize: z.number().min(1).max(512),
          learningRate: z.number().min(0.0001).max(1),
          validationSplit: z.number().min(0.1).max(0.5),
          dataAugmentation: z.boolean(),
          useTransferLearning: z.boolean(),
        }),
        config
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '訓練配置驗證失敗');
      }

      const requestData = {
        config,
        dataFilters,
        timestamp: new Date().toISOString(),
      };

      const response = await apiService.post<{
        trainingId: string;
        estimatedTime: number;
      }>(`${this.config.trainingEndpoint}/start`, requestData);

      logger.info('✅ 開始模型訓練', {
        trainingId: response.data?.trainingId,
        modelType: config.modelType,
        algorithm: config.algorithm,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 開始模型訓練失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取訓練進度
  async getTrainingProgress(
    trainingId: string
  ): Promise<ApiResponse<TrainingResult>> {
    try {
      const response = await apiService.get<TrainingResult>(
        `${this.config.trainingEndpoint}/progress/${trainingId}`
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取訓練進度失敗:', { error: error.message });
      throw error;
    }
  }

  // 評估模型性能
  async evaluateModel(
    modelId: string,
    testDataFilters?: any
  ): Promise<ApiResponse<ModelEvaluationResult>> {
    try {
      const requestData = {
        modelId,
        testDataFilters,
        evaluationMetrics: [
          'accuracy',
          'precision',
          'recall',
          'f1_score',
          'confusion_matrix',
          'roc_curve',
          'auc_score',
        ],
      };

      const response = await apiService.post<ModelEvaluationResult>(
        `${this.config.evaluationEndpoint}/evaluate`,
        requestData
      );

      logger.info('✅ 模型評估完成', {
        modelId,
        overallAccuracy: response.data?.evaluationMetrics.overallAccuracy,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 模型評估失敗:', { error: error.message });
      throw error;
    }
  }

  // 部署模型
  async deployModel(
    modelId: string,
    deploymentConfig?: {
      environment: 'development' | 'staging' | 'production';
      autoScaling: boolean;
      maxConcurrentRequests: number;
      healthCheckInterval: number;
    }
  ): Promise<ApiResponse<{ deploymentId: string; status: string }>> {
    try {
      const requestData = {
        modelId,
        deploymentConfig: {
          environment: 'production',
          autoScaling: true,
          maxConcurrentRequests: 1000,
          healthCheckInterval: 30,
          ...deploymentConfig,
        },
      };

      const response = await apiService.post<{
        deploymentId: string;
        status: string;
      }>(`${this.config.deploymentEndpoint}/deploy`, requestData);

      logger.info('✅ 模型部署成功', {
        modelId,
        deploymentId: response.data?.deploymentId,
        status: response.data?.status,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 模型部署失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取模型列表
  async getModels(
    filters?: {
      modelType?: string[];
      status?: string[];
      dateRange?: { start: string; end: string };
    }
  ): Promise<ApiResponse<TrainingResult[]>> {
    try {
      const response = await apiService.get<TrainingResult[]>(
        `${this.config.trainingEndpoint}/models`,
        { params: filters }
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取模型列表失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取訓練統計
  async getTrainingStats(): Promise<ApiResponse<{
    totalModels: number;
    activeTraining: number;
    deployedModels: number;
    averageAccuracy: number;
    totalTrainingData: number;
    recentPerformance: Array<{
      date: string;
      accuracy: number;
      modelType: string;
    }>;
  }>> {
    try {
      const response = await apiService.get<{
        totalModels: number;
        activeTraining: number;
        deployedModels: number;
        averageAccuracy: number;
        totalTrainingData: number;
        recentPerformance: Array<{
          date: string;
          accuracy: number;
          modelType: string;
        }>;
      }>(`${this.config.trainingEndpoint}/stats`);

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取訓練統計失敗:', { error: error.message });
      throw error;
    }
  }

  // 更新假卡數據的訓練特徵
  async updateTrainingFeatures(
    fakeCardId: string,
    features: {
      visualFeatures: string[];
      textFeatures: string[];
      materialFeatures: string[];
      printingFeatures: string[];
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiService.patch<{ success: boolean }>(
        `${this.config.baseUrl}/training-features/${fakeCardId}`,
        { features }
      );

      logger.info('✅ 更新假卡訓練特徵成功', { fakeCardId });

      return response;
    } catch (error: any) {
      logger.error('❌ 更新假卡訓練特徵失敗:', { error: error.message });
      throw error;
    }
  }

  // 批量更新訓練數據
  async batchUpdateTrainingData(
    updates: Array<{
      fakeCardId: string;
      trainingFeatures?: any;
      aiTrainingMetrics?: any;
    }>
  ): Promise<ApiResponse<{ success: boolean; updatedCount: number }>> {
    try {
      const response = await apiService.patch<{
        success: boolean;
        updatedCount: number;
      }>(`${this.config.baseUrl}/batch-update`, { updates });

      logger.info('✅ 批量更新訓練數據成功', {
        updatedCount: response.data?.updatedCount,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 批量更新訓練數據失敗:', { error: error.message });
      throw error;
    }
  }
}

export const fakeCardTrainingService = new FakeCardTrainingService();
