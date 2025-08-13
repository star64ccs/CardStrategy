import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState, AppSettings, PrivacySettings, SecuritySettings } from '@/types';
import { settingsService } from '@/services/settingsService';

// 異步 thunk
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const response = await settingsService.getSettings();
    return response;
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings: Partial<AppSettings>) => {
    const response = await settingsService.updateSettings(settings);
    return response;
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async () => {
    const response = await settingsService.resetSettings();
    return response;
  }
);

// 初始狀態
const initialState: SettingsState = {
  settings: {
    theme: {
      mode: 'light',
      primaryColor: '#1C2B3A',
      accentColor: '#CBA135'
    },
    language: {
      current: 'zh-TW',
      available: ['zh-TW', 'en-US', 'ja-JP'],
      fallback: 'en-US'
    },
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      marketAlerts: true,
      priceAlerts: true,
      newsAlerts: true,
      socialAlerts: false
    },
    privacy: {
      profileVisibility: 'public',
      collectionVisibility: 'public',
      activityVisibility: 'public',
      dataSharing: true,
      analyticsEnabled: true
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      screenReader: false,
      reducedMotion: false,
      colorBlindness: 'none'
    },
    performance: {
      imageQuality: 'medium',
      cacheEnabled: true,
      offlineMode: false,
      dataSync: true,
      cacheSize: 100
    },
    display: {
      currency: 'TWD',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US',
      timezone: 'Asia/Taipei'
    },
    security: {
      sessionTimeout: 30,
      requireBiometric: false,
      autoLock: true,
      encryptionLevel: 'medium'
    }
  },
  isLoading: false,
  error: null,
  isUpdating: false
};

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSetting: (state, action: PayloadAction<{ path: string; value: any }>) => {
      const { path, value } = action.payload;
      const keys = path.split('.');
      let current: any = state.settings;

      // 遍歷到最後一個鍵的父級
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current && typeof current === 'object' && key && key in current) {
          current = current[key];
        } else {
          return; // 路徑無效，直接返回
        }
      }

      // 設置最後一個鍵的值
      const lastKey = keys[keys.length - 1];
      if (current && typeof current === 'object' && lastKey) {
        current[lastKey] = value;
      }
    },
    toggleNotification: (state, action: PayloadAction<string>) => {
      const notificationType = action.payload as keyof typeof state.settings.notifications;
      if (state.settings.notifications[notificationType] !== undefined) {
        state.settings.notifications[notificationType] = !state.settings.notifications[
          notificationType
        ];
      }
    },
    togglePrivacySetting: (state, action: PayloadAction<keyof PrivacySettings>) => {
      const privacyType = action.payload;
      if (state.settings.privacy && privacyType in state.settings.privacy) {
        (state.settings.privacy as any)[privacyType] = !(
          state.settings.privacy as any
        )[privacyType];
      }
    },
    toggleSecuritySetting: (state, action: PayloadAction<keyof SecuritySettings>) => {
      const securityType = action.payload;
      if (state.settings.security && securityType in state.settings.security) {
        (state.settings.security as any)[securityType] = !(
          state.settings.security as any
        )[securityType];
      }
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      if (state.settings.language) {
        state.settings.language.current = action.payload;
      }
    },
    setTheme: (state, action: PayloadAction<string>) => {
      if (state.settings.theme) {
        state.settings.theme.mode = action.payload as 'light' | 'dark' | 'auto';
      }
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.settings.display.currency = action.payload;
    },
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.settings.display.dateFormat = action.payload;
    },
    setImageQuality: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.settings.performance.imageQuality = action.payload;
    },
    setCacheSize: (state, action: PayloadAction<number>) => {
      state.settings.performance.cacheSize = action.payload;
    },
    setSessionTimeout: (state, action: PayloadAction<number>) => {
      state.settings.security.sessionTimeout = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch User Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update User Settings
    builder
      .addCase(updateSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Reset Settings
    builder
      .addCase(resetSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  clearError,
  updateSetting,
  toggleNotification,
  togglePrivacySetting,
  toggleSecuritySetting,
  setLanguage,
  setTheme,
  setCurrency,
  setDateFormat,
  setImageQuality,
  setCacheSize,
  setSessionTimeout
} = settingsSlice.actions;

export default settingsSlice.reducer;
