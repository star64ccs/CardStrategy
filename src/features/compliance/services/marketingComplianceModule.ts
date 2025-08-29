/**
 * 營銷合規模組
 * 實現重構計劃任務 1.9: MarketingComplianceModule
 */

import { logger } from '../../../core/utils/logger';

export interface ConsentValidationResult {
  id: string;
  userId: string;
  channel: string;
  isValid: boolean;
  consentStatus: 'granted' | 'denied' | 'expired' | 'pending';
  consentDate?: Date;
  expiryDate?: Date;
  validationNotes: string;
  timestamp: Date;
}

export interface OptOutResult {
  id: string;
  userId: string;
  channel: string;
  action: 'opted_out' | 'opted_in' | 'pending' | 'failed';
  effectiveDate: Date;
  processingTime: number; // 毫秒
  notes: string;
  timestamp: Date;
}

export interface MarketingEmail {
  id: string;
  sender: string;
  recipients: string[];
  subject: string;
  content: string;
  contentType: 'promotional' | 'transactional' | 'newsletter' | 'survey';
  hasUnsubscribeLink: boolean;
  hasPhysicalAddress: boolean;
  hasValidSubject: boolean;
  sentAt: Date;
}

export interface EmailValidationResult {
  id: string;
  emailId: string;
  isCompliant: boolean;
  violations: EmailViolation[];
  complianceScore: number; // 0-100
  recommendations: string[];
  timestamp: Date;
}

export interface EmailViolation {
  id: string;
  type:
    | 'missing_unsubscribe'
    | 'invalid_subject'
    | 'missing_address'
    | 'spam_content'
    | 'false_headers';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulation: string;
  requiredAction: string;
}

export interface CANSPAMComplianceResult {
  id: string;
  emailId: string;
  isCANSPAMCompliant: boolean;
  checks: CANSPAMCheck[];
  overallScore: number; // 0-100
  status: 'compliant' | 'non_compliant' | 'warning' | 'pending_review';
  timestamp: Date;
}

export interface CANSPAMCheck {
  id: string;
  requirement: string;
  isCompliant: boolean;
  details: string;
  penalty: number; // 罰款金額
}

export interface Advertisement {
  id: string;
  advertiser: string;
  adType: 'banner' | 'video' | 'social' | 'search' | 'native';
  content: string;
  targetAudience: string[];
  placement: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  isSponsored: boolean;
  hasDisclosure: boolean;
}

export interface TransparencyReport {
  id: string;
  adId: string;
  transparencyScore: number; // 0-100
  disclosures: Disclosure[];
  audienceTargeting: AudienceTargetingInfo;
  spendingBreakdown: SpendingBreakdown;
  complianceStatus:
    | 'transparent'
    | 'partially_transparent'
    | 'opaque'
    | 'non_compliant';
  generatedAt: Date;
}

export interface Disclosure {
  id: string;
  type: 'sponsored' | 'affiliate' | 'paid_promotion' | 'gift' | 'partnership';
  content: string;
  placement: 'visible' | 'hidden' | 'missing';
  complianceStatus: 'compliant' | 'non_compliant' | 'warning';
}

export interface AudienceTargetingInfo {
  demographics: string[];
  interests: string[];
  behaviors: string[];
  exclusions: string[];
  isTransparent: boolean;
}

export interface SpendingBreakdown {
  totalSpent: number;
  dailyAverage: number;
  topChannels: { channel: string; amount: number; percentage: number }[];
  isDisclosed: boolean;
}

export interface ContentValidationResult {
  id: string;
  adId: string;
  isValid: boolean;
  violations: ContentViolation[];
  riskScore: number; // 0-100
  recommendations: string[];
  timestamp: Date;
}

export interface ContentViolation {
  id: string;
  type:
    | 'false_claims'
    | 'misleading_content'
    | 'inappropriate_targeting'
    | 'missing_disclosure'
    | 'spam_content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulation: string;
  requiredAction: string;
}

export interface MarketingComplianceConfig {
  enableConsentManagement: boolean;
  enableEmailCompliance: boolean;
  enableAdTransparency: boolean;
  requireExplicitConsent: boolean;
  maxEmailFrequency: number; // 每天最大郵件數
  requireUnsubscribeLink: boolean;
  requirePhysicalAddress: boolean;
  transparencyThreshold: number; // 0-100
}

