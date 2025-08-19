import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 導航服務類
class NavigationService {
  private navigationRef: any = null;
  private navigationEmitter: any = null;
  private notificationBadgeCount: number = 0;
  private badgeUpdateCallbacks: ((count: number) => void)[] = [];

  // 設置導航引用
  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  // 設置事件發射器
  setNavigationEmitter(emitter: any) {
    this.navigationEmitter = emitter;
  }

  // 導航到指定頁面
  navigate(screen: string, params?: any) {
    try {
      if (this.navigationRef && this.navigationRef.current) {
        this.navigationRef.current.navigate(screen, params);
        logger.info('導航成功', { screen, params });
      } else if (this.navigationEmitter) {
        this.navigationEmitter.emit('navigate', { screen, params });
        logger.info('導航事件已發送', { screen, params });
      } else {
        logger.warn('導航服務未初始化', { screen, params });
      }
    } catch (error) {
      logger.error('導航失敗:', { error, screen, params });
    }
  }

  // 導航到卡片詳情頁面
  navigateToCardDetail(cardId: string) {
    this.navigate('CardDetail', { cardId });
  }

  // 導航到市場分析頁面
  navigateToMarketAnalysis(marketId: string) {
    this.navigate('MarketAnalysis', { marketId });
  }

  // 導航到投資組合頁面
  navigateToPortfolio(portfolioId?: string) {
    this.navigate('Portfolio', { portfolioId });
  }

  // 導航到社交頁面
  navigateToSocial(feedId?: string) {
    this.navigate('Social', { feedId });
  }

  // 導航到設置頁面
  navigateToSettings() {
    this.navigate('Settings');
  }

  // 導航到通知頁面
  navigateToNotifications() {
    this.navigate('Notifications');
  }

  // 返回上一頁
  goBack() {
    try {
      if (this.navigationRef && this.navigationRef.current) {
        this.navigationRef.current.goBack();
      } else if (this.navigationEmitter) {
        this.navigationEmitter.emit('goBack');
      }
    } catch (error) {
      logger.error('返回上一頁失敗:', { error });
    }
  }

  // 重置導航到首頁
  resetToHome() {
    this.navigate('Home');
  }

  // 重置導航到登錄頁面
  resetToLogin() {
    this.navigate('Login');
  }

  // 設置通知徽章數量
  setNotificationBadge(count: number) {
    this.notificationBadgeCount = count;
    this.badgeUpdateCallbacks.forEach(callback => callback(count));
    logger.info('通知徽章數量已更新:', { count });
  }

  // 獲取通知徽章數量
  getNotificationBadgeCount(): number {
    return this.notificationBadgeCount;
  }

  // 註冊徽章更新回調
  onBadgeUpdate(callback: (count: number) => void) {
    this.badgeUpdateCallbacks.push(callback);
  }

  // 移除徽章更新回調
  removeBadgeUpdateCallback(callback: (count: number) => void) {
    const index = this.badgeUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.badgeUpdateCallbacks.splice(index, 1);
    }
  }

  // 導航到通知頁面
  navigateToNotifications() {
    this.navigate('Notifications');
  }

  // 導航到通知設置頁面
  navigateToNotificationSettings() {
    this.navigate('NotificationSettings');
  }

  // 智能導航 - 根據通知類型自動導航
  smartNavigate(notificationType: string, data?: any) {
    switch (notificationType) {
      case 'price_alert':
        if (data?.cardId) {
          this.navigateToCardDetail(data.cardId);
        }
        break;
      case 'market_update':
        if (data?.marketId) {
          this.navigateToMarketAnalysis(data.marketId);
        }
        break;
      case 'investment_advice':
        this.navigateToPortfolio();
        break;
      case 'system':
        // 系統通知通常不需要導航
        break;
      default:
        logger.warn('未知的通知類型:', { type: notificationType });
    }
  }

  // 檢查當前頁面
  getCurrentRoute(): string | null {
    try {
      if (this.navigationRef && this.navigationRef.current) {
        return this.navigationRef.current.getCurrentRoute()?.name || null;
      }
      return null;
    } catch (error) {
      logger.error('獲取當前路由失敗:', { error });
      return null;
    }
  }

  // 檢查是否在指定頁面
  isOnScreen(screenName: string): boolean {
    const currentRoute = this.getCurrentRoute();
    return currentRoute === screenName;
  }

  // 返回並清除導航歷史
  goBackAndClear() {
    try {
      if (this.navigationRef && this.navigationRef.current) {
        this.navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      }
    } catch (error) {
      logger.error('返回並清除導航歷史失敗:', { error });
    }
  }
}

// 導出單例實例
export const navigationService = new NavigationService();
