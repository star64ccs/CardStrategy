// 台灣公平交易法類型定義
// Taiwan Fair Trade Act Type Definitions

export interface TaiwanFairTradePractice {
  id: string;
  practiceType: TaiwanFairTradePracticeType;
  description: string;
  applicableBusinesses: string[];
  marketImpact: TaiwanMarketImpact;
  consumerBenefit: boolean;
  competitionEffect: TaiwanCompetitionEffect;
  enforcementMechanism: TaiwanEnforcementMechanism;
  penaltyRange: TaiwanPenaltyRange;
  complianceRequirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanFairTradePracticeType {
  MONOPOLY = 'monopoly',
  MERGER = 'merger',
  CARTEL = 'cartel',
  UNFAIR_COMPETITION = 'unfair_competition',
  FALSE_ADVERTISING = 'false_advertising',
  TRADE_SECRET = 'trade_secret',
  PRICE_FIXING = 'price_fixing',
  MARKET_DIVISION = 'market_division',
  BID_RIGGING = 'bid_rigging',
  TYING_ARRANGEMENT = 'tying_arrangement',
  EXCLUSIVE_DEALING = 'exclusive_dealing',
  RESALE_PRICE_MAINTENANCE = 'resale_price_maintenance',
  OTHER = 'other',
}

export enum TaiwanMarketImpact {
  NEGLIGIBLE = 'negligible',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe',
}

export enum TaiwanCompetitionEffect {
  PRO_COMPETITIVE = 'pro_competitive',
  NEUTRAL = 'neutral',
  ANTI_COMPETITIVE = 'anti_competitive',
}

export enum TaiwanEnforcementMechanism {
  ADMINISTRATIVE = 'administrative',
  CIVIL = 'civil',
  CRIMINAL = 'criminal',
  COMPOSITE = 'composite',
}

export enum TaiwanPenaltyRange {
  WARNING = 'warning',
  FINE_UNDER_100K = 'fine_under_100k',
  FINE_100K_TO_1M = 'fine_100k_to_1m',
  FINE_1M_TO_10M = 'fine_1m_to_10m',
  FINE_OVER_10M = 'fine_over_10m',
  CRIMINAL_PENALTY = 'criminal_penalty',
}

export interface TaiwanMergerControl {
  id: string;
  mergerType: TaiwanMergerType;
  parties: string[];
  marketShare: number; // 百分比
  marketDefinition: string;
  competitiveAnalysis: TaiwanCompetitiveAnalysis;
  efficiencyGains: string[];
  antiCompetitiveEffects: string[];
  remedies: TaiwanMergerRemedy[];
  approvalStatus: TaiwanApprovalStatus;
  conditions: string[];
  reviewPeriod: number; // 天數
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanMergerType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CONGLOMERATE = 'conglomerate',
  JOINT_VENTURE = 'joint_venture',
}

export interface TaiwanCompetitiveAnalysis {
  marketConcentration: TaiwanMarketConcentration;
  entryBarriers: string[];
  buyerPower: TaiwanBuyerPower;
  efficiencyDefense: string[];
  failingFirmDefense: boolean;
  analysis: string;
}

export enum TaiwanMarketConcentration {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum TaiwanBuyerPower {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

export interface TaiwanMergerRemedy {
  id: string;
  remedyType: TaiwanRemedyType;
  description: string;
  implementationPeriod: number; // 天數
  monitoringRequired: boolean;
  effectiveness: TaiwanRemedyEffectiveness;
  createdAt: Date;
}

export enum TaiwanRemedyType {
  STRUCTURAL = 'structural',
  BEHAVIORAL = 'behavioral',
  COMPOSITE = 'composite',
}

export enum TaiwanRemedyEffectiveness {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown',
}

export enum TaiwanApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  APPROVED_WITH_CONDITIONS = 'approved_with_conditions',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface TaiwanUnfairCompetition {
  id: string;
  competitionType: TaiwanUnfairCompetitionType;
  description: string;
  affectedParties: string[];
  marketEffect: TaiwanMarketEffect;
  evidence: TaiwanEvidence[];
  damages: TaiwanDamage[];
  ceaseAndDesist: boolean;
  compensation: boolean;
  penalty: TaiwanPenalty;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanUnfairCompetitionType {
  TRADE_SECRET_MISAPPROPRIATION = 'trade_secret_misappropriation',
  FALSE_ADVERTISING = 'false_advertising',
  COMMERCIAL_DISPARAGEMENT = 'commercial_disparagement',
  PASSING_OFF = 'passing_off',
  CYBERSQUATTING = 'cybersquatting',
  UNFAIR_CONTRACT_TERMS = 'unfair_contract_terms',
  PREDATORY_PRICING = 'predatory_pricing',
  OTHER = 'other',
}

export enum TaiwanMarketEffect {
  NEGLIGIBLE = 'negligible',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe',
}

export interface TaiwanEvidence {
  id: string;
  evidenceType: TaiwanEvidenceType;
  description: string;
  source: string;
  reliability: TaiwanEvidenceReliability;
  relevance: TaiwanEvidenceRelevance;
  createdAt: Date;
}

export enum TaiwanEvidenceType {
  DOCUMENTARY = 'documentary',
  ELECTRONIC = 'electronic',
  WITNESS = 'witness',
  EXPERT = 'expert',
  PHYSICAL = 'physical',
  OTHER = 'other',
}

export enum TaiwanEvidenceReliability {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown',
}

export enum TaiwanEvidenceRelevance {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  IRRELEVANT = 'irrelevant',
}

export interface TaiwanDamage {
  id: string;
  damageType: TaiwanDamageType;
  description: string;
  amount: number;
  currency: string;
  calculation: string;
  evidence: string[];
  createdAt: Date;
}

export enum TaiwanDamageType {
  ACTUAL_LOSS = 'actual_loss',
  LOST_PROFITS = 'lost_profits',
  REPUTATIONAL = 'reputational',
  PUNITIVE = 'punitive',
  OTHER = 'other',
}

export interface TaiwanPenalty {
  id: string;
  penaltyType: TaiwanPenaltyType;
  amount: number;
  currency: string;
  basis: string;
  aggravatingFactors: string[];
  mitigatingFactors: string[];
  createdAt: Date;
}

export enum TaiwanPenaltyType {
  ADMINISTRATIVE_FINE = 'administrative_fine',
  CRIMINAL_FINE = 'criminal_fine',
  IMPRISONMENT = 'imprisonment',
  SUSPENSION = 'suspension',
  REVOCATION = 'revocation',
  OTHER = 'other',
}

export interface TaiwanFairTradeComplianceResult {
  id: string;
  practiceId: string;
  complianceStatus: TaiwanComplianceStatus;
  violations: TaiwanFairTradeViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanFairTradeViolation {
  id: string;
  practiceId: string;
  violationType: TaiwanFairTradeViolationType;
  description: string;
  severity: TaiwanViolationSeverity;
  evidence: string[];
  penalty: TaiwanPenalty;
  rectificationRequired: boolean;
  rectificationDeadline?: Date;
  status: TaiwanViolationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanFairTradeViolationType {
  MONOPOLY_ABUSE = 'monopoly_abuse',
  CARTEL_ACTIVITY = 'cartel_activity',
  UNFAIR_COMPETITION = 'unfair_competition',
  FALSE_ADVERTISING = 'false_advertising',
  TRADE_SECRET_VIOLATION = 'trade_secret_violation',
  MERGER_VIOLATION = 'merger_violation',
  PRICE_FIXING = 'price_fixing',
  MARKET_DIVISION = 'market_division',
  BID_RIGGING = 'bid_rigging',
  TYING_ARRANGEMENT = 'tying_arrangement',
  EXCLUSIVE_DEALING = 'exclusive_dealing',
  RESALE_PRICE_MAINTENANCE = 'resale_price_maintenance',
  OTHER = 'other',
}

export enum TaiwanViolationSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SERIOUS = 'serious',
  CRITICAL = 'critical',
}

export enum TaiwanViolationStatus {
  PENDING = 'pending',
  UNDER_INVESTIGATION = 'under_investigation',
  CONFIRMED = 'confirmed',
  RECTIFIED = 'rectified',
  CLOSED = 'closed',
}

export enum TaiwanComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
}

export enum TaiwanRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface TaiwanAuditTrail {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  details: unknown;
  ipAddress?: string;
  userAgent?: string;
}
