// 模擬鑑定系統類型定義

export interface AppraisalRequest {
  cardId: string;
  imageUrl: string;
  cardType: string;
  series: string;
  version: string;
  options?: AppraisalOptions;
}

export interface AppraisalResult {
  id: string;
  cardId: string;
  overallGrade: string;
  overallScore: number;
  details: AppraisalDetails;
  recommendations: AppraisalRecommendation[];
  metadata: AppraisalMetadata;
  timestamp: string;
  status: AppraisalStatus;
}

export interface AppraisalDetails {
  centering: GradeAssessment;
  corners: GradeAssessment;
  edges: GradeAssessment;
  surface: GradeAssessment;
  printQuality: GradeAssessment;
  colorAccuracy: GradeAssessment;
  glossiness: GradeAssessment;
  registration: GradeAssessment;
}

export interface GradeAssessment {
  grade: string;
  score: number;
  description: string;
  issues: string[];
  images?: string[];
}

export interface AppraisalRecommendation {
  type: 'improvement' | 'maintenance' | 'investment' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
}

export interface AppraisalMetadata {
  appraiser: string;
  appraisalMethod: AppraisalMethod;
  confidence: number;
  processingTime: number;
  imageQuality: 'low' | 'medium' | 'high';
  lightingConditions: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface AppraisalOptions {
  method?: AppraisalMethod;
  includeImages?: boolean;
  detailedAnalysis?: boolean;
  marketComparison?: boolean;
  preservationTips?: boolean;
}

export interface AppraisalHistory {
  id: string;
  cardId: string;
  appraisals: AppraisalResult[];
  totalAppraisals: number;
  averageGrade: string;
  averageScore: number;
  bestGrade: string;
  worstGrade: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface AppraisalStats {
  totalAppraisals: number;
  averageProcessingTime: number;
  gradeDistribution: Record<string, number>;
  methodUsage: Record<string, number>;
  accuracyRate: number;
  userSatisfaction: number;
}

export interface AppraisalError {
  code:
    | 'INVALID_REQUEST'
    | 'IMAGE_PROCESSING_FAILED'
    | 'APPRAISAL_FAILED'
    | 'SERVICE_UNAVAILABLE';
  message: string;
  details?: string;
  isRetryable: boolean;
}

export type AppraisalStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AppraisalMethod =
  | 'ai_vision'
  | 'expert_system'
  | 'hybrid'
  | 'manual';

export interface AppraisalState {
  currentAppraisal: AppraisalResult | null;
  history: AppraisalHistory[];
  stats: AppraisalStats | null;
  options: AppraisalOptions;
  status: AppraisalStatus;
  error: AppraisalError | null;
  loading: boolean;
}

// 評分標準
export const GRADE_STANDARDS = {
  MINT: { min: 9.5, max: 10.0, description: '完美狀態' },
  'NM-MT': { min: 9.0, max: 9.4, description: '近完美狀態' },
  NM: { min: 8.0, max: 8.9, description: '近全新狀態' },
  'EX-MT': { min: 7.0, max: 7.9, description: '優秀狀態' },
  EX: { min: 6.0, max: 6.9, description: '良好狀態' },
  'VG-EX': { min: 5.0, max: 5.9, description: '很好狀態' },
  VG: { min: 4.0, max: 4.9, description: '好狀態' },
  GOOD: { min: 3.0, max: 3.9, description: '一般狀態' },
  PR: { min: 2.0, max: 2.9, description: '較差狀態' },
  POOR: { min: 1.0, max: 1.9, description: '差狀態' },
} as const;

export type GradeLevel = keyof typeof GRADE_STANDARDS;
