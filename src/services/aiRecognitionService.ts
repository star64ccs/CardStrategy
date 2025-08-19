import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { Card } from './cardService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// AI 識別配置
export interface AIRecognitionConfig {
  confidenceThreshold: number;
  maxAlternatives: number;
  includeFeatures: boolean;
  includeCondition: boolean;
  includeAuthenticity: boolean;
  modelVersion: string;
}

// 圖像特徵分析結果
export interface ImageFeatureAnalysis {
  dominantColors: string[];
  cardType: 'monster' | 'spell' | 'trap' | 'unknown';
  rarity: string;
  condition?: {
    grade: string;
    score: number;
    details: string[];
  };
  authenticity?: {
    score: number;
    confidence: number;
    riskFactors: string[];
  };
  textExtraction?: {
    cardName: string;
    description: string;
    attributes: Record<string, string>;
  };
}

// AI 識別結果
export interface AIRecognitionResult {
  success: boolean;
  message: string;
  data: {
    recognizedCard: Card;
    confidence: number;
    alternatives: {
      card: Card;
      confidence: number;
      reason: string;
    }[];
    imageFeatures: ImageFeatureAnalysis;
    processingTime: number;
    metadata: {
      imageSize: number;
      recognitionMethod: string;
      modelVersion: string;
      aiProvider: string;
    };
  };
}

// AI 真偽驗證結果
export interface AIAuthenticityResult {
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
    };
  };
}

// 批量識別結果
export interface BatchRecognitionResult {
  success: boolean;
  message: string;
  data: {
    results: AIRecognitionResult['data'][];
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
      averageConfidence: number;
      processingTime: number;
    };
  };
}

class AIRecognitionService {
  private config: AIRecognitionConfig = {
    confidenceThreshold: 0.7,
    maxAlternatives: 5,
    includeFeatures: true,
    includeCondition: true,
    includeAuthenticity: true,
    modelVersion: 'v2.1'
  };

  // 設置識別配置
  updateConfig(newConfig: Partial<AIRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('AI 識別配置已更新:', this.config);
  }

  // 獲取當前配置
  getConfig(): AIRecognitionConfig {
    return this.config;
  }

  // 單張卡片識別
  async recognizeCard(imageData: string, options?: Partial<AIRecognitionConfig>): Promise<AIRecognitionResult> {
    try {
      const config = { ...this.config, ...options };

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
          modelVersion: config.modelVersion
        }
      };

      const response = await apiService.post<AIRecognitionResult['data']>(
        API_ENDPOINTS.AI.RECOGNITION || '/ai/recognition',
        requestData
      );

      // 驗證響應
      if (response.success && response.data) {
        const validationResult = this.validateRecognitionResponse(response.data);
        if (!validationResult.isValid) {
          logger.error('AI 識別響應驗證失敗:', validationResult.errors);
          throw new Error('服務器響應數據格式錯誤');
        }
      }

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ AI 卡片識別失敗:', { error: error.message });
      throw error;
    }
  }

  // 批量識別
  async recognizeBatch(imageDataList: string[], options?: Partial<AIRecognitionConfig>): Promise<BatchRecognitionResult> {
    try {
      const config = { ...this.config, ...options };

      // 驗證輸入
      if (!Array.isArray(imageDataList) || imageDataList.length === 0) {
        throw new Error('無效的圖片數據列表');
      }

      if (imageDataList.length > 10) {
        throw new Error('批量識別最多支持 10 張圖片');
      }

      const requestData = {
        images: imageDataList,
        config: {
          confidenceThreshold: config.confidenceThreshold,
          maxAlternatives: config.maxAlternatives,
          includeFeatures: config.includeFeatures,
          includeCondition: config.includeCondition,
          includeAuthenticity: config.includeAuthenticity,
          modelVersion: config.modelVersion
        }
      };

      const response = await apiService.post<BatchRecognitionResult['data']>(
        API_ENDPOINTS.AI.BATCH_RECOGNITION || '/ai/recognition/batch',
        requestData
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ AI 批量識別失敗:', { error: error.message });
      throw error;
    }
  }

  // 真偽驗證
  async verifyAuthenticity(cardId: string, imageData?: string): Promise<AIAuthenticityResult> {
    try {
      // 驗證卡片 ID
      if (!cardId || typeof cardId !== 'string') {
        throw new Error('無效的卡片 ID');
      }

      const requestData: any = {
        cardId,
        config: {
          includeCondition: this.config.includeCondition,
          includeMarketValue: true,
          includeAIInsights: true
        }
      };

      if (imageData) {
        requestData.imageData = imageData;
      }

      const response = await apiService.post<AIAuthenticityResult['data']>(
        API_ENDPOINTS.AI.VERIFY || '/ai/verify',
        requestData
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ AI 真偽驗證失敗:', { error: error.message });
      throw error;
    }
  }

  // 圖像特徵分析
  async analyzeImageFeatures(imageData: string): Promise<ImageFeatureAnalysis> {
    try {
      const response = await apiService.post<ImageFeatureAnalysis>(
        API_ENDPOINTS.AI.FEATURE_ANALYSIS || '/ai/features',
        { imageData }
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ 圖像特徵分析失敗:', { error: error.message });
      throw error;
    }
  }

  // 驗證識別響應
  private validateRecognitionResponse(data: any): { isValid: boolean; errors?: string[] } {
    try {
      const schema = z.object({
        recognizedCard: z.object({
          id: z.string(),
          name: z.string(),
          setName: z.string(),
          rarity: z.string(),
          type: z.string(),
          imageUrl: z.string(),
          price: z.object({
            current: z.number(),
            change24h: z.number(),
            change7d: z.number(),
            change30d: z.number()
          })
        }),
        confidence: z.number().min(0).max(1),
        alternatives: z.array(z.object({
          card: z.any(),
          confidence: z.number(),
          reason: z.string()
        })),
        imageFeatures: z.object({
          dominantColors: z.array(z.string()),
          cardType: z.string(),
          rarity: z.string(),
          condition: z.any().optional(),
          authenticity: z.any().optional()
        }),
        processingTime: z.number(),
        metadata: z.object({
          imageSize: z.number(),
          recognitionMethod: z.string(),
          modelVersion: z.string(),
          aiProvider: z.string()
        })
      });

      schema.parse(data);
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, errors: [error.message] };
    }
  }

  // 獲取識別統計
  async getRecognitionStats(): Promise<{
    totalRecognitions: number;
    averageConfidence: number;
    successRate: number;
    popularCards: { cardId: string; count: number }[];
    processingTimes: {
      average: number;
      min: number;
      max: number;
    };
  }> {
    try {
      const response = await apiService.get('/ai/recognition/stats');
      return response.data;
    } catch (error: any) {
      logger.error('❌ 獲取識別統計失敗:', { error: error.message });
      throw error;
    }
  }

  // 清理緩存
  clearCache(): void {
    logger.info('清理 AI 識別緩存');
    // 這裡可以清理本地緩存的識別結果
  }
}

// 導出服務實例
export const aiRecognitionService = new AIRecognitionService();
