const { Op } = require('sequelize');
const getTrainingDataModel = require('../models/TrainingData');
const getCardModel = require('../models/Card');
const getDataQualityMetricsModel = require('../models/DataQualityMetrics');
const logger = require('../utils/logger');

class DataCollectionService {
  constructor() {
    this.TrainingData = null;
    this.Card = null;
    this.DataQualityMetrics = null;
  }

  async initializeModels() {
    if (!this.TrainingData) this.TrainingData = getTrainingDataModel();
    if (!this.Card) this.Card = getCardModel();
    if (!this.DataQualityMetrics) this.DataQualityMetrics = getDataQualityMetricsModel();

    if (!this.TrainingData || !this.Card || !this.DataQualityMetrics) {
      throw new Error('Failed to initialize data collection service models');
    }
  }

  // 從多個來源收集數據
  async collectFromMultipleSources() {
    try {
      await this.initializeModels();
      logger.info('開始從多個來源收集數據...');

      const collectionTasks = [
        this.collectFromUserUploads(),
        this.collectFromOfficialAPIs(),
        this.collectFromThirdPartyPlatforms(),
        this.collectFromUserCorrections(),
        this.collectFromWebScraping()
      ];

      const results = await Promise.allSettled(collectionTasks);
      const processedResults = this.processCollectionResults(results);

      // 更新數據質量指標
      await this.updateDataQualityMetrics(processedResults);

      logger.info(`數據收集完成: ${processedResults.totalCollected} 條記錄`);
      return processedResults;
    } catch (error) {
      logger.error('數據收集失敗:', error);
      throw error;
    }
  }

  // 從用戶上傳收集數據
  async collectFromUserUploads() {
    try {
      logger.info('收集用戶上傳的數據...');

      // 這裡應該從用戶上傳的圖片中收集數據
      // 實際實現中會從文件系統或雲存儲中讀取
      const userUploads = await this.TrainingData.findAll({
        where: {
          source: 'user_upload',
          status: 'pending',
          isActive: true
        },
        limit: 100
      });

      return {
        source: 'user_upload',
        count: userUploads.length,
        data: userUploads,
        quality: 'medium'
      };
    } catch (error) {
      logger.error('收集用戶上傳數據失敗:', error);
      return { source: 'user_upload', count: 0, data: [], quality: 'low' };
    }
  }

  // 從官方API收集數據
  async collectFromOfficialAPIs() {
    try {
      logger.info('從官方API收集數據...');

      // 模擬從官方API收集數據
      const officialData = [
        {
          cardId: 1,
          imageData: 'base64_image_data_1',
          source: 'official_api',
          quality: 'high',
          metadata: {
            uploadDate: new Date(),
            confidence: 0.95,
            processingTime: 1500,
            imageSize: 2048576,
            imageFormat: 'JPEG',
            imageDimensions: { width: 800, height: 600 },
            lightingConditions: 'good',
            imageQuality: 'high',
            uploadSource: 'official_yugioh_api'
          }
        }
      ];

      // 批量保存到數據庫
      const savedData = await this.TrainingData.bulkCreate(officialData);

      return {
        source: 'official_api',
        count: savedData.length,
        data: savedData,
        quality: 'high'
      };
    } catch (error) {
      logger.error('從官方API收集數據失敗:', error);
      return { source: 'official_api', count: 0, data: [], quality: 'low' };
    }
  }

  // 從第三方平台收集數據
  async collectFromThirdPartyPlatforms() {
    try {
      logger.info('從第三方平台收集數據...');

      // 模擬從第三方平台收集數據
      const thirdPartyData = [
        {
          cardId: 2,
          imageData: 'base64_image_data_2',
          source: 'third_party',
          quality: 'medium',
          metadata: {
            uploadDate: new Date(),
            confidence: 0.85,
            processingTime: 2000,
            imageSize: 1536000,
            imageFormat: 'PNG',
            imageDimensions: { width: 640, height: 480 },
            lightingConditions: 'medium',
            imageQuality: 'medium',
            uploadSource: 'tcgplayer_api'
          }
        }
      ];

      const savedData = await this.TrainingData.bulkCreate(thirdPartyData);

      return {
        source: 'third_party',
        count: savedData.length,
        data: savedData,
        quality: 'medium'
      };
    } catch (error) {
      logger.error('從第三方平台收集數據失敗:', error);
      return { source: 'third_party', count: 0, data: [], quality: 'low' };
    }
  }

