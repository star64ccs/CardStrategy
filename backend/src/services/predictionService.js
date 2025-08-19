const logger = require('../utils/logger');
const { getMarketDataModel } = require('../models/MarketData');
const { getPredictionModel } = require('../models/PredictionModel');
const { getCardModel } = require('../models/Card');

class PredictionService {
  constructor() {
    this.models = {
      linear: this.linearRegression,
      polynomial: this.polynomialRegression,
      exponential: this.exponentialSmoothing,
      arima: this.arimaModel,
      lstm: this.lstmModel,
      ensemble: this.ensembleModel
    };
  }

  // 線性回歸預測
  async linearRegression(historicalData, timeframe) {
    try {
      const n = historicalData.length;
      if (n < 2) {
        throw new Error('需要至少2個數據點進行線性回歸');
      }

      // 計算線性回歸參數
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      for (let i = 0; i < n; i++) {
        const x = i;
        const y = parseFloat(historicalData[i].closePrice);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // 預測未來價格
      const daysToPredict = this.getDaysFromTimeframe(timeframe);
      const predictedPrice = slope * (n + daysToPredict) + intercept;

      // 計算置信度
      const confidence = this.calculateConfidence(historicalData, slope, intercept);

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { slope, intercept, n },
        factors: {
          trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable',
          volatility: this.calculateVolatility(historicalData),
          momentum: this.calculateMomentum(historicalData)
        }
      };
    } catch (error) {
      logger.error('線性回歸預測錯誤:', error);
      throw error;
    }
  }

