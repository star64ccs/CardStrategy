const { Op } = require('sequelize');
const Schedule = require('../models/Schedule');
const Assessment = require('../models/Assessment');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const DataQualityAssessment = require('../models/DataQualityAssessment');
const AssessmentSchedule = require('../models/AssessmentSchedule');
// eslint-disable-next-line no-unused-vars
const DataQualityMetrics = require('../models/DataQualityMetrics');
// eslint-disable-next-line no-unused-vars
const TrainingData = require('../models/TrainingData');
// eslint-disable-next-line no-unused-vars
const AnnotationData = require('../models/AnnotationData');
// eslint-disable-next-line no-unused-vars
const MarketData = require('../models/MarketData');

class AssessmentService {
  constructor() {
    this.TrainingData = null;
    this.AnnotationData = null;
    this.MarketData = null;
  }

  async initialize() {
    try {
      const { TrainingData: TrainingDataModel } =
        await require('../models/TrainingData');
      const { AnnotationData: AnnotationDataModel } =
        await require('../models/AnnotationData');
      const { MarketData: MarketDataModel } =
        await require('../models/MarketData');

      this.TrainingData = TrainingDataModel;
      this.AnnotationData = AnnotationDataModel;
      this.MarketData = MarketDataModel;

      logger.info('AssessmentService 初始化完成');
    } catch (error) {
      logger.error('AssessmentService 初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 創建評估計劃
   */
  async createAssessmentSchedule(scheduleData) {
    try {
// eslint-disable-next-line no-unused-vars
      const schedule = await AssessmentSchedule.create({
        name: scheduleData.name,
        description: scheduleData.description,
        assessmentType: scheduleData.assessmentType,
        frequency: scheduleData.frequency,
        dataTypes: scheduleData.dataTypes,
        assessmentCriteria: scheduleData.assessmentCriteria,
        startDate: scheduleData.startDate || new Date(),
        endDate: scheduleData.endDate,
        notificationSettings: scheduleData.notificationSettings,
        createdBy: scheduleData.createdBy,
        metadata: scheduleData.metadata,
      });

      // 計算下次運行時間
      schedule.nextRunDate = this.calculateNextRunDate(schedule);
      await schedule.save();

      logger.info(`評估計劃創建成功: ${schedule.name}`);
      return schedule;
    } catch (error) {
      logger.error('創建評估計劃失敗:', error);
      throw error;
    }
  }

  /**
   * 執行定期評估
   */
  async executeScheduledAssessment(
    scheduleId,
    triggeredBy = 'system',
    triggeredByUserId = null
  ) {
    const startTime = Date.now();

    try {
// eslint-disable-next-line no-unused-vars
      const schedule = await AssessmentSchedule.findByPk(scheduleId);
      if (!schedule || !schedule.isActive) {
        throw new Error('評估計劃不存在或已停用');
      }

      // 創建評估記錄
// eslint-disable-next-line no-unused-vars
      const assessment = await DataQualityAssessment.create({
        assessmentType: schedule.assessmentType,
        scheduledDate: schedule.nextRunDate,
        dataTypes: schedule.dataTypes,
        assessmentCriteria: schedule.assessmentCriteria,
        status: 'in_progress',
        triggeredBy,
        triggeredByUserId,
      });

      // 執行評估
// eslint-disable-next-line no-unused-vars
      const results = await this.performAssessment(
        schedule.dataTypes,
        schedule.assessmentCriteria
      );

      // 更新評估結果
      assessment.results = results;
      assessment.status = 'completed';
      assessment.executionTime = Date.now() - startTime;
      assessment.assessmentDate = new Date();
      await assessment.save();

      // 更新計劃統計
      schedule.totalRuns += 1;
      schedule.successfulRuns += 1;
      schedule.lastRunDate = new Date();
      schedule.nextRunDate = this.calculateNextRunDate(schedule);

      // 更新平均執行時間
      if (schedule.averageExecutionTime) {
        schedule.averageExecutionTime = Math.round(
          (schedule.averageExecutionTime + assessment.executionTime) / 2
        );
      } else {
        schedule.averageExecutionTime = assessment.executionTime;
      }

      await schedule.save();

      // 發送通知
      await this.sendAssessmentNotifications(schedule, assessment, 'success');

      logger.info(
        `評估執行成功: ${schedule.name}, 執行時間: ${assessment.executionTime}ms`
      );
      return assessment;
    } catch (error) {
      logger.error('評估執行失敗:', error);

      // 更新失敗狀態
      if (assessment) {
        assessment.status = 'failed';
        assessment.errorMessage = error.message;
        assessment.executionTime = Date.now() - startTime;
        await assessment.save();
      }

      // 更新計劃失敗統計
      if (schedule) {
        schedule.totalRuns += 1;
        schedule.failedRuns += 1;
        schedule.lastRunDate = new Date();
        await schedule.save();
      }

      // 發送失敗通知
      if (schedule) {
        await this.sendAssessmentNotifications(schedule, assessment, 'failure');
      }

      throw error;
    }
  }

  /**
   * 執行手動評估
   */
  async executeManualAssessment(assessmentData) {
    const startTime = Date.now();

    try {
// eslint-disable-next-line no-unused-vars
      const assessment = await DataQualityAssessment.create({
        assessmentType: 'custom',
        scheduledDate: new Date(),
        dataTypes: assessmentData.dataTypes,
        assessmentCriteria: assessmentData.assessmentCriteria,
        status: 'in_progress',
        triggeredBy: 'manual',
        triggeredByUserId: assessmentData.userId,
      });

// eslint-disable-next-line no-unused-vars
      const results = await this.performAssessment(
        assessmentData.dataTypes,
        assessmentData.assessmentCriteria
      );

      assessment.results = results;
      assessment.status = 'completed';
      assessment.executionTime = Date.now() - startTime;
      assessment.assessmentDate = new Date();
      await assessment.save();

      logger.info(`手動評估執行成功, 執行時間: ${assessment.executionTime}ms`);
      return assessment;
    } catch (error) {
      logger.error('手動評估執行失敗:', error);
      throw error;
    }
  }

  /**
   * 執行實際評估邏輯
   */
  async performAssessment(dataTypes, criteria) {
// eslint-disable-next-line no-unused-vars
    const results = {
      overallScore: 0,
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      timeliness: 0,
      sampleSize: 0,
      dataSources: [],
      qualityDistribution: {},
      issues: [],
      recommendations: [],
    };

    let totalSampleSize = 0;
    let totalCompleteness = 0;
    let totalAccuracy = 0;
    let totalConsistency = 0;
    let totalTimeliness = 0;
// eslint-disable-next-line no-unused-vars
    let typeCount = 0;

// eslint-disable-next-line no-unused-vars
    for (const dataType of dataTypes) {
      try {
// eslint-disable-next-line no-unused-vars
        const typeResults = await this.assessDataType(dataType, criteria);

        totalSampleSize += typeResults.sampleSize;
        totalCompleteness += typeResults.completeness * typeResults.sampleSize;
        totalAccuracy += typeResults.accuracy * typeResults.sampleSize;
        totalConsistency += typeResults.consistency * typeResults.sampleSize;
        totalTimeliness += typeResults.timeliness * typeResults.sampleSize;

        results.dataSources.push({
          type: dataType,
          sampleSize: typeResults.sampleSize,
          completeness: typeResults.completeness,
          accuracy: typeResults.accuracy,
          consistency: typeResults.consistency,
          timeliness: typeResults.timeliness,
          issues: typeResults.issues,
        });

        typeCount++;
      } catch (error) {
        logger.error(`評估數據類型失敗: ${dataType}`, error);
        results.issues.push({
          type: 'error',
          dataType,
          message: error.message,
        });
      }
    }

    if (typeCount > 0 && totalSampleSize > 0) {
      results.sampleSize = totalSampleSize;
      results.completeness = totalCompleteness / totalSampleSize;
      results.accuracy = totalAccuracy / totalSampleSize;
      results.consistency = totalConsistency / totalSampleSize;
      results.timeliness = totalTimeliness / totalSampleSize;

      // 計算總體分數
      results.overallScore =
        results.completeness * criteria.completeness.weight +
        results.accuracy * criteria.accuracy.weight +
        results.consistency * criteria.consistency.weight +
        results.timeliness * criteria.timeliness.weight;

      // 生成質量分佈
      results.qualityDistribution = this.calculateQualityDistribution(
        results.overallScore
      );

      // 生成建議
      results.recommendations = this.generateRecommendations(results, criteria);
    }

    return results;
  }

  /**
   * 評估特定數據類型
   */
  async assessDataType(dataType, criteria) {
// eslint-disable-next-line no-unused-vars
    let data = [];
    let sampleSize = 0;

    switch (dataType) {
      case 'training':
        data = await this.TrainingData.findAll({
          where: { isActive: true },
          limit: 1000,
        });
        sampleSize = data.length;
        break;

      case 'annotation':
        data = await this.AnnotationData.findAll({
          where: { reviewStatus: { [Op.ne]: 'pending' } },
          limit: 1000,
        });
        sampleSize = data.length;
        break;

      case 'market':
        data = await this.MarketData.findAll({
          where: { isActive: true },
          limit: 1000,
        });
        sampleSize = data.length;
        break;

      default:
        throw new Error(`不支持的數據類型: ${dataType}`);
    }

    if (sampleSize === 0) {
      return {
        sampleSize: 0,
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        issues: [{ type: 'warning', message: '沒有找到數據樣本' }],
      };
    }

    const completeness = this.calculateCompleteness(data, dataType);
    const accuracy = this.calculateAccuracy(data, dataType);
    const consistency = this.calculateConsistency(data, dataType);
    const timeliness = this.calculateTimeliness(data, dataType);

    const issues = this.identifyIssues(data, dataType, criteria);

    return {
      sampleSize,
      completeness,
      accuracy,
      consistency,
      timeliness,
      issues,
    };
  }

  /**
   * 計算完整性
   */
  calculateCompleteness(data, dataType) {
    if (!data || data.length === 0) return 0;

    let totalFields = 0;
    let filledFields = 0;

    data.forEach((item) => {
// eslint-disable-next-line no-unused-vars
      const requiredFields = this.getRequiredFields(dataType);
      totalFields += requiredFields.length;

      requiredFields.forEach((field) => {
        if (
          item[field] !== null &&
          item[field] !== undefined &&
          item[field] !== ''
        ) {
          filledFields++;
        }
      });
    });

    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  /**
   * 計算準確性
   */
  calculateAccuracy(data, dataType) {
    if (!data || data.length === 0) return 0;

    const totalItems = data.length;
    let accurateItems = 0;

    data.forEach((item) => {
      if (this.isDataAccurate(item, dataType)) {
        accurateItems++;
      }
    });

    return totalItems > 0 ? accurateItems / totalItems : 0;
  }

  /**
   * 計算一致性
   */
  calculateConsistency(data, dataType) {
    if (!data || data.length === 0) return 0;

    let totalComparisons = 0;
    let consistentComparisons = 0;

    for (let i = 0; i < data.length - 1; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (this.isDataConsistent(data[i], data[j], dataType)) {
          consistentComparisons++;
        }
        totalComparisons++;
      }
    }

    return totalComparisons > 0 ? consistentComparisons / totalComparisons : 0;
  }

  /**
   * 計算時效性
   */
  calculateTimeliness(data, dataType) {
    if (!data || data.length === 0) return 0;

// eslint-disable-next-line no-unused-vars
    const now = new Date();
    let totalAge = 0;

    data.forEach((item) => {
      const updateTime = item.updatedAt || item.createdAt;
      const ageInDays = (now - new Date(updateTime)) / (1000 * 60 * 60 * 24);
      totalAge += ageInDays;
    });

    const averageAge = totalAge / data.length;
    const maxAcceptableAge = this.getMaxAcceptableAge(dataType);

    return Math.max(0, 1 - averageAge / maxAcceptableAge);
  }

  /**
   * 獲取必要字段
   */
  getRequiredFields(dataType) {
    const fieldMaps = {
      training: ['cardId', 'imageUrl', 'annotationData', 'qualityScore'],
      annotation: [
        'trainingDataId',
        'annotatorId',
        'annotationResult',
        'confidence',
      ],
      market: ['cardId', 'price', 'source', 'timestamp'],
    };

    return fieldMaps[dataType] || [];
  }

  /**
   * 檢查數據準確性
   */
  isDataAccurate(item, dataType) {
    // 簡化的準確性檢查邏輯
    switch (dataType) {
      case 'training':
        return item.qualityScore >= 0.7;
      case 'annotation':
        return item.confidence >= 0.8;
      case 'market':
        return item.price > 0 && item.timestamp;
      default:
        return true;
    }
  }

  /**
   * 檢查數據一致性
   */
  isDataConsistent(item1, item2, dataType) {
    // 簡化的一致性檢查邏輯
    switch (dataType) {
      case 'training':
        return Math.abs(item1.qualityScore - item2.qualityScore) < 0.3;
      case 'annotation':
        return Math.abs(item1.confidence - item2.confidence) < 0.2;
      case 'market':
        return (
          Math.abs(item1.price - item2.price) /
            Math.max(item1.price, item2.price) <
          0.5
        );
      default:
        return true;
    }
  }

  /**
   * 獲取最大可接受年齡
   */
  getMaxAcceptableAge(dataType) {
    const ageMaps = {
      training: 30, // 30天
      annotation: 7, // 7天
      market: 1, // 1天
    };

    return ageMaps[dataType] || 30;
  }

  /**
   * 識別問題
   */
  identifyIssues(data, dataType, criteria) {
    const issues = [];

    // 檢查完整性問題
    const completeness = this.calculateCompleteness(data, dataType);
    if (completeness < criteria.completeness.threshold) {
      issues.push({
        type: 'critical',
        category: 'completeness',
        message: `數據完整性低於閾值: ${(completeness * 100).toFixed(1)}% < ${(criteria.completeness.threshold * 100).toFixed(1)}%`,
      });
    }

    // 檢查準確性問題
    const accuracy = this.calculateAccuracy(data, dataType);
    if (accuracy < criteria.accuracy.threshold) {
      issues.push({
        type: 'critical',
        category: 'accuracy',
        message: `數據準確性低於閾值: ${(accuracy * 100).toFixed(1)}% < ${(criteria.accuracy.threshold * 100).toFixed(1)}%`,
      });
    }

    // 檢查時效性問題
    const timeliness = this.calculateTimeliness(data, dataType);
    if (timeliness < criteria.timeliness.threshold) {
      issues.push({
        type: 'warning',
        category: 'timeliness',
        message: `數據時效性低於閾值: ${(timeliness * 100).toFixed(1)}% < ${(criteria.timeliness.threshold * 100).toFixed(1)}%`,
      });
    }

    return issues;
  }

  /**
   * 計算質量分佈
   */
  calculateQualityDistribution(overallScore) {
    if (overallScore >= 0.9) return { excellent: 1, good: 0, fair: 0, poor: 0 };
    if (overallScore >= 0.7) return { excellent: 0, good: 1, fair: 0, poor: 0 };
    if (overallScore >= 0.5) return { excellent: 0, good: 0, fair: 1, poor: 0 };
    return { excellent: 0, good: 0, fair: 0, poor: 1 };
  }

  /**
   * 生成建議
   */
  generateRecommendations(results, criteria) {
// eslint-disable-next-line no-unused-vars
    const recommendations = [];

    if (results.completeness < criteria.completeness.threshold) {
      recommendations.push({
        priority: 'high',
        category: 'completeness',
        title: '提高數據完整性',
        description: '建議增加數據收集和標註工作，確保必要字段的完整性',
        action: '增加數據收集頻率，改進標註流程',
      });
    }

    if (results.accuracy < criteria.accuracy.threshold) {
      recommendations.push({
        priority: 'high',
        category: 'accuracy',
        title: '提高數據準確性',
        description: '建議改進數據驗證機制和標註質量控制',
        action: '加強標註者培訓，實施更嚴格的審核流程',
      });
    }

    if (results.timeliness < criteria.timeliness.threshold) {
      recommendations.push({
        priority: 'medium',
        category: 'timeliness',
        title: '提高數據時效性',
        description: '建議加快數據更新頻率，減少數據老化',
        action: '優化數據更新流程，實施實時數據同步',
      });
    }

    if (results.overallScore < 0.7) {
      recommendations.push({
        priority: 'critical',
        category: 'overall',
        title: '全面改進數據質量',
        description: '數據質量整體偏低，需要系統性的改進措施',
        action: '制定全面的數據質量改進計劃，定期監控和評估',
      });
    }

    return recommendations;
  }

  /**
   * 計算下次運行時間
   */
  calculateNextRunDate(schedule) {
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    const { frequency } = schedule;

    switch (schedule.assessmentType) {
      case 'daily':
        return new Date(
          now.getTime() + frequency.interval * 24 * 60 * 60 * 1000
        );

      case 'weekly':
// eslint-disable-next-line no-unused-vars
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return this.adjustToNextWeekday(nextWeek, frequency.daysOfWeek);

      case 'monthly':
// eslint-disable-next-line no-unused-vars
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          frequency.dayOfMonth
        );
        return nextMonth;

      case 'quarterly':
// eslint-disable-next-line no-unused-vars
        const nextQuarter = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3 + 3,
          1
        );
        return nextQuarter;

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 默認一天後
    }
  }

  /**
   * 調整到下一個工作日
   */
  adjustToNextWeekday(date, daysOfWeek) {
    if (daysOfWeek.length === 0) return date;

    const currentDay = date.getDay();
// eslint-disable-next-line no-unused-vars
    const nextDay = daysOfWeek.find((day) => day > currentDay) || daysOfWeek[0];
    const daysToAdd =
      nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

    return new Date(date.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  /**
   * 發送評估通知
   */
  async sendAssessmentNotifications(schedule, assessment, status) {
    const settings = schedule.notificationSettings;

    if (status === 'success' && !settings.onSuccess) return;
    if (status === 'failure' && !settings.onFailure) return;
    if (status === 'completion' && !settings.onCompletion) return;

    // 這裡可以實現實際的通知邏輯
    // 例如發送郵件、Slack消息等
    logger.info(`發送評估通知: ${schedule.name}, 狀態: ${status}`);
  }

  /**
   * 獲取評估列表
   */
  async getAssessments(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        assessmentType,
        startDate,
        endDate,
        triggeredBy,
      } = options;

      const where = {};
      if (status) where.status = status;
      if (assessmentType) where.assessmentType = assessmentType;
      if (triggeredBy) where.triggeredBy = triggeredBy;
      if (startDate || endDate) {
        where.assessmentDate = {};
        if (startDate) where.assessmentDate[Op.gte] = startDate;
        if (endDate) where.assessmentDate[Op.lte] = endDate;
      }

// eslint-disable-next-line no-unused-vars
      const assessments = await DataQualityAssessment.findAndCountAll({
        where,
        include: [
          {
            model: require('../models/User'),
            as: 'TriggeredByUser',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [['assessmentDate', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      return {
        assessments: assessments.rows,
        total: assessments.count,
        page,
        limit,
        totalPages: Math.ceil(assessments.count / limit),
      };
    } catch (error) {
      logger.error('獲取評估列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取評估統計
   */
  async getAssessmentStats(options = {}) {
    try {
      const { startDate, endDate, assessmentType } = options;

      const where = {};
      if (startDate || endDate) {
        where.assessmentDate = {};
        if (startDate) where.assessmentDate[Op.gte] = startDate;
        if (endDate) where.assessmentDate[Op.lte] = endDate;
      }
      if (assessmentType) where.assessmentType = assessmentType;

// eslint-disable-next-line no-unused-vars
      const assessments = await DataQualityAssessment.findAll({ where });

      const stats = {
        totalAssessments: assessments.length,
        completedAssessments: assessments.filter(
          (a) => a.status === 'completed'
        ).length,
        failedAssessments: assessments.filter((a) => a.status === 'failed')
          .length,
        averageExecutionTime: 0,
        averageOverallScore: 0,
        statusDistribution: {},
        typeDistribution: {},
        dailyTrend: [],
      };

      if (assessments.length > 0) {
        const completedAssessments = assessments.filter(
          (a) => a.status === 'completed'
        );

        if (completedAssessments.length > 0) {
          stats.averageExecutionTime =
            completedAssessments.reduce(
              (sum, a) => sum + (a.executionTime || 0),
              0
            ) / completedAssessments.length;
          stats.averageOverallScore =
            completedAssessments.reduce(
              (sum, a) => sum + (a.results?.overallScore || 0),
              0
            ) / completedAssessments.length;
        }

        // 狀態分佈
        assessments.forEach((a) => {
          stats.statusDistribution[a.status] =
            (stats.statusDistribution[a.status] || 0) + 1;
          stats.typeDistribution[a.assessmentType] =
            (stats.typeDistribution[a.assessmentType] || 0) + 1;
        });

        // 每日趨勢
        const dailyData = {};
        assessments.forEach((a) => {
          const date = a.assessmentDate.toISOString().split('T')[0];
          if (!dailyData[date])
            dailyData[date] = { total: 0, completed: 0, failed: 0 };
          dailyData[date].total++;
          if (a.status === 'completed') dailyData[date].completed++;
          if (a.status === 'failed') dailyData[date].failed++;
        });

        stats.dailyTrend = Object.entries(dailyData)
          .map(([date, data]) => ({
            date,
            total: data.total,
            completed: data.completed,
            failed: data.failed,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }

      return stats;
    } catch (error) {
      logger.error('獲取評估統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取計劃列表
   */
  async getSchedules(options = {}) {
    try {
      const { page = 1, limit = 20, isActive, assessmentType } = options;

      const where = {};
      if (isActive !== undefined) where.isActive = isActive;
      if (assessmentType) where.assessmentType = assessmentType;

// eslint-disable-next-line no-unused-vars
      const schedules = await AssessmentSchedule.findAndCountAll({
        where,
        include: [
          {
            model: require('../models/User'),
            as: 'CreatedByUser',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      return {
        schedules: schedules.rows,
        total: schedules.count,
        page,
        limit,
        totalPages: Math.ceil(schedules.count / limit),
      };
    } catch (error) {
      logger.error('獲取計劃列表失敗:', error);
      throw error;
    }
  }

  /**
   * 更新計劃狀態
   */
  async updateScheduleStatus(scheduleId, isActive) {
    try {
// eslint-disable-next-line no-unused-vars
      const schedule = await AssessmentSchedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('評估計劃不存在');
      }

      schedule.isActive = isActive;
      await schedule.save();

      logger.info(
        `評估計劃狀態更新: ${schedule.name}, 狀態: ${isActive ? '啟用' : '停用'}`
      );
      return schedule;
    } catch (error) {
      logger.error('更新計劃狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除評估計劃
   */
  async deleteSchedule(scheduleId) {
    try {
// eslint-disable-next-line no-unused-vars
      const schedule = await AssessmentSchedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('評估計劃不存在');
      }

      await schedule.destroy();
      logger.info(`評估計劃刪除成功: ${schedule.name}`);
      return true;
    } catch (error) {
      logger.error('刪除評估計劃失敗:', error);
      throw error;
    }
  }
}

module.exports = new AssessmentService();
