import { apiService } from '../../../services/apiService';
import { feedbackService } from '../../../services/feedbackService';
import { logger } from '../../../utils/logger';
import { storage } from '../../../utils/storage';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/storage');

const _mockApiService = apiService as jest.Mocked<typeof apiService>;
const _mockLogger = logger as jest.Mocked<typeof logger>;
const _mockStorage = storage as jest.Mocked<typeof storage>;

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('應該SuccessCreate反饋', async () => {
      const _mockFeedbackData = {
        type: 'bug' as const,
        category: 'ui',
        title: '測試反饋',
        description: '這是一個測試反饋',
        priority: 'medium' as const,
        tags: ['測試'],
      };

      const _mockResponse = {
        data: {
          id: 'feedback-1',
          ...mockFeedbackData,
          status: 'open',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await feedbackService.createFeedback(mockFeedbackData);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback',
        expect.objectContaining({
          ...mockFeedbackData,
          deviceInfo: expect.any(Object),
          appInfo: expect.any(Object),
          location: expect.any(Object),
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith('創建用戶反饋', {
        type: mockFeedbackData.type,
        category: mockFeedbackData.category,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋CreateSuccess', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該HandleCreate反饋Failed', async () => {
      const _mockFeedbackData = {
        type: 'bug' as const,
        category: 'ui',
        title: '測試反饋',
        description: '這是一個測試反饋',
      };

      const _error = new Error('CreateFailed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        feedbackService.createFeedback(mockFeedbackData)
      ).rejects.toThrow('CreateFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Create反饋Failed', {
        error,
        data: mockFeedbackData,
      });
    });
  });

  describe('getFeedbacks', () => {
    it('應該SuccessGet反饋列表', async () => {
      const _mockParams = {
        page: 1,
        limit: 20,
        status: 'open',
      };

      const _mockResponse = {
        data: {
          feedbacks: [
            {
              id: 'feedback-1',
              type: 'bug',
              category: 'ui',
              title: '測試反饋',
              status: 'open',
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedbacks(mockParams);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback', {
        params: mockParams,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋列表', {
        params: mockParams,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋列表GetSuccess', {
        count: 1,
        total: 1,
      });
    });

    it('應該HandleGet反饋列表Failed', async () => {
      const _mockParams = { page: 1, limit: 20 };
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbacks(mockParams)).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋列表Failed', {
        error,
        params: mockParams,
      });
    });

    it('應該在不提供參數時獲取反饋列表', async () => {
      const _mockResponse = {
        data: {
          feedbacks: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      await feedbackService.getFeedbacks();

      expect(mockApiService.get).toHaveBeenCalledWith('/feedback', {
        params: undefined,
      });
    });
  });

  describe('getFeedback', () => {
    it('應該SuccessGet反饋詳情', async () => {
      const _mockResponse = {
        data: {
          id: 'feedback-1',
          type: 'bug',
          category: 'ui',
          title: '測試反饋',
          description: '這是一個測試反饋',
          status: 'open',
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedback('feedback-1');

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/feedback-1');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋詳情', {
        feedbackId: 'feedback-1',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋詳情GetSuccess', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該HandleGet反饋詳情Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedback('feedback-1')).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋詳情Failed', {
        error,
        feedbackId: 'feedback-1',
      });
    });
  });

  describe('updateFeedback', () => {
    it('應該SuccessUpdate反饋', async () => {
      const _mockUpdateData = {
        title: '更新後的標題',
        description: '更新後的描述',
        status: 'in_progress' as const,
      };

      const _mockResponse = {
        data: {
          id: 'feedback-1',
          ...mockUpdateData,
        },
      };

      mockApiService.put.mockResolvedValue(mockResponse);

      const _result = await feedbackService.updateFeedback(
        'feedback-1',
        mockUpdateData
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.put).toHaveBeenCalledWith(
        '/feedback/feedback-1',
        mockUpdateData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('更新反饋', {
        feedbackId: 'feedback-1',
        data: mockUpdateData,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋UpdateSuccess', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該HandleUpdate反饋Failed', async () => {
      const _mockUpdateData = { title: '新標題' };
      const _error = new Error('UpdateFailed');
      mockApiService.put.mockRejectedValue(error);

      await expect(
        feedbackService.updateFeedback('feedback-1', mockUpdateData)
      ).rejects.toThrow('UpdateFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Update反饋Failed', {
        error,
        feedbackId: 'feedback-1',
        data: mockUpdateData,
      });
    });
  });

  describe('deleteFeedback', () => {
    it('應該SuccessDelete反饋', async () => {
      mockApiService.delete.mockResolvedValue({});

      await feedbackService.deleteFeedback('feedback-1');

      expect(mockApiService.delete).toHaveBeenCalledWith(
        '/feedback/feedback-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('刪除反饋', {
        feedbackId: 'feedback-1',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋DeleteSuccess', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該HandleDelete反饋Failed', async () => {
      const _error = new Error('DeleteFailed');
      mockApiService.delete.mockRejectedValue(error);

      await expect(
        feedbackService.deleteFeedback('feedback-1')
      ).rejects.toThrow('DeleteFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Delete反饋Failed', {
        error,
        feedbackId: 'feedback-1',
      });
    });
  });

  describe('voteFeedback', () => {
    it('應該Success為反饋投票', async () => {
      mockApiService.post.mockResolvedValue({});

      await feedbackService.voteFeedback('feedback-1', 1);

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback/feedback-1/vote',
        { vote: 1 }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('為反饋投票', {
        feedbackId: 'feedback-1',
        vote: 1,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋投票Success', {
        feedbackId: 'feedback-1',
        vote: 1,
      });
    });

    it('應該Handle反饋投票Failed', async () => {
      const _error = new Error('投票Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        feedbackService.voteFeedback('feedback-1', -1)
      ).rejects.toThrow('投票Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('反饋投票Failed', {
        error,
        feedbackId: 'feedback-1',
        vote: -1,
      });
    });
  });

  describe('createResponse', () => {
    it('應該SuccessCreate反饋回應', async () => {
      const _mockResponseData = {
        feedbackId: 'feedback-1',
        content: '這是一個回應',
        isInternal: false,
      };

      mockApiService.post.mockResolvedValue({});

      await feedbackService.createResponse(mockResponseData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback/feedback-1/responses',
        mockResponseData
      );
      expect(mockLogger.info).toHaveBeenCalledWith('創建反饋回應', {
        feedbackId: 'feedback-1',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋回應CreateSuccess', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該HandleCreate反饋回應Failed', async () => {
      const _mockResponseData = {
        feedbackId: 'feedback-1',
        content: '回應內容',
      };

      const _error = new Error('CreateFailed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        feedbackService.createResponse(mockResponseData)
      ).rejects.toThrow('CreateFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Create反饋回應Failed', {
        error,
        data: mockResponseData,
      });
    });
  });

  describe('getFeedbackStats', () => {
    it('應該SuccessGet反饋統計', async () => {
      const _mockResponse = {
        data: {
          total: 100,
          open: 20,
          inProgress: 30,
          resolved: 50,
          closed: 0,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedbackStats();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/stats');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋統計');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋統計GetSuccess');
    });

    it('應該HandleGet反饋統計Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackStats()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋統計Failed', {
        error,
      });
    });
  });

  describe('getFeedbackAnalysis', () => {
    it('應該SuccessGet反饋分析報告', async () => {
      const _mockPeriod = { start: '2024-01-01', end: '2024-01-31' };
      const _mockResponse = {
        data: {
          period: mockPeriod,
          trends: [],
          categories: [],
          priorities: [],
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedbackAnalysis(mockPeriod);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/analysis', {
        params: { period: mockPeriod },
      });
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋分析報告', {
        period: mockPeriod,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋分析報告GetSuccess');
    });

    it('應該在不提供時間段時獲取分析報告', async () => {
      const _mockResponse = {
        data: {
          trends: [],
          categories: [],
          priorities: [],
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      await feedbackService.getFeedbackAnalysis();

      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/analysis', {
        params: {},
      });
    });

    it('應該HandleGet反饋分析報告Failed', async () => {
      const _mockPeriod = { start: '2024-01-01', end: '2024-01-31' };
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(
        feedbackService.getFeedbackAnalysis(mockPeriod)
      ).rejects.toThrow('GetFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋分析報告Failed', {
        error,
        period: mockPeriod,
      });
    });
  });

  describe('getFeedbackTemplates', () => {
    it('應該SuccessGet反饋模板', async () => {
      const _mockResponse = {
        data: [
          {
            id: 'template-1',
            name: 'Bug 報告模板',
            content: '請描述您遇到的問題...',
          },
        ],
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedbackTemplates();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/templates');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋模板');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋模板GetSuccess', {
        count: 1,
      });
    });

    it('應該HandleGet反饋模板Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackTemplates()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋模板Failed', {
        error,
      });
    });
  });

  describe('getFeedbackTags', () => {
    it('應該SuccessGet反饋標籤', async () => {
      const _mockResponse = {
        data: [
          {
            id: 'tag-1',
            name: 'UI',
            color: '#ff0000',
          },
        ],
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getFeedbackTags();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/tags');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋標籤');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋標籤GetSuccess', {
        count: 1,
      });
    });

    it('應該HandleGet反饋標籤Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackTags()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋標籤Failed', {
        error,
      });
    });
  });

  describe('getNotificationSettings', () => {
    it('應該SuccessGet反饋通知Settings', async () => {
      const _mockResponse = {
        data: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getNotificationSettings();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/feedback/notifications/settings'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('獲取反饋通知設置');
      expect(mockLogger.info).toHaveBeenCalledWith('反饋通知SettingsGetSuccess');
    });

    it('應該HandleGet反饋通知SettingsFailed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getNotificationSettings()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get反饋通知SettingsFailed', {
        error,
      });
    });
  });

  describe('updateNotificationSettings', () => {
    it('應該SuccessUpdate反饋通知Settings', async () => {
      const _mockSettings = {
        emailNotifications: false,
        pushNotifications: true,
      };

      mockApiService.put.mockResolvedValue({});

      await feedbackService.updateNotificationSettings(mockSettings);

      expect(mockApiService.put).toHaveBeenCalledWith(
        '/feedback/notifications/settings',
        mockSettings
      );
      expect(mockLogger.info).toHaveBeenCalledWith('更新反饋通知設置', {
        settings: mockSettings,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋通知SettingsUpdateSuccess');
    });

    it('應該HandleUpdate反饋通知SettingsFailed', async () => {
      const _mockSettings = { emailNotifications: false };
      const _error = new Error('UpdateFailed');
      mockApiService.put.mockRejectedValue(error);

      await expect(
        feedbackService.updateNotificationSettings(mockSettings)
      ).rejects.toThrow('UpdateFailed');
      expect(mockLogger.error).toHaveBeenCalledWith('Update反饋通知SettingsFailed', {
        error,
        settings: mockSettings,
      });
    });
  });

  describe('uploadAttachment', () => {
    it('應該Success上傳反饋附件', async () => {
      const _mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const _mockResponse = {
        data: {
          url: 'https://example.com/attachment/test.txt',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await feedbackService.uploadAttachment(
        'feedback-1',
        mockFile
      );

      expect(result).toBe('https://example.com/attachment/test.txt');
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback/feedback-1/attachments',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('上傳反饋附件', {
        feedbackId: 'feedback-1',
        fileName: 'test.txt',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋附件上傳Success', {
        feedbackId: 'feedback-1',
        fileUrl: 'https://example.com/attachment/test.txt',
      });
    });

    it('應該Handle上傳反饋附件Failed', async () => {
      const _mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const _error = new Error('上傳Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        feedbackService.uploadAttachment('feedback-1', mockFile)
      ).rejects.toThrow('上傳Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('上傳反饋附件Failed', {
        error,
        feedbackId: 'feedback-1',
        fileName: 'test.txt',
      });
    });
  });

  describe('searchFeedbacks', () => {
    it('應該Success搜索反饋', async () => {
      const _mockQuery = 'bug';
      const _mockParams = { status: 'open' };
      const _mockResponse = {
        data: {
          feedbacks: [
            {
              id: 'feedback-1',
              title: 'Bug 報告',
              status: 'open',
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.searchFeedbacks(
        mockQuery,
        mockParams
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/search', {
        params: { ...mockParams, q: mockQuery },
      });
      expect(mockLogger.info).toHaveBeenCalledWith('搜索反饋', {
        query: mockQuery,
        params: mockParams,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋搜索Success', {
        query: mockQuery,
        count: 1,
        total: 1,
      });
    });

    it('應該Handle搜索反饋Failed', async () => {
      const _mockQuery = 'test';
      const _mockParams = { status: 'open' };
      const _error = new Error('搜索Failed');
      mockApiService.get.mockRejectedValue(error);

      await expect(
        feedbackService.searchFeedbacks(mockQuery, mockParams)
      ).rejects.toThrow('搜索Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('搜索反饋Failed', {
        error,
        query: mockQuery,
        params: mockParams,
      });
    });
  });

  describe('getUserFeedbackHistory', () => {
    it('應該SuccessGet用戶反饋歷史', async () => {
      const _mockResponse = {
        data: [
          {
            id: 'feedback-1',
            title: '歷史反饋',
            status: 'resolved',
          },
        ],
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await feedbackService.getUserFeedbackHistory();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/my-feedback');
      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶反饋歷史');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶反饋歷史GetSuccess', {
        count: 1,
      });
    });

    it('應該HandleGet用戶反饋歷史Failed', async () => {
      const _error = new Error('GetFailed');
      mockApiService.get.mockRejectedValue(error);

      await expect(feedbackService.getUserFeedbackHistory()).rejects.toThrow(
        'GetFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Get用戶反饋歷史Failed', {
        error,
      });
    });
  });

  describe('markFeedbackAsRead', () => {
    it('應該Success標記反饋為已讀', async () => {
      mockApiService.post.mockResolvedValue({});

      await feedbackService.markFeedbackAsRead('feedback-1');

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/feedback/feedback-1/read'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('標記反饋為已讀', {
        feedbackId: 'feedback-1',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('反饋標記為已讀Success', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該Handle標記反饋為已讀Failed', async () => {
      const _error = new Error('標記Failed');
      mockApiService.post.mockRejectedValue(error);

      await expect(
        feedbackService.markFeedbackAsRead('feedback-1')
      ).rejects.toThrow('標記Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('標記反饋為已讀Failed', {
        error,
        feedbackId: 'feedback-1',
      });
    });
  });

  describe('cacheFeedback', () => {
    it('應該Success緩存反饋數據', async () => {
      const _mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋',
        status: 'open',
      };

      mockStorage.setItem.mockResolvedValue();

      await feedbackService.cacheFeedback(mockFeedback);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'feedback_feedback-1',
        JSON.stringify(mockFeedback)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('反饋數據緩存Success', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該Handle緩存反饋數據Failed', async () => {
      const _mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋',
      };

      const _error = new Error('緩存Failed');
      mockStorage.setItem.mockRejectedValue(error);

      await feedbackService.cacheFeedback(mockFeedback);

      expect(mockLogger.error).toHaveBeenCalledWith('緩存反饋數據Failed', {
        error,
        feedbackId: 'feedback-1',
      });
    });
  });

  describe('getCachedFeedback', () => {
    it('應該Success從緩存Get反饋數據', async () => {
      const _mockFeedback = {
        id: 'feedback-1',
        title: '測試反饋',
      };

      mockStorage.getItem.mockResolvedValue(JSON.stringify(mockFeedback));

      const _result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toEqual(mockFeedback);
      expect(mockStorage.getItem).toHaveBeenCalledWith('feedback_feedback-1');
      expect(mockLogger.info).toHaveBeenCalledWith('從緩存獲取反饋數據', {
        feedbackId: 'feedback-1',
      });
    });

    it('應該在緩存不存在時返回 null', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const _result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toBeNull();
    });

    it('應該Handle從緩存Get反饋數據Failed', async () => {
      const _error = new Error('GetFailed');
      mockStorage.getItem.mockRejectedValue(error);

      const _result = await feedbackService.getCachedFeedback('feedback-1');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('從緩存Get反饋數據Failed', {
        error,
        feedbackId: 'feedback-1',
      });
    });
  });

  describe('clearExpiredCache', () => {
    it('應該Success清理過期緩存', async () => {
      const _mockKeys = ['feedback_1', 'feedback_2', 'other_key'];
      mockStorage.getAllKeys.mockResolvedValue(mockKeys);
      mockStorage.removeItem.mockResolvedValue();

      await feedbackService.clearExpiredCache();

      expect(mockStorage.getAllKeys).toHaveBeenCalled();
      expect(mockStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('feedback_1');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('feedback_2');
      expect(mockLogger.info).toHaveBeenCalledWith('清理過期緩存Success', {
        clearedCount: 2,
      });
    });

    it('應該Handle清理過期緩存Failed', async () => {
      const _error = new Error('清理Failed');
      mockStorage.getAllKeys.mockRejectedValue(error);

      await feedbackService.clearExpiredCache();

      expect(mockLogger.error).toHaveBeenCalledWith('清理過期緩存Failed', {
        error,
      });
    });
  });
});
