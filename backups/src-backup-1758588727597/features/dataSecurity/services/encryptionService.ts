/**
 * 加密服務
 * 負責數據的加密、解密、哈希等操作
 */

import { logger } from '../../../core/utils/logger';
import type {
  DecryptionRequest,
  DecryptionResult,
  EncryptionRequest,
  EncryptionResult,
  EncryptionService,
} from '../types/security';
import {
  DataClassification,
  EncryptionAlgorithm,
  HashAlgorithm,
} from '../types/security';

import { CryptoKeyManager } from './keyManager';

/**
 * 加密服務實現
 */
export class CryptoEncryptionService implements EncryptionService {
  private static instance: CryptoEncryptionService;
  private readonly keyManager: CryptoKeyManager;
  private isInitialized = false;
  private readonly statistics = {
    totalEncryptions: 0,
    totalDecryptions: 0,
    totalEncryptionTime: 0,
    totalDecryptionTime: 0,
    totalOperations: 0,
    algorithmUsage: {} as { [algorithm: string]: number },
  };

  private constructor() {
    this.keyManager = CryptoKeyManager.getInstance();
  }

  /**
   * 獲取服務實例（單例模式）
   */
  public static getInstance(): CryptoEncryptionService {
    if (!CryptoEncryptionService.instance) {
      CryptoEncryptionService.instance = new CryptoEncryptionService();
    }
    return CryptoEncryptionService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('CryptoEncryptionService 已經初始化');
      return true;
    }

    try {
      // 初始化密鑰管理器
      await this.keyManager.initialize();

      this.isInitialized = true;
      logger.info('CryptoEncryptionService 初始化成功');
      return true;
    } catch (error) {
      logger.error('CryptoEncryptionService 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 加密數據
   */
  public async encrypt(request: EncryptionRequest): Promise<EncryptionResult> {
    try {
      const startTime = Date.now();

      // 驗證請求
      if (
        !request.data ||
        (typeof request.data === 'string' && request.data.length === 0)
      ) {
        return {
          success: false,
          algorithm: request.algorithm,
          error: '數據不能為空',
        };
      }

      // 獲取或生成密鑰
      let { keyId } = request;
      if (!keyId) {
        const key = await this.keyManager.generateKey(request.algorithm, {
          purpose: 'encryption',
          classification:
            request.metadata?.classification || DataClassification.INTERNAL,
        });
        keyId = key.id;
      }

      const key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        return {
          success: false,
          algorithm: request.algorithm,
          error: `密鑰不存在或不可用: ${keyId}`,
        };
      }

      // 準備數據
      const dataToEncrypt =
        typeof request.data === 'string'
          ? new TextEncoder().encode(request.data)
          : new Uint8Array(request.data);

      // 生成初始化向量 (IV)
      const iv = await this.generateRandomBytes(16); // 128 bits
      const ivArray = new Uint8Array(iv);

      // 執行加密
      const encryptionResult = await this.performEncryption(
        dataToEncrypt,
        key.keyData,
        request.algorithm,
        ivArray,
        request.additionalData
      );

      // 計算校驗和
      const originalChecksum = await this.hash(
        dataToEncrypt.buffer as ArrayBuffer,
        HashAlgorithm.SHA256
      );
      const encryptedChecksum = await this.hash(
        encryptionResult.encryptedData,
        HashAlgorithm.SHA256
      );

      const processingTime = Date.now() - startTime;

      // 更新統計數據
      this.statistics.totalEncryptions++;
      this.statistics.totalEncryptionTime += processingTime;
      this.statistics.totalOperations++;
      this.statistics.algorithmUsage[request.algorithm] =
        (this.statistics.algorithmUsage[request.algorithm] || 0) + 1;

      const result: EncryptionResult = {
        success: true,
        encryptedData: this.arrayBufferToBase64(encryptionResult.encryptedData),
        iv: this.arrayBufferToBase64(ivArray.buffer),
        authTag: encryptionResult.authTag
          ? this.arrayBufferToBase64(encryptionResult.authTag)
          : undefined,
        keyId,
        algorithm: request.algorithm,
        metadata: {
          encryptedAt: new Date(),
          dataSize: dataToEncrypt.length,
          checksums: {
            original: originalChecksum,
            encrypted: encryptedChecksum,
          },
        },
      };

      logger.debug(`數據加密成功`, {
        keyId,
        algorithm: request.algorithm,
        dataSize: dataToEncrypt.length,
        processingTime,
      });

      return result;
    } catch (error) {
      logger.error('數據加密失敗:', error);
      return {
        success: false,
        algorithm: request.algorithm,
        error: error instanceof Error ? error.message : '加密失敗',
      };
    }
  }

  /**
   * 解密數據
   */
  public async decrypt(request: DecryptionRequest): Promise<DecryptionResult> {
    try {
      const startTime = Date.now();

      // 驗證請求
      if (!request.encryptedData) {
        return {
          success: false,
          error: '加密數據不能為空',
        };
      }

      // 獲取密鑰
      const { keyId } = request;
      if (!keyId) {
        return {
          success: false,
          error: '缺少密鑰ID',
        };
      }

      const key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        return {
          success: false,
          error: `密鑰不存在或不可用: ${keyId}`,
        };
      }

      // 準備數據
      const encryptedData = this.base64ToArrayBuffer(request.encryptedData);
      const iv = request.iv
        ? this.base64ToArrayBuffer(request.iv)
        : new ArrayBuffer(16);
      const authTag = request.authTag
        ? this.base64ToArrayBuffer(request.authTag)
        : undefined;

      // 執行解密
      const decryptedData = await this.performDecryption(
        encryptedData,
        key.keyData,
        request.algorithm,
        new Uint8Array(iv),
        authTag ? new Uint8Array(authTag) : undefined,
        request.additionalData
      );

      // 驗證數據完整性
      const checksum = await this.hash(decryptedData, HashAlgorithm.SHA256);

      const processingTime = Date.now() - startTime;

      // 更新統計數據
      this.statistics.totalDecryptions++;
      this.statistics.totalDecryptionTime += processingTime;
      this.statistics.totalOperations++;

      const result: DecryptionResult = {
        success: true,
        decryptedData: new TextDecoder().decode(decryptedData),
        metadata: {
          decryptedAt: new Date(),
          dataSize: decryptedData.byteLength,
          checksum,
          verified: true,
        },
      };

      logger.debug(`數據解密成功`, {
        keyId,
        algorithm: request.algorithm,
        dataSize: decryptedData.byteLength,
        processingTime,
      });

      return result;
    } catch (error) {
      logger.error('數據解密失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '解密失敗',
      };
    }
  }

