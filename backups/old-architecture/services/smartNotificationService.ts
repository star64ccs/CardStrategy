import { notificationService } from './notificationService';
import { marketService } from './marketService';
import { investmentService } from './investmentService';
import { cardService } from './cardService';
import { logger } from '@/utils/logger';
import { cacheManager } from '@/utils/cacheManager';
import { apiService } from './apiService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

export interface UserBehavior {
  userId: string;
  lastLoginTime: Date;
  loginFrequency: number; // 每週登錄次數
  favoriteCards: string[]; // 最常查看的卡片
  investmentPattern: 'conservative' | 'aggressive' | 'balanced';
  notificationPreferences: {
    priceAlerts: boolean;
    marketUpdates: boolean;
    investmentAdvice: boolean;
    socialAlerts: boolean;
  };
  timeZone: string;
  preferredNotificationTime: string; // HH:MM 格式
}

export interface MarketInsight {
  type: 'trend' | 'opportunity' | 'risk' | 'news';
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  data: Record<string, any>;
}

export interface SmartNotification {
  id: string;
  type: 'insight' | 'reminder' | 'opportunity' | 'risk';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'market' | 'portfolio' | 'social' | 'system';
  data: Record<string, any>;
  scheduledTime?: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalRead: number;
  totalClicked: number;
  averageResponseTime: number;
  userEngagement: number; // 0-1
  categoryPerformance: Record<
    string,
    {
      sent: number;
      read: number;
      clicked: number;
    }
  >;
}

class SmartNotificationService {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private insightsQueue: MarketInsight[] = [];
  private analytics: NotificationAnalytics = {
    totalSent: 0,
    totalRead: 0,
    totalClicked: 0,
    averageResponseTime: 0,
    userEngagement: 0,
    categoryPerformance: {},
  };

  // 初始化智能通知服務
  async initialize(): Promise<void> {
    try {
      logger.info('初始化智能通知服務');

      // 加載用戶行為數據
      await this.loadUserBehaviors();

      // 開始定期分析
      this.startPeriodicAnalysis();

      logger.info('智能通知服務初始化完成');
    } catch (error) {
      logger.error('智能通知服務初始化失敗:', { error });
    }
  }

  // 加載用戶行為數據
  private async loadUserBehaviors(): Promise<void> {
    try {
      // 從API獲取用戶行為數據
      const response = await apiService.get('/users/behavior');
      const behaviors = response.data;

      this.userBehaviors.clear();
      behaviors.forEach((behavior: UserBehavior) => {
        this.userBehaviors.set(behavior.userId, {
          ...behavior,
          lastLoginTime: new Date(behavior.lastLoginTime),
        });
      });

      logger.info('用戶行為數據加載完成', { count: this.userBehaviors.size });
    } catch (error) {
      logger.error('加載用戶行為數據失敗:', { error });
    }
  }

  // 開始定期分析
  private startPeriodicAnalysis(): void {
    // 每小時進行一次市場分析
    setInterval(
      () => {
        this.analyzeMarketInsights();
      },
      60 * 60 * 1000
    );

    // 每天進行一次用戶行為分析
    setInterval(
      () => {
        this.analyzeUserBehaviors();
      },
      24 * 60 * 60 * 1000
    );

    logger.info('定期分析已開始');
  }

