/**
 * 密鑰ManageService
 * 負責密鑰的生成、Storage、輪換、撤銷等Operation
 */

import { logger } from '../../../core/utils/logger';
import type { EncryptionKey, KeyManager } from '../types/security';
import { EncryptionAlgorithm, KeyStatus, KeyType } from '../types/security';

/**
 * 密鑰ManageService實現
 */
export class CryptoKeyManager implements KeyManager {
  private static instance: CryptoKeyManager;
  private readonly keys = new Map<string, EncryptionKey>();
  private isInitialized = false;

  private constructor() {}

  /**
   * GetServiceInstance（單例模式）
   */
  public static getInstance(): CryptoKeyManager {
    if (!CryptoKeyManager.instance) {
      CryptoKeyManager.instance = new CryptoKeyManager();
    }
    return CryptoKeyManager.instance;
  }

  /**
   * InitializeService
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('CryptoKeyManager 已經初始化');
      return true;
    }

    try {
      // 加載現有密鑰
      await this.loadExistingKeys();

      // CreateDefault密鑰
      await this.createDefaultKeys();

      this.isInitialized = true;
      logger.info('CryptoKeyManager InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('CryptoKeyManager InitializeFailed:', error);
      return false;
    }
  }

  /**
   * 生成新密鑰
   */
  public async generateKey(
    algorithm: EncryptionAlgorithm,
    metadata?: unknown
  ): Promise<EncryptionKey> {
    try {
      const _keyId = this.generateKeyId();
      const _keyData = await this.generateKeyData(algorithm);

      const key: EncryptionKey = {
        id: keyId,
        type: this.getKeyType(algorithm),
        algorithm,
        keyData,
        createdAt: new Date(),
        expiresAt: this.calculateExpirationDate(algorithm),
        status: KeyStatus.ACTIVE,
        metadata: {
          purpose: metadata?.purpose || 'general',
          owner: metadata?.owner || 'system',
          usage: metadata?.usage || ['encrypt', 'decrypt'],
          rotationSchedule: metadata?.rotationSchedule || '0 0 1 * *', // monthly
        },
      };

      await this.storeKey(key);

      logger.info(`密鑰生成Success: ${keyId}`, { algorithm, type: key.type });
      return key;
    } catch (error) {
      logger.error('密鑰生成Failed:', error);
      throw error;
    }
  }

  /**
   * Storage密鑰
   */
  public async storeKey(key: EncryptionKey): Promise<boolean> {
    try {
      // Verify密鑰
      if (!this.validateKey(key)) {
        throw new Error('無效的密鑰格式');
      }

      // Storage到Memory
      this.keys.set(key.id, key);

      // 持久化Storage
      await this.persistKey(key);

      logger.debug(`密鑰存儲Success: ${key.id}`);
      return true;
    } catch (error) {
      logger.error('密鑰存儲Failed:', error);
      return false;
    }
  }

  /**
   * 檢索密鑰
   */
  public async retrieveKey(keyId: string): Promise<EncryptionKey | null> {
    try {
      const _key = this.keys.get(keyId);

      if (!key) {
        logger.warn(`密鑰不存在: ${keyId}`);
        return null;
      }

      // Check密鑰Status
      if (key.status !== KeyStatus.ACTIVE) {
        logger.warn(`密鑰不可用: ${keyId}, 狀態: ${key.status}`);
        return null;
      }

      // Check過期Time
      if (key.expiresAt && key.expiresAt < new Date()) {
        logger.warn(`密鑰已過期: ${keyId}`);
        await this.markKeyExpired(keyId);
        return null;
      }

      return key;
    } catch (error) {
      logger.error('密鑰檢索Failed:', error);
      return null;
    }
  }

  /**
   * 撤銷密鑰
   */
  public async revokeKey(keyId: string, reason?: string): Promise<boolean> {
    try {
      const _key = this.keys.get(keyId);

      if (!key) {
        logger.warn(`密鑰不存在: ${keyId}`);
        return false;
      }

      // Update密鑰Status
      key.status = KeyStatus.REVOKED;
      key.metadata = {
        ...key.metadata,
        purpose: `${key.metadata.purpose}_revoked`,
        owner: key.metadata.owner,
        usage: key.metadata.usage,
        rotationSchedule: key.metadata.rotationSchedule,
      };

      // 持久化Update
      await this.persistKey(key);

      logger.info(`密鑰已撤銷: ${keyId}`, { reason });
      return true;
    } catch (error) {
      logger.error('密鑰撤銷Failed:', error);
      return false;
    }
  }

