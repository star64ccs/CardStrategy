const { Op } = require('sequelize');
const getTrainingDataModel = require('../models/TrainingData');
const getAnnotatorModel = require('../models/Annotator');
const getAnnotationDataModel = require('../models/AnnotationData');
const getDataQualityMetricsModel = require('../models/DataQualityMetrics');
const logger = require('../utils/logger');

class AnnotationService {
  constructor() {
    this.TrainingData = null;
    this.Annotator = null;
    this.AnnotationData = null;
    this.DataQualityMetrics = null;

    // 分配算法配置
    this.assignmentConfig = {
      maxTasksPerAnnotator: 10, // 每個標註者最大同時任務數
      qualityThreshold: 0.85, // 質量閾值
      workloadWeight: 0.3, // 工作量權重
      expertiseWeight: 0.4, // 專業度權重
      qualityWeight: 0.3, // 質量權重
      learningRate: 0.1, // 學習率
      priorityBoost: 1.5, // 優先級提升倍數
      difficultyPenalty: 0.8 // 難度懲罰係數
    };
  }

  async initializeModels() {
    if (!this.TrainingData) this.TrainingData = getTrainingDataModel();
    if (!this.Annotator) this.Annotator = getAnnotatorModel();
    if (!this.AnnotationData) this.AnnotationData = getAnnotationDataModel();
    if (!this.DataQualityMetrics) this.DataQualityMetrics = getDataQualityMetricsModel();

    if (!this.TrainingData || !this.Annotator || !this.AnnotationData || !this.DataQualityMetrics) {
      throw new Error('Failed to initialize annotation service models');
    }
  }

  // 優化的標註任務分配算法
  async assignAnnotationTasks(options = {}) {
    try {
      await this.initializeModels();
      logger.info('開始智能分配標註任務...');

      const {
        batchSize = 50,
        priorityFilter = null,
        difficultyFilter = null,
        annotationTypeFilter = null,
        forceReassignment = false
      } = options;

      // 獲取待分配的訓練數據
      const pendingData = await this.getPendingTrainingData({
        limit: batchSize,
        priorityFilter,
        difficultyFilter,
        annotationTypeFilter
      });

      if (pendingData.length === 0) {
        logger.info('沒有待分配的標註任務');
        return [];
      }

      // 獲取活躍標註者及其詳細信息
      const activeAnnotators = await this.getActiveAnnotatorsWithDetails();

      if (activeAnnotators.length === 0) {
        logger.warn('沒有可用的活躍標註者');
        return [];
      }

      // 計算每個標註者的當前工作負載
      const annotatorWorkloads = await this.calculateAnnotatorWorkloads(activeAnnotators);

      // 執行智能分配
      const assignments = await this.performSmartAssignment(
        pendingData,
        activeAnnotators,
        annotatorWorkloads,
        forceReassignment
      );

      // 批量創建標註任務
      const createdTasks = await this.batchCreateAnnotationTasks(assignments);

      // 更新分配統計
      await this.updateAssignmentStatistics(assignments);

      logger.info(`智能分配完成: ${createdTasks.length} 個標註任務`);
      return createdTasks;
    } catch (error) {
      logger.error('智能分配標註任務失敗:', error);
      throw error;
    }
  }

  // 獲取待分配的訓練數據
  async getPendingTrainingData(filters) {
    const whereClause = {
      status: 'pending',
      isActive: true
    };

    if (filters.priorityFilter) {
      whereClause.priority = filters.priorityFilter;
    }

    if (filters.difficultyFilter) {
      whereClause['metadata.difficultyLevel'] = filters.difficultyFilter;
    }

    if (filters.annotationTypeFilter) {
      whereClause['metadata.suggestedAnnotationType'] = filters.annotationTypeFilter;
    }

    return await this.TrainingData.findAll({
      where: whereClause,
      limit: filters.limit,
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });
  }

