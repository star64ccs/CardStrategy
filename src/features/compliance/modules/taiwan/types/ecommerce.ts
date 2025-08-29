// 台灣電子商務法類型定義
// Taiwan E-commerce Law Type Definitions

export interface TaiwanEcommercePlatform {
  id: string;
  platformType: TaiwanPlatformType;
  platformName: string;
  businessModel: TaiwanBusinessModel;
  targetMarket: string[];
  userBase: number;
  revenueModel: TaiwanRevenueModel;
  complianceStatus: TaiwanComplianceStatus;
  registrationInfo: TaiwanRegistrationInfo;
  businessLicense: TaiwanBusinessLicense;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanPlatformType {
  B2B = 'b2b',
  B2C = 'b2c',
  C2C = 'c2c',
  B2B2C = 'b2b2c',
  O2O = 'o2o',
  SOCIAL_COMMERCE = 'social_commerce',
  MOBILE_COMMERCE = 'mobile_commerce',
  CROSS_BORDER = 'cross_border',
  OTHER = 'other',
}

export enum TaiwanBusinessModel {
  MARKETPLACE = 'marketplace',
  DIRECT_SALES = 'direct_sales',
  SUBSCRIPTION = 'subscription',
  FREEMIUM = 'freemium',
  AFFILIATE = 'affiliate',
  DROPSHIPPING = 'dropshipping',
  WHOLESALE = 'wholesale',
  RETAIL = 'retail',
  OTHER = 'other',
}

export enum TaiwanRevenueModel {
  COMMISSION = 'commission',
  SUBSCRIPTION_FEE = 'subscription_fee',
  TRANSACTION_FEE = 'transaction_fee',
  ADVERTISING = 'advertising',
  DATA_SALES = 'data_sales',
  LICENSING = 'licensing',
  FREEMIUM = 'freemium',
  OTHER = 'other',
}

export interface TaiwanRegistrationInfo {
  id: string;
  companyName: string;
  registrationNumber: string;
  registeredAddress: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  registrationDate: Date;
  businessScope: string[];
  capitalAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanBusinessLicense {
  id: string;
  licenseType: TaiwanLicenseType;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  businessScope: string[];
  conditions: string[];
  status: TaiwanLicenseStatus;
  renewalRequired: boolean;
  renewalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanLicenseType {
  ECOMMERCE = 'ecommerce',
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  IMPORT_EXPORT = 'import_export',
  FINANCIAL = 'financial',
  TELECOMMUNICATIONS = 'telecommunications',
  OTHER = 'other',
}

export enum TaiwanLicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export interface TaiwanOnlineTransaction {
  id: string;
  transactionType: TaiwanTransactionType;
  seller: TaiwanSeller;
  buyer: TaiwanBuyer;
  products: TaiwanProduct[];
  paymentMethod: TaiwanPaymentMethod;
  transactionAmount: number;
  currency: string;
  transactionDate: Date;
  deliveryMethod: TaiwanDeliveryMethod;
  warrantyInfo: TaiwanWarrantyInfo;
  returnPolicy: TaiwanReturnPolicy;
  disputeResolution: TaiwanDisputeResolution;
  complianceStatus: TaiwanComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanTransactionType {
  GOODS = 'goods',
  SERVICES = 'services',
  DIGITAL_CONTENT = 'digital_content',
  SUBSCRIPTION = 'subscription',
  AUCTION = 'auction',
  GROUP_BUYING = 'group_buying',
  OTHER = 'other',
}

export interface TaiwanSeller {
  id: string;
  sellerType: TaiwanSellerType;
  businessName: string;
  registrationNumber: string;
  contactInfo: TaiwanContactInfo;
  businessAddress: string;
  businessLicense: TaiwanBusinessLicense;
  rating: number;
  totalSales: number;
  complianceHistory: TaiwanComplianceHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanSellerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  PLATFORM = 'platform',
  FOREIGN_ENTITY = 'foreign_entity',
  OTHER = 'other',
}

export interface TaiwanContactInfo {
  id: string;
  contactType: TaiwanContactType;
  name: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanContactType {
  CUSTOMER_SERVICE = 'customer_service',
  TECHNICAL_SUPPORT = 'technical_support',
  SALES = 'sales',
  LEGAL = 'legal',
  GENERAL = 'general',
}

export interface TaiwanComplianceHistory {
  id: string;
  complianceType: TaiwanComplianceType;
  status: TaiwanComplianceStatus;
  description: string;
  date: Date;
  penalty?: TaiwanPenalty;
  rectificationRequired: boolean;
  rectificationDate?: Date;
  createdAt: Date;
}

export enum TaiwanComplianceType {
  REGISTRATION = 'registration',
  LICENSING = 'licensing',
  TAX = 'tax',
  CONSUMER_PROTECTION = 'consumer_protection',
  DATA_PROTECTION = 'data_protection',
  COMPETITION = 'competition',
  OTHER = 'other',
}

export interface TaiwanBuyer {
  id: string;
  buyerType: TaiwanBuyerType;
  name: string;
  contactInfo: TaiwanContactInfo;
  shippingAddress: string;
  billingAddress: string;
  paymentPreferences: TaiwanPaymentMethod[];
  purchaseHistory: TaiwanPurchaseHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanBuyerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  GOVERNMENT = 'government',
  EDUCATIONAL = 'educational',
  OTHER = 'other',
}

export interface TaiwanPurchaseHistory {
  id: string;
  transactionId: string;
  purchaseDate: Date;
  amount: number;
  currency: string;
  status: TaiwanTransactionStatus;
  feedback?: TaiwanFeedback;
  createdAt: Date;
}

export enum TaiwanTransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export interface TaiwanProduct {
  id: string;
  productType: TaiwanProductType;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  stockQuantity: number;
  specifications: Record<string, any>;
  images: string[];
  warranty: TaiwanWarrantyInfo;
  returnPolicy: TaiwanReturnPolicy;
  complianceInfo: TaiwanProductComplianceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
  OTHER = 'other',
}

export interface TaiwanWarrantyInfo {
  id: string;
  warrantyType: TaiwanWarrantyType;
  duration: number; // 天數
  coverage: string[];
  exclusions: string[];
  terms: string[];
  contactInfo: TaiwanContactInfo;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanWarrantyType {
  MANUFACTURER = 'manufacturer',
  SELLER = 'seller',
  EXTENDED = 'extended',
  NONE = 'none',
}

export interface TaiwanReturnPolicy {
  id: string;
  returnPeriod: number; // 天數
  returnConditions: string[];
  returnMethods: TaiwanReturnMethod[];
  refundPolicy: TaiwanRefundPolicy;
  restockingFee: number;
  currency: string;
  exclusions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanReturnMethod {
  MAIL = 'mail',
  STORE = 'store',
  PICKUP = 'pickup',
  EXCHANGE = 'exchange',
  OTHER = 'other',
}

export interface TaiwanRefundPolicy {
  id: string;
  refundType: TaiwanRefundType;
  refundPeriod: number; // 天數
  refundMethods: TaiwanPaymentMethod[];
  processingTime: number; // 天數
  fees: number;
  currency: string;
  conditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanRefundType {
  FULL_REFUND = 'full_refund',
  PARTIAL_REFUND = 'partial_refund',
  STORE_CREDIT = 'store_credit',
  EXCHANGE = 'exchange',
  NO_REFUND = 'no_refund',
}

export interface TaiwanProductComplianceInfo {
  id: string;
  safetyCertification: TaiwanSafetyCertification[];
  qualityStandards: string[];
  importPermits: string[];
  exportPermits: string[];
  restrictions: string[];
  warnings: string[];
  complianceStatus: TaiwanComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanSafetyCertification {
  id: string;
  certificationType: TaiwanCertificationType;
  issuingAuthority: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  scope: string[];
  status: TaiwanCertificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanCertificationType {
  SAFETY = 'safety',
  QUALITY = 'quality',
  ENVIRONMENTAL = 'environmental',
  HEALTH = 'health',
  SECURITY = 'security',
  OTHER = 'other',
}

export enum TaiwanCertificationStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export interface TaiwanPaymentMethod {
  id: string;
  paymentType: TaiwanPaymentType;
  provider: string;
  accountInfo: string;
  securityFeatures: string[];
  transactionLimits: TaiwanTransactionLimits;
  fees: TaiwanPaymentFees;
  complianceStatus: TaiwanComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanPaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  OTHER = 'other',
}

export interface TaiwanTransactionLimits {
  id: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanPaymentFees {
  id: string;
  transactionFee: number;
  percentageFee: number;
  fixedFee: number;
  currency: string;
  feeStructure: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanDeliveryMethod {
  id: string;
  deliveryType: TaiwanDeliveryType;
  provider: string;
  estimatedTime: number; // 天數
  cost: number;
  currency: string;
  trackingAvailable: boolean;
  insuranceAvailable: boolean;
  restrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanDeliveryType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
  INTERNATIONAL = 'international',
  OTHER = 'other',
}

export interface TaiwanDisputeResolution {
  id: string;
  disputeType: TaiwanDisputeType;
  resolutionMethod: TaiwanResolutionMethod;
  mediator: string;
  timeline: number; // 天數
  costs: number;
  currency: string;
  successRate: number; // 百分比
  appealProcess: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanDisputeType {
  PRODUCT_QUALITY = 'product_quality',
  DELIVERY_ISSUE = 'delivery_issue',
  PAYMENT_DISPUTE = 'payment_dispute',
  REFUND_REQUEST = 'refund_request',
  WARRANTY_CLAIM = 'warranty_claim',
  OTHER = 'other',
}

export enum TaiwanResolutionMethod {
  NEGOTIATION = 'negotiation',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  LITIGATION = 'litigation',
  CONSUMER_PROTECTION = 'consumer_protection',
  OTHER = 'other',
}

export interface TaiwanFeedback {
  id: string;
  rating: number; // 1-5
  comment: string;
  category: TaiwanFeedbackCategory;
  sentiment: TaiwanSentiment;
  helpful: number;
  reported: boolean;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanFeedbackCategory {
  PRODUCT_QUALITY = 'product_quality',
  SERVICE = 'service',
  DELIVERY = 'delivery',
  PRICE = 'price',
  WEBSITE = 'website',
  OTHER = 'other',
}

export enum TaiwanSentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
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

export interface TaiwanEcommerceComplianceResult {
  id: string;
  platformId: string;
  complianceStatus: TaiwanComplianceStatus;
  violations: TaiwanEcommerceViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaiwanEcommerceViolation {
  id: string;
  platformId: string;
  violationType: TaiwanEcommerceViolationType;
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

export enum TaiwanEcommerceViolationType {
  REGISTRATION_VIOLATION = 'registration_violation',
  LICENSING_VIOLATION = 'licensing_violation',
  TAX_VIOLATION = 'tax_violation',
  CONSUMER_PROTECTION_VIOLATION = 'consumer_protection_violation',
  DATA_PROTECTION_VIOLATION = 'data_protection_violation',
  COMPETITION_VIOLATION = 'competition_violation',
  PAYMENT_VIOLATION = 'payment_violation',
  DELIVERY_VIOLATION = 'delivery_violation',
  WARRANTY_VIOLATION = 'warranty_violation',
  RETURN_POLICY_VIOLATION = 'return_policy_violation',
  DISPUTE_RESOLUTION_VIOLATION = 'dispute_resolution_violation',
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
