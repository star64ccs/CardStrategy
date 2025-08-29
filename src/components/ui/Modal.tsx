// Modal 組件
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type { ModalProps } from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// 模態框組件
export const _Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      variant = 'primary',
      title,
      subtitle,
      closeButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      preventScroll = true,
      centered = true,
      fullScreen = false,
      animation = 'fade',
      animationDuration = 300,
      zIndex = 1000,
      header,
      footer,
      body,
      overlay,
      onOpen,
      onOpened,
      onClose: onCloseProp,
      onClosed,
      className = '',
      style,
      children,
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
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // 處理滾動鎖定
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
      return undefined;
    }, [isOpen]);

    // 處理模態框顯示/隱藏
    useEffect(() => {
      if (isOpen) {
        setIsVisible(true);
        setIsAnimating(true);
        onOpen?.();

        const _timer = setTimeout(() => {
          setIsAnimating(false);
          onOpened?.();
        }, animationDuration);

        return () => clearTimeout(timer);
      } else {
        setIsAnimating(true);

        const _timer = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
          onClosed?.();
        }, animationDuration);

        return () => clearTimeout(timer);
      }
    }, [isOpen, animationDuration, onOpen, onOpened, onClosed]);

    // 處理ESC鍵關閉
    useEffect(() => {
      const _handleEscape = (event: KeyboardEvent) => {
        if (isOpen && closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
      return undefined;
    }, [isOpen, closeOnEscape, onClose]);

    // 計算模態框樣式
    const _modalStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        display: 'flex',
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: centered ? '20px' : '0',
        ...style,
      };

      // 動畫樣式
      const _animationStyles = {
        fade: {
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${animationDuration}ms ease`,
        },
        slide: {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: `all ${animationDuration}ms ease`,
        },
        scale: {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          transition: `all ${animationDuration}ms ease`,
        },
        none: {},
      };

      return {
        ...baseStyles,
        ...animationStyles[animation],
      };
    }, [
      currentThemeData,
      isVisible,
      centered,
      zIndex,
      animation,
      animationDuration,
      style,
    ]);

    // 計算內容樣式
    const _contentStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        position: 'relative',
        backgroundColor: theme.colors?.background?.modal || '#FFFFFF',
        color: theme.colors?.text?.primary || '#000000',
        fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
        borderRadius: theme.borderRadius?.lg || '12px',
        boxShadow: theme.shadow?.xl || '0 25px 50px rgba(0, 0, 0, 0.25)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      };

      // 尺寸樣式
      const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { width: '400px', minHeight: '200px' },
        md: { width: '600px', minHeight: '300px' },
        lg: { width: '800px', minHeight: '400px' },
        xl: { width: '1000px', minHeight: '500px' },
        full: { width: '100vw', height: '100vh', borderRadius: 0 },
      };

      // 全屏樣式
      const _fullScreenStyles = fullScreen
        ? {
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            maxWidth: '100vw',
            maxHeight: '100vh',
          }
        : {};

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...fullScreenStyles,
      };
    }, [currentThemeData, size, fullScreen]);

    // 計算遮罩樣式
    const _overlayStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
          theme.colors?.background?.overlay || 'rgba(0, 0, 0, 0.5)',
        zIndex: zIndex - 1,
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${animationDuration}ms ease`,
      };
    }, [currentThemeData, isVisible, zIndex, animationDuration]);

    // 處理遮罩點擊
    const _handleOverlayClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // 處理關閉按鈕點擊
    const _handleCloseClick = useCallback(() => {
      onClose();
    }, [onClose]);

    // 渲染關閉按鈕
    const _renderCloseButton = () => {
      if (!closeButton) return null;

      return (
        <button
          onClick={handleCloseClick}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: currentThemeData?.colors?.text?.secondary || '#6C757D',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s ease',
            zIndex: 1,
          }}
          aria-label='關閉'
          type='button'
        >
          ✕
        </button>
      );
    };

    // 渲染標題
    const _renderTitle = () => {
      if (!title && !subtitle) return null;

      return (
        <div
          style={{
            padding: currentThemeData?.spacing?.lg || '24px',
            paddingBottom: subtitle
              ? '8px'
              : currentThemeData?.spacing?.lg || '24px',
            borderBottom:
              children || body
                ? `1px solid ${currentThemeData?.colors?.border?.secondary || '#F0F0F0'}`
                : 'none',
          }}
        >
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: currentThemeData?.typography?.sizes?.xl || '20px',
                fontWeight:
                  currentThemeData?.typography?.weights?.semibold || '600',
                color: currentThemeData?.colors?.text?.primary || '#000000',
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                margin: title ? '8px 0 0 0' : 0,
                fontSize: currentThemeData?.typography?.sizes?.base || '16px',
                color: currentThemeData?.colors?.text?.secondary || '#6C757D',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      );
    };

    // 渲染內容
    const _renderContent = () => {
      if (body) return body;
      if (children) return children;
      return null;
    };

    // 渲染頁腳
    const _renderFooter = () => {
      if (!footer) return null;

      return (
        <div
          style={{
            padding: currentThemeData?.spacing?.lg || '24px',
            paddingTop:
              children || body
                ? '16px'
                : currentThemeData?.spacing?.lg || '24px',
            borderTop:
              children || body
                ? `1px solid ${currentThemeData?.colors?.border?.secondary || '#F0F0F0'}`
                : 'none',
            backgroundColor:
              currentThemeData?.colors?.background?.secondary || '#F8F9FA',
          }}
        >
          {footer}
        </div>
      );
    };

    // 如果模態框未打開，不渲染
    if (!isVisible && !isAnimating) {
      return null;
    }

    // 渲染模態框
    const _enhancedProps = enhanceComponent(
      {
        ref,
        className: `modal modal--${size} modal--${variant} ${className}`,
        style: modalStyles,
        onClick: handleOverlayClick,
        'data-testid': dataTestId,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-hidden': ariaHidden,
        role: role || 'dialog',
        tabIndex: tabIndex || -1,
        ...props,
      },
      {
        aria: {
          role: 'dialog',
          label: ariaLabel || title || '模態框',
          describedBy: ariaDescribedBy,
          hidden: ariaHidden,
          live: 'assertive',
        },
        keyboard: {
          onEscape: () => closeOnEscape && onClose?.(),
          preventDefault: true,
        },
        focus: {
          autoFocus: true,
        },
        screenReader: {
          announcement: `模態框已打開：${title || '內容'}`,
          live: 'assertive',
        },
        voiceControl: {
          voiceLabel: ariaLabel || title || '模態框',
          voiceCommands: ['關閉', '取消', '確認'],
        },
      }
    );

    const _modalContent = (
      <div {...enhancedProps}>
        <div
          className='modal-content'
          style={contentStyles}
          onClick={e => e.stopPropagation()}
        >
          {renderCloseButton()}
          {header || renderTitle()}
          <div style={{ flex: 1, overflow: 'auto' }}>{renderContent()}</div>
          {renderFooter()}
        </div>
      </div>
    );

    // 使用 Portal 渲染到 body
    return createPortal(modalContent, document.body);
  }
);

// 設置顯示名稱
Modal.displayName = 'Modal';

// 導出組件
export default Modal;
