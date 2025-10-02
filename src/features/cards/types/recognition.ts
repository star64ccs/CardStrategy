import type { Card } from '../../../core/types/cards';
import type { BaseEntity } from '../../../core/types/common';

// 卡牌遊戲Class型
export type CardGame =
  | 'pokemon'
  | 'yugioh'
  | 'magic'
  | 'digimon'
  | 'onepiece'
  | 'dragonball'
  | 'flesh_and_blood'
  | 'lorcana'
  | 'weiss_schwarz'
  | 'cardfight_vanguard'
  | 'force_of_will'
  | 'other';

// 卡牌系Column/VersionInformation
export interface CardSet {
  id: string;
  name: string;
  code: string;
  game: CardGame;
  releaseDate: Date;
  totalCards: number;
  languages: string[];
  symbol?: string;
  rarity: CardSetRarity;
  isOfficial: boolean;
  description?: string;
}

export type CardSetRarity =
  | 'base'
  | 'expansion'
  | 'special'
  | 'promo'
  | 'tournament'
  | 'limited'
  | 'collector';

// 卡牌識別Request
export interface CardRecognitionRequest {
  imageData: string; // Base64 encoded image
  imageFormat: 'jpg' | 'png' | 'webp';
  game?: CardGame; // Optional的遊戲提示
  language?: string; // Optional的Language提示
  region?: string; // Optional的Locale提示
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  options?: RecognitionOptions;
}

export interface RecognitionOptions {
  enableMultipleCards: boolean; // YesNo識別多張卡片
  enableTextExtraction: boolean; // YesNo提取文字
  enableFeatureDetection: boolean; // YesNo檢測Special特徵
  confidenceThreshold: number; // 信心閾Value (0-1)
  maxResults: number; // 最大結果數量
  timeout: number; // 超時Time（毫Second）
  useCache: boolean; // YesNo使用Cache
}

// 卡牌識別結果
export interface CardRecognitionResult {
  id: string;
  card: Card;
  confidence: number; // 0-1
  game: CardGame;
  set: CardSet;
  variant?: CardVariant;
  language: string;
  region: string;
  features: RecognitionFeatures;
  processingTime: number; // 毫Second
  metadata: RecognitionMetadata;
}

// 卡牌變體Information
export interface CardVariant {
  type: VariantType;
  description: string;
  rarity: 'common' | 'rare' | 'ultra_rare';
  features: string[];
  estimatedValue?: number;
}

export type VariantType =
  | 'normal'
  | 'foil'
  | 'holographic'
  | 'rainbow'
  | 'secret'
  | 'alternate_art'
  | 'full_art'
  | 'textless'
  | 'misprint'
  | 'first_edition'
  | 'shadowless'
  | 'unlimited'
  | 'promo'
  | 'error';

// 識別特徵
export interface RecognitionFeatures {
  textFeatures: TextFeatures;
  visualFeatures: VisualFeatures;
  structuralFeatures: StructuralFeatures;
  qualityMetrics: QualityMetrics;
}

export interface TextFeatures {
  extractedText: ExtractedText[];
  ocrConfidence: number;
  languageDetected: string;
  fonts: FontInfo[];
  textRegions: TextRegion[];
}

export interface ExtractedText {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  type:
    | 'title'
    | 'description'
    | 'attributes'
    | 'set_info'
    | 'copyright'
    | 'other';
}

export interface FontInfo {
  family: string;
  size: number;
  style: 'normal' | 'italic' | 'bold';
  color: string;
}

export interface TextRegion {
  id: string;
  boundingBox: BoundingBox;
  text: string;
  confidence: number;
  type: string;
}

export interface VisualFeatures {
  colorPalette: ColorInfo[];
  dominantColors: string[];
  averageBrightness: number;
  contrast: number;
  sharpness: number;
  imageHash: string;
  artworkRegion?: BoundingBox;
  borders: BorderInfo[];
  holoPattern?: HoloPatternInfo;
}

export interface ColorInfo {
  color: string; // Hex color
  percentage: number;
  rgb: [number, number, number];
  hsl: [number, number, number];
}

