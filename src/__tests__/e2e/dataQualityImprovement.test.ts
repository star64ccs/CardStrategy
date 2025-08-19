import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: {
      dataQuality: (state = {}, action: any) => state,
      auth: (state = { isAuthenticated: true }, action: any) => state
    }
  });
};

describe('數據質量改進端到端測試', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('數據質量儀表板流程', () => {
    it('應該顯示數據質量儀表板並執行改進操作', async () => {
      // Mock API responses
      const dashboardData = {
        data: {
          overview: {
            totalRecords: 10000,
            qualityScore: 78.5,
            activeAnnotators: 12
          },
          trends: [
            { date: '2024-01-01', score: 75.0 },
            { date: '2024-01-07', score: 78.5 }
          ],
          alerts: [
            { id: 1, type: 'quality_drop', severity: 'medium' }
          ]
        }
      };

      const qualityMetrics = {
        data: [
          {
            metric: 'accuracy',
            value: 0.825,
            threshold: 0.8,
            status: 'good'
          },
          {
            metric: 'completeness',
            value: 0.75,
            threshold: 0.8,
            status: 'warning'
          }
        ]
      };

      const recommendations = {
        data: {
          recommendations: [
            {
              id: 1,
              type: 'algorithm_tuning',
              priority: 'high',
              description: 'Optimize annotation algorithm',
              estimatedImpact: 8.5
            }
          ],
          totalRecommendations: 1
        }
      };

      mockApi.get
        .mockResolvedValueOnce(dashboardData)
        .mockResolvedValueOnce(qualityMetrics)
        .mockResolvedValueOnce(recommendations);

      // 模擬用戶訪問儀表板
      const result = await dataQualityService.getDashboardData();
      const metricsResult = await dataQualityService.getQualityMetrics();
      const recommendationsResult = await dataQualityService.getRecommendations();

      // 驗證儀表板數據
      expect(result.overview.qualityScore).toBe(78.5);
      expect(result.alerts).toHaveLength(1);
      expect(metricsResult).toHaveLength(2);
      expect(recommendationsResult.recommendations).toHaveLength(1);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/dashboard?');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-metrics?limit=10');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/recommendations');
    });
  });

  describe('註釋任務管理流程', () => {
    it('應該完成註釋任務的完整生命週期', async () => {
      // Mock API responses
      const annotators = {
        data: {
          annotators: [
            { id: 1, name: 'Annotator 1', level: 'expert', accuracy: 0.95 },
            { id: 2, name: 'Annotator 2', level: 'intermediate', accuracy: 0.85 }
          ]
        }
      };

      const assignmentResult = {
        data: {
          tasks: [
            { id: 1, type: 'image_annotation', priority: 'high' },
            { id: 2, type: 'text_validation', priority: 'medium' }
          ],
          totalAssigned: 2
        }
      };

      const submissionResult = {
        data: {
          annotationId: 1,
          status: 'submitted',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      const reviewResult = {
        data: {
          annotationId: 1,
          reviewStatus: 'approved',
          reviewNotes: 'Good quality',
          reviewedBy: 'reviewer-1',
          reviewedAt: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.get
        .mockResolvedValueOnce(annotators)
        .mockResolvedValueOnce(submissionResult)
        .mockResolvedValueOnce(reviewResult);
      mockApi.post
        .mockResolvedValueOnce(assignmentResult)
        .mockResolvedValueOnce(submissionResult)
        .mockResolvedValueOnce(reviewResult);

      // 執行完整流程
      const annotatorsResult = await dataQualityService.getAnnotatorDetails();
      const assignmentResult2 = await dataQualityService.assignAnnotationTasks({ annotatorId: 1, taskCount: 2 });
      const submissionResult2 = await dataQualityService.submitAnnotation(1, { label: 'card', confidence: 0.95 }, 0.95);
      const reviewResult2 = await dataQualityService.reviewAnnotation(1, 'approved', 'Good quality');

      // 驗證結果
      expect(annotatorsResult.annotators).toHaveLength(2);
      expect(assignmentResult2.tasks).toHaveLength(2);
      expect(submissionResult2.status).toBe('submitted');
      expect(reviewResult2.reviewStatus).toBe('approved');

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
    });
  });

  describe('數據清理和改進流程', () => {
    it('應該執行數據清理和質量改進操作', async () => {
      // Mock API responses
      const initialResult = {
        data: {
          totalRecords: 1000,
          qualityScore: 75.0,
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };

      const cleaningResult = {
        data: {
          status: 'completed',
          cleanedRecords: 150,
          removedDuplicates: 25,
          fixedFormatting: 75,
          qualityImprovement: 0.15
        }
      };

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

      const finalResult = {
        data: {
          totalRecords: 1000,
          qualityScore: 82.5,
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.get
        .mockResolvedValueOnce(initialResult)
        .mockResolvedValueOnce(finalResult);
      mockApi.post
        .mockResolvedValueOnce(cleaningResult)
        .mockResolvedValueOnce(improvementResult);

      // 執行流程
      const initialResult2 = await dataQualityService.getCollectionStats();
      const cleaningResult2 = await dataQualityService.performDataCleaning();
      const improvementResult2 = await dataQualityService.performQualityImprovement();
      const finalResult2 = await dataQualityService.getCollectionStats();

      // 驗證改進效果
      expect(initialResult2.qualityScore).toBe(75.0);
      expect(cleaningResult2.status).toBe('completed');
      expect(improvementResult2.status).toBe('completed');
      expect(finalResult2.qualityScore).toBe(82.5);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats?');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/clean');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/improve');
    });
  });

  describe('警報和監控流程', () => {
    it('應該設置警報並監控數據質量', async () => {
      // Mock API responses
      const configResult = {
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

      const realTimeStats = {
        data: {
          currentProcessing: 15,
          queueLength: 25,
          systemStatus: 'warning',
          lastUpdate: '2024-01-01T00:00:00Z'
        }
      };

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

      mockApi.post.mockResolvedValueOnce(configResult);
      mockApi.get
        .mockResolvedValueOnce(realTimeStats)
        .mockResolvedValueOnce(realTimeAlerts);

      // 執行流程
      const configResult2 = await dataQualityService.setCollectionAlerts({
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push']
      });
      const realTimeStatsResult = await dataQualityService.getRealTimeStats();
      const realTimeAlertsResult = await dataQualityService.getRealTimeAlerts();

      // 驗證監控功能
      expect(configResult2.status).toBe('configured');
      expect(realTimeStatsResult.systemStatus).toBe('warning');
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

  describe('報告生成和導出流程', () => {
    it('應該生成和導出數據質量報告', async () => {
      // Mock API responses
      const reportResult = {
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

      const breakdownResult = {
        data: {
          sources: [
            { source: 'manual_upload', count: 500, percentage: 50 },
            { source: 'api_import', count: 300, percentage: 30 }
          ]
        }
      };

      const exportResult = new Blob(['report data'], { type: 'application/pdf' });

      mockApi.get
        .mockResolvedValueOnce(reportResult)
        .mockResolvedValueOnce(breakdownResult)
        .mockResolvedValueOnce({ data: exportResult });

      // 執行流程
      const reportResult2 = await dataQualityService.getQualityReport('2024-01-01', '2024-01-31');
      const breakdownResult2 = await dataQualityService.getSourceBreakdown('2024-01-01', '2024-01-31');
      const exportResult2 = await dataQualityService.exportStatsReport({ format: 'pdf' });

      // 驗證報告功能
      expect(reportResult2.overallScore).toBe(82.5);
      expect(breakdownResult2.sources).toHaveLength(2);
      expect(exportResult2).toBeInstanceOf(Blob);

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-report?startDate=2024-01-01&endDate=2024-01-31');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/source-breakdown?startDate=2024-01-01&endDate=2024-01-31');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats/export?', {
        responseType: 'blob'
      });
    });
  });

  describe('錯誤處理和恢復流程', () => {
    it('應該處理錯誤並提供恢復機制', async () => {
      // 模擬第一次調用失敗，第二次成功
      const error = new Error('Network Error');
      const successResponse = {
        data: {
          totalRecords: 1000,
          qualityScore: 85.5
        }
      };

      mockApi.get.mockRejectedValueOnce(error);
      mockApi.get.mockResolvedValueOnce(successResponse);

      // 第一次調用應該失敗
      await expect(dataQualityService.getCollectionStats()).rejects.toThrow('Network Error');

      // 第二次調用應該成功（模擬重試）
      const result = await dataQualityService.getCollectionStats();
      expect(result.qualityScore).toBe(85.5);
    });

    it('應該處理部分失敗的批量操作', async () => {
      const reviews = [
        { annotationId: 1, reviewStatus: 'approved' },
        { annotationId: 2, reviewStatus: 'rejected' }
      ];

      const partialSuccessResponse = {
        data: {
          processed: 1,
          approved: 1,
          rejected: 0,
          errors: [
            { annotationId: 2, error: 'Annotation not found' }
          ]
        }
      };

      mockApi.post.mockResolvedValueOnce(partialSuccessResponse);

      const result = await dataQualityService.batchReviewAnnotations(reviews);

      expect(result.processed).toBe(1);
      expect(result.errors).toHaveLength(1);

      // 驗證 API 調用
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/batch-review', {
        reviews
      });
    });
  });

  describe('性能測試', () => {
    it('應該在合理時間內處理大量數據', async () => {
      const startTime = Date.now();

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

  describe('用戶交互流程', () => {
    it('應該模擬用戶的數據質量改進操作流程', async () => {
      // Mock API responses
      const dashboardResult = {
        data: {
          overview: {
            totalRecords: 10000,
            qualityScore: 78.5,
            activeAnnotators: 12
          },
          alerts: [
            { id: 1, type: 'quality_drop', severity: 'medium' }
          ]
        }
      };

      const recommendationsResult = {
        data: {
          recommendations: [
            {
              id: 1,
              type: 'algorithm_tuning',
              priority: 'high',
              description: 'Optimize annotation algorithm',
              estimatedImpact: 8.5
            }
          ],
          totalRecommendations: 1
        }
      };

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

      mockApi.get
        .mockResolvedValueOnce(dashboardResult)
        .mockResolvedValueOnce(recommendationsResult);
      mockApi.post.mockResolvedValueOnce(improvementResult);

      // 模擬用戶操作流程
      const dashboardResult2 = await dataQualityService.getDashboardData();
      const recommendationsResult2 = await dataQualityService.getRecommendations();
      const improvementResult2 = await dataQualityService.performQualityImprovement();

      // 驗證用戶操作結果
      expect(dashboardResult2.overview.qualityScore).toBe(78.5);
      expect(dashboardResult2.alerts).toHaveLength(1);
      expect(recommendationsResult2.recommendations).toHaveLength(1);
      expect(improvementResult2.status).toBe('completed');

      // 驗證 API 調用
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/dashboard?');
      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/recommendations');
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/improve');
    });
  });
});