  /**
   * 輪換密鑰
   */
  public async rotateKey(keyId: string): Promise<EncryptionKey> {
    try {
      const _oldKey = this.keys.get(keyId);

      if (!oldKey) {
        throw new Error(`密鑰不存在: ${keyId}`);
      }

      // 生成新密鑰
      const _newKey = await this.generateKey(oldKey.algorithm, {
        ...oldKey.metadata,
        purpose: `${oldKey.metadata.purpose}_rotated`,
        previousKeyId: keyId,
      });

      // Mark舊密鑰為非活動Status
      oldKey.status = KeyStatus.INACTIVE;
      oldKey.metadata = {
        ...oldKey.metadata,
        purpose: `${oldKey.metadata.purpose}_rotated`,
        owner: oldKey.metadata.owner,
        usage: oldKey.metadata.usage,
        rotationSchedule: oldKey.metadata.rotationSchedule,
      };

      await this.persistKey(oldKey);

      logger.info(`密鑰輪換Success: ${keyId} -> ${newKey.id}`);
      return newKey;
    } catch (error) {
      logger.error('密鑰輪換Failed:', error);
      throw error;
    }
  }

  /**
   * Column出密鑰
   */
  public async listKeys(
    filter?: Partial<EncryptionKey>
  ): Promise<EncryptionKey[]> {
    try {
      let keys = Array.from(this.keys.values());

      // ApplyFilter器
      if (filter) {
        keys = keys.filter(key => {
          return Object.entries(filter).every(([field, value]) => {
            if (value === undefined) return true;
            return (key as any)[field] === value;
          });
        });
      }

      // Sort（按CreateTime降序）
      keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return keys;
    } catch (error) {
      logger.error('密鑰列表GetFailed:', error);
      return [];
    }
  }

  /**
   * Export密鑰
   */
  public async exportKey(
    keyId: string,
    format: 'pem' | 'jwk' | 'raw'
  ): Promise<string> {
    try {
      const _key = await this.retrieveKey(keyId);

      if (!key) {
        throw new Error(`密鑰不存在或不可用: ${keyId}`);
      }

      switch (format) {
        case 'raw':
          return key.keyData;
        case 'pem':
          return this.convertToPem(key);
        case 'jwk':
          return this.convertToJwk(key);
        default:
          throw new Error(`不支持的格式: ${format}`);
      }
    } catch (error) {
      logger.error('密鑰導出Failed:', error);
      throw error;
    }
  }

  /**
   * Import密鑰
   */
  public async importKey(
    keyData: string,
    format: 'pem' | 'jwk' | 'raw',
    metadata?: unknown
  ): Promise<EncryptionKey> {
    try {
      // Parse密鑰Data
      const _parsedKey = this.parseKeyData(keyData, format);

      const _keyId = this.generateKeyId();
      const key: EncryptionKey = {
        id: keyId,
        type: parsedKey.type,
        algorithm: parsedKey.algorithm,
        keyData: parsedKey.keyData,
        createdAt: new Date(),
        expiresAt: this.calculateExpirationDate(parsedKey.algorithm),
        status: KeyStatus.ACTIVE,
        metadata: {
          purpose: metadata?.purpose || 'imported',
          owner: metadata?.owner || 'external',
          usage: metadata?.usage || ['encrypt', 'decrypt'],
          rotationSchedule: metadata?.rotationSchedule,
        },
      };

      await this.storeKey(key);

      logger.info(`密鑰導入Success: ${keyId}`);
      return key;
    } catch (error) {
      logger.error('密鑰導入Failed:', error);
      throw error;
    }
  }

