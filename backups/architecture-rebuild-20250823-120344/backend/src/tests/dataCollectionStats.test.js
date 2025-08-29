const request = require('supertest');
const app = require('../app');
const { getTrainingDataModel } = require('../models/TrainingData');
const { getDataQualityMetricsModel } = require('../models/DataQualityMetrics');

describe('Data Collection Statistics API', () => {
  let authToken;
  let TrainingData;
  let DataQualityMetrics;

  beforeAll(async () => {
    // 初始化模型
    TrainingData = getTrainingDataModel();
    DataQualityMetrics = getDataQualityMetricsModel();

    // 創建測試數據
    await TrainingData.bulkCreate([
      {
        cardId: 1,
        imageData: 'test_image_1',
        source: 'user_upload',
        quality: 'high',
        status: 'validated',
        metadata: {
          confidence: 0.95,
          processingTime: 1500,
          imageSize: 2048576,
          imageFormat: 'JPEG',
        },
      },
      {
        cardId: 2,
        imageData: 'test_image_2',
        source: 'official_api',
        quality: 'high',
        status: 'annotated',
        metadata: {
          confidence: 0.9,
          processingTime: 1200,
          imageSize: 1536000,
          imageFormat: 'PNG',
        },
      },
      {
        cardId: 3,
        imageData: 'test_image_3',
        source: 'third_party',
        quality: 'medium',
        status: 'processing',
        metadata: {
          confidence: 0.85,
          processingTime: 2000,
          imageSize: 1024000,
          imageFormat: 'JPEG',
        },
      },
    ]);

    // 創建測試質量指標
    await DataQualityMetrics.create({
      dataType: 'training',
      completeness: 0.95,
      accuracy: 0.9,
      consistency: 0.85,
      timeliness: 0.8,
      overallScore: 0.875,
      assessmentDate: new Date(),
      dataSource: 'test',
      sampleSize: 3,
      metadata: {
        assessmentMethod: 'test',
        qualityThreshold: 0.8,
      },
    });

    // 獲取認證token (這裡需要實現實際的認證邏輯)
    authToken = 'test_token';
  });

  afterAll(async () => {
    // 清理測試數據
    await TrainingData.destroy({ where: {} });
    await DataQualityMetrics.destroy({ where: {} });
  });

  describe('GET /api/data-quality/collect/stats', () => {
    it('should return collection statistics without filters', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('sourceDistribution');
      expect(response.body.data).toHaveProperty('qualityDistribution');
      expect(response.body.data).toHaveProperty('statusDistribution');
      expect(response.body.data).toHaveProperty('timeSeries');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('qualityMetrics');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('efficiency');
      expect(response.body.data).toHaveProperty('insights');

      // 驗證摘要數據
      expect(response.body.data.summary.totalRecords).toBe(3);
      expect(response.body.data.summary.collectionPeriod).toBeGreaterThan(0);

      // 驗證來源分佈
      expect(response.body.data.sourceDistribution).toHaveLength(3);
      expect(
        response.body.data.sourceDistribution.find(
          (s) => s.source === 'user_upload'
        )
      ).toBeDefined();
      expect(
        response.body.data.sourceDistribution.find(
          (s) => s.source === 'official_api'
        )
      ).toBeDefined();
      expect(
        response.body.data.sourceDistribution.find(
          (s) => s.source === 'third_party'
        )
      ).toBeDefined();

      // 驗證質量分佈
      expect(response.body.data.qualityDistribution).toHaveLength(2);
      expect(
        response.body.data.qualityDistribution.find((q) => q.quality === 'high')
      ).toBeDefined();
      expect(
        response.body.data.qualityDistribution.find(
          (q) => q.quality === 'medium'
        )
      ).toBeDefined();

      // 驗證狀態分佈
      expect(response.body.data.statusDistribution).toHaveLength(3);
      expect(
        response.body.data.statusDistribution.find(
          (s) => s.status === 'validated'
        )
      ).toBeDefined();
      expect(
        response.body.data.statusDistribution.find(
          (s) => s.status === 'annotated'
        )
      ).toBeDefined();
      expect(
        response.body.data.statusDistribution.find(
          (s) => s.status === 'processing'
        )
      ).toBeDefined();
    });

    it('should return filtered statistics by source', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats?source=user_upload')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRecords).toBe(1);
      expect(response.body.data.sourceDistribution).toHaveLength(1);
      expect(response.body.data.sourceDistribution[0].source).toBe(
        'user_upload'
      );
    });

    it('should return filtered statistics by quality', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats?quality=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRecords).toBe(2);
      expect(response.body.data.qualityDistribution).toHaveLength(1);
      expect(response.body.data.qualityDistribution[0].quality).toBe('high');
    });

    it('should return filtered statistics by status', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats?status=validated')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRecords).toBe(1);
      expect(response.body.data.statusDistribution).toHaveLength(1);
      expect(response.body.data.statusDistribution[0].status).toBe('validated');
    });

    it('should return filtered statistics by date range', async () => {
      const startDate = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(
          `/api/data-quality/collect/stats?startDate=${startDate}&endDate=${endDate}`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRecords).toBe(3);
    });

    it('should handle invalid date parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats?startDate=invalid-date')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // 應該返回所有數據，因為無效日期被忽略
      expect(response.body.data.summary.totalRecords).toBe(3);
    });

    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.performance).toBeDefined();
      expect(response.body.data.performance.processingTime).toBeDefined();
      expect(response.body.data.performance.imageSize).toBeDefined();
      expect(
        response.body.data.performance.processingTime.average
      ).toBeDefined();
      expect(
        response.body.data.performance.processingTime.minimum
      ).toBeDefined();
      expect(
        response.body.data.performance.processingTime.maximum
      ).toBeDefined();
    });

    it('should return quality metrics', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.qualityMetrics).toBeDefined();
      expect(response.body.data.qualityMetrics.completeness).toBeGreaterThan(0);
      expect(response.body.data.qualityMetrics.accuracy).toBeGreaterThan(0);
      expect(response.body.data.qualityMetrics.consistency).toBeGreaterThan(0);
      expect(response.body.data.qualityMetrics.timeliness).toBeGreaterThan(0);
      expect(response.body.data.qualityMetrics.overallScore).toBeGreaterThan(0);
    });

    it('should return trends analysis', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.trends.firstHalfCount).toBeDefined();
      expect(response.body.data.trends.secondHalfCount).toBeDefined();
      expect(response.body.data.trends.growthRate).toBeDefined();
      expect(response.body.data.trends.trend).toBeDefined();
      expect(response.body.data.trends.averageDailyGrowth).toBeDefined();
    });

    it('should return efficiency metrics', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.efficiency).toBeDefined();
      expect(
        response.body.data.efficiency.averageDailyCollection
      ).toBeDefined();
      expect(response.body.data.efficiency.highQualityRatio).toBeDefined();
      expect(response.body.data.efficiency.successRate).toBeDefined();
      expect(response.body.data.efficiency.efficiencyScore).toBeDefined();
    });

    it('should return insights', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.insights).toBeDefined();
      expect(Array.isArray(response.body.data.insights)).toBe(true);
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/api/data-quality/collect/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Collection Service Methods', () => {
    const dataCollectionService = require('../services/dataCollectionService');

    it('should calculate growth trend correctly', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const trend = await dataCollectionService.calculateGrowthTrend(
        startDate,
        endDate
      );

      expect(trend).toBeDefined();
      expect(trend.firstHalfCount).toBeDefined();
      expect(trend.secondHalfCount).toBeDefined();
      expect(trend.growthRate).toBeDefined();
      expect(trend.trend).toBeDefined();
      expect(trend.averageDailyGrowth).toBeDefined();
    });

    it('should calculate efficiency metrics correctly', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const efficiency = await dataCollectionService.calculateEfficiencyMetrics(
        startDate,
        endDate
      );

      expect(efficiency).toBeDefined();
      expect(efficiency.averageDailyCollection).toBeDefined();
      expect(efficiency.highQualityRatio).toBeDefined();
      expect(efficiency.successRate).toBeDefined();
      expect(efficiency.efficiencyScore).toBeDefined();
    });

    it('should generate insights correctly', () => {
      const mockData = {
        totalRecords: 100,
        sourceStats: [
          { source: 'user_upload', count: 50, percentage: '50.00' },
          { source: 'official_api', count: 30, percentage: '30.00' },
          { source: 'third_party', count: 20, percentage: '20.00' },
        ],
        qualityStats: [
          { quality: 'high', count: 60, percentage: '60.00' },
          { quality: 'medium', count: 30, percentage: '30.00' },
          { quality: 'low', count: 10, percentage: '10.00' },
        ],
        growthTrend: {
          trend: 'increasing',
          growthRate: 15.5,
        },
        efficiencyMetrics: {
          efficiencyScore: '75.00',
        },
      };

      const insights =
        dataCollectionService.generateCollectionInsights(mockData);

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });
  });
});
