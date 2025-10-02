// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { getMarketDataModel } = require('../models/MarketData');
const { getPredictionModel } = require('../models/PredictionModel');
const { getCardModel } = require('../models/Card');

// 注意：在實際部署中需要安裝 TensorFlow.js
// npm install @tensorflow/tfjs-node

class EnhancedPredictionService {
  constructor() {
    this.models = {
      enhancedLSTM: this.enhancedLSTMPrediction,
      transformer: this.transformerPrediction,
      technicalEnsemble: this.technicalEnsemblePrediction,
      dynamicEnsemble: this.dynamicEnsemblePrediction,
    };

    this.weights = {
      enhancedLSTM: 0.3,
      transformer: 0.25,
      technicalEnsemble: 0.25,
      dynamicEnsemble: 0.2,
    };

    this.performanceHistory = {};
    this.technicalIndicators = new TechnicalIndicators();
  }

  // 增強的LSTM預測模型
  async enhancedLSTMPrediction(historicalData, timeframe) {
    try {
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => parseFloat(d.closePrice));
// eslint-disable-next-line no-unused-vars
      const volumes = historicalData.map((d) => parseFloat(d.volume || 0));

      // 計算技術指標
      const rsi = this.technicalIndicators.calculateRSI(prices);
      const macd = this.technicalIndicators.calculateMACD(prices);
      const bollingerBands =
        this.technicalIndicators.calculateBollingerBands(prices);

      // 特徵工程
      const features = this.extractAdvancedFeatures(prices, volumes, {
        rsi,
        macd,
        bollingerBands,
      });

      // 使用改進的LSTM算法
// eslint-disable-next-line no-unused-vars
      const prediction = await this.advancedLSTMPredict(features, timeframe);

      // 計算置信度
      const confidence = this.calculateEnhancedConfidence(features, prediction);

      return {
        predictedPrice: Math.max(0, prediction),
        confidence,
        modelParameters: {
          features: Object.keys(features).length,
          rsi,
          macd,
          bollingerBands,
        },
        factors: {
          trend: this.calculateAdvancedTrend(features),
          volatility: this.calculateEnhancedVolatility(features),
          momentum: this.calculateMomentum(prices),
          technicalStrength: this.calculateTechnicalStrength({
            rsi,
            macd,
            bollingerBands,
          }),
        },
      };
    } catch (error) {
      logger.error('增強的LSTM預測錯誤:', error);
      throw error;
    }
  }

  // Transformer模型預測
  async transformerPrediction(historicalData, timeframe) {
    try {
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => parseFloat(d.closePrice));

      // 序列編碼
      const sequence = this.encodeSequence(prices);

      // 注意力機制預測
// eslint-disable-next-line no-unused-vars
      const prediction = await this.attentionBasedPrediction(
        sequence,
        timeframe
      );

      const confidence = this.calculateTransformerConfidence(
        sequence,
        prediction
      );

      return {
        predictedPrice: Math.max(0, prediction),
        confidence,
        modelParameters: { sequenceLength: sequence.length },
        factors: {
          trend: this.calculateAttentionTrend(sequence),
          volatility: this.calculateVolatility(prices),
          attentionStrength: this.calculateAttentionStrength(sequence),
        },
      };
    } catch (error) {
      logger.error('Transformer預測錯誤:', error);
      throw error;
    }
  }

  // 技術指標集成預測
  async technicalEnsemblePrediction(historicalData, timeframe) {
    try {
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => parseFloat(d.closePrice));
// eslint-disable-next-line no-unused-vars
      const volumes = historicalData.map((d) => parseFloat(d.volume || 0));

      // 計算多個技術指標
      const indicators = {
        rsi: this.technicalIndicators.calculateRSI(prices),
        macd: this.technicalIndicators.calculateMACD(prices),
        bollingerBands:
          this.technicalIndicators.calculateBollingerBands(prices),
        stochastic: this.technicalIndicators.calculateStochastic(prices),
        williamsR: this.technicalIndicators.calculateWilliamsR(prices),
        cci: this.technicalIndicators.calculateCCI(prices),
      };

      // 基於技術指標的預測
// eslint-disable-next-line no-unused-vars
      const prediction = this.technicalBasedPrediction(
        prices,
        indicators,
        timeframe
      );

      const confidence = this.calculateTechnicalConfidence(indicators);

      return {
        predictedPrice: Math.max(0, prediction),
        confidence,
        modelParameters: { indicators },
        factors: {
          trend: this.calculateTechnicalTrend(indicators),
          volatility: this.calculateVolatility(prices),
          signalStrength: this.calculateSignalStrength(indicators),
        },
      };
    } catch (error) {
      logger.error('技術指標集成預測錯誤:', error);
      throw error;
    }
  }

  // 動態集成預測
  async dynamicEnsemblePrediction(historicalData, timeframe) {
    try {
      // 獲取各個模型的預測
// eslint-disable-next-line no-unused-vars
      const predictions = {};
// eslint-disable-next-line no-unused-vars
      const modelNames = Object.keys(this.models);

// eslint-disable-next-line no-unused-vars
      for (const modelName of modelNames) {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await this.models[modelName](
            historicalData,
            timeframe
          );
          predictions[modelName] = prediction;
        } catch (error) {
          logger.warn(`模型 ${modelName} 預測失敗:`, error.message);
        }
      }

      if (Object.keys(predictions).length === 0) {
        throw new Error('所有模型預測都失敗了');
      }

      // 動態調整權重
      await this.updateDynamicWeights(predictions);

      // 加權平均預測
      const finalPrediction = this.calculateWeightedPrediction(predictions);

      return {
        predictedPrice: Math.max(0, finalPrediction.predictedPrice),
        confidence: finalPrediction.confidence,
        modelParameters: { predictions, weights: this.weights },
        factors: {
          trend: this.calculateEnsembleTrend(predictions),
          volatility: this.calculateVolatility(
            historicalData.map((d) => parseFloat(d.closePrice))
          ),
          modelAgreement: this.calculateModelAgreement(predictions),
        },
      };
    } catch (error) {
      logger.error('動態集成預測錯誤:', error);
      throw error;
    }
  }

  // 主要預測方法
  async predictCardPrice(cardId, timeframe, modelType = 'dynamicEnsemble') {
    try {
// eslint-disable-next-line no-unused-vars
      const MarketData = getMarketDataModel();
      const PredictionModel = getPredictionModel();

      if (!MarketData || !PredictionModel) {
        throw new Error('數據模型初始化失敗');
      }

      // 獲取歷史市場數據
// eslint-disable-next-line no-unused-vars
      const historicalData = await MarketData.findAll({
        where: { cardId, isActive: true },
        order: [['date', 'ASC']],
        limit: 200, // 增加數據量以支持更複雜的模型
      });

      if (historicalData.length < 10) {
        throw new Error('歷史數據不足，無法進行預測');
      }

      // 選擇預測模型
// eslint-disable-next-line no-unused-vars
      const model = this.models[modelType] || this.models.dynamicEnsemble;
// eslint-disable-next-line no-unused-vars
      const prediction = await model(historicalData, timeframe);

      // 計算風險等級
      const riskLevel = this.calculateEnhancedRiskLevel(
        prediction.confidence,
        prediction.factors.volatility
      );

      // 保存預測結果
      const targetDate = new Date();
      targetDate.setDate(
        targetDate.getDate() + this.getDaysFromTimeframe(timeframe)
      );

// eslint-disable-next-line no-unused-vars
      const predictionRecord = await PredictionModel.create({
        cardId,
        modelType: `enhanced_${modelType}`,
        timeframe,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        trend: prediction.factors.trend,
        volatility: prediction.factors.volatility,
        factors: prediction.factors,
        riskLevel,
        predictionDate: new Date(),
        targetDate,
        modelParameters: prediction.modelParameters,
        trainingDataSize: historicalData.length,
        lastTrainingDate: new Date(),
      });

      logger.info(
        `增強預測完成: 卡牌 ${cardId}, 模型 ${modelType}, 時間框架 ${timeframe}`
      );

      return {
        id: predictionRecord.id,
        cardId,
        modelType: `enhanced_${modelType}`,
        timeframe,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        accuracy: null,
        trend: prediction.factors.trend,
        volatility: prediction.factors.volatility,
        factors: prediction.factors,
        riskLevel,
        predictionDate: predictionRecord.predictionDate,
        targetDate: predictionRecord.targetDate,
        modelParameters: prediction.modelParameters,
      };
    } catch (error) {
      logger.error('增強預測卡牌價格錯誤:', error);
      throw error;
    }
  }

  // 輔助方法
  extractAdvancedFeatures(prices, volumes, indicators) {
    const features = {};

    // 價格特徵
    features.priceChange = (prices[prices.length - 1] - prices[0]) / prices[0];
    features.priceVolatility = this.calculateVolatility(prices);
    features.priceMomentum = this.calculateMomentum(prices);

    // 成交量特徵
    if (volumes.some((v) => v > 0)) {
      features.volumeChange =
        (volumes[volumes.length - 1] - volumes[0]) / volumes[0];
      features.volumeVolatility = this.calculateVolatility(volumes);
    }

    // 技術指標特徵
    features.rsi = indicators.rsi;
    features.macd = indicators.macd.macd;
    features.macdSignal = indicators.macd.signal;
    features.bollingerPosition =
      (prices[prices.length - 1] - indicators.bollingerBands.lower) /
      (indicators.bollingerBands.upper - indicators.bollingerBands.lower);

    return features;
  }

  async advancedLSTMPredict(features, timeframe) {
    // 簡化的LSTM實現（實際部署中應使用TensorFlow.js）
// eslint-disable-next-line no-unused-vars
    const daysToPredict = this.getDaysFromTimeframe(timeframe);

    // 基於特徵的預測邏輯
// eslint-disable-next-line no-unused-vars
    let prediction = 100; // 基礎價格

    // 根據技術指標調整預測
    if (features.rsi > 70) prediction *= 0.95; // 超買
    if (features.rsi < 30) prediction *= 1.05; // 超賣

    if (features.macd > features.macdSignal) prediction *= 1.02; // 上升趨勢
    if (features.macd < features.macdSignal) prediction *= 0.98; // 下降趨勢

    // 根據布林帶位置調整
    if (features.bollingerPosition > 0.8) prediction *= 0.97; // 接近上軌
    if (features.bollingerPosition < 0.2) prediction *= 1.03; // 接近下軌

    // 時間框架調整
    prediction *= Math.pow(1 + features.priceChange * 0.1, daysToPredict / 30);

    return prediction;
  }

  encodeSequence(prices) {
    // 簡化的序列編碼
    const sequence = [];
    for (let i = 0; i < prices.length; i++) {
// eslint-disable-next-line no-unused-vars
      const normalized =
        (prices[i] - Math.min(...prices)) /
        (Math.max(...prices) - Math.min(...prices));
      sequence.push(normalized);
    }
    return sequence;
  }

  async attentionBasedPrediction(sequence, timeframe) {
    // 簡化的注意力機制實現
// eslint-disable-next-line no-unused-vars
    const daysToPredict = this.getDaysFromTimeframe(timeframe);

    // 計算注意力權重
    const attentionWeights = this.calculateAttentionWeights(sequence);

    // 加權預測
// eslint-disable-next-line no-unused-vars
    let prediction = 0;
    for (let i = 0; i < sequence.length; i++) {
      prediction += sequence[i] * attentionWeights[i];
    }

    // 時間框架調整
    prediction *= Math.pow(1.01, daysToPredict);

    return prediction * 100; // 轉換回價格範圍
  }

  calculateAttentionWeights(sequence) {
    // 簡化的注意力權重計算
    const weights = [];
    const { length } = sequence;

    for (let i = 0; i < length; i++) {
      // 越近的數據權重越大
      const weight = Math.exp((i - length + 1) / 10);
      weights.push(weight);
    }

    // 正規化權重
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => w / sum);
  }

  technicalBasedPrediction(prices, indicators, timeframe) {
// eslint-disable-next-line no-unused-vars
    const daysToPredict = this.getDaysFromTimeframe(timeframe);
    const currentPrice = prices[prices.length - 1];

// eslint-disable-next-line no-unused-vars
    let prediction = currentPrice;

    // RSI信號
    if (indicators.rsi < 30) prediction *= 1.05; // 超賣反彈
    if (indicators.rsi > 70) prediction *= 0.95; // 超買回調

    // MACD信號
    if (indicators.macd.macd > indicators.macd.signal) prediction *= 1.02;
    if (indicators.macd.macd < indicators.macd.signal) prediction *= 0.98;

    // 布林帶信號
    const bbPosition =
      (currentPrice - indicators.bollingerBands.lower) /
      (indicators.bollingerBands.upper - indicators.bollingerBands.lower);
    if (bbPosition > 0.8) prediction *= 0.97;
    if (bbPosition < 0.2) prediction *= 1.03;

    // 時間框架調整
    prediction *= Math.pow(1.005, daysToPredict);

    return prediction;
  }

  async updateDynamicWeights(predictions) {
    // 根據模型歷史表現調整權重
// eslint-disable-next-line no-unused-vars
    const recentPerformance = await this.calculateRecentPerformance();

    if (Object.keys(recentPerformance).length > 0) {
      const totalPerformance = Object.values(recentPerformance).reduce(
        (sum, perf) => sum + perf,
        0
      );

      Object.keys(this.weights).forEach((modelName) => {
        if (recentPerformance[modelName]) {
          this.weights[modelName] =
            recentPerformance[modelName] / totalPerformance;
        }
      });
    }
  }

  calculateWeightedPrediction(predictions) {
    let weightedSum = 0;
// eslint-disable-next-line no-unused-vars
    let totalWeight = 0;
    let totalConfidence = 0;

    Object.entries(predictions).forEach(([modelName, prediction]) => {
      const weight = this.weights[modelName] || 0.25;
      weightedSum += prediction.predictedPrice * weight * prediction.confidence;
      totalWeight += weight * prediction.confidence;
      totalConfidence += prediction.confidence;
    });

    return {
      predictedPrice: weightedSum / totalWeight,
      confidence: totalConfidence / Object.keys(predictions).length,
    };
  }

  // 置信度計算方法
  calculateEnhancedConfidence(features, prediction) {
// eslint-disable-next-line no-unused-vars
    const dataQuality = Math.min(1, Object.keys(features).length / 10);
    const volatility = features.priceVolatility || 0;
    const technicalStrength = this.calculateTechnicalStrength(features);

    const baseConfidence = 0.7;
    const confidence =
      baseConfidence * dataQuality * (1 - volatility * 0.5) * technicalStrength;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  calculateTransformerConfidence(sequence, prediction) {
    const sequenceQuality = Math.min(1, sequence.length / 50);
    const attentionStrength = this.calculateAttentionStrength(sequence);

    const baseConfidence = 0.75;
    const confidence = baseConfidence * sequenceQuality * attentionStrength;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  calculateTechnicalConfidence(indicators) {
    const signalStrength = this.calculateSignalStrength(indicators);
    const indicatorConsistency = this.calculateIndicatorConsistency(indicators);

    const baseConfidence = 0.8;
    const confidence = baseConfidence * signalStrength * indicatorConsistency;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  // 趨勢計算方法
  calculateAdvancedTrend(features) {
// eslint-disable-next-line no-unused-vars
    const momentum = features.priceMomentum || 0;
    const rsi = features.rsi || 50;
    const macd = features.macd || 0;

    if (momentum > 0.02 && rsi < 70 && macd > 0) return 'up';
    if (momentum < -0.02 && rsi > 30 && macd < 0) return 'down';
    return 'stable';
  }

  calculateAttentionTrend(sequence) {
// eslint-disable-next-line no-unused-vars
    const recent = sequence.slice(-5);
    const earlier = sequence.slice(-10, -5);

// eslint-disable-next-line no-unused-vars
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  calculateTechnicalTrend(indicators) {
    const rsi = indicators.rsi || 50;
    const macd = indicators.macd || { macd: 0, signal: 0 };
    const bbPosition = indicators.bollingerPosition || 0.5;

    let upSignals = 0;
    let downSignals = 0;

    if (rsi < 70) upSignals++;
    if (rsi > 30) downSignals++;
    if (macd.macd > macd.signal) upSignals++;
    if (macd.macd < macd.signal) downSignals++;
    if (bbPosition < 0.8) upSignals++;
    if (bbPosition > 0.2) downSignals++;

    if (upSignals > downSignals) return 'up';
    if (downSignals > upSignals) return 'down';
    return 'stable';
  }

  // 輔助計算方法
  calculateTechnicalStrength(features) {
    const rsi = features.rsi || 50;
    const macd = features.macd || 0;
    const bbPosition = features.bollingerPosition || 0.5;

    let strength = 0.5;

    // RSI強度
    if (rsi < 30 || rsi > 70) strength += 0.2;

    // MACD強度
    if (Math.abs(macd) > 0.1) strength += 0.2;

    // 布林帶強度
    if (bbPosition < 0.2 || bbPosition > 0.8) strength += 0.1;

    return Math.min(1, strength);
  }

  calculateAttentionStrength(sequence) {
    const attentionWeights = this.calculateAttentionWeights(sequence);
    const maxWeight = Math.max(...attentionWeights);
    const minWeight = Math.min(...attentionWeights);

    return (maxWeight - minWeight) / maxWeight;
  }

  calculateSignalStrength(indicators) {
    let strength = 0;
// eslint-disable-next-line no-unused-vars
    let count = 0;

    // RSI信號強度
    if (indicators.rsi < 30 || indicators.rsi > 70) {
      strength += Math.abs(indicators.rsi - 50) / 50;
      count++;
    }

    // MACD信號強度
    const macdStrength = Math.abs(
      indicators.macd.macd - indicators.macd.signal
    );
    if (macdStrength > 0.1) {
      strength += macdStrength;
      count++;
    }

    return count > 0 ? strength / count : 0.5;
  }

  calculateIndicatorConsistency(indicators) {
    let consistency = 0;
// eslint-disable-next-line no-unused-vars
    const count = 0;

    // 檢查指標一致性
    const signals = [];
    if (indicators.rsi < 30) signals.push('buy');
    if (indicators.rsi > 70) signals.push('sell');
    if (indicators.macd.macd > indicators.macd.signal) signals.push('buy');
    if (indicators.macd.macd < indicators.macd.signal) signals.push('sell');

    if (signals.length > 1) {
      const buySignals = signals.filter((s) => s === 'buy').length;
      const sellSignals = signals.filter((s) => s === 'sell').length;
      consistency = Math.abs(buySignals - sellSignals) / signals.length;
    }

    return Math.max(0.5, consistency);
  }

  calculateEnhancedRiskLevel(confidence, volatility) {
    const riskScore = (1 - confidence) * 0.6 + volatility * 0.4;

    if (riskScore < 0.25) return 'low';
    if (riskScore < 0.5) return 'medium';
    return 'high';
  }

  // 工具方法
  getDaysFromTimeframe(timeframe) {
    const daysMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
    };
    return daysMap[timeframe] || 30;
  }

  calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      returns.length;

    return Math.sqrt(variance);
  }

  calculateMomentum(prices) {
// eslint-disable-next-line no-unused-vars
    const n = prices.length;
    if (n < 5) return 0;

// eslint-disable-next-line no-unused-vars
    const recent = prices.slice(-5);
    const earlier = prices.slice(-10, -5);

// eslint-disable-next-line no-unused-vars
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, p) => sum + p, 0) / earlier.length;

    return (recentAvg - earlierAvg) / earlierAvg;
  }

  async calculateRecentPerformance() {
    // 簡化的性能計算（實際實現中應從數據庫獲取）
    return {
      enhancedLSTM: 0.85,
      transformer: 0.82,
      technicalEnsemble: 0.88,
      dynamicEnsemble: 0.9,
    };
  }

  calculateEnsembleTrend(predictions) {
    const upCount = Object.values(predictions).filter(
      (p) => p.factors.trend === 'up'
    ).length;
    const downCount = Object.values(predictions).filter(
      (p) => p.factors.trend === 'down'
    ).length;

    if (upCount > downCount) return 'up';
    if (downCount > upCount) return 'down';
    return 'stable';
  }

  calculateModelAgreement(predictions) {
// eslint-disable-next-line no-unused-vars
    const prices = Object.values(predictions).map((p) => p.predictedPrice);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;

    return Math.max(0, 1 - variance / Math.pow(mean, 2));
  }
}

