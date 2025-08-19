const { DataQualityMetrics, TrainingData, AnnotationData, Annotator, Card, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class DataQualityMonitoringService {
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date(),
      dataTypes = ['training', 'annotation', 'validation', 'market', 'user_generated']
    } = options;

    try {
      const [
        overallMetrics,
        trendData,
        sourceBreakdown,
        qualityDistribution,
        annotatorPerformance,
        recentIssues,
        improvementSuggestions
      ] = await Promise.all([
        this.getOverallMetrics(startDate, endDate, dataTypes),
        this.getTrendData(startDate, endDate, dataTypes),
        this.getSourceBreakdown(startDate, endDate),
        this.getQualityDistribution(startDate, endDate),
        this.getAnnotatorPerformance(startDate, endDate),
        this.getRecentIssues(startDate, endDate),
        this.getImprovementSuggestions()
      ]);

      return {
        overallMetrics,
        trendData,
        sourceBreakdown,
        qualityDistribution,
        annotatorPerformance,
        recentIssues,
        improvementSuggestions,
        lastUpdated: new Date(),
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }

  /**
   * Get overall quality metrics
   */
  async getOverallMetrics(startDate, endDate, dataTypes) {
    try {
      const metrics = await DataQualityMetrics.findAll({
        where: {
          dataType: { [Op.in]: dataTypes },
          assessmentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['assessmentDate', 'DESC']]
      });

      if (metrics.length === 0) {
        return {
          averageCompleteness: 0,
          averageAccuracy: 0,
          averageConsistency: 0,
          averageTimeliness: 0,
          overallScore: 0,
          totalAssessments: 0
        };
      }

      const totals = metrics.reduce((acc, metric) => {
        acc.completeness += metric.completeness;
        acc.accuracy += metric.accuracy;
        acc.consistency += metric.consistency;
        acc.timeliness += metric.timeliness;
        acc.overallScore += metric.overallScore;
        return acc;
      }, { completeness: 0, accuracy: 0, consistency: 0, timeliness: 0, overallScore: 0 });

      const count = metrics.length;

      return {
        averageCompleteness: Math.round((totals.completeness / count) * 100) / 100,
        averageAccuracy: Math.round((totals.accuracy / count) * 100) / 100,
        averageConsistency: Math.round((totals.consistency / count) * 100) / 100,
        averageTimeliness: Math.round((totals.timeliness / count) * 100) / 100,
        overallScore: Math.round((totals.overallScore / count) * 100) / 100,
        totalAssessments: count
      };
    } catch (error) {
      logger.error('Error getting overall metrics:', error);
      throw new Error('Failed to get overall metrics');
    }
  }

  /**
   * Get trend data for charts
   */
  async getTrendData(startDate, endDate, dataTypes) {
    try {
      const metrics = await DataQualityMetrics.findAll({
        where: {
          dataType: { [Op.in]: dataTypes },
          assessmentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['assessmentDate', 'ASC']],
        attributes: [
          'assessmentDate',
          'dataType',
          'completeness',
          'accuracy',
          'consistency',
          'timeliness',
          'overallScore'
        ]
      });

      // Group by date and data type
      const groupedData = {};
      const dateLabels = [];

      metrics.forEach(metric => {
        const date = metric.assessmentDate.toISOString().split('T')[0];
        if (!dateLabels.includes(date)) {
          dateLabels.push(date);
        }

        if (!groupedData[metric.dataType]) {
          groupedData[metric.dataType] = {};
        }

        if (!groupedData[metric.dataType][date]) {
          groupedData[metric.dataType][date] = {
            completeness: [],
            accuracy: [],
            consistency: [],
            timeliness: [],
            overallScore: []
          };
        }

        groupedData[metric.dataType][date].completeness.push(metric.completeness);
        groupedData[metric.dataType][date].accuracy.push(metric.accuracy);
        groupedData[metric.dataType][date].consistency.push(metric.consistency);
        groupedData[metric.dataType][date].timeliness.push(metric.timeliness);
        groupedData[metric.dataType][date].overallScore.push(metric.overallScore);
      });

      // Calculate averages for each date and data type
      const trendData = {};
      Object.keys(groupedData).forEach(dataType => {
        trendData[dataType] = {
          completeness: [],
          accuracy: [],
          consistency: [],
          timeliness: [],
          overallScore: []
        };

        dateLabels.forEach(date => {
          if (groupedData[dataType][date]) {
            const data = groupedData[dataType][date];
            trendData[dataType].completeness.push(
              data.completeness.reduce((a, b) => a + b, 0) / data.completeness.length
            );
            trendData[dataType].accuracy.push(
              data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length
            );
            trendData[dataType].consistency.push(
              data.consistency.reduce((a, b) => a + b, 0) / data.consistency.length
            );
            trendData[dataType].timeliness.push(
              data.timeliness.reduce((a, b) => a + b, 0) / data.timeliness.length
            );
            trendData[dataType].overallScore.push(
              data.overallScore.reduce((a, b) => a + b, 0) / data.overallScore.length
            );
          } else {
            trendData[dataType].completeness.push(0);
            trendData[dataType].accuracy.push(0);
            trendData[dataType].consistency.push(0);
            trendData[dataType].timeliness.push(0);
            trendData[dataType].overallScore.push(0);
          }
        });
      });

      return {
        dateLabels,
        trendData
      };
    } catch (error) {
      logger.error('Error getting trend data:', error);
      throw new Error('Failed to get trend data');
    }
  }

  /**
   * Get data source breakdown
   */
  async getSourceBreakdown(startDate, endDate) {
    try {
      const trainingData = await TrainingData.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['source', 'quality', 'status']
      });

      const sourceStats = {};
      const qualityStats = {};
      const statusStats = {};

      trainingData.forEach(data => {
        // Source breakdown
        if (!sourceStats[data.source]) {
          sourceStats[data.source] = 0;
        }
        sourceStats[data.source]++;

        // Quality breakdown
        if (!qualityStats[data.quality]) {
          qualityStats[data.quality] = 0;
        }
        qualityStats[data.quality]++;

        // Status breakdown
        if (!statusStats[data.status]) {
          statusStats[data.status] = 0;
        }
        statusStats[data.status]++;
      });

      return {
        sourceBreakdown: Object.entries(sourceStats).map(([source, count]) => ({
          source,
          count,
          percentage: Math.round((count / trainingData.length) * 100)
        })),
        qualityBreakdown: Object.entries(qualityStats).map(([quality, count]) => ({
          quality,
          count,
          percentage: Math.round((count / trainingData.length) * 100)
        })),
        statusBreakdown: Object.entries(statusStats).map(([status, count]) => ({
          status,
          count,
          percentage: Math.round((count / trainingData.length) * 100)
        })),
        totalRecords: trainingData.length
      };
    } catch (error) {
      logger.error('Error getting source breakdown:', error);
      throw new Error('Failed to get source breakdown');
    }
  }

  /**
   * Get quality distribution
   */
  async getQualityDistribution(startDate, endDate) {
    try {
      const metrics = await DataQualityMetrics.findAll({
        where: {
          assessmentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['overallScore', 'dataType']
      });

      const distribution = {
        excellent: { count: 0, percentage: 0 },
        good: { count: 0, percentage: 0 },
        fair: { count: 0, percentage: 0 },
        poor: { count: 0, percentage: 0 }
      };

      const typeDistribution = {};

      metrics.forEach(metric => {
        // Overall distribution
        if (metric.overallScore >= 0.9) {
          distribution.excellent.count++;
        } else if (metric.overallScore >= 0.7) {
          distribution.good.count++;
        } else if (metric.overallScore >= 0.5) {
          distribution.fair.count++;
        } else {
          distribution.poor.count++;
        }

        // Type distribution
        if (!typeDistribution[metric.dataType]) {
          typeDistribution[metric.dataType] = {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0,
            total: 0
          };
        }

        typeDistribution[metric.dataType].total++;
        if (metric.overallScore >= 0.9) {
          typeDistribution[metric.dataType].excellent++;
        } else if (metric.overallScore >= 0.7) {
          typeDistribution[metric.dataType].good++;
        } else if (metric.overallScore >= 0.5) {
          typeDistribution[metric.dataType].fair++;
        } else {
          typeDistribution[metric.dataType].poor++;
        }
      });

      const total = metrics.length;
      if (total > 0) {
        distribution.excellent.percentage = Math.round((distribution.excellent.count / total) * 100);
        distribution.good.percentage = Math.round((distribution.good.count / total) * 100);
        distribution.fair.percentage = Math.round((distribution.fair.count / total) * 100);
        distribution.poor.percentage = Math.round((distribution.poor.count / total) * 100);
      }

      // Calculate percentages for type distribution
      Object.keys(typeDistribution).forEach(type => {
        const typeData = typeDistribution[type];
        if (typeData.total > 0) {
          typeData.excellentPercentage = Math.round((typeData.excellent / typeData.total) * 100);
          typeData.goodPercentage = Math.round((typeData.good / typeData.total) * 100);
          typeData.fairPercentage = Math.round((typeData.fair / typeData.total) * 100);
          typeData.poorPercentage = Math.round((typeData.poor / typeData.total) * 100);
        }
      });

      return {
        overallDistribution: distribution,
        typeDistribution,
        totalAssessments: total
      };
    } catch (error) {
      logger.error('Error getting quality distribution:', error);
      throw new Error('Failed to get quality distribution');
    }
  }

  /**
   * Get annotator performance metrics
   */
  async getAnnotatorPerformance(startDate, endDate) {
    try {
      const annotations = await AnnotationData.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: Annotator,
            include: [{ model: User, attributes: ['username'] }]
          }
        ],
        attributes: [
          'annotatorId',
          'annotationType',
          'confidence',
          'reviewStatus',
          'processingTime',
          'createdAt'
        ]
      });

      const annotatorStats = {};
      const typeStats = {};

      annotations.forEach(annotation => {
        const {annotatorId} = annotation;
        const {annotationType} = annotation;

        // Annotator stats
        if (!annotatorStats[annotatorId]) {
          annotatorStats[annotatorId] = {
            username: annotation.Annotator?.User?.username || `Annotator-${annotatorId}`,
            totalAnnotations: 0,
            approvedAnnotations: 0,
            rejectedAnnotations: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            confidenceSum: 0,
            processingTimeSum: 0
          };
        }

        annotatorStats[annotatorId].totalAnnotations++;
        annotatorStats[annotatorId].confidenceSum += annotation.confidence || 0;
        annotatorStats[annotatorId].processingTimeSum += annotation.processingTime || 0;

        if (annotation.reviewStatus === 'approved') {
          annotatorStats[annotatorId].approvedAnnotations++;
        } else if (annotation.reviewStatus === 'rejected') {
          annotatorStats[annotatorId].rejectedAnnotations++;
        }

        // Type stats
        if (!typeStats[annotationType]) {
          typeStats[annotationType] = {
            totalAnnotations: 0,
            approvedAnnotations: 0,
            rejectedAnnotations: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            confidenceSum: 0,
            processingTimeSum: 0
          };
        }

        typeStats[annotationType].totalAnnotations++;
        typeStats[annotationType].confidenceSum += annotation.confidence || 0;
        typeStats[annotationType].processingTimeSum += annotation.processingTime || 0;

        if (annotation.reviewStatus === 'approved') {
          typeStats[annotationType].approvedAnnotations++;
        } else if (annotation.reviewStatus === 'rejected') {
          typeStats[annotationType].rejectedAnnotations++;
        }
      });

      // Calculate averages
      Object.keys(annotatorStats).forEach(annotatorId => {
        const stats = annotatorStats[annotatorId];
        if (stats.totalAnnotations > 0) {
          stats.averageConfidence = Math.round((stats.confidenceSum / stats.totalAnnotations) * 100) / 100;
          stats.averageProcessingTime = Math.round(stats.processingTimeSum / stats.totalAnnotations);
          stats.approvalRate = Math.round((stats.approvedAnnotations / stats.totalAnnotations) * 100);
        }
      });

      Object.keys(typeStats).forEach(type => {
        const stats = typeStats[type];
        if (stats.totalAnnotations > 0) {
          stats.averageConfidence = Math.round((stats.confidenceSum / stats.totalAnnotations) * 100) / 100;
          stats.averageProcessingTime = Math.round(stats.processingTimeSum / stats.totalAnnotations);
          stats.approvalRate = Math.round((stats.approvedAnnotations / stats.totalAnnotations) * 100);
        }
      });

      return {
        annotatorStats: Object.values(annotatorStats),
        typeStats: Object.entries(typeStats).map(([type, stats]) => ({
          type,
          ...stats
        })),
        totalAnnotations: annotations.length
      };
    } catch (error) {
      logger.error('Error getting annotator performance:', error);
      throw new Error('Failed to get annotator performance');
    }
  }

  /**
   * Get recent quality issues
   */
  async getRecentIssues(startDate, endDate) {
    try {
      const issues = [];

      // Low quality metrics
      const lowQualityMetrics = await DataQualityMetrics.findAll({
        where: {
          overallScore: { [Op.lt]: 0.6 },
          assessmentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['assessmentDate', 'DESC']],
        limit: 10
      });

      lowQualityMetrics.forEach(metric => {
        issues.push({
          type: 'low_quality',
          severity: 'high',
          title: `Low Quality Data: ${metric.dataType}`,
          description: `Overall score: ${metric.overallScore}, Completeness: ${metric.completeness}, Accuracy: ${metric.accuracy}`,
          date: metric.assessmentDate,
          dataType: metric.dataType,
          score: metric.overallScore
        });
      });

      // Rejected annotations
      const rejectedAnnotations = await AnnotationData.findAll({
        where: {
          reviewStatus: 'rejected',
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: Annotator,
            include: [{ model: User, attributes: ['username'] }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      rejectedAnnotations.forEach(annotation => {
        issues.push({
          type: 'rejected_annotation',
          severity: 'medium',
          title: `Rejected Annotation: ${annotation.annotationType}`,
          description: `Annotator: ${annotation.Annotator?.User?.username || 'Unknown'}, Review notes: ${annotation.reviewNotes || 'No notes'}`,
          date: annotation.createdAt,
          annotationType: annotation.annotationType,
          annotatorId: annotation.annotatorId
        });
      });

      // Sort by date and return top 20
      return issues
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    } catch (error) {
      logger.error('Error getting recent issues:', error);
      throw new Error('Failed to get recent issues');
    }
  }

  /**
   * Get improvement suggestions
   */
  async getImprovementSuggestions() {
    try {
      const suggestions = [];

      // Get recent metrics
      const recentMetrics = await DataQualityMetrics.findAll({
        order: [['assessmentDate', 'DESC']],
        limit: 100
      });

      if (recentMetrics.length === 0) {
        return suggestions;
      }

      // Calculate averages
      const averages = recentMetrics.reduce((acc, metric) => {
        acc.completeness += metric.completeness;
        acc.accuracy += metric.accuracy;
        acc.consistency += metric.consistency;
        acc.timeliness += metric.timeliness;
        acc.overallScore += metric.overallScore;
        return acc;
      }, { completeness: 0, accuracy: 0, consistency: 0, timeliness: 0, overallScore: 0 });

      const count = recentMetrics.length;
      averages.completeness /= count;
      averages.accuracy /= count;
      averages.consistency /= count;
      averages.timeliness /= count;
      averages.overallScore /= count;

      // Generate suggestions based on low scores
      if (averages.completeness < 0.8) {
        suggestions.push({
          priority: 'high',
          category: 'data_collection',
          title: 'Improve Data Completeness',
          description: `Current completeness score is ${Math.round(averages.completeness * 100)}%. Consider expanding data collection sources and improving data capture processes.`,
          action: 'Review data collection processes and add missing data sources'
        });
      }

      if (averages.accuracy < 0.8) {
        suggestions.push({
          priority: 'high',
          category: 'annotation',
          title: 'Improve Annotation Accuracy',
          description: `Current accuracy score is ${Math.round(averages.accuracy * 100)}%. Consider improving annotator training and quality control processes.`,
          action: 'Enhance annotator training and implement stricter quality controls'
        });
      }

      if (averages.consistency < 0.8) {
        suggestions.push({
          priority: 'medium',
          category: 'data_cleaning',
          title: 'Improve Data Consistency',
          description: `Current consistency score is ${Math.round(averages.consistency * 100)}%. Consider standardizing data formats and validation rules.`,
          action: 'Implement data standardization and validation rules'
        });
      }

      if (averages.timeliness < 0.8) {
        suggestions.push({
          priority: 'medium',
          category: 'processing',
          title: 'Improve Data Timeliness',
          description: `Current timeliness score is ${Math.round(averages.timeliness * 100)}%. Consider optimizing data processing pipelines.`,
          action: 'Optimize data processing and update frequencies'
        });
      }

      // Check for specific data type issues
      const typeAverages = {};
      recentMetrics.forEach(metric => {
        if (!typeAverages[metric.dataType]) {
          typeAverages[metric.dataType] = { count: 0, totalScore: 0 };
        }
        typeAverages[metric.dataType].count++;
        typeAverages[metric.dataType].totalScore += metric.overallScore;
      });

      Object.entries(typeAverages).forEach(([dataType, stats]) => {
        const averageScore = stats.totalScore / stats.count;
        if (averageScore < 0.7) {
          suggestions.push({
            priority: 'medium',
            category: 'specific_type',
            title: `Improve ${dataType} Data Quality`,
            description: `${dataType} data has an average score of ${Math.round(averageScore * 100)}%.`,
            action: `Focus improvement efforts on ${dataType} data collection and processing`
          });
        }
      });

      return suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      logger.error('Error getting improvement suggestions:', error);
      throw new Error('Failed to get improvement suggestions');
    }
  }

  /**
   * Get real-time alerts
   */
  async getRealTimeAlerts() {
    try {
      const alerts = [];

      // Check for recent low quality data
      const recentLowQuality = await DataQualityMetrics.findOne({
        where: {
          overallScore: { [Op.lt]: 0.5 },
          assessmentDate: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (recentLowQuality) {
        alerts.push({
          type: 'critical',
          title: 'Critical: Low Quality Data Detected',
          message: `Data quality score dropped to ${Math.round(recentLowQuality.overallScore * 100)}%`,
          timestamp: new Date()
        });
      }

      // Check for annotation backlog
      const pendingAnnotations = await AnnotationData.count({
        where: {
          reviewStatus: 'pending',
          createdAt: {
            [Op.lt]: new Date(Date.now() - 2 * 60 * 60 * 1000) // Older than 2 hours
          }
        }
      });

      if (pendingAnnotations > 50) {
        alerts.push({
          type: 'warning',
          title: 'Warning: Annotation Backlog',
          message: `${pendingAnnotations} annotations pending review for more than 2 hours`,
          timestamp: new Date()
        });
      }

      // Check for annotator inactivity
      const inactiveAnnotators = await Annotator.count({
        where: {
          lastActiveDate: {
            [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Inactive for 7 days
          }
        }
      });

      if (inactiveAnnotators > 0) {
        alerts.push({
          type: 'info',
          title: 'Info: Inactive Annotators',
          message: `${inactiveAnnotators} annotators have been inactive for more than 7 days`,
          timestamp: new Date()
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting real-time alerts:', error);
      throw new Error('Failed to get real-time alerts');
    }
  }
}

module.exports = new DataQualityMonitoringService();
