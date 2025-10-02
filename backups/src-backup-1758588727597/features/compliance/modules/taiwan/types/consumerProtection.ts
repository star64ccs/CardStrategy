// 台灣消費者保護法類型定義
// Taiwan Consumer Protection Act Type Definitions

export interface TaiwanConsumerRights {
  id: string;
  rightType: TaiwanConsumerRightType;
  description: string;
  applicableProducts: string[];
  applicableServices: string[];
  enforcementMechanism: TaiwanEnforcementMechanism;
  compensationAvailable: boolean;
  complaintProcess: TaiwanComplaintProcess;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanConsumerRightType {
  SAFETY = 'safety', // 安全權
  INFORMATION = 'information', // 資訊權
  CHOICE = 'choice', // 選擇權
  REPRESENTATION = 'representation', // 表達權
  COMPENSATION = 'compensation', // 求償權
  EDUCATION = 'education', // 教育權
  HEALTHY_ENVIRONMENT = 'healthy_environment', // 健康環境權
}

export enum TaiwanEnforcementMechanism {
  ADMINISTRATIVE = 'administrative', // 行政救濟
  JUDICIAL = 'judicial', // 司法救濟
  MEDIATION = 'mediation', // 調解
  ARBITRATION = 'arbitration', // 仲裁
  CONSUMER_ORGANIZATION = 'consumer_organization', // 消費者團體
}

export interface TaiwanComplaintProcess {
  steps: TaiwanComplaintStep[];
  timeframes: TaiwanComplaintTimeframe[];
  requiredDocuments: string[];
  contactInfo: TaiwanContactInfo;
}

export interface TaiwanComplaintStep {
  stepNumber: number;
  description: string;
  responsibleParty: string;
  timeframe: number; // 天數
  requiredActions: string[];
}

export interface TaiwanComplaintTimeframe {
  stage: string;
  timeframe: number; // 天數
  extensionConditions: string[];
}

export interface TaiwanContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  officeHours: string;
}

export interface TaiwanProductLabeling {
  id: string;
  productType: TaiwanProductType;
  requiredLabels: TaiwanRequiredLabel[];
  optionalLabels: TaiwanOptionalLabel[];
  labelingStandards: TaiwanLabelingStandard[];
  complianceStatus: TaiwanComplianceStatus;
  inspectionDate: Date;
  nextInspectionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanProductType {
  FOOD = 'food', // 食品
  COSMETICS = 'cosmetics', // 化妝品
  MEDICAL_DEVICES = 'medical_devices', // 醫療器材
  ELECTRONICS = 'electronics', // 電子產品
  TOYS = 'toys', // 玩具
  CLOTHING = 'clothing', // 服飾
  DIGITAL_CONTENT = 'digital_content', // 數位內容
  FINANCIAL_PRODUCTS = 'financial_products', // 金融商品
  OTHER = 'other', // 其他
}

export interface TaiwanRequiredLabel {
  labelType: string;
  content: string;
  format: string;
  language: string[];
  placement: string;
  size: string;
  color: string;
}

export interface TaiwanOptionalLabel {
  labelType: string;
  content: string;
  format: string;
  language: string[];
  placement: string;
  size: string;
  color: string;
  conditions: string[];
}

export interface TaiwanLabelingStandard {
  standardCode: string;
  standardName: string;
  issuingAuthority: string;
  effectiveDate: Date;
  requirements: string[];
  complianceCriteria: string[];
}

export enum TaiwanComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review',
  EXEMPT = 'exempt',
}

export interface TaiwanConsumerDispute {
  id: string;
  disputeType: TaiwanDisputeType;
  consumerInfo: TaiwanConsumerInfo;
  businessInfo: TaiwanBusinessInfo;
  productInfo: TaiwanProductInfo;
  disputeDetails: TaiwanDisputeDetails;
  evidence: TaiwanEvidence[];
  resolution: TaiwanResolution;
  status: TaiwanDisputeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanDisputeType {
  PRODUCT_DEFECT = 'product_defect', // 商品瑕疵
  SERVICE_DEFECT = 'service_defect', // 服務瑕疵
  FALSE_ADVERTISING = 'false_advertising', // 不實廣告
  UNFAIR_CONTRACT = 'unfair_contract', // 不公平契約
  PRICE_GOUGING = 'price_gouging', // 哄抬物價
  PRIVACY_VIOLATION = 'privacy_violation', // 隱私侵害
  ONLINE_FRAUD = 'online_fraud', // 網路詐騙
  OTHER = 'other', // 其他
}

export interface TaiwanConsumerInfo {
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  age: number;
  gender: string;
}

export interface TaiwanBusinessInfo {
  name: string;
  businessNumber: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
  registrationDate: Date;
}

export interface TaiwanProductInfo {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  warrantyPeriod: number;
}

export interface TaiwanDisputeDetails {
  description: string;
  incidentDate: Date;
  location: string;
  damages: TaiwanDamage[];
  requestedRelief: string[];
  urgency: TaiwanUrgencyLevel;
}

export interface TaiwanDamage {
  type: string;
  description: string;
  amount: number;
  evidence: string[];
}

export enum TaiwanUrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface TaiwanEvidence {
  type: TaiwanEvidenceType;
  description: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: Date;
  verified: boolean;
}

export enum TaiwanEvidenceType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  RECEIPT = 'receipt',
  CONTRACT = 'contract',
  EMAIL = 'email',
  SMS = 'sms',
  WITNESS_STATEMENT = 'witness_statement',
  EXPERT_OPINION = 'expert_opinion',
  OTHER = 'other',
}

