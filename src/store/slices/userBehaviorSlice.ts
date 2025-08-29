import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { UserBehaviorService } from '../../features/analytics/services/userBehaviorService';
import type {
  UserBehaviorEvent,
  UserBehaviorPattern,
  UserProfile,
  UserBehaviorConfig,
  UserBehaviorReport,
  UserBehaviorFilter,
  UserBehaviorExportOptions,
  UserBehaviorAlert,
  UserBehaviorAnalysisResponse,
  UserBehaviorMetrics,
} from '../../features/analytics/types/userBehavior';
import {
  UserBehaviorEventType,
  UserBehaviorStats,
} from '../../features/analytics/types/userBehavior';

// 異步 Thunk
export const _initializeUserBehavior = createAsyncThunk(
  'userBehavior/initialize',
  async () => {
    const _service = UserBehaviorService.getInstance();
    return service.initialize();
  }
);

export const _getBehaviorAnalysis = createAsyncThunk(
  'userBehavior/getAnalysis',
  async (filter?: UserBehaviorFilter) => {
    const _service = UserBehaviorService.getInstance();
    return service.getBehaviorAnalysis(filter);
  }
);

export const _generateBehaviorReport = createAsyncThunk(
  'userBehavior/generateReport',
  async (params: {
    title: string;
    description: string;
    period: { start: number; end: number };
    filter?: UserBehaviorFilter;
  }) => {
    const _service = UserBehaviorService.getInstance();
    return service.generateReport(
      params.title,
      params.description,
      params.period,
      params.filter
    );
  }
);

export const _exportBehaviorData = createAsyncThunk(
  'userBehavior/exportData',
  async (params: {
    analysis: UserBehaviorAnalysisResponse;
    options: UserBehaviorExportOptions;
  }) => {
    const _service = UserBehaviorService.getInstance();
    return service.exportData(params.analysis, params.options);
  }
);

export const _createBehaviorAlert = createAsyncThunk(
  'userBehavior/createAlert',
  async (alert: Omit<UserBehaviorAlert, 'id' | 'triggerCount'>) => {
    const _service = UserBehaviorService.getInstance();
    return service.createAlert(alert);
  }
);

export const _updateBehaviorAlert = createAsyncThunk(
  'userBehavior/updateAlert',
  async (params: { alertId: string; updates: Partial<UserBehaviorAlert> }) => {
    const _service = UserBehaviorService.getInstance();
    await service.updateAlert(params.alertId, params.updates);
    return { alertId: params.alertId, updates: params.updates };
  }
);

export const _deleteBehaviorAlert = createAsyncThunk(
  'userBehavior/deleteAlert',
  async (alertId: string) => {
    const _service = UserBehaviorService.getInstance();
    await service.deleteAlert(alertId);
    return alertId;
  }
);

export const _getUserProfile = createAsyncThunk(
  'userBehavior/getUserProfile',
  async (userId: string) => {
    const _service = UserBehaviorService.getInstance();
    return service.getUserProfile(userId);
  }
);

export const _getUserPatterns = createAsyncThunk(
  'userBehavior/getUserPatterns',
  async (userId: string) => {
    const _service = UserBehaviorService.getInstance();
    return service.getUserPatterns(userId);
  }
);

export const _getUserMetrics = createAsyncThunk(
  'userBehavior/getUserMetrics',
  async (userId: string) => {
    const _service = UserBehaviorService.getInstance();
    return service.getUserMetrics(userId);
  }
);

// 狀態接口
interface UserBehaviorState {
  // 服務狀態
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 分析數據
  analysis: UserBehaviorAnalysisResponse | null;
  currentFilter: UserBehaviorFilter | null;

  // 報告
  reports: UserBehaviorReport[];
  currentReport: UserBehaviorReport | null;
  reportGenerationLoading: boolean;

  // 配置
  config: UserBehaviorConfig;

  // 警報
  alerts: UserBehaviorAlert[];
  alertLoading: boolean;

  // 事件
  recentEvents: UserBehaviorEvent[];
  eventCount: number;

  // 導出
  exportLoading: boolean;
  exportData: string | null;

  // 用戶特定數據
  userProfiles: Map<string, UserProfile>;
  userPatterns: Map<string, UserBehaviorPattern[]>;
  userMetrics: Map<string, UserBehaviorMetrics>;

