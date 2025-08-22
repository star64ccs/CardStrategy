import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';
import { ValidationUtils } from '../utils/validationUtils';
import { LoggingUtils } from '../utils/loggingUtils';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 卡片類型定義
export interface Card {
  id: string;
  name: string;
  setName: string;
  rarity: string;
  type: string;
  imageUrl: string;
  price: {
    current: number;
    change24h: number;
    change7d: number;
    change30d: number;
  };
  marketData: {
    volume24h: number;
    totalSupply: number;
    circulatingSupply: number;
  };
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 卡片列表響應
export interface CardsResponse {
  success: boolean;
  message: string;
  data: {
    cards: Card[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 卡片詳情響應
export interface CardDetailResponse {
  success: boolean;
  message: string;
  data: {
    card: Card;
  };
}

// 搜索參數
export interface CardSearchParams {
  query?: string;
  setName?: string;
  rarity?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rarity' | 'date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 卡片識別結果類型
export interface CardRecognitionResult {
  success: boolean;
  message: string;
  data: {
    recognizedCard: Card;
    confidence: number;
    alternatives: Card[];
    imageFeatures: {
      dominantColors: string[];
      cardType: string;
      rarity: string;
      condition?: string;
      authenticity?: string;
    };
    processingTime: number;
    metadata: {
      imageSize: number;
      recognitionMethod: string;
      modelVersion: string;
    };
  };
}

// 卡片驗證結果類型
export interface CardVerificationResult {
  success: boolean;
  message: string;
  data: {
    cardId: string;
    authenticity: {
      score: number;
      confidence: number;
      factors: string[];
      riskLevel: 'low' | 'medium' | 'high';
    };
    condition: {
      grade: string;
      score: number;
      details: string[];
    };
    marketValue: {
      estimated: number;
      range: {
        min: number;
        max: number;
      };
      factors: string[];
    };
    recommendations: string[];
  };
}

// 卡片條件分析結果類型
export interface CardConditionAnalysisResult {
  success: boolean;
  message: string;
  data: {
    cardId: string;
    analysis: {
      overallGrade: string; // 'Mint', 'Near Mint', 'Excellent', 'Good', 'Light Played', 'Played', 'Poor'
      overallScore: number; // 0-100
      confidence: number; // 0-1
      factors: {
        corners: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
        };
        edges: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
        };
        surface: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
        };
        centering: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
        };
        printQuality: {
          score: number;
          grade: string;
          details: string[];
          images?: string[];
        };
      };
      damageAssessment: {
        scratches: number;
        dents: number;
        creases: number;
        stains: number;
        fading: number;
        totalDamage: number;
      };
      marketImpact: {
        valueMultiplier: number;
        estimatedValue: number;
        valueRange: {
          min: number;
          max: number;
        };
        recommendations: string[];
      };
      preservationTips: string[];
      restorationSuggestions: string[];
    };
    processingTime: number;
    metadata: {
      analysisMethod: string;
      modelVersion: string;
      imageQuality: string;
      lightingConditions: string;
    };
  };
}

// 驗證模式
const CardSchema = z.object({
  id: z.string().uuid('無效的卡片 ID'),
  name: z.string().min(1, '卡片名稱不能為空'),
  setName: z.string().min(1, '系列名稱不能為空'),
  rarity: z.string().min(1, '稀有度不能為空'),
  type: z.string().min(1, '卡片類型不能為空'),
  imageUrl: z.string().url('無效的圖片 URL'),
  price: z.object({
    current: z.number().min(0, '價格不能為負數'),
    change24h: z.number(),
    change7d: z.number(),
    change30d: z.number(),
  }),
  marketData: z.object({
    volume24h: z.number().min(0),
    totalSupply: z.number().min(0),
    circulatingSupply: z.number().min(0),
  }),
  stats: z.object({
    attack: z.number().optional(),
    defense: z.number().optional(),
    health: z.number().optional(),
    mana: z.number().optional(),
  }),
  description: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CardSearchParamsSchema = z.object({
  query: z.string().optional(),
  setName: z.string().optional(),
  rarity: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['name', 'price', 'rarity', 'date']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

const CardRecognitionRequestSchema = z.object({
  imageData: z.string().min(1, '圖片數據不能為空'),
  options: z
    .object({
      includeAlternatives: z.boolean().optional(),
      includeFeatures: z.boolean().optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

const CardRecognitionResponseSchema = z.object({
  recognizedCard: CardSchema,
  confidence: z.number().min(0).max(1),
  alternatives: z.array(CardSchema),
  imageFeatures: z.object({
    dominantColors: z.array(z.string()),
    cardType: z.string(),
    rarity: z.string(),
    condition: z.string().optional(),
    authenticity: z.string().optional(),
  }),
  processingTime: z.number(),
  metadata: z.object({
    imageSize: z.number(),
    recognitionMethod: z.string(),
    modelVersion: z.string(),
  }),
});

const CardVerificationResponseSchema = z.object({
  cardId: z.string().uuid(),
  authenticity: z.object({
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string()),
    riskLevel: z.enum(['low', 'medium', 'high']),
  }),
  condition: z.object({
    grade: z.string(),
    score: z.number().min(0).max(100),
    details: z.array(z.string()),
  }),
  marketValue: z.object({
    estimated: z.number().min(0),
    range: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }),
    factors: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

const CardConditionAnalysisResponseSchema = z.object({
  cardId: z.string().uuid(),
  analysis: z.object({
    overallGrade: z.string(),
    overallScore: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    factors: z.object({
      corners: z.object({
        score: z.number().min(0).max(100),
        grade: z.string(),
        details: z.array(z.string()),
        images: z.array(z.string()).optional(),
      }),
      edges: z.object({
        score: z.number().min(0).max(100),
        grade: z.string(),
        details: z.array(z.string()),
        images: z.array(z.string()).optional(),
      }),
      surface: z.object({
        score: z.number().min(0).max(100),
        grade: z.string(),
        details: z.array(z.string()),
        images: z.array(z.string()).optional(),
      }),
      centering: z.object({
        score: z.number().min(0).max(100),
        grade: z.string(),
        details: z.array(z.string()),
        images: z.array(z.string()).optional(),
      }),
      printQuality: z.object({
        score: z.number().min(0).max(100),
        grade: z.string(),
        details: z.array(z.string()),
        images: z.array(z.string()).optional(),
      }),
    }),
    damageAssessment: z.object({
      scratches: z.number().min(0),
      dents: z.number().min(0),
      creases: z.number().min(0),
      stains: z.number().min(0),
      fading: z.number().min(0),
      totalDamage: z.number().min(0),
    }),
    marketImpact: z.object({
      valueMultiplier: z.number().min(0),
      estimatedValue: z.number().min(0),
      valueRange: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
      }),
      recommendations: z.array(z.string()),
    }),
    preservationTips: z.array(z.string()),
    restorationSuggestions: z.array(z.string()),
  }),
  processingTime: z.number(),
  metadata: z.object({
    analysisMethod: z.string(),
    modelVersion: z.string(),
    imageQuality: z.string(),
    lightingConditions: z.string(),
  }),
});

// 卡片服務類
class CardService {
  async getCards(
    params: CardSearchParams = {}
  ): Promise<ApiResponse<CardsResponse['data']>> {
    try {
      LoggingUtils.logApiCall('getCards', params);

      const response = await apiService.get<CardsResponse['data']>(
        API_CONFIG.CARDS.LIST,
        { params }
      );

      LoggingUtils.logApiCall('getCards', params, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('getCards', error, params);
      throw error;
    }
  }

  async getCardDetail(
    id: string
  ): Promise<ApiResponse<CardDetailResponse['data']>> {
    try {
      ValidationUtils.validateUUID(id, '卡片 ID');
      LoggingUtils.logApiCall('getCardDetail', { id });

      const response = await apiService.get<CardDetailResponse['data']>(
        API_CONFIG.CARDS.DETAIL(id)
      );

      LoggingUtils.logApiCall('getCardDetail', { id }, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('getCardDetail', error, { id });
      throw error;
    }
  }

  async searchCards(
    query: string,
    params: CardSearchParams = {}
  ): Promise<ApiResponse<CardsResponse['data']>> {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('搜索查詢不能為空');
      }

      LoggingUtils.logApiCall('searchCards', { query, ...params });

      const response = await apiService.get<CardsResponse['data']>(
        API_CONFIG.CARDS.SEARCH,
        {
          params: { query, ...params },
        }
      );

      LoggingUtils.logApiCall(
        'searchCards',
        { query, ...params },
        response.data
      );
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('searchCards', error, { query, ...params });
      throw error;
    }
  }

  async getRecommendations(
    userId?: string
  ): Promise<ApiResponse<CardsResponse['data']>> {
    try {
      const params = userId ? { userId } : {};
      LoggingUtils.logApiCall('getRecommendations', params);

      const response = await apiService.get<CardsResponse['data']>(
        API_CONFIG.CARDS.RECOMMENDATIONS,
        { params }
      );

      LoggingUtils.logApiCall('getRecommendations', params, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('getRecommendations', error, { userId });
      throw error;
    }
  }

  async recognizeCard(
    imageUri: string
  ): Promise<ApiResponse<CardRecognitionResult['data']>> {
    try {
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('圖片 URI 不能為空');
      }

      LoggingUtils.logApiCall('recognizeCard', { imageUri });

      // 將圖片轉換為 base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const response = await apiService.post<CardRecognitionResult['data']>(
        API_CONFIG.CARDS.RECOGNIZE,
        {
          imageData: base64Image,
          options: {
            includeAlternatives: true,
            includeFeatures: true,
            confidenceThreshold: 0.7,
          },
        }
      );

      LoggingUtils.logApiCall('recognizeCard', { imageUri }, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('recognizeCard', error, { imageUri });
      throw error;
    }
  }

  async verifyCard(
    id: string,
    imageUri?: string
  ): Promise<ApiResponse<CardVerificationResult['data']>> {
    try {
      ValidationUtils.validateUUID(id, '卡片 ID');
      LoggingUtils.logApiCall('verifyCard', { id, imageUri });

      let requestData: any = { cardId: id };
      
      if (imageUri) {
        const imageData = await this.convertImageToBase64(imageUri);
        requestData.imageData = imageData;
      }

      const response = await apiService.post<CardVerificationResult['data']>(
        API_CONFIG.CARDS.VERIFY(id),
        requestData
      );

      LoggingUtils.logApiCall('verifyCard', { id, imageUri }, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('verifyCard', error, { id, imageUri });
      throw error;
    }
  }

  async analyzeCardCondition(
    id: string,
    imageUri?: string
  ): Promise<ApiResponse<CardConditionAnalysisResult['data']>> {
    try {
      ValidationUtils.validateUUID(id, '卡片 ID');
      LoggingUtils.logApiCall('analyzeCardCondition', { id, imageUri });

      let requestData: any = {
        cardId: id,
        analysisOptions: {
          includeDetailedFactors: true,
          includeDamageAssessment: true,
          includeMarketImpact: true,
          includePreservationTips: true,
          confidenceThreshold: 0.8,
        },
      };
      
      if (imageUri) {
        const imageData = await this.convertImageToBase64(imageUri);
        requestData.imageData = imageData;
      }

      const response = await apiService.post<
        CardConditionAnalysisResult['data']
      >(API_CONFIG.CARDS.ANALYZE_CONDITION(id), requestData);

      LoggingUtils.logApiCall('analyzeCardCondition', { id, imageUri }, response.data);
      return response.data;
    } catch (error) {
      LoggingUtils.logApiError('analyzeCardCondition', error, { id, imageUri });
      throw error;
    }
  }

  async recognizeCardsBatch(
    imageUris: string[]
  ): Promise<ApiResponse<CardRecognitionResult['data'][]>> {
    try {
      if (!Array.isArray(imageUris) || imageUris.length === 0) {
        throw new Error('圖片 URI 列表不能為空');
      }

      const startTime = Date.now();
      LoggingUtils.logApiCall('recognizeCardsBatch', {
        count: imageUris.length,
      });

      const results = await Promise.all(
        imageUris.map((uri) => this.recognizeCard(uri))
      );

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successCount;
      const duration = Date.now() - startTime;

      LoggingUtils.logBatchOperation(
        'recognizeCardsBatch',
        imageUris.length,
        successCount,
        failedCount,
        duration
      );

      return {
        success: true,
        message: `批量識別完成: ${successCount}/${results.length} 成功`,
        data: results.map((r) => r.data).filter(Boolean),
      };
    } catch (error) {
      LoggingUtils.logApiError('recognizeCardsBatch', error, {
        count: imageUris.length,
      });
      throw error;
    }
  }

  // 私有方法：將圖片轉換為 base64
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      LoggingUtils.logFileOperation(
        'convertImageToBase64',
        'process',
        imageUri
      );

      // 檢查是否為本地文件 URI
      if (imageUri.startsWith('file://')) {
        // 讀取本地文件
        const fs = require('react-native-fs');
        const base64 = await fs.readFile(imageUri, 'base64');
        const mimeType = this.getMimeType(imageUri);
        const dataUrl = `data:${mimeType};base64,${base64}`;

        LoggingUtils.logFileOperation(
          'convertImageToBase64',
          'process',
          imageUri,
          dataUrl.length
        );
        return dataUrl;
      }

      // 檢查是否為網絡 URL
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        // 下載圖片並轉換為 base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await this.blobToBase64(blob);

        LoggingUtils.logFileOperation(
          'convertImageToBase64',
          'process',
          imageUri,
          base64.length
        );
        return base64;
      }

      // 檢查是否已經是 base64 格式
      if (imageUri.startsWith('data:')) {
        LoggingUtils.logFileOperation(
          'convertImageToBase64',
          'process',
          imageUri,
          imageUri.length
        );
        return imageUri;
      }

      throw new Error('不支持的圖片格式');
    } catch (error) {
      LoggingUtils.logApiError('convertImageToBase64', error, { imageUri });
      throw new Error('圖片轉換失敗');
    }
  }

  // 獲取 MIME 類型
  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }

  // 將 Blob 轉換為 base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 獲取模擬卡片數據（僅用於開發和測試）
  getMockCards(): Card[] {
    return [
      {
        id: '1',
        name: '青眼白龍',
        setName: '遊戲王 初代',
        rarity: 'UR',
        type: '怪獸卡',
        imageUrl:
          'https://via.placeholder.com/300x400/3498db/ffffff?text=青眼白龍',
        price: { current: 1500, change24h: 50, change7d: 200, change30d: -100 },
        marketData: {
          volume24h: 50000,
          totalSupply: 1000,
          circulatingSupply: 800,
        },
        stats: { attack: 3000, defense: 2500 },
        description: '傳說中的最強龍族怪獸，擁有毀滅性的力量。',
        tags: ['龍族', '傳說', '攻擊型'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: '黑魔導',
        setName: '遊戲王 初代',
        rarity: 'SR',
        type: '怪獸卡',
        imageUrl:
          'https://via.placeholder.com/300x400/9b59b6/ffffff?text=黑魔導',
        price: { current: 800, change24h: 20, change7d: 80, change30d: 150 },
        marketData: {
          volume24h: 30000,
          totalSupply: 2000,
          circulatingSupply: 1800,
        },
        stats: { attack: 2500, defense: 2100 },
        description: '強大的魔法師，掌握著神秘的魔法力量。',
        tags: ['魔法師', '經典', '平衡型'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  }
}

// 導出單例實例
export { CardService };
export const cardService = new CardService();