export interface TaiwanResolution {
  resolutionType: TaiwanResolutionType;
  description: string;
  amount: number;
  actions: string[];
  deadline: Date;
  status: TaiwanResolutionStatus;
  mediatorInfo?: TaiwanMediatorInfo;
}

export enum TaiwanResolutionType {
  REFUND = 'refund', // 退款
  REPLACEMENT = 'replacement', // 更換
  REPAIR = 'repair', // 修理
  COMPENSATION = 'compensation', // 賠償
  APOLOGY = 'apology', // 道歉
  CORRECTIVE_ACTION = 'corrective_action', // 改正措施
  OTHER = 'other', // 其他
}

export enum TaiwanResolutionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  VERIFIED = 'verified',
  CLOSED = 'closed',
}

export interface TaiwanMediatorInfo {
  name: string;
  organization: string;
  phone: string;
  email: string;
  qualification: string;
  experience: number;
}

export enum TaiwanDisputeStatus {
  FILED = 'filed', // 已申訴
  UNDER_REVIEW = 'under_review', // 審查中
  MEDIATION = 'mediation', // 調解中
  RESOLVED = 'resolved', // 已解決
  CLOSED = 'closed', // 已結案
  APPEALED = 'appealed', // 已上訴
}

export interface TaiwanConsumerProtectionComplianceResult {
  success: boolean;
  complianceStatus: TaiwanComplianceStatus;
  violations: TaiwanConsumerProtectionViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
  auditTrail: TaiwanAuditTrail[];
  timestamp: Date;
}

export interface TaiwanConsumerProtectionViolation {
  id: string;
  violationType: TaiwanConsumerProtectionViolationType;
  description: string;
  severity: TaiwanViolationSeverity;
  applicableLaw: string;
  penalty: TaiwanPenalty;
  correctiveAction: string;
  deadline: Date;
  status: TaiwanViolationStatus;
}

export enum TaiwanConsumerProtectionViolationType {
  PRODUCT_SAFETY_VIOLATION = 'product_safety_violation', // 商品安全違規
  FALSE_ADVERTISING = 'false_advertising', // 不實廣告
  UNFAIR_CONTRACT = 'unfair_contract', // 不公平契約
  PRICE_GOUGING = 'price_gouging', // 哄抬物價
  SERVICE_DEFECT = 'service_defect', // 服務瑕疵
  CONSUMER_RIGHTS_VIOLATION = 'consumer_rights_violation', // 消費者權利違規
  LABELING_VIOLATION = 'labeling_violation', // 標示違規
  WARRANTY_VIOLATION = 'warranty_violation', // 保證違規
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
  ADMINISTRATIVE_FINE = 'administrative_fine', // 行政罰鍰
  CEASE_AND_DESIST = 'cease_and_desist', // 停止行為
  CORRECTIVE_MEASURES = 'corrective_measures', // 改正措施
  PUBLIC_APOLOGY = 'public_apology', // 公開道歉
  COMPENSATION = 'compensation', // 賠償
  CRIMINAL_PENALTY = 'criminal_penalty', // 刑事處罰
  OTHER = 'other', // 其他
}

export enum TaiwanViolationStatus {
  OPEN = 'open', // 開啟
  IN_PROGRESS = 'in_progress', // 處理中
  RESOLVED = 'resolved', // 已解決
  CLOSED = 'closed', // 已關閉
  APPEALED = 'appealed', // 已上訴
}

export enum TaiwanRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface TaiwanAuditTrail {
  id: string;
  action: string;
  description: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
}
