// 隱私相關類型定義

// 地區代碼
export type RegionCode =
  | 'CN' // 中國
  | 'HK' // 香港
  | 'MO' // 澳門
  | 'TW' // 台灣
  | 'JP' // 日本
  | 'KR' // 南韓
  | 'US' // 美國
  | 'EU'; // 歐盟

// 隱私法律類型
export type PrivacyLaw =
  | 'PIPL' // 中國個人信息保護法
  | 'PDPO' // 香港個人資料(私隱)條例
  | 'PDPA' // 澳門個人資料保護法
  | 'PDPA_TW' // 台灣個人資料保護法
  | 'APPI' // 日本個人信息保護法
  | 'PIPA' // 南韓個人信息保護法
  | 'CCPA' // 美國加州消費者隱私法案
  | 'CPRA' // 美國加州隱私權法案
  | 'GDPR' // 歐盟通用數據保護條例
  | 'LGPD'; // 巴西通用數據保護法

// 數據處理目的
export type DataProcessingPurpose =
  | 'account_management' // 賬戶管理
  | 'service_provision' // 服務提供
  | 'payment_processing' // 支付處理
  | 'marketing' // 營銷
  | 'analytics' // 分析
  | 'security' // 安全
  | 'legal_compliance' // 法律合規
  | 'customer_support' // 客戶支持
  | 'research' // 研究
  | 'third_party_integration'; // 第三方集成

// 數據類別
export type DataCategory =
  | 'personal_info' // 個人信息
  | 'contact_info' // 聯繫信息
  | 'financial_info' // 財務信息
  | 'location_info' // 位置信息
  | 'device_info' // 設備信息
  | 'usage_data' // 使用數據
  | 'biometric_data' // 生物識別數據
  | 'sensitive_data' // 敏感數據
  | 'children_data'; // 兒童數據

// 同意類型
export type ConsentType =
  | 'explicit' // 明確同意
  | 'implicit' // 隱含同意
  | 'opt_in' // 選擇加入
  | 'opt_out' // 選擇退出
  | 'granular' // 細粒度同意
  | 'withdrawal'; // 撤回同意

// 數據處理基礎
export type LegalBasis =
  | 'consent' // 同意
  | 'contract' // 合同
  | 'legal_obligation' // 法律義務
  | 'vital_interests' // 重要利益
  | 'public_task' // 公共任務
  | 'legitimate_interests'; // 合法利益

// 數據傳輸類型
export type DataTransferType =
  | 'internal' // 內部傳輸
  | 'third_party' // 第三方傳輸
  | 'cross_border' // 跨境傳輸
  | 'international'; // 國際傳輸

// 用戶隱私偏好
export interface PrivacyPreferences {
  id: string;
  userId: string;
  region: RegionCode;
  language: string;

  // 基本同意
  termsAccepted: boolean;
  termsAcceptedAt: Date;
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt: Date;

  // 數據處理同意
  dataProcessingConsent: {
    [key in DataProcessingPurpose]: {
      consented: boolean;
      consentedAt?: Date;
      withdrawnAt?: Date;
      legalBasis: LegalBasis;
    };
  };

  // 營銷同意
  marketingConsent: {
    email: boolean;
    sms: boolean;
    push: boolean;
    thirdParty: boolean;
    personalized: boolean;
    consentedAt?: Date;
    withdrawnAt?: Date;
  };

  // 數據共享同意
  dataSharingConsent: {
    analytics: boolean;
    thirdParty: boolean;
    crossBorder: boolean;
    consentedAt?: Date;
    withdrawnAt?: Date;
  };

  // 兒童數據保護
  childrenDataProtection: {
    isParentalConsent: boolean;
    parentalConsentVerified: boolean;
    ageVerification: boolean;
    restrictedFeatures: boolean;
  };

  // 數據權利
  dataRights: {
    access: boolean;
    rectification: boolean;
    erasure: boolean;
    portability: boolean;
    restriction: boolean;
    objection: boolean;
    automatedDecision: boolean;
  };

