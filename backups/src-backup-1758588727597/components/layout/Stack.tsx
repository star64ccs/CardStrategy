import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
} from 'react';

import { useResponsive } from '../../hooks/useResponsive';
import type { StackProps } from '../../types/layout';

// Stack 組件
export const _Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      direction = 'vertical',
      spacing = '1rem',
      align = 'start',
      justify = 'start',
      wrap = false,
      divider,
      dividerProps = {},
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
    const _stackStyle = useMemo(() => {
      const _responsiveDirection = getResponsiveValue(direction);
      const _responsiveSpacing = getResponsiveValue(spacing);
      const _responsiveAlign = getResponsiveValue(align);
      const _responsiveJustify = getResponsiveValue(justify);
      const _responsiveWrap = getResponsiveValue(wrap);

      // 對齊方式映射
      const _alignmentMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
        baseline: 'baseline',
        'space-between': 'space-between',
        'space-around': 'space-around',
        'space-evenly': 'space-evenly',
      };

      // 方向映射
      const _directionMap = {
        vertical: 'column',
        horizontal: 'row',
      };

      return {
        display: 'flex',
        flexDirection: directionMap[responsiveDirection] || 'column',
        flexWrap: responsiveWrap ? 'wrap' : 'nowrap',
        alignItems:
          alignmentMap[responsiveAlign as keyof typeof alignmentMap] ||
          'flex-start',
        justifyContent:
          alignmentMap[responsiveJustify as keyof typeof alignmentMap] ||
          'flex-start',
        gap: responsiveSpacing,
        ...style,
      };
    }, [getResponsiveValue, direction, spacing, align, justify, wrap, style]);

    // 生成 CSS 類名
    const _stackClassName = useMemo(() => {
      const _classes = ['layout-stack'];

      const _responsiveDirection = getResponsiveValue(direction);
      classes.push(`layout-stack--direction-${responsiveDirection}`);

      const _responsiveSpacing = getResponsiveValue(spacing);
      if (responsiveSpacing) {
        classes.push(
          `layout-stack--spacing-${typeof responsiveSpacing === 'string' ? responsiveSpacing.replace(/\s+/g, '-') : responsiveSpacing}`
        );
      }

      const _responsiveAlign = getResponsiveValue(align);
      classes.push(`layout-stack--align-${responsiveAlign}`);

      const _responsiveJustify = getResponsiveValue(justify);
      classes.push(`layout-stack--justify-${responsiveJustify}`);

      const _responsiveWrap = getResponsiveValue(wrap);
      if (responsiveWrap) {
        classes.push('layout-stack--wrap');
      }

      return `${classes.join(' ')} ${className}`.trim();
    }, [
      direction,
      spacing,
      align,
      justify,
      wrap,
      className,
      getResponsiveValue,
    ]);

    // 渲染帶分隔符的子元素
    const _renderChildrenWithDividers = useMemo(() => {
      if (!divider) {
        return children;
      }

      const _childrenArray = Children.toArray(children);
      const _responsiveDirection = getResponsiveValue(direction);

      return childrenArray.map((child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        const _isLast = index === childrenArray.length - 1;
        const _dividerStyle = {
          ...dividerProps.style,
          ...(responsiveDirection === 'horizontal'
            ? { marginLeft: 'auto', marginRight: 'auto' }
            : { marginTop: 'auto', marginBottom: 'auto' }),
        };

        return (
          <React.Fragment key={index}>
            {cloneElement(child)}
            {!isLast && (
              <div
                {...dividerProps}
                style={dividerStyle}
                className={`layout-stack__divider ${dividerProps.className || ''}`.trim()}
              >
                {divider}
              </div>
            )}
          </React.Fragment>
        );
      });
    }, [children, divider, dividerProps, direction, getResponsiveValue]);

    return (
      <div
        ref={ref}
        id={id}
        className={stackClassName}
        style={stackStyle as any}
        data-testid={dataTestId || 'layout-stack'}
        {...props}
      >
        {renderChildrenWithDividers}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
