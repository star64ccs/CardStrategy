import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import ThemeService from '../../features/theme/services/themeService';
import type {
  Theme,
  ThemeConfig,
  ThemeChangeRequest,
  ThemeCustomization,
  ThemeEvent,
  ThemeState,
} from '../../features/theme/types/theme';

// 初始狀態
const initialState: ThemeState = {
  currentTheme: {
    id: 'light',
    name: '淺色主題',
    type: 'light',
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      card: '#FFFFFF',
      text: {
        primary: '#000000',
        secondary: '#8E8E93',
        disabled: '#C7C7CC',
        inverse: '#FFFFFF',
      },
      border: '#C6C6C8',
      divider: '#C6C6C8',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      highlight: '#F0F8FF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        mono: 'System',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    borderRadius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },
  },
  availableThemes: [],
  config: {
    defaultTheme: 'light',
    availableThemes: ['light', 'dark', 'auto'],
    autoThemeEnabled: false,
    systemThemeDetection: true,
    themePersistence: true,
  },
  isAutoTheme: false,
  systemTheme: 'light',
  isLoading: false,
  error: null,
};

// Async thunks
export const _initializeTheme = createAsyncThunk(
  'theme/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.initialize();

      return {
        currentTheme: themeService.getCurrentTheme(),
        availableThemes: themeService.getAvailableThemes(),
        isAutoTheme: themeService.isAutoThemeEnabled(),
        systemTheme: themeService.getSystemTheme(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to initialize theme'
      );
    }
  }
);

export const _setTheme = createAsyncThunk(
  'theme/setTheme',
  async (request: ThemeChangeRequest, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.setTheme(request.themeId);

      return {
        currentTheme: themeService.getCurrentTheme(),
        isAutoTheme: themeService.isAutoThemeEnabled(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to set theme'
      );
    }
  }
);

export const _toggleTheme = createAsyncThunk(
  'theme/toggleTheme',
  async (_, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.toggleTheme();

      return {
        currentTheme: themeService.getCurrentTheme(),
        isAutoTheme: themeService.isAutoThemeEnabled(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to toggle theme'
      );
    }
  }
);

export const _setAutoTheme = createAsyncThunk(
  'theme/setAutoTheme',
  async (enabled: boolean, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.setAutoTheme(enabled);

      return {
        currentTheme: themeService.getCurrentTheme(),
        isAutoTheme: themeService.isAutoThemeEnabled(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to set auto theme'
      );
    }
  }
);

export const _customizeTheme = createAsyncThunk(
  'theme/customizeTheme',
  async (customization: ThemeCustomization, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.customizeTheme(customization);

      return {
        availableThemes: themeService.getAvailableThemes(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to customize theme'
      );
    }
  }
);

export const _resetTheme = createAsyncThunk(
  'theme/resetTheme',
  async (_, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.resetTheme();

      return {
        currentTheme: themeService.getCurrentTheme(),
        isAutoTheme: themeService.isAutoThemeEnabled(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to reset theme'
      );
    }
  }
);

export const _exportTheme = createAsyncThunk(
  'theme/exportTheme',
  async (themeId: string, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      return await themeService.exportTheme(themeId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to export theme'
      );
    }
  }
);

export const _importTheme = createAsyncThunk(
  'theme/importTheme',
  async (themeData: string, { rejectWithValue }) => {
    try {
      const _themeService = ThemeService.getInstance();
      await themeService.importTheme(themeData);

      return {
        availableThemes: themeService.getAvailableThemes(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to import theme'
      );
    }
  }
);

// Theme slice
const _themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // 同步 reducers
    setCurrentTheme: (state, action: PayloadAction<Theme>) => {
      state.currentTheme = action.payload;
    },

    setAvailableThemes: (state, action: PayloadAction<Theme[]>) => {
      state.availableThemes = action.payload;
    },

    setConfig: (state, action: PayloadAction<Partial<ThemeConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },

    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: state => {
      state.error = null;
    },

    // 事件處理
    handleThemeEvent: (state, action: PayloadAction<ThemeEvent>) => {
      const _event = action.payload;

      switch (event.type) {
        case 'theme_changed':
          // 主題變更事件已在 async thunk 中處理
          break;
        case 'theme_loaded':
          // 主題載入完成
          break;
        case 'theme_error':
          state.error = event.data?.error || 'Theme error occurred';
          break;
      }
    },
  },
  extraReducers: builder => {
    builder
      // initializeTheme
      .addCase(initializeTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTheme = action.payload.currentTheme;
        state.availableThemes = action.payload.availableThemes;
        state.isAutoTheme = action.payload.isAutoTheme;
        state.systemTheme = action.payload.systemTheme;
      })
      .addCase(initializeTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // setTheme
      .addCase(setTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTheme = action.payload.currentTheme;
        state.isAutoTheme = action.payload.isAutoTheme;
      })
      .addCase(setTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // toggleTheme
      .addCase(toggleTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTheme = action.payload.currentTheme;
        state.isAutoTheme = action.payload.isAutoTheme;
      })
      .addCase(toggleTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // setAutoTheme
      .addCase(setAutoTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setAutoTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTheme = action.payload.currentTheme;
        state.isAutoTheme = action.payload.isAutoTheme;
      })
      .addCase(setAutoTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // customizeTheme
      .addCase(customizeTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(customizeTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableThemes = action.payload.availableThemes;
      })
      .addCase(customizeTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // resetTheme
      .addCase(resetTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTheme = action.payload.currentTheme;
        state.isAutoTheme = action.payload.isAutoTheme;
      })
      .addCase(resetTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // exportTheme
      .addCase(exportTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportTheme.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(exportTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // importTheme
      .addCase(importTheme.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableThemes = action.payload.availableThemes;
      })
      .addCase(importTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentTheme,
  setAvailableThemes,
  setConfig,
  setSystemTheme,
  setError,
  clearError,
  handleThemeEvent,
} = themeSlice.actions;

export default themeSlice.reducer;
