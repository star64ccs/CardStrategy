/**
 * 異常檢測系統
 * 提供統計和機器學習異常檢測功能
 */

import { logger } from '../utils/logger';

export interface Anomaly {
  id: string;
  type: 'statistical' | 'ml' | 'pattern' | 'threshold' | 'trend' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  confidence: number;
  message: string;
  field: string;
  value: any;
  expectedValue?: any;
  timestamp: Date;
  context: {
    dataPoint: any;
    historicalData?: any[];
    metadata?: any;
  };
  recommendations?: string[];
  autoResolve?: boolean;
  resolvedAt?: Date;
}

export interface AnomalyConfig {
  statisticalThreshold?: number; // Z-score threshold
  mlThreshold?: number; // ML model confidence threshold
  patternThreshold?: number; // Pattern matching threshold
  timeWindow?: number; // Time window in milliseconds
  minDataPoints?: number; // Minimum data points for analysis
  enableAutoResolution?: boolean;
  notificationThreshold?: 'low' | 'medium' | 'high' | 'critical';
}

export interface StatisticalMetrics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  range: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  outliers: number[];
}

export interface MLModelConfig {
  algorithm:
    | 'isolation_forest'
    | 'one_class_svm'
    | 'local_outlier_factor'
    | 'elliptic_envelope';
  contamination?: number;
  nEstimators?: number;
  maxSamples?: number;
  randomState?: number;
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  metrics: {
    totalDataPoints: number;
    anomalyCount: number;
    anomalyRate: number;
    detectionTime: number;
    confidence: number;
  };
  recommendations: string[];
}

class AnomalyDetector {
  private static instance: AnomalyDetector;
  private config: AnomalyConfig;
  private mlModels: Map<string, any> = new Map();
  private historicalData: Map<string, any[]> = new Map();
  private anomalyHistory: Anomaly[] = [];
  private isInitialized = false;

  private constructor(config: AnomalyConfig = {}) {
    this.config = {
      statisticalThreshold: 3.0, // 3 standard deviations
      mlThreshold: 0.7,
      patternThreshold: 0.8,
      timeWindow: 24 * 60 * 60 * 1000, // 24 hours
      minDataPoints: 10,
      enableAutoResolution: false,
      notificationThreshold: 'medium',
      ...config,
    };
  }

