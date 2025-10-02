import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { i18nService } from '../../features/i18n/services/i18nService';
import type {
  I18nEvent,
  I18nState,
  LanguageChangeRequest,
  LanguageInfo,
  TranslationRequest,
} from '../../features/i18n/types/i18n';

// 初始Status
const initialState: I18nState = {
  currentLanguage: 'zh-TW',
  availableLanguages: {},
  isInitialized: false,
  isLoading: false,
  error: null,
  lastUpdated: new Date(),
};

// Async thunk 動作
export const _initializeI18n = createAsyncThunk(
  'i18n/initialize',
  async (config: unknown = {}, { rejectWithValue }) => {
    try {
      await i18nService.initialize(config);
      return {
        currentLanguage: i18nService.getCurrentLanguage(),
        availableLanguages: i18nService.getAvailableLanguages(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const _changeLanguage = createAsyncThunk(
  'i18n/changeLanguage',
  async (request: LanguageChangeRequest, { rejectWithValue }) => {
    try {
      const _response = await i18nService.changeLanguage(request.language);
      if (!response.success) {
        throw new Error(response.error || 'Failed to change language');
      }
      return {
        newLanguage: response.newLanguage,
        previousLanguage: response.previousLanguage,
        message: response.message,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const _detectLanguage = createAsyncThunk(
  'i18n/detectLanguage',
  async (_, { rejectWithValue }) => {
    try {
      const _detectedLanguage = await i18nService.detectLanguage();
      return { detectedLanguage };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const _getTranslationStats = createAsyncThunk(
  'i18n/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _stats = i18nService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const _translateText = createAsyncThunk(
  'i18n/translate',
  async (request: TranslationRequest, { rejectWithValue }) => {
    try {
      const _text = i18nService.translate(request.key, request.options);
      return {
        key: request.key,
        namespace: request.namespace || 'translation',
        text,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

// Create slice
const _i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    // SyncStatusUpdate
    setCurrentLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
      state.lastUpdated = new Date();
    },

    setAvailableLanguages: (
      state,
      action: PayloadAction<Record<string, LanguageInfo>>
    ) => {
      state.availableLanguages = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: state => {
      state.error = null;
    },

    // EventHandle
    addEvent: (state, action: PayloadAction<I18nEvent>) => {
      // 可以Select將EventStorage在Status中或只YesUpdate相OffStatus
      state.lastUpdated = action.payload.timestamp;

      // Root據EventClass型UpdateStatus
      switch (action.payload.type) {
        case 'languageChanged':
          if (action.payload.data.language) {
            state.currentLanguage = action.payload.data.language;
          }
          break;
        case 'error':
          if (action.payload.data.error) {
            state.error = action.payload.data.error;
          }
          break;
        case 'initialized':
          state.isInitialized = true;
          break;
      }
    },

    // ResetStatus
    reset: state => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializeI18n.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeI18n.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentLanguage = action.payload.currentLanguage;
        state.availableLanguages = action.payload.availableLanguages;
        state.lastUpdated = new Date();
      })
      .addCase(initializeI18n.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // SwitchLanguage
    builder
      .addCase(changeLanguage.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLanguage = action.payload.newLanguage;
        state.lastUpdated = new Date();
      })
      .addCase(changeLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 檢測Language
    builder
      .addCase(detectLanguage.pending, state => {
        state.isLoading = true;
      })
      .addCase(detectLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        // 可以SelectAutoSwitch到檢測到的Language
        // state.currentLanguage = action.payload.detectedLanguage;
      })
      .addCase(detectLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // GetStatistics
    builder.addCase(getTranslationStats.fulfilled, (state, action) => {
      // StatisticsInformation可以Storage在Status中或只YesReturn
      state.lastUpdated = action.payload.lastUpdated;
    });

    // 翻譯
    builder.addCase(translateText.fulfilled, (state, action) => {
      // 翻譯結果通常不需要Storage在Status中，因為它們Yes即時的
      state.lastUpdated = new Date();
    });
  },
});

// Export動作
export const {
  setCurrentLanguage,
  setAvailableLanguages,
  setLoading,
  setError,
  clearError,
  addEvent,
  reset,
} = i18nSlice.actions;

// Select器
export const _selectCurrentLanguage = (state: { i18n: I18nState }) =>
  state.i18n.currentLanguage;
export const _selectAvailableLanguages = (state: { i18n: I18nState }) =>
  state.i18n.availableLanguages;
export const _selectIsInitialized = (state: { i18n: I18nState }) =>
  state.i18n.isInitialized;
export const _selectIsLoading = (state: { i18n: I18nState }) =>
  state.i18n.isLoading;
export const _selectError = (state: { i18n: I18nState }) => state.i18n.error;
export const _selectLastUpdated = (state: { i18n: I18nState }) =>
  state.i18n.lastUpdated;

// 計算Select器
export const _selectCurrentLanguageInfo = (state: { i18n: I18nState }) => {
  const _currentLang = state.i18n.currentLanguage;
  return state.i18n.availableLanguages[currentLang];
};

export const _selectIsRTL = (state: { i18n: I18nState }) => {
  const _currentLang = state.i18n.currentLanguage;
  const _langInfo = state.i18n.availableLanguages[currentLang];
  return langInfo?.direction === 'rtl';
};

export const _selectLanguageCount = (state: { i18n: I18nState }) => {
  return Object.keys(state.i18n.availableLanguages).length;
};

// Export reducer
export default i18nSlice.reducer;
