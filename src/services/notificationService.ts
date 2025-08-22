import PushNotification from 'react-native-push-notification';

export interface NotificationConfig {
  title: string;
  message: string;
  data?: any;
  channelId?: string;
  priority?: 'high' | 'default' | 'low';
  vibrate?: boolean;
  sound?: boolean;
}

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  init() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        notification.finish();
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    this.createChannel(
      'default',
      'Default Channel',
      'Default notification channel'
    );
  }

  createChannel(
    channelId: string,
    channelName: string,
    channelDescription: string
  ) {
    PushNotification.createChannel(
      {
        channelId,
        channelName,
        channelDescription,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel ${channelId} created: ${created}`)
    );
  }

  showNotification(config: NotificationConfig) {
    const { title, message, data, channelId = 'default' } = config;

    PushNotification.localNotification({
      channelId,
      title,
      message,
      data,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }

  showSuccess(title: string, message: string, data?: any) {
    this.showNotification({ title, message, data });
  }

  showError(title: string, message: string, data?: any) {
    this.showNotification({ title, message, data });
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

// 導出服務類和實例
export { NotificationService };
export default NotificationService.getInstance();
