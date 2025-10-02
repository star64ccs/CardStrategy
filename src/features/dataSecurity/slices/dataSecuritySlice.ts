/**
 * Data安全 Redux Slice
 * Manage安全Status、Encrypt、Backup等功能
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

// Redux StatusInterface（Extension原有的 SecurityState）
export interface DataSecurityReduxState extends SecurityState {
  // OperationStatus
  isEncrypting: boolean;
  isDecrypting: boolean;
  isBackingUp: boolean;
  isRestoring: boolean;
  isGeneratingKey: boolean;

  // 當前Operation
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

// 初始Status
const initialState: DataSecurityReduxState = {
  // 繼承 SecurityState 的Field
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

  // Redux 特有Field
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

// Async Thunk Actions

/**
 * InitializeData安全Service
 */
export const _initializeDataSecurity = createAsyncThunk(
  'dataSecurity/initialize',
  async (config?: Partial<SecurityConfig>) => {
    const _service = DataSecurityService.getInstance();
    const _success = await service.initialize(config);

    if (!success) {
      throw new Error('數據安全ServiceInitializeFailed');
    }

    const _state = await service.getSecurityState();
    return { success, state };
  }
);

/**
 * EncryptData
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
        message: error instanceof Error ? error.message : '加密Failed',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * DecryptData
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
        message: error instanceof Error ? error.message : '解密Failed',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * CreateBackup
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
        message: error instanceof Error ? error.message : 'Create備份Failed',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * RestoreBackup
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
        message: error instanceof Error ? error.message : '恢復備份Failed',
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
        message: error instanceof Error ? error.message : '生成密鑰Failed',
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
        message: error instanceof Error ? error.message : '輪換密鑰Failed',
        timestamp: new Date(),
      });
    }
  }
);

/**
 * Get安全指標
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
 * Get安全Status
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
    // Sync Actions

    /**
     * Settings安全Configure
     */
    setSecurityConfig: (
      state,
      action: PayloadAction<Partial<SecurityConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    /**
     * UpdateOperation進度
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
     * Add審計Event
     */
    addAuditEvent: (state, action: PayloadAction<SecurityAuditEvent>) => {
      state.auditEvents.push(action.payload);

      // Limit審計Event數量
      if (state.auditEvents.length > 1000) {
        state.auditEvents = state.auditEvents.slice(-500);
      }
    },

    /**
     * UpdateStatisticsInformation
     */
    updateStatistics: (
      state,
      action: PayloadAction<Partial<typeof state.statistics>>
    ) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },

    /**
     * ClearError
     */
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    /**
     * Clear審計Event
     */
    clearAuditEvents: state => {
      state.auditEvents = [];
    },

    /**
     * SettingsEncryptStatus
     */
    setEncryptionEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEncryptionEnabled = action.payload;
    },

    /**
     * SettingsBackupStatus
     */
    setBackupEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBackupEnabled = action.payload;
    },

    /**
     * ResetOperationStatus
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
      // InitializeHandle
      .addCase(initializeDataSecurity.pending, state => {
        state.currentOperation = 'initializing';
        state.operationProgress = 0;
        state.error = null;
      })
      .addCase(initializeDataSecurity.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.currentOperation = null;
        state.operationProgress = 100;

        // UpdateStatus
        const _securityState = action.payload.state;
        Object.assign(state, securityState);
      })
      .addCase(initializeDataSecurity.rejected, (state, action) => {
        state.isInitialized = false;
        state.currentOperation = null;
        state.operationProgress = 0;
        state.error = action.error.message || 'InitializeFailed';
        state.lastError = {
          message: state.error,
          timestamp: new Date(),
        };
      })

      // EncryptHandle
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

      // DecryptHandle
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

      // BackupHandle
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

      // RestoreHandle
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

      // 密鑰生成Handle
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

      // 密鑰輪換Handle
      .addCase(rotateKey.fulfilled, (state, action) => {
        const { oldKeyId, newKey } = action.payload;

        // Update舊密鑰Status
        const _oldKeyIndex = state.activeKeys.findIndex(
          key => key.id === oldKeyId
        );
        if (oldKeyIndex !== -1) {
          state.activeKeys[oldKeyIndex].status = 'inactive' as any;
        }

        // Add新密鑰
        state.activeKeys.push(newKey);
        state.statistics.keyRotations++;
      })

      // Get指標
      .addCase(fetchSecurityMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })

      // GetStatus
      .addCase(fetchSecurityState.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

// Export Actions
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

// Export Selectors
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

// 計算Property Selectors
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

// Export Reducer
export default dataSecuritySlice.reducer;
