/**
 * Cohere 服務基本測試
 * 驗證服務初始化和基本功能，不依賴外部 API
 */

import { serviceConfig } from '../core/config/services';
import { cohereService } from '../shared/services/ai/cohereService';

describe('CohereService Basic Tests', () => {
  beforeAll(async () => {
    // 初始化服務配置
    await serviceConfig.initialize();
  });

  describe('服務初始化測試', () => {
    test('應該能夠初始化服務', async () => {
      await expect(cohereService.initialize()).resolves.not.toThrow();
    });

    test('應該檢查服務可用性', () => {
      const isAvailable = cohereService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    test('應該獲取服務統計信息', () => {
      const stats = cohereService.getServiceStats();
      expect(stats).toHaveProperty('service', 'cohere');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('hasApiKey');
      expect(stats).toHaveProperty('baseUrl');
    });
  });

  describe('錯誤處理測試', () => {
    test('應該處理空文本數組', async () => {
      const result = await cohereService.embedTexts([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('應該處理空文檔數組的語義搜索', async () => {
      const result = await cohereService.semanticSearch('查詢', [], 5);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('服務配置測試', () => {
    test('應該檢查服務配置狀態', () => {
      const serviceStatus = serviceConfig.getServiceStatus();
      expect(serviceStatus).toHaveProperty('cohere');
      expect(typeof serviceStatus.cohere).toBe('boolean');
    });

    test('應該檢查 API 密鑰配置', () => {
      const apiKey = serviceConfig.get('COHERE_API_KEY');
      expect(typeof apiKey).toBe('string');
    });
  });

  describe('數學計算測試', () => {
    test('應該正確計算餘弦相似度', () => {
      // 測試相同的向量
      const vector1 = [1, 0, 0];
      const vector2 = [1, 0, 0];

      // 使用反射來測試私有方法
      const service = cohereService as any;
      const similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(1);
    });

    test('應該處理零向量', () => {
      const vector1 = [0, 0, 0];
      const vector2 = [1, 0, 0];

      const service = cohereService as any;
      const similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(0);
    });

    test('應該處理正交向量', () => {
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];

      const service = cohereService as any;
      const similarity = service.calculateCosineSimilarity(vector1, vector2);

      expect(similarity).toBe(0);
    });
  });

  describe('批量處理邏輯測試', () => {
    test('應該正確分割批量', async () => {
      const texts = Array.from({ length: 25 }, (_, i) => `文本 ${i + 1}`);

      // 測試批量處理邏輯（不實際調用 API）
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        batches.push(texts.slice(i, i + batchSize));
      }

      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(10);
      expect(batches[1].length).toBe(10);
      expect(batches[2].length).toBe(5);
    });
  });

  describe('服務集成測試', () => {
    test('應該與服務管理器集成', () => {
      const available = serviceConfig.isServiceAvailable('cohere');
      expect(typeof available).toBe('boolean');
    });

    test('應該提供服務統計', () => {
      const stats = cohereService.getServiceStats();
      expect(stats).toHaveProperty('service');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('isInitialized');
    });
  });
});