// 技術指標計算類
class TechnicalIndicators {
  calculateRSI(prices, period = 14) {
    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    const avgGain =
      gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss =
      losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const ema12 = this.calculateEMA(prices, fastPeriod);
    const ema26 = this.calculateEMA(prices, slowPeriod);
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA(
      [...Array(25).fill(0), macdLine],
      signalPeriod
    );

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine,
    };
  }

  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma =
      prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
    const variance =
      prices
        .slice(-period)
        .reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + stdDev * standardDeviation,
      middle: sma,
      lower: sma - stdDev * standardDeviation,
    };
  }

  calculateStochastic(prices, period = 14) {
// eslint-disable-next-line no-unused-vars
    const recent = prices.slice(-period);
    const highest = Math.max(...recent);
    const lowest = Math.min(...recent);
    const current = recent[recent.length - 1];

    return ((current - lowest) / (highest - lowest)) * 100;
  }

  calculateWilliamsR(prices, period = 14) {
// eslint-disable-next-line no-unused-vars
    const recent = prices.slice(-period);
    const highest = Math.max(...recent);
    const lowest = Math.min(...recent);
    const current = recent[recent.length - 1];

    return ((highest - current) / (highest - lowest)) * -100;
  }

  calculateCCI(prices, period = 20) {
// eslint-disable-next-line no-unused-vars
    const recent = prices.slice(-period);
    const sma = recent.reduce((sum, price) => sum + price, 0) / period;
    const meanDeviation =
      recent.reduce((sum, price) => sum + Math.abs(price - sma), 0) / period;

    return (recent[recent.length - 1] - sma) / (0.015 * meanDeviation);
  }

  calculateEMA(prices, period) {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }
}

module.exports = new EnhancedPredictionService();
