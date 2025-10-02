/**
 * Data安全Custom Hook
 * 提供簡化的安全功能 API
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  createBackup,
  decryptData,
  encryptData,
  fetchSecurityMetrics,
  fetchSecurityState,
  generateKey,
  initializeDataSecurity,
  restoreBackup,
  rotateKey,
  selectActiveKeys,
  selectAuditEvents,
  selectBackupTasks,
  selectCurrentOperation,
  selectDataSecurityState,
  selectError,
  selectIsBackupEnabled,
  selectIsEncryptionEnabled,
  selectIsInitialized,
  selectLastError,
  selectLastResults,
  selectOperationStatus,
  selectSecurityConfig,
  selectSecurityHealth,
  selectSecurityMetrics,
  selectSecurityStatistics,
  setBackupEnabled,
  setEncryptionEnabled,
  setSecurityConfig,
} from '../slices/dataSecuritySlice';
import type {
  BackupConfig,
  DecryptionRequest,
  EncryptionRequest,
  RestoreRequest,
  SecurityConfig,
} from '../types/security';
import {
  BackupType,
  DataClassification,
  EncryptionAlgorithm,
} from '../types/security';

// Data安全 Hook
export const _useDataSecurity = () => {
  const _dispatch = useAppDispatch();
  const _state = useSelector(selectDataSecurityState);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isEncryptionEnabled = useSelector(selectIsEncryptionEnabled);
  const _isBackupEnabled = useSelector(selectIsBackupEnabled);
  const _activeKeys = useSelector(selectActiveKeys);
  const _backupTasks = useSelector(selectBackupTasks);
  const _metrics = useSelector(selectSecurityMetrics);
  const _auditEvents = useSelector(selectAuditEvents);
  const _statistics = useSelector(selectSecurityStatistics);
  const _currentOperation = useSelector(selectCurrentOperation);
  const _lastResults = useSelector(selectLastResults);
  const _error = useSelector(selectError);
  const _lastError = useSelector(selectLastError);
  const _config = useSelector(selectSecurityConfig);
  const _health = useSelector(selectSecurityHealth);
  const _operationStatus = useSelector(selectOperationStatus);

  // EncryptData
  const _encryptDataHandler = useCallback(
    async (
      data: string | ArrayBuffer,
      options?: Partial<EncryptionRequest>
    ): Promise<any> => {
      try {
        const request: EncryptionRequest = {
          data,
          algorithm: options?.algorithm || EncryptionAlgorithm.AES_256_GCM,
          keyId: options?.keyId,
          additionalData: options?.additionalData,
          metadata: options?.metadata,
        };

        const _result = await (dispatch(encryptData(request)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('加密數據Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // DecryptData
  const _decryptDataHandler = useCallback(
    async (
      encryptedData: string,
      keyId: string,
      options?: Partial<DecryptionRequest>
    ): Promise<any> => {
      try {
        const request: DecryptionRequest = {
          encryptedData,
          algorithm: options?.algorithm || EncryptionAlgorithm.AES_256_GCM,
          keyId,
          iv: options?.iv,
          authTag: options?.authTag,
          additionalData: options?.additionalData,
        };

        const _result = await (dispatch(decryptData(request)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('解密數據Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // CreateBackup
  const _createBackupHandler = useCallback(
    async (config: BackupConfig): Promise<any> => {
      try {
        const _result = await (dispatch(createBackup(config)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('Create備份Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // RestoreBackup
  const _restoreBackupHandler = useCallback(
    async (request: RestoreRequest): Promise<any> => {
      try {
        const _result = await (
          dispatch(restoreBackup(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('恢復備份Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 生成密鑰
  const _generateKeyHandler = useCallback(
    async (
      algorithm: EncryptionAlgorithm,
      metadata?: unknown
    ): Promise<any> => {
      try {
        const _result = await (
          dispatch(generateKey({ algorithm, metadata })) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('生成密鑰Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 輪換密鑰
  const _rotateKeyHandler = useCallback(
    async (keyId: string): Promise<any> => {
      try {
        const _result = await (dispatch(rotateKey(keyId)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('輪換密鑰Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 快速Encrypt
  const _quickEncrypt = useCallback(
    async (
      text: string,
      classification: DataClassification = DataClassification.INTERNAL
    ): Promise<string> => {
      try {
        const _result = await encryptDataHandler(text, {
          metadata: { classification, purpose: 'quick_encryption' },
        });

        if (!result.success || !result.encryptedData) {
          throw new Error(result.error || '快速加密Failed');
        }

        return result.encryptedData;
      } catch (error) {
        console.error('快速加密Failed:', error);
        throw error;
      }
    },
    [encryptDataHandler]
  );

  // 快速Decrypt
  const _quickDecrypt = useCallback(
    async (encryptedText: string, keyId: string): Promise<string> => {
      try {
        const _result = await decryptDataHandler(encryptedText, keyId);

        if (!result.success || !result.decryptedData) {
          throw new Error(result.error || '快速解密Failed');
        }

        return typeof result.decryptedData === 'string'
          ? result.decryptedData
          : new TextDecoder().decode(result.decryptedData as ArrayBuffer);
      } catch (error) {
        console.error('快速解密Failed:', error);
        throw error;
      }
    },
    [decryptDataHandler]
  );

  // Create快速Backup
  const _createQuickBackup = useCallback(
    async (name: string) => {
      try {
        const backupConfig: BackupConfig = {
          id: `quick_backup_${Date.now()}`,
          name,
          type: BackupType.FULL,
          schedule: '',
          retention: 7, // 7 days
          encryption: {
            enabled: true,
            algorithm: EncryptionAlgorithm.AES_256_GCM,
          },
          compression: {
            enabled: true,
            algorithm: 'gzip',
            level: 6,
          },
          destination: {
            type: 'local',
            path: `/backups/${name}_${Date.now()}`,
          },
          filters: {
            include: ['**/*'],
            exclude: ['**/temp/**', '**/cache/**'],
          },
          verification: {
            enabled: true,
            checksumAlgorithm: 'SHA256' as any,
          },
        };

        const _result = await createBackupHandler(backupConfig);
        return result;
      } catch (error) {
        console.error('Create快速BackupFailed:', error);
        throw error;
      }
    },
    [createBackupHandler]
  );

  // ConfigureManage
  const _updateConfig = useCallback(
    (config: Partial<SecurityConfig>) => {
      dispatch(setSecurityConfig(config));
    },
    [dispatch]
  );

  const _enableEncryption = useCallback(() => {
    dispatch(setEncryptionEnabled(true));
  }, [dispatch]);

  const _disableEncryption = useCallback(() => {
    dispatch(setEncryptionEnabled(false));
  }, [dispatch]);

  const _enableBackup = useCallback(() => {
    dispatch(setBackupEnabled(true));
  }, [dispatch]);

  const _disableBackup = useCallback(() => {
    dispatch(setBackupEnabled(false));
  }, [dispatch]);

  // Monitor和Manage
  const _refreshMetrics = useCallback(async () => {
    try {
      await (dispatch(fetchSecurityMetrics()) as any).unwrap();
    } catch (error) {
      console.error('Refresh指標Failed:', error);
    }
  }, [dispatch]);

  const _refreshState = useCallback(async () => {
    try {
      await (dispatch(fetchSecurityState()) as any).unwrap();
    } catch (error) {
      console.error('RefreshStatusFailed:', error);
    }
  }, [dispatch]);

  // Initialize
  const _initialize = useCallback(
    async (config?: Partial<SecurityConfig>) => {
      try {
        await (dispatch(initializeDataSecurity(config)) as any).unwrap();
      } catch (error) {
        console.error('InitializeData安全ServiceFailed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    // Status
    state,
    isInitialized,
    isEncryptionEnabled,
    isBackupEnabled,
    activeKeys,
    backupTasks,
    metrics,
    auditEvents,
    statistics,
    currentOperation,
    lastResults,
    error,
    lastError,
    config,
    health,
    operationStatus,

    // 核心功能
    encryptData: encryptDataHandler,
    decryptData: decryptDataHandler,
    createBackup: createBackupHandler,
    restoreBackup: restoreBackupHandler,
    generateKey: generateKeyHandler,
    rotateKey: rotateKeyHandler,

    // 便捷功能
    quickEncrypt,
    quickDecrypt,
    createQuickBackup,

    // ConfigureManage
    updateConfig,
    enableEncryption,
    disableEncryption,
    enableBackup,
    disableBackup,

    // Monitor和Manage
    refreshMetrics,
    refreshState,
    initialize,
  };
};

/**
 * 簡化的Encrypt Hook（僅用於Encrypt/DecryptOperation）
 */
export const _useEncryption = () => {
  const {
    isInitialized,
    isEncryptionEnabled,
    operationStatus,
    quickEncrypt,
    quickDecrypt,
    encryptData,
    decryptData,
    generateKey,
    activeKeys,
    error,
  } = useDataSecurity();

  return {
    isInitialized,
    isEncryptionEnabled,
    isOperating:
      operationStatus.details.isEncrypting ||
      operationStatus.details.isDecrypting,
    quickEncrypt,
    quickDecrypt,
    encryptData,
    decryptData,
    generateKey,
    activeKeys,
    error,
  };
};

/**
 * BackupManage Hook
 */
export const _useBackup = () => {
  const {
    isInitialized,
    isBackupEnabled,
    operationStatus,
    backupTasks,
    createBackup,
    restoreBackup,
    createQuickBackup,
    error,
  } = useDataSecurity();

  return {
    isInitialized,
    isBackupEnabled,
    isOperating:
      operationStatus.details.isBackingUp ||
      operationStatus.details.isRestoring,
    backupTasks,
    createBackup,
    restoreBackup,
    createQuickBackup,
    error,
  };
};

/**
 * 安全Monitor Hook
 */
export const _useSecurityMonitoring = () => {
  const { health, metrics, auditEvents, statistics, refreshMetrics } =
    useDataSecurity();

  const _recentViolations = useMemo(() => {
    const _oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return auditEvents.filter(
      event =>
        event.type === 'violation' &&
        new Date(event.timestamp).getTime() > oneDayAgo
    );
  }, [auditEvents]);

  return {
    securityHealth: health,
    metrics,
    auditEvents,
    statistics,
    recentViolations,
    refreshMetrics,
  };
};
