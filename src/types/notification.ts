/**
 * 通知設置類型定義
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
 * 推送通知設置
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
 * 通知頻率設置
 */
export interface NotificationFrequency {
  priceAlerts: 'immediate' | 'hourly' | 'daily' | 'weekly';
  marketUpdates: 'immediate' | 'daily' | 'weekly';
  investmentAdvice: 'immediate' | 'daily' | 'weekly';
  systemNotifications: 'immediate' | 'daily';
}

/**
 * 通知時間設置
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
 * 完整的通知配置
 */
export interface NotificationConfig {
  settings: NotificationSettings;
  push: PushNotificationSettings;
  frequency: NotificationFrequency;
  time: NotificationTimeSettings;
}
