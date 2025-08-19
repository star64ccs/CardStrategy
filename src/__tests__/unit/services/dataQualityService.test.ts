import { dataQualityService } from '../../../services/dataQualityService';
import { api } from '../../../config/api';

// Mock API
jest.mock('../../../config/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('DataQualityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollectionStats', () => {
    it('應該成功獲取數據收集統計', async () => {
      const mockResponse = {
        data: {
          totalRecords: 1000,
          qualityScore: 85.5,
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getCollectionStats();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats?');
      expect(result).toEqual(mockResponse.data);
    });

    it('應該使用自定義選項獲取統計', async () => {
      const options = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const mockResponse = { data: { totalRecords: 500 } };

      mockApi.get.mockResolvedValue(mockResponse);

      await dataQualityService.getCollectionStats(options);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats?startDate=2024-01-01&endDate=2024-01-31');
    });
  });

  describe('startDataCollection', () => {
    it('應該成功啟動數據收集', async () => {
      const mockResponse = {
        data: {
          status: 'started',
          collectionId: 'coll-123',
          estimatedDuration: 300
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.startDataCollection();

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/collect');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('assignAnnotationTasks', () => {
    it('應該成功分配註釋任務', async () => {
      const options = { annotatorId: 1, taskCount: 10 };
      const mockResponse = {
        data: {
          tasks: [
            { id: 1, type: 'image_annotation', priority: 'high' },
            { id: 2, type: 'text_validation', priority: 'medium' }
          ],
          totalAssigned: 2
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.assignAnnotationTasks(options);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/assign', options);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('learnFromResults', () => {
    it('應該成功從結果中學習', async () => {
      const request = {
        annotationId: 1,
        learningType: 'pattern_recognition',
        parameters: { threshold: 0.8 }
      };
      const mockResponse = {
        data: {
          learningId: 'learn-123',
          status: 'completed',
          improvements: ['accuracy', 'speed']
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.learnFromResults(request);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/learn', request);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAssignmentConfig', () => {
    it('應該成功獲取分配配置', async () => {
      const mockResponse = {
        data: {
          config: {
            maxTasksPerAnnotator: 50,
            priorityWeight: 0.7,
            skillMatching: true
          },
          algorithm: 'smart_assignment',
          version: '2.1.0',
          features: ['skill_matching', 'load_balancing']
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getAssignmentConfig();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/config');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateAssignmentConfig', () => {
    it('應該成功更新分配配置', async () => {
      const config = { maxTasksPerAnnotator: 75 };
      const mockResponse = {
        data: {
          config,
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await dataQualityService.updateAssignmentConfig(config);

      expect(mockApi.put).toHaveBeenCalledWith('/data-quality/annotate/config', { config });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAnnotatorDetails', () => {
    it('應該成功獲取註釋者詳情', async () => {
      const mockResponse = {
        data: {
          annotators: [
            { id: 1, name: 'Annotator 1', level: 'expert', accuracy: 0.95 },
            { id: 2, name: 'Annotator 2', level: 'intermediate', accuracy: 0.85 }
          ],
          totalCount: 2
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getAnnotatorDetails();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/annotators?');
      expect(result).toEqual(mockResponse.data);
    });

    it('應該包含非活躍註釋者', async () => {
      const mockResponse = {
        data: {
          annotators: [
            { id: 1, name: 'Active Annotator', isActive: true },
            { id: 2, name: 'Inactive Annotator', isActive: false }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await dataQualityService.getAnnotatorDetails(true);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/annotators?includeInactive=true');
    });
  });

  describe('submitAnnotation', () => {
    it('應該成功提交註釋', async () => {
      const annotationId = 1;
      const annotationResult = {
        label: 'card',
        confidence: 0.95,
        boundingBox: { x: 10, y: 20, width: 100, height: 50 }
      };
      const confidence = 0.95;

      const mockResponse = {
        data: {
          annotationId,
          status: 'submitted',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.submitAnnotation(annotationId, annotationResult, confidence);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/submit', {
        annotationId,
        annotationResult,
        confidence
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('reviewAnnotation', () => {
    it('應該成功審查註釋', async () => {
      const annotationId = 1;
      const reviewStatus = 'approved';
      const reviewNotes = 'Good quality annotation';

      const mockResponse = {
        data: {
          annotationId,
          reviewStatus,
          reviewNotes,
          reviewedBy: 'reviewer-1',
          reviewedAt: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.reviewAnnotation(annotationId, reviewStatus, reviewNotes);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/review', {
        annotationId,
        reviewStatus,
        reviewNotes
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('batchReviewAnnotations', () => {
    it('應該成功批量審查註釋', async () => {
      const reviews = [
        { annotationId: 1, reviewStatus: 'approved', reviewNotes: 'Good' },
        { annotationId: 2, reviewStatus: 'rejected', reviewNotes: 'Poor quality' }
      ];

      const mockResponse = {
        data: {
          processed: 2,
          approved: 1,
          rejected: 1,
          errors: []
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.batchReviewAnnotations(reviews);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/batch-review', {
        reviews
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAnnotationStats', () => {
    it('應該成功獲取註釋統計', async () => {
      const mockResponse = {
        data: {
          totalAnnotators: 10,
          totalAnnotations: 1000,
          averageAccuracy: 0.92,
          averageProcessingTime: 2.5
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getAnnotationStats();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotate/stats');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('performDataCleaning', () => {
    it('應該成功執行數據清理', async () => {
      const mockResponse = {
        data: {
          status: 'completed',
          cleanedRecords: 150,
          removedDuplicates: 25,
          fixedFormatting: 50,
          qualityImprovement: 0.15
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.performDataCleaning();

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/clean');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getQualityMetrics', () => {
    it('應該成功獲取質量指標', async () => {
      const mockResponse = {
        data: [
          {
            metric: 'completeness',
            value: 0.95,
            threshold: 0.9,
            status: 'good'
          },
          {
            metric: 'accuracy',
            value: 0.88,
            threshold: 0.85,
            status: 'good'
          }
        ]
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getQualityMetrics();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-metrics?limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('應該使用自定義參數獲取指標', async () => {
      const dataType = 'image_annotation';
      const limit = 20;
      const mockResponse = { data: [{ metric: 'accuracy', value: 0.9 }] };

      mockApi.get.mockResolvedValue(mockResponse);

      await dataQualityService.getQualityMetrics(dataType, limit);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-metrics?dataType=image_annotation&limit=20');
    });
  });

  describe('getQualityReport', () => {
    it('應該成功獲取質量報告', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = {
        data: {
          period: { startDate, endDate },
          overallScore: 87.5,
          metrics: {
            completeness: 0.95,
            accuracy: 0.88,
            consistency: 0.92
          }
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getQualityReport(startDate, endDate);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-report?startDate=2024-01-01&endDate=2024-01-31');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('performQualityImprovement', () => {
    it('應該成功執行質量改進', async () => {
      const mockResponse = {
        data: {
          status: 'completed',
          improvements: [
            { type: 'duplicate_removal', count: 25 },
            { type: 'format_standardization', count: 50 }
          ],
          qualityScore: 92.5
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.performQualityImprovement();

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/improve');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getRecommendations', () => {
    it('應該成功獲取改進建議', async () => {
      const mockResponse = {
        data: {
          recommendations: [
            {
              id: 1,
              type: 'algorithm_tuning',
              priority: 'high',
              description: 'Optimize annotation algorithm for better accuracy',
              estimatedImpact: 8.5
            }
          ],
          totalRecommendations: 1
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getRecommendations();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/recommendations');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportStatsReport', () => {
    it('應該成功導出統計報告', async () => {
      const options = { format: 'pdf', includeCharts: true };
      const mockBlob = new Blob(['report data'], { type: 'application/pdf' });
      const mockResponse = { data: mockBlob };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.exportStatsReport(options);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats/export?', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('getRealTimeStats', () => {
    it('應該成功獲取實時統計', async () => {
      const mockResponse = {
        data: {
          currentProcessing: 15,
          queueLength: 25,
          systemStatus: 'normal',
          lastUpdate: '2024-01-01T00:00:00Z'
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getRealTimeStats();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/collect/stats/realtime');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('setCollectionAlerts', () => {
    it('應該成功設置收集警報', async () => {
      const alerts = {
        qualityThreshold: 80,
        enableNotifications: true,
        alertChannels: ['email', 'push']
      };

      const mockResponse = {
        data: {
          status: 'configured',
          alertId: 'alert-123',
          settings: alerts
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await dataQualityService.setCollectionAlerts(alerts);

      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/alerts', alerts);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCollectionAlerts', () => {
    it('應該成功獲取收集警報', async () => {
      const mockResponse = {
        data: {
          alerts: [
            {
              id: 1,
              type: 'quality_threshold',
              threshold: 80,
              isActive: true
            }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getCollectionAlerts();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/alerts');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getDashboardData', () => {
    it('應該成功獲取儀表板數據', async () => {
      const options = { timeRange: '7d', includeTrends: true };
      const mockResponse = {
        data: {
          overview: {
            qualityScore: 85.5,
            totalRecords: 10000,
            activeAnnotators: 15
          },
          trends: [
            { date: '2024-01-01', score: 84.2 },
            { date: '2024-01-02', score: 85.1 }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getDashboardData(options);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/dashboard?');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getRealTimeAlerts', () => {
    it('應該成功獲取實時警報', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            type: 'quality_threshold_exceeded',
            message: 'Quality score dropped below threshold',
            timestamp: '2024-01-01T00:00:00Z'
          }
        ]
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getRealTimeAlerts();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/alerts');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOverallMetrics', () => {
    it('應該成功獲取整體指標', async () => {
      const options = { timeRange: '30d' };
      const mockResponse = {
        data: {
          overallScore: 87.5,
          completeness: 0.95,
          accuracy: 0.88,
          consistency: 0.92,
          timeliness: 0.85
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getOverallMetrics(options);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/overall-metrics?');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getTrendData', () => {
    it('應該成功獲取趨勢數據', async () => {
      const options = { metric: 'quality_score', period: '7d' };
      const mockResponse = {
        data: {
          metric: 'quality_score',
          period: '7d',
          dataPoints: [
            { date: '2024-01-01', value: 84.2 },
            { date: '2024-01-02', value: 85.1 }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getTrendData(options);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/trends?');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getSourceBreakdown', () => {
    it('應該成功獲取來源分析', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = {
        data: {
          sources: [
            { source: 'manual_upload', count: 500, percentage: 50 },
            { source: 'api_import', count: 300, percentage: 30 },
            { source: 'batch_processing', count: 200, percentage: 20 }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getSourceBreakdown(startDate, endDate);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/source-breakdown?startDate=2024-01-01&endDate=2024-01-31');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getQualityDistribution', () => {
    it('應該成功獲取質量分佈', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = {
        data: {
          distribution: [
            { quality: 'excellent', count: 400, percentage: 40 },
            { quality: 'good', count: 350, percentage: 35 },
            { quality: 'fair', count: 200, percentage: 20 },
            { quality: 'poor', count: 50, percentage: 5 }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getQualityDistribution(startDate, endDate);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/quality-distribution?startDate=2024-01-01&endDate=2024-01-31');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAnnotatorPerformance', () => {
    it('應該成功獲取註釋者表現', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = {
        data: {
          annotators: [
            {
              id: 1,
              name: 'Annotator 1',
              accuracy: 0.95,
              speed: 2.5,
              totalAnnotations: 150
            },
            {
              id: 2,
              name: 'Annotator 2',
              accuracy: 0.88,
              speed: 3.2,
              totalAnnotations: 120
            }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getAnnotatorPerformance(startDate, endDate);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/annotator-performance?startDate=2024-01-01&endDate=2024-01-31');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getRecentIssues', () => {
    it('應該成功獲取最近問題', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = {
        data: {
          issues: [
            {
              id: 1,
              type: 'quality_threshold',
              severity: 'medium',
              description: 'Quality score dropped below threshold',
              timestamp: '2024-01-01T00:00:00Z'
            }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getRecentIssues(startDate, endDate);

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/recent-issues?startDate=2024-01-01&endDate=2024-01-31');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getImprovementSuggestions', () => {
    it('應該成功獲取改進建議', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            {
              id: 1,
              category: 'process_optimization',
              title: 'Optimize annotation workflow',
              description: 'Streamline the annotation process for better efficiency',
              priority: 'high',
              estimatedImpact: 15
            }
          ]
        }
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await dataQualityService.getImprovementSuggestions();

      expect(mockApi.get).toHaveBeenCalledWith('/data-quality/improvement-suggestions');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理API錯誤', async () => {
      const error = new Error('API Error');
      mockApi.get.mockRejectedValue(error);

      await expect(dataQualityService.getCollectionStats()).rejects.toThrow('API Error');
    });

    it('應該處理網絡錯誤', async () => {
      const error = new Error('Network Error');
      mockApi.get.mockRejectedValue(error);

      await expect(dataQualityService.getCollectionStats()).rejects.toThrow('Network Error');
    });
  });

  describe('參數驗證', () => {
    it('應該驗證必要參數', async () => {
      const mockResponse = {
        data: {
          annotationId: 1,
          status: 'submitted'
        }
      };

      mockApi.post.mockResolvedValue(mockResponse);

      // 測試空參數
      await dataQualityService.submitAnnotation(1, {}, 0.5);
      expect(mockApi.post).toHaveBeenCalledWith('/data-quality/annotate/submit', {
        annotationId: 1,
        annotationResult: {},
        confidence: 0.5
      });
    });
  });
});
