// Card Component
import React, { forwardRef, useCallback, useMemo } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import type { CardProps, ComponentSize } from '../../types/components';
import { enhanceComponent } from '../../utils/accessibilityEnhancer';

// 卡片Component
export const _Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      elevation = 'md',
      padding = 'md',
      margin = 'none',
      border = true,
      borderRadius = 'md',
      hoverable = false,
      clickable = false,
      loading = false,
      header,
      footer,
      media,
      actions,
      onCardClick,
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

    // 計算卡片樣式
    const _cardStyles = useMemo(() => {
      const _theme = currentThemeData;
      if (!theme) return {};

      const baseStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors?.background?.card || '#FFFFFF',
        color: theme.colors?.text?.primary || '#000000',
        fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      };

      // 邊框樣式
      const _borderStyles = border
        ? {
            border: `1px solid ${theme.colors?.border?.primary || '#E0E0E0'}`,
          }
        : {};

      // 圓角樣式
      const borderRadiusStyles: Record<ComponentSize, React.CSSProperties> = {
        xs: { borderRadius: theme.borderRadius?.sm || '6px' },
        sm: { borderRadius: theme.borderRadius?.sm || '6px' },
        small: { borderRadius: theme.borderRadius?.sm || '6px' },
        md: { borderRadius: theme.borderRadius?.md || '8px' },
        lg: { borderRadius: theme.borderRadius?.lg || '12px' },
        xl: { borderRadius: theme.borderRadius?.xl || '16px' },
      };

      // 陰影樣式
      const shadowStyles: Record<string, React.CSSProperties> = {
        none: {},
        sm: { boxShadow: theme.shadow?.sm || '0 1px 2px rgba(0, 0, 0, 0.05)' },
        md: { boxShadow: theme.shadow?.md || '0 4px 6px rgba(0, 0, 0, 0.1)' },
        lg: {
          boxShadow: theme.shadow?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)',
        },
        xl: {
          boxShadow: theme.shadow?.xl || '0 20px 25px rgba(0, 0, 0, 0.1)',
        },
      };

      // 間距樣式
      const spacingStyles: Record<ComponentSize, React.CSSProperties> = {
        xs: { padding: theme.spacing?.xs || '4px' },
        sm: { padding: theme.spacing?.sm || '8px' },
        small: { padding: theme.spacing?.sm || '8px' },
        md: { padding: theme.spacing?.md || '16px' },
        lg: { padding: theme.spacing?.lg || '24px' },
        xl: { padding: theme.spacing?.xl || '32px' },
      };

      // 邊距樣式
      const marginStyles: Record<string, React.CSSProperties> = {
        xs: { margin: theme.spacing?.xs || '4px' },
        sm: { margin: theme.spacing?.sm || '8px' },
        small: { margin: theme.spacing?.sm || '8px' },
        md: { margin: theme.spacing?.md || '16px' },
        lg: { margin: theme.spacing?.lg || '24px' },
        xl: { margin: theme.spacing?.xl || '32px' },
        none: { margin: 0 },
      };

      // 可懸停樣式
      const _hoverStyles = hoverable
        ? {
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadow?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)',
            },
          }
        : {};

      // 可點擊樣式
      const _clickableStyles = clickable
        ? {
            cursor: 'pointer',
            userSelect: 'none',
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: theme.shadow?.sm || '0 1px 2px rgba(0, 0, 0, 0.05)',
            },
          }
        : {};

      return {
        ...baseStyles,
        ...borderStyles,
        ...borderRadiusStyles[borderRadius],
        ...shadowStyles[elevation],
        ...spacingStyles[padding],
        ...marginStyles[margin],
        ...hoverStyles,
        ...clickableStyles,
      };
    }, [
      currentThemeData,
      variant,
      size,
      elevation,
      padding,
      margin,
      border,
      borderRadius,
      hoverable,
      clickable,
      style,
    ]);

    // Handle點擊Event
    const _handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (clickable && onCardClick) {
          onCardClick();
        }
      },
      [clickable, onCardClick]
    );

    // HandleKey盤Event
    const _handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (clickable && (event.key === ' ' || event.key === 'Enter')) {
          event.preventDefault();
          onCardClick?.();
        }
      },
      [clickable, onCardClick]
    );

    // 渲染加載Status
    const _renderLoadingState = () => {
      if (!loading) return null;

      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid transparent',
              borderTop: '3px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
            aria-label='載入中'
          />
        </div>
      );
    };

    // 渲染媒體Content
    const _renderMedia = () => {
      if (!media) return null;

      return (
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }}
        >
          {media}
        </div>
      );
    };

    // 渲染標題
    const _renderHeader = () => {
      if (!header) return null;

      return (
        <div
          style={{
            padding: currentThemeData?.spacing?.md || '16px',
            paddingBottom: children
              ? '8px'
              : currentThemeData?.spacing?.md || '16px',
            borderBottom: children
              ? `1px solid ${currentThemeData?.colors?.border?.secondary || '#F0F0F0'}`
              : 'none',
          }}
        >
          {header}
        </div>
      );
    };

    // 渲染Content
    const _renderContent = () => {
      if (!children) return null;

      return (
        <div
          style={{
            flex: 1,
            padding: header || footer ? '8px 0' : 0,
          }}
        >
          {children}
        </div>
      );
    };

    // 渲染OperationDistrict域
    const _renderActions = () => {
      if (!actions) return null;

      return (
        <div
          style={{
            padding: currentThemeData?.spacing?.md || '16px',
            paddingTop: children
              ? '8px'
              : currentThemeData?.spacing?.md || '16px',
            borderTop: children
              ? `1px solid ${currentThemeData?.colors?.border?.secondary || '#F0F0F0'}`
              : 'none',
            display: 'flex',
            gap: currentThemeData?.spacing?.sm || '8px',
            justifyContent: 'flex-end',
          }}
        >
          {actions}
        </div>
      );
    };

    // 渲染頁腳
    const _renderFooter = () => {
      if (!footer) return null;

      return (
        <div
          style={{
            padding: currentThemeData?.spacing?.md || '16px',
            paddingTop: children
              ? '8px'
              : currentThemeData?.spacing?.md || '16px',
            borderTop: children
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

    const _enhancedProps = enhanceComponent(
      {
        ref,
        className: `card card--${variant} card--${size} card--${elevation} ${className}`,
        style: cardStyles,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'data-testid': dataTestId,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        'aria-hidden': ariaHidden,
        role: role || (clickable ? 'button' : undefined),
        tabIndex: tabIndex || (clickable ? 0 : undefined),
        ...props,
      },
      {
        aria: {
          role: clickable ? 'button' : 'article',
          label:
            ariaLabel ||
            (header
              ? `卡片：${typeof header === 'string' ? header : '內容'}`
              : undefined),
          describedBy: ariaDescribedBy,
          hidden: ariaHidden,
          live: loading ? 'polite' : undefined,
          busy: loading,
        },
        keyboard: clickable
          ? {
              onEnter: () => onCardClick?.(),
              onSpace: () => onCardClick?.(),
              preventDefault: true,
            }
          : undefined,
        focus: {
          autoFocus: (props as any).autoFocus,
        },
        screenReader: {
          announcement: loading ? '卡片正在加載中' : undefined,
          live: loading ? 'polite' : undefined,
        },
        voiceControl: {
          voiceLabel:
            ariaLabel ||
            (header
              ? `卡片：${typeof header === 'string' ? header : '內容'}`
              : '卡片'),
          voiceCommands: clickable ? ['點擊', '選擇', '打開'] : undefined,
        },
      }
    );

    return (
      <div {...enhancedProps}>
        {renderLoadingState()}
        {renderMedia()}
        {renderHeader()}
        {renderContent()}
        {renderActions()}
        {renderFooter()}
      </div>
    );
  }
);

// SettingsShow名稱
Card.displayName = 'Card';

// ExportComponent
export default Card;
