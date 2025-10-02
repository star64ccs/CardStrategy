import { analyticsService } from '../shared/services/analytics/analyticsService';
import { mixelService } from '../shared/services/analytics/mixelService';
import { segmentService } from '../shared/services/analytics/segmentService';

describe('Analytics Services', () => {
  beforeEach(() => {
    delete process.env.SEGMENT_WRITE_KEY;
    delete process.env.MIXEL_PROJECT_TOKEN;
    delete process.env.MIXEL_API_SECRET;
  });

  describe('SegmentService', () => {
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

    test('追蹤頁面瀏覽應該返回適當響應', async () => {
      const _result = await segmentService.trackPageView('test-page', {
        test: 'property',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Segment service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤用戶註冊應該返回適當響應', async () => {
      const _result = await segmentService.trackUserSignUp('test-user', {
        plan: 'premium',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Segment service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤卡牌事件應該返回適當響應', async () => {
      const _result = await segmentService.trackCardEvent(
        'card_viewed',
        'card-123',
        { rarity: 'rare' }
      );
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

  describe('MixelService', () => {
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

    test('追蹤頁面瀏覽應該返回適當響應', async () => {
      const _result = await mixelService.trackPageView({
        page: 'test-page',
        userId: 'test-user',
        properties: { test: 'property' },
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Mixel service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤轉換應該返回適當響應', async () => {
      const _result = await mixelService.trackConversion({
        event: 'purchase',
        userId: 'test-user',
        value: 100,
        currency: 'USD',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Mixel service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('獲取分析報告應該返回適當響應', async () => {
      const _result = await mixelService.getAnalyticsReport(
        { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        ['page_views', 'conversions']
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('Mixel service not available');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤投資事件應該返回適當響應', async () => {
      const _result = await mixelService.trackInvestmentEvent(
        'investment_made',
        500,
        { card_id: 'card-123' }
      );
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

  describe('AnalyticsService', () => {
    test('應該正確獲取可用平台', () => {
      const _platforms = analyticsService.getAvailablePlatforms();
      expect(platforms).toHaveProperty('segment');
      expect(platforms).toHaveProperty('mixel');
      expect(platforms.segment).toBe(false);
      expect(platforms.mixel).toBe(false);
    });

    test('沒有可用平台時追蹤事件應該Failed', async () => {
      const _result = await analyticsService.trackEvent({
        event: 'test_event',
        userId: 'test-user',
        properties: { test: 'property' },
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('空事件列表應該返回Success', async () => {
      const _result = await analyticsService.batchTrackEvents([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No events to track');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('識別用戶應該返回適當響應', async () => {
      const _result = await analyticsService.identifyUser({
        userId: 'test-user',
        properties: { name: 'Test User', email: 'test@example.com' },
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤頁面瀏覽應該返回適當響應', async () => {
      const _result = await analyticsService.trackPageView({
        page: 'test-page',
        userId: 'test-user',
        properties: { referrer: 'google.com' },
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤用戶註冊應該返回適當響應', async () => {
      const _result = await analyticsService.trackUserSignUp('test-user', {
        plan: 'premium',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('追蹤卡牌事件應該返回適當響應', async () => {
      const _result = await analyticsService.trackCardEvent(
        'card_purchased',
        'card-123',
        { price: 100 }
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('GetService統計應該返回正確Information', async () => {
      const _result = await analyticsService.getServiceStats();
      expect(result.success).toBe(true);
      expect(result.data.service).toBe('analytics');
      expect(result.data.platforms).toHaveProperty('segment');
      expect(result.data.platforms).toHaveProperty('mixel');
      expect(result.data.totalPlatforms).toBe(2);
      expect(result.data.availablePlatforms).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該支持指定特定平台', async () => {
      const _result = await analyticsService.trackEvent({
        event: 'test_event',
        userId: 'test-user',
        platforms: ['segment'],
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No available analytics platforms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});
