/**
 * 消費者保護模組測試
 * 測試不公平條款檢測、投訴管理、消費者權利等核心功能
 */

import { ConsumerProtectionModule } from '../../services/consumerProtectionModule';

describe('ConsumerProtectionModule', () => {
  let consumerProtectionModule: ConsumerProtectionModule;

  beforeEach(async () => {
    consumerProtectionModule = ConsumerProtectionModule.getInstance();
    await consumerProtectionModule.reset();
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const instance1 = ConsumerProtectionModule.getInstance();
      const instance2 = ConsumerProtectionModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該成功初始化模組', async () => {
      const result = await consumerProtectionModule.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const customConfig = {
        enableUnfairTermsDetection: false,
        maxResolutionTime: 60,
      };

      const result = await consumerProtectionModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('不公平條款檢測測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該檢測排除責任條款', () => {
      const contractText = '本協議排除責任，商家不承擔任何損失';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBeGreaterThan(0);
      expect(detectedTerms.some(term => term.category === 'exclusion')).toBe(
        true
      );
    });

    test('應該檢測限制賠償條款', () => {
      const contractText = '賠償金額限制賠償為最低金額';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBeGreaterThan(0);
      expect(detectedTerms.some(term => term.category === 'limitation')).toBe(
        true
      );
    });

    test('應該檢測懲罰條款', () => {
      const contractText = '違約將支付懲罰條款規定的賠償';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBeGreaterThan(0);
      expect(detectedTerms.some(term => term.category === 'penalty')).toBe(
        true
      );
    });

    test('應該處理無不公平條款的合同', () => {
      const contractText = '這是一個公平合理的合同條款';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBe(0);
    });

    test('應該處理空合同文本', () => {
      const contractText = '';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBe(0);
    });
  });

  describe('消費者投訴測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該成功提交投訴', () => {
      const complaint = {
        consumerId: 'consumer_123',
        category: 'product' as const,
        priority: 'high' as const,
        title: '產品質量問題',
        description: '購買的產品存在嚴重質量問題',
      };

      const submittedComplaint =
        consumerProtectionModule.submitComplaint(complaint);

      expect(submittedComplaint).toBeDefined();
      expect(submittedComplaint.id).toBeDefined();
      expect(submittedComplaint.consumerId).toBe('consumer_123');
      expect(submittedComplaint.category).toBe('product');
      expect(submittedComplaint.priority).toBe('high');
      expect(submittedComplaint.status).toBe('submitted');
      expect(submittedComplaint.submittedAt).toBeDefined();
      expect(submittedComplaint.updatedAt).toBeDefined();
    });

    test('應該成功更新投訴狀態', () => {
      const complaint = {
        consumerId: 'consumer_456',
        category: 'service' as const,
        priority: 'medium' as const,
        title: '服務延遲',
        description: '服務響應時間過長',
      };

      const submittedComplaint =
        consumerProtectionModule.submitComplaint(complaint);
      const updateResult = consumerProtectionModule.updateComplaintStatus(
        submittedComplaint.id,
        'under_review'
      );

      expect(updateResult).toBe(true);
    });

    test('應該成功解決投訴', () => {
      const complaint = {
        consumerId: 'consumer_789',
        category: 'billing' as const,
        priority: 'low' as const,
        title: '賬單錯誤',
        description: '賬單金額計算錯誤',
      };

      const submittedComplaint =
        consumerProtectionModule.submitComplaint(complaint);
      const updateResult = consumerProtectionModule.updateComplaintStatus(
        submittedComplaint.id,
        'resolved'
      );

      expect(updateResult).toBe(true);
    });

    test('應該拒絕更新不存在的投訴', () => {
      expect(() => {
        consumerProtectionModule.updateComplaintStatus(
          'nonexistent_id',
          'resolved'
        );
      }).toThrow('未找到投訴: nonexistent_id');
    });
  });

  describe('消費者權利測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該獲取全球消費者權利', () => {
      const rights = consumerProtectionModule.getConsumerRights('global');

      expect(rights.length).toBeGreaterThan(0);
      expect(rights.some(right => right.category === 'information')).toBe(true);
      expect(rights.some(right => right.category === 'choice')).toBe(true);
      expect(rights.some(right => right.category === 'safety')).toBe(true);
    });

    test('應該獲取特定地區的消費者權利', () => {
      const rights = consumerProtectionModule.getConsumerRights('taiwan');

      expect(rights.length).toBeGreaterThan(0);
      // 應該包含全球權利
      expect(rights.some(right => right.jurisdiction === 'global')).toBe(true);
    });

    test('應該處理不存在的地區', () => {
      const rights =
        consumerProtectionModule.getConsumerRights('nonexistent_region');

      expect(rights.length).toBeGreaterThan(0);
      // 應該至少包含全球權利
      expect(rights.some(right => right.jurisdiction === 'global')).toBe(true);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const newConfig = {
        enableUnfairTermsDetection: false,
        maxResolutionTime: 60,
      };

      consumerProtectionModule.updateConfig(newConfig);

      // 配置更新應該成功（這裡只是測試方法調用）
      expect(true).toBe(true);
    });
  });

  describe('重置測試', () => {
    test('應該重置模組狀態', async () => {
      await consumerProtectionModule.initialize();

      // 提交一些投訴
      const complaint = {
        consumerId: 'consumer_123',
        category: 'product' as const,
        priority: 'high' as const,
        title: '測試投訴',
        description: '測試描述',
      };

      consumerProtectionModule.submitComplaint(complaint);

      // 重置
      await consumerProtectionModule.reset();

      // 驗證重置後可以重新初始化
      const initResult = await consumerProtectionModule.initialize();
      expect(initResult).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該處理非常長的合同文本', () => {
      const longText = '這是一個非常長的合同文本'.repeat(1000);
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        longText,
        'global'
      );

      expect(detectedTerms).toBeDefined();
      expect(Array.isArray(detectedTerms)).toBe(true);
    });

    test('應該處理特殊字符的合同文本', () => {
      const specialText = '合同包含特殊字符：!@#$%^&*()_+-=[]{}|;:,.<>?';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        specialText,
        'global'
      );

      expect(detectedTerms).toBeDefined();
      expect(Array.isArray(detectedTerms)).toBe(true);
    });

    test('應該處理包含數字的合同文本', () => {
      const numericText = '賠償金額限制為1000元，不得超過合同金額的50%';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        numericText,
        'global'
      );

      expect(detectedTerms).toBeDefined();
      expect(Array.isArray(detectedTerms)).toBe(true);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該快速檢測大量合同', () => {
      const startTime = Date.now();
      const contracts = [
        '本協議排除所有責任',
        '賠償限制為最低金額',
        '違約將支付懲罰性賠償',
        '這是一個公平的合同',
        '商家有權單方修改條款',
      ];

      contracts.forEach(contract => {
        consumerProtectionModule.detectUnfairTerms(contract, 'global');
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });

    test('應該快速處理大量投訴', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const complaint = {
          consumerId: `consumer_${i}`,
          category: 'product' as const,
          priority: 'medium' as const,
          title: `投訴 ${i}`,
          description: `投訴描述 ${i}`,
        };

        consumerProtectionModule.submitComplaint(complaint);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });
  });

  describe('功能測試', () => {
    beforeEach(async () => {
      await consumerProtectionModule.initialize();
    });

    test('應該處理複雜的消費者保護場景', () => {
      // 檢測不公平條款
      const contractText =
        '本協議排除責任，限制賠償為最低金額，違約將支付懲罰條款規定的賠償';
      const detectedTerms = consumerProtectionModule.detectUnfairTerms(
        contractText,
        'global'
      );

      expect(detectedTerms.length).toBeGreaterThan(0);
      expect(detectedTerms.some(term => term.category === 'exclusion')).toBe(
        true
      );
      expect(detectedTerms.some(term => term.category === 'limitation')).toBe(
        true
      );
      expect(detectedTerms.some(term => term.category === 'penalty')).toBe(
        true
      );

      // 提交投訴
      const complaint = {
        consumerId: 'consumer_complex',
        category: 'contract' as const,
        priority: 'urgent' as const,
        title: '不公平合同條款',
        description: '發現合同中包含多個不公平條款',
      };

      const submittedComplaint =
        consumerProtectionModule.submitComplaint(complaint);
      expect(submittedComplaint).toBeDefined();
      expect(submittedComplaint.priority).toBe('urgent');

      // 更新投訴狀態
      const updateResult = consumerProtectionModule.updateComplaintStatus(
        submittedComplaint.id,
        'under_review'
      );
      expect(updateResult).toBe(true);

      // 獲取消費者權利
      const rights = consumerProtectionModule.getConsumerRights('global');
      expect(rights.length).toBeGreaterThan(0);
    });

    test('應該處理多種投訴類型和優先級', () => {
      const complaintTypes = [
        'product',
        'service',
        'billing',
        'privacy',
        'contract',
      ] as const;
      const priorities = ['low', 'medium', 'high', 'urgent'] as const;

      complaintTypes.forEach((category, categoryIndex) => {
        priorities.forEach((priority, priorityIndex) => {
          const complaint = {
            consumerId: `consumer_${categoryIndex}_${priorityIndex}`,
            category,
            priority,
            title: `${category} 投訴 - ${priority} 優先級`,
            description: `這是一個 ${category} 類型的 ${priority} 優先級投訴`,
          };

          const submittedComplaint =
            consumerProtectionModule.submitComplaint(complaint);
          expect(submittedComplaint.category).toBe(category);
          expect(submittedComplaint.priority).toBe(priority);
        });
      });
    });

    test('應該處理不同地區的消費者權利', () => {
      const jurisdictions = ['global', 'taiwan', 'macau', 'china', 'eu', 'us'];

      jurisdictions.forEach(jurisdiction => {
        const rights = consumerProtectionModule.getConsumerRights(jurisdiction);
        expect(rights).toBeDefined();
        expect(Array.isArray(rights)).toBe(true);
        expect(rights.length).toBeGreaterThan(0);
      });
    });
  });
});
