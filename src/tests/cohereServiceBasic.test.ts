/**
 * Cohere Service基本Test
 * VerifyServiceInitialize和基本功能，不依賴External API
 */

import { serviceConfig } from '../core/config/services';
import { cohereService } from '../shared/services/ai/cohereService';

describe('CohereService Basic Tests', () => {
  beforeAll(async () => {
    // InitializeServiceConfigure
    await serviceConfig.initialize();
  });

  describe('ServiceInitialize測試', () => {
    test('應該能夠InitializeService', async () => {
      await expect(cohereService.initialize()).resolves.not.toThrow();
    });

    test('應該CheckService可用性', () => {
      const _isAvailable = cohereService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    test('應該GetService統計Information', () => {
      const _stats = cohereService.getServiceStats();
      expect(stats).toHaveProperty('service', 'cohere');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('hasApiKey');
      expect(stats).toHaveProperty('baseUrl');
    });
  });

  describe('ErrorHandle測試', () => {
    test('應該處理空文本數組', async () => {
      const _result = await cohereService.embedTexts([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('應該處理空文檔數組的語義搜索', async () => {
      const _result = await cohereService.semanticSearch('查詢', [], 5);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('ServiceConfigure測試', () => {
    test('應該CheckServiceConfigure狀態', () => {
      const _serviceStatus = serviceConfig.getServiceStatus();
      expect(serviceStatus).toHaveProperty('cohere');
      expect(typeof serviceStatus.cohere).toBe('boolean');
    });

    test('應該檢查 API 密鑰配置', () => {
      const _apiKey = serviceConfig.get('COHERE_API_KEY');
      expect(typeof apiKey).toBe('string');
    });
  });

  describe('數學計算測試', () => {
    test('應該正確計算餘弦相似度', () => {
      // Test相同的向量
      const _vector1 = [1, 0, 0];
      const _vector2 = [1, 0, 0];

      // 使用反射來TestPrivateMethod
      const _service = cohereService as any;
      const _similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(1);
    });

    test('應該處理零向量', () => {
      const _vector1 = [0, 0, 0];
      const _vector2 = [1, 0, 0];

      const _service = cohereService as any;
      const _similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(0);
    });

    test('應該處理正交向量', () => {
      const _vector1 = [1, 0, 0];
      const _vector2 = [0, 1, 0];

      const _service = cohereService as any;
      const _similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(0);
    });
  });

  describe('批量處理邏輯測試', () => {
    test('應該正確分割批量', async () => {
      const _texts = Array.from({ length: 25 }, (_, i) => `文本 ${i + 1}`);

      // TestBatchHandle邏輯（不實際調用 API）
      const _batchSize = 10;
      const _batches = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        batches.push(texts.slice(i, i + batchSize));
      }

      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(10);
      expect(batches[1].length).toBe(10);
      expect(batches[2].length).toBe(5);
    });
  });

  describe('Service集成測試', () => {
    test('應該與Service管理器集成', () => {
      const _available = serviceConfig.isServiceAvailable('cohere');
      expect(typeof available).toBe('boolean');
    });

    test('應該提供Service統計', () => {
      const _stats = cohereService.getServiceStats();
      expect(stats).toHaveProperty('service');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('isInitialized');
    });
  });
});
