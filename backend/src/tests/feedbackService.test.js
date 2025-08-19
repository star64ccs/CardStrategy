const request = require('supertest');
const { sequelize } = require('../config/database');
const feedbackService = require('../services/feedbackService');
const Feedback = require('../models/Feedback');
const FeedbackResponse = require('../models/FeedbackResponse');
const FeedbackAnalytics = require('../models/FeedbackAnalytics');
const User = require('../models/User');
const logger = require('../utils/logger');

describe('Feedback Service Tests', () => {
  let testUser;
  let testFeedback;
  let authToken;

  beforeAll(async () => {
    // 設置測試數據庫
    await sequelize.sync({ force: true });

    // 創建測試用戶
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // 獲取認證令牌
    const loginResponse = await request(require('../app'))
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
    await FeedbackResponse.destroy({ where: {} });
    await Feedback.destroy({ where: {} });
    await FeedbackAnalytics.destroy({ where: {} });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const feedbackData = {
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'This is a test feedback',
        tags: ['test', 'bug'],
        metadata: { test: true }
      };

      const feedback = await feedbackService.submitFeedback(feedbackData);

      expect(feedback).toBeDefined();
      expect(feedback.id).toBeDefined();
      expect(feedback.title).toBe('Test Feedback');
      expect(feedback.status).toBe('pending');
      expect(feedback.priority).toBe('high');
      expect(feedback.userId).toBe(testUser.id);
    });

    it('should calculate priority correctly', async () => {
      const feedbackData = {
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'critical',
        title: 'Critical Feedback',
        description: 'Critical issue'
      };

      const feedback = await feedbackService.submitFeedback(feedbackData);
      expect(feedback.priority).toBe('urgent');
    });

    it('should generate auto response', async () => {
      const feedbackData = {
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'medium',
        title: 'Test Feedback',
        description: 'Test description'
      };

      const feedback = await feedbackService.submitFeedback(feedbackData);

      // 檢查是否生成了自動回應
      const responses = await FeedbackResponse.findAll({
        where: { feedbackId: feedback.id }
      });

      expect(responses).toHaveLength(1);
      expect(responses[0].responseType).toBe('comment');
      expect(responses[0].isInternal).toBe(false);
    });
  });

  describe('getFeedbacks', () => {
    beforeEach(async () => {
      // 創建測試反饋
      testFeedback = await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should get feedbacks with pagination', async () => {
      const result = await feedbackService.getFeedbacks({
        page: 1,
        limit: 10
      });

      expect(result.feedbacks).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.feedbacks).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter feedbacks by status', async () => {
      const result = await feedbackService.getFeedbacks({
        status: 'pending'
      });

      expect(result.feedbacks).toHaveLength(1);
      expect(result.feedbacks[0].status).toBe('pending');
    });

    it('should filter feedbacks by feedback type', async () => {
      const result = await feedbackService.getFeedbacks({
        feedbackType: 'data_quality'
      });

      expect(result.feedbacks).toHaveLength(1);
      expect(result.feedbacks[0].feedbackType).toBe('data_quality');
    });
  });

  describe('getFeedbackById', () => {
    beforeEach(async () => {
      testFeedback = await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should get feedback by id', async () => {
      const feedback = await feedbackService.getFeedbackById(testFeedback.id);

      expect(feedback).toBeDefined();
      expect(feedback.id).toBe(testFeedback.id);
      expect(feedback.title).toBe('Test Feedback');
    });

    it('should throw error for non-existent feedback', async () => {
      await expect(feedbackService.getFeedbackById(99999)).rejects.toThrow('反饋不存在');
    });
  });

  describe('updateFeedbackStatus', () => {
    beforeEach(async () => {
      testFeedback = await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should update feedback status', async () => {
      const updatedFeedback = await feedbackService.updateFeedbackStatus(
        testFeedback.id,
        'in_progress',
        testUser.id
      );

      expect(updatedFeedback.status).toBe('in_progress');
    });

    it('should add status update response', async () => {
      await feedbackService.updateFeedbackStatus(
        testFeedback.id,
        'resolved',
        testUser.id,
        'Issue has been resolved'
      );

      const responses = await FeedbackResponse.findAll({
        where: { feedbackId: testFeedback.id }
      });

      expect(responses).toHaveLength(2); // 1 auto response + 1 status update
      const statusResponse = responses.find(r => r.responseType === 'status_update');
      expect(statusResponse).toBeDefined();
      expect(statusResponse.content).toContain('resolved');
    });
  });

  describe('assignFeedback', () => {
    beforeEach(async () => {
      testFeedback = await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should assign feedback to user', async () => {
      const assignedFeedback = await feedbackService.assignFeedback(
        testFeedback.id,
        testUser.id,
        testUser.id
      );

      expect(assignedFeedback.assignedTo).toBe(testUser.id);
    });

    it('should add assignment response', async () => {
      await feedbackService.assignFeedback(
        testFeedback.id,
        testUser.id,
        testUser.id
      );

      const responses = await FeedbackResponse.findAll({
        where: { feedbackId: testFeedback.id }
      });

      const assignmentResponse = responses.find(r => r.responseType === 'assignment');
      expect(assignmentResponse).toBeDefined();
      expect(assignmentResponse.isInternal).toBe(true);
    });
  });

  describe('addResponse', () => {
    beforeEach(async () => {
      testFeedback = await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should add response to feedback', async () => {
      const response = await feedbackService.addResponse(
        testFeedback.id,
        testUser.id,
        'This is a test response',
        'comment',
        false
      );

      expect(response).toBeDefined();
      expect(response.content).toBe('This is a test response');
      expect(response.responseType).toBe('comment');
      expect(response.isInternal).toBe(false);
    });
  });

  describe('getFeedbackStats', () => {
    beforeEach(async () => {
      // 創建測試反饋和分析數據
      await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback 1',
        description: 'Test description',
        status: 'resolved',
        priority: 'high'
      });

      await Feedback.create({
        userId: testUser.id,
        feedbackType: 'bug_report',
        category: 'general',
        severity: 'medium',
        title: 'Test Feedback 2',
        description: 'Test description',
        status: 'pending',
        priority: 'normal'
      });

      // 創建分析數據
      const today = new Date().toISOString().split('T')[0];
      await FeedbackAnalytics.create({
        date: today,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        totalSubmitted: 1,
        totalResolved: 1,
        averageResolutionTime: 2.5,
        priorityDistribution: { high: 1 },
        statusDistribution: { resolved: 1 },
        severityDistribution: { high: 1 }
      });
    });

    it('should get feedback statistics', async () => {
      const stats = await feedbackService.getFeedbackStats();

      expect(stats.totalSubmitted).toBe(1);
      expect(stats.totalResolved).toBe(1);
      expect(stats.averageResolutionTime).toBe(2.5);
      expect(stats.feedbackTypeDistribution).toBeDefined();
      expect(stats.categoryDistribution).toBeDefined();
    });

    it('should filter stats by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const stats = await feedbackService.getFeedbackStats({
        startDate: today,
        endDate: today
      });

      expect(stats.totalSubmitted).toBe(1);
    });
  });

  describe('generateImprovementSuggestions', () => {
    beforeEach(async () => {
      // 創建測試分析數據
      const today = new Date().toISOString().split('T')[0];
      await FeedbackAnalytics.create({
        date: today,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        totalSubmitted: 10,
        totalResolved: 5,
        averageResolutionTime: 10,
        priorityDistribution: { high: 5, normal: 3, low: 2 },
        statusDistribution: { resolved: 5, pending: 3, in_progress: 2 },
        severityDistribution: { high: 6, medium: 3, low: 1 }
      });
    });

    it('should generate improvement suggestions', async () => {
      const suggestions = await feedbackService.generateImprovementSuggestions();

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should suggest based on resolution time', async () => {
      const suggestions = await feedbackService.generateImprovementSuggestions();

      const processSuggestion = suggestions.find(s => s.category === 'process_improvement');
      expect(processSuggestion).toBeDefined();
    });
  });
});

