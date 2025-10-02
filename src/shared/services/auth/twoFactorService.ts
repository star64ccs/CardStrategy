import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface TwoFactorConfig {
  totpSecret: string;
  totpDigits: number;
  totpPeriod: number;
  totpAlgorithm: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  backupCodesCount: number;
}

export interface TwoFactorMethod {
  type: 'totp' | 'sms' | 'email';
  enabled: boolean;
  verified: boolean;
  lastUsed?: Date;
  createdAt: Date;
}

export interface TwoFactorSetup {
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  method: TwoFactorMethod;
}

export interface TwoFactorVerification {
  method: 'totp' | 'sms' | 'email' | 'backup';
  code: string;
  userId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class TwoFactorService {
  private readonly config: TwoFactorConfig;
  private isInitialized = false;
  private readonly userMethods: Map<string, TwoFactorMethod[]> = new Map();
  private readonly backupCodes: Map<string, string[]> = new Map();

  constructor() {
    this.config = {
      totpSecret: process.env.TOTP_SECRET || 'default-totp-secret',
      totpDigits: 6,
      totpPeriod: 30,
      totpAlgorithm: 'SHA1',
      smsEnabled: process.env.SMS_2FA_ENABLED === 'true',
      emailEnabled: process.env.EMAIL_2FA_ENABLED === 'true',
      backupCodesCount: 10,
    };
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('Initialize雙因素認證Service');

      // VerifyConfigure
      if (
        !this.config.totpSecret ||
        this.config.totpSecret === 'default-totp-secret'
      ) {
        logger.warn('TOTP_SECRET 未設置，使用默認密鑰（僅用於開發）');
      }

      this.isInitialized = true;
      logger.info('雙因素認證ServiceInitialize完成');

      return {
        success: true,
        data: {
          totpDigits: this.config.totpDigits,
          totpPeriod: this.config.totpPeriod,
          smsEnabled: this.config.smsEnabled,
          emailEnabled: this.config.emailEnabled,
          backupCodesCount: this.config.backupCodesCount,
        },
        message: '雙因素認證ServiceInitializeSuccess',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('雙因素認證ServiceInitializeFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async setupTOTP(
    userId: string,
    userEmail: string
  ): Promise<ApiResponse<TwoFactorSetup>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // 生成 TOTP 密鑰
      const _secret = this.generateTOTPSecret();

      // 生成 QR 碼 URL
      const _qrCode = this.generateQRCode(secret, userEmail);

      // 生成備用碼
      const _backupCodes = this.generateBackupCodes();

      // Create TOTP Method
      const method: TwoFactorMethod = {
        type: 'totp',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      // StorageUserMethod
      this.userMethods.set(userId, [method]);
      this.backupCodes.set(userId, backupCodes);

      logger.info(`為用戶 ${userId} 設置 TOTP`);

      return {
        success: true,
        data: {
          secret,
          qrCode,
          backupCodes,
          method,
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Settings TOTP Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async setupSMS(
    userId: string,
    phoneNumber: string
  ): Promise<ApiResponse<TwoFactorSetup>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      if (!this.config.smsEnabled) {
        return {
          success: false,
          error: 'SMS 雙因素認證未啟用',
          timestamp: Date.now(),
        };
      }

      // 生成Verify碼
      const _code = this.generateSMSCode();

      // Send SMS（這裡應該調用 SMS Service）
      const _smsResult = await this.sendSMS(
        phoneNumber,
        `您的驗證碼是: ${code}`
      );

      if (!smsResult.success) {
        return {
          success: false,
          error: '發送 SMS Failed',
          timestamp: Date.now(),
        };
      }

      // Create SMS Method
      const method: TwoFactorMethod = {
        type: 'sms',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      // StorageUserMethod
      const _userMethods = this.userMethods.get(userId) || [];
      userMethods.push(method);
      this.userMethods.set(userId, userMethods);

      logger.info(`為用戶 ${userId} 設置 SMS 雙因素認證`);

      return {
        success: true,
        data: {
          method,
        },
        message: 'SMS 驗證碼已發送',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Settings SMS 雙因素認證Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async setupEmail(
    userId: string,
    email: string
  ): Promise<ApiResponse<TwoFactorSetup>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      if (!this.config.emailEnabled) {
        return {
          success: false,
          error: '郵件雙因素認證未啟用',
          timestamp: Date.now(),
        };
      }

      // 生成Verify碼
      const _code = this.generateEmailCode();

      // Send郵件（這裡應該調用郵件Service）
      const _emailResult = await this.sendEmail(
        email,
        '雙因素認證設置',
        `您的驗證碼是: ${code}`
      );

      if (!emailResult.success) {
        return {
          success: false,
          error: '發送郵件Failed',
          timestamp: Date.now(),
        };
      }

      // Create郵件Method
      const method: TwoFactorMethod = {
        type: 'email',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      // StorageUserMethod
      const _userMethods = this.userMethods.get(userId) || [];
      userMethods.push(method);
      this.userMethods.set(userId, userMethods);

      logger.info(`為用戶 ${userId} 設置郵件雙因素認證`);

      return {
        success: true,
        data: {
          method,
        },
        message: '郵件驗證碼已發送',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Settings郵件雙因素認證Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async verifyCode(verification: TwoFactorVerification): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const { method, code, userId } = verification;

      switch (method) {
        case 'totp':
          return await this.verifyTOTP(userId, code);
        case 'sms':
          return await this.verifySMS(userId, code);
        case 'email':
          return await this.verifyEmail(userId, code);
        case 'backup':
          return await this.verifyBackupCode(userId, code);
        default:
          return {
            success: false,
            error: '不支持的驗證方法',
            timestamp: Date.now(),
          };
      }
    } catch (error) {
      logger.error(`Verify雙因素認證碼Failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async enable2FA(
    userId: string,
    methodType: 'totp' | 'sms' | 'email'
  ): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _userMethods = this.userMethods.get(userId);
      if (!userMethods) {
        return {
          success: false,
          error: '用戶未設置雙因素認證',
          timestamp: Date.now(),
        };
      }

      const _method = userMethods.find(m => m.type === methodType);
      if (!method) {
        return {
          success: false,
          error: `未找到 ${methodType} 方法`,
          timestamp: Date.now(),
        };
      }

      if (!method.verified) {
        return {
          success: false,
          error: '請先驗證該方法',
          timestamp: Date.now(),
        };
      }

      method.enabled = true;
      method.lastUsed = new Date();

      logger.info(`為用戶 ${userId} 啟用 ${methodType} 雙因素認證`);

      return {
        success: true,
        message: `${methodType.toUpperCase()} 雙因素認證已啟用`,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`啟用雙因素認證Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async disable2FA(
    userId: string,
    methodType: 'totp' | 'sms' | 'email'
  ): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _userMethods = this.userMethods.get(userId);
      if (!userMethods) {
        return {
          success: false,
          error: '用戶未設置雙因素認證',
          timestamp: Date.now(),
        };
      }

      const _method = userMethods.find(m => m.type === methodType);
      if (!method) {
        return {
          success: false,
          error: `未找到 ${methodType} 方法`,
          timestamp: Date.now(),
        };
      }

      method.enabled = false;

      logger.info(`為用戶 ${userId} 禁用 ${methodType} 雙因素認證`);

      return {
        success: true,
        message: `${methodType.toUpperCase()} 雙因素認證已禁用`,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`禁用雙因素認證Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async getBackupCodes(userId: string): Promise<ApiResponse<string[]>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _codes = this.backupCodes.get(userId);
      if (!codes) {
        return {
          success: false,
          error: '未找到備用碼',
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: codes,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Get備用碼Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async regenerateBackupCodes(userId: string): Promise<ApiResponse<string[]>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '雙因素認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _newCodes = this.generateBackupCodes();
      this.backupCodes.set(userId, newCodes);

      logger.info(`為用戶 ${userId} 重新生成備用碼`);

      return {
        success: true,
        data: newCodes,
        message: '備用碼已重新生成',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`重新生成備用碼Failed (${userId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  getUserMethods(userId: string): TwoFactorMethod[] {
    return this.userMethods.get(userId) || [];
  }

  is2FAEnabled(userId: string): boolean {
    const _userMethods = this.userMethods.get(userId);
    return userMethods ? userMethods.some(m => m.enabled) : false;
  }

  private generateTOTPSecret(): string {
    // 生成 32 字符的隨機密鑰
    const _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateQRCode(secret: string, userEmail: string): string {
    // 生成 TOTP QR 碼 URL
    const _issuer = 'CardStrategy';
    const _label = encodeURIComponent(userEmail);
    return `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&digits=${this.config.totpDigits}&period=${this.config.totpPeriod}`;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.config.backupCodesCount; i++) {
      // 生成 8 位數字備用碼
      const _code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }
    return codes;
  }

  private generateSMSCode(): string {
    // 生成 6 位數字 SMS Verify碼
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateEmailCode(): string {
    // 生成 6 位數字郵件Verify碼
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<ApiResponse> {
    // 這裡應該調用 SMS Service
    // 目前ReturnSuccess
    return {
      success: true,
      message: 'SMS 發送Success',
      timestamp: Date.now(),
    };
  }

  private async sendEmail(
    email: string,
    subject: string,
    message: string
  ): Promise<ApiResponse> {
    // 這裡應該調用郵件Service
    // 目前ReturnSuccess
    return {
      success: true,
      message: '郵件發送Success',
      timestamp: Date.now(),
    };
  }

  private async verifyTOTP(userId: string, code: string): Promise<ApiResponse> {
    // 簡化的 TOTP Verify
    // 在實際Apply中，應該使用專業的 TOTP Library
    const _userMethods = this.userMethods.get(userId);
    const _totpMethod = userMethods?.find(m => m.type === 'totp');

    if (!totpMethod) {
      return {
        success: false,
        error: '未設置 TOTP',
        timestamp: Date.now(),
      };
    }

    // 簡化Verify：Check代碼YesNo為 6 位數字
    if (/^\d{6}$/.test(code)) {
      totpMethod.verified = true;
      totpMethod.lastUsed = new Date();

      return {
        success: true,
        message: 'TOTP VerifySuccess',
        timestamp: Date.now(),
      };
    }

    return {
      success: false,
      error: '無效的 TOTP 代碼',
      timestamp: Date.now(),
    };
  }

  private async verifySMS(userId: string, code: string): Promise<ApiResponse> {
    const _userMethods = this.userMethods.get(userId);
    const _smsMethod = userMethods?.find(m => m.type === 'sms');

    if (!smsMethod) {
      return {
        success: false,
        error: '未設置 SMS 雙因素認證',
        timestamp: Date.now(),
      };
    }

    // 簡化Verify：Check代碼YesNo為 6 位數字
    if (/^\d{6}$/.test(code)) {
      smsMethod.verified = true;
      smsMethod.lastUsed = new Date();

      return {
        success: true,
        message: 'SMS VerifySuccess',
        timestamp: Date.now(),
      };
    }

    return {
      success: false,
      error: '無效的 SMS 代碼',
      timestamp: Date.now(),
    };
  }

  private async verifyEmail(
    userId: string,
    code: string
  ): Promise<ApiResponse> {
    const _userMethods = this.userMethods.get(userId);
    const _emailMethod = userMethods?.find(m => m.type === 'email');

    if (!emailMethod) {
      return {
        success: false,
        error: '未設置郵件雙因素認證',
        timestamp: Date.now(),
      };
    }

    // 簡化Verify：Check代碼YesNo為 6 位數字
    if (/^\d{6}$/.test(code)) {
      emailMethod.verified = true;
      emailMethod.lastUsed = new Date();

      return {
        success: true,
        message: '郵件VerifySuccess',
        timestamp: Date.now(),
      };
    }

    return {
      success: false,
      error: '無效的郵件代碼',
      timestamp: Date.now(),
    };
  }

  private async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<ApiResponse> {
    const _backupCodes = this.backupCodes.get(userId);

    if (!backupCodes) {
      return {
        success: false,
        error: '未找到備用碼',
        timestamp: Date.now(),
      };
    }

    const _index = backupCodes.indexOf(code);
    if (index === -1) {
      return {
        success: false,
        error: '無效的備用碼',
        timestamp: Date.now(),
      };
    }

    // Remove已使用的備用碼
    backupCodes.splice(index, 1);
    this.backupCodes.set(userId, backupCodes);

    return {
      success: true,
      message: '備用碼VerifySuccess',
      timestamp: Date.now(),
    };
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        totalUsers: this.userMethods.size,
        smsEnabled: this.config.smsEnabled,
        emailEnabled: this.config.emailEnabled,
        backupCodesCount: this.config.backupCodesCount,
      },
      timestamp: Date.now(),
    };
  }
}

export const _twoFactorService = new TwoFactorService();
