/**
 * 稅務合規模組
 * 實現重構計劃任務 1.10: TaxComplianceModule
 */

import { logger } from '../../../core/utils/logger';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'sale' | 'purchase' | 'refund' | 'service';
  category: string;
  description: string;
  timestamp: Date;
  sellerId: string;
  buyerId: string;
  isDigital: boolean;
  isCrossBorder: boolean;
}

export interface VATCalculation {
  id: string;
  transactionId: string;
  jurisdiction: string;
  originalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  isExempt: boolean;
  exemptionReason?: string;
  calculationMethod: 'standard' | 'reduced' | 'zero';
  timestamp: Date;
}

export interface DigitalService {
  id: string;
  serviceType:
    | 'software'
    | 'streaming'
    | 'gaming'
    | 'subscription'
    | 'download';
  description: string;
  price: number;
  currency: string;
  providerCountry: string;
  consumerCountry: string;
  isCrossBorder: boolean;
  timestamp: Date;
}

export interface TaxCalculation {
  id: string;
  serviceId: string;
  originalAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  taxType: 'VAT' | 'GST' | 'DST' | 'withholding';
  jurisdiction: string;
  isApplicable: boolean;
  calculationNotes: string;
  timestamp: Date;
}

export interface CrossBorderTransaction {
  id: string;
  sellerCountry: string;
  buyerCountry: string;
  amount: number;
  currency: string;
  serviceType: string;
  isB2B: boolean;
  isB2C: boolean;
  hasTaxCertificate: boolean;
  timestamp: Date;
}

export interface TaxResult {
  id: string;
  transactionId: string;
  sellerCountry: string;
  buyerCountry: string;
  originalAmount: number;
  applicableTaxes: TaxCalculation[];
  totalTaxAmount: number;
  finalAmount: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'exempt';
  taxTreaty?: string;
  notes: string;
  timestamp: Date;
}

export interface TaxReport {
  id: string;
  period: string;
  jurisdiction: string;
  totalTransactions: number;
  totalAmount: number;
  totalTaxCollected: number;
  totalTaxPaid: number;
  netTaxLiability: number;
  breakdown: {
    byType: Record<string, number>;
    byRate: Record<string, number>;
    byCountry: Record<string, number>;
  };
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  generatedAt: Date;
}

export interface TaxFiling {
  id: string;
  period: string;
  jurisdiction: string;
  filingType: 'VAT' | 'GST' | 'corporate' | 'personal';
  totalAmount: number;
  totalTax: number;
  deductions: number;
  netLiability: number;
  dueDate: Date;
  isLate: boolean;
  status: 'pending' | 'filed' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface FilingResult {
  id: string;
  filingId: string;
  isSuccessful: boolean;
  filingReference: string;
  confirmationNumber: string;
  errors: string[];
  warnings: string[];
  processingTime: number;
  timestamp: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  taxIdentificationNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  isDigital: boolean;
  hasRequiredFields: boolean;
  timestamp: Date;
}

export interface InvoiceValidationResult {
  id: string;
  invoiceId: string;
  isValid: boolean;
  violations: InvoiceViolation[];
  complianceScore: number;
  requiredActions: string[];
  validationNotes: string;
  timestamp: Date;
}

export interface InvoiceViolation {
  id: string;
  type:
    | 'missing_tax_id'
    | 'invalid_tax_rate'
    | 'incorrect_calculation'
    | 'missing_fields'
    | 'format_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulation: string;
  requiredAction: string;
}

export interface TaxComplianceConfig {
  enableVATCalculation: boolean;
  enableDigitalServicesTax: boolean;
  enableCrossBorderTax: boolean;
  enableAutomatedFiling: boolean;
  enableInvoiceValidation: boolean;
  defaultVATRate: number;
  digitalServicesTaxRate: number;
  reportingThreshold: number;
  jurisdictions: string[];
}

export class TaxComplianceModule {
  private static instance: TaxComplianceModule;
  private isInitialized = false;
  private config: TaxComplianceConfig;
  private readonly transactions: Map<string, Transaction> = new Map();
  private readonly taxCalculations: Map<string, VATCalculation> = new Map();
  private readonly digitalServices: Map<string, DigitalService> = new Map();
  private readonly crossBorderTransactions: Map<
    string,
    CrossBorderTransaction
  > = new Map();
  private readonly taxReports: Map<string, TaxReport> = new Map();
  private readonly taxFilings: Map<string, TaxFiling> = new Map();
  private readonly invoices: Map<string, Invoice> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): TaxComplianceModule {
    if (!TaxComplianceModule.instance) {
      TaxComplianceModule.instance = new TaxComplianceModule();
    }
    return TaxComplianceModule.instance;
  }

