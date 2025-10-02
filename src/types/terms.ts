// 條款Agree系統Class型定義

// 條款Class型
export type TermsType =
  | 'purchase_refund_policy' // 購買及退款政策
  | 'disclaimer' // 免責聲明
  | 'cookie_policy' // Cookie 政策
  | 'terms_of_use' // 使用條款
  | 'ai_usage_policy'; // AI 使用政策

// 條款Status
export type TermsStatus = 'active' | 'inactive' | 'draft' | 'archived';

// AgreeStatus
export type ConsentStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// 條款Version
export interface TermsVersion {
  id: string;
  type: TermsType;
  version: string;
  title: string;
  content: string;
  language: string;
  status: TermsStatus;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// UserAgreeRecord
export interface UserConsent {
  id: string;
  userId: string;
  termsType: TermsType;
  termsVersion: string;
  status: ConsentStatus;
  consentedAt?: Date;
  declinedAt?: Date;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 條款Configure
export interface TermsConfig {
  // ForceAgreeSettings
  requireAllTerms: boolean; // YesNo要求Agree所有條款
  allowPartialConsent: boolean; // YesNoAllowPartialAgree
  consentExpiryDays: number; // Agree有效期（天）

  // ShowSettings
  showOnFirstLaunch: boolean; // 首次Start時Show
  showOnUpdate: boolean; // Update時Show
  showOnLogin: boolean; // Login時Show

  // NotificationSettings
  notifyOnExpiry: boolean; // 到期時Notification
  notifyOnUpdate: boolean; // Update時Notification

  // 合規Settings
  requireExplicitConsent: boolean; // 要求明確Agree
  requireAgeVerification: boolean; // 要求AgeVerify
  minimumAge: number; // 最小Age要求

  // 多LanguageSettings
  defaultLanguage: string; // DefaultLanguage
  supportedLanguages: string[]; // SupportLanguageList
}

// 條款AgreeRequest
export interface TermsConsentRequest {
  userId: string;
  termsType: TermsType;
  action: 'accept' | 'decline';
  version: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

// 條款AgreeResponse
export interface TermsConsentResponse {
  success: boolean;
  message: string;
  data?: {
    consent: UserConsent;
    allTermsAccepted: boolean;
    pendingTerms: TermsType[];
  };
  error?: string;
}

// 條款QueryParameter
export interface TermsQueryParams {
  type?: TermsType;
  language?: string;
  status?: TermsStatus;
  version?: string;
  includeContent?: boolean;
}

// 條款Statistics
export interface TermsStatistics {
  totalUsers: number;
  acceptedUsers: number;
  declinedUsers: number;
  pendingUsers: number;
  expiredUsers: number;
  acceptanceRate: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

// 條款UpdateNotification
export interface TermsUpdateNotification {
  id: string;
  type: TermsType;
  oldVersion: string;
  newVersion: string;
  changes: string[];
  effectiveDate: Date;
  notificationSent: boolean;
  createdAt: Date;
}

// 條款AgreeCheck結果
export interface TermsComplianceCheck {
  compliant: boolean;
  missingTerms: TermsType[];
  expiredTerms: TermsType[];
  pendingTerms: TermsType[];
  allTermsAccepted: boolean;
  canUseApp: boolean;
  recommendations: string[];
}

// 條款ExportOptions
export interface TermsExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeContent: boolean;
  includeUserData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  termsTypes?: TermsType[];
}
