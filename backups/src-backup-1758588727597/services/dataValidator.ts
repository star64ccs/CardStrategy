/**
 * 自動數據驗證服務
 * 提供完整的數據驗證和質量檢查功能
 */

import { logger } from '../utils/logger';

export interface ValidationRule {
  field: string;
  type:
    | 'required'
    | 'type'
    | 'format'
    | 'range'
    | 'length'
    | 'pattern'
    | 'custom'
    | 'unique'
    | 'reference';
  value?: any;
  message?: string;
  validator?: (value: any, data: any) => boolean;
  options?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    allowedValues?: any[];
    referenceTable?: string;
    referenceField?: string;
  };
}

export interface Schema {
  name: string;
  version: string;
  fields: ValidationRule[];
  dependencies?: SchemaDependency[];
  customValidators?: CustomValidator[];
}

export interface SchemaDependency {
  type: 'required_if' | 'required_unless' | 'conditional' | 'exclusive';
  fields: string[];
  condition: (data: any) => boolean;
  message?: string;
}

export interface CustomValidator {
  name: string;
  validate: (data: any) => ValidationResult;
  message?: string;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
  severity: 'error' | 'warning' | 'info';
  code: string;
  context?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data?: any;
  score: number;
  summary: {
    totalFields: number;
    validFields: number;
    errorFields: number;
    warningFields: number;
    skippedFields: number;
  };
}

export interface ValidationConfig {
  strictMode?: boolean;
  skipWarnings?: boolean;
  stopOnFirstError?: boolean;
  includeContext?: boolean;
  customMessages?: Record<string, string>;
  validationTimeout?: number;
}

class DataValidator {
  private static instance: DataValidator;
  private schemas: Map<string, Schema> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();
  private customValidators: Map<string, CustomValidator> = new Map();

  private constructor() {
    this.initializeDefaultSchemas();
    this.initializeDefaultValidators();
  }

  public static getInstance(): DataValidator {
    if (!DataValidator.instance) {
      DataValidator.instance = new DataValidator();
    }
    return DataValidator.instance;
  }

  /**
   * 驗證數據
   */
  public async validateData(
    data: any,
    schema: Schema | string,
    config: ValidationConfig = {}
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const schemaObj =
      typeof schema === 'string' ? this.schemas.get(schema) : schema;

    if (!schemaObj) {
      throw new Error(`Schema not found: ${schema}`);
    }

    const {
      strictMode = false,
      skipWarnings = false,
      stopOnFirstError = false,
      includeContext = true,
      customMessages = {},
      validationTimeout = 5000,
    } = config;

    // 檢查緩存
    const cacheKey = this.generateCacheKey(data, schemaObj, config);
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let validFields = 0;
    let errorFields = 0;
    let warningFields = 0;
    let skippedFields = 0;

    try {
      // 設置超時
      const validationPromise = this.performValidation(
        data,
        schemaObj,
        errors,
        warnings,
        customMessages,
        includeContext,
        stopOnFirstError
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Validation timeout')),
          validationTimeout
        );
      });

      await Promise.race([validationPromise, timeoutPromise]);

      // 統計結果
      for (const field of schemaObj.fields) {
        const fieldErrors = errors.filter(e => e.field === field.field);
        const fieldWarnings = warnings.filter(w => w.field === field.field);

        if (fieldErrors.length > 0) {
          errorFields++;
        } else if (fieldWarnings.length > 0) {
          warningFields++;
        } else {
          validFields++;
        }
      }

      // 執行依賴驗證
      if (schemaObj.dependencies) {
        for (const dependency of schemaObj.dependencies) {
          try {
            if (dependency.condition(data)) {
              const dependencyResult = await this.validateDependency(
                data,
                dependency
              );
              errors.push(...dependencyResult.errors);
              warnings.push(...dependencyResult.warnings);
            }
          } catch (error) {
            errors.push({
              field: 'dependency',
              rule: dependency.type,
              message:
                dependency.message || `Dependency validation failed: ${error}`,
              value: null,
              severity: 'error',
              code: 'DEPENDENCY_ERROR',
              context: { dependency },
            });
          }
        }
      }

      // 執行自定義驗證器
      if (schemaObj.customValidators) {
        for (const validator of schemaObj.customValidators) {
          try {
            const result = await validator.validate(data);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
          } catch (error) {
            errors.push({
              field: 'custom',
              rule: validator.name,
              message:
                validator.message || `Custom validation failed: ${error}`,
              value: null,
              severity: 'error',
              code: 'CUSTOM_VALIDATION_ERROR',
              context: { validator: validator.name },
            });
          }
        }
      }

