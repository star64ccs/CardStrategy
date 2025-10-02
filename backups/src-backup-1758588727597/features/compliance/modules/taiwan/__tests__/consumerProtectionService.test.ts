// 台灣消費者保護法服務測試
// Taiwan Consumer Protection Act Service Tests

import { TaiwanConsumerProtectionService } from '../services/consumerProtectionService';
import type {
  TaiwanConsumerRights,
  TaiwanConsumerDispute,
  TaiwanConsumerInfo,
} from '../types/consumerProtection';
import {
  TaiwanConsumerRightType,
  TaiwanEnforcementMechanism,
  TaiwanComplaintProcess,
  TaiwanContactInfo,
  TaiwanComplianceStatus,
  TaiwanDisputeType,
  TaiwanBusinessInfo,
  TaiwanProductInfo,
  TaiwanDisputeDetails,
  TaiwanEvidence,
  TaiwanEvidenceType,
  TaiwanResolution,
  TaiwanResolutionType,
  TaiwanResolutionStatus,
  TaiwanDisputeStatus,
  TaiwanConsumerProtectionViolationType,
  TaiwanViolationSeverity,
  TaiwanRiskLevel,
} from '../types/consumerProtection';

describe('TaiwanConsumerProtectionService', () => {
  let service: TaiwanConsumerProtectionService;

  beforeEach(() => {
    service = TaiwanConsumerProtectionService.getInstance();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = TaiwanConsumerProtectionService.getInstance();
      const instance2 = TaiwanConsumerProtectionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateConsumerRights', () => {
    it('應該驗證合規的消費者權利', () => {
      const rights: TaiwanConsumerRights = {
        id: 'test-rights-1',
        rightType: TaiwanConsumerRightType.SAFETY,
        description: '消費者有權獲得安全的商品和服務',
        applicableProducts: ['electronics', 'toys'],
        applicableServices: ['online_services'],
        enforcementMechanism: TaiwanEnforcementMechanism.ADMINISTRATIVE,
        compensationAvailable: true,
        complaintProcess: {
          steps: [
            {
              stepNumber: 1,
              description: '提交申訴',
              responsibleParty: '消費者',
              timeframe: 7,
              requiredActions: ['填寫申訴表格', '提供相關證據'],
            },
          ],
          timeframes: [
            {
              stage: 'initial_review',
              timeframe: 14,
              extensionConditions: ['複雜案件', '需要額外調查'],
            },
          ],
          requiredDocuments: ['申訴表格', '購買證明', '損害證明'],
          contactInfo: {
            name: '消費者保護中心',
            phone: '0800-000-000',
            email: 'consumer@example.com',
            address: '台北市信義區',
            website: 'https://consumer.example.com',
            officeHours: '週一至週五 9:00-18:00',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateConsumerRights(rights);

      expect(result.success).toBe(true);
      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.LOW);
    });

    it('應該檢測缺少權利類型', () => {
      const rights: TaiwanConsumerRights = {
        id: 'test-rights-2',
        rightType: '' as TaiwanConsumerRightType,
        description: '消費者權利',
        applicableProducts: ['electronics'],
        applicableServices: [],
        enforcementMechanism: TaiwanEnforcementMechanism.ADMINISTRATIVE,
        compensationAvailable: true,
        complaintProcess: {
          steps: [],
          timeframes: [],
          requiredDocuments: [],
          contactInfo: {
            name: 'Test',
            phone: '0800-000-000',
            email: 'test@example.com',
            address: 'Test Address',
            website: 'https://test.example.com',
            officeHours: '9:00-18:00',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateConsumerRights(rights);

      expect(result.success).toBe(false);
      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.PARTIALLY_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe(
        TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION
      );
      expect(result.violations[0].severity).toBe(
        TaiwanViolationSeverity.MODERATE
      );
    });
  });

  describe('handleConsumerDispute', () => {
    it('應該處理有效的消費者爭議', () => {
      const dispute: TaiwanConsumerDispute = {
        id: 'test-dispute-1',
        disputeType: TaiwanDisputeType.PRODUCT_DEFECT,
        consumerInfo: {
          name: '張三',
          idNumber: 'A123456789',
          phone: '0912345678',
          email: 'zhang@example.com',
          address: '台北市信義區',
          age: 30,
          gender: 'male',
        },
        businessInfo: {
          name: '測試企業',
          businessNumber: '12345678',
          phone: '02-12345678',
          email: 'business@example.com',
          address: '台北市大安區',
          businessType: 'electronics_retail',
          registrationDate: new Date('2020-01-01'),
        },
        productInfo: {
          name: '測試手機',
          category: 'smartphone',
          brand: 'TestBrand',
          model: 'TestModel-2024',
          serialNumber: 'SN123456789',
          purchaseDate: new Date('2024-01-01'),
          purchasePrice: 15000,
          warrantyPeriod: 365,
        },
        disputeDetails: {
          description: '手機無法開機',
          incidentDate: new Date('2024-01-15'),
          location: '台北市',
          damages: [
            {
              type: 'financial',
              description: '購買費用損失',
              amount: 15000,
              evidence: ['receipt.pdf'],
            },
          ],
          requestedRelief: ['refund', 'replacement'],
          urgency: 'medium' as any,
        },
        evidence: [
          {
            type: TaiwanEvidenceType.PHOTO,
            description: '手機故障照片',
            fileUrl: 'https://example.com/photo.jpg',
            fileSize: 1024000,
            uploadDate: new Date(),
            verified: true,
          },
        ],
        resolution: {
          resolutionType: TaiwanResolutionType.REPLACEMENT,
          description: '更換新機',
          amount: 15000,
          actions: ['停止使用故障手機', '準備新機'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: TaiwanResolutionStatus.PENDING,
        },
        status: TaiwanDisputeStatus.FILED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.handleConsumerDispute(dispute);

      expect(result.success).toBe(true);
      expect(result.message).toContain('消費者爭議已成功提交');
      expect(result.data?.disputeId).toBe(dispute.id);
    });
  });

  describe('processConsumerRightsRequest', () => {
    it('應該處理安全權請求', () => {
      const consumerInfo: TaiwanConsumerInfo = {
        name: '趙六',
        idNumber: 'D222222222',
        phone: '0922222222',
        email: 'zhao@example.com',
        address: '台北市',
        age: 28,
        gender: 'female',
      };

      const result = service.processConsumerRightsRequest(
        TaiwanConsumerRightType.SAFETY,
        consumerInfo,
        { productType: 'electronics' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('安全權請求已處理');
      expect(result.data?.requestId).toContain('safety_');
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = service.generateComplianceReport(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.auditTrail).toBeInstanceOf(Array);
      expect(result.violations).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });
});
