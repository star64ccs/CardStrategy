// False卡檢測系統Class型定義
export enum DetectionMethod {
  IMAGE_ANALYSIS = 'image_analysis',
  TEXTURE_ANALYSIS = 'texture_analysis',
  COLOR_ANALYSIS = 'color_analysis',
  FONT_ANALYSIS = 'font_analysis',
  WATERMARK_ANALYSIS = 'watermark_analysis',
  HOLOGRAM_ANALYSIS = 'hologram_analysis',
  BARCODE_ANALYSIS = 'barcode_analysis',
  AI_DETECTION = 'ai_detection',
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum DetectionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum CounterfeitRisk {
  AUTHENTIC = 'authentic',
  SUSPICIOUS = 'suspicious',
  LIKELY_FAKE = 'likely_fake',
  CONFIRMED_FAKE = 'confirmed_fake',
}

export interface DetectionFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  importance: number; // 0-1
  detected: boolean;
  confidence: number; // 0-1
  value?: string | number;
  expectedValue?: string | number;
  deviation?: number;
  analysis?: string;
}

export interface DetectionResult {
  id: string;
  cardId: string;
  imageUrl: string;
  overallRisk: CounterfeitRisk;
  overallConfidence: number; // 0-1
  authenticity: number; // 0-1, 1 Table示True品
  riskScore: number; // 0-100, 越高越可能YesFalse卡
  analysisDate: string;
  processingTime: number; // 毫Second
  methods: DetectionMethod[];
  features: DetectionFeature[];
  summary: string;
  recommendations: string[];
  flags: {
    requiresManualReview: boolean;
    hasHighRiskFeatures: boolean;
    lowImageQuality: boolean;
    multipleAnomalies: boolean;
  };
  metadata?: {
    imageResolution: string;
    imageFormat: string;
    fileSize: number;
    analysisEngine: string;
    modelVersion: string;
    [key: string]: unknown;
  };
}

export interface DetectionRequest {
  cardId: string;
  imageUrl: string;
  methods?: DetectionMethod[];
  options?: {
    highPrecision?: boolean;
    includeFeatureAnalysis?: boolean;
    generateReport?: boolean;
    compareWithDatabase?: boolean;
  };
}

export interface DetectionHistory {
  id: string;
  cardId: string;
  userId: string;
  detectionId: string;
  result: DetectionResult;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

export interface DetectionStats {
  totalDetections: number;
  authenticCards: number;
  suspiciousCards: number;
  fakeCards: number;
  averageConfidence: number;
  averageProcessingTime: number;
  topFakeFeatures: {
    feature: string;
    frequency: number;
  }[];
  detectionTrends: {
    date: string;
    authentic: number;
    fake: number;
    suspicious: number;
  }[];
  accuracyMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
}

export interface FeatureTemplate {
  id: string;
  cardType: string;
  category: string;
  features: {
    name: string;
    description: string;
    importance: number;
    expectedRange?: {
      min: number;
      max: number;
    };
    expectedValue?: string;
    checkPoints: string[];
  }[];
}

export interface DetectionConfig {
  enabledMethods: DetectionMethod[];
  confidenceThreshold: number;
  riskThreshold: number;
  features: {
    imageAnalysis: {
      minResolution: number;
      maxFileSize: number;
      supportedFormats: string[];
    };
    textureAnalysis: {
      sensitivity: number;
      patterns: string[];
    };
    colorAnalysis: {
      tolerance: number;
      colorSpaces: string[];
    };
    fontAnalysis: {
      precision: number;
      supportedFonts: string[];
    };
  };
  aiModel: {
    modelVersion: string;
    endpoint: string;
    timeout: number;
  };
}

export interface DetectionResponse {
  success: boolean;
  data: DetectionResult;
  processingTime: number;
  error?: string;
  warnings?: string[];
}

export interface DetectionServiceConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheExpiry: number;
  maxConcurrentDetections: number;
}

export interface FakeCardDatabase {
  id: string;
  cardId: string;
  signatures: {
    imageHash: string;
    featureVector: number[];
    texturePattern: string;
    colorProfile: string;
  };
  knownVariants: string[];
  confidence: number;
  reportedBy: string[];
  verifiedBy: string[];
  lastUpdated: string;
}

export interface ReportRequest {
  detectionId: string;
  cardId: string;
  imageUrl: string;
  reporterInfo: {
    userId: string;
    expertise: 'novice' | 'intermediate' | 'expert' | 'professional';
    reputation: number;
  };
  evidence: {
    description: string;
    additionalImages?: string[];
    comparisonImages?: string[];
    references?: string[];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
}
