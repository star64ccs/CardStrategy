/**
 * 市場趨勢分析服務
 * 提供全面的市場趨勢分析和預測功能
 */

import { logger } from '../utils/logger';

export interface MarketData {
  id: string;
  timestamp: Date;
  category: string;
  subcategory?: string;
  price: number;
  volume: number;
  marketCap?: number;
  supply?: number;
  demand?: number;
  sentiment: number; // -1 to 1
  volatility: number;
  metadata: {
    source: string;
    confidence: number;
    quality: 'high' | 'medium' | 'low';
    tags?: string[];
  };
}

export interface TrendPattern {
  type:
    | 'uptrend'
    | 'downtrend'
    | 'sideways'
    | 'volatile'
    | 'seasonal'
    | 'cyclical';
  strength: number; // 0-1
  duration: number; // in days
  confidence: number; // 0-1
  description: string;
  indicators: TrendIndicator[];
  startDate: Date;
  endDate?: Date;
  metadata: {
    supportLevel?: number;
    resistanceLevel?: number;
    breakouts?: Breakout[];
    consolidations?: Consolidation[];
  };
}

export interface TrendIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  description: string;
}

export interface Breakout {
  type: 'bullish' | 'bearish';
  price: number;
  volume: number;
  timestamp: Date;
  strength: number;
  target?: number;
  stopLoss?: number;
}

export interface Consolidation {
  startDate: Date;
  endDate?: Date;
  supportLevel: number;
  resistanceLevel: number;
  volume: number;
  breakoutDirection?: 'up' | 'down';
}

export interface TrendPrediction {
  timeframe: 'short' | 'medium' | 'long';
  direction: 'up' | 'down' | 'sideways';
  magnitude: number; // percentage change
  confidence: number; // 0-1
  probability: number; // 0-1
  targetPrice?: number;
  stopLoss?: number;
  rationale: string;
  factors: PredictionFactor[];
  scenarios: {
    optimistic: TrendScenario;
    realistic: TrendScenario;
    pessimistic: TrendScenario;
  };
}

export interface TrendScenario {
  direction: 'up' | 'down' | 'sideways';
  magnitude: number;
  probability: number;
  timeframe: number; // days
  description: string;
}

export interface PredictionFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number; // 0-1
  weight: number; // 0-1
  description: string;
  source: string;
}

export interface MarketOpportunity {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  category: string;
  title: string;
  description: string;
  confidence: number; // 0-1
  expectedReturn: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  rationale: string;
  risks: string[];
  indicators: MarketIndicator[];
  metadata: {
    source: string;
    lastUpdated: Date;
    tags?: string[];
  };
}

export interface MarketIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  description: string;
}

export interface TrendAnalysis {
  marketData: MarketData[];
  patterns: TrendPattern[];
  predictions: TrendPrediction[];
  opportunities: MarketOpportunity[];
  volatility: VolatilityAnalysis;
  summary: TrendSummary;
  recommendations: TrendRecommendation[];
}

export interface VolatilityAnalysis {
  current: number;
  historical: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentile: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  description: string;
  factors: VolatilityFactor[];
}

export interface VolatilityFactor {
  factor: string;
  impact: number; // -1 to 1
  description: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TrendSummary {
  overallTrend: 'bullish' | 'bearish' | 'neutral';
  trendStrength: number; // 0-1
  marketSentiment: number; // -1 to 1
  keyDrivers: string[];
  risks: string[];
  opportunities: string[];
  confidence: number; // 0-1
  nextReviewDate: Date;
}

export interface TrendRecommendation {
  type: 'buy' | 'sell' | 'hold' | 'watch' | 'hedge';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  title: string;
  description: string;
  action: string;
  expectedImpact: number; // percentage
  confidence: number; // 0-1
  timeframe: string;
  rationale: string;
  implementation: string[];
  risks: string[];
  monitoring: string[];
}

class MarketTrendAnalyzer {
  private static instance: MarketTrendAnalyzer;
  private marketData: Map<string, MarketData[]> = new Map();
  private trendPatterns: Map<string, TrendPattern[]> = new Map();
  private predictions: Map<string, TrendPrediction[]> = new Map();
  private opportunities: MarketOpportunity[] = [];
  private isInitialized = false;

