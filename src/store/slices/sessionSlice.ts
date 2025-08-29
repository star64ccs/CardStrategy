import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type {
  Session,
  SessionConfig,
  SessionRefreshRequest,
  SessionTerminationRequest,
  SessionState,
} from '../../core/types';
import {
  SessionActivity,
  SessionSecurityInfo,
  SessionAnalytics,
} from '../../core/types';
import { logger } from '../../core/utils/logger';
import { sessionService } from '../../features/auth/services/sessionService';

// 異步 Thunk Actions
export const _initializeSession = createAsyncThunk(
  'session/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await sessionService.initialize();
      const _currentSession = sessionService.getCurrentSession();
      return { currentSession };
    } catch (error: unknown) {
      logger.error('初始化會話失敗:', error);
      return rejectWithValue(error.message || '初始化會話失敗');
    }
  }
);

export const _createSession = createAsyncThunk(
  'session/create',
  async (
    {
      userId,
      token,
      refreshToken,
      expiresIn,
    }: {
      userId: string;
      token: string;
      refreshToken: string;
      expiresIn: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const _session = await sessionService.createSession(
        userId,
        token,
        refreshToken,
        expiresIn
      );
      return session;
    } catch (error: unknown) {
      logger.error('創建會話失敗:', error);
      return rejectWithValue(error.message || '創建會話失敗');
    }
  }
);

export const _refreshSession = createAsyncThunk(
  'session/refresh',
  async (request: SessionRefreshRequest, { rejectWithValue }) => {
    try {
      const _response = await sessionService.refreshSession(request);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.errorMessage || '刷新會話失敗');
      }
    } catch (error: unknown) {
      logger.error('刷新會話失敗:', error);
      return rejectWithValue(error.message || '刷新會話失敗');
    }
  }
);

export const _terminateSession = createAsyncThunk(
  'session/terminate',
  async (request: SessionTerminationRequest, { rejectWithValue }) => {
    try {
      const _response = await sessionService.terminateSession(request);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.errorMessage || '終止會話失敗');
      }
    } catch (error: unknown) {
      logger.error('終止會話失敗:', error);
      return rejectWithValue(error.message || '終止會話失敗');
    }
  }
);

export const _getSessions = createAsyncThunk(
  'session/getSessions',
  async (_, { rejectWithValue }) => {
    try {
      const _response = await sessionService.getSessions();
      return response;
    } catch (error: unknown) {
      logger.error('獲取會話列表失敗:', error);
      return rejectWithValue(error.message || '獲取會話列表失敗');
    }
  }
);

export const _getSessionConfig = createAsyncThunk(
  'session/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      const _config = await sessionService.getSessionConfig();
      return config;
    } catch (error: unknown) {
      logger.error('獲取會話配置失敗:', error);
      return rejectWithValue(error.message || '獲取會話配置失敗');
    }
  }
);

export const _getSessionActivities = createAsyncThunk(
  'session/getActivities',
  async (sessionId: string | undefined, { rejectWithValue }) => {
    try {
      const _activities = await sessionService.getSessionActivities(sessionId);
      return activities;
    } catch (error: unknown) {
      logger.error('獲取會話活動失敗:', error);
      return rejectWithValue(error.message || '獲取會話活動失敗');
    }
  }
);

export const _getSessionSecurityInfo = createAsyncThunk(
  'session/getSecurityInfo',
  async (_, { rejectWithValue }) => {
    try {
      const _securityInfo = await sessionService.getSessionSecurityInfo();
      return securityInfo;
    } catch (error: unknown) {
      logger.error('獲取會話安全信息失敗:', error);
      return rejectWithValue(error.message || '獲取會話安全信息失敗');
    }
  }
);

export const _getSessionAnalytics = createAsyncThunk(
  'session/getAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const _analytics = await sessionService.getSessionAnalytics();
      return analytics;
    } catch (error: unknown) {
      logger.error('獲取會話分析失敗:', error);
      return rejectWithValue(error.message || '獲取會話分析失敗');
    }
  }
);

export const _updateSessionActivity = createAsyncThunk(
  'session/updateActivity',
  async (_, { rejectWithValue }) => {
    try {
      await sessionService.updateSessionActivity();
      const _currentSession = sessionService.getCurrentSession();
      return currentSession;
    } catch (error: unknown) {
      logger.error('更新會話活動失敗:', error);
      return rejectWithValue(error.message || '更新會話活動失敗');
    }
  }
);

