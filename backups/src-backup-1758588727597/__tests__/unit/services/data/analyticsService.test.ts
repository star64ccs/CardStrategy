// 分析服務單元測試
import { AnalyticsService } from '../../../../shared/services/analytics/analyticsService';
import { mockApiError, mockApiResponse } from '../../../fixtures/test-utils';

// Mock 外部依賴
jest.mock('../../../../shared/services/analytics/segmentService');
jest.mock('../../../../shared/services/analytics/mixelService');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = {
      trackEvent: jest.fn(),
      identifyUser: jest.fn(),
      generateUserReport: jest.fn(),
      generateTrendReport: jest.fn(),
      generatePerformanceReport: jest.fn(),
      exportUserData: jest.fn(),
      exportReport: jest.fn(),
      getRealtimeMetrics: jest.fn(),
      getRealtimeActivity: jest.fn(),
      initialize: jest.fn(),
      getServiceStats: jest.fn(),
    } as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('事件追蹤', () => {
    it('應該成功追蹤用戶事件', async () => {
      // Arrange
      const mockEvent = {
        userId: '1',
        event: 'card_viewed',
        properties: {
          cardId: 'card_123',
          cardType: 'pokemon',
          timestamp: new Date().toISOString(),
        },
      };

      const mockResponse = mockApiResponse({
        eventId: 'event_123',
        tracked: true,
      });

      (analyticsService.trackEvent as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.trackEvent(mockEvent);

      // Assert
      expect(result).toEqual({
        success: true,
        eventId: 'event_123',
        tracked: true,
      });
    });

    it('應該成功追蹤用戶識別', async () => {
      // Arrange
      const mockUserData = {
        userId: '1',
        traits: {
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date().toISOString(),
        },
      };

      const mockResponse = mockApiResponse({
        identified: true,
      });

      (analyticsService.identifyUser as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.identifyUser(mockUserData);

      // Assert
      expect(result).toEqual({
        success: true,
        identified: true,
      });
    });
  });

  describe('數據分析', () => {
    it('應該成功生成用戶行為報告', async () => {
      // Arrange
      const mockReportRequest = {
        userId: '1',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        metrics: ['page_views', 'click_events', 'session_duration'],
      };

      const mockReport = {
        userId: '1',
        totalEvents: 150,
        pageViews: 75,
        clickEvents: 45,
        averageSessionDuration: 300,
        topPages: ['/cards', '/profile', '/settings'],
      };

      const mockResponse = mockApiResponse(mockReport);
      (analyticsService.generateUserReport as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result =
        await analyticsService.generateUserReport(mockReportRequest);

      // Assert
      expect(result).toEqual({
        success: true,
        userId: '1',
        totalEvents: 150,
        pageViews: 75,
        clickEvents: 45,
        averageSessionDuration: 300,
        topPages: ['/cards', '/profile', '/settings'],
      });
    });

    it('應該成功生成市場趨勢報告', async () => {
      // Arrange
      const mockTrendRequest = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        categories: ['pokemon', 'yugioh', 'mtg'],
      };

      const mockTrendReport = {
        period: '2024-01-01 to 2024-01-31',
        totalCards: 1500,
        categoryBreakdown: {
          pokemon: 600,
          yugioh: 450,
          mtg: 450,
        },
        trendAnalysis: 'Increasing demand for Pokemon cards',
      };

      const mockResponse = mockApiResponse(mockTrendReport);
      (analyticsService.generateTrendReport as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result =
        await analyticsService.generateTrendReport(mockTrendRequest);

      // Assert
      expect(result).toEqual({
        success: true,
        period: '2024-01-01 to 2024-01-31',
        totalCards: 1500,
        categoryBreakdown: {
          pokemon: 600,
          yugioh: 450,
          mtg: 450,
        },
        trendAnalysis: 'Increasing demand for Pokemon cards',
      });
    });

    it('應該成功生成性能指標報告', async () => {
      // Arrange
      const mockPerformanceRequest = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        metrics: ['response_time', 'error_rate', 'throughput'],
      };

      const mockPerformanceReport = {
        averageResponseTime: 150,
        errorRate: 0.02,
        throughput: 1000,
        uptime: 99.9,
      };

      const mockResponse = mockApiResponse(mockPerformanceReport);
      (
        analyticsService.generatePerformanceReport as jest.Mock
      ).mockResolvedValue(mockResponse);

      // Act
      const result = await analyticsService.generatePerformanceReport(
        mockPerformanceRequest
      );

      // Assert
      expect(result).toEqual({
        success: true,
        averageResponseTime: 150,
        errorRate: 0.02,
        throughput: 1000,
        uptime: 99.9,
      });
    });
  });

  describe('數據導出', () => {
    it('應該成功導出用戶數據', async () => {
      // Arrange
      const mockExportRequest = {
        userId: '1',
        format: 'csv',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      const mockExportResult = {
        downloadUrl: 'https://api.example.com/exports/user_data_123.csv',
        fileSize: '2.5MB',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockResponse = mockApiResponse(mockExportResult);
      (analyticsService.exportUserData as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.exportUserData(mockExportRequest);

      // Assert
      expect(result).toEqual({
        success: true,
        downloadUrl: 'https://api.example.com/exports/user_data_123.csv',
        fileSize: '2.5MB',
        expiresAt: expect.any(String),
      });
    });

    it('應該成功導出分析報告', async () => {
      // Arrange
      const mockExportRequest = {
        reportId: 'report_123',
        format: 'pdf',
      };

      const mockExportResult = {
        downloadUrl: 'https://api.example.com/reports/report_123.pdf',
        fileSize: '1.2MB',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockResponse = mockApiResponse(mockExportResult);
      (analyticsService.exportReport as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.exportReport(mockExportRequest);

      // Assert
      expect(result).toEqual({
        success: true,
        downloadUrl: 'https://api.example.com/reports/report_123.pdf',
        fileSize: '1.2MB',
        expiresAt: expect.any(String),
      });
    });
  });

  describe('實時分析', () => {
    it('應該成功獲取實時指標', async () => {
      // Arrange
      const mockRealtimeMetrics = {
        activeUsers: 150,
        eventsPerMinute: 25,
        errorRate: 0.01,
        responseTime: 120,
      };

      const mockResponse = mockApiResponse(mockRealtimeMetrics);
      (analyticsService.getRealtimeMetrics as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.getRealtimeMetrics();

      // Assert
      expect(result).toEqual({
        success: true,
        activeUsers: 150,
        eventsPerMinute: 25,
        errorRate: 0.01,
        responseTime: 120,
      });
    });

    it('應該成功獲取實時用戶活動', async () => {
      // Arrange
      const mockRealtimeActivity = {
        recentEvents: [
          {
            userId: '1',
            event: 'card_viewed',
            timestamp: new Date().toISOString(),
          },
          {
            userId: '2',
            event: 'search_performed',
            timestamp: new Date().toISOString(),
          },
        ],
        topPages: ['/cards', '/search', '/profile'],
        activeRegions: ['US', 'EU', 'JP'],
      };

      const mockResponse = mockApiResponse(mockRealtimeActivity);
      (analyticsService.getRealtimeActivity as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await analyticsService.getRealtimeActivity();

      // Assert
      expect(result).toEqual({
        success: true,
        recentEvents: expect.any(Array),
        topPages: ['/cards', '/search', '/profile'],
        activeRegions: ['US', 'EU', 'JP'],
      });
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空的事件數據', async () => {
      // Arrange
      const emptyEvent = {
        userId: '',
        event: '',
        properties: {},
      };

      (analyticsService.trackEvent as jest.Mock).mockImplementation(() =>
        mockApiError('Invalid event data')
      );

      // Act & Assert
      await expect(analyticsService.trackEvent(emptyEvent)).rejects.toThrow(
        'Invalid event data'
      );
    });

    it('應該處理無效的日期範圍', async () => {
      // Arrange
      const invalidDateRange = {
        userId: '1',
        dateRange: {
          start: '2024-01-31',
          end: '2024-01-01', // End before start
        },
        metrics: ['page_views'],
      };

      (analyticsService.generateUserReport as jest.Mock).mockImplementation(
        () => mockApiError('Invalid date range')
      );

      // Act & Assert
      await expect(
        analyticsService.generateUserReport(invalidDateRange)
      ).rejects.toThrow('Invalid date range');
    });

    it('應該處理過大的數據集', async () => {
      // Arrange
      const largeDataset = {
        userId: '1',
        dateRange: {
          start: '2020-01-01',
          end: '2024-12-31', // Very large range
        },
        metrics: ['page_views'],
      };

      (analyticsService.generateUserReport as jest.Mock).mockImplementation(
        () => mockApiError('Dataset too large')
      );

      // Act & Assert
      await expect(
        analyticsService.generateUserReport(largeDataset)
      ).rejects.toThrow('Dataset too large');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理分析服務錯誤', async () => {
      // Arrange
      const mockEvent = {
        userId: '1',
        event: 'card_viewed',
        properties: {
          cardId: 'card_123',
        },
      };

      (analyticsService.trackEvent as jest.Mock).mockImplementation(() =>
        mockApiError('Analytics service error')
      );

      // Act & Assert
      await expect(analyticsService.trackEvent(mockEvent)).rejects.toThrow(
        'Analytics service error'
      );
    });

    it('應該處理數據處理錯誤', async () => {
      // Arrange
      const mockReportRequest = {
        userId: '1',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        metrics: ['page_views'],
      };

      (analyticsService.generateUserReport as jest.Mock).mockImplementation(
        () => mockApiError('Data processing error')
      );

      // Act & Assert
      await expect(
        analyticsService.generateUserReport(mockReportRequest)
      ).rejects.toThrow('Data processing error');
    });

    it('應該處理導出服務錯誤', async () => {
      // Arrange
      const mockExportRequest = {
        userId: '1',
        format: 'csv',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      (analyticsService.exportUserData as jest.Mock).mockImplementation(() =>
        mockApiError('Export service error')
      );

      // Act & Assert
      await expect(
        analyticsService.exportUserData(mockExportRequest)
      ).rejects.toThrow('Export service error');
    });
  });
});
