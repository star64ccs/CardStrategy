import { logger } from './logger';

// 安全配置
export interface SecurityConfig {
  maxInputLength: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableCSRFProtection: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequirements: {
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

// 默認安全配置
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxInputLength: 1000,
  allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableCSRFProtection: true,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24小時
  passwordMinLength: 8,
  passwordRequirements: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

// 安全工具類
export class SecurityUtils {
  private static instance: SecurityUtils;
  private readonly config: SecurityConfig;

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<SecurityConfig>): SecurityUtils {
    if (!SecurityUtils.instance) {
      SecurityUtils.instance = new SecurityUtils(config);
    }
    return SecurityUtils.instance;
  }

  // 輸入驗證
  public validateInput(
    input: string,
    type: 'text' | 'email' | 'url' | 'phone' | 'number'
  ): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // 檢查長度
    if (input.length > this.config.maxInputLength) {
      logger.warn('輸入長度超過限制:', {
        length: input.length,
        max: this.config.maxInputLength,
      });
      return false;
    }

    // 根據類型驗證
    switch (type) {
      case 'email':
        return this.isValidEmail(input);
      case 'url':
        return this.isValidUrl(input);
      case 'phone':
        return this.isValidPhone(input);
      case 'number':
        return this.isValidNumber(input);
      case 'text':
      default:
        return this.isValidText(input);
    }
  }

  // 驗證電子郵件
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 驗證 URL
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 驗證電話號碼
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // 驗證數字
  private isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  // 驗證文本
  private isValidText(text: string): boolean {
    // 檢查 XSS 攻擊
    if (this.config.enableXSSProtection) {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ];

      for (const pattern of xssPatterns) {
        if (pattern.test(text)) {
          logger.warn('檢測到潛在的 XSS 攻擊:', {
            text: text.substring(0, 100),
          });
          return false;
        }
      }
    }

    return true;
  }

  // 密碼強度驗證
  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    // 檢查長度
    if (password.length < this.config.passwordMinLength) {
      errors.push(`密碼長度至少需要 ${this.config.passwordMinLength} 個字符`);
    } else {
      score += 1;
    }

    // 檢查大寫字母
    if (
      this.config.passwordRequirements.requireUppercase &&
      !/[A-Z]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個大寫字母');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // 檢查小寫字母
    if (
      this.config.passwordRequirements.requireLowercase &&
      !/[a-z]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個小寫字母');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // 檢查數字
    if (
      this.config.passwordRequirements.requireNumbers &&
      !/\d/.test(password)
    ) {
      errors.push('密碼需要包含至少一個數字');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // 檢查特殊字符
    if (
      this.config.passwordRequirements.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個特殊字符');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // 檢查常見弱密碼
    const commonPasswords = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
      'football',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('密碼過於常見，請選擇更安全的密碼');
      score = 0;
    }

    // 計算強度
    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 2) {
      strength = 'weak';
    } else if (score <= 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  // 文件驗證
  public validateFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查文件大小
    if (file.size > this.config.maxFileSize) {
      errors.push(
        `文件大小不能超過 ${this.config.maxFileSize / (1024 * 1024)}MB`
      );
    }

    // 檢查文件類型
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!this.config.allowedFileTypes.includes(fileExtension)) {
      errors.push(`不支持的文件類型: ${fileExtension}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 生成安全令牌
  public generateToken(length = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成 CSRF 令牌
  public generateCSRFToken(): string {
    return this.generateToken(64);
  }

  // 驗證 CSRF 令牌
  public validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  // 數據加密（簡單實現，生產環境應使用更強的加密）
  public encrypt(data: string, key: string): string {
    try {
      // 這裡應該使用更強的加密算法
      const encoded = btoa(data + key);
      return encoded;
    } catch (error) {
      logger.error('加密失敗:', { error });
      throw new Error('加密失敗');
    }
  }

  // 數據解密
  public decrypt(encryptedData: string, key: string): string {
    try {
      const decoded = atob(encryptedData);
      return decoded.replace(key, '');
    } catch (error) {
      logger.error('解密失敗:', { error });
      throw new Error('解密失敗');
    }
  }

  // 生成哈希（簡單實現，生產環境應使用 bcrypt 等）
  public async hashPassword(password: string): Promise<string> {
    try {
      // 這裡應該使用 bcrypt 或其他安全的哈希算法
      const encoder = new TextEncoder();
      const data = encoder.encode(`${password}salt`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logger.error('密碼哈希失敗:', { error });
      throw new Error('密碼哈希失敗');
    }
  }

  // 驗證哈希
  public async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      const newHash = await this.hashPassword(password);
      return newHash === hash;
    } catch (error) {
      logger.error('密碼驗證失敗:', { error });
      return false;
    }
  }

  // 會話管理
  public createSession(userId: string): {
    sessionId: string;
    expiresAt: number;
  } {
    const sessionId = this.generateToken(32);
    const expiresAt = Date.now() + this.config.sessionTimeout;

    return {
      sessionId,
      expiresAt,
    };
  }

  // 檢查會話是否有效
  public isSessionValid(expiresAt: number): boolean {
    return Date.now() < expiresAt;
  }

  // 清理過期會話
  public cleanupExpiredSessions(
    sessions: { sessionId: string; expiresAt: number }[]
  ): { sessionId: string; expiresAt: number }[] {
    return sessions.filter(session => this.isSessionValid(session.expiresAt));
  }

  // 安全日誌記錄
  public logSecurityEvent(event: string, details: unknown): void {
    logger.warn('安全事件:', {
      event,
      details,
      timestamp: new Date().toISOString(),
      ip: 'unknown', // 在實際應用中應該從請求中獲取
    });
  }

  // 速率限制檢查
  public checkRateLimit(
    identifier: string,
    attempts: Map<string, { count: number; resetTime: number }>,
    maxAttempts = 5,
    windowMs: number = 15 * 60 * 1000 // 15分鐘
  ): boolean {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userAttempts.count >= maxAttempts) {
      return false;
    }

    userAttempts.count += 1;
    return true;
  }

  // 清理速率限制記錄
  public cleanupRateLimit(
    attempts: Map<string, { count: number; resetTime: number }>
  ): void {
    const now = Date.now();
    for (const [identifier, data] of attempts.entries()) {
      if (now > data.resetTime) {
        attempts.delete(identifier);
      }
    }
  }
}

// 導出單例實例
export const securityUtils = SecurityUtils.getInstance();
