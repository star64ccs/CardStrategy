// 表單驗證動畫組件
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';

import type { FormValidationConfig } from '../../types/microInteractions';
import {
  MicroInteractionType,
  TriggerType,
} from '../../types/microInteractions';
import { useMicroInteraction } from '../providers/MicroInteractionProvider';

// 組件 Props
interface FormValidationAnimationProps {
  children: ReactNode;
  config?: Partial<FormValidationConfig>;
  validationState: 'idle' | 'validating' | 'success' | 'error' | 'warning';
  message?: string;
  onValidationChange?: (state: string, message?: string) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  id?: string;
}

// 默認配置
const DEFAULT_CONFIG: FormValidationConfig = {
  id: '',
  type: MicroInteractionType.FORM_VALIDATION,
  trigger: TriggerType.AUTO,
  duration: 500,
  easing: 'ease-out',
  success: {
    icon: '✓',
    color: '#4CAF50',
    duration: 500,
    shake: false,
  },
  error: {
    icon: '✗',
    color: '#F44336',
    duration: 500,
    shake: true,
    shakeIntensity: 10,
  },
  warning: {
    icon: '⚠',
    color: '#FF9800',
    duration: 500,
    pulse: true,
  },
  accessibility: {
    reducedMotion: false,
    screenReader: true,
    keyboardOnly: false,
  },
  performance: {
    useTransform: true,
    useOpacity: true,
    useWillChange: true,
    throttleScroll: false,
  },
};

// 表單驗證動畫組件
export const FormValidationAnimation: React.FC<
  FormValidationAnimationProps
