import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 價格數據
 */
export interface PriceData {
  id: string;
  cardId: string;
  price: number;
  currency: string;
  source: string;
  condition:
    | 'mint'
    | 'near_mint'
    | 'excellent'
    | 'good'
    | 'light_played'
    | 'played'
    | 'poor';
  market: string;
  timestamp: Date;
  volume?: number;
  lastUpdated: Date;
}

/**
 * 價格歷史
 */
export interface PriceHistory {
  cardId: string;
  prices: {
    price: number;
    timestamp: Date;
    volume?: number;
  }[];
  period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
}

/**
 * 市場統計
 */
export interface MarketStats {
  cardId: string;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  lastUpdated: Date;
}

/**
 * 價格警報
 */
export interface PriceAlert {
  id: string;
  userId: string;
  cardId: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

/**
 * 創建價格警報請求
 */
export interface CreatePriceAlertRequest {
  cardId: string;
  targetPrice: number;
  condition: PriceAlert['condition'];
}

/**
 * 價格數據服務
 */
export class PriceDataService {
  private readonly baseUrl = '/api/price-data';

  /**
   * 獲取卡牌當前價格
   */
  async getCurrentPrice(
    cardId: string,
    condition?: PriceData['condition']
  ): Promise<any> {
    try {
      logger.info('獲取卡牌當前價格:', { cardId, condition });

      const params = condition ? new URLSearchParams({ condition }) : '';
      const response = await api.get(
        `${this.baseUrl}/current/${cardId}${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('卡牌當前價格獲取成功:', {
          cardId,
          price: (response.data as any)?.price,
        });
        return {
          success: true,
          data: response.data,
          message: '卡牌當前價格獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取卡牌當前價格失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取卡牌當前價格失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取卡牌當前價格時發生錯誤:', error);
      return {
        success: false,
        message: '獲取卡牌當前價格時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取卡牌價格歷史
   */
  async getPriceHistory(
    cardId: string,
    period: PriceHistory['period'] = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取卡牌價格歷史:', { cardId, period });

      const response = await api.get(
        `${this.baseUrl}/history/${cardId}?period=${period}`
      );

      if (response.success) {
        logger.info('卡牌價格歷史獲取成功:', {
          cardId,
          dataPoints: (response.data as any)?.prices?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '卡牌價格歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取卡牌價格歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取卡牌價格歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取卡牌價格歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取卡牌價格歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取市場統計
   */
  async getMarketStats(cardId: string): Promise<any> {
    try {
      logger.info('獲取市場統計:', { cardId });

      const response = await api.get(`${this.baseUrl}/stats/${cardId}`);

      if (response.success) {
        logger.info('市場統計獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場統計獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取市場統計失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取市場統計失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取市場統計時發生錯誤:', error);
      return {
        success: false,
        message: '獲取市場統計時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量獲取價格
   */
  async getBatchPrices(
    cardIds: string[],
    condition?: PriceData['condition']
  ): Promise<any> {
    try {
      logger.info('批量獲取價格:', { cardCount: cardIds.length, condition });

      const params = condition ? new URLSearchParams({ condition }) : '';
      const response = await api.post(
        `${this.baseUrl}/batch${params ? `?${params}` : ''}`,
        { cardIds }
      );

      if (response.success) {
        logger.info('批量價格獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '批量價格獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量獲取價格失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量獲取價格失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量獲取價格時發生錯誤:', error);
      return {
        success: false,
        message: '批量獲取價格時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 創建價格警報
   */
  async createPriceAlert(
    userId: string,
    data: CreatePriceAlertRequest
  ): Promise<any> {
    try {
      logger.info('創建價格警報:', {
        userId,
        cardId: data.cardId,
        targetPrice: data.targetPrice,
      });

      const response = await api.post(`${this.baseUrl}/alerts`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('價格警報創建成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '價格警報創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('創建價格警報失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '創建價格警報失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建價格警報時發生錯誤:', error);
      return {
        success: false,
        message: '創建價格警報時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶價格警報
   */
  async getUserPriceAlerts(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶價格警報:', { userId });

      const response = await api.get(`${this.baseUrl}/alerts/user/${userId}`);

      if (response.success) {
        logger.info('用戶價格警報獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶價格警報獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶價格警報失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶價格警報失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶價格警報時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶價格警報時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新價格警報
   */
  async updatePriceAlert(
    alertId: string,
    updates: Partial<CreatePriceAlertRequest>
  ): Promise<any> {
    try {
      logger.info('更新價格警報:', { alertId, updates });

      const response = await api.put(
        `${this.baseUrl}/alerts/${alertId}`,
        updates
      );

      if (response.success) {
        logger.info('價格警報更新成功:', { alertId });
        return {
          success: true,
          data: response.data,
          message: '價格警報更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新價格警報失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新價格警報失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新價格警報時發生錯誤:', error);
      return {
        success: false,
        message: '更新價格警報時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 刪除價格警報
   */
  async deletePriceAlert(alertId: string): Promise<any> {
    try {
      logger.info('刪除價格警報:', { alertId });

      const response = await api.delete(`${this.baseUrl}/alerts/${alertId}`);

      if (response.success) {
        logger.info('價格警報刪除成功:', { alertId });
        return {
          success: true,
          message: '價格警報刪除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('刪除價格警報失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '刪除價格警報失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('刪除價格警報時發生錯誤:', error);
      return {
        success: false,
        message: '刪除價格警報時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取熱門卡牌
   */
  async getTrendingCards(limit = 10): Promise<any> {
    try {
      logger.info('獲取熱門卡牌:', { limit });

      const response = await api.get(
        `${this.baseUrl}/trending?limit=${limit}`
      );

      if (response.success) {
        logger.info('熱門卡牌獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '熱門卡牌獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取熱門卡牌失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取熱門卡牌失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取熱門卡牌時發生錯誤:', error);
      return {
        success: false,
        message: '獲取熱門卡牌時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取價格數據服務狀態');

      const response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'price-data',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            current: `${this.baseUrl}/current/:cardId`,
            history: `${this.baseUrl}/history/:cardId`,
            stats: `${this.baseUrl}/stats/:cardId`,
            batch: `${this.baseUrl}/batch`,
            alerts: `${this.baseUrl}/alerts`,
            trending: `${this.baseUrl}/trending`,
          },
        },
        message: '價格數據服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取價格數據服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取價格數據服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取歷史價格數據
   */
  async getHistoricalPrices(
    cardId: string,
    platforms?: unknown[],
    timeRange?: unknown
  ): Promise<any> {
    try {
      logger.info('獲取歷史價格數據:', { cardId, platforms, timeRange });

      const params = new URLSearchParams();
      if (platforms) {
        params.append('platforms', JSON.stringify(platforms));
      }
      if (timeRange) {
        params.append('timeRange', JSON.stringify(timeRange));
      }

      const response = await api.get(
        `${this.baseUrl}/history/${cardId}?${params}`
      );

      if (response.success) {
        logger.info('歷史價格數據獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '歷史價格數據獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取歷史價格數據失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取歷史價格數據失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取歷史價格數據時發生錯誤:', error);
      return {
        success: false,
        message: '獲取歷史價格數據時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取評級機構數據
   */
  async getGradingAgencyData(
    cardId: string,
    agencies?: unknown[]
  ): Promise<any> {
    try {
      logger.info('獲取評級機構數據:', { cardId, agencies });

      const params = new URLSearchParams();
      if (agencies) {
        params.append('agencies', JSON.stringify(agencies));
      }

      const response = await api.get(
        `${this.baseUrl}/grading/${cardId}?${params}`
      );

      if (response.success) {
        logger.info('評級機構數據獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '評級機構數據獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取評級機構數據失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取評級機構數據失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取評級機構數據時發生錯誤:', error);
      return {
        success: false,
        message: '獲取評級機構數據時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取推薦平台
   */
  async getRecommendedPlatforms(): Promise<any> {
    try {
      logger.info('獲取推薦平台');

      const response = await api.get(`${this.baseUrl}/platforms/recommended`);

      if (response.success) {
        logger.info('推薦平台獲取成功');
        return {
          success: true,
          data: response.data,
          message: '推薦平台獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取推薦平台失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取推薦平台失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取推薦平台時發生錯誤:', error);
      return {
        success: false,
        message: '獲取推薦平台時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 檢查平台狀態
   */
  async checkPlatformStatus(platforms: unknown[]): Promise<any> {
    try {
      logger.info('檢查平台狀態:', { platforms });

      const response = await api.post(`${this.baseUrl}/platforms/status`, {
        platforms,
      });

      if (response.success) {
        logger.info('平台狀態檢查成功');
        return {
          success: true,
          data: response.data,
          message: '平台狀態檢查成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('檢查平台狀態失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '檢查平台狀態失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('檢查平台狀態時發生錯誤:', error);
      return {
        success: false,
        message: '檢查平台狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

export const priceDataService = new PriceDataService();
