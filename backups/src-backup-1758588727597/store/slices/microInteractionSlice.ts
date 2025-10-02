// 微交互 Redux slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { _microInteractionService as microInteractionService } from '../../services/microInteractionService';
import type {
  MicroInteractionConfig,
  MicroInteractionEvent,
  MicroInteractionManagerConfig,
  MicroInteractionPerformance,
  MicroInteractionState,
  MicroInteractionStats,
} from '../../types/microInteractions';
import { MicroInteractionStatus } from '../../types/microInteractions';

// 初始狀態
interface MicroInteractionSliceState {
  // 服務狀態
  initialized: boolean;
  loading: boolean;
  error: string | null;

  // 配置
  config: MicroInteractionManagerConfig;

  // 微交互管理
  interactions: Record<string, MicroInteractionConfig>;
  states: Record<string, MicroInteractionState>;
  performances: Record<string, MicroInteractionPerformance>;

  // 統計
  stats: MicroInteractionStats;

  // 事件歷史
  events: MicroInteractionEvent[];

  // 性能監控
  performanceMonitoring: boolean;

  // 調試模式
  debugMode: boolean;
}

const initialState: MicroInteractionSliceState = {
  initialized: false,
  loading: false,
  error: null,
  config: {
    enabled: true,
    performanceMode: false,
    accessibilityMode: false,
    debugMode: false,
    maxConcurrent: 10,
    throttleDelay: 16,
    defaultDuration: 300,
    defaultEasing: 'ease-out',
  },
  interactions: {},
  states: {},
  performances: {},
  stats: {
    totalInteractions: 0,
    successfulInteractions: 0,
    failedInteractions: 0,
    averageDuration: 0,
    performanceScore: 0,
    accessibilityScore: 0,
    userSatisfactionScore: 0,
  },
  events: [],
  performanceMonitoring: false,
  debugMode: false,
};

// 異步 Thunks

// 初始化微交互服務
export const initializeMicroInteractionService = createAsyncThunk(
  'microInteraction/initialize',
  async (config?: Partial<MicroInteractionManagerConfig>) => {
    await microInteractionService.initialize(config);
    return { config: microInteractionService['config'] };
  }
);

// 註冊微交互
export const registerMicroInteraction = createAsyncThunk(
  'microInteraction/register',
  async (config: MicroInteractionConfig) => {
    const id = microInteractionService.register(config);
    return { id, config };
  }
);

// 註銷微交互
export const unregisterMicroInteraction = createAsyncThunk(
  'microInteraction/unregister',
  async (id: string) => {
    microInteractionService.unregister(id);
    return { id };
  }
);

// 觸發微交互
export const triggerMicroInteraction = createAsyncThunk(
  'microInteraction/trigger',
  async ({ id, data }: { id: string; data?: Record<string, any> }) => {
    await microInteractionService.trigger(id, data);
    return { id, data };
  }
);

// 停止微交互
export const stopMicroInteraction = createAsyncThunk(
  'microInteraction/stop',
  async (id: string) => {
    microInteractionService.stop(id);
    return { id };
  }
);

// 重置微交互
export const resetMicroInteraction = createAsyncThunk(
  'microInteraction/reset',
  async (id: string) => {
    microInteractionService.reset(id);
    return { id };
  }
);

// 批量觸發微交互
export const triggerMultipleMicroInteractions = createAsyncThunk(
  'microInteraction/triggerMultiple',
  async ({ ids, data }: { ids: string[]; data?: Record<string, any> }) => {
    await microInteractionService.triggerMultiple(ids, data);
    return { ids, data };
  }
);

// 停止所有微交互
export const stopAllMicroInteractions = createAsyncThunk(
  'microInteraction/stopAll',
  async () => {
    microInteractionService.stopAll();
    return {};
  }
);

// 重置所有微交互
export const resetAllMicroInteractions = createAsyncThunk(
  'microInteraction/resetAll',
  async () => {
    microInteractionService.resetAll();
    return {};
  }
);

