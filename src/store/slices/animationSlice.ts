import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { animationService } from '../../services/animationService';
import type {
  AnimationConfig,
  AnimationEvent,
  AnimationManagerConfig,
  AnimationPerformance,
  AnimationPreferences,
  AnimationState,
  PresetAnimation,
} from '../../types/animation';

// 初始Status
const initialState: AnimationState = {
  animations: {},
  preferences: {
    reducedMotion: false,
    prefersAnimation: true,
    animationDuration: 'normal',
    animationIntensity: 'normal',
  },
  performanceMonitoring: {
    enabled: false,
    metrics: {
      fps: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    },
  },
  presets: {},
  globalConfig: {
    maxConcurrentAnimations: 10,
    performanceThreshold: 30,
    enablePerformanceMonitoring: true,
    enablePrefersReducedMotion: true,
    defaultEasing: 'ease-out',
    defaultDuration: 300,
  },
  isInitialized: false,
  error: null,
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  progress: 0,
  direction: 'normal',
} as any;

// Async Action Creators
export const _initializeAnimationService = createAsyncThunk(
  'animation/initialize',
  async (_, { dispatch }) => {
    try {
      // Initialize動畫Service
      const _preferences = animationService.getPreferences();
      const _presets = animationService.getAllPresets();
      const _performance = animationService.getPerformance();

      // SettingsEvent監聽
      animationService.on('animationStarted', event => {
        dispatch(animationStarted(event));
      });

      animationService.on('animationEnded', event => {
        dispatch(animationEnded(event));
      });

      animationService.on('animationPaused', event => {
        dispatch(animationPaused(event));
      });

      animationService.on('animationStopped', event => {
        dispatch(animationStopped(event));
      });

      animationService.on('preferencesChanged', event => {
        dispatch(preferencesChanged(event));
      });

      return {
        preferences,
        presets: presets.reduce(
          (acc, preset) => {
            acc[preset.name] = preset;
            return acc;
          },
          {} as Record<string, PresetAnimation>
        ),
        performance,
      };
    } catch (error) {
      throw new Error(`Initialize動畫ServiceFailed: ${error}`);
    }
  }
);

export const _createAnimation = createAsyncThunk(
  'animation/create',
  async (config: AnimationConfig, { dispatch }) => {
    try {
      const _id = animationService.createAnimation(config);
      return { id, config };
    } catch (error) {
      throw new Error(`Create動畫Failed: ${error}`);
    }
  }
);

export const _playAnimation = createAsyncThunk(
  'animation/play',
  async (id: string, { dispatch }) => {
    try {
      await animationService.playAnimation(id);
      return id;
    } catch (error) {
      throw new Error(`播放動畫Failed: ${error}`);
    }
  }
);

export const _pauseAnimation = createAsyncThunk(
  'animation/pause',
  async (id: string, { dispatch }) => {
    try {
      animationService.pauseAnimation(id);
      return id;
    } catch (error) {
      throw new Error(`暫停動畫Failed: ${error}`);
    }
  }
);

export const _stopAnimation = createAsyncThunk(
  'animation/stop',
  async (id: string, { dispatch }) => {
    try {
      animationService.stopAnimation(id);
      return id;
    } catch (error) {
      throw new Error(`停止動畫Failed: ${error}`);
    }
  }
);

export const _updateAnimationConfig = createAsyncThunk(
  'animation/updateConfig',
  async (
    { id, config }: { id: string; config: Partial<AnimationConfig> },
    { dispatch }
  ) => {
    try {
      animationService.updateConfig(id, config);
      return { id, config };
    } catch (error) {
      throw new Error(`Update動畫ConfigureFailed: ${error}`);
    }
  }
);

export const _updatePreferences = createAsyncThunk(
  'animation/updatePreferences',
  async (preferences: Partial<AnimationPreferences>, { dispatch }) => {
    try {
      animationService.updatePreferences(preferences);
      return preferences;
    } catch (error) {
      throw new Error(`Update偏好SettingsFailed: ${error}`);
    }
  }
);

