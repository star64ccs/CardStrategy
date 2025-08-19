import { logger } from '@/utils/logger';

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
    requireSpecialChars: true
  }
};

// 安全工具類
export class SecurityUtils {
  private static instance: SecurityUtils;
  private config: SecurityConfig;

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
  public validateInput(input: string, type: 'text' | 'email' | 'url' | 'phone' | 'number'): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // 檢查長度
    if (input.length > this.config.maxInputLength) {
      logger.warn('輸入長度超過限制:', { length: input.length, max: this.config.maxInputLength });
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
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // 驗證數字
  private isValidNumber(number: string): boolean {
    return !isNaN(Number(number)) && isFinite(Number(number));
  }

  // 驗證文本
  private isValidText(text: string): boolean {
    // 檢查是否包含危險字符
    const dangerousChars = /[<>\"'&]/;
    return !dangerousChars.test(text);
  }

  // 密碼強度驗證
  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    const { passwordRequirements, passwordMinLength } = this.config;

    // 檢查長度
    if (password.length < passwordMinLength) {
      errors.push(`密碼長度至少需要 ${passwordMinLength} 個字符`);
    }

    // 檢查大寫字母
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密碼需要包含至少一個大寫字母');
    }

    // 檢查小寫字母
    if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('密碼需要包含至少一個小寫字母');
    }

    // 檢查數字
    if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
      errors.push('密碼需要包含至少一個數字');
    }

    // 檢查特殊字符
    if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('密碼需要包含至少一個特殊字符');
    }

    // 計算強度
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    const score = this.calculatePasswordStrength(password);

    if (score >= 80) {
      strength = 'strong';
    } else if (score >= 60) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  // 計算密碼強度
  private calculatePasswordStrength(password: string): number {
    let score = 0;

    // 長度分數
    score += Math.min(password.length * 4, 40);

    // 字符類型分數
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

    // 複雜度分數
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    return Math.min(score, 100);
  }

  // XSS 防護
  public sanitizeHtml(input: string): string {
    if (!this.config.enableXSSProtection) {
      return input;
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // SQL 注入防護
  public sanitizeSQL(input: string): string {
    if (!this.config.enableSQLInjectionProtection) {
      return input;
    }

    // 移除危險的 SQL 關鍵字
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
      'UNION', 'EXEC', 'EXECUTE', 'SCRIPT', 'EVAL', 'EXPRESSION'
    ];

    let sanitized = input;
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  // 文件類型驗證
  public validateFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查文件大小
    if (file.size > this.config.maxFileSize) {
      errors.push(`文件大小不能超過 ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    // 檢查文件類型
    const fileExtension = this.getFileExtension(file.name);
    if (!this.config.allowedFileTypes.includes(fileExtension.toLowerCase())) {
      errors.push(`不支持的文件類型: ${fileExtension}`);
    }

    // 檢查 MIME 類型
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      errors.push(`不支持的 MIME 類型: ${file.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 獲取文件擴展名
  private getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  }

  // 生成安全的隨機字符串
  public generateSecureRandom(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return result;
  }

  // 生成 CSRF Token
  public generateCSRFToken(): string {
    return this.generateSecureRandom(64);
  }

  // 驗證 CSRF Token
  public validateCSRFToken(token: string, storedToken: string): boolean {
    if (!this.config.enableCSRFProtection) {
      return true;
    }

    return token === storedToken && token.length === 64;
  }

  // 數據加密（簡單實現，生產環境應使用更強的加密）
  public encryptData(data: string, key: string): string {
    try {
      // 這裡應該使用更強的加密算法，如 AES
      // 這只是一個示例實現
      const encoded = btoa(encodeURIComponent(data));
      return encoded;
    } catch (error) {
      logger.error('數據加密失敗:', error);
      throw new Error('數據加密失敗');
    }
  }

  // 數據解密
  public decryptData(encryptedData: string, key: string): string {
    try {
      // 這裡應該使用對應的解密算法
      const decoded = decodeURIComponent(atob(encryptedData));
      return decoded;
    } catch (error) {
      logger.error('數據解密失敗:', error);
      throw new Error('數據解密失敗');
    }
  }

  // 敏感信息遮罩
  public maskSensitiveData(data: string, type: 'email' | 'phone' | 'creditCard' | 'ssn'): string {
    switch (type) {
      case 'email':
        return this.maskEmail(data);
      case 'phone':
        return this.maskPhone(data);
      case 'creditCard':
        return this.maskCreditCard(data);
      case 'ssn':
        return this.maskSSN(data);
      default:
        return data;
    }
  }

  // 遮罩電子郵件
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return email;
    }

    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  // 遮罩電話號碼
  private maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) {
      return phone;
    }

    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }

  // 遮罩信用卡號
  private maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) {
      return cardNumber;
    }

    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }

  // 遮罩社會安全號碼
  private maskSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length !== 9) {
      return ssn;
    }

    return `***-**-${  cleaned.slice(-4)}`;
  }

  // 會話超時檢查
  public isSessionExpired(lastActivity: Date): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();
    return timeDiff > this.config.sessionTimeout;
  }

  // 輸入長度檢查
  public checkInputLength(input: string, maxLength?: number): boolean {
    const limit = maxLength || this.config.maxInputLength;
    return input.length <= limit;
  }

  // 清理用戶輸入
  public sanitizeUserInput(input: string): string {
    let sanitized = input;

    // 移除多餘的空白字符
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    // XSS 防護
    sanitized = this.sanitizeHtml(sanitized);

    // SQL 注入防護
    sanitized = this.sanitizeSQL(sanitized);

    return sanitized;
  }

  // 驗證 API 請求
  public validateAPIRequest(request: {
    method: string;
    headers: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查請求方法
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!allowedMethods.includes(request.method.toUpperCase())) {
      errors.push(`不支持的請求方法: ${request.method}`);
    }

    // 檢查 Content-Type
    if (request.method !== 'GET' && request.headers['content-type']) {
      const contentType = request.headers['content-type'];
      if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        errors.push('不支持的 Content-Type');
      }
    }

    // 檢查請求體大小（如果適用）
    if (request.body && typeof request.body === 'string' && request.body.length > this.config.maxInputLength) {
      errors.push('請求體過大');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 更新配置
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('安全配置已更新:', newConfig);
  }

  // 獲取當前配置
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// 導出單例實例
export const securityUtils = SecurityUtils.getInstance();

// 導出便捷函數
export const validateInput = (input: string, type: 'text' | 'email' | 'url' | 'phone' | 'number') =>
  securityUtils.validateInput(input, type);

export const validatePassword = (password: string) =>
  securityUtils.validatePassword(password);

export const sanitizeHtml = (input: string) =>
  securityUtils.sanitizeHtml(input);

export const sanitizeUserInput = (input: string) =>
  securityUtils.sanitizeUserInput(input);

export const generateSecureRandom = (length?: number) =>
  securityUtils.generateSecureRandom(length);

export const maskSensitiveData = (data: string, type: 'email' | 'phone' | 'creditCard' | 'ssn') =>
  securityUtils.maskSensitiveData(data, type);