export interface BorderInfo {
  type: 'none' | 'simple' | 'decorated' | 'foil' | 'holographic';
  color: string;
  thickness: number;
  pattern?: string;
}

export interface HoloPatternInfo {
  type: 'linear' | 'radial' | 'rainbow' | 'galaxy' | 'other';
  intensity: number;
  regions: BoundingBox[];
}

export interface StructuralFeatures {
  cardDimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  layout: LayoutInfo;
  elements: CardElement[];
  symmetry: SymmetryInfo;
}

export interface LayoutInfo {
  type:
    | 'standard'
    | 'full_art'
    | 'borderless'
    | 'split'
    | 'transform'
    | 'other';
  regions: LayoutRegion[];
}

export interface LayoutRegion {
  name: string;
  boundingBox: BoundingBox;
  type: 'artwork' | 'text' | 'attributes' | 'border' | 'background';
}

export interface CardElement {
  type:
    | 'artwork'
    | 'title'
    | 'cost'
    | 'stats'
    | 'text'
    | 'set_symbol'
    | 'rarity'
    | 'other';
  boundingBox: BoundingBox;
  confidence: number;
  properties: Record<string, any>;
}

export interface SymmetryInfo {
  horizontal: number; // 0-1
  vertical: number; // 0-1
  rotational: number; // 0-1
}

export interface QualityMetrics {
  resolution: {
    width: number;
    height: number;
    dpi?: number;
  };
  imageQuality: 'poor' | 'fair' | 'good' | 'excellent';
  clarity: number; // 0-1
  lighting: 'poor' | 'dim' | 'adequate' | 'good' | 'excellent';
  angle: 'front' | 'slight' | 'moderate' | 'severe';
  distortion: number; // 0-1
  shadows: number; // 0-1
  reflections: number; // 0-1
  damage: DamageInfo[];
}

