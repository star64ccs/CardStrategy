/* global jest, describe, it, expect, beforeEach, afterEach */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheManager } from '../../../utils/cacheManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('CacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 清除快取管理器的內部狀態
    cacheManager.clearAll();
  });

  describe('基本快取操作', () => {
    it('應該成功設置快取項目', async () => {
      const key = 'test_key';
      const data = { test: 'data' };
      const ttl = 3600; // 1小時

      await cacheManager.set(key, data, ttl);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.stringContaining(JSON.stringify(data))
      );
    });

    it('應該成功獲取快取項目', async () => {
      const key = 'test_key';
      const data = { test: 'data' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData = {
        data,
        timestamp,
        ttl,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await cacheManager.get(key);

      expect(result).toEqual(data);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`cache_${key}`);
    });

    it('應該處理快取項目不存在的情況', async () => {
      const key = 'non_existent_key';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
    });

    it('應該成功刪除快取項目', async () => {
      const key = 'test_key';

      await cacheManager.delete(key);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`cache_${key}`);
    });

    it('應該成功檢查快取項目是否存在', async () => {
      const key = 'test_key';
      const data = { test: 'data' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData = {
        data,
        timestamp,
        ttl,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const exists = await cacheManager.has(key);

      expect(exists).toBe(true);
    });

    it('應該處理快取項目不存在的情況', async () => {
      const key = 'non_existent_key';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const exists = await cacheManager.has(key);

      expect(exists).toBe(false);
    });
  });

  describe('TTL (Time To Live) 處理', () => {
    it('應該處理過期的快取項目', async () => {
      const key = 'expired_key';
      const data = { test: 'data' };
      const timestamp = Date.now() - 7200000; // 2小時前
      const ttl = 3600; // 1小時

      const cachedData = {
        data,
        timestamp,
        ttl,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`cache_${key}`);
    });

    it('應該處理有效的快取項目', async () => {
      const key = 'valid_key';
      const data = { test: 'data' };
      const timestamp = Date.now() - 1800000; // 30分鐘前
      const ttl = 3600; // 1小時

      const cachedData = {
        data,
        timestamp,
        ttl,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await cacheManager.get(key);

      expect(result).toEqual(data);
    });

    it('應該使用默認TTL', async () => {
      const key = 'default_ttl_key';
      const data = { test: 'data' };

      await cacheManager.set(key, data);

      const setCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const cachedData = JSON.parse(setCall[1]);

      expect(cachedData.ttl).toBe(1800); // 默認30分鐘
    });
  });

  describe('批量操作', () => {
    it('應該成功設置多個快取項目', async () => {
      const items = [
        { key: 'key1', data: { test1: 'data1' }, ttl: 3600 },
        { key: 'key2', data: { test2: 'data2' }, ttl: 1800 },
      ];

      await cacheManager.setMultiple(items);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['cache_key1', expect.stringContaining('test1')],
          ['cache_key2', expect.stringContaining('test2')],
        ])
      );
    });

    it('應該成功獲取多個快取項目', async () => {
      const keys = ['key1', 'key2'];
      const data1 = { test1: 'data1' };
      const data2 = { test2: 'data2' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData1 = { data: data1, timestamp, ttl };
      const cachedData2 = { data: data2, timestamp, ttl };

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData1)],
        ['cache_key2', JSON.stringify(cachedData2)],
      ]);

      const result = await cacheManager.getMultiple(keys);

      expect(result).toEqual({
        key1: data1,
        key2: data2,
      });
    });

    it('應該處理部分快取項目不存在的情況', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const data1 = { test1: 'data1' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData1 = { data: data1, timestamp, ttl };

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData1)],
        ['cache_key2', null],
        ['cache_key3', null],
      ]);

      const result = await cacheManager.getMultiple(keys);

      expect(result).toEqual({
        key1: data1,
        key2: null,
        key3: null,
      });
    });

    it('應該成功刪除多個快取項目', async () => {
      const keys = ['key1', 'key2'];

      await cacheManager.deleteMultiple(keys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_key1',
        'cache_key2',
      ]);
    });
  });

  describe('快取清理', () => {
    it('應該成功清理所有快取', async () => {
      await cacheManager.clearAll();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('應該成功清理過期的快取項目', async () => {
      const keys = ['cache_key1', 'cache_key2', 'cache_key3'];
      const timestamp = Date.now() - 7200000; // 2小時前
      const ttl = 3600; // 1小時

      const expiredData = { data: 'test', timestamp, ttl };
      const validData = { data: 'test', timestamp: Date.now(), ttl };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(expiredData)],
        ['cache_key2', JSON.stringify(validData)],
        ['cache_key3', JSON.stringify(expiredData)],
      ]);

      await cacheManager.clearExpired();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_key1',
        'cache_key3',
      ]);
    });

    it('應該成功清理特定模式的快取項目', async () => {
      const keys = ['cache_user_1', 'cache_user_2', 'cache_card_1'];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);

      await cacheManager.clearByPattern('user_*');

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_user_1',
        'cache_user_2',
      ]);
    });
  });

  describe('快取統計', () => {
    it('應該返回正確的快取統計信息', async () => {
      const keys = ['cache_key1', 'cache_key2', 'cache_key3'];
      const timestamp = Date.now() - 1800000; // 30分鐘前
      const ttl = 3600;

      const validData = { data: 'test', timestamp, ttl };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(validData)],
        ['cache_key2', JSON.stringify(validData)],
        ['cache_key3', null],
      ]);

      const stats = await cacheManager.getStats();

      expect(stats).toEqual({
        totalItems: 2,
        totalSize: expect.any(Number),
        expiredItems: 0,
        validItems: 2,
      });
    });

    it('應該計算快取大小', async () => {
      const keys = ['cache_key1'];
      const data = { test: 'data' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData = { data, timestamp, ttl };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData)],
      ]);

      const stats = await cacheManager.getStats();

      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('快取策略', () => {
    it('應該支持LRU (Least Recently Used) 策略', async () => {
      const maxItems = 2;
      const keys = ['cache_key1', 'cache_key2', 'cache_key3'];
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData = { data: 'test', timestamp, ttl };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData)],
        ['cache_key2', JSON.stringify(cachedData)],
        ['cache_key3', JSON.stringify(cachedData)],
      ]);

      await cacheManager.applyLRUStrategy(maxItems);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['cache_key1']);
    });

    it('應該支持FIFO (First In First Out) 策略', async () => {
      const maxItems = 2;
      const keys = ['cache_key1', 'cache_key2', 'cache_key3'];
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData = { data: 'test', timestamp, ttl };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData)],
        ['cache_key2', JSON.stringify(cachedData)],
        ['cache_key3', JSON.stringify(cachedData)],
      ]);

      await cacheManager.applyFIFOStrategy(maxItems);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['cache_key1']);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理AsyncStorage錯誤', async () => {
      const key = 'test_key';
      const error = new Error('Storage error');

      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(cacheManager.set(key, 'data')).rejects.toThrow(
        'Storage error'
      );
    });

    it('應該處理無效的JSON數據', async () => {
      const key = 'test_key';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
    });

    it('應該處理快取數據格式錯誤', async () => {
      const key = 'test_key';
      const invalidData = { invalid: 'format' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidData)
      );

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
    });
  });

  describe('性能優化', () => {
    it('應該支持快取預熱', async () => {
      const items = [
        { key: 'key1', data: { test1: 'data1' } },
        { key: 'key2', data: { test2: 'data2' } },
      ];

      await cacheManager.warmup(items);

      expect(AsyncStorage.multiSet).toHaveBeenCalled();
    });

    it('應該支持快取預取', async () => {
      const keys = ['key1', 'key2'];
      const data1 = { test1: 'data1' };
      const data2 = { test2: 'data2' };
      const timestamp = Date.now();
      const ttl = 3600;

      const cachedData1 = { data: data1, timestamp, ttl };
      const cachedData2 = { data: data2, timestamp, ttl };

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_key1', JSON.stringify(cachedData1)],
        ['cache_key2', JSON.stringify(cachedData2)],
      ]);

      const result = await cacheManager.prefetch(keys);

      expect(result).toEqual([data1, data2]);
    });
  });

  describe('快取標籤', () => {
    it('應該支持標籤化快取', async () => {
      const key = 'test_key';
      const data = { test: 'data' };
      const tags = ['user', 'profile'];

      await cacheManager.setWithTags(key, data, tags);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.stringContaining('"tags":["user","profile"]')
      );
    });

    it('應該支持按標籤清理快取', async () => {
      const keys = ['cache_user_1', 'cache_user_2', 'cache_card_1'];
      const userData = { data: 'test', tags: ['user'] };
      const cardData = { data: 'test', tags: ['card'] };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['cache_user_1', JSON.stringify(userData)],
        ['cache_user_2', JSON.stringify(userData)],
        ['cache_card_1', JSON.stringify(cardData)],
      ]);

      await cacheManager.clearByTag('user');

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_user_1',
        'cache_user_2',
      ]);
    });
  });
});
