import { Card } from './index';

// 防偽判斷RequestClass型
export interface AuthenticityCheckRequest {
  imageData: string; // Base64 Encode的Graph片Data
  imageFormat: 'jpeg' | 'png' | 'webp';
  cardId?: string;
  userId?: string;
  checkOptions?: AuthenticityCheckOptions;
}

// 防偽判斷結果Class型
export interface AuthenticityCheckResult {
  cardId: string;
  isAuthentic: boolean;
  confidence: number; // 0-1
  riskLevel: AuthenticityRiskLevel;
  riskFactors: AuthenticityRiskFactor[];
  securityFeatures: SecurityFeature[];
  recommendations: AuthenticityRecommendation[];
  metadata: AuthenticityCheckMetadata;
  status: AuthenticityCheckStatus;
  error?: AuthenticityCheckError;
}

// 防偽風險等級
export type AuthenticityRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// 防偽風險因素
export interface AuthenticityRiskFactor {
  type:
    | 'printing_quality'
    | 'color_mismatch'
    | 'text_anomaly'
    | 'security_feature'
    | 'material_quality'
    | 'size_variation'
    | 'hologram_issue'
    | 'ink_quality';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  confidence: number; // 0-1
  location?: { x: number; y: number; width: number; height: number };
  evidence?: string;
}

// 安全特徵
export interface SecurityFeature {
  type:
    | 'hologram'
    | 'watermark'
    | 'microtext'
    | 'uv_ink'
    | 'foil_stamping'
    | 'embossing'
    | 'color_shift'
    | 'security_thread';
  isPresent: boolean;
  isAuthentic: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  confidence: number; // 0-1
  description: string;
  location?: { x: number; y: number; width: number; height: number };
}

// 防偽建議
export interface AuthenticityRecommendation {
  type:
    | 'verification'
    | 'expert_review'
    | 'comparison'
    | 'testing'
    | 'documentation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// 防偽Check元Data
export interface AuthenticityCheckMetadata {
  modelVersion: string;
  processingTimeMs: number;
  imageQualityScore: number;
  confidence: number; // 0-1
  timestamp: Date;
  checkEngine: AuthenticityCheckEngine;
  imageResolution: { width: number; height: number };
  lightingConditions: 'good' | 'fair' | 'poor';
  cameraAngle: 'perpendicular' | 'slight_angle' | 'significant_angle';
  comparisonData?: {
    referenceCardId: string;
    similarityScore: number;
    differences: string[];
  };
}

// 防偽CheckError
export interface AuthenticityCheckError {
  code: string;
  message: string;
  details?: string;
  isRetryable: boolean;
  suggestedAction?: string;
}

// 防偽CheckOptions
export interface AuthenticityCheckOptions {
  enableDetailedAnalysis?: boolean;
  includeSecurityFeatures?: boolean;
  checkMode?: 'quick' | 'standard' | 'comprehensive';
  focusAreas?: (
    | 'printing'
    | 'colors'
    | 'text'
    | 'security_features'
    | 'materials'
  )[];
  qualityThreshold?: number; // 0-1
  enableComparison?: boolean;
  referenceCardId?: string;
}

// 防偽Check歷史Record
export interface AuthenticityCheckHistory {
  id: string;
  cardId: string;
  userId: string;
  timestamp: Date;
  request: AuthenticityCheckRequest;
  result: AuthenticityCheckResult;
  previousCheck?: AuthenticityCheckResult;
  statusChange?: {
    from: AuthenticityRiskLevel;
    to: AuthenticityRiskLevel;
    reason: string;
  };
}

// 防偽CheckStatistics
export interface AuthenticityCheckStats {
  totalChecks: number;
  authenticCards: number;
  suspiciousCards: number;
  fakeCards: number;
  averageConfidence: number;
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  mostCommonRiskFactors: {
    factor: string;
    frequency: number;
    averageSeverity: number;
  }[];
  checkTrends: {
    date: Date;
    totalChecks: number;
    fakeDetectionRate: number;
  }[];
}

// Class型定義
export type AuthenticityCheckStatus =
  | 'success'
  | 'failed'
  | 'pending'
  | 'partial_success';
export type AuthenticityCheckEngine =
  | 'ai_vision'
  | 'ml_model'
  | 'hybrid'
  | 'expert_system';

// Redux StatusClass型
export interface AuthenticityCheckState {
  isChecking: boolean;
  checkResult: AuthenticityCheckResult | null;
  checkError: AuthenticityCheckError | null;
  checkHistory: AuthenticityCheckHistory[];
  checkStats: AuthenticityCheckStats | null;
  currentImage: string | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  isLoadingStats: boolean;
  statsError: string | null;
  checkOptions: AuthenticityCheckOptions;
  isOptionsLoading: boolean;
  optionsError: string | null;
}