  // 實時數據
  realTimeMetrics: {
    activeUsers: number;
    averageSessionDuration: number;
    conversionRate: number;
    engagementScore: number;
  };

  // 洞察和建議
  insights: unknown[];
  recommendations: unknown[];
}

// 初始狀態
const initialState: UserBehaviorState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  analysis: null,
  currentFilter: null,
  reports: [],
  currentReport: null,
  reportGenerationLoading: false,
  config: {
    enabled: true,
    trackingInterval: 30000,
    dataRetentionDays: 90,
    privacyMode: false,
    anonymizeData: false,
    realTimeTracking: true,
    batchProcessing: false,
    eventBufferSize: 1000,
    maxEventsPerSession: 1000,
    sessionTimeout: 1800000,
    geolocationTracking: true,
    deviceTracking: true,
    customEvents: true,
  },
  alerts: [],
  alertLoading: false,
  recentEvents: [],
  eventCount: 0,
  exportLoading: false,
  exportData: null,
  userProfiles: new Map(),
  userPatterns: new Map(),
  userMetrics: new Map(),
  realTimeMetrics: {
    activeUsers: 0,
    averageSessionDuration: 0,
    conversionRate: 0,
    engagementScore: 0,
  },
  insights: [],
  recommendations: [],
};

// Slice
const _userBehaviorSlice = createSlice({
  name: 'userBehavior',
  initialState,
  reducers: {
    // 重置狀態
    resetState: state => {
      state.isInitialized = false;
      state.analysis = null;
      state.error = null;
    },

    // 設置過濾器
    setFilter: (state, action: PayloadAction<UserBehaviorFilter>) => {
      state.currentFilter = action.payload;
    },

    // 清除過濾器
    clearFilter: state => {
      state.currentFilter = null;
    },

    // 更新配置
    updateConfig: (
      state,
      action: PayloadAction<Partial<UserBehaviorConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // 添加事件
    addEvent: (state, action: PayloadAction<UserBehaviorEvent>) => {
      state.recentEvents.unshift(action.payload);
      state.eventCount++;

      // 限制事件數量
      if (state.recentEvents.length > 100) {
        state.recentEvents = state.recentEvents.slice(0, 100);
      }
    },

    // 更新實時指標
    updateRealTimeMetrics: (
      state,
      action: PayloadAction<{
        activeUsers: number;
        averageSessionDuration: number;
        conversionRate: number;
        engagementScore: number;
      }>
    ) => {
      state.realTimeMetrics = action.payload;
    },

    // 設置洞察
    setInsights: (state, action: PayloadAction<any[]>) => {
      state.insights = action.payload;
    },

    // 設置建議
    setRecommendations: (state, action: PayloadAction<any[]>) => {
      state.recommendations = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 設置當前報告
    setCurrentReport: (
      state,
      action: PayloadAction<UserBehaviorReport | null>
    ) => {
      state.currentReport = action.payload;
    },

    // 添加報告
    addReport: (state, action: PayloadAction<UserBehaviorReport>) => {
      state.reports.unshift(action.payload);

      // 限制報告數量
      if (state.reports.length > 50) {
        state.reports = state.reports.slice(0, 50);
      }
    },

    // 刪除報告
    deleteReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(
        report => report.id !== action.payload
      );
      if (state.currentReport?.id === action.payload) {
        state.currentReport = null;
      }
    },

    // 設置用戶畫像
    setUserProfile: (
      state,
      action: PayloadAction<{ userId: string; profile: UserProfile }>
    ) => {
      state.userProfiles.set(action.payload.userId, action.payload.profile);
    },

    // 設置用戶模式
    setUserPatterns: (
      state,
      action: PayloadAction<{ userId: string; patterns: UserBehaviorPattern[] }>
    ) => {
      state.userPatterns.set(action.payload.userId, action.payload.patterns);
    },

    // 設置用戶指標
    setUserMetrics: (
      state,
      action: PayloadAction<{ userId: string; metrics: UserBehaviorMetrics }>
    ) => {
      state.userMetrics.set(action.payload.userId, action.payload.metrics);
    },
  },
  extraReducers: builder => {
    // 初始化
    builder
      .addCase(initializeUserBehavior.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeUserBehavior.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = action.payload;
      })
      .addCase(initializeUserBehavior.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '初始化失敗';
      });

    // 獲取行為分析
    builder
      .addCase(getBehaviorAnalysis.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBehaviorAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analysis = action.payload;
      })
      .addCase(getBehaviorAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取行為分析失敗';
      });

    // 生成報告
    builder
      .addCase(generateBehaviorReport.pending, state => {
        state.reportGenerationLoading = true;
        state.error = null;
      })
      .addCase(generateBehaviorReport.fulfilled, (state, action) => {
        state.reportGenerationLoading = false;
        state.currentReport = action.payload;
        state.reports.unshift(action.payload);
      })
      .addCase(generateBehaviorReport.rejected, (state, action) => {
        state.reportGenerationLoading = false;
        state.error = action.error.message || '生成報告失敗';
      });

    // 導出數據
    builder
      .addCase(exportBehaviorData.pending, state => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportBehaviorData.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportData = action.payload;
      })
      .addCase(exportBehaviorData.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.error.message || '導出數據失敗';
      });

    // 創建警報
    builder
      .addCase(createBehaviorAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(createBehaviorAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
      })
      .addCase(createBehaviorAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || '創建警報失敗';
      });

    // 更新警報
    builder
      .addCase(updateBehaviorAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(updateBehaviorAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        const { alertId, updates } = action.payload;
        const _index = state.alerts.findIndex(alert => alert.id === alertId);
        if (index !== -1) {
          state.alerts[index] = { ...state.alerts[index], ...updates };
        }
      })
      .addCase(updateBehaviorAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || '更新警報失敗';
      });

    // 刪除警報
    builder
      .addCase(deleteBehaviorAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(deleteBehaviorAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        state.alerts = state.alerts.filter(
          alert => alert.id !== action.payload
        );
      })
      .addCase(deleteBehaviorAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || '刪除警報失敗';
      });

    // 獲取用戶畫像
    builder.addCase(getUserProfile.fulfilled, (state, action) => {
      if (action.payload) {
        state.userProfiles.set(action.meta.arg, action.payload);
      }
    });

    // 獲取用戶模式
    builder.addCase(getUserPatterns.fulfilled, (state, action) => {
      state.userPatterns.set(action.meta.arg, action.payload);
    });

    // 獲取用戶指標
    builder.addCase(getUserMetrics.fulfilled, (state, action) => {
      state.userMetrics.set(action.meta.arg, action.payload);
    });
  },
});

