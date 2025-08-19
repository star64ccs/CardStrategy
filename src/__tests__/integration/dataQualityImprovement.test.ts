import { dataQualityService } from '../../services/dataQualityService';
import { api } from '../../config/api';

// Mock API
jest.mock('../../config/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('數據質量改進集成測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('完整數據質量改進流程', () => {
    it('應該執行完整的數據質量改進流程', async () => {
      // 1. 獲取初始統計
      const initialStats = {
        data: {
          totalRecords: 1000,
          qualityScore: 75.0,
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };
      mockApi.get.mockResolvedValueOnce(initialStats);

      // 2. 獲取質量指標
      const qualityMetrics = {
        data: [
          {
            metric: 'accuracy',
            value: 0.785,
            threshold: 0.8,
            status: 'warning'
          },
          {
            metric: 'completeness',
            value: 0.72,
            threshold: 0.75,
            status: 'warning'
          }
        ]
      };
      mockApi.get.mockResolvedValueOnce(qualityMetrics);

      // 3. 獲取改進建議
      const recommendations = {
        data: {
          recommendations: [
            {
              id: 1,
              type: 'algorithm_tuning',
              priority: 'high',
              description: 'Optimize annotation algorithm',
              estimatedImpact: 8.5
            },
            {
              id: 2,
              type: 'data_validation',
              priority: 'medium',
              description: 'Improve data validation rules',
              estimatedImpact: 5.2
            }
          ],
          totalRecommendations: 2
        }
      };
      mockApi.get.mockResolvedValueOnce(recommendations);

      // 4. 執行數據清理
      const cleaningResult = {
        data: {
          status: 'completed',
          cleanedRecords: 150,
          removedDuplicates: 25,
          fixedFormatting: 75,
          qualityImprovement: 0.15
        }
      };
      mockApi.post.mockResolvedValueOnce(cleaningResult);

      // 5. 執行質量改進
      const improvementResult = {
        data: {
          status: 'completed',
          improvements: [
            { type: 'duplicate_removal', count: 25 },
            { type: 'format_standardization', count: 50 }
          ],
          qualityScore: 82.5
        }
      };
      mockApi.post.mockResolvedValueOnce(improvementResult);

      // 6. 獲取改進後的統計
      const finalStats = {
        data: {
          totalRecords: 1000,
          qualityScore: 82.5,
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };
      mockApi.get.mockResolvedValueOnce(finalStats);

      // 執行流程
      const statsResult = await dataQualityService.getCollectionStats();
      const metricsResult = await dataQualityService.getQualityMetrics();
      const recommendationsResult = await dataQualityService.getRecommendations();
      const cleaningResult2 = await dataQualityService.performDataCleaning();
      const improvementResult2 = await dataQualityService.performQualityImprovement();
      const finalResult = await dataQualityService.getCollectionStats();

      // 驗證結果
      expect(statsResult.totalRecords).toBe(1000);
      expect(statsResult.qualityScore).toBe(75.0);
      expect(metricsResult).toHaveLength(2);
      expect(recommendationsResult.recommendations).toHaveLength(2);
      expect(cleaningResult2.status).toBe('completed');
      expect(improvementResult2.status).toBe('completed');
      expect(finalResult.qualityScore).toBe(82.5);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats?');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-metrics?limit=10');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/recommendations');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/clean');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/improve');
    });
  });

  describe('標註任務管理流程', () => {
    it('應該完成標註任務的完整生命週期', async () => {
      // 1. 獲取註釋者詳情
      const annotators = {
        data: {
          annotators: [
            { id: 1, name: 'Annotator 1', level: 'expert', accuracy: 0.95 },
            { id: 2, name: 'Annotator 2', level: 'intermediate', accuracy: 0.85 }
          ]
        }
      };
      mockApi.get.mockResolvedValueOnce(annotators);

      // 2. 分配任務
      const assignmentResult = {
        data: {
          tasks: [
            { id: 1, type: 'image_annotation', priority: 'high' },
            { id: 2, type: 'text_validation', priority: 'medium' }
          ],
          totalAssigned: 2
        }
      };
      mockApi.post.mockResolvedValueOnce(assignmentResult);

      // 3. 提交標註
      const submissionResult = {
        data: {
          annotationId: 1,
          status: 'submitted',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };
      mockApi.post.mockResolvedValueOnce(submissionResult);

      // 4. 審核標註
      const reviewResult = {
        data: {
          annotationId: 1,
          reviewStatus: 'approved',
          reviewNotes: 'Good quality',
          reviewedBy: 'reviewer-1',
          reviewedAt: '2024-01-01T00:00:00Z'
        }
      };
      mockApi.post.mockResolvedValueOnce(reviewResult);

      // 5. 獲取統計
      const statsResult = {
        data: {
          totalAnnotators: 2,
          totalAnnotations: 1,
          averageAccuracy: 0.9,
          averageProcessingTime: 2.5
        }
      };
      mockApi.get.mockResolvedValueOnce(statsResult);

      // 執行流程
      const annotatorsResult = await dataQualityService.getAnnotatorDetails();
      const assignmentResult2 = await dataQualityService.assignAnnotationTasks({ annotatorId: 1, taskCount: 2 });
      const submissionResult2 = await dataQualityService.submitAnnotation(1, { label: 'card', confidence: 0.95 }, 0.95);
      const reviewResult2 = await dataQualityService.reviewAnnotation(1, 'approved', 'Good quality');
      const statsResult2 = await dataQualityService.getAnnotationStats();

      // 驗證結果
      expect(annotatorsResult.annotators).toHaveLength(2);
      expect(assignmentResult2.tasks).toHaveLength(2);
      expect(submissionResult2.status).toBe('submitted');
      expect(reviewResult2.reviewStatus).toBe('approved');
      expect(statsResult2.totalAnnotators).toBe(2);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/annotators?');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/assign', { annotatorId: 1, taskCount: 2 });
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/submit', {
        annotationId: 1,
        annotationResult: { label: 'card', confidence: 0.95 },
        confidence: 0.95
      });
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/review', {
        annotationId: 1,
        reviewStatus: 'approved',
        reviewNotes: 'Good quality'
      });
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/stats');
    });
  });

  describe('數據監控和警報流程', () => {
    it('應該設置監控和警報系統', async () => {
      // 1. 設置警報
      const alertConfig = {
        data: {
          status: 'configured',
          alertId: 'alert-123',
          settings: {
            qualityThreshold: 80,
            enableNotifications: true,
            alertChannels: ['email', 'push']
          }
        }
      };
      mockApi.post.mockResolvedValueOnce(alertConfig);

      // 2. 獲取實時統計
      const realTimeStats = {
        data: {
          currentProcessing: 15,
          queueLength: 25,
          systemStatus: 'normal',
          lastUpdate: '2024-01-01T00:00:00Z'
        }
      };
      mockApi.get.mockResolvedValueOnce(realTimeStats);

      // 3. 獲取實時警報
      const realTimeAlerts = {
        data: [
          {
            id: 1,
            type: 'quality_threshold_exceeded',
            message: 'Quality score dropped below threshold',
            timestamp: '2024-01-01T00:00:00Z'
          }
        ]
      };
      mockApi.get.mockResolvedValueOnce(realTimeAlerts);

      // 執行流程
      const alertConfigResult = await dataQualityService.setCollectionAlerts({
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push']
      });
      const realTimeStatsResult = await dataQualityService.getRealTimeStats();
      const realTimeAlertsResult = await dataQualityService.getRealTimeAlerts();

      // 驗證結果
      expect(alertConfigResult.status).toBe('configured');
      expect(realTimeStatsResult.systemStatus).toBe('normal');
      expect(realTimeAlertsResult).toHaveLength(1);
      expect(realTimeAlertsResult[0].type).toBe('quality_threshold_exceeded');

      // 驗證 API 調用
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/alerts', {
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push']
      });
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats/realtime');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/alerts');
    });
  });

  describe('報告生成流程', () => {
    it('應該生成完整的數據質量報告', async () => {
      // 1. 獲取質量報告
      const qualityReport = {
        data: {
          period: { startDate: '2024-01-01', endDate: '2024-01-31' },
          overallScore: 82.5,
          metrics: {
            completeness: 0.95,
            accuracy: 0.88,
            consistency: 0.92
          }
        }
      };
      mockApi.get.mockResolvedValueOnce(qualityReport);

      // 2. 獲取來源分析
      const sourceBreakdown = {
        data: {
          sources: [
            { source: 'manual_upload', count: 500, percentage: 50 },
            { source: 'api_import', count: 300, percentage: 30 },
            { source: 'batch_processing', count: 200, percentage: 20 }
          ]
        }
      };
      mockApi.get.mockResolvedValueOnce(sourceBreakdown);

      // 3. 導出報告
      const exportResult = new Blob(['report data'], { type: 'application/pdf' });
      mockApi.get.mockResolvedValueOnce({ data: exportResult });

      // 執行流程
      const reportResult = await dataQualityService.getQualityReport('2024-01-01', '2024-01-31');
      const breakdownResult = await dataQualityService.getSourceBreakdown('2024-01-01', '2024-01-31');
      const exportResult2 = await dataQualityService.exportStatsReport({ format: 'pdf' });

      // 驗證結果
      expect(reportResult.overallScore).toBe(82.5);
      expect(breakdownResult.sources).toHaveLength(3);
      expect(exportResult2).toBeInstanceOf(Blob);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-report?startDate=2024-01-01&endDate=2024-01-31');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/source-breakdown?startDate=2024-01-01&endDate=2024-01-31');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats/export?', {
        responseType: 'blob'
      });
    });
  });

  describe('性能測試', () => {
    it('應該在合理時間內處理大量數據', async () => {
      const startTime = Date.now();

      // 模擬大量數據處理
      const largeDatasetResult = {
        data: {
          totalRecords: 100000,
          qualityScore: 85.5,
          processingTime: 3.2
        }
      };
      mockApi.get.mockResolvedValue(largeDatasetResult);

      const result = await dataQualityService.getCollectionStats();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.totalRecords).toBe(100000);
      expect(duration).toBeLessThan(5000); // 應該在5秒內完成
    });

    it('應該並行處理多個請求', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'API call successful'
        }
      };
      mockApi.get.mockResolvedValue(mockResponse);
      mockApi.post.mockResolvedValue(mockResponse);

      // 並行執行多個請求
      const promises = [
        dataQualityService.getCollectionStats(),
        dataQualityService.getQualityMetrics(),
        dataQualityService.getRecommendations(),
        dataQualityService.getRealTimeStats()
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
