// 微交互 Redux slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { microInteractionService } from '../../services/microInteractionService';
import type {
  MicroInteractionConfig,
  MicroInteractionEvent,
  MicroInteractionManagerConfig,
  MicroInteractionPerformance,
  MicroInteractionState,
  MicroInteractionStats,
} from '../../types/microInteractions';
import { MicroInteractionStatus } from '../../types/microInteractions';

// 初始Status
interface MicroInteractionSliceState {
  // ServiceStatus
  initialized: boolean;
  loading: boolean;
  error: string | null;

  // Configure
  config: MicroInteractionManagerConfig;

  // 微交互Manage
  interactions: Record<string, MicroInteractionConfig>;
  states: Record<string, MicroInteractionState>;
  performances: Record<string, MicroInteractionPerformance>;

  // Statistics
  stats: MicroInteractionStats;

  // Event歷史
  events: MicroInteractionEvent[];

  // 性能Monitor
  performanceMonitoring: boolean;

  // Debug模式
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

// Async Thunks

// Initialize微交互Service
export const _initializeMicroInteractionService = createAsyncThunk(
  'microInteraction/initialize',
  async (config?: Partial<MicroInteractionManagerConfig>) => {
    await microInteractionService.initialize(config);
    return { config: microInteractionService['config'] };
  }
);

// Register微交互
export const _registerMicroInteraction = createAsyncThunk(
  'microInteraction/register',
  async (config: MicroInteractionConfig) => {
    const _id = microInteractionService.register(config);
    return { id, config };
  }
);

// Logout微交互
export const _unregisterMicroInteraction = createAsyncThunk(
  'microInteraction/unregister',
  async (id: string) => {
    microInteractionService.unregister(id);
    return { id };
  }
);

// 觸發微交互
export const _triggerMicroInteraction = createAsyncThunk(
  'microInteraction/trigger',
  async ({ id, data }: { id: string; data?: Record<string, any> }) => {
    await microInteractionService.trigger(id, data);
    return { id, data };
  }
);

// Stop微交互
export const _stopMicroInteraction = createAsyncThunk(
  'microInteraction/stop',
  async (id: string) => {
    microInteractionService.stop(id);
    return { id };
  }
);

// Reset微交互
export const _resetMicroInteraction = createAsyncThunk(
  'microInteraction/reset',
  async (id: string) => {
    microInteractionService.reset(id);
    return { id };
  }
);

// Batch觸發微交互
export const _triggerMultipleMicroInteractions = createAsyncThunk(
  'microInteraction/triggerMultiple',
  async ({ ids, data }: { ids: string[]; data?: Record<string, any> }) => {
    await microInteractionService.triggerMultiple(ids, data);
    return { ids, data };
  }
);

// Stop所有微交互
export const _stopAllMicroInteractions = createAsyncThunk(
  'microInteraction/stopAll',
  async () => {
    microInteractionService.stopAll();
    return {};
  }
);

// Reset所有微交互
export const _resetAllMicroInteractions = createAsyncThunk(
  'microInteraction/resetAll',
  async () => {
    microInteractionService.resetAll();
    return {};
  }
);

// UpdateConfigure
export const _updateMicroInteractionConfig = createAsyncThunk(
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

// Enable性能Monitor
export const _enablePerformanceMonitoring = createAsyncThunk(
  'microInteraction/enablePerformanceMonitoring',
  async (enabled: boolean) => {
    microInteractionService.enablePerformanceMonitoring(enabled);
    return { enabled };
  }
);

// UpdateStatistics
export const _updateMicroInteractionStats = createAsyncThunk(
  'microInteraction/updateStats',
  async () => {
    const _stats = microInteractionService.getStats();
    return { stats };
  }
);

// Create slice
const _microInteractionSlice = createSlice({
  name: 'microInteraction',
  initialState,
  reducers: {
    // Settings加載Status
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // SettingsError
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ClearError
    clearError: state => {
      state.error = null;
    },

    // Update微交互Status
    updateInteractionState: (
      state,
      action: PayloadAction<{ id: string; state: MicroInteractionState }>
    ) => {
      const { id, state: interactionState } = action.payload;
      state.states[id] = interactionState;
    },

    // Update性能指標
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

    // AddEvent
    addEvent: (state, action: PayloadAction<MicroInteractionEvent>) => {
      state.events.push(action.payload);
      // LimitEvent歷史數量
      if (state.events.length > 100) {
        state.events = state.events.slice(-100);
      }
    },

    // ClearEvent歷史
    clearEvents: state => {
      state.events = [];
    },

    // SettingsDebug模式
    setDebugMode: (state, action: PayloadAction<boolean>) => {
      state.debugMode = action.payload;
    },

    // UpdateConfigure
    updateConfig: (
      state,
      action: PayloadAction<Partial<MicroInteractionManagerConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // ResetStatus
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
    // Initialize
    builder
      .addCase(initializeMicroInteractionService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeMicroInteractionService.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.config = action.payload.config;
      })
      .addCase(initializeMicroInteractionService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // Register
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

    // Logout
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
          state.states[id].error = action.error.message || '觸發Failed';
          state.states[id].endTime = Date.now();
        }
      });

    // Stop
    builder.addCase(stopMicroInteraction.fulfilled, (state, action) => {
      const { id } = action.payload;
      if (state.states[id]) {
        state.states[id].status = MicroInteractionStatus.IDLE;
        (state.states[id] as any).progress = 0;
      }
    });

    // Reset
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

    // BatchOperation
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

    // UpdateConfigure
    builder.addCase(updateMicroInteractionConfig.fulfilled, (state, action) => {
      const { id, config } = action.payload;
      if (state.interactions[id]) {
        state.interactions[id] = { ...state.interactions[id], ...config };
        if (state.states[id]) {
          state.states[id].config = state.interactions[id];
        }
      }
    });

    // 性能Monitor
    builder.addCase(enablePerformanceMonitoring.fulfilled, (state, action) => {
      state.performanceMonitoring = action.payload.enabled;
    });

    // UpdateStatistics
    builder.addCase(updateMicroInteractionStats.fulfilled, (state, action) => {
      state.stats = action.payload.stats;
    });
  },
});

