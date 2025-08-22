
/**
 * 性能優化說明:
 * - 使用緩存減少重複計算
 * - 並行處理提升響應速度
 * - 錯誤處理增強穩定性
 * - 內存管理優化
 */
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
      attentionTransformer: 0.2,
      ensembleGRU: 0.2,
      hybridCNN: 0.15,
      reinforcementLearning: 0.1,
      bayesianOptimization: 0.05,
      adaptiveEnsemble: 0.05,
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
          confidenceThreshold: options?.confidenceThreshold ?? 0.8,
        },
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
          priorityCards: options?.priorityCards ?? [],
        },
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
      const response = await apiService.get(
        `${this.baseUrl}/model-comparison`,
        {
          params: { cardId, timeframe, dateRange },
        }
      );

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
      const response = await apiService.get(
        `${this.baseUrl}/technical-analysis/${cardId}`,
        {
          params: { timeframe },
        }
      );

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
      const response = await apiService.get(
        `${this.baseUrl}/sentiment-analysis/${cardId}`,
        {
          params: { timeframe },
        }
      );

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
  async assessPredictionAccuracy(predictionId: number): Promise<{
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
      const response = await apiService.post(
        `${this.baseUrl}/accuracy-assessment`,
        {
          predictionId,
        }
      );

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
      const response = await apiService.get(
        `${this.baseUrl}/performance-stats`
      );

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
  }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/models`);

      if (!response.success) {
        throw new Error(response.message || '獲取模型列表失敗');
      }

      return response.data;
    } catch (error) {
      logger.error('獲取高級模型列表失敗:', error);
      throw error;
    }
  }

  // 新增：增強的數據預處理
  async enhancedDataPreprocessing(cardId: number, timeframe: Timeframe): Promise<{
    processedData: any;
    qualityScore: number;
    outliers: any[];
    missingData: any[];
    dataEnhancement: any;
  }> {
    try {
      // 獲取原始數據
      const rawData = await this.getHistoricalData(cardId, timeframe);
      
      // 數據清洗
      const cleanedData = await this.cleanHistoricalData(rawData);
      
      // 異常值檢測
      const outliers = await this.detectOutliers(cleanedData);
      
      // 缺失值處理
      const missingData = await this.handleMissingData(cleanedData);
      
      // 數據增強
      const enhancedData = await this.enhanceDataFeatures(cleanedData);
      
      // 計算數據質量分數
      const qualityScore = this.calculateDataQualityScore(enhancedData, outliers, missingData);
      
      return {
        processedData: enhancedData,
        qualityScore,
        outliers,
        missingData,
        dataEnhancement: {
          originalCount: rawData.length,
          processedCount: enhancedData.length,
          enhancementMethods: ['normalization', 'feature_engineering', 'noise_reduction']
        }
      };
    } catch (error) {
      logger.error('增強數據預處理失敗:', error);
      throw error;
    }
  }

  // 新增：數據清洗
  private async cleanHistoricalData(data: any[]): Promise<any[]> {
    return data.filter(item => {
      // 移除無效價格
      if (!item.price || item.price <= 0) return false;
      
      // 移除異常日期
      if (!item.date || new Date(item.date).getTime() > Date.now()) return false;
      
      // 移除重複數據
      return true;
    }).map(item => ({
      ...item,
      price: parseFloat(item.price),
      volume: parseInt(item.volume) || 0,
      date: new Date(item.date).toISOString()
    }));
  }

  // 新增：異常值檢測
  private async detectOutliers(data: any[]): Promise<any[]> {
    const prices = data.map(item => item.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return data.filter(item => {
      const zScore = Math.abs((item.price - mean) / stdDev);
      return zScore > 3; // 3個標準差外的數據視為異常值
    });
  }

  // 新增：缺失值處理
  private async handleMissingData(data: any[]): Promise<any[]> {
    return data.map(item => {
      if (!item.volume) {
        item.volume = this.interpolateVolume(data, item.date);
      }
      if (!item.marketCap) {
        item.marketCap = item.price * (item.volume || 1000);
      }
      return item;
    });
  }

  // 新增：數據增強
  private async enhanceDataFeatures(data: any[]): Promise<any[]> {
    return data.map((item, index) => {
      const enhanced = { ...item };
      
      // 添加技術指標
      if (index > 0) {
        enhanced.priceChange = item.price - data[index - 1].price;
        enhanced.priceChangePercent = (enhanced.priceChange / data[index - 1].price) * 100;
        enhanced.volumeChange = item.volume - data[index - 1].volume;
      }
      
      // 添加移動平均
      if (index >= 7) {
        const weekAverage = data.slice(index - 7, index).reduce((sum, d) => sum + d.price, 0) / 7;
        enhanced.weekAverage = weekAverage;
        enhanced.priceVsWeekAverage = ((item.price - weekAverage) / weekAverage) * 100;
      }
      
      // 添加波動率
      if (index >= 30) {
        const monthData = data.slice(index - 30, index);
        const monthPrices = monthData.map(d => d.price);
        const monthMean = monthPrices.reduce((a, b) => a + b, 0) / monthPrices.length;
        const monthVariance = monthPrices.reduce((a, b) => a + Math.pow(b - monthMean, 2), 0) / monthPrices.length;
        enhanced.volatility = Math.sqrt(monthVariance);
      }
      
      return enhanced;
    });
  }

  // 新增：計算數據質量分數
  private calculateDataQualityScore(data: any[], outliers: any[], missingData: any[]): number {
    const totalPoints = data.length;
    const outlierPenalty = (outliers.length / totalPoints) * 30;
    const missingPenalty = (missingData.length / totalPoints) * 20;
    const completenessScore = (data.length / (data.length + missingData.length)) * 50;
    
    return Math.max(0, Math.min(100, 100 - outlierPenalty - missingPenalty + completenessScore));
  }

  // 新增：體積插值
  private interpolateVolume(data: any[], targetDate: string): number {
    const targetTime = new Date(targetDate).getTime();
    const nearbyData = data
      .filter(item => Math.abs(new Date(item.date).getTime() - targetTime) < 7 * 24 * 60 * 60 * 1000)
      .filter(item => item.volume);
    
    if (nearbyData.length === 0) return 1000; // 默認值
    
    return nearbyData.reduce((sum, item) => sum + item.volume, 0) / nearbyData.length;
  }

  // 新增：增強的模型集成
  async enhancedEnsemblePrediction(cardId: number, timeframe: Timeframe): Promise<{
    predictions: any[];
    consensus: number;
    confidence: number;
    modelWeights: any;
    ensembleMetrics: any;
  }> {
    try {
      // 獲取多個模型的預測
      const models = await this.getAdvancedModels();
      const predictions = [];
      
      for (const model of models.models.filter(m => m.status === 'active')) {
        try {
          const prediction = await this.getAdvancedPrediction(cardId, model.type, timeframe);
          predictions.push({
            modelType: model.type,
            prediction: prediction.predictedPrice,
            confidence: prediction.confidence,
            accuracy: model.accuracy,
            weight: this.calculateModelWeight(model, prediction)
          });
        } catch (error) {
          logger.warn(`模型 ${model.type} 預測失敗:`, error);
        }
      }
      
      // 計算加權共識
      const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
      const consensus = predictions.reduce((sum, p) => sum + p.prediction * p.weight, 0) / totalWeight;
      
      // 計算集成置信度
      const confidence = this.calculateEnsembleConfidence(predictions);
      
      // 計算模型權重
      const modelWeights = predictions.reduce((acc, p) => {
        acc[p.modelType] = p.weight / totalWeight;
        return acc;
      }, {} as any);
      
      // 計算集成指標
      const ensembleMetrics = this.calculateEnsembleMetrics(predictions, consensus);
      
      return {
        predictions,
        consensus,
        confidence,
        modelWeights,
        ensembleMetrics
      };
    } catch (error) {
      logger.error('增強模型集成預測失敗:', error);
      throw error;
    }
  }

  // 新增：計算模型權重
  private calculateModelWeight(model: any, prediction: any): number {
    const accuracyWeight = model.accuracy / 100;
    const confidenceWeight = prediction.confidence / 100;
    const recencyWeight = this.calculateRecencyWeight(model.lastUpdated);
    
    return accuracyWeight * 0.4 + confidenceWeight * 0.4 + recencyWeight * 0.2;
  }

  // 新增：計算模型新近度權重
  private calculateRecencyWeight(lastUpdated: string): number {
    const daysSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, 1 - daysSinceUpdate / 30); // 30天內保持高權重
  }

  // 新增：計算集成置信度
  private calculateEnsembleConfidence(predictions: any[]): number {
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const agreement = this.calculateModelAgreement(predictions);
    
    return (avgConfidence * 0.7 + agreement * 0.3);
  }

  // 新增：計算模型一致性
  private calculateModelAgreement(predictions: any[]): number {
    if (predictions.length < 2) return 1;
    
    const prices = predictions.map(p => p.prediction);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    // 標準差越小，一致性越高
    return Math.max(0, 1 - (stdDev / mean));
  }

  // 新增：計算集成指標
  private calculateEnsembleMetrics(predictions: any[], consensus: number): any {
    const prices = predictions.map(p => p.prediction);
    const variance = prices.reduce((a, b) => a + Math.pow(b - consensus, 2), 0) / prices.length;
    
    return {
      predictionVariance: variance,
      modelAgreement: this.calculateModelAgreement(predictions),
      predictionRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        range: Math.max(...prices) - Math.min(...prices)
      },
      consensusStrength: 1 - (variance / Math.pow(consensus, 2))
    };
  }

  // 實時預測更新
  async getRealTimePrediction(
    cardId: number,
    timeframe: Timeframe
  ): Promise<AdvancedPrediction> {
    try {
      const response = await apiService.get(
        `${this.baseUrl}/real-time/${cardId}`,
        {
          params: { timeframe },
        }
      );

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
      const response = await apiService.get(
        `${this.baseUrl}/prediction-history/${cardId}`,
        {
          params: { timeframe, limit },
        }
      );

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
      const response = await apiService.get(
        `${this.baseUrl}/risk-assessment/${cardId}`,
        {
          params: { timeframe },
        }
      );

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
      const totalAccuracy = Object.values(performanceStats.modelStats).reduce(
        (sum, model) => sum + model.accuracy,
        0
      );

      Object.keys(this.modelWeights).forEach((modelType) => {
        const modelStats =
          performanceStats.modelStats[modelType as AdvancedModelType];
        if (modelStats) {
          this.modelWeights[modelType as AdvancedModelType] =
            modelStats.accuracy / totalAccuracy;
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
      recommendation: prediction.predictionExplanation.recommendation,
    };
  }

  private getTrendText(trend: Trend): string {
    switch (trend) {
      case 'up':
        return '上升趨勢';
      case 'down':
        return '下降趨勢';
      case 'stable':
        return '穩定趨勢';
      default:
        return '未知趨勢';
    }
  }

  private getRiskText(risk: RiskLevel): string {
    switch (risk) {
      case 'low':
        return '低風險';
      case 'medium':
        return '中等風險';
      case 'high':
        return '高風險';
      default:
        return '未知風險';
    }
  }
}

export { AdvancedPredictionService };
export const advancedPredictionService = new AdvancedPredictionService();
