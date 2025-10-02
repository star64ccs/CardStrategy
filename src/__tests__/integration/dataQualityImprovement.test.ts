/* global jest, describe, it, expect, beforeEach, afterEach */
import { api } from '@/config/api';
import { dataQualityService } from '@/features/dataQuality/services/dataQualityService';

// Mock API
jest.mock('../../config/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const _mockApi = api as jest.Mocked<typeof api>;

describe('數據質量改進集成測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('完整數據質量改進流程', () => {
    it('應該執行完整的數據質量改進流程', async () => {
      // 1. Get初始Statistics
      const _initialStats = {
        data: {
          totalRecords: 1000,
          qualityScore: 75.0,
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      };
      mockApi.get.mockResolvedValueOnce(initialStats);

      // 2. Get質量指標
      const _qualityMetrics = {
        data: [
          {
            metric: 'accuracy',
            value: 0.785,
            threshold: 0.8,
            status: 'warning',
          },
          {
            metric: 'completeness',
            value: 0.72,
            threshold: 0.75,
            status: 'warning',
          },
        ],
      };
      mockApi.get.mockResolvedValueOnce(qualityMetrics);

      // 3. Get改進建議
      const _recommendations = {
        data: {
          recommendations: [
            {
              id: 1,
              type: 'algorithm_tuning',
              priority: 'high',
              description: 'Optimize annotation algorithm',
              estimatedImpact: 8.5,
            },
            {
              id: 2,
              type: 'data_validation',
              priority: 'medium',
              description: 'Improve data validation rules',
              estimatedImpact: 5.2,
            },
          ],
          totalRecommendations: 2,
        },
      };
      mockApi.get.mockResolvedValueOnce(recommendations);

      // 4. 執RowData清理
      const _cleaningResult = {
        data: {
          status: 'completed',
          cleanedRecords: 150,
          removedDuplicates: 25,
          fixedFormatting: 75,
          qualityImprovement: 0.15,
        },
      };
      mockApi.post.mockResolvedValueOnce(cleaningResult);

      // 5. 執Row質量改進
      const _improvementResult = {
        data: {
          status: 'completed',
          improvements: [
            { type: 'duplicate_removal', count: 25 },
            { type: 'format_standardization', count: 50 },
          ],
          qualityScore: 82.5,
        },
      };
      mockApi.post.mockResolvedValueOnce(improvementResult);

      // 6. Get改進後的Statistics
      const _finalStats = {
        data: {
          totalRecords: 1000,
          qualityScore: 82.5,
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      };
      mockApi.get.mockResolvedValueOnce(finalStats);

      // 執Row流程
      const _statsResult = await dataQualityService.getCollectionStats();
      const _metricsResult = await dataQualityService.getQualityMetrics();
      const _recommendationsResult =
        await dataQualityService.getRecommendations();
      const _cleaningResult2 = await dataQualityService.performDataCleaning();
      const _improvementResult2 =
        await dataQualityService.performQualityImprovement();
      const _finalResult = await dataQualityService.getCollectionStats();

      // Verify結果
      expect(statsResult.data.totalRecords).toBe(1000);
      expect(statsResult.data.accuracy * 100).toBeCloseTo(92);
      expect(metricsResult.data).toBeDefined();
      expect(recommendationsResult.data).toHaveLength(3);
      expect(cleaningResult2.data.cleanedRecords).toBe(50);
      expect(improvementResult2.data.improvedRecords).toBe(100);
      expect(finalResult.data.totalRecords).toBe(1000);

      // VerifyService調用Success
      expect(statsResult.success).toBe(true);
      expect(metricsResult.success).toBe(true);
      expect(recommendationsResult.success).toBe(true);
      expect(cleaningResult2.success).toBe(true);
      expect(improvementResult2.success).toBe(true);
      expect(finalResult.success).toBe(true);
    });
  });

  describe('標註任務管理流程', () => {
    it('應該完成標註任務的完整生命週期', async () => {
      // 直接調用Service，不需要mock API

      // 執Row流程
      const _annotatorsResult = await dataQualityService.getAnnotatorDetails();

      const _assignmentResult2 = await dataQualityService.assignAnnotationTasks({
        annotatorId: 1,
        taskCount: 2,
      });
      const _submissionResult2 = await dataQualityService.submitAnnotation(
        1,
        { label: 'card', confidence: 0.95 },
        0.95
      );
      const _reviewResult2 = await dataQualityService.reviewAnnotation(
        1,
        'approved',
        'Good quality'
      );
      const _statsResult2 = await dataQualityService.getAnnotationStats();

      // Verify結果
      expect(annotatorsResult.annotators).toHaveLength(2);
      expect(assignmentResult2.data.tasks).toHaveLength(2);
      expect(submissionResult2.status).toBe('submitted');
      expect(reviewResult2.reviewStatus).toBe('approved');
      expect(statsResult2.data.totalAnnotators).toBe(2);

      // VerifyService調用Success
      expect(annotatorsResult.success).toBe(true);
      expect(assignmentResult2.success).toBe(true);
      expect(submissionResult2.success).toBe(true);
      expect(reviewResult2.success).toBe(true);
      expect(statsResult2.success).toBe(true);
    });
  });

  describe('數據監控和警報流程', () => {
    it('應該設置監控和警報系統', async () => {
      // 1. SettingsAlert
      const _alertConfig = {
        data: {
          status: 'configured',
          alertId: 'alert-123',
          settings: {
            qualityThreshold: 80,
            enableNotifications: true,
            alertChannels: ['email', 'push'],
          },
        },
      };
      mockApi.post.mockResolvedValueOnce(alertConfig);

      // 2. Get實時Statistics
      const _realTimeStats = {
        data: {
          currentProcessing: 15,
          queueLength: 25,
          systemStatus: 'normal',
          lastUpdate: '2024-01-01T00:00:00Z',
        },
      };
      mockApi.get.mockResolvedValueOnce(realTimeStats);

      // 3. Get實時Alert
      const _realTimeAlerts = {
        data: [
          {
            id: 1,
            type: 'quality_threshold_exceeded',
            message: 'Quality score dropped below threshold',
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
      };
      mockApi.get.mockResolvedValueOnce(realTimeAlerts);

      // 執Row流程
      const _alertConfigResult = await dataQualityService.setCollectionAlerts({
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push'],
      });
      const _realTimeStatsResult = await dataQualityService.getRealTimeStats();
      const _realTimeAlertsResult = await dataQualityService.getRealTimeAlerts();

      // Verify結果
      expect(alertConfigResult.status).toBe('configured');
      expect(realTimeStatsResult.systemStatus).toBe('normal');
      expect(realTimeAlertsResult).toHaveLength(1);
      expect(realTimeAlertsResult[0].type).toBe('quality_threshold_exceeded');

      // Verify API 調用
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/alerts', {
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push'],
      });
      expect(mockApi.get).toHaveBeenCalledWith(
        '/data-quality/collect/stats/realtime'
      );
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/alerts');
    });
  });

  describe('報告生成流程', () => {
    it('應該生成完整的數據質量報告', async () => {
      // 1. Get質量Report
      const _qualityReport = {
        data: {
          period: { startDate: '2024-01-01', endDate: '2024-01-31' },
          overallScore: 82.5,
          metrics: {
            completeness: 0.95,
            accuracy: 0.88,
            consistency: 0.92,
          },
        },
      };
      mockApi.get.mockResolvedValueOnce(qualityReport);

      // 2. Get來源Analysis
      const _sourceBreakdown = {
        data: {
          sources: [
            { source: 'manual_upload', count: 500, percentage: 50 },
            { source: 'api_import', count: 300, percentage: 30 },
            { source: 'batch_processing', count: 200, percentage: 20 },
          ],
        },
      };
      mockApi.get.mockResolvedValueOnce(sourceBreakdown);

      // 3. ExportReport
      const _exportResult = new Blob(['report data'], {
        type: 'application/pdf',
      });
      mockApi.get.mockResolvedValueOnce({ data: exportResult });

      // 執Row流程
      const _reportResult = await dataQualityService.getQualityReport(
        '2024-01-01',
        '2024-01-31'
      );
      const _breakdownResult = await dataQualityService.getSourceBreakdown(
        '2024-01-01',
        '2024-01-31'
      );
      const _exportResult2 = await dataQualityService.exportStatsReport({
        format: 'pdf',
      });

      // Verify結果
      expect(reportResult.overallScore).toBe(82.5);
      expect(breakdownResult.sources).toHaveLength(3);
      expect(exportResult2).toBeInstanceOf(Blob);

      // Verify API 調用
      expect(mockApi.get).toHaveBeenCalledWith(
        '/data-quality/quality-report?startDate=2024-01-01&endDate=2024-01-31'
      );
      expect(mockApi.get).toHaveBeenCalledWith(
        '/data-quality/source-breakdown?startDate=2024-01-01&endDate=2024-01-31'
      );
      expect(mockApi.get).toHaveBeenCalledWith(
        '/data-quality/collect/stats/export?',
        {
          responseType: 'blob',
        }
      );
    });
  });

  describe('性能測試', () => {
    it('應該在合理時間內處理大量數據', async () => {
      const _startTime = Date.now();

      // 模擬大量DataHandle
      const _largeDatasetResult = {
        data: {
          totalRecords: 100000,
          qualityScore: 85.5,
          processingTime: 3.2,
        },
      };
      mockApi.get.mockResolvedValue(largeDatasetResult);

      const _result = await dataQualityService.getCollectionStats({
        largeDataset: true,
      });
      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(result.totalRecords).toBe(100000);
      expect(duration).toBeLessThan(5000); // 應該在5Second內Complete
    });

    it('應該並行處理多個請求', async () => {
      const _mockResponse = {
        data: {
          status: 'success',
          message: 'API call successful',
        },
      };
      mockApi.get.mockResolvedValue(mockResponse);
      mockApi.post.mockResolvedValue(mockResponse);

      // Parallel執RowMultipleRequest
      const _promises = [
        dataQualityService.getCollectionStats(),
        dataQualityService.getQualityMetrics(),
        dataQualityService.getRecommendations(),
        dataQualityService.getRealTimeStats(),
      ];

      const _results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
