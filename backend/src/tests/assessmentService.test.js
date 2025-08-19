const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const assessmentService = require('../services/assessmentService');
const User = require('../models/User');
const AssessmentSchedule = require('../models/AssessmentSchedule');
const DataQualityAssessment = require('../models/DataQualityAssessment');

describe('Assessment Service Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 創建測試用戶
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    // 獲取認證令牌
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理測試數據
    await AssessmentSchedule.destroy({ where: {} });
    await DataQualityAssessment.destroy({ where: {} });
  });

  describe('Assessment Schedule Management', () => {
    test('should create assessment schedule', async () => {
      const scheduleData = {
        name: 'Daily Quality Check',
        description: 'Daily assessment of data quality',
        assessmentType: 'daily',
        frequency: {
          interval: 1,
          unit: 'days',
          timeOfDay: '00:00'
        },
        dataTypes: ['training', 'annotation'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      };

      const schedule = await assessmentService.createAssessmentSchedule(scheduleData);

      expect(schedule).toBeDefined();
      expect(schedule.name).toBe('Daily Quality Check');
      expect(schedule.assessmentType).toBe('daily');
      expect(schedule.isActive).toBe(true);
      expect(schedule.nextRunDate).toBeDefined();
    });

    test('should get assessment schedules', async () => {
      // 創建測試計劃
      await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'weekly',
        frequency: { interval: 1, unit: 'weeks', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      });

      const result = await assessmentService.getSchedules({ limit: 10 });

      expect(result.schedules).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.schedules[0].name).toBe('Test Schedule');
    });

    test('should update schedule status', async () => {
      const schedule = await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'daily',
        frequency: { interval: 1, unit: 'days', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      });

      const updatedSchedule = await assessmentService.updateScheduleStatus(schedule.id, false);

      expect(updatedSchedule.isActive).toBe(false);
    });

    test('should delete assessment schedule', async () => {
      const schedule = await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'daily',
        frequency: { interval: 1, unit: 'days', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      });

      await assessmentService.deleteSchedule(schedule.id);

      const deletedSchedule = await AssessmentSchedule.findByPk(schedule.id);
      expect(deletedSchedule).toBeNull();
    });
  });

  describe('Assessment Execution', () => {
    test('should execute manual assessment', async () => {
      const assessmentData = {
        dataTypes: ['training', 'annotation'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        userId: testUser.id
      };

      const assessment = await assessmentService.executeManualAssessment(assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.assessmentType).toBe('custom');
      expect(assessment.status).toBe('completed');
      expect(assessment.triggeredBy).toBe('manual');
      expect(assessment.results).toBeDefined();
      expect(assessment.results.overallScore).toBeGreaterThanOrEqual(0);
      expect(assessment.results.overallScore).toBeLessThanOrEqual(1);
    });

    test('should execute scheduled assessment', async () => {
      const schedule = await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'daily',
        frequency: { interval: 1, unit: 'days', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id,
        isActive: true
      });

      const assessment = await assessmentService.executeScheduledAssessment(schedule.id, 'manual', testUser.id);

      expect(assessment).toBeDefined();
      expect(assessment.assessmentType).toBe('daily');
      expect(assessment.status).toBe('completed');
      expect(assessment.triggeredBy).toBe('manual');
      expect(assessment.results).toBeDefined();

      // 檢查計劃統計是否更新
      await schedule.reload();
      expect(schedule.totalRuns).toBe(1);
      expect(schedule.successfulRuns).toBe(1);
      expect(schedule.failedRuns).toBe(0);
    });
  });

  describe('Assessment Data Retrieval', () => {
    test('should get assessments list', async () => {
      // 創建測試評估記錄
      await DataQualityAssessment.create({
        assessmentType: 'custom',
        assessmentDate: new Date(),
        scheduledDate: new Date(),
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        status: 'completed',
        triggeredBy: 'manual',
        triggeredByUserId: testUser.id,
        results: {
          overallScore: 0.85,
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
          sampleSize: 100,
          dataSources: [],
          qualityDistribution: {},
          issues: [],
          recommendations: []
        }
      });

      const result = await assessmentService.getAssessments({ limit: 10 });

      expect(result.assessments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.assessments[0].status).toBe('completed');
      expect(result.assessments[0].results.overallScore).toBe(0.85);
    });

    test('should get assessment statistics', async () => {
      // 創建測試評估記錄
      await DataQualityAssessment.create({
        assessmentType: 'custom',
        assessmentDate: new Date(),
        scheduledDate: new Date(),
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        status: 'completed',
        triggeredBy: 'manual',
        triggeredByUserId: testUser.id,
        results: {
          overallScore: 0.85,
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
          sampleSize: 100,
          dataSources: [],
          qualityDistribution: {},
          issues: [],
          recommendations: []
        },
        executionTime: 5000
      });

      const stats = await assessmentService.getAssessmentStats();

      expect(stats.totalAssessments).toBe(1);
      expect(stats.completedAssessments).toBe(1);
      expect(stats.failedAssessments).toBe(0);
      expect(stats.averageOverallScore).toBe(0.85);
      expect(stats.averageExecutionTime).toBe(5000);
      expect(stats.statusDistribution.completed).toBe(1);
    });
  });

  describe('Assessment Service Methods', () => {
    test('should calculate next run date for daily schedule', () => {
      const schedule = {
        assessmentType: 'daily',
        frequency: { interval: 1, unit: 'days', timeOfDay: '00:00' }
      };

      const nextRunDate = assessmentService.calculateNextRunDate(schedule);
      const now = new Date();
      const expectedDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      expect(nextRunDate.getDate()).toBe(expectedDate.getDate());
    });

    test('should calculate next run date for weekly schedule', () => {
      const schedule = {
        assessmentType: 'weekly',
        frequency: { interval: 1, unit: 'weeks', timeOfDay: '00:00', daysOfWeek: [1] }
      };

      const nextRunDate = assessmentService.calculateNextRunDate(schedule);
      const now = new Date();
      const expectedDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(nextRunDate.getTime()).toBeGreaterThan(now.getTime());
    });

    test('should generate quality distribution', () => {
      const distribution = assessmentService.calculateQualityDistribution(0.95);
      expect(distribution.excellent).toBe(1);
      expect(distribution.good).toBe(0);
      expect(distribution.fair).toBe(0);
      expect(distribution.poor).toBe(0);

      const distribution2 = assessmentService.calculateQualityDistribution(0.75);
      expect(distribution2.excellent).toBe(0);
      expect(distribution2.good).toBe(1);
      expect(distribution2.fair).toBe(0);
      expect(distribution2.poor).toBe(0);
    });

    test('should generate recommendations', () => {
      const results = {
        completeness: 0.7,
        accuracy: 0.8,
        consistency: 0.75,
        timeliness: 0.6,
        overallScore: 0.71
      };

      const criteria = {
        completeness: { weight: 0.25, threshold: 0.8 },
        accuracy: { weight: 0.30, threshold: 0.85 },
        consistency: { weight: 0.25, threshold: 0.8 },
        timeliness: { weight: 0.20, threshold: 0.75 }
      };

      const recommendations = assessmentService.generateRecommendations(results, criteria);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('category');
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('description');
      expect(recommendations[0]).toHaveProperty('action');
    });
  });
});