  // 分析市場洞察
  private async analyzeMarketInsights(): Promise<void> {
    try {
      logger.debug('開始分析市場洞察');

      // 獲取市場分析
      const marketAnalysis = await marketService.getMarketAnalysis();
      const insights: MarketInsight[] = [];

      // 分析市場趨勢
      if (marketAnalysis.data.sentiment === 'bullish') {
        insights.push({
          type: 'opportunity',
          title: '市場看漲趨勢',
          description: '當前市場呈現看漲趨勢，建議關注熱門卡片',
          confidence: marketAnalysis.data.confidence,
          priority: 'medium',
          actionRequired: false,
          data: {
            sentiment: 'bullish',
            confidence: marketAnalysis.data.confidence,
          },
        });
      } else if (marketAnalysis.data.sentiment === 'bearish') {
        insights.push({
          type: 'risk',
          title: '市場看跌趨勢',
          description: '當前市場呈現看跌趨勢，建議謹慎投資',
          confidence: marketAnalysis.data.confidence,
          priority: 'high',
          actionRequired: true,
          data: {
            sentiment: 'bearish',
            confidence: marketAnalysis.data.confidence,
          },
        });
      }

      // 分析投資建議
      if (marketAnalysis.data.recommendations.length > 0) {
        insights.push({
          type: 'insight',
          title: 'AI 投資建議',
          description: `AI 分析建議：${marketAnalysis.data.recommendations[0]}`,
          confidence: marketAnalysis.data.confidence,
          priority: 'medium',
          actionRequired: false,
          data: { recommendations: marketAnalysis.data.recommendations },
        });
      }

      // 將洞察加入隊列
      this.insightsQueue.push(...insights);

      logger.debug('市場洞察分析完成', { insightsCount: insights.length });
    } catch (error) {
      logger.error('分析市場洞察失敗:', { error });
    }
  }

  // 分析用戶行為
  private async analyzeUserBehaviors(): Promise<void> {
    try {
      logger.debug('開始分析用戶行為');

      for (const [userId, behavior] of this.userBehaviors) {
        // 檢查登錄頻率
        if (behavior.loginFrequency < 3) {
          await this.sendEngagementReminder(userId, behavior);
        }

        // 檢查投資組合
        await this.analyzePortfolioInsights(userId, behavior);

        // 檢查收藏卡片
        await this.analyzeFavoriteCards(userId, behavior);
      }

      logger.debug('用戶行為分析完成');
    } catch (error) {
      logger.error('分析用戶行為失敗:', { error });
    }
  }

  // 發送參與度提醒
  private async sendEngagementReminder(
    userId: string,
    behavior: UserBehavior
  ): Promise<void> {
    try {
      const title = '歡迎回來！';
      const message =
        '您有一段時間沒有查看您的投資組合了。市場上有一些有趣的變化，建議您查看一下。';

      await this.sendSmartNotification(userId, {
        type: 'reminder',
        title,
        message,
        priority: 'low',
        category: 'system',
        data: { type: 'engagement_reminder' },
      });

      logger.info('參與度提醒已發送', { userId });
    } catch (error) {
      logger.error('發送參與度提醒失敗:', { userId, error });
    }
  }

  // 分析投資組合洞察
  private async analyzePortfolioInsights(
    userId: string,
    behavior: UserBehavior
  ): Promise<void> {
    try {
      const portfolio = await investmentService.getPortfolio();
      const portfolioValue = portfolio.data.totalValue;
      const { totalProfitLoss } = portfolio.data;

      // 檢查投資組合表現
      if (totalProfitLoss > 0 && totalProfitLoss / portfolioValue > 0.1) {
        await this.sendSmartNotification(userId, {
          type: 'opportunity',
          title: '投資組合表現優異',
          message: `恭喜！您的投資組合獲利 ${totalProfitLoss.toFixed(2)} TWD，收益率 ${((totalProfitLoss / portfolioValue) * 100).toFixed(2)}%`,
          priority: 'medium',
          category: 'portfolio',
          data: {
            profitLoss: totalProfitLoss,
            returnRate: (totalProfitLoss / portfolioValue) * 100,
          },
        });
      } else if (
        totalProfitLoss < 0 &&
        Math.abs(totalProfitLoss) / portfolioValue > 0.05
      ) {
        await this.sendSmartNotification(userId, {
          type: 'risk',
          title: '投資組合需要關注',
          message: `您的投資組合目前虧損 ${Math.abs(totalProfitLoss).toFixed(2)} TWD，建議重新評估投資策略`,
          priority: 'high',
          category: 'portfolio',
          data: {
            profitLoss: totalProfitLoss,
            returnRate: (totalProfitLoss / portfolioValue) * 100,
          },
        });
      }

      // 檢查投資多樣性
      const { investments } = portfolio.data;
      if (investments.length < 3) {
        await this.sendSmartNotification(userId, {
          type: 'insight',
          title: '投資多樣性建議',
          message: '您的投資組合較為集中，建議考慮增加更多卡片以分散風險',
          priority: 'medium',
          category: 'portfolio',
          data: { investmentCount: investments.length },
        });
      }
    } catch (error) {
      logger.error('分析投資組合洞察失敗:', { userId, error });
    }
  }

