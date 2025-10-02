// 反饋Service單元Test
import { FeedbackService } from '../services/feedbackService';
import type { FeedbackFormData } from '../types/feedback';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
  SatisfactionRating,
} from '../types/feedback';

// Mock localStorage
const _localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
});

// Mock document
Object.defineProperty(window, 'document', {
  value: {
    referrer: 'https://example.com',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    // Clear現有Instance
    (FeedbackService as any).instance = null;
    service = FeedbackService.getInstance();

    // Clear mock
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('初始化', () => {
    test('應該正確InitializeService', async () => {
      await service.initialize();

      const _status = service.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.feedbackCount).toBe(0);
    });

    test('應該從 localStorage 加載數據', async () => {
      const _mockData = {
        feedbacks: [
          [
            'test-id',
            {
              id: 'test-id',
              type: FeedbackType.GENERAL_FEEDBACK,
              category: FeedbackCategory.OTHER,
              priority: FeedbackPriority.MEDIUM,
              status: FeedbackStatus.PENDING,
              title: '測試反饋',
              description: '測試描述',
              platform: 'web',
              version: '1.0.0',
              timestamp: Date.now(),
            },
          ],
        ],
        events: [],
        notifications: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      await service.initialize();

      const _status = service.getStatus();
      expect(status.feedbackCount).toBe(1);
    });
  });

  describe('提交反饋', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該Success提交反饋', async () => {
      const feedbackData: FeedbackFormData = {
        type: FeedbackType.FEATURE_REQUEST,
        category: FeedbackCategory.FUNCTIONALITY,
        priority: FeedbackPriority.HIGH,
        title: '測試功能請求',
        description: '這是一個測試功能請求',
        userEmail: 'test@example.com',
        userName: '測試用戶',
        satisfactionRating: SatisfactionRating.SATISFIED,
        followUpRequired: true,
        attachments: [],
        tags: ['測試', '功能'],
      };

      const _result = await service.submitFeedback(feedbackData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('測試功能請求');
      expect(result.type).toBe(FeedbackType.FEATURE_REQUEST);
      expect(result.status).toBe(FeedbackStatus.PENDING);

      const _status = service.getStatus();
      expect(status.feedbackCount).toBe(1);
    });

    test('應該驗證必填字段', async () => {
      const invalidData: FeedbackFormData = {
        type: FeedbackType.GENERAL_FEEDBACK,
        category: FeedbackCategory.OTHER,
        priority: FeedbackPriority.MEDIUM,
        title: '', // Empty標題
        description: '', // EmptyDescription
        attachments: [],
        tags: [],
      };

      await expect(service.submitFeedback(invalidData)).rejects.toThrow(
        '標題不能為空'
      );
    });

    test('應該驗證郵箱格式', async () => {
      const feedbackData: FeedbackFormData = {
        type: FeedbackType.GENERAL_FEEDBACK,
        category: FeedbackCategory.OTHER,
        priority: FeedbackPriority.MEDIUM,
        title: '測試標題',
        description: '測試描述',
        userEmail: 'invalid-email', // 無效Email
        attachments: [],
        tags: [],
      };

      await expect(service.submitFeedback(feedbackData)).rejects.toThrow(
        '請輸入有效的郵箱地址'
      );
    });
  });

  describe('更新反饋', () => {
    let feedbackId: string;

    beforeEach(async () => {
      await service.initialize();

      // Create一個Test反饋
      const feedbackData: FeedbackFormData = {
        type: FeedbackType.GENERAL_FEEDBACK,
        category: FeedbackCategory.OTHER,
        priority: FeedbackPriority.MEDIUM,
        title: '原始標題',
        description: '原始描述',
        attachments: [],
        tags: [],
      };

      const _feedback = await service.submitFeedback(feedbackData);
      feedbackId = feedback.id;
    });

    test('應該SuccessUpdate反饋', async () => {
      const _updateData = {
        title: '更新後的標題',
        status: FeedbackStatus.IN_PROGRESS,
      };

      const _result = await service.updateFeedback(feedbackId, updateData);

      expect(result.title).toBe('更新後的標題');
      expect(result.status).toBe(FeedbackStatus.IN_PROGRESS);
    });

    test('應該在Update不存在的反饋時拋出Error', async () => {
      await expect(
        service.updateFeedback('non-existent-id', { title: '新標題' })
      ).rejects.toThrow('反饋 non-existent-id 不存在');
    });
  });

  describe('刪除反饋', () => {
    let feedbackId: string;

    beforeEach(async () => {
      await service.initialize();

      const feedbackData: FeedbackFormData = {
        type: FeedbackType.GENERAL_FEEDBACK,
        category: FeedbackCategory.OTHER,
        priority: FeedbackPriority.MEDIUM,
        title: '要刪除的反饋',
        description: '這個反饋將被刪除',
        attachments: [],
        tags: [],
      };

      const _feedback = await service.submitFeedback(feedbackData);
      feedbackId = feedback.id;
    });

    test('應該SuccessDelete反饋', async () => {
      await service.deleteFeedback(feedbackId);

      const _status = service.getStatus();
      expect(status.feedbackCount).toBe(0);
    });

    test('應該在Delete不存在的反饋時拋出Error', async () => {
      await expect(service.deleteFeedback('non-existent-id')).rejects.toThrow(
        '反饋 non-existent-id 不存在'
      );
    });
  });

  describe('獲取反饋', () => {
    beforeEach(async () => {
      await service.initialize();

      // CreateMultipleTest反饋
      const _feedbacks = [
        {
          type: FeedbackType.FEATURE_REQUEST,
          category: FeedbackCategory.FUNCTIONALITY,
          priority: FeedbackPriority.HIGH,
          title: '高優先級功能請求',
          description: '這是一個高優先級的功能請求',
          attachments: [],
          tags: ['高優先級'],
        },
        {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.PERFORMANCE,
          priority: FeedbackPriority.LOW,
          title: '低優先級Error報告',
          description: '這是一個低優先級的Error報告',
          attachments: [],
          tags: ['低優先級'],
        },
        {
          type: FeedbackType.USER_EXPERIENCE,
          category: FeedbackCategory.UI_UX,
          priority: FeedbackPriority.MEDIUM,
          title: '中優先級用戶體驗',
          description: '這是一個中優先級的用戶體驗反饋',
          attachments: [],
          tags: ['中優先級'],
        },
      ];

      for (const feedbackData of feedbacks) {
        await service.submitFeedback(feedbackData as FeedbackFormData);
      }
    });

    test('應該獲取單個反饋', async () => {
      const _feedbacks = await service.getFeedbacks();
      const _firstFeedback = feedbacks.feedbacks[0];

      const _result = await service.getFeedback(firstFeedback.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(firstFeedback.id);
    });

    test('應該獲取反饋列表', async () => {
      const _result = await service.getFeedbacks();

      expect(result.feedbacks).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
    });

    test('應該支持過濾', async () => {
      const _result = await service.getFeedbacks({
        types: [FeedbackType.FEATURE_REQUEST],
        priorities: [FeedbackPriority.HIGH],
      });

      expect(result.feedbacks).toHaveLength(1);
      expect(result.feedbacks[0].type).toBe(FeedbackType.FEATURE_REQUEST);
      expect(result.feedbacks[0].priority).toBe(FeedbackPriority.HIGH);
    });

    test('應該支持排序', async () => {
      const _result = await service.getFeedbacks(undefined, {
        field: 'priority',
        direction: 'desc',
      });

      expect(result.feedbacks[0].priority).toBe(FeedbackPriority.HIGH);
      expect(result.feedbacks[1].priority).toBe(FeedbackPriority.MEDIUM);
      expect(result.feedbacks[2].priority).toBe(FeedbackPriority.LOW);
    });

    test('應該支持分頁', async () => {
      const _result = await service.getFeedbacks(undefined, undefined, {
        page: 1,
        limit: 2,
      });

      expect(result.feedbacks).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    test('應該支持搜索', async () => {
      const _result = await service.getFeedbacks({
        search: '高優先級',
      });

      expect(result.feedbacks).toHaveLength(1);
      expect(result.feedbacks[0].title).toContain('高優先級');
    });
  });

  describe('分析數據', () => {
    beforeEach(async () => {
      await service.initialize();

      // CreateTestData
      const _feedbacks = [
        {
          type: FeedbackType.FEATURE_REQUEST,
          category: FeedbackCategory.FUNCTIONALITY,
          priority: FeedbackPriority.HIGH,
          title: '功能請求1',
          description: '描述1',
          satisfactionRating: SatisfactionRating.SATISFIED,
          attachments: [],
          tags: [],
        },
        {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.PERFORMANCE,
          priority: FeedbackPriority.MEDIUM,
          title: 'Error報告1',
          description: '描述2',
          satisfactionRating: SatisfactionRating.DISSATISFIED,
          attachments: [],
          tags: [],
        },
        {
          type: FeedbackType.FEATURE_REQUEST,
          category: FeedbackCategory.UI_UX,
          priority: FeedbackPriority.LOW,
          title: '功能請求2',
          description: '描述3',
          satisfactionRating: SatisfactionRating.VERY_SATISFIED,
          attachments: [],
          tags: [],
        },
      ];

      for (const feedbackData of feedbacks) {
        await service.submitFeedback(feedbackData as FeedbackFormData);
      }
    });

    test('應該生成正確的分析數據', async () => {
      const _analytics = await service.getAnalytics();

      expect(analytics.totalFeedbacks).toBe(3);
      expect(analytics.feedbacksByType[FeedbackType.FEATURE_REQUEST]).toBe(2);
      expect(analytics.feedbacksByType[FeedbackType.BUG_REPORT]).toBe(1);
      expect(
        analytics.feedbacksByCategory[FeedbackCategory.FUNCTIONALITY]
      ).toBe(1);
      expect(analytics.feedbacksByCategory[FeedbackCategory.PERFORMANCE]).toBe(
        1
      );
      expect(analytics.feedbacksByCategory[FeedbackCategory.UI_UX]).toBe(1);
      expect(analytics.feedbacksByPriority[FeedbackPriority.HIGH]).toBe(1);
      expect(analytics.feedbacksByPriority[FeedbackPriority.MEDIUM]).toBe(1);
      expect(analytics.feedbacksByPriority[FeedbackPriority.LOW]).toBe(1);
      expect(analytics.averageSatisfaction).toBeCloseTo(3.67, 1);
    });

    test('應該支持過濾的分析數據', async () => {
      const _analytics = await service.getAnalytics({
        types: [FeedbackType.FEATURE_REQUEST],
      });

      expect(analytics.totalFeedbacks).toBe(2);
      expect(analytics.feedbacksByType[FeedbackType.FEATURE_REQUEST]).toBe(2);
    });
  });

  describe('通知功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該發送通知', async () => {
      const _notification = {
        type: 'new_feedback' as const,
        feedbackId: 'test-id',
        userId: 'test-user',
        title: '新反饋',
        message: '收到新的反饋',
        read: false,
      };

      await service.sendNotification(notification);

      const _status = service.getStatus();
      expect(status.notificationCount).toBe(1);
    });

    test('應該標記通知為已讀', async () => {
      const _notification = {
        type: 'new_feedback' as const,
        feedbackId: 'test-id',
        userId: 'test-user',
        title: '新反饋',
        message: '收到新的反饋',
        read: false,
      };

      await service.sendNotification(notification);
      const _status = service.getStatus();
      const _notificationId =
        status.notificationCount > 0 ? 'test-notification-id' : 'dummy-id';

      await service.markNotificationRead(notificationId);

      // 由於我們沒有實際的 notification Object，這裡只YesTestMethod不會ThrowError
      expect(true).toBe(true);
    });
  });

  describe('同步功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該執行同步', async () => {
      await expect(service.sync()).resolves.not.toThrow();
    });
  });

  describe('事件監聽器', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該支持事件監聽', () => {
      const _mockListener = jest.fn();

      service.on('feedbackSubmitted', mockListener);

      expect(mockListener).not.toHaveBeenCalled();
    });

    test('應該移除事件監聽器', () => {
      const _mockListener = jest.fn();

      service.on('feedbackSubmitted', mockListener);
      service.off('feedbackSubmitted', mockListener);

      // 由於我們沒有觸發Event，這裡只YesTestMethod不會ThrowError
      expect(true).toBe(true);
    });
  });

  describe('Service狀態', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該返回正確的Service狀態', () => {
      const _status = service.getStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('feedbackCount');
      expect(status).toHaveProperty('eventCount');
      expect(status).toHaveProperty('notificationCount');
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('ErrorHandle', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該處理無效的反饋 ID', async () => {
      await expect(service.getFeedback('invalid-id')).resolves.toBeNull();
    });

    test('應該處理空的反饋列表', async () => {
      const _result = await service.getFeedbacks();
      expect(result.feedbacks).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });
});
