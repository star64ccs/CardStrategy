// 投資建議系統Class型定義

export interface InvestmentRecommendationRequest {
  userId: string;
  userProfile: UserProfile;
  budget: number;
  timeHorizon: InvestmentTimeHorizon;
  riskTolerance: RiskTolerance;
  investmentGoals: InvestmentGoal[];
  preferences?: InvestmentPreferences;
  excludeCategories?: string[];
  marketConditions?: MarketContext;
}

export interface InvestmentRecommendationResult {
  id: string;
  userId: string;
  recommendations: CardRecommendation[];
  portfolioSuggestion: PortfolioSuggestion;
  riskAnalysis: InvestmentRiskAnalysis;
  expectedReturn: ExpectedReturn;
  reasoning: RecommendationReasoning;
  confidence: number;
  validUntil: Date;
  createdAt: Date;
  metadata: RecommendationMetadata;
}

export interface UserProfile {
  age: number;
  experience: ExperienceLevel;
  currentPortfolio: PortfolioHolding[];
  totalInvestment: number;
  monthlyIncome?: number;
  investmentKnowledge: KnowledgeLevel;
  preferredGenres: string[];
  blacklistedCards: string[];
  favoriteArtists: string[];
  collectingStyle: CollectingStyle;
}

export interface CardRecommendation {
  cardId: string;
  cardName: string;
  series: string;
  currentPrice: number;
  recommendedAction: RecommendationAction;
  priority: Priority;
  confidence: number;
  reasoning: string[];
  priceTarget: PriceTarget;
  timeframe: TimeFrame;
  riskLevel: RiskLevel;
  expectedReturn: number;
  marketAnalysis: CardMarketAnalysis;
  alternatives: AlternativeCard[];
}

export interface PortfolioSuggestion {
  totalValue: number;
  allocation: PortfolioAllocation[];
  diversification: DiversificationAnalysis;
  rebalanceRecommendations: RebalanceRecommendation[];
  cashReserve: number;
  emergencyFund: number;
}

export interface InvestmentRiskAnalysis {
  overallRisk: RiskLevel;
  portfolioRisk: RiskLevel;
  marketRisk: RiskLevel;
  liquidityRisk: RiskLevel;
  concentrationRisk: RiskLevel;
  riskFactors: string[];
  mitigation: RiskMitigation[];
  riskScore: number; // 0-100
  volatilityEstimate: number;
}

export interface ExpectedReturn {
  optimistic: number;
  realistic: number;
  pessimistic: number;
  timeWeightedReturn: number;
  annualizedReturn: number;
  riskAdjustedReturn: number;
  benchmark: BenchmarkComparison;
}

export interface RecommendationReasoning {
  primary: string[];
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  market: MarketAnalysis;
  seasonal: SeasonalAnalysis;
  sentiment: SentimentAnalysis;
}

export interface RecommendationMetadata {
  algorithm: string;
  modelVersion: string;
  dataQuality: number;
  backtestResults: BacktestResults;
  lastUpdated: Date;
  expirationReason?: string;
}

export interface PortfolioHolding {
  cardId: string;
  cardName: string;
  quantity: number;
  averageCost: number;
  currentValue: number;
  weight: number;
  category: string;
  acquiredDate: Date;
}

export interface PortfolioAllocation {
  category: string;
  percentage: number;
  value: number;
  recommendedPercentage: number;
  variance: number;
  cards: AllocationCard[];
}

export interface DiversificationAnalysis {
  score: number; // 0-100
  byCategory: CategoryDiversification[];
  bySeries: SeriesDiversification[];
  byPriceRange: PriceRangeDiversification[];
  recommendations: string[];
}

export interface RebalanceRecommendation {
  action: 'buy' | 'sell' | 'hold';
  cardId: string;
  cardName: string;
  currentWeight: number;
  targetWeight: number;
  suggestedAmount: number;
  urgency: Urgency;
  reason: string;
}

export interface RiskMitigation {
  riskType: string;
  severity: RiskLevel;
  mitigation: string[];
  cost: number;
  effectiveness: number;
}

export interface BenchmarkComparison {
  benchmarkName: string;
  benchmarkReturn: number;
  outperformance: number;
  correlation: number;
  beta: number;
  alpha: number;
}

export interface TechnicalAnalysis {
  trend: TrendDirection;
  support: number[];
  resistance: number[];
  momentum: MomentumIndicator[];
  signals: TechnicalSignal[];
}