  // 從用戶糾正收集數據
  async collectFromUserCorrections() {
    try {
      logger.info('收集用戶糾正數據...');

      // 從AI分析記錄中收集用戶糾正
      const corrections = await this.TrainingData.findAll({
        where: {
          source: 'user_correction',
          status: 'pending',
          isActive: true
        },
        limit: 50
      });

      return {
        source: 'user_correction',
        count: corrections.length,
        data: corrections,
        quality: 'high'
      };
    } catch (error) {
      logger.error('收集用戶糾正數據失敗:', error);
      return { source: 'user_correction', count: 0, data: [], quality: 'low' };
    }
  }

  // 從網頁爬蟲收集數據
  async collectFromWebScraping() {
    try {
      logger.info('從網頁爬蟲收集數據...');

      // 模擬網頁爬蟲數據
      const scrapedData = [
        {
          cardId: 3,
          imageData: 'base64_image_data_3',
          source: 'web_scraping',
          quality: 'medium',
          metadata: {
            uploadDate: new Date(),
            confidence: 0.80,
            processingTime: 3000,
            imageSize: 1024000,
            imageFormat: 'JPEG',
            imageDimensions: { width: 512, height: 384 },
            lightingConditions: 'poor',
            imageQuality: 'medium',
            uploadSource: 'cardmarket_scraper'
          }
        }
      ];

      const savedData = await this.TrainingData.bulkCreate(scrapedData);

      return {
        source: 'web_scraping',
        count: savedData.length,
        data: savedData,
        quality: 'medium'
      };
    } catch (error) {
      logger.error('從網頁爬蟲收集數據失敗:', error);
      return { source: 'web_scraping', count: 0, data: [], quality: 'low' };
    }
  }