export const _enablePerformanceMonitoring = createAsyncThunk(
  'animation/enablePerformanceMonitoring',
  async (enabled: boolean, { dispatch }) => {
    try {
      animationService.enablePerformanceMonitoring(enabled);
      return enabled;
    } catch (error) {
      throw new Error(`啟用性能監控Failed: ${error}`);
    }
  }
);

export const _registerPreset = createAsyncThunk(
  'animation/registerPreset',
  async (preset: PresetAnimation, { dispatch }) => {
    try {
      animationService.registerPreset(preset);
      return preset;
    } catch (error) {
      throw new Error(`註冊預設動畫Failed: ${error}`);
    }
  }
);

// 動畫Event Action Creators
export const _animationStarted = createAsyncThunk(
  'animation/started',
  async (event: AnimationEvent) => {
    return event;
  }
);

export const _animationEnded = createAsyncThunk(
  'animation/ended',
  async (event: AnimationEvent) => {
    return event;
  }
);

export const _animationPaused = createAsyncThunk(
  'animation/paused',
  async (event: AnimationEvent) => {
    return event;
  }
);

export const _animationStopped = createAsyncThunk(
  'animation/stopped',
  async (event: AnimationEvent) => {
    return event;
  }
);

export const _preferencesChanged = createAsyncThunk(
  'animation/preferencesChanged',
  async (event: AnimationEvent) => {
    return event;
  }
);

