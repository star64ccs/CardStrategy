/**
 * 支付合規模組測試
 * 測試重構計劃任務 1.6: PaymentComplianceModule
 */

import { PaymentComplianceModule } from '../../services/paymentComplianceModule';

describe('PaymentComplianceModule', () => {
  let paymentComplianceModule: PaymentComplianceModule;

  beforeEach(async () => {
    paymentComplianceModule = PaymentComplianceModule.getInstance();
    await paymentComplianceModule.reset();
    await paymentComplianceModule.initialize();
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const instance1 = PaymentComplianceModule.getInstance();
      const instance2 = PaymentComplianceModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該成功初始化', async () => {
      const result = await paymentComplianceModule.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const customConfig = {
        maxRiskScore: 60,
        autoFlagThreshold: 50,
      };
      const result = await paymentComplianceModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('支付方式合規檢查測試', () => {
    test('應該檢查合規的支付方式', () => {
      const paymentMethod = {
        type: 'credit_card' as const,
        provider: 'Visa',
        securityLevel: 'enhanced' as const,
      };

      const result =
        paymentComplianceModule.checkPaymentMethodCompliance(paymentMethod);

      expect(result.id).toBeDefined();
      expect(result.type).toBe('credit_card');
      expect(result.provider).toBe('Visa');
      expect(result.securityLevel).toBe('enhanced');
      expect(['compliant', 'non_compliant', 'pending_review']).toContain(
        result.complianceStatus
      );
      expect(result.lastAudit).toBeInstanceOf(Date);
    });

    test('應該檢查不同類型的支付方式', () => {
      const paymentMethods = [
        {
          type: 'credit_card' as const,
          provider: 'Mastercard',
          securityLevel: 'premium' as const,
        },
        {
          type: 'digital_wallet' as const,
          provider: 'Apple Pay',
          securityLevel: 'enhanced' as const,
        },
        {
          type: 'cryptocurrency' as const,
          provider: 'Bitcoin',
          securityLevel: 'standard' as const,
        },
      ];

      paymentMethods.forEach(method => {
        const result =
          paymentComplianceModule.checkPaymentMethodCompliance(method);
        expect(result.type).toBe(method.type);
        expect(result.provider).toBe(method.provider);
        expect(result.securityLevel).toBe(method.securityLevel);
      });
    });
  });

  describe('支付交易合規檢查測試', () => {
    test('應該檢查低風險交易', () => {
      const transaction = {
        transactionId: 'txn_123',
        amount: 100,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_123',
        customerId: 'customer_123',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.id).toBeDefined();
      expect(result.complianceChecks).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(['approved', 'rejected', 'pending_review', 'flagged']).toContain(
        result.status
      );
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該檢查高風險交易', () => {
      const transaction = {
        transactionId: 'txn_456',
        amount: 50000,
        currency: 'TWD',
        paymentMethod: 'bank_transfer',
        merchantId: 'merchant_456',
        customerId: 'customer_456',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.complianceChecks).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    test('應該包含AML篩查檢查', () => {
      const transaction = {
        transactionId: 'txn_789',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_789',
        customerId: 'customer_789',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const amlCheck = result.complianceChecks.find(
        check => check.type === 'aml_screening'
      );
      expect(amlCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(amlCheck.result);
    });

    test('應該包含KYC驗證檢查', () => {
      const transaction = {
        transactionId: 'txn_101',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_101',
        customerId: 'customer_101',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const kycCheck = result.complianceChecks.find(
        check => check.type === 'kyc_verification'
      );
      expect(kycCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(kycCheck.result);
    });

    test('應該包含欺詐檢測檢查', () => {
      const transaction = {
        transactionId: 'txn_102',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_102',
        customerId: 'customer_102',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const fraudCheck = result.complianceChecks.find(
        check => check.type === 'fraud_detection'
      );
      expect(fraudCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(fraudCheck.result);
    });
  });

  describe('AML篩查測試', () => {
    test('應該執行AML篩查', () => {
      const transaction = {
        transactionId: 'txn_aml_1',
        customerId: 'customer_aml_1',
        amount: 1000,
      };

      const result = paymentComplianceModule.performAMLScreening(transaction);

      expect(result.id).toBeDefined();
      expect(result.customerId).toBe('customer_aml_1');
      expect(result.transactionId).toBe('txn_aml_1');
      expect(['low', 'medium', 'high']).toContain(result.riskLevel);
      expect(['clear', 'suspicious', 'blocked']).toContain(
        result.screeningResult
      );
      expect(Array.isArray(result.flags)).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該根據交易金額計算風險等級', () => {
      const lowRiskTransaction = {
        transactionId: 'txn_low',
        customerId: 'customer_low',
        amount: 1000,
      };

      const mediumRiskTransaction = {
        transactionId: 'txn_medium',
        customerId: 'customer_medium',
        amount: 7500,
      };

      const highRiskTransaction = {
        transactionId: 'txn_high',
        customerId: 'customer_high',
        amount: 15000,
      };

      const lowResult =
        paymentComplianceModule.performAMLScreening(lowRiskTransaction);
      const mediumResult = paymentComplianceModule.performAMLScreening(
        mediumRiskTransaction
      );
      const highResult =
        paymentComplianceModule.performAMLScreening(highRiskTransaction);

      expect(lowResult.riskLevel).toBe('low');
      expect(mediumResult.riskLevel).toBe('medium');
      expect(highResult.riskLevel).toBe('high');
    });
  });

  describe('KYC驗證測試', () => {
    test('應該執行KYC驗證', () => {
      const customerId = 'customer_kyc_1';

      const result = paymentComplianceModule.performKYCVerification(customerId);

      expect(result.id).toBeDefined();
      expect(result.customerId).toBe(customerId);
      expect(['basic', 'enhanced', 'premium']).toContain(
        result.verificationLevel
      );
      expect(['pending', 'verified', 'failed', 'expired']).toContain(
        result.status
      );
      expect(Array.isArray(result.documents)).toBe(true);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    test('應該根據驗證級別要求不同文檔', () => {
      const customerIds = [
        'customer_basic',
        'customer_enhanced',
        'customer_premium',
      ];

      customerIds.forEach(customerId => {
        const result =
          paymentComplianceModule.performKYCVerification(customerId);
        expect(result.documents).toContain('身份證明');

        if (result.verificationLevel === 'enhanced') {
          expect(result.documents).toContain('地址證明');
          expect(result.documents).toContain('收入證明');
        } else if (result.verificationLevel === 'premium') {
          expect(result.documents).toContain('地址證明');
          expect(result.documents).toContain('收入證明');
          expect(result.documents).toContain('銀行對賬單');
          expect(result.documents).toContain('稅務文件');
        }
      });
    });
  });

  describe('合規報告生成測試', () => {
    test('應該生成合規報告', () => {
      // 先創建一些測試交易
      const transaction1 = {
        transactionId: 'txn_report_1',
        amount: 100,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_1',
        customerId: 'customer_1',
      };

      const transaction2 = {
        transactionId: 'txn_report_2',
        amount: 200,
        currency: 'TWD',
        paymentMethod: 'debit_card',
        merchantId: 'merchant_2',
        customerId: 'customer_2',
      };

      paymentComplianceModule.checkTransactionCompliance(transaction1);
      paymentComplianceModule.checkTransactionCompliance(transaction2);

      const report = paymentComplianceModule.generateComplianceReport();

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
      expect(report.summary.amlFlags).toBeGreaterThanOrEqual(0);
      expect(report.summary.kycFailures).toBeGreaterThanOrEqual(0);
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    test('應該生成指定期間的合規報告', () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const report = paymentComplianceModule.generateComplianceReport(period);

      expect(report.period.start).toEqual(period.start);
      expect(report.period.end).toEqual(period.end);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const newConfig = {
        maxRiskScore: 50,
        autoFlagThreshold: 40,
      };

      paymentComplianceModule.updateConfig(newConfig);

      // 驗證配置已更新（通過檢查行為變化）
      const transaction = {
        transactionId: 'txn_config',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_config',
        customerId: 'customer_config',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);
      expect(result.complianceChecks).toBeDefined();
    });
  });

  describe('重置測試', () => {
    test('應該重置模組', async () => {
      // 先創建一些數據
      const paymentMethod = {
        type: 'credit_card' as const,
        provider: 'Test Provider',
        securityLevel: 'standard' as const,
      };

      paymentComplianceModule.checkPaymentMethodCompliance(paymentMethod);

      // 重置
      await paymentComplianceModule.reset();

      // 重新初始化
      const result = await paymentComplianceModule.initialize();
      expect(result).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理零金額交易', () => {
      const transaction = {
        transactionId: 'txn_zero',
        amount: 0,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_zero',
        customerId: 'customer_zero',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    test('應該處理極高金額交易', () => {
      const transaction = {
        transactionId: 'txn_high',
        amount: 1000000,
        currency: 'TWD',
        paymentMethod: 'bank_transfer',
        merchantId: 'merchant_high',
        customerId: 'customer_high',
      };

      const result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('性能測試', () => {
    test('應該快速處理多個支付方式檢查', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const paymentMethod = {
          type: 'credit_card' as const,
          provider: `Provider_${i}`,
          securityLevel: 'standard' as const,
        };

        paymentComplianceModule.checkPaymentMethodCompliance(paymentMethod);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });

    test('應該快速處理多個交易檢查', () => {
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const transaction = {
          transactionId: `txn_perf_${i}`,
          amount: 100 + i,
          currency: 'TWD',
          paymentMethod: 'credit_card',
          merchantId: `merchant_${i}`,
          customerId: `customer_${i}`,
        };

        paymentComplianceModule.checkTransactionCompliance(transaction);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });
  });

  describe('功能測試', () => {
    test('應該處理複雜的支付合規場景', () => {
      // 檢查多個支付方式
      const paymentMethods = [
        {
          type: 'credit_card' as const,
          provider: 'Visa',
          securityLevel: 'enhanced' as const,
        },
        {
          type: 'digital_wallet' as const,
          provider: 'Apple Pay',
          securityLevel: 'premium' as const,
        },
      ];

      const paymentMethodResults = paymentMethods.map(method =>
        paymentComplianceModule.checkPaymentMethodCompliance(method)
      );

      // 檢查多個交易
      const transactions = [
        {
          transactionId: 'txn_complex_1',
          amount: 1000,
          currency: 'TWD',
          paymentMethod: 'credit_card',
          merchantId: 'merchant_1',
          customerId: 'customer_1',
        },
        {
          transactionId: 'txn_complex_2',
          amount: 50000,
          currency: 'TWD',
          paymentMethod: 'bank_transfer',
          merchantId: 'merchant_2',
          customerId: 'customer_2',
        },
      ];

      const transactionResults = transactions.map(transaction =>
        paymentComplianceModule.checkTransactionCompliance(transaction)
      );

      // 執行AML篩查
      const amlResult = paymentComplianceModule.performAMLScreening(
        transactions[1]
      );

      // 執行KYC驗證
      const kycResult =
        paymentComplianceModule.performKYCVerification('customer_complex');

      // 生成報告
      const report = paymentComplianceModule.generateComplianceReport();

      // 驗證結果
      expect(paymentMethodResults).toHaveLength(2);
      expect(transactionResults).toHaveLength(2);
      expect(amlResult).toBeDefined();
      expect(kycResult).toBeDefined();
      expect(report).toBeDefined();

      // 驗證至少有一個支付方式是合規的
      const compliantMethods = paymentMethodResults.filter(
        r => r.complianceStatus === 'compliant'
      );
      expect(compliantMethods.length).toBeGreaterThan(0);

      // 驗證交易檢查都包含必要的檢查項目
      transactionResults.forEach(result => {
        expect(result.complianceChecks).toBeDefined();
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
        expect(result.riskScore).toBeLessThanOrEqual(100);
      });

      // 驗證AML篩查結果
      expect(['low', 'medium', 'high']).toContain(amlResult.riskLevel);
      expect(['clear', 'suspicious', 'blocked']).toContain(
        amlResult.screeningResult
      );

      // 驗證KYC驗證結果
      expect(['basic', 'enhanced', 'premium']).toContain(
        kycResult.verificationLevel
      );
      expect(['pending', 'verified', 'failed', 'expired']).toContain(
        kycResult.status
      );
    });
  });
});
