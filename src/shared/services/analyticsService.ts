import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * AnalysisService
 * HandleDataAnalysis相Off功能
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
   * TraceUserRow為
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
      logger.error('追蹤事件Failed:', { error, eventName });
    }
  }
}

// Export單例Instance
export const _analyticsService = AnalyticsService.getInstance();
