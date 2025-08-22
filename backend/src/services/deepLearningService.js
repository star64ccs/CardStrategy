const tf = require('@tensorflow/tfjs-node');
const { MarketData, Card } = require('../models');
const { getModelPersistenceModel } = require('../models/ModelPersistence');
const ModelPersistenceService = require('./modelPersistenceService');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

class DeepLearningService {
  constructor() {
    this.isInitialized = false;
    this.models = {};
    this.modelPersistenceService = new ModelPersistenceService();
    this.ModelPersistence = null;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // 初始化 TensorFlow.js
      await tf.ready();
      logger.info('TensorFlow.js 初始化成功');

      // 初始化模型持久化服務
      await this.modelPersistenceService.initialize();
      this.ModelPersistence = getModelPersistenceModel(
        require('../config/database').sequelize
      );

      // 嘗試加載現有模型
      await this.loadExistingModels();

      this.isInitialized = true;
      logger.info('深度學習服務初始化完成');
    } catch (error) {
      logger.error('深度學習服務初始化失敗:', error);
      throw error;
    }
  }

  async loadExistingModels() {
    try {
// eslint-disable-next-line no-unused-vars
      const modelTypes = ['lstm', 'gru', 'transformer'];

// eslint-disable-next-line no-unused-vars
      for (const modelType of modelTypes) {
        const latestModel =
          await this.ModelPersistence.findLatestByType(modelType);
        if (latestModel) {
// eslint-disable-next-line no-unused-vars
          const model = await this.modelPersistenceService.loadModel(
            latestModel.id
          );
          if (model) {
            this.models[modelType] = {
              model,
              metadata: latestModel.getMetadata(),
              performanceMetrics: latestModel.getPerformanceMetrics(),
            };
            logger.info(
              `已加載 ${modelType} 模型，版本: ${latestModel.version}`
            );
          }
        }
      }
    } catch (error) {
      logger.warn('加載現有模型時出現錯誤:', error);
    }
  }

  async preprocessData(historicalData) {
    try {
      // 數據標準化
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

// eslint-disable-next-line no-unused-vars
      const normalizedData = historicalData.map((d) => ({
        ...d,
        normalizedPrice: (d.price - minPrice) / (maxPrice - minPrice),
      }));

      // 創建序列數據
      const sequenceLength = 30;
      const sequences = [];
      const targets = [];

      for (let i = sequenceLength; i < normalizedData.length; i++) {
        const sequence = normalizedData.slice(i - sequenceLength, i);
        const target = normalizedData[i].normalizedPrice;

        sequences.push(sequence.map((d) => d.normalizedPrice));
        targets.push(target);
      }

      return {
        sequences: tf.tensor2d(sequences),
        targets: tf.tensor2d(targets, [targets.length, 1]),
        minPrice,
        maxPrice,
        sequenceLength,
      };
    } catch (error) {
      logger.error('數據預處理失敗:', error);
      throw error;
    }
  }

  async createLSTMModel(inputShape) {
    try {
// eslint-disable-next-line no-unused-vars
      const model = tf.sequential();

      model.add(
        tf.layers.lstm({
          units: 128,
          returnSequences: true,
          inputShape: [inputShape, 1],
        })
      );

      model.add(tf.layers.dropout(0.2));

      model.add(
        tf.layers.lstm({
          units: 64,
          returnSequences: false,
        })
      );

      model.add(tf.layers.dropout(0.2));

      model.add(
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        })
      );

      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'linear',
        })
      );

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      return model;
    } catch (error) {
      logger.error('創建 LSTM 模型失敗:', error);
      throw error;
    }
  }

  async createGRUModel(inputShape) {
    try {
// eslint-disable-next-line no-unused-vars
      const model = tf.sequential();

      model.add(
        tf.layers.gru({
          units: 128,
          returnSequences: true,
          inputShape: [inputShape, 1],
        })
      );

      model.add(tf.layers.dropout(0.2));

      model.add(
        tf.layers.gru({
          units: 64,
          returnSequences: false,
        })
      );

      model.add(tf.layers.dropout(0.2));

      model.add(
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        })
      );

      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'linear',
        })
      );

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      return model;
    } catch (error) {
      logger.error('創建 GRU 模型失敗:', error);
      throw error;
    }
  }

  async createTransformerModel(inputShape) {
    try {
// eslint-disable-next-line no-unused-vars
      const model = tf.sequential();

      // 簡化的 Transformer 架構
      model.add(
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [inputShape],
        })
      );

      model.add(tf.layers.dropout(0.1));

      model.add(
        tf.layers.dense({
          units: 64,
          activation: 'relu',
        })
      );

      model.add(tf.layers.dropout(0.1));

      model.add(
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        })
      );

      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'linear',
        })
      );

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      return model;
    } catch (error) {
      logger.error('創建 Transformer 模型失敗:', error);
      throw error;
    }
  }

  async createCNNModel(inputShape) {
    try {
// eslint-disable-next-line no-unused-vars
      const model = tf.sequential();

      model.add(
        tf.layers.conv1d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          inputShape: [inputShape, 1],
        })
      );

      model.add(
        tf.layers.maxPooling1d({
          poolSize: 2,
        })
      );

      model.add(
        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        })
      );

      model.add(tf.layers.globalAveragePooling1d());

      model.add(
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        })
      );

      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'linear',
        })
      );

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      return model;
    } catch (error) {
      logger.error('創建 CNN 模型失敗:', error);
      throw error;
    }
  }

  async trainModel(model, trainingData, modelType) {
    try {
      const { sequences, targets } = trainingData;

      // 重塑數據以適應模型輸入
// eslint-disable-next-line no-unused-vars
      const reshapedSequences = sequences.reshape([
        sequences.shape[0],
        sequences.shape[1],
        1,
      ]);

// eslint-disable-next-line no-unused-vars
      const history = await model.fit(reshapedSequences, targets, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info(
                `Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`
              );
            }
          },
        },
      });

      // 計算性能指標
