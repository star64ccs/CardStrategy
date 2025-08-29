// 台灣個人資料保護法服務測試
// Taiwan Personal Data Protection Act Service Tests

import { TaiwanPersonalDataProtectionService } from '../services/personalDataProtectionService';
import type {
  TaiwanPersonalDataProcessing,
  TaiwanCrossBorderTransfer,
} from '../types/personalDataProtection';
import {
  TaiwanDataCategory,
  TaiwanProcessingMethod,
  TaiwanSecurityMeasure,
  TaiwanConsentMethod,
  TaiwanDataSubjectRight,
  TaiwanTransferMethod,
  TaiwanSafeguard,
  TaiwanRecipientInfo,
  TaiwanRiskAssessment,
  TaiwanRiskLevel,
  TaiwanApprovalStatus,
  TaiwanPersonalDataViolationType,
  TaiwanViolationSeverity,
  TaiwanComplianceStatus,
} from '../types/personalDataProtection';

describe('TaiwanPersonalDataProtectionService', () => {
  let service: TaiwanPersonalDataProtectionService;

  beforeEach(() => {
    service = TaiwanPersonalDataProtectionService.getInstance();
  });

  afterEach(() => {
    // 清理測試資料
    service.cleanup();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const _instance1 = TaiwanPersonalDataProtectionService.getInstance();
      const _instance2 = TaiwanPersonalDataProtectionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validatePersonalDataProcessing', () => {
    it('應該驗證合規的個人資料處理', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-1',
        purpose: '提供服務',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [
          TaiwanSecurityMeasure.ENCRYPTION,
          TaiwanSecurityMeasure.ACCESS_CONTROL,
        ],
        consentRequired: true,
        consentMethod: TaiwanConsentMethod.EXPLICIT,
        dataSubjectRights: [
          TaiwanDataSubjectRight.ACCESS,
          TaiwanDataSubjectRight.CORRECTION,
        ],
        auditTrail: true,
        breachNotification: true,
        dpoContact: 'dpo@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(true);
      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.LOW);
    });

    it('應該檢測缺少處理目的', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-2',
        purpose: '',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        consentRequired: true,
        consentMethod: TaiwanConsentMethod.EXPLICIT,
        dataSubjectRights: [TaiwanDataSubjectRight.ACCESS],
        auditTrail: true,
        breachNotification: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(false);
      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.PARTIALLY_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe(
        TaiwanPersonalDataViolationType.UNAUTHORIZED_PROCESSING
      );
      expect(result.violations[0].severity).toBe(TaiwanViolationSeverity.MAJOR);
    });

    it('應該檢測缺少安全措施', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-3',
        purpose: '提供服務',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [],
        consentRequired: true,
        consentMethod: TaiwanConsentMethod.EXPLICIT,
        dataSubjectRights: [TaiwanDataSubjectRight.ACCESS],
        auditTrail: true,
        breachNotification: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(false);
      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe(
        TaiwanPersonalDataViolationType.INSUFFICIENT_SECURITY
      );
      expect(result.violations[0].severity).toBe(
        TaiwanViolationSeverity.CRITICAL
      );
    });

    it('應該檢測需要同意但未指定同意方式', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-4',
        purpose: '提供服務',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        consentRequired: true,
        dataSubjectRights: [TaiwanDataSubjectRight.ACCESS],
        auditTrail: true,
        breachNotification: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe(
        TaiwanPersonalDataViolationType.LACK_OF_CONSENT
      );
      expect(result.violations[0].severity).toBe(TaiwanViolationSeverity.MAJOR);
    });

    it('應該檢測缺少當事人權利', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-5',
        purpose: '提供服務',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        consentRequired: true,
        consentMethod: TaiwanConsentMethod.EXPLICIT,
        dataSubjectRights: [],
        auditTrail: true,
        breachNotification: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe(
        TaiwanPersonalDataViolationType.VIOLATION_OF_RIGHTS
      );
      expect(result.violations[0].severity).toBe(TaiwanViolationSeverity.MAJOR);
    });

    it('應該檢測多個違規', () => {
      const processing: TaiwanPersonalDataProcessing = {
        id: 'test-processing-6',
        purpose: '',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 0,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [],
        consentRequired: true,
        dataSubjectRights: [],
        auditTrail: false,
        breachNotification: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validatePersonalDataProcessing(processing);

      expect(result.success).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.CRITICAL);
    });
  });

  describe('processDataSubjectRequest', () => {
    it('應該處理查詢請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.ACCESS,
        'user123',
        { dataType: 'contact' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('查詢請求');
      expect(result.data).toBeDefined();
      expect(result.data?.requestId).toContain('access_');
    });

    it('應該處理複製本請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.COPY,
        'user123',
        { format: 'json' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('複製本請求');
      expect(result.data?.requestId).toContain('copy_');
    });

    it('應該處理更正請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.CORRECTION,
        'user123',
        { field: 'email', newValue: 'new@example.com' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('更正請求');
      expect(result.data?.requestId).toContain('correction_');
    });

    it('應該處理刪除請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.DELETION,
        'user123',
        { reason: 'no longer needed' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('刪除請求');
      expect(result.data?.requestId).toContain('deletion_');
    });

    it('應該處理可攜性請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.PORTABILITY,
        'user123',
        { format: 'json' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('可攜性請求');
      expect(result.data?.requestId).toContain('portability_');
    });

    it('應該處理撤回同意請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.WITHDRAWAL,
        'user123',
        { consentType: 'marketing' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('撤回同意請求');
      expect(result.data?.requestId).toContain('withdrawal_');
    });

    it('應該處理申訴請求', () => {
      const _result = service.processDataSubjectRequest(
        TaiwanDataSubjectRight.COMPLAINT,
        'user123',
        { issue: 'unauthorized processing' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('申訴請求');
      expect(result.data?.requestId).toContain('complaint_');
    });

    it('應該處理不支援的權利請求類型', () => {
      const _result = service.processDataSubjectRequest(
        'UNKNOWN_RIGHT' as TaiwanDataSubjectRight,
        'user123',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('不支援的權利請求類型');
    });
  });

  describe('manageCrossBorderTransfer', () => {
    it('應該管理有效的跨境傳輸', () => {
      const transfer: TaiwanCrossBorderTransfer = {
        id: 'transfer-1',
        destinationCountry: 'Japan',
        transferMethod: TaiwanTransferMethod.STANDARD_CONTRACTUAL_CLAUSES,
        adequacyDecision: false,
        safeguards: [
          TaiwanSafeguard.CONTRACTUAL_OBLIGATIONS,
          TaiwanSafeguard.TECHNICAL_MEASURES,
        ],
        recipientInfo: {
          name: 'Japan Partner Co.',
          country: 'Japan',
          purpose: 'Service provision',
          dataCategories: [TaiwanDataCategory.CONTACT],
          retentionPeriod: 365,
          securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        },
        riskAssessment: {
          riskLevel: TaiwanRiskLevel.MEDIUM,
          riskFactors: ['Different legal framework'],
          mitigationMeasures: ['Standard contractual clauses'],
          residualRisk: TaiwanRiskLevel.LOW,
          reviewDate: new Date(),
        },
        approvalRequired: true,
        approvalStatus: TaiwanApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.manageCrossBorderTransfer(transfer);

      expect(result.success).toBe(true);
      expect(result.message).toContain('跨境傳輸管理成功');
      expect(result.data?.transferId).toBe(transfer.id);
    });

    it('應該檢測缺少目的地國家', () => {
      const transfer: TaiwanCrossBorderTransfer = {
        id: 'transfer-2',
        destinationCountry: '',
        transferMethod: TaiwanTransferMethod.STANDARD_CONTRACTUAL_CLAUSES,
        adequacyDecision: false,
        safeguards: [TaiwanSafeguard.CONTRACTUAL_OBLIGATIONS],
        recipientInfo: {
          name: 'Partner Co.',
          country: 'Unknown',
          purpose: 'Service provision',
          dataCategories: [TaiwanDataCategory.CONTACT],
          retentionPeriod: 365,
          securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        },
        riskAssessment: {
          riskLevel: TaiwanRiskLevel.MEDIUM,
          riskFactors: [],
          mitigationMeasures: [],
          residualRisk: TaiwanRiskLevel.MEDIUM,
          reviewDate: new Date(),
        },
        approvalRequired: true,
        approvalStatus: TaiwanApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.manageCrossBorderTransfer(transfer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('目的地國家未指定');
    });

    it('應該檢測缺少傳輸方式', () => {
      const transfer: TaiwanCrossBorderTransfer = {
        id: 'transfer-3',
        destinationCountry: 'Japan',
        transferMethod: '' as TaiwanTransferMethod,
        adequacyDecision: false,
        safeguards: [TaiwanSafeguard.CONTRACTUAL_OBLIGATIONS],
        recipientInfo: {
          name: 'Partner Co.',
          country: 'Japan',
          purpose: 'Service provision',
          dataCategories: [TaiwanDataCategory.CONTACT],
          retentionPeriod: 365,
          securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        },
        riskAssessment: {
          riskLevel: TaiwanRiskLevel.MEDIUM,
          riskFactors: [],
          mitigationMeasures: [],
          residualRisk: TaiwanRiskLevel.MEDIUM,
          reviewDate: new Date(),
        },
        approvalRequired: true,
        approvalStatus: TaiwanApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.manageCrossBorderTransfer(transfer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('傳輸方式未指定');
    });

    it('應該檢測缺少保護措施', () => {
      const transfer: TaiwanCrossBorderTransfer = {
        id: 'transfer-4',
        destinationCountry: 'Japan',
        transferMethod: TaiwanTransferMethod.STANDARD_CONTRACTUAL_CLAUSES,
        adequacyDecision: false,
        safeguards: [],
        recipientInfo: {
          name: 'Partner Co.',
          country: 'Japan',
          purpose: 'Service provision',
          dataCategories: [TaiwanDataCategory.CONTACT],
          retentionPeriod: 365,
          securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        },
        riskAssessment: {
          riskLevel: TaiwanRiskLevel.MEDIUM,
          riskFactors: [],
          mitigationMeasures: [],
          residualRisk: TaiwanRiskLevel.MEDIUM,
          reviewDate: new Date(),
        },
        approvalRequired: true,
        approvalStatus: TaiwanApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.manageCrossBorderTransfer(transfer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('未指定適當保護措施');
    });

    it('應該檢測缺少風險評估', () => {
      const transfer: TaiwanCrossBorderTransfer = {
        id: 'transfer-5',
        destinationCountry: 'Japan',
        transferMethod: TaiwanTransferMethod.STANDARD_CONTRACTUAL_CLAUSES,
        adequacyDecision: false,
        safeguards: [TaiwanSafeguard.CONTRACTUAL_OBLIGATIONS],
        recipientInfo: {
          name: 'Partner Co.',
          country: 'Japan',
          purpose: 'Service provision',
          dataCategories: [TaiwanDataCategory.CONTACT],
          retentionPeriod: 365,
          securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        },
        riskAssessment: null as any,
        approvalRequired: true,
        approvalStatus: TaiwanApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.manageCrossBorderTransfer(transfer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('未進行風險評估');
    });
  });

  describe('handleDataSubjectRights', () => {
    it('應該處理多個權利請求', () => {
      const _rights = [
        TaiwanDataSubjectRight.ACCESS,
        TaiwanDataSubjectRight.CORRECTION,
        TaiwanDataSubjectRight.DELETION,
      ];

      const _result = service.handleDataSubjectRights(rights, 'user123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('已處理 3/3 項權利請求');
      expect(result.data?.successCount).toBe(3);
      expect(result.data?.totalCount).toBe(3);
    });

    it('應該處理空權利列表', () => {
      const _result = service.handleDataSubjectRights([], 'user123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('已處理 0/0 項權利請求');
      expect(result.data?.successCount).toBe(0);
      expect(result.data?.totalCount).toBe(0);
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const _startDate = new Date('2024-01-01');
      const _endDate = new Date('2024-12-31');

      const _result = service.generateComplianceReport(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.auditTrail).toBeInstanceOf(Array);
      expect(result.violations).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('應該生成無違規的報告', () => {
      const _startDate = new Date('2024-01-01');
      const _endDate = new Date('2024-12-31');

      const _result = service.generateComplianceReport(startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.LOW);
    });
  });

  describe('getAuditTrails', () => {
    it('應該返回審計追蹤', () => {
      // 先執行一些操作來產生審計追蹤
      service.validatePersonalDataProcessing({
        id: 'test-audit',
        purpose: 'test',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [TaiwanSecurityMeasure.ENCRYPTION],
        consentRequired: true,
        consentMethod: TaiwanConsentMethod.EXPLICIT,
        dataSubjectRights: [TaiwanDataSubjectRight.ACCESS],
        auditTrail: true,
        breachNotification: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const _auditTrails = service.getAuditTrails();

      expect(auditTrails).toBeInstanceOf(Array);
      expect(auditTrails.length).toBeGreaterThan(0);
      expect(auditTrails[0]).toHaveProperty('id');
      expect(auditTrails[0]).toHaveProperty('action');
      expect(auditTrails[0]).toHaveProperty('timestamp');
    });
  });

  describe('getViolations', () => {
    it('應該返回違規記錄', () => {
      // 先執行一些操作來產生違規記錄
      service.validatePersonalDataProcessing({
        id: 'test-violation',
        purpose: '',
        dataCategory: TaiwanDataCategory.CONTACT,
        processingMethod: TaiwanProcessingMethod.COLLECTION,
        retentionPeriod: 365,
        crossBorderTransfer: false,
        thirdPartySharing: false,
        securityMeasures: [],
        consentRequired: true,
        dataSubjectRights: [],
        auditTrail: false,
        breachNotification: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const _violations = service.getViolations();

      expect(violations).toBeInstanceOf(Array);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toHaveProperty('id');
      expect(violations[0]).toHaveProperty('violationType');
      expect(violations[0]).toHaveProperty('severity');
    });
  });

  describe('cleanup', () => {
    it('應該清理過期資料', () => {
      // 執行清理操作
      service.cleanup();

      // 清理後應該仍然可以正常操作
      const _auditTrails = service.getAuditTrails();
      const _violations = service.getViolations();

      expect(auditTrails).toBeInstanceOf(Array);
      expect(violations).toBeInstanceOf(Array);
    });
  });
});
