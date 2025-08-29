import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 分析服務
 * 處理數據分析相關功能
 */
export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * 追蹤用戶行為
   */
  async trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await api.post('/analytics/track', {
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('追蹤事件失敗:', { error, eventName });
    }
  }
}

// 導出單例實例
export const _analyticsService = AnalyticsService.getInstance();
