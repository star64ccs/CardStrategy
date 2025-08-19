const request = require('supertest');
const app = require('../server');
const { DataQualityMetrics, TrainingData, AnnotationData, Annotator, User } = require('../models');
const dataQualityMonitoringService = require('../services/dataQualityMonitoringService');

describe('Data Quality Dashboard API Tests', () => {
  let testUser;
  let testToken;

  beforeAll(async () => {
    // Create test user and get authentication token
    testUser = await User.create({
      username: 'dashboard_test_user',
      email: 'dashboard@test.com',
      password: 'testpassword123'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dashboard@test.com',
        password: 'testpassword123'
      });

    testToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await DataQualityMetrics.destroy({ where: {} });
    await TrainingData.destroy({ where: {} });
    await AnnotationData.destroy({ where: {} });
    await Annotator.destroy({ where: {} });
    await User.destroy({ where: { id: testUser.id } });
  });

  beforeEach(async () => {
    // Create test data for each test
    const testMetrics = [
      {
        dataType: 'training',
        completeness: 0.85,
        accuracy: 0.92,
        consistency: 0.78,
        timeliness: 0.88,
        overallScore: 0.86,
        assessmentDate: new Date('2024-12-15'),
        dataSource: 'user_upload',
        sampleSize: 100,
        metadata: { test: true }
      },
      {
        dataType: 'annotation',
        completeness: 0.90,
        accuracy: 0.95,
        consistency: 0.88,
        timeliness: 0.92,
        overallScore: 0.91,
        assessmentDate: new Date('2024-12-16'),
        dataSource: 'human_annotation',
        sampleSize: 50,
        metadata: { test: true }
      },
      {
        dataType: 'validation',
        completeness: 0.82,
        accuracy: 0.89,
        consistency: 0.85,
        timeliness: 0.90,
        overallScore: 0.87,
        assessmentDate: new Date('2024-12-17'),
        dataSource: 'automated_validation',
        sampleSize: 75,
        metadata: { test: true }
      }
    ];

    await DataQualityMetrics.bulkCreate(testMetrics);

    // Create test training data
    const testTrainingData = [
      {
        cardId: 1,
        imageData: 'base64_test_data_1',
        source: 'user_upload',
        quality: 'high',
        status: 'annotated',
        metadata: { test: true }
      },
      {
        cardId: 2,
        imageData: 'base64_test_data_2',
        source: 'official_api',
        quality: 'medium',
        status: 'pending',
        metadata: { test: true }
      },
      {
        cardId: 3,
        imageData: 'base64_test_data_3',
        source: 'third_party',
        quality: 'low',
        status: 'rejected',
        metadata: { test: true }
      }
    ];

    await TrainingData.bulkCreate(testTrainingData);

    // Create test annotator
    const testAnnotator = await Annotator.create({
      userId: testUser.id,
      level: 'expert',
      accuracy: 0.95,
      totalAnnotations: 100,
      completedAnnotations: 95,
      averageProcessingTime: 120,
      lastActiveDate: new Date(),
      metadata: { test: true }
    });

    // Create test annotations
    const testAnnotations = [
      {
        trainingDataId: 1,
        annotatorId: testAnnotator.id,
        annotationType: 'card_identification',
        annotationResult: { cardName: 'Test Card', confidence: 0.95 },
        confidence: 0.95,
        reviewStatus: 'approved',
        processingTime: 120,
        metadata: { test: true }
      },
      {
        trainingDataId: 2,
        annotatorId: testAnnotator.id,
        annotationType: 'condition_assessment',
        annotationResult: { condition: 'excellent', confidence: 0.88 },
        confidence: 0.88,
        reviewStatus: 'rejected',
        reviewNotes: 'Incorrect assessment',
        processingTime: 150,
        metadata: { test: true }
      }
    ];

    await AnnotationData.bulkCreate(testAnnotations);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await DataQualityMetrics.destroy({ where: { 'metadata.test': true } });
    await TrainingData.destroy({ where: { 'metadata.test': true } });
    await AnnotationData.destroy({ where: { 'metadata.test': true } });
    await Annotator.destroy({ where: { 'metadata.test': true } });
  });

  describe('GET /api/data-quality/dashboard', () => {
    it('should return comprehensive dashboard data', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overallMetrics');
      expect(response.body.data).toHaveProperty('trendData');
      expect(response.body.data).toHaveProperty('sourceBreakdown');
      expect(response.body.data).toHaveProperty('qualityDistribution');
      expect(response.body.data).toHaveProperty('annotatorPerformance');
      expect(response.body.data).toHaveProperty('recentIssues');
      expect(response.body.data).toHaveProperty('improvementSuggestions');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(response.body.data).toHaveProperty('dateRange');
    });

    it('should filter data by date range', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard')
        .query({
          startDate: '2024-12-15',
          endDate: '2024-12-17'
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.dateRange.startDate).toBe('2024-12-15T00:00:00.000Z');
      expect(response.body.data.dateRange.endDate).toBe('2024-12-17T00:00:00.000Z');
    });

    it('should filter data by data types', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard')
        .query({
          dataTypes: 'training,annotation'
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.overallMetrics.totalAssessments).toBe(2);
    });
  });

  describe('GET /api/data-quality/alerts', () => {
    it('should return real-time alerts', async () => {
      const response = await request(app)
        .get('/api/data-quality/alerts')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/data-quality/overall-metrics', () => {
    it('should return overall quality metrics', async () => {
      const response = await request(app)
        .get('/api/data-quality/overall-metrics')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('averageCompleteness');
      expect(response.body.data).toHaveProperty('averageAccuracy');
      expect(response.body.data).toHaveProperty('averageConsistency');
      expect(response.body.data).toHaveProperty('averageTimeliness');
      expect(response.body.data).toHaveProperty('overallScore');
      expect(response.body.data).toHaveProperty('totalAssessments');
    });
  });

  describe('GET /api/data-quality/trends', () => {
    it('should return trend data', async () => {
      const response = await request(app)
        .get('/api/data-quality/trends')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dateLabels');
      expect(response.body.data).toHaveProperty('trendData');
      expect(Array.isArray(response.body.data.dateLabels)).toBe(true);
    });
  });

  describe('GET /api/data-quality/source-breakdown', () => {
    it('should return source breakdown data', async () => {
      const response = await request(app)
        .get('/api/data-quality/source-breakdown')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sourceBreakdown');
      expect(response.body.data).toHaveProperty('qualityBreakdown');
      expect(response.body.data).toHaveProperty('statusBreakdown');
      expect(response.body.data).toHaveProperty('totalRecords');
    });
  });

  describe('GET /api/data-quality/quality-distribution', () => {
    it('should return quality distribution data', async () => {
      const response = await request(app)
        .get('/api/data-quality/quality-distribution')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overallDistribution');
      expect(response.body.data).toHaveProperty('totalAssessments');
      expect(response.body.data.overallDistribution).toHaveProperty('excellent');
      expect(response.body.data.overallDistribution).toHaveProperty('good');
      expect(response.body.data.overallDistribution).toHaveProperty('fair');
      expect(response.body.data.overallDistribution).toHaveProperty('poor');
    });
  });

  describe('GET /api/data-quality/annotator-performance', () => {
    it('should return annotator performance data', async () => {
      const response = await request(app)
        .get('/api/data-quality/annotator-performance')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('annotatorStats');
      expect(response.body.data).toHaveProperty('totalAnnotations');
      expect(Array.isArray(response.body.data.annotatorStats)).toBe(true);
    });
  });

  describe('GET /api/data-quality/recent-issues', () => {
    it('should return recent issues', async () => {
      const response = await request(app)
        .get('/api/data-quality/recent-issues')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/data-quality/improvement-suggestions', () => {
    it('should return improvement suggestions', async () => {
      const response = await request(app)
        .get('/api/data-quality/improvement-suggestions')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Data Quality Monitoring Service Tests', () => {
    describe('getOverallMetrics', () => {
      it('should calculate overall metrics correctly', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');
        const dataTypes = ['training', 'annotation', 'validation'];

        const metrics = await dataQualityMonitoringService.getOverallMetrics(
          startDate,
          endDate,
          dataTypes
        );

        expect(metrics).toHaveProperty('averageCompleteness');
        expect(metrics).toHaveProperty('averageAccuracy');
        expect(metrics).toHaveProperty('averageConsistency');
        expect(metrics).toHaveProperty('averageTimeliness');
        expect(metrics).toHaveProperty('overallScore');
        expect(metrics).toHaveProperty('totalAssessments');
        expect(metrics.totalAssessments).toBe(3);
      });
    });

    describe('getTrendData', () => {
      it('should return trend data with correct structure', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');
        const dataTypes = ['training', 'annotation'];

        const trendData = await dataQualityMonitoringService.getTrendData(
          startDate,
          endDate,
          dataTypes
        );

        expect(trendData).toHaveProperty('dateLabels');
        expect(trendData).toHaveProperty('trendData');
        expect(Array.isArray(trendData.dateLabels)).toBe(true);
        expect(typeof trendData.trendData).toBe('object');
      });
    });

    describe('getSourceBreakdown', () => {
      it('should return source breakdown with correct structure', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');

        const breakdown = await dataQualityMonitoringService.getSourceBreakdown(
          startDate,
          endDate
        );

        expect(breakdown).toHaveProperty('sourceBreakdown');
        expect(breakdown).toHaveProperty('qualityBreakdown');
        expect(breakdown).toHaveProperty('statusBreakdown');
        expect(breakdown).toHaveProperty('totalRecords');
        expect(Array.isArray(breakdown.sourceBreakdown)).toBe(true);
        expect(Array.isArray(breakdown.qualityBreakdown)).toBe(true);
        expect(Array.isArray(breakdown.statusBreakdown)).toBe(true);
      });
    });

    describe('getQualityDistribution', () => {
      it('should return quality distribution with correct structure', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');

        const distribution = await dataQualityMonitoringService.getQualityDistribution(
          startDate,
          endDate
        );

        expect(distribution).toHaveProperty('overallDistribution');
        expect(distribution).toHaveProperty('totalAssessments');
        expect(distribution.overallDistribution).toHaveProperty('excellent');
        expect(distribution.overallDistribution).toHaveProperty('good');
        expect(distribution.overallDistribution).toHaveProperty('fair');
        expect(distribution.overallDistribution).toHaveProperty('poor');
      });
    });

    describe('getAnnotatorPerformance', () => {
      it('should return annotator performance with correct structure', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');

        const performance = await dataQualityMonitoringService.getAnnotatorPerformance(
          startDate,
          endDate
        );

        expect(performance).toHaveProperty('annotatorStats');
        expect(performance).toHaveProperty('totalAnnotations');
        expect(Array.isArray(performance.annotatorStats)).toBe(true);
        expect(performance.annotatorStats.length).toBeGreaterThan(0);
      });
    });

    describe('getRecentIssues', () => {
      it('should return recent issues with correct structure', async () => {
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-17');

        const issues = await dataQualityMonitoringService.getRecentIssues(
          startDate,
          endDate
        );

        expect(Array.isArray(issues)).toBe(true);
        if (issues.length > 0) {
          expect(issues[0]).toHaveProperty('type');
          expect(issues[0]).toHaveProperty('severity');
          expect(issues[0]).toHaveProperty('title');
          expect(issues[0]).toHaveProperty('description');
          expect(issues[0]).toHaveProperty('date');
        }
      });
    });

    describe('getImprovementSuggestions', () => {
      it('should return improvement suggestions with correct structure', async () => {
        const suggestions = await dataQualityMonitoringService.getImprovementSuggestions();

        expect(Array.isArray(suggestions)).toBe(true);
        if (suggestions.length > 0) {
          expect(suggestions[0]).toHaveProperty('priority');
          expect(suggestions[0]).toHaveProperty('category');
          expect(suggestions[0]).toHaveProperty('title');
          expect(suggestions[0]).toHaveProperty('description');
          expect(suggestions[0]).toHaveProperty('action');
        }
      });
    });

    describe('getRealTimeAlerts', () => {
      it('should return real-time alerts with correct structure', async () => {
        const alerts = await dataQualityMonitoringService.getRealTimeAlerts();

        expect(Array.isArray(alerts)).toBe(true);
        if (alerts.length > 0) {
          expect(alerts[0]).toHaveProperty('type');
          expect(alerts[0]).toHaveProperty('title');
          expect(alerts[0]).toHaveProperty('message');
          expect(alerts[0]).toHaveProperty('timestamp');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard')
        .query({
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200); // Should still work with default dates
    });

    it('should handle missing authentication token', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard');

      expect(response.status).toBe(401);
    });

    it('should handle invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/data-quality/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
