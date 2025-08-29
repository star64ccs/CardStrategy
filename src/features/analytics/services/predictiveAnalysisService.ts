import type {
  PredictionAlert,
  PredictionData,
  PredictionFilter,
  PredictionInsight,
  PredictionModel,
  PredictionModelConfig,
  PredictionRecommendation,
  PredictionReport,
  PredictionResult,
  PredictiveAnalysisConfig,
  PredictiveAnalysisExportOptions,
  PredictiveAnalysisResponse,
} from '../types/predictiveAnalysis';
import {
  convertToCSV,
  convertToExcel,
  convertToJSON,
  convertToPDF,
} from '../utils/dataConverters';

// 事件類型
export type PredictiveAnalysisEventType =
  | 'model_trained'
  | 'prediction_generated'
  | 'alert_triggered'
  | 'report_generated'
  | 'insight_discovered'
  | 'recommendation_created';

// 事件監聽器
export type PredictiveAnalysisEventListener = (event: {
  type: PredictiveAnalysisEventType;
  data: unknown;
  timestamp: Date;
}) => void;

/**
 * 預測分析服務
 * 負責管理預測模型、生成預測、分析結果等
 */
export class PredictiveAnalysisService {
  private static instance: PredictiveAnalysisService;
  private isInitialized = false;
  private readonly models: Map<string, PredictionModel> = new Map();
  private readonly predictions: Map<string, PredictionResult> = new Map();
  private readonly predictionData: Map<string, PredictionData> = new Map();
  private readonly reports: Map<string, PredictionReport> = new Map();
  private readonly insights: Map<string, PredictionInsight> = new Map();
  private readonly recommendations: Map<string, PredictionRecommendation> =
    new Map();
  private readonly alerts: Map<string, PredictionAlert> = new Map();
  private config: PredictiveAnalysisConfig;
  private readonly eventListeners: Map<
    PredictiveAnalysisEventType,
    PredictiveAnalysisEventListener[]
  > = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * 獲取服務實例
   */
  public static getInstance(): PredictiveAnalysisService {
    if (!PredictiveAnalysisService.instance) {
      PredictiveAnalysisService.instance = new PredictiveAnalysisService();
    }
    return PredictiveAnalysisService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(
    config?: Partial<PredictiveAnalysisConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化默認模型
      await this.initializeDefaultModels();

      this.isInitialized = true;
      this.emitEvent('model_trained', {
        message: 'Service initialized successfully',
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize PredictiveAnalysisService:', error);
      return false;
    }
  }

  /**
   * 獲取預測分析數據
   */
  public async getPredictiveAnalysis(
    filter?: PredictionFilter
  ): Promise<PredictiveAnalysisResponse> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    try {
      const _filteredModels = this.filterModels(filter);
      const _filteredPredictions = this.filterPredictions(filter);

      const _accuracy = this.calculateAverageAccuracy(filteredPredictions);
      const _totalModels = this.models.size;
      const _activeModels = Array.from(this.models.values()).filter(
        m => m.isActive
      ).length;
      const _averagePredictionTime =
        this.calculateAveragePredictionTime(filteredPredictions);

      return {
        success: true,
        data: {
          models: filteredModels,
          predictions: filteredPredictions,
          accuracy,
          totalModels,
          activeModels,
          averagePredictionTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          models: [],
          predictions: [],
          accuracy: 0,
          totalModels: 0,
          activeModels: 0,
          averagePredictionTime: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 創建預測模型
   */
  public async createModel(
    name: string,
    description: string,
    config: PredictionModelConfig
  ): Promise<PredictionModel> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const model: PredictionModel = {
      id: this.generateId(),
      name,
      description,
      config,
      status: 'training',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      accuracy: 0,
      totalPredictions: 0,
      isActive: false,
    };

    this.models.set(model.id, model);
    this.emitEvent('model_trained', { model });

    // 模擬訓練過程
    setTimeout(() => {
      this.completeModelTraining(model.id);
    }, 2000);

    return model;
  }

  /**
   * 生成預測
   */
  public async generatePrediction(
    modelId: string,
    inputFeatures: Record<string, any>
  ): Promise<PredictionResult> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (model.status !== 'ready') {
      throw new Error(`Model ${modelId} is not ready for predictions`);
    }

    // 模擬預測生成
    const prediction: PredictionResult = {
      id: this.generateId(),
      modelId,
      target: model.config.target,
      timestamp: new Date(),
      predictions: [
        {
          value: Math.random() * 100,
          confidence: 0.85 + Math.random() * 0.1,
          upperBound: Math.random() * 120,
          lowerBound: Math.random() * 80,
        },
      ],
      accuracy: model.accuracy,
      precision: 0.8 + Math.random() * 0.15,
      recall: 0.75 + Math.random() * 0.2,
      f1Score: 0.78 + Math.random() * 0.17,
      mse: Math.random() * 10,
      mae: Math.random() * 5,
      r2Score: 0.7 + Math.random() * 0.25,
      featureImportance: {
        feature1: 0.3,
        feature2: 0.25,
        feature3: 0.2,
        feature4: 0.15,
        feature5: 0.1,
      },
      modelPerformance: {
        trainingTime: 120,
        predictionTime: 0.5,
        memoryUsage: 256,
      },
    };

    this.predictions.set(prediction.id, prediction);

    // 創建預測數據記錄
    const predictionData: PredictionData = {
      id: this.generateId(),
      modelId,
      inputFeatures,
      prediction,
      createdAt: new Date(),
    };

    this.predictionData.set(predictionData.id, predictionData);

    // 更新模型統計
    model.totalPredictions++;
    model.updatedAt = new Date();

    this.emitEvent('prediction_generated', { prediction, model });

    return prediction;
  }

  /**
   * 生成報告
   */
  public async generateReport(
    modelId: string,
    title: string,
    description: string,
    dateRange: { start: Date; end: Date }
  ): Promise<PredictionReport> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const _modelPredictions = Array.from(this.predictions.values()).filter(
      p =>
        p.modelId === modelId &&
        p.timestamp >= dateRange.start &&
        p.timestamp <= dateRange.end
    );

    const _bestPrediction = modelPredictions.reduce(
      (best, current) => (current.accuracy > best.accuracy ? current : best),
      modelPredictions[0]
    );

    const _worstPrediction = modelPredictions.reduce(
      (worst, current) => (current.accuracy < worst.accuracy ? current : worst),
      modelPredictions[0]
    );

    const _insights = await this.generateInsights(modelId, dateRange);
    const _recommendations = await this.generateRecommendations(
      modelId,
      dateRange
    );

    const report: PredictionReport = {
      id: this.generateId(),
      title,
      description,
      modelId,
      dateRange,
      summary: {
        totalPredictions: modelPredictions.length,
        averageAccuracy: this.calculateAverageAccuracy(modelPredictions),
        averageConfidence: this.calculateAverageConfidence(modelPredictions),
        bestPrediction: bestPrediction || modelPredictions[0],
        worstPrediction: worstPrediction || modelPredictions[0],
      },
      performanceMetrics: {
        accuracy: this.calculateAverageAccuracy(modelPredictions),
        precision: this.calculateAveragePrecision(modelPredictions),
        recall: this.calculateAverageRecall(modelPredictions),
        f1Score: this.calculateAverageF1Score(modelPredictions),
        mse: this.calculateAverageMSE(modelPredictions),
        mae: this.calculateAverageMAE(modelPredictions),
        r2Score: this.calculateAverageR2Score(modelPredictions),
      },
      predictions: modelPredictions,
      insights,
      recommendations,
      createdAt: new Date(),
    };

    this.reports.set(report.id, report);
    this.emitEvent('report_generated', { report });

    return report;
  }

  /**
   * 導出數據
   */
  public async exportData(
    options: PredictiveAnalysisExportOptions
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    try {
      const exportData: unknown = {};

      if (options.includeModels) {
        const _models = Array.from(this.models.values());
        if (options.modelIds) {
          exportData.models = models.filter(m =>
            options.modelIds.includes(m.id)
          );
        } else {
          exportData.models = models;
        }
      }

      if (options.includePredictions) {
        const _predictions = Array.from(this.predictions.values());
        if (options.dateRange) {
          exportData.predictions = predictions.filter(
            p =>
              p.timestamp >= options.dateRange.start &&
              p.timestamp <= options.dateRange.end
          );
        } else {
          exportData.predictions = predictions;
        }
      }

      if (options.includeReports) {
        const _reports = Array.from(this.reports.values());
        if (options.dateRange) {
          exportData.reports = reports.filter(
            r =>
              r.createdAt >= options.dateRange.start &&
              r.createdAt <= options.dateRange.end
          );
        } else {
          exportData.reports = reports;
        }
      }

      switch (options.format) {
        case 'json':
          return convertToJSON(exportData);
        case 'csv':
          return convertToCSV(exportData);
        case 'excel':
          return convertToExcel(exportData);
        case 'pdf':
          return convertToPDF(exportData);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 創建警報
   */
  public async createAlert(
    modelId: string,
    type: PredictionAlert['type'],
    severity: PredictionAlert['severity'],
    title: string,
    message: string,
    threshold: number,
    currentValue: number
  ): Promise<PredictionAlert> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const alert: PredictionAlert = {
      id: this.generateId(),
      modelId,
      type,
      severity,
      title,
      message,
      threshold,
      currentValue,
      isActive: true,
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    this.emitEvent('alert_triggered', { alert });

    return alert;
  }

  /**
   * 更新警報
   */
  public async updateAlert(
    alertId: string,
    updates: Partial<PredictionAlert>
  ): Promise<PredictionAlert> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const _updatedAlert = { ...alert, ...updates, updatedAt: new Date() };
    this.alerts.set(alertId, updatedAlert);

    return updatedAlert;
  }

  /**
   * 刪除警報
   */
  public async deleteAlert(alertId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    return this.alerts.delete(alertId);
  }

  /**
   * 獲取警報
   */
  public async getAlerts(modelId?: string): Promise<PredictionAlert[]> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _alerts = Array.from(this.alerts.values());
    return modelId ? alerts.filter(a => a.modelId === modelId) : alerts;
  }

  /**
   * 獲取配置
   */
  public getConfig(): PredictiveAnalysisConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  public async updateConfig(
    updates: Partial<PredictiveAnalysisConfig>
  ): Promise<PredictiveAnalysisConfig> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    this.config = { ...this.config, ...updates };
    return this.config;
  }

  /**
   * 添加事件監聽器
   */
  public addEventListener(
    eventType: PredictiveAnalysisEventType,
    listener: PredictiveAnalysisEventListener
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件監聽器
   */
  public removeEventListener(
    eventType: PredictiveAnalysisEventType,
    listener: PredictiveAnalysisEventListener
  ): void {
    const _listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const _index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 獲取報告
   */
  public async getReports(modelId?: string): Promise<PredictionReport[]> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _reports = Array.from(this.reports.values());
    return modelId ? reports.filter(r => r.modelId === modelId) : reports;
  }

  /**
   * 獲取洞察
   */
  public async getInsights(modelId?: string): Promise<PredictionInsight[]> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _insights = Array.from(this.insights.values());
    return insights;
  }

  /**
   * 獲取建議
   */
  public async getRecommendations(
    modelId?: string
  ): Promise<PredictionRecommendation[]> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _recommendations = Array.from(this.recommendations.values());
    return recommendations;
  }

  /**
   * 獲取實時指標
   */
  public async getRealTimeMetrics(): Promise<{
    activeModels: number;
    totalPredictions: number;
    averageAccuracy: number;
    alertsCount: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('PredictiveAnalysisService not initialized');
    }

    const _activeModels = Array.from(this.models.values()).filter(
      m => m.isActive
    ).length;
    const _totalPredictions = Array.from(this.predictions.values()).length;
    const _averageAccuracy = this.calculateAverageAccuracy(
      Array.from(this.predictions.values())
    );
    const _alertsCount = Array.from(this.alerts.values()).filter(
      a => a.isActive
    ).length;

    return {
      activeModels,
      totalPredictions,
      averageAccuracy,
      alertsCount,
    };
  }

