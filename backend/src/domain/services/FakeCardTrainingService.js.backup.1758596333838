const { FakeCard } = require('../models/FakeCard');
const { User } = require('../models/User');
const logger = require('../utils/logger');
const { validateRequest } = require('../middleware/validation');
const { z } = require('zod');

// 訓練模型配置驗證
const TrainingConfigSchema = z.object({
  modelType: z.enum(['authenticity', 'grading', 'hybrid']),
  algorithm: z.enum(['cnn', 'transformer', 'ensemble']),
  trainingEpochs: z.number().min(1).max(1000),
  batchSize: z.number().min(1).max(512),
  learningRate: z.number().min(0.0001).max(1),
  validationSplit: z.number().min(0.1).max(0.5),
  dataAugmentation: z.boolean(),
  useTransferLearning: z.boolean(),
  pretrainedModel: z.string().optional(),
});

// 假卡訓練服務類
class FakeCardTrainingService {
  constructor() {
    this.FakeCard = null;
    this.User = null;
    this.trainingJobs = new Map();
  }

  async initializeModels() {
    if (!this.FakeCard) {
      this.FakeCard = FakeCard;
    }
    if (!this.User) {
      this.User = User;
    }
  }

  // 獲取假卡訓練數據
  async getTrainingData(filters = {}) {
    try {
      await this.initializeModels();

      const whereClause = {};
      const includeClause = [
        {
          model: this.User,
          as: 'user',
          attributes: ['id', 'username'],
        },
      ];

      // 應用過濾器
      if (filters.fakeType && filters.fakeType.length > 0) {
        whereClause.fakeType = filters.fakeType;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.dateRange) {
        whereClause.submissionDate = {
          [this.FakeCard.sequelize.Op.between]: [
            filters.dateRange.start,
            filters.dateRange.end,
          ],
        };
      }

      const fakeCards = await this.FakeCard.findAll({
        where: whereClause,
        include: includeClause,
        order: [['submissionDate', 'DESC']],
      });

      // 轉換為訓練數據格式
      const trainingData = fakeCards.map((card) => ({
        id: card.id,
        cardName: card.cardName,
        cardType: card.cardType,
        fakeType: card.fakeType,
        imageUrls: card.imageUrls,
        description: card.description,
        fakeIndicators: card.fakeIndicators,
        submissionDate: card.submissionDate,
        status: card.status,
        reviewerNotes: card.reviewerNotes,
        trainingFeatures: {
          visualFeatures: this.extractVisualFeatures(card),
          textFeatures: this.extractTextFeatures(card),
          materialFeatures: this.extractMaterialFeatures(card),
          printingFeatures: this.extractPrintingFeatures(card),
        },
        aiTrainingMetrics: {
          confidenceScore: this.calculateConfidenceScore(card),
          accuracyScore: this.calculateAccuracyScore(card),
          falsePositiveRate: 0.05, // 預設值
          falseNegativeRate: 0.03, // 預設值
        },
      }));

      logger.info('✅ 成功獲取假卡訓練數據', {
        count: trainingData.length,
        filters,
      });

      return {
        success: true,
        data: trainingData,
        message: `成功獲取 ${trainingData.length} 條訓練數據`,
      };
    } catch (error) {
      logger.error('❌ 獲取假卡訓練數據失敗:', error);
      throw error;
    }
  }

