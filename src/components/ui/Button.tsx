// Button Component
import React, { forwardRef, useCallback, useMemo } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type {
  ButtonProps,
  ComponentSize,
  ComponentState,
  ComponentVariant,
} from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// 按鈕Component
export const _Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      state = 'default',
      type = 'button',
      disabled = false,
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      href,
      target,
      rel,
      form,
      name,
      value,
      className = '',
      style,
      children,
      onClick,
      onKeyDown,
      onFocus,
      onBlur,
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
    const { currentThemeData, isAccessible } = useDesignSystem();

    // 計算按鈕樣式
    const _buttonStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        borderRadius: theme.borderRadius?.md || '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
        fontWeight: theme.typography?.weights?.medium || '500',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        outline: 'none',
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
          padding: '8px 16px',
          fontSize: theme.typography?.sizes?.base || '16px',
          minHeight: '40px',
        },
        lg: {
          padding: '12px 24px',
          fontSize: theme.typography?.sizes?.lg || '18px',
          minHeight: '48px',
        },
        xl: {
          padding: '16px 32px',
          fontSize: theme.typography?.sizes?.xl || '20px',
          minHeight: '56px',
        },
      };

      // 變體樣式
      const variantStyles: Record<ComponentVariant, React.CSSProperties> = {
        primary: {
          backgroundColor: theme.colors?.brand?.primary || '#007AFF',
          color: theme.colors?.brand?.primary ? '#FFFFFF' : '#000000',
          border: `1px solid ${theme.colors?.brand?.primary || '#007AFF'}`,
        },
        secondary: {
          backgroundColor: 'transparent',
          color: theme.colors?.brand?.primary || '#007AFF',
          border: `1px solid ${theme.colors?.border?.primary || '#E0E0E0'}`,
        },
        tertiary: {
          backgroundColor: 'transparent',
          color: theme.colors?.text?.primary || '#000000',
          border: 'none',
        },
        danger: {
          backgroundColor: theme.colors?.brand?.error || '#DC3545',
          color: '#FFFFFF',
          border: `1px solid ${theme.colors?.brand?.error || '#DC3545'}`,
        },
        success: {
          backgroundColor: theme.colors?.brand?.success || '#28A745',
          color: '#FFFFFF',
          border: `1px solid ${theme.colors?.brand?.success || '#28A745'}`,
        },
        warning: {
          backgroundColor: theme.colors?.brand?.warning || '#FFC107',
          color: '#000000',
          border: `1px solid ${theme.colors?.brand?.warning || '#FFC107'}`,
        },
        info: {
          backgroundColor: theme.colors?.brand?.info || '#17A2B8',
          color: '#FFFFFF',
          border: `1px solid ${theme.colors?.brand?.info || '#17A2B8'}`,
        },
        outline: {
          backgroundColor: 'transparent',
          color: theme.colors?.brand?.primary || '#007AFF',
          border: `1px solid ${theme.colors?.brand?.primary || '#007AFF'}`,
        },
        ghost: {
          backgroundColor: 'transparent',
          color: theme.colors?.text?.primary || '#000000',
          border: 'none',
        },
      };

      // Status樣式
      const stateStyles: Record<ComponentState, React.CSSProperties> = {
        default: {},
        hover: {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadow?.md || '0 4px 8px rgba(0, 0, 0, 0.15)',
        },
        active: {
          transform: 'translateY(0)',
          boxShadow: theme.shadow?.sm || '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        focus: {
          outline: `2px solid ${theme.colors?.border?.focus || '#007AFF'}`,
          outlineOffset: '2px',
        },
        disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
          transform: 'none',
          boxShadow: 'none',
        },
        loading: {
          cursor: 'wait',
          pointerEvents: 'none',
        },
      };

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...stateStyles[state],
      };
    }, [
      currentThemeData,
      variant,
      size,
      state,
      disabled,
      loading,
      fullWidth,
      style,
    ]);

    // Handle點擊Event
    const _handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
          event.preventDefault();
          return;
        }
        onClick?.();
      },
      [disabled, loading, onClick]
    );

    // HandleKey盤Event
    const _handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
          event.preventDefault();
          return;
        }

        // SupportEmpty格Key和回車Key觸發點擊
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          onClick?.();
        }

        onKeyDown?.(event);
      },
      [disabled, loading, onClick, onKeyDown]
    );

    // Handle焦點Event
    const _handleFocus = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
          onFocus?.(event);
        }
      },
      [disabled, loading, onFocus]
    );

    // Handle失焦Event
    const _handleBlur = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
          onBlur?.(event);
        }
      },
      [disabled, loading, onBlur]
    );

    // 渲染加載Status
    const _renderLoadingSpinner = () => {
      if (!loading) return null;

      return (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
          aria-hidden='true'
        />
      );
    };

    // 渲染Graph標
    const _renderIcon = () => {
      if (!icon) return null;

      return (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </span>
      );
    };

    // 渲染Content
    const _renderContent = () => {
      const _content = (
        <>
          {loading && renderLoadingSpinner()}
          {!loading && icon && iconPosition === 'left' && renderIcon()}
          {children && (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {children}
            </span>
          )}
          {!loading && icon && iconPosition === 'right' && renderIcon()}
        </>
      );

      return content;
    };

    // 如果Yes鏈接按鈕
    if (href) {
      const _enhancedProps = enhanceComponent(
        {
          ref: ref as React.Ref<HTMLAnchorElement>,
          href,
          target,
          rel,
          className: `button button--${variant} button--${size} ${className}`,
          style: buttonStyles,
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          'data-testid': dataTestId,
          'aria-label': ariaLabel,
          'aria-describedby': ariaDescribedBy,
          'aria-hidden': ariaHidden,
          role: role || 'button',
          tabIndex: tabIndex || (disabled ? -1 : 0),
          ...props,
        },
        {
          aria: {
            role: 'button',
            label:
              ariaLabel ||
              (typeof children === 'string' ? children : undefined),
            describedBy: ariaDescribedBy,
            hidden: ariaHidden,
            pressed: state === 'active',
            disabled: disabled || loading,
            live: loading ? 'polite' : undefined,
            busy: loading,
          },
          keyboard: {
            onEnter: () => !disabled && !loading && onClick?.(),
            onSpace: () => !disabled && !loading && onClick?.(),
            preventDefault: true,
          },
          focus: {
            autoFocus: (props as any).autoFocus,
          },
          screenReader: {
            announcement: loading ? '按鈕正在加載中' : undefined,
            live: loading ? 'polite' : undefined,
          },
          voiceControl: {
            voiceLabel:
              ariaLabel || (typeof children === 'string' ? children : '按鈕'),
            voiceCommands: ['點擊', '按', '選擇'],
          },
        }
      );

      return <a {...enhancedProps}>{renderContent()}</a>;
    }

    // 普通按鈕
    const _enhancedProps = enhanceComponent(
      {
        ref,
        type,
        form,
        name,
        value,
        className: `button button--${variant} button--${size} ${className}`,
        style: buttonStyles,
        disabled: disabled || loading,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
        onBlur: handleBlur,
        'data-testid': dataTestId,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-hidden': ariaHidden,
        role,
        tabIndex,
        ...props,
      },
      {
        aria: {
          role: 'button',
          label:
            ariaLabel || (typeof children === 'string' ? children : undefined),
          describedBy: ariaDescribedBy,
          hidden: ariaHidden,
          pressed: state === 'active',
          disabled: disabled || loading,
          live: loading ? 'polite' : undefined,
          busy: loading,
        },
        keyboard: {
          onEnter: () => !disabled && !loading && onClick?.(),
          onSpace: () => !disabled && !loading && onClick?.(),
          preventDefault: true,
        },
        focus: {
          autoFocus: (props as any).autoFocus,
        },
        screenReader: {
          announcement: loading ? '按鈕正在加載中' : undefined,
          live: loading ? 'polite' : undefined,
        },
        voiceControl: {
          voiceLabel:
            ariaLabel || (typeof children === 'string' ? children : '按鈕'),
          voiceCommands: ['點擊', '按', '選擇'],
        },
      }
    );

    return <button {...enhancedProps}>{renderContent()}</button>;
  }
);

// SettingsShow名稱
Button.displayName = 'Button';

// ExportComponent
export default Button;
