import { useState, useCallback, useRef, useEffect } from 'react';
import { z, ZodSchema } from 'zod';
import { ValidationResult, ValidationError } from './validationService';

// 表單驗證狀態
export interface FormValidationState<T = any> {
  values: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  hasChanges: boolean;
}

// 表單驗證配置
export interface FormValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  initialValues?: Record<string, any>;
  onSubmit?: (values: any) => void | Promise<void>;
  onValidationError?: (errors: ValidationError[]) => void;
}

// 表單驗證 Hook
export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  config: FormValidationConfig = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    initialValues = {} as T,
    onSubmit,
    onValidationError
  } = config;

  // 表單狀態
  const [state, setState] = useState<FormValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
    hasChanges: false
  });

  // 初始值引用（用於檢測變化）
  const initialValuesRef = useRef(initialValues);
  const isInitialized = useRef(false);

  // 驗證函數
  const validate = useCallback(
    (values: T, fields?: string[]): ValidationResult<T> => {
      try {
        let validationSchema = schema;

        // 如果指定了特定字段，創建部分驗證模式
        if (fields && fields.length > 0) {
          const partialSchema: Record<string, any> = {};
          fields.forEach(field => {
            if (schema.shape && schema.shape[field]) {
              partialSchema[field] = schema.shape[field];
            }
          });
          validationSchema = z.object(partialSchema) as ZodSchema<T>;
        }

        const validatedData = validationSchema.parse(values);
        return {
          isValid: true,
          data: validatedData
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string[]> = {};

          error.errors.forEach(zodError => {
            const field = zodError.path.join('.');
            if (!errors[field]) {
              errors[field] = [];
            }
            errors[field].push(zodError.message);
          });

          return {
            isValid: false,
            errors: Object.entries(errors).map(([field, messages]) => ({
              field,
              message: messages.join('; '),
              code: 'VALIDATION_ERROR'
            }))
          };
        }

        return {
          isValid: false,
          errorMessage: '驗證過程中發生未知錯誤'
        };
      }
    },
    [schema]
  );

  // 更新表單值
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setState(prevState => {
        const newValues = { ...prevState.values, [field]: value };
        const hasChanges = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);

        const newErrors = { ...prevState.errors };

        // 如果啟用了即時驗證，驗證該字段
        if (validateOnChange) {
          const validation = validate(newValues, [field as string]);
          if (!validation.isValid && validation.errors) {
            validation.errors.forEach(error => {
              newErrors[error.field] = [error.message];
            });
          } else {
            // 清除該字段的錯誤
            delete newErrors[field as string];
          }
        }

        return {
          ...prevState,
          values: newValues,
          errors: newErrors,
          hasChanges,
          isValid: Object.keys(newErrors).length === 0
        };
      });
    },
    [validate, validateOnChange]
  );

  // 批量更新表單值
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setState(prevState => {
        const updatedValues = { ...prevState.values, ...newValues };
        const hasChanges = JSON.stringify(updatedValues) !== JSON.stringify(initialValuesRef.current);

        return {
          ...prevState,
          values: updatedValues,
          hasChanges
        };
      });
    },
    []
  );

  // 設置字段為已觸摸狀態
  const setTouched = useCallback(
    (field: keyof T, touched: boolean = true) => {
      setState(prevState => ({
        ...prevState,
        touched: { ...prevState.touched, [field]: touched }
      }));
    },
    []
  );

  // 處理字段變化
  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValue(field, value);
    },
    [setValue]
  );

  // 處理字段失去焦點
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);

      if (validateOnBlur) {
        const validation = validate(state.values, [field as string]);
        setState(prevState => {
          const newErrors = { ...prevState.errors };

          if (!validation.isValid && validation.errors) {
            validation.errors.forEach(error => {
              newErrors[error.field] = [error.message];
            });
          } else {
            delete newErrors[field as string];
          }

          return {
            ...prevState,
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0
          };
        });
      }
    },
    [validate, validateOnBlur, setTouched, state.values]
  );

  // 重置表單
  const reset = useCallback(
    (newValues?: T) => {
      const resetValues = newValues || initialValuesRef.current;
      setState({
        values: resetValues,
        errors: {},
        touched: {},
        isValid: false,
        isSubmitting: false,
        hasChanges: false
      });
    },
    []
  );

  // 提交表單
  const submit = useCallback(
    async () => {
      if (state.isSubmitting) return;

      setState(prevState => ({ ...prevState, isSubmitting: true }));

      try {
        // 驗證整個表單
        const validation = validate(state.values);

        if (!validation.isValid) {
          // 設置所有錯誤
          const errors: Record<string, string[]> = {};
          if (validation.errors) {
            validation.errors.forEach(error => {
              errors[error.field] = [error.message];
            });
          }

          setState(prevState => ({
            ...prevState,
            errors,
            isValid: false,
            isSubmitting: false
          }));

          // 調用錯誤回調
          if (onValidationError && validation.errors) {
            onValidationError(validation.errors);
          }

          return;
        }

        // 調用提交回調
        if (onSubmit) {
          await onSubmit(validation.data || state.values);
        }

        // 重置提交狀態
        setState(prevState => ({ ...prevState, isSubmitting: false }));
      } catch (error) {
        // logger.info('表單提交錯誤:', error);
        setState(prevState => ({ ...prevState, isSubmitting: false }));
      }
    },
    [state.values, state.isSubmitting, validate, onSubmit, onValidationError]
  );

  // 獲取字段錯誤
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return state.errors[field as string]?.[0];
    },
    [state.errors]
  );

  // 檢查字段是否有效
  const isFieldValid = useCallback(
    (field: keyof T): boolean => {
      return !state.errors[field as string] || state.errors[field as string].length === 0;
    },
    [state.errors]
  );

  // 檢查字段是否已觸摸
  const isFieldTouched = useCallback(
    (field: keyof T): boolean => {
      return !!state.touched[field as string];
    },
    [state.touched]
  );

  // 檢查字段是否應該顯示錯誤
  const shouldShowFieldError = useCallback(
    (field: keyof T): boolean => {
      return isFieldTouched(field) && !isFieldValid(field);
    },
    [isFieldTouched, isFieldValid]
  );

  // 初始化時驗證
  useEffect(() => {
    if (!isInitialized.current) {
      const validation = validate(state.values);
      setState(prevState => ({
        ...prevState,
        isValid: validation.isValid
      }));
      isInitialized.current = true;
    }
  }, [validate, state.values]);

  return {
    // 狀態
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    hasChanges: state.hasChanges,

    // 方法
    setValue,
    setValues,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    submit,
    validate,

    // 工具方法
    getFieldError,
    isFieldValid,
    isFieldTouched,
    shouldShowFieldError
  };
}

// 導出類型
export type { FormValidationState, FormValidationConfig };
