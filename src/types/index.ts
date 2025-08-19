// 基礎類型定義
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用戶相關類型
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isPremium: boolean;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  language: 'zh-TW' | 'en-US' | 'ja-JP';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  marketAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  socialAlerts: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  collectionVisibility: 'public' | 'private' | 'friends';
  activityVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analyticsEnabled: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface UserStatistics {
  totalCards: number;
  totalValue: number;
  totalInvestments: number;
  totalTrades: number;
  joinDate: Date;
  lastActive: Date;
}

// 卡牌相關類型
export interface Card extends BaseEntity {
  name: string;
  setName: string;
  cardNumber: string;
  rarity: CardRarity;
  type: CardType;
  attributes: CardAttributes;
  marketData: MarketData;
  images: CardImages;
  metadata: CardMetadata;
  conditionAnalysis?: AnalysisResult[]; // 添加條件分析
  authenticityCheck?: AnalysisResult[]; // 添加真偽檢查
  // 添加缺失的屬性
  price?: number;
  currentPrice?: number; // 當前價格
  priceChange?: number; // 價格變化百分比
  condition?: CardCondition;
  set?: string;
  isFavorite?: boolean;
  imageUrl?: string;
  description?: string;
}

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'promo';
export type CardType =
  | 'creature'
  | 'spell'
  | 'artifact'
  | 'land'
  | 'enchantment'
  | 'instant'
  | 'sorcery'
  | 'planeswalker';

export interface CardAttributes {
  manaCost?: string;
  power?: number;
  toughness?: number;
  loyalty?: number;
  text?: string;
  flavorText?: string;
  artist?: string;
  collectorNumber?: string;
}

export interface MarketData {
  currentPrice: number;
  priceHistory: PricePoint[];
  marketTrend: 'rising' | 'falling' | 'stable';
  volatility: number;
  demand: 'low' | 'medium' | 'high';
  supply: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface PricePoint {
  date: Date;
  price: number;
  volume: number;
  source: string;
}

export interface CardImages {
  front: string;
  back?: string;
  art?: string;
  thumbnail: string;
}

export interface CardMetadata {
  game: string;
  set: string;
  language: string;
  condition: CardCondition;
  isFoil: boolean;
  isSigned: boolean;
  isGraded: boolean;
  grade?: string;
  gradeCompany?: string;
}

export type CardCondition =
  | 'mint'
  | 'near-mint'
  | 'excellent'
  | 'good'
  | 'light-played'
  | 'played'
  | 'poor';

// 收藏相關類型
export interface Collection extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  cards: CollectionCard[];
  items: CollectionItem[]; // 添加 items 屬性
  statistics: CollectionStatistics;
  tags: string[];
}

export interface CollectionCard {
  cardId: string;
  quantity: number;
  condition: CardCondition;
  isFoil: boolean;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
  location?: string;
  isForSale: boolean;
  askingPrice?: number;
}

export interface CollectionStatistics {
  totalCards: number;
  totalValue: number;
  averageCondition: number;
  mostValuableCard?: string;
  recentAdditions: number;
  completionRate: number;
}

// 投資相關類型
export interface Investment extends BaseEntity {
  userId: string;
  cardId: string;
  type: InvestmentType;
  amount: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryValue: number; // 添加 entryValue
  profitLoss: number;
  profitLossPercentage: number;
  status: InvestmentStatus;
  notes?: string;
}

export type InvestmentType = 'buy' | 'sell' | 'hold';
export type InvestmentStatus = 'active' | 'completed' | 'cancelled';

// AI 分析相關類型
export interface AIAnalysis extends BaseEntity {
  cardId: string;
  analysisType: AnalysisType;
  confidence: number;
  results: AnalysisResult[];
  recommendations: Recommendation[];
  metadata: AnalysisMetadata;
  processingTime: number; // 添加處理時間
}

export type AnalysisType = 'authenticity' | 'condition' | 'pricing' | 'investment' | 'market';

export interface AnalysisResult {
  category: string;
  score: number;
  confidence: number;
  details: string;
  evidence: string[];
}

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

// 市場相關類型
export interface MarketDataEntity extends BaseEntity {
  cardId: string;
  price: number;
  volume: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: Date;
}

// 交易相關類型
export interface Transaction extends BaseEntity {
  userId: string;
  cardId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  metadata: TransactionMetadata;
}

export type TransactionType = 'purchase' | 'sale' | 'trade' | 'gift' | 'auction';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash';

export interface TransactionMetadata {
  platform: string;
  transactionId: string;
  notes?: string;
  shippingAddress?: Address;
  trackingNumber?: string;
}

// 地址類型
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 分頁類型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 搜索類型
export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  pagination: PaginationParams;
}

// 通知類型
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export type NotificationType =
  | 'price_alert'
  | 'market_update'
  | 'investment_advice'
  | 'system'
  | 'social';