      // 過濾警告（如果配置了跳過警告）
      const finalWarnings = skipWarnings ? [] : warnings;

      // 計算驗證分數
      const totalFields = schemaObj.fields.length;
      const score = totalFields > 0 ? (validFields / totalFields) * 100 : 100;

      const result: ValidationResult = {
        isValid:
          errors.length === 0 && (!strictMode || finalWarnings.length === 0),
        errors,
        warnings: finalWarnings,
        data: errors.length === 0 ? data : undefined,
        score: Math.round(score * 100) / 100,
        summary: {
          totalFields,
          validFields,
          errorFields,
          warningFields,
          skippedFields,
        },
      };

      // 緩存結果
      this.validationCache.set(cacheKey, result);

      const duration = Date.now() - startTime;
      logger.debug('Data validation completed', {
        schema: schemaObj.name,
        duration,
        isValid: result.isValid,
        errors: errors.length,
        warnings: finalWarnings.length,
        score: result.score,
      });

      return result;
    } catch (error) {
      logger.error('Data validation failed', { error, schema: schemaObj.name });
      throw error;
    }
  }

  /**
   * 執行字段驗證
   */
  private async performValidation(
    data: any,
    schema: Schema,
    errors: ValidationError[],
    warnings: ValidationError[],
    customMessages: Record<string, string>,
    includeContext: boolean,
    stopOnFirstError: boolean
  ): Promise<void> {
    for (const field of schema.fields) {
      try {
        const value = this.getValueFromData(data, field.field);
        const fieldErrors = await this.validateField(
          value,
          field,
          data,
          customMessages,
          includeContext
        );

        errors.push(...fieldErrors.filter(e => e.severity === 'error'));
        warnings.push(...fieldErrors.filter(e => e.severity === 'warning'));

        if (stopOnFirstError && fieldErrors.length > 0) {
          break;
        }
      } catch (error) {
        errors.push({
          field: field.field,
          rule: field.type,
          message: `Validation error: ${error}`,
          value: null,
          severity: 'error',
          code: 'VALIDATION_EXCEPTION',
          context: includeContext ? { error: String(error) } : undefined,
        });
      }
    }
  }

  /**
   * 驗證單個字段
   */
  private async validateField(
    value: any,
    rule: ValidationRule,
    data: any,
    customMessages: Record<string, string>,
    includeContext: boolean
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const message = customMessages[rule.field] || rule.message;

    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          errors.push({
            field: rule.field,
            rule: 'required',
            message: message || `${rule.field} is required`,
            value,
            severity: 'error',
            code: 'REQUIRED_FIELD',
            context: includeContext ? { rule } : undefined,
          });
        }
        break;

      case 'type':
        if (value !== null && value !== undefined) {
          const expectedType = rule.value;
          const actualType = Array.isArray(value) ? 'array' : typeof value;

          if (actualType !== expectedType) {
            errors.push({
              field: rule.field,
              rule: 'type',
              message:
                message ||
                `${rule.field} must be of type ${expectedType}, got ${actualType}`,
              value,
              severity: 'error',
              code: 'TYPE_MISMATCH',
              context: includeContext
                ? { expected: expectedType, actual: actualType }
                : undefined,
            });
          }
        }
        break;

      case 'format':
        if (value !== null && value !== undefined && rule.options?.pattern) {
          if (!rule.options.pattern.test(String(value))) {
            errors.push({
              field: rule.field,
              rule: 'format',
              message: message || `${rule.field} format is invalid`,
              value,
              severity: 'error',
              code: 'FORMAT_INVALID',
              context: includeContext
                ? { pattern: rule.options.pattern.source }
                : undefined,
            });
          }
        }
        break;

      case 'range':
        if (
          value !== null &&
          value !== undefined &&
          typeof value === 'number'
        ) {
          const { min, max } = rule.options || {};

          if (min !== undefined && value < min) {
            errors.push({
              field: rule.field,
              rule: 'range',
              message: message || `${rule.field} must be at least ${min}`,
              value,
              severity: 'error',
              code: 'RANGE_MIN',
              context: includeContext ? { min, max } : undefined,
            });
          }

          if (max !== undefined && value > max) {
            errors.push({
              field: rule.field,
              rule: 'range',
              message: message || `${rule.field} must be at most ${max}`,
              value,
              severity: 'error',
              code: 'RANGE_MAX',
              context: includeContext ? { min, max } : undefined,
            });
          }
        }
        break;

      case 'length':
        if (value !== null && value !== undefined) {
          const { min, max } = rule.options || {};
          const length = Array.isArray(value)
            ? value.length
            : String(value).length;

          if (min !== undefined && length < min) {
            errors.push({
              field: rule.field,
              rule: 'length',
              message:
                message ||
                `${rule.field} must be at least ${min} characters/items`,
              value,
              severity: 'error',
              code: 'LENGTH_MIN',
              context: includeContext
                ? { min, max, actual: length }
                : undefined,
            });
          }

          if (max !== undefined && length > max) {
            errors.push({
              field: rule.field,
              rule: 'length',
              message:
                message ||
                `${rule.field} must be at most ${max} characters/items`,
              value,
              severity: 'error',
              code: 'LENGTH_MAX',
              context: includeContext
                ? { min, max, actual: length }
                : undefined,
            });
          }
        }
        break;

      case 'pattern':
        if (value !== null && value !== undefined && rule.options?.pattern) {
          if (!rule.options.pattern.test(String(value))) {
            errors.push({
              field: rule.field,
              rule: 'pattern',
              message:
                message || `${rule.field} does not match required pattern`,
              value,
              severity: 'error',
              code: 'PATTERN_MISMATCH',
              context: includeContext
                ? { pattern: rule.options.pattern.source }
                : undefined,
            });
          }
        }
        break;

      case 'custom':
        if (rule.validator) {
          try {
            if (!rule.validator(value, data)) {
              errors.push({
                field: rule.field,
                rule: 'custom',
                message: message || `${rule.field} failed custom validation`,
                value,
                severity: 'error',
                code: 'CUSTOM_VALIDATION',
                context: includeContext
                  ? { validator: rule.validator.toString() }
                  : undefined,
              });
            }
          } catch (error) {
            errors.push({
              field: rule.field,
              rule: 'custom',
              message: message || `Custom validation error: ${error}`,
              value,
              severity: 'error',
              code: 'CUSTOM_VALIDATION_ERROR',
              context: includeContext ? { error: String(error) } : undefined,
            });
          }
        }
        break;

      case 'unique':
        // 這裡需要與數據庫或其他存儲系統集成
        // 暫時跳過，實際實現時需要根據具體需求
        break;

      case 'reference':
        // 這裡需要與數據庫或其他存儲系統集成
        // 暫時跳過，實際實現時需要根據具體需求
        break;
    }

    return errors;
  }

  /**
   * 驗證依賴關係
   */
  private async validateDependency(
    data: any,
    dependency: SchemaDependency
  ): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    switch (dependency.type) {
      case 'required_if':
        if (dependency.condition(data)) {
          for (const field of dependency.fields) {
            const value = this.getValueFromData(data, field);
            if (value === null || value === undefined || value === '') {
              errors.push({
                field,
                rule: 'required_if',
                message:
                  dependency.message ||
                  `${field} is required when condition is met`,
                value,
                severity: 'error',
                code: 'REQUIRED_IF',
              });
            }
          }
        }
        break;

      case 'required_unless':
        if (!dependency.condition(data)) {
          for (const field of dependency.fields) {
            const value = this.getValueFromData(data, field);
            if (value === null || value === undefined || value === '') {
              errors.push({
                field,
                rule: 'required_unless',
                message:
                  dependency.message ||
                  `${field} is required unless condition is met`,
                value,
                severity: 'error',
                code: 'REQUIRED_UNLESS',
              });
            }
          }
        }
        break;

      case 'conditional':
        if (dependency.condition(data)) {
          // 執行條件驗證
          // 這裡可以添加更複雜的條件驗證邏輯
        }
        break;

      case 'exclusive':
        // 檢查互斥字段
        const hasValues = dependency.fields.filter(field => {
          const value = this.getValueFromData(data, field);
          return value !== null && value !== undefined && value !== '';
        });

        if (hasValues.length > 1) {
          errors.push({
            field: dependency.fields.join(', '),
            rule: 'exclusive',
            message:
              dependency.message ||
              `Only one of ${dependency.fields.join(', ')} can be set`,
            value: hasValues,
            severity: 'error',
            code: 'EXCLUSIVE_FIELDS',
          });
        }
        break;
    }

    return { errors, warnings };
  }

  /**
   * 從數據中獲取值
   */
  private getValueFromData(data: any, field: string): any {
    const fields = field.split('.');
    let value = data;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  /**
   * 生成緩存鍵
   */
  private generateCacheKey(
    data: any,
    schema: Schema,
    config: ValidationConfig
  ): string {
    const dataHash = JSON.stringify(data);
    const configHash = JSON.stringify(config);
    return `${schema.name}_${schema.version}_${dataHash}_${configHash}`;
  }

  /**
   * 添加自定義驗證器
   */
  public addCustomValidator(validator: CustomValidator): void {
    this.customValidators.set(validator.name, validator);
    logger.info('Custom validator added', { name: validator.name });
  }

  /**
   * 移除自定義驗證器
   */
  public removeCustomValidator(name: string): void {
    this.customValidators.delete(name);
    logger.info('Custom validator removed', { name });
  }

  /**
   * 添加模式
   */
  public addSchema(schema: Schema): void {
    this.schemas.set(schema.name, schema);
    logger.info('Schema added', { name: schema.name, version: schema.version });
  }

  /**
   * 移除模式
   */
  public removeSchema(name: string): void {
    this.schemas.delete(name);
    logger.info('Schema removed', { name });
  }

  /**
   * 清除驗證緩存
   */
  public clearCache(): void {
    this.validationCache.clear();
    logger.info('Validation cache cleared');
  }

  /**
   * 獲取驗證統計
   */
  public getValidationStats(): {
    totalSchemas: number;
    totalValidators: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    return {
      totalSchemas: this.schemas.size,
      totalValidators: this.customValidators.size,
      cacheSize: this.validationCache.size,
      cacheHitRate: 0, // 需要實現命中率統計
    };
  }

  /**
   * 初始化默認模式
   */
  private initializeDefaultSchemas(): void {
    // 卡牌數據模式
    const cardSchema: Schema = {
      name: 'card',
      version: '1.0.0',
      fields: [
        {
          field: 'id',
          type: 'required',
          message: 'Card ID is required',
        },
        {
          field: 'name',
          type: 'required',
          message: 'Card name is required',
        },
        {
          field: 'name',
          type: 'length',
          options: { min: 1, max: 100 },
          message: 'Card name must be between 1 and 100 characters',
        },
        {
          field: 'price',
          type: 'type',
          value: 'number',
          message: 'Price must be a number',
        },
        {
          field: 'price',
          type: 'range',
          options: { min: 0, max: 1000000 },
          message: 'Price must be between 0 and 1,000,000',
        },
        {
          field: 'condition',
          type: 'required',
          message: 'Condition is required',
        },
        {
          field: 'condition',
          type: 'pattern',
          options: {
            pattern: /^(mint|near_mint|excellent|very_good|good|fair|poor)$/,
          },
          message: 'Invalid condition value',
        },
      ],
    };

    this.schemas.set('card', cardSchema);
    logger.info('Default schemas initialized');
  }

  /**
   * 初始化默認驗證器
   */
  private initializeDefaultValidators(): void {
    // 卡牌價格合理性驗證器
    const priceValidator: CustomValidator = {
      name: 'card_price_reasonableness',
      validate: (data: any) => {
        const errors: ValidationError[] = [];

        if (data.price && data.condition) {
          // 檢查價格與條件的合理性
          const conditionMultipliers = {
            mint: 1.0,
            near_mint: 0.9,
            excellent: 0.8,
            very_good: 0.7,
            good: 0.6,
            fair: 0.4,
            poor: 0.2,
          };

          const expectedPrice =
            data.basePrice *
            (conditionMultipliers[
              data.condition as keyof typeof conditionMultipliers
            ] || 1.0);
          const priceDifference =
            Math.abs(data.price - expectedPrice) / expectedPrice;

          if (priceDifference > 0.5) {
            // 價格差異超過50%
            errors.push({
              field: 'price',
              rule: 'price_reasonableness',
              message: 'Price seems unreasonable for the card condition',
              value: data.price,
              severity: 'warning',
              code: 'PRICE_REASONABLENESS',
            });
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings: errors,
          data,
          score: 100,
          summary: {
            totalFields: 1,
            validFields: errors.length === 0 ? 1 : 0,
            errorFields: 0,
            warningFields: errors.length,
            skippedFields: 0,
          },
        };
      },
    };

    this.customValidators.set('card_price_reasonableness', priceValidator);
    logger.info('Default validators initialized');
  }
}

export default DataValidator;
