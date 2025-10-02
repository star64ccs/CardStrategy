import { logger } from '../../../core/utils/logger';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
  hashAlgorithm: string;
  keyDerivationFunction: string;
}

export interface EncryptionKey {
  id: string;
  key: string;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyId: string;
  timestamp: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  keyId: string;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
  keyId: string;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class EncryptionService {
  private readonly config: EncryptionConfig;
  private isInitialized = false;
  private readonly keys: Map<string, EncryptionKey> = new Map();
  private readonly keyPairs: Map<string, KeyPair> = new Map();
  private masterKey = '';

  constructor() {
    this.config = {
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
      keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '32'),
      ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH || '16'),
      saltLength: parseInt(process.env.ENCRYPTION_SALT_LENGTH || '32'),
      iterations: parseInt(process.env.ENCRYPTION_ITERATIONS || '100000'),
      hashAlgorithm: process.env.ENCRYPTION_HASH_ALGORITHM || 'sha256',
      keyDerivationFunction: process.env.ENCRYPTION_KDF || 'pbkdf2',
    };
  }

  isAvailable(): boolean {
    return this.isInitialized && this.masterKey !== '';
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('Initialize加密Service');

      // 生成或Load主密鑰
      this.masterKey = process.env.MASTER_KEY || this.generateMasterKey();

      // CreateDefaultEncrypt密鑰
      await this.createDefaultKeys();

      this.isInitialized = true;
      logger.info('加密ServiceInitialize完成');

      return {
        success: true,
        data: {
          algorithm: this.config.algorithm,
          keyLength: this.config.keyLength,
          totalKeys: this.keys.size,
          totalKeyPairs: this.keyPairs.size,
        },
        message: '加密ServiceInitializeSuccess',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('加密ServiceInitializeFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  // 對稱Encrypt
  async encrypt(
    data: string,
    keyId?: string
  ): Promise<ApiResponse<EncryptedData>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // GetEncrypt密鑰
      const _encryptionKey = keyId
        ? this.keys.get(keyId)
        : this.getDefaultKey();
      if (!encryptionKey?.isActive) {
        return {
          success: false,
          error: '加密密鑰不可用',
          timestamp: Date.now(),
        };
      }

      // 生成隨機 IV 和鹽
      const _iv = this.generateRandomBytes(this.config.ivLength);
      const _salt = this.generateRandomBytes(this.config.saltLength);

      // 派生密鑰
      const _derivedKey = this.deriveKey(encryptionKey.key, salt);

      // EncryptData
      const _encryptedBuffer = this.encryptData(data, derivedKey, iv);
      const _encryptedData = this.bufferToBase64(encryptedBuffer);

      const result: EncryptedData = {
        data: encryptedData,
        iv: this.bufferToBase64(iv),
        salt: this.bufferToBase64(salt),
        algorithm: this.config.algorithm,
        keyId: encryptionKey.id,
        timestamp: Date.now(),
      };

      logger.info(`數據加密Success，使用密鑰: ${encryptionKey.id}`);

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('數據加密Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async decrypt(encryptedData: EncryptedData): Promise<ApiResponse<string>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // GetDecrypt密鑰
      const _decryptionKey = this.keys.get(encryptedData.keyId);
      if (!decryptionKey) {
        return {
          success: false,
          error: '解密密鑰不存在',
          timestamp: Date.now(),
        };
      }

      // ParseEncryptData
      const _iv = this.base64ToBuffer(encryptedData.iv);
      const _salt = this.base64ToBuffer(encryptedData.salt);
      const _data = this.base64ToBuffer(encryptedData.data);

      // 派生密鑰
      const _derivedKey = this.deriveKey(decryptionKey.key, salt);

      // DecryptData
      const _decryptedData = this.decryptData(data, derivedKey, iv);

      logger.info(`數據解密Success，使用密鑰: ${decryptionKey.id}`);

      return {
        success: true,
        data: decryptedData,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('數據解密Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '解密Failed',
        timestamp: Date.now(),
      };
    }
  }

  // 非對稱Encrypt
  async generateKeyPair(algorithm = 'rsa'): Promise<ApiResponse<KeyPair>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _keyId = this.generateId();

      // 簡化的密鑰對生成（實際Apply中應使用 crypto Module）
      const keyPair: KeyPair = {
        publicKey: this.generatePublicKey(keyId),
        privateKey: this.generatePrivateKey(keyId),
        algorithm,
        keyId,
      };

      this.keyPairs.set(keyId, keyPair);
      logger.info(`生成密鑰對: ${keyId}`);

      return {
        success: true,
        data: keyPair,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('生成密鑰對Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async encryptWithPublicKey(
    data: string,
    publicKey: string
  ): Promise<ApiResponse<string>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // 簡化的公鑰Encrypt實現
      const _encryptedData = this.simplePublicKeyEncrypt(data, publicKey);

      logger.info('公鑰加密Success');

      return {
        success: true,
        data: encryptedData,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('公鑰加密Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async decryptWithPrivateKey(
    encryptedData: string,
    privateKey: string
  ): Promise<ApiResponse<string>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // 簡化的私鑰Decrypt實現
      const _decryptedData = this.simplePrivateKeyDecrypt(
        encryptedData,
        privateKey
      );

      logger.info('私鑰解密Success');

      return {
        success: true,
        data: decryptedData,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('私鑰解密Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '解密Failed',
        timestamp: Date.now(),
      };
    }
  }

  // 數字Sign
  async sign(
    data: string,
    privateKey: string
  ): Promise<ApiResponse<SignatureResult>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // Find私鑰對應的密鑰對
      const _keyPair = Array.from(this.keyPairs.values()).find(
        kp => kp.privateKey === privateKey
      );

      if (!keyPair) {
        return {
          success: false,
          error: '私鑰不存在',
          timestamp: Date.now(),
        };
      }

      // 簡化的數字Sign實現
      const _signature = this.simpleSign(data, privateKey);

      const result: SignatureResult = {
        signature,
        algorithm: keyPair.algorithm,
        keyId: keyPair.keyId,
        timestamp: Date.now(),
      };

      logger.info(`數據簽名Success，使用密鑰: ${keyPair.keyId}`);

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('數據簽名Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async verify(
    data: string,
    signature: string,
    publicKey: string
  ): Promise<ApiResponse<boolean>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // 簡化的SignVerify實現
      const _isValid = this.simpleVerify(data, signature, publicKey);

      logger.info(`簽名Verify${isValid ? 'Success' : 'Failed'}`);

      return {
        success: true,
        data: isValid,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('簽名VerifyFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  // 哈希Function
  async hash(data: string, algorithm?: string): Promise<ApiResponse<string>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _hashAlgorithm = algorithm || this.config.hashAlgorithm;
      const _hash = this.simpleHash(data, hashAlgorithm);

      return {
        success: true,
        data: hash,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('哈希計算Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  // 密鑰Manage
  async createKey(expiresAt?: Date): Promise<ApiResponse<EncryptionKey>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _id = this.generateId();
      const _key = this.generateKey();

      const encryptionKey: EncryptionKey = {
        id,
        key,
        algorithm: this.config.algorithm,
        createdAt: new Date(),
        expiresAt,
        isActive: true,
      };

      this.keys.set(id, encryptionKey);
      logger.info(`創建加密密鑰: ${id}`);

      return {
        success: true,
        data: encryptionKey,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Create密鑰Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async rotateKey(keyId: string): Promise<ApiResponse<EncryptionKey>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _oldKey = this.keys.get(keyId);
      if (!oldKey) {
        return {
          success: false,
          error: '密鑰不存在',
          timestamp: Date.now(),
        };
      }

      // Deactivate舊密鑰
      oldKey.isActive = false;

      // Create新密鑰
      const _newKeyResult = await this.createKey(oldKey.expiresAt);
      if (!newKeyResult.success || !newKeyResult.data) {
        return {
          success: false,
          error: 'Create新密鑰Failed',
          timestamp: Date.now(),
        };
      }

      logger.info(`密鑰輪換: ${keyId} -> ${newKeyResult.data.id}`);

      return {
        success: true,
        data: newKeyResult.data,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('密鑰輪換Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async revokeKey(keyId: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '加密Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _key = this.keys.get(keyId);
      if (!key) {
        return {
          success: false,
          error: '密鑰不存在',
          timestamp: Date.now(),
        };
      }

      key.isActive = false;
      logger.info(`撤銷密鑰: ${keyId}`);

      return {
        success: true,
        message: '密鑰已撤銷',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('撤銷密鑰Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  getAllKeys(): EncryptionKey[] {
    return Array.from(this.keys.values());
  }

  getAllKeyPairs(): KeyPair[] {
    return Array.from(this.keyPairs.values());
  }

  // PrivateMethod
  private async createDefaultKeys(): Promise<void> {
    // CreateDefaultEncrypt密鑰
    await this.createKey();
  }

  private generateMasterKey(): string {
    // 生成256位主密鑰
    return this.generateRandomString(64);
  }

  private generateKey(): string {
    // 生成Encrypt密鑰
    return this.generateRandomString(this.config.keyLength * 2);
  }

  private generatePublicKey(keyId: string): string {
    // 簡化的公鑰生成
    return `PUBLIC_KEY_${keyId}_${this.generateRandomString(32)}`;
  }

  private generatePrivateKey(keyId: string): string {
    // 簡化的私鑰生成
    return `PRIVATE_KEY_${keyId}_${this.generateRandomString(64)}`;
  }

  private generateRandomBytes(length: number): Buffer {
    // 簡化的隨機字節生成
    const _bytes = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  private generateRandomString(length: number): string {
    const _chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private deriveKey(key: string, salt: Buffer): Buffer {
    // 簡化的密鑰派生實現
    // 實際Apply中應使用 PBKDF2、Argon2 等
    const _combined = key + salt.toString('hex');
    return Buffer.from(this.simpleHash(combined, 'sha256'), 'hex').slice(
      0,
      this.config.keyLength
    );
  }

  private encryptData(data: string, key: Buffer, iv: Buffer): Buffer {
    // 簡化的Encrypt實現
    // 實際Apply中應使用 crypto Module的 AES-GCM
    const _dataBuffer = Buffer.from(data, 'utf8');
    const _encrypted = Buffer.alloc(dataBuffer.length);

    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ key[i % key.length] ^ iv[i % iv.length];
    }

    return encrypted;
  }

  private decryptData(encryptedData: Buffer, key: Buffer, iv: Buffer): string {
    // 簡化的Decrypt實現
    const _decrypted = Buffer.alloc(encryptedData.length);

    for (let i = 0; i < encryptedData.length; i++) {
      decrypted[i] = encryptedData[i] ^ key[i % key.length] ^ iv[i % iv.length];
    }

    return decrypted.toString('utf8');
  }

  private simplePublicKeyEncrypt(data: string, publicKey: string): string {
    // 簡化的公鑰Encrypt實現
    const _keyHash = this.simpleHash(publicKey, 'sha256');
    const _encrypted = this.simpleXOR(data, keyHash);
    return this.bufferToBase64(Buffer.from(encrypted));
  }

  private simplePrivateKeyDecrypt(
    encryptedData: string,
    privateKey: string
  ): string {
    // 簡化的私鑰Decrypt實現
    const _keyHash = this.simpleHash(privateKey, 'sha256');
    const _dataBuffer = this.base64ToBuffer(encryptedData);
    return this.simpleXOR(dataBuffer.toString(), keyHash);
  }

  private simpleSign(data: string, privateKey: string): string {
    // 簡化的數字Sign實現
    const _combined = data + privateKey;
    return this.simpleHash(combined, 'sha256');
  }

  private simpleVerify(
    data: string,
    signature: string,
    publicKey: string
  ): boolean {
    // 簡化的SignVerify實現
    // 在實際Apply中，需要使用對應的私鑰來Verify
    const _expectedSignature = this.simpleHash(data + publicKey, 'sha256');
    return signature === expectedSignature;
  }

  private simpleHash(data: string, algorithm: string): string {
    // 簡化的哈希實現
    // 實際Apply中應使用 crypto Module
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const _char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert為 32 位整數
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  private simpleXOR(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const _dataChar = data.charCodeAt(i);
      const _keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(dataChar ^ keyChar);
    }
    return result;
  }

  private bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  private base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }

  private getDefaultKey(): EncryptionKey | undefined {
    return Array.from(this.keys.values()).find(key => key.isActive);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        totalKeys: this.keys.size,
        activeKeys: Array.from(this.keys.values()).filter(k => k.isActive)
          .length,
        totalKeyPairs: this.keyPairs.size,
        algorithm: this.config.algorithm,
        keyLength: this.config.keyLength,
      },
      timestamp: Date.now(),
    };
  }
}

export const _encryptionService = new EncryptionService();
