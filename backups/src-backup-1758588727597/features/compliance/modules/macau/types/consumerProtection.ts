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

export enum MacauConsumerRight {
  SAFETY = 'safety',
  INFORMATION = 'information',
  CHOICE = 'choice',
  REPRESENTATION = 'representation',
  REDRESS = 'redress',
  EDUCATION = 'education',
  HEALTHY_ENVIRONMENT = 'healthy_environment',
}

export enum MacauProductCategory {
  FOOD = 'food',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  COSMETICS = 'cosmetics',
  MEDICINE = 'medicine',
  TOYS = 'toys',
  SERVICES = 'services',
}

export enum MacauLabelingRequirement {
  PRODUCT_NAME = 'product_name',
  MANUFACTURER = 'manufacturer',
  INGREDIENTS = 'ingredients',
  EXPIRY_DATE = 'expiry_date',
  SAFETY_WARNINGS = 'safety_warnings',
  USAGE_INSTRUCTIONS = 'usage_instructions',
  WARRANTY = 'warranty',
}

export enum MacauDisputeType {
  PRODUCT_DEFECT = 'product_defect',
  FALSE_ADVERTISING = 'false_advertising',
  UNFAIR_TERMS = 'unfair_terms',
  PRICE_GOUGING = 'price_gouging',
  SERVICE_QUALITY = 'service_quality',
  REFUND_REFUSAL = 'refund_refusal',
}

export enum MacauDisputeStatus {
  PENDING = 'pending',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export interface MacauConsumerComplaint {
  id: string;
  consumerId: string;
  productId?: string;
  serviceId?: string;
  complaintType: MacauDisputeType;
  description: string;
  evidence: string[];
  requestedResolution: string;
  status: MacauDisputeStatus;
  filedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  compensation?: number;
}

export interface MacauProductLabeling {
  id: string;
  productId: string;
  productName: string;
  manufacturer: string;
  ingredients?: string[];
  expiryDate?: Date;
  safetyWarnings?: string[];
  usageInstructions?: string;
  warranty?: string;
  complianceStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauAdvertising {
  id: string;
  productId?: string;
  serviceId?: string;
  content: string;
  media: string;
  targetAudience: string;
  claims: string[];
  disclaimers?: string[];
  complianceStatus: MacauComplianceStatus;
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