// 設置類型
export interface AppSettings {
  theme: ThemeSettings;
  language: LanguageSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  display: DisplaySettings; // 添加顯示設置
  security: SecuritySettings; // 添加安全設置
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

export interface PerformanceSettings {
  imageQuality: 'low' | 'medium' | 'high';
  cacheEnabled: boolean;
  offlineMode: boolean;
  dataSync: boolean;
  cacheSize: number; // 添加快取大小
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

// 錯誤類型
export interface AppError {
  code: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, unknown>;
}

// 日誌類型
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, unknown>;
  stack?: string;
}

// 導航類型
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

// 組件 Props 類型
export interface BaseComponentProps {
  testID?: string;
  style?: any;
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

export interface CardProps extends BaseComponentProps {
  card: Card;
  onPress?: () => void;
  showPrice?: boolean;
  showCondition?: boolean;
  variant?: 'compact' | 'detailed' | 'grid';
}

// 工具類型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;

// Redux 狀態類型
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface CardState {
  cards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  sortOptions: CardSortOptions;
  pagination: Pagination;
  isRecognizing: boolean;
  recognizedCard: Card | null;
  recognitionResult: any | null;
  recognitionAlternatives: any[];
  recognitionFeatures: any | null;
  isAnalyzing: boolean;
  conditionAnalysis: AnalysisResult[] | null;
  authenticityCheck: AnalysisResult[] | null;
  isVerifying: boolean;
  searchResults: Card[];
  recognitionHistory: {
    card: Card;
    confidence: number;
    timestamp: string;
    processingTime: number;
  }[];
  recognitionStats: {
    totalRecognitions: number;
    averageConfidence: number;
    successRate: number;
    popularCards: { cardId: string; count: number }[];
    processingTimes: {
      average: number;
      min: number;
      max: number;
    };
  } | null;
}

export interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
  statistics: CollectionStatistics;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface MarketState {
  marketData: MarketData[] | null;
  priceHistory: PriceHistory[];
  isLoading: boolean;
  error: string | null;
  marketTrends: MarketTrend[] | null;
}

export interface InvestmentState {
  investments: Investment[];
  portfolio: Portfolio;
  isLoading: boolean;
  error: string | null;
  selectedInvestment: Investment | null;
  investmentAdvice: InvestmentAdvice | null;
  statistics: PortfolioStatistics | null;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  portfolioValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
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
  investmentReport: any | null;
  confidence: number;
  processingTime: number;
  isPredicting: boolean;
  marketInsights: any | null;
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

export interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

// 認證相關類型
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// 卡牌過濾和排序類型
export interface CardFilters {
  rarity?: CardRarity[];
  type?: CardType[];
  condition?: CardCondition[];
  priceRange?: {
    min: number;
    max: number;
  };
  setName?: string[];
  artist?: string[];
  isFoil?: boolean;
  isGraded?: boolean;
  inStock?: boolean;
  set?: string[]; // 添加 set 屬性
}

export interface CardSortOptions {
  field: 'name' | 'price' | 'rarity' | 'set' | 'condition' | 'dateAdded';
  order: 'asc' | 'desc';
  direction?: 'asc' | 'desc'; // 添加 direction 屬性
}

// 分頁類型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 會員制度類型
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

// AI 聊天類型
export interface AIChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    cardId?: string;
    analysisType?: AnalysisType;
    confidence?: number;
  };
}

// 投資建議類型
export interface InvestmentAdvice {
  cardId: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  expectedValue: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

// 投資組合類型
export interface Portfolio {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  bestPerformer?: Investment;
  worstPerformer?: Investment;
  recentTransactions: Transaction[];
  performanceHistory: PortfolioPerformance[];
}

export interface PortfolioStatistics {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  averageReturn: number;
  bestReturn: number;
  worstReturn: number;
}

export interface PortfolioPerformance {
  date: Date;
  value: number;
  profitLoss: number;
  profitLossPercentage: number;
}

// 市場趨勢類型
export interface MarketTrend {
  cardId: string;
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  volume: number;
  confidence: number;
  timeframe: string;
}

// 價格歷史類型
export interface PriceHistory {
  cardId: string;
  dates: string[];
  prices: number[];
  volumes: number[];
}

// 收藏項目類型
export interface CollectionItem {
  cardId: string;
  quantity: number;
  condition: CardCondition;
  isFoil: boolean;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
  location?: string;
  isForSale: boolean;
  askingPrice?: number;
  currentValue: number; // 添加當前價值
  addedAt: Date; // 添加添加時間
}

// 常量類型
export const CARD_RARITIES: CardRarity[] = [
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
  'promo'
];
export const CARD_TYPES: CardType[] = [
  'creature',
  'spell',
  'artifact',
  'land',
  'enchantment',
  'instant',
  'sorcery',
  'planeswalker'
];
export const CARD_CONDITIONS: CardCondition[] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'light-played',
  'played',
  'poor'
];
export const SUPPORTED_LANGUAGES = ['zh-TW', 'en-US', 'ja-JP'] as const;
export const THEME_MODES = ['light', 'dark', 'auto'] as const;

// 分享驗證相關類型
export interface ShareVerification extends BaseEntity {
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
  card: Card;
  user: {
    username: string;
    avatar?: string;
  };
  isExpired: boolean;
  isValid: boolean;
}
