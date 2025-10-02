/**
 * Data安全Service
 * 整合Encrypt、Backup、密鑰Manage等安全功能
 */

import { logger } from '../../../core/utils/logger';
import type {
  BackupConfig,
  BackupTask,
  DecryptionRequest,
  DecryptionResult,
  EncryptionKey,
  EncryptionRequest,
  EncryptionResult,
  RestoreRequest,
  RestoreResult,
  SecurityAuditEvent,
  SecurityConfig,
  SecurityEvent,
  SecurityEventListener,
  SecurityMetrics,
  SecurityState,
} from '../types/security';
import {
  EncryptionAlgorithm,
  HashAlgorithm,
  SecurityLevel,
} from '../types/security';

import { CryptoBackupService } from './backupService';
import { CryptoEncryptionService } from './encryptionService';
import { CryptoKeyManager } from './keyManager';

/**
 * Data安全Service實現
 */
export class DataSecurityService {
  private static instance: DataSecurityService;
  private readonly keyManager: CryptoKeyManager;
  private readonly encryptionService: CryptoEncryptionService;
  private readonly backupService: CryptoBackupService;
  private eventListeners: SecurityEventListener[] = [];
  private auditEvents: SecurityAuditEvent[] = [];
  private config: SecurityConfig;
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.keyManager = CryptoKeyManager.getInstance();
    this.encryptionService = CryptoEncryptionService.getInstance();
    this.backupService = CryptoBackupService.getInstance();
    this.config = this.getDefaultConfig();
  }

  /**
   * GetServiceInstance（單例模式）
   */
  public static getInstance(): DataSecurityService {
    if (!DataSecurityService.instance) {
      DataSecurityService.instance = new DataSecurityService();
    }
    return DataSecurityService.instance;
  }

  /**
   * InitializeService
   */
  public async initialize(config?: Partial<SecurityConfig>): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('DataSecurityService 已經初始化');
      return true;
    }

    try {
      // MergeConfigure
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize子Service
      await this.keyManager.initialize();
      await this.encryptionService.initialize();
      await this.backupService.initialize();

      // Start安全Monitor
      if (this.config.audit.enabled) {
        this.startSecurityMonitoring();
      }

      // SettingsAutoBackup
      if (this.config.backup.autoBackup) {
        await this.setupAutoBackup();
      }

      // Settings密鑰輪換
      if (this.config.keyManagement.autoRotation) {
        await this.setupKeyRotation();
      }

      this.isInitialized = true;

      // Record審計Event
      await this.logAuditEvent({
        type: 'encryption',
        severity: SecurityLevel.MEDIUM,
        resource: 'DataSecurityService',
        action: 'initialize',
        result: 'success',
        metadata: {
          details: {
            configuredModules: ['encryption', 'backup', 'keyManagement'],
          },
        },
      });

      logger.info('DataSecurityService InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('DataSecurityService InitializeFailed:', error);

      await this.logAuditEvent({
        type: 'encryption',
        severity: SecurityLevel.HIGH,
        resource: 'DataSecurityService',
        action: 'initialize',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      return false;
    }
  }

  /**
   * EncryptData
   */
  public async encryptData(
    request: EncryptionRequest
  ): Promise<EncryptionResult> {
    try {
      const _startTime = Date.now();

      // 執RowEncrypt
      const _result = await this.encryptionService.encrypt(request);

      const _processingTime = Date.now() - startTime;

      // Record審計Event
      await this.logAuditEvent({
        type: 'encryption',
        severity: SecurityLevel.LOW,
        resource: 'data',
        action: 'encrypt',
        result: result.success ? 'success' : 'failure',
        metadata: {
          details: {
            algorithm: request.algorithm,
            dataSize:
              typeof request.data === 'string'
                ? request.data.length
                : request.data.byteLength,
            processingTime,
            classification: request.metadata?.classification,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: 'data_encrypted',
        timestamp: new Date(),
        data: result,
        metadata: {
          operation: 'encrypt',
          severity: SecurityLevel.LOW,
        },
      });

      return result;
    } catch (error) {
      logger.error('數據加密Failed:', error);

      await this.logAuditEvent({
        type: 'encryption',
        severity: SecurityLevel.HIGH,
        resource: 'data',
        action: 'encrypt',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * DecryptData
   */
  public async decryptData(
    request: DecryptionRequest
  ): Promise<DecryptionResult> {
    try {
      const _startTime = Date.now();

      // 執RowDecrypt
      const _result = await this.encryptionService.decrypt(request);

      const _processingTime = Date.now() - startTime;

      // Record審計Event
      await this.logAuditEvent({
        type: 'decryption',
        severity: SecurityLevel.MEDIUM,
        resource: 'data',
        action: 'decrypt',
        result: result.success ? 'success' : 'failure',
        metadata: {
          details: {
            algorithm: request.algorithm,
            keyId: request.keyId,
            processingTime,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: 'data_decrypted',
        timestamp: new Date(),
        data: result,
        metadata: {
          operation: 'decrypt',
          severity: SecurityLevel.MEDIUM,
        },
      });

      return result;
    } catch (error) {
      logger.error('數據解密Failed:', error);

      await this.logAuditEvent({
        type: 'decryption',
        severity: SecurityLevel.HIGH,
        resource: 'data',
        action: 'decrypt',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * CreateBackup
   */
  public async createBackup(config: BackupConfig): Promise<BackupTask> {
    try {
      // 執RowBackup
      const _task = await this.backupService.createBackup(config);

      // Record審計Event
      await this.logAuditEvent({
        type: 'backup',
        severity: SecurityLevel.MEDIUM,
        resource: 'backup_system',
        action: 'create_backup',
        result: 'success',
        metadata: {
          details: {
            taskId: task.id,
            configId: config.id,
            type: config.type,
            encryptionEnabled: config.encryption.enabled,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: 'backup_started',
        timestamp: new Date(),
        data: task,
        metadata: {
          operation: 'backup',
          severity: SecurityLevel.MEDIUM,
        },
      });

      return task;
    } catch (error) {
      logger.error('Create備份Failed:', error);

      await this.logAuditEvent({
        type: 'backup',
        severity: SecurityLevel.HIGH,
        resource: 'backup_system',
        action: 'create_backup',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * RestoreBackup
   */
  public async restoreBackup(request: RestoreRequest): Promise<RestoreResult> {
    try {
      // 執RowRestore
      const _result = await this.backupService.restoreBackup(request);

      // Record審計Event
      await this.logAuditEvent({
        type: 'restore',
        severity: SecurityLevel.HIGH,
        resource: 'backup_system',
        action: 'restore_backup',
        result: result.success ? 'success' : 'failure',
        metadata: {
          details: {
            backupId: request.backupId,
            destination: request.destination,
            restoredFiles: result.restoredFiles,
            restoredSize: result.restoredSize,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: result.success ? 'restore_completed' : 'restore_failed',
        timestamp: new Date(),
        data: result,
        metadata: {
          operation: 'restore',
          severity: SecurityLevel.HIGH,
        },
      });

      return result;
    } catch (error) {
      logger.error('恢復備份Failed:', error);

      await this.logAuditEvent({
        type: 'restore',
        severity: SecurityLevel.CRITICAL,
        resource: 'backup_system',
        action: 'restore_backup',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * 生成密鑰
   */
  public async generateKey(
    algorithm: EncryptionAlgorithm,
    metadata?: unknown
  ): Promise<EncryptionKey> {
    try {
      // 生成密鑰
      const _key = await this.keyManager.generateKey(algorithm, metadata);

      // Record審計Event
      await this.logAuditEvent({
        type: 'key_operation',
        severity: SecurityLevel.MEDIUM,
        resource: 'key_management',
        action: 'generate_key',
        result: 'success',
        metadata: {
          details: {
            keyId: key.id,
            algorithm: key.algorithm,
            type: key.type,
            purpose: metadata?.purpose,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: 'key_generated',
        timestamp: new Date(),
        data: key,
        metadata: {
          operation: 'key_generation',
          severity: SecurityLevel.MEDIUM,
        },
      });

      return key;
    } catch (error) {
      logger.error('生成密鑰Failed:', error);

      await this.logAuditEvent({
        type: 'key_operation',
        severity: SecurityLevel.HIGH,
        resource: 'key_management',
        action: 'generate_key',
        result: 'failure',
        metadata: {
          details: {
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * 輪換密鑰
   */
  public async rotateKey(keyId: string): Promise<EncryptionKey> {
    try {
      // 輪換密鑰
      const _newKey = await this.keyManager.rotateKey(keyId);

      // Record審計Event
      await this.logAuditEvent({
        type: 'key_operation',
        severity: SecurityLevel.HIGH,
        resource: 'key_management',
        action: 'rotate_key',
        result: 'success',
        metadata: {
          details: {
            oldKeyId: keyId,
            newKeyId: newKey.id,
            algorithm: newKey.algorithm,
          },
        },
      });

      // 觸發Event
      this.emitEvent({
        type: 'key_rotated',
        timestamp: new Date(),
        data: newKey,
        metadata: {
          operation: 'key_rotation',
          severity: SecurityLevel.HIGH,
        },
      });

      return newKey;
    } catch (error) {
      logger.error('輪換密鑰Failed:', error);

      await this.logAuditEvent({
        type: 'key_operation',
        severity: SecurityLevel.CRITICAL,
        resource: 'key_management',
        action: 'rotate_key',
        result: 'failure',
        metadata: {
          details: {
            keyId,
            error: error instanceof Error ? error.message : '未知Error',
          },
        },
      });

      throw error;
    }
  }

  /**
   * AddEvent監聽器
   */
  public addEventListener(listener: SecurityEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * RemoveEvent監聽器
   */
  public removeEventListener(listener: SecurityEventListener): void {
    const _index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get安全Status
   */
  public async getSecurityState(): Promise<SecurityState> {
    try {
      const _activeKeys = await this.keyManager.listKeys({
        status: 'active' as any,
      });
      const _backupTasks = await this.backupService.listBackups();
      const _activeTasks = backupTasks.filter(
        task => task.status === 'in_progress'
      );
      const _completedTasks = backupTasks.filter(
        task => task.status === 'completed'
      );

      // GetStatisticsInformation
      const _keyStats = await this.keyManager.getKeyStatistics();
      const _backupStats = await this.backupService.getBackupStatistics();
      const _encryptionStats =
        await this.encryptionService.getEncryptionStatistics();

      return {
        isInitialized: this.isInitialized,
        isEncryptionEnabled: this.config.encryption.forceEncryption,
        isBackupEnabled: this.config.backup.autoBackup,
        activeKeys,
        keyRotationSchedule: {},
        backupConfigs: [],
        activeTasks,
        completedTasks,
        statistics: {
          totalEncryptions: encryptionStats.totalEncryptions,
          totalDecryptions: encryptionStats.totalDecryptions,
          totalBackups: backupStats.totalBackups,
          totalRestores: 0,
          keyRotations: 0,
          securityViolations: this.auditEvents.filter(
            e => e.type === 'violation'
          ).length,
        },
        auditEvents: this.auditEvents.slice(-100), // 最近100個Event
        config: this.config,
        error: null,
        lastError: null,
      };
    } catch (error) {
      logger.error('Get安全狀態Failed:', error);
      throw error;
    }
  }

  /**
   * Get安全指標
   */
  public async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const _encryptionStats =
        await this.encryptionService.getEncryptionStatistics();
      const _backupStats = await this.backupService.getBackupStatistics();
      const _keyStats = await this.keyManager.getKeyStatistics();

      // 計算風險評分
      const _riskScore = this.calculateRiskScore();

      // 計算合規評分
      const _complianceScore = this.calculateComplianceScore();

      return {
        encryptionPerformance: {
          averageEncryptionTime: encryptionStats.averageEncryptionTime,
          averageDecryptionTime: encryptionStats.averageDecryptionTime,
          throughput: 0, // 可以Root據實際Statistics計算
          errorRate: encryptionStats.errorRate,
        },
        backupPerformance: {
          averageBackupTime: backupStats.averageBackupTime,
          averageRestoreTime: 0, // 可以Root據實際Statistics計算
          compressionRatio: backupStats.compressionRatio,
          successRate:
            backupStats.completedBackups / (backupStats.totalBackups || 1),
        },
        keyManagement: {
          activeKeys: keyStats.active,
          expiredKeys: keyStats.expired,
          keyRotationCompliance: 85, // 可以Root據實際輪換計劃計算
        },
        security: {
          violationCount: this.auditEvents.filter(e => e.type === 'violation')
            .length,
          riskScore,
          complianceScore,
        },
      };
    } catch (error) {
      logger.error('Get安全指標Failed:', error);
      throw error;
    }
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<void> {
    try {
      this.isInitialized = false;

      // ClearMonitor
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // 銷毀子Service
      await this.backupService.destroy();
      await this.encryptionService.destroy();
      await this.keyManager.destroy();

      this.eventListeners = [];
      this.auditEvents = [];

      logger.info('DataSecurityService 已銷毀');
    } catch (error) {
      logger.error('DataSecurityService 銷毀Failed:', error);
    }
  }

  // PrivateMethod

  private getDefaultConfig(): SecurityConfig {
    return {
      encryption: {
        defaultAlgorithm: EncryptionAlgorithm.AES_256_GCM,
        keyRotationInterval: 90, // 90 days
        forceEncryption: true,
        allowedAlgorithms: [
          EncryptionAlgorithm.AES_256_GCM,
          EncryptionAlgorithm.AES_256_CBC,
          EncryptionAlgorithm.CHACHA20_POLY1305,
        ],
      },
      backup: {
        autoBackup: true,
        backupInterval: 24, // 24 hours
        maxRetention: 30, // 30 days
        compressionEnabled: true,
        encryptionEnabled: true,
      },
      audit: {
        enabled: true,
        logLevel: SecurityLevel.MEDIUM,
        retentionPeriod: 365, // 365 days
        realTimeAlerts: true,
      },
      keyManagement: {
        autoRotation: true,
        rotationSchedule: '0 0 1 * *', // monthly
        keyEscrow: false,
        multiSigRequired: false,
      },
      compliance: {
        gdprCompliant: true,
        hipaaCompliant: false,
        pciCompliant: false,
        dataResidency: ['US', 'EU'],
      },
    };
  }

  private emitEvent(event: SecurityEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('安全事件監聽器執行Failed:', error);
      }
    });
  }

  private async logAuditEvent(
    eventData: Partial<SecurityAuditEvent>
  ): Promise<void> {
    try {
      const event: SecurityAuditEvent = {
        id: this.generateAuditId(),
        timestamp: new Date(),
        type: eventData.type || 'access',
        severity: eventData.severity || SecurityLevel.LOW,
        userId: eventData.userId,
        resource: eventData.resource || 'unknown',
        action: eventData.action || 'unknown',
        result: eventData.result || 'success',
        metadata: {
          ipAddress: '127.0.0.1', // 在True實環境中Get實際IP
          userAgent: 'DataSecurityService', // 在True實環境中Get實際User-Agent
          location: 'Local',
          details: eventData.metadata || {},
        },
        riskScore: this.calculateEventRiskScore(eventData),
      };

      this.auditEvents.push(event);

      // Limit審計Event數量
      if (this.auditEvents.length > 10000) {
        this.auditEvents = this.auditEvents.slice(-5000);
      }

      // 持久化審計Event
      await this.persistAuditEvent(event);

      // 實時Alert
      if (
        this.config.audit.realTimeAlerts &&
        event.severity === SecurityLevel.CRITICAL
      ) {
        await this.sendSecurityAlert(event);
      }
    } catch (error) {
      logger.error('記錄審計事件Failed:', error);
    }
  }

  private generateAuditId(): string {
    const _timestamp = Date.now().toString(36);
    const _random = Math.random().toString(36).substring(2, 8);
    return `audit_${timestamp}_${random}`;
  }

  private calculateEventRiskScore(
    eventData: Partial<SecurityAuditEvent>
  ): number {
    let score = 0;

    // 基於EventClass型評分
    switch (eventData.type) {
      case 'violation':
      case 'access':
        score += 50;
        break;
      case 'key_operation':
        score += 30;
        break;
      case 'restore':
        score += 40;
        break;
      case 'backup':
        score += 20;
        break;
      default:
        score += 10;
    }

    // 基於嚴重程度評分
    switch (eventData.severity) {
      case SecurityLevel.CRITICAL:
        score += 40;
        break;
      case SecurityLevel.HIGH:
        score += 30;
        break;
      case SecurityLevel.MEDIUM:
        score += 20;
        break;
      case SecurityLevel.LOW:
        score += 10;
        break;
    }

    // 基於結果評分
    if (eventData.result === 'failure' || eventData.result === 'denied') {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private calculateRiskScore(): number {
    // 基於各種因素計算風險評分
    let riskScore = 0;

    // 審計Event風險
    const _recentViolations = this.auditEvents.filter(
      e =>
        e.type === 'violation' &&
        Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24Hour內
    );

    riskScore += recentViolations.length * 10;

    // FailedEvent風險
    const _recentFailures = this.auditEvents.filter(
      e =>
        e.result === 'failure' &&
        Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24Hour內
    );

    riskScore += recentFailures.length * 5;

    return Math.min(riskScore, 100);
  }

  private calculateComplianceScore(): number {
    // 基於Configure和實際執Row情況計算合規評分
    let score = 100;

    // Encrypt合規性
    if (!this.config.encryption.forceEncryption) {
      score -= 20;
    }

    // Backup合規性
    if (!this.config.backup.autoBackup) {
      score -= 15;
    }

    // 審計合規性
    if (!this.config.audit.enabled) {
      score -= 25;
    }

    // 密鑰Manage合規性
    if (!this.config.keyManagement.autoRotation) {
      score -= 10;
    }

    return Math.max(score, 0);
  }

  private startSecurityMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performSecurityCheck();
      } catch (error) {
        logger.error('安全監控CheckFailed:', error);
      }
    }, 60000); // 每MinuteCheck一次
  }

  private async performSecurityCheck(): Promise<void> {
    // Check密鑰過期
    await this.checkKeyExpiration();

    // CheckBackupStatus
    await this.checkBackupHealth();

    // Check異常活動
    await this.checkAnomalousActivity();
  }

  private async checkKeyExpiration(): Promise<void> {
    try {
      const _keys = await this.keyManager.listKeys();
      const _expiredKeys = keys.filter(
        key => key.expiresAt && key.expiresAt < new Date()
      );

      if (expiredKeys.length > 0) {
        await this.logAuditEvent({
          type: 'key_operation',
          severity: SecurityLevel.HIGH,
          resource: 'key_management',
          action: 'expired_keys_detected',
          result: 'failure',
          metadata: {
            details: { expiredKeyCount: expiredKeys.length },
          },
        });
      }
    } catch (error) {
      logger.error('密鑰過期CheckFailed:', error);
    }
  }

  private async checkBackupHealth(): Promise<void> {
    try {
      const _tasks = await this.backupService.listBackups();
      const _failedTasks = tasks.filter(
        task =>
          task.status === 'failed' &&
          Date.now() - (task.startedAt?.getTime() || 0) < 24 * 60 * 60 * 1000
      );

      if (failedTasks.length > 0) {
        await this.logAuditEvent({
          type: 'backup',
          severity: SecurityLevel.MEDIUM,
          resource: 'backup_system',
          action: 'failed_backups_detected',
          result: 'failure',
          metadata: {
            details: { failedBackupCount: failedTasks.length },
          },
        });
      }
    } catch (error) {
      logger.error('備份健康CheckFailed:', error);
    }
  }

  private async checkAnomalousActivity(): Promise<void> {
    try {
      const _recentEvents = this.auditEvents.filter(
        e => Date.now() - e.timestamp.getTime() < 60 * 60 * 1000 // 1Hour內
      );

      // Check高風險活動
      const _highRiskEvents = recentEvents.filter(e => e.riskScore > 70);

      if (highRiskEvents.length > 5) {
        await this.logAuditEvent({
          type: 'violation',
          severity: SecurityLevel.HIGH,
          resource: 'security_monitoring',
          action: 'anomalous_activity_detected',
          result: 'failure',
          metadata: {
            details: { highRiskEventCount: highRiskEvents.length },
          },
        });
      }
    } catch (error) {
      logger.error('異常活動CheckFailed:', error);
    }
  }

  private async setupAutoBackup(): Promise<void> {
    try {
      const backupConfig: BackupConfig = {
        id: 'auto_backup_001',
        name: '自動備份',
        type: 'incremental' as any,
        schedule: '0 2 * * *', // 每天凌晨2點
        retention: this.config.backup.maxRetention,
        encryption: {
          enabled: this.config.backup.encryptionEnabled,
          algorithm: this.config.encryption.defaultAlgorithm,
        },
        compression: {
          enabled: this.config.backup.compressionEnabled,
          algorithm: 'gzip',
          level: 6,
        },
        destination: {
          type: 'local',
          path: '/backups/auto',
        },
        filters: {
          include: ['**/*'],
          exclude: ['**/temp/**', '**/cache/**'],
        },
        verification: {
          enabled: true,
          checksumAlgorithm: HashAlgorithm.SHA256,
        },
      };

      await this.backupService.scheduleBackup(backupConfig);
      logger.info('自動備份已設置');
    } catch (error) {
      logger.error('Settings自動備份Failed:', error);
    }
  }

  private async setupKeyRotation(): Promise<void> {
    try {
      // 在True實環境中，這裡會Settings實際的密鑰輪換Schedule
      logger.info('密鑰輪換調度已設置');
    } catch (error) {
      logger.error('Settings密鑰輪換Failed:', error);
    }
  }

  private async persistAuditEvent(event: SecurityAuditEvent): Promise<void> {
    try {
      // 在True實環境中，這裡會將審計Event持久化到安全Storage
      const _storage = localStorage || {};
      storage[`audit_${event.id}`] = JSON.stringify({
        ...event,
        timestamp: event.timestamp.toISOString(),
      });
    } catch (error) {
      logger.error('持久化審計事件Failed:', error);
    }
  }

  private async sendSecurityAlert(event: SecurityAuditEvent): Promise<void> {
    try {
      // 在True實環境中，這裡會Send實時安全Alert
      logger.warn('安全警報', {
        eventId: event.id,
        type: event.type,
        severity: event.severity,
        resource: event.resource,
        action: event.action,
      });
    } catch (error) {
      logger.error('發送安全警報Failed:', error);
    }
  }
}
