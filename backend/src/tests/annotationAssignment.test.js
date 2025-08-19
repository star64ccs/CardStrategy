const request = require('supertest');
const app = require('../server');
const annotationService = require('../services/annotationService');
const getTrainingDataModel = require('../models/TrainingData');
const getAnnotatorModel = require('../models/Annotator');
const getAnnotationDataModel = require('../models/AnnotationData');

describe('智能標註任務分配算法測試', () => {
  let TrainingData, Annotator, AnnotationData;
  let testAnnotators = [];
  let testTrainingData = [];

  beforeAll(async () => {
    // 初始化模型
    TrainingData = getTrainingDataModel();
    Annotator = getAnnotatorModel();
    AnnotationData = getAnnotationDataModel();

    // 創建測試標註者
    testAnnotators = await Promise.all([
      Annotator.create({
        userId: 1,
        level: 'expert',
        accuracy: 0.95,
        totalAnnotations: 100,
        completedAnnotations: 95,
        averageProcessingTime: 3600000, // 1小時
        lastActiveDate: new Date(),
        isActive: true,
        metadata: {
          expertiseAreas: {
            card_identification: 0.9,
            condition_assessment: 0.8,
            authenticity_verification: 0.95,
            centering_analysis: 0.85
          }
        }
      }),
      Annotator.create({
        userId: 2,
        level: 'senior',
        accuracy: 0.88,
        totalAnnotations: 80,
        completedAnnotations: 70,
        averageProcessingTime: 4800000, // 1.33小時
        lastActiveDate: new Date(),
        isActive: true,
        metadata: {
          expertiseAreas: {
            card_identification: 0.85,
            condition_assessment: 0.9,
            authenticity_verification: 0.8,
            centering_analysis: 0.88
          }
        }
      }),
      Annotator.create({
        userId: 3,
        level: 'junior',
        accuracy: 0.75,
        totalAnnotations: 50,
        completedAnnotations: 35,
        averageProcessingTime: 7200000, // 2小時
        lastActiveDate: new Date(),
        isActive: true,
        metadata: {
          expertiseAreas: {
            card_identification: 0.7,
            condition_assessment: 0.75,
            authenticity_verification: 0.65,
            centering_analysis: 0.8
          }
        }
      })
    ]);

    // 創建測試訓練數據
    testTrainingData = await Promise.all([
      TrainingData.create({
        cardId: 1,
        imageData: 'base64_image_data_1',
        source: 'user_upload',
        quality: 'high',
        status: 'pending',
        priority: 'high',
        metadata: {
          imageQuality: 'high',
          confidence: 0.9,
          difficultyLevel: 'easy',
          suggestedAnnotationType: 'card_identification'
        }
      }),
      TrainingData.create({
        cardId: 2,
        imageData: 'base64_image_data_2',
        source: 'official_api',
        quality: 'medium',
        status: 'pending',
        priority: 'normal',
        metadata: {
          imageQuality: 'medium',
          confidence: 0.7,
          difficultyLevel: 'medium',
          suggestedAnnotationType: 'authenticity_verification'
        }
      }),
      TrainingData.create({
        cardId: 3,
        imageData: 'base64_image_data_3',
        source: 'third_party',
        quality: 'low',
        status: 'pending',
        priority: 'low',
        metadata: {
          imageQuality: 'low',
          confidence: 0.5,
          difficultyLevel: 'hard',
          suggestedAnnotationType: 'condition_assessment'
        }
      })
    ]);
  });

  afterAll(async () => {
    // 清理測試數據
    await Promise.all([
      ...testAnnotators.map(annotator => annotator.destroy()),
      ...testTrainingData.map(data => data.destroy())
    ]);
  });

  describe('智能分配算法核心功能', () => {
    test('應該正確計算標註者專業度', async () => {
      const annotator = testAnnotators[0];
      const expertise = annotationService.calculateAnnotatorExpertise(annotator);

      expect(expertise).toHaveProperty('card_identification');
      expect(expertise).toHaveProperty('condition_assessment');
      expect(expertise).toHaveProperty('authenticity_verification');
      expect(expertise).toHaveProperty('centering_analysis');

      // 專家級標註者應該有較高的專業度
      expect(expertise.card_identification).toBeGreaterThan(0.8);
      expect(expertise.authenticity_verification).toBeGreaterThan(0.9);
    });

    test('應該正確計算標註者可用性', async () => {
      const annotator = testAnnotators[0];
      const availability = annotationService.calculateAnnotatorAvailability(annotator);

      expect(availability).toBeGreaterThan(0);
      expect(availability).toBeLessThanOrEqual(1);
    });

    test('應該正確計算工作負載', async () => {
      const workloads = await annotationService.calculateAnnotatorWorkloads(testAnnotators);

      expect(workloads).toHaveProperty(testAnnotators[0].id);
      expect(workloads[testAnnotators[0].id]).toHaveProperty('currentTasks');
      expect(workloads[testAnnotators[0].id]).toHaveProperty('workloadScore');
      expect(workloads[testAnnotators[0].id]).toHaveProperty('capacity');
    });

    test('應該正確排序數據優先級', () => {
      const sortedData = annotationService.sortDataByPriority(testTrainingData);

      // 高優先級應該排在前面
      expect(sortedData[0].priority).toBe('high');
      expect(sortedData[1].priority).toBe('normal');
      expect(sortedData[2].priority).toBe('low');
    });

    test('應該正確計算標註者評分', () => {
      const data = testTrainingData[0];
      const annotators = testAnnotators.map(a => ({
        ...a.toJSON(),
        expertise: annotationService.calculateAnnotatorExpertise(a),
        availability: annotationService.calculateAnnotatorAvailability(a),
        performanceHistory: annotationService.extractPerformanceHistory([])
      }));

      const workloads = {
        [testAnnotators[0].id]: { currentTasks: 0, workloadScore: 0, capacity: 10 },
        [testAnnotators[1].id]: { currentTasks: 0, workloadScore: 0, capacity: 10 },
        [testAnnotators[2].id]: { currentTasks: 0, workloadScore: 0, capacity: 10 }
      };

      const scores = annotationService.calculateAnnotatorScores(data, annotators, workloads);

      expect(scores.length).toBeGreaterThan(0);
      expect(scores[0]).toHaveProperty('score');
      expect(scores[0]).toHaveProperty('reason');
      expect(scores[0].score).toBeGreaterThan(0);
    });
  });

  describe('智能分配API端點', () => {
    test('應該成功執行智能分配', async () => {
      const response = await request(app)
        .post('/api/data-quality/annotate/assign')
        .send({
          batchSize: 10,
          priorityFilter: 'high',
          forceReassignment: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalAssigned');
      expect(response.body.data).toHaveProperty('assignments');
      expect(response.body.data).toHaveProperty('algorithm');
      expect(response.body.data.algorithm).toBe('smart_assignment_v2');
    });

    test('應該支持不同的過濾選項', async () => {
      const response = await request(app)
        .post('/api/data-quality/annotate/assign')
        .send({
          batchSize: 5,
          difficultyFilter: 'easy',
          annotationTypeFilter: 'card_identification'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('應該獲取分配算法配置', async () => {
      const response = await request(app)
        .get('/api/data-quality/annotate/config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('config');
      expect(response.body.data).toHaveProperty('algorithm');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data.algorithm).toBe('smart_assignment_v2');
      expect(response.body.data.version).toBe('2.0');
    });

    test('應該更新分配算法配置', async () => {
      const newConfig = {
        maxTasksPerAnnotator: 15,
        qualityThreshold: 0.9,
        workloadWeight: 0.4
      };

      const response = await request(app)
        .put('/api/data-quality/annotate/config')
        .send({ config: newConfig })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.config.maxTasksPerAnnotator).toBe(15);
      expect(response.body.data.config.qualityThreshold).toBe(0.9);
      expect(response.body.data.config.workloadWeight).toBe(0.4);
    });

    test('應該獲取標註者詳細信息', async () => {
      const response = await request(app)
        .get('/api/data-quality/annotate/annotators')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('annotators');
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data).toHaveProperty('activeCount');
      expect(response.body.data.annotators.length).toBeGreaterThan(0);
    });
  });

  describe('學習機制', () => {
    test('應該根據實際結果調整專業度', async () => {
      const annotation = await AnnotationData.create({
        trainingDataId: testTrainingData[0].id,
        annotatorId: testAnnotators[0].id,
        annotationType: 'card_identification',
        annotationResult: {},
        confidence: 0.9,
        reviewStatus: 'pending',
        metadata: {
          expectedQuality: 0.85
        }
      });

      const actualQuality = 0.92;
      const processingTime = 3000000; // 50分鐘

      await annotationService.learnFromResults(annotation.id, actualQuality, processingTime);

      // 驗證標註者專業度已更新
      const updatedAnnotator = await Annotator.findByPk(testAnnotators[0].id);
      const {expertiseAreas} = updatedAnnotator.metadata;

      expect(expertiseAreas.card_identification).toBeGreaterThan(0.9);

      await annotation.destroy();
    });

    test('應該調整分配算法參數', async () => {
      const originalQualityWeight = annotationService.assignmentConfig.qualityWeight;

      // 模擬高質量結果
      await annotationService.adjustAssignmentParameters(0.15, 1800000);

      // 驗證權重已調整
      expect(annotationService.assignmentConfig.qualityWeight).toBeGreaterThan(originalQualityWeight);

      // 恢復原始值
      annotationService.assignmentConfig.qualityWeight = originalQualityWeight;
    });
  });

  describe('分配統計', () => {
    test('應該正確更新分配統計', async () => {
      const assignments = [
        {
          trainingDataId: testTrainingData[0].id,
          annotatorId: testAnnotators[0].id,
          annotationType: 'card_identification',
          priority: 'high',
          difficulty: 'easy',
          expectedQuality: 0.9,
          assignmentReason: '專業領域匹配'
        }
      ];

      const stats = await annotationService.updateAssignmentStatistics(assignments);

      expect(stats.totalAssigned).toBe(1);
      expect(stats.averageExpectedQuality).toBe(0.9);
      expect(stats.distributionByType).toHaveProperty('card_identification');
      expect(stats.distributionByType.card_identification).toBe(1);
    });
  });

  describe('錯誤處理', () => {
    test('應該處理無可用標註者的情況', async () => {
      // 暫時停用所有標註者
      await Promise.all(testAnnotators.map(a => a.update({ isActive: false })));

      const response = await request(app)
        .post('/api/data-quality/annotate/assign')
        .send({ batchSize: 10 })
        .expect(200);

      expect(response.body.data.totalAssigned).toBe(0);

      // 恢復標註者狀態
      await Promise.all(testAnnotators.map(a => a.update({ isActive: true })));
    });

    test('應該處理無待分配數據的情況', async () => {
      // 暫時將所有數據標記為已分配
      await Promise.all(testTrainingData.map(d => d.update({ status: 'annotated' })));

      const response = await request(app)
        .post('/api/data-quality/annotate/assign')
        .send({ batchSize: 10 })
        .expect(200);

      expect(response.body.data.totalAssigned).toBe(0);

      // 恢復數據狀態
      await Promise.all(testTrainingData.map(d => d.update({ status: 'pending' })));
    });
  });
});
