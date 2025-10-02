import React, { forwardRef, useMemo } from 'react';

import { useResponsive } from '../../hooks/useResponsive';
import type { GridProps } from '../../types/layout';

// Grid 組件
export const _Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 12,
      gap = '1rem',
      rowGap,
      columnGap,
      alignItems = 'stretch',
      justifyItems = 'start',
      alignContent = 'start',
      justifyContent = 'start',
      autoRows,
      autoColumns,
      templateRows,
      templateColumns,
      areas,
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
    const _gridStyle = useMemo(() => {
      const _responsiveColumns = getResponsiveValue(columns);
      const _responsiveGap = getResponsiveValue(gap);
      const _responsiveRowGap = getResponsiveValue(rowGap);
      const _responsiveColumnGap = getResponsiveValue(columnGap);
      const _responsiveAlignItems = getResponsiveValue(alignItems);
      const _responsiveJustifyItems = getResponsiveValue(justifyItems);
      const _responsiveAlignContent = getResponsiveValue(alignContent);
      const _responsiveJustifyContent = getResponsiveValue(justifyContent);
      const _responsiveAutoRows = getResponsiveValue(autoRows);
      const _responsiveAutoColumns = getResponsiveValue(autoColumns);
      const _responsiveTemplateRows = getResponsiveValue(templateRows);
      const _responsiveTemplateColumns = getResponsiveValue(templateColumns);
      const _responsiveAreas = getResponsiveValue(areas);

      // 網格模板列計算
      let gridTemplateColumns = responsiveTemplateColumns;
      if (!gridTemplateColumns) {
        if (typeof responsiveColumns === 'number') {
          gridTemplateColumns = `repeat(${responsiveColumns}, 1fr)`;
        } else {
          gridTemplateColumns = 'repeat(12, 1fr)';
        }
      }

      // 間距計算
      let gapValue = responsiveGap;
      if (responsiveRowGap || responsiveColumnGap) {
        const _rowGapValue = responsiveRowGap || responsiveGap;
        const _columnGapValue = responsiveColumnGap || responsiveGap;
        gapValue = `${rowGapValue} ${columnGapValue}`;
      }

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

      return {
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows: responsiveTemplateRows,
        gridAutoRows: responsiveAutoRows,
        gridAutoColumns: responsiveAutoColumns,
        gap: gapValue,
        alignItems:
          alignmentMap[responsiveAlignItems as keyof typeof alignmentMap] ||
          'stretch',
        justifyItems:
          alignmentMap[responsiveJustifyItems as keyof typeof alignmentMap] ||
          'start',
        alignContent:
          alignmentMap[responsiveAlignContent as keyof typeof alignmentMap] ||
          'start',
        justifyContent:
          alignmentMap[responsiveJustifyContent as keyof typeof alignmentMap] ||
          'start',
        gridTemplateAreas: responsiveAreas
          ? `"${responsiveAreas.join('" "')}"`
          : undefined,
        ...style,
      };
    }, [
      getResponsiveValue,
      columns,
      gap,
      rowGap,
      columnGap,
      alignItems,
      justifyItems,
      alignContent,
      justifyContent,
      autoRows,
      autoColumns,
      templateRows,
      templateColumns,
      areas,
      style,
    ]);

    // 生成 CSS 類名
    const _gridClassName = useMemo(() => {
      const _classes = ['layout-grid'];

      const _responsiveColumns = getResponsiveValue(columns);
      if (typeof responsiveColumns === 'number') {
        classes.push(`layout-grid--columns-${responsiveColumns}`);
      }

      const _responsiveGap = getResponsiveValue(gap);
      if (responsiveGap) {
        classes.push(
          `layout-grid--gap-${typeof responsiveGap === 'string' ? responsiveGap.replace(/\s+/g, '-') : responsiveGap}`
        );
      }

      return `${classes.join(' ')} ${className}`.trim();
    }, [columns, gap, className, getResponsiveValue]);

    return (
      <div
        ref={ref}
        id={id}
        className={gridClassName}
        style={gridStyle}
        data-testid={dataTestId || 'layout-grid'}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// 重新導出 GridItem
export { GridItem } from './GridItem';