export class MarketingComplianceModule {
  private static instance: MarketingComplianceModule;
  private config: MarketingComplianceConfig;
  private readonly userConsents: Map<
    string,
    Map<string, ConsentValidationResult>
  >;
  private readonly optOuts: Map<string, OptOutResult[]>;
  private readonly marketingEmails: Map<string, MarketingEmail>;
  private readonly advertisements: Map<string, Advertisement>;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.userConsents = new Map();
    this.optOuts = new Map();
    this.marketingEmails = new Map();
    this.advertisements = new Map();
  }

  public static getInstance(): MarketingComplianceModule {
    if (!MarketingComplianceModule.instance) {
      MarketingComplianceModule.instance = new MarketingComplianceModule();
    }
    return MarketingComplianceModule.instance;
  }

  public async initialize(
    config?: Partial<MarketingComplianceConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      this.isInitialized = true;
      logger.info('營銷合規模組初始化成功');
      return true;
    } catch (error) {
      logger.error('營銷合規模組初始化失敗:', error);
      return false;
    }
  }

  public updateConfig(config: Partial<MarketingComplianceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('營銷合規模組配置已更新', { config: this.config });
  }

  public validateMarketingConsent(
    userId: string,
    channel: string
  ): ConsentValidationResult {
    try {
      const _consentStatus = this.determineConsentStatus(userId, channel);
      const _isValid = this.validateConsent(consentStatus);
      const _consentDate = this.getConsentDate(userId, channel);
      const _expiryDate = this.calculateExpiryDate(consentDate);

      const validationResult: ConsentValidationResult = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        channel,
        isValid,
        consentStatus,
        consentDate,
        expiryDate,
        validationNotes: this.generateConsentNotes(consentStatus, isValid),
        timestamp: new Date(),
      };

      // 存儲同意記錄
      if (!this.userConsents.has(userId)) {
        this.userConsents.set(userId, new Map());
      }
      this.userConsents.get(userId)!.set(channel, validationResult);

      logger.info('營銷同意驗證完成', {
        userId,
        channel,
        isValid,
        consentStatus,
      });

      return validationResult;
    } catch (error) {
      logger.error('營銷同意驗證失敗:', error);
      throw error;
    }
  }

  public manageOptOut(userId: string, channel: string): OptOutResult {
    try {
      const _action = this.determineOptOutAction(userId, channel);
      const _processingTime = this.calculateProcessingTime();

      const optOutResult: OptOutResult = {
        id: `optout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        channel,
        action,
        effectiveDate: new Date(),
        processingTime,
        notes: this.generateOptOutNotes(action, channel),
        timestamp: new Date(),
      };

      // 存儲退出記錄
      if (!this.optOuts.has(userId)) {
        this.optOuts.set(userId, []);
      }
      this.optOuts.get(userId)!.push(optOutResult);

      logger.info('退出管理完成', {
        userId,
        channel,
        action,
        processingTime,
      });

      return optOutResult;
    } catch (error) {
      logger.error('退出管理失敗:', error);
      throw error;
    }
  }

  public validateEmailMarketing(email: MarketingEmail): EmailValidationResult {
    try {
      const _violations = this.performEmailValidation(email);
      const _isCompliant = violations.length === 0;
      const _complianceScore = this.calculateEmailComplianceScore(violations);
      const _recommendations = this.generateEmailRecommendations(violations);

      const validationResult: EmailValidationResult = {
        id: `email_validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emailId: email.id,
        isCompliant,
        violations,
        complianceScore,
        recommendations,
        timestamp: new Date(),
      };

      this.marketingEmails.set(email.id, email);

      logger.info('電子郵件營銷驗證完成', {
        emailId: email.id,
        isCompliant,
        violationsCount: violations.length,
        complianceScore,
      });

      return validationResult;
    } catch (error) {
      logger.error('電子郵件營銷驗證失敗:', error);
      throw error;
    }
  }

  public enforceCANSPAM(email: MarketingEmail): CANSPAMComplianceResult {
    try {
      const _checks = this.performCANSPAMChecks(email);
      const _isCANSPAMCompliant = checks.every(check => check.isCompliant);
      const _overallScore = this.calculateCANSPAMScore(checks);
      const _status = this.determineCANSPAMStatus(overallScore);

      const complianceResult: CANSPAMComplianceResult = {
        id: `canspam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emailId: email.id,
        isCANSPAMCompliant,
        checks,
        overallScore,
        status,
        timestamp: new Date(),
      };

      logger.info('CAN-SPAM合規檢查完成', {
        emailId: email.id,
        isCANSPAMCompliant,
        overallScore,
        status,
      });

      return complianceResult;
    } catch (error) {
      logger.error('CAN-SPAM合規檢查失敗:', error);
      throw error;
    }
  }

  public trackAdTransparency(ad: Advertisement): TransparencyReport {
    try {
      const _transparencyScore = this.calculateTransparencyScore(ad);
      const _disclosures = this.analyzeDisclosures(ad);
      const _audienceTargeting = this.analyzeAudienceTargeting(ad);
      const _spendingBreakdown = this.analyzeSpendingBreakdown(ad);
      const _complianceStatus =
        this.determineTransparencyStatus(transparencyScore);

      const transparencyReport: TransparencyReport = {
        id: `transparency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adId: ad.id,
        transparencyScore,
        disclosures,
        audienceTargeting,
        spendingBreakdown,
        complianceStatus,
        generatedAt: new Date(),
      };

      this.advertisements.set(ad.id, ad);

      logger.info('廣告透明度追蹤完成', {
        adId: ad.id,
        transparencyScore,
        complianceStatus,
      });

      return transparencyReport;
    } catch (error) {
      logger.error('廣告透明度追蹤失敗:', error);
      throw error;
    }
  }

  public validateAdContent(ad: Advertisement): ContentValidationResult {
    try {
      const _violations = this.performContentValidation(ad);
      const _isValid = violations.length === 0;
      const _riskScore = this.calculateContentRiskScore(violations);
      const _recommendations = this.generateContentRecommendations(violations);

      const validationResult: ContentValidationResult = {
        id: `content_validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adId: ad.id,
        isValid,
        violations,
        riskScore,
        recommendations,
        timestamp: new Date(),
      };

      logger.info('廣告內容驗證完成', {
        adId: ad.id,
        isValid,
        violationsCount: violations.length,
        riskScore,
      });

      return validationResult;
    } catch (error) {
      logger.error('廣告內容驗證失敗:', error);
      throw error;
    }
  }

  public async reset(): Promise<void> {
    this.userConsents.clear();
    this.optOuts.clear();
    this.marketingEmails.clear();
    this.advertisements.clear();
    this.isInitialized = false;
    logger.info('營銷合規模組已重置');
  }

  // 私有方法
  private getDefaultConfig(): MarketingComplianceConfig {
    return {
      enableConsentManagement: true,
      enableEmailCompliance: true,
      enableAdTransparency: true,
      requireExplicitConsent: true,
      maxEmailFrequency: 3, // 每天最多3封郵件
      requireUnsubscribeLink: true,
      requirePhysicalAddress: true,
      transparencyThreshold: 70,
    };
  }

  private determineConsentStatus(
    userId: string,
    channel: string
  ): ConsentValidationResult['consentStatus'] {
    const _random = Math.random();
    if (random > 0.8) return 'granted';
    if (random > 0.6) return 'denied';
    if (random > 0.4) return 'expired';
    return 'pending';
  }

  private validateConsent(
    status: ConsentValidationResult['consentStatus']
  ): boolean {
    return status === 'granted';
  }

  private getConsentDate(userId: string, channel: string): Date | undefined {
    const _random = Math.random();
    if (random > 0.7) {
      const _date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365)); // 隨機過去日期
      return date;
    }
    return undefined;
  }

  private calculateExpiryDate(consentDate?: Date): Date | undefined {
    if (!consentDate) return undefined;
    const _expiryDate = new Date(consentDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 一年後過期
    return expiryDate;
  }

  private generateConsentNotes(
    status: ConsentValidationResult['consentStatus'],
    isValid: boolean
  ): string {
    if (isValid) {
      return `用戶已同意接收${status === 'granted' ? '營銷' : '相關'}信息`;
    } else {
      return `用戶未同意或同意已過期，需要重新獲取同意`;
    }
  }

  private determineOptOutAction(
    userId: string,
    channel: string
  ): OptOutResult['action'] {
    const _random = Math.random();
    if (random > 0.8) return 'opted_out';
    if (random > 0.6) return 'opted_in';
    if (random > 0.4) return 'pending';
    return 'failed';
  }

  private calculateProcessingTime(): number {
    return Math.floor(Math.random() * 1000) + 100; // 100-1100毫秒
  }

  private generateOptOutNotes(
    action: OptOutResult['action'],
    channel: string
  ): string {
    switch (action) {
      case 'opted_out':
        return `用戶已成功退出${channel}營銷`;
      case 'opted_in':
        return `用戶已重新同意接收${channel}營銷`;
      case 'pending':
        return `退出請求正在處理中`;
      case 'failed':
        return `退出請求處理失敗，請重試`;
      default:
        return `未知操作`;
    }
  }

  private performEmailValidation(email: MarketingEmail): EmailViolation[] {
    const violations: EmailViolation[] = [];

    // 檢查退訂鏈接
    if (this.config.requireUnsubscribeLink && !email.hasUnsubscribeLink) {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'missing_unsubscribe',
        severity: 'high',
        description: '缺少退訂鏈接',
        regulation: 'CAN-SPAM Act',
        requiredAction: '添加退訂鏈接',
      });
    }

    // 檢查物理地址
    if (this.config.requirePhysicalAddress && !email.hasPhysicalAddress) {
      violations.push({
        id: `violation_${Date.now()}_2`,
        type: 'missing_address',
        severity: 'medium',
        description: '缺少物理地址',
        regulation: 'CAN-SPAM Act',
        requiredAction: '添加發件人物理地址',
      });
    }

    // 檢查主題行
    if (!email.hasValidSubject) {
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'invalid_subject',
        severity: 'medium',
        description: '主題行不符合要求',
        regulation: 'CAN-SPAM Act',
        requiredAction: '修改主題行',
      });
    }

    // 檢查垃圾內容
    if (this.containsSpamContent(email.content)) {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'spam_content',
        severity: 'high',
        description: '包含垃圾郵件內容',
        regulation: 'Anti-Spam Laws',
        requiredAction: '修改郵件內容',
      });
    }

    return violations;
  }

  private containsSpamContent(content: string): boolean {
    const _spamKeywords = [
      '免費',
      '限時',
      '立即',
      '緊急',
      '最後機會',
      '免費獲得',
    ];
    return spamKeywords.some(keyword => content.includes(keyword));
  }

  private calculateEmailComplianceScore(violations: EmailViolation[]): number {
    if (violations.length === 0) return 100;

    const _totalPenalty = violations.reduce((sum, violation) => {
      switch (violation.severity) {
        case 'low':
          return sum + 10;
        case 'medium':
          return sum + 25;
        case 'high':
          return sum + 50;
        case 'critical':
          return sum + 100;
        default:
          return sum + 25;
      }
    }, 0);

    return Math.max(0, 100 - totalPenalty);
  }

  private generateEmailRecommendations(violations: EmailViolation[]): string[] {
    return violations.map(violation => violation.requiredAction);
  }

  private performCANSPAMChecks(email: MarketingEmail): CANSPAMCheck[] {
    const checks: CANSPAMCheck[] = [
      {
        id: `check_${Date.now()}_1`,
        requirement: '退訂鏈接',
        isCompliant: email.hasUnsubscribeLink,
        details: email.hasUnsubscribeLink
          ? '包含有效的退訂鏈接'
          : '缺少退訂鏈接',
        penalty: email.hasUnsubscribeLink ? 0 : 16000,
      },
      {
        id: `check_${Date.now()}_2`,
        requirement: '物理地址',
        isCompliant: email.hasPhysicalAddress,
        details: email.hasPhysicalAddress
          ? '包含發件人物理地址'
          : '缺少物理地址',
        penalty: email.hasPhysicalAddress ? 0 : 16000,
      },
      {
        id: `check_${Date.now()}_3`,
        requirement: '主題行',
        isCompliant: email.hasValidSubject,
        details: email.hasValidSubject
          ? '主題行準確描述內容'
          : '主題行誤導或虛假',
        penalty: email.hasValidSubject ? 0 : 16000,
      },
      {
        id: `check_${Date.now()}_4`,
        requirement: '發件人身份',
        isCompliant: email.sender.includes('@'),
        details: email.sender.includes('@')
          ? '發件人身份真實'
          : '發件人身份虛假',
        penalty: email.sender.includes('@') ? 0 : 16000,
      },
    ];

    return checks;
  }

  private calculateCANSPAMScore(checks: CANSPAMCheck[]): number {
    const _compliantChecks = checks.filter(check => check.isCompliant).length;
    return (compliantChecks / checks.length) * 100;
  }

  private determineCANSPAMStatus(
    score: number
  ): CANSPAMComplianceResult['status'] {
    if (score === 100) return 'compliant';
    if (score >= 75) return 'warning';
    if (score >= 50) return 'pending_review';
    return 'non_compliant';
  }

  private calculateTransparencyScore(ad: Advertisement): number {
    let score = 0;

    // 贊助披露
    if (ad.isSponsored && ad.hasDisclosure) score += 30;
    else if (ad.isSponsored) score += 5; // 降低沒有披露的贊助廣告分數

    // 目標受眾透明度
    if (ad.targetAudience.length > 0) score += 25;
    else score -= 10; // 空目標受眾扣分

    // 預算透明度
    if (ad.budget > 0) score += 25;
    else score -= 15; // 零預算扣分

    // 時間透明度
    if (ad.startDate && ad.endDate) score += 20;

    return Math.max(0, Math.min(100, score)); // 確保分數不低於0
  }

  private analyzeDisclosures(ad: Advertisement): Disclosure[] {
    const disclosures: Disclosure[] = [];

    if (ad.isSponsored) {
      disclosures.push({
        id: `disclosure_${Date.now()}_1`,
        type: 'sponsored',
        content: '贊助內容',
        placement: ad.hasDisclosure ? 'visible' : 'missing',
        complianceStatus: ad.hasDisclosure ? 'compliant' : 'non_compliant',
      });
    }

    return disclosures;
  }

  private analyzeAudienceTargeting(ad: Advertisement): AudienceTargetingInfo {
    return {
      demographics: ad.targetAudience.filter(audience =>
        ['年齡', '性別', '地區', '收入'].some(demo => audience.includes(demo))
      ),
      interests: ad.targetAudience.filter(audience =>
        ['興趣', '愛好', '職業'].some(interest => audience.includes(interest))
      ),
      behaviors: ad.targetAudience.filter(audience =>
        ['行為', '習慣', '偏好'].some(behavior => audience.includes(behavior))
      ),
      exclusions: [],
      isTransparent: ad.targetAudience.length > 0,
    };
  }

  private analyzeSpendingBreakdown(ad: Advertisement): SpendingBreakdown {
    const _dailyAverage =
      ad.budget /
      Math.max(
        1,
        (ad.endDate.getTime() - ad.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

    return {
      totalSpent: ad.budget,
      dailyAverage,
      topChannels: [{ channel: ad.adType, amount: ad.budget, percentage: 100 }],
      isDisclosed: ad.budget > 0,
    };
  }

  private determineTransparencyStatus(
    score: number
  ): TransparencyReport['complianceStatus'] {
    if (score >= this.config.transparencyThreshold) return 'transparent';
    if (score >= this.config.transparencyThreshold * 0.7)
      return 'partially_transparent';
    if (score >= this.config.transparencyThreshold * 0.4) return 'opaque';
    return 'non_compliant';
  }

  private performContentValidation(ad: Advertisement): ContentViolation[] {
    const violations: ContentViolation[] = [];

    // 檢查虛假聲明
    if (this.containsFalseClaims(ad.content)) {
      violations.push({
        id: `content_violation_${Date.now()}_1`,
        type: 'false_claims',
        severity: 'high',
        description: '包含虛假或誤導性聲明',
        regulation: '廣告法',
        requiredAction: '移除或修正虛假聲明',
      });
    }

    // 檢查不當目標受眾
    if (this.hasInappropriateTargeting(ad.targetAudience)) {
      violations.push({
        id: `content_violation_${Date.now()}_2`,
        type: 'inappropriate_targeting',
        severity: 'medium',
        description: '目標受眾不當',
        regulation: '消費者保護法',
        requiredAction: '調整目標受眾設定',
      });
    }

    // 檢查缺少披露
    if (ad.isSponsored && !ad.hasDisclosure) {
      violations.push({
        id: `content_violation_${Date.now()}_3`,
        type: 'missing_disclosure',
        severity: 'high',
        description: '贊助內容缺少披露',
        regulation: '廣告法',
        requiredAction: '添加贊助披露',
      });
    }

    return violations;
  }

  private containsFalseClaims(content: string): boolean {
    const _falseClaimKeywords = [
      '100%有效',
      '永久免費',
      '無風險',
      '保證賺錢',
      '立即見效',
    ];
    return falseClaimKeywords.some(keyword => content.includes(keyword));
  }

  private hasInappropriateTargeting(audience: string[]): boolean {
    const _inappropriateKeywords = ['兒童', '未成年人', '13歲以下'];
    return audience.some(target =>
      inappropriateKeywords.some(keyword => target.includes(keyword))
    );
  }

  private calculateContentRiskScore(violations: ContentViolation[]): number {
    if (violations.length === 0) return 0;

    const _totalRisk = violations.reduce((sum, violation) => {
      switch (violation.severity) {
        case 'low':
          return sum + 20;
        case 'medium':
          return sum + 40;
        case 'high':
          return sum + 70;
        case 'critical':
          return sum + 100;
        default:
          return sum + 40;
      }
    }, 0);

    return Math.min(100, totalRisk);
  }

  private generateContentRecommendations(
    violations: ContentViolation[]
  ): string[] {
    return violations.map(violation => violation.requiredAction);
  }
}
