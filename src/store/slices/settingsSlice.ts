import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { NotificationSettings } from '../../types/notification';

// DefaultNotificationSettings
const defaultNotificationSettings: NotificationSettings = {
  priceAlerts: true,
  marketUpdates: true,
  investmentAdvice: true,
  systemNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

interface SettingsState {
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  notificationSettings: defaultNotificationSettings,
  isLoading: false,
  error: null,
};

const _settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // UpdateNotificationSettings
    updateNotificationSettings: (
      state,
      action: PayloadAction<NotificationSettings>
    ) => {
      state.notificationSettings = action.payload;
    },

    // Settings加載Status
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // SettingsError
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ResetSettings
    resetSettings: state => {
      state.notificationSettings = defaultNotificationSettings;
      state.error = null;
    },

    // SwitchSingleSettings
    toggleNotificationSetting: (
      state,
      action: PayloadAction<keyof NotificationSettings>
    ) => {
      const _key = action.payload;
      state.notificationSettings[key] = !state.notificationSettings[key];
    },
  },
});

export const {
  updateNotificationSettings,
  setLoading,
  setError,
  resetSettings,
  toggleNotificationSetting,
} = settingsSlice.actions;

export default settingsSlice.reducer;
