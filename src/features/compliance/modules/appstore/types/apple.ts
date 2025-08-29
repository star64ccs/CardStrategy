export enum AppleComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
}

export enum AppleRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AppleAppCategory {
  GAMES = 'games',
  BUSINESS = 'business',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  FINANCE = 'finance',
  FOOD_AND_DRINK = 'food_and_drink',
  HEALTH_AND_FITNESS = 'health_and_fitness',
  LIFESTYLE = 'lifestyle',
  MEDICAL = 'medical',
  MUSIC = 'music',
  NAVIGATION = 'navigation',
  NEWS = 'news',
  PHOTO_AND_VIDEO = 'photo_and_video',
  PRODUCTIVITY = 'productivity',
  REFERENCE = 'reference',
  SHOPPING = 'shopping',
  SOCIAL_NETWORKING = 'social_networking',
  SPORTS = 'sports',
  TRAVEL = 'travel',
  UTILITIES = 'utilities',
  WEATHER = 'weather',
}

export enum AppleAgeRating {
  FOUR_PLUS = '4+',
  NINE_PLUS = '9+',
  TWELVE_PLUS = '12+',
  SEVENTEEN_PLUS = '17+',
}

export enum AppleInAppPurchaseType {
  CONSUMABLE = 'consumable',
  NON_CONSUMABLE = 'non_consumable',
  AUTO_RENEWABLE_SUBSCRIPTION = 'auto_renewable_subscription',
  NON_RENEWING_SUBSCRIPTION = 'non_renewing_subscription',
}

export enum AppleSubscriptionDuration {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ApplePrivacyPermission {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  PHOTO_LIBRARY = 'photo_library',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  CALENDAR = 'calendar',
  HEALTH = 'health',
  MOTION = 'motion',
  SPEECH_RECOGNITION = 'speech_recognition',
  BLUETOOTH = 'bluetooth',
  NOTIFICATIONS = 'notifications',
}

export interface AppleAppInfo {
  appId: string;
  appName: string;
  bundleId: string;
  version: string;
  category: AppleAppCategory;
  ageRating: AppleAgeRating;
  description: string;
  keywords: string[];
  screenshots: string[];
  iconUrl: string;
  developerName: string;
  developerId: string;
  price: number;
  isFree: boolean;
  releaseDate: Date;
  lastUpdated: Date;
  size: number;
  languages: string[];
  compatibility: string[];
  minimumOSVersion: string;
}

export interface AppleInAppPurchase {
  productId: string;
  productName: string;
  productType: AppleInAppPurchaseType;
  price: number;
  currency: string;
  description: string;
  isActive: boolean;
  reviewStatus: AppleComplianceStatus;
  reviewNotes?: string;
}

export interface AppleSubscription {
  productId: string;
  productName: string;
  duration: AppleSubscriptionDuration;
  price: number;
  currency: string;
  trialPeriod?: number;
  trialPeriodUnit?: 'days' | 'weeks' | 'months';
  isActive: boolean;
  reviewStatus: AppleComplianceStatus;
  reviewNotes?: string;
  autoRenewable: boolean;
  familySharing: boolean;
}

export interface ApplePrivacyPolicy {
  policyUrl: string;
  lastUpdated: Date;
  dataCollection: {
    personalData: boolean;
    usageData: boolean;
    deviceData: boolean;
    locationData: boolean;
    thirdPartyData: boolean;
  };
  dataUsage: {
    analytics: boolean;
    advertising: boolean;
    personalization: boolean;
    security: boolean;
  };
  dataSharing: {
    thirdParties: boolean;
    affiliates: boolean;
    serviceProviders: boolean;
  };
  userRights: {
    access: boolean;
    correction: boolean;
    deletion: boolean;
    portability: boolean;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface AppleAppReview {
  reviewId: string;
  appId: string;
  reviewDate: Date;
  reviewer: string;
  status: AppleComplianceStatus;
  violations: AppleViolation[];
  notes: string;
  requiresResubmission: boolean;
  resubmissionDeadline?: Date;
}

export interface AppleViolation {
  id: string;
  type: string;
  description: string;
  severity: AppleRiskLevel;
  ruleReference: string;
  timestamp: Date;
  isResolved: boolean;
  resolutionDate?: Date;
  resolutionNotes?: string;
}

export interface AppleComplianceResult {
  appId: string;
  complianceStatus: AppleComplianceStatus;
  riskLevel: AppleRiskLevel;
  violations: AppleViolation[];
  recommendations: string[];
  lastAuditDate: Date;
  nextAuditDate: Date;
  auditTrail: AppleAuditTrail[];
}

export interface AppleAuditTrail {
  id: string;
  action: string;
  timestamp: Date;
  userId: string;
  details: string;
  changes?: Record<string, any>;
}
