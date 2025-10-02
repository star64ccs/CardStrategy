import { Card } from './index';

// 置中評估請求類型
export interface CenteringAssessmentRequest {
  imageData: string; // Base64 編碼的圖片數據
  imageFormat: 'jpeg' | 'png' | 'webp';
  cardId?: string;
  userId?: string;
  assessmentOptions?: CenteringAssessmentOptions;
}

// 置中評估結果類型
export interface CenteringAssessmentResult {
  cardId: string;
  overallScore: number; // 0-10 分制
  centeringScore: number; // 0-10 分制
  edgeWearScore: number; // 0-10 分制
  cornerWearScore: number; // 0-10 分制
  surfaceWearScore: number; // 0-10 分制
  details: CenteringAssessmentDetails;
  recommendations: CenteringRecommendation[];
  metadata: CenteringAssessmentMetadata;
  status: CenteringAssessmentStatus;
  error?: CenteringAssessmentError;
}

// 置中評估詳細信息
export interface CenteringAssessmentDetails {
  centering: {
    horizontalOffset: number; // 水平偏移百分比 (-50 到 50)
    verticalOffset: number; // 垂直偏移百分比 (-50 到 50)
    tolerance: number; // 容許範圍
    isCentered: boolean;
  };
  edges: {
    top: EdgeWearInfo;
    bottom: EdgeWearInfo;
    left: EdgeWearInfo;
    right: EdgeWearInfo;
  };
  corners: {
    topLeft: CornerWearInfo;
    topRight: CornerWearInfo;
    bottomLeft: CornerWearInfo;
    bottomRight: CornerWearInfo;
  };
  surface: {
    scratches: SurfaceDefect[];
    dents: SurfaceDefect[];
    stains: SurfaceDefect[];
    overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

// 邊緣磨損信息
export interface EdgeWearInfo {
  wearLevel: 'none' | 'light' | 'moderate' | 'heavy' | 'severe';
  wearPercentage: number; // 0-100
  whiteEdge: boolean;
  chipping: boolean;
  location: { start: number; end: number }; // 邊緣位置範圍
}

// 角落磨損信息
export interface CornerWearInfo {
  wearLevel: 'none' | 'light' | 'moderate' | 'heavy' | 'severe';
  wearPercentage: number; // 0-100
  rounded: boolean;
  chipped: boolean;
  whiteCorner: boolean;
}

// 表面缺陷
export interface SurfaceDefect {
  type: 'scratch' | 'dent' | 'stain' | 'crease' | 'ink_blemish';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  location: { x: number; y: number; width: number; height: number };
  description: string;
}

// 置中評估建議
export interface CenteringRecommendation {
  type: 'centering' | 'edge_wear' | 'corner_wear' | 'surface' | 'overall';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// 置中評估元數據
export interface CenteringAssessmentMetadata {
  modelVersion: string;
  processingTimeMs: number;
  imageQualityScore: number;
  confidence: number; // 0-1
  timestamp: Date;
  assessmentEngine: CenteringAssessmentEngine;
  imageResolution: { width: number; height: number };
  lightingConditions: 'good' | 'fair' | 'poor';
  cameraAngle: 'perpendicular' | 'slight_angle' | 'significant_angle';
}

// 置中評估錯誤
export interface CenteringAssessmentError {
  code: string;
  message: string;
  details?: string;
  isRetryable: boolean;
  suggestedAction?: string;
}

// 置中評估選項
export interface CenteringAssessmentOptions {
  enableDetailedAnalysis?: boolean;
  includeRecommendations?: boolean;
  assessmentMode?: 'quick' | 'standard' | 'detailed';
  focusAreas?: ('centering' | 'edges' | 'corners' | 'surface')[];
  qualityThreshold?: number; // 0-1
}

// 置中評估歷史記錄
export interface CenteringAssessmentHistory {
  id: string;
  cardId: string;
  userId: string;
  timestamp: Date;
  request: CenteringAssessmentRequest;
  result: CenteringAssessmentResult;
  previousAssessment?: CenteringAssessmentResult;
  improvement?: number; // 相對於上次評估的改進分數
}

// 置中評估統計
export interface CenteringAssessmentStats {
  totalAssessments: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 9-10
    good: number; // 7-8
    fair: number; // 5-6
    poor: number; // 3-4
    veryPoor: number; // 1-2
  };
  mostCommonIssues: {
    issue: string;
    frequency: number;
    averageImpact: number;
  }[];
  assessmentTrends: {
    date: Date;
    averageScore: number;
    assessmentCount: number;
  }[];
}

// 類型定義
export type CenteringAssessmentStatus =
  | 'success'
  | 'failed'
  | 'pending'
  | 'partial_success';
export type CenteringAssessmentEngine =
  | 'ai_vision'
  | 'computer_vision'
  | 'hybrid'
  | 'manual';

// Redux 狀態類型
export interface CenteringAssessmentState {
  isAssessing: boolean;
  assessmentResult: CenteringAssessmentResult | null;
  assessmentError: CenteringAssessmentError | null;
  assessmentHistory: CenteringAssessmentHistory[];
  assessmentStats: CenteringAssessmentStats | null;
  currentImage: string | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  isLoadingStats: boolean;
  statsError: string | null;
  assessmentOptions: CenteringAssessmentOptions;
  isOptionsLoading: boolean;
  optionsError: string | null;
}