// eslint-disable-next-line no-unused-vars
      const predictions = model.predict(reshapedSequences);
      const mse = tf.metrics.meanSquaredError(targets, predictions);
      const mae = tf.metrics.meanAbsoluteError(targets, predictions);

      const performanceMetrics = {
        mse: mse.dataSync()[0],
        mae: mae.dataSync()[0],
        accuracy: this.calculateAccuracy(targets, predictions),
        trainingHistory: history.history,
      };

      // 保存模型
// eslint-disable-next-line no-unused-vars
      const modelId = await this.modelPersistenceService.saveModel(
        model,
        modelType,
        performanceMetrics,
        history.history
      );

      // 更新內存中的模型
      this.models[modelType] = {
        model,
        metadata: {
          modelType,
          inputShape: sequences.shape[1],
          trainingEpochs: 100,
          batchSize: 32,
        },
        performanceMetrics,
      };

      logger.info(`${modelType} 模型訓練完成，模型ID: ${modelId}`);
      return { modelId, performanceMetrics };
    } catch (error) {
      logger.error(`${modelType} 模型訓練失敗:`, error);
      throw error;
    }
  }

  calculateAccuracy(targets, predictions) {
    try {
      const targetArray = targets.arraySync();
// eslint-disable-next-line no-unused-vars
      const predictionArray = predictions.arraySync();

      let correctPredictions = 0;
      const tolerance = 0.05; // 5% 容差

      for (let i = 0; i < targetArray.length; i++) {
        const target = targetArray[i][0];
// eslint-disable-next-line no-unused-vars
        const prediction = predictionArray[i][0];
// eslint-disable-next-line no-unused-vars
        const error = Math.abs(target - prediction) / target;

        if (error <= tolerance) {
          correctPredictions++;
        }
      }

      return correctPredictions / targetArray.length;
    } catch (error) {
      logger.error('計算準確率失敗:', error);
      return 0;
    }
  }

  async lstmPrediction(cardId, historicalData) {
    try {
      await this.initialize();

// eslint-disable-next-line no-unused-vars
      let model = this.models.lstm?.model;

      if (!model) {
        logger.info('LSTM 模型不存在，開始訓練新模型...');
        const trainingData = await this.preprocessData(historicalData);
        model = await this.createLSTMModel(trainingData.sequences.shape[1]);
        await this.trainModel(model, trainingData, 'lstm');
      }

      const trainingData = await this.preprocessData(historicalData);
      const { sequences, minPrice, maxPrice } = trainingData;

// eslint-disable-next-line no-unused-vars
      const reshapedSequences = sequences.reshape([
        sequences.shape[0],
        sequences.shape[1],
        1,
      ]);
// eslint-disable-next-line no-unused-vars
      const predictions = model.predict(reshapedSequences);

      // 反標準化預測結果
      const denormalizedPredictions = predictions
        .mul(maxPrice - minPrice)
        .add(minPrice);

      const lastPrediction = denormalizedPredictions.slice([-1, 0], [1, 1]);
// eslint-disable-next-line no-unused-vars
      const predictedPrice = lastPrediction.dataSync()[0];

      const confidence = this.calculateConfidence(
        historicalData,
        predictedPrice
      );

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence,
        modelType: 'lstm',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('LSTM 預測失敗:', error);
      throw error;
    }
  }

  async gruPrediction(cardId, historicalData) {
    try {
      await this.initialize();

// eslint-disable-next-line no-unused-vars
      let model = this.models.gru?.model;

      if (!model) {
        logger.info('GRU 模型不存在，開始訓練新模型...');
        const trainingData = await this.preprocessData(historicalData);
        model = await this.createGRUModel(trainingData.sequences.shape[1]);
        await this.trainModel(model, trainingData, 'gru');
      }

      const trainingData = await this.preprocessData(historicalData);
      const { sequences, minPrice, maxPrice } = trainingData;

// eslint-disable-next-line no-unused-vars
      const reshapedSequences = sequences.reshape([
        sequences.shape[0],
        sequences.shape[1],
        1,
      ]);
// eslint-disable-next-line no-unused-vars
      const predictions = model.predict(reshapedSequences);

      const denormalizedPredictions = predictions
        .mul(maxPrice - minPrice)
        .add(minPrice);
      const lastPrediction = denormalizedPredictions.slice([-1, 0], [1, 1]);
// eslint-disable-next-line no-unused-vars
      const predictedPrice = lastPrediction.dataSync()[0];

      const confidence = this.calculateConfidence(
        historicalData,
        predictedPrice
      );

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence,
        modelType: 'gru',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('GRU 預測失敗:', error);
      throw error;
    }
  }

  async transformerPrediction(cardId, historicalData) {
    try {
      await this.initialize();

// eslint-disable-next-line no-unused-vars
      let model = this.models.transformer?.model;

      if (!model) {
        logger.info('Transformer 模型不存在，開始訓練新模型...');
        const trainingData = await this.preprocessData(historicalData);
        model = await this.createTransformerModel(
          trainingData.sequences.shape[1]
        );
        await this.trainModel(model, trainingData, 'transformer');
      }

      const trainingData = await this.preprocessData(historicalData);
      const { sequences, minPrice, maxPrice } = trainingData;

// eslint-disable-next-line no-unused-vars
      const predictions = model.predict(sequences);

      const denormalizedPredictions = predictions
        .mul(maxPrice - minPrice)
        .add(minPrice);
      const lastPrediction = denormalizedPredictions.slice([-1, 0], [1, 1]);
// eslint-disable-next-line no-unused-vars
      const predictedPrice = lastPrediction.dataSync()[0];

      const confidence = this.calculateConfidence(
        historicalData,
        predictedPrice
      );

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence,
        modelType: 'transformer',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Transformer 預測失敗:', error);
      throw error;
    }
  }

  async ensemblePrediction(cardId, historicalData) {
    try {
      await this.initialize();

// eslint-disable-next-line no-unused-vars
      const predictions = [];

      // 獲取所有模型的預測
      const lstmPrediction = await this.lstmPrediction(cardId, historicalData);
      const gruPrediction = await this.gruPrediction(cardId, historicalData);
      const transformerPrediction = await this.transformerPrediction(
        cardId,
        historicalData
      );

      predictions.push(lstmPrediction);
      predictions.push(gruPrediction);
      predictions.push(transformerPrediction);

      // 加權平均預測結果
      const weights = [0.4, 0.35, 0.25]; // LSTM, GRU, Transformer 權重
      let weightedSum = 0;
// eslint-disable-next-line no-unused-vars
      let totalWeight = 0;

      for (let i = 0; i < predictions.length; i++) {
        weightedSum += predictions[i].predictedPrice * weights[i];
        totalWeight += weights[i];
      }

      const ensemblePredictedPrice = weightedSum / totalWeight;

      // 計算整體置信度
      const avgConfidence =
        predictions.reduce((sum, pred) => sum + pred.confidence, 0) /
        predictions.length;

      return {
        predictedPrice: Math.round(ensemblePredictedPrice * 100) / 100,
        confidence: avgConfidence,
        modelType: 'ensemble',
        individualPredictions: predictions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('集成預測失敗:', error);
      throw error;
    }
  }

  calculateConfidence(historicalData, predictedPrice) {
    try {
// eslint-disable-next-line no-unused-vars
      const recentPrices = historicalData.slice(-10).map((d) => d.price);
      const avgPrice =
        recentPrices.reduce((sum, price) => sum + price, 0) /
        recentPrices.length;
      const priceVolatility = Math.sqrt(
        recentPrices.reduce(
          (sum, price) => sum + Math.pow(price - avgPrice, 2),
          0
        ) / recentPrices.length
      );

      // 基於價格波動性計算置信度
      const volatilityFactor = Math.max(0, 1 - priceVolatility / avgPrice);
      const trendFactor = this.calculateTrendFactor(historicalData);

      return Math.min(
        0.95,
        Math.max(0.5, (volatilityFactor + trendFactor) / 2)
      );
    } catch (error) {
      logger.error('計算置信度失敗:', error);
      return 0.7; // 默認置信度
    }
  }

  calculateTrendFactor(historicalData) {
    try {
      if (historicalData.length < 20) {
        return 0.7;
      }

// eslint-disable-next-line no-unused-vars
      const recentPrices = historicalData.slice(-20).map((d) => d.price);
      const earlyPrices = historicalData.slice(-20, -10).map((d) => d.price);

// eslint-disable-next-line no-unused-vars
      const recentAvg =
        recentPrices.reduce((sum, price) => sum + price, 0) /
        recentPrices.length;
      const earlyAvg =
        earlyPrices.reduce((sum, price) => sum + price, 0) / earlyPrices.length;

      const trend = (recentAvg - earlyAvg) / earlyAvg;
      return Math.max(0, Math.min(1, 0.5 + trend * 2));
    } catch (error) {
      logger.error('計算趨勢因子失敗:', error);
      return 0.7;
    }
  }

  async predictCardPrice(cardId, modelType = 'ensemble') {
    try {
      await this.initialize();

      // 獲取卡牌歷史數據
// eslint-disable-next-line no-unused-vars
      const historicalData = await MarketData.findAll({
        where: { cardId },
        order: [['date', 'ASC']],
        limit: 100,
      });

      if (historicalData.length < 30) {
        throw new Error('歷史數據不足，需要至少30個數據點');
      }

// eslint-disable-next-line no-unused-vars
      const dataQuality = this.assessDataQuality(historicalData);
      if (dataQuality.score < 0.6) {
        logger.warn(`卡牌 ${cardId} 數據質量較低: ${dataQuality.score}`);
      }

// eslint-disable-next-line no-unused-vars
      let prediction;
      switch (modelType) {
        case 'lstm':
          prediction = await this.lstmPrediction(cardId, historicalData);
          break;
        case 'gru':
          prediction = await this.gruPrediction(cardId, historicalData);
          break;
        case 'transformer':
          prediction = await this.transformerPrediction(cardId, historicalData);
          break;
        case 'ensemble':
        default:
          prediction = await this.ensemblePrediction(cardId, historicalData);
          break;
      }

      return {
        ...prediction,
        cardId,
        dataQuality,
        historicalDataPoints: historicalData.length,
      };
    } catch (error) {
      logger.error(`卡牌 ${cardId} 價格預測失敗:`, error);
      throw error;
    }
  }

  assessDataQuality(historicalData) {
    try {
      let score = 1.0;
      const issues = [];

      // 檢查數據完整性
      const expectedDays = 100;
      const actualDays = historicalData.length;
      const completeness = actualDays / expectedDays;
      score *= completeness;

      if (completeness < 0.8) {
        issues.push(`數據完整性不足: ${(completeness * 100).toFixed(1)}%`);
      }

      // 檢查價格異常值
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => d.price);
      const meanPrice =
        prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const stdPrice = Math.sqrt(
        prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) /
          prices.length
      );

      const outliers = prices.filter(
        (price) => Math.abs(price - meanPrice) > 3 * stdPrice
      );
      const outlierRatio = outliers.length / prices.length;
      score *= 1 - outlierRatio;

      if (outlierRatio > 0.1) {
        issues.push(`價格異常值過多: ${(outlierRatio * 100).toFixed(1)}%`);
      }

      // 檢查數據新鮮度
      const latestDate = new Date(
        historicalData[historicalData.length - 1].date
      );
      const daysSinceUpdate =
        (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
      const freshness = Math.max(0, 1 - daysSinceUpdate / 30);
      score *= freshness;

      if (daysSinceUpdate > 7) {
        issues.push(`數據更新時間過久: ${daysSinceUpdate.toFixed(1)} 天`);
      }

      return {
        score: Math.max(0, Math.min(1, score)),
        issues,
        completeness,
        outlierRatio,
        freshness,
      };
    } catch (error) {
      logger.error('評估數據質量失敗:', error);
      return {
        score: 0.5,
        issues: ['數據質量評估失敗'],
        completeness: 0.5,
        outlierRatio: 0.1,
        freshness: 0.5,
      };
    }
  }

  async getModelStatus() {
    try {
      await this.initialize();

// eslint-disable-next-line no-unused-vars
      const status = {
        isInitialized: this.isInitialized,
        models: {},
        modelPersistence: await this.modelPersistenceService.getModelList(),
      };

      for (const [modelType, modelInfo] of Object.entries(this.models)) {
        status.models[modelType] = {
          loaded: true,
          metadata: modelInfo.metadata,
          performanceMetrics: modelInfo.performanceMetrics,
        };
      }

      return status;
    } catch (error) {
      logger.error('獲取模型狀態失敗:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      // 清理 TensorFlow.js 內存
// eslint-disable-next-line no-unused-vars
      for (const modelInfo of Object.values(this.models)) {
        if (modelInfo.model) {
          modelInfo.model.dispose();
        }
      }

      this.models = {};
      this.isInitialized = false;

      logger.info('深度學習服務清理完成');
    } catch (error) {
      logger.error('深度學習服務清理失敗:', error);
    }
  }
}

module.exports = new DeepLearningService();