describe('Assessment API Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AssessmentSchedule.destroy({ where: {} });
    await DataQualityAssessment.destroy({ where: {} });
  });

  describe('POST /api/data-quality/assessment/schedule', () => {
    test('should create assessment schedule', async () => {
      const scheduleData = {
        name: 'Daily Quality Check',
        description: 'Daily assessment of data quality',
        assessmentType: 'daily',
        frequency: {
          interval: 1,
          unit: 'days',
          timeOfDay: '00:00'
        },
        dataTypes: ['training', 'annotation'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        }
      };

      const response = await request(app)
        .post('/api/data-quality/assessment/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Daily Quality Check');
      expect(response.body.data.assessmentType).toBe('daily');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/data-quality/assessment/schedule')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/data-quality/assessment/schedules', () => {
    test('should get assessment schedules', async () => {
      await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'weekly',
        frequency: { interval: 1, unit: 'weeks', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      });

      const response = await request(app)
        .get('/api/data-quality/assessment/schedules')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.schedules).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
    });
  });

  describe('PUT /api/data-quality/assessment/schedule/:id/status', () => {
    test('should update schedule status', async () => {
      const schedule = await AssessmentSchedule.create({
        name: 'Test Schedule',
        assessmentType: 'daily',
        frequency: { interval: 1, unit: 'days', timeOfDay: '00:00' },
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        createdBy: testUser.id
      });

      const response = await request(app)
        .put(`/api/data-quality/assessment/schedule/${schedule.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe('POST /api/data-quality/assessment/execute', () => {
    test('should execute manual assessment', async () => {
      const assessmentData = {
        dataTypes: ['training', 'annotation'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        }
      };

      const response = await request(app)
        .post('/api/data-quality/assessment/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assessmentType).toBe('custom');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.results).toBeDefined();
    });
  });

  describe('GET /api/data-quality/assessment/list', () => {
    test('should get assessments list', async () => {
      await DataQualityAssessment.create({
        assessmentType: 'custom',
        assessmentDate: new Date(),
        scheduledDate: new Date(),
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        status: 'completed',
        triggeredBy: 'manual',
        triggeredByUserId: testUser.id,
        results: {
          overallScore: 0.85,
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
          sampleSize: 100,
          dataSources: [],
          qualityDistribution: {},
          issues: [],
          recommendations: []
        }
      });

      const response = await request(app)
        .get('/api/data-quality/assessment/list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assessments).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
    });
  });

  describe('GET /api/data-quality/assessment/stats', () => {
    test('should get assessment statistics', async () => {
      await DataQualityAssessment.create({
        assessmentType: 'custom',
        assessmentDate: new Date(),
        scheduledDate: new Date(),
        dataTypes: ['training'],
        assessmentCriteria: {
          completeness: { weight: 0.25, threshold: 0.8 },
          accuracy: { weight: 0.30, threshold: 0.85 },
          consistency: { weight: 0.25, threshold: 0.8 },
          timeliness: { weight: 0.20, threshold: 0.75 }
        },
        status: 'completed',
        triggeredBy: 'manual',
        triggeredByUserId: testUser.id,
        results: {
          overallScore: 0.85,
          completeness: 0.9,
          accuracy: 0.85,
          consistency: 0.8,
          timeliness: 0.85,
          sampleSize: 100,
          dataSources: [],
          qualityDistribution: {},
          issues: [],
          recommendations: []
        },
        executionTime: 5000
      });

      const response = await request(app)
        .get('/api/data-quality/assessment/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAssessments).toBe(1);
      expect(response.body.data.completedAssessments).toBe(1);
      expect(response.body.data.averageOverallScore).toBe(0.85);
    });
  });
});
