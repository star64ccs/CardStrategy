const Feedback = require('../models/Feedback');
const FeedbackResponse = require('../models/FeedbackResponse');
const FeedbackAnalytics = require('../models/FeedbackAnalytics');
const User = require('../models/User');
const logger = require('../utils/logger');

class FeedbackService {
  /**
   * 提交反饋
   */
  async submitFeedback(feedbackData) {
    try {
      const feedback = await Feedback.create({
        userId: feedbackData.userId,
        feedbackType: feedbackData.feedbackType,
        category: feedbackData.category,
        severity: feedbackData.severity,
        title: feedbackData.title,
        description: feedbackData.description,
        priority: this.calculatePriority(feedbackData.severity, feedbackData.category),
        tags: feedbackData.tags || [],
        attachments: feedbackData.attachments || [],
        metadata: feedbackData.metadata || {}
      });

      // 更新分析數據
      await this.updateFeedbackAnalytics(feedback);

      // 生成自動回應
      await this.generateAutoResponse(feedback);

      logger.info(`反饋已提交: ID ${feedback.id}, 類型: ${feedback.feedbackType}`);
      return feedback;
    } catch (error) {
      logger.error('提交反饋時出錯:', error);
      throw error;
    }
  }

  /**
   * 計算優先級
   */
  calculatePriority(severity, category) {
    const severityWeight = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };

    const categoryWeight = {
      'card_recognition': 3,
      'centering_evaluation': 2,
      'authenticity_verification': 3,
      'price_prediction': 2,
      'data_collection': 1,
      'annotation_process': 1,
      'general': 1
    };

    const score = severityWeight[severity] * categoryWeight[category];

