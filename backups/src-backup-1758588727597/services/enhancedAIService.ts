import { logger } from '../core/utils/logger';

import { apiService } from './apiService';

// 增強版AI配置
export interface EnhancedAIConfig {
  recognition: {
    confidenceThreshold: number;
    maxAlternatives: number;
    includeFeatures: boolean;
    includeCondition: boolean;
    includeAuthenticity: boolean;
    modelVersion: string;
    useMultiModel: boolean;
    imagePreprocessing: boolean;
  };
}

// 增強版識別結果
export interface EnhancedRecognitionResult {
  success: boolean;
  message?: string;
  data: {
    recognizedCard: unknown;
    confidence: number;
    alternatives: {
      card: unknown;
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

class EnhancedAIService {
  private config: EnhancedAIConfig = {
    recognition: {
      confidenceThreshold: 0.8,
      maxAlternatives: 5,
      includeFeatures: true,
      includeCondition: true,
      includeAuthenticity: true,
      modelVersion: 'v2.1',
      useMultiModel: true,
      imagePreprocessing: true,
    },
  };

  /**
   * 增強的卡片識別功能
   */
  async enhancedRecognizeCard(
    imageData: string,
    options: Partial<EnhancedAIConfig['recognition']> = {}
  ): Promise<EnhancedRecognitionResult> {
    try {
      logger.info('開始增強AI識別', {
        imageSize: imageData.length,
        options: { ...this.config.recognition, ...options },
      });

      const finalOptions = { ...this.config.recognition, ...options };

      // 調用 API 進行識別
      const response = await apiService.post('/cards/enhanced-recognize', {
        imageData,
        options: finalOptions,
      });

      if (!response.success) {
        throw new Error(response.error || '識別失敗');
      }

      logger.info('增強AI識別完成', {
        confidence: response.data?.confidence,
        processingTime: response.data?.processingTime,
      });

      // 確保返回類型正確
      return {
        success: true,
        data: response.data,
        confidence: response.data?.confidence || 0,
        processingTime: response.data?.processingTime || 0,
        cardInfo: response.data?.cardInfo,
        alternatives: response.data?.alternatives || [],
        metadata: response.data?.metadata || {},
      } as EnhancedRecognitionResult;
    } catch (error: unknown) {
      logger.error('增強AI識別失敗', { error: error.message });
      throw new Error(`增強AI識別失敗: ${error.message}`);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<EnhancedAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('AI服務配置已更新', { config: this.config });
  }

  /**
   * 獲取當前配置
   */
  getConfig(): EnhancedAIConfig {
    return { ...this.config };
  }

  /**
   * 驗證圖像質量
   */
  async validateImageQuality(imageData: string): Promise<{
    isValid: boolean;
    qualityScore: number;
    issues: string[];
  }> {
    try {
      const response = await apiService.post('/cards/validate-image', {
        imageData,
      });

      return response.data;
    } catch (error: unknown) {
      logger.error('圖像質量驗證失敗', { error: error.message });
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['圖像質量驗證失敗'],
      };
    }
  }

  /**
   * 獲取識別歷史
   */
  async getRecognitionHistory(limit = 10): Promise<any[]> {
    try {
      const response = await apiService.get('/cards/recognition-history', {
        params: { limit },
      });

      return response.data.history || [];
    } catch (error: unknown) {
      logger.error('獲取識別歷史失敗', { error: error.message });
      return [];
    }
  }

  /**
   * 提交用戶反饋
   */
  async submitFeedback(
    recognitionId: string,
    feedback: {
      isCorrect: boolean;
      correctCard?: unknown;
      comments?: string;
    }
  ): Promise<boolean> {
    try {
      const response = await apiService.post('/cards/feedback', {
        recognitionId,
        feedback,
      });

      return response.success;
    } catch (error: unknown) {
      logger.error('提交反饋失敗', { error: error.message });
      return false;
    }
  }
}

// 創建單例實例
export const enhancedAIService = new EnhancedAIService();
