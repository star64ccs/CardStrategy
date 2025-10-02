import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { PredictiveAnalysisService } from '../../features/analytics/services/predictiveAnalysisService';
import type {
  PredictionModel,
  PredictionResult,
  PredictionFilter,
  PredictionReport,
  PredictionInsight,
  PredictionRecommendation,
  PredictionAlert,
  PredictiveAnalysisConfig,
  PredictiveAnalysisExportOptions,
  PredictionModelConfig,
} from '../../features/analytics/types/predictiveAnalysis';
import {
  PredictiveAnalysisResponse,
  PredictionTarget,
  PredictionModelType,
} from '../../features/analytics/types/predictiveAnalysis';

// StatusInterface
interface PredictiveAnalysisState {
  // Data
  models: PredictionModel[];
  predictions: PredictionResult[];
  reports: PredictionReport[];
  insights: PredictionInsight[];
  recommendations: PredictionRecommendation[];
  alerts: PredictionAlert[];

  // Configure
  config: PredictiveAnalysisConfig | null;

  // 實時指標
  realTimeMetrics: {
    activeModels: number;
    totalPredictions: number;
    averageAccuracy: number;
    alertsCount: number;
  } | null;

  // 加載Status
  loading: {
    initialize: boolean;
    getAnalysis: boolean;
    createModel: boolean;
    generatePrediction: boolean;
    generateReport: boolean;
    exportData: boolean;
    createAlert: boolean;
    updateAlert: boolean;
    deleteAlert: boolean;
    getConfig: boolean;
    updateConfig: boolean;
    getReports: boolean;
    getInsights: boolean;
    getRecommendations: boolean;
    getAlerts: boolean;
    getRealTimeMetrics: boolean;
  };

  // ErrorStatus
  error: {
    initialize: string | null;
    getAnalysis: string | null;
    createModel: string | null;
    generatePrediction: string | null;
    generateReport: string | null;
    exportData: string | null;
    createAlert: string | null;
    updateAlert: string | null;
    deleteAlert: string | null;
    getConfig: string | null;
    updateConfig: string | null;
    getReports: string | null;
    getInsights: string | null;
    getRecommendations: string | null;
    getAlerts: string | null;
    getRealTimeMetrics: string | null;
  };

  // InitializeStatus
  isInitialized: boolean;
}

// 初始Status
const initialState: PredictiveAnalysisState = {
  models: [],
  predictions: [],
  reports: [],
  insights: [],
  recommendations: [],
  alerts: [],
  config: null,
  realTimeMetrics: null,
  loading: {
    initialize: false,
    getAnalysis: false,
    createModel: false,
    generatePrediction: false,
    generateReport: false,
    exportData: false,
    createAlert: false,
    updateAlert: false,
    deleteAlert: false,
    getConfig: false,
    updateConfig: false,
    getReports: false,
    getInsights: false,
    getRecommendations: false,
    getAlerts: false,
    getRealTimeMetrics: false,
  },
  error: {
    initialize: null,
    getAnalysis: null,
    createModel: null,
    generatePrediction: null,
    generateReport: null,
    exportData: null,
    createAlert: null,
    updateAlert: null,
    deleteAlert: null,
    getConfig: null,
    updateConfig: null,
    getReports: null,
    getInsights: null,
    getRecommendations: null,
    getAlerts: null,
    getRealTimeMetrics: null,
  },
  isInitialized: false,
};

// Async Thunk Actions

/**
 * Initialize預測AnalysisService
 */
export const _initializePredictiveAnalysis = createAsyncThunk(
  'predictiveAnalysis/initialize',
  async (config?: Partial<PredictiveAnalysisConfig>) => {
    const _service = PredictiveAnalysisService.getInstance();
    const _success = await service.initialize(config);
    if (!success) {
      throw new Error('Failed to initialize PredictiveAnalysisService');
    }
    return success;
  }
);

/**
 * Get預測AnalysisData
 */
export const _getPredictiveAnalysis = createAsyncThunk(
  'predictiveAnalysis/getAnalysis',
  async (filter?: PredictionFilter) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getPredictiveAnalysis(filter);
  }
);

/**
 * Create預測模型
 */
export const _createPredictionModel = createAsyncThunk(
  'predictiveAnalysis/createModel',
  async (params: {
    name: string;
    description: string;
    config: PredictionModelConfig;
  }) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.createModel(params.name, params.description, params.config);
  }
);

