// 台灣個人資料保護法Class型定義
// Taiwan Personal Data Protection Act Type Definitions

export interface TaiwanPersonalDataProcessing {
  id: string;
  purpose: string;
  dataCategory: TaiwanDataCategory;
  processingMethod: TaiwanProcessingMethod;
  retentionPeriod: number; // 天數
  crossBorderTransfer: boolean;
  thirdPartySharing: boolean;
  securityMeasures: TaiwanSecurityMeasure[];
  consentRequired: boolean;
  consentMethod?: TaiwanConsentMethod;
  dataSubjectRights: TaiwanDataSubjectRight[];
  auditTrail: boolean;
  breachNotification: boolean;
  dpoContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanDataCategory {
  IDENTIFICATION = 'identification', // 識別個人者
  FINANCIAL = 'financial', // 商業上之秘密
  MEDICAL = 'medical', // 病歷、醫療、基因、性生活、健康Check
  CRIMINAL = 'criminal', // 犯罪前科
  CONTACT = 'contact', // 聯絡方式
  LOCATION = 'location', // 位置資訊
  BEHAVIOR = 'behavior', // 網路活動紀錄
  PREFERENCE = 'preference', // 個人Preferences
  OTHER = 'other', // 其他得以直接或間接方式識別該個人之資料
}

export enum TaiwanProcessingMethod {
  COLLECTION = 'collection', // 蒐集
  PROCESSING = 'processing', // Handle
  USE = 'use', // 利用
  INTERNATIONAL_TRANSFER = 'international_transfer', // 國際傳輸
  THIRD_PARTY_SHARING = 'third_party_sharing', // 委託他人蒐集、Handle或利用
}

export enum TaiwanSecurityMeasure {
  ENCRYPTION = 'encryption', // Encrypt
  ACCESS_CONTROL = 'access_control', // 存取Control
  AUDIT_LOGGING = 'audit_logging', // 稽核Log
  BACKUP = 'backup', // Backup
  DISASTER_RECOVERY = 'disaster_recovery', // 災害Undo
  PHYSICAL_SECURITY = 'physical_security', // 實體安全
  NETWORK_SECURITY = 'network_security', // 網路安全
  PERSONNEL_SECURITY = 'personnel_security', // 人員安全
}

export enum TaiwanConsentMethod {
  EXPLICIT = 'explicit', // 明確Agree
  IMPLICIT = 'implicit', // 默示Agree
  ELECTRONIC = 'electronic', // 電子Agree
  WRITTEN = 'written', // 書面Agree
  VERBAL = 'verbal', // 口頭Agree
}

export enum TaiwanDataSubjectRight {
  ACCESS = 'access', // Query或Request閱覽
  COPY = 'copy', // Request製給複製本
  CORRECTION = 'correction', // Request補充或更正
  DELETION = 'deletion', // RequestStop蒐集、Handle或利用
  PORTABILITY = 'portability', // RequestDelete
  WITHDRAWAL = 'withdrawal', // 撤回Agree
  COMPLAINT = 'complaint', // 申訴
}

export interface TaiwanCrossBorderTransfer {
  id: string;
  destinationCountry: string;
  transferMethod: TaiwanTransferMethod;
  adequacyDecision: boolean;
  safeguards: TaiwanSafeguard[];
  recipientInfo: TaiwanRecipientInfo;
  riskAssessment: TaiwanRiskAssessment;
  approvalRequired: boolean;
  approvalStatus: TaiwanApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanTransferMethod {
  STANDARD_CONTRACTUAL_CLAUSES = 'standard_contractual_clauses',
  BINDING_CORPORATE_RULES = 'binding_corporate_rules',
  CERTIFICATION = 'certification',
  CODE_OF_CONDUCT = 'code_of_conduct',
  ADEQUACY_DECISION = 'adequacy_decision',
  DEROGATIONS = 'derogations',
}

export enum TaiwanSafeguard {
  CONTRACTUAL_OBLIGATIONS = 'contractual_obligations',
  TECHNICAL_MEASURES = 'technical_measures',
  ORGANIZATIONAL_MEASURES = 'organizational_measures',
  CERTIFICATION = 'certification',
  CODES_OF_CONDUCT = 'codes_of_conduct',
  BINDING_CORPORATE_RULES = 'binding_corporate_rules',
}

export interface TaiwanRecipientInfo {
  name: string;
  country: string;
  purpose: string;
  dataCategories: TaiwanDataCategory[];
  retentionPeriod: number;
  securityMeasures: TaiwanSecurityMeasure[];
}

export interface TaiwanRiskAssessment {
  riskLevel: TaiwanRiskLevel;
  riskFactors: string[];
  mitigationMeasures: string[];
  residualRisk: TaiwanRiskLevel;
  reviewDate: Date;
}

export enum TaiwanRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaiwanApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

export interface TaiwanPersonalDataComplianceResult {
  success: boolean;
  complianceStatus: TaiwanComplianceStatus;
  violations: TaiwanPersonalDataViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
  auditTrail: TaiwanAuditTrail[];
  timestamp: Date;
}

export interface TaiwanPersonalDataViolation {
  id: string;
  violationType: TaiwanPersonalDataViolationType;
  description: string;
  severity: TaiwanViolationSeverity;
  applicableLaw: string;
  penalty: TaiwanPenalty;
  correctiveAction: string;
  deadline: Date;
  status: TaiwanViolationStatus;
}

export enum TaiwanPersonalDataViolationType {
  UNAUTHORIZED_COLLECTION = 'unauthorized_collection', // 未經Authorize蒐集
  UNAUTHORIZED_PROCESSING = 'unauthorized_processing', // 未經AuthorizeHandle
  UNAUTHORIZED_USE = 'unauthorized_use', // 未經Authorize利用
  UNAUTHORIZED_TRANSFER = 'unauthorized_transfer', // 未經Authorize傳輸
  INSUFFICIENT_SECURITY = 'insufficient_security', // 安全措施不足
  LACK_OF_CONSENT = 'lack_of_consent', // 缺乏Agree
  VIOLATION_OF_RIGHTS = 'violation_of_rights', // 侵害當事人權利
  BREACH_NOTIFICATION_FAILURE = 'breach_notification_failure', // 違規NotificationFailed
  OTHER = 'other', // 其他
}

export enum TaiwanViolationSeverity {
  MINOR = 'minor', // 輕微
  MODERATE = 'moderate', // 中等
  MAJOR = 'major', // 重大
  CRITICAL = 'critical', // 嚴重
}

export interface TaiwanPenalty {
  type: TaiwanPenaltyType;
  amount: number;
  description: string;
  deadline: Date;
  appealable: boolean;
}

export enum TaiwanPenaltyType {
  ADMINISTRATIVE_FINE = 'administrative_fine', // Row政罰鍰
  CEASE_AND_DESIST = 'cease_and_desist', // StopRow為
  CORRECTIVE_MEASURES = 'corrective_measures', // 改正措施
  PUBLIC_APOLOGY = 'public_apology', // 公On道歉
  COMPENSATION = 'compensation', // 賠償
  CRIMINAL_PENALTY = 'criminal_penalty', // 刑事處罰
  OTHER = 'other', // 其他
}

export enum TaiwanViolationStatus {
  OPEN = 'open', // On啟
  IN_PROGRESS = 'in_progress', // Handle中
  RESOLVED = 'resolved', // 已Resolve
  CLOSED = 'closed', // 已Off閉
  APPEALED = 'appealed', // 已上訴
}

export enum TaiwanComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review',
  EXEMPT = 'exempt',
}

export interface TaiwanAuditTrail {
  id: string;
  action: string;
  description: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
}