export interface FundamentalAnalysis {
  cardRarity: string;
  printRun: number;
  artistPopularity: number;
  gameRelevance: number;
  historicalAppreciation: number;
  comparables: ComparableCard[];
}

export interface MarketAnalysis {
  supply: number;
  demand: number;
  liquidityLevel: number;
  priceStability: number;
  marketCap: number;
  tradingVolume: number;
}

export interface SeasonalAnalysis {
  currentSeason: string;
  seasonalTrend: TrendDirection;
  historicalPatterns: SeasonalPattern[];
  nextEventImpact: EventImpact;
}

export interface SentimentAnalysis {
  overallSentiment: Sentiment;
  socialMediaMention: number;
  communityRating: number;
  expertOpinions: ExpertOpinion[];
  newsImpact: NewsImpact[];
}

export interface BacktestResults {
  period: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  averageHoldingPeriod: number;
}

export interface PriceTarget {
  target: number;
  timeframe: TimeFrame;
  probability: number;
  upside: number;
  downside: number;
}

export interface AlternativeCard {
  cardId: string;
  cardName: string;
  similarity: number;
  reason: string;
  currentPrice: number;
  expectedReturn: number;
}

export interface CardMarketAnalysis {
  marketTrend: TrendDirection;
  priceHistory: PriceHistoryPoint[];
  volumeAnalysis: VolumeAnalysis;
  competitivePosition: string;
  marketShare: number;
}

export interface AllocationCard {
  cardId: string;
  cardName: string;
  weight: number;
  value: number;
  recommendation: RecommendationAction;
}

export interface CategoryDiversification {
  category: string;
  percentage: number;
  recommendation: string;
  score: number;
}

export interface SeriesDiversification {
  series: string;
  percentage: number;
  recommendation: string;
  score: number;
}

export interface PriceRangeDiversification {
  range: string;
  percentage: number;
  recommendation: string;
  score: number;
}

export interface MomentumIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
}

export interface TechnicalSignal {
  name: string;
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  description: string;
}

export interface ComparableCard {
  cardId: string;
  cardName: string;
  similarity: number;
  currentPrice: number;
  performance: number;
}

export interface SeasonalPattern {
  season: string;
  averageReturn: number;
  volatility: number;
  probability: number;
}

export interface EventImpact {
  event: string;
  date: Date;
  expectedImpact: number;
  probability: number;
  description: string;
}

export interface ExpertOpinion {
  expert: string;
  rating: number;
  recommendation: RecommendationAction;
  confidence: number;
  summary: string;
  date: Date;
}

export interface NewsImpact {
  headline: string;
  sentiment: Sentiment;
  impact: number;
  source: string;
  date: Date;
}

export interface PriceHistoryPoint {
  date: Date;
  price: number;
  volume: number;
}

export interface VolumeAnalysis {
  averageVolume: number;
  volumeTrend: TrendDirection;
  liquidityScore: number;
  marketDepth: number;
}

export interface InvestmentPreferences {
  maxSingleCardPercentage: number;
  preferredPriceRange: PriceRange;
  autoRebalance: boolean;
  sociallyResponsible: boolean;
  includeInternational: boolean;
  minimumLiquidity: number;
  excludeSpeculative: boolean;
}

export interface MarketContext {
  marketPhase: MarketPhase;
  volatilityIndex: number;
  economicIndicators: EconomicIndicator[];
  seasonalFactors: SeasonalFactor[];
  upcomingEvents: UpcomingEvent[];
}

export interface EconomicIndicator {
  name: string;
  value: number;
  trend: TrendDirection;
  impact: number;
}

export interface SeasonalFactor {
  factor: string;
  strength: number;
  duration: string;
  impact: number;
}

export interface UpcomingEvent {
  event: string;
  date: Date;
  type: EventType;
  expectedImpact: number;
  affectedCategories: string[];
}

export interface RecommendationStats {
  totalRecommendations: number;
  successRate: number;
  averageReturn: number;
  bestPerforming: CardRecommendation;
  worstPerforming: CardRecommendation;
  userSatisfaction: number;
  conversionRate: number;
  portfolioImprovement: number;
}