  // 私有方法

  private getDefaultConfig(): PredictiveAnalysisConfig {
    return {
      autoRetrain: true,
      retrainThreshold: 0.8,
      maxModels: 10,
      defaultModelType: 'random_forest',
      alertSettings: {
        accuracyThreshold: 0.7,
        predictionErrorThreshold: 0.3,
        modelDriftThreshold: 0.2,
      },
      performanceSettings: {
        maxPredictionTime: 5,
        maxMemoryUsage: 512,
        batchSize: 100,
      },
    };
  }

  private async initializeDefaultModels(): Promise<void> {
    const defaultModels: {
      name: string;
      description: string;
      config: PredictionModelConfig;
    }[] = [
      {
        name: '價格預測模型',
        description: '預測卡片價格變動的機器學習模型',
        config: {
          modelType: 'random_forest',
          target: 'price_movement',
          features: [
            'historical_price',
            'market_demand',
            'rarity',
            'condition',
          ],
          hyperparameters: { n_estimators: 100, max_depth: 10 },
          trainingConfig: { testSize: 0.2, validationSize: 0.1 },
          evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1'],
          updateFrequency: 'daily',
          retrainThreshold: 0.8,
        },
      },
      {
        name: '需求預測模型',
        description: '預測市場需求的時間序列模型',
        config: {
          modelType: 'time_series',
          target: 'demand_forecast',
          features: ['seasonal_pattern', 'trend', 'external_factors'],
          hyperparameters: { window_size: 30, forecast_horizon: 7 },
          trainingConfig: { testSize: 0.2, validationSize: 0.1 },
          evaluationMetrics: ['mse', 'mae', 'r2'],
          updateFrequency: 'weekly',
          retrainThreshold: 0.75,
        },
      },
    ];

    for (const modelData of defaultModels) {
      // 直接創建模型，不調用 createModel 方法
      const model: PredictionModel = {
        id: this.generateId(),
        name: modelData.name,
        description: modelData.description,
        config: modelData.config,
        status: 'training',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        accuracy: 0,
        totalPredictions: 0,
        isActive: false,
      };

      this.models.set(model.id, model);

      // 模擬訓練過程
      setTimeout(() => {
        this.completeModelTraining(model.id);
      }, 2000);
    }
  }

