// 統一Export所有Class型定義
export * from './common';
export * from './auth';
export * from './cards';
// export * from './cards/recognition'; // File不存在，已Remove
// export * from './cards/centering'; // File不存在，已Remove
// export * from './cards/authenticity'; // File不存在，已Remove
// export * from './cards/appraisal'; // File不存在，已Remove
// export * from './ai/prediction'; // File不存在，已Remove
// export * from './ai/recommendation'; // File不存在，已Remove
// export * from './ai/chat'; // File不存在，已Remove
// export * from './market/pricing'; // File不存在，已Remove
// export * from './counterfeit/detection'; // File不存在，已Remove
// export * from './counterfeit/reporting'; // File不存在，已Remove
// export * from '../features/storage/types/storage'; // File不存在，已Remove
export * from './api';

// ReExport常用Class型
export type { BaseEntity, ApiResponse, ApiError } from './common';
export type { Card, AnalysisResult } from './cards';

// 導航Class型
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CardDetail: { cardId: string };
  CollectionDetail: { collectionId: string };
  InvestmentDetail: { investmentId: string };
  Settings: undefined;
  Profile: { userId: string };
  Search: { query?: string };
  Scanner: undefined;
  AIAnalysis: { cardId: string };
  MarketAnalysis: { cardId?: string };
  Notifications: undefined;
  Help: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Collection: undefined;
  Market: undefined;
  Investments: undefined;
  Profile: undefined;
};

// Component Props Class型
export interface BaseComponentProps {
  testID?: string;
  style?: unknown;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

// SettingsClass型
export interface AppSettings {
  theme: ThemeSettings;
  language: LanguageSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  display: DisplaySettings;
  security: SecuritySettings;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customColors?: Record<string, string>;
}

export interface LanguageSettings {
  current: string;
  available: string[];
  fallback: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  priceAlerts: boolean;
  marketUpdates: boolean;
  systemNotifications: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  dataRetention: number;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

export interface PerformanceSettings {
  imageQuality: 'low' | 'medium' | 'high';
  cacheEnabled: boolean;
  offlineMode: boolean;
  dataSync: boolean;
  cacheSize: number;
}

export interface DisplaySettings {
  currency: string;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
}

export interface SecuritySettings {
  sessionTimeout: number;
  requireBiometric: boolean;
  autoLock: boolean;
  encryptionLevel: 'low' | 'medium' | 'high';
}

// 會員制度Class型
export type MembershipTier = 'free' | 'trial' | 'vip';

export interface TrialStatus {
  isActive: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface MembershipUsage {
  cardRecognition: { used: number; limit: number };
  conditionAnalysis: { used: number; limit: number };
  authenticityCheck: { used: number; limit: number };
  pricePrediction: { used: number; limit: number };
  aiChat: { used: number; limit: number };
}

export interface MembershipLimits {
  cardRecognition: number;
  conditionAnalysis: number;
  authenticityCheck: number;
  pricePrediction: number;
  aiChat: number;
}

export interface MembershipFeatures {
  cardRecognition: boolean;
  conditionAnalysis: boolean;
  authenticityCheck: boolean;
  pricePrediction: boolean;
  aiChat: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  exclusiveContent: boolean;
}

export interface MembershipStatus {
  tier: MembershipTier;
  isActive: boolean;
  endDate: string | null;
  daysRemaining: number;
  usage: MembershipUsage;
  limits: MembershipLimits;
  features: MembershipFeatures;
  isTrialActive: boolean;
  trialEndDate: string | null;
  membershipEndDate: string | null;
}

export interface FeatureUsage {
  cardRecognition: number;
  conditionAnalysis: number;
  authenticityCheck: number;
  pricePrediction: number;
  aiChat: number;
}

// AI 聊天Class型
export interface AIChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    cardId?: string;
    analysisType?: unknown;
    confidence?: number;
  };
}

// AI Analysis相OffClass型
export interface AIAnalysis {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  cardId: string;
  analysisType: AnalysisType;
  confidence: number;
  results: unknown[];
  recommendations: Recommendation[];
  metadata: AnalysisMetadata;
  processingTime: number;
}

export type AnalysisType =
  | 'authenticity'
  | 'condition'
  | 'pricing'
  | 'investment'
  | 'market';

export interface Recommendation {
  type: 'buy' | 'sell' | 'hold' | 'grade' | 'authenticate';
  confidence: number;
  reasoning: string;
  expectedValue?: number;
  timeframe?: string;
}

export interface AnalysisMetadata {
  modelVersion: string;
  processingTime: number;
  imageQuality: number;
  analysisDate: Date;
}

// Redux StatusClass型
export interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

export interface MembershipState {
  currentTier: MembershipTier;
  trialStatus: TrialStatus;
  membershipEndDate: string | null;
  usage: MembershipUsage;
  limits: MembershipLimits;
  features: MembershipFeatures;
  isLoading: boolean;
  error: string | null;
  isTrialActive: boolean;
  trialEndDate: string | null;
  isUpgrading: boolean;
}

export interface AIState {
  analyses: AIAnalysis[];
  chatMessages: AIChatMessage[];
  isLoading: boolean;
  error: string | null;
  isAnalyzing: boolean;
  isChatting: boolean;
  isGeneratingReport: boolean;
  currentAnalysis: AIAnalysis | null;
  pricePrediction: {
    predictedPrice: number;
    confidence: number;
    factors: string[];
    trend: 'stable' | 'up' | 'down';
  } | null;
  investmentReport: unknown | null;
  confidence: number;
  processingTime: number;
  isPredicting: boolean;
  marketInsights: unknown | null;
}

// 分享Verify相OffClass型
export interface ShareVerification {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  verificationCode: string;
  userId: string;
  cardId: string;
  analysisType: 'centering' | 'authenticity' | 'comprehensive';
  analysisResult: {
    centering?: {
      score: number;
      grade: string;
      details: string[];
      confidence: number;
    };
    authenticity?: {
      isAuthentic: boolean;
      confidence: number;
      riskFactors: string[];
      verificationDetails: string[];
    };
    overallGrade?: string;
    overallScore?: number;
    processingTime: number;
    metadata: {
      analysisMethod: string;
      modelVersion: string;
      imageQuality: string;
      lightingConditions: string;
    };
  };
  shareUrl: string;
  expiresAt: string;
  isActive: boolean;
  viewCount: number;
  lastViewedAt?: string;
}

export interface ShareVerificationCreateRequest {
  cardId: string;
  analysisType: 'centering' | 'authenticity' | 'comprehensive';
  analysisResult: ShareVerification['analysisResult'];
  expiresInDays?: number;
}

export interface ShareVerificationResponse {
  verificationCode: string;
  shareUrl: string;
  qrCodeUrl: string;
  socialShareLinks: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
    telegram: string;
  };
}

export interface VerificationLookupResponse {
  verification: ShareVerification;
  card: unknown;
  user: {
    username: string;
    avatar?: string;
  };
  isExpired: boolean;
  isValid: boolean;
}

// ConstantClass型
export const _SUPPORTED_LANGUAGES = ['zh-TW', 'en-US', 'ja-JP'] as const;
export const _THEME_MODES = ['light', 'dark', 'auto'] as const;