  public static getInstance(config?: AnomalyConfig): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector(config);
    }
    return AnomalyDetector.instance;
  }

  /**
   * 初始化異常檢測系統
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadHistoricalData();
    await this.initializeMLModels();

    this.isInitialized = true;
    logger.info('Anomaly detector initialized', { config: this.config });
  }

  /**
   * 檢測異常
   */
  public async detectAnomalies(
    data: any[],
    field: string,
    options: {
      types?: Anomaly['type'][];
      includeContext?: boolean;
      updateHistory?: boolean;
    } = {}
  ): Promise<AnomalyDetectionResult> {
    const startTime = Date.now();
    const {
      types = ['statistical', 'ml', 'pattern'],
      includeContext = true,
      updateHistory = true,
    } = options;

    const anomalies: Anomaly[] = [];
    const fieldData = this.extractFieldData(data, field);

    if (fieldData.length < this.config.minDataPoints!) {
      logger.warn('Insufficient data points for anomaly detection', {
        field,
        dataPoints: fieldData.length,
        minimum: this.config.minDataPoints,
      });
      return this.createEmptyResult(fieldData.length, startTime);
    }

    // 統計異常檢測
    if (types.includes('statistical')) {
      const statisticalAnomalies = await this.detectStatisticalAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...statisticalAnomalies);
    }

    // 機器學習異常檢測
    if (types.includes('ml')) {
      const mlAnomalies = await this.detectMLAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...mlAnomalies);
    }

    // 模式異常檢測
    if (types.includes('pattern')) {
      const patternAnomalies = await this.detectPatternAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...patternAnomalies);
    }

    // 閾值異常檢測
    if (types.includes('threshold')) {
      const thresholdAnomalies = await this.detectThresholdAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...thresholdAnomalies);
    }

    // 趨勢異常檢測
    if (types.includes('trend')) {
      const trendAnomalies = await this.detectTrendAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...trendAnomalies);
    }

    // 季節性異常檢測
    if (types.includes('seasonal')) {
      const seasonalAnomalies = await this.detectSeasonalAnomalies(
        fieldData,
        field,
        includeContext
      );
      anomalies.push(...seasonalAnomalies);
    }

    // 去重和排序
    const uniqueAnomalies = this.deduplicateAnomalies(anomalies);
    uniqueAnomalies.sort((a, b) => b.score - a.score);

    // 更新歷史數據
    if (updateHistory) {
      this.updateHistoricalData(field, fieldData);
      this.anomalyHistory.push(...uniqueAnomalies);
    }

    const detectionTime = Date.now() - startTime;
    const anomalyRate =
      fieldData.length > 0
        ? (uniqueAnomalies.length / fieldData.length) * 100
        : 0;
    const confidence = this.calculateOverallConfidence(uniqueAnomalies);

    const result: AnomalyDetectionResult = {
      anomalies: uniqueAnomalies,
      metrics: {
        totalDataPoints: fieldData.length,
        anomalyCount: uniqueAnomalies.length,
        anomalyRate,
        detectionTime,
        confidence,
      },
      recommendations: this.generateRecommendations(uniqueAnomalies, fieldData),
    };

    logger.info('Anomaly detection completed', {
      field,
      anomalies: uniqueAnomalies.length,
      detectionTime,
      confidence,
    });

    return result;
  }

  /**
   * 統計異常檢測
   */
  private async detectStatisticalAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const metrics = this.calculateStatisticalMetrics(data);

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const zScore = Math.abs(
        (value - metrics.mean) / metrics.standardDeviation
      );

      if (zScore > this.config.statisticalThreshold!) {
        const severity = this.calculateSeverity(
          zScore,
          this.config.statisticalThreshold!
        );
        const confidence = Math.min(
          0.99,
          zScore / (this.config.statisticalThreshold! * 2)
        );

        anomalies.push({
          id: `statistical_${field}_${i}_${Date.now()}`,
          type: 'statistical',
          severity,
          score: zScore,
          confidence,
          message: `Statistical anomaly detected: Z-score ${zScore.toFixed(2)} exceeds threshold ${this.config.statisticalThreshold}`,
          field,
          value,
          expectedValue: metrics.mean,
          timestamp: new Date(),
          context: includeContext
            ? {
                dataPoint: { index: i, value },
                historicalData: data.slice(Math.max(0, i - 10), i),
                metadata: { zScore, metrics },
              }
            : {},
          recommendations: this.generateStatisticalRecommendations(
            zScore,
            metrics
          ),
        });
      }
    }

    return anomalies;
  }

  /**
   * 機器學習異常檢測
   */
  private async detectMLAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // 使用簡化的異常檢測算法（實際應用中應使用真實的ML模型）
    const model =
      this.mlModels.get('isolation_forest') || this.createSimpleMLModel();

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const prediction = await this.predictAnomaly(model, value, data);

      if (prediction.score > this.config.mlThreshold!) {
        const severity = this.calculateSeverity(
          prediction.score,
          this.config.mlThreshold!
        );

        anomalies.push({
          id: `ml_${field}_${i}_${Date.now()}`,
          type: 'ml',
          severity,
          score: prediction.score,
          confidence: prediction.confidence,
          message: `ML anomaly detected: Score ${prediction.score.toFixed(2)} exceeds threshold ${this.config.mlThreshold}`,
          field,
          value,
          timestamp: new Date(),
          context: includeContext
            ? {
                dataPoint: { index: i, value },
                historicalData: data.slice(Math.max(0, i - 10), i),
                metadata: { model: 'isolation_forest', prediction },
              }
            : {},
          recommendations: this.generateMLRecommendations(prediction.score),
        });
      }
    }

    return anomalies;
  }

  /**
   * 模式異常檢測
   */
  private async detectPatternAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const pattern = this.identifyPattern(data);

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const expectedValue = this.predictNextValue(pattern, data.slice(0, i));
      const deviation = Math.abs(value - expectedValue) / expectedValue;

      if (deviation > this.config.patternThreshold!) {
        const severity = this.calculateSeverity(
          deviation,
          this.config.patternThreshold!
        );

        anomalies.push({
          id: `pattern_${field}_${i}_${Date.now()}`,
          type: 'pattern',
          severity,
          score: deviation,
          confidence: Math.min(
            0.99,
            deviation / (this.config.patternThreshold! * 2)
          ),
          message: `Pattern anomaly detected: Deviation ${(deviation * 100).toFixed(1)}% from expected pattern`,
          field,
          value,
          expectedValue,
          timestamp: new Date(),
          context: includeContext
            ? {
                dataPoint: { index: i, value },
                historicalData: data.slice(Math.max(0, i - 10), i),
                metadata: { pattern, expectedValue, deviation },
              }
            : {},
          recommendations: this.generatePatternRecommendations(
            deviation,
            pattern
          ),
        });
      }
    }

    return anomalies;
  }

  /**
   * 閾值異常檢測
   */
  private async detectThresholdAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const thresholds = this.calculateThresholds(data);

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      let thresholdBreached = false;
      let thresholdType = '';

      if (value > thresholds.upper) {
        thresholdBreached = true;
        thresholdType = 'upper';
      } else if (value < thresholds.lower) {
        thresholdBreached = true;
        thresholdType = 'lower';
      }

      if (thresholdBreached) {
        const severity = thresholdType === 'upper' ? 'high' : 'medium';
        const score =
          thresholdType === 'upper'
            ? (value - thresholds.upper) / thresholds.upper
            : (thresholds.lower - value) / thresholds.lower;

        anomalies.push({
          id: `threshold_${field}_${i}_${Date.now()}`,
          type: 'threshold',
          severity,
          score,
          confidence: 0.8,
          message: `Threshold anomaly detected: Value ${value} exceeds ${thresholdType} threshold ${thresholds[thresholdType]}`,
          field,
          value,
          expectedValue: thresholds[thresholdType],
          timestamp: new Date(),
          context: includeContext
            ? {
                dataPoint: { index: i, value },
                historicalData: data.slice(Math.max(0, i - 10), i),
                metadata: { thresholds, thresholdType },
              }
            : {},
          recommendations: this.generateThresholdRecommendations(
            thresholdType,
            value,
            thresholds
          ),
        });
      }
    }

    return anomalies;
  }

  /**
   * 趨勢異常檢測
   */
  private async detectTrendAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const trend = this.calculateTrend(data);

    // 檢測趨勢突變
    for (let i = 1; i < data.length; i++) {
      const currentValue = data[i];
      const previousValue = data[i - 1];
      const expectedValue = previousValue + trend.slope;
      const deviation = Math.abs(currentValue - expectedValue);

      if (deviation > trend.variance * 2) {
        const severity = this.calculateSeverity(deviation, trend.variance);

        anomalies.push({
          id: `trend_${field}_${i}_${Date.now()}`,
          type: 'trend',
          severity,
          score: deviation / trend.variance,
          confidence: 0.7,
          message: `Trend anomaly detected: Unexpected change in trend direction`,
          field,
          value: currentValue,
          expectedValue,
          timestamp: new Date(),
          context: includeContext
            ? {
                dataPoint: { index: i, value: currentValue },
                historicalData: data.slice(Math.max(0, i - 10), i),
                metadata: { trend, deviation, previousValue },
              }
            : {},
          recommendations: this.generateTrendRecommendations(trend, deviation),
        });
      }
    }

    return anomalies;
  }

  /**
   * 季節性異常檢測
   */
  private async detectSeasonalAnomalies(
    data: number[],
    field: string,
    includeContext: boolean
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const seasonalPattern = this.identifySeasonalPattern(data);

    if (seasonalPattern.period > 1) {
      for (let i = seasonalPattern.period; i < data.length; i++) {
        const value = data[i];
        const expectedValue =
          seasonalPattern.pattern[i % seasonalPattern.period];
        const deviation = Math.abs(value - expectedValue) / expectedValue;

        if (deviation > 0.3) {
          // 30% deviation from seasonal pattern
          const severity = this.calculateSeverity(deviation, 0.3);

          anomalies.push({
            id: `seasonal_${field}_${i}_${Date.now()}`,
            type: 'seasonal',
            severity,
            score: deviation,
            confidence: 0.6,
            message: `Seasonal anomaly detected: Value deviates ${(deviation * 100).toFixed(1)}% from seasonal pattern`,
            field,
            value,
            expectedValue,
            timestamp: new Date(),
            context: includeContext
              ? {
                  dataPoint: { index: i, value },
                  historicalData: data.slice(
                    Math.max(0, i - seasonalPattern.period),
                    i
                  ),
                  metadata: { seasonalPattern, deviation },
                }
              : {},
            recommendations: this.generateSeasonalRecommendations(
              deviation,
              seasonalPattern
            ),
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * 計算統計指標
   */
  private calculateStatisticalMetrics(data: number[]): StatisticalMetrics {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;

    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);

    const median =
      n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

    const mode = this.calculateMode(data);
    const skewness = this.calculateSkewness(data, mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(data, mean, standardDeviation);
    const range = sorted[n - 1] - sorted[0];

    const quartiles = {
      q1: sorted[Math.floor(n * 0.25)],
      q2: median,
      q3: sorted[Math.floor(n * 0.75)],
    };

    const outliers = this.calculateOutliers(data, mean, standardDeviation);

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      skewness,
      kurtosis,
      range,
      quartiles,
      outliers,
    };
  }

  /**
   * 計算眾數
   */
  private calculateMode(data: number[]): number {
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    let mode = data[0];

    for (const value of data) {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    }

    return mode;
  }

  /**
   * 計算偏度
   */
  private calculateSkewness(
    data: number[],
    mean: number,
    stdDev: number
  ): number {
    const n = data.length;
    const skewness =
      data.reduce((sum, val) => {
        return sum + Math.pow((val - mean) / stdDev, 3);
      }, 0) / n;

    return skewness;
  }

  /**
   * 計算峰度
   */
  private calculateKurtosis(
    data: number[],
    mean: number,
    stdDev: number
  ): number {
    const n = data.length;
    const kurtosis =
      data.reduce((sum, val) => {
        return sum + Math.pow((val - mean) / stdDev, 4);
      }, 0) / n;

    return kurtosis - 3; // Excess kurtosis
  }

  /**
   * 計算異常值
   */
  private calculateOutliers(
    data: number[],
    mean: number,
    stdDev: number
  ): number[] {
    const threshold = this.config.statisticalThreshold || 3.0;
    return data.filter(val => Math.abs(val - mean) > threshold * stdDev);
  }

  /**
   * 創建簡單的ML模型
   */
  private createSimpleMLModel(): any {
    // 簡化的異常檢測模型
    return {
      predict: (value: number, context: number[]) => {
        const mean =
          context.reduce((sum, val) => sum + val, 0) / context.length;
        const stdDev = Math.sqrt(
          context.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            context.length
        );
        const zScore = Math.abs((value - mean) / stdDev);
        const score = Math.min(1.0, zScore / 4.0); // Normalize to 0-1
        const confidence = Math.min(0.99, score);

        return { score, confidence };
      },
    };
  }

  /**
   * 預測異常
   */
  private async predictAnomaly(
    model: any,
    value: number,
    context: number[]
  ): Promise<{ score: number; confidence: number }> {
    return model.predict(value, context);
  }

  /**
   * 識別模式
   */
  private identifyPattern(data: number[]): any {
    // 簡化的模式識別
    if (data.length < 3) return { type: 'none', period: 1, pattern: [] };

    // 檢測線性趨勢
    const trend = this.calculateTrend(data);
    if (trend.rSquared > 0.8) {
      return { type: 'linear', period: 1, pattern: [trend.slope], trend };
    }

    // 檢測周期性模式
    const seasonal = this.identifySeasonalPattern(data);
    if (seasonal.confidence > 0.7) {
      return seasonal;
    }

    return { type: 'none', period: 1, pattern: [] };
  }

  /**
   * 預測下一個值
   */
  private predictNextValue(pattern: any, data: number[]): number {
    if (data.length === 0) return 0;

    switch (pattern.type) {
      case 'linear':
        return data[data.length - 1] + pattern.pattern[0];
      case 'seasonal':
        const index = data.length % pattern.period;
        return pattern.pattern[index] || data[data.length - 1];
      default:
        return data[data.length - 1];
    }
  }

  /**
   * 計算趨勢
   */
  private calculateTrend(data: number[]): any {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

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

    // 計算方差
    const variance = ssRes / n;

    return { slope, intercept, rSquared, variance };
  }

  /**
   * 識別季節性模式
   */
  private identifySeasonalPattern(data: number[]): any {
    const maxPeriod = Math.min(12, Math.floor(data.length / 3));
    let bestPeriod = 1;
    let bestConfidence = 0;
    let bestPattern: number[] = [];

    for (let period = 2; period <= maxPeriod; period++) {
      const pattern = this.calculateSeasonalPattern(data, period);
      const confidence = this.calculateSeasonalConfidence(
        data,
        pattern,
        period
      );

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestPeriod = period;
        bestPattern = pattern;
      }
    }

    return {
      type: 'seasonal',
      period: bestPeriod,
      pattern: bestPattern,
      confidence: bestConfidence,
    };
  }

  /**
   * 計算季節性模式
   */
  private calculateSeasonalPattern(data: number[], period: number): number[] {
    const pattern = new Array(period).fill(0);
    const counts = new Array(period).fill(0);

    for (let i = 0; i < data.length; i++) {
      const index = i % period;
      pattern[index] += data[i];
      counts[index]++;
    }

    return pattern.map((sum, index) => sum / counts[index]);
  }

  /**
   * 計算季節性置信度
   */
  private calculateSeasonalConfidence(
    data: number[],
    pattern: number[],
    period: number
  ): number {
    let totalError = 0;
    let totalData = 0;

    for (let i = 0; i < data.length; i++) {
      const index = i % period;
      const expected = pattern[index];
      const actual = data[i];
      totalError += Math.pow(actual - expected, 2);
      totalData++;
    }

    const mse = totalError / totalData;
    const variance = this.calculateVariance(data);
    const confidence = Math.max(0, 1 - mse / variance);

    return confidence;
  }

  /**
   * 計算方差
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return (
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
  }

  /**
   * 計算閾值
   */
  private calculateThresholds(data: number[]): {
    upper: number;
    lower: number;
  } {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;

    const upper = sorted[Math.floor(n * 0.95)]; // 95th percentile
    const lower = sorted[Math.floor(n * 0.05)]; // 5th percentile

    return { upper, lower };
  }

  /**
   * 計算嚴重程度
   */
  private calculateSeverity(
    score: number,
    threshold: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = score / threshold;

    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * 計算整體置信度
   */
  private calculateOverallConfidence(anomalies: Anomaly[]): number {
    if (anomalies.length === 0) return 1.0;

    const totalConfidence = anomalies.reduce(
      (sum, anomaly) => sum + anomaly.confidence,
      0
    );
    return totalConfidence / anomalies.length;
  }

  /**
   * 去重異常
   */
  private deduplicateAnomalies(anomalies: Anomaly[]): Anomaly[] {
    const seen = new Set<string>();
    return anomalies.filter(anomaly => {
      const key = `${anomaly.field}_${anomaly.value}_${anomaly.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 提取字段數據
   */
  private extractFieldData(data: any[], field: string): number[] {
    return data.map(item => {
      const value = this.getValueFromObject(item, field);
      return typeof value === 'number' ? value : 0;
    });
  }

  /**
   * 從對象中獲取值
   */
  private getValueFromObject(obj: any, field: string): any {
    const fields = field.split('.');
    let value = obj;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  /**
   * 更新歷史數據
   */
  private updateHistoricalData(field: string, data: number[]): void {
    const existing = this.historicalData.get(field) || [];
    const updated = [...existing, ...data];

    // 保持最近的數據點
    const maxPoints = 1000;
    if (updated.length > maxPoints) {
      this.historicalData.set(field, updated.slice(-maxPoints));
    } else {
      this.historicalData.set(field, updated);
    }
  }

  /**
   * 生成建議
   */
  private generateRecommendations(
    anomalies: Anomaly[],
    data: number[]
  ): string[] {
    const recommendations: string[] = [];

    if (anomalies.length > data.length * 0.1) {
      recommendations.push(
        'High anomaly rate detected. Consider reviewing data collection process.'
      );
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      recommendations.push(
        'Critical anomalies detected. Immediate attention required.'
      );
    }

    const mlAnomalies = anomalies.filter(a => a.type === 'ml');
    if (mlAnomalies.length > 0) {
      recommendations.push(
        'ML model detected anomalies. Consider retraining the model.'
      );
    }

    return recommendations;
  }

  /**
   * 生成統計建議
   */
  private generateStatisticalRecommendations(
    zScore: number,
    metrics: StatisticalMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (zScore > 5) {
      recommendations.push(
        'Extreme statistical anomaly. Verify data accuracy.'
      );
    }

    if (metrics.skewness > 2) {
      recommendations.push(
        'Data is highly skewed. Consider data transformation.'
      );
    }

    if (metrics.kurtosis > 3) {
      recommendations.push(
        'Data has heavy tails. Consider robust statistical methods.'
      );
    }

    return recommendations;
  }

  /**
   * 生成ML建議
   */
  private generateMLRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score > 0.9) {
      recommendations.push(
        'High confidence ML anomaly. Manual review recommended.'
      );
    }

    recommendations.push('Consider updating ML model with recent data.');

    return recommendations;
  }

  /**
   * 生成模式建議
   */
  private generatePatternRecommendations(
    deviation: number,
    pattern: any
  ): string[] {
    const recommendations: string[] = [];

    if (deviation > 0.5) {
      recommendations.push(
        'Significant deviation from pattern. Investigate root cause.'
      );
    }

    if (pattern.type === 'linear') {
      recommendations.push('Linear trend detected. Consider trend analysis.');
    }

    return recommendations;
  }

  /**
   * 生成閾值建議
   */
  private generateThresholdRecommendations(
    thresholdType: string,
    value: number,
    thresholds: any
  ): string[] {
    const recommendations: string[] = [];

    if (thresholdType === 'upper') {
      recommendations.push(
        'Value exceeds upper threshold. Consider setting alerts.'
      );
    } else {
      recommendations.push('Value below lower threshold. Check data quality.');
    }

    return recommendations;
  }

  /**
   * 生成趨勢建議
   */
  private generateTrendRecommendations(
    trend: any,
    deviation: number
  ): string[] {
    const recommendations: string[] = [];

    if (trend.rSquared > 0.8) {
      recommendations.push(
        'Strong trend detected. Consider trend-based forecasting.'
      );
    }

    if (deviation > trend.variance * 3) {
      recommendations.push('Trend break detected. Investigate cause.');
    }

    return recommendations;
  }

  /**
   * 生成季節性建議
   */
  private generateSeasonalRecommendations(
    deviation: number,
    seasonalPattern: any
  ): string[] {
    const recommendations: string[] = [];

    if (seasonalPattern.confidence > 0.8) {
      recommendations.push(
        'Strong seasonal pattern detected. Use seasonal forecasting.'
      );
    }

    if (deviation > 0.4) {
      recommendations.push(
        'Seasonal anomaly detected. Check for external factors.'
      );
    }

    return recommendations;
  }

  /**
   * 創建空結果
   */
  private createEmptyResult(
    dataPoints: number,
    startTime: number
  ): AnomalyDetectionResult {
    return {
      anomalies: [],
      metrics: {
        totalDataPoints: dataPoints,
        anomalyCount: 0,
        anomalyRate: 0,
        detectionTime: Date.now() - startTime,
        confidence: 1.0,
      },
      recommendations: ['Insufficient data for anomaly detection'],
    };
  }

  /**
   * 初始化ML模型
   */
  private async initializeMLModels(): Promise<void> {
    // 這裡應該初始化真實的ML模型
    // 暫時使用簡化模型
    this.mlModels.set('isolation_forest', this.createSimpleMLModel());
    logger.info('ML models initialized');
  }

  /**
   * 加載歷史數據
   */
  private async loadHistoricalData(): Promise<void> {
    // 這裡應該從數據庫或文件系統加載歷史數據
    // 暫時使用空數據
    logger.info('Historical data loaded');
  }

  /**
   * 獲取異常歷史
   */
  public getAnomalyHistory(): Anomaly[] {
    return [...this.anomalyHistory];
  }

  /**
   * 清除異常歷史
   */
  public clearAnomalyHistory(): void {
    this.anomalyHistory = [];
    logger.info('Anomaly history cleared');
  }

  /**
   * 獲取檢測統計
   */
  public getDetectionStats(): {
    totalAnomalies: number;
    anomaliesByType: Record<string, number>;
    anomaliesBySeverity: Record<string, number>;
    averageConfidence: number;
    detectionRate: number;
  } {
    const anomaliesByType = this.anomalyHistory.reduce(
      (acc, anomaly) => {
        acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const anomaliesBySeverity = this.anomalyHistory.reduce(
      (acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageConfidence =
      this.anomalyHistory.length > 0
        ? this.anomalyHistory.reduce(
            (sum, anomaly) => sum + anomaly.confidence,
            0
          ) / this.anomalyHistory.length
        : 0;

    return {
      totalAnomalies: this.anomalyHistory.length,
      anomaliesByType,
      anomaliesBySeverity,
      averageConfidence,
      detectionRate: 0, // 需要實現檢測率計算
    };
  }
}

export default AnomalyDetector;
