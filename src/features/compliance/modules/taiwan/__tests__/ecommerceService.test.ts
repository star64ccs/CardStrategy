// 台灣電子商務法服務測試
// Taiwan E-commerce Law Service Tests

import { TaiwanEcommerceService } from '../services/ecommerceService';
import type {
  TaiwanEcommercePlatform,
  TaiwanOnlineTransaction,
  TaiwanSeller,
} from '../types/ecommerce';
import {
  TaiwanPlatformType,
  TaiwanBusinessModel,
  TaiwanRevenueModel,
  TaiwanComplianceStatus,
  TaiwanRegistrationInfo,
  TaiwanBusinessLicense,
  TaiwanLicenseType,
  TaiwanLicenseStatus,
  TaiwanTransactionType,
  TaiwanSellerType,
  TaiwanContactInfo,
  TaiwanContactType,
  TaiwanBuyer,
  TaiwanBuyerType,
  TaiwanProduct,
  TaiwanProductType,
  TaiwanWarrantyInfo,
  TaiwanWarrantyType,
  TaiwanReturnPolicy,
  TaiwanReturnMethod,
  TaiwanRefundPolicy,
  TaiwanRefundType,
  TaiwanPaymentMethod,
  TaiwanPaymentType,
  TaiwanTransactionLimits,
  TaiwanPaymentFees,
  TaiwanDeliveryMethod,
  TaiwanDeliveryType,
  TaiwanDisputeResolution,
  TaiwanDisputeType,
  TaiwanResolutionMethod,
  TaiwanViolationSeverity,
  TaiwanRiskLevel,
} from '../types/ecommerce';

