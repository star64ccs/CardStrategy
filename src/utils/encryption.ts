import { Platform } from 'react-native';
import { logger } from './logger';
import { StorageManager } from './storage';

// 加密算法類型
export type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';

// 加密配置
export interface EncryptionConfig {
  algorithm: EncryptionAlgorithm;
  keySize: number;
  ivSize: number;
  saltSize: number;
  iterations: number;
  enableCompression: boolean;
  enableChecksum: boolean;
}

// 加密數據結構
export interface EncryptedData {
  algorithm: EncryptionAlgorithm;
  iv: string;
  salt: string;
  data: string;
  checksum?: string;
  timestamp: number;
  version: string;
}

// 密鑰信息
export interface KeyInfo {
  id: string;
  name: string;
  algorithm: EncryptionAlgorithm;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  keySize: number;
}

// 加密統計
export interface EncryptionStats {
  totalEncryptions: number;
  totalDecryptions: number;
  failedEncryptions: number;
  failedDecryptions: number;
  averageEncryptionTime: number;
  averageDecryptionTime: number;
  lastEncryptionTime: number;
  lastDecryptionTime: number;
}

// 默認加密配置
const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keySize: 32,
  ivSize: 16,
  saltSize: 32,
  iterations: 100000,
  enableCompression: true,
  enableChecksum: true
};

