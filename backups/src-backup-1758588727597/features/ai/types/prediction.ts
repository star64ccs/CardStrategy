// AI 預測系統類型定義
export interface PredictionRequest {
  cardId: string;
  cardName: string;
  series: string;
  version: string;
  currentPrice: number;
  predictionType: PredictionType;
  timeHorizon: TimeHorizon;
  confidenceLevel: number;
  marketConditions?: MarketConditions;
  historicalData?: HistoricalDataPoint[];
  options?: PredictionOptions;
}

export interface PredictionResult {
  id: string;
  cardId: string;
  predictionType: PredictionType;
  timeHorizon: TimeHorizon;
  predictedValue: number;
  confidenceLevel: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  trend: TrendDirection;
  trendStrength: number;
  factors: PredictionFactor[];
  riskAssessment: RiskAssessment;
  recommendations: string[];
  createdAt: Date;
  expiresAt: Date;
  accuracy?: number;
}

export interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1, negative means negative impact
  weight: number; // 0 to 1
  description: string;
  dataSource: string;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  marketRisk: RiskLevel;
  volatilityRisk: RiskLevel;
  liquidityRisk: RiskLevel;
  regulatoryRisk: RiskLevel;
  riskFactors: string[];
  riskScore: number; // 0-100
}

export interface ExternalFactor {
  type: string;
  name: string;
  impact: number; // -1 to 1
  description: string;
  source: string;
}

export interface MarketConditions {
  marketTrend: TrendDirection;
  volatility: number; // 0-1
  liquidity: number; // 0-1
  demand: number; // 0-1
  supply: number; // 0-1
  seasonality: SeasonalityFactor;
  externalFactors: ExternalFactor[];
}

export interface HistoricalDataPoint {
  date: Date;
  price: number;
  volume: number;
  marketCap?: number;
  events?: MarketEvent[];
}

export interface MarketEvent {
  type: EventType;
  description: string;
  impact: number; // -1 to 1
  date: Date;
}

export interface PredictionOptions {
  algorithm: PredictionAlgorithm;
  includeSeasonality: boolean;
  includeExternalFactors: boolean;
  sensitivityAnalysis: boolean;
  scenarioAnalysis: boolean;
  updateFrequency: UpdateFrequency;
}

export interface PredictionStats {
  totalPredictions: number;
  averageAccuracy: number;
  accuracyByType: Record<PredictionType, number>;
  accuracyByHorizon: Record<TimeHorizon, number>;
  topPerformingCards: TopPerformingCard[];
  recentPredictions: PredictionResult[];
  modelPerformance: ModelPerformance;
}

export interface TopPerformingCard {
  cardId: string;
  cardName: string;
  accuracy: number;
  predictionCount: number;
  averageReturn: number;
}

export interface ModelPerformance {
  overallAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  lastUpdated: Date;
  trainingDataSize: number;
  modelVersion: string;
}

export interface PredictionHistory {
  id: string;
  cardId: string;
  predictions: PredictionResult[];
  accuracy: number;
  totalPredictions: number;
  successfulPredictions: number;
  averageReturn: number;
  bestPrediction: PredictionResult;
  worstPrediction: PredictionResult;
}

export interface TrendAnalysis {
  shortTerm: TrendDirection;
  mediumTerm: TrendDirection;
  longTerm: TrendDirection;
  strength: number;
  confidence: number;
  supportLevels: number[];
  resistanceLevels: number[];
  breakoutPoints: number[];
}

export interface PricePrediction extends PredictionResult {
  priceRange: {
    min: number;
    max: number;
    expected: number;
  };
  priceTargets: PriceTarget[];
  volatilityForecast: number;
  probabilityDistribution: ProbabilityDistribution;
}

export interface PriceTarget {
  price: number;
  probability: number;
  timeframe: TimeHorizon;
  rationale: string;
}

export interface ProbabilityDistribution {
  percentiles: Record<string, number>;
  mean: number;
  median: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
}

export interface MarketTrendPrediction extends PredictionResult {
  marketDirection: TrendDirection;
  strength: number;
  duration: TimeHorizon;
  affectedCards: string[];
  marketFactors: MarketFactor[];
  sectorAnalysis: SectorAnalysis;
}

export interface MarketFactor {
  name: string;
  currentValue: number;
  predictedValue: number;
  impact: number;
  confidence: number;
}

export interface SectorAnalysis {
  sector: string;
  trend: TrendDirection;
  strength: number;
  topPerformers: string[];
  underPerformers: string[];
  opportunities: string[];
  risks: string[];
}

export interface PredictionError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export interface PredictionState {
  currentPrediction: PredictionResult | null;
  predictionHistory: PredictionHistory[];
  predictionStats: PredictionStats | null;
  loading: boolean;
  error: PredictionError | null;
  options: PredictionOptions;
}

// 枚舉類型
export enum PredictionType {
  PRICE = 'price',
  TREND = 'trend',
  VOLATILITY = 'volatility',
  VOLUME = 'volume',
  MARKET_CAP = 'market_cap',
  COMPOSITE = 'composite',
}

export enum TimeHorizon {
  SHORT_TERM = 'short_term', // 1-7 days
  MEDIUM_TERM = 'medium_term', // 1-4 weeks
  LONG_TERM = 'long_term', // 1-12 months
  VERY_LONG_TERM = 'very_long_term', // 1+ years
}

export enum TrendDirection {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  SIDEWAYS = 'sideways',
  VOLATILE = 'volatile',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum SeasonalityFactor {
  NONE = 'none',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum EventType {
  RELEASE = 'release',
  TOURNAMENT = 'tournament',
  BAN = 'ban',
  PROMOTION = 'promotion',
  ECONOMIC = 'economic',
  REGULATORY = 'regulatory',
  OTHER = 'other',
}

export enum PredictionAlgorithm {
  LINEAR_REGRESSION = 'linear_regression',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  NEURAL_NETWORK = 'neural_network',
  TIME_SERIES = 'time_series',
  ENSEMBLE = 'ensemble',
}

export enum UpdateFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

// 常量定義
export const PREDICTION_CONSTANTS = {
  DEFAULT_CONFIDENCE_LEVEL: 0.8,
  MIN_CONFIDENCE_LEVEL: 0.5,
  MAX_CONFIDENCE_LEVEL: 0.95,
  DEFAULT_TIME_HORIZON: TimeHorizon.MEDIUM_TERM,
  PREDICTION_EXPIRY_DAYS: 30,
  MIN_HISTORICAL_DATA_POINTS: 30,
  MAX_PREDICTION_HISTORY: 1000,
  ACCURACY_THRESHOLD: 0.85,
  RISK_THRESHOLDS: {
    VERY_LOW: 20,
    LOW: 40,
    MEDIUM: 60,
    HIGH: 80,
    VERY_HIGH: 100,
  },
} as const;

export type PredictionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';
