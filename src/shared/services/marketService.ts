import type { MarketDataEntity } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 市場Service
 * Handle市場Data相Off功能
 */
export class MarketService {
  private static instance: MarketService;

  private constructor() {}

  static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  /**
   * Get市場Data
   */
  async getMarketData(cardId: string): Promise<MarketDataEntity> {
    try {
      const _response = await api.get<MarketDataEntity>(`/market/${cardId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Get市場數據Failed');
      }
    } catch (error) {
      logger.error('Get市場數據Failed:', { error, cardId });
      throw error;
    }
  }

  /**
   * Get價格歷史
   */
  async getPriceHistory(
    cardId: string,
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取價格歷史:', { cardId, period });

      const _response = await api.get(
        `/market/${cardId}/price-history?period=${period}`
      );

      if (response.success) {
        logger.info('價格歷史GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '價格歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get價格歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get價格歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get價格歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get價格歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get市場趨勢
   */
  async getMarketTrends(cardId?: string): Promise<any> {
    try {
      logger.info('獲取市場趨勢:', { cardId });

      const _params = cardId ? new URLSearchParams({ cardId }) : '';
      const _response = await api.get(
        `/market/trends${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('市場趨勢GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場趨勢GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get市場趨勢Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get市場趨勢Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get市場趨勢時發生Error:', error);
      return {
        success: false,
        message: 'Get市場趨勢時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

// Export單例Instance
export const _marketService = MarketService.getInstance();
