import { z } from 'zod';
import {
  CardRarity,
  CardType,
  CardCondition,
  InvestmentType,
  InvestmentStatus,
  AnalysisType,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  NotificationType,
  MembershipTier
} from '../types';

// 基礎驗證模式
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// 用戶相關驗證模式
export const UserPreferencesSchema = z.object({
  language: z.enum(['zh-TW', 'en-US', 'ja-JP']),
  theme: z.enum(['light', 'dark', 'auto']),
  notifications: z.object({
    pushEnabled: z.boolean(),
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    marketAlerts: z.boolean(),
    priceAlerts: z.boolean(),
    newsAlerts: z.boolean(),
    socialAlerts: z.boolean()
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']),
    collectionVisibility: z.enum(['public', 'private', 'friends']),
    activityVisibility: z.enum(['public', 'private', 'friends']),
    dataSharing: z.boolean(),
    analyticsEnabled: z.boolean()
  }),
  accessibility: z.object({
    fontSize: z.enum(['small', 'medium', 'large']),
    highContrast: z.boolean(),
    screenReader: z.boolean(),
    reducedMotion: z.boolean(),
    colorBlindness: z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia'])
  })
});

export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email('無效的電子郵件格式'),
  username: z.string().min(3, '用戶名至少需要 3 個字元').max(20, '用戶名不能超過 20 個字元'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  isVerified: z.boolean(),
  isPremium: z.boolean(),
  preferences: UserPreferencesSchema,
  statistics: z.object({
    totalCards: z.number().int().min(0),
    totalValue: z.number().min(0),
    totalInvestments: z.number().int().min(0),
    totalTrades: z.number().int().min(0),
    joinDate: z.date(),
    lastActive: z.date()
  })
});

// 認證相關驗證模式
export const LoginRequestSchema = z.object({
  email: z.string().email('無效的電子郵件格式'),
  password: z.string().min(8, '密碼至少需要 8 個字元'),
  rememberMe: z.boolean().optional()
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('無效的電子郵件格式'),
  username: z.string().min(3, '用戶名至少需要 3 個字元').max(20, '用戶名不能超過 20 個字元'),
  password: z.string().min(8, '密碼至少需要 8 個字元'),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, '必須接受條款和條件')
}).refine(data => data.password === data.confirmPassword, {
  message: '密碼確認不匹配',
  path: ['confirmPassword']
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive()
});

// 卡牌相關驗證模式
export const CardAttributesSchema = z.object({
  manaCost: z.string().optional(),
  power: z.number().int().min(0).optional(),
  toughness: z.number().int().min(0).optional(),
  loyalty: z.number().int().min(0).optional(),
  text: z.string().optional(),
  flavorText: z.string().optional(),
  artist: z.string().optional(),
  collectorNumber: z.string().optional()
});

export const MarketDataSchema = z.object({
  currentPrice: z.number().min(0),
  priceHistory: z.array(z.object({
    date: z.date(),
    price: z.number().min(0),
    volume: z.number().min(0),
    source: z.string()
  })),
  marketTrend: z.enum(['rising', 'falling', 'stable']),
  volatility: z.number().min(0).max(1),
  demand: z.enum(['low', 'medium', 'high']),
  supply: z.enum(['low', 'medium', 'high']),
  lastUpdated: z.date()
});

export const CardImagesSchema = z.object({
  front: z.string().url(),
  back: z.string().url().optional(),
  art: z.string().url().optional(),
  thumbnail: z.string().url()
});

