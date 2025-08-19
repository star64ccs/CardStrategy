import { FeedbackService } from '@/services/feedbackService';
import { mockApiResponse, mockApiError } from '@/__tests__/setup/test-utils';

// Mock API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock storage
jest.mock('@/utils/storage', () => ({
  storage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock validation service
jest.mock('@/utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ isValid: true, errors: [] })),
  validateInput: jest.fn(() => ({ isValid: true, errors: [] }))
}));

describe('FeedbackService', () => {
  let feedbackService: FeedbackService;
  let mockApiService: any;
  let mockStorage: any;
  let mockLogger: any;
  let mockValidationService: any;

  beforeEach(() => {
    feedbackService = new FeedbackService();
    mockApiService = require('@/services/apiService').apiService;
    mockStorage = require('@/utils/storage').storage;
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('應該成功創建反饋', async () => {
      const feedbackData = {
        type: 'bug_report' as const,
        title: '測試反饋',
        description: '這是一個測試反饋',
        category: 'ui_ux' as const,
        priority: 'medium' as const
      };
      const mockResponse = mockApiResponse({
        id: '1',
        ...feedbackData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: 'user-1'
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.createFeedback(feedbackData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.title).toBe('測試反饋');
      expect(mockApiService.post).toHaveBeenCalledWith('/feedback', feedbackData);
    });

    it('應該處理創建反饋錯誤', async () => {
      const feedbackData = {
        type: 'bug_report' as const,
        title: '',
        description: '這是一個測試反饋',
        category: 'ui_ux' as const,
        priority: 'medium' as const
      };
      const mockError = mockApiError('標題不能為空');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(feedbackService.createFeedback(feedbackData)).rejects.toThrow('標題不能為空');
    });
  });

  describe('getFeedbacks', () => {
    it('應該成功獲取反饋列表', async () => {
      const mockFeedbacks = [
        {
          id: '1',
          type: 'bug_report' as const,
          title: '反饋1',
          description: '描述1',
          status: 'pending' as const,
          priority: 'medium' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'feature_request' as const,
          title: '反饋2',
          description: '描述2',
          status: 'in_progress' as const,
          priority: 'high' as const,
          createdAt: new Date().toISOString()
        }
      ];
      const mockResponse = mockApiResponse({
        feedbacks: mockFeedbacks,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbacks({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.feedbacks).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback', {
        params: { page: 1, limit: 10 }
      });
    });

    it('應該處理獲取反饋列表錯誤', async () => {
      const mockError = mockApiError('獲取反饋列表失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(feedbackService.getFeedbacks()).rejects.toThrow('獲取反饋列表失敗');
    });
  });

  describe('getFeedback', () => {
    it('應該成功獲取單個反饋', async () => {
      const mockFeedback = {
        id: '1',
        type: 'bug_report' as const,
        title: '測試反饋',
        description: '詳細描述',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
        responses: [],
        votes: { up: 5, down: 1 }
      };
      const mockResponse = mockApiResponse(mockFeedback);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedback('1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/1');
    });

    it('應該處理獲取反饋錯誤', async () => {
      const mockError = mockApiError('反饋不存在');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(feedbackService.getFeedback('999')).rejects.toThrow('反饋不存在');
    });
  });

  describe('updateFeedback', () => {
    it('應該成功更新反饋', async () => {
      const updateData = {
        title: '更新的標題',
        description: '更新的描述',
        priority: 'high' as const
      };
      const mockResponse = mockApiResponse({
        id: '1',
        ...updateData,
        type: 'bug_report' as const,
        status: 'in_progress' as const,
        updatedAt: new Date().toISOString()
      });

      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await feedbackService.updateFeedback('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('更新的標題');
      expect(mockApiService.put).toHaveBeenCalledWith('/feedback/1', updateData);
    });

    it('應該處理更新反饋錯誤', async () => {
      const updateData = { title: '更新的標題' };
      const mockError = mockApiError('無權限更新此反饋');

      mockApiService.put.mockRejectedValue(mockError);

      await expect(feedbackService.updateFeedback('1', updateData)).rejects.toThrow('無權限更新此反饋');
    });
  });

  describe('deleteFeedback', () => {
    it('應該成功刪除反饋', async () => {
      const mockResponse = mockApiResponse({ message: '反饋刪除成功' });

      mockApiService.delete.mockResolvedValue(mockResponse);

      const result = await feedbackService.deleteFeedback('1');

      expect(result.success).toBe(true);
      expect(mockApiService.delete).toHaveBeenCalledWith('/feedback/1');
    });

    it('應該處理刪除反饋錯誤', async () => {
      const mockError = mockApiError('無權限刪除此反饋');

      mockApiService.delete.mockRejectedValue(mockError);

      await expect(feedbackService.deleteFeedback('1')).rejects.toThrow('無權限刪除此反饋');
    });
  });

  describe('voteFeedback', () => {
    it('應該成功投票反饋', async () => {
      const voteData = { vote: 1 as const };
      const mockResponse = mockApiResponse({
        id: '1',
        votes: { up: 6, down: 1 },
        userVote: 1
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.voteFeedback('1', voteData);

      expect(result.success).toBe(true);
      expect(result.data.votes.up).toBe(6);
      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/1/vote', voteData);
    });

    it('應該處理投票錯誤', async () => {
      const voteData = { vote: 1 as const };
      const mockError = mockApiError('已經投票過此反饋');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(feedbackService.voteFeedback('1', voteData)).rejects.toThrow('已經投票過此反饋');
    });
  });

  describe('createResponse', () => {
    it('應該成功創建回應', async () => {
      const responseData = {
        content: '這是一個官方回應',
        isOfficial: true
      };
      const mockResponse = mockApiResponse({
        id: 'resp-1',
        feedbackId: '1',
        ...responseData,
        createdAt: new Date().toISOString(),
        userId: 'admin-1'
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.createResponse('1', responseData);

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('這是一個官方回應');
      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/1/responses', responseData);
    });

    it('應該處理創建回應錯誤', async () => {
      const responseData = { content: '回應內容' };
      const mockError = mockApiError('無權限創建回應');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(feedbackService.createResponse('1', responseData)).rejects.toThrow('無權限創建回應');
    });
  });

  describe('getFeedbackStats', () => {
    it('應該成功獲取反饋統計', async () => {
      const mockStats = {
        total: 100,
        pending: 20,
        inProgress: 30,
        resolved: 40,
        closed: 10,
        byType: {
          bug_report: 40,
          feature_request: 30,
          improvement: 20,
          general: 10
        },
        byPriority: {
          low: 20,
          medium: 40,
          high: 30,
          critical: 10
        }
      };
      const mockResponse = mockApiResponse(mockStats);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackStats();

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(100);
      expect(result.data.pending).toBe(20);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/stats');
    });

    it('應該處理獲取統計錯誤', async () => {
      const mockError = mockApiError('獲取統計失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(feedbackService.getFeedbackStats()).rejects.toThrow('獲取統計失敗');
    });
  });

  describe('getFeedbackAnalysis', () => {
    it('應該成功獲取反饋分析', async () => {
      const mockAnalysis = {
        trends: {
          daily: [{ date: '2024-01-01', count: 10 }],
          weekly: [{ week: '2024-W01', count: 70 }],
          monthly: [{ month: '2024-01', count: 300 }]
        },
        satisfaction: {
          average: 4.2,
          distribution: { 1: 5, 2: 10, 3: 20, 4: 40, 5: 25 }
        },
        responseTime: {
          average: 2.5,
          distribution: { '0-1h': 30, '1-24h': 50, '1-7d': 15, '7d+': 5 }
        }
      };
      const mockResponse = mockApiResponse(mockAnalysis);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackAnalysis();

      expect(result.success).toBe(true);
      expect(result.data.trends).toBeDefined();
      expect(result.data.satisfaction.average).toBe(4.2);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/analysis');
    });
  });

  describe('searchFeedbacks', () => {
    it('應該成功搜索反饋', async () => {
      const searchParams = {
        query: '登錄問題',
        type: 'bug_report' as const,
        status: 'pending' as const,
        priority: 'high' as const
      };
      const mockFeedbacks = [
        {
          id: '1',
          type: 'bug_report' as const,
          title: '登錄問題',
          description: '無法正常登錄',
          status: 'pending' as const,
          priority: 'high' as const
        }
      ];
      const mockResponse = mockApiResponse({
        feedbacks: mockFeedbacks,
        total: 1
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.searchFeedbacks(searchParams);

      expect(result.success).toBe(true);
      expect(result.data.feedbacks).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/search', {
        params: searchParams
      });
    });
  });

  describe('uploadAttachment', () => {
    it('應該成功上傳附件', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = mockApiResponse({
        id: 'att-1',
        filename: 'test.txt',
        url: 'https://example.com/attachments/test.txt',
        size: 12,
        type: 'text/plain'
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.uploadAttachment(file);

      expect(result.success).toBe(true);
      expect(result.data.filename).toBe('test.txt');
      expect(mockApiService.post).toHaveBeenCalledWith('/feedback/attachments', expect.any(FormData));
    });

    it('應該處理上傳附件錯誤', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockError = mockApiError('文件大小超過限制');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(feedbackService.uploadAttachment(file)).rejects.toThrow('文件大小超過限制');
    });
  });

  describe('getFeedbackTemplates', () => {
    it('應該成功獲取反饋模板', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: '錯誤報告模板',
          type: 'bug_report' as const,
          content: '請描述您遇到的問題...',
          isDefault: true
        }
      ];
      const mockResponse = mockApiResponse(mockTemplates);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackTemplates();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/templates');
    });
  });

  describe('getFeedbackTags', () => {
    it('應該成功獲取反饋標籤', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'UI問題', color: '#ff0000' },
        { id: 'tag-2', name: '性能問題', color: '#00ff00' }
      ];
      const mockResponse = mockApiResponse(mockTags);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.getFeedbackTags();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/feedback/tags');
    });
  });
});
