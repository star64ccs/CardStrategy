export enum GoogleComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum GoogleRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum GoogleAppCategory {
  GAMES = 'games',
  ART_AND_DESIGN = 'art_and_design',
  AUTO_AND_VEHICLES = 'auto_and_vehicles',
  BEAUTY = 'beauty',
  BOOKS_AND_REFERENCE = 'books_and_reference',
  BUSINESS = 'business',
  COMICS = 'comics',
  COMMUNICATION = 'communication',
  DATING = 'dating',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  EVENTS = 'events',
  FAMILY = 'family',
  FINANCE = 'finance',
  FOOD_AND_DRINK = 'food_and_drink',
  HEALTH_AND_FITNESS = 'health_and_fitness',
  HOUSE_AND_HOME = 'house_and_home',
  LIBRARIES_AND_DEMO = 'libraries_and_demo',
  LIFESTYLE = 'lifestyle',
  MAPS_AND_NAVIGATION = 'maps_and_navigation',
  MEDICAL = 'medical',
  MUSIC_AND_AUDIO = 'music_and_audio',
  NEWS_AND_MAGAZINES = 'news_and_magazines',
  PARENTING = 'parenting',
  PERSONALIZATION = 'personalization',
  PHOTOGRAPHY = 'photography',
  PRODUCTIVITY = 'productivity',
  SHOPPING = 'shopping',
  SOCIAL = 'social',
  SPORTS = 'sports',
  TOOLS = 'tools',
  TRAVEL_AND_LOCAL = 'travel_and_local',
  VIDEO_PLAYERS = 'video_players',
  WEATHER = 'weather',
}

export enum GoogleContentRating {
  EVERYONE = 'everyone',
  EVERYONE_10_PLUS = 'everyone_10_plus',
  TEEN = 'teen',
  MATURE_17_PLUS = 'mature_17_plus',
  ADULTS_ONLY_18_PLUS = 'adults_only_18_plus',
  UNRATED = 'unrated',
}

export enum GoogleInAppPurchaseType {
  CONSUMABLE = 'consumable',
  NON_CONSUMABLE = 'non_consumable',
  SUBSCRIPTION = 'subscription',
}

export enum GoogleSubscriptionDuration {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum GooglePermission {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  STORAGE = 'storage',
  LOCATION = 'location',
  CONTACTS = 'contacts',
  CALENDAR = 'calendar',
  PHONE = 'phone',
  SMS = 'sms',
  CALL_LOG = 'call_log',
  SENSORS = 'sensors',
  BLUETOOTH = 'bluetooth',
  NOTIFICATIONS = 'notifications',
}

export interface GoogleAppInfo {
  appId: string;
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  category: GoogleAppCategory;
  contentRating: GoogleContentRating;
  description: string;
  shortDescription: string;
  keywords: string[];
  screenshots: string[];
  featureGraphic: string;
  iconUrl: string;
  developerName: string;
  developerEmail: string;
  developerWebsite?: string;
  price: number;
  isFree: boolean;
  releaseDate: Date;
  lastUpdated: Date;
  size: number;
  languages: string[];
  targetSdkVersion: number;
  minSdkVersion: number;
  permissions: GooglePermission[];
}

export interface GoogleInAppPurchase {
  productId: string;
  productName: string;
  productType: GoogleInAppPurchaseType;
  price: number;
  currency: string;
  description: string;
  isActive: boolean;
  reviewStatus: GoogleComplianceStatus;
  reviewNotes?: string;
  purchaseType: 'managed' | 'subscription';
}

export interface GoogleSubscription {
  productId: string;
  productName: string;
  duration: GoogleSubscriptionDuration;
  price: number;
  currency: string;
  trialPeriod?: number;
  trialPeriodUnit?: 'days' | 'weeks' | 'months';
  isActive: boolean;
  reviewStatus: GoogleComplianceStatus;
  reviewNotes?: string;
  autoRenewable: boolean;
  familySharing: boolean;
  gracePeriod?: number;
}

export interface GooglePrivacyPolicy {
  policyUrl: string;
  lastUpdated: Date;
  dataCollection: {
    personalData: boolean;
    usageData: boolean;
    deviceData: boolean;
    locationData: boolean;
    thirdPartyData: boolean;
    advertisingData: boolean;
  };
  dataUsage: {
    analytics: boolean;
    advertising: boolean;
    personalization: boolean;
    security: boolean;
    functionality: boolean;
  };
  dataSharing: {
    thirdParties: boolean;
    affiliates: boolean;
    serviceProviders: boolean;
    advertisingPartners: boolean;
  };
  userRights: {
    access: boolean;
    correction: boolean;
    deletion: boolean;
    portability: boolean;
    optOut: boolean;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
  dataRetention: {
    retentionPeriod: number;
    retentionUnit: 'days' | 'months' | 'years';
    deletionPolicy: string;
  };
}

export interface GoogleAppReview {
  reviewId: string;
  appId: string;
  reviewDate: Date;
  reviewer: string;
  status: GoogleComplianceStatus;
  violations: GoogleViolation[];
  notes: string;
  requiresResubmission: boolean;
  resubmissionDeadline?: Date;
  policyViolations: string[];
}

export interface GoogleViolation {
  id: string;
  type: string;
  description: string;
  severity: GoogleRiskLevel;
  ruleReference: string;
  timestamp: Date;
  isResolved: boolean;
  resolutionDate?: Date;
  resolutionNotes?: string;
  policySection: string;
}

export interface GoogleComplianceResult {
  appId: string;
  complianceStatus: GoogleComplianceStatus;
  riskLevel: GoogleRiskLevel;
  violations: GoogleViolation[];
  recommendations: string[];
  lastAuditDate: Date;
  nextAuditDate: Date;
  auditTrail: GoogleAuditTrail[];
  policyCompliance: {
    contentPolicy: boolean;
    privacyPolicy: boolean;
    monetizationPolicy: boolean;
    securityPolicy: boolean;
  };
}

export interface GoogleAuditTrail {
  id: string;
  action: string;
  timestamp: Date;
  userId: string;
  details: string;
  changes?: Record<string, any>;
  policySection?: string;
}
