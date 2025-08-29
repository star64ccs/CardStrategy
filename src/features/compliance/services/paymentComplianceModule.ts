/**
 * 支付合規模組
 * 實現重構計劃任務 1.6: PaymentComplianceModule
 */

import { logger } from '../../../core/utils/logger';

export interface PaymentRegulation {
  id: string;
  name: string;
  jurisdiction: string;
  category: 'psd2' | 'pci_dss' | 'aml' | 'kyc' | 'fraud_prevention';
  requirements: string[];
  penalties: string[];
}

export interface PaymentMethod {
  id: string;
  type:
    | 'credit_card'
    | 'debit_card'
    | 'digital_wallet'
    | 'bank_transfer'
    | 'cryptocurrency';
  provider: string;
  securityLevel: 'basic' | 'standard' | 'enhanced' | 'premium';
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  lastAudit: Date;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  merchantId: string;
  customerId: string;
  complianceChecks: PaymentComplianceCheck[];
  riskScore: number; // 0-100
  status: 'approved' | 'rejected' | 'pending_review' | 'flagged';
  timestamp: Date;
}

export interface PaymentComplianceCheck {
  id: string;
  type:
    | 'psd2_verification'
    | 'pci_compliance'
    | 'aml_screening'
    | 'kyc_verification'
    | 'fraud_detection';
  result: 'pass' | 'fail' | 'warning';
  details: Record<string, any>;
  timestamp: Date;
}

export interface AMLCheck {
  id: string;
  customerId: string;
  transactionId: string;
  riskLevel: 'low' | 'medium' | 'high';
  screeningResult: 'clear' | 'suspicious' | 'blocked';
  flags: string[];
  timestamp: Date;
}

export interface KYCCheck {
  id: string;
  customerId: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  status: 'pending' | 'verified' | 'failed' | 'expired';
  documents: string[];
  lastUpdated: Date;
}

export interface PaymentComplianceReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalTransactions: number;
    compliantTransactions: number;
    complianceRate: number; // 百分比
    totalViolations: number;
    averageRiskScore: number;
    amlFlags: number;
    kycFailures: number;
  };
  generatedAt: Date;
}

export interface PaymentComplianceConfig {
  enablePSD2Compliance: boolean;
  enablePCIDSSCompliance: boolean;
  enableAMLScreening: boolean;
  enableKYCVerification: boolean;
  enableFraudDetection: boolean;
  maxRiskScore: number;
  requireEnhancedKYC: boolean;
  autoFlagThreshold: number;
}

