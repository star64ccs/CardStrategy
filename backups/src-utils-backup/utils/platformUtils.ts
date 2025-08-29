import { Platform, Dimensions, StatusBar } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
// 條件導入 expo-haptics
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (error) {
  // expo-haptics 不可用時使用空實現
  Haptics = {
    impactAsync: () => Promise.resolve(),
    notificationAsync: () => Promise.resolve(),
    selectionAsync: () => Promise.resolve(),
  };
}

// 平台常數
export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

export type PlatformType = (typeof PLATFORMS)[keyof typeof PLATFORMS];

// 獲取當前平台
export const getCurrentPlatform = (): PlatformType => {
  if (Platform.OS === 'ios') return PLATFORMS.IOS;
  if (Platform.OS === 'android') return PLATFORMS.ANDROID;
  return PLATFORMS.WEB;
};

// 檢查是否為 iOS
export const isIOS = (): boolean => Platform.OS === 'ios';

// 檢查是否為 Android
export const isAndroid = (): boolean => Platform.OS === 'android';

// 檢查是否為 Web
export const isWeb = (): boolean => Platform.OS === 'web';

// 檢查是否為實體設備
export const isPhysicalDevice = (): boolean => Device.isDevice;

// 檢查是否為模擬器
export const isSimulator = (): boolean => !Device.isDevice;

// 獲取設備信息
export const getDeviceInfo = () => {
  return {
    platform: getCurrentPlatform(),
    isDevice: Device.isDevice,
    brand: Device.brand,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    modelId: Device.modelId,
    designName: Device.designName,
    productName: Device.productName,
    deviceYearClass: Device.deviceYearClass,
    totalMemory: Device.totalMemory,
    supportedCpuArchitectures: Device.supportedCpuArchitectures,
    osName: Device.osName,
    osVersion: Device.osVersion,
    osBuildId: Device.osBuildId,
    osInternalBuildId: Device.osInternalBuildId,
    deviceName: Device.deviceName,
    deviceType: Device.deviceType,
  };
};

// 屏幕尺寸和適配
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 0;

  return {
    width,
    height,
    statusBarHeight,
    isLandscape: width > height,
    isPortrait: height > width,
    // iOS 安全區域
    safeAreaTop: isIOS() ? 44 : statusBarHeight,
    safeAreaBottom: isIOS() ? 34 : 0,
  };
};

// 平台特定樣式
export const getPlatformStyles = () => {
  const platform = getCurrentPlatform();

  const platformStyles = {
    ios: {
      // iOS 特定樣式
      navigationBar: {
        headerStyle: {
          backgroundColor: '#007AFF',
          borderBottomColor: '#E5E5EA',
          borderBottomWidth: 0.5,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
      },
      button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        borderWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
    },
    android: {
      // Android 特定樣式
      navigationBar: {
        headerStyle: {
          backgroundColor: '#6200EE',
          elevation: 4,
        },
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
      },
      button: {
        backgroundColor: '#6200EE',
        borderRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 2,
      },
      card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        elevation: 2,
      },
      input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
    },
    web: {
      // Web 特定樣式
      navigationBar: {
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomColor: '#E5E5EA',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      },
      button: {
        backgroundColor: '#007AFF',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        cursor: 'pointer',
      },
      card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 10,
        paddingVertical: 6,
      },
    },
  } as const;

  return platformStyles[platform] || platformStyles.web;
};

// 平台特定手勢
export const getPlatformGestures = () => {
  return {
    // iOS 特定手勢
    ios: {
      // 3D Touch 支持
      forceTouch: isIOS() && Device.deviceType === Device.DeviceType.PHONE,
      // Haptic Feedback
      hapticFeedback: true,
      // 滑動手勢
      swipeBack: true,
    },

    // Android 特定手勢
    android: {
      // 長按手勢
      longPress: true,
      // 雙擊手勢
      doubleTap: true,
      // 滑動手勢
      swipeGesture: true,
    },
  };
};

// 平台特定動畫
export const getPlatformAnimations = () => {
  return {
    // iOS 動畫配置
    ios: {
      duration: 300,
      easing: 'ease-in-out',
      springConfig: {
        tension: 100,
        friction: 8,
      },
    },

    // Android 動畫配置
    android: {
      duration: 250,
      easing: 'ease-out',
      springConfig: {
        tension: 150,
        friction: 10,
      },
    },
  };
};

