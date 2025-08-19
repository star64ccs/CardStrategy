import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationSettings } from '@/types/notification';

// 默認通知設置
const defaultNotificationSettings: NotificationSettings = {
  priceAlerts: true,
  marketUpdates: true,
  investmentAdvice: true,
  systemNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true
};

interface SettingsState {
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  notificationSettings: defaultNotificationSettings,
  isLoading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 更新通知設置
    updateNotificationSettings: (state, action: PayloadAction<NotificationSettings>) => {
      state.notificationSettings = action.payload;
    },

    // 設置加載狀態
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 設置錯誤
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 重置設置
    resetSettings: (state) => {
      state.notificationSettings = defaultNotificationSettings;
      state.error = null;
    },

    // 切換單個設置
    toggleNotificationSetting: (state, action: PayloadAction<keyof NotificationSettings>) => {
      const key = action.payload;
      state.notificationSettings[key] = !state.notificationSettings[key];
    }
  }
});

export const {
  updateNotificationSettings,
  setLoading,
  setError,
  resetSettings,
  toggleNotificationSetting
} = settingsSlice.actions;

export default settingsSlice.reducer;
