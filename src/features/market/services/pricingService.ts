import { logger } from '../../../core/utils/logger';
import type {
  PriceData,
  MarketPrice,
  PriceHistory,
  PriceAlert,
  MarketAnalysis,
  PriceRequest,
  PriceResponse,
  PriceStats,
  PriceServiceConfig,
} from '../types/pricing';
import {
  PriceConfig,
  PriceSource,
  PriceTrend,
  MarketStatus,
  PriceAlertType,
} from '../types/pricing';

/**
 * 市場價格服務類
 * 負責實時價格追蹤、歷史價格分析、價格警報等功能
 */
class PricingService {
  private static instance: PricingService;
  private config: PriceServiceConfig;
  private readonly priceCache: Map<string, MarketPrice> = new Map();
  private readonly alertCache: Map<string, PriceAlert[]> = new Map();
  private updateInterval?: NodeJS.Timeout;
  private alertCheckInterval?: NodeJS.Timeout;

  private constructor() {
    this.config = {
      baseUrl: 'https://api.cardstrategy.com/pricing',
      timeout: 10000,
      retryAttempts: 3,
      cacheEnabled: true,
      cacheExpiry: 300000, // 5分鐘
    };
  }

  public static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(config?: Partial<PriceServiceConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      logger.info('市場價格服務初始化開始');

      // 啟動實時更新
      this.startRealTimeUpdates();

      // 啟動警報檢查
      this.startAlertChecking();

      logger.info('市場價格服務初始化完成');
    } catch (error) {
      logger.error('市場價格服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取卡牌當前價格
   */
  public async getCurrentPrice(request: PriceRequest): Promise<PriceResponse> {
    try {
      const _cacheKey = `${request.cardId}_${request.condition || 'all'}`;

      // 檢查緩存
      if (this.config.cacheEnabled && this.priceCache.has(cacheKey)) {
        const _cached = this.priceCache.get(cacheKey)!;
        if (
          Date.now() - new Date(cached.lastUpdated).getTime() <
          this.config.cacheExpiry
        ) {
          return {
            success: true,
            data: cached,
          };
        }
      }

      // 模擬API調用
      const _priceData = await this.fetchPriceData(request);
      const _marketPrice = this.processPriceData(priceData);

      // 更新緩存
      if (this.config.cacheEnabled) {
        this.priceCache.set(cacheKey, marketPrice);
      }

      const response: PriceResponse = {
        success: true,
        data: marketPrice,
      };

      // 包含歷史數據
      if (request.includeHistory) {
        response.history = await this.getPriceHistory(
          request.cardId,
          request.period
        );
      }

      // 包含分析數據
      response.analysis = await this.generateMarketAnalysis(request.cardId);

      // 包含警報數據
      response.alerts = await this.getUserAlerts(request.cardId);

      return response;
    } catch (error) {
      logger.error('獲取當前價格失敗:', error);
      return {
        success: false,
        data: {} as MarketPrice,
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 獲取價格歷史
   */
  public async getPriceHistory(
    cardId: string,
    period = '30d'
  ): Promise<PriceHistory> {
    try {
      logger.info(`獲取卡牌 ${cardId} 的價格歷史，期間: ${period}`);

      // 模擬歷史數據
      const _historyData = this.generateMockHistoryData(cardId, period);

      return {
        id: `history_${cardId}_${period}`,
        cardId,
        period,
        data: historyData,
        statistics: this.calculateHistoryStatistics(historyData),
      };
    } catch (error) {
      logger.error('獲取價格歷史失敗:', error);
      throw error;
    }
  }

  /**
   * 創建價格警報
   */
  public async createPriceAlert(
    alert: Omit<PriceAlert, 'id' | 'createdAt'>
  ): Promise<PriceAlert> {
    try {
      const newAlert: PriceAlert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      logger.info(`創建價格警報: ${newAlert.id}`);

      // 存儲警報
      const _userAlerts = this.alertCache.get(alert.userId) || [];
      userAlerts.push(newAlert);
      this.alertCache.set(alert.userId, userAlerts);

      return newAlert;
    } catch (error) {
      logger.error('創建價格警報失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶警報
   */
  public async getUserAlerts(cardId?: string): Promise<PriceAlert[]> {
    try {
      // 模擬用戶警報數據
      const mockAlerts: PriceAlert[] = [
        {
          id: 'alert_1',
          userId: 'user_1',
          cardId: 'card_1',
          type: PriceAlertType.ABOVE,
          threshold: 1000,
          isActive: true,
          createdAt: new Date().toISOString(),
          metadata: {
            email: true,
            push: true,
          },
        },
        {
          id: 'alert_2',
          userId: 'user_1',
          cardId: 'card_2',
          type: PriceAlertType.BELOW,
          threshold: 500,
          isActive: true,
          createdAt: new Date().toISOString(),
          metadata: {
            email: true,
          },
        },
      ];

      if (cardId) {
        return mockAlerts.filter(alert => alert.cardId === cardId);
      }

      return mockAlerts;
    } catch (error) {
      logger.error('獲取用戶警報失敗:', error);
      throw error;
    }
  }

  /**
   * 更新警報狀態
   */
  public async updateAlertStatus(
    alertId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      logger.info(`更新警報狀態: ${alertId}, 狀態: ${isActive}`);

      // 更新所有用戶的警報
      for (const [userId, alerts] of this.alertCache.entries()) {
        const _alert = alerts.find(a => a.id === alertId);
        if (alert) {
          alert.isActive = isActive;
          this.alertCache.set(userId, alerts);
          break;
        }
      }
    } catch (error) {
      logger.error('更新警報狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除警報
   */
  public async deleteAlert(alertId: string): Promise<void> {
    try {
      logger.info(`刪除警報: ${alertId}`);

      // 從所有用戶的警報中刪除
      for (const [userId, alerts] of this.alertCache.entries()) {
        const _filteredAlerts = alerts.filter(a => a.id !== alertId);
        this.alertCache.set(userId, filteredAlerts);
      }
    } catch (error) {
      logger.error('刪除警報失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取市場統計
   */
  public async getMarketStats(): Promise<PriceStats> {
    try {
      logger.info('獲取市場統計數據');

      // 模擬市場統計數據
      return {
        totalCards: 15000,
        activeMarkets: 8,
        totalVolume24h: 2500000,
        averagePriceChange: 2.5,
        trendingCards: ['card_1', 'card_2', 'card_3'],
        topGainers: ['card_4', 'card_5', 'card_6'],
        topLosers: ['card_7', 'card_8', 'card_9'],
        marketStatus: MarketStatus.ACTIVE,
      };
    } catch (error) {
      logger.error('獲取市場統計失敗:', error);
      throw error;
    }
  }

  /**
   * 生成市場分析
   */
  public async generateMarketAnalysis(cardId: string): Promise<MarketAnalysis> {
    try {
      logger.info(`生成卡牌 ${cardId} 的市場分析`);

      // 模擬市場分析數據
      return {
        id: `analysis_${cardId}_${Date.now()}`,
        cardId,
        analysisDate: new Date().toISOString(),
        summary: '該卡牌近期表現穩定，市場需求良好，建議持有或適時買入。',
        trend: PriceTrend.RISING,
        confidence: 0.85,
        factors: {
          marketDemand: 0.8,
          supplyLevel: 0.6,
          competition: 0.7,
          seasonality: 0.5,
          newsImpact: 0.3,
        },
        recommendations: [
          '建議持有該卡牌',
          '關注市場動態',
          '考慮在價格回調時加倉',
        ],
        riskLevel: 'medium',
        timeHorizon: 'medium',
      };
    } catch (error) {
      logger.error('生成市場分析失敗:', error);
      throw error;
    }
  }

  /**
   * 啟動實時更新
   */
  private startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 30000); // 每30秒更新一次

    logger.info('實時價格更新已啟動');
  }

  /**
   * 啟動警報檢查
   */
  private startAlertChecking(): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    this.alertCheckInterval = setInterval(() => {
      this.checkPriceAlerts();
    }, 60000); // 每分鐘檢查一次

    logger.info('價格警報檢查已啟動');
  }

  /**
   * 更新價格數據
   */
  private async updatePrices(): Promise<void> {
    try {
      logger.debug('開始更新價格數據');

      // 模擬價格更新邏輯
      for (const [key, price] of this.priceCache.entries()) {
        const _priceChange = (Math.random() - 0.5) * 10; // 隨機價格變化
        price.currentPrice += priceChange;
        price.priceChange = priceChange;
        price.priceChangePercent =
          (priceChange / (price.currentPrice - priceChange)) * 100;
        price.lastUpdated = new Date().toISOString();

        // 更新趨勢
        if (priceChange > 2) {
          price.trend = PriceTrend.RISING;
        } else if (priceChange < -2) {
          price.trend = PriceTrend.FALLING;
        } else {
          price.trend = PriceTrend.STABLE;
        }
      }

      logger.debug('價格數據更新完成');
    } catch (error) {
      logger.error('更新價格數據失敗:', error);
    }
  }

  /**
   * 檢查價格警報
   */
  private async checkPriceAlerts(): Promise<void> {
    try {
      logger.debug('開始檢查價格警報');

      for (const [userId, alerts] of this.alertCache.entries()) {
        for (const alert of alerts) {
          if (!alert.isActive) continue;

          const _price = this.priceCache.get(alert.cardId);
          if (!price) continue;

          let shouldTrigger = false;

          switch (alert.type) {
            case PriceAlertType.ABOVE:
              shouldTrigger = price.currentPrice > alert.threshold;
              break;
            case PriceAlertType.BELOW:
              shouldTrigger = price.currentPrice < alert.threshold;
              break;
            case PriceAlertType.PERCENTAGE_CHANGE:
              const _changePercent = Math.abs(price.priceChangePercent);
              shouldTrigger = changePercent > alert.threshold;
              break;
            case PriceAlertType.VOLUME_SPIKE:
              shouldTrigger = price.volume24h > alert.threshold;
              break;
          }

          if (shouldTrigger && !alert.triggeredAt) {
            alert.triggeredAt = new Date().toISOString();
            logger.info(`價格警報觸發: ${alert.id}`);
            // 這裡可以發送通知
          }
        }
      }

      logger.debug('價格警報檢查完成');
    } catch (error) {
      logger.error('檢查價格警報失敗:', error);
    }
  }

  /**
   * 獲取價格數據
   */
  private async fetchPriceData(request: PriceRequest): Promise<PriceData[]> {
    // 模擬API調用
    const mockData: PriceData[] = [
      {
        id: `price_${request.cardId}_1`,
        cardId: request.cardId,
        price: 1000 + Math.random() * 500,
        currency: 'USD',
        source: PriceSource.MARKETPLACE,
        timestamp: new Date().toISOString(),
        condition: request.condition || 'NM',
        location: request.location || 'US',
        seller: 'seller_1',
        volume: 100,
        confidence: 0.9,
      },
      {
        id: `price_${request.cardId}_2`,
        cardId: request.cardId,
        price: 950 + Math.random() * 400,
        currency: 'USD',
        source: PriceSource.AUCTION,
        timestamp: new Date().toISOString(),
        condition: request.condition || 'NM',
        location: request.location || 'US',
        volume: 50,
        confidence: 0.8,
      },
    ];

    return mockData;
  }

  /**
   * 處理價格數據
   */
  private processPriceData(priceData: PriceData[]): MarketPrice {
    if (priceData.length === 0) {
      throw new Error('沒有價格數據');
    }

    const _currentPrice = priceData[0].price;
    const _previousPrice = currentPrice * 0.95; // 模擬前一個價格
    const _priceChange = currentPrice - previousPrice;
    const _priceChangePercent = (priceChange / previousPrice) * 100;

    return {
      id: `market_${priceData[0].cardId}`,
      cardId: priceData[0].cardId,
      currentPrice,
      currency: priceData[0].currency,
      priceChange,
      priceChangePercent,
      trend: priceChange > 0 ? PriceTrend.RISING : PriceTrend.FALLING,
      volume24h: priceData.reduce((sum, p) => sum + (p.volume || 0), 0),
      volumeChange: 0,
      lastUpdated: new Date().toISOString(),
      sources: priceData.map(p => p.source),
      confidence:
        priceData.reduce((sum, p) => sum + (p.confidence || 0), 0) /
        priceData.length,
      marketStatus: MarketStatus.ACTIVE,
      priceHistory: priceData,
    };
  }

  /**
   * 生成模擬歷史數據
   */
  private generateMockHistoryData(
    cardId: string,
    period: string
  ): PriceHistory['data'] {
    const _days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const _data = [];

    for (let i = days; i >= 0; i--) {
      const _date = new Date();
      date.setDate(date.getDate() - i);

      const _basePrice = 1000;
      const _randomChange = (Math.random() - 0.5) * 20;
      const _price = basePrice + randomChange;
      const _volume = 50 + Math.random() * 100;

      data.push({
        timestamp: date.toISOString(),
        price,
        volume,
        change: randomChange,
        changePercent: (randomChange / basePrice) * 100,
      });
    }

    return data;
  }

  /**
   * 計算歷史統計數據
   */
  private calculateHistoryStatistics(
    data: PriceHistory['data']
  ): PriceHistory['statistics'] {
    const _prices = data.map(d => d.price);
    const _volumes = data.map(d => d.volume);

    const _high = Math.max(...prices);
    const _low = Math.min(...prices);
    const _average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const _median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const _volumeTotal = volumes.reduce((sum, v) => sum + v, 0);

    // 計算波動性
    const _variance =
      prices.reduce((sum, p) => sum + (p - average) ** 2, 0) / prices.length;
    const _volatility = Math.sqrt(variance);

    return {
      high,
      low,
      average,
      median,
      volatility,
      volumeTotal,
    };
  }

  /**
   * 清理資源
   */
  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
    this.priceCache.clear();
    this.alertCache.clear();
    logger.info('市場價格服務已清理');
  }
}

export default PricingService;