  // 處理收集結果
  processCollectionResults(results) {
    const processedResults = {
      totalCollected: 0,
      sources: {},
      qualityDistribution: { high: 0, medium: 0, low: 0 },
      errors: []
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        processedResults.totalCollected += data.count;
        processedResults.sources[data.source] = data.count;

        if (data.quality) {
          processedResults.qualityDistribution[data.quality]++;
        }
      } else {
        processedResults.errors.push({
          source: ['user_upload', 'official_api', 'third_party', 'user_correction', 'web_scraping'][index],
          error: result.reason.message
        });
      }
    });

    return processedResults;
  }

  // 驗證數據質量
  async validateDataQuality(data) {
    try {
      const qualityReport = {
        completeness: this.calculateCompleteness(data),
        accuracy: this.calculateAccuracy(data),
        consistency: this.calculateConsistency(data),
        timeliness: this.calculateTimeliness(data),
        overallScore: 0
      };

      // 計算總體分數
      qualityReport.overallScore = (
        qualityReport.completeness * 0.25 +
        qualityReport.accuracy * 0.30 +
        qualityReport.consistency * 0.25 +
        qualityReport.timeliness * 0.20
      );

      return qualityReport;
    } catch (error) {
      logger.error('數據質量驗證失敗:', error);
      throw error;
    }
  }

  // 計算完整性
  calculateCompleteness(data) {
    if (!data || data.length === 0) return 0;

    const requiredFields = ['imageData', 'source', 'quality'];
    let completeRecords = 0;

    data.forEach(record => {
      const hasAllFields = requiredFields.every(field =>
        record[field] !== null && record[field] !== undefined
      );
      if (hasAllFields) completeRecords++;
    });

    return completeRecords / data.length;
  }

  // 計算準確性
  calculateAccuracy(data) {
    if (!data || data.length === 0) return 0;

    let totalConfidence = 0;
    let validRecords = 0;

    data.forEach(record => {
      if (record.metadata && record.metadata.confidence) {
        totalConfidence += record.metadata.confidence;
        validRecords++;
      }
    });

    return validRecords > 0 ? totalConfidence / validRecords : 0;
  }

  // 計算一致性
  calculateConsistency(data) {
    if (!data || data.length === 0) return 0;

    const sources = {};
    data.forEach(record => {
      sources[record.source] = (sources[record.source] || 0) + 1;
    });

    const totalRecords = data.length;
    const sourceCount = Object.keys(sources).length;

    // 計算多樣性分數
    return Math.min(1, sourceCount / 5); // 假設有5個可能的來源
  }

  // 計算時效性
  calculateTimeliness(data) {
    if (!data || data.length === 0) return 0;

    const now = new Date();
    let recentRecords = 0;

    data.forEach(record => {
      if (record.metadata && record.metadata.uploadDate) {
        const uploadDate = new Date(record.metadata.uploadDate);
        const daysDiff = (now - uploadDate) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 30) { // 30天內算作時效
          recentRecords++;
        }
      }
    });

    return data.length > 0 ? recentRecords / data.length : 0;
  }

  // 存儲訓練數據
  async storeTrainingData(data) {
    try {
      await this.initializeModels();

      const trainingData = await this.TrainingData.create({
        cardId: data.cardId,
        imageData: data.imageData,
        source: data.source,
        quality: data.quality,
        metadata: data.metadata
      });

      logger.info(`訓練數據已存儲: ID ${trainingData.id}`);
      return trainingData;
    } catch (error) {
      logger.error('存儲訓練數據失敗:', error);
      throw error;
    }
  }

  // 更新數據質量指標
  async updateDataQualityMetrics(collectionResults) {
    try {
      await this.initializeModels();

      const qualityMetrics = await this.validateDataQuality(
        await this.TrainingData.findAll({ where: { isActive: true } })
      );

      await this.DataQualityMetrics.create({
        dataType: 'training',
        completeness: qualityMetrics.completeness,
        accuracy: qualityMetrics.accuracy,
        consistency: qualityMetrics.consistency,
        timeliness: qualityMetrics.timeliness,
        overallScore: qualityMetrics.overallScore,
        assessmentDate: new Date(),
        dataSource: 'multiple_sources',
        sampleSize: collectionResults.totalCollected,
        metadata: {
          assessmentMethod: 'automated_validation',
          qualityThreshold: 0.8,
          improvementSuggestions: this.generateImprovementSuggestions(qualityMetrics),
          qualityTrend: 'stable'
        }
      });

      logger.info('數據質量指標已更新');
    } catch (error) {
      logger.error('更新數據質量指標失敗:', error);
    }
  }

  // 生成改進建議
  generateImprovementSuggestions(qualityMetrics) {
    const suggestions = [];

    if (qualityMetrics.completeness < 0.9) {
      suggestions.push('增加數據完整性檢查，確保所有必要字段都有值');
    }

    if (qualityMetrics.accuracy < 0.85) {
      suggestions.push('提高數據準確性，增加人工驗證步驟');
    }

    if (qualityMetrics.consistency < 0.8) {
      suggestions.push('改善數據一致性，標準化數據格式');
    }

    if (qualityMetrics.timeliness < 0.7) {
      suggestions.push('提高數據時效性，減少數據收集延遲');
    }

    return suggestions;
  }

  // 獲取數據收集統計信息
  async getCollectionStats(options = {}) {
    try {
      await this.initializeModels();

      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 默認30天
        endDate = new Date(),
        source = null,
        quality = null,
        status = null
      } = options;

      // 構建查詢條件
      const whereClause = {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        isActive: true
      };

      if (source) whereClause.source = source;
      if (quality) whereClause.quality = quality;
      if (status) whereClause.status = status;

      // 獲取基礎統計數據
      const totalRecords = await this.TrainingData.count({ where: whereClause });

      // 按來源統計
      const sourceStats = await this.TrainingData.findAll({
        attributes: [
          'source',
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count'],
          [this.TrainingData.sequelize.fn('AVG', this.TrainingData.sequelize.col('metadata->confidence')), 'avgConfidence']
        ],
        where: whereClause,
        group: ['source'],
        raw: true
      });

      // 按質量統計
      const qualityStats = await this.TrainingData.findAll({
        attributes: [
          'quality',
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['quality'],
        raw: true
      });

      // 按狀態統計
      const statusStats = await this.TrainingData.findAll({
        attributes: [
          'status',
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['status'],
        raw: true
      });

      // 按時間統計（每日）
      const dailyStats = await this.TrainingData.findAll({
        attributes: [
          [this.TrainingData.sequelize.fn('DATE', this.TrainingData.sequelize.col('createdAt')), 'date'],
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: [this.TrainingData.sequelize.fn('DATE', this.TrainingData.sequelize.col('createdAt'))],
        order: [[this.TrainingData.sequelize.fn('DATE', this.TrainingData.sequelize.col('createdAt')), 'ASC']],
        raw: true
      });

      // 按小時統計（最近7天）
      const hourlyStats = await this.TrainingData.findAll({
        attributes: [
          [this.TrainingData.sequelize.fn('DATE_TRUNC', 'hour', this.TrainingData.sequelize.col('createdAt')), 'hour'],
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count']
        ],
        where: {
          ...whereClause,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        group: [this.TrainingData.sequelize.fn('DATE_TRUNC', 'hour', this.TrainingData.sequelize.col('createdAt'))],
        order: [[this.TrainingData.sequelize.fn('DATE_TRUNC', 'hour', this.TrainingData.sequelize.col('createdAt')), 'ASC']],
        raw: true
      });

      // 獲取最新的數據質量指標
      const latestQualityMetrics = await this.DataQualityMetrics.findOne({
        where: { dataType: 'training' },
        order: [['assessmentDate', 'DESC']],
        raw: true
      });

      // 計算處理時間統計
      const processingTimeStats = await this.TrainingData.findAll({
        attributes: [
          [this.TrainingData.sequelize.fn('AVG', this.TrainingData.sequelize.col('metadata->processingTime')), 'avgProcessingTime'],
          [this.TrainingData.sequelize.fn('MIN', this.TrainingData.sequelize.col('metadata->processingTime')), 'minProcessingTime'],
          [this.TrainingData.sequelize.fn('MAX', this.TrainingData.sequelize.col('metadata->processingTime')), 'maxProcessingTime']
        ],
        where: whereClause,
        raw: true
      });

      // 計算圖片大小統計
      const imageSizeStats = await this.TrainingData.findAll({
        attributes: [
          [this.TrainingData.sequelize.fn('AVG', this.TrainingData.sequelize.col('metadata->imageSize')), 'avgImageSize'],
          [this.TrainingData.sequelize.fn('MIN', this.TrainingData.sequelize.col('metadata->imageSize')), 'minImageSize'],
          [this.TrainingData.sequelize.fn('MAX', this.TrainingData.sequelize.col('metadata->imageSize')), 'maxImageSize']
        ],
        where: whereClause,
        raw: true
      });

      // 按圖片格式統計
      const formatStats = await this.TrainingData.findAll({
        attributes: [
          [this.TrainingData.sequelize.col('metadata->imageFormat'), 'imageFormat'],
          [this.TrainingData.sequelize.fn('COUNT', this.TrainingData.sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: [this.TrainingData.sequelize.col('metadata->imageFormat')],
        raw: true
      });

      // 計算增長趨勢
      const growthTrend = await this.calculateGrowthTrend(startDate, endDate);

      // 計算收集效率指標
      const efficiencyMetrics = await this.calculateEfficiencyMetrics(startDate, endDate);

      // 構建統計報告
      const stats = {
        summary: {
          totalRecords,
          dateRange: { startDate, endDate },
          collectionPeriod: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        },
        sourceDistribution: sourceStats.map(stat => ({
          source: stat.source,
          count: parseInt(stat.count),
          percentage: ((parseInt(stat.count) / totalRecords) * 100).toFixed(2),
          avgConfidence: parseFloat(stat.avgConfidence || 0).toFixed(3)
        })),
        qualityDistribution: qualityStats.map(stat => ({
          quality: stat.quality,
          count: parseInt(stat.count),
          percentage: ((parseInt(stat.count) / totalRecords) * 100).toFixed(2)
        })),
        statusDistribution: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.count),
          percentage: ((parseInt(stat.count) / totalRecords) * 100).toFixed(2)
        })),
        timeSeries: {
          daily: dailyStats.map(stat => ({
            date: stat.date,
            count: parseInt(stat.count)
          })),
          hourly: hourlyStats.map(stat => ({
            hour: stat.hour,
            count: parseInt(stat.count)
          }))
        },
        performance: {
          processingTime: {
            average: parseFloat(processingTimeStats[0]?.avgProcessingTime || 0).toFixed(2),
            minimum: parseFloat(processingTimeStats[0]?.minProcessingTime || 0).toFixed(2),
            maximum: parseFloat(processingTimeStats[0]?.maxProcessingTime || 0).toFixed(2)
          },
          imageSize: {
            average: parseFloat(imageSizeStats[0]?.avgImageSize || 0).toFixed(2),
            minimum: parseFloat(imageSizeStats[0]?.minImageSize || 0).toFixed(2),
            maximum: parseFloat(imageSizeStats[0]?.maxImageSize || 0).toFixed(2)
          }
        },
        formatDistribution: formatStats.map(stat => ({
          format: stat.imageFormat,
          count: parseInt(stat.count),
          percentage: ((parseInt(stat.count) / totalRecords) * 100).toFixed(2)
        })),
        qualityMetrics: latestQualityMetrics ? {
          completeness: latestQualityMetrics.completeness,
          accuracy: latestQualityMetrics.accuracy,
          consistency: latestQualityMetrics.consistency,
          timeliness: latestQualityMetrics.timeliness,
          overallScore: latestQualityMetrics.overallScore,
          assessmentDate: latestQualityMetrics.assessmentDate
        } : null,
        trends: growthTrend,
        efficiency: efficiencyMetrics,
        insights: this.generateCollectionInsights({
          totalRecords,
          sourceStats,
          qualityStats,
          growthTrend,
          efficiencyMetrics
        })
      };

      logger.info(`數據收集統計生成完成: ${totalRecords} 條記錄`);
      return stats;
    } catch (error) {
      logger.error('獲取數據收集統計失敗:', error);
      throw error;
    }
  }

  // 計算增長趨勢
  async calculateGrowthTrend(startDate, endDate) {
    try {
      const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const midPoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);

      // 前半段統計
      const firstHalfCount = await this.TrainingData.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, midPoint]
          },
          isActive: true
        }
      });

      // 後半段統計
      const secondHalfCount = await this.TrainingData.count({
        where: {
          createdAt: {
            [Op.between]: [midPoint, endDate]
          },
          isActive: true
        }
      });

      const growthRate = firstHalfCount > 0 ?
        ((secondHalfCount - firstHalfCount) / firstHalfCount * 100).toFixed(2) :
        secondHalfCount > 0 ? 100 : 0;

      return {
        firstHalfCount,
        secondHalfCount,
        growthRate: parseFloat(growthRate),
        trend: parseFloat(growthRate) > 0 ? 'increasing' : parseFloat(growthRate) < 0 ? 'decreasing' : 'stable',
        averageDailyGrowth: periodDays > 0 ? ((secondHalfCount - firstHalfCount) / periodDays).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('計算增長趨勢失敗:', error);
      return { firstHalfCount: 0, secondHalfCount: 0, growthRate: 0, trend: 'stable', averageDailyGrowth: 0 };
    }
  }

  // 計算效率指標
  async calculateEfficiencyMetrics(startDate, endDate) {
    try {
      const totalRecords = await this.TrainingData.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          },
          isActive: true
        }
      });

      const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      // 計算平均每日收集量
      const averageDailyCollection = periodDays > 0 ? (totalRecords / periodDays).toFixed(2) : 0;

      // 計算高質量數據比例
      const highQualityCount = await this.TrainingData.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          },
          quality: 'high',
          isActive: true
        }
      });

      const highQualityRatio = totalRecords > 0 ? (highQualityCount / totalRecords * 100).toFixed(2) : 0;

      // 計算處理成功率
      const processedCount = await this.TrainingData.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          },
          status: { [Op.in]: ['annotated', 'validated'] },
          isActive: true
        }
      });

      const successRate = totalRecords > 0 ? (processedCount / totalRecords * 100).toFixed(2) : 0;

      return {
        averageDailyCollection: parseFloat(averageDailyCollection),
        highQualityRatio: parseFloat(highQualityRatio),
        successRate: parseFloat(successRate),
        efficiencyScore: ((parseFloat(highQualityRatio) + parseFloat(successRate)) / 2).toFixed(2)
      };
    } catch (error) {
      logger.error('計算效率指標失敗:', error);
      return {
        averageDailyCollection: 0,
        highQualityRatio: 0,
        successRate: 0,
        efficiencyScore: 0
      };
    }
  }

  // 生成收集洞察
  generateCollectionInsights(data) {
    const insights = [];

    // 分析來源分布
    const topSource = data.sourceStats.reduce((max, stat) =>
      (parseInt(stat.count) > parseInt(max.count) ? stat : max), { count: 0, source: 'none' }
    );

    if (topSource.source !== 'none') {
      insights.push(`主要數據來源: ${topSource.source} (${topSource.percentage}%)`);
    }

    // 分析質量分布
    const highQualityCount = data.qualityStats.find(stat => stat.quality === 'high');
    if (highQualityCount && parseFloat(highQualityCount.percentage) < 60) {
      insights.push('高質量數據比例偏低，建議加強數據質量控制');
    }

    // 分析增長趨勢
    if (data.growthTrend.trend === 'increasing') {
      insights.push(`數據收集呈增長趨勢，增長率: ${data.growthTrend.growthRate}%`);
    } else if (data.growthTrend.trend === 'decreasing') {
      insights.push('數據收集呈下降趨勢，需要檢查收集流程');
    }

    // 分析效率
    if (parseFloat(data.efficiencyMetrics.efficiencyScore) < 70) {
      insights.push('收集效率偏低，建議優化數據處理流程');
    }

    // 分析時間分布
    if (data.totalRecords > 0) {
      const averageDaily = data.totalRecords / 30; // 假設30天
      if (averageDaily < 10) {
        insights.push('日均收集量偏低，建議增加數據來源');
      } else if (averageDaily > 100) {
        insights.push('日均收集量較高，建議加強質量控制');
      }
    }

    return insights;
  }
}

module.exports = new DataCollectionService();
