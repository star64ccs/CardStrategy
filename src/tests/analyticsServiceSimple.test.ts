// 簡化的AnalysisServiceTest - 模擬依賴
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const _mockApi = {
  post: jest.fn(),
  get: jest.fn(),
};

// 模擬 Segment Service
class MockSegmentService {
  private writeKey: string;
  private isInitialized = false;

  constructor() {
    this.writeKey = process.env.SEGMENT_WRITE_KEY || '';
    this.isInitialized = !!this.writeKey;
  }

  isAvailable(): boolean {
    return this.isInitialized && !!this.writeKey;
  }

  async trackEvent(event: unknown): Promise<any> {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: 'Segment service not available',
        timestamp: new Date(),
      };
    }

    mockLogger.info(`Segment event tracked: ${event.event}`);
    return {
      success: true,
      data: { event: event.event },
      message: 'Event tracked successfully',
      timestamp: new Date(),
    };
  }

  async batchTrackEvents(events: unknown[]): Promise<any> {
    if (events.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No events to track',
        timestamp: new Date(),
      };
    }

    const _results = await Promise.all(
      events.map(event => this.trackEvent(event))
    );
    const _successful = results.filter(r => r.success).length;
    const _failed = results.length - successful;

    return {
      success: failed === 0,
      data: { total: events.length, successful, failed },
      message: `Batch tracking completed: ${successful}/${events.length} successful`,
      timestamp: new Date(),
    };
  }

  async getServiceStats(): Promise<any> {
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

// 模擬 Mixel Service
class MockMixelService {
  private projectToken: string;
  private apiSecret: string;
  private isInitialized = false;

  constructor() {
    this.projectToken = process.env.MIXEL_PROJECT_TOKEN || '';
    this.apiSecret = process.env.MIXEL_API_SECRET || '';
    this.isInitialized = !!(this.projectToken && this.apiSecret);
  }

  isAvailable(): boolean {
    return this.isInitialized && !!this.projectToken && !!this.apiSecret;
  }

  async trackEvent(event: unknown): Promise<any> {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: 'Mixel service not available',
        timestamp: new Date(),
      };
    }

    mockLogger.info(`Mixel event tracked: ${event.event}`);
    return {
      success: true,
      data: { event: event.event },
      message: 'Event tracked successfully',
      timestamp: new Date(),
    };
  }

  async batchTrackEvents(events: unknown[]): Promise<any> {
    if (events.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No events to track',
        timestamp: new Date(),
      };
    }

    const _results = await Promise.all(
      events.map(event => this.trackEvent(event))
    );
    const _successful = results.filter(r => r.success).length;
    const _failed = results.length - successful;

    return {
      success: failed === 0,
      data: { total: events.length, successful, failed },
      message: `Batch tracking completed: ${successful}/${events.length} successful`,
      timestamp: new Date(),
    };
  }

  async getServiceStats(): Promise<any> {
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

describe('Analytics Services Simple Tests', () => {
  let segmentService: MockSegmentService;
  let mixelService: MockMixelService;

  beforeEach(() => {
    delete process.env.SEGMENT_WRITE_KEY;
    delete process.env.MIXEL_PROJECT_TOKEN;
    delete process.env.MIXEL_API_SECRET;

    segmentService = new MockSegmentService();
    mixelService = new MockMixelService();

    jest.clearAllMocks();
  });

  describe('MockSegmentService', () => {
    test('沒有 API token 時應該不可用', () => {
      expect(segmentService.isAvailable()).toBe(false);
    });

    test('空事件列表應該返回Success', async () => {
      const _result = await segmentService.batchTrackEvents([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No events to track');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤事件應該返回適當響應', async () => {
      const _result = await segmentService.trackEvent({
        event: 'test_event',
        userId: 'test-user',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Segment service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('GetService統計應該返回正確Information', async () => {
      const _result = await segmentService.getServiceStats();
      expect(result.success).toBe(true);
      expect(result.data.service).toBe('segment');
      expect(result.data.available).toBe(false);
      expect(result.data.writeKey).toBe('not configured');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('MockMixelService', () => {
    test('沒有 API credentials 時應該不可用', () => {
      expect(mixelService.isAvailable()).toBe(false);
    });

    test('空事件列表應該返回Success', async () => {
      const _result = await mixelService.batchTrackEvents([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No events to track');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤事件應該返回適當響應', async () => {
      const _result = await mixelService.trackEvent({
        event: 'test_event',
        userId: 'test-user',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Mixel service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('GetService統計應該返回正確Information', async () => {
      const _result = await mixelService.getServiceStats();
      expect(result.success).toBe(true);
      expect(result.data.service).toBe('mixel');
      expect(result.data.available).toBe(false);
      expect(result.data.projectToken).toBe('not configured');
      expect(result.data.apiSecret).toBe('not configured');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('模擬功能測試', () => {
    test('批量追蹤多個事件應該正確處理', async () => {
      const _events = [
        { event: 'event1', userId: 'user1' },
        { event: 'event2', userId: 'user2' },
        { event: 'event3', userId: 'user3' },
      ];

      const _segmentResult = await segmentService.batchTrackEvents(events);
      const _mixelResult = await mixelService.batchTrackEvents(events);

      expect(segmentResult.success).toBe(false);
      expect(mixelResult.success).toBe(false);
      expect(segmentResult.data.total).toBe(3);
      expect(mixelResult.data.total).toBe(3);
    });

    test('日誌記錄應該被調用', async () => {
      // Settings環境Variable以EnableService
      process.env.SEGMENT_WRITE_KEY = 'test-key';
      process.env.MIXEL_PROJECT_TOKEN = 'test-token';
      process.env.MIXEL_API_SECRET = 'test-secret';

      const _newSegmentService = new MockSegmentService();
      const _newMixelService = new MockMixelService();

      await newSegmentService.trackEvent({ event: 'test_event' });
      await newMixelService.trackEvent({ event: 'test_event' });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Segment event tracked: test_event'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mixel event tracked: test_event'
      );
    });
  });
});
