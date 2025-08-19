import { apiService } from './apiService';
import { notificationService } from './notificationService';
import { marketService } from './marketService';
import { investmentService } from './investmentService';
import { logger } from '@/utils/logger';
import { cacheManager } from '@/utils/cacheManager';
import { networkMonitor } from '@/utils/networkMonitor';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

export interface PriceAlert {
  id: string;
  cardId: string;
  cardName: string;
  targetPrice: number;
  currentPrice: number;
  type: 'above' | 'below';
  userId: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  maxTriggers?: number;
}

export interface PriceChangeEvent {
  cardId: string;
  cardName: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  changeAmount: number;
  timestamp: Date;
  volume?: number;
  marketTrend?: 'up' | 'down' | 'stable';
}

export interface MonitoringConfig {
  checkInterval: number; // 檢查間隔（毫秒）
  priceChangeThreshold: number; // 價格變化閾值（百分比）
  volumeThreshold: number; // 交易量閾值
  maxAlertsPerHour: number; // 每小時最大提醒次數
  enableSmartAlerts: boolean; // 啟用智能提醒
  enableMarketTrendAlerts: boolean; // 啟用市場趨勢提醒
  enableVolumeAlerts: boolean; // 啟用交易量提醒
}

export interface AlertStatistics {
  totalAlerts: number;
  triggeredAlerts: number;
  activeAlerts: number;
  lastTriggerTime?: Date;
  averageResponseTime: number;
  successRate: number;
}

