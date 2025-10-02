// Toast 組件
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type { ToastProps } from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// Toast 組件
export const _Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      type = 'info',
      title,
      message,
      duration = 5000,
      closable = true,
      action,
      icon,
      position = 'top-right',
      onClose,
      onAction,
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
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    // 自動關閉
    useEffect(() => {
      if (isVisible && duration > 0) {
        const _timer = setTimeout(() => {
          onClose?.();
        }, duration);

        return () => {
          clearTimeout(timer);
        };
      }
      return undefined;
    }, [isVisible, duration, onClose]);

    // 計算 Toast 樣式
    const _toastStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing?.sm || '8px',
        padding: theme.spacing?.md || '16px',
        borderRadius: theme.borderRadius?.md || '8px',
        boxShadow: theme.shadow?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        minWidth: '300px',
        fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      };

      // 類型樣式
      const typeStyles: Record<string, React.CSSProperties> = {
        success: {
          backgroundColor: theme.colors?.brand?.success || '#28A745',
          color: '#FFFFFF',
          borderLeft: `4px solid ${theme.colors?.brand?.success || '#28A745'}`,
        },
        error: {
          backgroundColor: theme.colors?.brand?.error || '#DC3545',
          color: '#FFFFFF',
          borderLeft: `4px solid ${theme.colors?.brand?.error || '#DC3545'}`,
        },
        warning: {
          backgroundColor: theme.colors?.brand?.warning || '#FFC107',
          color: '#000000',
          borderLeft: `4px solid ${theme.colors?.brand?.warning || '#FFC107'}`,
        },
        info: {
          backgroundColor: theme.colors?.brand?.info || '#17A2B8',
          color: '#FFFFFF',
          borderLeft: `4px solid ${theme.colors?.brand?.info || '#17A2B8'}`,
        },
      };

      // 動畫樣式
      const _animationStyles = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease',
      };

      return {
        ...baseStyles,
        ...typeStyles[type],
        ...animationStyles,
      };
    }, [currentThemeData, type, isVisible, style]);

    // 計算容器樣式
    const _containerStyles = useMemo(() => {
      const positionStyles: Record<string, React.CSSProperties> = {
        'top-left': {
          top: '20px',
          left: '20px',
          right: 'auto',
          bottom: 'auto',
        },
        'top-right': {
          top: '20px',
          right: '20px',
          left: 'auto',
          bottom: 'auto',
        },
        'top-center': {
          top: '20px',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translateX(-50%)',
        },
        'bottom-left': {
          bottom: '20px',
          left: '20px',
          right: 'auto',
          top: 'auto',
        },
        'bottom-right': {
          bottom: '20px',
          right: '20px',
          left: 'auto',
          top: 'auto',
        },
        'bottom-center': {
          bottom: '20px',
          left: '50%',
          right: 'auto',
          top: 'auto',
          transform: 'translateX(-50%)',
        },
      };

      return {
        position: 'fixed',
        zIndex: 9999,
        ...positionStyles[position],
      };
    }, [position]);

    // 處理關閉
    const _handleClose = useCallback(() => {
      setIsAnimating(true);
      setIsVisible(false);

      setTimeout(() => {
        onClose?.();
      }, 300);
    }, [onClose]);

    // 處理操作
    const _handleAction = useCallback(() => {
      onAction?.();
    }, [onAction]);

    // 渲染圖標
    const _renderIcon = () => {
      if (icon) return icon;

      const _defaultIcons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
      };

      return (
        <div
          style={{
            fontSize: '20px',
            lineHeight: 1,
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {defaultIcons[type]}
        </div>
      );
    };

    // 渲染關閉按鈕
    const _renderCloseButton = () => {
      if (!closable) return null;

      return (
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            padding: '0',
            marginLeft: 'auto',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            flexShrink: 0,
          }}
          aria-label='關閉通知'
          type='button'
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
          ✕
        </button>
      );
    };

    // 渲染操作按鈕
    const _renderAction = () => {
      if (!action) return null;

      return (
        <button
          onClick={handleAction}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            marginTop: '8px',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')
          }
          type='button'
        >
          {action}
        </button>
      );
    };

    // 渲染內容
    const _renderContent = () => {
      return (
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div
              style={{
                fontSize: currentThemeData?.typography?.sizes?.base || '16px',
                fontWeight:
                  currentThemeData?.typography?.weights?.semibold || '600',
                marginBottom: message ? '4px' : 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          )}
          {message && (
            <div
              style={{
                fontSize: currentThemeData?.typography?.sizes?.sm || '14px',
                lineHeight: 1.4,
                opacity: 0.9,
              }}
            >
              {message}
            </div>
          )}
          {renderAction()}
        </div>
      );
    };

    // 如果不可見且不在動畫中，不渲染
    if (!isVisible && !isAnimating) {
      return null;
    }

    // 渲染 Toast
    const _enhancedProps = enhanceComponent(
      {
        ref,
        className: `toast toast--${type} toast--${position} ${className}`,
        style: containerStyles,
        'data-testid': dataTestId,
        'aria-label': ariaLabel || `${type} 通知`,
        'aria-describedby': ariaDescribedBy,
        'aria-hidden': ariaHidden,
        role: 'alert',
        tabIndex,
        ...props,
      },
      {
        aria: {
          role: 'alert',
          label: ariaLabel || `${type} 通知`,
          describedBy: ariaDescribedBy,
          hidden: ariaHidden,
          live: 'assertive',
          atomic: true,
        },
        keyboard: {
          onEscape: () => closable && handleClose(),
          preventDefault: true,
        },
        focus: {
          autoFocus: true,
        },
        screenReader: {
          announcement: `${type} 通知：${title || message || '新消息'}`,
          live: 'assertive',
          atomic: true,
        },
        voiceControl: {
          voiceLabel: ariaLabel || `${type} 通知`,
          voiceCommands: ['關閉', '確認', '忽略'],
        },
      }
    );

    const _toastContent = (
      <div {...enhancedProps}>
        <div style={toastStyles}>
          {renderIcon()}
          {renderContent()}
          {renderCloseButton()}
        </div>
      </div>
    );

    // 使用 Portal 渲染到 body
    return createPortal(toastContent, document.body);
  }
);

// 設置顯示名稱
Toast.displayName = 'Toast';

// 導出組件
export default Toast;
