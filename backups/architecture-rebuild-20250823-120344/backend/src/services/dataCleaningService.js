const { Op } = require('sequelize');
const getTrainingDataModel = require('../models/TrainingData');
// eslint-disable-next-line no-unused-vars
const getCardModel = require('../models/Card');
const getDataQualityMetricsModel = require('../models/DataQualityMetrics');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

class DataCleaningService {
  constructor() {
    this.TrainingData = null;
    this.Card = null;
    this.DataQualityMetrics = null;
  }

  async initializeModels() {
    if (!this.TrainingData) this.TrainingData = getTrainingDataModel();
    if (!this.Card) this.Card = getCardModel();
    if (!this.DataQualityMetrics)
      this.DataQualityMetrics = getDataQualityMetricsModel();

    if (!this.TrainingData || !this.Card || !this.DataQualityMetrics) {
      throw new Error('Failed to initialize data cleaning service models');
    }
  }

  // 執行數據清洗流程
  async performDataCleaning() {
    try {
      await this.initializeModels();
      logger.info('開始執行數據清洗流程...');

      const cleaningResults = {
        totalRecords: 0,
        cleanedRecords: 0,
        removedRecords: 0,
        errors: [],
        qualityImprovements: {},
      };

      // 獲取所有訓練數據
      const allTrainingData = await this.TrainingData.findAll({
        where: { isActive: true },
      });

      cleaningResults.totalRecords = allTrainingData.length;

      // 執行各種清洗步驟
      const cleaningSteps = [
        this.removeDuplicateData.bind(this),
        this.removeLowQualityData.bind(this),
        this.standardizeDataFormat.bind(this),
        this.validateDataIntegrity.bind(this),
        this.enrichDataMetadata.bind(this),
      ];

      for (const step of cleaningSteps) {
        try {
          const stepResult = await step(allTrainingData);
          cleaningResults.cleanedRecords += stepResult.cleanedRecords;
          cleaningResults.removedRecords += stepResult.removedRecords;
          cleaningResults.qualityImprovements = {
            ...cleaningResults.qualityImprovements,
            ...stepResult.qualityImprovements,
          };
        } catch (error) {
          cleaningResults.errors.push({
            step: step.name,
            error: error.message,
          });
        }
      }

      // 更新數據質量指標
      await this.updateCleaningQualityMetrics(cleaningResults);

      logger.info(
        `數據清洗完成: 處理 ${cleaningResults.totalRecords} 條記錄，清理 ${cleaningResults.cleanedRecords} 條，移除 ${cleaningResults.removedRecords} 條`
      );
      return cleaningResults;
    } catch (error) {
      logger.error('數據清洗失敗:', error);
      throw error;
    }
  }

  // 移除重複數據
  async removeDuplicateData(trainingData) {
    try {
      logger.info('檢查並移除重複數據...');

      const duplicates = this.findDuplicates(trainingData);
      let removedCount = 0;

      for (const duplicateGroup of duplicates) {
        // 保留質量最高的記錄，移除其他重複記錄
        const sortedGroup = duplicateGroup.sort((a, b) => {
          const qualityA = this.calculateRecordQuality(a);
          const qualityB = this.calculateRecordQuality(b);
          return qualityB - qualityA;
        });

        // 移除除第一個（最高質量）之外的所有記錄
        for (let i = 1; i < sortedGroup.length; i++) {
          await sortedGroup[i].update({ isActive: false });
          removedCount++;
        }
      }

      return {
        cleanedRecords: trainingData.length - removedCount,
        removedRecords: removedCount,
        qualityImprovements: {
          duplicateRemoval: removedCount,
        },
      };
    } catch (error) {
      logger.error('移除重複數據失敗:', error);
      throw error;
    }
  }

  // 查找重複數據
  findDuplicates(trainingData) {
    const duplicates = [];
    const processed = new Set();

    for (let i = 0; i < trainingData.length; i++) {
      if (processed.has(i)) continue;

      const currentRecord = trainingData[i];
      const duplicateGroup = [currentRecord];
      processed.add(i);

      for (let j = i + 1; j < trainingData.length; j++) {
        if (processed.has(j)) continue;

        const compareRecord = trainingData[j];
        if (this.isDuplicate(currentRecord, compareRecord)) {
          duplicateGroup.push(compareRecord);
          processed.add(j);
        }
      }

      if (duplicateGroup.length > 1) {
        duplicates.push(duplicateGroup);
      }
    }

    return duplicates;
  }