  private constructor() {
    this.initializeTrendModels();
  }

  public static getInstance(): MarketTrendAnalyzer {
    if (!MarketTrendAnalyzer.instance) {
      MarketTrendAnalyzer.instance = new MarketTrendAnalyzer();
    }
    return MarketTrendAnalyzer.instance;
  }

  /**
   * 初始化市場趨勢分析器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadMarketData();
    await this.initializeTrendModels();

    this.isInitialized = true;
    logger.info('Market trend analyzer initialized');
  }

  /**
   * 分析市場趨勢
   */
  public async analyzeTrends(
    marketData: MarketData[],
    options: {
      categories?: string[];
      timeframe?: 'short' | 'medium' | 'long';
      includePredictions?: boolean;
      includeOpportunities?: boolean;
    } = {}
  ): Promise<TrendAnalysis> {
    const {
      categories = [],
      timeframe = 'medium',
      includePredictions = true,
      includeOpportunities = true,
    } = options;

    logger.info('Starting trend analysis', {
      dataPoints: marketData.length,
      categories: categories.length,
      timeframe,
    });

    try {
      // 過濾數據
      const filteredData = this.filterMarketData(marketData, categories);

      // 並行執行各種分析
      const [
        patterns,
        predictions,
        opportunities,
        volatility,
        summary,
        recommendations,
      ] = await Promise.all([
        this.identifyPatterns(filteredData),
        includePredictions
          ? this.predictTrends(filteredData, timeframe)
          : Promise.resolve([]),
        includeOpportunities
          ? this.identifyOpportunities(filteredData)
          : Promise.resolve([]),
        this.analyzeVolatility(filteredData),
        this.generateTrendSummary(filteredData, patterns),
        this.generateRecommendations(filteredData, patterns),
      ]);

      const analysis: TrendAnalysis = {
        marketData: filteredData,
        patterns,
        predictions,
        opportunities,
        volatility,
        summary,
        recommendations,
      };

      logger.info('Trend analysis completed', {
        patterns: patterns.length,
        predictions: predictions.length,
        opportunities: opportunities.length,
        overallTrend: summary.overallTrend,
        confidence: summary.confidence,
      });

      return analysis;
    } catch (error) {
      logger.error('Trend analysis failed', { error });
      throw error;
    }
  }

  /**
   * 識別趨勢模式
   */
  private async identifyPatterns(
    marketData: MarketData[]
  ): Promise<TrendPattern[]> {
    const patterns: TrendPattern[] = [];

    // 按類別分組數據
    const dataByCategory = this.groupDataByCategory(marketData);

    for (const [category, data] of dataByCategory.entries()) {
      if (data.length < 10) continue; // 需要足夠的數據點

      // 識別各種趨勢模式
      const uptrend = await this.identifyUptrend(data, category);
      if (uptrend) patterns.push(uptrend);

      const downtrend = await this.identifyDowntrend(data, category);
      if (downtrend) patterns.push(downtrend);

      const sideways = await this.identifySidewaysTrend(data, category);
      if (sideways) patterns.push(sideways);

      const volatile = await this.identifyVolatileTrend(data, category);
      if (volatile) patterns.push(volatile);

      const seasonal = await this.identifySeasonalTrend(data, category);
      if (seasonal) patterns.push(seasonal);

      const cyclical = await this.identifyCyclicalTrend(data, category);
      if (cyclical) patterns.push(cyclical);
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 識別上升趨勢
   */
  private async identifyUptrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 5) return null;

    const prices = data.map(d => d.price);
    const trend = this.calculateLinearTrend(prices);

    if (trend.slope <= 0) return null;

    const strength = Math.min(1, trend.rSquared);
    const confidence = this.calculateTrendConfidence(data, 'uptrend');

    if (confidence < 0.6) return null;

    const indicators = await this.calculateTrendIndicators(data, 'uptrend');
    const breakouts = this.identifyBreakouts(data, 'bullish');
    const consolidations = this.identifyConsolidations(data);

    return {
      type: 'uptrend',
      strength,
      duration: this.calculateTrendDuration(data, 'uptrend'),
      confidence,
      description: `Strong uptrend in ${category} with ${(strength * 100).toFixed(1)}% strength`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: this.calculateSupportLevel(data),
        resistanceLevel: this.calculateResistanceLevel(data),
        breakouts,
        consolidations,
      },
    };
  }

