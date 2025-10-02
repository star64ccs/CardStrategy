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

export enum MacauDataCategory {
  IDENTIFICATION = 'identification',
  CONTACT = 'contact',
  FINANCIAL = 'financial',
  HEALTH = 'health',
  LOCATION = 'location',
  BEHAVIORAL = 'behavioral',
  SENSITIVE = 'sensitive',
}

export enum MacauProcessingMethod {
  COLLECTION = 'collection',
  STORAGE = 'storage',
  USE = 'use',
  DISCLOSURE = 'disclosure',
  TRANSFER = 'transfer',
  DESTRUCTION = 'destruction',
}

export enum MacauSecurityMeasure {
  ENCRYPTION = 'encryption',
  ACCESS_CONTROL = 'access_control',
  AUDIT_LOGGING = 'audit_logging',
  BACKUP = 'backup',
  FIREWALL = 'firewall',
  INTRUSION_DETECTION = 'intrusion_detection',
}

export enum MacauConsentType {
  EXPLICIT = 'explicit',
  IMPLICIT = 'implicit',
  OPT_IN = 'opt_in',
  OPT_OUT = 'opt_out',
}

export enum MacauDataSubjectRight {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
}

export interface MacauPersonalData {
  id: string;
  category: MacauDataCategory;
  description: string;
  isSensitive: boolean;
  retentionPeriod: number; // days
  processingMethods: MacauProcessingMethod[];
  securityMeasures: MacauSecurityMeasure[];
}

export interface MacauDataProcessing {
  id: string;
  purpose: string;
  legalBasis: string;
  dataCategories: MacauDataCategory[];
  processingMethods: MacauProcessingMethod[];
  dataRetentionPeriod: number; // days
  securityMeasures: MacauSecurityMeasure[];
  consentRequired: boolean;
  consentType?: MacauConsentType;
  crossBorderTransfer: boolean;
  recipientCountries?: string[];
  riskAssessment: MacauRiskLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauCrossBorderTransfer {
  id: string;
  destinationCountry: string;
  dataCategories: MacauDataCategory[];
  transferMethod: string;
  safeguards: string[];
  adequacyDecision: boolean;
  standardContractualClauses: boolean;
  bindingCorporateRules: boolean;
  riskAssessment: MacauRiskLevel;
  approvalRequired: boolean;
  approvalStatus: MacauComplianceStatus;
  createdAt: Date;
}

export interface MacauDataSubjectRequest {
  id: string;
  dataSubjectId: string;
  rightType: MacauDataSubjectRight;
  description: string;
  status: MacauComplianceStatus;
  requestedAt: Date;
  processedAt?: Date;
  response?: string;
}

export interface MacauComplianceResult {
  id: string;
  processingId: string;
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
