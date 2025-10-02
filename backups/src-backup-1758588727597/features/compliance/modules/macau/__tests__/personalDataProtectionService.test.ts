import { MacauPersonalDataProtectionService } from '../services/personalDataProtectionService';
import type {
  MacauDataProcessing,
  MacauCrossBorderTransfer,
  MacauDataSubjectRequest,
} from '../types/personalDataProtection';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauDataCategory,
  MacauProcessingMethod,
  MacauSecurityMeasure,
  MacauConsentType,
  MacauDataSubjectRight,
} from '../types/personalDataProtection';

describe('MacauPersonalDataProtectionService', () => {
  let service: MacauPersonalDataProtectionService;

  beforeEach(() => {
    service = MacauPersonalDataProtectionService.getInstance();
  });

  describe('validateDataProcessing', () => {
    it('應該通過合規的資料處理', () => {
      const processing: MacauDataProcessing = {
        id: 'test_processing_1',
        purpose: '客戶服務',
        legalBasis: '履行契約',
        dataCategories: [MacauDataCategory.CONTACT],
        processingMethods: [
          MacauProcessingMethod.COLLECTION,
          MacauProcessingMethod.STORAGE,
        ],
        dataRetentionPeriod: 365,
        securityMeasures: [
          MacauSecurityMeasure.ENCRYPTION,
          MacauSecurityMeasure.ACCESS_CONTROL,
          MacauSecurityMeasure.AUDIT_LOGGING,
        ],
        consentRequired: true,
        consentType: MacauConsentType.EXPLICIT,
        crossBorderTransfer: false,
        riskAssessment: MacauRiskLevel.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateDataProcessing(processing);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少法律基礎', () => {
      const processing: MacauDataProcessing = {
        id: 'test_processing_2',
        purpose: '行銷活動',
        legalBasis: '',
        dataCategories: [MacauDataCategory.CONTACT],
        processingMethods: [MacauProcessingMethod.USE],
        dataRetentionPeriod: 180,
        securityMeasures: [MacauSecurityMeasure.ENCRYPTION],
        consentRequired: true,
        consentType: MacauConsentType.EXPLICIT,
        crossBorderTransfer: false,
        riskAssessment: MacauRiskLevel.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateDataProcessing(processing);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '缺少法律基礎')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '安全措施不足')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測敏感資料需要明確同意', () => {
      const processing: MacauDataProcessing = {
        id: 'test_processing_3',
        purpose: '健康管理',
        legalBasis: '明確同意',
        dataCategories: [MacauDataCategory.SENSITIVE, MacauDataCategory.HEALTH],
        processingMethods: [
          MacauProcessingMethod.COLLECTION,
          MacauProcessingMethod.STORAGE,
        ],
        dataRetentionPeriod: 730,
        securityMeasures: [
          MacauSecurityMeasure.ENCRYPTION,
          MacauSecurityMeasure.ACCESS_CONTROL,
          MacauSecurityMeasure.AUDIT_LOGGING,
        ],
        consentRequired: false,
        crossBorderTransfer: false,
        riskAssessment: MacauRiskLevel.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateDataProcessing(processing);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('敏感資料需要明確同意');
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測資料保留期限過長', () => {
      const processing: MacauDataProcessing = {
        id: 'test_processing_4',
        purpose: '客戶關係管理',
        legalBasis: '履行契約',
        dataCategories: [MacauDataCategory.CONTACT],
        processingMethods: [MacauProcessingMethod.STORAGE],
        dataRetentionPeriod: 3000,
        securityMeasures: [
          MacauSecurityMeasure.ENCRYPTION,
          MacauSecurityMeasure.ACCESS_CONTROL,
          MacauSecurityMeasure.AUDIT_LOGGING,
        ],
        consentRequired: true,
        consentType: MacauConsentType.EXPLICIT,
        crossBorderTransfer: false,
        riskAssessment: MacauRiskLevel.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateDataProcessing(processing);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('資料保留期限過長');
      expect(result.riskLevel).toBe(MacauRiskLevel.MEDIUM);
    });
  });

  describe('processDataSubjectRequest', () => {
    it('應該處理資料存取請求', () => {
      const request: MacauDataSubjectRequest = {
        id: 'request_1',
        dataSubjectId: 'user_123',
        rightType: MacauDataSubjectRight.ACCESS,
        description: '請求存取個人資料',
        status: MacauComplianceStatus.PENDING,
        requestedAt: new Date(),
      };

      const result = service.processDataSubjectRequest(request);

      expect(result.status).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.processedAt).toBeDefined();
      expect(result.response).toContain('已提供資料副本');
    });

    it('應該處理資料刪除請求', () => {
      const request: MacauDataSubjectRequest = {
        id: 'request_2',
        dataSubjectId: 'user_456',
        rightType: MacauDataSubjectRight.ERASURE,
        description: '請求刪除個人資料',
        status: MacauComplianceStatus.PENDING,
        requestedAt: new Date(),
      };

      const result = service.processDataSubjectRequest(request);

      expect(result.status).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.processedAt).toBeDefined();
      expect(result.response).toContain('已刪除相關個人資料');
    });
  });

  describe('validateCrossBorderTransfer', () => {
    it('應該通過合規的跨境傳輸', () => {
      const transfer: MacauCrossBorderTransfer = {
        id: 'transfer_1',
        destinationCountry: '香港',
        dataCategories: [MacauDataCategory.CONTACT],
        transferMethod: '雲端儲存',
        safeguards: ['標準契約條款'],
        adequacyDecision: false,
        standardContractualClauses: true,
        bindingCorporateRules: false,
        riskAssessment: MacauRiskLevel.LOW,
        approvalRequired: false,
        approvalStatus: MacauComplianceStatus.COMPLIANT,
        createdAt: new Date(),
      };

      const result = service.validateCrossBorderTransfer(transfer);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少目的地國家', () => {
      const transfer: MacauCrossBorderTransfer = {
        id: 'transfer_2',
        destinationCountry: '',
        dataCategories: [MacauDataCategory.FINANCIAL],
        transferMethod: 'API傳輸',
        safeguards: [],
        adequacyDecision: false,
        standardContractualClauses: false,
        bindingCorporateRules: false,
        riskAssessment: MacauRiskLevel.HIGH,
        approvalRequired: false,
        approvalStatus: MacauComplianceStatus.PENDING,
        createdAt: new Date(),
      };

      const result = service.validateCrossBorderTransfer(transfer);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(3);
      expect(
        result.violations.some(v => v.description === '缺少目的地國家資訊')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少適當的傳輸保障措施')
      ).toBe(true);
      expect(
        result.violations.some(
          v => v.description === '高風險跨境傳輸需要事先批准'
        )
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測高風險傳輸需要批准', () => {
      const transfer: MacauCrossBorderTransfer = {
        id: 'transfer_3',
        destinationCountry: '美國',
        dataCategories: [MacauDataCategory.SENSITIVE],
        transferMethod: '直接傳輸',
        safeguards: ['企業約束規則'],
        adequacyDecision: false,
        standardContractualClauses: false,
        bindingCorporateRules: true,
        riskAssessment: MacauRiskLevel.CRITICAL,
        approvalRequired: false,
        approvalStatus: MacauComplianceStatus.PENDING,
        createdAt: new Date(),
      };

      const result = service.validateCrossBorderTransfer(transfer);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe(
        '高風險跨境傳輸需要事先批准'
      );
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const report = service.generateComplianceReport(startDate, endDate);

      expect(report.period.startDate).toEqual(startDate);
      expect(report.period.endDate).toEqual(endDate);
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeDefined();
      expect(report.dataSubjectRequests).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('getAuditTrails', () => {
    it('應該返回審計記錄', () => {
      const auditTrails = service.getAuditTrails();
      expect(Array.isArray(auditTrails)).toBe(true);
    });
  });

  describe('getViolations', () => {
    it('應該返回違規記錄', () => {
      const violations = service.getViolations();
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('getDataSubjectRequests', () => {
    it('應該返回資料主體請求記錄', () => {
      const requests = service.getDataSubjectRequests();
      expect(Array.isArray(requests)).toBe(true);
    });
  });
});
