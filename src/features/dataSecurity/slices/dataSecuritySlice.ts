/**
 * 數據安全 Redux Slice
 * 管理安全狀態、加密、備份等功能
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DataSecurityService } from '../services/dataSecurityService';
import type {
  BackupConfig,
  BackupTask,
  DecryptionRequest,
  DecryptionResult,
  EncryptionRequest,
  EncryptionResult,
  RestoreRequest,
  RestoreResult,
  SecurityAuditEvent,
  SecurityConfig,
  SecurityMetrics,
  SecurityState,
} from '../types/security';
import { EncryptionAlgorithm } from '../types/security';

// Redux 狀態接口（擴展原有的 SecurityState）
export interface DataSecurityReduxState extends SecurityState {
  // 操作狀態
  isEncrypting: boolean;
  isDecrypting: boolean;
  isBackingUp: boolean;
  isRestoring: boolean;
  isGeneratingKey: boolean;

  // 當前操作
  currentOperation: string | null;
  operationProgress: number;

  // 最近結果
  lastEncryptionResult: EncryptionResult | null;
  lastDecryptionResult: DecryptionResult | null;
  lastBackupTask: BackupTask | null;
  lastRestoreResult: RestoreResult | null;

  // 性能指標
  metrics: SecurityMetrics | null;
}

// 初始狀態
const initialState: DataSecurityReduxState = {
  // 繼承 SecurityState 的字段
  isInitialized: false,
  isEncryptionEnabled: false,
  isBackupEnabled: false,
  activeKeys: [],
  keyRotationSchedule: {},
  backupConfigs: [],
  activeTasks: [],
  completedTasks: [],
  statistics: {
    totalEncryptions: 0,
    totalDecryptions: 0,
    totalBackups: 0,
    totalRestores: 0,
    keyRotations: 0,
    securityViolations: 0,
  },
  auditEvents: [],
  config: {
    encryption: {
      defaultAlgorithm: EncryptionAlgorithm.AES_256_GCM,
      keyRotationInterval: 90,
      forceEncryption: true,
      allowedAlgorithms: [EncryptionAlgorithm.AES_256_GCM],
    },
    backup: {
      autoBackup: true,
      backupInterval: 24,
      maxRetention: 30,
      compressionEnabled: true,
      encryptionEnabled: true,
    },
    audit: {
      enabled: true,
      logLevel: 'medium' as any,
      retentionPeriod: 365,
      realTimeAlerts: true,
    },
    keyManagement: {
      autoRotation: true,
      rotationSchedule: '0 0 1 * *',
      keyEscrow: false,
      multiSigRequired: false,
    },
    compliance: {
      gdprCompliant: true,
      hipaaCompliant: false,
      pciCompliant: false,
      dataResidency: ['US', 'EU'],
    },
  },
  error: null,
  lastError: null,

  // Redux 特有字段
  isEncrypting: false,
  isDecrypting: false,
  isBackingUp: false,
  isRestoring: false,
  isGeneratingKey: false,
  currentOperation: null,
  operationProgress: 0,
  lastEncryptionResult: null,
  lastDecryptionResult: null,
  lastBackupTask: null,
  lastRestoreResult: null,
  metrics: null,
};

// 異步 Thunk Actions

/**
 * 初始化數據安全服務
 */
export const _initializeDataSecurity = createAsyncThunk(
  'dataSecurity/initialize',
  async (config?: Partial<SecurityConfig>) => {
    const _service = DataSecurityService.getInstance();
    const _success = await service.initialize(config);

    if (!success) {
      throw new Error('數據安全服務初始化失敗');
    }

    const _state = await service.getSecurityState();
    return { success, state };
  }
);

/**
 * 加密數據
 */