// 平台特定權限
export const getPlatformPermissions = () => {
  return {
    ios: {
      camera: 'NSCameraUsageDescription',
      photoLibrary: 'NSPhotoLibraryUsageDescription',
      location: 'NSLocationWhenInUseUsageDescription',
      microphone: 'NSMicrophoneUsageDescription',
      faceID: 'NSFaceIDUsageDescription',
      notifications: 'NSUserNotificationUsageDescription',
    },
    android: {
      camera: 'android.permission.CAMERA',
      storage: 'android.permission.READ_EXTERNAL_STORAGE',
      location: 'android.permission.ACCESS_FINE_LOCATION',
      microphone: 'android.permission.RECORD_AUDIO',
      biometric: 'android.permission.USE_BIOMETRIC',
      notifications: 'android.permission.POST_NOTIFICATIONS',
    },
  };
};

// 平台特定通知配置
export const getPlatformNotificationConfig = () => {
  return {
    ios: {
      // iOS 通知配置
      presentationOptions: [
        Notifications.AndroidNotificationSound.DEFAULT,
        Notifications.AndroidNotificationPriority.HIGH,
      ],
      // 角標支持
      badge: true,
      // 聲音支持
      sound: true,
      // 震動支持
      vibrate: true,
    },
    android: {
      // Android 通知配置
      channelId: 'cardstrategy_default',
      channelName: '卡策通知',
      channelDescription: '卡策應用通知',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default' as any,
      vibrate: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      // 通知圖標
      icon: 'ic_notification',
      // 通知顏色
      color: '#1C2B3A',
    },
  };
};

// 平台特定性能優化
export const getPlatformPerformanceConfig = () => {
  return {
    ios: {
      // iOS 性能配置
      imageCacheSize: 50 * 1024 * 1024, // 50MB
      maxConcurrentOperations: 4,
      memoryWarningThreshold: 0.8,
      // 電池優化
      batteryOptimization: true,
      // 後台處理限制
      backgroundProcessingLimit: 30, // 秒
    },
    android: {
      // Android 性能配置
      imageCacheSize: 100 * 1024 * 1024, // 100MB
      maxConcurrentOperations: 6,
      memoryWarningThreshold: 0.7,
      // RAM 優化
      ramOptimization: true,
      // 電池優化
      batteryOptimization: true,
      // 後台處理限制
      backgroundProcessingLimit: 60, // 秒
    },
  };
};

// 平台特定安全配置
export const getPlatformSecurityConfig = () => {
  return {
    ios: {
      // iOS 安全配置
      keychainAccessibility: 'kSecAttrAccessibleWhenUnlockedThisDeviceOnly',
      biometricType: 'FaceID',
      encryptionLevel: 'AES-256',
      // 越獄檢測
      jailbreakDetection: true,
      // 證書固定
      certificatePinning: true,
    },
    android: {
      // Android 安全配置
      biometricType: 'Fingerprint',
      encryptionLevel: 'AES-256',
      // Root 檢測
      rootDetection: true,
      // 證書固定
      certificatePinning: true,
      // 應用完整性檢查
      appIntegrityCheck: true,
    },
  };
};

// 平台特定錯誤處理
export const getPlatformErrorHandling = () => {
  return {
    ios: {
      // iOS 錯誤處理
      crashReporting: true,
      analytics: true,
      // 錯誤恢復
      errorRecovery: true,
      // 用戶反饋
      userFeedback: true,
    },
    android: {
      // Android 錯誤處理
      crashReporting: true,
      analytics: true,
      // 錯誤恢復
      errorRecovery: true,
      // 用戶反饋
      userFeedback: true,
      // ANR 檢測
      anrDetection: true,
    },
  };
};

// 平台特定無障礙功能
export const getPlatformAccessibility = () => {
  return {
    ios: {
      // iOS 無障礙功能
      voiceOver: true,
      switchControl: true,
      guidedAccess: true,
      // 動態字體
      dynamicType: true,
      // 高對比度
      highContrast: true,
      // 減少動畫
      reduceMotion: true,
    },
    android: {
      // Android 無障礙功能
      talkBack: true,
      switchAccess: true,
      // 動態字體
      dynamicType: true,
      // 高對比度
      highContrast: true,
      // 減少動畫
      reduceMotion: true,
      // 顏色反轉
      colorInversion: true,
    },
  };
};

// 平台特定本地化
export const getPlatformLocalization = () => {
  return {
    ios: {
      // iOS 本地化
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'HH:mm',
      numberFormat: 'en-US',
      currencyFormat: 'USD',
      // 地區設置
      locale: 'en_US',
      // 時區
      timezone: 'America/New_York',
    },
    android: {
      // Android 本地化
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'HH:mm',
      numberFormat: 'en-US',
      currencyFormat: 'USD',
      // 地區設置
      locale: 'en_US',
      // 時區
      timezone: 'America/New_York',
    },
  };
};

