import React, { forwardRef, useMemo } from 'react';

import { useResponsive } from '../../hooks/useResponsive';
import type { FlexProps } from '../../types/layout';

// Flex 組件
export const _Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      children,
      direction = 'row',
      wrap = 'nowrap',
      alignItems = 'stretch',
      justifyContent = 'start',
      alignContent = 'start',
      gap,
      flex,
      grow,
      shrink,
      basis,
      order,
      alignSelf = 'stretch',
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
    const _flexStyle = useMemo(() => {
      const _responsiveDirection = getResponsiveValue(direction);
      const _responsiveWrap = getResponsiveValue(wrap);
      const _responsiveAlignItems = getResponsiveValue(alignItems);
      const _responsiveJustifyContent = getResponsiveValue(justifyContent);
      const _responsiveAlignContent = getResponsiveValue(alignContent);
      const _responsiveGap = getResponsiveValue(gap);
      const _responsiveFlex = getResponsiveValue(flex);
      const _responsiveGrow = getResponsiveValue(grow);
      const _responsiveShrink = getResponsiveValue(shrink);
      const _responsiveBasis = getResponsiveValue(basis);
      const _responsiveOrder = getResponsiveValue(order);
      const _responsiveAlignSelf = getResponsiveValue(alignSelf);

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

      // Flex 屬性計算
      let flexValue = undefined;
      if (responsiveFlex !== undefined) {
        flexValue = responsiveFlex;
      } else if (
        responsiveGrow !== undefined ||
        responsiveShrink !== undefined ||
        responsiveBasis !== undefined
      ) {
        const _growValue = responsiveGrow !== undefined ? responsiveGrow : 0;
        const _shrinkValue =
          responsiveShrink !== undefined ? responsiveShrink : 1;
        const _basisValue =
          responsiveBasis !== undefined ? responsiveBasis : 'auto';
        flexValue = `${growValue} ${shrinkValue} ${basisValue}`;
      }

      return {
        display: 'flex',
        flexDirection: responsiveDirection,
        flexWrap: responsiveWrap,
        alignItems:
          alignmentMap[responsiveAlignItems as keyof typeof alignmentMap] ||
          'stretch',
        justifyContent:
          alignmentMap[responsiveJustifyContent as keyof typeof alignmentMap] ||
          'start',
        alignContent:
          alignmentMap[responsiveAlignContent as keyof typeof alignmentMap] ||
          'start',
        gap: responsiveGap,
        flex: flexValue,
        order: responsiveOrder,
        alignSelf:
          alignmentMap[responsiveAlignSelf as keyof typeof alignmentMap] ||
          'stretch',
        ...style,
      };
    }, [
      getResponsiveValue,
      direction,
      wrap,
      alignItems,
      justifyContent,
      alignContent,
      gap,
      flex,
      grow,
      shrink,
      basis,
      order,
      alignSelf,
      style,
    ]);

    // 生成 CSS 類名
    const _flexClassName = useMemo(() => {
      const _classes = ['layout-flex'];

      const _responsiveDirection = getResponsiveValue(direction);
      classes.push(`layout-flex--direction-${responsiveDirection}`);

      const _responsiveWrap = getResponsiveValue(wrap);
      classes.push(`layout-flex--wrap-${responsiveWrap}`);

      const _responsiveAlignItems = getResponsiveValue(alignItems);
      classes.push(`layout-flex--align-items-${responsiveAlignItems}`);

      const _responsiveJustifyContent = getResponsiveValue(justifyContent);
      classes.push(`layout-flex--justify-content-${responsiveJustifyContent}`);

      const _responsiveGap = getResponsiveValue(gap);
      if (responsiveGap) {
        classes.push(
          `layout-flex--gap-${typeof responsiveGap === 'string' ? responsiveGap.replace(/\s+/g, '-') : responsiveGap}`
        );
      }

      return `${classes.join(' ')} ${className}`.trim();
    }, [
      direction,
      wrap,
      alignItems,
      justifyContent,
      gap,
      className,
      getResponsiveValue,
    ]);

    return (
      <div
        ref={ref}
        id={id}
        className={flexClassName}
        style={flexStyle}
        data-testid={dataTestId || 'layout-flex'}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';