// 更新配置
export const updateMicroInteractionConfig = createAsyncThunk(
  'microInteraction/updateConfig',
  async ({
    id,
    config,
  }: {
    id: string;
    config: Partial<MicroInteractionConfig>;
  }) => {
    microInteractionService.updateConfig(id, config);
    return { id, config };
  }
);

// 啟用性能監控
export const enablePerformanceMonitoring = createAsyncThunk(
  'microInteraction/enablePerformanceMonitoring',
  async (enabled: boolean) => {
    microInteractionService.enablePerformanceMonitoring(enabled);
    return { enabled };
  }
);

// 更新統計
export const updateMicroInteractionStats = createAsyncThunk(
  'microInteraction/updateStats',
  async () => {
    const stats = microInteractionService.getStats();
    return { stats };
  }
);

// 創建 slice
const microInteractionSlice = createSlice({
  name: 'microInteraction',
  initialState,
  reducers: {
    // 設置加載狀態
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 設置錯誤
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 更新微交互狀態
    updateInteractionState: (
      state,
      action: PayloadAction<{ id: string; state: MicroInteractionState }>
    ) => {
      const { id, state: interactionState } = action.payload;
      state.states[id] = interactionState;
    },

    // 更新性能指標
    updatePerformance: (
      state,
      action: PayloadAction<{
        id: string;
        performance: MicroInteractionPerformance;
      }>
    ) => {
      const { id, performance } = action.payload;
      state.performances[id] = performance;
    },

    // 添加事件
    addEvent: (state, action: PayloadAction<MicroInteractionEvent>) => {
      state.events.push(action.payload);
      // 限制事件歷史數量
      if (state.events.length > 100) {
        state.events = state.events.slice(-100);
      }
    },

    // 清除事件歷史
    clearEvents: state => {
      state.events = [];
    },

    // 設置調試模式
    setDebugMode: (state, action: PayloadAction<boolean>) => {
      state.debugMode = action.payload;
    },

    // 更新配置
    updateConfig: (
      state,
      action: PayloadAction<Partial<MicroInteractionManagerConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // 重置狀態
    resetState: state => {
      state.interactions = {};
      state.states = {};
      state.performances = {};
      state.events = [];
      state.stats = {
        totalInteractions: 0,
        successfulInteractions: 0,
        failedInteractions: 0,
        averageDuration: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        userSatisfactionScore: 0,
      };
    },
  },
  extraReducers: builder => {
    // 初始化
    builder
      .addCase(initializeMicroInteractionService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        initializeMicroInteractionService.fulfilled,
        (state, action) => {
          state.loading = false;
          state.initialized = true;
          state.config = action.payload.config;
        }
      )
      .addCase(initializeMicroInteractionService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '初始化失敗';
      });

    // 註冊
    builder.addCase(registerMicroInteraction.fulfilled, (state, action) => {
      const { id, config } = action.payload;
      state.interactions[id] = config;
      state.states[id] = {
        id,
        config,
        status: MicroInteractionStatus.IDLE,
        progress: 0,
      } as any;
    });

    // 註銷
    builder.addCase(unregisterMicroInteraction.fulfilled, (state, action) => {
      const { id } = action.payload;
      delete state.interactions[id];
      delete state.states[id];
      delete state.performances[id];
    });

    // 觸發
    builder
      .addCase(triggerMicroInteraction.pending, (state, action) => {
        const { id } = action.meta.arg;
        if (state.states[id]) {
          state.states[id].status = MicroInteractionStatus.TRIGGERED;
          (state.states[id] as any).progress = 0;
        }
      })
      .addCase(triggerMicroInteraction.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.states[id]) {
          state.states[id].status = MicroInteractionStatus.COMPLETED;
          (state.states[id] as any).progress = 1;
          state.states[id].endTime = Date.now();
        }
      })
      .addCase(triggerMicroInteraction.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state.states[id]) {
          state.states[id].status = MicroInteractionStatus.ERROR;
          state.states[id].error = action.error.message || '觸發失敗';
          state.states[id].endTime = Date.now();
        }
      });

    // 停止
    builder.addCase(stopMicroInteraction.fulfilled, (state, action) => {
      const { id } = action.payload;
      if (state.states[id]) {
        state.states[id].status = MicroInteractionStatus.IDLE;
        (state.states[id] as any).progress = 0;
      }
    });

    // 重置
    builder.addCase(resetMicroInteraction.fulfilled, (state, action) => {
      const { id } = action.payload;
      if (state.states[id]) {
        state.states[id].status = MicroInteractionStatus.IDLE;
        (state.states[id] as any).progress = 0;
        (state.states[id] as any).startTime = undefined;
        (state.states[id] as any).endTime = undefined;
        (state.states[id] as any).error = undefined;
        (state.states[id] as any).data = undefined;
      }
    });

    // 批量操作
    builder
      .addCase(stopAllMicroInteractions.fulfilled, state => {
        Object.values(state.states).forEach(interactionState => {
          interactionState.status = MicroInteractionStatus.IDLE;
          (interactionState as any).progress = 0;
        });
      })
      .addCase(resetAllMicroInteractions.fulfilled, state => {
        Object.values(state.states).forEach(interactionState => {
          interactionState.status = MicroInteractionStatus.IDLE;
          (interactionState as any).progress = 0;
          (interactionState as any).startTime = undefined;
          (interactionState as any).endTime = undefined;
          (interactionState as any).error = undefined;
          (interactionState as any).data = undefined;
        });
      });

    // 更新配置
    builder.addCase(
      updateMicroInteractionConfig.fulfilled,
      (state, action) => {
        const { id, config } = action.payload;
        if (state.interactions[id]) {
          state.interactions[id] = { ...state.interactions[id], ...config };
          if (state.states[id]) {
            state.states[id].config = state.interactions[id];
          }
        }
      }
    );

    // 性能監控
    builder.addCase(enablePerformanceMonitoring.fulfilled, (state, action) => {
      state.performanceMonitoring = action.payload.enabled;
    });

    // 更新統計
    builder.addCase(updateMicroInteractionStats.fulfilled, (state, action) => {
      state.stats = action.payload.stats;
    });
  },
});

