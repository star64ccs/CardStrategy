import { z, ZodError, ZodSchema } from 'zod';
import { logger } from './logger';
import { ValidationSchemas } from './validationSchemas';

// 驗證結果類型
export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
  errorMessage?: string;
}

// 驗證錯誤類型
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  path?: (string | number)[];
}

// 驗證配置
export interface ValidationConfig {
  strict?: boolean; // 嚴格模式，不允許額外字段
  transform?: boolean; // 是否轉換數據類型
  stripUnknown?: boolean; // 是否移除未知字段
  abortEarly?: boolean; // 是否在遇到第一個錯誤時停止
}

// 默認驗證配置
const defaultConfig: ValidationConfig = {
  strict: false,
  transform: true,
  stripUnknown: true,
  abortEarly: false
};

// 數據驗證服務類
class ValidationService {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 驗證輸入數據
   * @param schema 驗證模式
   * @param data 要驗證的數據
   * @param context 驗證上下文（用於錯誤消息）
   * @returns 驗證結果
   */
  validateInput<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);
        const errorMessage = this.generateErrorMessage(validationErrors, context);

        logger.warn(`輸入驗證失敗${context ? ` (${context})` : ''}:`, {
          errors: validationErrors,
          data: this.sanitizeDataForLogging(data)
        });

        return {
          isValid: false,
          errors: validationErrors,
          errorMessage
        };
      }

      logger.error('驗證過程中發生未知錯誤:', error);
      return {
        isValid: false,
        errorMessage: '驗證過程中發生未知錯誤'
      };
    }
  }

  /**
   * 驗證 API 響應數據
   * @param schema 驗證模式
   * @param response API 響應數據
   * @param endpoint API 端點名稱
   * @returns 驗證結果
   */
  validateApiResponse<T>(
    schema: ZodSchema<T>,
    response: unknown,
    endpoint?: string
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(response);
      return {
        isValid: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);
        const errorMessage = this.generateErrorMessage(validationErrors, `API 響應${endpoint ? ` (${endpoint})` : ''}`);

        logger.error(`API 響應驗證失敗${endpoint ? ` (${endpoint})` : ''}:`, {
          errors: validationErrors,
          response: this.sanitizeDataForLogging(response)
        });

        return {
          isValid: false,
          errors: validationErrors,
          errorMessage
        };
      }

      logger.error('API 響應驗證過程中發生未知錯誤:', error);
      return {
        isValid: false,
        errorMessage: 'API 響應驗證過程中發生未知錯誤'
      };
    }
  }

  /**
   * 安全驗證（不拋出錯誤）
   * @param schema 驗證模式
   * @param data 要驗證的數據
   * @returns 驗證結果
   */
  safeValidate<T>(
    schema: ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        isValid: true,
        data: result.data
      };
    }
    const validationErrors = this.formatZodErrors(result.error);
    return {
      isValid: false,
      errors: validationErrors,
      errorMessage: this.generateErrorMessage(validationErrors)
    };

  }

  /**
   * 部分驗證（只驗證提供的字段）
   * @param schema 驗證模式
   * @param data 要驗證的數據
   * @param partial 是否為部分驗證
   * @returns 驗證結果
   */
  validatePartial<T>(
    schema: ZodSchema<T>,
    data: unknown,
    partial: boolean = true
  ): ValidationResult<T> {
    try {
      const partialSchema = partial ? schema.partial() : schema;
      const validatedData = partialSchema.parse(data);
      return {
        isValid: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);
        return {
          isValid: false,
          errors: validationErrors,
          errorMessage: this.generateErrorMessage(validationErrors, '部分驗證')
        };
      }

      return {
        isValid: false,
        errorMessage: '部分驗證過程中發生未知錯誤'
      };
    }
  }

  /**
   * 驗證表單數據
   * @param formData 表單數據
   * @param fieldValidations 字段驗證規則
   * @returns 驗證結果
   */
  validateForm(
    formData: Record<string, any>,
    fieldValidations: Record<string, ZodSchema<any>>
  ): ValidationResult<Record<string, any>> {
    const errors: ValidationError[] = [];
    const validatedData: Record<string, any> = {};

    for (const [field, schema] of Object.entries(fieldValidations)) {
      const fieldValue = formData[field];
      const result = this.safeValidate(schema, fieldValue);

      if (result.isValid && result.data !== undefined) {
        validatedData[field] = result.data;
      } else if (result.errors) {
        errors.push(...result.errors.map(error => ({
          ...error,
          field
        })));
      }
    }

    if (errors.length === 0) {
      return {
        isValid: true,
        data: validatedData
      };
    }
    return {
      isValid: false,
      errors,
      errorMessage: this.generateErrorMessage(errors, '表單驗證')
    };

  }

  /**
   * 驗證文件上傳
   * @param file 文件對象
   * @param options 驗證選項
   * @returns 驗證結果
   */
  validateFile(
    file: File,
    options: {
      maxSize?: number; // 最大文件大小（字節）
      allowedTypes?: string[]; // 允許的文件類型
      allowedExtensions?: string[]; // 允許的文件擴展名
    } = {}
  ): ValidationResult<File> {
    const errors: ValidationError[] = [];

    // 檢查文件大小
    if (options.maxSize && file.size > options.maxSize) {
      errors.push({
        field: 'file',
        message: `文件大小不能超過 ${this.formatFileSize(options.maxSize)}`,
        code: 'FILE_TOO_LARGE'
      });
    }

    // 檢查文件類型
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: `不支持的文件類型: ${file.type}`,
        code: 'INVALID_FILE_TYPE'
      });
    }

    // 檢查文件擴展名
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.push({
          field: 'file',
          message: `不支持的文件擴展名: ${extension}`,
          code: 'INVALID_FILE_EXTENSION'
        });
      }
    }

    if (errors.length === 0) {
      return {
        isValid: true,
        data: file
      };
    }
    return {
      isValid: false,
      errors,
      errorMessage: this.generateErrorMessage(errors, '文件驗證')
    };

  }

  /**
   * 格式化 Zod 錯誤
   * @param error Zod 錯誤對象
   * @returns 格式化的驗證錯誤數組
   */
  private formatZodErrors(error: ZodError): ValidationError[] {
    return error.errors.map(zodError => ({
      field: zodError.path.join('.'),
      message: zodError.message,
      code: zodError.code,
      path: zodError.path
    }));
  }

  /**
   * 生成錯誤消息
   * @param errors 驗證錯誤數組
   * @param context 錯誤上下文
   * @returns 格式化的錯誤消息
   */
  private generateErrorMessage(errors: ValidationError[], context?: string): string {
    if (errors.length === 0) {
      return '驗證失敗';
    }

    const errorMessages = errors.map(error =>
      `${error.field}: ${error.message}`
    );

    const prefix = context ? `${context}失敗` : '驗證失敗';
    return `${prefix}: ${errorMessages.join('; ')}`;
  }

  /**
   * 清理數據用於日誌記錄（移除敏感信息）
   * @param data 原始數據
   * @returns 清理後的數據
   */
  private sanitizeDataForLogging(data: unknown): unknown {
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data as Record<string, any> };

      // 移除敏感字段
      const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'key'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    }

    return data;
  }

  /**
   * 格式化文件大小
   * @param bytes 字節數
   * @returns 格式化的文件大小字符串
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * 更新驗證配置
   * @param newConfig 新的配置
   */
  updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 獲取當前配置
   * @returns 當前驗證配置
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }
}

// 創建全局驗證服務實例
export const validationService = new ValidationService();

// 導出便捷函數
export const validateInput = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> => validationService.validateInput(schema, data, context);

export const validateApiResponse = <T>(
  schema: ZodSchema<T>,
  response: unknown,
  endpoint?: string
): ValidationResult<T> => validationService.validateApiResponse(schema, response, endpoint);

export const safeValidate = <T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> => validationService.safeValidate(schema, data);

export const validateForm = (
  formData: Record<string, any>,
  fieldValidations: Record<string, ZodSchema<any>>
): ValidationResult<Record<string, any>> => validationService.validateForm(formData, fieldValidations);

export const validateFile = (
  file: File,
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): ValidationResult<File> => validationService.validateFile(file, options);

// 導出類型
export type { ValidationResult, ValidationError, ValidationConfig };
