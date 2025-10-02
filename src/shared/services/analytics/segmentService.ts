import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface SegmentEvent {
  event: string;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  context?: {
    app?: {
      name?: string;
      version?: string;
    };
    device?: {
      type?: string;
      model?: string;
      os?: string;
    };
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
}

export interface SegmentUser {
  userId: string;
  traits?: Record<string, any>;
  context?: Record<string, any>;
}

export interface SegmentGroup {
  groupId: string;
  userId: string;
  traits?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class SegmentService {
  private isInitialized: boolean = false;
  private readonly writeKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.writeKey = process.env.SEGMENT_WRITE_KEY || '';
    this.baseUrl = 'https://api.segment.io/v1';

    if (!this.writeKey) {
      logger.warn('Segment Write Key not found in environment variables');
    } else {
      this.isInitialized = true;
      logger.info('Segment service initialized successfully');
    }
  }

  /**
   * CheckServiceYesNo可用
   */
  isAvailable(): boolean {
    return this.isInitialized && !!this.writeKey;
  }

  /**
   * TraceEvent
   */
  async trackEvent(event: SegmentEvent): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Segment service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/track`, {
        writeKey: this.writeKey,
        ...event,
        timestamp: event.timestamp || new Date(),
      });

      if (response.success) {
        logger.info(`Segment event tracked: ${event.event}`);
        return {
          success: true,
          data: response.data,
          message: 'Event tracked successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to track Segment event: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error tracking Segment event:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 識別User
   */
  async identifyUser(user: SegmentUser): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Segment service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/identify`, {
        writeKey: this.writeKey,
        ...user,
      });

      if (response.success) {
        logger.info(`Segment user identified: ${user.userId}`);
        return {
          success: true,
          data: response.data,
          message: 'User identified successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to identify Segment user: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error identifying Segment user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 加入群組
   */
  async joinGroup(group: SegmentGroup): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Segment service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/group`, {
        writeKey: this.writeKey,
        ...group,
      });

      if (response.success) {
        logger.info(`Segment group joined: ${group.groupId}`);
        return {
          success: true,
          data: response.data,
          message: 'Group joined successfully',
          timestamp: new Date(),
        };
      } else {
        logger.error(
          `Failed to join Segment group: ${response.message || 'Unknown error'}`
        );
        return {
          success: false,
          message: response.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error joining Segment group:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchTraceEvent
   */
  async batchTrackEvents(events: SegmentEvent[]): Promise<ApiResponse> {
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
          message: 'Segment service not available',
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
        `Segment batch tracking completed: ${successful} successful, ${failed} failed`
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
      logger.error('Error in batch tracking Segment events:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Trace頁面瀏覽
   */
  async trackPageView(
    pageName: string,
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    return this.trackEvent({
      event: 'Page Viewed',
      properties: {
        page_name: pageName,
        ...properties,
      },
    });
  }

  /**
   * TraceUserRegister
   */
  async trackUserSignUp(
    userId: string,
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    const _identifyResult = await this.identifyUser({
      userId,
      traits: {
        signup_date: new Date().toISOString(),
        ...properties,
      },
    });

    if (identifyResult.success) {
      return this.trackEvent({
        event: 'User Signed Up',
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
   * Trace卡牌相OffEvent
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
   * GetServiceStatistics
   */
  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        service: 'segment',
        available: this.isAvailable(),
        writeKey: this.writeKey ? 'configured' : 'not configured',
        initialized: this.isInitialized,
      },
      message: 'Segment service statistics retrieved',
      timestamp: new Date(),
    };
  }
}

export const _segmentService = new SegmentService();
