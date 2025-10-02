import { logger } from '../utils/logger';
import { apiService } from './apiService';
import { realMarketService } from './realMarketService';

export interface MarketData {
  totalCards: number;
  totalValue: number;
  averagePrice: number;
  trendingCards: {
    id: string;
    name: string;
    priceChange: number;
  }[];
  marketTrend: {
    daily: { date: string; value: number }[];
    weekly: { week: string; value: number }[];
    monthly: { month: string; value: number }[];
  };
}

export interface PriceHistory {
  cardId: string;
  cardName: string;
  prices: {
    date: string;
    price: number;
    platform: string;
  }[];
  averagePrice: number;
  priceChange: number;
  volatility: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class MarketService {
  async getMarketData(): Promise<ApiResponse<MarketData>> {
    try {
      logger.info('獲取真實市場數據');

      // 使用真實市場服務
      await realMarketService.initialize();
      const marketStats = await realMarketService.getMarketStats();

      // 轉換為兼容格式
      const marketData: MarketData = {
        totalCards: (marketStats as any).totalCards || 0,
        totalValue: (marketStats as any).totalValue || 0,
        averagePrice: (marketStats as any).averagePrice || 0,
        trendingCards: (marketStats as any).trendingCards || [],
        marketTrend: (marketStats as any).marketTrend || {
          daily: [],
          weekly: [],
          monthly: [],
        },
      };

      return {
        success: true,
        data: marketData,
      };
    } catch (error) {
      logger.error('獲取真實市場數據失敗，回退到模擬數據:', error);

      // 回退到模擬數據
      const response = await apiService.get('/market/data');
      return response;
    }
  }

  async getCardPriceHistory(
    cardId: string
  ): Promise<ApiResponse<PriceHistory>> {
    try {
      const response = await apiService.get(`/market/price-history/${cardId}`);
      return response;
    } catch (error) {
      logger.error('獲取卡片價格歷史失敗:', error);
      throw new Error('獲取卡片價格歷史失敗');
    }
  }

  async getMarketTrends(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.get('/market/trends');
      return response;
    } catch (error) {
      logger.error('獲取市場趨勢失敗:', error);
      throw new Error('獲取市場趨勢失敗');
    }
  }

  async getTrendingCards(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.get('/market/trending');
      return response;
    } catch (error) {
      logger.error('獲取熱門卡片失敗:', error);
      throw new Error('獲取熱門卡片失敗');
    }
  }

  async getMarketStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.get('/market/stats');
      return response;
    } catch (error) {
      logger.error('獲取市場統計失敗:', error);
      throw new Error('獲取市場統計失敗');
    }
  }
}

export const marketService = new MarketService();