  // 開始模型訓練
  async startTraining(config, dataFilters = {}) {
    try {
      // 驗證訓練配置
      const validationResult = TrainingConfigSchema.safeParse(config);
      if (!validationResult.success) {
        throw new Error('訓練配置驗證失敗: ' + validationResult.error.message);
      }

      // 生成訓練ID
      const trainingId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 獲取訓練數據
      const trainingDataResult = await this.getTrainingData(dataFilters);
      const trainingData = trainingDataResult.data;

      if (trainingData.length < 10) {
        throw new Error('訓練數據不足，至少需要10條數據');
      }

      // 創建訓練任務
      const trainingJob = {
        id: trainingId,
        config: validationResult.data,
        dataFilters,
        status: 'training',
        startTime: new Date(),
        estimatedTime: this.estimateTrainingTime(config, trainingData.length),
        progress: 0,
        currentEpoch: 0,
        trainingData: trainingData,
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          loss: 0,
          validationAccuracy: 0,
        },
      };

      this.trainingJobs.set(trainingId, trainingJob);

      // 模擬訓練過程（實際應用中會啟動真正的AI訓練）
      this.simulateTraining(trainingId);

      logger.info('✅ 開始模型訓練', {
        trainingId,
        modelType: config.modelType,
        algorithm: config.algorithm,
        dataSize: trainingData.length,
      });

      return {
        success: true,
        data: {
          trainingId,
          estimatedTime: trainingJob.estimatedTime,
        },
        message: '模型訓練已開始',
      };
    } catch (error) {
      logger.error('❌ 開始模型訓練失敗:', error);
      throw error;
    }
  }

  // 獲取訓練進度
  async getTrainingProgress(trainingId) {
    try {
      const trainingJob = this.trainingJobs.get(trainingId);
      if (!trainingJob) {
        throw new Error('訓練任務不存在');
      }

      const result = {
        modelId: trainingId,
        modelVersion: `v1.0.${Date.now()}`,
        trainingMetrics: trainingJob.metrics,
        trainingTime: Date.now() - trainingJob.startTime.getTime(),
        dataSize: {
          totalSamples: trainingJob.trainingData.length,
          fakeSamples: trainingJob.trainingData.filter(card => card.fakeType === 'counterfeit').length,
          realSamples: 0, // 需要真實卡牌數據
          validationSamples: Math.floor(trainingJob.trainingData.length * 0.2),
        },
        performance: {
          averageInferenceTime: 150, // 毫秒
          memoryUsage: 512, // MB
          modelSize: 25, // MB
        },
        deploymentStatus: trainingJob.status,
      };

      return {
        success: true,
        data: result,
        message: '成功獲取訓練進度',
      };
    } catch (error) {
      logger.error('❌ 獲取訓練進度失敗:', error);
      throw error;
    }
  }

  // 評估模型性能
  async evaluateModel(modelId, testDataFilters = {}) {
    try {
      const trainingJob = this.trainingJobs.get(modelId);
      if (!trainingJob) {
        throw new Error('模型不存在');
      }

      // 模擬評估結果
      const evaluationResult = {
        modelId,
        evaluationMetrics: {
          overallAccuracy: 0.92,
          precisionByType: {
            counterfeit: 0.95,
            reprint: 0.88,
            custom: 0.90,
            proxy: 0.89,
          },
          recallByType: {
            counterfeit: 0.93,
            reprint: 0.85,
            custom: 0.87,
            proxy: 0.91,
          },
          confusionMatrix: [
            [45, 2, 1, 1],
            [3, 42, 2, 1],
            [1, 2, 43, 1],
            [2, 1, 1, 44],
          ],
          rocCurve: [
            { fpr: 0, tpr: 0 },
            { fpr: 0.1, tpr: 0.85 },
            { fpr: 0.2, tpr: 0.92 },
            { fpr: 0.3, tpr: 0.95 },
            { fpr: 1, tpr: 1 },
          ],
          aucScore: 0.94,
        },
        performanceAnalysis: {
          fastPredictions: 85,
          slowPredictions: 15,
          errorAnalysis: [
            {
              cardId: 'sample_1',
              predictedType: 'counterfeit',
              actualType: 'reprint',
              confidence: 0.78,
              errorReason: '印刷質量相似',
            },
          ],
        },
        recommendations: [
          '增加更多不同類型的假卡樣本',
          '優化圖像預處理流程',
          '考慮使用更先進的深度學習模型',
        ],
      };

      logger.info('✅ 模型評估完成', {
        modelId,
        overallAccuracy: evaluationResult.evaluationMetrics.overallAccuracy,
      });

      return {
        success: true,
        data: evaluationResult,
        message: '模型評估完成',
      };
    } catch (error) {
      logger.error('❌ 模型評估失敗:', error);
      throw error;
    }
  }

  // 部署模型
  async deployModel(modelId, deploymentConfig = {}) {
    try {
      const trainingJob = this.trainingJobs.get(modelId);
      if (!trainingJob) {
        throw new Error('模型不存在');
      }

      if (trainingJob.status !== 'ready') {
        throw new Error('模型尚未準備好部署');
      }

      const deploymentId = `deployment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 模擬部署過程
      const deploymentResult = {
        deploymentId,
        status: 'deployed',
        modelId,
        deploymentConfig: {
          environment: 'production',
          autoScaling: true,
          maxConcurrentRequests: 1000,
          healthCheckInterval: 30,
          ...deploymentConfig,
        },
        deploymentTime: new Date(),
        endpoint: `/api/ai/models/${modelId}/predict`,
      };

      logger.info('✅ 模型部署成功', {
        modelId,
        deploymentId,
        status: deploymentResult.status,
      });

      return {
        success: true,
        data: deploymentResult,
        message: '模型部署成功',
      };
    } catch (error) {
      logger.error('❌ 模型部署失敗:', error);
      throw error;
    }
  }

  // 獲取模型列表
  async getModels(filters = {}) {
    try {
      const models = Array.from(this.trainingJobs.values()).map(job => ({
        modelId: job.id,
        modelVersion: `v1.0.${job.startTime.getTime()}`,
        trainingMetrics: job.metrics,
        trainingTime: Date.now() - job.startTime.getTime(),
        dataSize: {
          totalSamples: job.trainingData.length,
          fakeSamples: job.trainingData.filter(card => card.fakeType === 'counterfeit').length,
          realSamples: 0,
          validationSamples: Math.floor(job.trainingData.length * 0.2),
        },
        performance: {
          averageInferenceTime: 150,
          memoryUsage: 512,
          modelSize: 25,
        },
        deploymentStatus: job.status,
        config: job.config,
        startTime: job.startTime,
      }));

      // 應用過濾器
      let filteredModels = models;
      if (filters.modelType && filters.modelType.length > 0) {
        filteredModels = filteredModels.filter(model => 
          filters.modelType.includes(model.config.modelType)
        );
      }

      if (filters.status && filters.status.length > 0) {
        filteredModels = filteredModels.filter(model => 
          filters.status.includes(model.deploymentStatus)
        );
      }

      return {
        success: true,
        data: filteredModels,
        message: `成功獲取 ${filteredModels.length} 個模型`,
      };
    } catch (error) {
      logger.error('❌ 獲取模型列表失敗:', error);
      throw error;
    }
  }

  // 獲取訓練統計
  async getTrainingStats() {
    try {
      const models = Array.from(this.trainingJobs.values());
      const totalModels = models.length;
      const activeTraining = models.filter(m => m.status === 'training').length;
      const deployedModels = models.filter(m => m.status === 'deployed').length;
      const averageAccuracy = models.length > 0 
        ? models.reduce((sum, m) => sum + m.metrics.accuracy, 0) / models.length 
        : 0;

      const totalTrainingData = models.reduce((sum, m) => sum + m.trainingData.length, 0);

      const recentPerformance = models.slice(-10).map(model => ({
        date: model.startTime.toISOString().split('T')[0],
        accuracy: model.metrics.accuracy,
        modelType: model.config.modelType,
      }));

      return {
        success: true,
        data: {
          totalModels,
          activeTraining,
          deployedModels,
          averageAccuracy,
          totalTrainingData,
          recentPerformance,
        },
        message: '成功獲取訓練統計',
      };
    } catch (error) {
      logger.error('❌ 獲取訓練統計失敗:', error);
      throw error;
    }
  }

  // 更新假卡數據的訓練特徵
  async updateTrainingFeatures(fakeCardId, features) {
    try {
      await this.initializeModels();

      const fakeCard = await this.FakeCard.findByPk(fakeCardId);
      if (!fakeCard) {
        throw new Error('假卡數據不存在');
      }

      // 更新訓練特徵
      await fakeCard.update({
        trainingFeatures: features,
        updatedAt: new Date(),
      });

      logger.info('✅ 更新假卡訓練特徵成功', { fakeCardId });

      return {
        success: true,
        data: { success: true },
        message: '訓練特徵更新成功',
      };
    } catch (error) {
      logger.error('❌ 更新假卡訓練特徵失敗:', error);
      throw error;
    }
  }

  // 批量更新訓練數據
  async batchUpdateTrainingData(updates) {
    try {
      await this.initializeModels();

      let updatedCount = 0;
      for (const update of updates) {
        const fakeCard = await this.FakeCard.findByPk(update.fakeCardId);
        if (fakeCard) {
          const updateData = {};
          if (update.trainingFeatures) {
            updateData.trainingFeatures = update.trainingFeatures;
          }
          if (update.aiTrainingMetrics) {
            updateData.aiTrainingMetrics = update.aiTrainingMetrics;
          }

          await fakeCard.update({
            ...updateData,
            updatedAt: new Date(),
          });
          updatedCount++;
        }
      }

      logger.info('✅ 批量更新訓練數據成功', { updatedCount });

      return {
        success: true,
        data: { success: true, updatedCount },
        message: `成功更新 ${updatedCount} 條訓練數據`,
      };
    } catch (error) {
      logger.error('❌ 批量更新訓練數據失敗:', error);
      throw error;
    }
  }

  // 私有方法：提取視覺特徵
  extractVisualFeatures(card) {
    // 模擬視覺特徵提取
    return [
      'color_variance_high',
      'texture_irregular',
      'edge_roughness',
      'surface_gloss_inconsistent',
    ];
  }

  // 私有方法：提取文本特徵
  extractTextFeatures(card) {
    // 模擬文本特徵提取
    return [
      'font_spacing_irregular',
      'text_alignment_off',
      'ink_bleeding',
      'character_quality_poor',
    ];
  }

  // 私有方法：提取材料特徵
  extractMaterialFeatures(card) {
    // 模擬材料特徵提取
    return [
      'paper_thickness_variable',
      'cardstock_quality_low',
      'coating_inconsistent',
      'flexibility_abnormal',
    ];
  }

  // 私有方法：提取印刷特徵
  extractPrintingFeatures(card) {
    // 模擬印刷特徵提取
    return [
      'print_resolution_low',
      'color_saturation_off',
      'registration_marks_missing',
      'dot_pattern_irregular',
    ];
  }

  // 私有方法：計算信心度分數
  calculateConfidenceScore(card) {
    // 基於假卡指標數量計算信心度
    const baseScore = 0.7;
    const indicatorBonus = card.fakeIndicators.length * 0.05;
    return Math.min(0.95, baseScore + indicatorBonus);
  }

  // 私有方法：計算準確度分數
  calculateAccuracyScore(card) {
    // 基於審核狀態和描述詳細程度計算準確度
    let score = 0.8;
    if (card.status === 'approved') score += 0.1;
    if (card.description.length > 100) score += 0.05;
    if (card.fakeIndicators.length > 3) score += 0.05;
    return Math.min(1.0, score);
  }

  // 私有方法：估算訓練時間
  estimateTrainingTime(config, dataSize) {
    const baseTime = 300000; // 5分鐘基礎時間
    const epochTime = config.trainingEpochs * 10000; // 每輪10秒
    const dataTime = dataSize * 100; // 每條數據100毫秒
    return baseTime + epochTime + dataTime;
  }

  // 私有方法：模擬訓練過程
  simulateTraining(trainingId) {
    const trainingJob = this.trainingJobs.get(trainingId);
    if (!trainingJob) return;

    const totalEpochs = trainingJob.config.trainingEpochs;
    const progressInterval = setInterval(() => {
      if (trainingJob.currentEpoch < totalEpochs) {
        trainingJob.currentEpoch++;
        trainingJob.progress = (trainingJob.currentEpoch / totalEpochs) * 100;

        // 更新訓練指標
        trainingJob.metrics.accuracy = 0.7 + (trainingJob.progress / 100) * 0.25;
        trainingJob.metrics.precision = 0.65 + (trainingJob.progress / 100) * 0.3;
        trainingJob.metrics.recall = 0.68 + (trainingJob.progress / 100) * 0.27;
        trainingJob.metrics.f1Score = 0.66 + (trainingJob.progress / 100) * 0.29;
        trainingJob.metrics.loss = 0.5 - (trainingJob.progress / 100) * 0.4;
        trainingJob.metrics.validationAccuracy = 0.72 + (trainingJob.progress / 100) * 0.23;

        if (trainingJob.currentEpoch >= totalEpochs) {
          trainingJob.status = 'ready';
          clearInterval(progressInterval);
          logger.info('✅ 模型訓練完成', { trainingId });
        }
      }
    }, 1000); // 每秒更新一次進度
  }
}

module.exports = new FakeCardTrainingService();