  // 分析收藏卡片
  private async analyzeFavoriteCards(
    userId: string,
    behavior: UserBehavior
  ): Promise<void> {
    try {
      for (const cardId of behavior.favoriteCards.slice(0, 5)) {
        const marketData = await marketService.getMarketData(cardId);
        const cardName = await this.getCardName(cardId);

        // 檢查價格變化
        const { change24h } = marketData.data;
        if (Math.abs(change24h) > 10) {
          const direction = change24h > 0 ? '上漲' : '下跌';
          await this.sendSmartNotification(userId, {
            type: 'insight',
            title: `${cardName} 價格${direction}`,
            message: `您關注的 ${cardName} 在24小時內${direction}了 ${Math.abs(change24h).toFixed(2)}%`,
            priority: 'medium',
            category: 'market',
            data: { cardId, cardName, change24h },
          });
        }

        // 檢查交易量異常
        const { volume } = marketData.data;
        if (volume > 10000) {
          await this.sendSmartNotification(userId, {
            type: 'insight',
            title: `${cardName} 交易量激增`,
            message: `${cardName} 交易量異常增加，可能預示價格變動`,
            priority: 'medium',
            category: 'market',
            data: { cardId, cardName, volume },
          });
        }
      }
    } catch (error) {
      logger.error('分析收藏卡片失敗:', { userId, error });
    }
  }

  // 獲取卡片名稱
  private async getCardName(cardId: string): Promise<string> {
    try {
      const cachedData = await cacheManager.getCachedCardData(cardId);
      if (cachedData) {
        return cachedData.data.name;
      }

      const cardData = await cardService.getCardDetail(cardId);
      const cardName = cardData.data.card.name;

      await cacheManager.cacheCardData(cardId, {
        name: cardName,
        timestamp: Date.now(),
      });

      return cardName;
    } catch (error) {
      logger.error('獲取卡片名稱失敗:', { cardId, error });
      return '未知卡片';
    }
  }

  // 發送智能通知
  async sendSmartNotification(
    userId: string,
    notification: Omit<SmartNotification, 'id' | 'isRead' | 'createdAt'>
  ): Promise<string> {
    try {
      const userBehavior = this.userBehaviors.get(userId);
      if (!userBehavior) {
        throw new Error('用戶行為數據不存在');
      }

      // 檢查用戶通知偏好
      if (!this.shouldSendNotification(userBehavior, notification)) {
        logger.debug('跳過通知發送（用戶偏好）', {
          userId,
          notificationType: notification.type,
        });
        return '';
      }

      // 檢查通知時間
      if (
        !this.isOptimalNotificationTime(userBehavior, notification.priority)
      ) {
        // 延遲發送
        const scheduledTime = this.calculateOptimalTime(userBehavior);
        notification.scheduledTime = scheduledTime;
      }

      // 創建通知記錄
      const smartNotification: SmartNotification = {
        id: this.generateNotificationId(),
        ...notification,
        isRead: false,
        createdAt: new Date(),
      };

      // 發送通知
      let notificationId = '';
      if (notification.scheduledTime) {
        // 延遲發送
        notificationId = await notificationService.scheduleNotification(
          {
            title: notification.title,
            body: notification.message,
            data: {
              type: 'smart_notification',
              notificationId: smartNotification.id,
              category: notification.category,
              ...notification.data,
            },
            priority: notification.priority === 'high' ? 'high' : 'default',
          },
          { date: notification.scheduledTime }
        );
      } else {
        // 立即發送
        notificationId = await notificationService.sendLocalNotification({
          title: notification.title,
          body: notification.message,
          data: {
            type: 'smart_notification',
            notificationId: smartNotification.id,
            category: notification.category,
            ...notification.data,
          },
          priority: notification.priority === 'high' ? 'high' : 'default',
        });
      }

      // 更新統計
      this.updateAnalytics(notification.category, 'sent');

      logger.info('智能通知已發送', {
        userId,
        notificationId: smartNotification.id,
        type: notification.type,
        category: notification.category,
      });

      return smartNotification.id;
    } catch (error) {
      logger.error('發送智能通知失敗:', { userId, notification, error });
      throw error;
    }
  }

