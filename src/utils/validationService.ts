import { logger } from './logger';

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: string[];
  errorMessage?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export class ValidationService {
  private static instance: ValidationService;

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * VerifyInputData
   */
  public validateInput<T = any>(
    data: unknown,
    rules: ValidationRule[]
  ): ValidationResult<T> {
    const errors: string[] = [];
    const validatedData: unknown = {};

    try {
      for (const rule of rules) {
        const _value = data[rule.field];
        const _validationResult = this.validateField(value, rule);

        if (validationResult.isValid) {
          validatedData[rule.field] = value;
        } else {
          errors.push(...validationResult.errors);
        }
      }

      return {
        isValid: errors.length === 0,
        data: errors.length === 0 ? validatedData : undefined,
        errors,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
      };
    } catch (error) {
      logger.error('Validation error', error);
      return {
        isValid: false,
        errors: ['Validation service error'],
        errorMessage: 'Validation service error',
      };
    }
  }

  /**
   * VerifySingleField
   */
  private validateField(
    value: unknown,
    rule: ValidationRule
  ): ValidationResult {
    const errors: string[] = [];

    // Check必填Field
    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push(rule.message || `${rule.field} is required`);
      return { isValid: false, errors };
    }

    // 如果Field不Yes必填且為Empty，Skip其他Verify
    if (
      !rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      return { isValid: true, errors: [] };
    }

    // Class型Verify
    if (rule.type) {
      const _typeError = this.validateType(value, rule.type);
      if (typeError) {
        errors.push(typeError);
      }
    }

    // 長度Verify
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(
          rule.message ||
            `${rule.field} must be at least ${rule.minLength} characters`
        );
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(
          rule.message ||
            `${rule.field} must be no more than ${rule.maxLength} characters`
        );
      }
    }

    // 數Value範圍Verify
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(
          rule.message || `${rule.field} must be at least ${rule.min}`
        );
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(
          rule.message || `${rule.field} must be no more than ${rule.max}`
        );
      }
    }

    // 正則Table達式Verify
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(rule.message || `${rule.field} format is invalid`);
      }
    }

    // CustomVerify
    if (rule.custom && !rule.custom(value)) {
      errors.push(rule.message || `${rule.field} validation failed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * VerifyDataClass型
   */
  private validateType(value: unknown, type: string): string | null {
    switch (type) {
      case 'string':
        return typeof value === 'string' ? null : 'Must be a string';
      case 'number':
        return typeof value === 'number' && !isNaN(value)
          ? null
          : 'Must be a number';
      case 'boolean':
        return typeof value === 'boolean' ? null : 'Must be a boolean';
      case 'email':
        return this.isValidEmail(value) ? null : 'Must be a valid email';
      case 'url':
        return this.isValidUrl(value) ? null : 'Must be a valid URL';
      case 'date':
        return this.isValidDate(value) ? null : 'Must be a valid date';
      default:
        return null;
    }
  }

  /**
   * VerifyEmail格式
   */
  private isValidEmail(email: string): boolean {
    const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * VerifyURL格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * VerifyDay格式
   */
  private isValidDate(date: unknown): boolean {
    const _dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * VerifyAPIResponse
   */
  public validateApiResponse<T = any>(
    response: unknown
  ): ValidationResult<ApiResponse<T>> {
    try {
      // CheckResponse結構
      if (!response || typeof response !== 'object') {
        return {
          isValid: false,
          errors: ['Invalid response format'],
          errorMessage: 'Invalid response format',
        };
      }

      // Check必要Field
      if (typeof response.success !== 'boolean') {
        return {
          isValid: false,
          errors: ['Response must contain success field'],
          errorMessage: 'Response must contain success field',
        };
      }

      // 如果Success，CheckDataField
      if (response.success && response.data === undefined) {
        return {
          isValid: false,
          errors: ['Successful response must contain data field'],
          errorMessage: 'Successful response must contain data field',
        };
      }

      // 如果Failed，CheckErrorInformation
      if (!response.success && !response.message && !response.errors) {
        return {
          isValid: false,
          errors: ['Failed response must contain error information'],
          errorMessage: 'Failed response must contain error information',
        };
      }

      return {
        isValid: true,
        data: response as ApiResponse<T>,
        errors: [],
      };
    } catch (error) {
      logger.error('API response validation error', error);
      return {
        isValid: false,
        errors: ['API response validation failed'],
        errorMessage: 'API response validation failed',
      };
    }
  }

  /**
   * VerifyUserLoginData
   */
  public validateLoginData(data: unknown): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'email', required: true, type: 'email' },
      { field: 'password', required: true, minLength: 6 },
    ];

    return this.validateInput(data, rules);
  }

  /**
   * VerifyUserRegisterData
   */
  public validateRegisterData(data: unknown): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'email', required: true, type: 'email' },
      { field: 'password', required: true, minLength: 8 },
      { field: 'username', required: true, minLength: 3, maxLength: 50 },
    ];

    return this.validateInput(data, rules);
  }

  /**
   * Verify卡片Data
   */
  public validateCardData(data: unknown): ValidationResult {
    const rules: ValidationRule[] = [
      { field: 'name', required: true, minLength: 1, maxLength: 100 },
      { field: 'type', required: true },
      { field: 'rarity', required: true },
    ];

    return this.validateInput(data, rules);
  }
}

// Export單例Instance
export const _validationService = ValidationService.getInstance();

// Export便捷Function
export const _validateInput = (data: unknown, rules: ValidationRule[]) =>
  validationService.validateInput(data, rules);

export const _validateApiResponse = (response: unknown) =>
  validationService.validateApiResponse(response);

export const _validateLoginData = (data: unknown) =>
  validationService.validateLoginData(data);

export const _validateRegisterData = (data: unknown) =>
  validationService.validateRegisterData(data);

export const _validateCardData = (data: unknown) =>
  validationService.validateCardData(data);

export default validationService;
