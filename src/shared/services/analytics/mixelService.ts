import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface MixelEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  sessionId?: string;
  page?: string;
  referrer?: string;
}

export interface MixelUser {
  userId: string;
  properties?: Record<string, any>;
  email?: string;
  name?: string;
  plan?: string;
}

export interface MixelPageView {
  page: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface MixelConversion {
  event: string;
  userId: string;
  value?: number;
  currency?: string;
  properties?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class MixelService {
  private readonly projectToken: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.projectToken = process.env.MIXEL_PROJECT_TOKEN || '';
    this.apiSecret = process.env.MIXEL_API_SECRET || '';
    this.baseUrl = 'https://api.mixel.com/v1';

    if (!this.projectToken || !this.apiSecret) {
      logger.warn('Mixel API credentials not found in environment variables');
    } else {
      this.isInitialized = true;
      logger.info('Mixel service initialized successfully');
    }
  }

  /**
   * 檢查服務是否可用
   */
  isAvailable(): boolean {
    return this.isInitialized && !!this.projectToken && !!this.apiSecret;
  }

  /**
   * 追蹤事件
   */
  async trackEvent(event: MixelEvent): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Mixel service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/events`, {
        project_token: this.projectToken,
        api_secret: this.apiSecret,
        ...event,
        timestamp: event.timestamp || new Date(),
      });

      if (response.success) {
        logger.info(`Mixel event tracked: ${event.event}`);
        return {
          success: true,
          data: response.data,
          message: 'Event tracked successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to track Mixel event: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error tracking Mixel event:', error);
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
  async identifyUser(user: MixelUser): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Mixel service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/users`, {
        project_token: this.projectToken,
        api_secret: this.apiSecret,
        ...user,
      });

      if (response.success) {
        logger.info(`Mixel user identified: ${user.userId}`);
        return {
          success: true,
          data: response.data,
          message: 'User identified successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to identify Mixel user: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error identifying Mixel user:', error);
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
  async trackPageView(pageView: MixelPageView): Promise<ApiResponse> {
    return this.trackEvent({
      event: 'page_view',
      userId: pageView.userId,
      properties: {
        page: pageView.page,
        ...pageView.properties,
      },
      timestamp: pageView.timestamp,
    });
  }

  /**
   * 追蹤轉換
   */
  async trackConversion(conversion: MixelConversion): Promise<ApiResponse> {
    return this.trackEvent({
      event: conversion.event,
      userId: conversion.userId,
      properties: {
        value: conversion.value,
        currency: conversion.currency,
        ...conversion.properties,
      },
    });
  }

  /**
   * 批量追蹤事件
   */
  async batchTrackEvents(events: MixelEvent[]): Promise<ApiResponse> {
    try {
      if (events.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No events to track',
          timestamp: new Date(),
        };
      }

      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Mixel service not available',
          timestamp: new Date(),
        };
      }

      const _batchPromises = events.map(event => this.trackEvent(event));
      const _results = await Promise.allSettled(batchPromises);

      const _successful = results.filter(
        result => result.status === 'fulfilled' && result.value.success
      ).length;

      const _failed = results.length - successful;

      logger.info(
        `Mixel batch tracking completed: ${successful} successful, ${failed} failed`
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
      logger.error('Error in batch tracking Mixel events:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取分析報告
   */
  async getAnalyticsReport(
    dateRange: { start: Date; end: Date },
    metrics: string[]
  ): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Mixel service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(`${this.baseUrl}/analytics`, {
        params: {
          project_token: this.projectToken,
          api_secret: this.apiSecret,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          metrics: metrics.join(','),
        },
      });

      if (response.success) {
        logger.info('Mixel analytics report retrieved successfully');
        return {
          success: true,
          data: response.data,
          message: 'Analytics report retrieved successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to get Mixel analytics report: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error getting Mixel analytics report:', error);
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
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    const _identifyResult = await this.identifyUser({
      userId,
      properties: {
        signup_date: new Date().toISOString(),
        ...properties,
      },
    });

    if (identifyResult.success) {
      return this.trackEvent({
        event: 'user_signup',
        userId,
        properties: {
          signup_date: new Date().toISOString(),
          ...properties,
        },
      });
    }

    return identifyResult;
  }

  /**
   * 追蹤卡牌相關事件
   */
  async trackCardEvent(
    eventType: string,
    cardId: string,
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    return this.trackEvent({
      event: eventType,
      properties: {
        card_id: cardId,
        ...properties,
      },
    });
  }

  /**
   * 追蹤投資相關事件
   */
  async trackInvestmentEvent(
    eventType: string,
    amount: number,
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    return this.trackEvent({
      event: eventType,
      properties: {
        amount,
        currency: 'USD',
        ...properties,
      },
    });
  }

  /**
   * 獲取服務統計
   */
  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        service: 'mixel',
        available: this.isAvailable(),
        projectToken: this.projectToken ? 'configured' : 'not configured',
        apiSecret: this.apiSecret ? 'configured' : 'not configured',
        initialized: this.isInitialized,
      },
      message: 'Mixel service statistics retrieved',
      timestamp: new Date(),
    };
  }
}

export const _mixelService = new MixelService();