export interface DamageInfo {
  type: 'scratch' | 'crease' | 'stain' | 'tear' | 'bend' | 'fade' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  location: BoundingBox;
  description: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 識別元Data
export interface RecognitionMetadata {
  version: string;
  modelVersion: string;
  algorithm: string;
  processingSteps: ProcessingStep[];
  imageAnalysis: ImageAnalysis;
  confidence: ConfidenceBreakdown;
  performanceMetrics: PerformanceMetrics;
}

export interface ProcessingStep {
  name: string;
  duration: number;
  success: boolean;
  details?: Record<string, any>;
}

export interface ImageAnalysis {
  fileSize: number;
  format: string;
  colorSpace: string;
  hasAlpha: boolean;
  compression: string;
  metadata: Record<string, any>;
}

export interface ConfidenceBreakdown {
  overall: number;
  visual: number;
  textual: number;
  structural: number;
  contextual: number;
  historical: number;
}

export interface PerformanceMetrics {
  totalTime: number;
  preprocessingTime: number;
  recognitionTime: number;
  postprocessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// 識別Response
export interface CardRecognitionResponse {
  success: boolean;
  results: CardRecognitionResult[];
  alternatives: AlternativeResult[];
  suggestions: RecognitionSuggestion[];
  processingTime: number;
  requestId: string;
  error?: RecognitionError;
  usage: UsageInfo;
}

export interface AlternativeResult {
  card: Partial<Card>;
  confidence: number;
  reason: string;
  game?: CardGame;
  set?: Partial<CardSet>;
}

export interface RecognitionSuggestion {
  type:
    | 'improve_image'
    | 'try_different_angle'
    | 'crop_card'
    | 'better_lighting'
    | 'clean_lens';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RecognitionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

export interface UsageInfo {
  recognitionsUsed: number;
  recognitionsRemaining: number;
  resetDate: Date;
  tier: 'free' | 'premium' | 'unlimited';
}

// 識別歷史Record
export interface RecognitionHistory extends BaseEntity {
  userId: string;
  request: CardRecognitionRequest;
  response: CardRecognitionResponse;
  success: boolean;
  processingTime: number;
  confidence: number;
  recognizedCard?: Card;
  userFeedback?: UserFeedback;
  metadata: {
    userAgent: string;
    platform: string;
    version: string;
    location?: {
      country: string;
      region: string;
    };
  };
}

export interface UserFeedback {
  isCorrect: boolean;
  actualCard?: Card;
  rating: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  improvements?: string[];
  timestamp: Date;
}

// 識別Statistics
export interface RecognitionStats {
  totalRecognitions: number;
  successfulRecognitions: number;
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  popularGames: GameStats[];
  popularSets: SetStats[];
  commonErrors: ErrorStats[];
  performanceTrends: PerformanceTrend[];
  userSatisfaction: SatisfactionStats;
}

export interface GameStats {
  game: CardGame;
  count: number;
  successRate: number;
  averageConfidence: number;
}

export interface SetStats {
  setId: string;
  setName: string;
  game: CardGame;
  count: number;
  successRate: number;
}

export interface ErrorStats {
  errorCode: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PerformanceTrend {
  date: Date;
  averageProcessingTime: number;
  successRate: number;
  totalRequests: number;
}

export interface SatisfactionStats {
  averageRating: number;
  totalFeedback: number;
  positivePercent: number;
  commonComplaints: string[];
  improvements: string[];
}

// 識別Configure
export interface RecognitionConfig {
  enabledGames: CardGame[];
  defaultOptions: RecognitionOptions;
  qualityThresholds: QualityThresholds;
  modelSettings: ModelSettings;
  cacheSettings: CacheSettings;
  retrySettings: RetrySettings;
}

export interface QualityThresholds {
  minimumResolution: {
    width: number;
    height: number;
  };
  minimumClarity: number;
  maximumAngle: number;
  maximumDistortion: number;
}

export interface ModelSettings {
  version: string;
  confidence: number;
  ensembleModels: boolean;
  fallbackModels: string[];
  updateInterval: number;
}

export interface CacheSettings {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size in MB
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface RetrySettings {
  maxRetries: number;
  backoffFactor: number;
  maxBackoffTime: number;
  retryableErrors: string[];
}

// Batch識別
export interface BatchRecognitionRequest {
  images: {
    id: string;
    imageData: string;
    imageFormat: 'jpg' | 'png' | 'webp';
    metadata?: Record<string, any>;
  }[];
  options?: RecognitionOptions;
  notificationUrl?: string; // Webhook for completion notification
}

export interface BatchRecognitionResponse {
  batchId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalImages: number;
  processedImages: number;
  successfulRecognitions: number;
  results: {
    imageId: string;
    result?: CardRecognitionResult;
    error?: RecognitionError;
  }[];
  estimatedTimeRemaining?: number;
  processingStarted?: Date;
  processingCompleted?: Date;
}

// 實時識別流
export interface RealtimeRecognitionFrame {
  frameId: string;
  timestamp: Date;
  imageData: string;
  boundingBoxes: BoundingBox[];
  partialResults: Partial<CardRecognitionResult>[];
  trackingInfo: TrackingInfo[];
}

export interface TrackingInfo {
  objectId: string;
  confidence: number;
  position: BoundingBox;
  velocity: {
    x: number;
    y: number;
  };
  age: number; // frames since first detection
}

// 識別Status
export interface RecognitionState {
  // 當前識別
  isRecognizing: boolean;
  currentRequest: CardRecognitionRequest | null;
  currentResult: CardRecognitionResult | null;
  recognitionError: string | null;

  // 識別歷史
  history: RecognitionHistory[];
  isLoadingHistory: boolean;
  historyError: string | null;

  // Batch識別
  batchJobs: BatchRecognitionResponse[];
  isBatchProcessing: boolean;
  batchError: string | null;

  // 實時識別
  isRealtimeActive: boolean;
  realtimeFrames: RealtimeRecognitionFrame[];
  realtimeError: string | null;

  // Configure和Settings
  config: RecognitionConfig;
  isConfigLoading: boolean;
  configError: string | null;

  // Statistics和Analysis
  stats: RecognitionStats | null;
  isStatsLoading: boolean;
  statsError: string | null;

  // UI Status
  selectedAlternative: AlternativeResult | null;
  showAlternatives: boolean;
  cropMode: boolean;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}
