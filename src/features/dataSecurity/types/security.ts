/**
 * Data安全Class型定義
 * Package含Encrypt、Decrypt、Backup、Restore等安全功能的Class型
 */

// Encrypt算法枚舉
export enum EncryptionAlgorithm {
  AES_256_GCM = 'AES-256-GCM',
  AES_256_CBC = 'AES-256-CBC',
  CHACHA20_POLY1305 = 'ChaCha20-Poly1305',
  RSA_OAEP = 'RSA-OAEP',
}

// 哈希算法枚舉
export enum HashAlgorithm {
  SHA256 = 'SHA-256',
  SHA512 = 'SHA-512',
  BLAKE2B = 'BLAKE2b',
  ARGON2 = 'Argon2',
}

// BackupClass型枚舉
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SNAPSHOT = 'snapshot',
}

// BackupStatus枚舉
export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// 安全級別枚舉
export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 密鑰Class型枚舉
export enum KeyType {
  SYMMETRIC = 'symmetric',
  ASYMMETRIC_PUBLIC = 'asymmetric_public',
  ASYMMETRIC_PRIVATE = 'asymmetric_private',
  DERIVED = 'derived',
}

// 密鑰Status枚舉
export enum KeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
}

// Data分Class枚舉
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret',
}

// Encrypt密鑰Interface
export interface EncryptionKey {
  id: string;
  type: KeyType;
  algorithm: EncryptionAlgorithm;
  keyData: string;
  createdAt: Date;
  expiresAt?: Date;
  status: KeyStatus;
  metadata: {
    purpose: string;
    owner: string;
    usage: string[];
    rotationSchedule?: string;
  };
}

// EncryptRequestInterface
export interface EncryptionRequest {
  data: string | ArrayBuffer;
  algorithm: EncryptionAlgorithm;
  keyId?: string;
  additionalData?: string;
  metadata?: {
    classification: DataClassification;
    purpose: string;
    retention?: number;
  };
}

// Encrypt結果Interface
export interface EncryptionResult {
  success: boolean;
  encryptedData?: string;
  iv?: string;
  authTag?: string;
  keyId?: string;
  algorithm: EncryptionAlgorithm;
  metadata?: {
    encryptedAt: Date;
    dataSize: number;
    checksums: {
      original: string;
      encrypted: string;
    };
  };
  error?: string;
}

// DecryptRequestInterface
export interface DecryptionRequest {
  encryptedData: string;
  algorithm: EncryptionAlgorithm;
  keyId?: string;
  iv?: string;
  authTag?: string;
  additionalData?: string;
}

// Decrypt結果Interface
export interface DecryptionResult {
  success: boolean;
  decryptedData?: string | ArrayBuffer;
  metadata?: {
    decryptedAt: Date;
    dataSize: number;
    checksum: string;
    verified: boolean;
  };
  error?: string;
}

// BackupConfigureInterface
export interface BackupConfig {
  id: string;
  name: string;
  type: BackupType;
  schedule: string; // cron expression
  retention: number; // days
  encryption: {
    enabled: boolean;
    algorithm?: EncryptionAlgorithm;
    keyId?: string;
  };
  compression: {
    enabled: boolean;
    algorithm?: string;
    level?: number;
  };
  destination: {
    type: 'local' | 'cloud' | 'network';
    path: string;
    credentials?: {
      accessKey?: string;
      secretKey?: string;
      region?: string;
    };
  };
  filters: {
    include: string[];
    exclude: string[];
  };
  verification: {
    enabled: boolean;
    checksumAlgorithm?: HashAlgorithm;
  };
}

// BackupTaskInterface
export interface BackupTask {
  id: string;
  configId: string;
  type: BackupType;
  status: BackupStatus;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  statistics: {
    totalFiles: number;
    processedFiles: number;
    totalSize: number;
    processedSize: number;
    compressedSize?: number;
    compressionRatio?: number;
    transferSpeed?: number;
  };
  metadata: {
    triggerType: 'manual' | 'scheduled' | 'event';
    previousBackupId?: string;
    checksum?: string;
    encryptionUsed: boolean;
    compressionUsed: boolean;
  };
  errors: {
    timestamp: Date;
    level: 'warning' | 'error' | 'critical';
    message: string;
    details?: unknown;
  }[];
}

// RestoreRequestInterface
export interface RestoreRequest {
  backupId: string;
  destination: string;
  options: {
    overwrite: boolean;
    preservePermissions: boolean;
    restoreMetadata: boolean;
    selectiveRestore?: {
      enabled: boolean;
      patterns: string[];
    };
  };
  decryption?: {
    keyId?: string;
    password?: string;
  };
}

// Restore結果Interface
export interface RestoreResult {
  success: boolean;
  taskId?: string;
  restoredFiles?: number;
  restoredSize?: number;
  duration?: number;
  checksum?: string;
  verified?: boolean;
  errors?: {
    file: string;
    error: string;
  }[];
  error?: string;
}

// 安全審計EventInterface
export interface SecurityAuditEvent {
  id: string;
  timestamp: Date;
  type:
    | 'encryption'
    | 'decryption'
    | 'backup'
    | 'restore'
    | 'key_operation'
    | 'access'
    | 'violation';
  severity: SecurityLevel;
  userId?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'denied';
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    details: unknown;
  };
  riskScore: number; // 0-100
}