    if (score >= 12) return 'urgent';
    if (score >= 8) return 'high';
    if (score >= 4) return 'normal';
    return 'low';
  }

  /**
   * 更新反饋分析數據
   */
  async updateFeedbackAnalytics(feedback) {
    try {
      const today = new Date().toISOString().split('T')[0];

      let analytics = await FeedbackAnalytics.findOne({
        where: {
          date: today,
          feedbackType: feedback.feedbackType,
          category: feedback.category
        }
      });

      if (!analytics) {
        analytics = await FeedbackAnalytics.create({
          date: today,
          feedbackType: feedback.feedbackType,
          category: feedback.category,
          totalSubmitted: 0,
          totalResolved: 0,
          priorityDistribution: {},
          statusDistribution: {},
          severityDistribution: {}
        });
      }

      // 更新統計數據
      analytics.totalSubmitted += 1;

      // 更新分佈數據
      const priorityDist = analytics.priorityDistribution || {};
      priorityDist[feedback.priority] = (priorityDist[feedback.priority] || 0) + 1;

      const statusDist = analytics.statusDistribution || {};
      statusDist[feedback.status] = (statusDist[feedback.status] || 0) + 1;

      const severityDist = analytics.severityDistribution || {};
      severityDist[feedback.severity] = (severityDist[feedback.severity] || 0) + 1;

      await analytics.update({
        totalSubmitted: analytics.totalSubmitted,
        priorityDistribution: priorityDist,
        statusDistribution: statusDist,
        severityDistribution: severityDist
      });

      logger.info(`反饋分析數據已更新: ${today}`);
    } catch (error) {
      logger.error('更新反饋分析數據時出錯:', error);
    }
  }

  /**
   * 生成自動回應
   */
  async generateAutoResponse(feedback) {
    try {
      const autoResponse = this.generateAutoResponseContent(feedback);

      await FeedbackResponse.create({
        feedbackId: feedback.id,
        userId: 1, // 系統用戶ID
        responseType: 'comment',
        content: autoResponse,
        isInternal: false
      });

      logger.info(`自動回應已生成: 反饋ID ${feedback.id}`);
    } catch (error) {
      logger.error('生成自動回應時出錯:', error);
    }
  }

  /**
   * 生成自動回應內容
   */
  generateAutoResponseContent(feedback) {
    const responses = {
      'data_quality': {
        'card_recognition': '感謝您的反饋！我們會仔細分析卡牌辨識的準確性問題，並持續改進AI模型。',
        'centering_evaluation': '感謝您對置中評估功能的關注！我們會優化評估算法以提高準確性。',
        'authenticity_verification': '感謝您的反饋！防偽判斷是我們的重點功能，我們會持續改進。',
        'price_prediction': '感謝您對價格預測功能的反饋！我們會分析並優化預測模型。',
        'data_collection': '感謝您的建議！我們會改進數據收集流程以提高質量。',
        'annotation_process': '感謝您的反饋！我們會優化標註流程以提高效率。',
        'general': '感謝您的反饋！我們會認真考慮您的建議。'
      },
      'annotation_quality': '感謝您對標註質量的關注！我們會加強質量控制流程。',
      'system_suggestion': '感謝您的建議！我們會評估並考慮實施您的想法。',
      'bug_report': '感謝您的錯誤報告！我們會盡快修復這個問題。',
      'feature_request': '感謝您的功能請求！我們會評估並考慮在未來版本中實現。'
    };

    const categoryResponse = responses[feedback.feedbackType];
    if (typeof categoryResponse === 'string') {
      return categoryResponse;
    }

    return categoryResponse[feedback.category] || categoryResponse['general'] || '感謝您的反饋！';
  }

  /**
   * 獲取反饋列表
   */
  async getFeedbacks(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        feedbackType,
        category,
        severity,
        assignedTo,
        startDate,
        endDate,
        userId
      } = options;

      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (feedbackType) where.feedbackType = feedbackType;
      if (category) where.category = category;
      if (severity) where.severity = severity;
      if (assignedTo) where.assignedTo = assignedTo;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.createdAt = {
          [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Feedback.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['id', 'username']
          },
          {
            model: FeedbackResponse,
            as: 'responses',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ],
            order: [['createdAt', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        feedbacks: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('獲取反饋列表時出錯:', error);
      throw error;
    }
  }

  /**
   * 獲取單個反饋詳情
   */
  async getFeedbackById(feedbackId) {
    try {
      const feedback = await Feedback.findByPk(feedbackId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['id', 'username']
          },
          {
            model: User,
            as: 'resolvedByUser',
            attributes: ['id', 'username']
          },
          {
            model: FeedbackResponse,
            as: 'responses',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ],
            order: [['createdAt', 'ASC']]
          }
        ]
      });

      if (!feedback) {
        throw new Error('反饋不存在');
      }

      return feedback;
    } catch (error) {
      logger.error('獲取反饋詳情時出錯:', error);
      throw error;
    }
  }

  /**
   * 更新反饋狀態
   */
  async updateFeedbackStatus(feedbackId, status, userId, resolution = null) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('反饋不存在');
      }

      const updateData = { status };
      if (status === 'resolved' && resolution) {
        updateData.resolution = resolution;
        updateData.resolutionDate = new Date();
        updateData.resolvedBy = userId;
      }

      await feedback.update(updateData);

      // 添加狀態更新回應
      await FeedbackResponse.create({
        feedbackId,
        userId,
        responseType: 'status_update',
        content: `狀態已更新為: ${status}${resolution ? `\n\n解決方案: ${resolution}` : ''}`,
        isInternal: false
      });

      // 更新分析數據
      if (status === 'resolved') {
        await this.updateResolutionAnalytics(feedback);
      }

      logger.info(`反饋狀態已更新: ID ${feedbackId}, 狀態: ${status}`);
      return feedback;
    } catch (error) {
      logger.error('更新反饋狀態時出錯:', error);
      throw error;
    }
  }

  /**
   * 分配反饋
   */
  async assignFeedback(feedbackId, assignedTo, userId) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('反饋不存在');
      }

      await feedback.update({ assignedTo });

      // 添加分配回應
      await FeedbackResponse.create({
        feedbackId,
        userId,
        responseType: 'assignment',
        content: `已分配給用戶 ID: ${assignedTo}`,
        isInternal: true
      });

      logger.info(`反饋已分配: ID ${feedbackId}, 分配給: ${assignedTo}`);
      return feedback;
    } catch (error) {
      logger.error('分配反饋時出錯:', error);
      throw error;
    }
  }

  /**
   * 添加回應
   */
  async addResponse(feedbackId, userId, content, responseType = 'comment', isInternal = false) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('反饋不存在');
      }

      const response = await FeedbackResponse.create({
        feedbackId,
        userId,
        responseType,
        content,
        isInternal
      });

      logger.info(`回應已添加: 反饋ID ${feedbackId}, 類型: ${responseType}`);
      return response;
    } catch (error) {
      logger.error('添加回應時出錯:', error);
      throw error;
    }
  }

  /**
   * 更新解決分析數據
   */
  async updateResolutionAnalytics(feedback) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const analytics = await FeedbackAnalytics.findOne({
        where: {
          date: today,
          feedbackType: feedback.feedbackType,
          category: feedback.category
        }
      });

      if (analytics) {
        analytics.totalResolved += 1;

        // 計算平均解決時間
        const resolutionTime = (new Date() - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24); // 天
        const currentAvg = analytics.averageResolutionTime || 0;
        const {totalResolved} = analytics;

        analytics.averageResolutionTime = (currentAvg * (totalResolved - 1) + resolutionTime) / totalResolved;

        await analytics.save();
      }
    } catch (error) {
      logger.error('更新解決分析數據時出錯:', error);
    }
  }

  /**
   * 獲取反饋統計
   */
  async getFeedbackStats(options = {}) {
    try {
      const {
        startDate,
        endDate,
        feedbackType,
        category
      } = options;

      const where = {};
      if (startDate && endDate) {
        where.date = {
          [require('sequelize').Op.between]: [startDate, endDate]
        };
      }
      if (feedbackType) where.feedbackType = feedbackType;
      if (category) where.category = category;

      const analytics = await FeedbackAnalytics.findAll({ where });

      const stats = {
        totalSubmitted: 0,
        totalResolved: 0,
        averageResolutionTime: 0,
        feedbackTypeDistribution: {},
        categoryDistribution: {},
        priorityDistribution: {},
        statusDistribution: {},
        severityDistribution: {},
        dailyTrend: []
      };

      analytics.forEach(record => {
        stats.totalSubmitted += record.totalSubmitted;
        stats.totalResolved += record.totalResolved;

        // 累積平均解決時間
        if (record.averageResolutionTime) {
          stats.averageResolutionTime = (stats.averageResolutionTime + record.averageResolutionTime) / 2;
        }

        // 分佈統計
        stats.feedbackTypeDistribution[record.feedbackType] =
          (stats.feedbackTypeDistribution[record.feedbackType] || 0) + record.totalSubmitted;

        stats.categoryDistribution[record.category] =
          (stats.categoryDistribution[record.category] || 0) + record.totalSubmitted;

        // 合併分佈數據
        Object.entries(record.priorityDistribution || {}).forEach(([priority, count]) => {
          stats.priorityDistribution[priority] = (stats.priorityDistribution[priority] || 0) + count;
        });

        Object.entries(record.statusDistribution || {}).forEach(([status, count]) => {
          stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + count;
        });

        Object.entries(record.severityDistribution || {}).forEach(([severity, count]) => {
          stats.severityDistribution[severity] = (stats.severityDistribution[severity] || 0) + count;
        });

        // 每日趨勢
        stats.dailyTrend.push({
          date: record.date,
          submitted: record.totalSubmitted,
          resolved: record.totalResolved
        });
      });

      stats.dailyTrend.sort((a, b) => new Date(a.date) - new Date(b.date));

      return stats;
    } catch (error) {
      logger.error('獲取反饋統計時出錯:', error);
      throw error;
    }
  }

  /**
   * 生成改進建議
   */
  async generateImprovementSuggestions() {
    try {
      const stats = await this.getFeedbackStats();
      const suggestions = [];

      // 基於反饋類型的建議
      const typeStats = stats.feedbackTypeDistribution;
      const mostCommonType = Object.keys(typeStats).reduce((a, b) => (typeStats[a] > typeStats[b] ? a : b));

      if (mostCommonType === 'data_quality') {
        suggestions.push({
          priority: 'high',
          category: 'data_quality',
          title: '加強數據質量控制',
          description: '數據質量反饋較多，建議加強數據收集和驗證流程',
          action: 'review_data_collection_process'
        });
      }

      if (mostCommonType === 'bug_report') {
        suggestions.push({
          priority: 'urgent',
          category: 'bug_fixes',
          title: '優先處理錯誤報告',
          description: '錯誤報告數量較多，建議優先處理和修復',
          action: 'prioritize_bug_fixes'
        });
      }

      // 基於解決時間的建議
      if (stats.averageResolutionTime > 7) {
        suggestions.push({
          priority: 'high',
          category: 'process_improvement',
          title: '優化反饋處理流程',
          description: '平均解決時間較長，建議優化處理流程',
          action: 'optimize_feedback_process'
        });
      }

      // 基於解決率的建議
      const resolutionRate = stats.totalResolved / stats.totalSubmitted;
      if (resolutionRate < 0.8) {
        suggestions.push({
          priority: 'medium',
          category: 'process_improvement',
          title: '提高反饋解決率',
          description: '反饋解決率較低，建議加強跟進機制',
          action: 'improve_follow_up_process'
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('生成改進建議時出錯:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