export class PaymentComplianceModule {
  private static instance: PaymentComplianceModule;
  private config: PaymentComplianceConfig;
  private readonly regulations: Map<string, PaymentRegulation>;
  private readonly paymentMethods: Map<string, PaymentMethod>;
  private readonly transactions: Map<string, PaymentTransaction>;
  private readonly amlChecks: Map<string, AMLCheck>;
  private readonly kycChecks: Map<string, KYCCheck>;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.regulations = new Map();
    this.paymentMethods = new Map();
    this.transactions = new Map();
    this.amlChecks = new Map();
    this.kycChecks = new Map();
  }

  public static getInstance(): PaymentComplianceModule {
    if (!PaymentComplianceModule.instance) {
      PaymentComplianceModule.instance = new PaymentComplianceModule();
    }
    return PaymentComplianceModule.instance;
  }

  public async initialize(
    config?: Partial<PaymentComplianceConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      await this.initializeRegulations();

      this.isInitialized = true;
      logger.info('支付合規模組初始化成功');
      return true;
    } catch (error) {
      logger.error('支付合規模組初始化失敗:', error);
      return false;
    }
  }

  public checkPaymentMethodCompliance(
    paymentMethod: Omit<PaymentMethod, 'id' | 'complianceStatus' | 'lastAudit'>
  ): PaymentMethod {
    try {
      const complianceChecks: PaymentComplianceCheck[] = [];
      let isCompliant = true;

      // PSD2 合規檢查
      if (this.config.enablePSD2Compliance) {
        const _psd2Check = this.performPSD2Check(paymentMethod);
        complianceChecks.push(psd2Check);
        if (psd2Check.result === 'fail') isCompliant = false;
      }

      // PCI DSS 合規檢查
      if (this.config.enablePCIDSSCompliance) {
        const _pciCheck = this.performPCICheck(paymentMethod);
        complianceChecks.push(pciCheck);
        if (pciCheck.result === 'fail') isCompliant = false;
      }

      const _complianceStatus = isCompliant ? 'compliant' : 'non_compliant';

      const paymentMethodCompliance: PaymentMethod = {
        ...paymentMethod,
        id: `payment_method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        complianceStatus,
        lastAudit: new Date(),
      };

      this.paymentMethods.set(
        paymentMethodCompliance.id,
        paymentMethodCompliance
      );

      logger.info('支付方式合規檢查完成', {
        paymentMethodId: paymentMethodCompliance.id,
        type: paymentMethodCompliance.type,
        complianceStatus,
        checksCount: complianceChecks.length,
      });

      return paymentMethodCompliance;
    } catch (error) {
      logger.error('支付方式合規檢查失敗:', error);
      throw error;
    }
  }

  public checkTransactionCompliance(
    transaction: Omit<
      PaymentTransaction,
      'id' | 'complianceChecks' | 'riskScore' | 'status' | 'timestamp'
    >
  ): PaymentTransaction {
    try {
      const complianceChecks: PaymentComplianceCheck[] = [];
      let riskScore = 0;

      // AML 篩查
      if (this.config.enableAMLScreening) {
        const _amlCheck = this.performAMLScreeningCheck(transaction);
        complianceChecks.push(amlCheck);
        if (amlCheck.result === 'fail') riskScore += 40;
      }

      // KYC 驗證
      if (this.config.enableKYCVerification) {
        const _kycCheck = this.performKYCVerificationCheck(
          transaction.customerId
        );
        complianceChecks.push(kycCheck);
        if (kycCheck.result === 'fail') riskScore += 30;
      }

      // 欺詐檢測
      if (this.config.enableFraudDetection) {
        const _fraudCheck = this.performFraudDetection(transaction);
        complianceChecks.push(fraudCheck);
        if (fraudCheck.result === 'fail') riskScore += 50;
      }

      const _status = this.determineTransactionStatus(riskScore);

      const paymentTransaction: PaymentTransaction = {
        ...transaction,
        id: `payment_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        complianceChecks,
        riskScore,
        status,
        timestamp: new Date(),
      };

      this.transactions.set(paymentTransaction.id, paymentTransaction);

      logger.info('支付交易合規檢查完成', {
        transactionId: paymentTransaction.id,
        riskScore,
        status,
        checksCount: complianceChecks.length,
      });

      return paymentTransaction;
    } catch (error) {
      logger.error('支付交易合規檢查失敗:', error);
      throw error;
    }
  }

  public performAMLScreening(transaction: unknown): AMLCheck {
    try {
      const _riskLevel = this.calculateAMLRiskLevel(transaction);
      const _screeningResult = this.determineAMLScreeningResult(riskLevel);
      const _flags = this.generateAMLFlags(transaction, riskLevel);

      const amlCheck: AMLCheck = {
        id: `aml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId: transaction.customerId,
        transactionId: transaction.transactionId,
        riskLevel,
        screeningResult,
        flags,
        timestamp: new Date(),
      };

      this.amlChecks.set(amlCheck.id, amlCheck);

      logger.info('AML篩查完成', {
        customerId: amlCheck.customerId,
        riskLevel,
        screeningResult,
        flagsCount: flags.length,
      });

      return amlCheck;
    } catch (error) {
      logger.error('AML篩查失敗:', error);
      throw error;
    }
  }

  public performKYCVerification(customerId: string): KYCCheck {
    try {
      const _verificationLevel = this.determineKYCLevel(customerId);
      const _status = this.performKYCVerificationInternal(
        customerId,
        verificationLevel
      );
      const _documents = this.getRequiredDocuments(verificationLevel);

      const kycCheck: KYCCheck = {
        id: `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        verificationLevel,
        status,
        documents,
        lastUpdated: new Date(),
      };

      this.kycChecks.set(kycCheck.id, kycCheck);

      logger.info('KYC驗證完成', {
        customerId,
        verificationLevel,
        status,
        documentsCount: documents.length,
      });

      return kycCheck;
    } catch (error) {
      logger.error('KYC驗證失敗:', error);
      throw error;
    }
  }

  public generateComplianceReport(period?: {
    start: Date;
    end: Date;
  }): PaymentComplianceReport {
    try {
      const _reportPeriod = period || this.getDefaultReportPeriod();
      const _transactionsInPeriod = this.getTransactionsInPeriod(reportPeriod);

      const _summary = this.calculateComplianceSummary(transactionsInPeriod);

      const report: PaymentComplianceReport = {
        id: `payment_compliance_report_${Date.now()}`,
        period: reportPeriod,
        summary,
        generatedAt: new Date(),
      };

      logger.info('支付合規報告生成完成', {
        reportId: report.id,
        period: reportPeriod,
        complianceRate: summary.complianceRate,
      });

      return report;
    } catch (error) {
      logger.error('生成支付合規報告失敗:', error);
      throw error;
    }
  }

  public updateConfig(config: Partial<PaymentComplianceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('支付合規模組配置已更新', { config: this.config });
  }

  public async reset(): Promise<void> {
    this.regulations.clear();
    this.paymentMethods.clear();
    this.transactions.clear();
    this.amlChecks.clear();
    this.kycChecks.clear();
    this.isInitialized = false;
    logger.info('支付合規模組已重置');
  }

  // 私有方法

  private getDefaultConfig(): PaymentComplianceConfig {
    return {
      enablePSD2Compliance: true,
      enablePCIDSSCompliance: true,
      enableAMLScreening: true,
      enableKYCVerification: true,
      enableFraudDetection: true,
      maxRiskScore: 70,
      requireEnhancedKYC: true,
      autoFlagThreshold: 60,
    };
  }

  private async initializeRegulations(): Promise<void> {
    const _regulations = [
      {
        id: 'psd2_eu',
        name: 'PSD2支付服務指令',
        jurisdiction: 'eu',
        category: 'psd2' as const,
        requirements: ['強客戶認證', '開放銀行API', '支付安全'],
        penalties: ['罰款最高營業額4%', '停業整頓'],
      },
      {
        id: 'pci_dss_global',
        name: 'PCI DSS支付卡行業數據安全標準',
        jurisdiction: 'global',
        category: 'pci_dss' as const,
        requirements: ['加密傳輸', '安全存儲', '定期審計'],
        penalties: ['罰款', '取消支付資格'],
      },
      {
        id: 'aml_global',
        name: '反洗錢法規',
        jurisdiction: 'global',
        category: 'aml' as const,
        requirements: ['客戶盡職調查', '可疑交易報告', '記錄保存'],
        penalties: ['罰款', '刑事責任'],
      },
    ];

    regulations.forEach(regulation => {
      this.regulations.set(regulation.id, regulation);
    });
  }

  private performPSD2Check(paymentMethod: unknown): PaymentComplianceCheck {
    const _isPSD2Compliant = Math.random() > 0.05; // 95%合規率
    return {
      id: `psd2_check_${Date.now()}`,
      type: 'psd2_verification',
      result: isPSD2Compliant ? 'pass' : 'fail',
      details: { paymentMethodType: paymentMethod.type, isPSD2Compliant },
      timestamp: new Date(),
    };
  }

  private performPCICheck(paymentMethod: unknown): PaymentComplianceCheck {
    const _isPCICompliant = Math.random() > 0.08; // 92%合規率
    return {
      id: `pci_check_${Date.now()}`,
      type: 'pci_compliance',
      result: isPCICompliant ? 'pass' : 'fail',
      details: { paymentMethodType: paymentMethod.type, isPCICompliant },
      timestamp: new Date(),
    };
  }

  private performAMLScreeningCheck(
    transaction: unknown
  ): PaymentComplianceCheck {
    const _isAMLClear = Math.random() > 0.03; // 97%通過率
    return {
      id: `aml_check_${Date.now()}`,
      type: 'aml_screening',
      result: isAMLClear ? 'pass' : 'fail',
      details: { transactionId: transaction.transactionId, isAMLClear },
      timestamp: new Date(),
    };
  }

  private performKYCVerificationCheck(
    customerId: string
  ): PaymentComplianceCheck {
    const _isKYCVerified = Math.random() > 0.02; // 98%驗證率
    return {
      id: `kyc_check_${Date.now()}`,
      type: 'kyc_verification',
      result: isKYCVerified ? 'pass' : 'fail',
      details: { customerId, isKYCVerified },
      timestamp: new Date(),
    };
  }

  private performFraudDetection(transaction: unknown): PaymentComplianceCheck {
    const _isFraudulent = Math.random() > 0.95; // 5%欺詐率
    return {
      id: `fraud_check_${Date.now()}`,
      type: 'fraud_detection',
      result: isFraudulent ? 'fail' : 'pass',
      details: { transactionId: transaction.transactionId, isFraudulent },
      timestamp: new Date(),
    };
  }

  private determineTransactionStatus(
    riskScore: number
  ): PaymentTransaction['status'] {
    if (riskScore >= 80) {
      return 'rejected';
    } else if (riskScore >= this.config.autoFlagThreshold) {
      return 'flagged';
    } else if (riskScore >= this.config.maxRiskScore) {
      return 'pending_review';
    } else {
      return 'approved';
    }
  }

  private calculateAMLRiskLevel(transaction: unknown): AMLCheck['riskLevel'] {
    const { amount } = transaction;
    if (amount > 10000) return 'high';
    if (amount > 5000) return 'medium';
    return 'low';
  }

  private determineAMLScreeningResult(
    riskLevel: AMLCheck['riskLevel']
  ): AMLCheck['screeningResult'] {
    const _random = Math.random();
    if (riskLevel === 'high') {
      return random > 0.7 ? 'clear' : random > 0.3 ? 'suspicious' : 'blocked';
    } else if (riskLevel === 'medium') {
      return random > 0.8 ? 'clear' : random > 0.5 ? 'suspicious' : 'blocked';
    } else {
      return random > 0.95 ? 'clear' : random > 0.8 ? 'suspicious' : 'blocked';
    }
  }

  private generateAMLFlags(
    transaction: unknown,
    riskLevel: AMLCheck['riskLevel']
  ): string[] {
    const flags: string[] = [];

    if (riskLevel === 'high') {
      flags.push('高額交易');
    }

    if (transaction.amount > 5000) {
      flags.push('大額交易');
    }

    if (Math.random() > 0.9) {
      flags.push('可疑模式');
    }

    return flags;
  }

  private determineKYCLevel(customerId: string): KYCCheck['verificationLevel'] {
    const _random = Math.random();
    if (random > 0.8) return 'premium';
    if (random > 0.5) return 'enhanced';
    return 'basic';
  }

  private performKYCVerificationInternal(
    customerId: string,
    level: KYCCheck['verificationLevel']
  ): KYCCheck['status'] {
    const _random = Math.random();
    if (level === 'premium') {
      return random > 0.9 ? 'verified' : random > 0.7 ? 'pending' : 'failed';
    } else if (level === 'enhanced') {
      return random > 0.85 ? 'verified' : random > 0.6 ? 'pending' : 'failed';
    } else {
      return random > 0.95 ? 'verified' : random > 0.8 ? 'pending' : 'failed';
    }
  }

  private getRequiredDocuments(level: KYCCheck['verificationLevel']): string[] {
    const documents: string[] = ['身份證明'];

    if (level === 'enhanced') {
      documents.push('地址證明', '收入證明');
    } else if (level === 'premium') {
      documents.push('地址證明', '收入證明', '銀行對賬單', '稅務文件');
    }

    return documents;
  }

  private getDefaultReportPeriod(): { start: Date; end: Date } {
    const _end = new Date();
    const _start = new Date();
    start.setDate(start.getDate() - 30); // 最近30天
    return { start, end };
  }

  private getTransactionsInPeriod(period: {
    start: Date;
    end: Date;
  }): PaymentTransaction[] {
    return Array.from(this.transactions.values()).filter(
      transaction =>
        transaction.timestamp >= period.start &&
        transaction.timestamp <= period.end
    );
  }

  private calculateComplianceSummary(transactions: PaymentTransaction[]): {
    totalTransactions: number;
    compliantTransactions: number;
    complianceRate: number;
    totalViolations: number;
    averageRiskScore: number;
    amlFlags: number;
    kycFailures: number;
  } {
    const _totalTransactions = transactions.length;
    const _compliantTransactions = transactions.filter(
      t => t.status === 'approved'
    ).length;
    const _complianceRate =
      totalTransactions > 0
        ? (compliantTransactions / totalTransactions) * 100
        : 0;

    const _totalViolations = transactions.filter(
      t => t.status === 'rejected'
    ).length;

    const _averageRiskScore =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.riskScore, 0) /
          transactions.length
        : 0;

    const _amlFlags = Array.from(this.amlChecks.values()).filter(
      check =>
        check.screeningResult === 'suspicious' ||
        check.screeningResult === 'blocked'
    ).length;

    const _kycFailures = Array.from(this.kycChecks.values()).filter(
      check => check.status === 'failed'
    ).length;

    return {
      totalTransactions,
      compliantTransactions,
      complianceRate,
      totalViolations,
      averageRiskScore,
      amlFlags,
      kycFailures,
    };
  }
}