  /**
   * 計算哈希值
   */
  public async hash(
    data: string | ArrayBuffer,
    algorithm: HashAlgorithm
  ): Promise<string> {
    try {
      const dataToHash =
        typeof data === 'string'
          ? new TextEncoder().encode(data)
          : new Uint8Array(data);

      const hashResult = await this.performHashing(dataToHash, algorithm);
      return this.arrayBufferToBase64(hashResult);
    } catch (error) {
      logger.error('哈希計算失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證哈希值
   */
  public async verify(
    data: string | ArrayBuffer,
    hash: string,
    algorithm: HashAlgorithm
  ): Promise<boolean> {
    try {
      const computedHash = await this.hash(data, algorithm);
      return computedHash === hash;
    } catch (error) {
      logger.error('哈希驗證失敗:', error);
      return false;
    }
  }

  /**
   * 生成隨機字節
   */
  public async generateRandomBytes(length: number): Promise<ArrayBuffer> {
    try {
      const randomBytes = new Uint8Array(length);

      // 在真實環境中，這裡會使用 Web Crypto API
      // crypto.getRandomValues(randomBytes);

      // 模擬隨機數生成
      for (let i = 0; i < length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }

      return randomBytes.buffer;
    } catch (error) {
      logger.error('隨機字節生成失敗:', error);
      throw error;
    }
  }

  /**
   * 密鑰派生
   */
  public async deriveKey(
    password: string,
    salt: string,
    iterations: number
  ): Promise<string> {
    try {
      // 模擬 PBKDF2 密鑰派生
      const passwordBytes = new TextEncoder().encode(password);
      const saltBytes = new TextEncoder().encode(salt);

      // 簡化的密鑰派生（在真實環境中使用 PBKDF2）
      const derived = new Uint8Array(32); // 256 bits

      for (let i = 0; i < iterations; i++) {
        const combined = new Uint8Array(
          passwordBytes.length + saltBytes.length + 4
        );
        combined.set(passwordBytes);
        combined.set(saltBytes, passwordBytes.length);
        combined.set(
          new Uint8Array([i >> 24, i >> 16, i >> 8, i]),
          passwordBytes.length + saltBytes.length
        );

        const hash = await this.performHashing(combined, HashAlgorithm.SHA256);
        const hashArray = new Uint8Array(hash);

        for (let j = 0; j < derived.length; j++) {
          derived[j] ^= hashArray[j % hashArray.length];
        }
      }

      return this.arrayBufferToBase64(derived.buffer);
    } catch (error) {
      logger.error('密鑰派生失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取加密統計信息
   */
  public async getEncryptionStatistics(): Promise<{
    totalEncryptions: number;
    totalDecryptions: number;
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    errorRate: number;
    algorithmUsage: { [algorithm: string]: number };
  }> {
    return {
      totalEncryptions: this.statistics.totalEncryptions,
      totalDecryptions: this.statistics.totalDecryptions,
      averageEncryptionTime:
        this.statistics.totalEncryptions > 0
          ? this.statistics.totalEncryptionTime /
            this.statistics.totalEncryptions
          : 0,
      averageDecryptionTime:
        this.statistics.totalDecryptions > 0
          ? this.statistics.totalDecryptionTime /
            this.statistics.totalDecryptions
          : 0,
      errorRate: 0, // 可以在錯誤處理中追蹤
      algorithmUsage: { ...this.statistics.algorithmUsage },
    };
  }

  /**
   * 銷毀服務
   */
  public async destroy(): Promise<void> {
    try {
      this.isInitialized = false;
      logger.info('CryptoEncryptionService 已銷毀');
    } catch (error) {
      logger.error('CryptoEncryptionService 銷毀失敗:', error);
    }
  }

  // 私有方法

  private async performEncryption(
    data: Uint8Array,
    keyData: string,
    algorithm: EncryptionAlgorithm,
    iv: Uint8Array,
    additionalData?: string
  ): Promise<{ encryptedData: ArrayBuffer; authTag?: ArrayBuffer }> {
    // 模擬加密操作
    // 在真實環境中，這裡會使用 Web Crypto API 或 Node.js crypto

    const key = this.base64ToArrayBuffer(keyData);
    const keyArray = new Uint8Array(key);

    // 簡化的 XOR 加密（僅用於演示）
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] =
        data[i] ^ keyArray[i % keyArray.length] ^ iv[i % iv.length];
    }

    // 模擬認證標籤
    let authTag: ArrayBuffer | undefined;
    if (
      algorithm === EncryptionAlgorithm.AES_256_GCM ||
      algorithm === EncryptionAlgorithm.CHACHA20_POLY1305
    ) {
      authTag = await this.generateRandomBytes(16);
    }

    return {
      encryptedData: encrypted.buffer,
      authTag,
    };
  }

  private async performDecryption(
    encryptedData: ArrayBuffer,
    keyData: string,
    algorithm: EncryptionAlgorithm,
    iv: Uint8Array,
    authTag?: Uint8Array,
    additionalData?: string
  ): Promise<ArrayBuffer> {
    // 模擬解密操作
    // 在真實環境中，這裡會使用 Web Crypto API 或 Node.js crypto

    const key = this.base64ToArrayBuffer(keyData);
    const keyArray = new Uint8Array(key);
    const encryptedArray = new Uint8Array(encryptedData);

    // 簡化的 XOR 解密（與加密過程相反）
    const decrypted = new Uint8Array(encryptedArray.length);
    for (let i = 0; i < encryptedArray.length; i++) {
      decrypted[i] =
        encryptedArray[i] ^ keyArray[i % keyArray.length] ^ iv[i % iv.length];
    }

    return decrypted.buffer;
  }

  private async performHashing(
    data: Uint8Array,
    algorithm: HashAlgorithm
  ): Promise<ArrayBuffer> {
    // 模擬哈希計算
    // 在真實環境中，這裡會使用 Web Crypto API 或 Node.js crypto

    const hashSize = this.getHashSize(algorithm);
    const hash = new Uint8Array(hashSize);

    // 簡化的哈希計算
    let seed = 0;
    for (let i = 0; i < data.length; i++) {
      seed = ((seed << 5) - seed + data[i]) & 0xffffffff;
    }

    for (let i = 0; i < hashSize; i++) {
      hash[i] = (seed >>> ((i % 4) * 8)) & 0xff;
      seed = ((seed << 1) | (seed >>> 31)) & 0xffffffff;
    }

    return hash.buffer;
  }

  private getHashSize(algorithm: HashAlgorithm): number {
    switch (algorithm) {
      case HashAlgorithm.SHA256:
        return 32; // 256 bits
      case HashAlgorithm.SHA512:
        return 64; // 512 bits
      case HashAlgorithm.BLAKE2B:
        return 64; // 512 bits
      case HashAlgorithm.ARGON2:
        return 32; // 256 bits
      default:
        return 32;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
