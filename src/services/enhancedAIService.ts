import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 增強版AI配置
export interface EnhancedAIConfig {
  // 識別配置
  recognition: {
    confidenceThreshold: number;
    maxAlternatives: number;
    includeFeatures: boolean;
    includeCondition: boolean;
    includeAuthenticity: boolean;
    modelVersion: string;
    useMultiModel: boolean; // 使用多模型融合
    imagePreprocessing: boolean; // 圖像預處理
  };

  // 條件分析配置
  conditionAnalysis: {
    includeDetailedFactors: boolean;
    includeDamageAssessment: boolean;
    includeMarketImpact: boolean;
    includePreservationTips: boolean;
    confidenceThreshold: number;
    useAdvancedMetrics: boolean; // 使用高級指標
    includeUVInspection: boolean; // 紫外線檢查
    includeMicroscopicAnalysis: boolean; // 顯微鏡分析
  };

  // 真偽驗證配置
  authenticityVerification: {
    includeCondition: boolean;
    includeMarketValue: boolean;
    includeAIInsights: boolean;
    useBlockchainVerification: boolean; // 區塊鏈驗證
    includeHologramAnalysis: boolean; // 全息圖分析
    includePrintingAnalysis: boolean; // 印刷分析
    includeMaterialAnalysis: boolean; // 材料分析
  };

  // 價格預測配置
  pricePrediction: {
    useMachineLearning: boolean;
    includeMarketSentiment: boolean;
    includeCompetitiveAnalysis: boolean;
    includeSeasonalFactors: boolean;
    includeEventImpact: boolean;
    confidenceThreshold: number;
    predictionHorizon: number; // 預測時間範圍（天）
    useEnsembleModels: boolean; // 使用集成模型
  };
}

// 增強版識別結果
export interface EnhancedRecognitionResult {
  success: boolean;
  message: string;
  data: {
    recognizedCard: any;
    confidence: number;
    alternatives: {
      card: any;
      confidence: number;
      reason: string;
      similarityScore: number;
    }[];
    imageFeatures: {
      dominantColors: string[];
      cardType: string;
      rarity: string;
      condition: string;
      authenticity: string;
      qualityScore: number;
      lightingAnalysis: {
        brightness: number;
        contrast: number;
        noise: number;
      };
      focusAnalysis: {
        sharpness: number;
        blur: number;
      };
    };
    processingTime: number;
    metadata: {
      imageSize: number;
      recognitionMethod: string;
      modelVersion: string;
      aiProvider: string;
      preprocessingApplied: boolean;
      multiModelFusion: boolean;
    };
  };
}

// 增強版條件分析結果
export interface EnhancedConditionAnalysisResult {
  success: boolean;
  message: string;
  data: {
    cardId: string;
    analysis: {
      overallGrade: string;
      overallScore: number;
      confidence: number;
      factors: {
        corners: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
          uvAnalysis?: {
            fluorescence: boolean;
            intensity: number;
          };
        };
        edges: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
          microscopicAnalysis?: {
            fiberAlignment: string;
            damageLevel: number;
          };
        };
        surface: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
          scratchAnalysis?: {
            depth: number;
            length: number;
            impact: number;
          };
        };
        centering: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
          precisionAnalysis?: {
            horizontalOffset: number;
            verticalOffset: number;
            tolerance: number;
          };
        };
        printQuality: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
          colorAnalysis?: {
            saturation: number;
            contrast: number;
            colorAccuracy: number;
          };
        };
      };
      damageAssessment: {
        scratches: number;
        dents: number;
        creases: number;
        stains: number;
        fading: number;
        totalDamage: number;
        damageMap: {
          locations: {x: number, y: number, type: string, severity: number}[];
          heatmap: string; // 損傷熱力圖
        };
      };
      marketImpact: {
        valueMultiplier: number;
        estimatedValue: number;
        valueRange: {
          min: number;
          max: number;
        };
        recommendations: string[];
        marketTrends: {
          conditionDemand: string;
          priceSensitivity: number;
        };
      };
      preservationTips: string[];
      restorationSuggestions: string[];
      advancedMetrics: {
        structuralIntegrity: number;
        aestheticAppeal: number;
        collectibilityScore: number;
        investmentPotential: number;
      };
    };
    processingTime: number;
    metadata: {
      analysisMethod: string;
      modelVersion: string;
      imageQuality: string;
      lightingConditions: string;
      preprocessingApplied: boolean;
      advancedAnalysisUsed: boolean;
    };
  };
}

