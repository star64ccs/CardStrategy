import { MacauEcommerceService } from '../services/ecommerceService';
import type {
  MacauEcommercePlatform,
  MacauOnlineTransaction,
  MacauSeller,
} from '../types/ecommerce';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauEcommercePlatformType,
  MacauTransactionType,
  MacauPaymentMethod,
  MacauDeliveryMethod,
} from '../types/ecommerce';

describe('MacauEcommerceService', () => {
  let service: MacauEcommerceService;

  beforeEach(() => {
    service = MacauEcommerceService.getInstance();
  });

  describe('validateEcommercePlatform', () => {
    it('應該通過合規的電子商務平台', () => {
      const platform: MacauEcommercePlatform = {
        id: 'platform_1',
        platformType: MacauEcommercePlatformType.B2C,
        platformName: '澳門購物網',
        businessRegistration: 'MO123456789',
        contactInformation: {
          email: 'contact@macaushop.com',
          phone: '+853 1234 5678',
          address: '澳門新馬路123號',
        },
        termsOfService: '詳細的服務條款內容',
        privacyPolicy: '隱私政策內容',
        returnPolicy: '退貨政策內容',
        complianceStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少平台名稱', () => {
      const platform: MacauEcommercePlatform = {
        id: 'platform_2',
        platformType: MacauEcommercePlatformType.MARKETPLACE,
        platformName: '',
        businessRegistration: 'MO987654321',
        contactInformation: {
          email: 'info@marketplace.com',
          phone: '+853 8765 4321',
          address: '澳門氹仔區',
        },
        termsOfService: '服務條款',
        privacyPolicy: '隱私政策',
        returnPolicy: '退貨政策',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少平台名稱');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測缺少商業登記', () => {
      const platform: MacauEcommercePlatform = {
        id: 'platform_3',
        platformType: MacauEcommercePlatformType.C2C,
        platformName: '二手交易平台',
        businessRegistration: '',
        contactInformation: {
          email: 'support@secondhand.com',
          phone: '+853 5555 5555',
          address: '澳門路氹城',
        },
        termsOfService: '交易條款',
        privacyPolicy: '隱私保護',
        returnPolicy: '交易規則',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少商業登記');
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });
  });

  describe('validateOnlineTransaction', () => {
    it('應該通過合規的線上交易', () => {
      const transaction: MacauOnlineTransaction = {
        id: 'transaction_1',
        platformId: 'platform_1',
        sellerId: 'seller_123',
        buyerId: 'buyer_456',
        transactionType: MacauTransactionType.GOODS,
        productId: 'product_789',
        productName: '高品質護膚品',
        quantity: 2,
        unitPrice: 150,
        totalAmount: 300,
        paymentMethod: MacauPaymentMethod.CREDIT_CARD,
        deliveryMethod: MacauDeliveryMethod.STANDARD_SHIPPING,
        transactionDate: new Date(),
        status: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateOnlineTransaction(transaction);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少賣家資訊', () => {
      const transaction: MacauOnlineTransaction = {
        id: 'transaction_2',
        platformId: 'platform_1',
        sellerId: '',
        buyerId: 'buyer_789',
        transactionType: MacauTransactionType.SERVICES,
        productId: 'service_123',
        productName: '',
        quantity: 1,
        unitPrice: 200,
        totalAmount: 200,
        paymentMethod: MacauPaymentMethod.DIGITAL_WALLET,
        deliveryMethod: MacauDeliveryMethod.DIGITAL_DELIVERY,
        transactionDate: new Date(),
        status: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateOnlineTransaction(transaction);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '缺少賣家資訊')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少商品資訊')
      ).toBe(true);
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測無效價格資訊', () => {
      const transaction: MacauOnlineTransaction = {
        id: 'transaction_3',
        platformId: 'platform_1',
        sellerId: 'seller_456',
        buyerId: 'buyer_123',
        transactionType: MacauTransactionType.GOODS,
        productId: 'product_456',
        productName: '電子產品',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        paymentMethod: MacauPaymentMethod.BANK_TRANSFER,
        deliveryMethod: MacauDeliveryMethod.EXPRESS_SHIPPING,
        transactionDate: new Date(),
        status: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateOnlineTransaction(transaction);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('價格資訊無效');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });
  });

  describe('validateSeller', () => {
    it('應該通過合規的賣家', () => {
      const seller: MacauSeller = {
        id: 'seller_1',
        platformId: 'platform_1',
        sellerName: '澳門精品店',
        businessRegistration: 'MO111222333',
        contactInformation: {
          email: 'contact@macau-boutique.com',
          phone: '+853 1111 2222',
          address: '澳門大三巴街45號',
        },
        businessLicense: 'BL123456',
        taxRegistration: 'TR789012',
        verificationStatus: MacauComplianceStatus.COMPLIANT,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateSeller(seller);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(MacauRiskLevel.LOW);
    });

    it('應該檢測缺少賣家名稱', () => {
      const seller: MacauSeller = {
        id: 'seller_2',
        platformId: 'platform_1',
        sellerName: '',
        businessRegistration: 'MO444555666',
        contactInformation: {
          email: 'info@shop.com',
          phone: '+853 4444 5555',
          address: '澳門新馬路',
        },
        verificationStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateSeller(seller);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少賣家名稱');
      expect(result.riskLevel).toBe(MacauRiskLevel.HIGH);
    });

    it('應該檢測賣家缺少商業登記', () => {
      const seller: MacauSeller = {
        id: 'seller_3',
        platformId: 'platform_1',
        sellerName: '個人賣家',
        businessRegistration: '',
        contactInformation: {
          email: 'personal@seller.com',
          phone: '+853 7777 8888',
          address: '澳門氹仔',
        },
        verificationStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateSeller(seller);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('賣家缺少商業登記');
      expect(result.riskLevel).toBe(MacauRiskLevel.CRITICAL);
    });
  });

  describe('processPlatformRegistration', () => {
    it('應該處理B2C平台註冊', () => {
      const platform: MacauEcommercePlatform = {
        id: 'platform_4',
        platformType: MacauEcommercePlatformType.B2C,
        platformName: '新B2C平台',
        businessRegistration: 'MO999888777',
        contactInformation: {
          email: 'b2c@platform.com',
          phone: '+853 9999 8888',
          address: '澳門商業區',
        },
        termsOfService: 'B2C服務條款',
        privacyPolicy: 'B2C隱私政策',
        returnPolicy: 'B2C退貨政策',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.processPlatformRegistration(platform);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.COMPLIANT);
      expect(result.updatedAt).toBeDefined();
    });

    it('應該處理C2C平台註冊', () => {
      const platform: MacauEcommercePlatform = {
        id: 'platform_5',
        platformType: MacauEcommercePlatformType.C2C,
        platformName: 'C2C交易平台',
        businessRegistration: 'MO666777888',
        contactInformation: {
          email: 'c2c@platform.com',
          phone: '+853 6666 7777',
          address: '澳門住宅區',
        },
        termsOfService: 'C2C交易條款',
        privacyPolicy: 'C2C隱私政策',
        returnPolicy: 'C2C交易規則',
        complianceStatus: MacauComplianceStatus.PENDING,
        violations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.processPlatformRegistration(platform);

      expect(result.complianceStatus).toBe(MacauComplianceStatus.UNDER_REVIEW);
      expect(result.updatedAt).toBeDefined();
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