  // 判斷是否應該發送通知
  private shouldSendNotification(
    behavior: UserBehavior,
    notification: SmartNotification
  ): boolean {
    const preferences = behavior.notificationPreferences;

    switch (notification.category) {
      case 'market':
        return preferences.marketUpdates;
      case 'portfolio':
        return preferences.investmentAdvice;
      case 'social':
        return preferences.socialAlerts;
      case 'system':
        return true; // 系統通知總是發送
      default:
        return true;
    }
  }

  // 判斷是否是最佳通知時間
  private isOptimalNotificationTime(
    behavior: UserBehavior,
    priority: 'low' | 'medium' | 'high'
  ): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const preferredHour = parseInt(
      behavior.preferredNotificationTime.split(':')[0]
    );

    // 高優先級通知立即發送
    if (priority === 'high') {
      return true;
    }

    // 檢查是否在用戶偏好的時間範圍內
    const timeDiff = Math.abs(currentHour - preferredHour);
    return timeDiff <= 2; // 允許2小時的誤差
  }

  // 計算最佳通知時間
  private calculateOptimalTime(behavior: UserBehavior): Date {
    const now = new Date();
    const [preferredHour, preferredMinute] = behavior.preferredNotificationTime
      .split(':')
      .map(Number);

    const optimalTime = new Date(now);
    optimalTime.setHours(preferredHour, preferredMinute, 0, 0);

    // 如果最佳時間已過，設為明天
    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return optimalTime;
  }

  // 生成通知ID
  private generateNotificationId(): string {
    return `smart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 更新統計
  private updateAnalytics(
    category: string,
    action: 'sent' | 'read' | 'clicked'
  ): void {
    if (!this.analytics.categoryPerformance[category]) {
      this.analytics.categoryPerformance[category] = {
        sent: 0,
        read: 0,
        clicked: 0,
      };
    }

    this.analytics.categoryPerformance[category][action]++;
    this.analytics[
      `total${action.charAt(0).toUpperCase() + action.slice(1)}`
    ]++;

    // 計算用戶參與度
    if (this.analytics.totalSent > 0) {
      this.analytics.userEngagement =
        this.analytics.totalRead / this.analytics.totalSent;
    }
  }

  // 記錄通知點擊
  async recordNotificationClick(notificationId: string): Promise<void> {
    try {
      // 更新統計
      this.analytics.totalClicked++;

      // 記錄點擊事件
      await apiService.post('/notifications/click', { notificationId });

      logger.info('通知點擊已記錄', { notificationId });
    } catch (error) {
      logger.error('記錄通知點擊失敗:', { notificationId, error });
    }
  }

  // 記錄通知已讀
  async recordNotificationRead(notificationId: string): Promise<void> {
    try {
      // 更新統計
      this.analytics.totalRead++;

      // 記錄已讀事件
      await apiService.post('/notifications/read', { notificationId });

      logger.info('通知已讀已記錄', { notificationId });
    } catch (error) {
      logger.error('記錄通知已讀失敗:', { notificationId, error });
    }
  }

  // 獲取通知統計
  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  // 獲取用戶行為數據
  getUserBehavior(userId: string): UserBehavior | undefined {
    return this.userBehaviors.get(userId);
  }

  // 更新用戶行為
  async updateUserBehavior(
    userId: string,
    updates: Partial<UserBehavior>
  ): Promise<void> {
    try {
      const currentBehavior = this.userBehaviors.get(userId);
      if (currentBehavior) {
        const updatedBehavior = { ...currentBehavior, ...updates };
        this.userBehaviors.set(userId, updatedBehavior);

        // 同步到後端
        await apiService.put(`/users/${userId}/behavior`, updatedBehavior);

        logger.info('用戶行為已更新', { userId, updates });
      }
    } catch (error) {
      logger.error('更新用戶行為失敗:', { userId, updates, error });
    }
  }

  // 清理資源
  cleanup(): void {
    this.userBehaviors.clear();
    this.insightsQueue = [];

    logger.info('智能通知服務資源清理完成');
  }
}

export { SmartNotificationService };
export const smartNotificationService = new SmartNotificationService();
