// Input Component
import React, { forwardRef, useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type {
  ComponentSize,
  ComponentState,
  ComponentVariant,
  InputProps,
} from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// Input框Component
export const _Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      variant = 'primary',
      size = 'md',
      state = 'default',
      placeholder,
      value,
      defaultValue,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,
      name,
      id,
      form,
      list,
      step,
      min,
      max,
      multiple,
      accept,
      capture,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      error,
      helperText,
      label,
      prefix,
      suffix,
      className = '',
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-hidden': ariaHidden,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const { currentThemeData } = useDesignSystem();
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // 當前Value
    const _currentValue = value !== undefined ? value : internalValue;

    // 計算Input框樣式
    const _inputStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `1px solid ${theme.colors?.border?.primary || '#E0E0E0'}`,
        borderRadius: theme.borderRadius?.md || '8px',
        backgroundColor: theme.colors?.background?.primary || '#FFFFFF',
        color: theme.colors?.text?.primary || '#000000',
        fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
        transition: 'all 0.2s ease',
        outline: 'none',
        position: 'relative',
        ...style,
      };

      // 尺寸樣式
      const sizeStyles: Record<ComponentSize, React.CSSProperties> = {
        xs: {
          padding: '4px 8px',
          fontSize: theme.typography?.sizes?.xs || '12px',
          minHeight: '24px',
        },
        sm: {
          padding: '6px 12px',
          fontSize: theme.typography?.sizes?.sm || '14px',
          minHeight: '32px',
        },
        small: {
          padding: '6px 12px',
          fontSize: theme.typography?.sizes?.sm || '14px',
          minHeight: '32px',
        },
        md: {
          padding: '8px 12px',
          fontSize: theme.typography?.sizes?.base || '16px',
          minHeight: '40px',
        },
        lg: {
          padding: '12px 16px',
          fontSize: theme.typography?.sizes?.lg || '18px',
          minHeight: '48px',
        },
        xl: {
          padding: '16px 20px',
          fontSize: theme.typography?.sizes?.xl || '20px',
          minHeight: '56px',
        },
      };

      // 變體樣式
      const variantStyles: Record<ComponentVariant, React.CSSProperties> = {
        primary: {
          borderColor: theme.colors?.border?.primary || '#E0E0E0',
        },
        secondary: {
          borderColor: theme.colors?.border?.secondary || '#F0F0F0',
          backgroundColor: theme.colors?.background?.secondary || '#F8F9FA',
        },
        tertiary: {
          borderColor: 'transparent',
          backgroundColor: 'transparent',
        },
        danger: {
          borderColor: theme.colors?.brand?.error || '#DC3545',
        },
        success: {
          borderColor: theme.colors?.brand?.success || '#28A745',
        },
        warning: {
          borderColor: theme.colors?.brand?.warning || '#FFC107',
        },
        info: {
          borderColor: theme.colors?.brand?.info || '#17A2B8',
        },
        outline: {
          borderColor: theme.colors?.border?.primary || '#E0E0E0',
          backgroundColor: 'transparent',
        },
        ghost: {
          borderColor: 'transparent',
          backgroundColor: 'transparent',
        },
      };

      // Status樣式
      const stateStyles: Record<ComponentState, React.CSSProperties> = {
        default: {},
        hover: {
          borderColor: theme.colors?.border?.focus || '#007AFF',
        },
        active: {
          borderColor: theme.colors?.border?.focus || '#007AFF',
        },
        focus: {
          borderColor: theme.colors?.border?.focus || '#007AFF',
          boxShadow: `0 0 0 2px ${theme.colors?.border?.focus || '#007AFF'}20`,
        },
        disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
          backgroundColor: theme.colors?.background?.tertiary || '#F5F5F5',
        },
        loading: {
          cursor: 'wait',
          pointerEvents: 'none',
        },
      };

      // ErrorStatus
      const _errorStyles = error
        ? {
            borderColor: theme.colors?.brand?.error || '#DC3545',
            boxShadow: `0 0 0 2px ${theme.colors?.brand?.error || '#DC3545'}20`,
          }
        : {};

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...stateStyles[state],
        ...(isFocused ? stateStyles.focus : {}),
        ...errorStyles,
      };
    }, [currentThemeData, variant, size, state, error, isFocused, style]);

    // 計算InternalInput框樣式
    const _innerInputStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      return {
        flex: 1,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        padding: 0,
        margin: 0,
        minWidth: 0,
        '&::placeholder': {
          color: theme.colors?.text?.tertiary || '#ADB5BD',
          opacity: 1,
        },
        '&:disabled': {
          cursor: 'not-allowed',
        },
      };
    }, [currentThemeData]);

    // HandleValue變化
    const _handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const _newValue = event.target.value;

        if (value === undefined) {
          setInternalValue(newValue);
        }

        onChange?.(newValue, event);
      },
      [value, onChange]
    );

    // Handle焦點Event
    const _handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (!disabled) {
          setIsFocused(true);
          onFocus?.(event);
        }
      },
      [disabled, onFocus]
    );

    // Handle失焦Event
    const _handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (!disabled) {
          setIsFocused(false);
          onBlur?.(event);
        }
      },
      [disabled, onBlur]
    );

    // HandleKey盤Event
    const _handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!disabled) {
          onKeyDown?.(event);
        }
      },
      [disabled, onKeyDown]
    );

    const _handleKeyUp = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!disabled) {
          onKeyUp?.(event);
        }
      },
      [disabled, onKeyUp]
    );

    const _handleKeyPress = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!disabled) {
          onKeyPress?.(event);
        }
      },
      [disabled, onKeyPress]
    );

    // 生成UniqueID
    const _inputId = useMemo(
      () => id || `input-${Math.random().toString(36).substr(2, 9)}`,
      [id]
    );
    const _labelId = label ? `${inputId}-label` : undefined;
    const _helperId = helperText ? `${inputId}-helper` : undefined;
    const _errorId = error ? `${inputId}-error` : undefined;

    // 組合aria-describedby
    const _ariaDescribedByCombined = useMemo(() => {
      const _ids = [ariaDescribedBy, helperId, errorId].filter(Boolean);
      return ids.length > 0 ? ids.join(' ') : undefined;
    }, [ariaDescribedBy, helperId, errorId]);

    // 渲染前綴
    const _renderPrefix = () => {
      if (!prefix) return null;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '8px',
            color: currentThemeData?.colors?.text?.secondary || '#6C757D',
          }}
        >
          {prefix}
        </div>
      );
    };

    // 渲染後綴
    const _renderSuffix = () => {
      if (!suffix) return null;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '8px',
            color: currentThemeData?.colors?.text?.secondary || '#6C757D',
          }}
        >
          {suffix}
        </div>
      );
    };

    // 渲染Tag
    const _renderLabel = () => {
      if (!label) return null;

      return (
        <label
          htmlFor={inputId}
          id={labelId}
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: currentThemeData?.typography?.sizes?.sm || '14px',
            fontWeight: currentThemeData?.typography?.weights?.medium || '500',
            color: currentThemeData?.colors?.text?.primary || '#000000',
          }}
        >
          {label}
          {required && (
            <span
              style={{
                color: currentThemeData?.colors?.brand?.error || '#DC3545',
                marginLeft: '4px',
              }}
              aria-label='必填'
            >
              *
            </span>
          )}
        </label>
      );
    };

    // 渲染ErrorInformation
    const _renderError = () => {
      if (!error) return null;

      return (
        <div
          id={errorId}
          role='alert'
          style={{
            marginTop: '4px',
            fontSize: currentThemeData?.typography?.sizes?.sm || '14px',
            color: currentThemeData?.colors?.brand?.error || '#DC3545',
          }}
        >
          {error}
        </div>
      );
    };

    // 渲染Help文本
    const _renderHelperText = () => {
      if (!helperText) return null;

      return (
        <div
          id={helperId}
          style={{
            marginTop: '4px',
            fontSize: currentThemeData?.typography?.sizes?.sm || '14px',
            color: currentThemeData?.colors?.text?.secondary || '#6C757D',
          }}
        >
          {helperText}
        </div>
      );
    };

    return (
      <div
        className={`input-wrapper input-wrapper--${variant} input-wrapper--${size} ${className}`}
        style={{ width: '100%' }}
      >
        {renderLabel()}

        <div
          className={`input-container input-container--${state} ${error ? 'input-container--error' : ''}`}
          style={inputStyles}
          data-testid={dataTestId}
        >
          {renderPrefix()}

          {(() => {
            const _enhancedProps = enhanceComponent(
              {
                ref,
                type,
                id: inputId,
                name,
                value: currentValue,
                placeholder,
                required,
                disabled,
                readOnly,
                autoComplete,
                autoFocus,
                maxLength,
                minLength,
                pattern,
                form,
                list,
                step,
                min,
                max,
                multiple,
                accept,
                capture,
                style: innerInputStyles,
                onChange: handleChange,
                onFocus: handleFocus,
                onBlur: handleBlur,
                onKeyDown: handleKeyDown,
                onKeyUp: handleKeyUp,
                onKeyPress: handleKeyPress,
                'aria-label': ariaLabel,
                'aria-describedby': ariaDescribedByCombined,
                'aria-hidden': ariaHidden,
                'aria-invalid': error ? 'true' : 'false',
                role,
                tabIndex,
                ...props,
              },
              {
                aria: {
                  role: 'textbox',
                  label: ariaLabel || label,
                  describedBy: ariaDescribedByCombined,
                  hidden: ariaHidden,
                  required,
                  invalid: !!error,
                  disabled,
                  live: error ? 'assertive' : undefined,
                },
                keyboard: {
                  onEscape: () => {
                    // ClearInputContent
                    if (onChange) {
                      onChange('', {} as React.ChangeEvent<HTMLInputElement>);
                    }
                  },
                  preventDefault: false,
                },
                focus: {
                  autoFocus,
                },
                screenReader: {
                  announcement: error ? `Error：${error}` : undefined,
                  live: error ? 'assertive' : undefined,
                },
                voiceControl: {
                  voiceLabel: ariaLabel || label || placeholder || '輸入框',
                  voiceCommands: ['輸入', '填寫', '修改', '清除'],
                },
              }
            );

            return <input {...enhancedProps} />;
          })()}

          {renderSuffix()}
        </div>

        {renderError()}
        {renderHelperText()}
      </div>
    );
  }
);

// SettingsShow名稱
Input.displayName = 'Input';

// ExportComponent
export default Input;
