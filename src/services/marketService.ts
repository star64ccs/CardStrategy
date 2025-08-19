import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';
import { LoggingUtils } from '../utils/loggingUtils';
import { ValidationUtils } from '../utils/validationUtils';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 市場數據類型
export interface MarketData {
  totalVolume: number;
  totalTransactions: number;
  averagePrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  topGainers: MarketCard[];
  topLosers: MarketCard[];
  trendingCards: MarketCard[];
}

// 市場卡片
export interface MarketCard {
  id: string;
  name: string;
  price: number;
  priceChange: number;
  volume: number;
  marketCap: number;
}

// 市場趨勢
export interface MarketTrend {
  period: '1h' | '24h' | '7d' | '30d';
  data: {
    timestamp: string;
    price: number;
    volume: number;
  }[];
}

// 市場分析
export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  factors: {
    technical: number;
    fundamental: number;
    social: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// 價格預測
export interface PricePrediction {
  cardId: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: '1d' | '7d' | '30d' | '90d';
  factors: string[];
  riskAssessment: string;
}

// 市場服務類
class MarketService {
  // 獲取市場數據
  async getMarketData(): Promise<ApiResponse<MarketData>> {
    try {
      LoggingUtils.logApiCall('getMarketData');
      const response = await apiService.get<MarketData>(API_CONFIG.MARKET.DATA);
      LoggingUtils.logApiCall('getMarketData', undefined, response.data);
      return response;
    } catch (error) {
      LoggingUtils.logApiError('getMarketData', error);
      throw error;
    }
  }

  // 獲取市場趨勢
  async getMarketTrends(period: MarketTrend['period'] = '7d'): Promise<ApiResponse<MarketTrend[]>> {
    try {
      ValidationUtils.validateEnum(period, ['1h', '24h', '7d', '30d'], '時間週期');
      LoggingUtils.logApiCall('getMarketTrends', { period });

      const response = await apiService.get<MarketTrend[]>(API_CONFIG.MARKET.TRENDS, { params: { period } });
      LoggingUtils.logApiCall('getMarketTrends', { period }, response.data);
      return response;
    } catch (error) {
      LoggingUtils.logApiError('getMarketTrends', error, { period });
      throw error;
    }
  }

  // 獲取市場分析
  async getMarketAnalysis(): Promise<ApiResponse<MarketAnalysis>> {
    try {
      const response = await apiService.get<MarketAnalysis>(API_ENDPOINTS.MARKET.ANALYSIS);
      const validationResult = validateApiResponse(z.object({
        sentiment: z.enum(['bullish', 'bearish', 'neutral']),
        confidence: z.number().min(0).max(1),
        factors: z.object({
          technical: z.number().min(0).max(1),
          fundamental: z.number().min(0).max(1),
          social: z.number().min(0).max(1)
        }),
        recommendations: z.array(z.string()),
        riskLevel: z.enum(['low', 'medium', 'high'])
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '市場分析數據驗證失敗');
      }
      return {
        ...response,
        data: validationResult.data!
      };
    } catch (error: any) {
      logger.error('❌ Get market analysis error:', { error: error.message });
      throw error;
    }
  }

  // 獲取價格預測
  async getPricePredictions(cardIds: string[]): Promise<ApiResponse<PricePrediction[]>> {
    try {
      const validationResult = validateInput(z.object({
        cardIds: z.array(z.string().uuid('無效的卡牌 ID')).min(1, '至少需要一個卡牌 ID')
      }), { cardIds });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '卡牌 ID 驗證失敗');
      }
      const response = await apiService.post<PricePrediction[]>(API_ENDPOINTS.MARKET.PREDICTIONS, {
        cardIds: validationResult.data!.cardIds
      });
      const responseValidation = validateApiResponse(z.array(z.object({
        cardId: z.string().uuid(),
        currentPrice: z.number().positive(),
        predictedPrice: z.number().positive(),
        confidence: z.number().min(0).max(1),
        timeframe: z.enum(['1d', '7d', '30d', '90d']),
        factors: z.array(z.string()),
        riskAssessment: z.string()
      })), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '價格預測數據驗證失敗');
      }
      return {
        ...response,
        data: responseValidation.data!
      };
    } catch (error: any) {
      logger.error('❌ Get price predictions error:', { error: error.message });
      throw error;
    }
  }


}

// 導出市場服務實例
export const marketService = new MarketService();