export interface RecommendationHistory {
  userId: string;
  recommendations: InvestmentRecommendationResult[];
  performance: PerformanceMetrics;
  preferences: UserPreferences;
  learnings: UserLearning[];
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

export interface UserPreferences {
  preferredActions: RecommendationAction[];
  riskAversion: number;
  responseRate: number;
  feedback: UserFeedback[];
}

export interface UserLearning {
  insight: string;
  confidence: number;
  validatedCount: number;
  lastValidated: Date;
}

export interface UserFeedback {
  recommendationId: string;
  rating: number;
  helpful: boolean;
  comment?: string;
  actionTaken: boolean;
  outcome?: string;
  date: Date;
}

export interface RecommendationError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export interface RecommendationState {
  currentRecommendation: InvestmentRecommendationResult | null;
  recommendationHistory: RecommendationHistory | null;
  recommendationStats: RecommendationStats | null;
  loading: boolean;
  error: RecommendationError | null;
  userProfile: UserProfile | null;
}

// 枚舉Class型
export enum InvestmentTimeHorizon {
  SHORT_TERM = 'short_term', // 1-6 months
  MEDIUM_TERM = 'medium_term', // 6-18 months
  LONG_TERM = 'long_term', // 1.5-5 years
  VERY_LONG_TERM = 'very_long_term', // 5+ years
}

export enum RiskTolerance {
  VERY_CONSERVATIVE = 'very_conservative',
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  VERY_AGGRESSIVE = 'very_aggressive',
}

export enum InvestmentGoal {
  CAPITAL_APPRECIATION = 'capital_appreciation',
  INCOME_GENERATION = 'income_generation',
  CAPITAL_PRESERVATION = 'capital_preservation',
  SPECULATION = 'speculation',
  COLLECTION_COMPLETION = 'collection_completion',
  PORTFOLIO_DIVERSIFICATION = 'portfolio_diversification',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum KnowledgeLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum CollectingStyle {
  COMPLETIONIST = 'completionist',
  INVESTOR = 'investor',
  CASUAL = 'casual',
  SPECULATOR = 'speculator',
  ARTIST_FOCUSED = 'artist_focused',
  META_FOCUSED = 'meta_focused',
}

export enum RecommendationAction {
  STRONG_BUY = 'strong_buy',
  BUY = 'buy',
  HOLD = 'hold',
  SELL = 'sell',
  STRONG_SELL = 'strong_sell',
  AVOID = 'avoid',
}

export enum Priority {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum TimeFrame {
  IMMEDIATE = 'immediate', // 1-7 days
  SHORT = 'short', // 1-4 weeks
  MEDIUM = 'medium', // 1-6 months
  LONG = 'long', // 6-18 months
  VERY_LONG = 'very_long', // 18+ months
}

export enum TrendDirection {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  SIDEWAYS = 'sideways',
  VOLATILE = 'volatile',
}

export enum Urgency {
  IMMEDIATE = 'immediate',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum Sentiment {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative',
}

export enum MarketPhase {
  BULL_MARKET = 'bull_market',
  BEAR_MARKET = 'bear_market',
  SIDEWAYS_MARKET = 'sideways_market',
  VOLATILE_MARKET = 'volatile_market',
  RECOVERY = 'recovery',
  DECLINE = 'decline',
}

export enum EventType {
  PRODUCT_RELEASE = 'product_release',
  TOURNAMENT = 'tournament',
  BAN_ANNOUNCEMENT = 'ban_announcement',
  REPRINT = 'reprint',
  ROTATION = 'rotation',
  ECONOMIC = 'economic',
  REGULATORY = 'regulatory',
}

export interface PriceRange {
  min: number;
  max: number;
}

// Constant定義
export const _RECOMMENDATION_CONSTANTS = {
  DEFAULT_BUDGET: 1000,
  MIN_BUDGET: 100,
  MAX_BUDGET: 1000000,
  DEFAULT_RISK_TOLERANCE: RiskTolerance.MODERATE,
  DEFAULT_TIME_HORIZON: InvestmentTimeHorizon.MEDIUM_TERM,
  MAX_RECOMMENDATIONS_PER_REQUEST: 20,
  MIN_CONFIDENCE_LEVEL: 0.5,
  DEFAULT_CONFIDENCE_LEVEL: 0.7,
  RECOMMENDATION_EXPIRY_DAYS: 7,
  MAX_PORTFOLIO_HOLDINGS: 50,
  MIN_DIVERSIFICATION_SCORE: 60,
  TARGET_DIVERSIFICATION_SCORE: 80,
  MAX_SINGLE_CARD_PERCENTAGE: 0.2, // 20%
  EMERGENCY_FUND_PERCENTAGE: 0.1, // 10%
  CASH_RESERVE_PERCENTAGE: 0.05, // 5%
} as const;

export type RecommendationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';
