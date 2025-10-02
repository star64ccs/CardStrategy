/**
 * 假卡回報系統類型定義
 */

export interface FakeCardReport {
  id: string;
  userId: string;
  cardId?: string;
  reportType: FakeCardReportType;
  severity: FakeCardSeverity;
  description: string;
  evidence: FakeCardEvidence[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  sellerInfo?: SellerInfo;
  purchaseInfo?: PurchaseInfo;
  status: FakeCardReportStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: FakeCardResolution;
}

export enum FakeCardReportType {
  COUNTERFEIT = 'counterfeit',
  REPRODUCTION = 'reproduction',
  ALTERED = 'altered',
  MISREPRESENTED = 'misrepresented',
  STOLEN = 'stolen',
  OTHER = 'other',
}

export enum FakeCardSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum FakeCardReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export interface FakeCardEvidence {
  id: string;
  type: EvidenceType;
  url?: string;
  description: string;
  uploadedAt: Date;
  verified?: boolean;
  verificationScore?: number;
}

export enum EvidenceType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  RECEIPT = 'receipt',
  COMPARISON = 'comparison',
  EXPERT_OPINION = 'expert_opinion',
}

export interface SellerInfo {
  name?: string;
  platform?: string;
  sellerId?: string;
  contactInfo?: string;
  rating?: number;
  history?: string[];
}

export interface PurchaseInfo {
  purchaseDate?: Date;
  price?: number;
  currency?: string;
  paymentMethod?: string;
  platform?: string;
  transactionId?: string;
}

export interface FakeCardResolution {
  action: ResolutionAction;
  reason: string;
  evidence?: string[];
  followUpRequired?: boolean;
  followUpDate?: Date;
  notifiedParties?: string[];
}

export enum ResolutionAction {
  WARNING_ISSUED = 'warning_issued',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_BANNED = 'account_banned',
  REFUND_PROCESSED = 'refund_processed',
  LEGAL_ACTION = 'legal_action',
  EDUCATIONAL_OUTREACH = 'educational_outreach',
  NO_ACTION = 'no_action',
}

export interface FakeCardWarning {
  id: string;
  userId: string;
  sellerId?: string;
  cardId?: string;
  warningType: WarningType;
  message: string;
  severity: FakeCardSeverity;
  issuedAt: Date;
  expiresAt?: Date;
  acknowledgedAt?: Date;
  actions: WarningAction[];
}

export enum WarningType {
  SELLER_WARNING = 'seller_warning',
  BUYER_WARNING = 'buyer_warning',
  PLATFORM_WARNING = 'platform_warning',
  COMMUNITY_WARNING = 'community_warning',
}

export interface WarningAction {
  type: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface BlacklistEntry {
  id: string;
  entityType: BlacklistEntityType;
  entityId: string;
  entityName: string;
  reason: string;
  severity: FakeCardSeverity;
  evidence: string[];
  addedBy: string;
  addedAt: Date;
  expiresAt?: Date;
  status: BlacklistStatus;
  appealCount: number;
  lastAppealAt?: Date;
}

export enum BlacklistEntityType {
  SELLER = 'seller',
  BUYER = 'buyer',
  CARD = 'card',
  PRODUCT = 'product',
  PLATFORM = 'platform',
}

export enum BlacklistStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REMOVED = 'removed',
  APPEALED = 'appealed',
}

export interface FakeCardStats {
  totalReports: number;
  reportsByType: Record<FakeCardReportType, number>;
  reportsBySeverity: Record<FakeCardSeverity, number>;
  reportsByStatus: Record<FakeCardReportStatus, number>;
  averageResolutionTime: number;
  verificationRate: number;
  falsePositiveRate: number;
  topReportedSellers: Array<{
    sellerId: string;
    sellerName: string;
    reportCount: number;
  }>;
  topReportedCards: Array<{
    cardId: string;
    cardName: string;
    reportCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    reportCount: number;
    resolutionCount: number;
  }>;
}

export interface FakeCardFilters {
  reportType?: FakeCardReportType[];
  severity?: FakeCardSeverity[];
  status?: FakeCardReportStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  sellerId?: string;
  cardId?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface FakeCardSearchResult {
  reports: FakeCardReport[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