  /**
   * Get密鑰StatisticsInformation
   */
  public async getKeyStatistics(): Promise<{
    total: number;
    active: number;
    expired: number;
    revoked: number;
    byAlgorithm: { [algorithm: string]: number };
    byType: { [type: string]: number };
  }> {
    const _keys = Array.from(this.keys.values());

    const _stats = {
      total: keys.length,
      active: keys.filter(k => k.status === KeyStatus.ACTIVE).length,
      expired: keys.filter(k => k.status === KeyStatus.EXPIRED).length,
      revoked: keys.filter(k => k.status === KeyStatus.REVOKED).length,
      byAlgorithm: {} as { [algorithm: string]: number },
      byType: {} as { [type: string]: number },
    };

    // 按算法Statistics
    keys.forEach(key => {
      stats.byAlgorithm[key.algorithm] =
        (stats.byAlgorithm[key.algorithm] || 0) + 1;
      stats.byType[key.type] = (stats.byType[key.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<void> {
    try {
      this.keys.clear();
      this.isInitialized = false;
      logger.info('CryptoKeyManager 已銷毀');
    } catch (error) {
      logger.error('CryptoKeyManager 銷毀Failed:', error);
    }
  }

  // PrivateMethod

  private generateKeyId(): string {
    const _timestamp = Date.now().toString(36);
    const _random = Math.random().toString(36).substring(2, 8);
    return `key_${timestamp}_${random}`;
  }

  private async generateKeyData(
    algorithm: EncryptionAlgorithm
  ): Promise<string> {
    // 模擬密鑰生成
    const _keySize = this.getKeySize(algorithm);
    const _randomBytes = new Uint8Array(keySize);

    // 在True實環境中，這裡會使用 Web Crypto API 或 Node.js crypto
    for (let i = 0; i < keySize; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }

    // Convert為 base64
    return btoa(String.fromCharCode(...randomBytes));
  }

  private getKeySize(algorithm: EncryptionAlgorithm): number {
    switch (algorithm) {
      case EncryptionAlgorithm.AES_256_GCM:
      case EncryptionAlgorithm.AES_256_CBC:
        return 32; // 256 bits
      case EncryptionAlgorithm.CHACHA20_POLY1305:
        return 32; // 256 bits
      case EncryptionAlgorithm.RSA_OAEP:
        return 256; // 2048 bits key
      default:
        return 32;
    }
  }

  private getKeyType(algorithm: EncryptionAlgorithm): KeyType {
    switch (algorithm) {
      case EncryptionAlgorithm.AES_256_GCM:
      case EncryptionAlgorithm.AES_256_CBC:
      case EncryptionAlgorithm.CHACHA20_POLY1305:
        return KeyType.SYMMETRIC;
      case EncryptionAlgorithm.RSA_OAEP:
        return KeyType.ASYMMETRIC_PRIVATE;
      default:
        return KeyType.SYMMETRIC;
    }
  }

  private calculateExpirationDate(algorithm: EncryptionAlgorithm): Date {
    const _now = new Date();
    const _expirationDays = this.getDefaultExpirationDays(algorithm);
    return new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);
  }

  private getDefaultExpirationDays(algorithm: EncryptionAlgorithm): number {
    switch (algorithm) {
      case EncryptionAlgorithm.AES_256_GCM:
      case EncryptionAlgorithm.AES_256_CBC:
      case EncryptionAlgorithm.CHACHA20_POLY1305:
        return 365; // 1 year
      case EncryptionAlgorithm.RSA_OAEP:
        return 730; // 2 years
      default:
        return 365;
    }
  }

  private validateKey(key: EncryptionKey): boolean {
    if (!key.id || !key.keyData || !key.algorithm) {
      return false;
    }

    if (!Object.values(EncryptionAlgorithm).includes(key.algorithm)) {
      return false;
    }

    if (!Object.values(KeyType).includes(key.type)) {
      return false;
    }

    return true;
  }

  private async persistKey(key: EncryptionKey): Promise<void> {
    try {
      // 在True實環境中，這裡會將密鑰持久化到安全Storage
      // 例如：硬件安全Module (HSM)、密鑰ManageService (KMS)、或EncryptDatabase
      const _keyStorage = localStorage || {};
      keyStorage[`key_${key.id}`] = JSON.stringify({
        ...key,
        keyData: `[ENCRYPTED]${key.keyData}`, // 模擬EncryptStorage
      });

      logger.debug(`密鑰已持久化: ${key.id}`);
    } catch (error) {
      logger.error('密鑰持久化Failed:', error);
      throw error;
    }
  }

  private async loadExistingKeys(): Promise<void> {
    try {
      // 從持久化Storage加載現有密鑰
      const _keyStorage = localStorage || {};

      Object.keys(keyStorage).forEach(storageKey => {
        if (storageKey.startsWith('key_')) {
          try {
            const _keyData = JSON.parse(keyStorage[storageKey]);

            // Decrypt密鑰Data
            if (keyData.keyData?.startsWith('[ENCRYPTED]')) {
              keyData.keyData = keyData.keyData.substring(11); // RemoveEncrypt前綴
            }

            // 重建DayObject
            keyData.createdAt = new Date(keyData.createdAt);
            if (keyData.expiresAt) {
              keyData.expiresAt = new Date(keyData.expiresAt);
            }

            this.keys.set(keyData.id, keyData);
          } catch (error) {
            logger.warn(`載入密鑰Failed: ${storageKey}`, error);
          }
        }
      });

      logger.info(`載入 ${this.keys.size} 個現有密鑰`);
    } catch (error) {
      logger.error('載入現有密鑰Failed:', error);
    }
  }

  private async createDefaultKeys(): Promise<void> {
    try {
      // 如果沒有活動密鑰，CreateDefault密鑰
      const _activeKeys = Array.from(this.keys.values()).filter(
        key => key.status === KeyStatus.ACTIVE
      );

      if (activeKeys.length === 0) {
        // CreateDefault AES 密鑰
        await this.generateKey(EncryptionAlgorithm.AES_256_GCM, {
          purpose: 'default_aes',
          owner: 'system',
          usage: ['encrypt', 'decrypt', 'backup'],
        });

        logger.info('創建默認密鑰');
      }
    } catch (error) {
      logger.error('Create默認密鑰Failed:', error);
    }
  }

  private async markKeyExpired(keyId: string): Promise<void> {
    const _key = this.keys.get(keyId);
    if (key) {
      key.status = KeyStatus.EXPIRED;
      await this.persistKey(key);
    }
  }

  private convertToPem(key: EncryptionKey): string {
    // 模擬 PEM 格式Convert
    const _header = `-----BEGIN ${key.type.toUpperCase()} KEY-----`;
    const _footer = `-----END ${key.type.toUpperCase()} KEY-----`;
    const _keyData = key.keyData.match(/.{1,64}/g)?.join('\n') || key.keyData;

    return `${header}\n${keyData}\n${footer}`;
  }

  private convertToJwk(key: EncryptionKey): string {
    // 模擬 JWK 格式Convert
    const _jwk = {
      kty: key.type === KeyType.SYMMETRIC ? 'oct' : 'RSA',
      alg: this.algorithmToJwkAlg(key.algorithm),
      kid: key.id,
      k: key.keyData,
      use: 'enc',
    };

    return JSON.stringify(jwk, null, 2);
  }

  private algorithmToJwkAlg(algorithm: EncryptionAlgorithm): string {
    switch (algorithm) {
      case EncryptionAlgorithm.AES_256_GCM:
        return 'A256GCM';
      case EncryptionAlgorithm.AES_256_CBC:
        return 'A256CBC-HS512';
      case EncryptionAlgorithm.RSA_OAEP:
        return 'RSA-OAEP';
      default:
        return 'A256GCM';
    }
  }

  private parseKeyData(
    keyData: string,
    format: 'pem' | 'jwk' | 'raw'
  ): {
    type: KeyType;
    algorithm: EncryptionAlgorithm;
    keyData: string;
  } {
    switch (format) {
      case 'raw':
        return {
          type: KeyType.SYMMETRIC,
          algorithm: EncryptionAlgorithm.AES_256_GCM,
          keyData,
        };
      case 'pem':
        return this.parsePemKey(keyData);
      case 'jwk':
        return this.parseJwkKey(keyData);
      default:
        throw new Error(`不支持的格式: ${format}`);
    }
  }

  private parsePemKey(pemData: string): {
    type: KeyType;
    algorithm: EncryptionAlgorithm;
    keyData: string;
  } {
    // 簡化的 PEM Parse
    const _lines = pemData.split('\n');
    const _keyData = lines.slice(1, -2).join('');

    return {
      type: KeyType.SYMMETRIC,
      algorithm: EncryptionAlgorithm.AES_256_GCM,
      keyData,
    };
  }

  private parseJwkKey(jwkData: string): {
    type: KeyType;
    algorithm: EncryptionAlgorithm;
    keyData: string;
  } {
    const _jwk = JSON.parse(jwkData);

    return {
      type: jwk.kty === 'oct' ? KeyType.SYMMETRIC : KeyType.ASYMMETRIC_PRIVATE,
      algorithm: this.jwkAlgToAlgorithm(jwk.alg),
      keyData: jwk.k || jwk.n,
    };
  }

  private jwkAlgToAlgorithm(alg: string): EncryptionAlgorithm {
    switch (alg) {
      case 'A256GCM':
        return EncryptionAlgorithm.AES_256_GCM;
      case 'A256CBC-HS512':
        return EncryptionAlgorithm.AES_256_CBC;
      case 'RSA-OAEP':
        return EncryptionAlgorithm.RSA_OAEP;
      default:
        return EncryptionAlgorithm.AES_256_GCM;
    }
  }
}