// 平台特定測試配置
export const getPlatformTestConfig = () => {
  return {
    ios: {
      // iOS 測試配置
      simulator: 'iPhone 15',
      osVersion: '17.0',
      // 測試設備
      testDevices: ['iPhone 15', 'iPhone 15 Pro', 'iPad Pro'],
      // 測試環境
      testEnvironment: 'simulator',
    },
    android: {
      // Android 測試配置
      emulator: 'Pixel_4_API_30',
      apiLevel: 30,
      // 測試設備
      testDevices: ['Pixel 4', 'Pixel 6', 'Samsung Galaxy S21'],
      // 測試環境
      testEnvironment: 'emulator',
    },
  };
};

// 平台特定部署配置
export const getPlatformDeploymentConfig = () => {
  return {
    ios: {
      // iOS 部署配置
      bundleIdentifier: 'com.cardstrategy.app',
      buildNumber: '1.0.0',
      // App Store 配置
      appStore: {
        teamId: 'YOUR_TEAM_ID',
        provisioningProfile: 'CardStrategy_AppStore',
        distributionCertificate: 'CardStrategy_Distribution',
      },
      // TestFlight 配置
      testFlight: {
        teamId: 'YOUR_TEAM_ID',
        provisioningProfile: 'CardStrategy_Development',
        developmentCertificate: 'CardStrategy_Development',
      },
    },
    android: {
      // Android 部署配置
      packageName: 'com.cardstrategy.app',
      versionCode: 1,
      versionName: '1.0.0',
      // Google Play 配置
      googlePlay: {
        track: 'production',
        releaseNotes: 'Initial release',
        // 簽名配置
        signingConfig: {
          keyAlias: 'cardstrategy',
          keyPassword: 'YOUR_KEY_PASSWORD',
          storeFile: 'cardstrategy.keystore',
          storePassword: 'YOUR_STORE_PASSWORD',
        },
      },
    },
  };
};

// 平台特定監控配置
export const getPlatformMonitoringConfig = () => {
  return {
    ios: {
      // iOS 監控配置
      performanceMonitoring: true,
      crashReporting: true,
      analytics: true,
      // 內存監控
      memoryMonitoring: true,
      // 電池監控
      batteryMonitoring: true,
      // 網絡監控
      networkMonitoring: true,
    },
    android: {
      // Android 監控配置
      performanceMonitoring: true,
      crashReporting: true,
      analytics: true,
      // 內存監控
      memoryMonitoring: true,
      // 電池監控
      batteryMonitoring: true,
      // 網絡監控
      networkMonitoring: true,
      // ANR 監控
      anrMonitoring: true,
    },
  };
};

// 平台特定功能支持檢查
export const getPlatformFeatureSupport = () => {
  return {
    ios: {
      // iOS 功能支持
      faceID: Device.deviceType === Device.DeviceType.PHONE,
      touchID: Device.deviceType === Device.DeviceType.PHONE,
      applePay: true,
      siri: true,
      spotlight: true,
      // 3D Touch
      forceTouch: Device.deviceType === Device.DeviceType.PHONE,
      // Haptic Feedback
      hapticFeedback: true,
      // 動態島
      dynamicIsland:
        Device.modelName?.includes('iPhone 14') ||
        Device.modelName?.includes('iPhone 15'),
    },
    android: {
      // Android 功能支持
      fingerprint: true,
      googlePay: true,
      googleAssistant: true,
      // 生物識別
      biometric: true,
      // 指紋識別
      fingerprintAuth: true,
      // 面部識別
      faceAuth: Device.deviceType === Device.DeviceType.PHONE,
      // 虹膜識別
      irisAuth: false,
      // 手勢導航
      gestureNavigation: true,
    },
  };
};

// 平台特定優化建議
export const getPlatformOptimizationSuggestions = () => {
  const platform = getCurrentPlatform();
  const deviceInfo = getDeviceInfo();

  const suggestions: Record<PlatformType, string[]> = {
    ios: ['iPhone', 'iPad', 'iOS', 'Apple'],
    android: ['Android', 'Samsung', 'Google', 'Huawei'],
    web: ['Web', 'Browser', 'Desktop', 'Mobile Web'],
  };

  return suggestions[platform] || [];
};

// 導出所有平台工具
export default {
  getCurrentPlatform,
  isIOS,
  isAndroid,
  isWeb,
  isPhysicalDevice,
  isSimulator,
  getDeviceInfo,
  getScreenDimensions,
  getPlatformStyles,
  getPlatformGestures,
  getPlatformAnimations,
  getPlatformPermissions,
  getPlatformNotificationConfig,
  getPlatformPerformanceConfig,
  getPlatformSecurityConfig,
  getPlatformErrorHandling,
  getPlatformAccessibility,
  getPlatformLocalization,
  getPlatformTestConfig,
  getPlatformDeploymentConfig,
  getPlatformMonitoringConfig,
  getPlatformFeatureSupport,
  getPlatformOptimizationSuggestions,
};
