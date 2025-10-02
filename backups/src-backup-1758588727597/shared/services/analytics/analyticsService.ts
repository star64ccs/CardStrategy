import { logger } from '../../../core/utils/logger';

import { mixelService } from './mixelService';
import { segmentService } from './segmentService';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  platforms?: ('segment' | 'mixel')[];
}

export interface AnalyticsUser {
  userId: string;
  properties?: Record<string, any>;
  platforms?: ('segment' | 'mixel')[];
}

export interface AnalyticsPageView {
  page: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  platforms?: ('segment' | 'mixel')[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly defaultPlatforms: ('segment' | 'mixel')[] = [
    'segment',
    'mixel',
  ];

  private constructor() {
    logger.info('Analytics service initialized');
  }

  /**
   * 獲取單例實例
   */
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * 獲取可用的分析平台
   */
  getAvailablePlatforms(): Record<string, boolean> {
    return {
      segment: segmentService.isAvailable(),
      mixel: mixelService.isAvailable(),
    };
  }

  /**
   * 追蹤事件
   */
  async trackEvent(event: AnalyticsEvent): Promise<ApiResponse> {
    try {
      const platforms = event.platforms || this.defaultPlatforms;
      const availablePlatforms = this.getAvailablePlatforms();
      const validPlatforms = platforms.filter(
        platform => availablePlatforms[platform]
      );

      if (validPlatforms.length === 0) {
        return {
          success: false,
          message: 'No available analytics platforms',
          timestamp: new Date(),
        };
      }

      const results = await Promise.allSettled(
        validPlatforms.map(async platform => {
          switch (platform) {
            case 'segment':
              return segmentService.trackEvent({
                event: event.event,
                userId: event.userId,
                properties: event.properties,
                timestamp: event.timestamp,
              });
            case 'mixel':
              return mixelService.trackEvent({
                event: event.event,
                userId: event.userId,
                properties: event.properties,
                timestamp: event.timestamp,
              });
            default:
              throw new Error(`Unknown platform: ${platform}`);
          }
        })
      );

      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      logger.info(
        `Analytics event tracked: ${event.event} - ${successful}/${validPlatforms.length} platforms successful`
      );

      return {
        success: failed === 0,
        data: {
          event: event.event,
          platforms: validPlatforms,
          successful,
          failed,
          results: results.map((result, index) => ({
            platform: validPlatforms[index],
            success: result.status === 'fulfilled' && result.value.success,
            message:
              result.status === 'fulfilled'
                ? result.value.message
                : 'Promise rejected',
          })),
        },
        message: `Event tracked on ${successful}/${validPlatforms.length} platforms`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 識別用戶
   */
  async identifyUser(user: AnalyticsUser): Promise<ApiResponse> {
    try {
      const platforms = user.platforms || this.defaultPlatforms;
      const availablePlatforms = this.getAvailablePlatforms();
      const validPlatforms = platforms.filter(
        platform => availablePlatforms[platform]
      );

      if (validPlatforms.length === 0) {
        return {
          success: false,
          message: 'No available analytics platforms',
          timestamp: new Date(),
        };
      }

      const results = await Promise.allSettled(
        validPlatforms.map(async platform => {
          switch (platform) {
            case 'segment':
              return segmentService.identifyUser({
                userId: user.userId,
                traits: user.properties,
              });
            case 'mixel':
              return mixelService.identifyUser({
                userId: user.userId,
                properties: user.properties,
              });
            default:
              throw new Error(`Unknown platform: ${platform}`);
          }
        })
      );

      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      logger.info(
        `Analytics user identified: ${user.userId} - ${successful}/${validPlatforms.length} platforms successful`
      );

      return {
        success: failed === 0,
        data: {
          userId: user.userId,
          platforms: validPlatforms,
          successful,
          failed,
          results: results.map((result, index) => ({
            platform: validPlatforms[index],
            success: result.status === 'fulfilled' && result.value.success,
            message:
              result.status === 'fulfilled'
                ? result.value.message
                : 'Promise rejected',
          })),
        },
        message: `User identified on ${successful}/${validPlatforms.length} platforms`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error identifying analytics user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 追蹤頁面瀏覽
   */
  async trackPageView(pageView: AnalyticsPageView): Promise<ApiResponse> {
    const platforms = pageView.platforms || this.defaultPlatforms;
    const availablePlatforms = this.getAvailablePlatforms();
    const validPlatforms = platforms.filter(
      platform => availablePlatforms[platform]
    );

    if (validPlatforms.length === 0) {
      return {
        success: false,
        message: 'No available analytics platforms',
        timestamp: new Date(),
      };
    }

    const results = await Promise.allSettled(
      validPlatforms.map(async platform => {
        switch (platform) {
          case 'segment':
            return segmentService.trackPageView(pageView.page, {
              ...pageView.properties,
              timestamp: pageView.timestamp,
            });
          case 'mixel':
            return mixelService.trackPageView({
              page: pageView.page,
              userId: pageView.userId,
              properties: pageView.properties,
              timestamp: pageView.timestamp,
            });
          default:
            throw new Error(`Unknown platform: ${platform}`);
        }
      })
    );

    const successful = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;

    const failed = results.length - successful;

    logger.info(
      `Analytics page view tracked: ${pageView.page} - ${successful}/${validPlatforms.length} platforms successful`
    );

    return {
      success: failed === 0,
      data: {
        page: pageView.page,
        platforms: validPlatforms,
        successful,
        failed,
        results: results.map((result, index) => ({
          platform: validPlatforms[index],
          success: result.status === 'fulfilled' && result.value.success,
          message:
            result.status === 'fulfilled'
              ? result.value.message
              : 'Promise rejected',
        })),
      },
      message: `Page view tracked on ${successful}/${validPlatforms.length} platforms`,
      timestamp: new Date(),
    };
  }

  /**
   * 批量追蹤事件
   */
  async batchTrackEvents(events: AnalyticsEvent[]): Promise<ApiResponse> {
    try {
      if (events.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No events to track',
          timestamp: new Date(),
        };
      }

      const batchPromises = events.map(event => this.trackEvent(event));
      const results = await Promise.allSettled(batchPromises);

      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      logger.info(
        `Analytics batch tracking completed: ${successful} successful, ${failed} failed`
      );

      return {
        success: failed === 0,
        data: {
          total: events.length,
          successful,
          failed,
          results: results.map(result =>
            result.status === 'fulfilled'
              ? result.value
              : { success: false, message: 'Promise rejected' }
          ),
        },
        message: `Batch tracking completed: ${successful}/${events.length} successful`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in batch tracking analytics events:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 追蹤用戶註冊
   */
  async trackUserSignUp(
    userId: string,
    properties?: Record<string, any>,
    platforms?: ('segment' | 'mixel')[]
  ): Promise<ApiResponse> {
    const validPlatforms = platforms || this.defaultPlatforms;
    const availablePlatforms = this.getAvailablePlatforms();
    const filteredPlatforms = validPlatforms.filter(
      platform => availablePlatforms[platform]
    );

    if (filteredPlatforms.length === 0) {
      return {
        success: false,
        message: 'No available analytics platforms',
        timestamp: new Date(),
      };
    }

    const results = await Promise.allSettled(
      filteredPlatforms.map(async platform => {
        switch (platform) {
          case 'segment':
            return segmentService.trackUserSignUp(userId, properties);
          case 'mixel':
            return mixelService.trackUserSignUp(userId, properties);
          default:
            throw new Error(`Unknown platform: ${platform}`);
        }
      })
    );

    const successful = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;

    const failed = results.length - successful;

    logger.info(
      `Analytics user signup tracked: ${userId} - ${successful}/${filteredPlatforms.length} platforms successful`
    );

    return {
      success: failed === 0,
      data: {
        userId,
        platforms: filteredPlatforms,
        successful,
        failed,
        results: results.map((result, index) => ({
          platform: filteredPlatforms[index],
          success: result.status === 'fulfilled' && result.value.success,
          message:
            result.status === 'fulfilled'
              ? result.value.message
              : 'Promise rejected',
        })),
      },
      message: `User signup tracked on ${successful}/${filteredPlatforms.length} platforms`,
      timestamp: new Date(),
    };
  }

  /**
   * 追蹤卡牌相關事件
   */
  async trackCardEvent(
    eventType: string,
    cardId: string,
    properties?: Record<string, any>,
    platforms?: ('segment' | 'mixel')[]
  ): Promise<ApiResponse> {
    const validPlatforms = platforms || this.defaultPlatforms;
    const availablePlatforms = this.getAvailablePlatforms();
    const filteredPlatforms = validPlatforms.filter(
      platform => availablePlatforms[platform]
    );

    if (filteredPlatforms.length === 0) {
      return {
        success: false,
        message: 'No available analytics platforms',
        timestamp: new Date(),
      };
    }

    const results = await Promise.allSettled(
      filteredPlatforms.map(async platform => {
        switch (platform) {
          case 'segment':
            return segmentService.trackCardEvent(eventType, cardId, properties);
          case 'mixel':
            return mixelService.trackCardEvent(eventType, cardId, properties);
          default:
            throw new Error(`Unknown platform: ${platform}`);
        }
      })
    );

    const successful = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;

    const failed = results.length - successful;

    logger.info(
      `Analytics card event tracked: ${eventType} - ${successful}/${filteredPlatforms.length} platforms successful`
    );

    return {
      success: failed === 0,
      data: {
        eventType,
        cardId,
        platforms: filteredPlatforms,
        successful,
        failed,
        results: results.map((result, index) => ({
          platform: filteredPlatforms[index],
          success: result.status === 'fulfilled' && result.value.success,
          message:
            result.status === 'fulfilled'
              ? result.value.message
              : 'Promise rejected',
        })),
      },
      message: `Card event tracked on ${successful}/${filteredPlatforms.length} platforms`,
      timestamp: new Date(),
    };
  }

  /**
   * 獲取服務統計
   */
  async getServiceStats(): Promise<ApiResponse> {
    const [segmentStats, mixelStats] = await Promise.all([
      segmentService.getServiceStats(),
      mixelService.getServiceStats(),
    ]);

    return {
      success: true,
      data: {
        service: 'analytics',
        platforms: {
          segment: segmentStats.data,
          mixel: mixelStats.data,
        },
        available: this.getAvailablePlatforms(),
        totalPlatforms: 2,
        availablePlatforms: Object.values(this.getAvailablePlatforms()).filter(
          Boolean
        ).length,
      },
      message: 'Analytics service statistics retrieved',
      timestamp: new Date(),
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
