import { MacauGamingService } from '../services/gamingService';
import type {
  MacauGamingLicense,
  MacauGamingOperation,
  MacauResponsibleGaming,
  MacauAntiMoneyLaundering,
} from '../types/gaming';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauGamingLicenseType,
  MacauGamingActivity,
} from '../types/gaming';

describe('MacauGamingService', () => {
  let service: MacauGamingService;

  beforeEach(() => {
    service = MacauGamingService.getInstance();
  });

  describe('validateGamingLicense', () => {
    it('應該通過有效的博彩執照', () => {
      const license: MacauGamingLicense = {
        id: 'license_1',
        licenseType: MacauGamingLicenseType.CASINO,
        licenseeName: '澳門娛樂有限公司',
        businessAddress: '澳門路氹城金光大道',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        status: MacauComplianceStatus.COMPLIANT,
        conditions: ['遵守博彩法規', '實施負責任博彩'],
        restrictions: ['不得向未成年人提供博彩服務'],
        renewalRequired: false,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateGamingLicense(license);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測過期的執照', () => {
      const license: MacauGamingLicense = {
        id: 'license_2',
        licenseType: MacauGamingLicenseType.GAMING_MACHINE,
        licenseeName: '澳門遊戲機公司',
        businessAddress: '澳門新馬路123號',
        validFrom: new Date('2023-01-01'),
        validTo: new Date('2023-12-31'),
        status: MacauComplianceStatus.PENDING,
        conditions: ['遵守博彩法規'],
        restrictions: ['不得向未成年人提供博彩服務'],
        renewalRequired: false,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateGamingLicense(license);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '博彩執照已過期')
      ).toBe(true);
      expect(
        result.violations.some(
          v => v.description === '執照即將到期，需要申請續期'
        )
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測缺少執照持有人資訊', () => {
      const license: MacauGamingLicense = {
        id: 'license_3',
        licenseType: MacauGamingLicenseType.JUNKET_OPERATOR,
        licenseeName: '',
        businessAddress: '澳門氹仔區',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        status: MacauComplianceStatus.PENDING,
        conditions: ['遵守博彩法規'],
        restrictions: ['不得向未成年人提供博彩服務'],
        renewalRequired: false,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateGamingLicense(license);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少執照持有人資訊');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('validateGamingOperation', () => {
    it('應該通過合規的博彩營運', () => {
      const operation: MacauGamingOperation = {
        id: 'operation_1',
        licenseId: 'license_1',
        gamingActivity: MacauGamingActivity.TABLE_GAMES,
        location: '澳門路氹城賭場',
        operatingHours: '24小時',
        maxCapacity: 1000,
        currentCapacity: 800,
        securityMeasures: ['監控系統', '警衛巡邏', '金屬探測器'],
        responsibleGamingMeasures: ['自我排除計劃', '博彩限制設置'],
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateGamingOperation(operation);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測超出容量限制', () => {
      const operation: MacauGamingOperation = {
        id: 'operation_2',
        licenseId: 'license_2',
        gamingActivity: MacauGamingActivity.SLOT_MACHINES,
        location: '澳門新馬路遊戲機中心',
        operatingHours: '10:00-02:00',
        maxCapacity: 200,
        currentCapacity: 250,
        securityMeasures: ['監控系統'],
        responsibleGamingMeasures: ['博彩限制設置'],
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateGamingOperation(operation);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(3);
      expect(
        result.violations.some(v => v.description === '超出最大容量限制')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '安全措施不足')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '負責任博彩措施不足')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('validateResponsibleGaming', () => {
    it('應該通過合規的負責任博彩', () => {
      const responsibleGaming: MacauResponsibleGaming = {
        id: 'rg_1',
        operationId: 'operation_1',
        selfExclusionProgram: true,
        gamingLimits: {
          daily: 5000,
          weekly: 20000,
          monthly: 80000,
        },
        ageVerification: true,
        responsibleGamingTraining: true,
        supportServices: ['諮詢熱線', '輔導服務'],
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateResponsibleGaming(responsibleGaming);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少年齡驗證', () => {
      const responsibleGaming: MacauResponsibleGaming = {
        id: 'rg_2',
        operationId: 'operation_2',
        selfExclusionProgram: true,
        gamingLimits: {
          daily: 3000,
          weekly: 15000,
          monthly: 60000,
        },
        ageVerification: false,
        responsibleGamingTraining: true,
        supportServices: ['諮詢熱線'],
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateResponsibleGaming(responsibleGaming);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少年齡驗證機制');
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測缺少自我排除計劃', () => {
      const responsibleGaming: MacauResponsibleGaming = {
        id: 'rg_3',
        operationId: 'operation_3',
        selfExclusionProgram: false,
        gamingLimits: {
          daily: 2000,
          weekly: 10000,
          monthly: 40000,
        },
        ageVerification: true,
        responsibleGamingTraining: false,
        supportServices: [],
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateResponsibleGaming(responsibleGaming);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少自我排除計劃');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('validateAntiMoneyLaundering', () => {
    it('應該通過合規的反洗錢措施', () => {
      const aml: MacauAntiMoneyLaundering = {
        id: 'aml_1',
        operationId: 'operation_1',
        customerDueDiligence: true,
        suspiciousTransactionReporting: true,
        recordKeeping: true,
        staffTraining: true,
        riskAssessment: MacauRiskLevel.LOW,
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateAntiMoneyLaundering(aml);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少客戶盡職調查', () => {
      const aml: MacauAntiMoneyLaundering = {
        id: 'aml_2',
        operationId: 'operation_2',
        customerDueDiligence: false,
        suspiciousTransactionReporting: true,
        recordKeeping: true,
        staffTraining: true,
        riskAssessment: MacauRiskLevel.HIGH,
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateAntiMoneyLaundering(aml);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少客戶盡職調查');
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測缺少可疑交易報告', () => {
      const aml: MacauAntiMoneyLaundering = {
        id: 'aml_3',
        operationId: 'operation_3',
        customerDueDiligence: true,
        suspiciousTransactionReporting: false,
        recordKeeping: true,
        staffTraining: false,
        riskAssessment: MacauRiskLevel.MEDIUM,
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateAntiMoneyLaundering(aml);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少可疑交易報告機制');
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
});
