// 台灣特定合規模組類型定義
// Taiwan Specific Compliance Module Type Definitions

// ==================== 個人資料保護法 (Personal Data Protection Act) ====================

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
  MEDICAL = 'medical', // 病歷、醫療、基因、性生活、健康檢查
  CRIMINAL = 'criminal', // 犯罪前科
  CONTACT = 'contact', // 聯絡方式
  LOCATION = 'location', // 位置資訊
  BEHAVIOR = 'behavior', // 網路活動紀錄
  PREFERENCE = 'preference', // 個人偏好
  OTHER = 'other', // 其他得以直接或間接方式識別該個人之資料
}

export enum TaiwanProcessingMethod {
  COLLECTION = 'collection', // 蒐集
  PROCESSING = 'processing', // 處理
  USE = 'use', // 利用
  INTERNATIONAL_TRANSFER = 'international_transfer', // 國際傳輸
  THIRD_PARTY_SHARING = 'third_party_sharing', // 委託他人蒐集、處理或利用
}

export enum TaiwanSecurityMeasure {
  ENCRYPTION = 'encryption', // 加密
  ACCESS_CONTROL = 'access_control', // 存取控制
  AUDIT_LOGGING = 'audit_logging', // 稽核日誌
  BACKUP = 'backup', // 備份
  DISASTER_RECOVERY = 'disaster_recovery', // 災害復原
  PHYSICAL_SECURITY = 'physical_security', // 實體安全
  NETWORK_SECURITY = 'network_security', // 網路安全
  PERSONNEL_SECURITY = 'personnel_security', // 人員安全
}

export enum TaiwanConsentMethod {
  EXPLICIT = 'explicit', // 明確同意
  IMPLICIT = 'implicit', // 默示同意
  ELECTRONIC = 'electronic', // 電子同意
  WRITTEN = 'written', // 書面同意
  VERBAL = 'verbal', // 口頭同意
}

