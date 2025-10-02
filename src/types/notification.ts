/**
 * NotificationSettingsClass型定義
 */
export interface NotificationSettings {
  priceAlerts: boolean;
  marketUpdates: boolean;
  investmentAdvice: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

/**
 * PushNotificationSettings
 */
export interface PushNotificationSettings {
  enabled: boolean;
  token?: string;
  platform: 'ios' | 'android' | 'web';
  permissions: {
    alert: boolean;
    badge: boolean;
    sound: boolean;
  };
}

/**
 * Notification頻率Settings
 */
export interface NotificationFrequency {
  priceAlerts: 'immediate' | 'hourly' | 'daily' | 'weekly';
  marketUpdates: 'immediate' | 'daily' | 'weekly';
  investmentAdvice: 'immediate' | 'daily' | 'weekly';
  systemNotifications: 'immediate' | 'daily';
}

/**
 * NotificationTimeSettings
 */
export interface NotificationTimeSettings {
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  timezone: string;
}

/**
 * 完整的NotificationConfigure
 */
export interface NotificationConfig {
  settings: NotificationSettings;
  push: PushNotificationSettings;
  frequency: NotificationFrequency;
  time: NotificationTimeSettings;
}
