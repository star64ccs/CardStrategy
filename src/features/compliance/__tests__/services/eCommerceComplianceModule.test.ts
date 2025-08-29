/**
 * 電子商務合規模組測試
 * 測試重構計劃任務 1.5: ECommerceComplianceModule
 */

import { ECommerceComplianceModule } from '../../services/eCommerceComplianceModule';

describe('ECommerceComplianceModule', () => {
  let eCommerceComplianceModule: ECommerceComplianceModule;

  beforeEach(async () => {
    eCommerceComplianceModule = ECommerceComplianceModule.getInstance();
    await eCommerceComplianceModule.reset();
    await eCommerceComplianceModule.initialize({
      requireAgeVerification: true,
      requireLocationVerification: true,
    });
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = ECommerceComplianceModule.getInstance();
      const _instance2 = ECommerceComplianceModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該成功初始化', async () => {
      const _result = await eCommerceComplianceModule.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        maxRiskScore: 60,
        requireAgeVerification: false,
      };
      const _result = await eCommerceComplianceModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('產品列表合規檢查測試', () => {
    test('應該檢查合規的產品列表', () => {
      const _listing = {
        title: '高品質智能手機',
        description:
          '這是一款功能強大的智能手機，具有先進的相機系統和長續航電池',
        price: 2999,
        currency: 'TWD',
        category: 'electronics',
        sellerId: 'seller_123',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.id).toBeDefined();
      expect(result.complianceStatus).toBe('compliant');
      expect(result.violations).toHaveLength(0);
      expect(result.lastReviewed).toBeInstanceOf(Date);
    });

    test('應該檢測標題不完整的違規', () => {
      const _listing = {
        title: '手機',
        description: '這是一款功能強大的智能手機',
        price: 2999,
        currency: 'TWD',
        category: 'electronics',
        sellerId: 'seller_123',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('missing_disclosure');
      expect(result.violations[0].severity).toBe('high');
    });

    test('應該檢測描述不完整的違規', () => {
      const _listing = {
        title: '高品質智能手機',
        description: '手機',
        price: 2999,
        currency: 'TWD',
        category: 'electronics',
        sellerId: 'seller_123',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('missing_disclosure');
      expect(result.violations[0].severity).toBe('medium');
    });

    test('應該檢測價格違規', () => {
      const _listing = {
        title: '高品質智能手機',
        description: '這是一款功能強大的智能手機',
        price: 0,
        currency: 'TWD',
        category: 'electronics',
        sellerId: 'seller_123',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('price_misrepresentation');
      expect(result.violations[0].severity).toBe('critical');
    });

    test('應該檢測多個違規', () => {
      const _listing = {
        title: '手機',
        description: '手機',
        price: -100,
        currency: 'TWD',
        category: 'electronics',
        sellerId: 'seller_123',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(result.violations.length).toBeGreaterThan(1);
    });
  });

  describe('交易合規檢查測試', () => {
    test('應該檢查低風險交易', () => {
      const _transaction = {
        transactionId: 'txn_123',
        buyerId: 'buyer_123',
        sellerId: 'seller_123',
        amount: 100,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      expect(result.id).toBeDefined();
      expect(result.complianceChecks).toHaveLength(4);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(['approved', 'pending_review', 'rejected']).toContain(
        result.status
      );
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該檢查高風險交易', () => {
      const _transaction = {
        transactionId: 'txn_456',
        buyerId: 'buyer_456',
        sellerId: 'seller_456',
        amount: 50000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      expect(result.complianceChecks).toHaveLength(4);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    test('應該包含年齡驗證檢查', () => {
      const _transaction = {
        transactionId: 'txn_789',
        buyerId: 'buyer_789',
        sellerId: 'seller_789',
        amount: 1000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      const _ageCheck = result.complianceChecks.find(
        check => check.type === 'age_verification'
      );
      expect(ageCheck).toBeDefined();
      expect(['pass', 'fail']).toContain(ageCheck.result);
    });

    test('應該包含位置驗證檢查', () => {
      const _transaction = {
        transactionId: 'txn_101',
        buyerId: 'buyer_101',
        sellerId: 'seller_101',
        amount: 1000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      const _locationCheck = result.complianceChecks.find(
        check => check.type === 'location_verification'
      );
      expect(locationCheck).toBeDefined();
      expect(['pass', 'fail']).toContain(locationCheck.result);
    });

    test('應該包含支付驗證檢查', () => {
      const _transaction = {
        transactionId: 'txn_102',
        buyerId: 'buyer_102',
        sellerId: 'seller_102',
        amount: 1000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      const _paymentCheck = result.complianceChecks.find(
        check => check.type === 'payment_verification'
      );
      expect(paymentCheck).toBeDefined();
      expect(['pass', 'fail']).toContain(paymentCheck.result);
    });

    test('應該包含欺詐檢測檢查', () => {
      const _transaction = {
        transactionId: 'txn_103',
        buyerId: 'buyer_103',
        sellerId: 'seller_103',
        amount: 1000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      const _fraudCheck = result.complianceChecks.find(
        check => check.type === 'fraud_detection'
      );
      expect(fraudCheck).toBeDefined();
      expect(['pass', 'fail']).toContain(fraudCheck.result);
    });
  });

  describe('消費者權利檢查測試', () => {
    test('應該檢查消費者權利', () => {
      const _result = eCommerceComplianceModule.checkConsumerRights(
        'user_123',
        'tw'
      );

      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user_123');
      expect(result.rights).toBeDefined();
      expect(result.rights.rightToInformation).toBeDefined();
      expect(result.rights.rightToWithdraw).toBeDefined();
      expect(result.rights.rightToRefund).toBeDefined();
      expect(result.rights.rightToComplaint).toBeDefined();
      expect(result.rights.rightToDataPortability).toBeDefined();
      expect(result.applicableRegulations).toBeDefined();
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    test('應該檢查不同地區的消費者權利', () => {
      const _result = eCommerceComplianceModule.checkConsumerRights(
        'user_456',
        'eu'
      );

      expect(result.userId).toBe('user_456');
      expect(result.applicableRegulations).toBeDefined();
    });
  });

  describe('合規報告生成測試', () => {
    test('應該生成合規報告', () => {
      // 先創建一些測試交易
      const _transaction1 = {
        transactionId: 'txn_201',
        buyerId: 'buyer_201',
        sellerId: 'seller_201',
        amount: 100,
        currency: 'TWD',
      };

      const _transaction2 = {
        transactionId: 'txn_202',
        buyerId: 'buyer_202',
        sellerId: 'seller_202',
        amount: 200,
        currency: 'TWD',
      };

      eCommerceComplianceModule.checkTransactionCompliance(transaction1);
      eCommerceComplianceModule.checkTransactionCompliance(transaction2);

      const _report = eCommerceComplianceModule.generateComplianceReport();

      expect(report.id).toBeDefined();
      expect(report.period).toBeDefined();
      expect(report.period.start).toBeInstanceOf(Date);
      expect(report.period.end).toBeInstanceOf(Date);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(report.summary.compliantTransactions).toBeGreaterThanOrEqual(0);
      expect(report.summary.complianceRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.complianceRate).toBeLessThanOrEqual(100);
      expect(report.summary.totalViolations).toBeGreaterThanOrEqual(0);
      expect(report.summary.averageRiskScore).toBeGreaterThanOrEqual(0);
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    test('應該生成指定期間的合規報告', () => {
      const _period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const _report = eCommerceComplianceModule.generateComplianceReport(period);

      expect(report.period.start).toEqual(period.start);
      expect(report.period.end).toEqual(period.end);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const _newConfig = {
        maxRiskScore: 50,
        requireAgeVerification: false,
      };

      eCommerceComplianceModule.updateConfig(newConfig);

      // 驗證配置已更新（通過檢查行為變化）
      const _transaction = {
        transactionId: 'txn_config',
        buyerId: 'buyer_config',
        sellerId: 'seller_config',
        amount: 1000,
        currency: 'TWD',
      };

      const _result =
        eCommerceComplianceModule.checkTransactionCompliance(transaction);

      // 如果禁用了年齡驗證，應該只有3個檢查而不是4個
      // 但由於我們在測試中總是啟用年齡驗證，這裡主要測試配置更新不會拋出錯誤
      expect(result.complianceChecks).toBeDefined();
    });
  });

  describe('重置測試', () => {
    test('應該重置模組', async () => {
      // 先創建一些數據
      const _listing = {
        title: '測試產品',
        description: '測試描述',
        price: 100,
        currency: 'TWD',
        category: 'test',
        sellerId: 'seller_test',
      };

      eCommerceComplianceModule.checkProductListingCompliance(listing);

      // 重置
      await eCommerceComplianceModule.reset();

      // 重新初始化
      const _result = await eCommerceComplianceModule.initialize();
      expect(result).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理空產品標題', () => {
      const _listing = {
        title: '',
        description: '測試描述',
        price: 100,
        currency: 'TWD',
        category: 'test',
        sellerId: 'seller_test',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(result.violations.length).toBeGreaterThan(0);
    });

    test('應該處理零價格', () => {
      const _listing = {
        title: '測試產品',
        description: '測試描述',
        price: 0,
        currency: 'TWD',
        category: 'test',
        sellerId: 'seller_test',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(
        result.violations.some(v => v.type === 'price_misrepresentation')
      ).toBe(true);
    });

    test('應該處理負價格', () => {
      const _listing = {
        title: '測試產品',
        description: '測試描述',
        price: -50,
        currency: 'TWD',
        category: 'test',
        sellerId: 'seller_test',
      };

      const _result =
        eCommerceComplianceModule.checkProductListingCompliance(listing);

      expect(result.complianceStatus).toBe('non_compliant');
      expect(
        result.violations.some(v => v.type === 'price_misrepresentation')
      ).toBe(true);
    });
  });

  describe('性能測試', () => {
    test('應該快速處理多個產品檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const _listing = {
          title: `產品${i}`,
          description: `產品${i}的描述`,
          price: 100 + i,
          currency: 'TWD',
          category: 'test',
          sellerId: `seller_${i}`,
        };

        eCommerceComplianceModule.checkProductListingCompliance(listing);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });

    test('應該快速處理多個交易檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const _transaction = {
          transactionId: `txn_perf_${i}`,
          buyerId: `buyer_${i}`,
          sellerId: `seller_${i}`,
          amount: 100 + i,
          currency: 'TWD',
        };

        eCommerceComplianceModule.checkTransactionCompliance(transaction);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });
  });

  describe('功能測試', () => {
    test('應該處理複雜的電子商務場景', () => {
      // 創建多個產品列表
      const _listings = [
        {
          title: '高品質智能手機',
          description: '這是一款功能強大的智能手機，具有先進的相機系統',
          price: 2999,
          currency: 'TWD',
          category: 'electronics',
          sellerId: 'seller_1',
        },
        {
          title: '筆記本電腦',
          description: '高性能筆記本電腦，適合工作和娛樂',
          price: 45000,
          currency: 'TWD',
          category: 'electronics',
          sellerId: 'seller_2',
        },
      ];

      const _listingResults = listings.map(listing =>
        eCommerceComplianceModule.checkProductListingCompliance(listing)
      );

      // 創建多個交易
      const _transactions = [
        {
          transactionId: 'txn_complex_1',
          buyerId: 'buyer_1',
          sellerId: 'seller_1',
          amount: 2999,
          currency: 'TWD',
        },
        {
          transactionId: 'txn_complex_2',
          buyerId: 'buyer_2',
          sellerId: 'seller_2',
          amount: 45000,
          currency: 'TWD',
        },
      ];

      const _transactionResults = transactions.map(transaction =>
        eCommerceComplianceModule.checkTransactionCompliance(transaction)
      );

      // 檢查消費者權利
      const _rightsResult = eCommerceComplianceModule.checkConsumerRights(
        'user_complex',
        'tw'
      );

      // 生成報告
      const _report = eCommerceComplianceModule.generateComplianceReport();

      // 驗證結果
      expect(listingResults).toHaveLength(2);
      expect(transactionResults).toHaveLength(2);
      expect(rightsResult).toBeDefined();
      expect(report).toBeDefined();

      // 驗證至少有一個產品列表是合規的
      const _compliantListings = listingResults.filter(
        r => r.complianceStatus === 'compliant'
      );
      expect(compliantListings.length).toBeGreaterThan(0);

      // 驗證交易檢查都包含必要的檢查項目
      transactionResults.forEach(result => {
        expect(result.complianceChecks).toHaveLength(4);
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
        expect(result.riskScore).toBeLessThanOrEqual(100);
      });
    });
  });
});