export const CardMetadataSchema = z.object({
  game: z.string(),
  set: z.string(),
  language: z.string(),
  condition: z.enum(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']),
  isFoil: z.boolean(),
  isSigned: z.boolean(),
  isGraded: z.boolean(),
  grade: z.string().optional(),
  gradeCompany: z.string().optional()
});

export const CardSchema = BaseEntitySchema.extend({
  name: z.string().min(1, '卡牌名稱不能為空').max(100, '卡牌名稱不能超過 100 個字元'),
  setName: z.string().min(1, '系列名稱不能為空').max(50, '系列名稱不能超過 50 個字元'),
  cardNumber: z.string().min(1, '卡牌編號不能為空'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'mythic', 'special', 'promo']),
  type: z.enum(['creature', 'spell', 'artifact', 'land', 'enchantment', 'instant', 'sorcery', 'planeswalker']),
  attributes: CardAttributesSchema,
  marketData: MarketDataSchema,
  images: CardImagesSchema,
  metadata: CardMetadataSchema,
  conditionAnalysis: z.array(z.object({
    category: z.string(),
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    details: z.string(),
    evidence: z.array(z.string())
  })).optional(),
  authenticityCheck: z.array(z.object({
    category: z.string(),
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    details: z.string(),
    evidence: z.array(z.string())
  })).optional(),
  price: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional(),
  priceChange: z.number().optional(),
  condition: z.enum(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']).optional(),
  set: z.string().optional(),
  isFavorite: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().max(500, '描述不能超過 500 個字元').optional()
});

// 收藏相關驗證模式
export const CollectionCardSchema = z.object({
  cardId: z.string().uuid(),
  quantity: z.number().int().positive('數量必須大於 0'),
  condition: z.enum(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']),
  isFoil: z.boolean(),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  isForSale: z.boolean(),
  askingPrice: z.number().min(0).optional()
});

export const CollectionStatisticsSchema = z.object({
  totalCards: z.number().int().min(0),
  totalValue: z.number().min(0),
  averageCondition: z.number().min(0).max(100),
  mostValuableCard: z.string().uuid().optional(),
  recentAdditions: z.number().int().min(0),
  completionRate: z.number().min(0).max(100)
});

export const CollectionSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  name: z.string().min(1, '收藏名稱不能為空').max(100, '收藏名稱不能超過 100 個字元'),
  description: z.string().max(500).optional(),
  isPublic: z.boolean(),
  cards: z.array(CollectionCardSchema),
  items: z.array(CollectionCardSchema),
  statistics: CollectionStatisticsSchema,
  tags: z.array(z.string().max(20))
});

// 投資相關驗證模式
export const InvestmentSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  type: z.enum(['buy', 'sell', 'hold']),
  amount: z.number().positive('投資金額必須大於 0'),
  quantity: z.number().int().positive('數量必須大於 0'),
  entryPrice: z.number().positive('入場價格必須大於 0'),
  currentPrice: z.number().min(0),
  entryValue: z.number().positive('入場價值必須大於 0'),
  profitLoss: z.number(),
  profitLossPercentage: z.number(),
  status: z.enum(['active', 'completed', 'cancelled']),
  notes: z.string().max(500).optional()
});

// AI 分析相關驗證模式
export const AnalysisResultSchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  details: z.string(),
  evidence: z.array(z.string())
});

export const RecommendationSchema = z.object({
  type: z.enum(['buy', 'sell', 'hold', 'grade', 'authenticate']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  expectedValue: z.number().min(0).optional(),
  timeframe: z.string().optional()
});

export const AnalysisMetadataSchema = z.object({
  modelVersion: z.string(),
  processingTime: z.number().positive(),
  imageQuality: z.number().min(0).max(100),
  analysisDate: z.date()
});

export const AIAnalysisSchema = BaseEntitySchema.extend({
  cardId: z.string().uuid(),
  analysisType: z.enum(['authenticity', 'condition', 'pricing', 'investment', 'market']),
  confidence: z.number().min(0).max(1),
  results: z.array(AnalysisResultSchema),
  recommendations: z.array(RecommendationSchema),
  metadata: AnalysisMetadataSchema,
  processingTime: z.number().positive()
});

// 市場相關驗證模式
export const MarketDataEntitySchema = BaseEntitySchema.extend({
  cardId: z.string().uuid(),
  price: z.number().min(0),
  volume: z.number().min(0),
  change24h: z.number(),
  change7d: z.number(),
  change30d: z.number(),
  marketCap: z.number().min(0),
  circulatingSupply: z.number().min(0),
  totalSupply: z.number().min(0),
  lastUpdated: z.date()
});

// 交易相關驗證模式
export const AddressSchema = z.object({
  street: z.string().min(1, '街道地址不能為空'),
  city: z.string().min(1, '城市不能為空'),
  state: z.string().min(1, '州/省不能為空'),
  postalCode: z.string().min(1, '郵遞區號不能為空'),
  country: z.string().min(1, '國家不能為空')
});

export const TransactionMetadataSchema = z.object({
  platform: z.string(),
  transactionId: z.string(),
  notes: z.string().max(500).optional(),
  shippingAddress: AddressSchema.optional(),
  trackingNumber: z.string().optional()
});

export const TransactionSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  type: z.enum(['purchase', 'sale', 'trade', 'gift', 'auction']),
  quantity: z.number().int().positive('數量必須大於 0'),
  price: z.number().positive('價格必須大於 0'),
  totalAmount: z.number().positive('總金額必須大於 0'),
  fees: z.number().min(0),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer', 'crypto', 'cash']),
  metadata: TransactionMetadataSchema
});

// API 響應驗證模式
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional()
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    message: z.string().optional(),
    timestamp: z.date()
  });

// 分頁相關驗證模式
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1, '頁碼必須大於 0'),
  limit: z.number().int().min(1, '每頁數量必須大於 0').max(100, '每頁數量不能超過 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    })
  });