/**
 * 生成預測
 */
export const _generatePrediction = createAsyncThunk(
  'predictiveAnalysis/generatePrediction',
  async (params: { modelId: string; inputFeatures: Record<string, any> }) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.generatePrediction(params.modelId, params.inputFeatures);
  }
);

/**
 * 生成Report
 */
export const _generatePredictionReport = createAsyncThunk(
  'predictiveAnalysis/generateReport',
  async (params: {
    modelId: string;
    title: string;
    description: string;
    dateRange: { start: Date; end: Date };
  }) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.generateReport(
      params.modelId,
      params.title,
      params.description,
      params.dateRange
    );
  }
);

/**
 * ExportData
 */
export const _exportPredictiveAnalysisData = createAsyncThunk(
  'predictiveAnalysis/exportData',
  async (options: PredictiveAnalysisExportOptions) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.exportData(options);
  }
);

/**
 * CreateAlert
 */
export const _createPredictionAlert = createAsyncThunk(
  'predictiveAnalysis/createAlert',
  async (params: {
    modelId: string;
    type: PredictionAlert['type'];
    severity: PredictionAlert['severity'];
    title: string;
    message: string;
    threshold: number;
    currentValue: number;
  }) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.createAlert(
      params.modelId,
      params.type,
      params.severity,
      params.title,
      params.message,
      params.threshold,
      params.currentValue
    );
  }
);

/**
 * UpdateAlert
 */
export const _updatePredictionAlert = createAsyncThunk(
  'predictiveAnalysis/updateAlert',
  async (params: { alertId: string; updates: Partial<PredictionAlert> }) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.updateAlert(params.alertId, params.updates);
  }
);

/**
 * DeleteAlert
 */
export const _deletePredictionAlert = createAsyncThunk(
  'predictiveAnalysis/deleteAlert',
  async (alertId: string) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.deleteAlert(alertId);
  }
);

/**
 * GetConfigure
 */
export const _getPredictiveAnalysisConfig = createAsyncThunk(
  'predictiveAnalysis/getConfig',
  async () => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getConfig();
  }
);

/**
 * UpdateConfigure
 */
export const _updatePredictiveAnalysisConfig = createAsyncThunk(
  'predictiveAnalysis/updateConfig',
  async (updates: Partial<PredictiveAnalysisConfig>) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.updateConfig(updates);
  }
);

/**
 * GetReport
 */
export const _getPredictionReports = createAsyncThunk(
  'predictiveAnalysis/getReports',
  async (modelId?: string) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getReports(modelId);
  }
);

/**
 * Get洞察
 */
export const _getPredictionInsights = createAsyncThunk(
  'predictiveAnalysis/getInsights',
  async (modelId?: string) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getInsights(modelId);
  }
);

/**
 * Get建議
 */
export const _getPredictionRecommendations = createAsyncThunk(
  'predictiveAnalysis/getRecommendations',
  async (modelId?: string) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getRecommendations(modelId);
  }
);

/**
 * GetAlert
 */
export const _getPredictionAlerts = createAsyncThunk(
  'predictiveAnalysis/getAlerts',
  async (modelId?: string) => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getAlerts(modelId);
  }
);

/**
 * Get實時指標
 */
export const _getRealTimePredictionMetrics = createAsyncThunk(
  'predictiveAnalysis/getRealTimeMetrics',
  async () => {
    const _service = PredictiveAnalysisService.getInstance();
    return service.getRealTimeMetrics();
  }
);

