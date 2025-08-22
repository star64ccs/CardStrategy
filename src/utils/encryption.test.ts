import {
  EncryptionManager,
  EncryptedData,
  EncryptionConfig,
  KeyInfo,
  EncryptionStats,
} from './encryption';

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

// Mock crypto API for testing
const mockCrypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
};

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('EncryptionManager', () => {
  let encryptionManager: EncryptionManager;
  let mockStorage: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock storage
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
    };

    // Mock StorageManager
    jest.doMock('./storage', () => ({
      StorageManager: mockStorage,
    }));

    // Create new instance
    encryptionManager = new EncryptionManager();
  });

  describe('初始化', () => {
    it('應該使用默認配置初始化', () => {
      const config = encryptionManager.getConfig();
      expect(config.algorithm).toBe('AES-256-GCM');
      expect(config.keySize).toBe(32);
      expect(config.enableCompression).toBe(true);
      expect(config.enableChecksum).toBe(true);
    });

    it('應該使用自定義配置初始化', () => {
      const customConfig: Partial<EncryptionConfig> = {
        algorithm: 'AES-256-CBC',
        enableCompression: false,
        enableChecksum: false,
      };

      const manager = new EncryptionManager(customConfig);
      const config = manager.getConfig();

      expect(config.algorithm).toBe('AES-256-CBC');
      expect(config.enableCompression).toBe(false);
      expect(config.enableChecksum).toBe(false);
    });
  });

  describe('加密和解密', () => {
    beforeEach(() => {
      // Mock crypto operations
      const mockKey = { id: 'test-key' };
      const mockEncryptedBuffer = new Uint8Array([1, 2, 3, 4, 5]);
      const mockDecryptedBuffer = new TextEncoder().encode('test data');

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedBuffer);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedBuffer);
    });

    it('應該成功加密數據', async () => {
      const testData = { message: 'Hello World', timestamp: Date.now() };

      const encrypted = await encryptionManager.encrypt(testData);

      expect(encrypted).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-GCM');
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.checksum).toBeDefined();
      expect(encrypted.timestamp).toBeDefined();
      expect(encrypted.version).toBe('1.0');
    });

    it('應該成功解密數據', async () => {
      const testData = { message: 'Hello World', timestamp: Date.now() };
      const encrypted = await encryptionManager.encrypt(testData);

      const decrypted = await encryptionManager.decrypt(encrypted);

      expect(decrypted).toEqual(testData);
    });

    it('應該處理空數據', async () => {
      const encrypted = await encryptionManager.encrypt(null);
      const decrypted = await encryptionManager.decrypt(encrypted);

      expect(decrypted).toBeNull();
    });

    it('應該處理複雜對象', async () => {
      const complexData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null: null,
        undefined,
      };

      const encrypted = await encryptionManager.encrypt(complexData);
      const decrypted = await encryptionManager.decrypt(encrypted);

      expect(decrypted).toEqual(complexData);
    });
  });

  describe('密鑰管理', () => {
    beforeEach(() => {
      mockStorage.get.mockResolvedValue([]);
      mockStorage.set.mockResolvedValue(undefined);
    });

    it('應該生成新密鑰', async () => {
      const keyInfo = await encryptionManager.generateKey('test-key');

      expect(keyInfo).toBeDefined();
      expect(keyInfo.name).toBe('test-key');
      expect(keyInfo.algorithm).toBe('AES-256-GCM');
      expect(keyInfo.isActive).toBe(true);
      expect(keyInfo.keySize).toBe(32);
      expect(keyInfo.createdAt).toBeDefined();
      expect(keyInfo.lastUsed).toBeDefined();
    });

    it('應該獲取所有密鑰', async () => {
      const mockKeys: KeyInfo[] = [
        {
          id: 'key1',
          name: 'Key 1',
          algorithm: 'AES-256-GCM',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: true,
          keySize: 32,
        },
      ];

      mockStorage.get.mockResolvedValue(mockKeys);

      const keys = await encryptionManager.getKeys();

      expect(keys).toEqual(mockKeys);
    });

    it('應該刪除密鑰', async () => {
      const mockKeys: KeyInfo[] = [
        {
          id: 'key1',
          name: 'Key 1',
          algorithm: 'AES-256-GCM',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: true,
          keySize: 32,
        },
        {
          id: 'key2',
          name: 'Key 2',
          algorithm: 'AES-256-GCM',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: true,
          keySize: 32,
        },
      ];

      mockStorage.get.mockResolvedValue(mockKeys);

      const success = await encryptionManager.deleteKey('key1');

      expect(success).toBe(true);
      expect(mockStorage.set).toHaveBeenCalledWith('encryption_keys', [
        mockKeys[1],
      ]);
    });
  });

  describe('統計數據', () => {
    it('應該返回加密統計', () => {
      const stats = encryptionManager.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalEncryptions).toBe(0);
      expect(stats.totalDecryptions).toBe(0);
      expect(stats.failedEncryptions).toBe(0);
      expect(stats.failedDecryptions).toBe(0);
    });

    it('應該重置統計', async () => {
      // 先執行一些操作來增加統計
      const testData = { test: 'data' };
      await encryptionManager.encrypt(testData);

      await encryptionManager.resetStats();

      const stats = encryptionManager.getStats();
      expect(stats.totalEncryptions).toBe(0);
      expect(stats.totalDecryptions).toBe(0);
    });
  });

  describe('配置管理', () => {
    it('應該更新配置', () => {
      const newConfig: Partial<EncryptionConfig> = {
        algorithm: 'AES-256-CBC',
        enableCompression: false,
      };

      encryptionManager.updateConfig(newConfig);

      const config = encryptionManager.getConfig();
      expect(config.algorithm).toBe('AES-256-CBC');
      expect(config.enableCompression).toBe(false);
    });

    it('應該檢查加密支持', () => {
      const isSupported = encryptionManager.isEncryptionSupported();
      expect(isSupported).toBe(true);
    });
  });

  describe('數據清理', () => {
    beforeEach(() => {
      mockStorage.get.mockResolvedValue([]);
    });

    it('應該清理過期密鑰', async () => {
      const mockKeys: KeyInfo[] = [
        {
          id: 'old-key',
          name: 'Old Key',
          algorithm: 'AES-256-GCM',
          createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60天前
          lastUsed: Date.now() - 60 * 24 * 60 * 60 * 1000,
          isActive: true,
          keySize: 32,
        },
        {
          id: 'new-key',
          name: 'New Key',
          algorithm: 'AES-256-GCM',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: true,
          keySize: 32,
        },
      ];

      mockStorage.get.mockResolvedValue(mockKeys);

      const removedCount = await encryptionManager.cleanupExpiredKeys(
        30 * 24 * 60 * 60 * 1000
      ); // 30天

      expect(removedCount).toBe(1);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理加密錯誤', async () => {
      mockCrypto.subtle.encrypt.mockRejectedValue(
        new Error('Encryption failed')
      );

      const testData = { test: 'data' };

      await expect(encryptionManager.encrypt(testData)).rejects.toThrow(
        'Encryption failed'
      );

      const stats = encryptionManager.getStats();
      expect(stats.failedEncryptions).toBe(1);
    });

    it('應該處理解密錯誤', async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(
        new Error('Decryption failed')
      );

      const mockEncryptedData: EncryptedData = {
        algorithm: 'AES-256-GCM',
        iv: '1234567890abcdef',
        salt: 'abcdef1234567890',
        data: 'encrypteddata',
        checksum: 'checksum',
        timestamp: Date.now(),
        version: '1.0',
      };

      await expect(
        encryptionManager.decrypt(mockEncryptedData)
      ).rejects.toThrow('Decryption failed');

      const stats = encryptionManager.getStats();
      expect(stats.failedDecryptions).toBe(1);
    });

    it('應該處理存儲錯誤', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const keys = await encryptionManager.getKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('性能測試', () => {
    it('應該處理大量數據', async () => {
      const largeData = {
        array: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `value-${i}`,
        })),
        timestamp: Date.now(),
      };

      const startTime = Date.now();
      const encrypted = await encryptionManager.encrypt(largeData);
      const encryptTime = Date.now() - startTime;

      const decrypted = await encryptionManager.decrypt(encrypted);
      const decryptTime = Date.now() - startTime - encryptTime;

      expect(decrypted).toEqual(largeData);
      expect(encryptTime).toBeLessThan(5000); // 5秒內
      expect(decryptTime).toBeLessThan(5000); // 5秒內
    });

    it('應該處理並發加密', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        encryptionManager.encrypt({ id: i, data: `test-${i}` })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.algorithm).toBe('AES-256-GCM');
      });
    });
  });
});

// 導出測試用的加密管理器實例
export const createTestEncryptionManager = (
  config?: Partial<EncryptionConfig>
) => {
  return new EncryptionManager(config);
};

// 導出測試數據生成器
export const generateTestData = (size: number = 100) => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    data: Array.from({ length: size }, (_, i) => ({
      index: i,
      value: `value-${i}`,
      timestamp: Date.now() + i,
    })),
    metadata: {
      source: 'test',
      version: '1.0',
      checksum: Math.random().toString(36).substr(2, 16),
    },
  };
};