  // 判斷是否為重複數據
  isDuplicate(record1, record2) {
    // 檢查卡片ID是否相同
    if (record1.cardId === record2.cardId) {
      // 檢查圖片數據的相似性（簡化版本）
      const imageSimilarity = this.calculateImageSimilarity(
        record1.imageData,
        record2.imageData
      );

      return imageSimilarity > 0.95; // 95% 相似度視為重複
    }

    return false;
  }

  // 計算圖片相似性（簡化版本）
  calculateImageSimilarity(imageData1, imageData2) {
    // 實際實現中會使用更複雜的圖像相似性算法
    // 這裡使用簡化的字符串相似性計算
    if (imageData1 === imageData2) return 1.0;

    const length1 = imageData1.length;
    const length2 = imageData2.length;
    const maxLength = Math.max(length1, length2);

    if (maxLength === 0) return 1.0;

    const distance = this.levenshteinDistance(imageData1, imageData2);
    return 1 - distance / maxLength;
  }

  // Levenshtein距離算法
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 移除低質量數據
  async removeLowQualityData(trainingData) {
    try {
      logger.info('檢查並移除低質量數據...');

      let removedCount = 0;
      const qualityThreshold = 0.3; // 質量閾值

// eslint-disable-next-line no-unused-vars
      for (const record of trainingData) {
        const quality = this.calculateRecordQuality(record);

        if (quality < qualityThreshold) {
          await record.update({ isActive: false });
          removedCount++;
        }
      }

      return {
        cleanedRecords: trainingData.length - removedCount,
        removedRecords: removedCount,
        qualityImprovements: {
          lowQualityRemoval: removedCount,
        },
      };
    } catch (error) {
      logger.error('移除低質量數據失敗:', error);
      throw error;
    }
  }

  // 計算記錄質量
  calculateRecordQuality(record) {
    let quality = 0;
    const metadata = record.metadata || {};

    // 基於置信度
    if (metadata.confidence) {
      quality += metadata.confidence * 0.4;
    }

    // 基於圖片質量
    if (metadata.imageQuality) {
      const imageQualityScore = this.getImageQualityScore(
        metadata.imageQuality
      );
      quality += imageQualityScore * 0.3;
    }

    // 基於數據來源
    const sourceQualityScore = this.getSourceQualityScore(record.source);
    quality += sourceQualityScore * 0.2;

    // 基於數據完整性
    const completenessScore = this.calculateCompletenessScore(record);
    quality += completenessScore * 0.1;

    return Math.min(1, quality);
  }

  // 獲取圖片質量分數
  getImageQualityScore(imageQuality) {
    const qualityScores = {
      high: 1.0,
      medium: 0.7,
      low: 0.4,
      poor: 0.2,
    };
    return qualityScores[imageQuality] || 0.5;
  }

  // 獲取來源質量分數
  getSourceQualityScore(source) {
    const sourceScores = {
      official_api: 1.0,
      user_correction: 0.9,
      third_party: 0.7,
      user_upload: 0.6,
      web_scraping: 0.5,
    };
    return sourceScores[source] || 0.5;
  }

  // 計算完整性分數
  calculateCompletenessScore(record) {
// eslint-disable-next-line no-unused-vars
    const requiredFields = ['imageData', 'source', 'quality'];
    const metadata = record.metadata || {};
    const optionalFields = [
      'confidence',
      'imageSize',
      'imageFormat',
      'imageDimensions',
    ];

    let completeFields = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    // 檢查必要字段
    requiredFields.forEach((field) => {
      if (record[field] !== null && record[field] !== undefined) {
        completeFields++;
      }
    });

    // 檢查可選字段
    optionalFields.forEach((field) => {
      if (metadata[field] !== null && metadata[field] !== undefined) {
        completeFields++;
      }
    });

    return completeFields / totalFields;
  }