// 增強版真偽驗證結果
export interface EnhancedAuthenticityResult {
  success: boolean;
  message: string;
  data: {
    cardId: string;
    authenticity: {
      score: number;
      confidence: number;
      riskLevel: 'low' | 'medium' | 'high';
      factors: string[];
      details: Record<string, any>;
      verificationMethods: {
        hologramAnalysis: {
          isAuthentic: boolean;
          confidence: number;
          details: string[];
        };
        printingAnalysis: {
          isAuthentic: boolean;
          confidence: number;
          details: string[];
        };
        materialAnalysis: {
          isAuthentic: boolean;
          confidence: number;
          details: string[];
        };
        blockchainVerification: {
          isVerified: boolean;
          confidence: number;
          details: string[];
        };
      };
    };
    condition: {
      grade: string;
      score: number;
      details: string[];
      recommendations: string[];
    };
    marketValue: {
      estimated: number;
      range: {
        min: number;
        max: number;
      };
      factors: string[];
      confidence: number;
    };
    aiInsights: {
      recommendations: string[];
      warnings: string[];
      opportunities: string[];
      riskFactors: string[];
    };
  };
}

// 增強版價格預測結果
export interface EnhancedPricePredictionResult {
  success: boolean;
  message: string;
  data: {
    cardId: string;
    predictions: {
      timeframe: '1d' | '7d' | '30d' | '90d' | '180d' | '365d';
      predictedPrice: number;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
      volatility: number;
      factors: string[];
      riskAssessment: string;
    }[];
    marketAnalysis: {
      sentiment: 'bullish' | 'bearish' | 'neutral';
      strength: 'weak' | 'moderate' | 'strong';
      keyDrivers: string[];
      riskFactors: string[];
      opportunities: string[];
    };
    competitiveAnalysis: {
      similarCards: {
        cardId: string;
        name: string;
        price: number;
        trend: string;
        correlation: number;
      }[];
      marketPosition: string;
      competitiveAdvantage: string[];
    };
    seasonalFactors: {
      seasonalTrend: string;
      peakSeasons: string[];
      lowSeasons: string[];
      seasonalImpact: number;
    };
    eventImpact: {
      upcomingEvents: {
        name: string;
        date: string;
        impact: 'positive' | 'negative' | 'neutral';
        confidence: number;
      }[];
      historicalEvents: {
        name: string;
        date: string;
        impact: number;
      }[];
    };
    ensembleModels: {
      modelPredictions: {
        modelName: string;
        prediction: number;
        confidence: number;
        weight: number;
      }[];
      consensusPrediction: number;
      modelAgreement: number;
    };
    processingTime: number;
    metadata: {
      dataPoints: number;
      modelVersion: string;
      lastUpdated: string;
      accuracyMetrics: {
        historicalAccuracy: number;
        predictionError: number;
        confidenceCalibration: number;
      };
    };
  };
}

// 增強版AI服務類
class EnhancedAIService {
  private config: EnhancedAIConfig = {
    recognition: {
      confidenceThreshold: 0.85,
      maxAlternatives: 5,
      includeFeatures: true,
      includeCondition: true,
      includeAuthenticity: true,
      modelVersion: 'v2.1',
      useMultiModel: true,
      imagePreprocessing: true
    },
    conditionAnalysis: {
      includeDetailedFactors: true,
      includeDamageAssessment: true,
      includeMarketImpact: true,
      includePreservationTips: true,
      confidenceThreshold: 0.9,
      useAdvancedMetrics: true,
      includeUVInspection: true,
      includeMicroscopicAnalysis: true
    },
    authenticityVerification: {
      includeCondition: true,
      includeMarketValue: true,
      includeAIInsights: true,
      useBlockchainVerification: true,
      includeHologramAnalysis: true,
      includePrintingAnalysis: true,
      includeMaterialAnalysis: true
    },
    pricePrediction: {
      useMachineLearning: true,
      includeMarketSentiment: true,
      includeCompetitiveAnalysis: true,
      includeSeasonalFactors: true,
      includeEventImpact: true,
      confidenceThreshold: 0.8,
      predictionHorizon: 365,
      useEnsembleModels: true
    }
  };