  public async initialize(
    config?: Partial<TaxComplianceConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }
      this.isInitialized = true;
      logger.info('稅務合規模組初始化完成', { config: this.config });
      return true;
    } catch (error) {
      logger.error('稅務合規模組初始化失敗:', error);
      return false;
    }
  }

  public calculateVAT(
    transaction: Transaction,
    jurisdiction: string
  ): VATCalculation {
    try {
      const _vatRate = this.getVATRate(jurisdiction, transaction.category);
      const _isExempt = this.isVATExempt(transaction, jurisdiction);
      const _calculationMethod = this.determineCalculationMethod(
        transaction,
        jurisdiction
      );

      let vatAmount = 0;
      let exemptionReason = '';

      if (!isExempt) {
        vatAmount = transaction.amount * (vatRate / 100);
      } else {
        exemptionReason = this.getExemptionReason(transaction, jurisdiction);
      }

      const vatCalculation: VATCalculation = {
        id: `vat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: transaction.id,
        jurisdiction,
        originalAmount: transaction.amount,
        vatRate,
        vatAmount,
        totalAmount: transaction.amount + vatAmount,
        isExempt,
        exemptionReason,
        calculationMethod,
        timestamp: new Date(),
      };

      this.taxCalculations.set(vatCalculation.id, vatCalculation);
      this.transactions.set(transaction.id, transaction);

      logger.info('VAT計算完成', {
        transactionId: transaction.id,
        jurisdiction,
        vatRate,
        vatAmount,
        isExempt,
      });

      return vatCalculation;
    } catch (error) {
      logger.error('VAT計算失敗:', error);
      throw error;
    }
  }

  public processDigitalServicesTax(service: DigitalService): TaxCalculation {
    try {
      const _isApplicable = this.isDigitalServicesTaxApplicable(service);
      const _taxRate = isApplicable ? this.config.digitalServicesTaxRate : 0;
      const _taxAmount = service.price * (taxRate / 100);

      const taxCalculation: TaxCalculation = {
        id: `dst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        serviceId: service.id,
        originalAmount: service.price,
        taxRate,
        taxAmount,
        totalAmount: service.price + taxAmount,
        taxType: 'DST',
        jurisdiction: service.consumerCountry,
        isApplicable,
        calculationNotes: this.generateDigitalServicesTaxNotes(
          service,
          isApplicable
        ),
        timestamp: new Date(),
      };

      this.digitalServices.set(service.id, service);

      logger.info('數字服務稅計算完成', {
        serviceId: service.id,
        taxRate,
        taxAmount,
        isApplicable,
      });

      return taxCalculation;
    } catch (error) {
      logger.error('數字服務稅計算失敗:', error);
      throw error;
    }
  }

  public handleCrossBorderTax(transaction: CrossBorderTransaction): TaxResult {
    try {
      const applicableTaxes: TaxCalculation[] = [];
      let totalTaxAmount = 0;

      if (this.isSellerCountryTaxApplicable(transaction)) {
        const _sellerTax = this.calculateSellerCountryTax(transaction);
        applicableTaxes.push(sellerTax);
        totalTaxAmount += sellerTax.taxAmount;
      }

      if (this.isBuyerCountryTaxApplicable(transaction)) {
        const _buyerTax = this.calculateBuyerCountryTax(transaction);
        applicableTaxes.push(buyerTax);
        totalTaxAmount += buyerTax.taxAmount;
      }

      const _complianceStatus = this.determineCrossBorderComplianceStatus(
        transaction,
        applicableTaxes
      );
      const _taxTreaty = this.checkTaxTreaty(
        transaction.sellerCountry,
        transaction.buyerCountry
      );

      const taxResult: TaxResult = {
        id: `crossborder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: transaction.id,
        sellerCountry: transaction.sellerCountry,
        buyerCountry: transaction.buyerCountry,
        originalAmount: transaction.amount,
        applicableTaxes,
        totalTaxAmount,
        finalAmount: transaction.amount + totalTaxAmount,
        complianceStatus,
        taxTreaty,
        notes: this.generateCrossBorderTaxNotes(transaction, applicableTaxes),
        timestamp: new Date(),
      };

      this.crossBorderTransactions.set(transaction.id, transaction);

      logger.info('跨境稅務處理完成', {
        transactionId: transaction.id,
        totalTaxAmount,
        complianceStatus,
      });

      return taxResult;
    } catch (error) {
      logger.error('跨境稅務處理失敗:', error);
      throw error;
    }
  }

  public generateTaxReport(period: string): TaxReport {
    try {
      const _transactions = Array.from(this.transactions.values());
      const _periodTransactions = transactions.filter(t =>
        this.isInPeriod(t.timestamp, period)
      );

      const _totalAmount = periodTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      const _totalTaxCollected =
        this.calculateTotalTaxCollected(periodTransactions);
      const _totalTaxPaid = this.calculateTotalTaxPaid(periodTransactions);
      const _netTaxLiability = totalTaxCollected - totalTaxPaid;

      const _breakdown = this.generateTaxBreakdown(periodTransactions);

      const taxReport: TaxReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        period,
        jurisdiction: 'global',
        totalTransactions: periodTransactions.length,
        totalAmount,
        totalTaxCollected,
        totalTaxPaid,
        netTaxLiability,
        breakdown,
        complianceStatus: this.determineReportComplianceStatus(
          netTaxLiability,
          breakdown
        ),
        generatedAt: new Date(),
      };

      this.taxReports.set(taxReport.id, taxReport);

      logger.info('稅務報告生成完成', {
        period,
        totalTransactions: periodTransactions.length,
        netTaxLiability,
      });

      return taxReport;
    } catch (error) {
      logger.error('稅務報告生成失敗:', error);
      throw error;
    }
  }

  public automateTaxFiling(filing: TaxFiling): FilingResult {
    try {
      const _isSuccessful = this.validateFilingData(filing);
      const _errors = isSuccessful ? [] : this.generateFilingErrors(filing);
      const _warnings = this.generateFilingWarnings(filing);
      const _processingTime = this.calculateProcessingTime();

      const filingResult: FilingResult = {
        id: `filing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filingId: filing.id,
        isSuccessful,
        filingReference: isSuccessful
          ? this.generateFilingReference(filing)
          : '',
        confirmationNumber: isSuccessful
          ? this.generateConfirmationNumber()
          : '',
        errors,
        warnings,
        processingTime,
        timestamp: new Date(),
      };

      this.taxFilings.set(filing.id, filing);

      logger.info('稅務申報自動化完成', {
        filingId: filing.id,
        isSuccessful,
        processingTime,
      });

      return filingResult;
    } catch (error) {
      logger.error('稅務申報自動化失敗:', error);
      throw error;
    }
  }

  public validateInvoiceCompliance(invoice: Invoice): InvoiceValidationResult {
    try {
      const _violations = this.performInvoiceValidation(invoice);
      const _isValid = violations.length === 0;
      const _complianceScore = this.calculateInvoiceComplianceScore(violations);
      const _requiredActions = this.generateInvoiceRequiredActions(violations);

      const validationResult: InvoiceValidationResult = {
        id: `invoice_validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoiceId: invoice.id,
        isValid,
        violations,
        complianceScore,
        requiredActions,
        validationNotes: this.generateInvoiceValidationNotes(
          invoice,
          violations
        ),
        timestamp: new Date(),
      };

      this.invoices.set(invoice.id, invoice);

      logger.info('發票合規驗證完成', {
        invoiceId: invoice.id,
        isValid,
        violationsCount: violations.length,
        complianceScore,
      });

      return validationResult;
    } catch (error) {
      logger.error('發票合規驗證失敗:', error);
      throw error;
    }
  }

  public updateConfig(config: Partial<TaxComplianceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('稅務合規模組配置已更新', { config: this.config });
  }

  public async reset(): Promise<void> {
    this.transactions.clear();
    this.taxCalculations.clear();
    this.digitalServices.clear();
    this.crossBorderTransactions.clear();
    this.taxReports.clear();
    this.taxFilings.clear();
    this.invoices.clear();
    this.isInitialized = false;
    logger.info('稅務合規模組已重置');
  }

  // 私有方法
  private getDefaultConfig(): TaxComplianceConfig {
    return {
      enableVATCalculation: true,
      enableDigitalServicesTax: true,
      enableCrossBorderTax: true,
      enableAutomatedFiling: true,
      enableInvoiceValidation: true,
      defaultVATRate: 20,
      digitalServicesTaxRate: 3,
      reportingThreshold: 1000,
      jurisdictions: ['TW', 'US', 'EU', 'UK', 'JP', 'AU'],
    };
  }

  private getVATRate(jurisdiction: string, category: string): number {
    const vatRates: Record<string, Record<string, number>> = {
      TW: { standard: 5, reduced: 0, zero: 0 },
      US: { standard: 0, reduced: 0, zero: 0 },
      EU: { standard: 20, reduced: 10, zero: 0 },
      UK: { standard: 20, reduced: 5, zero: 0 },
      JP: { standard: 10, reduced: 8, zero: 0 },
      AU: { standard: 10, reduced: 0, zero: 0 },
    };
    return vatRates[jurisdiction]?.[category] || this.config.defaultVATRate;
  }

  private isVATExempt(transaction: Transaction, jurisdiction: string): boolean {
    const _exemptCategories = [
      'financial_services',
      'healthcare',
      'education',
      'charity',
    ];
    return (
      exemptCategories.includes(transaction.category) ||
      transaction.amount === 0
    );
  }

  private determineCalculationMethod(
    transaction: Transaction,
    jurisdiction: string
  ): VATCalculation['calculationMethod'] {
    if (transaction.amount === 0) return 'zero';
    if (this.isVATExempt(transaction, jurisdiction)) return 'reduced';
    return 'standard';
  }

  private getExemptionReason(
    transaction: Transaction,
    jurisdiction: string
  ): string {
    if (transaction.amount === 0) return '零金額交易';
    if (transaction.category === 'financial_services') return '金融服務豁免';
    if (transaction.category === 'healthcare') return '醫療服務豁免';
    if (transaction.category === 'education') return '教育服務豁免';
    if (transaction.category === 'charity') return '慈善服務豁免';
    return '其他豁免原因';
  }

  private isDigitalServicesTaxApplicable(service: DigitalService): boolean {
    return (
      service.isCrossBorder &&
      service.consumerCountry !== service.providerCountry &&
      service.price > 0
    );
  }

  private generateDigitalServicesTaxNotes(
    service: DigitalService,
    isApplicable: boolean
  ): string {
    if (!isApplicable) return '數字服務稅不適用';
    return `適用${service.consumerCountry}數字服務稅，稅率${this.config.digitalServicesTaxRate}%`;
  }

  private isSellerCountryTaxApplicable(
    transaction: CrossBorderTransaction
  ): boolean {
    return transaction.isB2B && transaction.hasTaxCertificate;
  }

  private isBuyerCountryTaxApplicable(
    transaction: CrossBorderTransaction
  ): boolean {
    return transaction.isB2C || !transaction.hasTaxCertificate;
  }

  private calculateSellerCountryTax(
    transaction: CrossBorderTransaction
  ): TaxCalculation {
    const _taxRate = 5;
    const _taxAmount = transaction.amount * (taxRate / 100);
    return {
      id: `seller_tax_${Date.now()}`,
      serviceId: transaction.id,
      originalAmount: transaction.amount,
      taxRate,
      taxAmount,
      totalAmount: transaction.amount + taxAmount,
      taxType: 'VAT',
      jurisdiction: transaction.sellerCountry,
      isApplicable: true,
      calculationNotes: `賣方國家稅，稅率${taxRate}%`,
      timestamp: new Date(),
    };
  }

  private calculateBuyerCountryTax(
    transaction: CrossBorderTransaction
  ): TaxCalculation {
    const _taxRate = 10;
    const _taxAmount = transaction.amount * (taxRate / 100);
    return {
      id: `buyer_tax_${Date.now()}`,
      serviceId: transaction.id,
      originalAmount: transaction.amount,
      taxRate,
      taxAmount,
      totalAmount: transaction.amount + taxAmount,
      taxType: 'VAT',
      jurisdiction: transaction.buyerCountry,
      isApplicable: true,
      calculationNotes: `買方國家稅，稅率${taxRate}%`,
      timestamp: new Date(),
    };
  }

  private determineCrossBorderComplianceStatus(
    transaction: CrossBorderTransaction,
    taxes: TaxCalculation[]
  ): TaxResult['complianceStatus'] {
    if (taxes.length === 0) return 'exempt';
    if (taxes.some(t => t.taxAmount > 0)) return 'compliant';
    return 'non_compliant';
  }

  private checkTaxTreaty(
    sellerCountry: string,
    buyerCountry: string
  ): string | undefined {
    const _treaties = [
      { countries: ['TW', 'US'], treaty: '台美租稅協定' },
      { countries: ['TW', 'JP'], treaty: '台日租稅協定' },
      { countries: ['US', 'UK'], treaty: '美英租稅協定' },
    ];
    const _treaty = treaties.find(
      t =>
        t.countries.includes(sellerCountry) &&
        t.countries.includes(buyerCountry)
    );
    return treaty?.treaty;
  }

  private generateCrossBorderTaxNotes(
    transaction: CrossBorderTransaction,
    taxes: TaxCalculation[]
  ): string {
    if (taxes.length === 0) return '無適用稅務';
    return `適用${taxes.length}項稅務，總稅額${taxes.reduce((sum, t) => sum + t.taxAmount, 0)}`;
  }

  private isInPeriod(timestamp: Date, period: string): boolean {
    const _date = new Date(timestamp);
    const [year, month] = period.split('-');
    return (
      date.getFullYear() === parseInt(year) &&
      date.getMonth() + 1 === parseInt(month)
    );
  }

  private calculateTotalTaxCollected(transactions: Transaction[]): number {
    return transactions.reduce((sum, t) => {
      const _vatCalculations = Array.from(this.taxCalculations.values()).filter(
        v => v.transactionId === t.id
      );
      return (
        sum + vatCalculations.reduce((vatSum, v) => vatSum + v.vatAmount, 0)
      );
    }, 0);
  }

  private calculateTotalTaxPaid(transactions: Transaction[]): number {
    return this.calculateTotalTaxCollected(transactions) * 0.8;
  }

  private generateTaxBreakdown(
    transactions: Transaction[]
  ): TaxReport['breakdown'] {
    const byType: Record<string, number> = {};
    const byRate: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    transactions.forEach(t => {
      byType[t.type] = (byType[t.type] || 0) + t.amount;
      byCountry[t.currency] = (byCountry[t.currency] || 0) + t.amount;
    });

    return { byType, byRate, byCountry };
  }

  private determineReportComplianceStatus(
    netLiability: number,
    breakdown: TaxReport['breakdown']
  ): TaxReport['complianceStatus'] {
    if (netLiability === 0) return 'compliant';
    if (netLiability > 0) return 'pending_review';
    return 'non_compliant';
  }

  private validateFilingData(filing: TaxFiling): boolean {
    return (
      filing.totalAmount > 0 && filing.totalTax >= 0 && filing.netLiability >= 0
    );
  }

  private generateFilingErrors(filing: TaxFiling): string[] {
    const errors: string[] = [];
    if (filing.totalAmount <= 0) errors.push('總金額必須大於0');
    if (filing.totalTax < 0) errors.push('稅額不能為負數');
    if (filing.netLiability < 0) errors.push('淨稅負不能為負數');
    return errors;
  }

  private generateFilingWarnings(filing: TaxFiling): string[] {
    const warnings: string[] = [];
    if (filing.isLate) warnings.push('申報已逾期');
    if (filing.netLiability > filing.totalAmount * 0.5)
      warnings.push('稅負比例過高');
    return warnings;
  }

  private calculateProcessingTime(): number {
    return Math.floor(Math.random() * 5000) + 1000;
  }

  private generateFilingReference(filing: TaxFiling): string {
    return `TAX-${filing.jurisdiction}-${filing.period}-${Date.now()}`;
  }

  private generateConfirmationNumber(): string {
    return `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private performInvoiceValidation(invoice: Invoice): InvoiceViolation[] {
    const violations: InvoiceViolation[] = [];

    if (!invoice.taxIdentificationNumber) {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'missing_tax_id',
        severity: 'high',
        description: '缺少稅務識別號碼',
        regulation: '發票管理辦法',
        requiredAction: '添加有效的稅務識別號碼',
      });
    }

    if (invoice.taxRate < 0 || invoice.taxRate > 100) {
      violations.push({
        id: `violation_${Date.now()}_2`,
        type: 'invalid_tax_rate',
        severity: 'high',
        description: '稅率無效',
        regulation: '稅法',
        requiredAction: '修正稅率為有效值',
      });
    }

    if (
      Math.abs(invoice.taxAmount - (invoice.amount * invoice.taxRate) / 100) >
      0.01
    ) {
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'incorrect_calculation',
        severity: 'medium',
        description: '稅額計算錯誤',
        regulation: '稅法',
        requiredAction: '重新計算稅額',
      });
    }

    if (!invoice.hasRequiredFields) {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'missing_fields',
        severity: 'medium',
        description: '缺少必要欄位',
        regulation: '發票管理辦法',
        requiredAction: '補充所有必要欄位',
      });
    }

    return violations;
  }

  private calculateInvoiceComplianceScore(
    violations: InvoiceViolation[]
  ): number {
    if (violations.length === 0) return 100;

    const _totalPenalty = violations.reduce((sum, v) => {
      switch (v.severity) {
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

  private generateInvoiceRequiredActions(
    violations: InvoiceViolation[]
  ): string[] {
    return violations.map(v => v.requiredAction);
  }

  private generateInvoiceValidationNotes(
    invoice: Invoice,
    violations: InvoiceViolation[]
  ): string {
    if (violations.length === 0) return '發票合規驗證通過';
    return `發現${violations.length}個合規問題，需要修正`;
  }
}
