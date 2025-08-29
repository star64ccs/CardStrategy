// Loading 組件
import React, { forwardRef, useMemo } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type { ComponentSize, LoadingProps } from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// 加載組件
export const _Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      variant = 'spinner',
      size = 'md',
      color,
      text,
      fullScreen = false,
      overlay = false,
      overlayColor,
      overlayOpacity = 0.5,
      zIndex = 1000,
      duration = 1000,
      loop = true,
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

    // 計算加載組件樣式
    const _loadingStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing?.sm || '8px',
        ...style,
      };

      // 全屏樣式
      const _fullScreenStyles = fullScreen
        ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex,
            backgroundColor:
              overlayColor ||
              theme.colors?.background?.overlay ||
              'rgba(255, 255, 255, 0.9)',
          }
        : {};

      // 遮罩樣式
      const _overlayStyles = overlay
        ? {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex,
            backgroundColor:
              overlayColor ||
              theme.colors?.background?.overlay ||
              'rgba(255, 255, 255, 0.9)',
          }
        : {};

      return {
        ...baseStyles,
        ...fullScreenStyles,
        ...overlayStyles,
      };
    }, [currentThemeData, fullScreen, overlay, overlayColor, zIndex, style]);

    // 計算加載器樣式
    const _spinnerStyles = useMemo(() => {
      const _theme = currentThemeData;
      const _currentColor = color || theme?.colors?.brand?.primary || '#007AFF';

      // 尺寸樣式
      const sizeStyles: Record<ComponentSize, React.CSSProperties> = {
        xs: { width: '16px', height: '16px' },
        sm: { width: '24px', height: '24px' },
        small: { width: '24px', height: '24px' },
        md: { width: '32px', height: '32px' },
        lg: { width: '48px', height: '48px' },
        xl: { width: '64px', height: '64px' },
      };

      return {
        ...sizeStyles[size],
        color: currentColor,
      };
    }, [currentThemeData, color, size]);

    // 計算文本樣式
    const _textStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      return {
        fontSize: theme.typography?.sizes?.sm || '14px',
        color: theme.colors?.text?.secondary || '#6C757D',
        textAlign: 'center' as const,
        margin: 0,
      };
    }, [currentThemeData]);

    // 渲染旋轉器
    const _renderSpinner = () => {
      const spinnerStyle: React.CSSProperties = {
        ...spinnerStyles,
        border: `2px solid transparent`,
        borderTop: `2px solid currentColor`,
        borderRadius: '50%',
        animation: loop ? `spin ${duration}ms linear infinite` : 'none',
      };

      return <div style={spinnerStyle} aria-hidden='true' />;
    };

    // 渲染點點
    const _renderDots = () => {
      const _dotSize =
        size === 'xs'
          ? '4px'
          : size === 'sm'
            ? '6px'
            : size === 'md'
              ? '8px'
              : size === 'lg'
                ? '12px'
                : '16px';
      const dotStyle: React.CSSProperties = {
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        animation: loop ? `pulse ${duration}ms ease-in-out infinite` : 'none',
      };

      return (
        <div style={{ display: 'flex', gap: '4px' }}>
          <div
            style={{ ...dotStyle, animationDelay: '0ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...dotStyle, animationDelay: '200ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...dotStyle, animationDelay: '400ms' }}
            aria-hidden='true'
          />
        </div>
      );
    };

    // 渲染條形
    const _renderBars = () => {
      const _barWidth =
        size === 'xs'
          ? '2px'
          : size === 'sm'
            ? '3px'
            : size === 'md'
              ? '4px'
              : size === 'lg'
                ? '6px'
                : '8px';
      const _barHeight =
        size === 'xs'
          ? '12px'
          : size === 'sm'
            ? '16px'
            : size === 'md'
              ? '20px'
              : size === 'lg'
                ? '28px'
                : '36px';
      const barStyle: React.CSSProperties = {
        width: barWidth,
        height: barHeight,
        backgroundColor: 'currentColor',
        animation: loop ? `bars ${duration}ms ease-in-out infinite` : 'none',
      };

      return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
          <div
            style={{ ...barStyle, animationDelay: '0ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...barStyle, animationDelay: '100ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...barStyle, animationDelay: '200ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...barStyle, animationDelay: '300ms' }}
            aria-hidden='true'
          />
          <div
            style={{ ...barStyle, animationDelay: '400ms' }}
            aria-hidden='true'
          />
        </div>
      );
    };

    // 渲染脈衝
    const _renderPulse = () => {
      const pulseStyle: React.CSSProperties = {
        ...spinnerStyles,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        animation: loop ? `pulse ${duration}ms ease-in-out infinite` : 'none',
      };

      return <div style={pulseStyle} aria-hidden='true' />;
    };

    // 渲染骨架屏
    const _renderSkeleton = () => {
      const skeletonStyle: React.CSSProperties = {
        ...spinnerStyles,
        backgroundColor: 'currentColor',
        borderRadius: '4px',
        animation: loop
          ? `skeleton ${duration}ms ease-in-out infinite`
          : 'none',
      };

      return <div style={skeletonStyle} aria-hidden='true' />;
    };

    // 渲染加載器
    const _renderLoader = () => {
      switch (variant) {
        case 'spinner':
          return renderSpinner();
        case 'dots':
          return renderDots();
        case 'bars':
          return renderBars();
        case 'pulse':
          return renderPulse();
        case 'skeleton':
          return renderSkeleton();
        default:
          return renderSpinner();
      }
    };

    // 渲染文本
    const _renderText = () => {
      if (!text) return null;

      return <p style={textStyles}>{text}</p>;
    };

    const _enhancedProps = enhanceComponent(
      {
        ref,
        className: `loading loading--${variant} loading--${size} ${className}`,
        style: loadingStyles,
        'data-testid': dataTestId,
        'aria-label': ariaLabel || '載入中',
        'aria-describedby': ariaDescribedBy,
        'aria-hidden': ariaHidden,
        role: role || 'status',
        tabIndex,
        ...props,
      },
      {
        aria: {
          role: 'status',
          label: ariaLabel || '載入中',
          describedBy: ariaDescribedBy,
          hidden: ariaHidden,
          live: 'polite',
          busy: true,
        },
        focus: {
          autoFocus: false,
        },
        screenReader: {
          announcement: text || '正在載入中，請稍候',
          live: 'polite',
        },
        voiceControl: {
          voiceLabel: ariaLabel || '載入中',
          voiceCommands: ['等待', '稍候'],
        },
      }
    );

    return (
      <div {...enhancedProps}>
        {renderLoader()}
        {renderText()}
      </div>
    );
  }
);

// 設置顯示名稱
Loading.displayName = 'Loading';

// 導出組件
export default Loading;