> = ({
  children,
  config = {},
  validationState,
  message,
  onValidationChange,
  className = '',
  style = {},
  disabled = false,
  id,
}) => {
  const { register, trigger, unregister } = useMicroInteraction();
  const _containerRef = useRef<HTMLDivElement>(null);
  const _interactionIdRef = useRef<string>('');
  const _prevValidationStateRef = useRef<string>(validationState);

  // 合併配置
  const finalConfig: FormValidationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    id:
      id ||
      `form-validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  // 註冊微交互
  useEffect(() => {
    if (!disabled) {
      const _interactionId = register(finalConfig);
      interactionIdRef.current = interactionId;

      return () => {
        unregister(interactionId);
      };
    }
    return undefined;
  }, [register, unregister, finalConfig, disabled]);

  // 監聽驗證狀態變化
  useEffect(() => {
    if (
      disabled ||
      !interactionIdRef.current ||
      validationState === prevValidationStateRef.current
    ) {
      return;
    }

    const _triggerValidationAnimation = async () => {
      try {
        await trigger(interactionIdRef.current, {
          element: containerRef.current,
          validationState,
          message,
          previousState: prevValidationStateRef.current,
        });
      } catch (error) {
        console.warn('表單驗證動畫失敗:', error);
      }
    };

    triggerValidationAnimation();
    prevValidationStateRef.current = validationState;
  }, [validationState, message, disabled, trigger]);

  // 處理驗證狀態變化
  const _handleValidationChange = useCallback(
    (newState: string, newMessage?: string) => {
      onValidationChange?.(newState, newMessage);
    },
    [onValidationChange]
  );

  // 計算樣式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  // 根據驗證狀態添加樣式
  const _getValidationStyles = () => {
    switch (validationState) {
      case 'success':
        return {
          borderColor: finalConfig.success?.color || '#4CAF50',
          boxShadow: `0 0 0 2px ${finalConfig.success?.color || '#4CAF50'}20`,
        };
      case 'error':
        return {
          borderColor: finalConfig.error?.color || '#F44336',
          boxShadow: `0 0 0 2px ${finalConfig.error?.color || '#F44336'}20`,
        };
      case 'warning':
        return {
          borderColor: finalConfig.warning?.color || '#FF9800',
          boxShadow: `0 0 0 2px ${finalConfig.warning?.color || '#FF9800'}20`,
        };
      case 'validating':
        return {
          borderColor: '#1976D2',
          boxShadow: '0 0 0 2px #1976D220',
        };
      default:
        return {};
    }
  };

  // 添加性能優化樣式
  if (finalConfig.performance?.useWillChange) {
    containerStyle.willChange = 'transform, opacity, box-shadow';
  }

  if (finalConfig.performance?.useTransform) {
    containerStyle.transform = 'translateZ(0)';
  }

  const _finalStyle = {
    ...containerStyle,
    ...getValidationStyles(),
  };

  return (
    <div
      ref={containerRef}
      className={`form-validation-animation form-validation-${validationState} ${className}`}
      style={finalStyle}
      data-micro-interaction={finalConfig.id}
      data-validation-state={validationState}
      aria-describedby={message ? `${finalConfig.id}-message` : undefined}
      role='group'
    >
      {children}
      {message && (
        <div
          id={`${finalConfig.id}-message`}
          className='validation-message'
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            fontSize: '12px',
            marginTop: '4px',
            color:
              validationState === 'success'
                ? finalConfig.success?.color
                : validationState === 'error'
                  ? finalConfig.error?.color
                  : finalConfig.warning?.color,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {validationState === 'success' && finalConfig.success?.icon && (
            <span className='validation-icon'>{finalConfig.success.icon}</span>
          )}
          {validationState === 'error' && finalConfig.error?.icon && (
            <span className='validation-icon'>{finalConfig.error.icon}</span>
          )}
          {validationState === 'warning' && finalConfig.warning?.icon && (
            <span className='validation-icon'>{finalConfig.warning.icon}</span>
          )}
          <span className='validation-text'>{message}</span>
        </div>
      )}
    </div>
  );
};

// 便捷組件：輸入框驗證
export const ValidatedInput: React.FC<
  Omit<FormValidationAnimationProps, 'children'> & {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    autoComplete?: string;
  }
> = ({
  validationState,
  message,
  onValidationChange,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  pattern,
  minLength,
  maxLength,
  autoComplete,
  className = '',
  style = {},
  ...props
}) => {
  const _inputRef = useRef<HTMLInputElement>(null);

  // 驗證邏輯
  const _validateInput = useCallback(
    (inputValue: string) => {
      if (required && !inputValue.trim()) {
        return { state: 'error' as const, message: '此欄位為必填項' };
      }

      if (pattern && !new RegExp(pattern).test(inputValue)) {
        return { state: 'error' as const, message: '格式不正確' };
      }

      if (minLength && inputValue.length < minLength) {
        return {
          state: 'error' as const,
          message: `最少需要 ${minLength} 個字符`,
        };
      }

      if (maxLength && inputValue.length > maxLength) {
        return {
          state: 'error' as const,
          message: `最多只能 ${maxLength} 個字符`,
        };
      }

      if (inputValue.trim()) {
        return { state: 'success' as const, message: '格式正確' };
      }

      return { state: 'idle' as const, message: '' };
    },
    [required, pattern, minLength, maxLength]
  );

  // 處理輸入變化
  const _handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const _newValue = event.target.value;
      onChange(newValue);

      // 延遲驗證，避免過於頻繁
      setTimeout(() => {
        const _validation = validateInput(newValue);
        onValidationChange?.(validation.state, validation.message);
      }, 300);
    },
    [onChange, validateInput, onValidationChange]
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    ...style,
  };

  return (
    <FormValidationAnimation
      validationState={validationState}
      message={message}
      onValidationChange={onValidationChange}
      className={className}
      style={inputStyle}
      {...props}
    >
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 'inherit',
        }}
      />
    </FormValidationAnimation>
  );
};

// 便捷組件：選擇框驗證
export const ValidatedSelect: React.FC<
  Omit<FormValidationAnimationProps, 'children'> & {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
  }
> = ({
  validationState,
  message,
  onValidationChange,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const _selectRef = useRef<HTMLSelectElement>(null);

  // 驗證邏輯
  const _validateSelect = useCallback(
    (selectValue: string) => {
      if (required && !selectValue) {
        return { state: 'error' as const, message: '請選擇一個選項' };
      }

      if (selectValue) {
        return { state: 'success' as const, message: '已選擇' };
      }

      return { state: 'idle' as const, message: '' };
    },
    [required]
  );

  // 處理選擇變化
  const _handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const _newValue = event.target.value;
      onChange(newValue);

      const _validation = validateSelect(newValue);
      onValidationChange?.(validation.state, validation.message);
    },
    [onChange, validateSelect, onValidationChange]
  );

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    background: 'white',
    ...style,
  };

  return (
    <FormValidationAnimation
      validationState={validationState}
      message={message}
      onValidationChange={onValidationChange}
      className={className}
      style={selectStyle}
      {...props}
    >
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        required={required}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 'inherit',
        }}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormValidationAnimation>
  );
};

// 便捷組件：文本域驗證
export const ValidatedTextarea: React.FC<
  Omit<FormValidationAnimationProps, 'children'> & {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    rows?: number;
  }
> = ({
  validationState,
  message,
  onValidationChange,
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  maxLength,
  rows = 4,
  className = '',
  style = {},
  ...props
}) => {
  const _textareaRef = useRef<HTMLTextAreaElement>(null);

  // 驗證邏輯
  const _validateTextarea = useCallback(
    (textareaValue: string) => {
      if (required && !textareaValue.trim()) {
        return { state: 'error' as const, message: '此欄位為必填項' };
      }

      if (minLength && textareaValue.length < minLength) {
        return {
          state: 'error' as const,
          message: `最少需要 ${minLength} 個字符`,
        };
      }

      if (maxLength && textareaValue.length > maxLength) {
        return {
          state: 'error' as const,
          message: `最多只能 ${maxLength} 個字符`,
        };
      }

      if (textareaValue.trim()) {
        return { state: 'success' as const, message: '格式正確' };
      }

      return { state: 'idle' as const, message: '' };
    },
    [required, minLength, maxLength]
  );

  // 處理輸入變化
  const _handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const _newValue = event.target.value;
      onChange(newValue);

      // 延遲驗證
      setTimeout(() => {
        const _validation = validateTextarea(newValue);
        onValidationChange?.(validation.state, validation.message);
      }, 300);
    },
    [onChange, validateTextarea, onValidationChange]
  );

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    ...style,
  };

  return (
    <FormValidationAnimation
      validationState={validationState}
      message={message}
      onValidationChange={onValidationChange}
      className={className}
      style={textareaStyle}
      {...props}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          resize: 'none',
        }}
      />
    </FormValidationAnimation>
  );
};

// 默認導出
export default FormValidationAnimation;