// Slice
const _predictiveAnalysisSlice = createSlice({
  name: 'predictiveAnalysis',
  initialState,
  reducers: {
    // ClearError
    clearError: (
      state,
      action: PayloadAction<keyof PredictiveAnalysisState['error']>
    ) => {
      state.error[action.payload] = null;
    },

    // Clear所有Error
    clearAllErrors: state => {
      Object.keys(state.error).forEach(key => {
        state.error[key as keyof PredictiveAnalysisState['error']] = null;
      });
    },

    // ResetStatus
    resetPredictiveAnalysis: () => initialState,
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializePredictiveAnalysis.pending, state => {
        state.loading.initialize = true;
        state.error.initialize = null;
      })
      .addCase(initializePredictiveAnalysis.fulfilled, state => {
        state.loading.initialize = false;
        state.isInitialized = true;
      })
      .addCase(initializePredictiveAnalysis.rejected, (state, action) => {
        state.loading.initialize = false;
        state.error.initialize = action.error.message || 'InitializeFailed';
      });

    // GetAnalysisData
    builder
      .addCase(getPredictiveAnalysis.pending, state => {
        state.loading.getAnalysis = true;
        state.error.getAnalysis = null;
      })
      .addCase(getPredictiveAnalysis.fulfilled, (state, action) => {
        state.loading.getAnalysis = false;
        if (action.payload.success) {
          state.models = action.payload.data.models;
          state.predictions = action.payload.data.predictions;
        } else {
          state.error.getAnalysis = action.payload.error || 'Get分析數據Failed';
        }
      })
      .addCase(getPredictiveAnalysis.rejected, (state, action) => {
        state.loading.getAnalysis = false;
        state.error.getAnalysis = action.error.message || 'Get分析數據Failed';
      });

    // Create模型
    builder
      .addCase(createPredictionModel.pending, state => {
        state.loading.createModel = true;
        state.error.createModel = null;
      })
      .addCase(createPredictionModel.fulfilled, (state, action) => {
        state.loading.createModel = false;
        state.models.push(action.payload);
      })
      .addCase(createPredictionModel.rejected, (state, action) => {
        state.loading.createModel = false;
        state.error.createModel = action.error.message || 'Create模型Failed';
      });

    // 生成預測
    builder
      .addCase(generatePrediction.pending, state => {
        state.loading.generatePrediction = true;
        state.error.generatePrediction = null;
      })
      .addCase(generatePrediction.fulfilled, (state, action) => {
        state.loading.generatePrediction = false;
        state.predictions.push(action.payload);
      })
      .addCase(generatePrediction.rejected, (state, action) => {
        state.loading.generatePrediction = false;
        state.error.generatePrediction = action.error.message || '生成預測Failed';
      });

    // 生成Report
    builder
      .addCase(generatePredictionReport.pending, state => {
        state.loading.generateReport = true;
        state.error.generateReport = null;
      })
      .addCase(generatePredictionReport.fulfilled, (state, action) => {
        state.loading.generateReport = false;
        state.reports.push(action.payload);
      })
      .addCase(generatePredictionReport.rejected, (state, action) => {
        state.loading.generateReport = false;
        state.error.generateReport = action.error.message || '生成報告Failed';
      });

    // ExportData
    builder
      .addCase(exportPredictiveAnalysisData.pending, state => {
        state.loading.exportData = true;
        state.error.exportData = null;
      })
      .addCase(exportPredictiveAnalysisData.fulfilled, state => {
        state.loading.exportData = false;
      })
      .addCase(exportPredictiveAnalysisData.rejected, (state, action) => {
        state.loading.exportData = false;
        state.error.exportData = action.error.message || '導出數據Failed';
      });

    // CreateAlert
    builder
      .addCase(createPredictionAlert.pending, state => {
        state.loading.createAlert = true;
        state.error.createAlert = null;
      })
      .addCase(createPredictionAlert.fulfilled, (state, action) => {
        state.loading.createAlert = false;
        state.alerts.push(action.payload);
      })
      .addCase(createPredictionAlert.rejected, (state, action) => {
        state.loading.createAlert = false;
        state.error.createAlert = action.error.message || 'Create警報Failed';
      });

    // UpdateAlert
    builder
      .addCase(updatePredictionAlert.pending, state => {
        state.loading.updateAlert = true;
        state.error.updateAlert = null;
      })
      .addCase(updatePredictionAlert.fulfilled, (state, action) => {
        state.loading.updateAlert = false;
        const _index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      })
      .addCase(updatePredictionAlert.rejected, (state, action) => {
        state.loading.updateAlert = false;
        state.error.updateAlert = action.error.message || 'Update警報Failed';
      });

    // DeleteAlert
    builder
      .addCase(deletePredictionAlert.pending, state => {
        state.loading.deleteAlert = true;
        state.error.deleteAlert = null;
      })
      .addCase(deletePredictionAlert.fulfilled, (state, action) => {
        state.loading.deleteAlert = false;
        if (action.payload) {
          state.alerts = state.alerts.filter(a => a.id !== action.meta.arg);
        }
      })
      .addCase(deletePredictionAlert.rejected, (state, action) => {
        state.loading.deleteAlert = false;
        state.error.deleteAlert = action.error.message || 'Delete警報Failed';
      });

    // GetConfigure
    builder
      .addCase(getPredictiveAnalysisConfig.pending, state => {
        state.loading.getConfig = true;
        state.error.getConfig = null;
      })
      .addCase(getPredictiveAnalysisConfig.fulfilled, (state, action) => {
        state.loading.getConfig = false;
        state.config = action.payload;
      })
      .addCase(getPredictiveAnalysisConfig.rejected, (state, action) => {
        state.loading.getConfig = false;
        state.error.getConfig = action.error.message || 'GetConfigureFailed';
      });

    // UpdateConfigure
    builder
      .addCase(updatePredictiveAnalysisConfig.pending, state => {
        state.loading.updateConfig = true;
        state.error.updateConfig = null;
      })
      .addCase(updatePredictiveAnalysisConfig.fulfilled, (state, action) => {
        state.loading.updateConfig = false;
        state.config = action.payload;
      })
      .addCase(updatePredictiveAnalysisConfig.rejected, (state, action) => {
        state.loading.updateConfig = false;
        state.error.updateConfig = action.error.message || 'UpdateConfigureFailed';
      });

    // GetReport
    builder
      .addCase(getPredictionReports.pending, state => {
        state.loading.getReports = true;
        state.error.getReports = null;
      })
      .addCase(getPredictionReports.fulfilled, (state, action) => {
        state.loading.getReports = false;
        state.reports = action.payload;
      })
      .addCase(getPredictionReports.rejected, (state, action) => {
        state.loading.getReports = false;
        state.error.getReports = action.error.message || 'Get報告Failed';
      });

    // Get洞察
    builder
      .addCase(getPredictionInsights.pending, state => {
        state.loading.getInsights = true;
        state.error.getInsights = null;
      })
      .addCase(getPredictionInsights.fulfilled, (state, action) => {
        state.loading.getInsights = false;
        state.insights = action.payload;
      })
      .addCase(getPredictionInsights.rejected, (state, action) => {
        state.loading.getInsights = false;
        state.error.getInsights = action.error.message || 'Get洞察Failed';
      });

    // Get建議
    builder
      .addCase(getPredictionRecommendations.pending, state => {
        state.loading.getRecommendations = true;
        state.error.getRecommendations = null;
      })
      .addCase(getPredictionRecommendations.fulfilled, (state, action) => {
        state.loading.getRecommendations = false;
        state.recommendations = action.payload;
      })
      .addCase(getPredictionRecommendations.rejected, (state, action) => {
        state.loading.getRecommendations = false;
        state.error.getRecommendations = action.error.message || 'Get建議Failed';
      });

    // GetAlert
    builder
      .addCase(getPredictionAlerts.pending, state => {
        state.loading.getAlerts = true;
        state.error.getAlerts = null;
      })
      .addCase(getPredictionAlerts.fulfilled, (state, action) => {
        state.loading.getAlerts = false;
        state.alerts = action.payload;
      })
      .addCase(getPredictionAlerts.rejected, (state, action) => {
        state.loading.getAlerts = false;
        state.error.getAlerts = action.error.message || 'Get警報Failed';
      });

    // Get實時指標
    builder
      .addCase(getRealTimePredictionMetrics.pending, state => {
        state.loading.getRealTimeMetrics = true;
        state.error.getRealTimeMetrics = null;
      })
      .addCase(getRealTimePredictionMetrics.fulfilled, (state, action) => {
        state.loading.getRealTimeMetrics = false;
        state.realTimeMetrics = action.payload;
      })
      .addCase(getRealTimePredictionMetrics.rejected, (state, action) => {
        state.loading.getRealTimeMetrics = false;
        state.error.getRealTimeMetrics =
          action.error.message || 'Get實時指標Failed';
      });
  },
});

// Actions
export const { clearError, clearAllErrors, resetPredictiveAnalysis } =
  predictiveAnalysisSlice.actions;

// Selectors
export const _selectPredictiveAnalysisState = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis;

export const _selectModels = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.models;

export const _selectPredictions = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.predictions;

export const _selectReports = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.reports;

export const _selectInsights = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.insights;

export const _selectRecommendations = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.recommendations;

export const _selectAlerts = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.alerts;

export const _selectConfig = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.config;

export const _selectRealTimeMetrics = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.realTimeMetrics;

export const _selectLoading = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.loading;

export const _selectError = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.error;

export const _selectIsInitialized = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.isInitialized;

// Reducer
export default predictiveAnalysisSlice.reducer;
