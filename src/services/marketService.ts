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
      logger.error('Get市場數據Failed:', error);
      throw new Error('Get市場數據Failed');
    }
  }

  async getCardPriceHistory(
    cardId: string
  ): Promise<ApiResponse<PriceHistory>> {
    try {
      const _response = await apiService.get(`/market/price-history/${cardId}`);
      return response;
    } catch (error) {
      logger.error('Get卡片價格歷史Failed:', error);
      throw new Error('Get卡片價格歷史Failed');
    }
  }

  async getMarketTrends(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/trends');
      return response;
    } catch (error) {
      logger.error('Get市場趨勢Failed:', error);
      throw new Error('Get市場趨勢Failed');
    }
  }

  async getTrendingCards(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/trending');
      return response;
    } catch (error) {
      logger.error('Get熱門卡片Failed:', error);
      throw new Error('Get熱門卡片Failed');
    }
  }

  async getMarketStats(): Promise<ApiResponse<any>> {
    try {
      const _response = await apiService.get('/market/stats');
      return response;
    } catch (error) {
      logger.error('Get市場統計Failed:', error);
      throw new Error('Get市場統計Failed');
    }
  }
}

export const _marketService = new MarketService();