describe('TaiwanEcommerceService', () => {
  let service: TaiwanEcommerceService;

  beforeEach(() => {
    service = TaiwanEcommerceService.getInstance();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const _instance1 = TaiwanEcommerceService.getInstance();
      const _instance2 = TaiwanEcommerceService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateEcommercePlatform', () => {
    it('應該驗證合規的電子商務平台', () => {
      const platform: TaiwanEcommercePlatform = {
        id: 'platform_1',
        platformType: TaiwanPlatformType.B2C,
        platformName: '測試電商平台',
        businessModel: TaiwanBusinessModel.MARKETPLACE,
        targetMarket: ['台灣'],
        userBase: 5000,
        revenueModel: TaiwanRevenueModel.COMMISSION,
        complianceStatus: TaiwanComplianceStatus.PENDING,
        registrationInfo: {
          id: 'reg_1',
          companyName: '測試電商公司',
          registrationNumber: '12345678',
          registeredAddress: '台北市信義區',
          contactPerson: '張三',
          contactPhone: '02-12345678',
          contactEmail: 'test@example.com',
          website: 'https://test.com',
          registrationDate: new Date(),
          businessScope: ['電子商務'],
          capitalAmount: 1000000,
          currency: 'TWD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessLicense: {
          id: 'license_1',
          licenseType: TaiwanLicenseType.ECOMMERCE,
          licenseNumber: 'ECO123456',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          businessScope: ['電子商務'],
          conditions: [],
          status: TaiwanLicenseStatus.ACTIVE,
          renewalRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.LOW);
    });

    it('應該檢測缺少平台名稱', () => {
      const platform: TaiwanEcommercePlatform = {
        id: 'platform_2',
        platformType: TaiwanPlatformType.B2C,
        platformName: '',
        businessModel: TaiwanBusinessModel.MARKETPLACE,
        targetMarket: ['台灣'],
        userBase: 5000,
        revenueModel: TaiwanRevenueModel.COMMISSION,
        complianceStatus: TaiwanComplianceStatus.PENDING,
        registrationInfo: {
          id: 'reg_2',
          companyName: '測試電商公司',
          registrationNumber: '12345678',
          registeredAddress: '台北市信義區',
          contactPerson: '張三',
          contactPhone: '02-12345678',
          contactEmail: 'test@example.com',
          website: 'https://test.com',
          registrationDate: new Date(),
          businessScope: ['電子商務'],
          capitalAmount: 1000000,
          currency: 'TWD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessLicense: {
          id: 'license_2',
          licenseType: TaiwanLicenseType.ECOMMERCE,
          licenseNumber: 'ECO123456',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          businessScope: ['電子商務'],
          conditions: [],
          status: TaiwanLicenseStatus.ACTIVE,
          renewalRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少平台名稱');
    });

    it('應該檢測營業執照無效', () => {
      const platform: TaiwanEcommercePlatform = {
        id: 'platform_3',
        platformType: TaiwanPlatformType.B2C,
        platformName: '測試電商平台',
        businessModel: TaiwanBusinessModel.MARKETPLACE,
        targetMarket: ['台灣'],
        userBase: 5000,
        revenueModel: TaiwanRevenueModel.COMMISSION,
        complianceStatus: TaiwanComplianceStatus.PENDING,
        registrationInfo: {
          id: 'reg_3',
          companyName: '測試電商公司',
          registrationNumber: '12345678',
          registeredAddress: '台北市信義區',
          contactPerson: '張三',
          contactPhone: '02-12345678',
          contactEmail: 'test@example.com',
          website: 'https://test.com',
          registrationDate: new Date(),
          businessScope: ['電子商務'],
          capitalAmount: 1000000,
          currency: 'TWD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessLicense: {
          id: 'license_3',
          licenseType: TaiwanLicenseType.ECOMMERCE,
          licenseNumber: 'ECO123456',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 已過期
          businessScope: ['電子商務'],
          conditions: [],
          status: TaiwanLicenseStatus.EXPIRED,
          renewalRequired: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateEcommercePlatform(platform);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('營業執照無效或過期');
    });
  });

  describe('validateOnlineTransaction', () => {
    it('應該驗證合規的線上交易', () => {
      const transaction: TaiwanOnlineTransaction = {
        id: 'transaction_1',
        transactionType: TaiwanTransactionType.GOODS,
        seller: {
          id: 'seller_1',
          sellerType: TaiwanSellerType.BUSINESS,
          businessName: '測試賣家',
          registrationNumber: '12345678',
          contactInfo: {
            id: 'contact_1',
            contactType: TaiwanContactType.CUSTOMER_SERVICE,
            name: '客服人員',
            phone: '02-12345678',
            email: 'service@test.com',
            address: '台北市信義區',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          businessAddress: '台北市信義區',
          businessLicense: {
            id: 'license_1',
            licenseType: TaiwanLicenseType.RETAIL,
            licenseNumber: 'RET123456',
            issuingAuthority: '經濟部',
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            businessScope: ['零售'],
            conditions: [],
            status: TaiwanLicenseStatus.ACTIVE,
            renewalRequired: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          rating: 4.5,
          totalSales: 1000000,
          complianceHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        buyer: {
          id: 'buyer_1',
          buyerType: TaiwanBuyerType.INDIVIDUAL,
          name: '測試買家',
          contactInfo: {
            id: 'contact_2',
            contactType: TaiwanContactType.GENERAL,
            name: '測試買家',
            phone: '0912345678',
            email: 'buyer@test.com',
            address: '台北市大安區',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          shippingAddress: '台北市大安區',
          billingAddress: '台北市大安區',
          paymentPreferences: [],
          purchaseHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        products: [
          {
            id: 'product_1',
            productType: TaiwanProductType.PHYSICAL,
            name: '測試商品',
            description: '測試商品描述',
            category: '電子產品',
            brand: '測試品牌',
            model: 'TEST-001',
            price: 1000,
            currency: 'TWD',
            stockQuantity: 100,
            specifications: {},
            images: [],
            warranty: {
              id: 'warranty_1',
              warrantyType: TaiwanWarrantyType.MANUFACTURER,
              duration: 365,
              coverage: ['硬體故障'],
              exclusions: ['人為損壞'],
              terms: ['正常使用'],
              contactInfo: {
                id: 'contact_3',
                contactType: TaiwanContactType.TECHNICAL_SUPPORT,
                name: '技術支援',
                phone: '02-12345678',
                email: 'support@test.com',
                address: '台北市信義區',
                isPrimary: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            returnPolicy: {
              id: 'return_1',
              returnPeriod: 7,
              returnConditions: ['未拆封'],
              returnMethods: [TaiwanReturnMethod.MAIL],
              refundPolicy: {
                id: 'refund_1',
                refundType: TaiwanRefundType.FULL_REFUND,
                refundPeriod: 7,
                refundMethods: [],
                processingTime: 3,
                fees: 0,
                currency: 'TWD',
                conditions: ['未拆封'],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              restockingFee: 0,
              currency: 'TWD',
              exclusions: ['已拆封'],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            complianceInfo: {
              id: 'compliance_1',
              safetyCertification: [],
              qualityStandards: [],
              importPermits: [],
              exportPermits: [],
              restrictions: [],
              warnings: [],
              complianceStatus: TaiwanComplianceStatus.COMPLIANT,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        paymentMethod: {
          id: 'payment_1',
          paymentType: TaiwanPaymentType.CREDIT_CARD,
          provider: '測試銀行',
          accountInfo: '****-****-****-1234',
          securityFeatures: ['3D Secure'],
          transactionLimits: {
            id: 'limits_1',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            singleTransactionLimit: 10000,
            currency: 'TWD',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          fees: {
            id: 'fees_1',
            transactionFee: 0,
            percentageFee: 0.015,
            fixedFee: 0,
            currency: 'TWD',
            feeStructure: '1.5%',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          complianceStatus: TaiwanComplianceStatus.COMPLIANT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        transactionAmount: 1000,
        currency: 'TWD',
        transactionDate: new Date(),
        deliveryMethod: {
          id: 'delivery_1',
          deliveryType: TaiwanDeliveryType.STANDARD,
          provider: '測試物流',
          estimatedTime: 3,
          cost: 100,
          currency: 'TWD',
          trackingAvailable: true,
          insuranceAvailable: true,
          restrictions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        warrantyInfo: {
          id: 'warranty_2',
          warrantyType: TaiwanWarrantyType.MANUFACTURER,
          duration: 365,
          coverage: ['硬體故障'],
          exclusions: ['人為損壞'],
          terms: ['正常使用'],
          contactInfo: {
            id: 'contact_4',
            contactType: TaiwanContactType.TECHNICAL_SUPPORT,
            name: '技術支援',
            phone: '02-12345678',
            email: 'support@test.com',
            address: '台北市信義區',
            isPrimary: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        returnPolicy: {
          id: 'return_2',
          returnPeriod: 7,
          returnConditions: ['未拆封'],
          returnMethods: [TaiwanReturnMethod.MAIL],
          refundPolicy: {
            id: 'refund_2',
            refundType: TaiwanRefundType.FULL_REFUND,
            refundPeriod: 7,
            refundMethods: [],
            processingTime: 3,
            fees: 0,
            currency: 'TWD',
            conditions: ['未拆封'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          restockingFee: 0,
          currency: 'TWD',
          exclusions: ['已拆封'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        disputeResolution: {
          id: 'dispute_1',
          disputeType: TaiwanDisputeType.PRODUCT_QUALITY,
          resolutionMethod: TaiwanResolutionMethod.MEDIATION,
          mediator: '消費者保護協會',
          timeline: 30,
          costs: 0,
          currency: 'TWD',
          successRate: 85,
          appealProcess: '可向法院提起訴訟',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        complianceStatus: TaiwanComplianceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateOnlineTransaction(transaction);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測缺少賣家資訊', () => {
      const transaction: TaiwanOnlineTransaction = {
        id: 'transaction_2',
        transactionType: TaiwanTransactionType.GOODS,
        seller: {
          id: 'seller_2',
          sellerType: TaiwanSellerType.BUSINESS,
          businessName: '',
          registrationNumber: '12345678',
          contactInfo: {
            id: 'contact_5',
            contactType: TaiwanContactType.CUSTOMER_SERVICE,
            name: '客服人員',
            phone: '02-12345678',
            email: 'service@test.com',
            address: '台北市信義區',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          businessAddress: '台北市信義區',
          businessLicense: {
            id: 'license_2',
            licenseType: TaiwanLicenseType.RETAIL,
            licenseNumber: 'RET123456',
            issuingAuthority: '經濟部',
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            businessScope: ['零售'],
            conditions: [],
            status: TaiwanLicenseStatus.ACTIVE,
            renewalRequired: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          rating: 4.5,
          totalSales: 1000000,
          complianceHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        buyer: {
          id: 'buyer_2',
          buyerType: TaiwanBuyerType.INDIVIDUAL,
          name: '測試買家',
          contactInfo: {
            id: 'contact_6',
            contactType: TaiwanContactType.GENERAL,
            name: '測試買家',
            phone: '0912345678',
            email: 'buyer@test.com',
            address: '台北市大安區',
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          shippingAddress: '台北市大安區',
          billingAddress: '台北市大安區',
          paymentPreferences: [],
          purchaseHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        products: [],
        paymentMethod: {
          id: 'payment_2',
          paymentType: TaiwanPaymentType.CREDIT_CARD,
          provider: '測試銀行',
          accountInfo: '****-****-****-1234',
          securityFeatures: ['3D Secure'],
          transactionLimits: {
            id: 'limits_2',
            dailyLimit: 50000,
            monthlyLimit: 500000,
            singleTransactionLimit: 10000,
            currency: 'TWD',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          fees: {
            id: 'fees_2',
            transactionFee: 0,
            percentageFee: 0.015,
            fixedFee: 0,
            currency: 'TWD',
            feeStructure: '1.5%',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          complianceStatus: TaiwanComplianceStatus.COMPLIANT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        transactionAmount: 1000,
        currency: 'TWD',
        transactionDate: new Date(),
        deliveryMethod: {
          id: 'delivery_2',
          deliveryType: TaiwanDeliveryType.STANDARD,
          provider: '測試物流',
          estimatedTime: 3,
          cost: 100,
          currency: 'TWD',
          trackingAvailable: true,
          insuranceAvailable: true,
          restrictions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        warrantyInfo: {
          id: 'warranty_3',
          warrantyType: TaiwanWarrantyType.MANUFACTURER,
          duration: 365,
          coverage: ['硬體故障'],
          exclusions: ['人為損壞'],
          terms: ['正常使用'],
          contactInfo: {
            id: 'contact_7',
            contactType: TaiwanContactType.TECHNICAL_SUPPORT,
            name: '技術支援',
            phone: '02-12345678',
            email: 'support@test.com',
            address: '台北市信義區',
            isPrimary: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        returnPolicy: {
          id: 'return_3',
          returnPeriod: 7,
          returnConditions: ['未拆封'],
          returnMethods: [TaiwanReturnMethod.MAIL],
          refundPolicy: {
            id: 'refund_3',
            refundType: TaiwanRefundType.FULL_REFUND,
            refundPeriod: 7,
            refundMethods: [],
            processingTime: 3,
            fees: 0,
            currency: 'TWD',
            conditions: ['未拆封'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          restockingFee: 0,
          currency: 'TWD',
          exclusions: ['已拆封'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        disputeResolution: {
          id: 'dispute_2',
          disputeType: TaiwanDisputeType.PRODUCT_QUALITY,
          resolutionMethod: TaiwanResolutionMethod.MEDIATION,
          mediator: '消費者保護協會',
          timeline: 30,
          costs: 0,
          currency: 'TWD',
          successRate: 85,
          appealProcess: '可向法院提起訴訟',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        complianceStatus: TaiwanComplianceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateOnlineTransaction(transaction);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '缺少賣家資訊')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '缺少商品資訊')
      ).toBe(true);
    });
  });

  describe('validateSeller', () => {
    it('應該驗證合規的賣家', () => {
      const seller: TaiwanSeller = {
        id: 'seller_3',
        sellerType: TaiwanSellerType.BUSINESS,
        businessName: '測試賣家',
        registrationNumber: '12345678',
        contactInfo: {
          id: 'contact_8',
          contactType: TaiwanContactType.CUSTOMER_SERVICE,
          name: '客服人員',
          phone: '02-12345678',
          email: 'service@test.com',
          address: '台北市信義區',
          isPrimary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessAddress: '台北市信義區',
        businessLicense: {
          id: 'license_3',
          licenseType: TaiwanLicenseType.RETAIL,
          licenseNumber: 'RET123456',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          businessScope: ['零售'],
          conditions: [],
          status: TaiwanLicenseStatus.ACTIVE,
          renewalRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        rating: 4.5,
        totalSales: 1000000,
        complianceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateSeller(seller);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測缺少統一編號', () => {
      const seller: TaiwanSeller = {
        id: 'seller_4',
        sellerType: TaiwanSellerType.BUSINESS,
        businessName: '測試賣家',
        registrationNumber: '',
        contactInfo: {
          id: 'contact_9',
          contactType: TaiwanContactType.CUSTOMER_SERVICE,
          name: '客服人員',
          phone: '02-12345678',
          email: 'service@test.com',
          address: '台北市信義區',
          isPrimary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessAddress: '台北市信義區',
        businessLicense: {
          id: 'license_4',
          licenseType: TaiwanLicenseType.RETAIL,
          licenseNumber: 'RET123456',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          businessScope: ['零售'],
          conditions: [],
          status: TaiwanLicenseStatus.ACTIVE,
          renewalRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        rating: 4.5,
        totalSales: 1000000,
        complianceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateSeller(seller);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少統一編號');
    });
  });

  describe('processPlatformRegistration', () => {
    it('應該處理合規的平台註冊', () => {
      const platform: TaiwanEcommercePlatform = {
        id: 'platform_4',
        platformType: TaiwanPlatformType.B2C,
        platformName: '新測試電商平台',
        businessModel: TaiwanBusinessModel.MARKETPLACE,
        targetMarket: ['台灣'],
        userBase: 5000,
        revenueModel: TaiwanRevenueModel.COMMISSION,
        complianceStatus: TaiwanComplianceStatus.PENDING,
        registrationInfo: {
          id: 'reg_4',
          companyName: '新測試電商公司',
          registrationNumber: '87654321',
          registeredAddress: '台北市信義區',
          contactPerson: '李四',
          contactPhone: '02-87654321',
          contactEmail: 'newtest@example.com',
          website: 'https://newtest.com',
          registrationDate: new Date(),
          businessScope: ['電子商務'],
          capitalAmount: 1000000,
          currency: 'TWD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessLicense: {
          id: 'license_5',
          licenseType: TaiwanLicenseType.ECOMMERCE,
          licenseNumber: 'ECO654321',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          businessScope: ['電子商務'],
          conditions: [],
          status: TaiwanLicenseStatus.ACTIVE,
          renewalRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.processPlatformRegistration(platform);

      expect(result.success).toBe(true);
      expect(result.message).toBe('平台註冊成功');
    });

    it('應該拒絕不合規的平台註冊', () => {
      const platform: TaiwanEcommercePlatform = {
        id: 'platform_5',
        platformType: TaiwanPlatformType.B2C,
        platformName: '',
        businessModel: TaiwanBusinessModel.MARKETPLACE,
        targetMarket: ['台灣'],
        userBase: 5000,
        revenueModel: TaiwanRevenueModel.COMMISSION,
        complianceStatus: TaiwanComplianceStatus.PENDING,
        registrationInfo: {
          id: 'reg_5',
          companyName: '不合規電商公司',
          registrationNumber: '11111111',
          registeredAddress: '台北市信義區',
          contactPerson: '王五',
          contactPhone: '02-11111111',
          contactEmail: 'invalid@example.com',
          website: 'https://invalid.com',
          registrationDate: new Date(),
          businessScope: ['電子商務'],
          capitalAmount: 1000000,
          currency: 'TWD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        businessLicense: {
          id: 'license_6',
          licenseType: TaiwanLicenseType.ECOMMERCE,
          licenseNumber: 'ECO111111',
          issuingAuthority: '經濟部',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 已過期
          businessScope: ['電子商務'],
          conditions: [],
          status: TaiwanLicenseStatus.EXPIRED,
          renewalRequired: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.processPlatformRegistration(platform);

      expect(result.success).toBe(false);
      expect(result.message).toBe('平台註冊失敗，存在合規問題');
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const _startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30天前
      const _endDate = new Date();

      const _result = service.generateComplianceReport(startDate, endDate);

      expect(result).toHaveProperty('totalPlatforms');
      expect(result).toHaveProperty('compliantPlatforms');
      expect(result).toHaveProperty('nonCompliantPlatforms');
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('compliantTransactions');
      expect(result).toHaveProperty('nonCompliantTransactions');
      expect(result).toHaveProperty('totalViolations');
      expect(result).toHaveProperty('violationsByType');
      expect(result).toHaveProperty('riskDistribution');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('getAuditTrails', () => {
    it('應該返回審計追蹤', () => {
      const _trails = service.getAuditTrails();
      expect(Array.isArray(trails)).toBe(true);
    });
  });

  describe('getViolations', () => {
    it('應該返回違規記錄', () => {
      const _violations = service.getViolations();
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('getPlatforms', () => {
    it('應該返回平台記錄', () => {
      const _platforms = service.getPlatforms();
      expect(Array.isArray(platforms)).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('應該清理過期資料', () => {
      expect(() => service.cleanup()).not.toThrow();
    });
  });
});