// 初始狀態
const initialState: SessionState = {
  // 當前會話
  currentSession: null,
  isSessionLoading: false,
  sessionError: null,

  // 會話列表
  sessions: [],
  isSessionsLoading: false,
  sessionsError: null,

  // 會話配置
  config: {
    maxSessionsPerUser: 5,
    sessionTimeout: 30,
    refreshTokenExpiry: 30,
    autoRefreshEnabled: true,
    refreshThreshold: 5,
    concurrentSessionLimit: 3,
    deviceTrackingEnabled: true,
    locationTrackingEnabled: true,
  },
  isConfigLoading: false,
  configError: null,

  // 會話活動
  activities: [],
  isActivitiesLoading: false,
  activitiesError: null,

  // 安全信息
  securityInfo: null,
  isSecurityLoading: false,
  securityError: null,

  // 會話分析
  analytics: null,
  isAnalyticsLoading: false,
  analyticsError: null,

  // 操作狀態
  isRefreshing: false,
  refreshError: null,
  isTerminating: false,
  terminationError: null,
};

// Slice
const _sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // 清除錯誤
    clearSessionError: state => {
      state.sessionError = null;
    },
    clearSessionsError: state => {
      state.sessionsError = null;
    },
    clearConfigError: state => {
      state.configError = null;
    },
    clearActivitiesError: state => {
      state.activitiesError = null;
    },
    clearSecurityError: state => {
      state.securityError = null;
    },
    clearAnalyticsError: state => {
      state.analyticsError = null;
    },
    clearRefreshError: state => {
      state.refreshError = null;
    },
    clearTerminationError: state => {
      state.terminationError = null;
    },

    // 重置會話狀態
    resetSession: state => {
      state.currentSession = null;
      state.sessions = [];
      state.activities = [];
      state.securityInfo = null;
      state.analytics = null;
      state.sessionError = null;
      state.sessionsError = null;
      state.activitiesError = null;
      state.securityError = null;
      state.analyticsError = null;
      state.refreshError = null;
      state.terminationError = null;
    },

    // 更新當前會話
    updateCurrentSession: (state, action: PayloadAction<Session>) => {
      state.currentSession = action.payload;
    },

    // 設置會話配置
    setSessionConfig: (state, action: PayloadAction<SessionConfig>) => {
      state.config = action.payload;
    },
  },
  extraReducers: builder => {
    // initializeSession
    builder
      .addCase(initializeSession.pending, state => {
        state.isSessionLoading = true;
        state.sessionError = null;
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.isSessionLoading = false;
        state.currentSession = action.payload.currentSession;
      })
      .addCase(initializeSession.rejected, (state, action) => {
        state.isSessionLoading = false;
        state.sessionError = action.payload as string;
      });

    // createSession
    builder
      .addCase(createSession.pending, state => {
        state.isSessionLoading = true;
        state.sessionError = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.isSessionLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isSessionLoading = false;
        state.sessionError = action.payload as string;
      });

    // refreshSession
    builder
      .addCase(refreshSession.pending, state => {
        state.isRefreshing = true;
        state.refreshError = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isRefreshing = false;
        if (state.currentSession) {
          state.currentSession.token = action.payload.newToken;
          state.currentSession.refreshToken = action.payload.newRefreshToken;
          state.currentSession.expiresAt = new Date(
            Date.now() + (action.payload.expiresIn || 3600) * 1000
          );
          state.currentSession.lastActiveAt = new Date();
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.isRefreshing = false;
        state.refreshError = action.payload as string;
      });

    // terminateSession
    builder
      .addCase(terminateSession.pending, state => {
        state.isTerminating = true;
        state.terminationError = null;
      })
      .addCase(terminateSession.fulfilled, state => {
        state.isTerminating = false;
        state.currentSession = null;
        state.sessions = [];
        state.activities = [];
        state.securityInfo = null;
        state.analytics = null;
      })
      .addCase(terminateSession.rejected, (state, action) => {
        state.isTerminating = false;
        state.terminationError = action.payload as string;
      });

    // getSessions
    builder
      .addCase(getSessions.pending, state => {
        state.isSessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(getSessions.fulfilled, (state, action) => {
        state.isSessionsLoading = false;
        state.sessions = action.payload.sessions;
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.isSessionsLoading = false;
        state.sessionsError = action.payload as string;
      });

    // getSessionConfig
    builder
      .addCase(getSessionConfig.pending, state => {
        state.isConfigLoading = true;
        state.configError = null;
      })
      .addCase(getSessionConfig.fulfilled, (state, action) => {
        state.isConfigLoading = false;
        state.config = action.payload;
      })
      .addCase(getSessionConfig.rejected, (state, action) => {
        state.isConfigLoading = false;
        state.configError = action.payload as string;
      });

    // getSessionActivities
    builder
      .addCase(getSessionActivities.pending, state => {
        state.isActivitiesLoading = true;
        state.activitiesError = null;
      })
      .addCase(getSessionActivities.fulfilled, (state, action) => {
        state.isActivitiesLoading = false;
        state.activities = action.payload;
      })
      .addCase(getSessionActivities.rejected, (state, action) => {
        state.isActivitiesLoading = false;
        state.activitiesError = action.payload as string;
      });

    // getSessionSecurityInfo
    builder
      .addCase(getSessionSecurityInfo.pending, state => {
        state.isSecurityLoading = true;
        state.securityError = null;
      })
      .addCase(getSessionSecurityInfo.fulfilled, (state, action) => {
        state.isSecurityLoading = false;
        state.securityInfo = action.payload;
      })
      .addCase(getSessionSecurityInfo.rejected, (state, action) => {
        state.isSecurityLoading = false;
        state.securityError = action.payload as string;
      });

    // getSessionAnalytics
    builder
      .addCase(getSessionAnalytics.pending, state => {
        state.isAnalyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getSessionAnalytics.fulfilled, (state, action) => {
        state.isAnalyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getSessionAnalytics.rejected, (state, action) => {
        state.isAnalyticsLoading = false;
        state.analyticsError = action.payload as string;
      });

    // updateSessionActivity
    builder.addCase(updateSessionActivity.fulfilled, (state, action) => {
      if (action.payload) {
        state.currentSession = action.payload;
      }
    });
  },
});

// Actions
export const {
  clearSessionError,
  clearSessionsError,
  clearConfigError,
  clearActivitiesError,
  clearSecurityError,
  clearAnalyticsError,
  clearRefreshError,
  clearTerminationError,
  resetSession,
  updateCurrentSession,
  setSessionConfig,
} = sessionSlice.actions;

// Selectors
export const _selectCurrentSession = (state: { session: SessionState }) =>
  state.session.currentSession;
export const _selectIsSessionLoading = (state: { session: SessionState }) =>
  state.session.isSessionLoading;
export const _selectSessionError = (state: { session: SessionState }) =>
  state.session.sessionError;

export const _selectSessions = (state: { session: SessionState }) =>
  state.session.sessions;
export const _selectIsSessionsLoading = (state: { session: SessionState }) =>
  state.session.isSessionsLoading;
export const _selectSessionsError = (state: { session: SessionState }) =>
  state.session.sessionsError;

export const _selectSessionConfig = (state: { session: SessionState }) =>
  state.session.config;
export const _selectIsConfigLoading = (state: { session: SessionState }) =>
  state.session.isConfigLoading;
export const _selectConfigError = (state: { session: SessionState }) =>
  state.session.configError;

export const _selectSessionActivities = (state: { session: SessionState }) =>
  state.session.activities;
export const _selectIsActivitiesLoading = (state: { session: SessionState }) =>
  state.session.isActivitiesLoading;
export const _selectActivitiesError = (state: { session: SessionState }) =>
  state.session.activitiesError;

export const _selectSessionSecurityInfo = (state: { session: SessionState }) =>
  state.session.securityInfo;
export const _selectIsSecurityLoading = (state: { session: SessionState }) =>
  state.session.isSecurityLoading;
export const _selectSecurityError = (state: { session: SessionState }) =>
  state.session.securityError;

export const _selectSessionAnalytics = (state: { session: SessionState }) =>
  state.session.analytics;
export const _selectIsAnalyticsLoading = (state: { session: SessionState }) =>
  state.session.isAnalyticsLoading;
export const _selectAnalyticsError = (state: { session: SessionState }) =>
  state.session.analyticsError;

export const _selectIsRefreshing = (state: { session: SessionState }) =>
  state.session.isRefreshing;
export const _selectRefreshError = (state: { session: SessionState }) =>
  state.session.refreshError;
export const _selectIsTerminating = (state: { session: SessionState }) =>
  state.session.isTerminating;
export const _selectTerminationError = (state: { session: SessionState }) =>
  state.session.terminationError;

export const _selectIsSessionValid = (state: { session: SessionState }) => {
  const _session = state.session.currentSession;
  if (!session) return false;
  const _now = new Date();
  return session.isActive && session.expiresAt > now;
};

export default sessionSlice.reducer;
