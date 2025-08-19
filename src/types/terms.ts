// 條款同意系統類型定義

// 條款類型
export type TermsType =
  | 'purchase_refund_policy'    // 購買及退款政策
  | 'disclaimer'                // 免責聲明
  | 'cookie_policy'             // Cookie 政策
  | 'terms_of_use'              // 使用條款
  | 'ai_usage_policy';          // AI 使用政策

// 條款狀態
export type TermsStatus = 'active' | 'inactive' | 'draft' | 'archived';

// 同意狀態
export type ConsentStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// 條款版本
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

// 用戶同意記錄
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

// 條款配置
export interface TermsConfig {
  // 強制同意設置
  requireAllTerms: boolean;           // 是否要求同意所有條款
  allowPartialConsent: boolean;       // 是否允許部分同意
  consentExpiryDays: number;          // 同意有效期（天）

  // 顯示設置
  showOnFirstLaunch: boolean;         // 首次啟動時顯示
  showOnUpdate: boolean;              // 更新時顯示
  showOnLogin: boolean;               // 登錄時顯示

  // 通知設置
  notifyOnExpiry: boolean;            // 到期時通知
  notifyOnUpdate: boolean;            // 更新時通知

  // 合規設置
  requireExplicitConsent: boolean;    // 要求明確同意
  requireAgeVerification: boolean;    // 要求年齡驗證
  minimumAge: number;                 // 最小年齡要求

  // 多語言設置
  defaultLanguage: string;            // 默認語言
  supportedLanguages: string[];       // 支持語言列表
}

// 條款同意請求
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

// 條款同意響應
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

// 條款查詢參數
export interface TermsQueryParams {
  type?: TermsType;
  language?: string;
  status?: TermsStatus;
  version?: string;
  includeContent?: boolean;
}

// 條款統計
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

// 條款更新通知
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

// 條款同意檢查結果
export interface TermsComplianceCheck {
  compliant: boolean;
  missingTerms: TermsType[];
  expiredTerms: TermsType[];
  pendingTerms: TermsType[];
  allTermsAccepted: boolean;
  canUseApp: boolean;
  recommendations: string[];
}

// 條款導出選項
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