// Export actions
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

// Export reducer
export default microInteractionSlice.reducer;

// Select器
export const _selectMicroInteractionState = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction;

export const _selectMicroInteractionInitialized = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.initialized;

export const _selectMicroInteractionLoading = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.loading;

export const _selectMicroInteractionError = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.error;

export const _selectMicroInteractionConfig = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.config;

export const _selectMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.interactions;

export const _selectMicroInteractionStates = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.states;

export const _selectMicroInteractionPerformances = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.performances;

export const _selectMicroInteractionStats = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.stats;

export const _selectMicroInteractionEvents = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.events;

export const _selectMicroInteractionPerformanceMonitoring = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.performanceMonitoring;

export const _selectMicroInteractionDebugMode = (state: {
  microInteraction: MicroInteractionSliceState;
}) => state.microInteraction.debugMode;

// SpecificSelect器
export const _selectMicroInteractionById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.interactions[id];

export const _selectMicroInteractionStateById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.states[id];

export const _selectMicroInteractionPerformanceById =
  (id: string) => (state: { microInteraction: MicroInteractionSliceState }) =>
    state.microInteraction.performances[id];

export const _selectActiveMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState =>
      interactionState.status === MicroInteractionStatus.PLAYING
  );

export const _selectCompletedMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState =>
      interactionState.status === MicroInteractionStatus.COMPLETED
  );

export const _selectFailedMicroInteractions = (state: {
  microInteraction: MicroInteractionSliceState;
}) =>
  Object.values(state.microInteraction.states).filter(
    interactionState => interactionState.status === MicroInteractionStatus.ERROR
  );
