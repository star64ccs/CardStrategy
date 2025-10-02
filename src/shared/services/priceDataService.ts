import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 價格Data
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
 * 市場Statistics
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
 * 價格Alert
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
 * Create價格AlertRequest
 */
export interface CreatePriceAlertRequest {
  cardId: string;
  targetPrice: number;
  condition: PriceAlert['condition'];
}

/**
 * 價格DataService
 */
export class PriceDataService {
  private readonly baseUrl = '/api/price-data';

  /**
   * Get卡牌當前價格
   */
  async getCurrentPrice(
    cardId: string,
    condition?: PriceData['condition']
  ): Promise<any> {
    try {
      logger.info('獲取卡牌當前價格:', { cardId, condition });

      const _params = condition ? new URLSearchParams({ condition }) : '';
      const _response = await api.get(
        `${this.baseUrl}/current/${cardId}${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('卡牌當前價格GetSuccess:', {
          cardId,
          price: (response.data as any)?.price,
        });
        return {
          success: true,
          data: response.data,
          message: '卡牌當前價格GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get卡牌當前價格Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get卡牌當前價格Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get卡牌當前價格時發生Error:', error);
      return {
        success: false,
        message: 'Get卡牌當前價格時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get卡牌價格歷史
   */
  async getPriceHistory(
    cardId: string,
    period: PriceHistory['period'] = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取卡牌價格歷史:', { cardId, period });

      const _response = await api.get(
        `${this.baseUrl}/history/${cardId}?period=${period}`
      );

      if (response.success) {
        logger.info('卡牌價格歷史GetSuccess:', {
          cardId,
          dataPoints: (response.data as any)?.prices?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '卡牌價格歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get卡牌價格歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get卡牌價格歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get卡牌價格歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get卡牌價格歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get市場Statistics
   */
  async getMarketStats(cardId: string): Promise<any> {
    try {
      logger.info('獲取市場統計:', { cardId });

      const _response = await api.get(`${this.baseUrl}/stats/${cardId}`);

      if (response.success) {
        logger.info('市場統計GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場統計GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get市場統計Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get市場統計Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get市場統計時發生Error:', error);
      return {
        success: false,
        message: 'Get市場統計時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchGet價格
   */
  async getBatchPrices(
    cardIds: string[],
    condition?: PriceData['condition']
  ): Promise<any> {
    try {
      logger.info('批量獲取價格:', { cardCount: cardIds.length, condition });

      const _params = condition ? new URLSearchParams({ condition }) : '';
      const _response = await api.post(
        `${this.baseUrl}/batch${params ? `?${params}` : ''}`,
        { cardIds }
      );

      if (response.success) {
        logger.info('批量價格GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '批量價格GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量Get價格Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量Get價格Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量Get價格時發生Error:', error);
      return {
        success: false,
        message: '批量Get價格時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Create價格Alert
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

      const _response = await api.post(`${this.baseUrl}/alerts`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('價格警報CreateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '價格警報CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Create價格警報Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Create價格警報Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create價格警報時發生Error:', error);
      return {
        success: false,
        message: 'Create價格警報時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser價格Alert
   */
  async getUserPriceAlerts(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶價格警報:', { userId });

      const _response = await api.get(`${this.baseUrl}/alerts/user/${userId}`);

      if (response.success) {
        logger.info('用戶價格警報GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '用戶價格警報GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶價格警報Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶價格警報Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶價格警報時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶價格警報時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update價格Alert
   */
  async updatePriceAlert(
    alertId: string,
    updates: Partial<CreatePriceAlertRequest>
  ): Promise<any> {
    try {
      logger.info('更新價格警報:', { alertId, updates });

      const _response = await api.put(
        `${this.baseUrl}/alerts/${alertId}`,
        updates
      );

      if (response.success) {
        logger.info('價格警報UpdateSuccess:', { alertId });
        return {
          success: true,
          data: response.data,
          message: '價格警報UpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update價格警報Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update價格警報Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update價格警報時發生Error:', error);
      return {
        success: false,
        message: 'Update價格警報時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Delete價格Alert
   */
  async deletePriceAlert(alertId: string): Promise<any> {
    try {
      logger.info('刪除價格警報:', { alertId });

      const _response = await api.delete(`${this.baseUrl}/alerts/${alertId}`);

      if (response.success) {
        logger.info('價格警報DeleteSuccess:', { alertId });
        return {
          success: true,
          message: '價格警報DeleteSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Delete價格警報Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Delete價格警報Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Delete價格警報時發生Error:', error);
      return {
        success: false,
        message: 'Delete價格警報時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get熱門卡牌
   */
  async getTrendingCards(limit = 10): Promise<any> {
    try {
      logger.info('獲取熱門卡牌:', { limit });

      const _response = await api.get(
        `${this.baseUrl}/trending?limit=${limit}`
      );

      if (response.success) {
        logger.info('熱門卡牌GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '熱門卡牌GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get熱門卡牌Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get熱門卡牌Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get熱門卡牌時發生Error:', error);
      return {
        success: false,
        message: 'Get熱門卡牌時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get價格數據Service狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

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
        message: '價格數據Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get價格數據Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get價格數據Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get歷史價格Data
   */
  async getHistoricalPrices(
    cardId: string,
    platforms?: unknown[],
    timeRange?: unknown
  ): Promise<any> {
    try {
      logger.info('獲取歷史價格數據:', { cardId, platforms, timeRange });

      const _params = new URLSearchParams();
      if (platforms) {
        params.append('platforms', JSON.stringify(platforms));
      }
      if (timeRange) {
        params.append('timeRange', JSON.stringify(timeRange));
      }

      const _response = await api.get(
        `${this.baseUrl}/history/${cardId}?${params}`
      );

      if (response.success) {
        logger.info('歷史價格數據GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '歷史價格數據GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get歷史價格數據Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get歷史價格數據Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get歷史價格數據時發生Error:', error);
      return {
        success: false,
        message: 'Get歷史價格數據時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get評級機構Data
   */
  async getGradingAgencyData(
    cardId: string,
    agencies?: unknown[]
  ): Promise<any> {
    try {
      logger.info('獲取評級機構數據:', { cardId, agencies });

      const _params = new URLSearchParams();
      if (agencies) {
        params.append('agencies', JSON.stringify(agencies));
      }

      const _response = await api.get(
        `${this.baseUrl}/grading/${cardId}?${params}`
      );

      if (response.success) {
        logger.info('評級機構數據GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '評級機構數據GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get評級機構數據Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get評級機構數據Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get評級機構數據時發生Error:', error);
      return {
        success: false,
        message: 'Get評級機構數據時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get推薦平台
   */
  async getRecommendedPlatforms(): Promise<any> {
    try {
      logger.info('獲取推薦平台');

      const _response = await api.get(`${this.baseUrl}/platforms/recommended`);

      if (response.success) {
        logger.info('推薦平台GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '推薦平台GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get推薦平台Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get推薦平台Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get推薦平台時發生Error:', error);
      return {
        success: false,
        message: 'Get推薦平台時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check平台Status
   */
  async checkPlatformStatus(platforms: unknown[]): Promise<any> {
    try {
      logger.info('檢查平台狀態:', { platforms });

      const _response = await api.post(`${this.baseUrl}/platforms/status`, {
        platforms,
      });

      if (response.success) {
        logger.info('平台狀態CheckSuccess');
        return {
          success: true,
          data: response.data,
          message: '平台狀態CheckSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Check平台狀態Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Check平台狀態Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Check平台狀態時發生Error:', error);
      return {
        success: false,
        message: 'Check平台狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

export const _priceDataService = new PriceDataService();
