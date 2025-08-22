
/**
 * 性能優化說明:
 * - 使用緩存減少重複計算
 * - 並行處理提升響應速度
 * - 錯誤處理增強穩定性
 * - 內存管理優化
 */
import { logger } from '../utils/logger';
import { aiRecognitionService } from './aiRecognitionService';
import { antiCounterfeitService } from './antiCounterfeitService';
import { simulatedGradingService } from './simulatedGradingService';
import { advancedPredictionService } from './advancedPredictionService';

// 系統整合配置
export interface SystemIntegrationConfig {
  enableParallelProcessing: boolean;
  enableCrossValidation: boolean;
  enablePerformanceOptimization: boolean;
  enableErrorRecovery: boolean;
  enableCaching: boolean;
  maxConcurrentRequests: number;
  timeoutMs: number;
  retryAttempts: number;
}

// 整合分析結果
export interface IntegratedAnalysisResult {
  cardRecognition: {
    success: boolean;
    confidence: number;
    recognizedCard: any;
    processingTime: number;
  };
  antiCounterfeit: {
    success: boolean;
    isCounterfeit: boolean;
    confidence: number;
    riskLevel: string;
    processingTime: number;
  };
  grading: {
    success: boolean;
    overallGrade: number;
    subGrades: any;
    confidence: number;
    processingTime: number;
  };
  pricePrediction: {
    success: boolean;
    predictedPrice: number;
    confidence: number;
    trend: string;
    processingTime: number;
  };
  overall: {
    success: boolean;
    totalProcessingTime: number;
    confidence: number;
    recommendations: string[];
    riskAssessment: string;
  };
}

// 性能指標
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
  cacheHitRate: number;
}

export class SystemIntegrationService {
  private config: SystemIntegrationConfig;
  private cache: Map<string, any>;
  private performanceMetrics: PerformanceMetrics;