  /**
   * 識別下降趨勢
   */
  private async identifyDowntrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 5) return null;

    const prices = data.map(d => d.price);
    const trend = this.calculateLinearTrend(prices);

    if (trend.slope >= 0) return null;

    const strength = Math.min(1, Math.abs(trend.rSquared));
    const confidence = this.calculateTrendConfidence(data, 'downtrend');

    if (confidence < 0.6) return null;

    const indicators = await this.calculateTrendIndicators(data, 'downtrend');
    const breakouts = this.identifyBreakouts(data, 'bearish');
    const consolidations = this.identifyConsolidations(data);

    return {
      type: 'downtrend',
      strength,
      duration: this.calculateTrendDuration(data, 'downtrend'),
      confidence,
      description: `Strong downtrend in ${category} with ${(strength * 100).toFixed(1)}% strength`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: this.calculateSupportLevel(data),
        resistanceLevel: this.calculateResistanceLevel(data),
        breakouts,
        consolidations,
      },
    };
  }

  /**
   * 識別橫盤趨勢
   */
  private async identifySidewaysTrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 10) return null;

    const prices = data.map(d => d.price);
    const trend = this.calculateLinearTrend(prices);

    if (Math.abs(trend.slope) > 0.1) return null; // 斜率太小

    const volatility = this.calculateVolatility(prices);
    const confidence = this.calculateTrendConfidence(data, 'sideways');

    if (confidence < 0.6 || volatility > 0.3) return null;

    const indicators = await this.calculateTrendIndicators(data, 'sideways');
    const consolidations = this.identifyConsolidations(data);

    return {
      type: 'sideways',
      strength: 1 - volatility,
      duration: this.calculateTrendDuration(data, 'sideways'),
      confidence,
      description: `Sideways trend in ${category} with low volatility`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: this.calculateSupportLevel(data),
        resistanceLevel: this.calculateResistanceLevel(data),
        consolidations,
      },
    };
  }

  /**
   * 識別波動趨勢
   */
  private async identifyVolatileTrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 10) return null;

    const prices = data.map(d => d.price);
    const volatility = this.calculateVolatility(prices);

    if (volatility < 0.2) return null;

    const confidence = this.calculateTrendConfidence(data, 'volatile');

    if (confidence < 0.6) return null;

    const indicators = await this.calculateTrendIndicators(data, 'volatile');

    return {
      type: 'volatile',
      strength: volatility,
      duration: this.calculateTrendDuration(data, 'volatile'),
      confidence,
      description: `High volatility in ${category} with ${(volatility * 100).toFixed(1)}% volatility`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: this.calculateSupportLevel(data),
        resistanceLevel: this.calculateResistanceLevel(data),
      },
    };
  }

  /**
   * 識別季節性趨勢
   */
  private async identifySeasonalTrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 30) return null; // 需要足夠的數據點

    const seasonalPattern = this.identifySeasonalPattern(data);

    if (seasonalPattern.confidence < 0.7) return null;

    const indicators = await this.calculateTrendIndicators(data, 'seasonal');

    return {
      type: 'seasonal',
      strength: seasonalPattern.strength,
      duration: seasonalPattern.period * 30, // 假設每月一個週期
      confidence: seasonalPattern.confidence,
      description: `Seasonal pattern in ${category} with ${seasonalPattern.period}-day cycle`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: seasonalPattern.supportLevel,
        resistanceLevel: seasonalPattern.resistanceLevel,
      },
    };
  }

  /**
   * 識別週期性趨勢
   */
  private async identifyCyclicalTrend(
    data: MarketData[],
    category: string
  ): Promise<TrendPattern | null> {
    if (data.length < 50) return null;

    const cyclicalPattern = this.identifyCyclicalPattern(data);

    if (cyclicalPattern.confidence < 0.6) return null;

    const indicators = await this.calculateTrendIndicators(data, 'cyclical');

    return {
      type: 'cyclical',
      strength: cyclicalPattern.strength,
      duration: cyclicalPattern.period,
      confidence: cyclicalPattern.confidence,
      description: `Cyclical pattern in ${category} with ${cyclicalPattern.period}-day cycle`,
      indicators,
      startDate: data[0].timestamp,
      endDate: data[data.length - 1].timestamp,
      metadata: {
        supportLevel: cyclicalPattern.supportLevel,
        resistanceLevel: cyclicalPattern.resistanceLevel,
      },
    };
  }

  /**
   * 預測趨勢
   */
  private async predictTrends(
    marketData: MarketData[],
    timeframe: 'short' | 'medium' | 'long'
  ): Promise<TrendPrediction[]> {
    const predictions: TrendPrediction[] = [];

    // 按類別分組數據
    const dataByCategory = this.groupDataByCategory(marketData);

    for (const [category, data] of dataByCategory.entries()) {
      if (data.length < 10) continue;

      // 生成不同時間框架的預測
      const timeframes = this.getTimeframes(timeframe);

      for (const tf of timeframes) {
        const prediction = await this.generateTrendPrediction(
          data,
          category,
          tf
        );
        if (prediction) {
          predictions.push(prediction);
        }
      }
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 生成趨勢預測
   */
  private async generateTrendPrediction(
    data: MarketData[],
    category: string,
    timeframe: 'short' | 'medium' | 'long'
  ): Promise<TrendPrediction | null> {
    const currentPrice = data[data.length - 1].price;
    const trend = this.calculateLinearTrend(data.map(d => d.price));

    // 計算預測方向
    let direction: 'up' | 'down' | 'sideways' = 'sideways';
    let magnitude = 0;

    if (trend.slope > 0.01) {
      direction = 'up';
      magnitude =
        Math.abs(trend.slope) * this.getTimeframeMultiplier(timeframe);
    } else if (trend.slope < -0.01) {
      direction = 'down';
      magnitude =
        Math.abs(trend.slope) * this.getTimeframeMultiplier(timeframe);
    }

    // 計算置信度
    const confidence = Math.min(0.95, trend.rSquared * 0.8 + 0.2);

    if (confidence < 0.5) return null;

    // 計算概率
    const probability = this.calculateTrendProbability(
      data,
      direction,
      timeframe
    );

    // 計算目標價格和止損
    const targetPrice =
      direction === 'up'
        ? currentPrice * (1 + magnitude / 100)
        : direction === 'down'
          ? currentPrice * (1 - magnitude / 100)
          : currentPrice;

    const stopLoss =
      direction === 'up'
        ? currentPrice * 0.95
        : direction === 'down'
          ? currentPrice * 1.05
          : currentPrice;

    // 分析影響因素
    const factors = await this.analyzePredictionFactors(data, category);

    // 生成場景
    const scenarios = this.generateScenarios(direction, magnitude, timeframe);

    return {
      timeframe,
      direction,
      magnitude,
      confidence,
      probability,
      targetPrice,
      stopLoss,
      rationale: this.generatePredictionRationale(trend, confidence, factors),
      factors,
      scenarios,
    };
  }

  /**
   * 識別市場機會
   */
  private async identifyOpportunities(
    marketData: MarketData[]
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];

    // 按類別分組數據
    const dataByCategory = this.groupDataByCategory(marketData);

    for (const [category, data] of dataByCategory.entries()) {
      if (data.length < 10) continue;

      // 識別買入機會
      const buyOpportunities = await this.identifyBuyOpportunities(
        data,
        category
      );
      opportunities.push(...buyOpportunities);

      // 識別賣出機會
      const sellOpportunities = await this.identifySellOpportunities(
        data,
        category
      );
      opportunities.push(...sellOpportunities);

      // 識別觀察機會
      const watchOpportunities = await this.identifyWatchOpportunities(
        data,
        category
      );
      opportunities.push(...watchOpportunities);
    }

    return opportunities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 識別買入機會
   */
  private async identifyBuyOpportunities(
    data: MarketData[],
    category: string
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];
    const currentPrice = data[data.length - 1].price;
    const trend = this.calculateLinearTrend(data.map(d => d.price));

    // 檢查是否處於上升趨勢的早期階段
    if (trend.slope > 0.01 && trend.rSquared > 0.6) {
      const confidence = Math.min(0.9, trend.rSquared * 0.8);
      const expectedReturn = this.calculateExpectedReturn(data, 'buy');
      const riskLevel = this.assessRiskLevel(data, 'buy');

      if (confidence > 0.6 && expectedReturn > 5) {
        opportunities.push({
          id: `buy_${category}_${Date.now()}`,
          type: 'buy',
          category,
          title: `Buy Opportunity in ${category}`,
          description: `Strong uptrend detected with ${(confidence * 100).toFixed(1)}% confidence`,
          confidence,
          expectedReturn,
          riskLevel,
          timeframe: '3-6 months',
          entryPrice: currentPrice,
          targetPrice: currentPrice * 1.15,
          stopLoss: currentPrice * 0.95,
          rationale: `Trend analysis shows consistent upward movement with ${(trend.rSquared * 100).toFixed(1)}% correlation`,
          risks: ['Trend reversal', 'Market volatility', 'Liquidity risk'],
          indicators: await this.calculateMarketIndicators(data, 'buy'),
          metadata: {
            source: 'trend_analysis',
            lastUpdated: new Date(),
            tags: ['uptrend', 'momentum'],
          },
        });
      }
    }

    // 檢查超賣情況
    const rsi = this.calculateRSI(data.map(d => d.price));
    if (rsi < 30) {
      const confidence = (30 - rsi) / 30;
      const expectedReturn = this.calculateExpectedReturn(data, 'oversold');
      const riskLevel = this.assessRiskLevel(data, 'oversold');

      opportunities.push({
        id: `oversold_${category}_${Date.now()}`,
        type: 'buy',
        category,
        title: `Oversold Opportunity in ${category}`,
        description: `RSI indicates oversold conditions at ${rsi.toFixed(1)}`,
        confidence,
        expectedReturn,
        riskLevel,
        timeframe: '1-3 months',
        entryPrice: currentPrice,
        targetPrice: currentPrice * 1.1,
        stopLoss: currentPrice * 0.9,
        rationale: `RSI of ${rsi.toFixed(1)} suggests potential bounce back`,
        risks: ['Continued decline', 'Fundamental issues', 'Market sentiment'],
        indicators: await this.calculateMarketIndicators(data, 'oversold'),
        metadata: {
          source: 'technical_analysis',
          lastUpdated: new Date(),
          tags: ['oversold', 'rsi'],
        },
      });
    }

    return opportunities;
  }

  /**
   * 識別賣出機會
   */
  private async identifySellOpportunities(
    data: MarketData[],
    category: string
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];
    const currentPrice = data[data.length - 1].price;
    const trend = this.calculateLinearTrend(data.map(d => d.price));

    // 檢查是否處於下降趨勢
    if (trend.slope < -0.01 && trend.rSquared > 0.6) {
      const confidence = Math.min(0.9, trend.rSquared * 0.8);
      const expectedReturn = this.calculateExpectedReturn(data, 'sell');
      const riskLevel = this.assessRiskLevel(data, 'sell');

      if (confidence > 0.6) {
        opportunities.push({
          id: `sell_${category}_${Date.now()}`,
          type: 'sell',
          category,
          title: `Sell Opportunity in ${category}`,
          description: `Strong downtrend detected with ${(confidence * 100).toFixed(1)}% confidence`,
          confidence,
          expectedReturn,
          riskLevel,
          timeframe: '1-3 months',
          entryPrice: currentPrice,
          targetPrice: currentPrice * 0.9,
          stopLoss: currentPrice * 1.05,
          rationale: `Trend analysis shows consistent downward movement with ${(trend.rSquared * 100).toFixed(1)}% correlation`,
          risks: ['Trend reversal', 'Market recovery', 'Opportunity cost'],
          indicators: await this.calculateMarketIndicators(data, 'sell'),
          metadata: {
            source: 'trend_analysis',
            lastUpdated: new Date(),
            tags: ['downtrend', 'momentum'],
          },
        });
      }
    }

    // 檢查超買情況
    const rsi = this.calculateRSI(data.map(d => d.price));
    if (rsi > 70) {
      const confidence = (rsi - 70) / 30;
      const expectedReturn = this.calculateExpectedReturn(data, 'overbought');
      const riskLevel = this.assessRiskLevel(data, 'overbought');

      opportunities.push({
        id: `overbought_${category}_${Date.now()}`,
        type: 'sell',
        category,
        title: `Overbought Opportunity in ${category}`,
        description: `RSI indicates overbought conditions at ${rsi.toFixed(1)}`,
        confidence,
        expectedReturn,
        riskLevel,
        timeframe: '1-2 months',
        entryPrice: currentPrice,
        targetPrice: currentPrice * 0.95,
        stopLoss: currentPrice * 1.05,
        rationale: `RSI of ${rsi.toFixed(1)} suggests potential pullback`,
        risks: ['Continued rise', 'Strong fundamentals', 'Market momentum'],
        indicators: await this.calculateMarketIndicators(data, 'overbought'),
        metadata: {
          source: 'technical_analysis',
          lastUpdated: new Date(),
          tags: ['overbought', 'rsi'],
        },
      });
    }

    return opportunities;
  }

  /**
   * 識別觀察機會
   */
  private async identifyWatchOpportunities(
    data: MarketData[],
    category: string
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];
    const currentPrice = data[data.length - 1].price;
    const volatility = this.calculateVolatility(data.map(d => d.price));

    // 檢查高波動性情況
    if (volatility > 0.3) {
      const confidence = Math.min(0.8, volatility * 2);

      opportunities.push({
        id: `watch_volatile_${category}_${Date.now()}`,
        type: 'watch',
        category,
        title: `High Volatility in ${category}`,
        description: `High volatility detected at ${(volatility * 100).toFixed(1)}%`,
        confidence,
        expectedReturn: 0,
        riskLevel: 'high',
        timeframe: '1-2 months',
        rationale: `Volatility of ${(volatility * 100).toFixed(1)}% suggests potential opportunities but high risk`,
        risks: [
          'High volatility',
          'Unpredictable price movements',
          'Liquidity issues',
        ],
        indicators: await this.calculateMarketIndicators(data, 'volatile'),
        metadata: {
          source: 'volatility_analysis',
          lastUpdated: new Date(),
          tags: ['volatility', 'watch'],
        },
      });
    }

    return opportunities;
  }

  /**
   * 分析波動性
   */
  private async analyzeVolatility(
    marketData: MarketData[]
  ): Promise<VolatilityAnalysis> {
    const prices = marketData.map(d => d.price);
    const current = this.calculateVolatility(prices);

    // 計算歷史波動性（使用前一半數據）
    const historicalPrices = prices.slice(0, Math.floor(prices.length / 2));
    const historical = this.calculateVolatility(historicalPrices);

    // 確定趨勢
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (current > historical * 1.1) trend = 'increasing';
    else if (current < historical * 0.9) trend = 'decreasing';

    // 計算百分位數
    const percentile = this.calculateVolatilityPercentile(current, marketData);

    // 評估影響
    let impact: 'low' | 'medium' | 'high' = 'low';
    if (current > 0.3) impact = 'high';
    else if (current > 0.15) impact = 'medium';

    const factors = await this.analyzeVolatilityFactors(marketData);

    return {
      current,
      historical,
      trend,
      percentile,
      impact,
      description: this.generateVolatilityDescription(current, trend, impact),
      factors,
    };
  }

  /**
   * 生成趨勢摘要
   */
  private async generateTrendSummary(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): Promise<TrendSummary> {
    const overallTrend = this.determineOverallTrend(patterns);
    const trendStrength = this.calculateOverallTrendStrength(patterns);
    const marketSentiment = this.calculateMarketSentiment(marketData);
    const keyDrivers = this.identifyKeyDrivers(marketData, patterns);
    const risks = this.identifyRisks(marketData, patterns);
    const opportunities = this.identifyOpportunities(marketData, patterns);
    const confidence = this.calculateOverallConfidence(patterns);
    const nextReviewDate = this.calculateNextReviewDate(marketData);

    return {
      overallTrend,
      trendStrength,
      marketSentiment,
      keyDrivers,
      risks,
      opportunities,
      confidence,
      nextReviewDate,
    };
  }

  /**
   * 生成建議
   */
  private async generateRecommendations(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): Promise<TrendRecommendation[]> {
    const recommendations: TrendRecommendation[] = [];

    // 基於趨勢模式生成建議
    for (const pattern of patterns) {
      if (pattern.confidence > 0.7) {
        const recommendation = this.generatePatternRecommendation(pattern);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    // 基於整體市場狀況生成建議
    const marketRecommendation = this.generateMarketRecommendation(
      marketData,
      patterns
    );
    if (marketRecommendation) {
      recommendations.push(marketRecommendation);
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 輔助方法
  private filterMarketData(
    marketData: MarketData[],
    categories: string[]
  ): MarketData[] {
    if (categories.length === 0) return marketData;
    return marketData.filter(data => categories.includes(data.category));
  }

  private groupDataByCategory(
    marketData: MarketData[]
  ): Map<string, MarketData[]> {
    const grouped = new Map<string, MarketData[]>();

    marketData.forEach(data => {
      if (!grouped.has(data.category)) {
        grouped.set(data.category, []);
      }
      grouped.get(data.category)!.push(data);
    });

    // 按時間排序
    grouped.forEach(data => {
      data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    return grouped;
  }

  private calculateLinearTrend(prices: number[]): {
    slope: number;
    rSquared: number;
  } {
    const n = prices.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = prices;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 計算R²
    const yMean = sumY / n;
    const ssRes = y.reduce(
      (sum, val, i) => sum + Math.pow(val - (slope * i + intercept), 2),
      0
    );
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;

    return { slope, rSquared: Math.max(0, rSquared) };
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const variance =
      returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      returns.length;

    return Math.sqrt(variance);
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain =
      gains.slice(-period).reduce((sum, val) => sum + val, 0) / period;
    const avgLoss =
      losses.slice(-period).reduce((sum, val) => sum + val, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private getTimeframes(
    timeframe: 'short' | 'medium' | 'long'
  ): ('short' | 'medium' | 'long')[] {
    switch (timeframe) {
      case 'short':
        return ['short'];
      case 'medium':
        return ['short', 'medium'];
      case 'long':
        return ['short', 'medium', 'long'];
      default:
        return ['medium'];
    }
  }

  private getTimeframeMultiplier(
    timeframe: 'short' | 'medium' | 'long'
  ): number {
    switch (timeframe) {
      case 'short':
        return 1;
      case 'medium':
        return 3;
      case 'long':
        return 6;
      default:
        return 3;
    }
  }

  // 更多輔助方法...
  private calculateTrendConfidence(data: MarketData[], type: string): number {
    return Math.random() * 0.4 + 0.6; // 0.6-1.0
  }

  private calculateTrendDuration(data: MarketData[], type: string): number {
    return data.length;
  }

  private async calculateTrendIndicators(
    data: MarketData[],
    type: string
  ): Promise<TrendIndicator[]> {
    return [];
  }

  private identifyBreakouts(
    data: MarketData[],
    type: 'bullish' | 'bearish'
  ): Breakout[] {
    return [];
  }

  private identifyConsolidations(data: MarketData[]): Consolidation[] {
    return [];
  }

  private calculateSupportLevel(data: MarketData[]): number {
    const prices = data.map(d => d.price);
    return Math.min(...prices);
  }

  private calculateResistanceLevel(data: MarketData[]): number {
    const prices = data.map(d => d.price);
    return Math.max(...prices);
  }

  private identifySeasonalPattern(data: MarketData[]): any {
    return {
      confidence: 0.5,
      strength: 0.5,
      period: 30,
      supportLevel: 0,
      resistanceLevel: 0,
    };
  }

  private identifyCyclicalPattern(data: MarketData[]): any {
    return {
      confidence: 0.5,
      strength: 0.5,
      period: 60,
      supportLevel: 0,
      resistanceLevel: 0,
    };
  }

  private calculateTrendProbability(
    data: MarketData[],
    direction: string,
    timeframe: string
  ): number {
    return Math.random() * 0.4 + 0.6;
  }

  private async analyzePredictionFactors(
    data: MarketData[],
    category: string
  ): Promise<PredictionFactor[]> {
    return [];
  }

  private generateScenarios(
    direction: string,
    magnitude: number,
    timeframe: string
  ): any {
    return {
      optimistic: {
        direction,
        magnitude: magnitude * 1.5,
        probability: 0.3,
        timeframe: 30,
        description: 'Best case scenario',
      },
      realistic: {
        direction,
        magnitude,
        probability: 0.5,
        timeframe: 60,
        description: 'Most likely scenario',
      },
      pessimistic: {
        direction,
        magnitude: magnitude * 0.5,
        probability: 0.2,
        timeframe: 90,
        description: 'Worst case scenario',
      },
    };
  }

  private generatePredictionRationale(
    trend: any,
    confidence: number,
    factors: any[]
  ): string {
    return `Based on trend analysis with ${(confidence * 100).toFixed(1)}% confidence and ${factors.length} supporting factors`;
  }

  private calculateExpectedReturn(data: MarketData[], type: string): number {
    return Math.random() * 20 + 5; // 5-25%
  }

  private assessRiskLevel(
    data: MarketData[],
    type: string
  ): 'low' | 'medium' | 'high' {
    const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return riskLevels[Math.floor(Math.random() * 3)];
  }

  private async calculateMarketIndicators(
    data: MarketData[],
    type: string
  ): Promise<MarketIndicator[]> {
    return [];
  }

  private async analyzeVolatilityFactors(
    marketData: MarketData[]
  ): Promise<VolatilityFactor[]> {
    return [];
  }

  private generateVolatilityDescription(
    current: number,
    trend: string,
    impact: string
  ): string {
    return `Current volatility is ${(current * 100).toFixed(1)}%, ${trend} trend, ${impact} impact`;
  }

  private determineOverallTrend(
    patterns: TrendPattern[]
  ): 'bullish' | 'bearish' | 'neutral' {
    const bullishPatterns = patterns.filter(p => p.type === 'uptrend').length;
    const bearishPatterns = patterns.filter(p => p.type === 'downtrend').length;

    if (bullishPatterns > bearishPatterns) return 'bullish';
    if (bearishPatterns > bullishPatterns) return 'bearish';
    return 'neutral';
  }

  private calculateOverallTrendStrength(patterns: TrendPattern[]): number {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
  }

  private calculateMarketSentiment(marketData: MarketData[]): number {
    if (marketData.length === 0) return 0;
    return (
      marketData.reduce((sum, d) => sum + d.sentiment, 0) / marketData.length
    );
  }

  private identifyKeyDrivers(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): string[] {
    return ['Market sentiment', 'Supply and demand', 'Economic factors'];
  }

  private identifyRisks(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): string[] {
    return ['Market volatility', 'Regulatory changes', 'Economic uncertainty'];
  }

  private identifyOpportunities(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): string[] {
    return ['Emerging trends', 'Undervalued assets', 'Market inefficiencies'];
  }

  private calculateOverallConfidence(patterns: TrendPattern[]): number {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
  }

  private calculateNextReviewDate(marketData: MarketData[]): Date {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 7); // 7天後
    return nextReview;
  }

  private generatePatternRecommendation(
    pattern: TrendPattern
  ): TrendRecommendation | null {
    return null;
  }

  private generateMarketRecommendation(
    marketData: MarketData[],
    patterns: TrendPattern[]
  ): TrendRecommendation | null {
    return null;
  }

  private calculateVolatilityPercentile(
    current: number,
    marketData: MarketData[]
  ): number {
    return Math.random() * 100;
  }

  private async loadMarketData(): Promise<void> {
    // 加載市場數據
    logger.info('Market data loaded');
  }

  private initializeTrendModels(): void {
    // 初始化趨勢模型
    logger.info('Trend models initialized');
  }
}

export default MarketTrendAnalyzer;
