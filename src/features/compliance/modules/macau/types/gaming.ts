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

export enum MacauGamingLicenseType {
  CASINO = 'casino',
  GAMING_MACHINE = 'gaming_machine',
  JUNKET_OPERATOR = 'junket_operator',
  GAMING_PROMOTER = 'gaming_promoter',
  GAMING_AGENT = 'gaming_agent',
}

export enum MacauGamingActivity {
  TABLE_GAMES = 'table_games',
  SLOT_MACHINES = 'slot_machines',
  ELECTRONIC_GAMES = 'electronic_games',
  SPORTS_BETTING = 'sports_betting',
  LOTTERY = 'lottery',
  ONLINE_GAMING = 'online_gaming',
}

export enum MacauGamingRegulation {
  ANTI_MONEY_LAUNDERING = 'anti_money_laundering',
  RESPONSIBLE_GAMING = 'responsible_gaming',
  AGE_RESTRICTION = 'age_restriction',
  GAMING_LIMITS = 'gaming_limits',
  SELF_EXCLUSION = 'self_exclusion',
  ADVERTISING_RESTRICTIONS = 'advertising_restrictions',
}

export enum MacauGamingViolationType {
  UNLICENSED_OPERATION = 'unlicensed_operation',
  UNDERAGE_GAMING = 'underage_gaming',
  MONEY_LAUNDERING = 'money_laundering',
  EXCESSIVE_GAMING = 'excessive_gaming',
  FALSE_ADVERTISING = 'false_advertising',
  UNFAIR_GAMING = 'unfair_gaming',
}

export interface MacauGamingLicense {
  id: string;
  licenseType: MacauGamingLicenseType;
  licenseeName: string;
  businessAddress: string;
  validFrom: Date;
  validTo: Date;
  status: MacauComplianceStatus;
  conditions: string[];
  restrictions: string[];
  renewalRequired: boolean;
  renewalDate?: Date;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauGamingOperation {
  id: string;
  licenseId: string;
  gamingActivity: MacauGamingActivity;
  location: string;
  operatingHours: string;
  maxCapacity: number;
  currentCapacity: number;
  securityMeasures: string[];
  responsibleGamingMeasures: string[];
  complianceStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauGamingCompliance {
  id: string;
  operationId: string;
  regulationType: MacauGamingRegulation;
  complianceStatus: MacauComplianceStatus;
  riskLevel: MacauRiskLevel;
  violations: MacauViolation[];
  recommendations: string[];
  assessmentDate: Date;
  nextReviewDate: Date;
}

export interface MacauResponsibleGaming {
  id: string;
  operationId: string;
  selfExclusionProgram: boolean;
  gamingLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  ageVerification: boolean;
  responsibleGamingTraining: boolean;
  supportServices: string[];
  complianceStatus: MacauComplianceStatus;
  violations: MacauViolation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MacauAntiMoneyLaundering {
  id: string;
  operationId: string;
  customerDueDiligence: boolean;
  suspiciousTransactionReporting: boolean;
  recordKeeping: boolean;
  staffTraining: boolean;
  riskAssessment: MacauRiskLevel;
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