  // 獲取當前配置
  getConfig(): EnhancedAIConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<EnhancedAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('增強版AI配置已更新', { config: this.config });
  }

  // 增強版卡片識別
  async enhancedRecognizeCard(
    imageData: string,
    options?: Partial<EnhancedAIConfig['recognition']>
  ): Promise<EnhancedRecognitionResult> {
    try {
      const config = { ...this.config.recognition, ...options };

      // 驗證圖片數據
      if (!imageData || typeof imageData !== 'string') {
        throw new Error('無效的圖片數據');
      }

      const requestData = {
        imageData,
        config: {
          confidenceThreshold: config.confidenceThreshold,
          maxAlternatives: config.maxAlternatives,
          includeFeatures: config.includeFeatures,
          includeCondition: config.includeCondition,
          includeAuthenticity: config.includeAuthenticity,
          modelVersion: config.modelVersion,
          useMultiModel: config.useMultiModel,
          imagePreprocessing: config.imagePreprocessing
        }
      };

      const response = await apiService.post<EnhancedRecognitionResult['data']>(
        API_ENDPOINTS.AI.ENHANCED_RECOGNITION || '/ai/enhanced-recognition',
        requestData
      );

      // 驗證響應
      if (response.success && response.data) {
        const validationResult = this.validateEnhancedRecognitionResponse(response.data);
        if (!validationResult.isValid) {
          logger.error('增強版AI識別響應驗證失敗:', validationResult.errors);
          throw new Error('服務器響應數據格式錯誤');
        }
      }

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ 增強版AI卡片識別失敗:', { error: error.message });
      throw error;
    }
  }

  // 增強版條件分析
  async enhancedAnalyzeCondition(
    cardId: string,
    imageData?: string,
    options?: Partial<EnhancedAIConfig['conditionAnalysis']>
  ): Promise<EnhancedConditionAnalysisResult> {
    try {
      const config = { ...this.config.conditionAnalysis, ...options };

      // 驗證卡片 ID
      if (!cardId || typeof cardId !== 'string') {
        throw new Error('無效的卡片 ID');
      }

      const requestData: any = {
        cardId,
        config: {
          includeDetailedFactors: config.includeDetailedFactors,
          includeDamageAssessment: config.includeDamageAssessment,
          includeMarketImpact: config.includeMarketImpact,
          includePreservationTips: config.includePreservationTips,
          confidenceThreshold: config.confidenceThreshold,
          useAdvancedMetrics: config.useAdvancedMetrics,
          includeUVInspection: config.includeUVInspection,
          includeMicroscopicAnalysis: config.includeMicroscopicAnalysis
        }
      };

      // 如果提供了圖片，則包含圖片數據
      if (imageData) {
        requestData.imageData = imageData;
      }

      const response = await apiService.post<EnhancedConditionAnalysisResult['data']>(
        API_ENDPOINTS.AI.ENHANCED_CONDITION_ANALYSIS || '/ai/enhanced-condition-analysis',
        requestData
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ 增強版條件分析失敗:', { error: error.message });
      throw error;
    }
  }

  // 增強版真偽驗證
  async enhancedVerifyAuthenticity(
    cardId: string,
    imageData?: string,
    options?: Partial<EnhancedAIConfig['authenticityVerification']>
  ): Promise<EnhancedAuthenticityResult> {
    try {
      const config = { ...this.config.authenticityVerification, ...options };

      // 驗證卡片 ID
      if (!cardId || typeof cardId !== 'string') {
        throw new Error('無效的卡片 ID');
      }

      const requestData: any = {
        cardId,
        config: {
          includeCondition: config.includeCondition,
          includeMarketValue: config.includeMarketValue,
          includeAIInsights: config.includeAIInsights,
          useBlockchainVerification: config.useBlockchainVerification,
          includeHologramAnalysis: config.includeHologramAnalysis,
          includePrintingAnalysis: config.includePrintingAnalysis,
          includeMaterialAnalysis: config.includeMaterialAnalysis
        }
      };

      if (imageData) {
        requestData.imageData = imageData;
      }

      const response = await apiService.post<EnhancedAuthenticityResult['data']>(
        API_ENDPOINTS.AI.ENHANCED_VERIFY || '/ai/enhanced-verify',
        requestData
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ 增強版真偽驗證失敗:', { error: error.message });
      throw error;
    }
  }

  // 增強版價格預測
  async enhancedPricePrediction(
    cardId: string,
    timeframes: ('1d' | '7d' | '30d' | '90d' | '180d' | '365d')[] = ['7d', '30d', '90d'],
    options?: Partial<EnhancedAIConfig['pricePrediction']>
  ): Promise<EnhancedPricePredictionResult> {
    try {
      const config = { ...this.config.pricePrediction, ...options };

      // 驗證卡片 ID
      if (!cardId || typeof cardId !== 'string') {
        throw new Error('無效的卡片 ID');
      }

      const requestData = {
        cardId,
        timeframes,
        config: {
          useMachineLearning: config.useMachineLearning,
          includeMarketSentiment: config.includeMarketSentiment,
          includeCompetitiveAnalysis: config.includeCompetitiveAnalysis,
          includeSeasonalFactors: config.includeSeasonalFactors,
          includeEventImpact: config.includeEventImpact,
          confidenceThreshold: config.confidenceThreshold,
          predictionHorizon: config.predictionHorizon,
          useEnsembleModels: config.useEnsembleModels
        }
      };

      const response = await apiService.post<EnhancedPricePredictionResult['data']>(
        API_ENDPOINTS.AI.ENHANCED_PRICE_PREDICTION || '/ai/enhanced-price-prediction',
        requestData
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ 增強版價格預測失敗:', { error: error.message });
      throw error;
    }
  }

  // 綜合分析（識別 + 條件分析 + 真偽驗證 + 價格預測）
  async comprehensiveAnalysis(
    imageData: string,
    options?: {
      recognition?: Partial<EnhancedAIConfig['recognition']>;
      conditionAnalysis?: Partial<EnhancedAIConfig['conditionAnalysis']>;
      authenticityVerification?: Partial<EnhancedAIConfig['authenticityVerification']>;
      pricePrediction?: Partial<EnhancedAIConfig['pricePrediction']>;
    }
  ): Promise<{
    recognition: EnhancedRecognitionResult;
    conditionAnalysis: EnhancedConditionAnalysisResult;
    authenticityVerification: EnhancedAuthenticityResult;
    pricePrediction: EnhancedPricePredictionResult;
  }> {
    try {
      // 首先進行識別
      const recognition = await this.enhancedRecognizeCard(imageData, options?.recognition);

      if (!recognition.success || !recognition.data.recognizedCard) {
        throw new Error('卡片識別失敗，無法進行後續分析');
      }

      const cardId = recognition.data.recognizedCard.id;

      // 並行執行其他分析
      const [conditionAnalysis, authenticityVerification, pricePrediction] = await Promise.all([
        this.enhancedAnalyzeCondition(cardId, imageData, options?.conditionAnalysis),
        this.enhancedVerifyAuthenticity(cardId, imageData, options?.authenticityVerification),
        this.enhancedPricePrediction(cardId, ['7d', '30d', '90d'], options?.pricePrediction)
      ]);

      return {
        recognition,
        conditionAnalysis,
        authenticityVerification,
        pricePrediction
      };
    } catch (error: any) {
      logger.error('❌ 綜合分析失敗:', { error: error.message });
      throw error;
    }
  }

  // 驗證增強版識別響應
  private validateEnhancedRecognitionResponse(data: any): { isValid: boolean; errors?: string[] } {
    try {
      const schema = z.object({
        recognizedCard: z.object({
          id: z.string(),
          name: z.string()
          // 其他卡片屬性...
        }),
        confidence: z.number().min(0).max(1),
        alternatives: z.array(z.object({
          card: z.object({
            id: z.string(),
            name: z.string()
          }),
          confidence: z.number().min(0).max(1),
          reason: z.string(),
          similarityScore: z.number().min(0).max(1)
        })),
        imageFeatures: z.object({
          dominantColors: z.array(z.string()),
          cardType: z.string(),
          rarity: z.string(),
          condition: z.string(),
          authenticity: z.string(),
          qualityScore: z.number().min(0).max(100),
          lightingAnalysis: z.object({
            brightness: z.number(),
            contrast: z.number(),
            noise: z.number()
          }),
          focusAnalysis: z.object({
            sharpness: z.number(),
            blur: z.number()
          })
        }),
        processingTime: z.number(),
        metadata: z.object({
          imageSize: z.number(),
          recognitionMethod: z.string(),
          modelVersion: z.string(),
          aiProvider: z.string(),
          preprocessingApplied: z.boolean(),
          multiModelFusion: z.boolean()
        })
      });

      schema.parse(data);
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, errors: [error.message] };
    }
  }

  // 獲取分析統計
  async getAnalysisStats(): Promise<{
    recognitionAccuracy: number;
    conditionAnalysisAccuracy: number;
    authenticityVerificationAccuracy: number;
    pricePredictionAccuracy: number;
    averageProcessingTime: number;
    totalAnalyses: number;
  }> {
    try {
      const response = await apiService.get('/ai/enhanced-stats');
      return response.data;
    } catch (error: any) {
      logger.error('❌ 獲取分析統計失敗:', { error: error.message });
      throw error;
    }
  }

  // 更新模型
  async updateModel(modelType: 'recognition' | 'condition' | 'authenticity' | 'prediction'): Promise<void> {
    try {
      await apiService.post('/ai/update-model', { modelType });
      logger.info(`模型更新成功: ${modelType}`);
    } catch (error: any) {
      logger.error('❌ 模型更新失敗:', { error: error.message });
      throw error;
    }
  }
}

// 導出增強版AI服務實例
export const enhancedAIService = new EnhancedAIService();
