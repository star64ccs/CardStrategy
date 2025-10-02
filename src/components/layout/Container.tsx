import React, { forwardRef, useMemo } from 'react';

import { useResponsive } from '../../hooks/useResponsive';
import type { ContainerProps } from '../../types/layout';

// Container Component
export const _Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      maxWidth = 'lg',
      fluid = false,
      centered = false,
      padding,
      margin,
      background,
      border,
      borderRadius,
      shadow = 'none',
      className = '',
      style,
      id,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const { getResponsiveValue } = useResponsive();

    // 計算樣式
    const _containerStyle = useMemo(() => {
      const _responsiveMaxWidth = getResponsiveValue(maxWidth);
      const _responsivePadding = getResponsiveValue(padding);
      const _responsiveMargin = getResponsiveValue(margin);
      const _responsiveBorderRadius = getResponsiveValue(borderRadius);
      const _responsiveShadow = getResponsiveValue(shadow);

      // 最大寬度計算
      let maxWidthValue = '100%';
      if (!fluid) {
        const _maxWidths = {
          xs: '100%',
          sm: '540px',
          md: '720px',
          lg: '960px',
          xl: '1140px',
          xxl: '1320px',
          full: '100%',
        };
        maxWidthValue = maxWidths[responsiveMaxWidth] || '100%';
      }

      // 陰影樣式
      const _shadowStyles = {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      };

      return {
        width: '100%',
        maxWidth: maxWidthValue,
        margin: centered ? '0 auto' : responsiveMargin,
        padding: responsivePadding,
        background,
        border,
        borderRadius: responsiveBorderRadius,
        boxShadow: shadowStyles[responsiveShadow] || 'none',
        ...style,
      };
    }, [
      getResponsiveValue,
      maxWidth,
      fluid,
      centered,
      padding,
      margin,
      background,
      border,
      borderRadius,
      shadow,
      style,
    ]);

    // 生成 CSS Class名
    const _containerClassName = useMemo(() => {
      const _classes = ['layout-container'];

      if (fluid) classes.push('layout-container--fluid');
      if (centered) classes.push('layout-container--centered');
      if (maxWidth !== 'full')
        classes.push(
          `layout-container--max-width-${getResponsiveValue(maxWidth)}`
        );

      return `${classes.join(' ')} ${className}`.trim();
    }, [fluid, centered, maxWidth, className, getResponsiveValue]);

    return (
      <div
        ref={ref}
        id={id}
        className={containerClassName}
        style={containerStyle}
        data-testid={dataTestId || 'layout-container'}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