// 密鑰Manage器Interface
export interface KeyManager {
  generateKey(
    algorithm: EncryptionAlgorithm,
    metadata?: unknown
  ): Promise<EncryptionKey>;
  storeKey(key: EncryptionKey): Promise<boolean>;
  retrieveKey(keyId: string): Promise<EncryptionKey | null>;
  revokeKey(keyId: string, reason?: string): Promise<boolean>;
  rotateKey(keyId: string): Promise<EncryptionKey>;
  listKeys(filter?: Partial<EncryptionKey>): Promise<EncryptionKey[]>;
  exportKey(keyId: string, format: 'pem' | 'jwk' | 'raw'): Promise<string>;
  importKey(
    keyData: string,
    format: 'pem' | 'jwk' | 'raw',
    metadata?: unknown
  ): Promise<EncryptionKey>;
}

// EncryptServiceInterface
export interface EncryptionService {
  encrypt(request: EncryptionRequest): Promise<EncryptionResult>;
  decrypt(request: DecryptionRequest): Promise<DecryptionResult>;
  hash(data: string | ArrayBuffer, algorithm: HashAlgorithm): Promise<string>;
  verify(
    data: string | ArrayBuffer,
    hash: string,
    algorithm: HashAlgorithm
  ): Promise<boolean>;
  generateRandomBytes(length: number): Promise<ArrayBuffer>;
  deriveKey(
    password: string,
    salt: string,
    iterations: number
  ): Promise<string>;
}

// BackupServiceInterface
export interface BackupService {
  createBackup(config: BackupConfig): Promise<BackupTask>;
  scheduleBackup(config: BackupConfig): Promise<boolean>;
  cancelBackup(taskId: string): Promise<boolean>;
  getBackupStatus(taskId: string): Promise<BackupTask | null>;
  listBackups(filter?: Partial<BackupTask>): Promise<BackupTask[]>;
  deleteBackup(backupId: string): Promise<boolean>;
  restoreBackup(request: RestoreRequest): Promise<RestoreResult>;
  verifyBackup(
    backupId: string
  ): Promise<{ valid: boolean; checksum: string; errors?: string[] }>;
}

// 安全ConfigureInterface
export interface SecurityConfig {
  encryption: {
    defaultAlgorithm: EncryptionAlgorithm;
    keyRotationInterval: number; // days
    forceEncryption: boolean;
    allowedAlgorithms: EncryptionAlgorithm[];
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number; // hours
    maxRetention: number; // days
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
  audit: {
    enabled: boolean;
    logLevel: SecurityLevel;
    retentionPeriod: number; // days
    realTimeAlerts: boolean;
  };
  keyManagement: {
    autoRotation: boolean;
    rotationSchedule: string; // cron
    keyEscrow: boolean;
    multiSigRequired: boolean;
  };
  compliance: {
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    pciCompliant: boolean;
    dataResidency: string[];
  };
}

// 安全StatusInterface
export interface SecurityState {
  // ServiceStatus
  isInitialized: boolean;
  isEncryptionEnabled: boolean;
  isBackupEnabled: boolean;

  // 密鑰Manage
  activeKeys: EncryptionKey[];
  keyRotationSchedule: { [keyId: string]: Date };

  // BackupStatus
  backupConfigs: BackupConfig[];
  activeTasks: BackupTask[];
  completedTasks: BackupTask[];

  // StatisticsInformation
  statistics: {
    totalEncryptions: number;
    totalDecryptions: number;
    totalBackups: number;
    totalRestores: number;
    keyRotations: number;
    securityViolations: number;
  };

  // 審計Log
  auditEvents: SecurityAuditEvent[];

  // Configure
  config: SecurityConfig;

  // ErrorHandle
  error: string | null;
  lastError: {
    message: string;
    timestamp: Date;
    operation?: string;
  } | null;
}

// 安全EventClass型
export type SecurityEventType =
  | 'key_generated'
  | 'key_rotated'
  | 'key_revoked'
  | 'data_encrypted'
  | 'data_decrypted'
  | 'backup_started'
  | 'backup_completed'
  | 'backup_failed'
  | 'restore_started'
  | 'restore_completed'
  | 'restore_failed'
  | 'security_violation'
  | 'unauthorized_access'
  | 'configuration_changed';

// 安全EventInterface
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  data?: unknown;
  metadata?: {
    userId?: string;
    operation?: string;
    resource?: string;
    severity?: SecurityLevel;
  };
}

// Event監聽器Class型
export type SecurityEventListener = (event: SecurityEvent) => void;

// 性能指標Interface
export interface SecurityMetrics {
  encryptionPerformance: {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    throughput: number; // operations per second
    errorRate: number;
  };
  backupPerformance: {
    averageBackupTime: number;
    averageRestoreTime: number;
    compressionRatio: number;
    successRate: number;
  };
  keyManagement: {
    activeKeys: number;
    expiredKeys: number;
    keyRotationCompliance: number; // percentage
  };
  security: {
    violationCount: number;
    riskScore: number; // 0-100
    complianceScore: number; // 0-100
  };
}
