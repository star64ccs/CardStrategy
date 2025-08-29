import { MacauConsumerProtectionService } from '../services/consumerProtectionService';
import type {
  MacauConsumerComplaint,
  MacauProductLabeling,
  MacauAdvertising,
} from '../types/consumerProtection';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauConsumerRight,
  MacauProductCategory,
  MacauDisputeType,
  MacauDisputeStatus,
} from '../types/consumerProtection';

describe('MacauConsumerProtectionService', () => {
  let service: MacauConsumerProtectionService;

  beforeEach(() => {
    service = MacauConsumerProtectionService.getInstance();
  });

  describe('validateConsumerRights', () => {
    it('應該通過完整的消費者權利', () => {
      const _rights = [
        MacauConsumerRight.SAFETY,
        MacauConsumerRight.INFORMATION,
        MacauConsumerRight.CHOICE,
        MacauConsumerRight.REDRESS,
        MacauConsumerRight.REPRESENTATION,
        MacauConsumerRight.EDUCATION,
      ];

      const _result = service.validateConsumerRights(rights);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少基本消費者權利', () => {
      const _rights = [
        MacauConsumerRight.INFORMATION,
        MacauConsumerRight.CHOICE,
      ];

      const _result = service.validateConsumerRights(rights);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v =>
          v.description.includes('缺少基本消費者權利')
        )
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少消費者安全權')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });

    it('應該檢測缺少安全權', () => {
      const _rights = [
        MacauConsumerRight.INFORMATION,
        MacauConsumerRight.CHOICE,
        MacauConsumerRight.REDRESS,
      ];

      const _result = service.validateConsumerRights(rights);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '缺少消費者安全權')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });
  });

  describe('validateProductLabeling', () => {
    it('應該通過合規的產品標籤', () => {
      const labeling: MacauProductLabeling = {
        id: 'labeling_1',
        productId: 'product_123',
        productName: '高品質護膚霜',
        manufacturer: '澳門護膚品有限公司',
        ingredients: ['水', '甘油', '維生素E'],
        expiryDate: new Date('2025-12-31'),
        safetyWarnings: ['避免接觸眼睛', '存放在陰涼處'],
        usageInstructions: '每日早晚使用，取適量塗抹於臉部',
        warranty: '30天無條件退換',
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateProductLabeling(labeling);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少產品名稱', () => {
      const labeling: MacauProductLabeling = {
        id: 'labeling_2',
        productId: 'product_456',
        productName: '',
        manufacturer: '',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateProductLabeling(labeling);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(4);
      expect(
        result.violations.some(v => v.description === '缺少產品名稱')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少製造商資訊')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少安全警告')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少使用說明')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測缺少製造商資訊', () => {
      const labeling: MacauProductLabeling = {
        id: 'labeling_3',
        productId: 'product_789',
        productName: '兒童玩具',
        manufacturer: '',
        safetyWarnings: ['適合3歲以上兒童'],
        usageInstructions: '請在成人監督下使用',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateProductLabeling(labeling);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少製造商資訊');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('processConsumerComplaint', () => {
    it('應該處理產品缺陷投訴', () => {
      const complaint: MacauConsumerComplaint = {
        id: 'complaint_1',
        consumerId: 'consumer_123',
        productId: 'product_456',
        complaintType: MacauDisputeType.PRODUCT_DEFECT,
        description: '產品在使用過程中出現故障',
        evidence: ['照片', '購買發票'],
        requestedResolution: '退貨退款',
        status: MacauDisputeStatus.PENDING,
        filedAt: new Date(),
      };

      const _result = service.processConsumerComplaint(complaint);

      expect(result.status).toBe(MacauDisputeStatus.UNDER_INVESTIGATION);
      expect(result.resolvedAt).toBeDefined();
      expect(result.resolution).toContain('已安排產品檢測');
    });

    it('應該處理虛假廣告投訴', () => {
      const complaint: MacauConsumerComplaint = {
        id: 'complaint_2',
        consumerId: 'consumer_456',
        complaintType: MacauDisputeType.FALSE_ADVERTISING,
        description: '廣告聲稱的效果與實際不符',
        evidence: ['廣告截圖', '使用前後對比'],
        requestedResolution: '停止虛假廣告',
        status: MacauDisputeStatus.PENDING,
        filedAt: new Date(),
      };

      const _result = service.processConsumerComplaint(complaint);

      expect(result.status).toBe(MacauDisputeStatus.UNDER_INVESTIGATION);
      expect(result.resolvedAt).toBeDefined();
      expect(result.resolution).toContain('已啟動廣告內容審查');
    });
  });

  describe('validateAdvertising', () => {
    it('應該通過合規的廣告', () => {
      const advertising: MacauAdvertising = {
        id: 'ad_1',
        productId: 'product_123',
        content: '天然護膚品，溫和不刺激',
        media: '電視廣告',
        targetAudience: '成年女性',
        claims: ['溫和配方', '適合敏感肌膚'],
        disclaimers: ['效果因人而異'],
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateAdvertising(advertising);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測虛假廣告聲明', () => {
      const advertising: MacauAdvertising = {
        id: 'ad_2',
        productId: 'product_456',
        content: '100%保證有效，絕對安全',
        media: '網絡廣告',
        targetAudience: '所有年齡層',
        claims: ['100%保證有效', '絕對安全無副作用'],
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateAdvertising(advertising);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('包含虛假或誇大聲明');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測缺少目標受眾', () => {
      const advertising: MacauAdvertising = {
        id: 'ad_3',
        content: '優質產品推薦',
        media: '平面廣告',
        targetAudience: '',
        claims: ['品質優良'],
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateAdvertising(advertising);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少目標受眾資訊');
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const _startDate = new Date('2024-01-01');
      const _endDate = new Date('2024-12-31');

      const _report = service.generateComplianceReport(startDate, endDate);

      expect(report.period.startDate).toEqual(startDate);
      expect(report.period.endDate).toEqual(endDate);
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeDefined();
      expect(report.complaints).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('getAuditTrails', () => {
    it('應該返回審計記錄', () => {
      const _auditTrails = service.getAuditTrails();
      expect(Array.isArray(auditTrails)).toBe(true);
    });
  });

  describe('getViolations', () => {
    it('應該返回違規記錄', () => {
      const _violations = service.getViolations();
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('getComplaints', () => {
    it('應該返回投訴記錄', () => {
      const _complaints = service.getComplaints();
      expect(Array.isArray(complaints)).toBe(true);
    });
  });
});
