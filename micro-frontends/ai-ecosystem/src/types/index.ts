export interface AIModel {
  id: string;
  name: string;
  type: 'card_recognition' | 'price_prediction' | 'market_analysis' | 'recommendation';
  version: string;
  accuracy: number;
  status: 'training' | 'active' | 'inactive' | 'error';
  lastUpdated: string;
  trainingData: number;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface CardScanResult {
  id: string;
  cardName: string;
  confidence: number;
  imageUrl: string;
  detectedFeatures: string[];
  processingTime: number;
  timestamp: string;
  modelVersion: string;
}

export interface MarketPrediction {
  id: string;
  cardId: string;
  cardName: string;
  predictedPrice: number;
  confidence: number;
  timeframe: '1d' | '7d' | '30d' | '90d';
  factors: string[];
  timestamp: string;
  modelVersion: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'investment' | 'collection' | 'trading' | 'market_opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetCards: string[];
  expectedReturn: number;
  risk: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface DataAnalysis {
  id: string;
  type: 'market_trend' | 'price_pattern' | 'volume_analysis' | 'correlation';
  title: string;
  description: string;
  insights: string[];
  dataPoints: number;
  confidence: number;
  timestamp: string;
  modelVersion: string;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  dataset: {
    training: number;
    validation: number;
    test: number;
  };
  metrics: {
    loss: number;
    accuracy: number;
    validationAccuracy: number;
  };
}

export interface AIEcosystemState {
  models: AIModel[];
  scanResults: CardScanResult[];
  predictions: MarketPrediction[];
  recommendations: AIRecommendation[];
  analyses: DataAnalysis[];
  trainingJobs: TrainingJob[];
  loading: boolean;
  error: string | null;
  selectedModel: string | null;
  activeTab: string;
}
