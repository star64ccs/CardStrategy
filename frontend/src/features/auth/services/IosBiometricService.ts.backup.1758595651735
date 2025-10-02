import { Platform } from 'react-native';

import type {
  BiometricAuthRequest,
  BiometricAuthResult,
  BiometricCapability,
  BiometricErrorCode,
  BiometricSecurityInfo,
  BiometricType,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';

// iOS 特定的生物識別接口
interface IOSBiometricLibrary {
  // 設備能力檢測
  isSensorAvailable(): Promise<BiometricType | null>;
  getBiometryType(): Promise<'FaceID' | 'TouchID' | null>;
  isDeviceSecure(): Promise<boolean>;

  // 密鑰管理
  createKeys(options?: IOSKeyOptions): Promise<boolean>;
  biometricKeysExist(): Promise<boolean>;
  deleteKeys(): Promise<boolean>;

  // 認證操作
  createSignature(
    promptMessage: string,
    payload: string
  ): Promise<IOSSignatureResult>;
  simplePrompt(config: IOSPromptConfig): Promise<IOSPromptResult>;

  // 高級功能
  invalidateKeys(): Promise<boolean>;
  getSecurityLevel(): Promise<'weak' | 'strong' | 'class3'>;
  isAttestationSupported(): Promise<boolean>;
}

interface IOSKeyOptions {
  accessControl?: string;
  accessible?: string;
  authenticationType?: string;
  authenticationPolicy?: string;
  keySize?: number;
  keyType?: string;
}

interface IOSSignatureResult {
  signature: string;
  success: boolean;
  error?: string;
}

interface IOSPromptResult {
  success: boolean;
  biometryType?: 'FaceID' | 'TouchID';
  error?: string;
  errorCode?: string;
}

interface IOSPromptConfig {
  title: string;
  subtitle?: string;
  description?: string;
  cancelButtonText: string;
  fallbackButtonText?: string;
  confirmationRequired?: boolean;
  deviceCredentialAllowed?: boolean;
}

/**
 * iOS 專用生物識別服務
 * 深度集成 Face ID / Touch ID 功能
 */
export class IOSBiometricService {
  private static instance: IOSBiometricService;
  private biometricLib: IOSBiometricLibrary | null = null;
  private isInitialized = false;
  private deviceCapabilities: BiometricCapability[] = [];
  private securityInfo: BiometricSecurityInfo | null = null;

  private constructor() {
    this.initializeIOSBiometricLibrary();
  }

  static getInstance(): IOSBiometricService {
    if (!IOSBiometricService.instance) {
      IOSBiometricService.instance = new IOSBiometricService();
    }
    return IOSBiometricService.instance;
  }

  /**
   * 初始化 iOS 生物識別庫
   */
  private async initializeIOSBiometricLibrary(): Promise<void> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('此服務僅支持 iOS 平台');
      }

      this.biometricLib = await this.loadIOSBiometricLibrary();
      await this.detectDeviceCapabilities();
      await this.initializeSecurityInfo();

      this.isInitialized = true;
      logger.info('iOS 生物識別服務初始化成功');
    } catch (error) {
      logger.error('iOS 生物識別服務初始化失敗:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 iOS 生物識別庫
   */
  private async loadIOSBiometricLibrary(): Promise<IOSBiometricLibrary> {
    // 在實際應用中，這裡會導入真實的 iOS 生物識別庫
    // 例如：react-native-biometrics, react-native-touch-id 等

    return {
      isSensorAvailable: async () => {
        // 模擬檢測 iOS 設備的生物識別能力
        const hasTouch = Math.random() > 0.3;
        const hasFace = Math.random() > 0.7;

        if (hasFace) return 'faceId';
        if (hasTouch) return 'touchId';
        return null;
      },

      getBiometryType: async () => {
        // 模擬獲取具體的生物識別類型
        const hasFace = Math.random() > 0.7;
        return hasFace ? 'FaceID' : 'TouchID';
      },

      isDeviceSecure: async () => {
        // 模擬檢查設備是否安全
        return Math.random() > 0.1;
      },

      createKeys: async (options?: IOSKeyOptions) => {
        // 模擬創建密鑰
        logger.info(
          '創建 iOS 生物識別密鑰',
          options as Record<string, unknown>
        );
        return true;
      },

      biometricKeysExist: async () => {
        // 模擬檢查密鑰是否存在
        return Math.random() > 0.5;
      },

      deleteKeys: async () => {
        // 模擬刪除密鑰
        logger.info('刪除 iOS 生物識別密鑰');
        return true;
      },

      createSignature: async (promptMessage: string, payload: string) => {
        // 模擬創建簽名
        const success = Math.random() > 0.3;
        if (success) {
          return {
            signature: `ios-signature-${Date.now()}`,
            success: true,
          };
        } else {
          return {
            signature: '',
            success: false,
            error: 'Authentication failed',
          };
        }
      },

      simplePrompt: async (config: IOSPromptConfig) => {
        // 模擬生物識別提示
        const success = Math.random() > 0.3;
        if (success) {
          const biometryType = Math.random() > 0.7 ? 'FaceID' : 'TouchID';
          return {
            success: true,
            biometryType,
          };
        } else {
          return {
            success: false,
            error: 'User canceled',
            errorCode: 'user_cancel',
          };
        }
      },

      invalidateKeys: async () => {
        // 模擬使密鑰失效
        logger.info('使 iOS 生物識別密鑰失效');
        return true;
      },

      getSecurityLevel: async () => {
        // 模擬獲取安全級別
        const levels: ('weak' | 'strong' | 'class3')[] = [
          'weak',
          'strong',
          'class3',
        ];
        return levels[Math.floor(Math.random() * levels.length)];
      },

      isAttestationSupported: async () => {
        // 模擬檢查是否支持認證
        return Math.random() > 0.5;
      },
    };
  }

  /**
   * 檢測設備能力
   */
  private async detectDeviceCapabilities(): Promise<void> {
    try {
      if (!this.biometricLib) return;

      const availableType = await this.biometricLib.isSensorAvailable();
      const biometryType = await this.biometricLib.getBiometryType();
      const isDeviceSecure = await this.biometricLib.isDeviceSecure();
      const keysExist = await this.biometricLib.biometricKeysExist();
      const securityLevel = await this.biometricLib.getSecurityLevel();
      const attestationSupported =
        await this.biometricLib.isAttestationSupported();

      this.deviceCapabilities = [];

      if (availableType) {
        this.deviceCapabilities.push({
          type: availableType,
          isAvailable: true,
          isEnrolled: keysExist,
          isSupported: true,
          hardwareDetected: true,
          securityLevel,
        });
      }

      // 添加其他可能的生物識別類型
      const allTypes: BiometricType[] = [
        'faceId',
        'touchId',
        'fingerprint',
        'iris',
        'voiceId',
        'palm',
      ];
      allTypes.forEach(type => {
        if (type !== availableType) {
          this.deviceCapabilities.push({
            type,
            isAvailable: false,
            isEnrolled: false,
            isSupported: false,
            hardwareDetected: false,
            securityLevel: 'weak',
          });
        }
      });

      logger.info('iOS 設備能力檢測完成', {
        availableType,
        biometryType,
        isDeviceSecure,
        capabilities: this.deviceCapabilities,
      });
    } catch (error) {
      logger.error('檢測 iOS 設備能力失敗:', error);
    }
  }

  /**
   * 初始化安全信息
   */
  private async initializeSecurityInfo(): Promise<void> {
    try {
      if (!this.biometricLib) return;

      const keyGenerated = await this.biometricLib.biometricKeysExist();
      const securityLevel = await this.biometricLib.getSecurityLevel();
      const attestationSupported =
        await this.biometricLib.isAttestationSupported();

      this.securityInfo = {
        keyAlias: 'ios_biometric_key',
        keyGenerated,
        keyInvalidated: false,
        biometricChanged: false,
        securityLevel,
        attestationSupported,
      };

      logger.info(
        'iOS 安全信息初始化完成',
        this.securityInfo as unknown as Record<string, unknown>
      );
    } catch (error) {
      logger.error('初始化 iOS 安全信息失敗:', error);
    }
  }

  /**
   * 檢測生物識別能力
   */
  public async detectCapabilities(): Promise<BiometricCapability[]> {
    if (!this.isInitialized) {
      throw new Error('iOS 生物識別服務未初始化');
    }

    return this.deviceCapabilities;
  }

  /**
   * 執行生物識別認證
   */
  public async authenticate(
    request: BiometricAuthRequest = {}
  ): Promise<BiometricAuthResult> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別服務未初始化');
      }

      const startTime = Date.now();

      // 檢查設備能力
      const capabilities = await this.detectCapabilities();
      const availableCapability = capabilities.find(
        cap => cap.isAvailable && cap.isEnrolled
      );

      if (!availableCapability) {
        return {
          success: false,
          errorCode: 'biometry_not_enrolled',
          errorMessage: '未設置生物識別或設備不支持',
          timestamp: new Date(),
        };
      }

      // 準備認證配置
      const promptConfig: IOSPromptConfig = {
        title: request.promptMessage || '請進行生物識別認證',
        subtitle: '使用 Face ID 或 Touch ID 登錄',
        description: '請將手指放在 Touch ID 上或看向設備進行 Face ID 認證',
        cancelButtonText: request.cancelButtonText || '取消',
        fallbackButtonText: request.fallbackButtonText || '使用密碼',
        confirmationRequired: true,
        deviceCredentialAllowed: !request.disableDeviceFallback,
      };

      // 執行認證
      const result = await this.biometricLib.simplePrompt(promptConfig);
      const processingTime = Date.now() - startTime;

      if (result.success) {
        logger.info('iOS 生物識別認證成功', {
          biometryType: result.biometryType,
          processingTime,
        });

        return {
          success: true,
          biometricType:
            result.biometryType === 'FaceID' ? 'faceId' : 'touchId',
          authenticationMethod: 'biometric',
          timestamp: new Date(),
        };
      } else {
        logger.warn('iOS 生物識別認證失敗', {
          error: result.error,
          errorCode: result.errorCode,
        });

        return {
          success: false,
          errorCode: this.mapIOSErrorCode(result.errorCode),
          errorMessage: result.error || '認證失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('iOS 生物識別認證異常:', error);
      return {
        success: false,
        errorCode: 'unknown_error',
        errorMessage: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 創建簽名認證
   */
  public async createSignature(
    promptMessage: string,
    payload: string
  ): Promise<{ signature: string; success: boolean }> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別服務未初始化');
      }

      const result = await this.biometricLib.createSignature(
        promptMessage,
        payload
      );

      if (result.success) {
        logger.info('iOS 生物識別簽名創建成功');
      } else {
        logger.warn('iOS 生物識別簽名創建失敗', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('iOS 生物識別簽名創建異常:', error);
      return { signature: '', success: false };
    }
  }

  /**
   * 獲取安全信息
   */
  public getSecurityInfo(): BiometricSecurityInfo | null {
    return this.securityInfo;
  }

  /**
   * 使密鑰失效
   */
  public async invalidateKeys(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別服務未初始化');
      }

      const result = await this.biometricLib.invalidateKeys();
      if (result && this.securityInfo) {
        this.securityInfo.keyInvalidated = true;
      }

      logger.info('iOS 生物識別密鑰已失效');
      return result;
    } catch (error) {
      logger.error('使 iOS 生物識別密鑰失效失敗:', error);
      return false;
    }
  }

  /**
   * 重新初始化密鑰
   */
  public async reinitializeKeys(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別服務未初始化');
      }

      // 刪除舊密鑰
      await this.biometricLib.deleteKeys();

      // 創建新密鑰
      const result = await this.biometricLib.createKeys();

      if (result) {
        await this.initializeSecurityInfo();
        logger.info('iOS 生物識別密鑰重新初始化成功');
      }

      return result;
    } catch (error) {
      logger.error('重新初始化 iOS 生物識別密鑰失敗:', error);
      return false;
    }
  }

  /**
   * 映射 iOS 錯誤代碼
   */
  private mapIOSErrorCode(iosErrorCode?: string): BiometricErrorCode {
    switch (iosErrorCode) {
      case 'user_cancel':
        return 'user_cancel';
      case 'user_fallback':
        return 'user_fallback';
      case 'system_cancel':
        return 'system_cancel';
      case 'timeout':
        return 'timeout';
      case 'unable_to_process':
        return 'unable_to_process';
      case 'authentication_failed':
        return 'authentication_failed';
      case 'biometry_not_available':
        return 'biometry_not_available';
      case 'biometry_not_enrolled':
        return 'biometry_not_enrolled';
      case 'biometry_lockout':
        return 'biometry_lockout';
      case 'biometry_lockout_permanent':
        return 'biometry_lockout_permanent';
      case 'device_not_secure':
        return 'device_not_secure';
      case 'invalid_context':
        return 'invalid_context';
      case 'app_cancel':
        return 'app_cancel';
      default:
        return 'unknown_error';
    }
  }

  /**
   * 檢查服務狀態
   */
  public isServiceReady(): boolean {
    return this.isInitialized && this.biometricLib !== null;
  }

  /**
   * 獲取服務信息
   */
  public getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      isServiceReady: this.isServiceReady(),
      platform: Platform.OS,
      capabilities: this.deviceCapabilities,
      securityInfo: this.securityInfo,
    };
  }
}