  // 通知偏好
  notificationPreferences: {
    privacyUpdates: boolean;
    dataBreach: boolean;
    consentChanges: boolean;
    legalUpdates: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

// 隱私法律要求
export interface PrivacyLawRequirement {
  law: PrivacyLaw;
  region: RegionCode;
  requirements: {
    consentRequired: boolean;
    explicitConsent: boolean;
    granularConsent: boolean;
    withdrawalRights: boolean;
    dataMinimization: boolean;
    purposeLimitation: boolean;
    storageLimitation: boolean;
    accuracy: boolean;
    security: boolean;
    accountability: boolean;
    transparency: boolean;
    dataSubjectRights: boolean;
    crossBorderTransfer: boolean;
    dataBreachNotification: boolean;
    childrenProtection: boolean;
    sensitiveDataProtection: boolean;
  };
  complianceDeadline: Date;
  penalties: {
    maxFine: number;
    currency: string;
    criminalLiability: boolean;
  };
}

// 數據處理記錄
export interface DataProcessingRecord {
  id: string;
  userId: string;
  purpose: DataProcessingPurpose;
  dataCategory: DataCategory[];
  legalBasis: LegalBasis;
  region: RegionCode;
  processingDate: Date;
  dataRetentionPeriod: number; // 天數
  thirdPartyInvolved: boolean;
  thirdPartyName?: string;
  crossBorderTransfer: boolean;
  destinationCountry?: string;
  safeguards?: string[];
  consentId?: string;
  automatedDecision: boolean;
  profiling: boolean;
  createdAt: Date;
}

// 數據權利請求
export interface DataRightsRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date;
  completedAt?: Date;
  response?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 數據洩露事件
export interface DataBreachEvent {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  affectedDataTypes: DataCategory[];
  affectedRegions: RegionCode[];
  discoveryDate: Date;
  notificationDate?: Date;
  containmentDate?: Date;
  resolutionDate?: Date;
  status: 'discovered' | 'investigating' | 'contained' | 'resolved';
  rootCause?: string;
  remediation?: string;
  regulatoryNotification: boolean;
  userNotification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 隱私影響評估
export interface PrivacyImpactAssessment {
  id: string;
  title: string;
  description: string;
  dataProcessingPurpose: DataProcessingPurpose;
  dataCategories: DataCategory[];
  affectedRegions: RegionCode[];
  riskLevel: 'low' | 'medium' | 'high';
  mitigationMeasures: string[];
  legalBasis: LegalBasis;
  retentionPeriod: number;
  thirdPartyInvolvement: boolean;
  crossBorderTransfer: boolean;
  automatedDecision: boolean;
  profiling: boolean;
  childrenData: boolean;
  sensitiveData: boolean;
  assessmentDate: Date;
  reviewer: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// 第三方數據處理者
export interface ThirdPartyProcessor {
  id: string;
  name: string;
  region: RegionCode;
  dataProcessingAgreement: boolean;
  agreementDate?: Date;
  agreementExpiry?: Date;
  dataCategories: DataCategory[];
  processingPurposes: DataProcessingPurpose[];
  securityMeasures: string[];
  auditRights: boolean;
  breachNotification: boolean;
  dataReturn: boolean;
  subProcessors: boolean;
  complianceCertification: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// 隱私政策版本
export interface PrivacyPolicyVersion {
  id: string;
  version: string;
  effectiveDate: Date;
  regions: RegionCode[];
  languages: string[];
  content: {
    [language: string]: {
      title: string;
      content: string;
      summary: string;
    };
  };
  changes: string[];
  approvalStatus: 'draft' | 'review' | 'approved' | 'published';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

// 同意記錄
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  purpose: DataProcessingPurpose;
  legalBasis: LegalBasis;
  region: RegionCode;
  language: string;
  consentMethod: 'web' | 'mobile' | 'email' | 'phone' | 'in_person';
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  grantedAt: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 隱私設置配置
export interface PrivacySettingsConfig {
  region: RegionCode;
  laws: PrivacyLaw[];
  requirements: PrivacyLawRequirement;
  defaultPreferences: Partial<PrivacyPreferences>;
  mandatoryConsents: DataProcessingPurpose[];
  optionalConsents: DataProcessingPurpose[];
  childrenAgeLimit: number;
  sensitiveDataCategories: DataCategory[];
  retentionPeriods: {
    [key in DataProcessingPurpose]: number;
  };
  notificationPeriods: {
    dataBreach: number; // 小時
    consentChanges: number; // 天
    policyUpdates: number; // 天
  };
  dataRightsResponseTime: number; // 天
  auditFrequency: number; // 月
}