export enum TaiwanDataSubjectRight {
  ACCESS = 'access', // 查詢或請求閱覽
  COPY = 'copy', // 請求製給複製本
  CORRECTION = 'correction', // 請求補充或更正
  DELETION = 'deletion', // 請求停止蒐集、處理或利用
  PORTABILITY = 'portability', // 請求刪除
  WITHDRAWAL = 'withdrawal', // 撤回同意
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

// ==================== 消費者保護法 (Consumer Protection Act) ====================

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

// ==================== 公平交易法 (Fair Trade Act) ====================

export interface TaiwanFairCompetition {
  id: string;
  competitionType: TaiwanCompetitionType;
  marketAnalysis: TaiwanMarketAnalysis;
  competitiveBehavior: TaiwanCompetitiveBehavior[];
  complianceStatus: TaiwanComplianceStatus;
  riskAssessment: TaiwanRiskAssessment;
  correctiveActions: TaiwanCorrectiveAction[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanCompetitionType {
  MONOPOLY = 'monopoly', // 獨占
  OLIGOPOLY = 'oligopoly', // 寡占
  CARTEL = 'cartel', // 聯合行為
  MERGER = 'merger', // 結合
  UNFAIR_COMPETITION = 'unfair_competition', // 不公平競爭
  ABUSE_OF_MARKET_POWER = 'abuse_of_market_power', // 濫用市場地位
}

export interface TaiwanMarketAnalysis {
  marketDefinition: string;
  marketShare: number;
  competitors: TaiwanCompetitor[];
  barriersToEntry: string[];
  marketTrends: string[];
  analysisDate: Date;
}

export interface TaiwanCompetitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  competitivePosition: string;
}

export interface TaiwanCompetitiveBehavior {
  behaviorType: TaiwanCompetitiveBehaviorType;
  description: string;
  targetMarket: string;
  implementationDate: Date;
  impact: TaiwanCompetitiveImpact;
  complianceCheck: TaiwanComplianceCheck;
}

export enum TaiwanCompetitiveBehaviorType {
  PRICE_FIXING = 'price_fixing', // 價格固定
  MARKET_ALLOCATION = 'market_allocation', // 市場分配
  BID_RIGGING = 'bid_rigging', // 圍標
  OUTPUT_RESTRICTION = 'output_restriction', // 限制產出
  BOYCOTT = 'boycott', // 杯葛
  TYING = 'tying', // 搭售
  EXCLUSIVE_DEALING = 'exclusive_dealing', // 獨家交易
  RESALE_PRICE_MAINTENANCE = 'resale_price_maintenance', // 轉售價格維持
  PREDATORY_PRICING = 'predatory_pricing', // 掠奪性定價
  OTHER = 'other', // 其他
}

export interface TaiwanCompetitiveImpact {
  impactType: TaiwanImpactType;
  severity: TaiwanImpactSeverity;
  affectedParties: string[];
  duration: number; // 天數
  reversibility: boolean;
}

export enum TaiwanImpactType {
  PRICE_INCREASE = 'price_increase', // 價格上漲
  PRICE_DECREASE = 'price_decrease', // 價格下跌
  QUALITY_DETERIORATION = 'quality_deterioration', // 品質惡化
  INNOVATION_REDUCTION = 'innovation_reduction', // 創新減少
  CHOICE_REDUCTION = 'choice_reduction', // 選擇減少
  MARKET_ENTRY_BLOCKED = 'market_entry_blocked', // 市場進入受阻
  OTHER = 'other', // 其他
}

export enum TaiwanImpactSeverity {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe',
}

export interface TaiwanComplianceCheck {
  checkDate: Date;
  checker: string;
  findings: string[];
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface TaiwanCorrectiveAction {
  actionType: TaiwanCorrectiveActionType;
  description: string;
  responsibleParty: string;
  deadline: Date;
  status: TaiwanActionStatus;
  effectiveness: TaiwanActionEffectiveness;
}

export enum TaiwanCorrectiveActionType {
  CEASE_AND_DESIST = 'cease_and_desist', // 停止行為
  DIVESTITURE = 'divestiture', // 分割
  REMEDIAL_MEASURES = 'remedial_measures', // 改正措施
  COMPENSATION = 'compensation', // 賠償
  PENALTY = 'penalty', // 罰鍰
  OTHER = 'other', // 其他
}

export enum TaiwanActionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

export enum TaiwanActionEffectiveness {
  HIGHLY_EFFECTIVE = 'highly_effective',
  EFFECTIVE = 'effective',
  PARTIALLY_EFFECTIVE = 'partially_effective',
  INEFFECTIVE = 'ineffective',
  UNKNOWN = 'unknown',
}

export interface TaiwanAdvertisingContent {
  id: string;
  adType: TaiwanAdType;
  content: string;
  targetAudience: string[];
  mediaChannels: TaiwanMediaChannel[];
  complianceCheck: TaiwanAdComplianceCheck;
  approvalStatus: TaiwanApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanAdType {
  PRINT = 'print', // 平面廣告
  BROADCAST = 'broadcast', // 廣播廣告
  DIGITAL = 'digital', // 數位廣告
  OUTDOOR = 'outdoor', // 戶外廣告
  DIRECT_MAIL = 'direct_mail', // 直郵廣告
  TELEMARKETING = 'telemarketing', // 電話行銷
  EMAIL = 'email', // 電子郵件廣告
  SMS = 'sms', // 簡訊廣告
  SOCIAL_MEDIA = 'social_media', // 社群媒體廣告
  INFLUENCER = 'influencer', // 網紅廣告
  OTHER = 'other', // 其他
}

export enum TaiwanMediaChannel {
  TELEVISION = 'television', // 電視
  RADIO = 'radio', // 廣播
  NEWSPAPER = 'newspaper', // 報紙
  MAGAZINE = 'magazine', // 雜誌
  INTERNET = 'internet', // 網路
  MOBILE = 'mobile', // 行動裝置
  SOCIAL_MEDIA = 'social_media', // 社群媒體
  SEARCH_ENGINE = 'search_engine', // 搜尋引擎
  VIDEO_PLATFORM = 'video_platform', // 影音平台
  OTHER = 'other', // 其他
}

export interface TaiwanAdComplianceCheck {
  checkDate: Date;
  checker: string;
  complianceAreas: TaiwanAdComplianceArea[];
  violations: TaiwanAdViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
}

export interface TaiwanAdComplianceArea {
  area: TaiwanComplianceArea;
  status: TaiwanComplianceStatus;
  findings: string[];
  requiredActions: string[];
}

export enum TaiwanComplianceArea {
  TRUTHFULNESS = 'truthfulness', // 真實性
  ACCURACY = 'accuracy', // 正確性
  COMPLETENESS = 'completeness', // 完整性
  FAIRNESS = 'fairness', // 公平性
  DECENCY = 'decency', // 善良風俗
  PRIVACY = 'privacy', // 隱私保護
  CHILDREN_PROTECTION = 'children_protection', // 兒童保護
  COMPARATIVE_ADVERTISING = 'comparative_advertising', // 比較廣告
  ENDORSEMENT = 'endorsement', // 代言廣告
  PRICE_ADVERTISING = 'price_advertising', // 價格廣告
  OTHER = 'other', // 其他
}

export interface TaiwanAdViolation {
  violationType: TaiwanViolationType;
  description: string;
  severity: TaiwanViolationSeverity;
  applicableLaw: string;
  penalty: TaiwanPenalty;
  correctiveAction: string;
}

export enum TaiwanViolationType {
  FALSE_CLAIM = 'false_claim', // 虛偽不實
  MISLEADING = 'misleading', // 引人錯誤
  EXAGGERATION = 'exaggeration', // 誇大
  OMISSION = 'omission', // 隱匿重要事實
  COMPARATIVE_VIOLATION = 'comparative_violation', // 比較廣告違規
  ENDORSEMENT_VIOLATION = 'endorsement_violation', // 代言廣告違規
  PRICE_VIOLATION = 'price_violation', // 價格廣告違規
  PRIVACY_VIOLATION = 'privacy_violation', // 隱私違規
  CHILDREN_PROTECTION_VIOLATION = 'children_protection_violation', // 兒童保護違規
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

// ==================== 電子商務法 (E-Commerce Act) ====================

export interface TaiwanECommerceContract {
  id: string;
  contractType: TaiwanContractType;
  parties: TaiwanContractParty[];
  terms: TaiwanContractTerm[];
  complianceCheck: TaiwanContractComplianceCheck;
  status: TaiwanContractStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanContractType {
  ONLINE_SALE = 'online_sale', // 網路買賣
  DIGITAL_CONTENT = 'digital_content', // 數位內容
  ONLINE_SERVICE = 'online_service', // 網路服務
  SUBSCRIPTION = 'subscription', // 訂閱服務
  MARKETPLACE = 'marketplace', // 平台服務
  AUCTION = 'auction', // 拍賣
  CROWDFUNDING = 'crowdfunding', // 群眾募資
  OTHER = 'other', // 其他
}

export interface TaiwanContractParty {
  type: TaiwanPartyType;
  name: string;
  identification: string;
  contactInfo: TaiwanContactInfo;
  role: TaiwanPartyRole;
}

export enum TaiwanPartyType {
  INDIVIDUAL = 'individual', // 自然人
  BUSINESS = 'business', // 企業
  GOVERNMENT = 'government', // 政府機關
  NON_PROFIT = 'non_profit', // 非營利組織
}

export enum TaiwanPartyRole {
  BUYER = 'buyer', // 買方
  SELLER = 'seller', // 賣方
  PLATFORM = 'platform', // 平台
  PAYMENT_PROVIDER = 'payment_provider', // 支付提供者
  LOGISTICS_PROVIDER = 'logistics_provider', // 物流提供者
  OTHER = 'other', // 其他
}

export interface TaiwanContractTerm {
  termType: TaiwanTermType;
  content: string;
  mandatory: boolean;
  complianceStatus: TaiwanComplianceStatus;
  riskLevel: TaiwanRiskLevel;
}

export enum TaiwanTermType {
  PRODUCT_DESCRIPTION = 'product_description', // 商品描述
  PRICE = 'price', // 價格
  PAYMENT = 'payment', // 付款
  DELIVERY = 'delivery', // 交付
  WARRANTY = 'warranty', // 保證
  RETURN_POLICY = 'return_policy', // 退貨政策
  PRIVACY_POLICY = 'privacy_policy', // 隱私政策
  LIABILITY = 'liability', // 責任
  DISPUTE_RESOLUTION = 'dispute_resolution', // 爭議解決
  GOVERNING_LAW = 'governing_law', // 準據法
  OTHER = 'other', // 其他
}

export interface TaiwanContractComplianceCheck {
  checkDate: Date;
  checker: string;
  complianceAreas: TaiwanContractComplianceArea[];
  violations: TaiwanContractViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
}

export interface TaiwanContractComplianceArea {
  area: TaiwanContractComplianceAreaType;
  status: TaiwanComplianceStatus;
  findings: string[];
  requiredActions: string[];
}

export enum TaiwanContractComplianceAreaType {
  CONSUMER_RIGHTS = 'consumer_rights', // 消費者權利
  FAIR_CONTRACT = 'fair_contract', // 公平契約
  PRIVACY_PROTECTION = 'privacy_protection', // 隱私保護
  ELECTRONIC_SIGNATURE = 'electronic_signature', // 電子簽章
  DATA_PROTECTION = 'data_protection', // 資料保護
  CROSS_BORDER = 'cross_border', // 跨境交易
  TAX_COMPLIANCE = 'tax_compliance', // 稅務合規
  OTHER = 'other', // 其他
}

export interface TaiwanContractViolation {
  violationType: TaiwanContractViolationType;
  description: string;
  severity: TaiwanViolationSeverity;
  applicableLaw: string;
  penalty: TaiwanPenalty;
  correctiveAction: string;
}

export enum TaiwanContractViolationType {
  UNFAIR_TERMS = 'unfair_terms', // 不公平條款
  CONSUMER_RIGHTS_VIOLATION = 'consumer_rights_violation', // 消費者權利違規
  PRIVACY_VIOLATION = 'privacy_violation', // 隱私違規
  ELECTRONIC_SIGNATURE_VIOLATION = 'electronic_signature_violation', // 電子簽章違規
  DATA_PROTECTION_VIOLATION = 'data_protection_violation', // 資料保護違規
  TAX_VIOLATION = 'tax_violation', // 稅務違規
  OTHER = 'other', // 其他
}

export enum TaiwanContractStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 生效
  SUSPENDED = 'suspended', // 暫停
  TERMINATED = 'terminated', // 終止
  EXPIRED = 'expired', // 期滿
  DISPUTED = 'disputed', // 爭議中
}

export interface TaiwanPlatformLiability {
  id: string;
  platformType: TaiwanPlatformType;
  liabilityType: TaiwanLiabilityType;
  conditions: TaiwanLiabilityCondition[];
  exemptions: TaiwanLiabilityExemption[];
  complianceStatus: TaiwanComplianceStatus;
  riskAssessment: TaiwanRiskAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanPlatformType {
  E_COMMERCE = 'e_commerce', // 電子商務平台
  SOCIAL_MEDIA = 'social_media', // 社群媒體平台
  CONTENT_SHARING = 'content_sharing', // 內容分享平台
  PAYMENT = 'payment', // 支付平台
  LOGISTICS = 'logistics', // 物流平台
  FINANCIAL = 'financial', // 金融平台
  OTHER = 'other', // 其他
}

export enum TaiwanLiabilityType {
  DIRECT_LIABILITY = 'direct_liability', // 直接責任
  VICARIOUS_LIABILITY = 'vicarious_liability', // 替代責任
  JOINT_LIABILITY = 'joint_liability', // 連帶責任
  LIMITED_LIABILITY = 'limited_liability', // 限制責任
  NO_LIABILITY = 'no_liability', // 免責
}

export interface TaiwanLiabilityCondition {
  condition: string;
  description: string;
  applicable: boolean;
  verificationMethod: string;
}

export interface TaiwanLiabilityExemption {
  exemptionType: TaiwanExemptionType;
  description: string;
  conditions: string[];
  applicable: boolean;
}

export enum TaiwanExemptionType {
  SAFE_HARBOR = 'safe_harbor', // 安全港
  GOOD_FAITH = 'good_faith', // 善意
  TECHNICAL_NEUTRALITY = 'technical_neutrality', // 技術中立
  PASSIVE_CONDUCT = 'passive_conduct', // 被動行為
  OTHER = 'other', // 其他
}

// ==================== 電子支付管理條例 (Electronic Payment Management Act) ====================

export interface TaiwanPaymentInstitution {
  id: string;
  institutionType: TaiwanPaymentInstitutionType;
  licenseInfo: TaiwanLicenseInfo;
  businessScope: TaiwanBusinessScope[];
  complianceStatus: TaiwanComplianceStatus;
  riskAssessment: TaiwanRiskAssessment;
  auditReport: TaiwanAuditReport;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaiwanPaymentInstitutionType {
  ELECTRONIC_PAYMENT = 'electronic_payment', // 電子支付機構
  THIRD_PARTY_PAYMENT = 'third_party_payment', // 第三方支付
  DIGITAL_WALLET = 'digital_wallet', // 數位錢包
  MOBILE_PAYMENT = 'mobile_payment', // 行動支付
  CRYPTOCURRENCY = 'cryptocurrency', // 虛擬通貨
  OTHER = 'other', // 其他
}

export interface TaiwanLicenseInfo {
  licenseNumber: string;
  licenseType: TaiwanLicenseType;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: TaiwanLicenseStatus;
  conditions: string[];
}

export enum TaiwanLicenseType {
  ELECTRONIC_PAYMENT_LICENSE = 'electronic_payment_license', // 電子支付機構執照
  THIRD_PARTY_PAYMENT_LICENSE = 'third_party_payment_license', // 第三方支付執照
  MONEY_TRANSMISSION_LICENSE = 'money_transmission_license', // 匯兌執照
  OTHER = 'other', // 其他
}

export enum TaiwanLicenseStatus {
  ACTIVE = 'active', // 有效
  SUSPENDED = 'suspended', // 暫停
  REVOKED = 'revoked', // 撤銷
  EXPIRED = 'expired', // 期滿
  UNDER_REVIEW = 'under_review', // 審查中
}

export interface TaiwanBusinessScope {
  scopeType: TaiwanBusinessScopeType;
  description: string;
  limits: TaiwanBusinessLimit[];
  complianceRequirements: string[];
}

export enum TaiwanBusinessScopeType {
  PAYMENT_PROCESSING = 'payment_processing', // 支付處理
  MONEY_TRANSMISSION = 'money_transmission', // 匯兌
  DIGITAL_WALLET = 'digital_wallet', // 數位錢包
  PREPAID_CARD = 'prepaid_card', // 儲值卡
  CROSS_BORDER = 'cross_border', // 跨境支付
  OTHER = 'other', // 其他
}

export interface TaiwanBusinessLimit {
  limitType: TaiwanLimitType;
  amount: number;
  currency: string;
  period: string;
  description: string;
}

export enum TaiwanLimitType {
  DAILY_LIMIT = 'daily_limit', // 每日限額
  MONTHLY_LIMIT = 'monthly_limit', // 每月限額
  ANNUAL_LIMIT = 'annual_limit', // 每年限額
  TRANSACTION_LIMIT = 'transaction_limit', // 單筆限額
  BALANCE_LIMIT = 'balance_limit', // 餘額限額
  OTHER = 'other', // 其他
}

export interface TaiwanAuditReport {
  auditDate: Date;
  auditor: string;
  auditScope: string[];
  findings: TaiwanAuditFinding[];
  recommendations: string[];
  complianceScore: number;
  riskLevel: TaiwanRiskLevel;
}

export interface TaiwanAuditFinding {
  findingType: TaiwanFindingType;
  description: string;
  severity: TaiwanFindingSeverity;
  impact: string;
  correctiveAction: string;
  deadline: Date;
}

export enum TaiwanFindingType {
  COMPLIANCE_VIOLATION = 'compliance_violation', // 合規違規
  OPERATIONAL_RISK = 'operational_risk', // 營運風險
  FINANCIAL_RISK = 'financial_risk', // 財務風險
  SECURITY_RISK = 'security_risk', // 安全風險
  REPUTATIONAL_RISK = 'reputational_risk', // 聲譽風險
  OTHER = 'other', // 其他
}

export enum TaiwanFindingSeverity {
  LOW = 'low', // 低
  MEDIUM = 'medium', // 中
  HIGH = 'high', // 高
  CRITICAL = 'critical', // 嚴重
}

// ==================== 通用類型 ====================

export interface TaiwanComplianceResult {
  success: boolean;
  complianceStatus: TaiwanComplianceStatus;
  violations: TaiwanViolation[];
  recommendations: string[];
  riskLevel: TaiwanRiskLevel;
  auditTrail: TaiwanAuditTrail[];
  timestamp: Date;
}

export interface TaiwanViolation {
  id: string;
  type: string;
  description: string;
  severity: TaiwanViolationSeverity;
  applicableLaw: string;
  penalty: TaiwanPenalty;
  correctiveAction: string;
  deadline: Date;
  status: TaiwanViolationStatus;
}

export enum TaiwanViolationStatus {
  OPEN = 'open', // 開啟
  IN_PROGRESS = 'in_progress', // 處理中
  RESOLVED = 'resolved', // 已解決
  CLOSED = 'closed', // 已關閉
  APPEALED = 'appealed', // 已上訴
}

export interface TaiwanAuditTrail {
  id: string;
  action: string;
  description: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface TaiwanComplianceReport {
  id: string;
  reportType: TaiwanReportType;
  period: TaiwanReportPeriod;
  data: TaiwanComplianceData;
  summary: TaiwanComplianceSummary;
  recommendations: string[];
  generatedAt: Date;
}

export enum TaiwanReportType {
  MONTHLY = 'monthly', // 月報
  QUARTERLY = 'quarterly', // 季報
  ANNUAL = 'annual', // 年報
  INCIDENT = 'incident', // 事件報告
  AUDIT = 'audit', // 審計報告
  OTHER = 'other', // 其他
}

export interface TaiwanReportPeriod {
  startDate: Date;
  endDate: Date;
  type: TaiwanReportType;
}

export interface TaiwanComplianceData {
  totalChecks: number;
  compliantChecks: number;
  nonCompliantChecks: number;
  violations: TaiwanViolation[];
  riskAssessments: TaiwanRiskAssessment[];
  correctiveActions: TaiwanCorrectiveAction[];
}

export interface TaiwanComplianceSummary {
  overallStatus: TaiwanComplianceStatus;
  riskLevel: TaiwanRiskLevel;
  keyFindings: string[];
  trends: TaiwanComplianceTrend[];
  nextSteps: string[];
}

export interface TaiwanComplianceTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  direction: TaiwanTrendDirection;
}

export enum TaiwanTrendDirection {
  IMPROVING = 'improving', // 改善
  DECLINING = 'declining', // 惡化
  STABLE = 'stable', // 穩定
}