  constructor(config: SystemIntegrationConfig) {
    this.config = config;
    this.cache = new Map();
    this.performanceMetrics = {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: 0
      },
      cacheHitRate: 0
    };
  }

  // 主要整合分析功能
  async performIntegratedAnalysis(
    imageData: string,
    cardInfo: any
  ): Promise<IntegratedAnalysisResult> {
    const startTime = Date.now();
    
    try {
      logger.info('開始整合分析', { cardId: cardInfo.cardId });

      // 檢查緩存
      const cacheKey = this.generateCacheKey(imageData, cardInfo);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        logger.info('使用緩存結果');
        return cachedResult;
      }

      // 並行執行所有分析
      const results = await this.executeParallelAnalysis(imageData, cardInfo);

      // 交叉驗證
      const validatedResults = await this.performCrossValidation(results);

      // 生成整合結果
      const integratedResult = this.generateIntegratedResult(validatedResults, startTime);

      // 緩存結果
      this.cacheResult(cacheKey, integratedResult);

      // 更新性能指標
      this.updatePerformanceMetrics(startTime);

      logger.info('整合分析完成', {
        cardId: cardInfo.cardId,
        totalTime: integratedResult.overall.totalProcessingTime,
        confidence: integratedResult.overall.confidence
      });

      return integratedResult;
    } catch (error) {
      logger.error('整合分析失敗:', error);
      return this.generateErrorResult(error, startTime);
    }
  }

  // 並行執行分析
  private async executeParallelAnalysis(
    imageData: string,
    cardInfo: any
  ): Promise<any> {
    const analysisPromises = [
      this.executeCardRecognition(imageData, cardInfo),
      this.executeAntiCounterfeit(imageData, cardInfo),
      this.executeGrading(imageData, cardInfo),
      this.executePricePrediction(cardInfo)
    ];

    const results = await Promise.allSettled(analysisPromises);
    
    return {
      cardRecognition: this.handleSettledResult(results[0]),
      antiCounterfeit: this.handleSettledResult(results[1]),
      grading: this.handleSettledResult(results[2]),
      pricePrediction: this.handleSettledResult(results[3])
    };
  }

  // 處理 Promise 結果
  private handleSettledResult(result: PromiseSettledResult<any>): any {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      logger.error('分析執行失敗:', result.reason);
      return {
        success: false,
        error: result.reason.message,
        confidence: 0,
        processingTime: 0
      };
    }
  }

  // 執行卡牌辨識
  private async executeCardRecognition(imageData: string, cardInfo: any): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await aiRecognitionService.recognizeCard(imageData, {
        confidenceThreshold: 0.7,
        includeFeatures: true,
        includeCondition: true
      });

      return {
        success: true,
        confidence: result.data.confidence,
        recognizedCard: result.data.recognizedCard,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  // 執行防偽檢測
  private async executeAntiCounterfeit(imageData: string, cardInfo: any): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await antiCounterfeitService.analyzeCounterfeit(imageData, {
        aiModel: {
          modelVersion: 'v2.0',
          confidenceThreshold: 0.8,
          useMultiModel: true,
          imagePreprocessing: true
        },
        analysis: {
          includePrintQuality: true,
          includeMaterial: true,
          includeColor: true,
          includeFont: true,
          includeHologram: true,
          includeUVInspection: true
        },
        database: {
          includeOfficialDatabase: true,
          includeHistoricalData: true,
          includeVersionValidation: true,
          includeReleaseInfo: true
        },
        alert: {
          enableAutoAlert: false,
          alertThreshold: 0.7,
          notificationMethods: []
        }
      });

      return {
        success: true,
        isCounterfeit: result.isCounterfeit,
        confidence: result.confidence,
        riskLevel: result.riskLevel,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  // 執行鑑定
  private async executeGrading(imageData: string, cardInfo: any): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await simulatedGradingService.gradeCard(imageData, cardInfo, 'PSA');

      return {
        success: true,
        overallGrade: result.overallGrade,
        subGrades: result.subGrades,
        confidence: result.confidence,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  // 執行價格預測
  private async executePricePrediction(cardInfo: any): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await advancedPredictionService.getAdvancedPrediction(
        parseInt(cardInfo.cardId),
        'deepLSTM',
        '30d'
      );

      return {
        success: true,
        predictedPrice: result.predictedPrice,
        confidence: result.confidence,
        trend: result.trend,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  // 交叉驗證
  private async performCrossValidation(results: any): Promise<any> {
    if (!this.config.enableCrossValidation) {
      return results;
    }

    const validatedResults = { ...results };

    // 驗證卡牌辨識與防偽檢測的一致性
    if (results.cardRecognition.success && results.antiCounterfeit.success) {
      const consistency = this.validateRecognitionAntiCounterfeitConsistency(
        results.cardRecognition,
        results.antiCounterfeit
      );
      
      if (consistency < 0.7) {
        logger.warn('卡牌辨識與防偽檢測一致性較低', { consistency });
        validatedResults.cardRecognition.confidence *= 0.9;
        validatedResults.antiCounterfeit.confidence *= 0.9;
      }
    }

    // 驗證鑑定與價格預測的合理性
    if (results.grading.success && results.pricePrediction.success) {
      const reasonableness = this.validateGradingPriceReasonableness(
        results.grading,
        results.pricePrediction
      );
      
      if (reasonableness < 0.6) {
        logger.warn('鑑定結果與價格預測合理性較低', { reasonableness });
        validatedResults.grading.confidence *= 0.85;
        validatedResults.pricePrediction.confidence *= 0.85;
      }
    }

    return validatedResults;
  }

  // 驗證卡牌辨識與防偽檢測一致性
  private validateRecognitionAntiCounterfeitConsistency(
    recognition: any,
    antiCounterfeit: any
  ): number {
    // 如果防偽檢測顯示為假卡，但辨識置信度高，則一致性低
    if (antiCounterfeit.isCounterfeit && recognition.confidence > 0.8) {
      return 0.3;
    }
    
    // 如果防偽檢測顯示為真卡，且辨識置信度高，則一致性高
    if (!antiCounterfeit.isCounterfeit && recognition.confidence > 0.8) {
      return 0.9;
    }
    
    return 0.7; // 默認一致性
  }

  // 驗證鑑定與價格預測合理性
  private validateGradingPriceReasonableness(
    grading: any,
    pricePrediction: any
  ): number {
    // 高評級通常對應高價格
    if (grading.overallGrade >= 9.0 && pricePrediction.predictedPrice > 100) {
      return 0.9;
    }
    
    // 低評級通常對應低價格
    if (grading.overallGrade <= 6.0 && pricePrediction.predictedPrice < 50) {
      return 0.8;
    }
    
    // 中等評級價格範圍較寬
    if (grading.overallGrade >= 7.0 && grading.overallGrade <= 8.5) {
      return 0.7;
    }
    
    return 0.5; // 默認合理性
  }

  // 生成整合結果
  private generateIntegratedResult(results: any, startTime: number): IntegratedAnalysisResult {
    const totalTime = Date.now() - startTime;
    const successCount = Object.values(results).filter((r: any) => r.success).length;
    const overallSuccess = successCount >= 3; // 至少3個分析成功

    // 計算整體置信度
    const confidences = Object.values(results)
      .filter((r: any) => r.success)
      .map((r: any) => r.confidence);
    
    const overallConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;

    // 生成建議
    const recommendations = this.generateRecommendations(results);

    // 風險評估
    const riskAssessment = this.assessOverallRisk(results);

    return {
      cardRecognition: results.cardRecognition,
      antiCounterfeit: results.antiCounterfeit,
      grading: results.grading,
      pricePrediction: results.pricePrediction,
      overall: {
        success: overallSuccess,
        totalProcessingTime: totalTime,
        confidence: overallConfidence,
        recommendations,
        riskAssessment
      }
    };
  }

  // 生成建議
  private generateRecommendations(results: any): string[] {
    const recommendations = [];

    if (!results.cardRecognition.success) {
      recommendations.push('卡牌辨識失敗，建議重新拍攝或檢查圖片質量');
    }

    if (results.antiCounterfeit.success && results.antiCounterfeit.isCounterfeit) {
      recommendations.push('檢測到假卡風險，建議尋求專業鑑定');
    }

    if (results.grading.success && results.grading.overallGrade < 7.0) {
      recommendations.push('卡片評級較低，建議專業修復或重新評估');
    }

    if (results.pricePrediction.success && results.pricePrediction.confidence < 0.7) {
      recommendations.push('價格預測置信度較低，建議參考多個來源');
    }

    if (recommendations.length === 0) {
      recommendations.push('所有分析完成，結果可信度高');
    }

    return recommendations;
  }

  // 風險評估
  private assessOverallRisk(results: any): string {
    const risks = [];

    if (results.antiCounterfeit.success && results.antiCounterfeit.isCounterfeit) {
      risks.push('假卡風險');
    }

    if (results.grading.success && results.grading.overallGrade < 6.0) {
      risks.push('低評級風險');
    }

    if (results.pricePrediction.success && results.pricePrediction.confidence < 0.6) {
      risks.push('價格預測不確定性');
    }

    if (risks.length === 0) {
      return '低風險';
    } else if (risks.length === 1) {
      return '中等風險';
    } else {
      return '高風險';
    }
  }

  // 緩存管理
  private generateCacheKey(imageData: string, cardInfo: any): string {
    return `${cardInfo.cardId}_${Date.now()}`;
  }

  private getFromCache(key: string): any {
    if (!this.config.enableCaching) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5分鐘過期
      this.performanceMetrics.cacheHitRate += 1;
      return cached.data;
    }
    
    return null;
  }

  private cacheResult(key: string, data: any): void {
    if (!this.config.enableCaching) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // 清理過期緩存
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > 300000) {
          this.cache.delete(k);
        }
      }
    }
  }

  // 性能監控
  private updatePerformanceMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.performanceMetrics.responseTime = 
      (this.performanceMetrics.responseTime + responseTime) / 2;
    
    this.performanceMetrics.throughput += 1;
    
    // 模擬資源使用
    this.performanceMetrics.resourceUsage.cpu = 60 + Math.random() * 20;
    this.performanceMetrics.resourceUsage.memory = 70 + Math.random() * 15;
    this.performanceMetrics.resourceUsage.network = 40 + Math.random() * 30;
  }

  // 獲取性能指標
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // 錯誤結果生成
  private generateErrorResult(error: any, startTime: number): IntegratedAnalysisResult {
    const totalTime = Date.now() - startTime;
    
    return {
      cardRecognition: { success: false, confidence: 0, recognizedCard: null, processingTime: 0 },
      antiCounterfeit: { success: false, isCounterfeit: false, confidence: 0, riskLevel: 'unknown', processingTime: 0 },
      grading: { success: false, overallGrade: 0, subGrades: {}, confidence: 0, processingTime: 0 },
      pricePrediction: { success: false, predictedPrice: 0, confidence: 0, trend: 'unknown', processingTime: 0 },
      overall: {
        success: false,
        totalProcessingTime: totalTime,
        confidence: 0,
        recommendations: ['系統錯誤，請重試'],
        riskAssessment: '未知'
      }
    };
  }
}
