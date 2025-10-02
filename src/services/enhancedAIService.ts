import { logger } from '../core/utils/logger';

import { apiService } from './apiService';

// 增強版AIConfigure
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

      const _finalOptions = { ...this.config.recognition, ...options };

      // 調用 API 進Row識別
      const _response = await apiService.post('/cards/enhanced-recognize', {
        imageData,
        options: finalOptions,
      });

      if (!response.success) {
        throw new Error(response.error || '識別Failed');
      }

      logger.info('增強AI識別完成', {
        confidence: response.data?.confidence,
        processingTime: response.data?.processingTime,
      });

      // 確保ReturnClass型正確
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
      logger.error('增強AI識別Failed', { error: error.message });
      throw new Error(`增強AI識別Failed: ${error.message}`);
    }
  }

  /**
   * UpdateConfigure
   */
  updateConfig(newConfig: Partial<EnhancedAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('AIServiceConfigure已Update', { config: this.config });
  }

  /**
   * Get當前Configure
   */
  getConfig(): EnhancedAIConfig {
    return { ...this.config };
  }

  /**
   * VerifyGraph像質量
   */
  async validateImageQuality(imageData: string): Promise<{
    isValid: boolean;
    qualityScore: number;
    issues: string[];
  }> {
    try {
      const _response = await apiService.post('/cards/validate-image', {
        imageData,
      });

      return response.data;
    } catch (error: unknown) {
      logger.error('圖像質量VerifyFailed', { error: error.message });
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['圖像質量VerifyFailed'],
      };
    }
  }

  /**
   * Get識別歷史
   */
  async getRecognitionHistory(limit = 10): Promise<any[]> {
    try {
      const _response = await apiService.get('/cards/recognition-history', {
        params: { limit },
      });

      return response.data.history || [];
    } catch (error: unknown) {
      logger.error('Get識別歷史Failed', { error: error.message });
      return [];
    }
  }

  /**
   * SubmitUser反饋
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
      const _response = await apiService.post('/cards/feedback', {
        recognitionId,
        feedback,
      });

      return response.success;
    } catch (error: unknown) {
      logger.error('提交反饋Failed', { error: error.message });
      return false;
    }
  }
}

// Create單例Instance
export const _enhancedAIService = new EnhancedAIService();
