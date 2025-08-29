/**
 * 數據安全自定義 Hook
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

// 數據安全 Hook
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

  // 加密數據
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
        console.error('加密數據失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 解密數據
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
        console.error('解密數據失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 創建備份
  const _createBackupHandler = useCallback(
    async (config: BackupConfig): Promise<any> => {
      try {
        const _result = await (dispatch(createBackup(config)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('創建備份失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 恢復備份
  const _restoreBackupHandler = useCallback(
    async (request: RestoreRequest): Promise<any> => {
      try {
        const _result = await (
          dispatch(restoreBackup(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('恢復備份失敗:', error);
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
        console.error('生成密鑰失敗:', error);
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
        console.error('輪換密鑰失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 快速加密
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
          throw new Error(result.error || '快速加密失敗');
        }

        return result.encryptedData;
      } catch (error) {
        console.error('快速加密失敗:', error);
        throw error;
      }
    },
    [encryptDataHandler]
  );

  // 快速解密
  const _quickDecrypt = useCallback(
    async (encryptedText: string, keyId: string): Promise<string> => {
      try {
        const _result = await decryptDataHandler(encryptedText, keyId);

        if (!result.success || !result.decryptedData) {
          throw new Error(result.error || '快速解密失敗');
        }

        return typeof result.decryptedData === 'string'
          ? result.decryptedData
          : new TextDecoder().decode(result.decryptedData as ArrayBuffer);
      } catch (error) {
        console.error('快速解密失敗:', error);
        throw error;
      }
    },
    [decryptDataHandler]
  );

  // 創建快速備份
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
        console.error('創建快速備份失敗:', error);
        throw error;
      }
    },
    [createBackupHandler]
  );

  // 配置管理
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

  // 監控和管理
  const _refreshMetrics = useCallback(async () => {
    try {
      await (dispatch(fetchSecurityMetrics()) as any).unwrap();
    } catch (error) {
      console.error('刷新指標失敗:', error);
    }
  }, [dispatch]);

  const _refreshState = useCallback(async () => {
    try {
      await (dispatch(fetchSecurityState()) as any).unwrap();
    } catch (error) {
      console.error('刷新狀態失敗:', error);
    }
  }, [dispatch]);

  // 初始化
  const _initialize = useCallback(
    async (config?: Partial<SecurityConfig>) => {
      try {
        await (dispatch(initializeDataSecurity(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化數據安全服務失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 自動初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    // 狀態
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

    // 配置管理
    updateConfig,
    enableEncryption,
    disableEncryption,
    enableBackup,
    disableBackup,

    // 監控和管理
    refreshMetrics,
    refreshState,
    initialize,
  };
};

/**
 * 簡化的加密 Hook（僅用於加密/解密操作）
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
 * 備份管理 Hook
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
 * 安全監控 Hook
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