  // 獲取活躍標註者詳細信息
  async getActiveAnnotatorsWithDetails() {
    const annotators = await this.Annotator.findAll({
      where: {
        isActive: true,
        level: { [Op.in]: ['expert', 'senior', 'junior'] }
      },
      include: [{
        model: this.AnnotationData,
        as: 'recentAnnotations',
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        },
        required: false
      }]
    });

    return annotators.map(annotator => ({
      ...annotator.toJSON(),
      expertise: this.calculateAnnotatorExpertise(annotator),
      availability: this.calculateAnnotatorAvailability(annotator),
      performanceHistory: this.extractPerformanceHistory(annotator.recentAnnotations)
    }));
  }

  // 計算標註者專業度
  calculateAnnotatorExpertise(annotator) {
    const expertise = {
      card_identification: 0.5,
      condition_assessment: 0.5,
      authenticity_verification: 0.5,
      centering_analysis: 0.5
    };

    // 根據標註者等級調整基礎專業度
    const levelMultiplier = {
      expert: 1.2,
      senior: 1.0,
      junior: 0.8
    };

    const multiplier = levelMultiplier[annotator.level] || 1.0;

    // 根據歷史表現調整專業度
    if (annotator.metadata && annotator.metadata.expertiseAreas) {
      Object.keys(annotator.metadata.expertiseAreas).forEach(area => {
        if (expertise[area] !== undefined) {
          expertise[area] = Math.min(1.0, annotator.metadata.expertiseAreas[area] * multiplier);
        }
      });
    }

    return expertise;
  }

  // 計算標註者可用性
  calculateAnnotatorAvailability(annotator) {
    const now = new Date();
    const lastActive = new Date(annotator.lastActiveDate);
    const daysSinceLastActive = (now - lastActive) / (1000 * 60 * 60 * 24);

    // 基礎可用性分數
    let availability = 1.0;

    // 根據最後活躍時間調整
    if (daysSinceLastActive > 7) {
      availability *= 0.5;
    } else if (daysSinceLastActive > 3) {
      availability *= 0.8;
    }

    // 根據當前工作負載調整
    const currentTasks = annotator.completedAnnotations || 0;
    const maxTasks = this.assignmentConfig.maxTasksPerAnnotator;

    if (currentTasks >= maxTasks) {
      availability *= 0.1; // 幾乎不可用
    } else if (currentTasks >= maxTasks * 0.8) {
      availability *= 0.5; // 部分可用
    }

    return Math.max(0, availability);
  }

  // 提取性能歷史
  extractPerformanceHistory(annotations) {
    if (!annotations || annotations.length === 0) {
      return {
        averageConfidence: 0.5,
        averageProcessingTime: 0,
        successRate: 0.5,
        qualityTrend: 'stable'
      };
    }

    const confidences = annotations.map(a => parseFloat(a.confidence));
    const processingTimes = annotations.filter(a => a.processingTime).map(a => a.processingTime);
    const successCount = annotations.filter(a => a.reviewStatus === 'approved').length;

    return {
      averageConfidence: confidences.reduce((sum, c) => sum + c, 0) / confidences.length,
      averageProcessingTime: processingTimes.length > 0 ?
        processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length : 0,
      successRate: successCount / annotations.length,
      qualityTrend: this.calculateQualityTrend(annotations)
    };
  }

  // 計算質量趨勢
  calculateQualityTrend(annotations) {
    if (annotations.length < 5) return 'stable';

    const sortedAnnotations = annotations.sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const recentAnnotations = sortedAnnotations.slice(-5);
    const olderAnnotations = sortedAnnotations.slice(0, -5);

    const recentAvgConfidence = recentAnnotations.reduce((sum, a) =>
      sum + parseFloat(a.confidence), 0) / recentAnnotations.length;
    const olderAvgConfidence = olderAnnotations.reduce((sum, a) =>
      sum + parseFloat(a.confidence), 0) / olderAnnotations.length;

    if (recentAvgConfidence > olderAvgConfidence + 0.1) return 'improving';
    if (recentAvgConfidence < olderAvgConfidence - 0.1) return 'declining';
    return 'stable';
  }

  // 計算標註者工作負載
  async calculateAnnotatorWorkloads(annotators) {
    const workloads = {};

    for (const annotator of annotators) {
      const activeTasks = await this.AnnotationData.count({
        where: {
          annotatorId: annotator.id,
          reviewStatus: 'pending',
          isActive: true
        }
      });

      workloads[annotator.id] = {
        currentTasks: activeTasks,
        workloadScore: activeTasks / this.assignmentConfig.maxTasksPerAnnotator,
        capacity: Math.max(0, this.assignmentConfig.maxTasksPerAnnotator - activeTasks)
      };
    }

    return workloads;
  }

  // 執行智能分配
  async performSmartAssignment(pendingData, annotators, workloads, forceReassignment) {
    const assignments = [];
    const assignedDataIds = new Set();

    // 按優先級和難度排序待分配數據
    const sortedData = this.sortDataByPriority(pendingData);

    for (const data of sortedData) {
      if (assignedDataIds.has(data.id)) continue;

      // 計算每個標註者的綜合評分
      const annotatorScores = this.calculateAnnotatorScores(
        data,
        annotators,
        workloads
      );

      // 選擇最佳標註者
      const bestAnnotator = this.selectBestAnnotator(annotatorScores, workloads);

      if (bestAnnotator) {
        assignments.push({
          trainingDataId: data.id,
          annotatorId: bestAnnotator.id,
          annotationType: this.determineOptimalAnnotationType(data, bestAnnotator),
          priority: data.priority || 'normal',
          difficulty: this.assessDifficulty(data),
          expectedQuality: bestAnnotator.score,
          assignmentReason: bestAnnotator.reason
        });

        assignedDataIds.add(data.id);

        // 更新工作負載
        workloads[bestAnnotator.id].currentTasks++;
        workloads[bestAnnotator.id].workloadScore =
          workloads[bestAnnotator.id].currentTasks / this.assignmentConfig.maxTasksPerAnnotator;
        workloads[bestAnnotator.id].capacity =
          Math.max(0, this.assignmentConfig.maxTasksPerAnnotator - workloads[bestAnnotator.id].currentTasks);
      }
    }

    return assignments;
  }

  // 按優先級排序數據
  sortDataByPriority(data) {
    return data.sort((a, b) => {
      // 優先級權重
      const priorityWeight = {
        high: 3,
        normal: 2,
        low: 1
      };

      const aPriority = priorityWeight[a.priority] || 2;
      const bPriority = priorityWeight[b.priority] || 2;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // 按創建時間排序
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  // 計算標註者評分
  calculateAnnotatorScores(data, annotators, workloads) {
    const scores = [];

    for (const annotator of annotators) {
      const workload = workloads[annotator.id];

      // 檢查工作負載限制
      if (workload.currentTasks >= this.assignmentConfig.maxTasksPerAnnotator) {
        continue;
      }

      // 計算各項評分
      const workloadScore = this.calculateWorkloadScore(workload);
      const expertiseScore = this.calculateExpertiseScore(data, annotator);
      const qualityScore = this.calculateQualityScore(annotator);
      const availabilityScore = annotator.availability;

      // 綜合評分
      const totalScore = (
        workloadScore * this.assignmentConfig.workloadWeight +
        expertiseScore * this.assignmentConfig.expertiseWeight +
        qualityScore * this.assignmentConfig.qualityWeight
      ) * availabilityScore;

      // 應用難度調整
      const difficulty = this.assessDifficulty(data);
      const adjustedScore = this.applyDifficultyAdjustment(totalScore, difficulty, annotator);

      scores.push({
        id: annotator.id,
        score: adjustedScore,
        workloadScore,
        expertiseScore,
        qualityScore,
        availabilityScore,
        reason: this.generateAssignmentReason(annotator, data, adjustedScore)
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  // 計算工作量評分
  calculateWorkloadScore(workload) {
    // 工作量越少，評分越高
    return 1 - workload.workloadScore;
  }

  // 計算專業度評分
  calculateExpertiseScore(data, annotator) {
    const annotationType = this.determineAnnotationType(data);
    return annotator.expertise[annotationType] || 0.5;
  }

  // 計算質量評分
  calculateQualityScore(annotator) {
    const baseScore = annotator.accuracy || 0.5;
    const {performanceHistory} = annotator;

    // 根據性能歷史調整
    let adjustedScore = baseScore;

    if (performanceHistory.qualityTrend === 'improving') {
      adjustedScore *= 1.1;
    } else if (performanceHistory.qualityTrend === 'declining') {
      adjustedScore *= 0.9;
    }

    return Math.min(1.0, adjustedScore);
  }

  // 應用難度調整
  applyDifficultyAdjustment(score, difficulty, annotator) {
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 0.9,
      hard: 0.8
    };

    const baseMultiplier = difficultyMultipliers[difficulty] || 1.0;

    // 根據標註者等級調整難度處理能力
    const levelMultipliers = {
      expert: 1.0,
      senior: 0.95,
      junior: 0.9
    };

    const levelMultiplier = levelMultipliers[annotator.level] || 1.0;

    return score * baseMultiplier * levelMultiplier;
  }

  // 生成分配原因
  generateAssignmentReason(annotator, data, score) {
    const reasons = [];

    if (annotator.expertise[this.determineAnnotationType(data)] > 0.8) {
      reasons.push('專業領域匹配');
    }

    if (annotator.performanceHistory.qualityTrend === 'improving') {
      reasons.push('質量趨勢良好');
    }

    if (annotator.accuracy > 0.9) {
      reasons.push('高準確率');
    }

    if (reasons.length === 0) {
      reasons.push('綜合評分最佳');
    }

    return reasons.join(', ');
  }

  // 選擇最佳標註者
  selectBestAnnotator(scores, workloads) {
    if (scores.length === 0) return null;

    // 選擇評分最高的標註者
    const bestAnnotator = scores[0];

    // 檢查工作負載
    const workload = workloads[bestAnnotator.id];
    if (workload.currentTasks >= this.assignmentConfig.maxTasksPerAnnotator) {
      return null;
    }

    return bestAnnotator;
  }

  // 確定最佳標註類型
  determineOptimalAnnotationType(data, annotator) {
    const suggestedType = this.determineAnnotationType(data);

    // 檢查標註者是否在該類型上有高專業度
    if (annotator.expertise[suggestedType] > 0.8) {
      return suggestedType;
    }

    // 尋找標註者最擅長的類型
    const bestType = Object.keys(annotator.expertise).reduce((best, type) => {
      return annotator.expertise[type] > annotator.expertise[best] ? type : best;
    });

    return bestType || suggestedType;
  }

  // 批量創建標註任務
  async batchCreateAnnotationTasks(assignments) {
    const createdTasks = [];

    for (const assignment of assignments) {
      try {
        const annotationTask = await this.AnnotationData.create({
          trainingDataId: assignment.trainingDataId,
          annotatorId: assignment.annotatorId,
          annotationType: assignment.annotationType,
          annotationResult: {},
          confidence: 0.00,
          reviewStatus: 'pending',
          metadata: {
            annotationTool: 'smart_assignment',
            annotationVersion: '2.0',
            qualityScore: 0,
            difficultyLevel: assignment.difficulty,
            priority: assignment.priority,
            expectedQuality: assignment.expectedQuality,
            assignmentReason: assignment.assignmentReason,
            specialNotes: '',
            boundingBoxes: [],
            featurePoints: [],
            textAnnotations: [],
            assignmentAlgorithm: 'smart_assignment_v2',
            assignmentTimestamp: new Date()
          }
        });

        createdTasks.push({
          taskId: annotationTask.id,
          trainingDataId: assignment.trainingDataId,
          annotatorId: assignment.annotatorId,
          annotationType: assignment.annotationType,
          expectedQuality: assignment.expectedQuality,
          assignmentReason: assignment.assignmentReason
        });
      } catch (error) {
        logger.error(`創建標註任務失敗: ${assignment.trainingDataId}`, error);
      }
    }

    return createdTasks;
  }

  // 更新分配統計
  async updateAssignmentStatistics(assignments) {
    try {
      const stats = {
        totalAssigned: assignments.length,
        averageExpectedQuality: 0,
        distributionByType: {},
        distributionByDifficulty: {},
        distributionByAnnotator: {}
      };

      if (assignments.length > 0) {
        // 計算平均預期質量
        const totalQuality = assignments.reduce((sum, a) => sum + a.expectedQuality, 0);
        stats.averageExpectedQuality = totalQuality / assignments.length;

        // 按類型分佈
        assignments.forEach(a => {
          stats.distributionByType[a.annotationType] =
            (stats.distributionByType[a.annotationType] || 0) + 1;
        });

        // 按難度分佈
        assignments.forEach(a => {
          stats.distributionByDifficulty[a.difficulty] =
            (stats.distributionByDifficulty[a.difficulty] || 0) + 1;
        });

        // 按標註者分佈
        assignments.forEach(a => {
          stats.distributionByAnnotator[a.annotatorId] =
            (stats.distributionByAnnotator[a.annotatorId] || 0) + 1;
        });
      }

      logger.info('分配統計已更新:', stats);
      return stats;
    } catch (error) {
      logger.error('更新分配統計失敗:', error);
    }
  }

  // 學習機制：根據實際結果調整分配策略
  async learnFromResults(annotationId, actualQuality, processingTime) {
    try {
      const annotation = await this.AnnotationData.findByPk(annotationId, {
        include: [{
          model: this.Annotator,
          as: 'annotator'
        }]
      });

      if (!annotation) return;

      const expectedQuality = annotation.metadata?.expectedQuality || 0.5;
      const qualityDifference = actualQuality - expectedQuality;

      // 調整標註者的專業度評分
      await this.adjustAnnotatorExpertise(
        annotation.annotatorId,
        annotation.annotationType,
        qualityDifference
      );

      // 調整分配算法參數
      await this.adjustAssignmentParameters(qualityDifference, processingTime);

      logger.info(`學習機制已更新: 標註ID ${annotationId}, 質量差異: ${qualityDifference}`);
    } catch (error) {
      logger.error('學習機制更新失敗:', error);
    }
  }

  // 調整標註者專業度
  async adjustAnnotatorExpertise(annotatorId, annotationType, qualityDifference) {
    try {
      const annotator = await this.Annotator.findByPk(annotatorId);
      if (!annotator) return;

      const metadata = annotator.metadata || {};
      const expertiseAreas = metadata.expertiseAreas || {};

      // 根據質量差異調整專業度
      const currentExpertise = expertiseAreas[annotationType] || 0.5;
      const adjustment = qualityDifference * this.assignmentConfig.learningRate;
      const newExpertise = Math.max(0, Math.min(1, currentExpertise + adjustment));

      expertiseAreas[annotationType] = newExpertise;

      await annotator.update({
        metadata: {
          ...metadata,
          expertiseAreas,
          lastExpertiseUpdate: new Date()
        }
      });
    } catch (error) {
      logger.error('調整標註者專業度失敗:', error);
    }
  }

  // 調整分配參數
  async adjustAssignmentParameters(qualityDifference, processingTime) {
    // 根據實際表現調整權重
    if (qualityDifference > 0.1) {
      // 實際質量比預期好，增加質量權重
      this.assignmentConfig.qualityWeight = Math.min(0.5,
        this.assignmentConfig.qualityWeight + 0.02);
    } else if (qualityDifference < -0.1) {
      // 實際質量比預期差，減少質量權重
      this.assignmentConfig.qualityWeight = Math.max(0.1,
        this.assignmentConfig.qualityWeight - 0.02);
    }

    // 根據處理時間調整工作量權重
    const expectedTime = 24 * 60 * 60 * 1000; // 24小時
    if (processingTime > expectedTime * 1.5) {
      // 處理時間過長，增加工作量權重
      this.assignmentConfig.workloadWeight = Math.min(0.5,
        this.assignmentConfig.workloadWeight + 0.01);
    }
  }

  // 確定標註類型
  determineAnnotationType(trainingData) {
    // 根據數據來源和內容確定標註類型
    const {source} = trainingData;
    const metadata = trainingData.metadata || {};

    if (source === 'user_correction') {
      return 'card_identification';
    } else if (metadata.imageQuality === 'high') {
      return 'condition_assessment';
    } else if (source === 'official_api') {
      return 'authenticity_verification';
    }
    return 'centering_analysis';

  }

  // 評估難度等級
  assessDifficulty(trainingData) {
    const metadata = trainingData.metadata || {};
    const {quality} = trainingData;

    if (quality === 'high' && metadata.confidence > 0.9) {
      return 'easy';
    } else if (quality === 'low' || metadata.confidence < 0.7) {
      return 'hard';
    }
    return 'medium';

  }

  // 提交標註結果
  async submitAnnotation(annotationId, annotationResult, confidence) {
    try {
      await this.initializeModels();

      const annotation = await this.AnnotationData.findByPk(annotationId);
      if (!annotation) {
        throw new Error('標註任務不存在');
      }

      // 更新標註結果
      await annotation.update({
        annotationResult,
        confidence,
        reviewStatus: 'pending',
        processingTime: this.calculateProcessingTime(annotation.createdAt),
        metadata: {
          ...annotation.metadata,
          qualityScore: this.calculateQualityScore(annotationResult, confidence),
          lastUpdated: new Date()
        }
      });

      // 更新標註者統計
      await this.updateAnnotatorStats(annotation.annotatorId);

      logger.info(`標註結果已提交: ID ${annotationId}`);
      return annotation;
    } catch (error) {
      logger.error('提交標註結果失敗:', error);
      throw error;
    }
  }

  // 計算處理時間
  calculateProcessingTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    return now.getTime() - created.getTime();
  }

  // 計算質量分數
  calculateQualityScore(annotationResult, confidence) {
    // 基於標註結果的完整性和置信度計算質量分數
    let score = confidence * 0.7; // 70% 基於置信度

    // 檢查標註結果的完整性
    const resultKeys = Object.keys(annotationResult);
    const completeness = resultKeys.length / 5; // 假設有5個必要字段
    score += completeness * 0.3; // 30% 基於完整性

    return Math.min(1, score);
  }

  // 更新標註者統計
  async updateAnnotatorStats(annotatorId) {
    try {
      const annotator = await this.Annotator.findByPk(annotatorId);
      if (!annotator) return;

      // 計算標註者的統計數據
      const annotations = await this.AnnotationData.findAll({
        where: { annotatorId }
      });

      const totalAnnotations = annotations.length;
      const completedAnnotations = annotations.filter(a => a.reviewStatus === 'approved').length;
      const averageConfidence = annotations.reduce((sum, a) => sum + parseFloat(a.confidence), 0) / totalAnnotations;
      const averageProcessingTime = annotations.reduce((sum, a) => sum + (a.processingTime || 0), 0) / totalAnnotations;

      // 計算準確率（基於審核結果）
      const accuracy = totalAnnotations > 0 ? completedAnnotations / totalAnnotations : 0;

      await annotator.update({
        totalAnnotations,
        completedAnnotations,
        accuracy,
        averageProcessingTime,
        lastActiveDate: new Date(),
        metadata: {
          ...annotator.metadata,
          averageConfidence,
          lastUpdated: new Date()
        }
      });

      logger.info(`標註者統計已更新: ID ${annotatorId}`);
    } catch (error) {
      logger.error('更新標註者統計失敗:', error);
    }
  }

  // 審核標註結果
  async reviewAnnotation(annotationId, reviewStatus, reviewNotes, reviewerId) {
    try {
      await this.initializeModels();

      const annotation = await this.AnnotationData.findByPk(annotationId);
      if (!annotation) {
        throw new Error('標註任務不存在');
      }

      await annotation.update({
        reviewStatus,
        reviewNotes,
        reviewedBy: reviewerId,
        reviewedAt: new Date()
      });

      // 如果審核通過，更新訓練數據狀態
      if (reviewStatus === 'approved') {
        await this.TrainingData.update(
          { status: 'annotated' },
          { where: { id: annotation.trainingDataId } }
        );
      }

      logger.info(`標註審核完成: ID ${annotationId}, 狀態: ${reviewStatus}`);
      return annotation;
    } catch (error) {
      logger.error('審核標註結果失敗:', error);
      throw error;
    }
  }

  // 批量審核
  async batchReviewAnnotations(reviews) {
    try {
      await this.initializeModels();

      const results = [];
      for (const review of reviews) {
        try {
          const result = await this.reviewAnnotation(
            review.annotationId,
            review.reviewStatus,
            review.reviewNotes,
            review.reviewerId
          );
          results.push({ success: true, annotationId: review.annotationId, result });
        } catch (error) {
          results.push({ success: false, annotationId: review.annotationId, error: error.message });
        }
      }

      // 更新數據質量指標
      await this.updateAnnotationQualityMetrics();

      logger.info(`批量審核完成: ${results.length} 個標註`);
      return results;
    } catch (error) {
      logger.error('批量審核失敗:', error);
      throw error;
    }
  }

  // 更新標註質量指標
  async updateAnnotationQualityMetrics() {
    try {
      await this.initializeModels();

      const annotations = await this.AnnotationData.findAll({
        where: { isActive: true }
      });

      const qualityMetrics = this.calculateAnnotationQualityMetrics(annotations);

      await this.DataQualityMetrics.create({
        dataType: 'annotation',
        completeness: qualityMetrics.completeness,
        accuracy: qualityMetrics.accuracy,
        consistency: qualityMetrics.consistency,
        timeliness: qualityMetrics.timeliness,
        overallScore: qualityMetrics.overallScore,
        assessmentDate: new Date(),
        dataSource: 'annotation_service',
        sampleSize: annotations.length,
        metadata: {
          assessmentMethod: 'annotation_review',
          qualityThreshold: 0.85,
          improvementSuggestions: this.generateAnnotationImprovementSuggestions(qualityMetrics),
          qualityTrend: 'stable',
          averageConfidence: qualityMetrics.averageConfidence,
          reviewRate: qualityMetrics.reviewRate
        }
      });

      logger.info('標註質量指標已更新');
    } catch (error) {
      logger.error('更新標註質量指標失敗:', error);
    }
  }

  // 計算標註質量指標
  calculateAnnotationQualityMetrics(annotations) {
    if (!annotations || annotations.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        overallScore: 0,
        averageConfidence: 0,
        reviewRate: 0
      };
    }

    const totalAnnotations = annotations.length;
    const reviewedAnnotations = annotations.filter(a => a.reviewStatus !== 'pending').length;
    const approvedAnnotations = annotations.filter(a => a.reviewStatus === 'approved').length;

    const averageConfidence = annotations.reduce((sum, a) => sum + parseFloat(a.confidence), 0) / totalAnnotations;
    const reviewRate = totalAnnotations > 0 ? reviewedAnnotations / totalAnnotations : 0;
    const accuracy = reviewedAnnotations > 0 ? approvedAnnotations / reviewedAnnotations : 0;

    // 計算完整性（基於標註結果的完整性）
    const completeness = annotations.reduce((sum, a) => {
      const resultKeys = Object.keys(a.annotationResult || {});
      return sum + (resultKeys.length / 5); // 假設有5個必要字段
    }, 0) / totalAnnotations;

    // 計算一致性（基於標註者的一致性）
    const annotatorConsistency = this.calculateAnnotatorConsistency(annotations);

    // 計算時效性（基於處理時間）
    const timeliness = this.calculateAnnotationTimeliness(annotations);

    const overallScore = (
      completeness * 0.25 +
      accuracy * 0.30 +
      annotatorConsistency * 0.25 +
      timeliness * 0.20
    );

    return {
      completeness,
      accuracy,
      consistency: annotatorConsistency,
      timeliness,
      overallScore,
      averageConfidence,
      reviewRate
    };
  }

  // 計算標註者一致性
  calculateAnnotatorConsistency(annotations) {
    // 簡化的標註者一致性計算
    const annotatorGroups = {};

    annotations.forEach(annotation => {
      if (!annotatorGroups[annotation.annotatorId]) {
        annotatorGroups[annotation.annotatorId] = [];
      }
      annotatorGroups[annotation.annotatorId].push(annotation.confidence);
    });

    const consistencyScores = Object.values(annotatorGroups).map(confidences => {
      const avg = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
      const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / confidences.length;
      return 1 / (1 + variance); // 方差越小，一致性越高
    });

    return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
  }

  // 計算標註時效性
  calculateAnnotationTimeliness(annotations) {
    const now = new Date();
    let timelyAnnotations = 0;

    annotations.forEach(annotation => {
      const created = new Date(annotation.createdAt);
      const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 7) { // 7天內完成算作時效
        timelyAnnotations++;
      }
    });

    return annotations.length > 0 ? timelyAnnotations / annotations.length : 0;
  }

  // 生成標註改進建議
  generateAnnotationImprovementSuggestions(qualityMetrics) {
    const suggestions = [];

    if (qualityMetrics.completeness < 0.9) {
      suggestions.push('提高標註完整性，確保所有必要字段都有標註');
    }

    if (qualityMetrics.accuracy < 0.85) {
      suggestions.push('提高標註準確性，加強標註者培訓和審核流程');
    }

    if (qualityMetrics.consistency < 0.8) {
      suggestions.push('改善標註一致性，建立更詳細的標註指南');
    }

    if (qualityMetrics.timeliness < 0.7) {
      suggestions.push('提高標註時效性，優化任務分配和處理流程');
    }

    if (qualityMetrics.reviewRate < 0.8) {
      suggestions.push('提高審核率，增加審核人員或簡化審核流程');
    }

    return suggestions;
  }

  // 獲取標註統計
  async getAnnotationStats() {
    try {
      await this.initializeModels();

      const totalAnnotations = await this.AnnotationData.count({ where: { isActive: true } });
      const pendingAnnotations = await this.AnnotationData.count({
        where: { reviewStatus: 'pending', isActive: true }
      });
      const approvedAnnotations = await this.AnnotationData.count({
        where: { reviewStatus: 'approved', isActive: true }
      });
      const rejectedAnnotations = await this.AnnotationData.count({
        where: { reviewStatus: 'rejected', isActive: true }
      });

      const activeAnnotators = await this.Annotator.count({ where: { isActive: true } });

      return {
        totalAnnotations,
        pendingAnnotations,
        approvedAnnotations,
        rejectedAnnotations,
        activeAnnotators,
        approvalRate: totalAnnotations > 0 ? approvedAnnotations / totalAnnotations : 0,
        rejectionRate: totalAnnotations > 0 ? rejectedAnnotations / totalAnnotations : 0
      };
    } catch (error) {
      logger.error('獲取標註統計失敗:', error);
      throw error;
    }
  }
}

module.exports = new AnnotationService();
