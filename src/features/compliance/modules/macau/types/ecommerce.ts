export enum MacauComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
}

export enum MacauRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum MacauEcommercePlatformType {
  B2C = 'b2c',
  B2B = 'b2b',
  C2C = 'c2c',
  MARKETPLACE = 'marketplace',
  AUCTION = 'auction',
}

export enum MacauTransactionType {
  GOODS = 'goods',
  SERVICES = 'services',
  DIGITAL_CONTENT = 'digital_content',
  SUBSCRIPTION = 'subscription',
  AUCTION = 'auction',
}

export enum MacauPaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export enum MacauDeliveryMethod {
  STANDARD_SHIPPING = 'standard_shipping',
  EXPRESS_SHIPPING = 'express_shipping',
  PICKUP = 'pickup',
  DIGITAL_DELIVERY = 'digital_delivery',
  LOCAL_DELIVERY = 'local_delivery',
}

export enum MacauDisputeResolutionType {
  REFUND = 'refund',
  REPLACEMENT = 'replacement',
  REPAIR = 'repair',
  COMPENSATION = 'compensation',
  CANCELLATION = 'cancellation',
}

export interface MacauEcommercePlatform {
  id: string;
  platformType: MacauEcommercePlatformType;
  platformName: string;
  businessRegistration: string;
  contactInformation: {
    email: string;
    phone: string;
    address: string;
  };
  termsOfService: string;
  privacyPolicy: string;
  returnPolicy: string;
  complianceStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauOnlineTransaction {
  id: string;
  platformId: string;
  sellerId: string;
  buyerId: string;
  transactionType: MacauTransactionType;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: MacauPaymentMethod;
  deliveryMethod: MacauDeliveryMethod;
  transactionDate: Date;
  status: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauSeller {
  id: string;
  platformId: string;
  sellerName: string;
  businessRegistration: string;
  contactInformation: {
    email: string;
    phone: string;
    address: string;
  };
  businessLicense?: string;
  taxRegistration?: string;
  verificationStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauBuyer {
  id: string;
  platformId: string;
  buyerName: string;
  contactInformation: {
    email: string;
    phone: string;
    address: string;
  };
  verificationStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauProduct {
  id: string;
  sellerId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  images: string[];
  specifications: Record<string, any>;
  warranty?: string;
  returnPolicy?: string;
  complianceStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauPayment {
  id: string;
  transactionId: string;
  paymentMethod: MacauPaymentMethod;
  amount: number;
  currency: string;
  paymentDate: Date;
  status: MacauComplianceStatus;
  securityMeasures: string[];
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauDelivery {
  id: string;
  transactionId: string;
  deliveryMethod: MacauDeliveryMethod;
  trackingNumber?: string;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  status: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauDisputeResolution {
  id: string;
  transactionId: string;
  disputeType: MacauDisputeResolutionType;
  description: string;
  evidence: string[];
  requestedResolution: string;
  status: MacauComplianceStatus;
  resolution?: string;
  resolutionDate?: Date;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauComplianceResult {
  id: string;
  entityId: string;
  entityType: string;
  complianceStatus: MacauComplianceStatus;
  riskLevel: MacauRiskLevel;
  violations: MacauViolation[];
  recommendations: string[];
  assessmentDate: Date;
  nextReviewDate: Date;
}

export interface MacauViolation {
  id: string;
  type: string;
  description: string;
  severity: MacauRiskLevel;
  article: string;
  penalty: string;
  rectificationRequired: boolean;
  rectificationDeadline?: Date;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface MacauAuditTrail {
  id: string;
  action: string;
  entity: string;
  details: string;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
}