// 導出 actions
export const {
  resetState,
  setFilter,
  clearFilter,
  updateConfig,
  addEvent,
  updateRealTimeMetrics,
  setInsights,
  setRecommendations,
  clearError,
  setCurrentReport,
  addReport,
  deleteReport,
  setUserProfile,
  setUserPatterns,
  setUserMetrics,
} = userBehaviorSlice.actions;

// 導出 selectors
export const _selectUserBehavior = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior;

export const _selectAnalysis = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.analysis;

export const _selectIsInitialized = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior.isInitialized;

export const _selectIsLoading = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.isLoading;

export const _selectError = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.error;

export const _selectConfig = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.config;

export const _selectAlerts = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.alerts;

export const _selectRecentEvents = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior.recentEvents;

export const _selectRealTimeMetrics = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior.realTimeMetrics;

export const _selectInsights = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.insights;

export const _selectRecommendations = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior.recommendations;

export const _selectCurrentReport = (state: {
  userBehavior: UserBehaviorState;
}) => state.userBehavior.currentReport;

export const _selectReports = (state: { userBehavior: UserBehaviorState }) =>
  state.userBehavior.reports;

export const _selectUserProfile = (
  state: { userBehavior: UserBehaviorState },
  userId: string
) => state.userBehavior.userProfiles.get(userId);

export const _selectUserPatterns = (
  state: { userBehavior: UserBehaviorState },
  userId: string
) => state.userBehavior.userPatterns.get(userId) || [];

export const _selectUserMetrics = (
  state: { userBehavior: UserBehaviorState },
  userId: string
) => state.userBehavior.userMetrics.get(userId);

// 導出 reducer
export default userBehaviorSlice.reducer;