// 搜索相關驗證模式
export const SearchParamsSchema = z.object({
  query: z.string().min(1, '搜索查詢不能為空'),
  filters: z.record(z.unknown()).optional(),
  pagination: PaginationParamsSchema
});

// 通知相關驗證模式
export const NotificationSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  type: z.enum(['price_alert', 'market_update', 'investment_advice', 'system', 'social']),
  title: z.string().min(1, '標題不能為空').max(100, '標題不能超過 100 個字元'),
  message: z.string().min(1, '消息不能為空').max(500, '消息不能超過 500 個字元'),
  data: z.record(z.unknown()).optional(),
  isRead: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  expiresAt: z.date().optional()
});

// 設置相關驗證模式
export const ThemeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, '無效的主色調格式'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, '無效的強調色格式'),
  customColors: z.record(z.string()).optional()
});

export const LanguageSettingsSchema = z.object({
  current: z.string(),
  available: z.array(z.string()),
  fallback: z.string()
});

export const PerformanceSettingsSchema = z.object({
  imageQuality: z.enum(['low', 'medium', 'high']),
  cacheEnabled: z.boolean(),
  offlineMode: z.boolean(),
  dataSync: z.boolean(),
  cacheSize: z.number().int().min(0)
});

export const DisplaySettingsSchema = z.object({
  currency: z.string().length(3, '貨幣代碼必須為 3 個字元'),
  dateFormat: z.string(),
  numberFormat: z.string(),
  timezone: z.string()
});

export const SecuritySettingsSchema = z.object({
  sessionTimeout: z.number().int().min(300, '會話超時時間至少為 5 分鐘').max(86400, '會話超時時間不能超過 24 小時'),
  requireBiometric: z.boolean(),
  autoLock: z.boolean(),
  encryptionLevel: z.enum(['low', 'medium', 'high'])
});

export const AppSettingsSchema = z.object({
  theme: ThemeSettingsSchema,
  language: LanguageSettingsSchema,
  notifications: UserPreferencesSchema.shape.notifications,
  privacy: UserPreferencesSchema.shape.privacy,
  accessibility: UserPreferencesSchema.shape.accessibility,
  performance: PerformanceSettingsSchema,
  display: DisplaySettingsSchema,
  security: SecuritySettingsSchema
});

// 會員制度相關驗證模式
export const TrialStatusSchema = z.object({
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  daysRemaining: z.number().int().min(0)
});

export const MembershipUsageSchema = z.object({
  cardRecognition: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(0)
  }),
  conditionAnalysis: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(0)
  }),
  authenticityCheck: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(0)
  }),
  pricePrediction: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(0)
  }),
  aiChat: z.object({
    used: z.number().int().min(0),
    limit: z.number().int().min(0)
  })
});

export const MembershipLimitsSchema = z.object({
  cardRecognition: z.number().int().min(0),
  conditionAnalysis: z.number().int().min(0),
  authenticityCheck: z.number().int().min(0),
  pricePrediction: z.number().int().min(0),
  aiChat: z.number().int().min(0)
});

export const MembershipFeaturesSchema = z.object({
  cardRecognition: z.boolean(),
  conditionAnalysis: z.boolean(),
  authenticityCheck: z.boolean(),
  pricePrediction: z.boolean(),
  aiChat: z.boolean(),
  advancedAnalytics: z.boolean(),
  prioritySupport: z.boolean(),
  exclusiveContent: z.boolean()
});

export const MembershipStatusSchema = z.object({
  tier: z.enum(['free', 'trial', 'vip']),
  isActive: z.boolean(),
  endDate: z.string().nullable(),
  daysRemaining: z.number().int().min(0),
  usage: MembershipUsageSchema,
  limits: MembershipLimitsSchema,
  features: MembershipFeaturesSchema,
  isTrialActive: z.boolean(),
  trialEndDate: z.string().nullable(),
  membershipEndDate: z.string().nullable()
});

// 卡牌過濾和排序驗證模式
export const CardFiltersSchema = z.object({
  rarity: z.array(z.enum(['common', 'uncommon', 'rare', 'mythic', 'special', 'promo'])).optional(),
  type: z.array(z.enum(['creature', 'spell', 'artifact', 'land', 'enchantment', 'instant', 'sorcery', 'planeswalker'])).optional(),
  condition: z.array(z.enum(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor'])).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.max >= data.min, {
    message: '最大價格必須大於或等於最小價格',
    path: ['max']
  }).optional(),
  setName: z.array(z.string()).optional(),
  artist: z.array(z.string()).optional(),
  isFoil: z.boolean().optional(),
  isGraded: z.boolean().optional(),
  inStock: z.boolean().optional(),
  set: z.array(z.string()).optional()
});

export const CardSortOptionsSchema = z.object({
  field: z.enum(['name', 'price', 'rarity', 'set', 'condition', 'dateAdded']),
  order: z.enum(['asc', 'desc']),
  direction: z.enum(['asc', 'desc']).optional()
});