describe('Feedback API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const loginResponse = await request(require('../app'))
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
    await FeedbackResponse.destroy({ where: {} });
    await Feedback.destroy({ where: {} });
    await FeedbackAnalytics.destroy({ where: {} });
  });

  describe('POST /api/data-quality/feedback', () => {
    it('should submit feedback via API', async () => {
      const feedbackData = {
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'API Test Feedback',
        description: 'This is a test feedback via API'
      };

      const response = await request(require('../app'))
        .post('/api/data-quality/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send(feedbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('API Test Feedback');
    });
  });

  describe('GET /api/data-quality/feedback', () => {
    beforeEach(async () => {
      await Feedback.create({
        userId: testUser.id,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        severity: 'high',
        title: 'Test Feedback',
        description: 'Test description',
        status: 'pending',
        priority: 'high'
      });
    });

    it('should get feedbacks via API', async () => {
      const response = await request(require('../app'))
        .get('/api/data-quality/feedback')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.feedbacks).toHaveLength(1);
    });

    it('should filter feedbacks via API', async () => {
      const response = await request(require('../app'))
        .get('/api/data-quality/feedback?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.feedbacks).toHaveLength(1);
    });
  });

  describe('GET /api/data-quality/feedback/stats', () => {
    beforeEach(async () => {
      const today = new Date().toISOString().split('T')[0];
      await FeedbackAnalytics.create({
        date: today,
        feedbackType: 'data_quality',
        category: 'card_recognition',
        totalSubmitted: 5,
        totalResolved: 3,
        averageResolutionTime: 2.5,
        priorityDistribution: { high: 2, normal: 2, low: 1 },
        statusDistribution: { resolved: 3, pending: 2 },
        severityDistribution: { high: 3, medium: 1, low: 1 }
      });
    });

    it('should get feedback stats via API', async () => {
      const response = await request(require('../app'))
        .get('/api/data-quality/feedback/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSubmitted).toBe(5);
      expect(response.body.data.totalResolved).toBe(3);
    });
  });

  describe('GET /api/data-quality/feedback/suggestions', () => {
    it('should get feedback suggestions via API', async () => {
      const response = await request(require('../app'))
        .get('/api/data-quality/feedback/suggestions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