export const _encryptData = createAsyncThunk(
  'dataSecurity/encryptData',
  async (request: EncryptionRequest, { rejectWithValue }) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _result = await service.encryptData(request);
      return result;
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '加密失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 解密數據
 */
export const _decryptData = createAsyncThunk(
  'dataSecurity/decryptData',
  async (request: DecryptionRequest, { rejectWithValue }) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _result = await service.decryptData(request);
      return result;
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '解密失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 創建備份
 */
export const _createBackup = createAsyncThunk(
  'dataSecurity/createBackup',
  async (config: BackupConfig, { rejectWithValue }) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _task = await service.createBackup(config);
      return task;
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '創建備份失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 恢復備份
 */
export const _restoreBackup = createAsyncThunk(
  'dataSecurity/restoreBackup',
  async (request: RestoreRequest, { rejectWithValue }) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _result = await service.restoreBackup(request);
      return result;
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '恢復備份失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 生成密鑰
 */
export const _generateKey = createAsyncThunk(
  'dataSecurity/generateKey',
  async (
    params: {
      algorithm: EncryptionAlgorithm;
      metadata?: unknown;
    },
    { rejectWithValue }
  ) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _key = await service.generateKey(params.algorithm, params.metadata);
      return key;
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '生成密鑰失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 輪換密鑰
 */
export const _rotateKey = createAsyncThunk(
  'dataSecurity/rotateKey',
  async (keyId: string, { rejectWithValue }) => {
    try {
      const _service = DataSecurityService.getInstance();
      const _newKey = await service.rotateKey(keyId);
      return { oldKeyId: keyId, newKey };
    } catch (error) {
      return rejectWithValue({
        message: error instanceof Error ? error.message : '輪換密鑰失敗',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * 獲取安全指標
 */
export const _fetchSecurityMetrics = createAsyncThunk(
  'dataSecurity/fetchMetrics',
  async () => {
    const _service = DataSecurityService.getInstance();
    const _metrics = await service.getSecurityMetrics();
    return metrics;
  }
);

/**
 * 獲取安全狀態
 */
export const _fetchSecurityState = createAsyncThunk(
  'dataSecurity/fetchState',
  async () => {
    const _service = DataSecurityService.getInstance();
    const _state = await service.getSecurityState();
    return state;
  }
);

// Slice 定義
const _dataSecuritySlice = createSlice({
  name: 'dataSecurity',
  initialState,
  reducers: {
    // 同步 Actions

    /**
     * 設置安全配置
     */
    setSecurityConfig: (
      state,
      action: PayloadAction<Partial<SecurityConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    /**
     * 更新操作進度
     */
    updateOperationProgress: (
      state,
      action: PayloadAction<{
        operation: string;
        progress: number;
      }>
    ) => {
      state.currentOperation = action.payload.operation;
      state.operationProgress = action.payload.progress;
    },

    /**
     * 添加審計事件
     */
    addAuditEvent: (state, action: PayloadAction<SecurityAuditEvent>) => {
      state.auditEvents.push(action.payload);

      // 限制審計事件數量
      if (state.auditEvents.length > 1000) {
        state.auditEvents = state.auditEvents.slice(-500);
      }
    },

    /**
     * 更新統計信息
     */
    updateStatistics: (
      state,
      action: PayloadAction<Partial<typeof state.statistics>>
    ) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },

    /**
     * 清除錯誤
     */
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    /**
     * 清除審計事件
     */
    clearAuditEvents: state => {
      state.auditEvents = [];
    },

    /**
     * 設置加密狀態
     */
    setEncryptionEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEncryptionEnabled = action.payload;
    },

    /**
     * 設置備份狀態
     */
    setBackupEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBackupEnabled = action.payload;
    },

    /**
     * 重置操作狀態
     */
    resetOperationState: state => {
      state.isEncrypting = false;
      state.isDecrypting = false;
      state.isBackingUp = false;
      state.isRestoring = false;
      state.isGeneratingKey = false;
      state.currentOperation = null;
      state.operationProgress = 0;
    },
  },
  extraReducers: builder => {
    builder
      // 初始化處理
      .addCase(initializeDataSecurity.pending, state => {
        state.currentOperation = 'initializing';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(initializeDataSecurity.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.currentOperation = null;
        state.operationProgress = 100;

        // 更新狀態
        const _securityState = action.payload.state;
        Object.assign(state, securityState);
      })
      .addCase(initializeDataSecurity.rejected, (state, action) => {
        state.isInitialized = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        state.error = action.error.message || '初始化失敗';
        state.lastError = {
          message: state.error,
          timestamp: new Date(),
        };
      })

      // 加密處理
      .addCase(encryptData.pending, state => {
        state.isEncrypting = true;
        state.currentOperation = 'encrypting';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(encryptData.fulfilled, (state, action) => {
        state.isEncrypting = false;
        state.currentOperation = null;
        state.operationProgress = 100;
        state.lastEncryptionResult = action.payload;
        state.statistics.totalEncryptions++;
      })
      .addCase(encryptData.rejected, (state, action) => {
        state.isEncrypting = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        const _errorData = action.payload as {
          message: string;
          timestamp: Date;
        };
        state.error = errorData.message;
        state.lastError = {
          message: errorData.message,
          timestamp: errorData.timestamp,
        };
      })

      // 解密處理
      .addCase(decryptData.pending, state => {
        state.isDecrypting = true;
        state.currentOperation = 'decrypting';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(decryptData.fulfilled, (state, action) => {
        state.isDecrypting = false;
        state.currentOperation = null;
        state.operationProgress = 100;
        state.lastDecryptionResult = action.payload;
        state.statistics.totalDecryptions++;
      })
      .addCase(decryptData.rejected, (state, action) => {
        state.isDecrypting = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        const _errorData = action.payload as {
          message: string;
          timestamp: Date;
        };
        state.error = errorData.message;
        state.lastError = {
          message: errorData.message,
          timestamp: errorData.timestamp,
        };
      })

      // 備份處理
      .addCase(createBackup.pending, state => {
        state.isBackingUp = true;
        state.currentOperation = 'backing_up';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(createBackup.fulfilled, (state, action) => {
        state.isBackingUp = false;
        state.currentOperation = null;
        state.operationProgress = 100;
        state.lastBackupTask = action.payload;
        state.activeTasks.push(action.payload);
        state.statistics.totalBackups++;
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.isBackingUp = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        const _errorData = action.payload as {
          message: string;
          timestamp: Date;
        };
        state.error = errorData.message;
        state.lastError = {
          message: errorData.message,
          timestamp: errorData.timestamp,
        };
      })

      // 恢復處理
      .addCase(restoreBackup.pending, state => {
        state.isRestoring = true;
        state.currentOperation = 'restoring';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(restoreBackup.fulfilled, (state, action) => {
        state.isRestoring = false;
        state.currentOperation = null;
        state.operationProgress = 100;
        state.lastRestoreResult = action.payload;
        state.statistics.totalRestores++;
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.isRestoring = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        const _errorData = action.payload as {
          message: string;
          timestamp: Date;
        };
        state.error = errorData.message;
        state.lastError = {
          message: errorData.message,
          timestamp: errorData.timestamp,
        };
      })

      // 密鑰生成處理
      .addCase(generateKey.pending, state => {
        state.isGeneratingKey = true;
        state.currentOperation = 'generating_key';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(generateKey.fulfilled, (state, action) => {
        state.isGeneratingKey = false;
        state.currentOperation = null;
        state.operationProgress = 100;
        state.activeKeys.push(action.payload);
      })
      .addCase(generateKey.rejected, (state, action) => {
        state.isGeneratingKey = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        const _errorData = action.payload as {
          message: string;
          timestamp: Date;
        };
        state.error = errorData.message;
        state.lastError = {
          message: errorData.message,
          timestamp: errorData.timestamp,
        };
      })

      // 密鑰輪換處理
      .addCase(rotateKey.fulfilled, (state, action) => {
        const { oldKeyId, newKey } = action.payload;

        // 更新舊密鑰狀態
        const _oldKeyIndex = state.activeKeys.findIndex(
          key => key.id === oldKeyId
        );
        if (oldKeyIndex !== -1) {
          state.activeKeys[oldKeyIndex].status = 'inactive' as any;
        }

        // 添加新密鑰
        state.activeKeys.push(newKey);
        state.statistics.keyRotations++;
      })

      // 獲取指標
      .addCase(fetchSecurityMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })

      // 獲取狀態
      .addCase(fetchSecurityState.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

// 導出 Actions
export const {
  setSecurityConfig,
  updateOperationProgress,
  addAuditEvent,
  updateStatistics,
  clearError,
  clearAuditEvents,
  setEncryptionEnabled,
  setBackupEnabled,
  resetOperationState,
} = dataSecuritySlice.actions;

// 導出 Selectors
export const _selectDataSecurityState = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity;
export const _selectIsInitialized = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.isInitialized;
export const _selectIsEncryptionEnabled = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.isEncryptionEnabled;
export const _selectIsBackupEnabled = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.isBackupEnabled;
export const _selectActiveKeys = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.activeKeys;
export const _selectBackupTasks = (state: {
  dataSecurity: DataSecurityReduxState;
}) => ({
  active: state.dataSecurity.activeTasks,
  completed: state.dataSecurity.completedTasks,
});
export const _selectSecurityMetrics = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.metrics;
export const _selectAuditEvents = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.auditEvents;
export const _selectSecurityStatistics = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.statistics;
export const _selectCurrentOperation = (state: {
  dataSecurity: DataSecurityReduxState;
}) => ({
  operation: state.dataSecurity.currentOperation,
  progress: state.dataSecurity.operationProgress,
});
export const _selectLastResults = (state: {
  dataSecurity: DataSecurityReduxState;
}) => ({
  encryption: state.dataSecurity.lastEncryptionResult,
  decryption: state.dataSecurity.lastDecryptionResult,
  backup: state.dataSecurity.lastBackupTask,
  restore: state.dataSecurity.lastRestoreResult,
});
export const _selectError = (state: { dataSecurity: DataSecurityReduxState }) =>
  state.dataSecurity.error;
export const _selectLastError = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.lastError;
export const _selectSecurityConfig = (state: {
  dataSecurity: DataSecurityReduxState;
}) => state.dataSecurity.config;

// 計算屬性 Selectors
export const _selectSecurityHealth = (state: {
  dataSecurity: DataSecurityReduxState;
}) => {
  const { statistics, metrics, error } = state.dataSecurity;

  const _isHealthy =
    !error &&
    (metrics?.security?.riskScore ?? 100) < 50 &&
    (metrics?.security?.complianceScore ?? 0) > 80;

  return {
    isHealthy,
    riskScore: metrics?.security?.riskScore || 0,
    complianceScore: metrics?.security?.complianceScore || 0,
    violations: statistics.securityViolations,
  };
};

export const _selectOperationStatus = (state: {
  dataSecurity: DataSecurityReduxState;
}) => {
  const {
    isEncrypting,
    isDecrypting,
    isBackingUp,
    isRestoring,
    isGeneratingKey,
    currentOperation,
    operationProgress,
  } = state.dataSecurity;

  const _isAnyOperationActive =
    isEncrypting ||
    isDecrypting ||
    isBackingUp ||
    isRestoring ||
    isGeneratingKey;

  return {
    isActive: isAnyOperationActive,
    operation: currentOperation,
    progress: operationProgress,
    details: {
      isEncrypting,
      isDecrypting,
      isBackingUp,
      isRestoring,
      isGeneratingKey,
    },
  };
};

// 導出 Reducer
export default dataSecuritySlice.reducer;
