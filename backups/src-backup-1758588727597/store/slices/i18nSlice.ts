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

// 初始狀態
const initialState: I18nState = {
  currentLanguage: 'zh-TW',
  availableLanguages: {},
  isInitialized: false,
  isLoading: false,
  error: null,
  lastUpdated: new Date(),
};

// 異步 thunk 動作
export const initializeI18n = createAsyncThunk(
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

export const changeLanguage = createAsyncThunk(
  'i18n/changeLanguage',
  async (request: LanguageChangeRequest, { rejectWithValue }) => {
    try {
      const response = await i18nService.changeLanguage(request.language);
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

export const detectLanguage = createAsyncThunk(
  'i18n/detectLanguage',
  async (_, { rejectWithValue }) => {
    try {
      const detectedLanguage = await i18nService.detectLanguage();
      return { detectedLanguage };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const getTranslationStats = createAsyncThunk(
  'i18n/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = i18nService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export const translateText = createAsyncThunk(
  'i18n/translate',
  async (request: TranslationRequest, { rejectWithValue }) => {
    try {
      const text = i18nService.translate(request.key, request.options);
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

// 創建 slice
const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    // 同步狀態更新
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

    // 事件處理
    addEvent: (state, action: PayloadAction<I18nEvent>) => {
      // 可以選擇將事件存儲在狀態中或只是更新相關狀態
      state.lastUpdated = action.payload.timestamp;

      // 根據事件類型更新狀態
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

    // 重置狀態
    reset: state => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    // 初始化
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

    // 切換語言
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

    // 檢測語言
    builder
      .addCase(detectLanguage.pending, state => {
        state.isLoading = true;
      })
      .addCase(detectLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        // 可以選擇自動切換到檢測到的語言
        // state.currentLanguage = action.payload.detectedLanguage;
      })
      .addCase(detectLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取統計
    builder.addCase(getTranslationStats.fulfilled, (state, action) => {
      // 統計信息可以存儲在狀態中或只是返回
      state.lastUpdated = action.payload.lastUpdated;
    });

    // 翻譯
    builder.addCase(translateText.fulfilled, (state, action) => {
      // 翻譯結果通常不需要存儲在狀態中，因為它們是即時的
      state.lastUpdated = new Date();
    });
  },
});

// 導出動作
export const {
  setCurrentLanguage,
  setAvailableLanguages,
  setLoading,
  setError,
  clearError,
  addEvent,
  reset,
} = i18nSlice.actions;

// 選擇器
export const selectCurrentLanguage = (state: { i18n: I18nState }) =>
  state.i18n.currentLanguage;
export const selectAvailableLanguages = (state: { i18n: I18nState }) =>
  state.i18n.availableLanguages;
export const selectIsInitialized = (state: { i18n: I18nState }) =>
  state.i18n.isInitialized;
export const selectIsLoading = (state: { i18n: I18nState }) =>
  state.i18n.isLoading;
export const selectError = (state: { i18n: I18nState }) => state.i18n.error;
export const selectLastUpdated = (state: { i18n: I18nState }) =>
  state.i18n.lastUpdated;

// 計算選擇器
export const selectCurrentLanguageInfo = (state: { i18n: I18nState }) => {
  const currentLang = state.i18n.currentLanguage;
  return state.i18n.availableLanguages[currentLang];
};

export const selectIsRTL = (state: { i18n: I18nState }) => {
  const currentLang = state.i18n.currentLanguage;
  const langInfo = state.i18n.availableLanguages[currentLang];
  return langInfo?.direction === 'rtl';
};

export const selectLanguageCount = (state: { i18n: I18nState }) => {
  return Object.keys(state.i18n.availableLanguages).length;
};

// 導出 reducer
export default i18nSlice.reducer;
