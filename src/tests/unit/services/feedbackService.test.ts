import { feedbackService } from '../../../services/feedbackService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';
import { storage } from '../../../utils/storage';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/storage');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('應該成功創建反饋', async () => {
      const mockFeedbackData = {
        type: 'bug' as const,
        category: 'ui',
        title: '測試反饋',
        description: '這是一個測試反饋',
        priority: 'medium' as const,
        tags: ['測試']
      };

      const mockResponse = {
        data: {
          id: 'feedback-1',
          ...mockFeedbackData,
          status: 'open',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.createFeedback(mockFeedbackData);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.post).toHaveBeenCalledWith('/feedback', expect.objectContaining({
        ...mockFeedbackData,
        deviceInfo: expect.any(Object),
        appInfo: expect.any(Object),
        location: expect.any(Object)
      }));
      expect(mockLogger.info).toHaveBeenCalledWith('創建用戶反饋', { type: mockFeedbackData.type, category: mockFeedbackData.category });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋創建成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理創建反饋失敗', async () => {
      const mockFeedbackData = {
        type: 'bug' as const,
        category: 'ui',
        title: '測試反饋',
        description: '這是一個測試反饋'
      };

      const error = new Error('創建失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(feedbackService.createFeedback(mockFeedbackData)).rejects.toThrow('創建失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('創建反饋失敗', { error, data: mockFeedbackData });
    });
  });

  describe('getFeedbacks', () => {
    it('應該成功獲取反饋列表', async () => {
      const mockParams = {
        page: 1,
        limit: 20,
        status: 'open'
      };

      const mockResponse = {
        data: {
          feedbacks: [
            {
              id: 'feedback-1',
              type: 'bug',
              category: 'ui',
              title: '測試反饋',
              status: 'open'
            }
          ],
          total: 1,
          page: 1,
          limit: 20
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbacks(mockParams);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback', { params: mockParams });
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋列表', { params: mockParams });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋列表獲取成功', { count: 1, total: 1 });
    });

    it('應該處理獲取反饋列表失敗', async () => {
      const mockParams = { page: 1, limit: 20 };
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbacks(mockParams)).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋列表失敗', { error, params: mockParams });
    });

    it('應該在不提供參數時獲取反饋列表', async () => {
      const mockResponse = {
        data: {
          feedbacks: [],
          total: 0,
          page: 1,
          limit: 20
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      await feedbackService.getFeedbacks();

      expect(mockApiService.get).toHaveBeenCalledWith('/feedback', { params: undefined });
    });
  });

  describe('getFeedback', () => {
    it('應該成功獲取反饋詳情', async () => {
      const mockResponse = {
        data: {
          id: 'feedback-1',
          type: 'bug',
          category: 'ui',
          title: '測試反饋',
          description: '這是一個測試反饋',
          status: 'open'
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedback('feedback-1');

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/feedback-1');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋詳情', { feedbackId: 'feedback-1' });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋詳情獲取成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理獲取反饋詳情失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedback('feedback-1')).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋詳情失敗', { error, feedbackId: 'feedback-1' });
    });
  });

  describe('updateFeedback', () => {
    it('應該成功更新反饋', async () => {
      const mockUpdateData = {
        title: '更新後的標題',
        description: '更新後的描述',
        status: 'in_progress' as const
      };

      const mockResponse = {
        data: {
          id: 'feedback-1',
          ...mockUpdateData
        }
      };

      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await feedbackService.updateFeedback('feedback-1', mockUpdateData);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.put).toHaveBeenCalledWith('/feedback/feedback-1', mockUpdateData);
      expect(mockLogger.info).toHaveBeenCalledWith('更新反饋', { feedbackId: 'feedback-1', data: mockUpdateData });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋更新成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理更新反饋失敗', async () => {
      const mockUpdateData = { title: '新標題' };
      const error = new Error('更新失敗');
      mockApiService.put.mockRejectedValue(error);

      await expect(feedbackService.updateFeedback('feedback-1', mockUpdateData)).rejects.toThrow('更新失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('更新反饋失敗', { error, feedbackId: 'feedback-1', data: mockUpdateData });
    });
  });

  describe('deleteFeedback', () => {
    it('應該成功刪除反饋', async () => {
      mockApiService.delete.mockResolvedValue({});

      await feedbackService.deleteFeedback('feedback-1');

      expect(mockApiService.delete).toHaveBeenCalledWith('/feedback/feedback-1');
      expect(mockLogger.info).toHaveBeenCalledWith('刪除反饋', { feedbackId: 'feedback-1' });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋刪除成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理刪除反饋失敗', async () => {
      const error = new Error('刪除失敗');
      mockApiService.delete.mockRejectedValue(error);

      await expect(feedbackService.deleteFeedback('feedback-1')).rejects.toThrow('刪除失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('刪除反饋失敗', { error, feedbackId: 'feedback-1' });
    });
  });

  describe('voteFeedback', () => {
    it('應該成功為反饋投票', async () => {
      mockApiService.post.mockResolvedValue({});

      await feedbackService.voteFeedback('feedback-1', 1);

      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/feedback-1/vote', { vote: 1 });
      expect(mockLogger.info).toHaveBeenCalledWith('為反饋投票', { feedbackId: 'feedback-1', vote: 1 });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋投票成功', { feedbackId: 'feedback-1', vote: 1 });
    });

    it('應該處理反饋投票失敗', async () => {
      const error = new Error('投票失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(feedbackService.voteFeedback('feedback-1', -1)).rejects.toThrow('投票失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('反饋投票失敗', { error, feedbackId: 'feedback-1', vote: -1 });
    });
  });

  describe('createResponse', () => {
    it('應該成功創建反饋回應', async () => {
      const mockResponseData = {
        feedbackId: 'feedback-1',
        content: '這是一個回應',
        isInternal: false
      };

      mockApiService.post.mockResolvedValue({});

      await feedbackService.createResponse(mockResponseData);

      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/feedback-1/responses', mockResponseData);
      expect(mockLogger.info).toHaveBeenCalledWith('創建反饋回應', { feedbackId: 'feedback-1' });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋回應創建成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理創建反饋回應失敗', async () => {
      const mockResponseData = {
        feedbackId: 'feedback-1',
        content: '回應內容'
      };

      const error = new Error('創建失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(feedbackService.createResponse(mockResponseData)).rejects.toThrow('創建失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('創建反饋回應失敗', { error, data: mockResponseData });
    });
  });

  describe('getFeedbackStats', () => {
    it('應該成功獲取反饋統計', async () => {
      const mockResponse = {
        data: {
          total: 100,
          open: 20,
          inProgress: 30,
          resolved: 50,
          closed: 0
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackStats();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/stats');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋統計');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋統計獲取成功');
    });

    it('應該處理獲取反饋統計失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackStats()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋統計失敗', { error });
    });
  });

  describe('getFeedbackAnalysis', () => {
    it('應該成功獲取反饋分析報告', async () => {
      const mockPeriod = { start: '2024-01-01', end: '2024-01-31' };
      const mockResponse = {
        data: {
          period: mockPeriod,
          trends: [],
          categories: [],
          priorities: []
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackAnalysis(mockPeriod);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/analysis', { params: { period: mockPeriod } });
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋分析報告', { period: mockPeriod });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋分析報告獲取成功');
    });

    it('應該在不提供時間段時獲取分析報告', async () => {
      const mockResponse = {
        data: {
          trends: [],
          categories: [],
          priorities: []
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      await feedbackService.getFeedbackAnalysis();

      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/analysis', { params: {} });
    });

    it('應該處理獲取反饋分析報告失敗', async () => {
      const mockPeriod = { start: '2024-01-01', end: '2024-01-31' };
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackAnalysis(mockPeriod)).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋分析報告失敗', { error, period: mockPeriod });
    });
  });

  describe('getFeedbackTemplates', () => {
    it('應該成功獲取反饋模板', async () => {
      const mockResponse = {
        data: [
          {
            id: 'template-1',
            name: 'Bug 報告模板',
            content: '請描述您遇到的問題...'
          }
        ]
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackTemplates();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/templates');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋模板');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋模板獲取成功', { count: 1 });
    });

    it('應該處理獲取反饋模板失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackTemplates()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋模板失敗', { error });
    });
  });

  describe('getFeedbackTags', () => {
    it('應該成功獲取反饋標籤', async () => {
      const mockResponse = {
        data: [
          {
            id: 'tag-1',
            name: 'UI',
            color: '#ff0000'
          }
        ]
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackTags();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/tags');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋標籤');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋標籤獲取成功', { count: 1 });
    });

    it('應該處理獲取反饋標籤失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackTags()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋標籤失敗', { error });
    });
  });

  describe('getNotificationSettings', () => {
    it('應該成功獲取反饋通知設置', async () => {
      const mockResponse = {
        data: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: false
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getNotificationSettings();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/notifications/settings');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋通知設置');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋通知設置獲取成功');
    });

    it('應該處理獲取反饋通知設置失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getNotificationSettings()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取反饋通知設置失敗', { error });
    });
  });

  describe('updateNotificationSettings', () => {
    it('應該成功更新反饋通知設置', async () => {
      const mockSettings = {
        emailNotifications: false,
        pushNotifications: true
      };

      mockApiService.put.mockResolvedValue({});

      await feedbackService.updateNotificationSettings(mockSettings);

      expect(mockApiService.put).toHaveBeenCalledWith('/feedback/notifications/settings', mockSettings);
      expect(mockLogger.info).toHaveBeenCalledWith('更新反饋通知設置', { settings: mockSettings });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋通知設置更新成功');
    });

    it('應該處理更新反饋通知設置失敗', async () => {
      const mockSettings = { emailNotifications: false };
      const error = new Error('更新失敗');
      mockApiService.put.mockRejectedValue(error);

      await expect(feedbackService.updateNotificationSettings(mockSettings)).rejects.toThrow('更新失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('更新反饋通知設置失敗', { error, settings: mockSettings });
    });
  });

  describe('uploadAttachment', () => {
    it('應該成功上傳反饋附件', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        data: {
          url: 'https://example.com/attachment/test.txt'
        }
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.uploadAttachment('feedback-1', mockFile);

      expect(result).toBe('https://example.com/attachment/test.txt');
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback/feedback-1/attachments',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('上傳反饋附件', { feedbackId: 'feedback-1', fileName: 'test.txt' });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋附件上傳成功', { feedbackId: 'feedback-1', fileUrl: 'https://example.com/attachment/test.txt' });
    });

    it('應該處理上傳反饋附件失敗', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const error = new Error('上傳失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(feedbackService.uploadAttachment('feedback-1', mockFile)).rejects.toThrow('上傳失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('上傳反饋附件失敗', { error, feedbackId: 'feedback-1', fileName: 'test.txt' });
    });
  });

  describe('searchFeedbacks', () => {
    it('應該成功搜索反饋', async () => {
      const mockQuery = 'bug';
      const mockParams = { status: 'open' };
      const mockResponse = {
        data: {
          feedbacks: [
            {
              id: 'feedback-1',
              title: 'Bug 報告',
              status: 'open'
            }
          ],
          total: 1,
          page: 1,
          limit: 20
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.searchFeedbacks(mockQuery, mockParams);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/search', { params: { ...mockParams, q: mockQuery } });
      expect(mockLogger.info).toHaveBeenCalledWith('搜索反饋', { query: mockQuery, params: mockParams });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋搜索成功', { query: mockQuery, count: 1, total: 1 });
    });

    it('應該處理搜索反饋失敗', async () => {
      const mockQuery = 'test';
      const mockParams = { status: 'open' };
      const error = new Error('搜索失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.searchFeedbacks(mockQuery, mockParams)).rejects.toThrow('搜索失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('搜索反饋失敗', { error, query: mockQuery, params: mockParams });
    });
  });

  describe('getUserFeedbackHistory', () => {
    it('應該成功獲取用戶反饋歷史', async () => {
      const mockResponse = {
        data: [
          {
            id: 'feedback-1',
            title: '歷史反饋',
            status: 'resolved'
          }
        ]
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getUserFeedbackHistory();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/my-feedback');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶反饋歷史');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶反饋歷史獲取成功', { count: 1 });
    });

    it('應該處理獲取用戶反饋歷史失敗', async () => {
      const error = new Error('獲取失敗');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getUserFeedbackHistory()).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('獲取用戶反饋歷史失敗', { error });
    });
  });

  describe('markFeedbackAsRead', () => {
    it('應該成功標記反饋為已讀', async () => {
      mockApiService.post.mockResolvedValue({});

      await feedbackService.markFeedbackAsRead('feedback-1');

      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/feedback-1/read');
      expect(mockLogger.info).toHaveBeenCalledWith('標記反饋為已讀', { feedbackId: 'feedback-1' });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋標記為已讀成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理標記反饋為已讀失敗', async () => {
      const error = new Error('標記失敗');
      mockApiService.post.mockRejectedValue(error);

      await expect(feedbackService.markFeedbackAsRead('feedback-1')).rejects.toThrow('標記失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('標記反饋為已讀失敗', { error, feedbackId: 'feedback-1' });
    });
  });

  describe('cacheFeedback', () => {
    it('應該成功緩存反饋數據', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋',
        status: 'open'
      };

      mockStorage.setItem.mockResolvedValue();

      await feedbackService.cacheFeedback(mockFeedback);

      expect(mockStorage.setItem).toHaveBeenCalledWith('feedback_feedback-1', JSON.stringify(mockFeedback));
      expect(mockLogger.info).toHaveBeenCalledWith('反饋數據緩存成功', { feedbackId: 'feedback-1' });
    });

    it('應該處理緩存反饋數據失敗', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋'
      };

      const error = new Error('緩存失敗');
      mockStorage.setItem.mockRejectedValue(error);

      await feedbackService.cacheFeedback(mockFeedback);

      expect(mockLogger.error).toHaveBeenCalledWith('緩存反饋數據失敗', { error, feedbackId: 'feedback-1' });
    });
  });

  describe('getCachedFeedback', () => {
    it('應該成功從緩存獲取反饋數據', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋'
      };

      mockStorage.getItem.mockResolvedValue(JSON.stringify(mockFeedback));

      const result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toEqual(mockFeedback);
      expect(mockStorage.getItem).toHaveBeenCalledWith('feedback_feedback-1');
      expect(mockLogger.info).toHaveBeenCalledWith('從緩存獲取反饋數據', { feedbackId: 'feedback-1' });
    });

    it('應該在緩存不存在時返回 null', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toBeNull();
    });

    it('應該處理從緩存獲取反饋數據失敗', async () => {
      const error = new Error('獲取失敗');
      mockStorage.getItem.mockRejectedValue(error);

      const result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('從緩存獲取反饋數據失敗', { error, feedbackId: 'feedback-1' });
    });
  });

  describe('clearExpiredCache', () => {
    it('應該成功清理過期緩存', async () => {
      const mockKeys = ['feedback_1', 'feedback_2', 'other_key'];
      mockStorage.getAllKeys.mockResolvedValue(mockKeys);
      mockStorage.removeItem.mockResolvedValue();

      await feedbackService.clearExpiredCache();

      expect(mockStorage.getAllKeys).toHaveBeenCalled();
      expect(mockStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('feedback_1');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('feedback_2');
      expect(mockLogger.info).toHaveBeenCalledWith('清理過期緩存成功', { clearedCount: 2 });
    });

    it('應該處理清理過期緩存失敗', async () => {
      const error = new Error('清理失敗');
      mockStorage.getAllKeys.mockRejectedValue(error);

      await feedbackService.clearExpiredCache();

      expect(mockLogger.error).toHaveBeenCalledWith('清理過期緩存失敗', { error });
    });
  });
});
