import { apiService } from './apiService';
import { logger } from '../utils/logger';

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
      const _response = await apiService.get('/market/data');
      return response;
    } catch (error) {
      logger.error('獲取市場數據失敗:', error);
      throw new Error('獲取市場數據失敗');
    }
  }

  async getCardPriceHistory(
    cardId: string
  ): Promise<ApiResponse<PriceHistory>> {
    try {
      const _response = await apiService.get(`/market/price-history/${cardId}`);
      return response;
    } catch (error) {
      logger.error('獲取卡片價格歷史失敗:', error);
      throw new Error('獲取卡片價格歷史失敗');
    }
  }

  async getMarketTrends(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/trends');
      return response;
    } catch (error) {
      logger.error('獲取市場趨勢失敗:', error);
      throw new Error('獲取市場趨勢失敗');
    }
  }

  async getTrendingCards(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/trending');
      return response;
    } catch (error) {
      logger.error('獲取熱門卡片失敗:', error);
      throw new Error('獲取熱門卡片失敗');
    }
  }

  async getMarketStats(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/stats');
      return response;
    } catch (error) {
      logger.error('獲取市場統計失敗:', error);
      throw new Error('獲取市場統計失敗');
    }
  }
}

export const _marketService = new MarketService();
