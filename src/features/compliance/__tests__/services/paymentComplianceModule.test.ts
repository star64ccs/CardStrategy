/**
 * 支付合規模組Test
 * Test重構計劃Task 1.6: PaymentComplianceModule
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
      const _instance1 = PaymentComplianceModule.getInstance();
      const _instance2 = PaymentComplianceModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該SuccessInitialize', async () => {
      const _result = await paymentComplianceModule.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        maxRiskScore: 60,
        autoFlagThreshold: 50,
      };
      const _result = await paymentComplianceModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('支付方式合規檢查測試', () => {
    test('應該檢查合規的支付方式', () => {
      const _paymentMethod = {
        type: 'credit_card' as const,
        provider: 'Visa',
        securityLevel: 'enhanced' as const,
      };

      const _result =
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
      const _paymentMethods = [
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
        const _result =
          paymentComplianceModule.checkPaymentMethodCompliance(method);
        expect(result.type).toBe(method.type);
        expect(result.provider).toBe(method.provider);
        expect(result.securityLevel).toBe(method.securityLevel);
      });
    });
  });

  describe('支付交易合規檢查測試', () => {
    test('應該檢查低風險交易', () => {
      const _transaction = {
        transactionId: 'txn_123',
        amount: 100,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_123',
        customerId: 'customer_123',
      };

      const _result =
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
      const _transaction = {
        transactionId: 'txn_456',
        amount: 50000,
        currency: 'TWD',
        paymentMethod: 'bank_transfer',
        merchantId: 'merchant_456',
        customerId: 'customer_456',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.complianceChecks).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    test('應該包含AML篩查檢查', () => {
      const _transaction = {
        transactionId: 'txn_789',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_789',
        customerId: 'customer_789',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const _amlCheck = result.complianceChecks.find(
        check => check.type === 'aml_screening'
      );
      expect(amlCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(amlCheck.result);
    });

    test('應該包含KYC驗證檢查', () => {
      const _transaction = {
        transactionId: 'txn_101',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_101',
        customerId: 'customer_101',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const _kycCheck = result.complianceChecks.find(
        check => check.type === 'kyc_verification'
      );
      expect(kycCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(kycCheck.result);
    });

    test('應該包含欺詐檢測檢查', () => {
      const _transaction = {
        transactionId: 'txn_102',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_102',
        customerId: 'customer_102',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      const _fraudCheck = result.complianceChecks.find(
        check => check.type === 'fraud_detection'
      );
      expect(fraudCheck).toBeDefined();
      expect(['pass', 'fail', 'warning']).toContain(fraudCheck.result);
    });
  });

  describe('AML篩查測試', () => {
    test('應該執行AML篩查', () => {
      const _transaction = {
        transactionId: 'txn_aml_1',
        customerId: 'customer_aml_1',
        amount: 1000,
      };

      const _result = paymentComplianceModule.performAMLScreening(transaction);

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
      const _lowRiskTransaction = {
        transactionId: 'txn_low',
        customerId: 'customer_low',
        amount: 1000,
      };

      const _mediumRiskTransaction = {
        transactionId: 'txn_medium',
        customerId: 'customer_medium',
        amount: 7500,
      };

      const _highRiskTransaction = {
        transactionId: 'txn_high',
        customerId: 'customer_high',
        amount: 15000,
      };

      const _lowResult =
        paymentComplianceModule.performAMLScreening(lowRiskTransaction);
      const _mediumResult = paymentComplianceModule.performAMLScreening(
        mediumRiskTransaction
      );
      const _highResult =
        paymentComplianceModule.performAMLScreening(highRiskTransaction);

      expect(lowResult.riskLevel).toBe('low');
      expect(mediumResult.riskLevel).toBe('medium');
      expect(highResult.riskLevel).toBe('high');
    });
  });

  describe('KYC驗證測試', () => {
    test('應該執行KYC驗證', () => {
      const _customerId = 'customer_kyc_1';

      const _result = paymentComplianceModule.performKYCVerification(customerId);

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
      const _customerIds = [
        'customer_basic',
        'customer_enhanced',
        'customer_premium',
      ];

      customerIds.forEach(customerId => {
        const _result =
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
      // 先Create一些Test交易
      const _transaction1 = {
        transactionId: 'txn_report_1',
        amount: 100,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_1',
        customerId: 'customer_1',
      };

      const _transaction2 = {
        transactionId: 'txn_report_2',
        amount: 200,
        currency: 'TWD',
        paymentMethod: 'debit_card',
        merchantId: 'merchant_2',
        customerId: 'customer_2',
      };

      paymentComplianceModule.checkTransactionCompliance(transaction1);
      paymentComplianceModule.checkTransactionCompliance(transaction2);

      const _report = paymentComplianceModule.generateComplianceReport();

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
      const _period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const _report = paymentComplianceModule.generateComplianceReport(period);

      expect(report.period.start).toEqual(period.start);
      expect(report.period.end).toEqual(period.end);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const _newConfig = {
        maxRiskScore: 50,
        autoFlagThreshold: 40,
      };

      paymentComplianceModule.updateConfig(newConfig);

      // VerifyConfigure已Update（通過CheckRow為變化）
      const _transaction = {
        transactionId: 'txn_config',
        amount: 1000,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_config',
        customerId: 'customer_config',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);
      expect(result.complianceChecks).toBeDefined();
    });
  });

  describe('重置測試', () => {
    test('應該重置模組', async () => {
      // 先Create一些Data
      const _paymentMethod = {
        type: 'credit_card' as const,
        provider: 'Test Provider',
        securityLevel: 'standard' as const,
      };

      paymentComplianceModule.checkPaymentMethodCompliance(paymentMethod);

      // Reset
      await paymentComplianceModule.reset();

      // ReInitialize
      const _result = await paymentComplianceModule.initialize();
      expect(result).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理零金額交易', () => {
      const _transaction = {
        transactionId: 'txn_zero',
        amount: 0,
        currency: 'TWD',
        paymentMethod: 'credit_card',
        merchantId: 'merchant_zero',
        customerId: 'customer_zero',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    test('應該處理極高金額交易', () => {
      const _transaction = {
        transactionId: 'txn_high',
        amount: 1000000,
        currency: 'TWD',
        paymentMethod: 'bank_transfer',
        merchantId: 'merchant_high',
        customerId: 'customer_high',
      };

      const _result =
        paymentComplianceModule.checkTransactionCompliance(transaction);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('性能測試', () => {
    test('應該快速處理多個支付方式檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const _paymentMethod = {
          type: 'credit_card' as const,
          provider: `Provider_${i}`,
          securityLevel: 'standard' as const,
        };

        paymentComplianceModule.checkPaymentMethodCompliance(paymentMethod);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    test('應該快速處理多個交易檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const _transaction = {
          transactionId: `txn_perf_${i}`,
          amount: 100 + i,
          currency: 'TWD',
          paymentMethod: 'credit_card',
          merchantId: `merchant_${i}`,
          customerId: `customer_${i}`,
        };

        paymentComplianceModule.checkTransactionCompliance(transaction);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });
  });

  describe('功能測試', () => {
    test('應該處理複雜的支付合規場景', () => {
      // CheckMultiple支付方式
      const _paymentMethods = [
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

      const _paymentMethodResults = paymentMethods.map(method =>
        paymentComplianceModule.checkPaymentMethodCompliance(method)
      );

      // CheckMultiple交易
      const _transactions = [
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

      const _transactionResults = transactions.map(transaction =>
        paymentComplianceModule.checkTransactionCompliance(transaction)
      );

      // 執RowAML篩查
      const _amlResult = paymentComplianceModule.performAMLScreening(
        transactions[1]
      );

      // 執RowKYCVerify
      const _kycResult =
        paymentComplianceModule.performKYCVerification('customer_complex');

      // 生成Report
      const _report = paymentComplianceModule.generateComplianceReport();

      // Verify結果
      expect(paymentMethodResults).toHaveLength(2);
      expect(transactionResults).toHaveLength(2);
      expect(amlResult).toBeDefined();
      expect(kycResult).toBeDefined();
      expect(report).toBeDefined();

      // Verify至少有一個支付方式Yes合規的
      const _compliantMethods = paymentMethodResults.filter(
        r => r.complianceStatus === 'compliant'
      );
      expect(compliantMethods.length).toBeGreaterThan(0);

      // Verify交易Check都Package含必要的Check項目
      transactionResults.forEach(result => {
        expect(result.complianceChecks).toBeDefined();
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
        expect(result.riskScore).toBeLessThanOrEqual(100);
      });

      // VerifyAML篩查結果
      expect(['low', 'medium', 'high']).toContain(amlResult.riskLevel);
      expect(['clear', 'suspicious', 'blocked']).toContain(
        amlResult.screeningResult
      );

      // VerifyKYCVerify結果
      expect(['basic', 'enhanced', 'premium']).toContain(
        kycResult.verificationLevel
      );
      expect(['pending', 'verified', 'failed', 'expired']).toContain(
        kycResult.status
      );
    });
  });
});
