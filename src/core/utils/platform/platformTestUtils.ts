import { Platform } from 'react-native';

// 平台特定測試配置
export interface PlatformTestConfig {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
  capabilities: {
    biometrics: boolean;
    pushNotifications: boolean;
    camera: boolean;
    location: boolean;
    storage: boolean;
  };
}

// 平台特定測試環境
export class PlatformTestEnvironment {
  private static instance: PlatformTestEnvironment;
  private currentPlatform: PlatformTestConfig;

  private constructor() {
    this.currentPlatform = this.detectPlatform();
  }

  static getInstance(): PlatformTestEnvironment {
    if (!PlatformTestEnvironment.instance) {
      PlatformTestEnvironment.instance = new PlatformTestEnvironment();
    }
    return PlatformTestEnvironment.instance;
  }

  private detectPlatform(): PlatformTestConfig {
    const _platform = Platform.OS;

    switch (platform) {
      case 'ios':
        return {
          platform: 'ios',
          version: Platform.Version?.toString() || '15.0',
          deviceType: 'phone',
          capabilities: {
            biometrics: true,
            pushNotifications: true,
            camera: true,
            location: true,
            storage: true,
          },
        };
      case 'android':
        return {
          platform: 'android',
          version: Platform.Version?.toString() || '30',
          deviceType: 'phone',
          capabilities: {
            biometrics: true,
            pushNotifications: true,
            camera: true,
            location: true,
            storage: true,
          },
        };
      case 'web':
        return {
          platform: 'web',
          version: 'latest',
          deviceType: 'desktop',
          capabilities: {
            biometrics: false,
            pushNotifications: true,
            camera: true,
            location: true,
            storage: true,
          },
        };
      default:
        return {
          platform: 'web',
          version: 'latest',
          deviceType: 'desktop',
          capabilities: {
            biometrics: false,
            pushNotifications: true,
            camera: true,
            location: true,
            storage: true,
          },
        };
    }
  }

  getCurrentPlatform(): PlatformTestConfig {
    return { ...this.currentPlatform };
  }

  setPlatform(config: PlatformTestConfig): void {
    this.currentPlatform = config;
  }

  // 平台特定測試輔助方法
  isIOS(): boolean {
    return this.currentPlatform.platform === 'ios';
  }

  isAndroid(): boolean {
    return this.currentPlatform.platform === 'android';
  }

  isWeb(): boolean {
    return this.currentPlatform.platform === 'web';
  }

  supportsBiometrics(): boolean {
    return this.currentPlatform.capabilities.biometrics;
  }

  supportsPushNotifications(): boolean {
    return this.currentPlatform.capabilities.pushNotifications;
  }

  supportsCamera(): boolean {
    return this.currentPlatform.capabilities.camera;
  }

  supportsLocation(): boolean {
    return this.currentPlatform.capabilities.location;
  }

  supportsStorage(): boolean {
    return this.currentPlatform.capabilities.storage;
  }
}

// 平台特定測試裝飾器
export function platformTest(platforms: ('ios' | 'android' | 'web')[]) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const _env = PlatformTestEnvironment.getInstance();
      const _currentPlatform = env.getCurrentPlatform();

      if (platforms.includes(currentPlatform.platform)) {
        return originalMethod.apply(this, args);
      } else {
        console.log(
          `跳過測試 ${propertyKey}，當前平台 ${currentPlatform.platform} 不在支持列表中`
        );
        return Promise.resolve();
      }
    };

    return descriptor;
  };
}

// 平台特定測試數據生成器
export class PlatformTestDataGenerator {
  static generateBiometricTestData(platform: 'ios' | 'android' | 'web') {
    switch (platform) {
      case 'ios':
        return {
          biometricType: 'FaceID',
          supportedTypes: ['FaceID', 'TouchID'],
          securityLevel: 'high',
        };
      case 'android':
        return {
          biometricType: 'Fingerprint',
          supportedTypes: ['Fingerprint', 'Face', 'Iris'],
          securityLevel: 'medium',
        };
      case 'web':
        return {
          biometricType: 'WebAuthn',
          supportedTypes: ['WebAuthn'],
          securityLevel: 'medium',
        };
    }
  }

  static generatePushNotificationTestData(platform: 'ios' | 'android' | 'web') {
    switch (platform) {
      case 'ios':
        return {
          provider: 'APNs',
          tokenType: 'deviceToken',
          permissions: ['alert', 'badge', 'sound'],
        };
      case 'android':
        return {
          provider: 'FCM',
          tokenType: 'fcmToken',
          permissions: ['notification'],
        };
      case 'web':
        return {
          provider: 'Web Push',
          tokenType: 'subscription',
          permissions: ['notification'],
        };
    }
  }

  static generateCameraTestData(platform: 'ios' | 'android' | 'web') {
    switch (platform) {
      case 'ios':
        return {
          cameraType: 'AVFoundation',
          permissions: ['camera', 'photoLibrary'],
          features: ['autoFocus', 'flash', 'zoom'],
        };
      case 'android':
        return {
          cameraType: 'Camera2',
          permissions: ['camera', 'storage'],
          features: ['autoFocus', 'flash', 'zoom'],
        };
      case 'web':
        return {
          cameraType: 'getUserMedia',
          permissions: ['camera'],
          features: ['autoFocus'],
        };
    }
  }
}

// 平台特定測試驗證器
export class PlatformTestValidator {
  static validateBiometricSupport(
    platform: 'ios' | 'android' | 'web'
  ): boolean {
    const _env = PlatformTestEnvironment.getInstance();
    return env.supportsBiometrics();
  }

  static validatePushNotificationSupport(
    platform: 'ios' | 'android' | 'web'
  ): boolean {
    const _env = PlatformTestEnvironment.getInstance();
    return env.supportsPushNotifications();
  }

  static validateCameraSupport(platform: 'ios' | 'android' | 'web'): boolean {
    const _env = PlatformTestEnvironment.getInstance();
    return env.supportsCamera();
  }

  static validateLocationSupport(platform: 'ios' | 'android' | 'web'): boolean {
    const _env = PlatformTestEnvironment.getInstance();
    return env.supportsLocation();
  }

  static validateStorageSupport(platform: 'ios' | 'android' | 'web'): boolean {
    const _env = PlatformTestEnvironment.getInstance();
    return env.supportsStorage();
  }
}

// 導出單例實例
export const _platformTestEnv = PlatformTestEnvironment.getInstance();