// 投資組合相關驗證模式
export const PortfolioPerformanceSchema = z.object({
  date: z.date(),
  value: z.number().min(0),
  profitLoss: z.number(),
  profitLossPercentage: z.number()
});

export const PortfolioSchema = z.object({
  totalValue: z.number().min(0),
  totalProfitLoss: z.number(),
  totalProfitLossPercentage: z.number(),
  bestPerformer: InvestmentSchema.optional(),
  worstPerformer: InvestmentSchema.optional(),
  recentTransactions: z.array(TransactionSchema),
  performanceHistory: z.array(PortfolioPerformanceSchema)
});

export const PortfolioStatisticsSchema = z.object({
  totalInvestments: z.number().int().min(0),
  activeInvestments: z.number().int().min(0),
  completedInvestments: z.number().int().min(0),
  averageReturn: z.number(),
  bestReturn: z.number(),
  worstReturn: z.number()
});

// 市場趨勢相關驗證模式
export const MarketTrendSchema = z.object({
  cardId: z.string().uuid(),
  trend: z.enum(['rising', 'falling', 'stable']),
  changePercentage: z.number(),
  volume: z.number().min(0),
  confidence: z.number().min(0).max(1),
  timeframe: z.string()
});

export const PriceHistorySchema = z.object({
  cardId: z.string().uuid(),
  dates: z.array(z.string()),
  prices: z.array(z.number().min(0)),
  volumes: z.array(z.number().min(0))
});

// 收藏項目相關驗證模式
export const CollectionItemSchema = z.object({
  cardId: z.string().uuid(),
  quantity: z.number().int().positive('數量必須大於 0'),
  condition: z.enum(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']),
  isFoil: z.boolean(),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  isForSale: z.boolean(),
  askingPrice: z.number().min(0).optional(),
  currentValue: z.number().min(0),
  addedAt: z.date()
});

// 導出所有驗證模式
export const ValidationSchemas = {
  // 基礎模式
  BaseEntity: BaseEntitySchema,

  // 用戶相關
  User: UserSchema,
  UserPreferences: UserPreferencesSchema,
  LoginRequest: LoginRequestSchema,
  RegisterRequest: RegisterRequestSchema,
  AuthResponse: AuthResponseSchema,

  // 卡牌相關
  Card: CardSchema,
  CardAttributes: CardAttributesSchema,
  MarketData: MarketDataSchema,
  CardImages: CardImagesSchema,
  CardMetadata: CardMetadataSchema,

  // 收藏相關
  Collection: CollectionSchema,
  CollectionCard: CollectionCardSchema,
  CollectionStatistics: CollectionStatisticsSchema,
  CollectionItem: CollectionItemSchema,

  // 投資相關
  Investment: InvestmentSchema,

  // AI 分析相關
  AIAnalysis: AIAnalysisSchema,
  AnalysisResult: AnalysisResultSchema,
  Recommendation: RecommendationSchema,
  AnalysisMetadata: AnalysisMetadataSchema,

  // 市場相關
  MarketDataEntity: MarketDataEntitySchema,

  // 交易相關
  Transaction: TransactionSchema,
  Address: AddressSchema,
  TransactionMetadata: TransactionMetadataSchema,

  // API 響應
  ApiError: ApiErrorSchema,
  ApiResponse: ApiResponseSchema,

  // 分頁相關
  PaginationParams: PaginationParamsSchema,
  PaginatedResponse: PaginatedResponseSchema,

  // 搜索相關
  SearchParams: SearchParamsSchema,

  // 通知相關
  Notification: NotificationSchema,

  // 設置相關
  AppSettings: AppSettingsSchema,
  ThemeSettings: ThemeSettingsSchema,
  LanguageSettings: LanguageSettingsSchema,
  PerformanceSettings: PerformanceSettingsSchema,
  DisplaySettings: DisplaySettingsSchema,
  SecuritySettings: SecuritySettingsSchema,

  // 會員制度相關
  MembershipStatus: MembershipStatusSchema,
  TrialStatus: TrialStatusSchema,
  MembershipUsage: MembershipUsageSchema,
  MembershipLimits: MembershipLimitsSchema,
  MembershipFeatures: MembershipFeaturesSchema,

  // 卡牌過濾和排序
  CardFilters: CardFiltersSchema,
  CardSortOptions: CardSortOptionsSchema,

  // 投資組合相關
  Portfolio: PortfolioSchema,
  PortfolioStatistics: PortfolioStatisticsSchema,

  // 市場趨勢相關
  MarketTrend: MarketTrendSchema,
  PriceHistory: PriceHistorySchema
};

// 導出類型
export type ValidationSchemasType = typeof ValidationSchemas;