  // 多項式回歸預測
  async polynomialRegression(historicalData, timeframe, degree = 2) {
    try {
      const n = historicalData.length;
      if (n < degree + 1) {
        throw new Error(`需要至少${degree + 1}個數據點進行${degree}次多項式回歸`);
      }

      // 簡化的多項式回歸實現
      const x = Array.from({ length: n }, (_, i) => i);
      const y = historicalData.map(d => parseFloat(d.closePrice));

      // 使用最小二乘法計算係數
      const coefficients = this.polynomialFit(x, y, degree);

      // 預測未來價格
      const daysToPredict = this.getDaysFromTimeframe(timeframe);
      const predictedPrice = this.evaluatePolynomial(coefficients, n + daysToPredict);

      const confidence = this.calculateConfidence(historicalData, coefficients, 'polynomial');

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { coefficients, degree, n },
        factors: {
          trend: this.calculatePolynomialTrend(coefficients, n),
          volatility: this.calculateVolatility(historicalData),
          curvature: this.calculateCurvature(coefficients)
        }
      };
    } catch (error) {
      logger.error('多項式回歸預測錯誤:', error);
      throw error;
    }
  }

  // 指數平滑預測
  async exponentialSmoothing(historicalData, timeframe, alpha = 0.3) {
    try {
      const n = historicalData.length;
      if (n < 2) {
        throw new Error('需要至少2個數據點進行指數平滑');
      }

      const prices = historicalData.map(d => parseFloat(d.closePrice));
      let smoothed = prices[0];

      // 應用指數平滑
      for (let i = 1; i < n; i++) {
        smoothed = alpha * prices[i] + (1 - alpha) * smoothed;
      }

      // 預測未來價格
      const daysToPredict = this.getDaysFromTimeframe(timeframe);
      const predictedPrice = smoothed;

      const confidence = this.calculateConfidence(historicalData, alpha, 'exponential');

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { alpha, smoothed, n },
        factors: {
          trend: this.calculateTrend(prices),
          volatility: this.calculateVolatility(historicalData),
          smoothing: alpha
        }
      };
    } catch (error) {
      logger.error('指數平滑預測錯誤:', error);
      throw error;
    }
  }

  // ARIMA 模型預測
  async arimaModel(historicalData, timeframe) {
    try {
      const n = historicalData.length;
      if (n < 10) {
        throw new Error('ARIMA模型需要至少10個數據點');
      }

      const prices = historicalData.map(d => parseFloat(d.closePrice));

      // 簡化的ARIMA實現
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
      }

      // 計算移動平均
      const ma = this.calculateMovingAverage(returns, 3);
      const predictedReturn = ma[ma.length - 1] || 0;

      const lastPrice = prices[prices.length - 1];
      const daysToPredict = this.getDaysFromTimeframe(timeframe);
      const predictedPrice = lastPrice * Math.pow(1 + predictedReturn, daysToPredict);

      const confidence = this.calculateConfidence(historicalData, predictedReturn, 'arima');

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { returns, ma, predictedReturn },
        factors: {
          trend: predictedReturn > 0 ? 'up' : predictedReturn < 0 ? 'down' : 'stable',
          volatility: this.calculateVolatility(historicalData),
          meanReversion: this.calculateMeanReversion(returns)
        }
      };
    } catch (error) {
      logger.error('ARIMA模型預測錯誤:', error);
      throw error;
    }
  }

  // LSTM 模型預測（簡化實現）
  async lstmModel(historicalData, timeframe) {
    try {
      const n = historicalData.length;
      if (n < 20) {
        throw new Error('LSTM模型需要至少20個數據點');
      }

      // 簡化的LSTM實現，使用序列模式識別
      const prices = historicalData.map(d => parseFloat(d.closePrice));
      const sequence = prices.slice(-10); // 使用最後10個數據點

      // 計算序列趨勢和模式
      const trend = this.calculateTrend(sequence.map((_, i) => ({ closePrice: sequence[i] })));
      const pattern = this.identifyPattern(sequence);

      const daysToPredict = this.getDaysFromTimeframe(timeframe);
      const predictedPrice = this.predictFromPattern(sequence, pattern, daysToPredict);

      const confidence = this.calculateConfidence(historicalData, pattern, 'lstm');

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { sequence, pattern, trend },
        factors: {
          trend,
          volatility: this.calculateVolatility(historicalData),
          patternStrength: this.calculatePatternStrength(sequence, pattern)
        }
      };
    } catch (error) {
      logger.error('LSTM模型預測錯誤:', error);
      throw error;
    }
  }

  // 集成模型預測
  async ensembleModel(historicalData, timeframe) {
    try {
      const models = ['linear', 'polynomial', 'exponential', 'arima'];
      const predictions = [];
      const weights = [0.3, 0.25, 0.25, 0.2]; // 模型權重

      // 獲取各個模型的預測
      for (let i = 0; i < models.length; i++) {
        try {
          const prediction = await this.models[models[i]](historicalData, timeframe);
          predictions.push({
            model: models[i],
            prediction: prediction.predictedPrice,
            confidence: prediction.confidence,
            weight: weights[i]
          });
        } catch (error) {
          logger.warn(`模型 ${models[i]} 預測失敗:`, error.message);
        }
      }

      if (predictions.length === 0) {
        throw new Error('所有模型預測都失敗了');
      }

      // 加權平均預測
      let weightedSum = 0;
      let totalWeight = 0;
      let totalConfidence = 0;

      predictions.forEach(p => {
        weightedSum += p.prediction * p.weight * p.confidence;
        totalWeight += p.weight * p.confidence;
        totalConfidence += p.confidence;
      });

      const predictedPrice = weightedSum / totalWeight;
      const confidence = totalConfidence / predictions.length;

      return {
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        modelParameters: { predictions, weights },
        factors: {
          trend: this.calculateEnsembleTrend(predictions),
          volatility: this.calculateVolatility(historicalData),
          modelAgreement: this.calculateModelAgreement(predictions)
        }
      };
    } catch (error) {
      logger.error('集成模型預測錯誤:', error);
      throw error;
    }
  }

  // 主要預測方法
  async predictCardPrice(cardId, timeframe, modelType = 'ensemble') {
    try {
      const MarketData = getMarketDataModel();
      const PredictionModel = getPredictionModel();

      if (!MarketData || !PredictionModel) {
        throw new Error('數據模型初始化失敗');
      }

      // 獲取歷史市場數據
      const historicalData = await MarketData.findAll({
        where: { cardId, isActive: true },
        order: [['date', 'ASC']],
        limit: 100 // 限制數據量
      });

      if (historicalData.length < 5) {
        throw new Error('歷史數據不足，無法進行預測');
      }

      // 選擇預測模型
      const model = this.models[modelType] || this.models.ensemble;
      const prediction = await model(historicalData, timeframe);

      // 計算風險等級
      const riskLevel = this.calculateRiskLevel(prediction.confidence, prediction.factors.volatility);

      // 保存預測結果
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + this.getDaysFromTimeframe(timeframe));

      const predictionRecord = await PredictionModel.create({
        cardId,
        modelType,
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
        lastTrainingDate: new Date()
      });

      logger.info(`預測完成: 卡牌 ${cardId}, 模型 ${modelType}, 時間框架 ${timeframe}`);

      return {
        id: predictionRecord.id,
        cardId,
        modelType,
        timeframe,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        accuracy: null, // 需要實際價格來計算
        trend: prediction.factors.trend,
        volatility: prediction.factors.volatility,
        factors: prediction.factors,
        riskLevel,
        predictionDate: predictionRecord.predictionDate,
        targetDate: predictionRecord.targetDate,
        modelParameters: prediction.modelParameters
      };
    } catch (error) {
      logger.error('預測卡牌價格錯誤:', error);
      throw error;
    }
  }

  // 獲取預測歷史
  async getPredictionHistory(cardId, limit = 50) {
    try {
      const PredictionModel = getPredictionModel();

      if (!PredictionModel) {
        throw new Error('預測模型初始化失敗');
      }

      const predictions = await PredictionModel.findAll({
        where: { cardId, isActive: true },
        order: [['predictionDate', 'DESC']],
        limit
      });

      return predictions;
    } catch (error) {
      logger.error('獲取預測歷史錯誤:', error);
      throw error;
    }
  }

  // 計算預測準確性
  async calculatePredictionAccuracy(predictionId) {
    try {
      const PredictionModel = getPredictionModel();
      const MarketData = getMarketDataModel();

      if (!PredictionModel || !MarketData) {
        throw new Error('數據模型初始化失敗');
      }

      const prediction = await PredictionModel.findByPk(predictionId);
      if (!prediction) {
        throw new Error('預測記錄不存在');
      }

      // 獲取實際價格
      const actualData = await MarketData.findOne({
        where: {
          cardId: prediction.cardId,
          date: prediction.targetDate
        }
      });

      if (!actualData) {
        return null; // 目標日期還沒有實際數據
      }

      const actualPrice = parseFloat(actualData.closePrice);
      const predictedPrice = parseFloat(prediction.predictedPrice);

      // 計算準確性
      const accuracy = 1 - Math.abs(actualPrice - predictedPrice) / actualPrice;
      const accuracyScore = Math.max(0, Math.min(1, accuracy));

      // 更新預測記錄
      await prediction.update({ accuracy: accuracyScore });

      return {
        predictionId,
        actualPrice,
        predictedPrice,
        accuracy: accuracyScore,
        error: Math.abs(actualPrice - predictedPrice)
      };
    } catch (error) {
      logger.error('計算預測準確性錯誤:', error);
      throw error;
    }
  }

  // 輔助方法
  getDaysFromTimeframe(timeframe) {
    const daysMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365
    };
    return daysMap[timeframe] || 30;
  }

  calculateConfidence(historicalData, modelParams, modelType) {
    // 基於數據質量和模型穩定性計算置信度
    const volatility = this.calculateVolatility(historicalData);
    const dataQuality = Math.min(1, historicalData.length / 50);
    const trendConsistency = this.calculateTrendConsistency(historicalData);

    let baseConfidence = 0.5;

    if (modelType === 'ensemble') {
      baseConfidence = 0.7;
    } else if (modelType === 'lstm') {
      baseConfidence = 0.6;
    } else if (modelType === 'arima') {
      baseConfidence = 0.55;
    }

    const confidence = baseConfidence * dataQuality * (1 - volatility * 0.5) * trendConsistency;
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  calculateVolatility(historicalData) {
    const prices = historicalData.map(d => parseFloat(d.closePrice));
    const returns = [];

    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  calculateTrend(historicalData) {
    const prices = historicalData.map(d => parseFloat(d.closePrice));
    const n = prices.length;

    if (n < 2) return 'stable';

    const firstPrice = prices[0];
    const lastPrice = prices[n - 1];
    const change = (lastPrice - firstPrice) / firstPrice;

    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  calculateRiskLevel(confidence, volatility) {
    const riskScore = (1 - confidence) * 0.6 + volatility * 0.4;

    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }

  // 多項式擬合
  polynomialFit(x, y, degree) {
    // 簡化的多項式擬合實現
    const n = x.length;
    const coefficients = new Array(degree + 1).fill(0);

    // 使用最小二乘法計算係數
    for (let i = 0; i <= degree; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += y[j] * Math.pow(x[j], i);
      }
      coefficients[i] = sum / n;
    }

    return coefficients;
  }

  evaluatePolynomial(coefficients, x) {
    let result = 0;
    for (let i = 0; i < coefficients.length; i++) {
      result += coefficients[i] * Math.pow(x, i);
    }
    return result;
  }

  calculateMovingAverage(data, window) {
    const result = [];
    for (let i = window - 1; i < data.length; i++) {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
    return result;
  }

  identifyPattern(sequence) {
    // 簡化的模式識別
    const trend = this.calculateTrend(sequence.map((_, i) => ({ closePrice: sequence[i] })));
    const volatility = this.calculateVolatility(sequence.map((_, i) => ({ closePrice: sequence[i] })));

    return { trend, volatility, type: 'trend_following' };
  }

  predictFromPattern(sequence, pattern, days) {
    const lastPrice = sequence[sequence.length - 1];
    const {trend} = pattern;

    let multiplier = 1;
    if (trend === 'up') multiplier = 1.02;
    else if (trend === 'down') multiplier = 0.98;

    return lastPrice * Math.pow(multiplier, days);
  }

  calculateTrendConsistency(historicalData) {
    const prices = historicalData.map(d => parseFloat(d.closePrice));
    let consistentCount = 0;

    for (let i = 1; i < prices.length; i++) {
      if ((prices[i] > prices[i-1] && prices[i-1] > prices[i-2]) ||
          (prices[i] < prices[i-1] && prices[i-1] < prices[i-2])) {
        consistentCount++;
      }
    }

    return consistentCount / (prices.length - 2);
  }

  calculateMomentum(historicalData) {
    const prices = historicalData.map(d => parseFloat(d.closePrice));
    const n = prices.length;

    if (n < 5) return 0;

    const recent = prices.slice(-5);
    const earlier = prices.slice(-10, -5);

    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, p) => sum + p, 0) / earlier.length;

    return (recentAvg - earlierAvg) / earlierAvg;
  }

  calculateCurvature(coefficients) {
    if (coefficients.length < 3) return 0;
    return Math.abs(coefficients[2]); // 二次項係數
  }

  calculatePolynomialTrend(coefficients, n) {
    const derivative = coefficients.slice(1).map((coef, i) => coef * (i + 1));
    const slope = this.evaluatePolynomial(derivative, n);

    if (slope > 0.01) return 'up';
    if (slope < -0.01) return 'down';
    return 'stable';
  }

  calculateMeanReversion(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return variance < 0.01 ? 'high' : 'low';
  }

  calculatePatternStrength(sequence, pattern) {
    const {volatility} = pattern;
    return Math.max(0, 1 - volatility * 2);
  }

  calculateEnsembleTrend(predictions) {
    const upCount = predictions.filter(p => p.prediction > 0).length;
    const downCount = predictions.filter(p => p.prediction < 0).length;

    if (upCount > downCount) return 'up';
    if (downCount > upCount) return 'down';
    return 'stable';
  }

  calculateModelAgreement(predictions) {
    const prices = predictions.map(p => p.prediction);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;

    return Math.max(0, 1 - variance / Math.pow(mean, 2));
  }
}

module.exports = new PredictionService();