  private async completeModelTraining(modelId: string): Promise<void> {
    const _model = this.models.get(modelId);
    if (!model) return;

    model.status = 'ready';
    model.isActive = true;
    model.lastTrainedAt = new Date();
    model.accuracy = 0.85 + Math.random() * 0.1;
    model.updatedAt = new Date();

    this.emitEvent('model_trained', { model });
  }

  private filterModels(filter?: PredictionFilter): PredictionModel[] {
    let models = Array.from(this.models.values());

    if (filter?.modelIds) {
      models = models.filter(m => filter.modelIds.includes(m.id));
    }

    if (filter?.targets) {
      models = models.filter(m => filter.targets.includes(m.config.target));
    }

    if (filter?.accuracyThreshold) {
      models = models.filter(m => m.accuracy >= filter.accuracyThreshold);
    }

    if (filter?.status) {
      models = models.filter(m => filter.status.includes(m.status));
    }

    if (filter?.isActive !== undefined) {
      models = models.filter(m => m.isActive === filter.isActive);
    }

    return models;
  }

  private filterPredictions(filter?: PredictionFilter): PredictionResult[] {
    let predictions = Array.from(this.predictions.values());

    if (filter?.modelIds) {
      predictions = predictions.filter(p =>
        filter.modelIds.includes(p.modelId)
      );
    }

    if (filter?.targets) {
      predictions = predictions.filter(p => filter.targets.includes(p.target));
    }

    if (filter?.dateRange) {
      predictions = predictions.filter(
        p =>
          p.timestamp >= filter.dateRange.start &&
          p.timestamp <= filter.dateRange.end
      );
    }

    return predictions;
  }

