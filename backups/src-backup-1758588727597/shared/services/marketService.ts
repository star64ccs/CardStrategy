import type { MarketDataEntity } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 市場服務
 * 處理市場數據相關功能
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
   * 獲取市場數據
   */
  async getMarketData(cardId: string): Promise<MarketDataEntity> {
    try {
      const response = await api.get<MarketDataEntity>(`/market/${cardId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取市場數據失敗');
      }
    } catch (error) {
      logger.error('獲取市場數據失敗:', { error, cardId });
      throw error;
    }
  }

  /**
   * 獲取價格歷史
   */
  async getPriceHistory(
    cardId: string,
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取價格歷史:', { cardId, period });

      const response = await api.get(
        `/market/${cardId}/price-history?period=${period}`
      );

      if (response.success) {
        logger.info('價格歷史獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '價格歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取價格歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取價格歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取價格歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取價格歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取市場趨勢
   */
  async getMarketTrends(cardId?: string): Promise<any> {
    try {
      logger.info('獲取市場趨勢:', { cardId });

      const params = cardId ? new URLSearchParams({ cardId }) : '';
      const response = await api.get(
        `/market/trends${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('市場趨勢獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場趨勢獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取市場趨勢失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取市場趨勢失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取市場趨勢時發生錯誤:', error);
      return {
        success: false,
        message: '獲取市場趨勢時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

// 導出單例實例
export const marketService = MarketService.getInstance();
