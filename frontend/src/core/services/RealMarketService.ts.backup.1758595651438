/**
 * 真實市場服務實現
 * 集成實際的市場數據源和價格預測算法
 */

import { logger } from '../core/utils/logger';
import { apiService } from './apiService';

export interface MarketPrice {
  cardId: string;
  platform: string;
  price: number;
  currency: string;
  condition: string;
  timestamp: Date;
  source: string;
  sellerInfo?: {
    sellerId: string;
    sellerName: string;
    rating: number;
    location: string;
  };
}

export interface PriceHistory {
  cardId: string;
  date: Date;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  volume: number;
  platform: string;
}

export interface MarketAnalysis {
  cardId: string;
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  trendStrength: number;
  priceVolatility: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  supplyLevel: 'low' | 'medium' | 'high' | 'very_high';
  marketCap: number;
  liquidity: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  predictions: {
    shortTerm: PricePrediction;
    mediumTerm: PricePrediction;
    longTerm: PricePrediction;
  };
}

export interface PricePrediction {
  timeframe: '1_week' | '1_month' | '3_months' | '6_months' | '1_year';
  predictedPrice: number;
  confidence: number;
  factors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketData {
  prices: MarketPrice[];
  history: PriceHistory[];
  analysis: MarketAnalysis;
  lastUpdated: Date;
}

export interface MarketFilters {
  cardIds?: string[];
  platforms?: string[];
  conditions?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

class RealMarketService {
  private static instance: RealMarketService;
  private isInitialized = false;
  private cache: Map<string, { data: MarketData; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分鐘緩存

  public static getInstance(): RealMarketService {
    if (!RealMarketService.instance) {
      RealMarketService.instance = new RealMarketService();
    }
    return RealMarketService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('初始化真實市場服務');

      // 檢查市場數據API可用性
      await this.checkMarketDataAPIs();

      // 初始化價格預測模型
      await this.initializePricePredictionModel();

      // 設置數據同步
      await this.setupDataSync();

      this.isInitialized = true;
      logger.info('真實市場服務初始化完成');
    } catch (error) {
      logger.error('真實市場服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取市場價格數據
   */
  public async getMarketPrices(cardIds: string[]): Promise<MarketPrice[]> {
    try {
      logger.info('獲取市場價格數據', { cardCount: cardIds.length });

      const response = await apiService.post('/market/prices', {
        cardIds,
        platforms: ['tcgplayer', 'cardmarket', 'ebay', 'mercari', 'snkrdunk'],
        includeSellerInfo: true,
      });

      if (response.success && response.data) {
        return response.data.map((price: any) => ({
          cardId: price.cardId,
          platform: price.platform,
          price: price.price,
          currency: price.currency,
          condition: price.condition,
          timestamp: new Date(price.timestamp),
          source: price.source,
          sellerInfo: price.sellerInfo,
        }));
      } else {
        throw new Error('獲取市場價格失敗');
      }
    } catch (error) {
      logger.error('獲取市場價格失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取價格歷史
   */
  public async getPriceHistory(
    cardId: string,
    timeframe: '1_month' | '3_months' | '6_months' | '1_year' = '3_months'
  ): Promise<PriceHistory[]> {
    try {
      logger.info('獲取價格歷史', { cardId, timeframe });

      const cacheKey = `price_history_${cardId}_${timeframe}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached.history;
      }

      const response = await apiService.get(`/market/history/${cardId}`, {
        params: { timeframe },
      });

      if (response.success && response.data) {
        const history = response.data.map((item: any) => ({
          cardId: item.cardId,
          date: new Date(item.date),
          averagePrice: item.averagePrice,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          medianPrice: item.medianPrice,
          volume: item.volume,
          platform: item.platform,
        }));

        // 緩存結果
        this.setCachedData(cacheKey, { history, analysis: null, prices: [] });

        return history;
      } else {
        throw new Error('獲取價格歷史失敗');
      }
    } catch (error) {
      logger.error('獲取價格歷史失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取市場分析
   */
  public async getMarketAnalysis(cardId: string): Promise<MarketAnalysis> {
    try {
      logger.info('獲取市場分析', { cardId });

      const cacheKey = `market_analysis_${cardId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached && cached.analysis) {
        return cached.analysis;
      }

      const response = await apiService.get(`/market/analysis/${cardId}`);

      if (response.success && response.data) {
        const analysis: MarketAnalysis = {
          cardId: response.data.cardId,
          trend: response.data.trend,
          trendStrength: response.data.trendStrength,
          priceVolatility: response.data.priceVolatility,
          demandLevel: response.data.demandLevel,
          supplyLevel: response.data.supplyLevel,
          marketCap: response.data.marketCap,
          liquidity: response.data.liquidity,
          sentiment: response.data.sentiment,
          predictions: {
            shortTerm: response.data.predictions.shortTerm,
            mediumTerm: response.data.predictions.mediumTerm,
            longTerm: response.data.predictions.longTerm,
          },
        };

        // 緩存結果
        this.setCachedData(cacheKey, { analysis, history: [], prices: [] });

        return analysis;
      } else {
        throw new Error('獲取市場分析失敗');
      }
    } catch (error) {
      logger.error('獲取市場分析失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取綜合市場數據
   */
  public async getMarketData(cardId: string): Promise<MarketData> {
    try {
      logger.info('獲取綜合市場數據', { cardId });

      const cacheKey = `market_data_${cardId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return {
          prices: cached.prices,
          history: cached.history,
          analysis: cached.analysis!,
          lastUpdated: cached.timestamp,
        };
      }

      // 並行獲取所有數據
      const [prices, history, analysis] = await Promise.all([
        this.getMarketPrices([cardId]),
        this.getPriceHistory(cardId),
        this.getMarketAnalysis(cardId),
      ]);

      const marketData: MarketData = {
        prices,
        history,
        analysis,
        lastUpdated: new Date(),
      };

      // 緩存完整數據
      this.setCachedData(cacheKey, marketData);

      return marketData;
    } catch (error) {
      logger.error('獲取綜合市場數據失敗:', error);
      throw error;
    }
  }

  /**
   * 批量獲取市場數據
   */
  public async getBatchMarketData(
    cardIds: string[]
  ): Promise<Map<string, MarketData>> {
    try {
      logger.info('批量獲取市場數據', { cardCount: cardIds.length });

      const response = await apiService.post('/market/batch', {
        cardIds,
        includePrices: true,
        includeHistory: true,
        includeAnalysis: true,
      });

      if (response.success && response.data) {
        const result = new Map<string, MarketData>();

        for (const cardId of cardIds) {
          const data = response.data[cardId];
          if (data) {
            result.set(cardId, {
              prices: data.prices || [],
              history: data.history || [],
              analysis: data.analysis,
              lastUpdated: new Date(data.lastUpdated),
            });
          }
        }

        return result;
      } else {
        throw new Error('批量獲取市場數據失敗');
      }
    } catch (error) {
      logger.error('批量獲取市場數據失敗:', error);
      throw error;
    }
  }

  /**
   * 搜索市場數據
   */
  public async searchMarketData(filters: MarketFilters): Promise<MarketData[]> {
    try {
      logger.info('搜索市場數據', { filters });

      const response = await apiService.post('/market/search', {
        filters: {
          ...filters,
          dateRange: filters.dateRange
            ? {
                start: filters.dateRange.start.toISOString(),
                end: filters.dateRange.end.toISOString(),
              }
            : undefined,
        },
      });

      if (response.success && response.data) {
        return response.data.map((item: any) => ({
          prices: item.prices || [],
          history: item.history || [],
          analysis: item.analysis,
          lastUpdated: new Date(item.lastUpdated),
        }));
      } else {
        throw new Error('搜索市場數據失敗');
      }
    } catch (error) {
      logger.error('搜索市場數據失敗:', error);
      throw error;
    }
  }

  /**
   * 預測價格
   */
  public async predictPrice(
    cardId: string,
    timeframe: '1_week' | '1_month' | '3_months' | '6_months' | '1_year'
  ): Promise<PricePrediction> {
    try {
      logger.info('預測價格', { cardId, timeframe });

      const response = await apiService.post('/market/predict', {
        cardId,
        timeframe,
        factors: [
          'historical_trends',
          'market_sentiment',
          'supply_demand',
          'seasonal_patterns',
          'news_events',
        ],
      });

      if (response.success && response.data) {
        return {
          timeframe: response.data.timeframe,
          predictedPrice: response.data.predictedPrice,
          confidence: response.data.confidence,
          factors: response.data.factors,
          riskLevel: response.data.riskLevel,
        };
      } else {
        throw new Error('價格預測失敗');
      }
    } catch (error) {
      logger.error('價格預測失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取市場趨勢
   */
  public async getMarketTrends(
    category?: string,
    timeframe: '1_week' | '1_month' | '3_months' = '1_month'
  ): Promise<unknown> {
    try {
      logger.info('獲取市場趨勢', { category, timeframe });

      const response = await apiService.get('/market/trends', {
        params: { category, timeframe },
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取市場趨勢失敗');
      }
    } catch (error) {
      logger.error('獲取市場趨勢失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取市場統計
   */
  public async getMarketStats(): Promise<unknown> {
    try {
      logger.info('獲取市場統計');

      const response = await apiService.get('/market/stats');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取市場統計失敗');
      }
    } catch (error) {
      logger.error('獲取市場統計失敗:', error);
      throw error;
    }
  }

  /**
   * 設置價格提醒
   */
  public async setPriceAlert(
    cardId: string,
    targetPrice: number,
    condition: 'above' | 'below',
    userId: string
  ): Promise<string> {
    try {
      logger.info('設置價格提醒', { cardId, targetPrice, condition, userId });

      const response = await apiService.post('/market/alerts', {
        cardId,
        targetPrice,
        condition,
        userId,
        isActive: true,
      });

      if (response.success && response.data) {
        return response.data.alertId;
      } else {
        throw new Error('設置價格提醒失敗');
      }
    } catch (error) {
      logger.error('設置價格提醒失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取價格提醒
   */
  public async getPriceAlerts(userId: string): Promise<unknown[]> {
    try {
      logger.info('獲取價格提醒', { userId });

      const response = await apiService.get(`/market/alerts/user/${userId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取價格提醒失敗');
      }
    } catch (error) {
      logger.error('獲取價格提醒失敗:', error);
      throw error;
    }
  }

  /**
   * 清除緩存
   */
  public clearCache(): void {
    this.cache.clear();
    logger.info('市場數據緩存已清除');
  }

  /**
   * 獲取緩存數據
   */
  private getCachedData(key: string): MarketData | null {
    const cached = this.cache.get(key);
    if (
      cached &&
      Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION
    ) {
      return {
        prices: cached.data.prices,
        history: cached.data.history,
        analysis: cached.data.analysis,
        lastUpdated: cached.timestamp,
      };
    }
    return null;
  }

  /**
   * 設置緩存數據
   */
  private setCachedData(key: string, data: Partial<MarketData>): void {
    this.cache.set(key, {
      data: {
        prices: data.prices || [],
        history: data.history || [],
        analysis: data.analysis || null,
        lastUpdated: new Date(),
      },
      timestamp: new Date(),
    });
  }

  /**
   * 檢查市場數據API可用性
   */
  private async checkMarketDataAPIs(): Promise<void> {
    try {
      const apis = [
        '/market/health/tcgplayer',
        '/market/health/cardmarket',
        '/market/health/ebay',
        '/market/health/mercari',
        '/market/health/snkrdunk',
      ];

      const healthChecks = await Promise.allSettled(
        apis.map(api => apiService.get(api))
      );

      const availableAPIs = healthChecks.filter(
        result => result.status === 'fulfilled'
      ).length;

      logger.info(
        `市場數據API可用性檢查完成: ${availableAPIs}/${apis.length} 個API可用`
      );
    } catch (error) {
      logger.warn('市場數據API可用性檢查失敗:', error);
    }
  }

  /**
   * 初始化價格預測模型
   */
  private async initializePricePredictionModel(): Promise<void> {
    try {
      const response = await apiService.get('/market/models/price-prediction');

      if (response.success && response.data) {
        logger.info('價格預測模型初始化完成', {
          modelVersion: response.data.version,
          accuracy: response.data.accuracy,
        });
      }
    } catch (error) {
      logger.warn('價格預測模型初始化失敗:', error);
    }
  }

  /**
   * 設置數據同步
   */
  private async setupDataSync(): Promise<void> {
    try {
      // 設置定期數據同步
      setInterval(
        async () => {
          try {
            await this.syncMarketData();
          } catch (error) {
            logger.error('市場數據同步失敗:', error);
          }
        },
        10 * 60 * 1000
      ); // 每10分鐘同步一次

      logger.info('市場數據同步設置完成');
    } catch (error) {
      logger.warn('市場數據同步設置失敗:', error);
    }
  }

  /**
   * 同步市場數據
   */
  private async syncMarketData(): Promise<void> {
    try {
      const response = await apiService.post('/market/sync', {
        syncType: 'incremental',
        lastSyncTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      });

      if (response.success) {
        logger.debug('市場數據同步完成', {
          syncedRecords: response.data.syncedRecords,
          syncTime: response.data.syncTime,
        });
      }
    } catch (error) {
      logger.error('市場數據同步失敗:', error);
    }
  }
}

export const realMarketService = RealMarketService.getInstance();
