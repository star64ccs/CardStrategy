import { replicateService } from '../shared/services/ai/replicateService';

describe('ReplicateService', () => {
  beforeEach(() => {
    // 重置環境變量
    delete process.env.REPLICATE_API_TOKEN;
  });

  describe('初始化', () => {
    test('應該正確初始化服務', () => {
      expect(replicateService).toBeDefined();
      expect(typeof replicateService.isAvailable).toBe('function');
    });

    test('沒有 API token 時應該不可用', () => {
      expect(replicateService.isAvailable()).toBe(false);
    });

    test('有 API token 時應該可用', () => {
      process.env.REPLICATE_API_TOKEN = 'test-token';
      const service =
        new (require('../shared/services/ai/replicateService').ReplicateService)();
      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('服務可用性檢查', () => {
    test('應該正確檢查服務可用性', () => {
      const result = replicateService.isAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('獲取模型列表', () => {
    test('沒有 API token 時應該返回錯誤', async () => {
      const result = await replicateService.getModels();

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toEqual([]);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const result = await replicateService.getModels();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('創建預測', () => {
    test('沒有 API token 時應該返回錯誤', async () => {
      const request = {
        version: 'test-version',
        input: { prompt: 'test' },
      };

      const result = await replicateService.createPrediction(request);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toBeNull();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const request = {
        version: 'test-version',
        input: { prompt: 'test' },
      };

      const result = await replicateService.createPrediction(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('獲取預測結果', () => {
    test('沒有 API token 時應該返回錯誤', async () => {
      const result = await replicateService.getPrediction('test-id');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toBeNull();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const result = await replicateService.getPrediction('test-id');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('取消預測', () => {
    test('沒有 API token 時應該返回錯誤', async () => {
      const result = await replicateService.cancelPrediction('test-id');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toBe(false);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const result = await replicateService.cancelPrediction('test-id');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(typeof result.data).toBe('boolean');
    });
  });

  describe('批量預測', () => {
    test('空請求列表應該返回成功', async () => {
      const result = await replicateService.batchPredict([]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No requests to process');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('沒有 API token 時應該返回錯誤', async () => {
      const requests = [
        { version: 'test-version', input: { prompt: 'test1' } },
        { version: 'test-version', input: { prompt: 'test2' } },
      ];

      const result = await replicateService.batchPredict(requests);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toEqual([]);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const requests = [
        { version: 'test-version', input: { prompt: 'test1' } },
        { version: 'test-version', input: { prompt: 'test2' } },
      ];

      const result = await replicateService.batchPredict(requests);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('等待預測完成', () => {
    test('沒有 API token 時應該返回錯誤', async () => {
      const result = await replicateService.waitForPrediction('test-id', 1000);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not configured');
      expect(result.data).toBeNull();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      const result = await replicateService.waitForPrediction('test-id', 1000);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('獲取服務統計', () => {
    test('應該返回正確的統計格式', async () => {
      const result = await replicateService.getServiceStats();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.success && result.data) {
        expect(result.data).toHaveProperty('available');
        expect(result.data).toHaveProperty('modelsCount');
        expect(result.data).toHaveProperty('activePredictions');
        expect(result.data).toHaveProperty('lastUsed');
        expect(typeof result.data.available).toBe('boolean');
        expect(typeof result.data.modelsCount).toBe('number');
        expect(typeof result.data.activePredictions).toBe('number');
        expect(typeof result.data.lastUsed).toBe('string');
      }
    });

    test('沒有 API token 時應該返回不可用狀態', async () => {
      const result = await replicateService.getServiceStats();

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.available).toBe(false);
        expect(result.data.modelsCount).toBe(0);
        expect(result.data.activePredictions).toBe(0);
      }
    });
  });
});
