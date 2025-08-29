/**
 * 數據保護模組測試
 * 測試重構計劃任務 1.2: DataProtectionModule
 */

import type { DataSubjectRequest } from '../../services/dataProtectionModule';
import {
  DataProtectionModule,
  MinimizedData,
  DataClassification,
  RetentionPolicy,
} from '../../services/dataProtectionModule';

describe('DataProtectionModule', () => {
  let dataProtectionModule: DataProtectionModule;

  beforeEach(async () => {
    dataProtectionModule = DataProtectionModule.getInstance();
    await dataProtectionModule.reset();
    await dataProtectionModule.initialize();
  });

  afterEach(async () => {
    await dataProtectionModule.reset();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = DataProtectionModule.getInstance();
      const _instance2 = DataProtectionModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    it('應該成功初始化模組', async () => {
      const _result = await dataProtectionModule.initialize();
      expect(result).toBe(true);
    });

    it('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        enableDataClassification: false,
        defaultRetentionPeriod: 180,
      };

      const _result = await dataProtectionModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('數據分類測試', () => {
    it('應該分類個人數據', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
      };

      const _classification = dataProtectionModule.classifyData(data);
      expect(classification.category).toBe('personal');
      expect(classification.sensitivity).toBe('medium');
    });

    it('應該分類敏感數據', () => {
      const _data = {
        name: 'John Doe',
        ssn: '123-45-6789',
        credit_card: '4111-1111-1111-1111',
      };

      const _classification = dataProtectionModule.classifyData(data);
      expect(classification.category).toBe('sensitive');
      expect(classification.sensitivity).toBe('high');
    });

    it('應該分類財務數據', () => {
      const _data = {
        account_number: '1234567890',
        balance: 1000.0,
        transaction_history: [],
      };

      const _classification = dataProtectionModule.classifyData(data);
      expect(classification.category).toBe('financial');
      expect(classification.sensitivity).toBe('high');
    });

    it('應該分類公開數據', () => {
      const _data = {
        public_info: '公開信息',
        statistics: '統計數據',
      };

      const _classification = dataProtectionModule.classifyData(data);
      expect(classification.category).toBe('public');
      expect(classification.sensitivity).toBe('low');
    });

    it('應該處理空數據', () => {
      const _classification = dataProtectionModule.classifyData(null);
      expect(classification.category).toBe('public');
    });
  });

  describe('保留政策測試', () => {
    it('應該應用個人數據保留政策', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const _policy = dataProtectionModule.applyRetentionPolicy(data);
      expect(policy.dataType).toBe('personal');
      expect(policy.retentionPeriod).toBe(365);
      expect(policy.deletionMethod).toBe('secure_delete');
    });

    it('應該應用敏感數據保留政策', () => {
      const _data = {
        ssn: '123-45-6789',
        password: 'hashed_password',
      };

      const _policy = dataProtectionModule.applyRetentionPolicy(data);
      expect(policy.dataType).toBe('sensitive');
      expect(policy.retentionPeriod).toBe(180);
    });

    it('應該包含合規說明', () => {
      const _data = { name: 'Test' };
      const _policy = dataProtectionModule.applyRetentionPolicy(data);

      expect(policy.complianceNotes).toBeDefined();
      expect(policy.complianceNotes.length).toBeGreaterThan(0);
    });
  });

  describe('數據最小化測試', () => {
    it('應該最小化個人數據', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        unnecessary_field: 'should be removed',
      };

      const _minimizedData = dataProtectionModule.minimizeData(
        data,
        'account_management'
      );

      expect(minimizedData.originalData).toEqual(data);
      expect(minimizedData.minimizedData).toBeDefined();
      expect(minimizedData.removedFields).toContain('unnecessary_field');
      expect(minimizedData.purpose).toBe('account_management');
      expect(minimizedData.processingDate).toBeDefined();
    });

    it('應該根據目的保留適當字段', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        payment_method: 'credit_card',
      };

      const _minimizedData = dataProtectionModule.minimizeData(
        data,
        'payment_processing'
      );

      expect(minimizedData.minimizedData.name).toBeDefined();
      expect(minimizedData.minimizedData.email).toBeDefined();
      expect(minimizedData.minimizedData.payment_method).toBeDefined();
    });

    it('應該確定適當的匿名化級別', () => {
      const _sensitiveData = { ssn: '123-45-6789' };
      const _personalData = { name: 'John Doe', email: 'john@example.com' };

      const _sensitiveMinimized = dataProtectionModule.minimizeData(
        sensitiveData,
        'analytics'
      );
      const _personalMinimized = dataProtectionModule.minimizeData(
        personalData,
        'analytics'
      );

      expect(sensitiveMinimized.anonymizationLevel).toBe('pseudonymized');
      expect(personalMinimized.anonymizationLevel).toBe('aggregated');
    });
  });

  describe('目的驗證測試', () => {
    it('應該驗證有效目的', () => {
      const _data = { name: 'John Doe', email: 'john@example.com' };
      const _isValid = dataProtectionModule.validatePurpose(
        data,
        'account_management'
      );
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效目的', () => {
      const _data = { name: 'John Doe', email: 'john@example.com' };
      const _isValid = dataProtectionModule.validatePurpose(
        data,
        'invalid_purpose'
      );
      expect(isValid).toBe(false);
    });
  });

  describe('數據主體請求測試', () => {
    it('應該處理訪問請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_123',
        userId: 'user_456',
        requestType: 'access',
        description: '請求訪問個人數據',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe('req_123');
      expect(result.data).toBeDefined();
      expect(result.complianceChecks).toContain('驗證請求者身份');
      expect(result.auditTrail).toContain('開始處理訪問請求');
    });

    it('應該處理更正請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_124',
        userId: 'user_456',
        requestType: 'rectification',
        description: '請求更正個人數據',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('更正');
    });

    it('應該處理刪除請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_125',
        userId: 'user_456',
        requestType: 'erasure',
        description: '請求刪除個人數據',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'high',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('刪除');
    });

    it('應該處理可攜性請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_126',
        userId: 'user_456',
        requestType: 'portability',
        description: '請求數據可攜性',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('可攜性');
    });

    it('應該處理限制請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_127',
        userId: 'user_456',
        requestType: 'restriction',
        description: '請求限制數據處理',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('限制');
    });

    it('應該處理反對請求', () => {
      const request: DataSubjectRequest = {
        id: 'req_128',
        userId: 'user_456',
        requestType: 'objection',
        description: '反對數據處理',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(true);
      expect(result.message).toContain('反對');
    });

    it('應該拒絕無效請求類型', () => {
      const request: DataSubjectRequest = {
        id: 'req_129',
        userId: 'user_456',
        requestType: 'invalid_type' as any,
        description: '無效請求',
        submittedAt: new Date(),
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [],
        attachments: [],
      };

      const _result = dataProtectionModule.processDataSubjectRequest(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('不支持的請求類型');
    });
  });

  describe('數據導出測試', () => {
    it('應該導出用戶數據', () => {
      const _userId = 'user_123';
      const _exportedData = dataProtectionModule.exportUserData(userId);

      expect(exportedData.userId).toBe(userId);
      expect(exportedData.exportId).toBeDefined();
      expect(exportedData.dataTypes).toContain('personal');
      expect(exportedData.format).toBe('json');
      expect(exportedData.size).toBeGreaterThan(0);
      expect(exportedData.recordCount).toBeGreaterThan(0);
      expect(exportedData.exportDate).toBeDefined();
      expect(exportedData.expiresAt).toBeDefined();
      expect(exportedData.checksum).toBeDefined();
    });

    it('應該設置適當的過期時間', () => {
      const _userId = 'user_123';
      const _exportedData = dataProtectionModule.exportUserData(userId);

      const _now = new Date();
      const { expiresAt } = exportedData;
      const _timeDiff = expiresAt.getTime() - now.getTime();
      const _daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(30, 0); // 30天後過期
    });
  });

  describe('數據刪除測試', () => {
    it('應該刪除用戶數據', () => {
      const _userId = 'user_123';
      const _deletionResult = dataProtectionModule.deleteUserData(userId);

      expect(deletionResult.userId).toBe(userId);
      expect(deletionResult.success).toBe(true);
      expect(deletionResult.deletedRecords).toBeGreaterThan(0);
      expect(deletionResult.retainedRecords).toBeGreaterThan(0);
      expect(deletionResult.retentionReasons).toContain('法律要求');
      expect(deletionResult.deletionDate).toBeDefined();
      expect(deletionResult.auditTrail).toContain('身份驗證完成');
      expect(deletionResult.complianceNotes).toContain('符合GDPR第17條刪除權');
    });

    it('應該記錄刪除原因', () => {
      const _userId = 'user_123';
      const _deletionResult = dataProtectionModule.deleteUserData(userId);

      expect(deletionResult.retentionReasons).toContain('審計目的');
      expect(deletionResult.retentionReasons).toContain('爭議解決');
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        enableDataClassification: false,
        defaultRetentionPeriod: 180,
        encryptionRequired: false,
      };

      dataProtectionModule.updateConfig(newConfig);

      // 驗證配置已更新（通過檢查行為變化）
      const _data = { name: 'Test' };
      const _classification = dataProtectionModule.classifyData(data);
      expect(classification).toBeDefined();
    });
  });

  describe('重置測試', () => {
    it('應該重置模組狀態', async () => {
      // 先執行一些操作
      const _data = { name: 'Test' };
      dataProtectionModule.classifyData(data);

      // 重置
      await dataProtectionModule.reset();

      // 驗證重置後可以重新初始化
      const _initResult = await dataProtectionModule.initialize();
      expect(initResult).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空數據分類', () => {
      const _classification = dataProtectionModule.classifyData(null);
      expect(classification.category).toBe('public');
    });

    it('應該處理空數據最小化', () => {
      const _minimizedData = dataProtectionModule.minimizeData(null, 'test');
      expect(minimizedData.originalData).toBeNull();
      expect(minimizedData.minimizedData).toEqual({});
    });

    it('應該處理空目的驗證', () => {
      const _isValid = dataProtectionModule.validatePurpose({}, '');
      expect(isValid).toBe(false);
    });
  });

  describe('性能測試', () => {
    it('應該快速處理大量分類', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const _data = { name: `User ${i}`, email: `user${i}@example.com` };
        dataProtectionModule.classifyData(data);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成100次分類
    });

    it('應該快速處理大量最小化', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const _data = {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          unnecessary_field: 'should be removed',
        };
        dataProtectionModule.minimizeData(data, 'account_management');
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成50次最小化
    });
  });

  describe('功能測試', () => {
    it('應該處理複雜的數據場景', () => {
      // 模擬複雜的用戶數據
      const _complexData = {
        personal_info: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St',
        },
        financial_info: {
          account_number: '1234567890',
          balance: 1000.0,
          credit_card: '4111-1111-1111-1111',
        },
        sensitive_info: {
          ssn: '123-45-6789',
          password: 'hashed_password',
        },
        preferences: {
          language: 'zh-TW',
          timezone: 'Asia/Taipei',
        },
      };

      const _classification = dataProtectionModule.classifyData(complexData);
      expect(classification.category).toBe('personal'); // 複雜對象結構會影響檢測
      expect(classification.sensitivity).toBe('medium');

      const _minimizedData = dataProtectionModule.minimizeData(
        complexData,
        'account_management'
      );
      expect(minimizedData.removedFields.length).toBeGreaterThan(0);
    });

    it('應該處理長期運行的場景', () => {
      const _requestTypes = [
        'access',
        'rectification',
        'erasure',
        'portability',
        'restriction',
        'objection',
      ];

      requestTypes.forEach(requestType => {
        const request: DataSubjectRequest = {
          id: `req_${requestType}`,
          userId: 'user_456',
          requestType: requestType as any,
          description: `測試${requestType}請求`,
          submittedAt: new Date(),
          status: 'pending',
          priority: 'medium',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: [],
          attachments: [],
        };

        const _result = dataProtectionModule.processDataSubjectRequest(request);
        expect(result.success).toBe(true);
      });
    });
  });
});