  // 標準化數據格式
  async standardizeDataFormat(trainingData) {
    try {
      logger.info('標準化數據格式...');

      let standardizedCount = 0;

// eslint-disable-next-line no-unused-vars
      for (const record of trainingData) {
        const originalMetadata = { ...record.metadata };
        let hasChanges = false;

        // 標準化圖片格式
        if (record.metadata && record.metadata.imageFormat) {
          const standardizedFormat = this.standardizeImageFormat(
            record.metadata.imageFormat
          );
          if (standardizedFormat !== record.metadata.imageFormat) {
            record.metadata.imageFormat = standardizedFormat;
            hasChanges = true;
          }
        }

        // 標準化圖片尺寸
        if (record.metadata && record.metadata.imageDimensions) {
          const standardizedDimensions = this.standardizeImageDimensions(
            record.metadata.imageDimensions
          );
          if (
            JSON.stringify(standardizedDimensions) !==
            JSON.stringify(record.metadata.imageDimensions)
          ) {
            record.metadata.imageDimensions = standardizedDimensions;
            hasChanges = true;
          }
        }

        // 標準化光源條件
        if (record.metadata && record.metadata.lightingConditions) {
          const standardizedLighting = this.standardizeLightingConditions(
            record.metadata.lightingConditions
          );
          if (standardizedLighting !== record.metadata.lightingConditions) {
            record.metadata.lightingConditions = standardizedLighting;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          await record.update({ metadata: record.metadata });
          standardizedCount++;
        }
      }

      return {
        cleanedRecords: trainingData.length,
        removedRecords: 0,
        qualityImprovements: {
          formatStandardization: standardizedCount,
        },
      };
    } catch (error) {
      logger.error('標準化數據格式失敗:', error);
      throw error;
    }
  }

  // 標準化圖片格式
  standardizeImageFormat(format) {
    const formatMap = {
      jpg: 'JPEG',
      jpeg: 'JPEG',
      png: 'PNG',
      gif: 'GIF',
      bmp: 'BMP',
      webp: 'WEBP',
    };
    return formatMap[format.toLowerCase()] || format.toUpperCase();
  }

  // 標準化圖片尺寸
  standardizeImageDimensions(dimensions) {
    return {
      width: parseInt(dimensions.width) || 0,
      height: parseInt(dimensions.height) || 0,
    };
  }

  // 標準化光源條件
  standardizeLightingConditions(lighting) {
    const lightingMap = {
      good: 'good',
      excellent: 'good',
      bright: 'good',
      medium: 'medium',
      average: 'medium',
      poor: 'poor',
      dark: 'poor',
      dim: 'poor',
    };
    return lightingMap[lighting.toLowerCase()] || 'medium';
  }

  // 驗證數據完整性
  async validateDataIntegrity(trainingData) {
    try {
      logger.info('驗證數據完整性...');

      let validatedCount = 0;
      let invalidCount = 0;

// eslint-disable-next-line no-unused-vars
      for (const record of trainingData) {
        const isValid = await this.validateRecordIntegrity(record);

        if (isValid) {
          validatedCount++;
        } else {
          await record.update({ isActive: false });
          invalidCount++;
        }
      }

      return {
        cleanedRecords: validatedCount,
        removedRecords: invalidCount,
        qualityImprovements: {
          integrityValidation: validatedCount,
        },
      };
    } catch (error) {
      logger.error('驗證數據完整性失敗:', error);
      throw error;
    }
  }

  // 驗證記錄完整性
  async validateRecordIntegrity(record) {
    // 檢查必要字段
    if (!record.imageData || !record.source || !record.quality) {
      return false;
    }

    // 檢查圖片數據格式
    if (!this.isValidImageData(record.imageData)) {
      return false;
    }

    // 檢查元數據完整性
    const metadata = record.metadata || {};
    if (metadata.imageSize && metadata.imageSize <= 0) {
      return false;
    }

    if (metadata.imageDimensions) {
      const { width, height } = metadata.imageDimensions;
      if (width <= 0 || height <= 0) {
        return false;
      }
    }

    return true;
  }

  // 驗證圖片數據
  isValidImageData(imageData) {
    if (!imageData || typeof imageData !== 'string') {
      return false;
    }

    // 檢查是否為有效的base64格式
    const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
    if (!base64Regex.test(imageData)) {
      return false;
    }

    // 檢查數據長度
    if (imageData.length < 100) {
      // 最小長度檢查
      return false;
    }

    return true;
  }

  // 豐富數據元數據
  async enrichDataMetadata(trainingData) {
    try {
      logger.info('豐富數據元數據...');

      let enrichedCount = 0;

// eslint-disable-next-line no-unused-vars
      for (const record of trainingData) {
        const originalMetadata = { ...record.metadata };
        let hasChanges = false;

        // 添加數據年齡
        if (!record.metadata.dataAge) {
          const uploadDate = record.metadata.uploadDate || record.createdAt;
// eslint-disable-next-line no-unused-vars
          const dataAge = this.calculateDataAge(uploadDate);
          record.metadata.dataAge = dataAge;
          hasChanges = true;
        }

        // 添加數據新鮮度評分
        if (!record.metadata.freshnessScore) {
          const freshnessScore = this.calculateFreshnessScore(
            record.metadata.dataAge
          );
          record.metadata.freshnessScore = freshnessScore;
          hasChanges = true;
        }

        // 添加數據可靠性評分
        if (!record.metadata.reliabilityScore) {
          const reliabilityScore = this.calculateReliabilityScore(record);
          record.metadata.reliabilityScore = reliabilityScore;
          hasChanges = true;
        }

        if (hasChanges) {
          await record.update({ metadata: record.metadata });
          enrichedCount++;
        }
      }

      return {
        cleanedRecords: trainingData.length,
        removedRecords: 0,
        qualityImprovements: {
          metadataEnrichment: enrichedCount,
        },
      };
    } catch (error) {
      logger.error('豐富數據元數據失敗:', error);
      throw error;
    }
  }

  // 計算數據年齡
  calculateDataAge(uploadDate) {
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    const upload = new Date(uploadDate);
    const diffTime = Math.abs(now - upload);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // 計算新鮮度評分
  calculateFreshnessScore(dataAge) {
    if (dataAge <= 7) return 1.0;
    if (dataAge <= 30) return 0.8;
    if (dataAge <= 90) return 0.6;
    if (dataAge <= 365) return 0.4;
    return 0.2;
  }

  // 計算可靠性評分
  calculateReliabilityScore(record) {
    let score = 0;
    const metadata = record.metadata || {};

    // 基於來源可靠性
    const sourceReliability = this.getSourceReliability(record.source);
    score += sourceReliability * 0.4;

    // 基於數據完整性
    const completenessScore = this.calculateCompletenessScore(record);
    score += completenessScore * 0.3;

    // 基於數據一致性
    const consistencyScore = this.calculateConsistencyScore(record);
    score += consistencyScore * 0.3;

    return Math.min(1, score);
  }

  // 獲取來源可靠性
  getSourceReliability(source) {
    const reliabilityScores = {
      official_api: 1.0,
      user_correction: 0.9,
      third_party: 0.7,
      user_upload: 0.6,
      web_scraping: 0.5,
    };
    return reliabilityScores[source] || 0.5;
  }

  // 計算一致性評分
  calculateConsistencyScore(record) {
    const metadata = record.metadata || {};

    // 檢查格式一致性
    let consistencyChecks = 0;
    let passedChecks = 0;

    // 檢查圖片格式
    if (metadata.imageFormat) {
      consistencyChecks++;
      const validFormats = ['JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'];
      if (validFormats.includes(metadata.imageFormat)) {
        passedChecks++;
      }
    }

    // 檢查圖片尺寸
    if (metadata.imageDimensions) {
      consistencyChecks++;
      const { width, height } = metadata.imageDimensions;
      if (width > 0 && height > 0 && width <= 10000 && height <= 10000) {
        passedChecks++;
      }
    }

    // 檢查光源條件
    if (metadata.lightingConditions) {
      consistencyChecks++;
      const validLighting = ['good', 'medium', 'poor'];
      if (validLighting.includes(metadata.lightingConditions)) {
        passedChecks++;
      }
    }

    return consistencyChecks > 0 ? passedChecks / consistencyChecks : 1.0;
  }

  // 更新清洗質量指標
  async updateCleaningQualityMetrics(cleaningResults) {
    try {
      await this.initializeModels();

      const remainingData = await this.TrainingData.findAll({
        where: { isActive: true },
      });

      const qualityMetrics = await this.validateDataQuality(remainingData);

      await this.DataQualityMetrics.create({
        dataType: 'validation',
        completeness: qualityMetrics.completeness,
        accuracy: qualityMetrics.accuracy,
        consistency: qualityMetrics.consistency,
        timeliness: qualityMetrics.timeliness,
        overallScore: qualityMetrics.overallScore,
        assessmentDate: new Date(),
        dataSource: 'data_cleaning_service',
        sampleSize: remainingData.length,
        metadata: {
          assessmentMethod: 'automated_cleaning',
          qualityThreshold: 0.8,
          improvementSuggestions:
            this.generateCleaningImprovementSuggestions(cleaningResults),
          qualityTrend: 'improving',
          cleaningResults,
        },
      });

      logger.info('清洗質量指標已更新');
    } catch (error) {
      logger.error('更新清洗質量指標失敗:', error);
    }
  }

  // 驗證數據質量
  async validateDataQuality(data) {
    try {
      const qualityReport = {
        completeness: this.calculateCompleteness(data),
        accuracy: this.calculateAccuracy(data),
        consistency: this.calculateConsistency(data),
        timeliness: this.calculateTimeliness(data),
        overallScore: 0,
      };

      qualityReport.overallScore =
        qualityReport.completeness * 0.25 +
        qualityReport.accuracy * 0.3 +
        qualityReport.consistency * 0.25 +
        qualityReport.timeliness * 0.2;

      return qualityReport;
    } catch (error) {
      logger.error('數據質量驗證失敗:', error);
      throw error;
    }
  }

  // 計算完整性
  calculateCompleteness(data) {
    if (!data || data.length === 0) return 0;

// eslint-disable-next-line no-unused-vars
    const requiredFields = ['imageData', 'source', 'quality'];
    let completeRecords = 0;

    data.forEach((record) => {
      const hasAllFields = requiredFields.every(
        (field) => record[field] !== null && record[field] !== undefined
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

    data.forEach((record) => {
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
    data.forEach((record) => {
      sources[record.source] = (sources[record.source] || 0) + 1;
    });

    const totalRecords = data.length;
    const sourceCount = Object.keys(sources).length;

    return Math.min(1, sourceCount / 5);
  }

  // 計算時效性
  calculateTimeliness(data) {
    if (!data || data.length === 0) return 0;

// eslint-disable-next-line no-unused-vars
    const now = new Date();
// eslint-disable-next-line no-unused-vars
    let recentRecords = 0;

    data.forEach((record) => {
      if (record.metadata && record.metadata.uploadDate) {
        const uploadDate = new Date(record.metadata.uploadDate);
        const daysDiff = (now - uploadDate) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 30) {
          recentRecords++;
        }
      }
    });

    return data.length > 0 ? recentRecords / data.length : 0;
  }

  // 生成清洗改進建議
  generateCleaningImprovementSuggestions(cleaningResults) {
    const suggestions = [];

    if (cleaningResults.removedRecords > cleaningResults.totalRecords * 0.1) {
      suggestions.push('數據質量較低，建議加強數據收集階段的質量控制');
    }

    if (cleaningResults.qualityImprovements.duplicateRemoval > 0) {
      suggestions.push('存在重複數據，建議優化數據收集流程避免重複');
    }

    if (cleaningResults.qualityImprovements.lowQualityRemoval > 0) {
      suggestions.push('存在低質量數據，建議提高數據收集標準');
    }

    if (cleaningResults.qualityImprovements.formatStandardization > 0) {
      suggestions.push('數據格式不統一，建議建立標準化的數據格式規範');
    }

    return suggestions;
  }
}

module.exports = new DataCleaningService();
