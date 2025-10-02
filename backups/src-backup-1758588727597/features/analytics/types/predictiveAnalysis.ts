// 預測分析類型定義

// 預測模型類型
export type PredictionModelType =
  | 'linear_regression'
  | 'logistic_regression'
  | 'random_forest'
  | 'gradient_boosting'
  | 'neural_network'
  | 'time_series'
  | 'clustering'
  | 'classification';

// 預測目標類型
export type PredictionTarget =
  | 'price_movement'
  | 'demand_forecast'
  | 'user_behavior'
  | 'market_trend'
  | 'risk_assessment'
  | 'revenue_forecast'
  | 'customer_churn'
  | 'inventory_optimization';

// 預測模型配置
export interface PredictionModelConfig {
  modelType: PredictionModelType;
  target: PredictionTarget;
  features: string[];
  hyperparameters: Record<string, any>;
  trainingConfig: {
    testSize: number;
    validationSize: number;
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
  };
  evaluationMetrics: string[];
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  retrainThreshold: number;
}

// 預測結果
export interface PredictionResult {
  id: string;
  modelId: string;
  target: PredictionTarget;
  timestamp: Date;
  predictions: {
    value: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  r2Score: number;
  featureImportance: Record<string, number>;
  modelPerformance: {
    trainingTime: number;
    predictionTime: number;
    memoryUsage: number;
  };
}

// 預測模型
export interface PredictionModel {
  id: string;
  name: string;
  description: string;
  config: PredictionModelConfig;
  status: 'training' | 'ready' | 'error' | 'deprecated';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  lastTrainedAt?: Date;
  accuracy: number;
  totalPredictions: number;
  isActive: boolean;
}

// 預測數據
export interface PredictionData {
  id: string;
  modelId: string;
  inputFeatures: Record<string, any>;
  prediction: PredictionResult;
  actualValue?: number;
  error?: number;
  createdAt: Date;
}

// 預測過濾器
export interface PredictionFilter {
  modelIds?: string[];
  targets?: PredictionTarget[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  accuracyThreshold?: number;
  status?: string[];
  isActive?: boolean;
}

// 預測報告
export interface PredictionReport {
  id: string;
  title: string;
  description: string;
  modelId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalPredictions: number;
    averageAccuracy: number;
    averageConfidence: number;
    bestPrediction: PredictionResult;
    worstPrediction: PredictionResult;
  };
  performanceMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mse: number;
    mae: number;
    r2Score: number;
  };
  predictions: PredictionResult[];
  insights: PredictionInsight[];
  recommendations: PredictionRecommendation[];
  createdAt: Date;
}

// 預測洞察
export interface PredictionInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  data: Record<string, any>;
  createdAt: Date;
}

// 預測建議
export interface PredictionRecommendation {
  id: string;
  type:
    | 'model_improvement'
    | 'feature_engineering'
    | 'hyperparameter_tuning'
    | 'data_quality';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  actions: string[];
  createdAt: Date;
}

// 預測警報
export interface PredictionAlert {
  id: string;
  modelId: string;
  type: 'accuracy_drop' | 'prediction_error' | 'model_drift' | 'data_quality';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

// 預測分析響應
export interface PredictiveAnalysisResponse {
  success: boolean;
  data: {
    models: PredictionModel[];
    predictions: PredictionResult[];
    accuracy: number;
    totalModels: number;
    activeModels: number;
    averagePredictionTime: number;
  };
  error?: string;
}

// 預測分析配置
export interface PredictiveAnalysisConfig {
  autoRetrain: boolean;
  retrainThreshold: number;
  maxModels: number;
  defaultModelType: PredictionModelType;
  alertSettings: {
    accuracyThreshold: number;
    predictionErrorThreshold: number;
    modelDriftThreshold: number;
  };
  performanceSettings: {
    maxPredictionTime: number;
    maxMemoryUsage: number;
    batchSize: number;
  };
}

// 預測分析導出選項
export interface PredictiveAnalysisExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includePredictions: boolean;
  includeModels: boolean;
  includeReports: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  modelIds?: string[];
}
