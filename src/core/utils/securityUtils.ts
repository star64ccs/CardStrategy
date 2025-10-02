import { logger } from './logger';

// 安全Configure
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

// Default安全Configure
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxInputLength: 1000,
  allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableCSRFProtection: true,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24Hour
  passwordMinLength: 8,
  passwordRequirements: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

// 安全ToolClass
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

  // InputVerify
  public validateInput(
    input: string,
    type: 'text' | 'email' | 'url' | 'phone' | 'number'
  ): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // Check長度
    if (input.length > this.config.maxInputLength) {
      logger.warn('輸入長度超過限制:', {
        length: input.length,
        max: this.config.maxInputLength,
      });
      return false;
    }

    // Root據Class型Verify
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

  // Verify電子郵件
  private isValidEmail(email: string): boolean {
    const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Verify URL
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // VerifyPhone號碼
  private isValidPhone(phone: string): boolean {
    const _phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Verify數字
  private isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  // Verify文本
  private isValidText(text: string): boolean {
    // Check XSS 攻擊
    if (this.config.enableXSSProtection) {
      const _xssPatterns = [
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

  // Password強度Verify
  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    // Check長度
    if (password.length < this.config.passwordMinLength) {
      errors.push(`密碼長度至少需要 ${this.config.passwordMinLength} 個字符`);
    } else {
      score += 1;
    }

    // Check大寫字母
    if (
      this.config.passwordRequirements.requireUppercase &&
      !/[A-Z]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個大寫字母');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Check小寫字母
    if (
      this.config.passwordRequirements.requireLowercase &&
      !/[a-z]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個小寫字母');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Check數字
    if (
      this.config.passwordRequirements.requireNumbers &&
      !/\d/.test(password)
    ) {
      errors.push('密碼需要包含至少一個數字');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // CheckSpecial字符
    if (
      this.config.passwordRequirements.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('密碼需要包含至少一個特殊字符');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Check常見弱Password
    const _commonPasswords = [
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

  // FileVerify
  public validateFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // CheckFile大小
    if (file.size > this.config.maxFileSize) {
      errors.push(
        `文件大小不能超過 ${this.config.maxFileSize / (1024 * 1024)}MB`
      );
    }

    // CheckFileClass型
    const _fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
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
    const _chars =
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

  // Verify CSRF 令牌
  public validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  // DataEncrypt（簡單實現，生產環境應使用更強的Encrypt）
  public encrypt(data: string, key: string): string {
    try {
      // 這裡應該使用更強的Encrypt算法
      const _encoded = btoa(data + key);
      return encoded;
    } catch (error) {
      logger.error('加密Failed:', { error });
      throw new Error('加密Failed');
    }
  }

  // DataDecrypt
  public decrypt(encryptedData: string, key: string): string {
    try {
      const _decoded = atob(encryptedData);
      return decoded.replace(key, '');
    } catch (error) {
      logger.error('解密Failed:', { error });
      throw new Error('解密Failed');
    }
  }

  // 生成哈希（簡單實現，生產環境應使用 bcrypt 等）
  public async hashPassword(password: string): Promise<string> {
    try {
      // 這裡應該使用 bcrypt 或其他安全的哈希算法
      const _encoder = new TextEncoder();
      const _data = encoder.encode(`${password}salt`);
      const _hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const _hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logger.error('密碼哈希Failed:', { error });
      throw new Error('密碼哈希Failed');
    }
  }

  // Verify哈希
  public async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      const _newHash = await this.hashPassword(password);
      return newHash === hash;
    } catch (error) {
      logger.error('密碼VerifyFailed:', { error });
      return false;
    }
  }

  // 會話Manage
  public createSession(userId: string): {
    sessionId: string;
    expiresAt: number;
  } {
    const _sessionId = this.generateToken(32);
    const _expiresAt = Date.now() + this.config.sessionTimeout;

    return {
      sessionId,
      expiresAt,
    };
  }

  // Check會話YesNo有效
  public isSessionValid(expiresAt: number): boolean {
    return Date.now() < expiresAt;
  }

  // 清理過期會話
  public cleanupExpiredSessions(
    sessions: { sessionId: string; expiresAt: number }[]
  ): { sessionId: string; expiresAt: number }[] {
    return sessions.filter(session => this.isSessionValid(session.expiresAt));
  }

  // 安全LogRecord
  public logSecurityEvent(event: string, details: unknown): void {
    logger.warn('安全事件:', {
      event,
      details,
      timestamp: new Date().toISOString(),
      ip: 'unknown', // 在實際Apply中應該從Request中Get
    });
  }

  // 速率LimitCheck
  public checkRateLimit(
    identifier: string,
    attempts: Map<string, { count: number; resetTime: number }>,
    maxAttempts = 5,
    windowMs: number = 15 * 60 * 1000 // 15Minute
  ): boolean {
    const _now = Date.now();
    const _userAttempts = attempts.get(identifier);

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

  // 清理速率LimitRecord
  public cleanupRateLimit(
    attempts: Map<string, { count: number; resetTime: number }>
  ): void {
    const _now = Date.now();
    for (const [identifier, data] of attempts.entries()) {
      if (now > data.resetTime) {
        attempts.delete(identifier);
      }
    }
  }
}

// Export單例Instance
export const _securityUtils = SecurityUtils.getInstance();