// 導出 actions
export const {
  setLoading,
  setError,
  clearError,
  updateInteractionState,
  updatePerformance,
  addEvent,
  clearEvents,
  setDebugMode,
  updateConfig,
  resetState,
} = microInteractionSlice.actions;

// 導出 reducer
export default microInteractionSlice.reducer;

// 選擇器
export const selectMicroInteractionState = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction;

export const selectMicroInteractionInitialized = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.initialized;

export const selectMicroInteractionLoading = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.loading;

export const selectMicroInteractionError = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.error;

export const selectMicroInteractionConfig = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.config;

export const selectMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.interactions;

export const selectMicroInteractionStates = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.states;

export const selectMicroInteractionPerformances = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.performances;

export const selectMicroInteractionStats = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.stats;

export const selectMicroInteractionEvents = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.events;

export const selectMicroInteractionPerformanceMonitoring = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.performanceMonitoring;

export const selectMicroInteractionDebugMode = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.debugMode;

// 特定選擇器
export const selectMicroInteractionById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.interactions[id];

export const selectMicroInteractionStateById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.states[id];

export const selectMicroInteractionPerformanceById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.performances[id];

export const selectActiveMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState =>
      interactionState.status === MicroInteractionStatus.PLAYING
  );

export const selectCompletedMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState =>
      interactionState.status === MicroInteractionStatus.COMPLETED
  );

export const selectFailedMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState => interactionState.status === MicroInteractionStatus.ERROR
  );