  private calculateAverageAccuracy(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length
    );
  }

  private calculateAverageConfidence(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce(
        (sum, p) =>
          sum +
          p.predictions.reduce((pSum, pred) => pSum + pred.confidence, 0) /
            p.predictions.length,
        0
      ) / predictions.length
    );
  }

  private calculateAveragePrecision(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, p) => sum + p.precision, 0) / predictions.length
    );
  }

  private calculateAverageRecall(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, p) => sum + p.recall, 0) / predictions.length
    );
  }

  private calculateAverageF1Score(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, p) => sum + p.f1Score, 0) / predictions.length
    );
  }

  private calculateAverageMSE(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return predictions.reduce((sum, p) => sum + p.mse, 0) / predictions.length;
  }

  private calculateAverageMAE(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return predictions.reduce((sum, p) => sum + p.mae, 0) / predictions.length;
  }

  private calculateAverageR2Score(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, p) => sum + p.r2Score, 0) / predictions.length
    );
  }

  private calculateAveragePredictionTime(
    predictions: PredictionResult[]
  ): number {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce(
        (sum, p) => sum + p.modelPerformance.predictionTime,
        0
      ) / predictions.length
    );
  }

  private async generateInsights(
    modelId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<PredictionInsight[]> {
    const insights: PredictionInsight[] = [
      {
        id: this.generateId(),
        type: 'trend',
        title: '預測準確率上升趨勢',
        description: '模型在過去一週的預測準確率呈現穩定上升趨勢',
        confidence: 0.85,
        impact: 'medium',
        data: { trend: 'increasing', period: '1 week' },
        createdAt: new Date(),
      },
      {
        id: this.generateId(),
        type: 'pattern',
        title: '週期性預測模式',
        description: '發現了明顯的週期性預測模式，建議優化模型',
        confidence: 0.78,
        impact: 'high',
        data: { pattern: 'cyclic', frequency: 'daily' },
        createdAt: new Date(),
      },
    ];

    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
      this.emitEvent('insight_discovered', { insight });
    });

    return insights;
  }

  private async generateRecommendations(
    modelId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<PredictionRecommendation[]> {
    const recommendations: PredictionRecommendation[] = [
      {
        id: this.generateId(),
        type: 'model_improvement',
        title: '增加特徵工程',
        description: '建議增加更多相關特徵以提高預測準確率',
        priority: 'high',
        expectedImpact: 0.15,
        implementationEffort: 'medium',
        actions: ['收集更多歷史數據', '添加市場指標', '優化特徵選擇'],
        createdAt: new Date(),
      },
      {
        id: this.generateId(),
        type: 'hyperparameter_tuning',
        title: '調整超參數',
        description: '通過網格搜索優化模型超參數',
        priority: 'medium',
        expectedImpact: 0.08,
        implementationEffort: 'low',
        actions: ['執行網格搜索', '驗證最佳參數', '更新模型配置'],
        createdAt: new Date(),
      },
    ];

    recommendations.forEach(recommendation => {
      this.recommendations.set(recommendation.id, recommendation);
      this.emitEvent('recommendation_created', { recommendation });
    });

    return recommendations;
  }

  private generateId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitEvent(type: PredictiveAnalysisEventType, data: unknown): void {
    const _listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener({ type, data, timestamp: new Date() });
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }
}