// Create Slice
const _animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    // Sync Reducers
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: state => {
      state.error = null;
    },

    updatePerformanceMetrics: (
      state,
      action: PayloadAction<AnimationPerformance>
    ) => {
      state.performanceMonitoring.metrics = action.payload;
    },

    setGlobalConfig: (
      state,
      action: PayloadAction<Partial<AnimationManagerConfig>>
    ) => {
      state.globalConfig = { ...state.globalConfig, ...action.payload };
    },

    // 動畫StatusManage
    setAnimationState: (
      state,
      action: PayloadAction<{ id: string; state: unknown }>
    ) => {
      const { id, state: animationState } = action.payload;
      if (state.animations[id]) {
        state.animations[id] = {
          ...state.animations[id],
          state: animationState,
        } as any;
      }
    },

    removeAnimation: (state, action: PayloadAction<string>) => {
      const _id = action.payload;
      delete state.animations[id];
    },

    // BatchOperation
    playAllAnimations: state => {
      Object.keys(state.animations).forEach(id => {
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = true;
          (state.animations[id] as any).state.isPaused = false;
        }
      });
    },

    pauseAllAnimations: state => {
      Object.keys(state.animations).forEach(id => {
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = false;
          (state.animations[id] as any).state.isPaused = true;
        }
      });
    },

    stopAllAnimations: state => {
      Object.keys(state.animations).forEach(id => {
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = false;
          (state.animations[id] as any).state.isPaused = false;
          (state.animations[id] as any).state.progress = 0;
        }
      });
    },
  },
  extraReducers: builder => {
    builder
      // Initialize動畫Service
      .addCase(initializeAnimationService.pending, state => {
        state.isInitialized = false;
        state.error = null;
      })
      .addCase(initializeAnimationService.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.preferences = action.payload.preferences;
        state.presets = action.payload.presets as any;
        state.performanceMonitoring.metrics = action.payload.performance;
        state.error = null;
      })
      .addCase(initializeAnimationService.rejected, (state, action) => {
        state.isInitialized = false;
        state.error = action.error.message || 'InitializeFailed';
      })

      // Create動畫
      .addCase(createAnimation.fulfilled, (state, action) => {
        const { id, config } = action.payload;
        state.animations[id] = {
          config: action.payload.config,
          state: {
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
            progress: 0,
            direction: 'normal',
          },
          performance: {
            fps: 60,
            frameTime: 16.67,
            droppedFrames: 0,
            memoryUsage: 0,
            cpuUsage: 0,
          },
        } as any;
      })
      .addCase(createAnimation.rejected, (state, action) => {
        state.error = action.error.message || 'Create動畫Failed';
      })

      // 播放動畫
      .addCase(playAnimation.fulfilled, (state, action) => {
        const _id = action.payload;
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = true;
          (state.animations[id] as any).state.isPaused = false;
        }
      })
      .addCase(playAnimation.rejected, (state, action) => {
        state.error = action.error.message || '播放動畫Failed';
      })

      // Pause動畫
      .addCase(pauseAnimation.fulfilled, (state, action) => {
        const _id = action.payload;
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = false;
          (state.animations[id] as any).state.isPaused = true;
        }
      })
      .addCase(pauseAnimation.rejected, (state, action) => {
        state.error = action.error.message || '暫停動畫Failed';
      })

      // Stop動畫
      .addCase(stopAnimation.fulfilled, (state, action) => {
        const _id = action.payload;
        if (state.animations[id]) {
          (state.animations[id] as any).state.isPlaying = false;
          (state.animations[id] as any).state.isPaused = false;
          (state.animations[id] as any).state.progress = 0;
        }
      })
      .addCase(stopAnimation.rejected, (state, action) => {
        state.error = action.error.message || '停止動畫Failed';
      })

      // Update動畫Configure
      .addCase(updateAnimationConfig.fulfilled, (state, action) => {
        const { id, config } = action.payload;
        if (state.animations[id]) {
          (state.animations[id] as any).config = {
            ...(state.animations[id] as any).config,
            ...action.payload.config,
          };
        }
      })
      .addCase(updateAnimationConfig.rejected, (state, action) => {
        state.error = action.error.message || 'Update動畫ConfigureFailed';
      })

      // UpdatePreferencesSettings
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.error = action.error.message || 'Update偏好SettingsFailed';
      })

      // Enable性能Monitor
      .addCase(enablePerformanceMonitoring.fulfilled, (state, action) => {
        state.performanceMonitoring.enabled = action.payload;
      })
      .addCase(enablePerformanceMonitoring.rejected, (state, action) => {
        state.error = action.error.message || '啟用性能監控Failed';
      })

      // Register預設動畫
      .addCase(registerPreset.fulfilled, (state, action) => {
        const _preset = action.payload;
        state.presets[preset.name] = preset as any;
      })
      .addCase(registerPreset.rejected, (state, action) => {
        state.error = action.error.message || '註冊預設動畫Failed';
      })

      // 動畫EventHandle
      .addCase(animationStarted.fulfilled, (state, action) => {
        // 可以Root據需要Handle動畫BeginEvent
        console.log('動畫開始:', action.payload);
      })
      .addCase(animationEnded.fulfilled, (state, action) => {
        // 可以Root據需要Handle動畫EndEvent
        console.log('動畫結束:', action.payload);
      })
      .addCase(animationPaused.fulfilled, (state, action) => {
        // 可以Root據需要Handle動畫PauseEvent
        console.log('動畫暫停:', action.payload);
      })
      .addCase(animationStopped.fulfilled, (state, action) => {
        // 可以Root據需要Handle動畫StopEvent
        console.log('動畫停止:', action.payload);
      })
      .addCase(preferencesChanged.fulfilled, (state, action) => {
        // 可以Root據需要HandlePreferencesSettings變化Event
        console.log('偏好設置變化:', action.payload);
      });
  },
});

// Export Actions
export const {
  setError,
  clearError,
  updatePerformanceMetrics,
  setGlobalConfig,
  setAnimationState,
  removeAnimation,
  playAllAnimations,
  pauseAllAnimations,
  stopAllAnimations,
} = animationSlice.actions;

// Export Selectors
export const _selectAnimationState = (state: { animation: AnimationState }) =>
  state.animation;
export const _selectAnimations = (state: { animation: AnimationState }) =>
  state.animation.animations;
export const _selectPreferences = (state: { animation: AnimationState }) =>
  state.animation.preferences;
export const _selectPerformanceMetrics = (state: {
  animation: AnimationState;
}) => state.animation.performanceMonitoring.metrics;
export const _selectPresets = (state: { animation: AnimationState }) =>
  state.animation.presets;
export const _selectGlobalConfig = (state: { animation: AnimationState }) =>
  state.animation.globalConfig;
export const _selectIsInitialized = (state: { animation: AnimationState }) =>
  state.animation.isInitialized;
export const _selectError = (state: { animation: AnimationState }) =>
  state.animation.error;

// Export Reducer
export default animationSlice.reducer;
