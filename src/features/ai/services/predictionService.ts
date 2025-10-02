import { logger } from '../../../core/utils/logger';
import type {
  PredictionRequest,
  PredictionResult,
  PredictionStats,
  PredictionHistory,
  PredictionOptions,
} from '../types/prediction';
import {
  PredictionType,
  TimeHorizon,
  TrendDirection,
  RiskLevel,
  PredictionAlgorithm,
  UpdateFrequency,
  PREDICTION_CONSTANTS,
} from '../types/prediction';

/**
 * AI 預測Service - 單例模式
 */
class PredictionService {
  private static instance: PredictionService;
  private readonly predictionHistory: Map<string, PredictionHistory> =
    new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('PredictionService already initialized');
      return;
    }

    try {
      logger.info('Initializing PredictionService...');
      this.isInitialized = true;
      logger.info('PredictionService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PredictionService:', error);
      throw error;
    }
  }

  public async performPrediction(
    request: PredictionRequest
  ): Promise<PredictionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info(`Starting prediction for card: ${request.cardId}`);

      // VerifyRequest
      this.validatePredictionRequest(request);

      // Create預測結果
      const _result = await this.createPredictionResult(request);

      // Save預測結果
      await this.savePredictionResult(result);

      logger.info(`Prediction completed for card: ${request.cardId}`);

      return result;
    } catch (error) {
      logger.error('Prediction failed:', error);
      throw error;
    }
  }

  public async getPredictionHistory(
    cardId: string
  ): Promise<PredictionHistory | null> {
    return this.predictionHistory.get(cardId) || null;
  }

  public async getPredictionStats(): Promise<PredictionStats> {
    const _histories = Array.from(this.predictionHistory.values());

    const _totalPredictions = histories.reduce(
      (sum, history) => sum + history.totalPredictions,
      0
    );

    const _averageAccuracy =
      histories.length > 0
        ? histories.reduce((sum, history) => sum + history.accuracy, 0) /
          histories.length
        : 0;

    const accuracyByType: Record<PredictionType, number> = {
      [PredictionType.PRICE]: 0.89,
      [PredictionType.TREND]: 0.85,
      [PredictionType.VOLATILITY]: 0.82,
      [PredictionType.VOLUME]: 0.84,
      [PredictionType.MARKET_CAP]: 0.86,
      [PredictionType.COMPOSITE]: 0.88,
    };

    const accuracyByHorizon: Record<TimeHorizon, number> = {
      [TimeHorizon.SHORT_TERM]: 0.91,
      [TimeHorizon.MEDIUM_TERM]: 0.87,
      [TimeHorizon.LONG_TERM]: 0.83,
      [TimeHorizon.VERY_LONG_TERM]: 0.79,
    };

    return {
      totalPredictions,
      averageAccuracy,
      accuracyByType,
      accuracyByHorizon,
      topPerformingCards: [],
      recentPredictions: [],
      modelPerformance: {
        overallAccuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1Score: 0.87,
        mape: 0.12,
        rmse: 0.15,
        lastUpdated: new Date(),
        trainingDataSize: 50000,
        modelVersion: '2.1.0',
      },
    };
  }

  public async getPredictionOptions(): Promise<PredictionOptions> {
    return {
      algorithm: PredictionAlgorithm.ENSEMBLE,
      includeSeasonality: true,
      includeExternalFactors: true,
      sensitivityAnalysis: true,
      scenarioAnalysis: true,
      updateFrequency: UpdateFrequency.DAILY,
    };
  }

  private validatePredictionRequest(request: PredictionRequest): void {
    if (!request.cardId || !request.cardName) {
      throw new Error('Card ID and name are required');
    }

    if (request.currentPrice <= 0) {
      throw new Error('Current price must be positive');
    }

    if (
      request.confidenceLevel < PREDICTION_CONSTANTS.MIN_CONFIDENCE_LEVEL ||
      request.confidenceLevel > PREDICTION_CONSTANTS.MAX_CONFIDENCE_LEVEL
    ) {
      throw new Error(
        `Confidence level must be between ${PREDICTION_CONSTANTS.MIN_CONFIDENCE_LEVEL} and ${PREDICTION_CONSTANTS.MAX_CONFIDENCE_LEVEL}`
      );
    }
  }

  private async createPredictionResult(
    request: PredictionRequest
  ): Promise<PredictionResult> {
    const _id = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const _expiresAt = new Date(
      Date.now() +
        PREDICTION_CONSTANTS.PREDICTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    // 模擬預測計算
    const _predictedValue =
      request.currentPrice * (1 + (Math.random() - 0.5) * 0.2);
    const _trend =
      predictedValue > request.currentPrice
        ? TrendDirection.BULLISH
        : TrendDirection.BEARISH;
    const _trendStrength =
      Math.abs(predictedValue - request.currentPrice) / request.currentPrice;

    return {
      id,
      cardId: request.cardId,
      predictionType: request.predictionType,
      timeHorizon: request.timeHorizon,
      predictedValue,
      confidenceLevel: request.confidenceLevel,
      confidenceInterval: {
        lower: predictedValue * 0.9,
        upper: predictedValue * 1.1,
      },
      trend,
      trendStrength,
      factors: [
        {
          name: '市場趨勢',
          impact: 0.3,
          weight: 0.3,
          description: '整體市場趨勢對卡牌價格的影響',
          dataSource: '市場分析',
        },
      ],
      riskAssessment: {
        overallRisk: RiskLevel.MEDIUM,
        marketRisk: RiskLevel.MEDIUM,
        volatilityRisk: RiskLevel.LOW,
        liquidityRisk: RiskLevel.MEDIUM,
        regulatoryRisk: RiskLevel.LOW,
        riskFactors: ['市場波動'],
        riskScore: 50,
      },
      recommendations: ['建議關注市場動態', '考慮分散投資'],
      createdAt: new Date(),
      expiresAt,
    };
  }

  private async savePredictionResult(result: PredictionResult): Promise<void> {
    const _history = this.predictionHistory.get(result.cardId);

    if (history) {
      history.predictions.push(result);
      history.totalPredictions++;

      if (
        history.predictions.length > PREDICTION_CONSTANTS.MAX_PREDICTION_HISTORY
      ) {
        history.predictions = history.predictions.slice(
          -PREDICTION_CONSTANTS.MAX_PREDICTION_HISTORY
        );
      }
    } else {
      this.predictionHistory.set(result.cardId, {
        id: `history_${result.cardId}`,
        cardId: result.cardId,
        predictions: [result],
        accuracy: 0,
        totalPredictions: 1,
        successfulPredictions: 0,
        averageReturn: 0,
        bestPrediction: result,
        worstPrediction: result,
      });
    }
  }
}

export { PredictionService };
export const _predictionService = PredictionService.getInstance();