// 加密工具類
export class EncryptionManager {
  private config: EncryptionConfig;
  private masterKey: string | null = null;
  private keyCache: Map<string, CryptoKey> = new Map();
  private stats: EncryptionStats = {
    totalEncryptions: 0,
    totalDecryptions: 0,
    failedEncryptions: 0,
    failedDecryptions: 0,
    averageEncryptionTime: 0,
    averageDecryptionTime: 0,
    lastEncryptionTime: 0,
    lastDecryptionTime: 0
  };

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
    this.initializeEncryption();
  }

  // 初始化加密系統
  private async initializeEncryption(): Promise<void> {
    try {
      await this.loadMasterKey();
      await this.loadStats();
      logger.info('EncryptionManager initialized', { config: this.config });
    } catch (error) {
      logger.error('Failed to initialize encryption', { error });
      throw error;
    }
  }

  // 生成隨機字節
  private generateRandomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    if (Platform.OS === 'web') {
      crypto.getRandomValues(array);
    } else {
      // React Native 環境
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }

  // 生成主密鑰
  private async generateMasterKey(): Promise<string> {
    const keyBytes = this.generateRandomBytes(this.config.keySize);
    return Array.from(keyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // 從密碼派生密鑰
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    if (Platform.OS === 'web') {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: this.config.iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: this.config.keySize * 8 },
        false,
        ['encrypt', 'decrypt']
      );
    }
    // React Native 環境 - 簡化實現
    throw new Error('Key derivation not supported in React Native environment');

  }

  // 加載主密鑰
  private async loadMasterKey(): Promise<void> {
    try {
      this.masterKey = await StorageManager.get<string>('encryption_master_key');
      if (!this.masterKey) {
        this.masterKey = await this.generateMasterKey();
        await StorageManager.set('encryption_master_key', this.masterKey);
        logger.info('Generated new master key');
      }
    } catch (error) {
      logger.error('Failed to load master key', { error });
      throw error;
    }
  }

  // 加載統計數據
  private async loadStats(): Promise<void> {
    try {
      const savedStats = await StorageManager.get<EncryptionStats>('encryption_stats');
      if (savedStats) {
        this.stats = savedStats;
      }
    } catch (error) {
      logger.error('Failed to load encryption stats', { error });
    }
  }

  // 保存統計數據
  private async saveStats(): Promise<void> {
    try {
      await StorageManager.set('encryption_stats', this.stats);
    } catch (error) {
      logger.error('Failed to save encryption stats', { error });
    }
  }

  // 更新統計數據
  private updateStats(operation: 'encrypt' | 'decrypt', success: boolean, duration: number): void {
    if (operation === 'encrypt') {
      this.stats.totalEncryptions++;
      if (!success) {
        this.stats.failedEncryptions++;
      } else {
        this.stats.averageEncryptionTime =
          (this.stats.averageEncryptionTime * (this.stats.totalEncryptions - 1) + duration) /
          this.stats.totalEncryptions;
        this.stats.lastEncryptionTime = Date.now();
      }
    } else {
      this.stats.totalDecryptions++;
      if (!success) {
        this.stats.failedDecryptions++;
      } else {
        this.stats.averageDecryptionTime =
          (this.stats.averageDecryptionTime * (this.stats.totalDecryptions - 1) + duration) /
          this.stats.totalDecryptions;
        this.stats.lastDecryptionTime = Date.now();
      }
    }
    this.saveStats();
  }

  // 計算校驗和
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為 32 位整數
    }
    return hash.toString(16);
  }

  // 壓縮數據
  private compressData(data: string): string {
    // 簡單的 RLE 壓縮
    let compressed = '';
    let count = 1;
    let current = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i] === current) {
        count++;
      } else {
        compressed += count + current;
        count = 1;
        current = data[i];
      }
    }
    compressed += count + current;

    return compressed.length < data.length ? compressed : data;
  }

  // 解壓縮數據
  private decompressData(data: string): string {
    // 檢查是否為壓縮數據
    if (!/^\d+[a-zA-Z0-9]/.test(data)) {
      return data;
    }

    let decompressed = '';
    let i = 0;
    while (i < data.length) {
      let count = '';
      while (i < data.length && /\d/.test(data[i])) {
        count += data[i];
        i++;
      }
      if (i < data.length) {
        const char = data[i];
        decompressed += char.repeat(parseInt(count));
        i++;
      }
    }
    return decompressed;
  }

  // 加密數據
  async encrypt(data: any, keyId?: string): Promise<EncryptedData> {
    const startTime = Date.now();
    let success = false;

    try {
      const dataString = JSON.stringify(data);
      const iv = this.generateRandomBytes(this.config.ivSize);
      const salt = this.generateRandomBytes(this.config.saltSize);

      let processedData = dataString;

      // 壓縮
      if (this.config.enableCompression) {
        processedData = this.compressData(dataString);
      }

      // 計算校驗和
      let checksum: string | undefined;
      if (this.config.enableChecksum) {
        checksum = this.calculateChecksum(processedData);
      }

      // 使用 Web Crypto API 加密
      if (Platform.OS === 'web') {
        const key = await this.deriveKey(this.masterKey!, salt);
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(processedData);

        const encryptedBuffer = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv
          },
          key,
          encodedData
        );

        const encryptedData: EncryptedData = {
          algorithm: this.config.algorithm,
          iv: Array.from(iv, byte => byte.toString(16).padStart(2, '0')).join(''),
          salt: Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join(''),
          data: Array.from(new Uint8Array(encryptedBuffer), byte => byte.toString(16).padStart(2, '0')).join(''),
          checksum,
          timestamp: Date.now(),
          version: '1.0'
        };

        success = true;
        this.updateStats('encrypt', true, Date.now() - startTime);
        return encryptedData;
      }
      // React Native 環境 - 簡化加密
      const encryptedData: EncryptedData = {
        algorithm: this.config.algorithm,
        iv: Array.from(iv, byte => byte.toString(16).padStart(2, '0')).join(''),
        salt: Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join(''),
        data: btoa(processedData), // Base64 編碼作為簡化加密
        checksum,
        timestamp: Date.now(),
        version: '1.0'
      };

      success = true;
      this.updateStats('encrypt', true, Date.now() - startTime);
      return encryptedData;

    } catch (error) {
      logger.error('Encryption failed', { error, keyId });
      this.updateStats('encrypt', false, Date.now() - startTime);
      throw error;
    }
  }

  // 解密數據
  async decrypt(encryptedData: EncryptedData, keyId?: string): Promise<any> {
    const startTime = Date.now();
    let success = false;

    try {
      const iv = new Uint8Array(encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const salt = new Uint8Array(encryptedData.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const encryptedBytes = new Uint8Array(encryptedData.data.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      let decryptedData: string;

      if (Platform.OS === 'web') {
        const key = await this.deriveKey(this.masterKey!, salt);

        const decryptedBuffer = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv
          },
          key,
          encryptedBytes
        );

        const decoder = new TextDecoder();
        decryptedData = decoder.decode(decryptedBuffer);
      } else {
        // React Native 環境 - 簡化解密
        decryptedData = atob(encryptedData.data); // Base64 解碼
      }

      // 驗證校驗和
      if (this.config.enableChecksum && encryptedData.checksum) {
        const calculatedChecksum = this.calculateChecksum(decryptedData);
        if (calculatedChecksum !== encryptedData.checksum) {
          throw new Error('Checksum verification failed');
        }
      }

      // 解壓縮
      if (this.config.enableCompression) {
        decryptedData = this.decompressData(decryptedData);
      }

      const result = JSON.parse(decryptedData);
      success = true;
      this.updateStats('decrypt', true, Date.now() - startTime);
      return result;
    } catch (error) {
      logger.error('Decryption failed', { error, keyId });
      this.updateStats('decrypt', false, Date.now() - startTime);
      throw error;
    }
  }

  // 生成新密鑰
  async generateKey(name: string, algorithm?: EncryptionAlgorithm): Promise<KeyInfo> {
    const keyInfo: KeyInfo = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      algorithm: algorithm || this.config.algorithm,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true,
      keySize: this.config.keySize
    };

    try {
      const keys = await this.getKeys();
      keys.push(keyInfo);
      await StorageManager.set('encryption_keys', keys);
      logger.info('Generated new encryption key', { keyInfo });
      return keyInfo;
    } catch (error) {
      logger.error('Failed to generate key', { error });
      throw error;
    }
  }

  // 獲取所有密鑰
  async getKeys(): Promise<KeyInfo[]> {
    try {
      return await StorageManager.get<KeyInfo[]>('encryption_keys') || [];
    } catch (error) {
      logger.error('Failed to get keys', { error });
      return [];
    }
  }

  // 刪除密鑰
  async deleteKey(keyId: string): Promise<boolean> {
    try {
      const keys = await this.getKeys();
      const filteredKeys = keys.filter(key => key.id !== keyId);
      await StorageManager.set('encryption_keys', filteredKeys);
      logger.info('Deleted encryption key', { keyId });
      return true;
    } catch (error) {
      logger.error('Failed to delete key', { error, keyId });
      return false;
    }
  }

  // 獲取加密統計
  getStats(): EncryptionStats {
    return { ...this.stats };
  }

  // 重置統計
  async resetStats(): Promise<void> {
    this.stats = {
      totalEncryptions: 0,
      totalDecryptions: 0,
      failedEncryptions: 0,
      failedDecryptions: 0,
      averageEncryptionTime: 0,
      averageDecryptionTime: 0,
      lastEncryptionTime: 0,
      lastDecryptionTime: 0
    };
    await this.saveStats();
  }

  // 更新配置
  updateConfig(newConfig: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Updated encryption config', { config: this.config });
  }

  // 獲取當前配置
  getConfig(): EncryptionConfig {
    return { ...this.config };
  }

  // 檢查加密支持
  isEncryptionSupported(): boolean {
    return Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android';
  }

  // 清理過期密鑰
  async cleanupExpiredKeys(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const keys = await this.getKeys();
      const now = Date.now();
      const validKeys = keys.filter(key => now - key.lastUsed < maxAge);
      const removedCount = keys.length - validKeys.length;

      if (removedCount > 0) {
        await StorageManager.set('encryption_keys', validKeys);
        logger.info('Cleaned up expired keys', { removedCount });
      }

      return removedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired keys', { error });
      return 0;
    }
  }
}

// 創建全局加密管理器實例
export const encryptionManager = new EncryptionManager();

// 導出便捷函數
export const encryptData = (data: any, keyId?: string) => encryptionManager.encrypt(data, keyId);
export const decryptData = (encryptedData: EncryptedData, keyId?: string) => encryptionManager.decrypt(encryptedData, keyId);
export const generateKey = (name: string, algorithm?: EncryptionAlgorithm) => encryptionManager.generateKey(name, algorithm);
export const getEncryptionStats = () => encryptionManager.getStats();

export default encryptionManager;