class PriceMonitorService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private activeAlerts: Map<string, PriceAlert> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private alertStatistics: AlertStatistics = {
    totalAlerts: 0,
    triggeredAlerts: 0,
    activeAlerts: 0,
    averageResponseTime: 0,
    successRate: 0
  };

  private config: MonitoringConfig = {
    checkInterval: 5 * 60 * 1000, // 5分鐘
    priceChangeThreshold: 5, // 5%
    volumeThreshold: 1000, // 1000張
    maxAlertsPerHour: 10,
    enableSmartAlerts: true,
    enableMarketTrendAlerts: true,
    enableVolumeAlerts: true
  };

  // 初始化價格監控服務
  async initialize(): Promise<void> {
    try {
      logger.info('初始化價格監控服務');

      // 加載用戶的價格提醒
      await this.loadUserPriceAlerts();

      // 設置監控間隔
      this.startMonitoring();

      // 監聽網絡狀態變化
      networkMonitor.addListener(this.handleNetworkChange.bind(this));

      logger.info('價格監控服務初始化完成');
    } catch (error) {
      logger.error('價格監控服務初始化失敗:', { error });
    }
  }

  // 加載用戶的價格提醒
  private async loadUserPriceAlerts(): Promise<void> {
    try {
      const alerts = await investmentService.getPriceAlerts();
      this.activeAlerts.clear();

      alerts.data.forEach(alert => {
        this.activeAlerts.set(alert.id, {
          ...alert,
          createdAt: new Date(alert.createdAt),
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined
        });
      });

      this.alertStatistics.activeAlerts = this.activeAlerts.size;
      this.alertStatistics.totalAlerts = this.activeAlerts.size;

      logger.info('價格提醒加載完成', { count: this.activeAlerts.size });
    } catch (error) {
      logger.error('加載價格提醒失敗:', { error });
    }
  }

  // 開始監控
  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('價格監控已在運行中');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(
      this.checkPriceChanges.bind(this),
      this.config.checkInterval
    );

    logger.info('價格監控已開始', { interval: this.config.checkInterval });
  }

  // 停止監控
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('價格監控已停止');
  }

  // 檢查價格變化
  private async checkPriceChanges(): Promise<void> {
    if (!networkMonitor.isOnline()) {
      logger.debug('網絡離線，跳過價格檢查');
      return;
    }

    try {
      const startTime = Date.now();
      const alertsToCheck = Array.from(this.activeAlerts.values());

      if (alertsToCheck.length === 0) {
        return;
      }

      logger.debug('開始檢查價格變化', { alertCount: alertsToCheck.length });

      // 批量獲取價格數據
      const cardIds = [...new Set(alertsToCheck.map(alert => alert.cardId))];
      const pricePromises = cardIds.map(cardId =>
        this.getCurrentPrice(cardId).catch(error => {
          logger.error('獲取價格失敗:', { cardId, error });
          return null;
        })
      );

      const priceResults = await Promise.all(pricePromises);
      const priceMap = new Map<string, number>();

      cardIds.forEach((cardId, index) => {
        if (priceResults[index] !== null) {
          priceMap.set(cardId, priceResults[index]!);
        }
      });

      // 檢查每個提醒
      const triggeredAlerts: PriceAlert[] = [];

      for (const alert of alertsToCheck) {
        const currentPrice = priceMap.get(alert.cardId);
        if (!currentPrice) continue;

        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);
        if (shouldTrigger) {
          triggeredAlerts.push({ ...alert, currentPrice });
        }

        // 更新價格歷史
        this.updatePriceHistory(alert.cardId, currentPrice);
      }

      // 處理觸發的提醒
      if (triggeredAlerts.length > 0) {
        await this.processTriggeredAlerts(triggeredAlerts);
      }

      // 智能提醒檢查
      if (this.config.enableSmartAlerts) {
        await this.checkSmartAlerts(priceMap);
      }

      const endTime = Date.now();
      this.updateStatistics(endTime - startTime, triggeredAlerts.length);

      logger.debug('價格檢查完成', {
        duration: endTime - startTime,
        triggeredCount: triggeredAlerts.length
      });
    } catch (error) {
      logger.error('價格檢查失敗:', { error });
    }
  }

  // 獲取當前價格
  private async getCurrentPrice(cardId: string): Promise<number> {
    try {
      // 先嘗試從緩存獲取
      const cachedData = await cacheManager.getCachedMarketData(cardId);
      if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        return cachedData.data.currentPrice;
      }

      // 從API獲取最新價格
      const marketData = await marketService.getMarketData(cardId);
      const {currentPrice} = marketData.data;

      // 緩存價格數據
      await cacheManager.cacheMarketData(cardId, {
        currentPrice,
        timestamp: Date.now(),
        volume: marketData.data.volume,
        change24h: marketData.data.change24h
      });

      return currentPrice;
    } catch (error) {
      logger.error('獲取當前價格失敗:', { cardId, error });
      throw error;
    }
  }

  // 判斷是否應該觸發提醒
  private shouldTriggerAlert(alert: PriceAlert, currentPrice: number): boolean {
    // 檢查是否已達到最大觸發次數
    if (alert.maxTriggers && alert.triggerCount >= alert.maxTriggers) {
      return false;
    }

    // 檢查是否在冷卻期內（避免重複提醒）
    if (alert.lastTriggered) {
      const cooldownPeriod = 30 * 60 * 1000; // 30分鐘
      if (Date.now() - alert.lastTriggered.getTime() < cooldownPeriod) {
        return false;
      }
    }

    // 檢查價格條件
    if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
      return true;
    }

    if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
      return true;
    }

    return false;
  }

  // 更新價格歷史
  private updatePriceHistory(cardId: string, price: number): void {
    if (!this.priceHistory.has(cardId)) {
      this.priceHistory.set(cardId, []);
    }

    const history = this.priceHistory.get(cardId)!;
    history.push(price);

    // 只保留最近100個價格點
    if (history.length > 100) {
      history.shift();
    }
  }

  // 處理觸發的提醒
  private async processTriggeredAlerts(alerts: PriceAlert[]): Promise<void> {
    for (const alert of alerts) {
      try {
        // 發送通知
        await notificationService.sendPriceAlert({
          cardId: alert.cardId,
          cardName: alert.cardName,
          targetPrice: alert.targetPrice,
          currentPrice: alert.currentPrice,
          type: alert.type
        });

        // 更新提醒狀態
        alert.lastTriggered = new Date();
        alert.triggerCount++;
        this.activeAlerts.set(alert.id, alert);

        // 更新統計
        this.alertStatistics.triggeredAlerts++;

        logger.info('價格提醒已觸發', {
          alertId: alert.id,
          cardName: alert.cardName,
          targetPrice: alert.targetPrice,
          currentPrice: alert.currentPrice
        });

        // 如果達到最大觸發次數，停用提醒
        if (alert.maxTriggers && alert.triggerCount >= alert.maxTriggers) {
          alert.isActive = false;
          await this.deactivateAlert(alert.id);
        }
      } catch (error) {
        logger.error('處理價格提醒失敗:', { alertId: alert.id, error });
      }
    }
  }

  // 智能提醒檢查
  private async checkSmartAlerts(priceMap: Map<string, number>): Promise<void> {
    try {
      // 檢查異常價格變化
      for (const [cardId, currentPrice] of priceMap) {
        const history = this.priceHistory.get(cardId);
        if (!history || history.length < 5) continue;

        const recentPrices = history.slice(-5);
        const averagePrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
        const changePercentage = Math.abs((currentPrice - averagePrice) / averagePrice) * 100;

        if (changePercentage > this.config.priceChangeThreshold) {
          await this.sendSmartAlert(cardId, 'price_spike', {
            currentPrice,
            averagePrice,
            changePercentage
          });
        }
      }

      // 檢查市場趨勢
      if (this.config.enableMarketTrendAlerts) {
        await this.checkMarketTrendAlerts();
      }

      // 檢查交易量異常
      if (this.config.enableVolumeAlerts) {
        await this.checkVolumeAlerts();
      }
    } catch (error) {
      logger.error('智能提醒檢查失敗:', { error });
    }
  }

  // 發送智能提醒
  private async sendSmartAlert(
    cardId: string,
    alertType: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const cardName = await this.getCardName(cardId);

      let title = '';
      let body = '';

      switch (alertType) {
        case 'price_spike':
          title = '價格異常波動';
          body = `${cardName} 價格在短時間內${data.changePercentage > 0 ? '上漲' : '下跌'}了 ${data.changePercentage.toFixed(2)}%`;
          break;
        case 'volume_surge':
          title = '交易量激增';
          body = `${cardName} 交易量異常增加，可能預示價格變動`;
          break;
        case 'market_trend':
          title = '市場趨勢變化';
          body = `檢測到市場趨勢變化，建議關注 ${cardName}`;
          break;
      }

      await notificationService.sendMarketUpdate(title, body, {
        type: 'smart_alert',
        alertType,
        cardId,
        cardName,
        ...data
      });

      logger.info('智能提醒已發送', { cardId, alertType, data });
    } catch (error) {
      logger.error('發送智能提醒失敗:', { cardId, alertType, error });
    }
  }

  // 檢查市場趨勢提醒
  private async checkMarketTrendAlerts(): Promise<void> {
    try {
      const marketAnalysis = await marketService.getMarketAnalysis();
      const {sentiment} = marketAnalysis.data;

      // 如果市場情緒發生重大變化，發送提醒
      if (sentiment === 'bullish' || sentiment === 'bearish') {
        await notificationService.sendMarketUpdate(
          '市場趨勢提醒',
          `當前市場情緒為${sentiment === 'bullish' ? '看漲' : '看跌'}，建議調整投資策略`,
          { type: 'market_trend', sentiment }
        );
      }
    } catch (error) {
      logger.error('檢查市場趨勢提醒失敗:', { error });
    }
  }

  // 檢查交易量提醒
  private async checkVolumeAlerts(): Promise<void> {
    try {
      logger.debug('開始檢查交易量異常');

      // 獲取所有活躍的價格提醒
      const alertsToCheck = Array.from(this.activeAlerts.values());
      if (alertsToCheck.length === 0) {
        return;
      }

      // 批量獲取卡片的最新市場數據
      const cardIds = alertsToCheck.map(alert => alert.cardId);
      const marketDataPromises = cardIds.map(async (cardId) => {
        try {
          const response = await apiService.get(`/market/volume/${cardId}`);
          return {
            cardId,
            data: response.data,
            success: true
          };
        } catch (error) {
          logger.warn('獲取卡片交易量數據失敗:', { cardId, error });
          return {
            cardId,
            data: null,
            success: false
          };
        }
      });

      const marketDataResults = await Promise.all(marketDataPromises);
      const successfulResults = marketDataResults.filter(result => result.success);

      // 分析交易量異常
      for (const result of successfulResults) {
        const { cardId, data } = result;
        const alert = alertsToCheck.find(a => a.cardId === cardId);

        if (!alert || !data) continue;

        const {volumeData} = data;
        const currentVolume = volumeData.current24h;
        const averageVolume = volumeData.average7d;
        const volumeChange = volumeData.change24h;

        // 檢測異常交易量
        const volumeThreshold = 2.0; // 交易量超過平均值的2倍視為異常
        const isVolumeSpike = currentVolume > (averageVolume * volumeThreshold);
        const isVolumeDrop = currentVolume < (averageVolume * 0.3); // 交易量低於平均值的30%

        if (isVolumeSpike || isVolumeDrop) {
          const cardName = await this.getCardName(cardId);
          const alertType = isVolumeSpike ? 'volume_spike' : 'volume_drop';
          const message = isVolumeSpike
            ? `${cardName} 交易量異常增加 ${volumeChange.toFixed(2)}%`
            : `${cardName} 交易量異常減少 ${Math.abs(volumeChange).toFixed(2)}%`;

          // 發送交易量異常通知
          await this.sendVolumeAlert(alert.id, cardId, cardName, alertType, message, {
            currentVolume,
            averageVolume,
            volumeChange,
            threshold: volumeThreshold
          });

          logger.info('交易量異常檢測觸發', {
            cardId,
            cardName,
            alertType,
            currentVolume,
            averageVolume,
            volumeChange
          });
        }
      }

      logger.debug('交易量異常檢測完成', {
        totalCards: cardIds.length,
        successfulChecks: successfulResults.length
      });
    } catch (error) {
      logger.error('檢查交易量提醒失敗:', { error });
    }
  }

  // 發送交易量異常通知
  private async sendVolumeAlert(
    alertId: string,
    cardId: string,
    cardName: string,
    alertType: 'volume_spike' | 'volume_drop',
    message: string,
    volumeData: {
      currentVolume: number;
      averageVolume: number;
      volumeChange: number;
      threshold: number;
    }
  ): Promise<void> {
    try {
      const notification = {
        id: `volume_alert_${alertId}_${Date.now()}`,
        type: 'volume_alert',
        title: '交易量異常提醒',
        message,
        data: {
          cardId,
          cardName,
          alertType,
          volumeData,
          timestamp: new Date().toISOString()
        },
        priority: 'high',
        category: 'market_alert'
      };

      // 發送通知
      await notificationService.sendNotification(notification);

      // 更新提醒統計
      this.alertStatistics.triggeredAlerts++;
      this.alertStatistics.volumeAlerts++;

      logger.info('交易量異常通知已發送', { alertId, cardId, alertType });
    } catch (error) {
      logger.error('發送交易量異常通知失敗:', { alertId, cardId, error });
    }
  }

  // 獲取卡片名稱
  private async getCardName(cardId: string): Promise<string> {
    try {
      const cachedData = await cacheManager.getCachedCardData(cardId);
      if (cachedData) {
        return cachedData.data.name;
      }

      // 從API獲取卡片信息
      const cardData = await apiService.get(`/cards/${cardId}`);
      const cardName = cardData.data.name;

      // 緩存卡片數據
      await cacheManager.cacheCardData(cardId, {
        name: cardName,
        timestamp: Date.now()
      });

      return cardName;
    } catch (error) {
      logger.error('獲取卡片名稱失敗:', { cardId, error });
      return '未知卡片';
    }
  }

  // 處理網絡變化
  private handleNetworkChange(isOnline: boolean): void {
    if (isOnline && !this.isMonitoring) {
      this.startMonitoring();
    } else if (!isOnline && this.isMonitoring) {
      this.stopMonitoring();
    }
  }

  // 更新統計信息
  private updateStatistics(responseTime: number, triggeredCount: number): void {
    const totalChecks = this.alertStatistics.totalAlerts;
    if (totalChecks > 0) {
      this.alertStatistics.averageResponseTime =
        (this.alertStatistics.averageResponseTime * (totalChecks - 1) + responseTime) / totalChecks;
    }

    if (triggeredCount > 0) {
      this.alertStatistics.successRate =
        (this.alertStatistics.triggeredAlerts / this.alertStatistics.totalAlerts) * 100;
    }
  }

  // 停用提醒
  private async deactivateAlert(alertId: string): Promise<void> {
    try {
      await investmentService.deletePriceAlert(alertId);
      this.activeAlerts.delete(alertId);
      this.alertStatistics.activeAlerts--;

      logger.info('提醒已停用', { alertId });
    } catch (error) {
      logger.error('停用提醒失敗:', { alertId, error });
    }
  }

  // 添加價格提醒
  async addPriceAlert(
    cardId: string,
    targetPrice: number,
    type: 'above' | 'below',
    maxTriggers?: number
  ): Promise<PriceAlert> {
    try {
      const response = await investmentService.setPriceAlert(cardId, targetPrice, type);
      const alert = response.data;

      this.activeAlerts.set(alert.id, {
        ...alert,
        createdAt: new Date(alert.createdAt),
        maxTriggers
      });

      this.alertStatistics.activeAlerts++;
      this.alertStatistics.totalAlerts++;

      logger.info('價格提醒已添加', { alertId: alert.id, cardId, targetPrice, type });
      return alert;
    } catch (error) {
      logger.error('添加價格提醒失敗:', { cardId, targetPrice, type, error });
      throw error;
    }
  }

  // 獲取監控統計
  getStatistics(): AlertStatistics {
    return { ...this.alertStatistics };
  }

  // 獲取配置
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 如果監控間隔改變，重啟監控
    if (newConfig.checkInterval && this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }

    logger.info('監控配置已更新', { config: this.config });
  }

  // 獲取活躍提醒
  getActiveAlerts(): PriceAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  // 清理資源
  cleanup(): void {
    this.stopMonitoring();
    this.activeAlerts.clear();
    this.priceHistory.clear();
    networkMonitor.removeListener(this.handleNetworkChange.bind(this));

    logger.info('價格監控服務資源清理完成');
  }
}

export const priceMonitorService = new PriceMonitorService();
